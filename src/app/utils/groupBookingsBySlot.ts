import { DbBookedSlot } from "../types/booking";

// Creates a dicitonary where each key is a timestamp for a certain slot
// and each value is an array of all the different barber bookings for that timestamp

export const groupBookingsBySlot = (bookings: DbBookedSlot[]) => {
    const bookingDict = new Map<number, DbBookedSlot[]>();
    
    bookings.forEach(booking => {
      const timeStamp = new Date(booking.StartTime).getTime();
      
      if (!bookingDict.has(timeStamp)) {
        bookingDict.set(timeStamp, []);
      }
      
      bookingDict.get(timeStamp)?.push(booking);
    });
    
    return bookingDict;
  };