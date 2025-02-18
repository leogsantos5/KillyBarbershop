import { Barber } from '../../types/booking';

interface BarberSelectionStepProps {
  barbers: Barber[];
  onSelectBarber: (barber: Barber | null) => void;
  onNext: () => void;
}

export function BarberSelectionStep({ barbers, onSelectBarber, onNext }: BarberSelectionStepProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Escolha o Barbeiro</h2>
      <div className="space-y-2">
        <button
          onClick={() => {
            onSelectBarber(null);
            onNext();
          }}
          className="w-full p-4 text-left border dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          <div className="font-medium text-lg text-gray-900 dark:text-white">Qualquer Barbeiro</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Ver todos os horários disponíveis</div>
        </button>
        {barbers.map((barber: Barber) => (
          <button
            key={barber.Id}
            onClick={() => {
              onSelectBarber(barber);
              onNext();
            }}
            className="w-full p-4 text-left border dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <div className="font-medium text-lg text-gray-900 dark:text-white">{barber.Name}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Ver horários específicos</div>
          </button>
        ))}
      </div>
    </div>
  );
}