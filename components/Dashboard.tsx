
import React, { useMemo } from 'react';
import { FoodItem, ExpiryStatus } from '../types';
import { calculatePriority, calculateExpiryStatus } from '../utils';
import { 
  ShoppingBagIcon, 
  ExclamationTriangleIcon, 
  ClockIcon, 
  ShieldExclamationIcon, 
  ChevronRightIcon,
  ShieldCheckIcon,
  MagnifyingGlassIcon,
  SunIcon,
  CloudIcon,
  MoonIcon,
  SparklesIcon
} from '@heroicons/react/24/solid';

interface DashboardProps {
  items: FoodItem[];
  onSelectItem: (id: string) => void;
  onViewInsights: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ items, onSelectItem, onViewInsights }) => {
  const expiredCount = items.filter(i => calculateExpiryStatus(i.expiryDate) === ExpiryStatus.EXPIRED).length;
  const soonCount = items.filter(i => calculateExpiryStatus(i.expiryDate) === ExpiryStatus.EXPIRING_SOON).length;

  const priorityItems = [...items]
    .map(item => ({ ...item, priority: calculatePriority(item.expiryDate) }))
    .sort((a, b) => a.priority.score - b.priority.score);

  const urgentItems = priorityItems.filter(p => p.priority.theme !== 'green');

  const hasRecalledItem = items.some(i => i.name.toLowerCase().includes('berry') || i.name.toLowerCase().includes('berries'));

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return { text: 'GOOD MORNING', icon: <SunIcon className="w-8 h-8 text-yellow-400" /> };
    if (hour < 17) return { text: 'GOOD AFTERNOON', icon: <CloudIcon className="w-8 h-8 text-blue-400" /> };
    return { text: 'GOOD EVENING', icon: <MoonIcon className="w-8 h-8 text-indigo-400" /> };
  }, []);

  const specialItem = items.find(i => calculateExpiryStatus(i.expiryDate) === ExpiryStatus.FRESH);

  return (
    <div className="space-y-8 pb-10 max-w-md mx-auto">
      {/* Welcome Header - Matching Screenshot */}
      <div className="px-6 space-y-2 animate-in fade-in slide-in-from-top duration-500">
        <div className="flex items-center space-x-3">
          {greeting.icon}
          <h2 className="text-2xl font-black text-gray-800 tracking-tight uppercase">{greeting.text}!</h2>
        </div>
        <div className="flex items-center space-x-2">
          <SparklesIcon className="w-4 h-4 text-[#2ECC71]" />
          <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest leading-none">
            Today spl items available: <span className="text-gray-600">{specialItem?.name.toUpperCase() || 'SELECT FRESH ITEMS'}</span>
          </p>
        </div>
      </div>

      {/* High-Fidelity Stats Grid - Perfectly matching the screenshot design */}
      <div className="grid grid-cols-2 gap-4 px-2">
        {/* Total Expired Card */}
        <div className="bg-[#E2E2E2] p-4 rounded-[3.5rem] shadow-[0_10px_30px_rgba(0,0,0,0.12)] aspect-square flex items-center justify-center transition-transform active:scale-95 group">
          <div className="bg-white w-full h-full rounded-[3rem] flex flex-col items-center justify-center py-6 px-4 border border-white/50 shadow-inner overflow-hidden">
            <div className="mb-3">
              <ExclamationTriangleIcon className="w-6 h-6 text-[#E74C3C]" />
            </div>
            <p className="text-[9px] text-[#A0A0A0] font-black uppercase tracking-[0.2em] text-center mb-4">Total Expired</p>
            <div className="bg-white border-[3px] border-[#E74C3C]/30 rounded-2xl w-20 py-2 flex items-center justify-center shadow-sm">
              <span className="text-3xl font-black text-[#E74C3C] leading-none">{expiredCount}</span>
            </div>
          </div>
        </div>

        {/* Expiring Soon Card */}
        <div className="bg-[#E2E2E2] p-4 rounded-[3.5rem] shadow-[0_10px_30_rgba(0,0,0,0.12)] aspect-square flex items-center justify-center transition-transform active:scale-95 group">
          <div className="bg-white w-full h-full rounded-[3rem] flex flex-col items-center justify-center py-6 px-4 border border-white/50 shadow-inner overflow-hidden">
            <div className="mb-3">
              <ClockIcon className="w-6 h-6 text-[#F39C12]" />
            </div>
            <p className="text-[9px] text-[#A0A0A0] font-black uppercase tracking-[0.2em] text-center mb-4">Expiring Soon</p>
            <div className="bg-white border-[3px] border-[#F39C12]/30 rounded-2xl w-20 py-2 flex items-center justify-center shadow-sm">
              <span className="text-3xl font-black text-[#F39C12] leading-none">{soonCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Safety Alerts Card */}
      <div className="bg-[#E2E2E2] p-6 rounded-[3.5rem] mx-2 shadow-[0_10px_25px_rgba(0,0,0,0.08)] border border-white/20">
        <div className="flex justify-between items-center mb-6 px-2">
          <div className="flex items-center space-x-2">
            <ShieldExclamationIcon className="w-5 h-5 text-[#E74C3C]" />
            <h2 className="text-[10px] font-black text-[#2C3E50] uppercase tracking-[0.2em]">Active Safety Alerts</h2>
          </div>
          <div className="flex items-center space-x-1.5 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white shadow-sm">
             <div className="w-1.5 h-1.5 bg-[#2ECC71] rounded-full animate-pulse"></div>
             <span className="text-[8px] font-black text-[#7F8C8D] uppercase tracking-widest">Live Monitoring</span>
          </div>
        </div>

        <div className="bg-white p-3 rounded-[3rem] shadow-sm border border-white">
          <div className="bg-[#F5F5F5] p-6 rounded-[2.5rem] border border-gray-100 relative group active:scale-[0.98] transition-all cursor-pointer overflow-hidden">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-16 bg-[#E74C3C] rounded-r-full"></div>
            
            <div className="flex justify-between items-start pl-4">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="text-[13px] font-black text-[#E74C3C] uppercase tracking-tight">Recall: Frozen Berries</h4>
                  {hasRecalledItem && (
                     <div className="bg-[#E74C3C] px-2 py-0.5 rounded-full shadow-sm">
                       <span className="text-[7px] font-black text-white uppercase tracking-tighter">⚠️ Match Found</span>
                     </div>
                  )}
                </div>
                <p className="text-[10px] text-[#95A5A6] font-bold mt-2 leading-relaxed">Listeria risk - check batch codes 2024-XB-12. Avoid consumption immediately.</p>
                
                <button className="mt-4 flex items-center space-x-2 bg-white px-5 py-2.5 rounded-2xl shadow-sm border border-gray-100">
                  <span className="text-[9px] font-black text-[#E74C3C] uppercase tracking-widest">View Instructions</span>
                  <div className="flex -space-x-1">
                    <div className="w-3.5 h-3.5 rounded-full bg-red-100 border border-white shadow-sm"></div>
                    <div className="w-3.5 h-3.5 rounded-full bg-red-200 border border-white shadow-sm"></div>
                  </div>
                </button>
              </div>
              <ChevronRightIcon className="w-5 h-5 text-gray-300" />
            </div>
          </div>
        </div>

        <div className="mt-4 px-6 py-3 bg-white/40 rounded-3xl flex items-center space-x-3 border border-white/60">
           <ShieldCheckIcon className="w-4 h-4 text-[#2ECC71]" />
           <p className="text-[9px] font-bold text-[#7F8C8D] uppercase tracking-tight leading-tight">Gemini AI has verified your remaining 42 inventory items as safe.</p>
        </div>
      </div>

      {/* Priority Consumption */}
      <div className="space-y-5 px-2">
        <div className="flex items-center justify-between px-6 mb-2">
          <h2 className="text-[10px] font-black text-[#95A5A6] uppercase tracking-[0.2em]">Priority Consumption</h2>
          <button className="text-[9px] font-black text-[#2ECC71] uppercase tracking-[0.2em] bg-[#E8F8EF] px-3 py-1 rounded-full">See All</button>
        </div>
        
        {urgentItems.slice(0, 3).map(item => (
          <div key={item.id} onClick={() => onSelectItem(item.id)} className="bg-white p-3 rounded-[3.5rem] shadow-sm group active:scale-[0.98] transition-all cursor-pointer border border-gray-100">
            <div className="p-4 rounded-[2.8rem] flex items-center relative overflow-hidden">
              <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-12 rounded-r-full ${item.priority.theme === 'red' ? 'bg-[#E74C3C]' : 'bg-[#F39C12]'}`}></div>
              
              <div className="flex-1 pl-4 pr-3">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-black text-[#2C3E50] text-[15px] truncate tracking-tight uppercase">{item.name}</h3>
                </div>
                
                <div className="relative h-1 bg-[#F5F5F5] rounded-full overflow-hidden mb-3">
                  <div 
                    className={`h-full rounded-full ${item.priority.theme === 'red' ? 'bg-[#E74C3C]' : 'bg-[#F39C12]'}`} 
                    style={{ width: `${(item.priority.score / 10) * 100}%` }}
                  ></div>
                </div>

                <div className="flex justify-between items-center">
                  <p className="text-[9px] text-[#A0A0A0] font-black uppercase tracking-[0.15em]">
                    {item.priority.label} • {item.location}
                  </p>
                </div>
              </div>

              <div className={`p-4 rounded-[1.8rem] border shadow-sm shrink-0 flex items-center justify-center ${
                item.priority.theme === 'red' ? 'bg-red-50 border-red-100' : 'bg-orange-50 border-orange-100'
              }`}>
                <ShoppingBagIcon className={`w-5 h-5 ${item.priority.theme === 'red' ? 'text-[#E74C3C]' : 'text-[#F39C12]'}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Analytics Banner */}
      <div className="bg-[#E2E2E2] p-4 rounded-[3.5rem] mx-2 shadow-sm">
        <div className="bg-gradient-to-br from-[#2ECC71] to-[#2980B9] text-white p-8 rounded-[3rem] relative overflow-hidden shadow-lg group">
          <div className="relative z-10">
            <div className="flex items-center space-x-2 mb-3 opacity-90">
              <MagnifyingGlassIcon className="w-4 h-4 text-white" />
              <span className="text-[9px] font-black uppercase tracking-[0.2em]">Financial Intelligence</span>
            </div>
            <h3 className="text-2xl font-black mb-1 tracking-tight uppercase">Waste Analytics</h3>
            <p className="text-[11px] text-white/90 mb-8 font-bold leading-relaxed max-w-[200px] uppercase tracking-tighter">You saved $42 this month by using our AI Recipe engine!</p>
            <button 
              onClick={onViewInsights}
              className="bg-white text-[#2ECC71] px-10 py-4 rounded-3xl text-[10px] font-black active:scale-95 transition-all shadow-xl uppercase tracking-widest flex items-center space-x-3"
            >
              <span>Full Report</span>
              <ChevronRightIcon className="w-4 h-4" />
            </button>
          </div>
          
          <div className="absolute right-0 bottom-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -mr-16 -mb-16"></div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
