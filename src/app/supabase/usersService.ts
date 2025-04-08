import supabase from '../services/supabaseClient';
import { ErrorMessages } from '../utils/errorMessages';
import { formatPhoneNumber } from '../utils/formatPhoneNumberByCountry';
import { validatePortuguesePhone } from '../services/numVerifyService';
import { PAID_FEATURES } from '../utils/navigationPages';
import { User } from '../types/booking';

export const usersService = {
  async findUserByPhone(phone: string) : Promise<User | null> {
    try {
      const formattedPhone = formatPhoneNumber(phone, 'PT');
      if (!formattedPhone) {
        throw new Error(ErrorMessages.FORM.INVALID_PHONE_FORMAT);
      }
       
      const { data: user, error } = await supabase.from('Users').select('*').eq('Phone', formattedPhone).maybeSingle();

      if (error) throw error;
      return user;
    } catch (error) {
      throw error instanceof Error ? error : new Error(ErrorMessages.USER.FIND_USER_BY_PHONE_FAILURE);
    }
  },

  async createUser(name: string, phone: string) : Promise<User> {
    try {
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

      const { data: newUser, error } = await supabase.from('Users').insert([{ Name: name, Phone: formattedPhone }]).select('*').single();        

      if (error) {
        if (error.code === '23505') {
          throw new Error(ErrorMessages.RESERVATION.DUPLICATE_PHONE);
        }
        throw error;
      }

      if (!newUser) throw new Error(ErrorMessages.RESERVATION.CREATE_USER_FAILURE);
      return newUser;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error instanceof Error ? error : new Error(ErrorMessages.RESERVATION.CREATE_USER_FAILURE);
    }
  },

  async fetchAllUsers(page: number = 1, pageSize: number = 10, searchTerm: string = '') {
    try {
      let query = supabase.from('Users').select('*', { count: 'exact' });

      // Apply search filter if searchTerm exists
      if (searchTerm) {
        query = query.or(`Name.ilike.%${searchTerm}%,Phone.ilike.%${searchTerm}%`);
      }

      // Apply pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to).order('Name');

      const { data, error, count } = await query;

      if (error) throw error;
      
      return { success: true, data: data as User[], total: count || 0, page, pageSize };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error : new Error(ErrorMessages.USER.FETCH_FAILURE)};
    }
  },

  async toggleUserStatus(userId: string, currentStatus: boolean) {
    const { error } = await supabase.from('Users').update({ Status: !currentStatus }).eq('Id', userId).select();
    if (error) throw new Error(ErrorMessages.USER.UPDATE_STATUS_FAILURE);
    
    return { success: true };
  }
};
