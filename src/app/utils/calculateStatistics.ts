import { DbBookedSlot } from '../types/booking'

type TimePeriod = 'daily' | 'weekly' | 'monthly' | 'yearly'

const getStartDate = (period: TimePeriod): Date => {
  const now = new Date()
  const startDate = new Date()

  switch (period) {
    case 'daily':
      startDate.setHours(0, 0, 0, 0)
      break
    case 'weekly':
      startDate.setDate(now.getDate() - 7)
      break
    case 'monthly':
      startDate.setMonth(now.getMonth() - 1)
      break
    case 'yearly':
      startDate.setFullYear(now.getFullYear() - 1)
      break
  }

  return startDate
}

export const calculateAppointments = (reservations: DbBookedSlot[], period: TimePeriod): number => {
  const startDate = getStartDate(period)
  return reservations.filter(res => {
    const resDate = new Date(res.StartTime)
    return resDate >= startDate && resDate <= new Date()
  }).length
}

export const calculateRevenue = (reservations: DbBookedSlot[], period: TimePeriod): number => {
  const appointments = calculateAppointments(reservations, period)
  return appointments * 12 // 12€ per appointment
}

export function calculateMonthlyRevenue(reservations: DbBookedSlot[]) {
  const monthlyData = new Array(12).fill(0);
  const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  
  reservations.forEach(reservation => {
    const date = new Date(reservation.StartTime);
    const month = date.getMonth();
    monthlyData[month] += 12; // 12€ per reservation
  });

  return {
    data: monthlyData,
    labels: monthNames
  };
}