
import React from 'react';
import { 
  HomeIcon, 
  QueueListIcon, 
  QrCodeIcon, 
  SparklesIcon, 
  UserCircleIcon,
  ArrowLeftIcon,
  ArrowDownTrayIcon,
  FlagIcon,
  MicrophoneIcon
} from '@heroicons/react/24/outline';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onAssistantToggle: () => void;
  isAssistantActive?: boolean;
}

const SignalBarsIcon: React.FC<{ active: boolean; onClick: () => void }> = ({ active, onClick }) => (
  <button 
    onClick={onClick}
    className="flex items-end space-x-[3px] p-2 hover:bg-gray-50 rounded-xl transition-all active:scale-95 group"
    aria-label="View Analytics"
  >
    <div className={`w-[3px] h-2.5 rounded-full transition-colors ${active ? 'bg-fresh-green' : 'bg-[#D1D1D1] group-hover:bg-gray-400'}`}></div>
    <div className={`w-[3px] h-4 rounded-full transition-colors ${active ? 'bg-fresh-green' : 'bg-[#D1D1D1] group-hover:bg-gray-400'}`}></div>
    <div className={`w-[3px] h-5.5 rounded-full transition-colors ${active ? 'bg-fresh-green' : 'bg-[#D1D1D1] group-hover:bg-gray-400'}`}></div>
  </button>
);

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  activeTab, 
  setActiveTab, 
  onAssistantToggle,
  isAssistantActive 
}) => {
  const navItems = [
    { id: 'dashboard', icon: HomeIcon, label: 'Home' },
    { id: 'inventory', icon: QueueListIcon, label: 'Inventory' },
    { id: 'scanner', icon: QrCodeIcon, label: 'Scan', isPrimary: true },
    { id: 'recipes', icon: SparklesIcon, label: 'Recipes' },
    { id: 'profile', icon: UserCircleIcon, label: 'Profile' },
  ];

  const isAnalytics = activeTab === 'analytics';

  return (
    <div className="flex flex-col h-screen w-full bg-white overflow-hidden relative transition-colors duration-300">
      <header className="bg-white px-7 pt-4 pb-1 flex justify-between items-center sticky top-0 z-30 max-w-md mx-auto w-full">
        {isAnalytics ? (
          <>
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setActiveTab('dashboard')} 
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ArrowLeftIcon className="w-6 h-6 text-gray-800" />
              </button>
              <h1 className="text-xl font-bold text-gray-800 tracking-tight">Analytics</h1>
            </div>
            <div className="flex items-center space-x-4">
              <ArrowDownTrayIcon className="w-6 h-6 text-gray-800 cursor-pointer" />
              <FlagIcon className="w-6 h-6 text-gray-800 cursor-pointer" />
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center">
              <h1 className="text-[22px] font-black text-[#2ECC71] tracking-tight">Expronix</h1>
            </div>
            <div className="print:hidden">
              <SignalBarsIcon 
                active={activeTab === 'analytics'} 
                onClick={() => setActiveTab('analytics')} 
              />
            </div>
          </>
        )}
      </header>

      <main className="flex-1 overflow-y-auto pb-28 pt-0 p-4 scroll-smooth scrollbar-hide">
        {children}
      </main>

      {/* Main Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex justify-around py-4 px-2 shadow-[0_-10px_20px_rgba(0,0,0,0.03)] z-[30]">
        <div className="flex w-full max-w-md mx-auto justify-between items-center px-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            if (item.isPrimary) {
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex flex-col items-center justify-center transition-all -mt-8 ${
                    isActive ? 'scale-110' : 'scale-100'
                  }`}
                >
                  <div className={`w-16 h-16 rounded-full flex flex-col items-center justify-center shadow-2xl transition-all border border-gray-100 ring-[6px] ring-white ${
                    isActive ? 'bg-[#2ECC71] text-white shadow-green-100' : 'bg-white text-green-700'
                  }`}>
                    <Icon className="w-7 h-7" />
                    <span className={`text-[8px] font-black uppercase mt-0.5 ${isActive ? 'text-white' : 'text-green-700'}`}>
                      {item.label}
                    </span>
                  </div>
                </button>
              );
            }

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center space-y-1 transition-all ${
                  isActive ? 'text-[#2ECC71] scale-110' : 'text-gray-400'
                }`}
              >
                <div className={`p-1.5 rounded-xl transition-colors ${isActive ? 'bg-[#2ECC71]/10' : ''}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-tighter">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default Layout;
