'use client'

import { useState, useEffect, useCallback } from 'react'
import { barbersService } from '../supabase/barbersService'
import { reservationsService } from '../supabase/reservationsService'
import { usersService } from '../supabase/usersService'
import { Barber, DbBookedSlot } from '../types/booking'
import { ErrorMessages } from '../utils/errorMessages'
import StatisticsGraph, { TimePeriod, DrillDownState } from '../components/statistics-graph'
import { Toaster, toast } from 'react-hot-toast'
import Swal from 'sweetalert2'
import { OWNER_NAME } from '../utils/navigationPages'

export default function OwnerDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [activeTab, setActiveTab] = useState<'revenue' | 'appointments' | 'barbers' | 'users' | 'my-reservations'>('my-reservations')
  const [newBarber, setNewBarber] = useState<Barber>({ Id: '', Name: '', Phone: '', Password: '', Status: false })
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [barbers, setBarbers] = useState<Barber[]>([])
  const [users, setUsers] = useState<{ Id: string; Name: string; Phone: string; Status: boolean }[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [reservations, setReservations] = useState<DbBookedSlot[]>([])
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('yearly')
  const [drillDown, setDrillDown] = useState<DrillDownState>({})
  const [selectedBarberId, setSelectedBarberId] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalUsers, setTotalUsers] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const pageSize = 10
  const [ownerReservations, setOwnerReservations] = useState<DbBookedSlot[]>([])
  const [reservationSearchTerm, setReservationSearchTerm] = useState('')
  const [reservationSearchInput, setReservationSearchInput] = useState('')

  const fetchUsers = useCallback(async () => {
    setIsLoading(true)
    const { success, data, total } = await usersService.fetchAllUsers(currentPage, pageSize, searchTerm)
    if (success && data) {
      setUsers(data)
      setTotalUsers(total || 0)
    } else {
      console.error(ErrorMessages.USER.FETCH_FAILURE)
    }
    setIsLoading(false)
  }, [currentPage, pageSize, searchTerm])

  useEffect(() => {
    fetchAllBarbers()
    fetchReservations()
    fetchUsers()
    // Scroll down a bit to hide header and navbar
    window.scrollTo(0, 90)
  }, [fetchUsers])

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers()
    }
  }, [currentPage, searchTerm, activeTab, fetchUsers])

  const fetchAllBarbers = async () => {
    const { success, data } = await barbersService.fetchAllBarbers()
    if (success && data) {
      setBarbers(data)
    } else {
      console.error(ErrorMessages.BARBER.FETCH_FAILURE)
    }
    setIsLoading(false)
  }

  const fetchReservations = async () => {
    const { success, data } = await reservationsService.fetchConfirmedReservations()
    if (success && data) {
      setReservations(data)
    } else {
      console.error(ErrorMessages.RESERVATION.FETCH_FAILURE)
    }
  }

  const fetchBarberReservations = useCallback(async () => {
    setIsLoading(true)
    try {
      // Find the owner's ID from the barbers list
      const owner = barbers.find(barber => barber.Name === OWNER_NAME)
      if (!owner && barbers.length > 0) {
        toast.error('Erro ao encontrar o proprietário')
        return
      }
      if (!owner) {
        return
      }
      const { success, data } = await reservationsService.fetchBarberReservations(owner.Id)
      if (success && data) {
        // Filter reservations to only show current and next week
        const now = new Date()
        const nextWeek = new Date(now)
        nextWeek.setDate(now.getDate() + 14) // 2 weeks from now

        const filteredReservations = data.filter(reservation => {
          const reservationDate = new Date(reservation.StartTime)
          return reservationDate >= now && reservationDate <= nextWeek
        })

        // Filter by search term if exists
        if (reservationSearchTerm) {
          const searchLower = reservationSearchTerm.toLowerCase()
          return filteredReservations.filter(reservation => 
            reservation.Users.Name.toLowerCase().includes(searchLower) ||
            reservation.Users.Phone.includes(searchLower)
          )
        }

        setOwnerReservations(filteredReservations)
      }
    } catch (error) {
      console.error('Error fetching barber reservations:', error)
      toast.error('Erro ao carregar as marcações')
    } finally {
      setIsLoading(false)
    }
  }, [barbers, reservationSearchTerm])

  useEffect(() => {
    if (activeTab === 'my-reservations') {
      fetchBarberReservations()
    }
  }, [activeTab, reservationSearchTerm, fetchBarberReservations])

  const handleAddBarber = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newBarber.Password !== confirmPassword) {
      toast.error('As passwords não coincidem!')
      return
    }
    setIsLoading(true)
    
    try {
      const result = await barbersService.createBarber(newBarber)
      if (result.success) {
        toast.success('Barbeiro adicionado com sucesso!')
        setNewBarber({ Id: '', Name: '', Phone: '', Password: '', Status: false })
        setConfirmPassword('')
        await fetchAllBarbers()
      } else {
        toast.error(ErrorMessages.BARBER.CREATE_FAILURE)
      }
    } catch {
      toast.error(ErrorMessages.BARBER.CREATE_FAILURE)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteBarber = async (barberId: string) => {
    const result = await Swal.fire({
      title: 'Tem a certeza?',
      text: "Esta ação não pode ser desfeita!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sim!',
      cancelButtonText: 'Cancelar'
    })
    
    if (result.isConfirmed) {
      setIsLoading(true)
      
      try {
        const result = await barbersService.deleteBarber(barberId)
        if (result.success) {
          toast.success('Barbeiro eliminado com sucesso!')
          await fetchAllBarbers()
        } else {
          toast.error(ErrorMessages.BARBER.DELETE_FAILURE)
        }
      } catch {
        toast.error(ErrorMessages.BARBER.DELETE_FAILURE)
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleToggleBarberStatus = async (barber: Barber) => {
    const action = barber.Status ? 'desativar' : 'ativar'
    const result = await Swal.fire({
      title: `Deseja ${action} o barbeiro?`,
      text: `Tem certeza que deseja ${action} ${barber.Name}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: `Sim, ${action}!`,
      cancelButtonText: 'Cancelar'
    })
    
    if (result.isConfirmed) {
      setIsLoading(true)
      
      try {
        const result = await barbersService.toggleBarberStatus(barber.Id, !barber.Status)
        if (result.success && barber.Status) {
          toast.success(`Barbeiro desativado com sucesso!`)
          await fetchAllBarbers()
        } else if (result.success && !barber.Status) {
          toast.success(`Barbeiro ativado com sucesso!`)
          await fetchAllBarbers()
        } else {
          toast.error(ErrorMessages.BARBER.UPDATE_STATUS_FAILURE)
        }
      } catch {
        toast.error(ErrorMessages.BARBER.UPDATE_STATUS_FAILURE)
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleToggleUserStatus = async (user: { Id: string; Name: string; Phone: string; Status: boolean }) => {
    const action = user.Status ? 'banir' : 'desbanir'
    const result = await Swal.fire({
      title: `Deseja ${action} o utilizador?`,
      text: `Tem certeza que deseja ${action} ${user.Name}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: `Sim!`,
      cancelButtonText: 'Cancelar'
    })
    
    if (result.isConfirmed) {
      setIsLoading(true)
      
      try {
        const result = await usersService.toggleUserStatus(user.Id, !user.Status)
        if (result.success && user.Status) {
          toast.success(`Utilizador desbanido com sucesso!`)
          await fetchUsers()
        } else if (result.success && !user.Status) {
          toast.success(`Utilizador banido com sucesso!`)
          await fetchUsers()
        } else {
          toast.error(ErrorMessages.USER.UPDATE_STATUS_FAILURE)
        }
      } catch {
        toast.error(ErrorMessages.USER.UPDATE_STATUS_FAILURE)
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleDrillDown = (newState: { year?: number; month?: number; week?: number }) => {
    setDrillDown(newState);
    // Update time period based on drill down level
    if (newState.year && newState.month === undefined) {
      setTimePeriod('monthly');
    } else if (newState.year && newState.month !== undefined) {
      setTimePeriod('weekly');
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearchTerm(searchInput)
    setCurrentPage(1) // Reset to first page when searching
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch(e)
    }
  }

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
  }

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === 'admin123') { // You should change this to a more secure password
      setIsAuthenticated(true)
    } else {
      toast.error('Password incorreta!')
    }
  }

  const handleReservationSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setReservationSearchTerm(reservationSearchInput)
  }

  const handleConfirmReservation = async (reservationId: string) => {
    const reservation = ownerReservations.find(r => r.Id === reservationId);
    if (!reservation) return;

    const date = new Date(reservation.StartTime);
    const formattedDate = date.toLocaleDateString('pt-PT', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    });
    const formattedTime = date.toLocaleTimeString('pt-PT', {
      hour: '2-digit',
      minute: '2-digit'
    });

    const result = await Swal.fire({
      title: 'Confirmar Marcação',
      html: `Tem certeza que deseja confirmar a marcação de:<br>
             <strong>${reservation.Users.Name}</strong><br>
             para <strong>${formattedDate}</strong><br>
             às <strong>${formattedTime}</strong>?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sim, confirmar!',
      cancelButtonText: 'Cancelar',
      width: '400px'
    });

    if (result.isConfirmed) {
      try {
        const result = await reservationsService.confirmReservation(reservationId);
        if (result.success) {
          toast.success('Marcação confirmada com sucesso!');
          fetchBarberReservations();
        } else {
          toast.error('Erro ao confirmar a marcação');
        }
      } catch {
        toast.error('Erro ao confirmar a marcação');
      }
    }
  };

  const handleDeleteReservation = async (reservationId: string) => {
    const result = await Swal.fire({
      title: 'Tem a certeza?',
      text: "Esta ação não pode ser desfeita!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sim!',
      cancelButtonText: 'Cancelar'
    })
    
    if (result.isConfirmed) {
      try {
        const result = await reservationsService.deleteReservation(reservationId)
        if (result.success) {
          toast.success('Marcação eliminada com sucesso!')
          fetchBarberReservations()
        } else {
          toast.error('Erro ao eliminar a marcação')
        }
      } catch {
        toast.error('Erro ao eliminar a marcação')
      }
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md w-96">
          <h2 className="text-2xl font-bold mb-6 text-center">Painel de Controlo</h2>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Insira a password"
                required
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button 
              type="submit" 
              className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Entrar
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 min-h-screen bg-white shadow-md">
          <div className="p-4">
            <h2 className="text-xl font-bold mb-6">Painel de Controlo</h2>
            <nav className="space-y-2">
              <button
                onClick={() => setActiveTab('my-reservations')}
                className={`w-full p-2 text-left rounded ${
                  activeTab === 'my-reservations' ? 'bg-blue-100 text-blue-600' : ''
                }`}
              >
                Gerir Marcações
              </button>
              <button
                onClick={() => setActiveTab('barbers')}
                className={`w-full p-2 text-left rounded ${
                  activeTab === 'barbers' ? 'bg-blue-100 text-blue-600' : ''
                }`}
              >
                Gerir Barbeiros
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`w-full p-2 text-left rounded ${
                  activeTab === 'users' ? 'bg-blue-100 text-blue-600' : ''
                }`}
              >
                Gerir Utilizadores
              </button>
              <button
                onClick={() => setActiveTab('revenue')}
                className={`w-full p-2 text-left rounded ${
                  activeTab === 'revenue' ? 'bg-blue-100 text-blue-600' : ''
                }`}
              >
                Faturação
              </button>
              <button
                onClick={() => setActiveTab('appointments')}
                className={`w-full p-2 text-left rounded ${
                  activeTab === 'appointments' ? 'bg-blue-100 text-blue-600' : ''
                }`}
              >
                Número de Marcações
              </button>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          {isLoading ? (
            <div className="flex items-center justify-center mb-20 min-h-[calc(100vh-4rem)]">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-red-600 border-t-transparent"></div>
            </div>
          ) : (
            <>
              {activeTab === 'revenue' && (
                <div className="bg-white p-6 rounded-lg shadow">
                  <StatisticsGraph 
                    reservations={reservations} 
                    timePeriod={timePeriod}
                    drillDown={drillDown}
                    onDrillDown={handleDrillDown}
                    setTimePeriod={setTimePeriod}
                    setDrillDown={setDrillDown}
                    type="revenue"
                    barbers={barbers}
                    selectedBarberId={selectedBarberId}
                    onBarberSelect={setSelectedBarberId}
                  />
                </div>
              )}

              {activeTab === 'appointments' && (
                <div className="bg-white p-6 rounded-lg shadow">
                  <StatisticsGraph 
                    reservations={reservations} 
                    timePeriod={timePeriod}
                    drillDown={drillDown}
                    onDrillDown={handleDrillDown}
                    setTimePeriod={setTimePeriod}
                    setDrillDown={setDrillDown}
                    type="appointments"
                    barbers={barbers}
                    selectedBarberId={selectedBarberId}
                    onBarberSelect={setSelectedBarberId}
                  />
                </div>
              )}

              {activeTab === 'users' && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">Gerir Utilizadores</h2>
                  
                  {/* Users List */}
                  <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-semibold">Utilizadores Registados</h2>
                      <form onSubmit={handleSearch} className="relative">
                        <input
                          type="text"
                          value={searchInput}
                          onChange={(e) => setSearchInput(e.target.value)}
                          onKeyPress={handleKeyPress}
                          placeholder="Nome ou telemóvel..."
                          className="w-64 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          type="submit"
                          className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
                        >
                          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        </button>
                      </form>
                    </div>

                    {isLoading ? (
                      <div className="text-center py-4">A carregar...</div>
                    ) : users.length === 0 ? (
                      <div className="text-center py-4 text-gray-500">Nenhum utilizador encontrado</div>
                    ) : (
                      <>
                        <div className="space-y-4">
                          {users.map((user) => {
                            const userAppointments = reservations.filter(res => res.Users.Id === user.Id).length;
                            return (
                              <div 
                                key={user.Id} 
                                className={`flex items-center justify-between p-4 border rounded-lg shadow-sm
                                  ${user.Status ? 'bg-white' : 'bg-gray-50'}`}
                              >
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h3 className="font-semibold text-lg">{user.Name}</h3>
                                    {!user.Status && (
                                      <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded">
                                        Banido
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-500">{user.Phone}</p>
                                </div>
                                <div className="flex items-center gap-8">
                                  <span className="text-sm text-gray-600">
                                    Total de Marcações: <span className="font-bold">{userAppointments}</span>
                                  </span>
                                  <button
                                    onClick={() => handleToggleUserStatus(user)}
                                    disabled={isLoading}
                                    className={`px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 ${
                                      user.Status ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-green-500 text-white hover:bg-green-600'}`}>
                                    {user.Status ? 'Banir' : 'Desbanir'}
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Pagination */}
                        <div className="mt-6 flex justify-center items-center gap-2">
                          <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="px-3 py-1 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Anterior
                          </button>
                          <span className="px-3 py-1">
                            Página {currentPage} de {Math.ceil(totalUsers / pageSize)}
                          </span>
                          <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage >= Math.ceil(totalUsers / pageSize)}
                            className="px-3 py-1 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Próxima
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'barbers' && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">Gerir Barbeiros</h2>
                  
                  {/* Add Barber Form */}
                  <div className="bg-white p-6 rounded-lg shadow mb-8">
                    <h2 className="text-xl font-semibold mb-4">Adicionar Novo Barbeiro</h2>
                    <form onSubmit={handleAddBarber} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nome
                          </label>
                          <input
                            type="text"
                            value={newBarber.Name}
                            onChange={(e) => setNewBarber({ ...newBarber, Name: e.target.value })}
                            placeholder="Nome do barbeiro"
                            required
                            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Telemóvel
                          </label>
                          <input
                            type="tel"
                            value={newBarber.Phone}
                            onChange={(e) => setNewBarber({ ...newBarber, Phone: e.target.value })}
                            placeholder="Número de telemóvel"
                            required
                            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Password Inicial
                          </label>
                          <div className="relative">
                            <input
                              type={showPassword ? "text" : "password"}
                              value={newBarber.Password}
                              onChange={(e) => setNewBarber({ ...newBarber, Password: e.target.value })}
                              placeholder="Definir password inicial"
                              required
                              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute inset-y-0 right-0 flex items-center pr-3"
                            >
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
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Confirmar Password
                          </label>
                          <div className="relative">
                            <input
                              type={showConfirmPassword ? "text" : "password"}
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              placeholder="Confirmar password inicial"
                              required
                              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute inset-y-0 right-0 flex items-center pr-3"
                            >
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
                      <button 
                        type="submit" 
                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                        disabled={isLoading}
                      >
                        {isLoading ? 'A adicionar...' : 'Adicionar Barbeiro'}
                      </button>
                    </form>
                  </div>

                  {/* Barbers List */}
                  <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-xl font-semibold mb-4">Barbeiros Atuais</h2>
                    {isLoading ? (
                      <div className="text-center py-4">A carregar...</div>
                    ) : barbers.length === 0 ? (
                      <div className="text-center py-4 text-gray-500">Nenhum barbeiro encontrado</div>
                    ) : (
                      <div className="space-y-4">
                        {barbers.map((barber) => (
                          <div 
                            key={barber.Id} 
                            className={`flex items-center justify-between p-4 border rounded-lg shadow-sm
                              ${barber.Status ? 'bg-white' : 'bg-gray-50'}`}
                          >
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-lg">{barber.Name}</h3>
                                {!barber.Status && (
                                  <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">
                                    Inativo
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-500">{barber.Phone}</p>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleToggleBarberStatus(barber)}
                                disabled={isLoading}
                                className={`px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 ${
                                  barber.Status  ? 'bg-gray-200 hover:bg-gray-300' : 'bg-blue-500 text-white hover:bg-blue-600'}`}>
                                {barber.Status ? 'Desativar' : 'Ativar'}
                              </button>
                              <button
                                onClick={() => handleDeleteBarber(barber.Id)}
                                disabled={isLoading}
                                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50">
                                Eliminar
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'my-reservations' && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">Minhas Marcações</h2>
                  
                  {/* Reservations List */}
                  <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-semibold">Marcações Pendentes e Confirmadas</h2>
                      <form onSubmit={handleReservationSearch} className="relative">
                        <input
                          type="text"
                          value={reservationSearchInput}
                          onChange={(e) => setReservationSearchInput(e.target.value)}
                          placeholder="Nome ou telemóvel..."
                          className="w-64 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          type="submit"
                          className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
                        >
                          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        </button>
                      </form>
                    </div>

                    {isLoading ? (
                      <div className="text-center py-4">A carregar...</div>
                    ) : ownerReservations.length === 0 ? (
                      <div className="text-center py-4 text-gray-500">Nenhuma marcação encontrada</div>
                    ) : (
                      <div className="space-y-8">
                        {/* Pending Reservations */}
                        <div>
                          <h3 className="text-lg font-semibold mb-4 text-yellow-800">Marcações Pendentes</h3>
                          <div className="space-y-4">
                            {ownerReservations
                              .filter(reservation => !reservation.Status)
                              .map((reservation) => {
                                const date = new Date(reservation.StartTime)
                                const formattedDate = date.toLocaleDateString('pt-PT', {
                                  weekday: 'long',
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })
                                const formattedTime = date.toLocaleTimeString('pt-PT', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })

                                return (
                                  <div 
                                    key={reservation.Id} 
                                    className="flex items-center justify-between p-4 border rounded-lg shadow-sm bg-white"
                                  >
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <h3 className="font-semibold text-lg">{reservation.Users.Name}</h3>
                                        <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">
                                          Pendente
                                        </span>
                                      </div>
                                      <p className="text-sm text-gray-500">{reservation.Users.Phone}</p>
                                      <p className="text-sm text-gray-600 mt-1">
                                        {formattedDate} às {formattedTime}
                                      </p>
                                    </div>
                                    <div className="flex gap-2">
                                      <button
                                        onClick={() => handleConfirmReservation(reservation.Id)}
                                        className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
                                      >
                                        Confirmar
                                      </button>
                                      <button
                                        onClick={() => handleDeleteReservation(reservation.Id)}
                                        className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                                      >
                                        Eliminar
                                      </button>
                                    </div>
                                  </div>
                                )
                              })}
                          </div>
                        </div>

                        {/* Confirmed Reservations */}
                        <div>
                          <h3 className="text-lg font-semibold mb-4 text-green-800">Marcações Confirmadas</h3>
                          <div className="space-y-4">
                            {ownerReservations
                              .filter(reservation => reservation.Status)
                              .map((reservation) => {
                                const date = new Date(reservation.StartTime)
                                const formattedDate = date.toLocaleDateString('pt-PT', {
                                  weekday: 'long',
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })
                                const formattedTime = date.toLocaleTimeString('pt-PT', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })

                                return (
                                  <div 
                                    key={reservation.Id} 
                                    className="flex items-center justify-between p-4 border rounded-lg shadow-sm bg-white"
                                  >
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <h3 className="font-semibold text-lg">{reservation.Users.Name}</h3>
                                        <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                                          Confirmada
                                        </span>
                                      </div>
                                      <p className="text-sm text-gray-500">{reservation.Users.Phone}</p>
                                      <p className="text-sm text-gray-600 mt-1">
                                        {formattedDate} às {formattedTime}
                                      </p>
                                    </div>
                                    <div className="flex gap-2">
                                      <button
                                        onClick={() => handleDeleteReservation(reservation.Id)}
                                        className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                                      >
                                        Eliminar
                                      </button>
                                    </div>
                                  </div>
                                )
                              })}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
