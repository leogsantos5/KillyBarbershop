import { ActiveTab } from '../../types/dashboard';
import { useRouter } from 'next/navigation';

interface SidebarProps {
  isOpen: boolean;
  activeTab: ActiveTab;
  availableTabs: { activeTab: ActiveTab; label: string }[];
  onTabChange: (tab: ActiveTab) => void;
}

export function Sidebar({ isOpen, activeTab, availableTabs, onTabChange }: SidebarProps) {
  const router = useRouter();

  return (
    <>
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50
        transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
        transition-transform duration-300 ease-in-out
        w-64 bg-white dark:bg-gray-800 shadow-md h-full border-r-4 border-red-600
      `}>
        <div className="p-4 h-full flex flex-col">
          <h2 className="text-xl font-bold mb-6 border-b-2 border-red-600 pb-2 text-gray-900 dark:text-white">Painel de Controlo</h2>
          <nav className="space-y-2 flex-1">
            {availableTabs.map(tab => (
              <button 
                key={tab.activeTab} 
                onClick={() => onTabChange(tab.activeTab)}
                className={`w-full p-2 text-left rounded transition-colors ${
                  activeTab === tab.activeTab 
                    ? 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-l-4 border-red-600' 
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
          {/* Logo at bottom for desktop */}
          <div className="hidden lg:flex justify-center items-center mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
            <button 
              onClick={() => router.push('/')}
              className="text-xl font-bold text-gray-900 dark:text-white hover:text-gray-700 dark:hover:text-gray-300"
            >
              KR<span className="text-red-600">&</span>XG
            </button>
          </div>
        </div>
      </div>

      {/* Overlay for mobile sidebar */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => onTabChange(activeTab)}
        />
      )}
    </>
  );
} 