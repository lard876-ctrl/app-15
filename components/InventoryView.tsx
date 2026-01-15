
import React, { useState } from 'react';
import { FoodItem, StorageLocation } from '../types';
import { CATEGORIES } from '../constants';
import { 
  MagnifyingGlassIcon, 
  AdjustmentsHorizontalIcon,
  BellIcon,
  ChevronRightIcon,
  ClockIcon,
  XMarkIcon,
  FunnelIcon
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
    case 'Snacks': return '🥨';
    case 'Beverages': return '🥤';
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

const InventoryView: React.FC<InventoryViewProps> = ({ 
  inventory, 
  searchQuery, 
  setSearchQuery, 
  onSelectItem 
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedLocation, setSelectedLocation] = useState<string>('All');

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesLocation = selectedLocation === 'All' || item.location === selectedLocation;
    return matchesSearch && matchesCategory && matchesLocation;
  });

  const clearFilters = () => {
    setSelectedCategory('All');
    setSelectedLocation('All');
    setSearchQuery('');
  };

  const activeFiltersCount = (selectedCategory !== 'All' ? 1 : 0) + (selectedLocation !== 'All' ? 1 : 0);

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* Header - Compact */}
      <div className="flex justify-between items-center -mt-2">
        <h2 className="text-[22px] font-black text-[#2C3E50] tracking-tighter uppercase">My Inventory</h2>
        <div className="relative p-2 active:scale-95 transition-transform cursor-pointer">
          <BellIcon className="w-7 h-7 text-[#2C3E50]" />
          <span className="absolute top-1 right-1 bg-[#E74C3C] text-white text-[9px] font-black w-4.5 h-4.5 flex items-center justify-center rounded-full border-2 border-white shadow-sm">4</span>
        </div>
      </div>

      {/* Search & Filter Trigger */}
      <div className="flex space-x-3">
        <div className="flex-1 bg-[#F2F2F2] rounded-2xl flex items-center px-4 shadow-inner">
          <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 mr-2" />
          <input
            type="text"
            className="flex-1 bg-transparent py-3 text-sm font-bold text-gray-700 placeholder:text-gray-300 focus:outline-none"
            placeholder="Search food items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="p-1">
              <XMarkIcon className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>
        <button 
          onClick={() => setShowFilters(!showFilters)}
          className={`p-3 rounded-2xl active:scale-95 transition-all relative ${
            showFilters || activeFiltersCount > 0 ? 'bg-[#2ECC71] text-white' : 'bg-[#F2F2F2] text-gray-400'
          }`}
        >
          <AdjustmentsHorizontalIcon className="w-6 h-6" />
          {activeFiltersCount > 0 && !showFilters && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#E74C3C] rounded-full text-[10px] font-black flex items-center justify-center border-2 border-white">
              {activeFiltersCount}
            </span>
          )}
        </button>
      </div>

      {/* Expanded Filter Panel */}
      {showFilters && (
        <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-lg space-y-6 animate-in slide-in-from-top-4 duration-300">
          <div className="flex justify-between items-center">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Filter Options</h3>
            <button onClick={clearFilters} className="text-[10px] font-black text-[#E74C3C] uppercase tracking-tighter">Reset All</button>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-[10px] font-black text-gray-800 uppercase tracking-tight ml-1">Categories</p>
              <div className="flex flex-wrap gap-2">
                {['All', ...CATEGORIES].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-full text-[10px] font-black uppercase transition-all border ${
                      selectedCategory === cat 
                        ? 'bg-[#2ECC71] text-white border-[#2ECC71] shadow-md shadow-green-100' 
                        : 'bg-gray-50 text-gray-400 border-gray-100 hover:bg-gray-100'
                    }`}
                  >
                    {cat === 'All' ? 'All Items' : cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-[10px] font-black text-gray-800 uppercase tracking-tight ml-1">Storage Location</p>
              <div className="flex flex-wrap gap-2">
                {['All', ...Object.values(StorageLocation)].map(loc => (
                  <button
                    key={loc}
                    onClick={() => setSelectedLocation(loc)}
                    className={`px-4 py-2 rounded-full text-[10px] font-black uppercase transition-all border ${
                      selectedLocation === loc 
                        ? 'bg-[#2980B9] text-white border-[#2980B9] shadow-md shadow-blue-100' 
                        : 'bg-gray-50 text-gray-400 border-gray-100 hover:bg-gray-100'
                    }`}
                  >
                    {loc}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Inventory List */}
      <div className="space-y-3 pb-24">
        <div className="flex justify-between items-center px-2">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
            Showing {filteredInventory.length} {filteredInventory.length === 1 ? 'item' : 'items'}
          </p>
          {(activeFiltersCount > 0 || searchQuery) && (
             <span className="text-[9px] font-black text-[#2ECC71] uppercase tracking-tighter bg-green-50 px-2 py-0.5 rounded-full border border-green-100">Filtered</span>
          )}
        </div>

        {filteredInventory.length === 0 ? (
          <div className="text-center py-24 bg-gray-50/50 rounded-[3rem] border-2 border-dashed border-gray-100 flex flex-col items-center">
            <div className="bg-white p-4 rounded-3xl shadow-sm mb-4">
              <FunnelIcon className="w-8 h-8 text-gray-200" />
            </div>
            <h3 className="text-sm font-black text-gray-800 uppercase tracking-tight">No results found</h3>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1 max-w-[200px] leading-relaxed">
              Try adjusting your search or filters to find what you're looking for.
            </p>
            <button 
              onClick={clearFilters}
              className="mt-6 text-[10px] font-black text-[#2ECC71] border border-[#2ECC71] px-6 py-2 rounded-full uppercase tracking-widest active:scale-95 transition-all"
            >
              Clear Search
            </button>
          </div>
        ) : (
          filteredInventory.map(item => {
            const expiry = getExpiryLabel(item.expiryDate);
            return (
              <div 
                key={item.id} 
                onClick={() => onSelectItem(item)}
                className="bg-white p-4 rounded-[2.5rem] border border-gray-100 shadow-sm flex items-center space-x-4 active:scale-[0.98] transition-all cursor-pointer group hover:shadow-md"
              >
                <div className="w-16 h-16 bg-[#F8F9FA] rounded-[1.8rem] flex items-center justify-center text-3xl shadow-inner shrink-0 group-hover:bg-[#E8F8EF] transition-colors relative">
                  {getCategoryIcon(item.category)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between pr-2">
                    <h4 className="font-black text-gray-800 truncate uppercase tracking-tight text-[15px]">{item.name}</h4>
                    <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest shrink-0">{item.location}</span>
                  </div>
                  <div className="flex items-center space-x-2 mt-0.5">
                    <span className="bg-gray-50 text-gray-400 px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-tighter border border-gray-100">
                      {item.category}
                    </span>
                    <span className="w-1 h-1 bg-gray-200 rounded-full"></span>
                    <span className="text-[10px] font-bold text-gray-400">{item.quantity}</span>
                  </div>
                  <div className="mt-2.5 flex items-center space-x-2">
                    <div className={`flex items-center space-x-1.5 px-3 py-1 rounded-full border ${expiry.bg} border-current opacity-80`}>
                      <ClockIcon className={`w-3 h-3 ${expiry.color}`} />
                      <span className={`text-[9px] font-black uppercase tracking-tighter ${expiry.color}`}>
                        {expiry.label}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="p-2 bg-gray-50 rounded-full group-hover:bg-[#2ECC71]/10 transition-colors">
                  <ChevronRightIcon className="w-4 h-4 text-gray-300 group-hover:text-[#2ECC71] transition-colors" />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default InventoryView;
