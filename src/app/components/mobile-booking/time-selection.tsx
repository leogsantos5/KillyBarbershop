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
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-xl font-bold mb-4">Escolha a hora</h2>
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
                  ? 'bg-green-100 hover:bg-green-200 text-green-800 border-green-200' 
                  : 'bg-red-100 text-red-800 border-red-200 cursor-not-allowed'
                }
              `}
            >
              {format(slot.Start, 'HH:mm')}
            </button>
          ))}
      </div>
      <button
        onClick={onBack}
        className="mt-4 w-full p-2 text-gray-600 hover:text-gray-800"
      >
        ← Voltar
      </button>
    </div>
  );
}