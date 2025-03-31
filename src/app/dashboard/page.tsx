'use client'

import { useState, useEffect, useCallback } from 'react'
import { barbersService } from '../supabase/barbersService'
import { reservationsService } from '../supabase/reservationsService'
import { usersService } from '../supabase/usersService'
import { authService } from '../supabase/authService'
import { Barber, DbBookedSlot } from '../types/booking'
import StatisticsGraph from '../components/dashboard/statistics-graph'
import { Toaster, toast } from 'react-hot-toast'
import { ManageReservations } from '../components/dashboard/manage-reservations'
import { ManageBarbers } from '../components/dashboard/manage-barbers'
import { ManageUsers } from '../components/dashboard/manage-users'
import { TimePeriod, DrillDownState, ActiveTab } from '../types/dashboard'
import { useRouter } from 'next/navigation'

const tabs: { activeTab: ActiveTab; label: string }[] = [
  { activeTab: 'my-reservations', label: 'Gerir Marcações' },
  { activeTab: 'barbers', label: 'Gerir Barbeiros' },
  { activeTab: 'users', label: 'Gerir Utilizadores' },
  { activeTab: 'revenue', label: 'Faturação' },
  { activeTab: 'appointments', label: 'Número de Marcações' }
];

export default function Dashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<ActiveTab>('my-reservations')
  const [barbers, setBarbers] = useState<Barber[]>([])
  const [users, setUsers] = useState<{ Id: string; Name: string; Phone: string; Status: boolean }[]>([])
  const [reservations, setReservations] = useState<DbBookedSlot[]>([])
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('yearly')
  const [drillDown, setDrillDown] = useState<DrillDownState>({})
  const [selectedBarberId, setSelectedBarberId] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalUsers, setTotalUsers] = useState(0)
  const [isOwner, setIsOwner] = useState(false)
  const pageSize = 10
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await authService.checkSession();
        if (response.error) {
          setIsAuthenticated(false);
          return;
        }
        setIsAuthenticated(true);
        setIsOwner(response.isOwner);
        setSelectedBarberId(response.barberId);
        // If it's a barber view, set the drillDown to show their data
        if (!response.isOwner && response.barberId) {
          setDrillDown({ barberId: response.barberId });
        }
      } catch {
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  useEffect(() => {
    const fetchBarbers = async () => {
      const { success, data } = await barbersService.fetchAllBarbers();
      if (success && data) {
        setBarbers(data);
      }
    };

    if (isAuthenticated) {
      fetchBarbers();
    }
  }, [isAuthenticated]);

  // Filter tabs based on user type
  const availableTabs = tabs.filter(tab => 
    isOwner || ['my-reservations', 'revenue', 'appointments'].includes(tab.activeTab)
  )

  const fetchUsers = useCallback(async () => {
    setIsLoading(true)
    const { success, data, total } = await usersService.fetchAllUsers(currentPage, pageSize)
    if (success && data) {
      setUsers(data)
      setTotalUsers(total || 0)
    } 
    setIsLoading(false)
  }, [currentPage, pageSize])

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
  }, [currentPage, activeTab, fetchUsers])

  const fetchAllBarbers = async () => {
    const { success, data } = await barbersService.fetchAllBarbers()
    if (success && data) {
      setBarbers(data)
    } 
    setIsLoading(false)
  }

  const fetchReservations = async () => {
    const { success, data } = await reservationsService.fetchConfirmedReservations()
    if (success && data) {
      setReservations(data)
    } 
  }

  const handleDrillDown = (newState: DrillDownState) => {
    setDrillDown(newState);
    // Update time period based on drill down level
    if (newState.year && newState.month === undefined) {
      setTimePeriod('monthly');
    } else if (newState.year && newState.month !== undefined) {
      setTimePeriod('weekly');
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-red-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md w-96">
          <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Área Reservada</h2>
          <form onSubmit={async (e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const response = await authService.signIn(formData.get('name') as string, formData.get('password') as string);
            if (response.error) { toast.error(response.error); return; }
            setIsAuthenticated(true); setIsOwner(response.isOwner); setSelectedBarberId(response.barberId);
          }} className="space-y-4">
            
            <div><input type="text" name="name" className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="Nome"/></div>
            <div><input type="password" name="password" className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="Password"/></div>
            <button type="submit" className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500">Entrar</button>
          </form>
        </div>
      </div>
    );
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
              {availableTabs.map(tab => (
                <button key={tab.activeTab} onClick={() => setActiveTab(tab.activeTab)}
                  className={`w-full p-2 text-left rounded ${activeTab === tab.activeTab ? 'bg-blue-100 text-blue-600' : ''}`}>
                  {tab.label}
                </button>
              ))}
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
                  <StatisticsGraph reservations={isOwner ? reservations : reservations.filter(r => r.Barbers.Id === selectedBarberId)} 
                                  timePeriod={timePeriod} drillDown={drillDown} onDrillDown={handleDrillDown} 
                                  setTimePeriod={setTimePeriod} setDrillDown={setDrillDown} type="revenue" barbers={barbers} 
                                  selectedBarberId={isOwner ? selectedBarberId : null} onBarberSelect={setSelectedBarberId} isOwner={isOwner} />
                </div>
              )}

              {activeTab === 'appointments' && (
                <div className="bg-white p-6 rounded-lg shadow">
                  <StatisticsGraph reservations={isOwner ? reservations : reservations.filter(r => r.Barbers.Id === selectedBarberId)} 
                                  timePeriod={timePeriod} drillDown={drillDown} onDrillDown={handleDrillDown} 
                                  setTimePeriod={setTimePeriod} setDrillDown={setDrillDown} type="appointments" barbers={barbers} 
                                  selectedBarberId={isOwner ? selectedBarberId : null} onBarberSelect={setSelectedBarberId} isOwner={isOwner} />
                </div>
              )}

              {isOwner && activeTab === 'users' && (
                <ManageUsers users={users} reservations={reservations} isLoading={isLoading} currentPage={currentPage} totalUsers={totalUsers} pageSize={pageSize} onPageChange={handlePageChange} onUsersUpdate={fetchUsers}/>
              )}

              {isOwner && activeTab === 'barbers' && (
                <ManageBarbers barbers={barbers} isLoading={isLoading} onBarbersUpdate={fetchAllBarbers}/>
              )}

              {activeTab === 'my-reservations' && (
                <ManageReservations barbers={barbers} isLoading={isLoading} />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
