import { Calendar, DateLocalizer } from 'react-big-calendar';
import { Barber, BookingSlotVM } from '../../types/booking';
import { BarberDropdown } from './barber-dropdown';
import 'react-big-calendar/lib/css/react-big-calendar.css';

interface DesktopBookingProps {
  barbers: Barber[];
  slots: BookingSlotVM[];
  selectedBarber: Barber | null;
  onSelectBarber: (barber: Barber | null) => void;
  onSelectSlot: (slot: BookingSlotVM) => void;
  date: Date;
  onDateChange: (date: Date) => void;
  localizer: DateLocalizer;
}

export function DesktopBooking({ barbers, slots, selectedBarber, onSelectBarber, onSelectSlot, date, onDateChange, localizer }: DesktopBookingProps) {
  const eventStyleGetter = (slot: BookingSlotVM) => {
    const isBooked = slot.Status !== undefined;
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

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Horários Disponíveis</h2>
        <BarberDropdown 
          barbers={barbers}
          selectedBarber={selectedBarber}
          onSelectBarber={onSelectBarber}
        />
      </div>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md [&_.rbc-today]:dark:!bg-gray-700 
                      [&_.rbc-header]:dark:!border-gray-600 [&_.rbc-time-content]:dark:!border-gray-600 
                      [&_.rbc-time-header-content]:dark:!border-gray-600 [&_.rbc-time-view]:dark:!border-gray-600 
                      [&_.rbc-timeslot-group]:dark:!border-gray-600 [&_.rbc-toolbar-label]:dark:!text-gray-200 
                      [&_.rbc-btn-group>button]:dark:!text-gray-200 [&_.rbc-time-slot]:dark:!border-gray-600 
                      [&_.rbc-events-container]:dark:!border-gray-600 [&_.rbc-day-bg]:dark:!border-gray-600 
                      [&_.rbc-header+.rbc-header]:dark:!border-gray-600 [&_.rbc-btn-group>button:hover]:dark:!bg-gray-700 
                      [&_.rbc-btn-group>button:hover]:dark:!text-white">
        <Calendar
          localizer={localizer}
          events={slots}
          startAccessor="Start"
          endAccessor="End"
          style={{ height: 600 }}
          eventPropGetter={eventStyleGetter}
          onSelectEvent={onSelectSlot}
          defaultView="week"
          view="week"
          views={['week']}
          date={date}
          onNavigate={onDateChange}
          min={new Date(0, 0, 0, 9, 0, 0)}
          max={new Date(0, 0, 0, 19, 0, 0)}
          messages={{
            next: "Próximo",
            previous: "Anterior",
            today: "Hoje",
            week: "Semana",
            noEventsInRange: "Não há horários disponíveis",
          }}
          className="dark:text-gray-200"
        />
      </div>
    </>
  );
}