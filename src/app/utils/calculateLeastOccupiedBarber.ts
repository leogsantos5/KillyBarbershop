import { Barber, DbBookedSlot } from "../types/booking";

export function calculateLeastOccupiedBarberForDay(reservationDay: Date, availableBarbers: Barber[], 
                                                   allBookedSlots: DbBookedSlot[]): string {
    debugger;
    const barberAppearances: Record<string, number> = {}; 

    // Filter booked slots for the given day
    const bookedSlotsForDay = allBookedSlots.filter(
      (bs) => new Date(bs.StartTime).getDate() === reservationDay.getDate() &&
              new Date(bs.StartTime).getMonth() === reservationDay.getMonth() &&
              new Date(bs.StartTime).getFullYear() === reservationDay.getFullYear()
    );
  
    // Count how many times each barber appears in the booked slots
    for (const bookedSlot of bookedSlotsForDay) {
      if (!barberAppearances[bookedSlot.Barbers.Id]) {
        barberAppearances[bookedSlot.Barbers.Id] = 1;
      } else {
        barberAppearances[bookedSlot.Barbers.Id]++;
      }
    }

  // Find the least occupied barber/barbers
  let leastBookings = Infinity;
  let leastOccupiedBarbers: string[] = [];

  for (const barber of availableBarbers) {
    const bookingsCount = barberAppearances[barber.Id] || 0; // Default to 0 if not booked

    if (bookingsCount < leastBookings) {
      leastBookings = bookingsCount;
      leastOccupiedBarbers = [barber.Id]; // Reset and add only this barber
    } else if (bookingsCount === leastBookings) {
      leastOccupiedBarbers.push(barber.Id); // Add to the list of least occupied
    }
  }

  // Randomly select one if there's a tie
  if (leastOccupiedBarbers.length > 1) {
    const randomIndex = Math.floor(Math.random() * leastOccupiedBarbers.length);
    return leastOccupiedBarbers[randomIndex];
  }

  return leastOccupiedBarbers[0]; 
}
  