import supabase from '../services/supabaseClient';
import { ErrorMessages } from '../utils/errorMessages';
import { DbBookedSlot, BookingSlotVM, Barber, BookingFormData } from '../types/booking';
import { usersService } from './usersService';
import { calculateLeastOccupiedBarberForDay } from '../utils/calculateLeastOccupiedBarber';
import { sendConfirmationSMS } from '../services/twilioService';
import { PAID_FEATURES } from '../utils/navigationPages';

export const reservationsService = {
  async fetchAllReservations() {
    try {
      const query = supabase
        .from('Reservations').select(`StartTime, EndTime, Status, Users (Id, Name, Phone), Barbers (Id, Name, Phone)`);

      const { data, error } = await query;
      
      if (error) throw error;
      
      return { success: true, data: data as unknown as DbBookedSlot[] };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error : new Error(ErrorMessages.RESERVATION.FETCH_FAILURE)
      };
    }
  },

  async fetchConfirmedReservations() {
    try {
      const query = supabase
        .from('Reservations').select(`StartTime, EndTime, Status, Users (Id, Name, Phone), Barbers (Id, Name, Phone)`)
        .eq('Status', true);

      const { data, error } = await query;
      
      if (error) throw error;
      
      return { success: true, data: data as unknown as DbBookedSlot[] };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error : new Error(ErrorMessages.RESERVATION.FETCH_FAILURE)
      };
    }
  },

  async deletePastReservations(userId: string | null, presentDay: string) : Promise<boolean> {
    try {
      let queryResult; 
      if (userId == null){ // deletes all past reservations
        queryResult = await supabase.from('Reservations').delete().lt('StartTime', presentDay);
      }
      else{ // deletes all past reservations for a specific user
        queryResult = await supabase.from('Reservations').delete({ count: 'exact' }).eq('UserId', userId).lt('StartTime', presentDay);
        console.log(queryResult.count);
      }

      if (queryResult.error) throw queryResult.error;

      return true;
    } catch (error) {
      throw error instanceof Error ? error : new Error(ErrorMessages.RESERVATION.DELETE_FAILURE);
    }
  },

  async fecthExistingReservationForUser(userId: string, presentDay: string) : Promise<DbBookedSlot | null> {
    try {
      const queryResult = await supabase.from('Reservations')
                                        .select('*')
                                        .eq('UserId', userId);

      if (queryResult.error) throw queryResult.error;

      const allUserReservations = queryResult.data as unknown as DbBookedSlot[];
      if (allUserReservations === null || allUserReservations.length === 0)
        return null;

      const existingReservation = allUserReservations.find(reservation => {
        return reservation.StartTime === presentDay || reservation.StartTime >= presentDay;
      }); // retrieves the user's valid existing reservation 

      const pastReservations = allUserReservations.filter(reservation => {
        return reservation.StartTime < presentDay; // check if user has past reservations
      });

      if (pastReservations.length > 0) // deletes all the user's past reservations
        await this.deletePastReservations(userId, presentDay);

      return existingReservation ?? null;
    } catch (error) {
      throw error instanceof Error ? error : new Error(ErrorMessages.RESERVATION.FETCH_FAILURE);
    }
  },

  async createReservation(formData: BookingFormData, selectedSlot: BookingSlotVM, bookedSlots: DbBookedSlot[], barbers: Barber[]) {
    try {
      const existingUser = await usersService.findUserByPhone(formData.Phone);

      let userId: string;
      if (existingUser == null) {
        const newUser = await usersService.createUser(formData.Name, formData.Phone);
        userId = newUser.Id;
      } else {
        userId = existingUser.Id;
      }

      const presentDay = new Date().toISOString();
      const existingReservation = await this.fecthExistingReservationForUser(userId, presentDay);
      if (existingReservation)
        throw new Error(ErrorMessages.RESERVATION.ACTIVE_RESERVATION);
      
      let barberId = selectedSlot.BarberId;
      const reservationDay = selectedSlot.Start;
      if (barberId === '' || barberId === null) {
        barberId = calculateLeastOccupiedBarberForDay(reservationDay, barbers, bookedSlots);
      }

      const queryResult = await supabase.from('Reservations')
                                        .insert([{UserId: userId, BarberId: barberId, Status: false, 
                                                  StartTime: selectedSlot.Start.toISOString(), 
                                                  EndTime: selectedSlot.End.toISOString()}]);
                              
      if (queryResult.error) throw queryResult.error;
      
      if (PAID_FEATURES.SEND_SMS) {
        const formattedStringDate = selectedSlot.Start.toLocaleString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric',
                                                                                 hour: '2-digit', minute: '2-digit' })
        await sendConfirmationSMS(formData.Phone, formData.Name, formattedStringDate);
      }

      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error : new Error(ErrorMessages.RESERVATION.CREATE_FAILURE)
      };
    }
  },

  fetchBarberReservations: async (barberId: string) => {
    try {
      const { data, error } = await supabase
        .from('Reservations').select(`*, Users (Id, Name, Phone, Status)`)
        .eq('BarberId', barberId).order('StartTime', { ascending: true })

      if (error) throw error;

      return {
        success: true,
        data: data as unknown as DbBookedSlot[]
      }
    } catch (error) {
      console.error('Error fetching barber reservations:', error);
      return {
        success: false,
        error: error instanceof Error ? error : new Error(ErrorMessages.RESERVATION.FETCH_FAILURE)
      }
    }
  },

  confirmReservation: async (reservationId: string) => {
    try {
      const { error } = await supabase
        .from('Reservations')
        .update({ Status: true })
        .eq('Id', reservationId)

      if (error) throw error;

      return {
        success: true
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error(ErrorMessages.RESERVATION.CONFIRM_FAILURE)
      }
    }
  },

  deleteReservation: async (reservationId: string) => {
    try {
      const { error } = await supabase
        .from('Reservations').delete().eq('Id', reservationId)

      if (error) throw error;

      return {
        success: true
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error(ErrorMessages.RESERVATION.DELETE_FAILURE)
      }
    }
  }
};