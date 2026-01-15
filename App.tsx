
import React, { useState, useEffect, useRef } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Scanner from './components/Scanner';
import RecipesView from './components/RecipesView';
import ItemDetails from './components/ItemDetails';
import ManualEntry from './components/ManualEntry';
import AnalyticsView from './components/AnalyticsView';
import ShoppingList from './components/ShoppingList';
import ProfileView from './components/ProfileView';
import FamilyManagement from './components/FamilyManagement';
import LiveAssistant from './components/LiveAssistant';
import ChatAssistant from './components/ChatAssistant';
import InventoryView from './components/InventoryView';
import LoginView from './components/LoginView';
import { FoodItem, ExpiryStatus, UserProfile, StorageLocation, AllergySeverity, UserSettings, FamilyMember } from './types';
import { MOCK_ITEMS } from './constants';
import { calculateExpiryStatus, calculatePriority } from './utils';
import { 
  ExclamationTriangleIcon,
  SparklesIcon,
  CpuChipIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const DEFAULT_SETTINGS: UserSettings = {
  notifications: {
    expiryReminders: true,
    reminderTiming: 3,
    allergyRiskAlerts: true,
    leftoverExpiryAlerts: true,
    donationReminders: true,
  },
  appearance: {
    darkMode: false,
    textSize: 'Medium',
    accentColor: '#2ECC71',
  },
  language: {
    appLanguage: 'English',
    dateFormat: 'DD/MM',
    timeFormat: '12h',
  },
  privacy: {
    appLock: false,
    hideAllergyInfo: false,
    dataSharing: true,
  },
  smartFeatures: {
    aiRecipeSuggestions: true,
    cameraAutoDetect: true,
    storageExpiryPrediction: true,
  },
  family: {
    sharing: true,
    emergencySync: true,
    childSafety: false,
  },
  backup: {
    cloudBackup: true,
    syncFrequency: 'Daily',
  },
};

const App: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('expronix_auth') === 'true';
  });
  const [activeTab, setActiveTab] = useState('dashboard');
  const [inventory, setInventory] = useState<FoodItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<FoodItem | null>(null);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [isChatAssistantOpen, setIsChatAssistantOpen] = useState(false);
  const [isBuildModalOpen, setIsBuildModalOpen] = useState(false);
  const [buildProgress, setBuildProgress] = useState(0);
  const [buildLogs, setBuildLogs] = useState<string[]>([]);
  
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('expronix_user_profile');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      name: 'John Doe',
      email: 'john@example.com',
      allergies: [
        { name: 'Dairy', severity: AllergySeverity.SEVERE },
        { name: 'Peanuts', severity: AllergySeverity.MODERATE }
      ],
      healthConditions: ['Diabetes'],
      householdSize: 2,
      age: 28,
      bloodGroup: 'O+',
      emergencyContact: '+1 (555) 123-4567',
      settings: DEFAULT_SETTINGS,
      familyMembers: []
    };
  });

  useEffect(() => {
    // Hide splash screen after 2.5 seconds
    const timer = setTimeout(() => setShowSplash(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    localStorage.setItem('expronix_user_profile', JSON.stringify(userProfile));
    document.body.classList.remove('dark-mode', 'dark');
    const textSize = userProfile.settings?.appearance.textSize || 'Medium';
    document.body.classList.remove('text-size-small', 'text-size-medium', 'text-size-large');
    document.body.classList.add(`text-size-${textSize.toLowerCase()}`);
  }, [userProfile]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('expronix_inventory');
      let initialInventory: FoodItem[] = [];
      if (saved) {
        initialInventory = JSON.parse(saved);
      } else {
        initialInventory = MOCK_ITEMS.map(item => ({
          ...item,
          ingredients: item.ingredients || [item.name || '']
        })) as FoodItem[];
      }
      setInventory(initialInventory.map(item => ({
        ...item,
        status: calculateExpiryStatus(item.expiryDate)
      })));
    } catch (e) {
      setInventory([]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('expronix_inventory', JSON.stringify(inventory));
  }, [inventory]);

  const handleLogin = () => {
    localStorage.setItem('expronix_auth', 'true');
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('expronix_auth');
    setIsAuthenticated(false);
  };

  const startBuildSimulation = () => {
    setIsBuildModalOpen(true);
    setBuildProgress(0);
    setBuildLogs(["[READY] Initializing Expronix Build Pipeline..."]);
    
    const logs = [
      "[INFO] Bundling assets for Android...",
      "[INFO] Optimizing UI components...",
      "[INFO] Linking Gemini AI Service...",
      "[INFO] Encrypting local database...",
      "[INFO] Generating manifest for Android Studio...",
      "[SUCCESS] Build complete. Syncing to Cloud...",
      "[SYNC] Uploading metadata to server...",
      "[FINAL] Project deployed to Android Studio context."
    ];

    let currentLog = 0;
    const interval = setInterval(() => {
      setBuildProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        if (prev % 12 === 0 && currentLog < logs.length) {
          setBuildLogs(l => [...l, logs[currentLog]]);
          currentLog++;
        }
        return prev + 1;
      });
    }, 50);
  };

  if (showSplash) {
    return (
      <div className="fixed inset-0 bg-[#2ECC71] z-[999] flex flex-col items-center justify-center text-white animate-in fade-in duration-500">
        <div className="relative">
          <SparklesIcon className="w-24 h-24 animate-pulse" />
          <div className="absolute inset-0 bg-white rounded-full blur-3xl opacity-20 animate-pulse"></div>
        </div>
        <h1 className="text-4xl font-black mt-8 tracking-tighter uppercase">Expronix</h1>
        <p className="text-[10px] font-bold uppercase tracking-[0.5em] mt-2 opacity-60">Pantry Intelligence</p>
        <div className="absolute bottom-12 flex flex-col items-center space-y-4">
          <div className="w-32 h-1 bg-white/20 rounded-full overflow-hidden">
            <div className="h-full bg-white w-1/2 animate-[loading_2s_ease-in-out_infinite]"></div>
          </div>
          <p className="text-[8px] font-black uppercase tracking-widest opacity-40">Built with Gemini AI</p>
        </div>
        <style>{`
          @keyframes loading {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(200%); }
          }
        `}</style>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginView onLogin={handleLogin} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard items={inventory} onSelectItem={(id) => setSelectedItem(inventory.find(i => i.id === id) || null)} onViewInsights={() => setActiveTab('analytics')} />;
      case 'inventory':
        return <InventoryView inventory={inventory} searchQuery={searchQuery} setSearchQuery={setSearchQuery} onSelectItem={setSelectedItem} />;
      case 'scanner':
        return <Scanner onItemsFound={(items) => { setInventory(prev => [...items, ...prev]); setActiveTab('inventory'); }} onCancel={() => setActiveTab('dashboard')} onManualEntry={() => setActiveTab('manual-entry')} />;
      case 'manual-entry':
        return <ManualEntry onSave={(item) => { setInventory(prev => [item, ...prev]); setActiveTab('inventory'); }} onCancel={() => setActiveTab('dashboard')} />;
      case 'recipes':
        return <RecipesView inventory={inventory} userProfile={userProfile} />;
      case 'profile':
        return <ProfileView userProfile={userProfile} onTabSelect={setActiveTab} onUpdateProfile={(u) => setUserProfile(p => ({ ...p, ...u }))} onOpenChat={() => setIsChatAssistantOpen(true)} onSync={startBuildSimulation} onLogout={handleLogout} />;
      case 'family':
        return <FamilyManagement userProfile={userProfile} onUpdateProfile={(u) => setUserProfile(p => ({ ...p, ...u }))} onBack={() => setActiveTab('profile')} />;
      case 'analytics':
        return <AnalyticsView inventory={inventory} onBack={() => setActiveTab('dashboard')} />;
      case 'shopping':
        return <ShoppingList inventory={inventory} />;
      default:
        return <Dashboard items={inventory} onSelectItem={() => {}} onViewInsights={() => setActiveTab('analytics')} />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab} onAssistantToggle={() => setIsAssistantOpen(!isAssistantOpen)} isAssistantActive={isAssistantOpen}>
      {renderContent()}

      {selectedItem && <ItemDetails item={selectedItem} userProfile={userProfile} onClose={() => setSelectedItem(null)} onDelete={setItemToDelete} onUpdate={(id, u) => setInventory(prev => prev.map(i => i.id === id ? { ...i, ...u } : i))} />}

      {isAssistantOpen && <LiveAssistant onClose={() => setIsAssistantOpen(false)} userProfile={userProfile} inventory={inventory} />}

      {isChatAssistantOpen && <ChatAssistant onClose={() => setIsChatAssistantOpen(false)} userProfile={userProfile} inventory={inventory} />}

      {/* Build Simulation Modal */}
      {isBuildModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-[#1C1C1E] w-full max-sm rounded-[2rem] overflow-hidden shadow-2xl border border-white/10 flex flex-col h-[70vh]">
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-[#2C2C2E]">
              <div className="flex items-center space-x-3">
                <CpuChipIcon className="w-5 h-5 text-fresh-green" />
                <h3 className="text-sm font-black text-white uppercase tracking-widest">Mobile Sync Center</h3>
              </div>
              {buildProgress === 100 && (
                <button onClick={() => setIsBuildModalOpen(false)} className="p-1.5 bg-white/10 rounded-full text-white">
                  <XMarkIcon className="w-5 h-5" />
                </button>
              )}
            </div>

            <div className="flex-1 p-6 font-mono text-[10px] space-y-2 overflow-y-auto bg-black text-green-400">
              {buildLogs.map((log, i) => (
                <div key={i} className="animate-in slide-in-from-left duration-200">{log}</div>
              ))}
              {buildProgress < 100 && <div className="animate-pulse">_</div>}
            </div>

            <div className="p-8 bg-[#2C2C2E] border-t border-white/5 space-y-4">
              <div className="flex justify-between items-end mb-1">
                <span className="text-[10px] font-black text-white uppercase tracking-widest">Android Studio Build</span>
                <span className="text-[10px] font-black text-fresh-green">{buildProgress}%</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-fresh-green transition-all duration-300" style={{ width: `${buildProgress}%` }}></div>
              </div>
              
              {buildProgress === 100 ? (
                <div className="flex items-center justify-center space-x-2 text-fresh-green animate-in zoom-in duration-500">
                  <CheckCircleIcon className="w-5 h-5" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Synced Successfully</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2 text-gray-400">
                  <ArrowPathIcon className="w-4 h-4 animate-spin" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Uploading Assets...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {itemToDelete && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-xs rounded-3xl p-6 shadow-2xl animate-in zoom-in duration-200">
            <div className="flex items-center space-x-4 mb-4 text-red-600">
              <ExclamationTriangleIcon className="w-6 h-6" />
              <h3 className="text-lg font-bold">Delete Item?</h3>
            </div>
            <div className="flex space-x-3">
              <button onClick={() => setItemToDelete(null)} className="flex-1 py-3 text-sm font-bold text-gray-400">Cancel</button>
              <button onClick={() => { setInventory(prev => prev.filter(item => item.id !== itemToDelete)); setItemToDelete(null); setSelectedItem(null); }} className="flex-1 py-3 text-sm font-bold bg-red-600 text-white rounded-xl">Delete</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default App;
