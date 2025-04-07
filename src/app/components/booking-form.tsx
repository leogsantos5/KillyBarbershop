'use client'; 
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { navigationPages } from '../utils/navigationPages';
import { Barber, Service } from '../types/booking';
import { servicesService } from '../supabase/servicesService';
import { showClientReservationConfirmation as showClientReservationConfirmation } from './confirmation-swal';
import { ErrorMessages } from '../utils/errorMessages';

interface BookingFormProps {
  onSubmit: (formData: { Name: string; Phone: string; ServiceId: string }) => void;
  onCancel: () => void;
  isLoading: boolean;
  error?: string;
  success?: boolean;
  selectedDate: Date;
  selectedBarber?: Barber | null;
}

export function BookingForm({onSubmit, onCancel, isLoading, error, success, selectedDate, selectedBarber}: BookingFormProps) {
  const [formData, setFormData] = useState({Name: '', Phone: '', ServiceId: ''});
  const [services, setServices] = useState<Service[]>([]);
  const [isClosing, setIsClosing] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const loadServices = async () => {
      const { data: servicesData } = await servicesService.fetchAllServices();
      if (servicesData) {
        setServices(servicesData);
      }
    };
    loadServices();
  }, []);

  useEffect(() => {
    if (success) {
      const fadeTimer = setTimeout(() => {  
        setIsClosing(true);
      }, 1000);

      const closeTimer = setTimeout(() => {
        onCancel();
        router.push(navigationPages.find(page => page.name === 'Home')?.href ?? '/');
      }, 2000); 

      return () => {
        clearTimeout(fadeTimer);
        clearTimeout(closeTimer);
      };
    }
  }, [success, onCancel, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.ServiceId) {
      setFormError(ErrorMessages.FORM.REQUIRED_SERVICE);
      return;
    }

    const selectedService = services.find(s => s.Id === formData.ServiceId);
    if (!selectedService) return;

    const formattedDate = selectedDate.toLocaleDateString('pt-PT', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    });
    const formattedTime = selectedDate.toLocaleTimeString('pt-PT', {
      hour: '2-digit',
      minute: '2-digit'
    });

    const result = await showClientReservationConfirmation(selectedService.Name, formattedDate, formattedTime,
                                                     selectedService.Price, selectedBarber?.Name);

    if (result.isConfirmed) {
      onSubmit(formData);
    }
  };

  return (
    <div
      className={`fixed inset-0 bg-black transition-opacity duration-500 flex items-center justify-center p-4 z-50 ${
        isClosing ? 'bg-opacity-0' : 'bg-opacity-50'}`}>
      <div
        className={`bg-white dark:bg-gray-800 rounded-xl p-8 max-w-md w-full transition-all duration-500 z-50 ${
          isClosing ? 'opacity-0 transform translate-y-4' : 'opacity-100 transform translate-y-0'}`}
      >
        <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Nova Reserva</h3>

        {(error || formError) && (
          <div className="mb-4 p-3 text-red-700 bg-red-100 rounded-md text-sm">
            {error || formError}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 text-green-700 bg-green-100 rounded-md text-sm">
            ✓ Reserva confirmada com sucesso!
          </div>
        )}

        {!success && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nome</label>
              <input
                type="text"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 
                bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2"
                value={formData.Name}
                onChange={(e) => setFormData((prev) => ({ ...prev, Name: e.target.value }))}/>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Telemóvel</label>
              <div className="relative mt-1">
                <span className="absolute inset-y-0 left-3 flex items-center text-gray-500 pointer-events-none mr-2">
                  +351
                </span>
                <input
                  type="tel"
                  required
                  pattern="[0-9]{9}"
                  className="pl-14 block w-full rounded-md border border-gray-300 dark:border-gray-600 
                  bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2"
                  value={formData.Phone}
                  onChange={(e) => setFormData((prev) => ({ ...prev, Phone: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Serviço</label>
              <select
                required
                className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 
                bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2"
                value={formData.ServiceId}
                onChange={(e) => setFormData((prev) => ({ ...prev, ServiceId: e.target.value }))}>
                <option value="" disabled>Selecione um serviço</option>
                {services.map((service) => (
                  <option key={service.Id} value={service.Id} title={service.Description}>
                    {service.Name} - {service.Price}€ ({service.Duration} mins)
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-4 mt-6">
              <button type="button" onClick={onCancel}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">
                Cancelar
              </button>
              <button type="submit" disabled={isLoading}
                className="flex-1 px-4 py-2 text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50">
                {isLoading ? 'A Processar...' : 'Reservar'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
