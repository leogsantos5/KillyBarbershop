import { format } from 'date-fns';
import { BookingSlotVM } from '../../types/booking';

interface TimeSelectionStepProps {
  slots: BookingSlotVM[];
  selectedDate: Date;
  onSelectSlot: (slot: BookingSlotVM) => void;
  onBack: () => void;
}

export function TimeSelectionStep({ slots, selectedDate, onSelectSlot, onBack }: TimeSelectionStepProps) {
  const availableSlots = slots.filter(slot => 
    slot.Start.getDate() === selectedDate.getDate() &&
    slot.Start.getMonth() === selectedDate.getMonth() &&
    slot.Start.getFullYear() === selectedDate.getFullYear() &&
    slot.Status === undefined
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Selecione o Horário</h3>
        <button
          onClick={onBack}
          className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
        >
          Voltar
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {availableSlots.map((slot) => (
          <button
            key={slot.Start.getTime()}
            onClick={() => onSelectSlot(slot)}
            className="p-2 text-sm bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 
                     rounded-md hover:bg-green-200 dark:hover:bg-green-800 transition-colors"
          >
            {format(slot.Start, 'HH:mm')}
          </button>
        ))}
      </div>

      {availableSlots.length === 0 && (
        <div className="text-center py-4 text-gray-500 dark:text-gray-400">
          Não há horários disponíveis para esta data
        </div>
      )}
    </div>
  );
}