import { useState, useEffect, useCallback } from 'react';
import supabase from '../utils/supabaseClient';
import { DbBookedSlot, BookingSlotVM, FormData, SupabaseError } from '../types/booking';
import { validatePortuguesePhone } from '../utils/numVerifyService';
import { sendConfirmationSMS } from '../utils/twilioService';

const generateAvailableSlots = (startDate: Date, endDate: Date): BookingSlotVM[] => {
  const slots: BookingSlotVM[] = [];
  const startHour = 9;
  const endHour = 19;

  // Start from tomorrow
  const tomorrow = new Date(startDate);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  for (let date = new Date(tomorrow); date <= endDate; date.setDate(date.getDate() + 1)) {
    if (date.getDay() === 0) continue; // Skip Sundays

    for (let hour = startHour; hour < endHour; hour++) {
      for (const minute of [0, 30]) {
        const slotStart = new Date(date);
        slotStart.setHours(hour, minute, 0, 0);

        slots.push({
          Start: slotStart,
          End: new Date(slotStart.getTime() + 30 * 60000),
          Status: 'Disponível',
          UserName: '',
          UserPhone: ''
        });
      }
    }
  }
  return slots;
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
        .select(`StartTime, EndTime, Status, UserId, Users (Name, Phone)`) as { 
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
            UserName: booking.Users[0]?.Name,
            UserPhone: booking.Users[0]?.Phone
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
      const isValidPhone = await validatePortuguesePhone(formData.Phone);
      if (!isValidPhone)  throw new Error('Número de telefone inválido');
      
      const formattedPhone = formData.Phone.startsWith('+') ? formData.Phone : `+351${formData.Phone.replace(/^0+/, '')}`;

      const { data: existingUser } = await supabase
        .from('Users')
        .select('Id')
        .eq('Phone', formattedPhone)  // Use formatted phone
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

      const formattedDate = selectedSlot.Start.toLocaleString('pt-PT', {weekday: 'long', month: 'long', day: 'numeric',
                                                                        hour: '2-digit', minute: '2-digit'}); 
      await sendConfirmationSMS(formattedPhone, formData.Name, formattedDate);

      await fetchReservations();
      return { success: true };
    } catch (err: unknown) {
      console.error('Error in createReservation:', err);
      return { success: false, error: err instanceof Error ? err.message : 'An unknown error occurred' };
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
