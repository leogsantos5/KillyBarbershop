'use client'; 
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { navigationPages } from '../utils/navigationPages';
import Swal from 'sweetalert2';
import { Barber } from '../types/booking';

interface BookingFormProps {
  onSubmit: (formData: { Name: string; Phone: string }) => void;
  onCancel: () => void;
  isLoading: boolean;
  error?: string;
  success?: boolean;
  selectedDate: Date;
  selectedBarber?: Barber | null;
}

export function BookingForm({onSubmit, onCancel, isLoading, error, success, selectedDate, selectedBarber}: BookingFormProps) {
  const [formData, setFormData] = useState({Name: '', Phone: ''});
  const [isClosing, setIsClosing] = useState(false);
  const router = useRouter();

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
    
    const formattedDate = selectedDate.toLocaleDateString('pt-PT', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    });
    const formattedTime = selectedDate.toLocaleTimeString('pt-PT', {
      hour: '2-digit',
      minute: '2-digit'
    });

    const barberText = selectedBarber ? ` com ${selectedBarber.Name}` : '';

    const result = await Swal.fire({
      title: 'Confirmar Reserva',
      html: `Tem a certeza que deseja fazer uma reserva para:<br> <strong>${formattedDate}</strong><br>
             às <strong>${formattedTime}</strong>${barberText}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sim, reservar!',
      cancelButtonText: 'Cancelar',
      width: '400px'
    });

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

        {error && (
          <div className="mb-4 p-3 text-red-700 bg-red-100 rounded-md text-sm">
            {error}
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

            <div className="flex gap-4 mt-6">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isLoading}
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
