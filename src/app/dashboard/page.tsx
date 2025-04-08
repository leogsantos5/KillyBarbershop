'use client'

import { useState, useEffect, useCallback } from 'react'
import { barbersService } from '../supabase/barbersService'
import { reservationsService } from '../supabase/reservationsService'
import { usersService } from '../supabase/usersService'
import { authService } from '../supabase/authService'
import { jwtService } from '../supabase/jwtService'
import { Barber, Reservation } from '../types/booking'
import StatisticsGraph from '../components/dashboard/statistics-graph'
import { Toaster } from 'react-hot-toast'
import { ManageReservations } from '../components/dashboard/manage-reservations'
import { ManageBarbers } from '../components/dashboard/manage-barbers'
import { ManageUsers } from '../components/dashboard/manage-users'
import { Sidebar } from '../components/dashboard/sidebar'
import { TimePeriod, DrillDownState, ActiveTab } from '../types/dashboard'
import { useRouter } from 'next/navigation'
import LoadingSpinner from '../components/dashboard/loading-spinner'

const tabs: { activeTab: ActiveTab; label: string }[] = [
  { activeTab: 'my-reservations', label: 'Gerir Marcações' },
  { activeTab: 'barbers', label: 'Gerir Barbeiros' },
  { activeTab: 'users', label: 'Gerir Utilizadores' },
  { activeTab: 'revenue', label: 'Faturação' },
  { activeTab: 'appointments', label: 'Número de Marcações' }
];

// check weird css on light mode, dashboard login error show auth credentials wrong

export default function Dashboard() {
  const [isLoading, setIsLoading] = useState(true)
  const [isBarbersLoading, setIsBarbersLoading] = useState(false)
  const [isReservationsLoading, setIsReservationsLoading] = useState(false)
  const [isUsersLoading, setIsUsersLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<ActiveTab>('my-reservations')
  const [barbers, setBarbers] = useState<Barber[]>([])
  const [users, setUsers] = useState<{ Id: string; Name: string; Phone: string; Status: boolean }[]>([])
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('yearly')
  const [drillDown, setDrillDown] = useState<DrillDownState>({})
  const [selectedBarberId, setSelectedBarberId] = useState<string>('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalUsers, setTotalUsers] = useState(0)
  const [isOwner, setIsOwner] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const pageSize = 10
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const error = await authService.checkSession();
      if (error) {
        router.push('/secret-login');
        return;
      }
      
      // Get barber info from token
      const token = sessionStorage.getItem('authToken');
      if (token) {
        const payload = await jwtService.verifyToken(token);
        const barberId = payload.barberId as string;
        const isOwner = payload.isOwner as boolean;
        
        setIsOwner(isOwner);
        setSelectedBarberId(barberId);

        if (!isOwner && barberId) {
          setDrillDown({ barberId });
        }
      }

      setIsLoading(false);      
    };

    checkAuth();
  }, [router]);

  const availableTabs = tabs.filter(tab => 
    isOwner || ['my-reservations', 'revenue', 'appointments'].includes(tab.activeTab)
  )

  const fetchAllBarbers = useCallback(async () => {
    setIsBarbersLoading(true);
    const { success, data } = await barbersService.fetchAllBarbers();
    if (success && data) {
      setBarbers(data);
    }
    setIsBarbersLoading(false);
  }, []);

  const fetchAllReservations = useCallback(async () => {
    setIsReservationsLoading(true);
    const { success, data } = await reservationsService.fetchAllReservations();
    if (success && data) {
      setReservations(data);
    }
    setIsReservationsLoading(false);
  }, []);

  const fetchAllUsers = useCallback(async () => {
    setIsUsersLoading(true);
    const { success, data, total } = await usersService.fetchAllUsers(currentPage, pageSize);
    if (success && data) {
      setUsers(data);
      setTotalUsers(total || 0);
    }
    setIsUsersLoading(false);
  }, [currentPage, pageSize]);

  useEffect(() => {
    if (activeTab === 'users') {
      fetchAllUsers();
    } else if (activeTab === 'barbers') {
      fetchAllBarbers();
    } else if (activeTab === 'my-reservations') {
      fetchAllReservations();
    }
  }, [currentPage, activeTab, fetchAllUsers, fetchAllBarbers, fetchAllReservations]);

  const getConfirmedReservations = () => {
    return reservations.filter(reservation => reservation.Status)
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
    return <LoadingSpinner variant="dashboard-page" />;
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
            <div className="bg-white dark:bg-gray-800 p-4 lg:p-6 rounded-lg shadow border-l-4 border-blue-600 min-h-[300px] flex flex-col">
              {isUsersLoading ? (
                <div className="flex justify-center items-center flex-grow">
                  <LoadingSpinner variant="dashboard-tab" />
                </div>
              ) : (
                <ManageUsers users={users} reservations={getConfirmedReservations()} isLoading={isUsersLoading} currentPage={currentPage} 
                          totalUsers={totalUsers} pageSize={pageSize} onPageChange={handlePageChange} onUsersUpdate={fetchAllUsers} />
              )}
            </div>
          )}

          {isOwner && activeTab === 'barbers' && (
            <div className="bg-white dark:bg-gray-800 p-4 lg:p-6 rounded-lg shadow border-l-4 border-blue-600 min-h-[300px] flex flex-col">
              {isBarbersLoading ? (
                <div className="flex justify-center items-center flex-grow">
                  <LoadingSpinner variant="dashboard-tab" />
                </div>
              ) : (
                <ManageBarbers barbers={barbers} isLoading={isBarbersLoading} onBarbersUpdate={fetchAllBarbers} />
              )}
            </div>
          )}

          {activeTab === 'my-reservations' && (
            <div className="bg-white dark:bg-gray-800 p-4 lg:p-6 rounded-lg shadow border-l-4 border-blue-600 min-h-[300px] flex flex-col">
              {isReservationsLoading ? (
                <div className="flex justify-center items-center flex-grow">
                  <LoadingSpinner variant="dashboard-tab" />
                </div>
              ) : (
                <ManageReservations isLoading={isReservationsLoading} currentBarberId={selectedBarberId}/>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
