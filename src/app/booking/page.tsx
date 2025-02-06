'use client';
import { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, addDays } from 'date-fns';
import { pt } from 'date-fns/locale';
import { useReservations } from '../hooks/useReservations';
import { BookingForm } from '../components/booking-form';
import { useMediaQuery } from 'react-responsive';
import "react-big-calendar/lib/css/react-big-calendar.css";
import { BookingSlotVM, FormData } from '../types/booking';

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
  const [initialLoading, setInitialLoading] = useState(true);
  const [date, setDate] = useState(new Date());
  const [selectedSlot, setSelectedSlot] = useState<BookingSlotVM | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showBookingDetails, setShowBookingDetails] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [step, setStep] = useState(1);

  const { events, createReservation, fetchReservations } = useReservations();

  useEffect(() => {
    const loadReservations = async () => {
      setInitialLoading(true);
      await fetchReservations();
      setInitialLoading(false);
    };
    loadReservations();
  }, [fetchReservations]);

  const handleSelectEvent = (event: BookingSlotVM) => {
    if (event.Status === 'A confirmar' || event.Status === 'Confirmado') {
      setSelectedSlot(event);
      setShowBookingDetails(true);
    } else {
      setSelectedSlot(event);
      setShowForm(true);
    }
  };

  const handleSubmit = async (formData: FormData) => {
    setFormError(null);
    setFormSuccess(false);
    setFormLoading(true);
    const result = await createReservation(formData, selectedSlot!);
    setFormLoading(false);
    
    if (result.success) {
      setFormSuccess(true);
    } else {
      setFormError(result.error || 'Erro ao criar reserva');
    }
  };

  const MobileBooking = () => (
    <div className="space-y-4">
      {step === 1 && (
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-xl font-bold mb-4">Escolha o dia</h2>
          <div className="space-y-2">
            {[...Array(7)].map((_, i) => {
              const date = addDays(new Date(), i + 1);
              if (getDay(date) === 0) return null;
              
              const dayEvents = events.filter(event => 
                event.Start.toDateString() === date.toDateString()
              );
              
              return (
                <button
                  key={i}
                  onClick={() => {
                    setDate(date);
                    setStep(2);
                  }}
                  className="w-full p-4 text-left border rounded-lg hover:bg-gray-50"
                >
                  <div className="font-medium">{format(date, 'EEEE')}</div>
                  <div className="text-gray-600">{format(date, 'd MMMM')}</div>
                  <div className="text-sm text-gray-500">
                    {dayEvents.filter(e => e.Status === 'Disponível').length} horários disponíveis
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-xl font-bold mb-4">Escolha a hora</h2>
          <div className="grid grid-cols-2 gap-2">
            {events
              .filter(event => 
                event.Start.toDateString() === date.toDateString()
              )
              .map((slot, i) => (
                <button
                  key={i}
                  onClick={() => {
                    handleSelectEvent(slot);
                  }}
                  disabled={slot.Status !== 'Disponível'}
                  className={`
                    p-3 text-center border rounded-lg transition-colors
                    ${slot.Status === 'Disponível' 
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
            onClick={() => setStep(1)}
            className="mt-4 w-full p-2 text-gray-600 hover:text-gray-800"
          >
            ← Voltar
          </button>
        </div>
      )}

      {/* Progress indicator */}
      <div className="flex justify-center space-x-2 mt-4">
        {[1, 2].map((i) => (
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

  const eventStyleGetter = (event: BookingSlotVM) => {
    const isBooked = event.Status === 'A confirmar' || event.Status === 'Confirmado';
    return {
      style: {
        backgroundColor: isBooked ? '#EF4444' : '#10B981', // Red for booked, Green for available
        borderRadius: '4px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block',
        cursor: isBooked ? 'not-allowed' : 'pointer',
        width: '100%',
      },
    };
  };

  if (initialLoading) {
    return (
      <div className="text-center mb-4">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-red-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Horários Disponíveis
        </h2>

        {isMobile ? (
          <MobileBooking />
        ) : (
          <div className="bg-white p-6 rounded-xl shadow-md">
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="Start"
              endAccessor="End"
              style={{ height: 600 }}
              eventPropGetter={eventStyleGetter}
              onSelectEvent={handleSelectEvent}
              defaultView="week"
              view="week"
              views={['week']}
              date={date}
              onNavigate={setDate}
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
        )}

        {showBookingDetails && selectedSlot && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl p-8 max-w-md w-full">
              <h3 className="text-2xl font-bold mb-4">Detalhes da Reserva</h3>
              <div className="space-y-4">
                <p><strong>Cliente:</strong> {selectedSlot.UserName || 'N/A'}</p>
                <p><strong>Telefone:</strong> {selectedSlot.UserPhone.replace('+351', '') || 'N/A'}</p>
                <p><strong>Data:</strong> {format(selectedSlot.Start, "dd/MM/yyyy")}</p>
                <p><strong>Hora:</strong> {format(selectedSlot.Start, "HH:mm")}</p>
                <p><strong>Estado:</strong> {selectedSlot.Status}</p>
                
                <div className="flex gap-4 mt-6">
                  <button
                    onClick={() => setShowBookingDetails(false)}
                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">
                    Fechar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showForm && selectedSlot && (
          <BookingForm
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowForm(false);
              setFormError(null);
              setFormSuccess(false);
            }}
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
