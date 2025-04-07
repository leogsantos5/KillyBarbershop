import supabase from '../services/supabaseClient';
import { ErrorMessages } from '../utils/errorMessages';
import { Reservation, BookingSlotVM, Barber, BookingFormData } from '../types/booking';
import { usersService } from './usersService';
import { calculateLeastOccupiedBarberForDay } from '../utils/calculateLeastOccupiedBarber';
import { sendConfirmationSMS } from '../services/twilioService';
import { PAID_FEATURES } from '../utils/navigationPages';

export const reservationsService = {

  async fetchAllReservations() {
    try {
      const queryResult = await supabase.from('Reservations').select(`Id, StartTime, EndTime, Status, 
                                                                      Services (Name, Price, Duration, Description), 
                                                                      Users (Id, Name, Phone), 
                                                                      Barbers (Id, Name, Phone)`);

      if (queryResult.error) throw queryResult.error;

      return { success: true, data: queryResult.data as unknown as Reservation[]};
    } catch (error) {
      return { success: false, error: error instanceof Error ? error : new Error(ErrorMessages.RESERVATION.FETCH_FAILURE) };
    }
  },

  async fetchConfirmedReservations() {
    try {
      const queryResult = await supabase.from('Reservations')
                            .select(`Id, StartTime, EndTime, Status, 
                                    Services (Name, Price, Duration, Description), 
                                    Users (Id, Name, Phone), 
                                    Barbers (Id, Name, Phone)`)
                            .eq('Status', true);

      if (queryResult.error) throw queryResult.error;

      return { success: true, data: queryResult.data as unknown as Reservation[]} ;
    } catch (error) {
      return { success: false, error: error instanceof Error ? error : new Error(ErrorMessages.RESERVATION.FETCH_FAILURE) };
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
      }

      if (queryResult.error) throw queryResult.error;

      return true;
    } catch (error) {
      throw error instanceof Error ? error : new Error(ErrorMessages.RESERVATION.DELETE_FAILURE);
    }
  },

  async fecthExistingReservationForUser(userId: string, presentDay: string) : Promise<Reservation | null> {
    try {
      const queryResult = await supabase.from('Reservations').select(`*`).eq('UserId', userId);

      if (queryResult.error) throw queryResult.error;

      const allUserReservations = queryResult.data as unknown as Reservation[];
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

  async createReservation(formData: BookingFormData, selectedSlot: BookingSlotVM, bookedSlots: Reservation[], barbers: Barber[]) {
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
                                        .insert([{UserId: userId, BarberId: barberId, ServiceId: formData.ServiceId, 
                                                  Status: false, StartTime: selectedSlot.Start.toISOString(), 
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
      const queryResult = await supabase.from('Reservations').select(`*, Users (Id, Name, Phone, Status),
                                                                      Services (Name, Price, Duration, Description),
                                                                      Barbers (Id, Name, Phone)`)
                                        .eq('BarberId', barberId).order('StartTime', { ascending: true });                 

      return { success: true, data: queryResult.data as unknown as Reservation[]};
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error(ErrorMessages.RESERVATION.FETCH_FAILURE)
      }
    }
  },

  confirmReservation: async (reservationId: string) => {
    try {
      await supabase.from('Reservations').update({ Status: true }).eq('Id', reservationId);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error(ErrorMessages.RESERVATION.CONFIRM_FAILURE)
      }
    }
  },

  deleteReservation: async (reservationId: string) => {
    try {
      await supabase.from('Reservations').delete().eq('Id', reservationId);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error(ErrorMessages.RESERVATION.DELETE_FAILURE)
      }
    }
  }
};