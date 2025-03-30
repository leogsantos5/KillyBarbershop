import supabase from "../services/supabaseClient";
import { Barber } from "../types/booking";
import { hashPassword } from "../utils/passwordUtils";

export const barbersService = {
    async fetchAllBarbers() {
      try {
        const { data, error } = await supabase
          .from('Barbers')
          .select('*');
  
        if (error) throw error;
        return { success: true, data };
      } catch (error) {
        console.error('Error fetching barbers:', error);
        return { success: false, error };
      }
    },

    async fetchActiveBarbers() {
      try {
        const { data, error } = await supabase
          .from('Barbers')
          .select('*')
          .eq('Status', true); // only active barbers
  
        if (error) throw error;
        return { success: true, data };
      } catch (error) {
        console.error('Error fetching active barbers:', error);
        return { success: false, error };
      }
    },

    async fetchBarber(barberName: string) {
      try {
        const { data, error } = await supabase
          .from('Barbers')
          .select('Id, Name, Password')
          .eq('Name', barberName)
          .single();
  
        if (error) throw error;
        return { success: true, data };
      } catch (error) {
        console.error('Error fetching barber:', error);
        return { success: false, error };
      }
    },

    async createBarber( barber: Barber ) {
      try {
        const hashedPassword = await hashPassword(barber.Password);
        const { data: newBarber, error } = await supabase
          .from('Barbers')
          .insert([{
            Name: barber.Name,
            Phone: barber.Phone,
            Password: hashedPassword,
            Status: true
          }])
          .select()
          .single();

        if (error) throw error;
        return { success: true, data: newBarber };
      } catch (error) {
        console.error('Error creating barber:', error);
        return { success: false, error };
      }
    },

    async deleteBarber(barberId: string) {
      try {
        const { error } = await supabase
          .from('Barbers')
          .delete()
          .eq('Id', barberId);

        if (error) throw error;
        return { success: true };
      } catch (error) {
        console.error('Error deleting barber:', error);
        return { success: false, error };
      }
    },

    async toggleBarberStatus(barberId: string, status: boolean) {
      try {
        debugger;
        const { error } = await supabase
          .from('Barbers')
          .update({ Status: status })
          .eq('Id', barberId);

        if (error) throw error;
        return { success: true };
      } catch (error) {
        console.error('Error updating barber status:', error);
        return { success: false, error };
      }
    }
};