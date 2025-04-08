import { setHours, setMinutes, addMinutes, addDays, getDay, startOfDay, addHours, isBefore } from "date-fns";
import { Barber, BookingSlotVM } from "../types/booking";

export const generateAllCalendarSlots = (startDate: Date, endDate: Date, selectedBarber: Barber | null) : BookingSlotVM[] => {
    const slotsVMs: BookingSlotVM[] = [];
    let currentDate = startOfDay(startDate);
    const minimumBookingTime = addHours(new Date(), 2); // Current time + 2 hours
  
    while (currentDate <= endDate) {
      if (getDay(currentDate) !== 0) {
        for (let hour = 9; hour < 19; hour++) {
          for (let minutes = 0; minutes < 60; minutes += 30) {
            const slotStart = setMinutes(setHours(currentDate, hour), minutes);      
            if (isBefore(slotStart, minimumBookingTime)) continue;
                 
            slotsVMs.push({Start: slotStart, End: addMinutes(slotStart, 30), Status: undefined,
              ServiceId: '', ServiceName: '', ServicePrice: 0, ServiceDuration: '',
              UserName: '', UserPhone: '', BarberId: selectedBarber?.Id || '',
              BarberName: selectedBarber?.Name || '', BarberPhone: selectedBarber?.Phone || ''
            });
          }
        }
      }
      currentDate = addDays(currentDate, 1);
    }
    return slotsVMs;
  };