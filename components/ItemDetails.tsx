
import React, { useState, useEffect } from 'react';
import { FoodItem, UserProfile, ExpiryStatus, StorageLocation, AllergySeverity } from '../types';
import { CATEGORIES } from '../constants';
import { calculateExpiryStatus, calculatePriority } from '../utils';
import { generateFoodImage } from '../services/geminiService';
import { 
  XMarkIcon, 
  ExclamationTriangleIcon, 
  CalendarIcon, 
  MapPinIcon, 
  ScaleIcon,
  PencilSquareIcon,
  CheckIcon,
  SparklesIcon,
  ArrowPathIcon,
  HeartIcon,
  ShieldCheckIcon,
  Squares2X2Icon
} from '@heroicons/react/24/outline';

interface ItemDetailsProps {
  item: FoodItem;
  userProfile: UserProfile;
  onClose: () => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<FoodItem>) => void;
}

const HEALTH_CONCERNS_MAP: Record<string, string[]> = {
  'Diabetes': ['sugar', 'syrup', 'honey', 'juice', 'fructose', 'glucose', 'starch', 'flour', 'rice', 'pasta'],
  'BP': ['salt', 'sodium', 'msg', 'soy sauce', 'bouillon', 'pickle', 'canned'],
  'Heart care': ['butter', 'lard', 'fat', 'coconut oil', 'palm oil', 'cream', 'bacon', 'trans fat'],
  'Pregnancy': ['alcohol', 'wine', 'raw', 'unpasteurized', 'caffeine', 'mercury', 'sushi'],
  'Cholesterol': ['egg yolk', 'butter', 'liver', 'shrimp', 'lard', 'processed meat'],
};

