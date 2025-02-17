import { setHours, setMinutes, addMinutes, addDays, getDay, startOfDay } from "date-fns";
import { Barber, BookingSlotVM } from "../types/booking";

export const generateAvailableSlots = (startDate: Date, endDate: Date, selectedBarber: Barber | null) : BookingSlotVM[] => {
    const slotsVMs: BookingSlotVM[] = [];
    let currentDate = startOfDay(startDate);
  
    while (currentDate <= endDate) {
      if (getDay(currentDate) !== 0) {
        for (let hour = 9; hour < 19; hour++) {
          for (let minutes = 0; minutes < 60; minutes += 30) {
            const slotStart = setMinutes(setHours(currentDate, hour), minutes);
            
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