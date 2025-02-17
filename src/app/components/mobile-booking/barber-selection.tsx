import { Barber } from '../../types/booking';

interface BarberSelectionStepProps {
  barbers: Barber[];
  onSelectBarber: (barber: Barber | null) => void;
  onNext: () => void;
}

export function BarberSelectionStep({ barbers, onSelectBarber, onNext }: BarberSelectionStepProps) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-xl font-bold mb-4">Escolha o Barbeiro</h2>
      <div className="space-y-2">
        <button
          onClick={() => {
            onSelectBarber(null);
            onNext();
          }}
          className="w-full p-4 text-left border rounded-lg hover:bg-gray-50"
        >
          <div className="font-medium text-lg">Qualquer Barbeiro</div>
          <div className="text-sm text-gray-500">Ver todos os horários disponíveis</div>
        </button>
        {barbers.map((barber: Barber) => (
          <button
            key={barber.Id}
            onClick={() => {
              onSelectBarber(barber);
              onNext();
            }}
            className="w-full p-4 text-left border rounded-lg hover:bg-gray-50"
          >
            <div className="font-medium text-lg">{barber.Name}</div>
            <div className="text-sm text-gray-500">Ver horários específicos</div>
          </button>
        ))}
      </div>
    </div>
  );
}