import supabase from "../services/supabaseClient";

export const barbersService = {
    async fetchBarbers() {
      try {
        const { data, error } = await supabase
          .from('Barbers')
          .select('*')
          .eq('Status', true); // only active barbers
  
        if (error) throw error;
        return { success: true, data };
      } catch (error) {
        console.error('Error fetching barbers:', error);
        return { success: false, error };
      }
    }
  };