const ItemDetails: React.FC<ItemDetailsProps> = ({ item, userProfile, onClose, onDelete, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [editForm, setEditForm] = useState({
    name: item.name,
    quantity: item.quantity,
    location: item.location,
    category: item.category,
    expiryDate: item.expiryDate.split('T')[0]
  });

  // Sync edit form with item data
  useEffect(() => {
    setEditForm({
      name: item.name,
      quantity: item.quantity,
      location: item.location,
      category: item.category,
      expiryDate: item.expiryDate.split('T')[0]
    });
  }, [item, isEditing]);

  const priority = calculatePriority(item.expiryDate);

  const handleGenerateImage = async () => {
    if (isGeneratingImage) return;
    setIsGeneratingImage(true);
    try {
      const imageUrl = await generateFoodImage(item.name);
      if (imageUrl) {
        onUpdate(item.id, { image: imageUrl });
      }
    } catch (error) {
      console.error("Failed to generate image:", error);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  useEffect(() => {
    if (!item.image && !isGeneratingImage) {
      handleGenerateImage();
    }
  }, [item.id]);

  const itemNameLower = item.name.toLowerCase();
  const itemCategoryLower = item.category.toLowerCase();
  const itemIngredientsLower = item.ingredients?.map(i => i.toLowerCase()) || [];

  // Allergy Check
  const foundAllergies = userProfile.allergies.filter(allergy => {
    const name = allergy.name.toLowerCase();
    return itemNameLower.includes(name) || 
           itemCategoryLower.includes(name) ||
           itemIngredientsLower.some(ing => ing.includes(name));
  });

  const hasAllergyConflict = foundAllergies.length > 0;
  const highestSeverity = foundAllergies.reduce((max, a) => {
    if (a.severity === AllergySeverity.SEVERE) return AllergySeverity.SEVERE;
    if (a.severity === AllergySeverity.MODERATE && max !== AllergySeverity.SEVERE) return AllergySeverity.MODERATE;
    return max;
  }, AllergySeverity.MILD);

  // Health Condition Check
  const foundHealthConcerns = (userProfile.healthConditions || []).filter(condition => {
    const prohibited = HEALTH_CONCERNS_MAP[condition] || [];
    return prohibited.some(p => 
      itemNameLower.includes(p) || 
      itemIngredientsLower.some(ing => ing.includes(p))
    );
  }).map(condition => ({
    condition,
    matches: (HEALTH_CONCERNS_MAP[condition] || []).filter(p => 
      itemNameLower.includes(p) || 
      itemIngredientsLower.some(ing => ing.includes(p))
    )
  }));

  const getAllergyAlertStyle = (severity: AllergySeverity) => {
    switch (severity) {
      case AllergySeverity.MILD: return 'bg-yellow-50 border-yellow-500 text-yellow-800';
      case AllergySeverity.MODERATE: return 'bg-orange-50 border-orange-500 text-orange-800';
      case AllergySeverity.SEVERE: return 'bg-red-50 border-red-500 text-red-800';
      default: return 'bg-gray-50 border-gray-500 text-gray-800';
    }
  };

  const handleSave = () => {
    if (!editForm.name.trim()) return;
    
    const isoDate = new Date(editForm.expiryDate).toISOString();
    onUpdate(item.id, {
      name: editForm.name,
      quantity: editForm.quantity,
      location: editForm.location,
      category: editForm.category,
      expiryDate: isoDate,
      status: calculateExpiryStatus(isoDate)
    });
    setIsEditing(false);
  };

  const getCategoryEmoji = (category: string) => {
    switch(category) {
      case 'Dairy': return '🥛';
      case 'Meat': return '🍗';
      case 'Vegetables': return '🥬';
      case 'Fruits': return '🍎';
      case 'Bakery': return '🥐';
      case 'Grains': return '🍞';
      case 'Snacks': return '🥨';
      case 'Beverages': return '🥤';
      default: return '📦';
    }
  };

  return (
    <div className="fixed inset-0 z-[140] flex flex-col bg-gray-50 animate-in slide-in-from-bottom duration-300">
      <header className="bg-white border-b px-6 py-4 flex justify-between items-center sticky top-0 z-10 shadow-sm">
        <h2 className="text-lg font-black text-gray-800 uppercase tracking-tight">
          {isEditing ? 'Modify Item' : 'Item Details'}
        </h2>
        <div className="flex items-center space-x-2">
          {!isEditing && (
            <button 
              onClick={() => setIsEditing(true)} 
              className="p-2.5 bg-[#2980B9]/10 rounded-full text-[#2980B9] transition-all active:scale-90"
            >
              <PencilSquareIcon className="w-5 h-5" />
            </button>
          )}
          <button onClick={onClose} className="p-2.5 bg-gray-100 rounded-full text-gray-400 transition-all active:scale-90">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Visual Header */}
        <div className="aspect-video bg-white rounded-[2.5rem] overflow-hidden shadow-sm border border-gray-100 relative group flex items-center justify-center">
          {item.image ? (
            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 p-8 text-center bg-gray-50">
              {isGeneratingImage ? (
                <div className="flex flex-col items-center space-y-3">
                  <div className="relative">
                    <div className="w-12 h-12 border-4 border-fresh-green/20 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-fresh-green border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  <p className="text-[10px] font-black text-fresh-green uppercase tracking-widest animate-pulse">Rendering AI Visual...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center space-y-4">
                  <div className="bg-white p-4 rounded-3xl shadow-sm">
                    <SparklesIcon className="w-8 h-8 text-gray-200" />
                  </div>
                  <button 
                    onClick={handleGenerateImage}
                    className="bg-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border border-gray-100 shadow-sm active:scale-95 transition-all text-gray-400"
                  >
                    Generate Visual
                  </button>
                </div>
              )}
            </div>
          )}
          
          {item.image && !isEditing && (
            <div className="absolute top-4 left-4 flex items-center space-x-2">
              <div className="bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center space-x-2 shadow-sm border border-white/50">
                <ShieldCheckIcon className="w-4 h-4 text-fresh-green" />
                <span className="text-[10px] font-black text-gray-700 uppercase tracking-tighter">Inventory Verified</span>
              </div>
            </div>
          )}
        </div>

        {/* Safety Alerts (Only in View Mode) */}
        {!isEditing && (
          <>
            {hasAllergyConflict && (
              <div className={`border-2 rounded-[2rem] p-5 flex items-start space-x-4 animate-in fade-in zoom-in duration-300 ${getAllergyAlertStyle(highestSeverity)}`}>
                <div className="p-2 bg-white/30 rounded-xl shrink-0"><ExclamationTriangleIcon className="w-6 h-6" /></div>
                <div>
                  <h3 className="font-black text-sm leading-tight uppercase tracking-tight">Safety Alert: {highestSeverity}</h3>
                  <p className="text-[11px] font-bold mt-1 opacity-80 uppercase tracking-tighter">Match detected: {foundAllergies.map(a => a.name).join(', ')}</p>
                </div>
              </div>
            )}
            {foundHealthConcerns.length > 0 && (
              <div className="bg-blue-50 border border-blue-100 rounded-[2rem] p-5 flex items-start space-x-4">
                <div className="p-2 bg-[#2980B9] text-white rounded-xl shrink-0"><HeartIcon className="w-6 h-6" /></div>
                <div className="flex-1">
                  <h3 className="font-black text-sm text-[#2980B9] uppercase tracking-tight">Dietary Advisory</h3>
                  <div className="space-y-1 mt-2">
                    {foundHealthConcerns.map((concern, idx) => (
                      <p key={idx} className="text-[10px] font-bold text-blue-700 uppercase tracking-tighter">
                        • {concern.condition} Conflict ({concern.matches.join(', ')})
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Item Info Card */}
        <div className="bg-white p-7 rounded-[2.5rem] shadow-sm border border-gray-100 space-y-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-3xl shadow-inner shrink-0">
              {getCategoryEmoji(isEditing ? editForm.category : item.category)}
            </div>
            <div className="flex-1 min-w-0">
              {isEditing ? (
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Product Name</label>
                  <input 
                    className="w-full text-lg font-black text-gray-900 border-b-2 border-fresh-green focus:outline-none bg-transparent py-1 uppercase tracking-tight"
                    value={editForm.name}
                    onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                  />
                </div>
              ) : (
                <div className="space-y-1">
                  <h1 className="text-xl font-black text-gray-800 truncate uppercase tracking-tight">{item.name}</h1>
                  <div className="flex items-center space-x-2">
                    <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${priority.bgColor} ${priority.color} ${priority.borderColor} uppercase`}>
                      {priority.label}
                    </span>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">In stock since {new Date(item.addedDate).toLocaleDateString()}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <DetailRow 
              icon={<CalendarIcon className="w-5 h-5" />} 
              label="Expiry Date" 
              isEditing={isEditing} 
              value={new Date(item.expiryDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()} 
              input={<input type="date" className="w-full text-xs font-black bg-gray-50 p-3 rounded-xl outline-none border border-gray-100" value={editForm.expiryDate} onChange={(e) => setEditForm({...editForm, expiryDate: e.target.value})} />} 
            />
            <DetailRow 
              icon={<MapPinIcon className="w-5 h-5" />} 
              label="Storage Location" 
              isEditing={isEditing} 
              value={item.location.toUpperCase()} 
              input={<select className="w-full text-xs font-black bg-gray-50 p-3 rounded-xl outline-none border border-gray-100" value={editForm.location} onChange={(e) => setEditForm({...editForm, location: e.target.value as any})} >{Object.values(StorageLocation).map(l => <option key={l} value={l}>{l.toUpperCase()}</option>)}</select>} 
            />
            <DetailRow 
              icon={<ScaleIcon className="w-5 h-5" />} 
              label="Current Quantity" 
              isEditing={isEditing} 
              value={item.quantity.toUpperCase()} 
              input={<input className="w-full text-xs font-black bg-gray-50 p-3 rounded-xl outline-none border border-gray-100" value={editForm.quantity} onChange={(e) => setEditForm({...editForm, quantity: e.target.value})} placeholder="e.g. 500G" />} 
            />
            {isEditing && (
              <DetailRow 
                icon={<Squares2X2Icon className="w-5 h-5" />} 
                label="Food Category" 
                isEditing={true} 
                value={item.category} 
                input={<select className="w-full text-xs font-black bg-gray-50 p-3 rounded-xl outline-none border border-gray-100" value={editForm.category} onChange={(e) => setEditForm({...editForm, category: e.target.value})} >{CATEGORIES.map(c => <option key={c} value={c}>{c.toUpperCase()}</option>)}</select>} 
              />
            )}
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="pt-4 pb-12 space-y-4">
          {isEditing ? (
            <div className="flex space-x-3">
              <button 
                onClick={() => setIsEditing(false)} 
                className="flex-1 py-4.5 rounded-[1.8rem] bg-gray-100 text-gray-400 font-black text-xs uppercase tracking-widest active:scale-95 transition-all"
              >
                Discard
              </button>
              <button 
                onClick={handleSave} 
                className="flex-1 py-4.5 rounded-[1.8rem] bg-[#2ECC71] text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-green-100 flex items-center justify-center space-x-2 active:scale-95 transition-all"
              >
                <CheckIcon className="w-5 h-5" />
                <span>Save Changes</span>
              </button>
            </div>
          ) : (
            <>
              <button 
                onClick={() => setIsEditing(true)} 
                className="w-full py-4.5 rounded-[1.8rem] bg-[#2980B9] text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-100 flex items-center justify-center space-x-2 active:scale-95 transition-all"
              >
                <PencilSquareIcon className="w-5 h-5" />
                <span>Edit Item Details</span>
              </button>
              <button 
                onClick={() => onDelete(item.id)} 
                className="w-full py-4.5 rounded-[1.8rem] bg-white border border-red-50 text-red-500 font-black text-xs uppercase tracking-widest active:scale-95 transition-all"
              >
                Remove from Kitchen
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const DetailRow: React.FC<{ icon: React.ReactNode, label: string, value: string, isEditing?: boolean, input?: React.ReactNode }> = ({ icon, label, value, isEditing, input }) => (
  <div className="flex items-center space-x-4 p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
    <div className="text-gray-300 bg-white p-2 rounded-xl shadow-sm border border-gray-50">{icon}</div>
    <div className="flex-1 min-w-0">
      <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.15em] mb-0.5">{label}</p>
      {isEditing ? input : <p className="text-xs font-black text-gray-800 tracking-tight">{value}</p>}
    </div>
  </div>
);

export default ItemDetails;
