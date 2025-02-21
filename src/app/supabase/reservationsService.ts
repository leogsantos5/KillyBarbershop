import supabase from '../services/supabaseClient';
import { ErrorMessages } from '../utils/errorMessages';
import { DbBookedSlot, BookingSlotVM, FormData, Barber } from '../types/booking';
import { usersService } from './usersService';
import { calculateLeastOccupiedBarberForDay } from '../utils/calculateLeastOccupiedBarber';

export const reservationsService = {
  async fetchReservations() {
    try {
      const query = supabase
        .from('Reservations')
        .select(`StartTime, EndTime, Status, 
                 Users (Id, Name, Phone),
                 Barbers (Id, Name, Phone)`);

      const { data, error } = await query;
      
      if (error) throw ErrorMessages.RESERVATION.FETCH_RESERVATIONS_FAILURE;
      
      return { success: true, data: data as unknown as DbBookedSlot[] };
    } 
    catch {
      return { 
        success: false, 
        error: new Error(ErrorMessages.RESERVATION.FETCH_RESERVATIONS_FAILURE) 
      };
    }
  },

  async createReservation(formData: FormData, selectedSlot: BookingSlotVM, bookedSlots: DbBookedSlot[], barbers: Barber[]) {
    try {
      // First validate the phone
      /* const isValidPhone = await validatePortuguesePhone(formData.Phone);
      if (!isValidPhone) {
        throw new Error(ErrorMessages.FORM.INVALID_PHONE);
      } */

      const existingUser = await usersService.findUserByPhone(formData.Phone);

      let userId: string;
      if (!existingUser) {
        const newUser = await usersService.createUser(formData.Name, formData.Phone);
        userId = newUser.data.Id;
      } else {
        userId = existingUser.data.Id;
      }
      
      let barberId = selectedSlot.BarberId;
      const reservationDay = new Date(selectedSlot.Start);
      if (barberId === '' || barberId === null) {
        barberId = calculateLeastOccupiedBarberForDay(reservationDay, barbers, bookedSlots);
      }

      const { error: reservationError } = await supabase
        .from('Reservations')
        .insert([{UserId: userId, BarberId: barberId,
                  Status: false, StartTime: selectedSlot.Start.toISOString(), EndTime: selectedSlot.End.toISOString()}]);
      
      if (reservationError?.code === '23505') {
        throw new Error(ErrorMessages.RESERVATION.ACTIVE_RESERVATION);
      }
      
      return { success: true };
    } catch (error) {
        return { 
          success: false, 
          error: error instanceof Error ? error.message : ErrorMessages.RESERVATION.CREATE_RESERVATION_FAILURE
        };
      }
  }
};