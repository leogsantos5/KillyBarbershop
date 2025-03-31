import { useState } from 'react';
import { DbBookedSlot } from '../../types/booking';
import { usersService } from '../../supabase/usersService';
import { showStatusChangeConfirmation } from '../confirmation-swal';
import { handleServiceCall } from '../../utils/serviceHandler';
import { ErrorMessages } from '../../utils/errorMessages';

interface ManageUsersProps {
  users: { Id: string; Name: string; Phone: string; Status: boolean }[]; reservations: DbBookedSlot[];
  isLoading: boolean; currentPage: number; totalUsers: number; pageSize: number;
  onPageChange: (page: number) => void; onUsersUpdate: () => Promise<void>;
}

export function ManageUsers({ users, reservations, isLoading, currentPage, totalUsers, 
                              pageSize, onPageChange, onUsersUpdate }: ManageUsersProps) {

  const [searchInput, setSearchInput] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onPageChange(1);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch(e);
    }
  };

  const handleToggleUserStatus = async (user: { Id: string; Name: string; Phone: string; Status: boolean }) => {
    const action = user.Status ? 'banir' : 'desbanir';
    const result = await showStatusChangeConfirmation(action, user.Name);
    
    if (result.isConfirmed) {
      await handleServiceCall(
        () => usersService.toggleUserStatus(user.Id, !user.Status),
        user.Status ? ErrorMessages.USER.USER_UNBAN_SUCCESS : ErrorMessages.USER.USER_BAN_SUCCESS,
        ErrorMessages.USER.UPDATE_STATUS_FAILURE, onUsersUpdate);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Gerir Utilizadores</h2>
      
      <div className="bg-white p-4 lg:p-6 rounded-lg shadow">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-6 gap-4">
          <h2 className="text-xl font-semibold">Utilizadores Registados</h2>
          <form onSubmit={handleSearch} className="relative w-full lg:w-64">
            <input type="text" value={searchInput} onChange={(e) => setSearchInput(e.target.value)}
              onKeyPress={handleKeyPress} placeholder="Nome ou telemóvel..."
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button type="submit" className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </form>
        </div>

        {isLoading ? (<div className="text-center py-4">A carregar...</div>) : users.length === 0 ? (
          <div className="text-center py-4 text-gray-500">Nenhum utilizador encontrado</div>
        ) : (
          <>
            <div className="space-y-4">
              {users.map((user) => {
                const userAppointments = reservations.filter(res => res.Users.Id === user.Id).length;
                return (
                  <div key={user.Id} className={`flex flex-col lg:flex-row lg:items-center justify-between p-4 border rounded-lg shadow-sm gap-4
                      ${user.Status ? 'bg-white' : 'bg-gray-50'}`}>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">{user.Name}</h3>
                        {!user.Status && (
                          <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded"> Banido </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">{user.Phone}</p>
                    </div>
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-8">
                      <span className="text-sm text-gray-600">
                        Total de Marcações: <span className="font-bold">{userAppointments}</span>
                      </span>
                      <button
                        onClick={() => handleToggleUserStatus(user)}
                        disabled={isLoading}
                        className={`w-full lg:w-auto px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 ${
                          user.Status ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-green-500 text-white hover:bg-green-600'}`}>
                        {user.Status ? 'Banir' : 'Desbanir'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            <div className="mt-6 flex flex-col sm:flex-row justify-center items-center gap-4">
              <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}
                className="w-full sm:w-auto px-3 py-1 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed">
                Anterior
              </button>
              <span className="px-3 py-1"> Página {currentPage} de {Math.ceil(totalUsers / pageSize)} </span>
              <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage >= Math.ceil(totalUsers / pageSize)}
                className="w-full sm:w-auto px-3 py-1 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed">
                Próxima
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
} 