'use client';

import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, 
         ChartEvent, ActiveElement, TooltipItem, TooltipModel } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { Reservation, Barber } from '../../types/booking';
import { calculateStatistics } from '../../utils/calculateStatistics';
import { TimePeriod, DrillDownState, ActiveTab } from '../../types/dashboard';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip);

export default function StatisticsGraph({ reservations, timePeriod, drillDown, onDrillDown, setTimePeriod, 
                                          setDrillDown, type, barbers, selectedBarberId, onBarberSelect, isOwner } : 

                                        { reservations: Reservation[]; timePeriod: TimePeriod; drillDown: DrillDownState;
                                          onDrillDown: (state: DrillDownState) => void; setTimePeriod: (period: TimePeriod) => void;
                                          setDrillDown: (state: DrillDownState) => void; type: ActiveTab; barbers: Barber[];
                                          selectedBarberId: string; onBarberSelect: (barberId: string) => void;
                                          isOwner: boolean;
                                        }) 
{
  // Filter reservations based on selected barber
  const filteredReservations = !reservations ? [] : 
    selectedBarberId ? reservations.filter(res => res.Barbers.Id === selectedBarberId) : reservations;

  const { data, labels } = calculateStatistics(filteredReservations, timePeriod, drillDown, type);

  const options = {
    responsive: true,
    plugins: { 
      title: { display: false },
      tooltip: { 
        callbacks: { 
          title: function(this: TooltipModel<'bar'>, tooltipItems: TooltipItem<'bar'>[]) {
            if (timePeriod === 'monthly') {
              return `Semana ${tooltipItems[0].dataIndex + 1}`;
            }
            return '';
          },
          label: function(this: TooltipModel<'bar'>, tooltipItem: TooltipItem<'bar'>) {
            const value = tooltipItem.raw as number;
            const label = tooltipItem.label;
            return [
              label,
              type === 'revenue' ? `${value}€` : `${value} ${value === 1 ? 'marcação' : 'marcações'}`
            ];
          }
        }
      }
    },
    scales: {
      x: { 
        ticks: { color: 'rgb(156, 163, 175)' }, 
        grid: { display: false }
      },
      y: { 
        ticks: { color: 'rgb(156, 163, 175)' }, 
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
    datasets: [{
      data,
      backgroundColor: 'rgb(59, 130, 246)',
      borderColor: 'rgb(29, 78, 216)',
      borderWidth: 1,
      barThickness: 'flex' as const,
      maxBarThickness: 40,
      minBarLength: 2
    }]
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 lg:p-6 rounded-lg shadow">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col lg:flex-row lg:justify-between gap-4">
          <div className="relative w-full lg:w-auto">
            <select
              value={timePeriod} 
              onChange={(e) => { setTimePeriod(e.target.value as TimePeriod); setDrillDown({}); }}
              className="w-full lg:w-auto appearance-none bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 lg:px-6 lg:py-3 pr-10 text-base lg:text-lg font-medium 
                        focus:outline-none focus:border-blue-500 cursor-pointer shadow-sm hover:border-blue-400 transition-colors
                        text-gray-900 dark:text-white truncate">
              <option value="weekly">Semanalmente</option>
              <option value="monthly">Mensalmente</option>
              <option value="yearly">Anualmente</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-700 dark:text-gray-300">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
              </svg>
            </div>
          </div>
          
          {isOwner && (
            <div className="relative w-full lg:w-auto">
              <select
                value={selectedBarberId} 
                onChange={(e) => onBarberSelect(e.target.value)}
                className="w-full lg:w-auto appearance-none bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 lg:px-6 lg:py-3 pr-10 text-base lg:text-lg font-medium 
                          focus:outline-none focus:border-blue-500 cursor-pointer shadow-sm hover:border-blue-400 transition-colors
                          text-gray-900 dark:text-white truncate">
                <option value="">Todos os Barbeiros</option>
                {barbers.map(barber => (
                  <option key={barber.Id} value={barber.Id}>{barber.Name}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-700 dark:text-gray-300">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                </svg>
              </div>
            </div>
          )}
        </div>

        <h2 className="text-lg lg:text-xl font-semibold text-gray-900 dark:text-white text-center lg:text-left mt-6">
          {type === 'revenue' ? 'Faturação €' : 'Número de Marcações'}
        </h2>
      </div>
      <Bar options={options} data={chartData} />
    </div>
  );
} 