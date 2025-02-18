import { format, getDay } from 'date-fns';
import { BookingSlotVM } from '../../types/booking';

interface DateSelectionStepProps {
  slots: BookingSlotVM[];
  onSelectDate: (date: Date) => void;
  onBack: () => void;
  onNext: () => void;
}

export function DateSelectionStep({ slots, onSelectDate, onBack, onNext }: DateSelectionStepProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Escolha o dia</h2>
      <div className="space-y-2 max-h-[60vh] overflow-y-auto pb-4">
        {(() => {
          const elements = [];
          for (let i = 0; i < 30; i++) {
            const date = new Date();
            date.setDate(date.getDate() + i);
            
            if (getDay(date) === 0) continue; // Skip Sundays
            
            const daySlots = slots.filter(event => 
              event.Start.toDateString() === date.toDateString()
            );
            
            elements.push(
              <button
                key={i}
                onClick={() => {
                  onSelectDate(date);
                  onNext();
                }}
                className="w-full p-4 text-left border dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <div className="font-medium text-gray-900 dark:text-white">{format(date, 'EEEE')}</div>
                <div className="text-gray-600 dark:text-gray-300">{format(date, 'd MMMM')}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {daySlots.filter(e => e.Status === undefined).length} horários disponíveis
                </div>
              </button>
            );
          }
          return elements;
        })()}
      </div>
      <button
        onClick={onBack}
        className="mt-4 w-full p-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
      >
        ← Voltar
      </button>
    </div>
  );
}