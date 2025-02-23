'use client';
import { useState, useEffect } from 'react';
import { useMediaQuery } from 'react-responsive';
import { dateFnsLocalizer } from 'react-big-calendar';
import "react-big-calendar/lib/css/react-big-calendar.css";
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { pt } from 'date-fns/locale';
import { Barber, BookingSlotVM, FormData } from '../types/booking';
import { barbersService } from '../supabase/barbersService';
import { reservationsService } from '../supabase/reservationsService';
import { MobileBooking } from '../components/mobile-booking/mobile-booking';
import { DesktopBooking } from '../components/desktop-booking/booking-calendar';
import { BookingForm } from '../components/booking-form';
import { ErrorMessages } from '../utils/errorMessages';
import { updateAllSlotsFromReservations } from '../utils/updateAllSlotsFromReservations';

const locales = { 'pt': pt };
const localizer = dateFnsLocalizer({format, parse, startOfWeek, getDay, locales });

const BookingPage = () => {
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const [isLoading, setIsLoading] = useState(true);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [selectedBarber, setSelectedBarber] = useState<Barber | null>(null);
  const [allSlots, setAllSlots] = useState<BookingSlotVM[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<BookingSlotVM | null>(null);
  const [date, setDate] = useState(new Date());
  const [showReservationForm, setShowReservationForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      const { data: barbersData } = await barbersService.fetchBarbers();
      if (barbersData) {
        setBarbers(barbersData);
      }
      setIsLoading(false);
    };
    loadData();
  }, []);

  useEffect(() => {
    const loadSlots = async () => {
      if (selectedBarber || barbers.length > 0) {
        const { data: bookedSlots } = await reservationsService.fetchReservations();
        if (bookedSlots) {
          const allSlotsUpdated = updateAllSlotsFromReservations(bookedSlots, selectedBarber, barbers);
          setAllSlots(allSlotsUpdated);
        }
      }
    };
    loadSlots();
  }, [selectedBarber, barbers]);

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
      const { data: bookedSlots } = await reservationsService.fetchReservations(); 
      if (bookedSlots != null) {
        const result = await reservationsService.createReservation(formData, selectedSlot, bookedSlots, barbers);
        if (result.success) {
          const allSlotsUpdated = updateAllSlotsFromReservations(bookedSlots, selectedBarber, barbers);
          setAllSlots(allSlotsUpdated);
          setFormSuccess(true);       
        } 
        else {
          setFormError(result.error as string);
        }
      } 
    } catch {
      setFormError(ErrorMessages.RESERVATION.CREATE_RESERVATION_FAILURE);
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

  if (isLoading) {
    return (
      <div className="text-center my-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-red-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6 px-6">
      <div className="max-w-7xl mx-auto">
        {isMobile ? (
          <MobileBooking barbers={barbers} slots={allSlots} onSelectBarber={setSelectedBarber} onSelectSlot={handleSelectSlotEvent} />
        ) : (
          <DesktopBooking barbers={barbers} slots={allSlots} selectedBarber={selectedBarber} onSelectBarber={setSelectedBarber} 
                          onSelectSlot={handleSelectSlotEvent} date={date} onDateChange={setDate} localizer={localizer} />
        )}

        {showReservationForm && selectedSlot && (
          <BookingForm onSubmit={handleSubmitForm} onCancel={handleFormClose} isLoading={formLoading} 
                       error={formError || undefined} success={formSuccess} />
        )}
      </div>
    </div>
  );
};

export default BookingPage;
