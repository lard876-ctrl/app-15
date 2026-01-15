
import React, { useState } from 'react';
import { UserProfile, AllergySeverity, Allergy, UserSettings } from '../types';
import { exportToCSV } from '../utils';
import { 
  ChartBarIcon, 
  ClipboardDocumentListIcon, 
  ChevronRightIcon,
  ExclamationTriangleIcon,
  UsersIcon,
  BellIcon,
  Cog6ToothIcon,
  PencilSquareIcon,
  XMarkIcon,
  CheckIcon,
  CameraIcon,
  PlusIcon,
  TrashIcon,
  HeartIcon,
  ShieldCheckIcon,
  IdentificationIcon,
  PhoneIcon,
  QrCodeIcon,
  MoonIcon,
  SunIcon,
  GlobeAltIcon,
  LockClosedIcon,
  SparklesIcon,
  CloudArrowUpIcon,
  DocumentArrowDownIcon,
  InformationCircleIcon,
  StarIcon,
  AdjustmentsHorizontalIcon,
  ChatBubbleLeftRightIcon,
  CpuChipIcon,
  DevicePhoneMobileIcon
} from '@heroicons/react/24/outline';

interface ProfileViewProps {
  userProfile: UserProfile;
  onTabSelect: (tab: string) => void;
  onUpdateProfile: (updates: Partial<UserProfile>) => void;
  onOpenChat: () => void;
  onSync: () => void;
  onLogout: () => void;
}

