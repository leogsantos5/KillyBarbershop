import { Reservation } from '../types/booking'
import { TimePeriod, DrillDownState, ActiveTab, StatisticsData } from '../types/dashboard'
import { format } from 'date-fns'

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
      }, month => {
        const monthName = new Date(2000, month).toLocaleString('pt-PT', { month: 'long' });
        return monthName.charAt(0).toUpperCase() + monthName.slice(1);
      }, type);
  } 
  else if (timePeriod === 'weekly') {
    // For weekly view, show weeks of the selected month
    const selectedMonth = drillDown.month ?? now.getMonth();
    const firstDay = new Date(currentYear, selectedMonth, 1);
    const lastDay = new Date(currentYear, selectedMonth + 1, 0);
    const weeksInMonth = Math.ceil((lastDay.getDate() + firstDay.getDay()) / 7);
    
    const weeks = Array.from({ length: weeksInMonth }, (_, i) => i);
    return calculatePeriodData(
      reservations, weeks, (res, week) => {
        const resDate = new Date(res.StartTime);
        const weekStart = new Date(currentYear, selectedMonth, week * 7 - firstDay.getDay() + 1);
        const weekEnd = new Date(currentYear, selectedMonth, Math.min(week * 7 - firstDay.getDay() + 7, lastDay.getDate()));
        return resDate >= weekStart && resDate <= weekEnd;
      }, week => {
        const weekStart = new Date(currentYear, selectedMonth, week * 7 - firstDay.getDay() + 1);
        const weekEnd = new Date(currentYear, selectedMonth, Math.min(week * 7 - firstDay.getDay() + 7, lastDay.getDate()));
        const monthName = weekEnd.toLocaleString('pt-PT', { month: 'short' });
        return `${format(weekStart, 'd')} - ${format(weekEnd, 'd')} ${monthName.charAt(0).toUpperCase() + monthName.slice(1)}`;
      }, type);
  }

  return { data: [], labels: [] };
}