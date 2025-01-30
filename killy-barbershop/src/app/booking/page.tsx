'use client';

import { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { pt } from 'date-fns/locale';
import { useReservations } from '../hooks/useReservations';
import { BookingForm } from '../components/booking-form';
import "react-big-calendar/lib/css/react-big-calendar.css";

const locales = { 'pt': pt };

type Slot = {
    Start: Date;
    End: Date;
    Title: string;
    Resource: string;
    UserName?: string;
    UserPhone?: string;
    Status?: string;
  };
  
  type FormData = {
    Name: string;
    Phone: string;
  };


const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const BookingPage = () => {
  const [initialLoading, setInitialLoading] = useState(true);
  const [date, setDate] = useState(new Date());
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showBookingDetails, setShowBookingDetails] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  const { events, createReservation, fetchReservations } = useReservations();

  useEffect(() => {
    const loadReservations = async () => {
      setInitialLoading(true);
      await fetchReservations();
      setInitialLoading(false);
    };
    loadReservations();
  }, []);

  const handleSelectEvent = (event: Slot) => {
    if (event.Resource === 'booked') {
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
      setFormError(result.error);
    }
  };

  const eventStyleGetter = (event: Slot) => {
    const isBooked = event.Resource === 'booked';
    return {
      style: {
        backgroundColor: isBooked ? '#EF4444' : '#10B981',
        borderRadius: '4px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block',
        cursor: 'pointer',
        width: '100%',
      },
    };
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Horários Disponíveis
        </h2>

        {initialLoading && (
          <div className="text-center mb-4">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-red-600 border-t-transparent"></div>
          </div>
        )}

        <div className="bg-white p-6 rounded-xl shadow-md">
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="Start"
            endAccessor="End"
            titleAccessor="Title"
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

        {showBookingDetails && selectedSlot && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl p-8 max-w-md w-full">
              <h3 className="text-2xl font-bold mb-4">Detalhes da Reserva</h3>
              <div className="space-y-4">
                <p><strong>Cliente:</strong> {selectedSlot.UserName}</p>
                <p><strong>Telefone:</strong> {selectedSlot.UserPhone}</p>
                <p><strong>Data:</strong> {format(selectedSlot.Start, "dd/MM/yyyy")}</p>
                <p><strong>Hora:</strong> {format(selectedSlot.Start, "HH:mm")}</p>
                <p><strong>Estado:</strong> {selectedSlot.Status}</p>
                
                <div className="flex gap-4 mt-6">
                  <button
                    onClick={() => setShowBookingDetails(false)}
                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
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
