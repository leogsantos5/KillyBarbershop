import supabase from '../services/supabaseClient';
import { ErrorMessages } from '../utils/errorMessages';
import { DbBookedSlot, BookingSlotVM, FormData, Barber } from '../types/booking';
import { generateAvailableSlots } from '../utils/generateAvailableSlots';
import { groupBookingsBySlot } from '../utils/groupBookingsBySlot';
import { updateAllSlotsAvailability } from '../utils/setAllSlotsAvailability';
import { usersService } from './usersService';

export const reservationsService = {
  async fetchReservations(selectedBarber: Barber | null, allBarbers: Barber[] = []) {
    try {
      const query = supabase
        .from('Reservations')
        .select(`StartTime, EndTime, Status, 
                 Users (Id, Name, Phone),
                 Barbers (Id, Name, Phone)`);

      const queryResult = await query;
      const bookedSlots = queryResult.data as unknown as DbBookedSlot[];
      if (queryResult.error) throw ErrorMessages.RESERVATION.FETCH_RESERVATIONS_FAILURE;
      const bookingsBySlot = groupBookingsBySlot(bookedSlots);
      
      const currentDate = new Date();
      const endDate = new Date(currentDate.getTime() + 28 * 24 * 60 * 60 * 1000);
      const allSlots = generateAvailableSlots(currentDate, endDate, selectedBarber);
      const allUpdatedSlots = updateAllSlotsAvailability(allSlots, bookingsBySlot, allBarbers, selectedBarber);

      return { success: true, data: allUpdatedSlots };
    } catch {
      return { success: false, error: new Error(ErrorMessages.RESERVATION.RESERVATIONS_PROCESSING_FAILURE) };
    }
  },

  async createReservation(formData: FormData, selectedSlot: BookingSlotVM) {
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
      const { error: reservationError } = await supabase
        .from('Reservations')
        .insert([{UserId: userId, BarberId: selectedSlot.BarberId != '' ? selectedSlot.BarberId : null,
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