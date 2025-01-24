import { useState, useEffect } from 'react';
import supabase from '../supabaseClient';
import sendConfirmationSMS from './twilioService';

const generateAvailableSlots = (startDate, endDate) => {
  const slots = [];
  const startHour = 9;
  const endHour = 19;

  // Start from tomorrow
  const tomorrow = new Date(startDate);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  for (let date = new Date(tomorrow); date <= endDate; date.setDate(date.getDate() + 1)) {
    if (date.getDay() === 0) continue; // Skip Sundays

    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute of [0, 30]) {
        const slotStart = new Date(date);
        slotStart.setHours(hour, minute, 0, 0);
        
        slots.push({
          Title: 'Disponível',
          Start: slotStart,
          End: new Date(slotStart.getTime() + 30 * 60000),
          Resource: 'available'
        });
      }
    }
  }
  return slots;
};

/* const validatePortuguesePhone = async (phone) => {
  const API_KEY = '7217ae233c3c14c3e674f46c68b6dd84';
  const url = `http://apilayer.net/api/validate?access_key=${API_KEY}&number=${phone}&country_code=PT&format=1`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (!data.success) {
      throw new Error('Erro ao validar o número de telefone.');
    }

    if (!data.valid) {
      throw new Error('Por favor, introduza um número de telefone português válido.');
    }

    return true;
  } catch (err) {
    throw new Error('Erro ao validar o número de telefone. Por favor, tente novamente.');
  }
}; */

export function useReservations() {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchReservations = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data: bookedSlots, error: reservationsError } = await supabase
        .from('Reservations')
        .select(`Id, StartTime, EndTime, Status, UserId, Users (Id, Name, Phone)`);

      if (reservationsError) throw reservationsError;

      // Generate all available slots first
      const currentDate = new Date();
      const endDate = new Date();
      endDate.setDate(currentDate.getDate() + 28);
      
      let allSlots = generateAvailableSlots(currentDate, endDate);
      
      // Replace available slots with booked ones where they exist
      bookedSlots.forEach(booking => {
        const bookingStart = new Date(booking.StartTime).getTime();
        const slotIndex = allSlots.findIndex(slot => slot.Start.getTime() === bookingStart);
        
        if (slotIndex !== -1) {
          allSlots[slotIndex] = {
            Title: `Reservado - ${booking.Users?.Name || 'Cliente'}`,
            Start: new Date(booking.StartTime),
            End: new Date(booking.EndTime),
            Resource: 'booked',
            Status: booking.Status,
            UserId: booking.UserId,
            UserName: booking.Users?.Name,
            UserPhone: booking.Users?.Phone
          };
        }
      });

      setEvents(allSlots);
    } catch (err) {
      setError('Erro ao carregar horários: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const createReservation = async (formData, selectedSlot) => {
    try {
      // await validatePortuguesePhone(formData.Phone);

      // Find or create user
      const { data: existingUser, error: userQueryError } = await supabase
        .from('Users')
        .select('Id')
        .eq('Phone', formData.Phone)
        .single();

      let userId;

      if (!existingUser) {
        const { data: newUser, error: createUserError } = await supabase
          .from('Users')
          .insert([{ 
            Name: formData.Name,
            Phone: formData.Phone
          }])
          .select('Id')
          .single();

        if (createUserError) {
          if (createUserError.code === '23505') {
            throw new Error('Já existe uma reserva com este número de telemóvel.');
          }
          throw createUserError;
        }
        userId = newUser.Id;
      } else {
        userId = existingUser.Id;
      }

      // Create reservation
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

      // Send SMS confirmation, testing only
      await sendConfirmationSMS(formData.Phone);

      await fetchReservations();
      return { success: true };
    } catch (err) {
      console.error('Error in createReservation:', err);
      return { success: false, error: err.message };
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  return {
    events,
    createReservation,
    fetchReservations
  };
}