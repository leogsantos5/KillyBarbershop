import { Fragment } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import { Barber } from '../../types/booking';

interface BarberSelectProps {
  barbers: Barber[];
  selectedBarber: Barber | null;
  onSelectBarber: (barber: Barber | null) => void;
}

export function BarberSelect({ barbers, selectedBarber, onSelectBarber }: BarberSelectProps) {
  return (
    <Listbox value={selectedBarber} onChange={onSelectBarber}>
      <div className="relative w-72">
        <Listbox.Button as="div" className="relative w-full cursor-pointer rounded-lg bg-white py-3 pl-4 pr-10 text-left border shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500">
          <span className="block truncate">
            {selectedBarber ? selectedBarber.Name : 'Todos os Barbeiros'}
          </span>
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
            <ChevronDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </span>
        </Listbox.Button>
        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            <Listbox.Option
              value={null}
              className={({ active }) =>
                `relative cursor-pointer select-none py-2 pl-4 pr-4 ${
                  active ? 'bg-red-100 text-red-900' : 'text-gray-900'
                }`
              }
            >
              Todos os Barbeiros
            </Listbox.Option>
            {barbers.map((barber) => (
              <Listbox.Option
                key={barber.Id}
                value={barber}
                className={({ active }) =>
                  `relative cursor-pointer select-none py-2 pl-4 pr-4 ${
                    active ? 'bg-red-100 text-red-900' : 'text-gray-900'
                  }`
                }
              >
                {barber.Name}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </Transition>
      </div>
    </Listbox>
  );
}