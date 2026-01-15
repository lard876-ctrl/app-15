
import React from 'react';
import { FoodItem } from '../types';
import { 
  MagnifyingGlassIcon, 
  AdjustmentsHorizontalIcon,
  BellIcon,
  ChevronRightIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

interface InventoryViewProps {
  inventory: FoodItem[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSelectItem: (item: FoodItem) => void;
}

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'Dairy': return '🥛';
    case 'Bakery': return '🥐';
    case 'Vegetables': return '🥬';
    case 'Fruits': return '🍎';
    case 'Meat': return '🍗';
    case 'Grains': return '🍞';
    default: return '📦';
  }
};

const getExpiryLabel = (expiryDateStr: string) => {
  const expiryDate = new Date(expiryDateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  expiryDate.setHours(0, 0, 0, 0);

  const diffTime = expiryDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return { label: `Expired ${Math.abs(diffDays)}d ago`, color: 'text-red-500', bg: 'bg-red-50' };
  if (diffDays === 0) return { label: 'Expires today', color: 'text-[#E74C3C]', bg: 'bg-red-50' };
  if (diffDays === 1) return { label: 'Expires tomorrow', color: 'text-[#E74C3C]', bg: 'bg-red-50' };
  if (diffDays <= 4) return { label: `Expires in ${diffDays} days`, color: 'text-[#F39C12]', bg: 'bg-orange-50' };
  return { label: `Expires in ${diffDays} days`, color: 'text-gray-400', bg: 'bg-gray-50' };
};

// Fixed truncated component and added default export
const InventoryView: React.FC<InventoryViewProps> = ({ 
  inventory, 
  searchQuery, 
  setSearchQuery, 
  onSelectItem 
}) => {
  const filteredInventory = inventory.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* Header - Compact */}
      <div className="flex justify-between items-center -mt-2">
        <h2 className="text-[22px] font-black text-[#2C3E50] tracking-tighter">My Inventory</h2>
        <div className="relative p-2 active:scale-95 transition-transform cursor-pointer">
          <BellIcon className="w-7 h-7 text-[#2C3E50]" />
          <span className="absolute top-1 right-1 bg-[#E74C3C] text-white text-[9px] font-black w-4.5 h-4.5 flex items-center justify-center rounded-full border-2 border-white shadow-sm">4</span>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex space-x-3">
        <div className="flex-1 bg-[#F2F2F2] rounded-2xl flex items-center px-4 shadow-inner">
          <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 mr-2" />
          <input
            type="text"
            className="flex-1 bg-transparent py-3 text-sm font-bold text-gray-700 placeholder:text-gray-300 focus:outline-none"
            placeholder="Search items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button className="bg-[#F2F2F2] p-3 rounded-2xl active:scale-95 transition-transform">
          <AdjustmentsHorizontalIcon className="w-6 h-6 text-gray-400" />
        </button>
      </div>

      {/* Inventory List */}
      <div className="space-y-3 pb-24">
        {filteredInventory.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-100">
            <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">No items found</p>
          </div>
        ) : (
          filteredInventory.map(item => {
            const expiry = getExpiryLabel(item.expiryDate);
            return (
              <div 
                key={item.id} 
                onClick={() => onSelectItem(item)}
                className="bg-white p-4 rounded-[2rem] border border-gray-50 shadow-sm flex items-center space-x-4 active:scale-[0.98] transition-all cursor-pointer group"
              >
                <div className="w-14 h-14 bg-[#F8F9FA] rounded-2xl flex items-center justify-center text-2xl shadow-inner shrink-0 group-hover:bg-[#E8F8EF] transition-colors">
                  {getCategoryIcon(item.category)}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-black text-gray-800 truncate uppercase tracking-tight">{item.name}</h4>
                  <div className="flex items-center space-x-2 mt-0.5">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">{item.location}</span>
                    <span className="w-1 h-1 bg-gray-200 rounded-full"></span>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">{item.quantity}</span>
                  </div>
                  <div className="mt-2 flex items-center space-x-2">
                    <ClockIcon className={`w-3 h-3 ${expiry.color}`} />
                    <span className={`text-[10px] font-black uppercase tracking-tighter ${expiry.color}`}>
                      {expiry.label}
                    </span>
                  