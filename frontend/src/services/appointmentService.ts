import { Appointment } from '@/types';
import { fetchWithErrorHandling } from './api';
import { mockAppointments } from '@/data/mockData';

export const createAppointmentService = (authenticatedFetch: typeof fetchWithErrorHandling) => ({
  // Get all appointments
  async getAppointments(): Promise<Appointment[]> {
    return await authenticatedFetch('/appointments');
  },

  // Get appointments for a specific date range
  async getAppointmentsByDateRange(startDate: string, endDate: string): Promise<Appointment[]> {
    return await authenticatedFetch(`/appointments?start_date=${startDate}&end_date=${endDate}`);
  },

  // Get appointments for a specific date
  async getAppointmentsByDate(date: string): Promise<Appointment[]> {
    return await authenticatedFetch(`/appointments?date=${date}`);
  },

  // Create a new appointment
  async createAppointment(appointmentData: Omit<Appointment, 'id'>): Promise<Appointment> {
    return await authenticatedFetch('/appointments', {
      method: 'POST',
      body: JSON.stringify(appointmentData),
    });
  },

  // Update an appointment
  async updateAppointment(id: string, updates: Partial<Appointment>): Promise<Appointment> {
    return await authenticatedFetch(`/appointments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  // Delete an appointment
  async deleteAppointment(id: string): Promise<void> {
    await authenticatedFetch(`/appointments/${id}`, {
      method: 'DELETE',
    });
  },

  // Send reminder for appointment
  async sendReminder(id: string): Promise<{ success: boolean; message: string }> {
    return await authenticatedFetch(`/appointments/${id}/send-reminder`, {
      method: 'POST',
    });
  },

  // Cancel appointment
  async cancelAppointment(id: string): Promise<Appointment> {
    return await authenticatedFetch(`/appointments/${id}/cancel`, {
      method: 'POST',
    });
  },

  // Send cancellation notice
  async sendCancellationNotice(id: string): Promise<{ success: boolean; message: string }> {
    return await authenticatedFetch(`/appointments/${id}/send-cancellation`, {
      method: 'POST',
    });
  },
});

// Backward compatibility - export default service without auth for now
export const appointmentService = createAppointmentService(fetchWithErrorHandling);