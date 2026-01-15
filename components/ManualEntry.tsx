
import React, { useState, useEffect, useRef } from 'react';
import { FoodItem, StorageLocation } from '../types';
import { CATEGORIES } from '../constants';
import { predictCategory } from '../services/geminiService';
import { calculateExpiryStatus } from '../utils';
import { 
  XMarkIcon, 
  CheckIcon, 
  SparklesIcon,
  CalendarIcon,
  MapPinIcon,
  ScaleIcon,
  Squares2X2Icon,
  BanknotesIcon
} from '@heroicons/react/24/outline';

interface ManualEntryProps {
  onSave: (item: FoodItem) => void;
  onCancel: () => void;
}

const ManualEntry: React.FC<ManualEntryProps> = ({ onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: 'Other',
    location: StorageLocation.PANTRY,
    quantity: '',
    price: '',
    expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });
  const [isPredicting, setIsPredicting] = useState(false);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormData({ ...formData, name });

    if (typingTimer.current) clearTimeout(typingTimer.current);
    if (name.length > 2) {
      typingTimer.current = setTimeout(async () => {
        setIsPredicting(true);
        const suggestedCategory = await predictCategory(name);
        setFormData(prev => ({ ...prev, category: suggestedCategory }));
        setIsPredicting(false);
      }, 800);
    }
  };

  const handleSave = () => {
    if (!formData.name) return;

    const isoDate = new Date(formData.expiryDate).toISOString();
    const newItem: FoodItem = {
      id: Math.random().toString(36).substr(2, 9),
      name: formData.name,
      category: formData.category,
      expiryDate: isoDate,
      addedDate: new Date().toISOString(),
      location: formData.location,
      quantity: formData.quantity || '1 unit',
      price: parseFloat(formData.price) || 0,
      status: calculateExpiryStatus(isoDate),
      ingredients: [formData.name]
    };

    onSave(newItem);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-gray-50 animate-in slide-in-from-bottom duration-300">
      <header className="bg-white border-b px-6 py-4 flex justify-between items-center sticky top-0 z-10">
        <h2 className="text-lg font-bold text-gray-800">Manual Entry</h2>
        <button onClick={onCancel} className="p-2 hover:bg-gray-100 rounded-full">
          <XMarkIcon className="w-6 h-6 text-gray-500" />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase">Item Name</label>
            <div className="relative">
              <input 
                autoFocus
                className="w-full text-xl font-bold text-gray-900 border-b-2 border-fresh-green focus:outline-none bg-transparent py-2"
                value={formData.name}
                onChange={handleNameChange}
                placeholder="e.g. Home-made Jam"
              />
              {isPredicting && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2">
                  <div className="w-5 h-5 border-2 border-fresh-green border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 pt-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2 text-[10px] font-bold text-gray-400 uppercase">
                <Squares2X2Icon className="w-3 h-3" />
                <span>Category</span>
                <SparklesIcon className="w-3 h-3 text-fresh-green animate-pulse" />
              </div>
              <select 
                className="w-full bg-gray-50 p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-fresh-green outline-none font-semibold text-sm"
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <div className="flex items-center space-x-2 text-[10px] font-bold text-gray-400 uppercase">
                  <BanknotesIcon className="w-3 h-3" />
                  <span>Price ($)</span>
                </div>
                <input 
                  type="number"
                  step="0.01"
                  className="w-full bg-gray-50 p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-fresh-green outline-none font-semibold text-sm"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center space-x-2 text-[10px] font-bold text-gray-400 uppercase">
                  <CalendarIcon className="w-3 h-3" />
                  <span>Expiry</span>
                </div>
                <input 
                  type="date"
                  className="w-full bg-gray-50 p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-fresh-green outline-none font-semibold text-sm"
                  value={formData.expiryDate}
                  onChange={(e) => setFormData({...formData, expiryDate: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center space-x-2 text-[10px] font-bold text-gray-400 uppercase">
                <MapPinIcon className="w-3 h-3" />
                <span>Storage</span>
              </div>
              <select 
                className="w-full bg-gray-50 p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-fresh-green outline-none font-semibold text-sm"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value as StorageLocation})}
              >
                {Object.values(StorageLocation).map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <div className="flex items-center space-x-2 text-[10px] font-bold text-gray-400 uppercase">
                <ScaleIcon className="w-3 h-3" />
                <span>Quantity</span>
              </div>
              <input 
                className="w-full bg-gray-50 p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-fresh-green outline-none font-semibold text-sm"
                value={formData.quantity}
                onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                placeholder="e.g. 1 jar, 500g"
              />
            </div>
          </div>
        </div>

        <button 
          onClick={handleSave}
          disabled={!formData.name}
          className="w-full py-4 rounded-2xl bg-fresh-green text-white font-bold hover:bg-opacity-90 shadow-lg shadow-green-100 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:shadow-none transition-all active:scale-95"
        >
          <CheckIcon className="w-6 h-6" />
          <span>Save to Inventory</span>
        </button>
      </div>
    </div>
  );
};

export default ManualEntry;
