import { Reservation } from '../types/booking';

export function filterActiveBarberReservations(reservations: Reservation[], daysAhead: number = 14, searchTerm?: string): Reservation[] {
  
  if (!reservations || !Array.isArray(reservations)) {
    return [];
  } 

  const now = new Date();
  const futureDate = new Date(now);
  futureDate.setDate(now.getDate() + daysAhead);
  
  const dateFilteredReservations = reservations.filter(reservation => {
    if (!reservation?.StartTime) return false;
    const reservationDate = new Date(reservation.StartTime);
    return reservationDate >= now && reservationDate <= futureDate;
  });

  if (!searchTerm) {
    return dateFilteredReservations;
  }

  const searchLower = searchTerm.toLowerCase();
  const searchFilteredReservations = dateFilteredReservations.filter(reservation => 
    reservation.Users?.Name?.toLowerCase().includes(searchLower) || 
    reservation.Users?.Phone?.includes(searchLower)
  );

  return searchFilteredReservations;
}

export const countClientAppointments = (reservations: Reservation[], userId: string): number => 
  reservations.filter(res => res.Users.Id === userId).length; 