import supabase from '../services/supabaseClient';
import { ErrorMessages } from '../utils/errorMessages';
import { Service } from '../types/booking';

export const servicesService = {
  async fetchAllServices() {
    try {
      const { data, error } = await supabase.from('Services').select('*').order('Name');

      if (error) throw error;
      return { success: true, data: data as Service[] };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error : new Error(ErrorMessages.SERVICE.FETCH_FAILURE)
      };
    }
  },

  async createService(service: Omit<Service, 'Id'>) {
    try {
      const { data, error } = await supabase.from('Services').insert([service]).select().single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error : new Error(ErrorMessages.SERVICE.CREATE_FAILURE)
      };
    }
  },

  async updateService(serviceId: string, updates: Partial<Service>) {
    try {
      const { data, error } = await supabase.from('Services').update(updates).eq('Id', serviceId).select().single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error : new Error(ErrorMessages.SERVICE.UPDATE_FAILURE)
      };
    }
  },

  async deleteService(serviceId: string) {
    try {
      const { error } = await supabase.from('Services').delete().eq('Id', serviceId);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error : new Error(ErrorMessages.SERVICE.DELETE_FAILURE)
      };
    }
  }
}; 