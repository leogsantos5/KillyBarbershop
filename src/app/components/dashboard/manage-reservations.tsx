import { useState, useEffect, useCallback } from 'react';
import { Barber, DbBookedSlot } from '../../types/booking';
import { reservationsService } from '../../supabase/reservationsService';
import { toast } from 'react-hot-toast';
import { showDeleteConfirmation, showReservationConfirmation } from '../confirmation-swal';
import { handleServiceCall } from '../../utils/serviceHandler';
import { ErrorMessages } from '../../utils/errorMessages';
import { filterActiveBarberReservations } from '../../utils/filterReservations';

const OWNER_NAME = process.env.NEXT_PUBLIC_OWNER_NAME?.replace('_', ' ') || "Killy Ross";

interface ManageReservationsProps { barbers: Barber[]; isLoading: boolean; }

export function ManageReservations({ barbers, isLoading }: ManageReservationsProps) {
  const [ownerReservations, setOwnerReservations] = useState<DbBookedSlot[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchBarberReservations = useCallback(async () => {
    try {
      const owner = barbers.find(barber => barber.Name === OWNER_NAME);
      if (!owner && barbers.length > 0) {
        toast.error(ErrorMessages.USER.OWNER_NOT_FOUND);
        return;
      }
      if (!owner) return;
      
      const { success, data } = await reservationsService.fetchBarberReservations(owner.Id);
      if (success && data) {
        const filteredReservations = filterActiveBarberReservations(data, 14, searchTerm);
        setOwnerReservations(filteredReservations);
      }
    } catch {
      toast.error(ErrorMessages.RESERVATION.FETCH_FAILURE);
    }
  }, [barbers, searchTerm]);

  useEffect(() => {
    if (barbers.length > 0) {
      fetchBarberReservations();
    }
  }, [barbers, searchTerm, fetchBarberReservations]);

  const handleConfirmReservation = async (reservationId: string) => {
    const reservation = ownerReservations.find(r => r.Id === reservationId);
    if (!reservation) return;

    const date = new Date(reservation.StartTime);
    const formattedDate = date.toLocaleDateString('pt-PT', { weekday: 'long', month: 'long', day: 'numeric' });
    const formattedTime = date.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });

    const result = await showReservationConfirmation(reservation.Users.Name, formattedDate, formattedTime);

    if (result.isConfirmed) {
      await handleServiceCall(() => reservationsService.confirmReservation(reservationId),
        ErrorMessages.RESERVATION.CONFIRM_SUCCESS, ErrorMessages.RESERVATION.CONFIRM_FAILURE, fetchBarberReservations);
    }
  };

  const handleDeleteReservation = async (reservationId: string) => {
    const result = await showDeleteConfirmation();
    if (result.isConfirmed) {
      await handleServiceCall(() => reservationsService.deleteReservation(reservationId),
        ErrorMessages.RESERVATION.DELETE_SUCCESS, ErrorMessages.RESERVATION.DELETE_FAILURE, fetchBarberReservations);
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
      <h2 className="text-2xl font-bold mb-6">Minhas Marcações</h2>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Marcações Pendentes e Confirmadas</h2>
          <form onSubmit={handleReservationSearch} className="relative">
            <input name="search" type="text" defaultValue={searchTerm} placeholder="Nome ou telemóvel..."
              className="w-64 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <button type="submit" className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </form>
        </div>

        { isLoading ? ( <div className="text-center py-4">A carregar...</div> ) : ownerReservations.length === 0 ? (
          <div className="text-center py-4 text-gray-500">Nenhuma marcação encontrada</div> ) : (
          <div className="space-y-8">
            
            {/* Pending Reservations */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-yellow-800">Marcações Pendentes</h3>
              <div className="space-y-4">
                {ownerReservations.filter(reservation => !reservation.Status).map((reservation) => {
                  const { formattedDate, formattedTime } = formatReservationDate(new Date(reservation.StartTime));
                  return (
                    <div key={reservation.Id} className="flex items-center justify-between p-4 border rounded-lg shadow-sm bg-white">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-lg">{reservation.Users.Name}</h3>
                          <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">Pendente</span>
                        </div>
                        <p className="text-sm text-gray-500">{reservation.Users.Phone}</p>
                        <p className="text-sm text-gray-600 mt-1">{formattedDate} às {formattedTime}</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleConfirmReservation(reservation.Id)} 
                                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 
                                           focus:outline-none focus:ring-2 focus:ring-green-500"> Confirmar </button>
                        <button onClick={() => handleDeleteReservation(reservation.Id)} 
                                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 
                                           focus:outline-none focus:ring-2 focus:ring-red-500">Eliminar</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Confirmed Reservations */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-green-800">Marcações Confirmadas</h3>
              <div className="space-y-4">
                {ownerReservations.filter(reservation => reservation.Status).map((reservation) => {
                  const { formattedDate, formattedTime } = formatReservationDate(new Date(reservation.StartTime));
                  return (
                    <div key={reservation.Id} className="flex items-center justify-between p-4 border rounded-lg shadow-sm bg-white">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-lg">{reservation.Users.Name}</h3>
                          <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">Confirmada</span>
                        </div>
                        <p className="text-sm text-gray-500">{reservation.Users.Phone}</p>
                        <p className="text-sm text-gray-600 mt-1">{formattedDate} às {formattedTime}</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleDeleteReservation(reservation.Id)} 
                                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 
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