'use client'

import { useState, useEffect, useCallback } from 'react'
import { barbersService } from '../supabase/barbersService'
import { reservationsService } from '../supabase/reservationsService'
import { usersService } from '../supabase/usersService'
import { authService } from '../supabase/authService'
import { Barber, Reservation } from '../types/booking'
import StatisticsGraph from '../components/dashboard/statistics-graph'
import { Toaster, toast } from 'react-hot-toast'
import { ManageReservations } from '../components/dashboard/manage-reservations'
import { ManageBarbers } from '../components/dashboard/manage-barbers'
import { ManageUsers } from '../components/dashboard/manage-users'
import { Sidebar } from '../components/dashboard/sidebar'
import { TimePeriod, DrillDownState, ActiveTab } from '../types/dashboard'
import { useRouter } from 'next/navigation'
import { ErrorMessages } from '../utils/errorMessages'

const tabs: { activeTab: ActiveTab; label: string }[] = [
  { activeTab: 'my-reservations', label: 'Gerir Marcações' },
  { activeTab: 'barbers', label: 'Gerir Barbeiros' },
  { activeTab: 'users', label: 'Gerir Utilizadores' },
  { activeTab: 'revenue', label: 'Faturação' },
  { activeTab: 'appointments', label: 'Número de Marcações' }
];

// check weird css on light mode, dashboard login error show auth credentials wrong

export default function Dashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<ActiveTab>('my-reservations')
  const [barbers, setBarbers] = useState<Barber[]>([])
  const [users, setUsers] = useState<{ Id: string; Name: string; Phone: string; Status: boolean }[]>([])
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('yearly')
  const [drillDown, setDrillDown] = useState<DrillDownState>({})
  const [selectedBarberId, setSelectedBarberId] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalUsers, setTotalUsers] = useState(0)
  const [isOwner, setIsOwner] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const pageSize = 10
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) return;

    const checkSessionInterval = setInterval(async () => {
      const response = await authService.checkSession();
      if (response.error) {
        setIsAuthenticated(false);
        setIsOwner(false);
        setSelectedBarberId(null);
        toast.error(ErrorMessages.AUTH.SESSION_EXPIRED);
      }
    }, 60000); // Check every minute

    return () => clearInterval(checkSessionInterval);
  }, [isAuthenticated]);

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

  const fetchAllReservations = async () => {
    const { success, data } = await reservationsService.fetchAllReservations()
    if (success && data) {
      setReservations(data)
    } 
  }

  const getConfirmedReservations = () => {
    return reservations.filter(reservation => reservation.Status)
  }

  useEffect(() => {
    fetchAllBarbers()
    fetchAllReservations()
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
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
      
      {/* Mobile Header */}
      <div className="lg:hidden bg-white dark:bg-gray-800 shadow-md p-4 flex justify-between items-center border-b-4 border-red-600">
        <h2 className="text-xl font-bold text-left text-gray-900 dark:text-white">KR<span className="text-red-600">&</span>XG</h2>
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <svg className="w-6 h-6 text-gray-900 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      <div className="flex h-screen">
      <Sidebar isOpen={isSidebarOpen} activeTab={activeTab} availableTabs={availableTabs}
          onTabChange={(tab) => { setActiveTab(tab); setIsSidebarOpen(false); }} />
        {/* Main Content */}
        <div className="flex-1 p-4 lg:p-8 overflow-auto">
          {isLoading ? (
            <div className="flex items-center justify-center mb-20 min-h-[calc(100vh-4rem)]">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-red-600 border-t-transparent"></div>
            </div>
          ) : (
            <>
              {activeTab === 'revenue' && (
                <div className="bg-white dark:bg-gray-800 p-4 lg:p-6 rounded-lg shadow border-l-4 border-blue-600">
                  <StatisticsGraph 
                    reservations={reservations} timePeriod={timePeriod} drillDown={drillDown} onDrillDown={handleDrillDown} 
                    setTimePeriod={setTimePeriod} setDrillDown={setDrillDown} type="revenue" barbers={barbers} 
                    selectedBarberId={selectedBarberId} onBarberSelect={setSelectedBarberId} isOwner={isOwner} />
                </div>
              )}

              {activeTab === 'appointments' && (
                <div className="bg-white dark:bg-gray-800 p-4 lg:p-6 rounded-lg shadow border-l-4 border-blue-600">
                  <StatisticsGraph 
                    reservations={reservations} timePeriod={timePeriod} drillDown={drillDown} onDrillDown={handleDrillDown} 
                    setTimePeriod={setTimePeriod} setDrillDown={setDrillDown} type="appointments" barbers={barbers} 
                    selectedBarberId={selectedBarberId} onBarberSelect={setSelectedBarberId} isOwner={isOwner} />
                </div>
              )}

              {isOwner && activeTab === 'users' && (
                <div className="bg-white dark:bg-gray-800 p-4 lg:p-6 rounded-lg shadow border-l-4 border-blue-600">
                  <ManageUsers users={users} reservations={getConfirmedReservations()} isLoading={isLoading} currentPage={currentPage} 
                            totalUsers={totalUsers} pageSize={pageSize} onPageChange={handlePageChange} onUsersUpdate={fetchUsers} />
                </div>
              )}

              {isOwner && activeTab === 'barbers' && (
                <div className="bg-white dark:bg-gray-800 p-4 lg:p-6 rounded-lg shadow border-l-4 border-blue-600">
                  <ManageBarbers barbers={barbers} isLoading={isLoading} onBarbersUpdate={fetchAllBarbers} />
                </div>
              )}

              {activeTab === 'my-reservations' && (
                <div className="bg-white dark:bg-gray-800 p-4 lg:p-6 rounded-lg shadow border-l-4 border-blue-600">
                  <ManageReservations isLoading={isLoading} currentBarberId={selectedBarberId || ''}/>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
