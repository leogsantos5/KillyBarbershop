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
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-xl font-bold mb-4">Escolha o dia</h2>
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
                className="w-full p-4 text-left border rounded-lg hover:bg-gray-50"
              >
                <div className="font-medium">{format(date, 'EEEE')}</div>
                <div className="text-gray-600">{format(date, 'd MMMM')}</div>
                <div className="text-sm text-gray-500">
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
        className="mt-4 w-full p-2 text-gray-600 hover:text-gray-800"
      >
        ← Voltar
      </button>
    </div>
  );
}