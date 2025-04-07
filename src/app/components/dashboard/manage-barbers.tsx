import { useState } from 'react';
import { Barber } from '../../types/booking';
import { barbersService } from '../../supabase/barbersService';
import { toast } from 'react-hot-toast';
import { showDeleteConfirmation, showStatusChangeConfirmation } from '../confirmation-swal';
import { handleServiceCall } from '../../utils/serviceHandler';
import { ErrorMessages } from '../../utils/errorMessages';

interface ManageBarbersProps { barbers: Barber[]; isLoading: boolean; onBarbersUpdate: () => Promise<void>; }

export function ManageBarbers({ barbers, isLoading, onBarbersUpdate }: ManageBarbersProps) {
  const initialBarberState: Barber = { Id: '', Name: '', Phone: '', Password: '', Status: false };
  const [newBarber, setNewBarber] = useState<Barber>(initialBarberState);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleAddBarber = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newBarber.Password !== confirmPassword) {
      toast.error(ErrorMessages.FORM.PASSWORD_NOT_MATCH);
      return;
    }
    
    await handleServiceCall(
      () => barbersService.createBarber(newBarber.Name, newBarber.Password),
      ErrorMessages.BARBER.CREATE_SUCCESS, ErrorMessages.BARBER.CREATE_FAILURE,
      async () => { setNewBarber(initialBarberState); setConfirmPassword(''); await onBarbersUpdate(); }
    );
  };

  const handleDeleteBarber = async (barberId: string) => {
    const result = await showDeleteConfirmation();
    if (result.isConfirmed) {
      await handleServiceCall(
        () => barbersService.deleteBarber(barberId), ErrorMessages.BARBER.DELETE_SUCCESS, 
        ErrorMessages.BARBER.DELETE_FAILURE, onBarbersUpdate);
    }
  };

  const handleToggleBarberStatus = async (barber: Barber) => {
    const action = barber.Status ? 'desativar' : 'ativar';
    const result = await showStatusChangeConfirmation(action, barber.Name);
    
    if (result.isConfirmed) {
      await handleServiceCall(
        () => barbersService.toggleBarberStatus(barber.Id, !barber.Status),
        barber.Status ? ErrorMessages.BARBER.BARBER_DEACTIVATED_SUCCESS : ErrorMessages.BARBER.BARBER_ACTIVATED_SUCCESS,
        ErrorMessages.BARBER.UPDATE_STATUS_FAILURE, onBarbersUpdate
      );
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Gerir Barbeiros</h2>
      
      {/* Add Barber Form */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Adicionar Novo Barbeiro</h2>
        <form onSubmit={handleAddBarber} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome</label>
              <input type="text" value={newBarber.Name} onChange={(e) => setNewBarber({ ...newBarber, Name: e.target.value })} 
                     placeholder="Nome do barbeiro" required 
                     className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500
                              dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Telemóvel</label>
              <input type="tel" value={newBarber.Phone} onChange={(e) => setNewBarber({ ...newBarber, Phone: e.target.value })} 
                     placeholder="Número de telemóvel" required 
                     className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500
                              dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password Inicial</label>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} value={newBarber.Password} 
                       onChange={(e) => setNewBarber({ ...newBarber, Password: e.target.value })} 
                       placeholder="Definir password inicial" required 
                       className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500
                                dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} 
                        className="absolute inset-y-0 right-0 flex items-center pr-3">
                  {showPassword ? (
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirmar Password</label>
              <div className="relative">
                <input type={showConfirmPassword ? "text" : "password"} value={confirmPassword} 
                       onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirmar password inicial" 
                       required 
                       className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500
                                dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400" />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} 
                        className="absolute inset-y-0 right-0 flex items-center pr-3">
                  {showConfirmPassword ? (
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
          <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50" disabled={isLoading}>
            {isLoading ? 'A adicionar...' : 'Adicionar Barbeiro'}
          </button>
        </form>
      </div>

      {/* Barbers List */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Barbeiros Atuais</h2>
        {isLoading ? (
          <div className="text-center py-4 text-gray-900 dark:text-white">A carregar...</div>
        ) : barbers.length === 0 ? (
          <div className="text-center py-4 text-gray-500 dark:text-gray-400">Nenhum barbeiro encontrado</div>
        ) : (
          <div className="space-y-4">
            {barbers.map((barber) => (
              <div key={barber.Id} className={`flex flex-col lg:flex-row lg:items-center justify-between p-4 border rounded-lg shadow-sm gap-4
                  ${barber.Status ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700/50'} dark:border-gray-700`}>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{barber.Name}</h3>
                    {!barber.Status && (
                      <span className="px-2 py-1 text-xs bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 rounded"> Inativo </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{barber.Phone}</p>
                </div>
                <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-8">
                  <div className="flex gap-2 w-full lg:w-auto">
                    <button
                      onClick={() => handleToggleBarberStatus(barber)}
                      disabled={isLoading}
                      className={`flex-1 lg:flex-none px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 ${
                        barber.Status ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-green-500 text-white hover:bg-green-600'}`}>
                      {barber.Status ? 'Desativar' : 'Ativar'}
                    </button>
                    <button
                      onClick={() => handleDeleteBarber(barber.Id)}
                      disabled={isLoading}
                      className="flex-1 lg:flex-none px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50">
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 