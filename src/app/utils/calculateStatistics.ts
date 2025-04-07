import { Reservation } from '../types/booking'
import { TimePeriod, DrillDownState, ActiveTab, StatisticsData } from '../types/dashboard'

const PRICE_PER_APPOINTMENT = 12;

const getStartDate = (period: TimePeriod): Date => {
  const now = new Date()
  const startDate = new Date()

  switch (period) {
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

const calculatePeriodData = (reservations: Reservation[], periodValues: number[], periodFilter: (res: Reservation, value: number) => boolean, 
                             labelFn: (value: number) => string, type: ActiveTab): StatisticsData => {
    const data = periodValues.map(value => {
    const periodReservations = reservations.filter(res => periodFilter(res, value));
    return type === 'revenue' ? periodReservations.length * PRICE_PER_APPOINTMENT : periodReservations.length;
  });
  const labels = periodValues.map(labelFn);
  return { data, labels };
};

export const calculateAppointments = (reservations: Reservation[], period: TimePeriod): number => {
  const startDate = getStartDate(period)
  return reservations.filter(res => {
    const resDate = new Date(res.StartTime)
    return resDate >= startDate && resDate <= new Date()
  }).length
}

export const calculateRevenue = (reservations: Reservation[], period: TimePeriod): number => {
  const appointments = calculateAppointments(reservations, period)
  return appointments * PRICE_PER_APPOINTMENT
}

export function calculateStatistics(reservations: Reservation[], timePeriod: TimePeriod, 
                                    drillDown: DrillDownState, type: ActiveTab): StatisticsData {
  const now = new Date();
  const currentYear = now.getFullYear();
  if (timePeriod === 'yearly') {
    // For yearly view, show only 2025 as a single bar
    const yearReservations = reservations.filter(res => 
      new Date(res.StartTime).getFullYear() === currentYear
    );
    const value = type === 'revenue' ? yearReservations.length * PRICE_PER_APPOINTMENT : yearReservations.length;
    return {
      data: [value],
      labels: [currentYear.toString()]
    };
  } 
  else if (timePeriod === 'monthly') {
    // For monthly view, show all months of the current year
    const months = Array.from({ length: 12 }, (_, i) => i);
    return calculatePeriodData(
      reservations, months, (res, month) => {
        const resDate = new Date(res.StartTime);
        return resDate.getMonth() === month && resDate.getFullYear() === currentYear;
      }, month => new Date(2000, month).toLocaleString('pt-PT', { month: 'long' }), type);
  } 
  else if (timePeriod === 'weekly') {
    const weeks = Array.from({ length: 7 }, (_, i) => i);
    return calculatePeriodData(
      reservations, weeks, (res, week) => {
        const resDate = new Date(res.StartTime);
        return resDate.getDay() === week && 
               resDate.getMonth() === (drillDown.month ?? now.getMonth()) &&
               resDate.getFullYear() === currentYear;
      }, week => new Date(2000, 0, week + 1).toLocaleString('pt-PT', { weekday: 'long' }), type);
  }

  return { data: [], labels: [] };
}