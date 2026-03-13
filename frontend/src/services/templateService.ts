import { Template } from '@/types';
import { fetchWithErrorHandling } from './api';
import { mockTemplates } from '@/data/mockData';

export const createTemplateService = (authenticatedFetch: typeof fetchWithErrorHandling) => ({
  // Get all templates
  async getTemplates(): Promise<Template[]> {
    return await authenticatedFetch('/templates');
  },

  // Get template by ID
  async getTemplate(id: string): Promise<Template> {
    return await authenticatedFetch(`/templates/${id}`);
  },

  // Create a new template
  async createTemplate(templateData: Omit<Template, 'id'>): Promise<Template> {
    return await authenticatedFetch('/templates', {
      method: 'POST',
      body: JSON.stringify(templateData),
    });
  },

  // Update a template
  async updateTemplate(id: string, updates: Partial<Template>): Promise<Template> {
    return await authenticatedFetch(`/templates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  // Delete a template
  async deleteTemplate(id: string): Promise<void> {
    await authenticatedFetch(`/templates/${id}`, {
      method: 'DELETE',
    });
  },
});

// Backward compatibility - export default service without auth for now
export const templateService = createTemplateService(fetchWithErrorHandling);