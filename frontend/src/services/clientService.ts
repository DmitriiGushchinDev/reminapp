import { Client } from '@/types';
import { fetchWithErrorHandling } from './api';

// Transform snake_case response from backend to camelCase for frontend
const transformClient = (data: any): Client => ({
  id: data.id,
  name: data.name,
  phone: data.phone,
  email: data.email,
  notes: data.notes,
  createdAt: data.created_at || data.createdAt,
  updatedAt: data.updated_at || data.updatedAt,
});

export const createClientService = (authenticatedFetch: typeof fetchWithErrorHandling) => ({
  // Get all clients
  async getClients(): Promise<Client[]> {
    const data = await authenticatedFetch('/clients');
    return data.map(transformClient);
  },

  // Search clients by name
  async searchClients(query: string): Promise<Client[]> {
    const data = await authenticatedFetch(`/clients/search?q=${encodeURIComponent(query)}`);
    return data.map(transformClient);
  },

  // Get client by ID
  async getClient(id: string): Promise<Client> {
    const data = await authenticatedFetch(`/clients/${id}`);
    return transformClient(data);
  },

  // Get client by phone number
  async getClientByPhone(phone: string): Promise<Client | null> {
    try {
      const data = await authenticatedFetch(`/clients/phone/${phone}`);
      return data ? transformClient(data) : null;
    } catch (error) {
      // Return null if client not found (404)
      return null;
    }
  },

  // Create a new client
  async createClient(clientData: Omit<Client, 'id'>): Promise<Client> {
    const data = await authenticatedFetch('/clients', {
      method: 'POST',
      body: JSON.stringify(clientData),
    });
    return transformClient(data);
  },

  // Update a client
  async updateClient(id: string, updates: Partial<Client>): Promise<Client> {
    const data = await authenticatedFetch(`/clients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    return transformClient(data);
  },

  // Delete a client
  async deleteClient(id: string): Promise<void> {
    await authenticatedFetch(`/clients/${id}`, {
      method: 'DELETE',
    });
  },

  // Get client appointment history
  async getClientAppointments(clientId: string): Promise<any[]> {
    return await authenticatedFetch(`/clients/${clientId}/appointments`);
  },
});

// Backward compatibility - export default service without auth for now
export const clientService = createClientService(fetchWithErrorHandling);