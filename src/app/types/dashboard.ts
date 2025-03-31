export type TimePeriod = 'weekly' | 'monthly' | 'yearly';

export type ActiveTab = 'revenue' | 'appointments' | 'barbers' | 'users' | 'my-reservations';

export interface DrillDownState {
  year?: number;
  month?: number;
  week?: number;
  barberId?: string;
}

export interface StatisticsData {
  data: number[];
  labels: string[];
} 