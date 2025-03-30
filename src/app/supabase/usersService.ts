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
  },

  async fetchAllUsers(page: number = 1, pageSize: number = 10, searchTerm: string = '') {
    try {
      let query = supabase
        .from('Users')
        .select('*', { count: 'exact' });

      // Apply search filter if searchTerm exists
      if (searchTerm) {
        query = query.or(`Name.ilike.%${searchTerm}%,Phone.ilike.%${searchTerm}%`);
      }

      // Apply pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to).order('Name');

      const { data, error, count } = await query;

      if (error) throw ErrorMessages.USER.FETCH_FAILURE;
      
      return { 
        success: true, 
        data: data as User[],
        total: count || 0,
        page,
        pageSize
      };
    } 
    catch {
      return { 
        success: false, 
        error: new Error(ErrorMessages.USER.FETCH_FAILURE) 
      };
    }
  },

  async toggleUserStatus(userId: string, newStatus: boolean) {
    try {
      const { error } = await supabase
        .from('Users')
        .update({ Status: newStatus })
        .eq('Id', userId);

      if (error) throw ErrorMessages.USER.UPDATE_STATUS_FAILURE;
      
      return { success: true };
    } 
    catch {
      return { 
        success: false, 
        error: new Error(ErrorMessages.USER.UPDATE_STATUS_FAILURE) 
      };
    }
  }
};
