import { useState, useEffect, useCallback } from 'react';
import supabase from '../utils/supabaseClient';
import { DbBookedSlot, BookingSlotVM, FormData, SupabaseError } from '../types/booking';
// import { validatePortuguesePhone } from '../utils/numVerifyService';
// import { sendConfirmationSMS } from '../utils/twilioService';
import { startOfDay, getDay, setHours, addDays, setMinutes, addMinutes } from 'date-fns'; // add format

const generateAvailableSlots = (startDate: Date, endDate: Date): BookingSlotVM[] => {
  const slotsVMs: BookingSlotVM[] = [];
  let currentDate = startOfDay(startDate);

  while (currentDate <= endDate) {
    if (getDay(currentDate) !== 0) { // Skip Sundays
      for (let hour = 9; hour < 19; hour++) {
        for (let minutes = 0; minutes < 60; minutes += 30) {
          const slotStart = setMinutes(setHours(currentDate, hour), minutes);
          slotsVMs.push({Start: slotStart, End: addMinutes(slotStart, 30),
                         Status: 'Disponível', UserName: '', UserPhone: '' });
        }
      }
    }
    currentDate = addDays(currentDate, 1);
  }
  return slotsVMs;
};

export function useReservations() {
  const [events, setEvents] = useState<BookingSlotVM[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReservations = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data: bookedSlots, error } = await supabase
        .from('Reservations')
        .select(`StartTime, EndTime, Status, Users (Id, Name, Phone)`) as { 
          data: DbBookedSlot[] | null, 
          error: SupabaseError | null 
        };

      if (error) throw error;

      const currentDate = new Date();
      const endDate = new Date(currentDate.getTime() + 28 * 24 * 60 * 60 * 1000);
      const allSlots = generateAvailableSlots(currentDate, endDate);
      bookedSlots?.forEach((booking: DbBookedSlot) => {
        const bookingStart = new Date(booking.StartTime).getTime();
        const slotIndex = allSlots.findIndex(slot => slot.Start.getTime() === bookingStart);

        if (slotIndex !== -1) {
          allSlots[slotIndex] = {
            Start: new Date(booking.StartTime),
            End: new Date(booking.EndTime),
            Status: booking.Status,
            UserName: booking.Users.Name || '',
            UserPhone: booking.Users.Phone || ''
          };
        }
      });

      setEvents(allSlots);
    } catch (error) {
      console.error('Error fetching reservations:', error);
      setError('Erro ao carregar horários: ' + (error instanceof Error ? error.message : 'Erro desconhecido'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createReservation = async (formData: FormData, selectedSlot: BookingSlotVM) => {
    try {
      // First validate the phone
      /* const isValidPhone = await validatePortuguesePhone(formData.Phone);
      if (!isValidPhone) {
        throw new Error('Número de telefone inválido');
      } */
     
      // Format phone number to add Portuguese country code if not present
      const formattedPhone = formData.Phone.startsWith('+') 
        ? formData.Phone 
        : `+351${formData.Phone.replace(/^0+/, '')}`;


      const { data: existingUser } = await supabase
        .from('Users')
        .select('Id')
        .eq('Phone', formattedPhone)
        .single();

      let userId: string;

      if (!existingUser) {
        const { data: newUser, error: createUserError } = await supabase
          .from('Users')
          .insert([{ 
            Name: formData.Name,
            Phone: formattedPhone  // Use formatted phone
          }])
          .select('Id')
          .single();

        if (createUserError) {
          if (createUserError.code === '23505') {
            throw new Error('Já existe uma reserva com este número de telemóvel.');
          }
          throw createUserError;
        }
        
        if (!newUser) throw new Error('Failed to create user');
        userId = newUser.Id;
      } else {
        userId = existingUser.Id;
      }

      const { error: reservationError } = await supabase
        .from('Reservations')
        .insert([{
          UserId: userId,
          StartTime: selectedSlot.Start.toISOString(),
          EndTime: selectedSlot.End.toISOString(),
          Status: 'A confirmar'
        }]);


      if (reservationError) {
        if (reservationError.code === '23505') {
          throw new Error('Já tem uma reserva ativa. Não é possível fazer mais que uma reserva.');
        }
        throw reservationError;
      }

      // await sendConfirmationSMS(formattedPhone, formData.Name, format(selectedSlot.Start, "dd/MM/yyyy 'às' HH:mm"));
      await fetchReservations();
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'An unknown error occurred' 
      };
    }
  };

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  return {
    events,
    createReservation,
    fetchReservations,
    isLoading,
    error,
  };
}
