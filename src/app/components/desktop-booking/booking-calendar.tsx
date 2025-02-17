import { Calendar, DateLocalizer } from 'react-big-calendar';
import { Barber, BookingSlotVM } from '../../types/booking';
import { BarberSelect } from './barber-select';

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

export function DesktopBooking({ barbers, slots, selectedBarber, 
                                onSelectBarber, onSelectSlot, date, 
                                onDateChange, localizer } : DesktopBookingProps) {
                                    
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
        <h2 className="text-3xl font-bold text-gray-900">Horários Disponíveis</h2>
        <BarberSelect 
          barbers={barbers}
          selectedBarber={selectedBarber}
          onSelectBarber={onSelectBarber}
        />
      </div>
      <div className="bg-white p-6 rounded-xl shadow-md">
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
        />
      </div>
    </>
  );
}