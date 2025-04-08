import { useState, useEffect, useCallback } from 'react';
import { Reservation } from '../../types/booking';
import { reservationsService } from '../../supabase/reservationsService';
import { toast } from 'react-hot-toast';
import { showDeleteConfirmation, showReservationBarberConfirmation } from '../confirmation-swal';
import { handleServiceCall } from '../../utils/serviceHandler';
import { ErrorMessages } from '../../utils/errorMessages';
import { filterActiveBarberReservations } from '../../utils/filterReservations';
import { Role } from '@/app/utils/checkTokenRole';
import { checkTokenRole } from '@/app/utils/checkTokenRole';
import { useRouter } from 'next/navigation';

interface ManageReservationsProps { 
  isLoading: boolean;
  currentBarberId: string;
}

export function ManageReservations({ isLoading, currentBarberId } : ManageReservationsProps) {
  const router = useRouter();

  const [barberPendingReservations, setBarberPendingReservations] = useState<Reservation[]>([]);
  const [barberConfirmedReservations, setBarberConfirmedReservations] = useState<Reservation[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchBarberReservations = useCallback(async () => {
    try {
      const { success, data } = await reservationsService.fetchBarberReservations(currentBarberId);

      if (success && data) {
        const filteredReservations = filterActiveBarberReservations(data, 14, searchTerm);
        setBarberPendingReservations(filteredReservations.filter(res => !res.Status));
        setBarberConfirmedReservations(filteredReservations.filter(res => res.Status));
      } 
    } catch {
      toast.error(ErrorMessages.RESERVATION.FETCH_FAILURE);
    }
  }, [currentBarberId, searchTerm]);

  useEffect(() => {
    if (currentBarberId) {
      fetchBarberReservations();
    }
  }, [currentBarberId, searchTerm, fetchBarberReservations]);

  const handleConfirmReservation = async (reservation: Reservation) => {
    if (!reservation) return;
      const confirmation = await showReservationBarberConfirmation(
        reservation.Users.Name, reservation.Services.Name, Number(reservation.Services.Price),
        new Date(reservation.StartTime).toLocaleDateString('pt-PT'),
        new Date(reservation.StartTime).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })
      );

      if (confirmation.isConfirmed) {

        if (!checkTokenRole(Role.BARBER)) {
          toast.error(ErrorMessages.AUTH.UNAUTHORIZED);
          router.push('/secret-login');
          return; // Stop if not authorized
        }

        const result = await handleServiceCall(() => reservationsService.confirmReservation(reservation.Id), 
          ErrorMessages.RESERVATION.CONFIRM_BARBER_SUCCESS, ErrorMessages.RESERVATION.CONFIRM_FAILURE
        );

        if (result.success) await fetchBarberReservations();
      }
  };

  const handleDeleteReservation = async (reservationId: string) => {
    const resultConfirmation = await showDeleteConfirmation();
    if (resultConfirmation.isConfirmed) {

      if (!checkTokenRole(Role.BARBER)) {
        toast.error(ErrorMessages.AUTH.UNAUTHORIZED);
        router.push('/secret-login');
        return; // Stop if not authorized
      }

      const result = await handleServiceCall(
        () => reservationsService.deleteReservation(reservationId),
        ErrorMessages.RESERVATION.DELETE_SUCCESS, 
        ErrorMessages.RESERVATION.DELETE_FAILURE
      );  

      if (result.success) await fetchBarberReservations();
    }
  };

  const handleReservationSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setSearchTerm(formData.get('search') as string);
  };

  const formatReservationDate = (date: Date) => {
    const formattedDate = date.toLocaleDateString('pt-PT', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const formattedTime = date.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
    return { formattedDate, formattedTime };
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Minhas Marcações</h2>
      
      <div className="bg-white dark:bg-gray-800 p-4 lg:p-6 rounded-lg shadow">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-6 gap-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Marcações Pendentes e Confirmadas</h2>
          <form onSubmit={handleReservationSearch} className="relative w-full lg:w-64">
            <input name="search" type="text" defaultValue={searchTerm} placeholder="Nome ou telemóvel..."
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 
                       dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400" />
            <button type="submit" className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </form>
        </div>

        {isLoading ? (
          <div className="text-center py-4 text-gray-900 dark:text-white">A carregar...</div>
        ) : (
          <div className="space-y-8">
            {/* Pending Reservations */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-yellow-800 dark:text-yellow-400">Marcações Pendentes</h3>
              {barberPendingReservations.length === 0 ? (
                <div className="flex items-center justify-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <svg className="w-5 h-5 text-blue-500 dark:text-blue-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-gray-600 dark:text-gray-300">Não existem marcações à espera de confirmação.</span>
                </div>
              ) : (
                <div className="space-y-4">
                  {barberPendingReservations
                    .sort((a, b) => new Date(a.StartTime).getTime() - new Date(b.StartTime).getTime())
                    .map((reservation) => {
                      const { formattedDate, formattedTime } = formatReservationDate(new Date(reservation.StartTime));
                      return (
                        <div key={reservation.Id} className="flex flex-col lg:flex-row lg:items-center justify-between p-4 border rounded-lg shadow-sm bg-white dark:bg-gray-800 dark:border-gray-700 gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{reservation.Users.Name}</h3>
                              <span className="px-2 py-1 text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 rounded">Pendente</span>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{reservation.Users.Phone}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{formattedDate} às {formattedTime}</p>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => handleConfirmReservation(reservation)} 
                                    className="flex-1 lg:flex-none px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 
                                               focus:outline-none focus:ring-2 focus:ring-green-500"> Confirmar </button>
                            <button onClick={() => handleDeleteReservation(reservation.Id)} 
                                    className="flex-1 lg:flex-none px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 
                                               focus:outline-none focus:ring-2 focus:ring-red-500">Eliminar</button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>

            {/* Confirmed Reservations */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-green-800 dark:text-green-400">Marcações Confirmadas</h3>
              <div className="space-y-4">
                {barberConfirmedReservations
                  .sort((a, b) => new Date(b.StartTime).getTime() - new Date(a.StartTime).getTime())
                  .map((reservation) => {
                    const { formattedDate, formattedTime } = formatReservationDate(new Date(reservation.StartTime));
                    return (
                      <div key={reservation.Id} className="flex flex-col lg:flex-row lg:items-center justify-between p-4 border rounded-lg shadow-sm bg-white dark:bg-gray-800 dark:border-gray-700 gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{reservation.Users.Name}</h3>
                            <span className="px-2 py-1 text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 rounded">Confirmada</span>
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{reservation.Users.Phone}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{formattedDate} às {formattedTime}</p>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => handleDeleteReservation(reservation.Id)} 
                                  className="flex-1 lg:flex-none px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 
                                  focus:outline-none focus:ring-2 focus:ring-red-500">Eliminar</button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 