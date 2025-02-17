import supabase from '../services/supabaseClient';
import { ErrorMessages } from '../utils/errorMessages';
import { formatPhoneNumber } from '../utils/formatPhoneNumberByCountry';

export const usersService = {
  async findUserByPhone(phone: string) {
    // First validate the phone
      /* const isValidPhone = await validatePortuguesePhone(formData.Phone);
      if (!isValidPhone) {
        throw new Error(ErrorMessages.FORM.INVALID_PHONE);
      } */
     
    // Format phone number to add Portuguese country code if not present
    const formattedPhone = formatPhoneNumber(phone, 'PT');
    
    const { data: user, error } = await supabase
      .from('Users')
      .select('Id')
      .eq('Phone', formattedPhone)
      .single();

    if (error) throw error;
    return { success: true, data: user };
  },

  async createUser(name: string, phone: string) {
    if (!phone.startsWith('+')) {
      phone = formatPhoneNumber(phone, 'PT');
    }
    
    const { data: newUser, error } = await supabase
      .from('Users').insert([{ 
        Name: name,
        Phone: phone
      }]).select('Id').single();        

    if (error) {
      if (error.code === '23505') {
        throw new Error(ErrorMessages.RESERVATION.DUPLICATE_PHONE);
      }
      throw error;
    }

    if (!newUser) throw new Error(ErrorMessages.RESERVATION.CREATE_USER_FAILURE);
    return { success: true, data: newUser };
  }
};
