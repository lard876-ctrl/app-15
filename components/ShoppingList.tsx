
import React, { useState, useMemo } from 'react';
import { FoodItem, ExpiryStatus } from '../types';
import { 
  PlusIcon, 
  TrashIcon, 
  SparklesIcon, 
  ShoppingCartIcon,
  CheckCircleIcon,
  PlusCircleIcon
} from '@heroicons/react/24/outline';

interface ShoppingListProps {
  inventory: FoodItem[];
}

interface ShoppingListItem {
  id: string;
  name: string;
  category: string;
  completed: boolean;
}

const ShoppingList: React.FC<ShoppingListProps> = ({ inventory }) => {
  const [items, setItems] = useState<ShoppingListItem[]>([]);
  const [newItemName, setNewItemName] = useState('');

  // Auto-generate suggestions based on expired or expiring items
  const suggestions = useMemo(() => {
    return inventory
      .filter(i => i.status !== ExpiryStatus.FRESH)
      .filter(i => !items.some(listItem => listItem.name.toLowerCase() === i.name.toLowerCase()))
      .slice(0, 3);
  }, [inventory, items]);

  const addItem = (name: string, category: string = 'Other') => {
    if (!name.trim()) return;
    const newItem: ShoppingListItem = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      category,
      completed: false
    };
    setItems([...items, newItem]);
    setNewItemName('');
  };

  const toggleItem = (id: string) => {
    setItems(items.map(i => i.id === id ? { ...i, completed: !i.completed } : i));
  };

  const removeItem = (id: string) => {
    setItems(items.filter(i => i.id !== id));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-20">
      <div>
        <h2 className="text-xl font-bold text-gray-800">Shopping List</h2>
        <p className="text-xs text-gray-400">Replenish your pantry essentials</p>
      </div>

      {/* Add Item Input */}
      <div className="flex space-x-2">
        <input 
          type="text"
          value={newItemName}
          onChange={(e) => setNewItemName(e.target.value)}
          placeholder="What do you need?"
          className="flex-1 px-4 py-3 bg-white border border-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-fresh-green outline-none shadow-sm"
          onKeyPress={(e) => e.key === 'Enter' && addItem(newItemName)}
        />
        <button 
          onClick={() => addItem(newItemName)}
          className="bg-fresh-green text-white p-3 rounded-2xl shadow-lg active:scale-95 transition-all"
        >
          <PlusIcon className="w-6 h-6" />
        </button>
      </div>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <section className="bg-white p-5 rounded-3xl border border-dashed border-fresh-green/30">
          <div className="flex items-center space-x-2 mb-3">
            <SparklesIcon className="w-4 h-4 text-fresh-green" />
            <h3 className="text-[10px] font-bold text-fresh-green uppercase tracking-widest">Auto-Suggestions</h3>
          </div>
          <div className="space-y-2">
            {suggestions.map(s => (
              <button 
                key={s.id}
                onClick={() => addItem(s.name, s.category)}
                className="w-full flex items-center justify-between p-3 bg-green-50/50 rounded-xl group active:bg-green-100 transition-colors"
              >
                <div className="text-left">
                  <p className="text-xs font-bold text-gray-700">{s.name}</p>
                  <p className="text-[10px] text-gray-400">{s.status === ExpiryStatus.EXPIRED ? 'Expired' : 'Expiring Soon'}</p>
                </div>
                <PlusCircleIcon className="w-5 h-5 text-fresh-green opacity-50 group-hover:opacity-100" />
              </button>
            ))}
          </div>
        </section>
      )}

      {/* List */}
      <div className="space-y-3">
        {items.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-100">
            <ShoppingCartIcon className="w-12 h-12 text-gray-100 mx-auto mb-2" />
            <p className="text-sm text-gray-400 font-medium">Your shopping list is empty</p>
          </div>
        ) : (
          items.map(item => (
            <div 
              key={item.id}
              className={`flex items-center justify-between p-4 bg-white rounded-2xl shadow-sm border transition-all ${
                item.completed ? 'opacity-50 border-gray-50' : 'border-gray-100'
              }`}
            >
              <button 
                onClick={() => toggleItem(item.id)}
                className="flex items-center space-x-4 flex-1 min-w-0"
              >
                {item.completed ? (
                  <CheckCircleIcon className="w-6 h-6 text-fresh-green" />
                ) : (
                  <div className="w-6 h-6 rounded-full border-2 border-gray-200"></div>
                )}
                <div className="text-left min-w-0">
                  <p className={`text-sm font-bold truncate ${item.completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                    {item.name}
                  </p>
                  <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">{item.category}</p>
                </div>
              </button>
              <button 
                onClick={() => removeItem(item.id)}
                className="p-2 text-gray-300 hover:text-red-500 transition-colors"
              >
                <TrashIcon className="w-5 h-5" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ShoppingList;
