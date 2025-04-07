import { Reservation } from "../types/booking";

// Creates a dicitonary where each key is a timestamp for a certain slot
// and each value is an array of all the different barber bookings for that timestamp

export function groupBookingsBySlot(bookings: Reservation[] | null | undefined): Map<number, Reservation[]> {
    const bookingDict = new Map<number, Reservation[]>();
    
    if (!Array.isArray(bookings)) {
        return bookingDict;
    }

    bookings.forEach(booking => {
      const timeStamp = new Date(booking.StartTime).getTime();
      
      if (!bookingDict.has(timeStamp)) {
        bookingDict.set(timeStamp, []);
      }
      
      bookingDict.get(timeStamp)?.push(booking);
    });
    
    return bookingDict;
}