import supabase from '../services/supabaseClient';
import { ErrorMessages } from '../utils/errorMessages';
import { formatPhoneNumber } from '../utils/formatPhoneNumberByCountry';
import { validatePortuguesePhone } from '../services/numVerifyService';
import { PAID_FEATURES } from '../utils/navigationPages';
import { User } from '../types/booking';

export const usersService = {
  async findUserByPhone(phone: string) : Promise<User | null> {
    const formattedPhone = formatPhoneNumber(phone, 'PT');
    if (!formattedPhone) {
      throw new Error(ErrorMessages.FORM.INVALID_PHONE_FORMAT);
    }
     
    const { data: user, error } = await supabase
      .from('Users')
      .select('*')
      .eq('Phone', formattedPhone)
      .maybeSingle();

    if (error) throw error;
    return user;
  },

  async createUser(name: string, phone: string) : Promise<User> {
    
    const formattedPhone = formatPhoneNumber(phone, 'PT');
    if (!formattedPhone) {
      throw new Error(ErrorMessages.FORM.INVALID_PHONE_FORMAT);
    }

    if (PAID_FEATURES.VALIDATE_PHONE) {
      const isValidPhone = await validatePortuguesePhone(formattedPhone);
      if (!isValidPhone) {
        throw new Error(ErrorMessages.FORM.INVALID_PHONE);
      }
    }

    const { data: newUser, error } = await supabase.from('Users')
                                    .insert([{ Name: name, Phone: formattedPhone }])
                                    .select('*').single();        

    if (error) {
      if (error.code === '23505') {
        throw new Error(ErrorMessages.RESERVATION.DUPLICATE_PHONE);
      }
      throw error;
    }

    if (!newUser) throw new Error(ErrorMessages.RESERVATION.CREATE_USER_FAILURE);
    return newUser;
  }
};
