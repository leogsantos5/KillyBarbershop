import supabase from '../utils/supabaseClient';
import { DbBookedSlot, BookingSlotVM, FormData, Barber } from '../types/booking';
import { startOfDay, getDay, setHours, addDays, setMinutes, addMinutes } from 'date-fns';

const generateAvailableSlots = (
  startDate: Date, 
  endDate: Date, 
  selectedBarber: Barber | null
): BookingSlotVM[] => {
  const slotsVMs: BookingSlotVM[] = [];
  let currentDate = startOfDay(startDate);

  while (currentDate <= endDate) {
    if (getDay(currentDate) !== 0) {
      for (let hour = 9; hour < 19; hour++) {
        for (let minutes = 0; minutes < 60; minutes += 30) {
          const slotStart = setMinutes(setHours(currentDate, hour), minutes);
          
          // If no specific barber selected, create a generic slot
          slotsVMs.push({
            Start: slotStart,
            End: addMinutes(slotStart, 30),
            Status: undefined,
            UserName: '',
            UserPhone: '',
            BarberId: selectedBarber?.Id || '',
            BarberName: selectedBarber?.Name || '',
            BarberPhone: selectedBarber?.Phone || ''
          });
        }
      }
    }
    currentDate = addDays(currentDate, 1);
  }
  return slotsVMs;
};

const groupBookingsByTime = (bookings: DbBookedSlot[]) => {
  // Similar to Dictionary<long, List<Booking>> in C#
  const bookingMap = new Map<number, DbBookedSlot[]>();
  
  bookings.forEach(booking => {
    const timeKey = new Date(booking.StartTime).getTime();
    
    if (!bookingMap.has(timeKey)) {
      bookingMap.set(timeKey, []);
    }
    
    bookingMap.get(timeKey)?.push(booking);
  });
  
  return bookingMap;
};

export const reservationsService = {
  async fetchReservations(selectedBarber: Barber | null, allBarbers: Barber[] = []) {
    try {
      const query = supabase
        .from('Reservations')
        .select(`
          StartTime, 
          EndTime, 
          Status, 
          Users (Id, Name, Phone),
          Barbers (Id, Name, Phone)
        `);

      // When no barber is selected, fetch all reservations
      const queryResult = await query;
      const bookedSlots = queryResult.data as unknown as DbBookedSlot[];
      if (queryResult.error) throw queryResult.error;

      const currentDate = new Date();
      const endDate = new Date(currentDate.getTime() + 28 * 24 * 60 * 60 * 1000);
      const allSlots = generateAvailableSlots(currentDate, endDate, selectedBarber);

      // Group bookings by time slot
      const bookingsByTime = groupBookingsByTime(bookedSlots);

      // Process each slot
      allSlots.forEach((slot, index) => {
        const timeKey = slot.Start.getTime();
        const bookingsForSlot = bookingsByTime.get(timeKey) || [];

        if (selectedBarber) {
          // For specific barber, show their exact availability
          const barberBooking = bookingsForSlot.find(b => b.Barbers?.Id === selectedBarber.Id);
          if (barberBooking) {
            allSlots[index].Status = barberBooking.Status;
          }
        } else {
          // For no preference view, check both specific barber bookings and "any barber" bookings
          const availableBarbers = allBarbers.filter(barber => 
            !bookingsForSlot.some(booking => booking.Barbers?.Id === barber.Id)
          );

          const noBarberPreferenceCount = bookingsForSlot.filter(booking => booking.Barbers === null).length;

          // Slot is booked if there aren't enough available barbers for no-preference bookings
          debugger;
          if (availableBarbers.length <= noBarberPreferenceCount) {
            allSlots[index].Status = false;
          }
        }
      });

      return { success: true, data: allSlots };
    } catch (error) {
      console.error('Error:', error);
      return { success: false, error };
    }
  },

  async createReservation(formData: FormData, selectedSlot: BookingSlotVM) {
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
            Phone: formattedPhone
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
      debugger;
      const { error: reservationError } = await supabase
        .from('Reservations')
        .insert([{
          UserId: userId,
          BarberId: selectedSlot.BarberId != '' ? selectedSlot.BarberId : null,
          Status: false,
          StartTime: selectedSlot.Start.toISOString(),
          EndTime: selectedSlot.End.toISOString(),
        }]);

      if (reservationError) {
        if (reservationError.code === '23505') {
          throw new Error('Já tem uma reserva ativa. Não é possível fazer mais que uma reserva.');
        }
        throw reservationError;
      }

      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'An unknown error occurred' 
      };
    }
  }
};