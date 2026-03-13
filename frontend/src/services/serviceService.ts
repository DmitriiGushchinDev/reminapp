import { Service } from '@/types';
import { fetchWithErrorHandling } from './api';
import { mockServices } from '@/data/mockData';

export const createServiceService = (authenticatedFetch: typeof fetchWithErrorHandling) => ({
  // Get all services
  async getServices(): Promise<Service[]> {
    return await authenticatedFetch('/services');
  },

  // Get service by ID
  async getService(id: string): Promise<Service> {
    return await authenticatedFetch(`/services/${id}`);
  },

  // Create a new service
  async createService(serviceData: Omit<Service, 'id'>): Promise<Service> {
    return await authenticatedFetch('/services', {
      method: 'POST',
      body: JSON.stringify(serviceData),
    });
  },

  // Update a service
  async updateService(id: string, updates: Partial<Service>): Promise<Service> {
    return await authenticatedFetch(`/services/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  // Delete a service
  async deleteService(id: string): Promise<void> {
    await authenticatedFetch(`/services/${id}`, {
      method: 'DELETE',
    });
  },
});

// Backward compatibility - export default service without auth for now
export const serviceService = createServiceService(fetchWithErrorHandling);