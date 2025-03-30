'use client';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  ChartEvent,
  ActiveElement,
  TooltipItem,
  TooltipModel,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { DbBookedSlot, Barber } from '../types/booking';

export type TimePeriod = 'weekly' | 'monthly' | 'yearly';
export type DrillDownState = {
  year?: number;
  month?: number;
  week?: number;
};

export type GraphType = 'revenue' | 'appointments';

ChartJS.register(
  CategoryScale,  
  LinearScale,
  BarElement,
  Title,
  Tooltip
);

export default function StatisticsGraph({ 
  reservations, 
  timePeriod,
  drillDown,
  onDrillDown,
  setTimePeriod,
  setDrillDown,
  type,
  barbers,
  selectedBarberId,
  onBarberSelect
}: { 
  reservations: DbBookedSlot[];
  timePeriod: TimePeriod;
  drillDown: DrillDownState;
  onDrillDown: (state: DrillDownState) => void;
  setTimePeriod: (period: TimePeriod) => void;
  setDrillDown: (state: DrillDownState) => void;
  type: GraphType;
  barbers: Barber[];
  selectedBarberId: string | null;
  onBarberSelect: (barberId: string | null) => void;
}) {
  let data: number[] = [];
  let labels: string[] = [];

  // Filter reservations based on selected barber
  const filteredReservations = selectedBarberId
    ? reservations.filter(res => res.Barbers.Id === selectedBarberId)
    : reservations;

  if (timePeriod === 'yearly') {
    // Get unique years from reservations
    const years = [...new Set(filteredReservations.map(res => new Date(res.StartTime).getFullYear()))].sort();
    data = years.map(year => {
      const yearReservations = filteredReservations.filter(reservation => new Date(reservation.StartTime).getFullYear() === year);
      return type === 'revenue' 
        ? yearReservations.reduce((sum) => sum + 12, 0)
        : yearReservations.length;
    });
    labels = years.map(year => year.toString());
  } else if (timePeriod === 'monthly') {
    // Show months for selected year or current year
    const yearToShow = drillDown.year || new Date().getFullYear();
    data = new Array(12).fill(0);
    labels = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    filteredReservations
      .filter(reservation => new Date(reservation.StartTime).getFullYear() === yearToShow)
      .forEach(reservation => {
        const month = new Date(reservation.StartTime).getMonth();
        if (type === 'revenue') {
          data[month] += 12;
        } else {
          data[month] += 1;
        }
      });
  } else if (timePeriod === 'weekly') {
    const currentDate = new Date();
    const yearToShow = drillDown.year || currentDate.getFullYear();
    const monthToShow = drillDown.month !== undefined ? drillDown.month : currentDate.getMonth();
    
    const startDate = new Date(yearToShow, monthToShow, 1);
    const endDate = new Date(yearToShow, monthToShow + 1, 0);
    const weeksInMonth = Math.ceil((endDate.getDate() + startDate.getDay()) / 7);
    
    data = new Array(weeksInMonth).fill(0);
    labels = Array.from({ length: weeksInMonth }, (_, i) => `Sem ${i + 1}`);
    
    filteredReservations
      .filter(reservation => {
        const resDate = new Date(reservation.StartTime);
        return resDate.getFullYear() === yearToShow && 
               resDate.getMonth() === monthToShow;
      })
      .forEach(reservation => {
        const resDate = new Date(reservation.StartTime);
        const weekIndex = Math.floor((resDate.getDate() + startDate.getDay() - 1) / 7);
        if (type === 'revenue') {
          data[weekIndex] += 12;
        } else {
          data[weekIndex] += 1;
        }
      });
  }

  const options = {
    responsive: true,
    plugins: {
      title: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: function(this: TooltipModel<'bar'>, tooltipItem: TooltipItem<'bar'>) {
            const value = tooltipItem.raw as number;
            return type === 'revenue' ? `${value}€` : `${value} marcações`;
          }
        }
      }
    },
    scales: {
      x: {
        ticks: { color: 'black' },
        grid: { display: false }
      },
      y: {
        ticks: { color: 'black' },
        grid: { display: false },
        beginAtZero: true
      }
    },
    onClick: (event: ChartEvent, elements: ActiveElement[]) => {
      if (elements.length > 0) {
        const index = elements[0].index;
        if (timePeriod === 'yearly') {
          onDrillDown({ year: parseInt(labels[index]) });
        } else if (timePeriod === 'monthly') {
          onDrillDown({ ...drillDown, month: index });
          setTimePeriod('weekly');
        }
      }
    }
  };

  const chartData = {
    labels,
    datasets: [
      {
        data,
        backgroundColor: 'rgb(59, 130, 246)',
        borderColor: 'rgb(29, 78, 216)',
        borderWidth: 1,
        barThickness: 50,
      }
    ]
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <div className="relative">
          <select
            value={timePeriod}
            onChange={(e) => {
              setTimePeriod(e.target.value as TimePeriod);
              setDrillDown({}); // Reset drill-down when changing time period
            }}
            className="appearance-none bg-white border-2 border-gray-300 rounded-lg px-6 py-3 pr-12 text-lg font-medium focus:outline-none focus:border-blue-500 cursor-pointer shadow-sm hover:border-blue-400 transition-colors"
          >
            <option value="weekly">Semanalmente</option>
            <option value="monthly">Mensalmente</option>
            <option value="yearly">Anualmente</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-700">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
            </svg>
          </div>
        </div>
        <h2 className="text-xl font-semibold">
          {type === 'revenue' ? 'Faturação €' : 'Número de Marcações'}
        </h2>
        <div className="relative">
          <select
            value={selectedBarberId || ''}
            onChange={(e) => onBarberSelect(e.target.value || null)}
            className="appearance-none bg-white border-2 border-gray-300 rounded-lg px-6 py-3 pr-12 text-lg font-medium focus:outline-none focus:border-blue-500 cursor-pointer shadow-sm hover:border-blue-400 transition-colors"
          >
            <option value="">Todos os Barbeiros</option>
            {barbers.map(barber => (
              <option key={barber.Id} value={barber.Id}>
                {barber.Name}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-700">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
            </svg>
          </div>
        </div>
      </div>
      <Bar options={options} data={chartData} />
    </div>
  );
} 