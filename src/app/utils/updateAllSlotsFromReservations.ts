import { Reservation, Barber } from "../types/booking";
import { generateAllCalendarSlots } from "./generateAllCalendarSlots";
import { groupBookingsBySlot } from "./groupBookingsBySlot";
import { updateAllSlotsAvailability } from "./setAllSlotsAvailability";

export function updateAllSlotsFromReservations(bookedSlots: Reservation[], selectedBarber: Barber | null, barbers: Barber[]) {
    const currentDate = new Date();
    const endDate = new Date(currentDate.getTime() + 28 * 24 * 60 * 60 * 1000);
    const bookingsBySlot = groupBookingsBySlot(bookedSlots);
    const allSlots = generateAllCalendarSlots(currentDate, endDate, selectedBarber);
    const allSlotsUpdated = updateAllSlotsAvailability(allSlots, bookingsBySlot, barbers, selectedBarber);
    return allSlotsUpdated;
  }	