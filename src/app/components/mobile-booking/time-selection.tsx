import { format } from 'date-fns';
import { BookingSlotVM } from '../../types/booking';

interface TimeSelectionStepProps {
  slots: BookingSlotVM[];
  selectedDate: Date;
  onSelectSlot: (slot: BookingSlotVM) => void;
  onBack: () => void;
}

export function TimeSelectionStep({ slots, selectedDate, onSelectSlot, onBack }: TimeSelectionStepProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Escolha a hora</h2>
      <div className="grid grid-cols-2 gap-2">
        {slots
          .filter(event => 
            event.Start.toDateString() === selectedDate.toDateString()
          )
          .map((slot, i) => (
            <button
              key={i}
              onClick={() => onSelectSlot(slot)}
              disabled={slot.Status !== undefined}
              className={`
                p-3 text-center border rounded-lg transition-colors
                ${slot.Status === undefined
                  ? 'bg-green-100 dark:bg-green-800 hover:bg-green-200 dark:hover:bg-green-700 text-green-800 dark:text-green-100 border-green-200 dark:border-green-600' 
                  : 'bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-100 border-red-200 dark:border-red-600 cursor-not-allowed'
                }
              `}
            >
              {format(slot.Start, 'HH:mm')}
            </button>
          ))}
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