const HEALTH_CONDITION_OPTIONS = ['Diabetes', 'BP', 'Pregnancy', 'Heart care', 'Cholesterol', 'Hypertension'];
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const ProfileView: React.FC<ProfileViewProps> = ({ userProfile, onTabSelect, onUpdateProfile, onOpenChat, onSync, onLogout }) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isEmergencyCardOpen, setIsEmergencyCardOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [editData, setEditData] = useState({
    name: userProfile.name,
    age: userProfile.age || 0,
    photo: userProfile.photo || '',
    allergies: [...userProfile.allergies],
    healthConditions: [...(userProfile.healthConditions || [])],
    bloodGroup: userProfile.bloodGroup || 'O+',
    emergencyContact: userProfile.emergencyContact || ''
  });

  const initials = userProfile.name 
    ? userProfile.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '??';

  const handleSaveProfile = () => {
    onUpdateProfile({
      name: editData.name,
      age: editData.age,
      photo: editData.photo,
      allergies: editData.allergies,
      healthConditions: editData.healthConditions,
      bloodGroup: editData.bloodGroup,
      emergencyContact: editData.emergencyContact
    });
    setIsEditModalOpen(false);
  };

  const updateSettings = (section: keyof UserSettings, key: string, value: any) => {
    if (!userProfile.settings) return;
    const newSettings = {
      ...userProfile.settings,
      [section]: {
        ...userProfile.settings[section],
        [key]: value
      }
    };
    onUpdateProfile({ settings: newSettings });
  };

  const toggleHealthCondition = (condition: string) => {
    setEditData(prev => ({
      ...prev,
      healthConditions: prev.healthConditions.includes(condition)
        ? prev.healthConditions.filter(c => c !== condition)
        : [...prev.healthConditions, condition]
    }));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditData({ ...editData, photo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const getSeverityStyle = (severity: AllergySeverity) => {
    switch (severity) {
      case AllergySeverity.MILD: return 'bg-yellow-100 text-yellow-600 border-yellow-200';
      case AllergySeverity.MODERATE: return 'bg-orange-100 text-orange-600 border-orange-200';
      case AllergySeverity.SEVERE: return 'bg-red-100 text-red-600 border-red-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
    `NAME: ${userProfile.name} | AGE: ${userProfile.age} | BLOOD: ${userProfile.bloodGroup} | ALLERGIES: ${userProfile.allergies.map(a => `${a.name}(${a.severity})`).join(', ')} | EMERGENCY: ${userProfile.emergencyContact}`
  )}`;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Profile Header Card */}
      <div className="bg-white p-8 rounded-[2.5rem] border text-center shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50 rounded-full -mr-16 -mt-16"></div>
        <div className="relative inline-block mb-4">
          <div className="w-24 h-24 bg-[#E8F8EF] rounded-[2rem] flex items-center justify-center text-[#2ECC71] text-4xl font-black shadow-inner overflow-hidden border-2 border-white">
            {userProfile.photo ? <img src={userProfile.photo} className="w-full h-full object-cover" /> : initials}
          </div>
          <button onClick={() => setIsEditModalOpen(true)} className="absolute -bottom-1 -right-1 p-1.5 bg-white rounded-full shadow-md border border-gray-100 text-[#2ECC71]">
            <PencilSquareIcon className="w-4 h-4" />
          </button>
        </div>
        <h3 className="text-xl font-black text-gray-800">{userProfile.name}</h3>
        <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] mt-1">Premium Member • {userProfile.age} YEARS OLD</p>
      </div>
      
      {/* Production Center Section (New) */}
      <div className="space-y-4">
        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-4">Production Hub</h4>
        <div className="bg-gradient-to-br from-[#2ECC71] to-[#2980B9] p-6 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center space-x-2 mb-3">
              <CpuChipIcon className="w-4 h-4 text-white/80" />
              <span className="text-[9px] font-black uppercase tracking-widest">Android Studio Pipeline</span>
            </div>
            <h3 className="text-lg font-black leading-tight mb-4">Sync App Project to Mobile Cloud</h3>
            <button 
              onClick={onSync}
              className="bg-white text-[#2ECC71] px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all flex items-center space-x-2"
            >
              <DevicePhoneMobileIcon className="w-4 h-4" />
              <span>Launch Build Sync</span>
            </button>
          </div>
          <div className="absolute right-0 bottom-0 opacity-10 rotate-12 -mr-8 -mb-8">
            <SparklesIcon className="w-32 h-32" />
          </div>
        </div>
      </div>

      {/* Advanced Stats */}
      <div className="space-y-4">
        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-4">Advanced Stats</h4>
        <div className="grid grid-cols-2 gap-4">
          <button onClick={() => onTabSelect('analytics')} className="bg-white p-6 rounded-[2rem] border border-gray-50 shadow-sm flex flex-col items-center">
            <ChartBarIcon className="w-8 h-8 text-[#2980B9] mb-2" />
            <span className="text-[11px] font-black text-gray-700 uppercase tracking-tight">Analytics</span>
          </button>
          <button onClick={() => onTabSelect('shopping')} className="bg-white p-6 rounded-[2rem] border border-gray-50 shadow-sm flex flex-col items-center">
            <ClipboardDocumentListIcon className="w-8 h-8 text-[#2ECC71] mb-2" />
            <span className="text-[11px] font-black text-gray-700 uppercase tracking-tight">Shopping List</span>
          </button>
        </div>
      </div>

      {/* App Settings */}
      <div className="space-y-4">
        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-4">App Settings</h4>
        <div className="bg-white rounded-[2rem] border border-gray-50 shadow-sm overflow-hidden">
          <MenuButton onClick={() => setIsSettingsOpen(true)} icon={<AdjustmentsHorizontalIcon className="w-5 h-5" />} label="Configure Preferences" />
          <MenuButton onClick={onOpenChat} icon={<ChatBubbleLeftRightIcon className="w-5 h-5" />} label="Launch AI Chat" />
          <MenuButton onClick={() => onTabSelect('family')} icon={<UsersIcon className="w-5 h-5" />} label="Family Management" />
          <button onClick={onLogout} className="w-full text-left px-6 py-5 text-red-500 font-black text-[11px] uppercase tracking-widest active:bg-red-50">Sign Out</button>
        </div>
      </div>

      {/* Health Section */}
      <div className="space-y-4 pb-12">
        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-4">Personal Health</h4>
        <div className="bg-white rounded-[2rem] border border-gray-50 shadow-sm divide-y divide-gray-50">
          <div className="px-6 py-6 space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <ExclamationTriangleIcon className="w-4 h-4 text-orange-400" />
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Allergies</span>
              </div>
              <button onClick={() => setIsEmergencyCardOpen(true)} className="text-[9px] font-black text-[#2ECC71] uppercase tracking-tighter">Emergency Card</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {userProfile.allergies.map(a => (
                <span key={a.name} className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter flex items-center ${getSeverityStyle(a.severity)}`}>
                  {a.name}
                </span>
              ))}
            </div>
          </div>
          <div className="px-6 py-6 space-y-4">
            <div className="flex items-center space-x-2">
              <HeartIcon className="w-4 h-4 text-[#2980B9]" />
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Health Conditions</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {userProfile.healthConditions.map(c => (
                <span key={c} className="bg-blue-50 text-[#2980B9] px-4 py-1.5 rounded-full text-[10px] font-black border border-blue-100 uppercase tracking-tighter">{c}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Card Modal */}
      {isEmergencyCardOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in duration-500">
            <div className="bg-red-600 px-8 py-6 text-white flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <ExclamationTriangleIcon className="w-8 h-8" />
                <h3 className="text-lg font-black uppercase tracking-tighter leading-none">Medical Alert<br/><span className="text-xs opacity-80 font-bold">EMERGENCY CARD</span></h3>
              </div>
              <button onClick={() => setIsEmergencyCardOpen(false)} className="p-2 bg-white/20 rounded-full"><XMarkIcon className="w-6 h-6" /></button>
            </div>
            <div className="p-8 space-y-8">
              <div className="flex items-center space-x-4 border-b pb-6">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl overflow-hidden shadow-inner flex items-center justify-center">
                  {userProfile.photo ? <img src={userProfile.photo} className="w-full h-full object-cover" /> : initials}
                </div>
                <div>
                  <h4 className="text-lg font-black text-gray-900">{userProfile.name}</h4>
                  <p className="text-[10px] font-black text-red-600 uppercase">BLOOD: {userProfile.bloodGroup}</p>
                </div>
              </div>
              <img src={qrCodeUrl} className="w-32 h-32 mx-auto" alt="Emergency QR" />
              <div className="bg-gray-50 p-5 rounded-[1.5rem] border text-center">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Primary Contact</span>
                <p className="text-lg font-black text-gray-900">{userProfile.emergencyContact}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings Panel */}
      {isSettingsOpen && userProfile.settings && (
        <div className="fixed inset-0 z-[120] bg-gray-50 overflow-y-auto animate-in slide-in-from-right duration-300">
          <header className="bg-white border-b px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
            <button onClick={() => setIsSettingsOpen(false)} className="p-2 bg-gray-50 rounded-full">
              <ChevronRightIcon className="w-5 h-5 rotate-180 text-gray-400" />
            </button>
            <h2 className="text-lg font-black text-gray-800 uppercase tracking-tight">Settings</h2>
            <div className="w-10"></div>
          </header>
          <div className="p-6 space-y-8 pb-32">
            <SettingsSection title="Appearance" icon={<AdjustmentsHorizontalIcon className="w-5 h-5 text-purple-500" />}>
              <ToggleRow label="Dark mode" value={userProfile.settings.appearance.darkMode} onChange={(v) => updateSettings('appearance', 'darkMode', v)} />
              <div className="flex items-center justify-between py-3">
                <span className="text-sm font-bold text-gray-700">Text size</span>
                <select className="bg-gray-100 px-3 py-1 rounded-lg text-xs font-black" value={userProfile.settings.appearance.textSize} onChange={(e) => updateSettings('appearance', 'textSize', e.target.value)}>
                  {['Small', 'Medium', 'Large'].map(sz => <option key={sz} value={sz}>{sz.toUpperCase()}</option>)}
                </select>
              </div>
            </SettingsSection>
            <SettingsSection title="Smart Features" icon={<SparklesIcon className="w-5 h-5 text-yellow-500" />}>
              <ToggleRow label="AI recipes" value={userProfile.settings.smartFeatures.aiRecipeSuggestions} onChange={(v) => updateSettings('smartFeatures', 'aiRecipeSuggestions', v)} />
              <ToggleRow label="Cloud Sync" value={userProfile.settings.backup.cloudBackup} onChange={(v) => updateSettings('backup', 'cloudBackup', v)} />
            </SettingsSection>
          </div>
        </div>
      )}

      {/* Edit Modal (Reduced for space) */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white w-full max-sm rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-black text-gray-800 uppercase tracking-tighter">Edit Profile</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="p-2 bg-gray-50 rounded-full"><XMarkIcon className="w-6 h-6" /></button>
            </div>
            <div className="space-y-6">
              <input type="text" className="w-full bg-gray-50 p-4 rounded-2xl border font-black" value={editData.name} onChange={(e) => setEditData({ ...editData, name: e.target.value })} placeholder="Full Name" />
              <button onClick={handleSaveProfile} className="w-full bg-[#2ECC71] text-white py-4 rounded-2xl font-black shadow-lg">Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const SettingsSection: React.FC<{ title: string, icon: React.ReactNode, children: React.ReactNode }> = ({ title, icon, children }) => (
  <div className="space-y-4">
    <div className="flex items-center space-x-3 ml-2">
      <div className="bg-white p-2 rounded-xl shadow-sm border border-gray-50">{icon}</div>
      <h3 className="text-[12px] font-black text-gray-800 uppercase tracking-widest">{title}</h3>
    </div>
    <div className="bg-white rounded-[2rem] border border-gray-50 shadow-sm p-6 divide-y divide-gray-50">{children}</div>
  </div>
);

const ToggleRow: React.FC<{ label: string, value: boolean, onChange: (v: boolean) => void }> = ({ label, value, onChange }) => (
  <div className="flex items-center justify-between py-3">
    <span className="text-sm font-bold text-gray-700">{label}</span>
    <button onClick={() => onChange(!value)} className={`w-10 h-5 rounded-full relative transition-all duration-300 ${value ? 'bg-[#2ECC71]' : 'bg-gray-200'}`}>
      <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all duration-300 ${value ? 'left-5.5' : 'left-0.5'}`}></div>
    </button>
  </div>
);

const MenuButton: React.FC<{ icon: React.ReactNode, label: string, onClick?: () => void }> = ({ icon, label, onClick }) => (
  <button onClick={onClick} className="w-full text-left px-6 py-5 flex justify-between items-center active:bg-gray-50 border-b last:border-0 group">
    <div className="flex items-center space-x-4">
      <div className="text-gray-300 group-hover:text-[#2ECC71]">{icon}</div>
      <span className="text-sm font-black text-gray-700 uppercase tracking-tight">{label}</span>
    </div>
    <ChevronRightIcon className="w-4 h-4 text-gray-300 group-hover:text-[#2ECC71]" />
  </button>
);

export default ProfileView;
