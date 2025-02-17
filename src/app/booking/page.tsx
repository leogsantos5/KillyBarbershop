'use client';
import { useState, useEffect, Fragment } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, addDays } from 'date-fns';
import { pt } from 'date-fns/locale';
import { BookingForm } from '../components/booking-form';
import { useMediaQuery } from 'react-responsive';
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Barber, BookingSlotVM, FormData } from '../types/booking';
import { Listbox, Transition } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import { barbersService } from '../supabase/barbersService';
import { reservationsService } from '../supabase/reservationsService';

const locales = { 'pt': pt };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const BookingPage = () => {
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const [isLoading, setIsLoading] = useState(true);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [selectedBarber, setSelectedBarber] = useState<Barber | null>(null);
  const [slots, setSlots] = useState<BookingSlotVM[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<BookingSlotVM | null>(null);
  const [date, setDate] = useState(new Date());
  const [showReservationForm, setShowReservationForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [step, setStep] = useState(1);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      
      const { data: barbersData } = await barbersService.fetchBarbers();
      if (barbersData) {
        setBarbers(barbersData);
        
        // Pass all barbers when no specific barber is selected
        const { data: slotsData } = await reservationsService.fetchReservations(
          selectedBarber, 
          barbersData
        );
        if (slotsData) {
          setSlots(slotsData);
        }
      }
      
      setIsLoading(false);
    };

    loadData();
  }, [selectedBarber]);

  const handleSelectSlotEvent = (event: BookingSlotVM) => {
    if (event.Status === undefined) {
      setSelectedSlot(event);
      setShowReservationForm(true);
    }
  };

  const handleSubmitForm = async (formData: FormData) => {
    if (!selectedSlot) return;
    
    setFormLoading(true);
    setFormError(null);
    setFormSuccess(false);
    
    try {
      const result = await reservationsService.createReservation(formData, selectedSlot);
      
      if (result.success) {
        setFormSuccess(true);
        // Let the BookingForm handle its own closing with animation
        const { data: newSlots } = await reservationsService.fetchReservations(selectedBarber, barbers);
        if (newSlots) {
          setSlots(newSlots);
        }
      } else {
        setFormError(result.error as string);
      }
    } catch {
      setFormError('Ocorreu um erro ao processar a reserva.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleFormClose = () => {
    setShowReservationForm(false);
    setFormError(null);
    setFormSuccess(false);
    setFormLoading(false);
  };

  const MobileBooking = () => (
    <div className="space-y-4">
      {step === 1 && (
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-xl font-bold mb-4">Escolha o Barbeiro</h2>
          <div className="space-y-2">
            <button
              onClick={() => {
                setSelectedBarber(null);
                setStep(2);
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
                  setSelectedBarber(barber);
                  setStep(2);
                }}
                className="w-full p-4 text-left border rounded-lg hover:bg-gray-50"
              >
                <div className="font-medium text-lg">{barber.Name}</div>
                <div className="text-sm text-gray-500">Ver horários específicos</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-xl font-bold mb-4">Escolha o dia</h2>
          <div className="space-y-2 max-h-[60vh] overflow-y-auto pb-4">
            {[...Array(28)].map((_, i) => {
              const date = addDays(new Date(), i + 1);
              if (getDay(date) === 0) return null;         
              const daySlots = slots.filter(event => 
                event.Start.toDateString() === date.toDateString()
              );              
             return (
                <button
                  key={i}
                  onClick={() => {
                    setDate(date);
                    setStep(3);
                  }}
                  className="w-full p-4 text-left border rounded-lg hover:bg-gray-50"
                >
                  <div className="font-medium">{format(date, 'EEEE')}</div>
                  <div className="text-gray-600">{format(date, 'd MMMM')}</div>
                  <div className="text-sm text-gray-500">
                    {daySlots.filter(e => e.Status == undefined).length} horários disponíveis
                  </div>
                </button>
              );
            })}
          </div>
          <button
            onClick={() => setStep(1)}
            className="mt-4 w-full p-2 text-gray-600 hover:text-gray-800"
          >
            ← Voltar
          </button>
        </div>
      )}

      {step === 3 && (
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-xl font-bold mb-4">Escolha a hora</h2>
          <div className="grid grid-cols-2 gap-2">
            {slots
              .filter(event => 
                event.Start.toDateString() === date.toDateString()
              )
              .map((slot, i) => (
                <button
                  key={i}
                  onClick={() => {
                    handleSelectSlotEvent(slot);
                  }}
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
            onClick={() => setStep(2)}
            className="mt-4 w-full p-2 text-gray-600 hover:text-gray-800"
          >
            ← Voltar
          </button>
        </div>
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

  const eventStyleGetter = (slot: BookingSlotVM) => {
    const isBooked = slot.Status != undefined;
    return {
      style: {
        backgroundColor: isBooked ? '#EF4444' : '#10B981',
        borderRadius: '4px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block',
        cursor: isBooked ? 'not-allowed' : 'pointer',
        width: '100%',
      },
      title: isBooked ? 'Reservado' : 'Disponível'
    };
  };

  // Desktop view
  const DesktopView = () => (
    <div>
      <div className="bg-white p-6 rounded-xl shadow-md">
        <Calendar
          localizer={localizer}
          events={slots}
          startAccessor="Start"
          endAccessor="End"
          style={{ height: 600 }}
          eventPropGetter={eventStyleGetter}
          onSelectEvent={handleSelectSlotEvent}
          defaultView="week"
          view="week"
          views={['week']}
          date={date}
          onNavigate={(newDate: Date) => setDate(newDate)}
          min={new Date(0, 0, 0, 9, 0, 0)}
          max={new Date(0, 0, 0, 19, 0, 0)}
          messages={{
            next: "Próximo",
            previous: "Anterior",
            today: "Hoje",
            week: "Semana",
            noEventsInRange: "Não há horários disponíveis",
          }}
        />
      </div>
    </div>
  );

  // Update Listbox to use full barber object
  const BarberSelect = () => (
    <Listbox value={selectedBarber} onChange={(barber) => {
      setSelectedBarber(barber);
      if (isMobile) setStep(2);
    }}>
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

  if (isLoading) {
    return (
      <div className="text-center my-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-red-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {!isMobile && (
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Horários Disponíveis</h2>
            <BarberSelect />
          </div>
        )}

        {isMobile ? <MobileBooking /> : <DesktopView />}

        {showReservationForm && selectedSlot && (
          <BookingForm
            onSubmit={handleSubmitForm}
            onCancel={handleFormClose}
            isLoading={formLoading}
            error={formError || undefined}
            success={formSuccess}
          />
        )}
      </div>
    </div>
  );
};

export default BookingPage;
