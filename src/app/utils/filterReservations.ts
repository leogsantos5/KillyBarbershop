import { DbBookedSlot } from '../types/booking';

export function filterActiveBarberReservations(reservations: DbBookedSlot[], daysAhead: number = 14, searchTerm?: string): DbBookedSlot[] {
  const now = new Date();
  const futureDate = new Date(now);
  futureDate.setDate(now.getDate() + daysAhead);

  const dateFilteredReservations = reservations.filter(reservation => {
    const reservationDate = new Date(reservation.StartTime);
    return reservationDate >= now && reservationDate <= futureDate;
  });

  if (!searchTerm) {
    return dateFilteredReservations;
  }

  const searchLower = searchTerm.toLowerCase();
  const searchFilteredReservations = dateFilteredReservations.filter(reservation => 
    reservation.Users.Name.toLowerCase().includes(searchLower) || reservation.Users.Phone.includes(searchLower)
  );

  return searchFilteredReservations;
} 