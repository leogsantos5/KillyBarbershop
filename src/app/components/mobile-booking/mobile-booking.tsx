import { useState } from 'react';
import { Barber, BookingSlotVM } from '../../types/booking';
import { BarberSelectionStep } from './barber-selection';
import { DateSelectionStep } from './date-selection';
import { TimeSelectionStep } from './time-selection';

interface MobileBookingProps {
  barbers: Barber[];
  slots: BookingSlotVM[];
  onSelectBarber: (barber: Barber | null) => void;
  onSelectSlot: (slot: BookingSlotVM) => void;
}

export function MobileBooking({ barbers, slots, onSelectBarber, onSelectSlot } : MobileBookingProps) {
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState(new Date());

  return (
    <div className="space-y-4">
      {step === 1 && (
        <BarberSelectionStep 
          barbers={barbers}
          onSelectBarber={onSelectBarber}
          onNext={() => setStep(2)}
        />
      )}

      {step === 2 && (
        <DateSelectionStep 
          slots={slots}
          onSelectDate={setSelectedDate}
          onBack={() => setStep(1)}
          onNext={() => setStep(3)}
        />
      )}

      {step === 3 && (
        <TimeSelectionStep 
          slots={slots}
          selectedDate={selectedDate}
          onSelectSlot={onSelectSlot}
          onBack={() => setStep(2)}
        />
      )}

      {/* Progress indicator */}
      <div className="flex justify-center space-x-2 mt-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-2 w-2 rounded-full ${
              step >= i ? 'bg-blue-600' : 'bg-gray-300'
            }`}
          />
        ))}
      </div>
    </div>
  );
}