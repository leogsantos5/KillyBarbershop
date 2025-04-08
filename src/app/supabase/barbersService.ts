import supabase from "../services/supabaseClient";
import { hashPassword } from "../utils/passwordUtils";
import { ErrorMessages } from "../utils/errorMessages";
import { Barber } from '../types/booking';

export const barbersService = {
    async fetchAllBarbers() {
      try {
        const { data, error } = await supabase.from('Barbers').select('*');
        if (error) throw error;
        return { success: true, data: data as Barber[]};
      } catch (error) {
        return { success: false, error: error instanceof Error ? error : new Error(ErrorMessages.BARBER.FETCH_FAILURE)};
      }
    },

    async fetchBarberById(barberId: string) {
      try {
        const { data, error } = await supabase.from('Barbers').select('*').eq('Id', barberId).single();
        if (error) throw error;
        return { success: true, data: data as Barber};
      } catch (error) {
        return { success: false, error: error instanceof Error ? error : new Error(ErrorMessages.BARBER.FETCH_FAILURE)};
      }
    },

    async fetchActiveBarbers() {
      try {
        const { data, error } = await supabase.from('Barbers').select('*').eq('Status', true); 
        if (error) throw error;
        return { success: true, data: data as Barber[]};
      } catch (error) {
        return { success: false, error: error instanceof Error ? error : new Error(ErrorMessages.BARBER.FETCH_FAILURE)};
      }
    },

    async fetchBarber(barberName: string) {
      try {
        const { data, error } = await supabase.from('Barbers').select('*')
                                              .eq('Name', barberName).single();
        if (error) throw error;
        return { success: true, data: data as Barber};
      } catch (error) {
        return { success: false, error: error instanceof Error ? error : new Error(ErrorMessages.BARBER.FETCH_FAILURE)};
      }
    },

    async createBarber(name: string, password: string) {
      try {
        const hashedPassword = await hashPassword(password);
        const { data, error } = await supabase.from('Barbers')
                                .insert([{ Name: name, Password: hashedPassword, Status: true }])
                                .select().single();
        if (error) throw error;
        return { success: true, data };
      } catch (error) {
        return { success: false, error: error instanceof Error ? error : new Error(ErrorMessages.BARBER.CREATE_FAILURE)};
      }
    },

    async deleteBarber(barberId: string) {
      try {
        const { error } = await supabase.from('Barbers').delete().eq('Id', barberId);
        if (error) throw error;
        return { success: true };
      } catch (error) {
        return { success: false, error: error instanceof Error ? error : new Error(ErrorMessages.BARBER.DELETE_FAILURE)};
      }
    },

    async toggleBarberStatus(barberId: string, currentStatus: boolean) {
      try {
        const { error } = await supabase.from('Barbers').update({ Status: !currentStatus }).eq('Id', barberId);
        if (error) throw error;
        return { success: true };
      } catch (error) {
        return { success: false, error: error instanceof Error ? error : new Error(ErrorMessages.BARBER.UPDATE_STATUS_FAILURE)};
      }
    }
};