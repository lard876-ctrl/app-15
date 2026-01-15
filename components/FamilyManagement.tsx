
import React, { useState } from 'react';
import { UserProfile, FamilyMember, AllergySeverity, Allergy } from '../types';
import { 
  ArrowLeftIcon, 
  PlusIcon, 
  TrashIcon, 
  XMarkIcon, 
  UserPlusIcon, 
  ExclamationTriangleIcon, 
  HeartIcon, 
  CheckIcon,
  BellIcon,
  BellSlashIcon,
  IdentificationIcon
} from '@heroicons/react/24/outline';

interface FamilyManagementProps {
  userProfile: UserProfile;
  onUpdateProfile: (updates: Partial<UserProfile>) => void;
  onBack: () => void;
}

const HEALTH_OPTIONS = ['Diabetes', 'BP', 'Pregnancy', 'Heart care', 'Cholesterol', 'Hypertension'];
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const FamilyManagement: React.FC<FamilyManagementProps> = ({ userProfile, onUpdateProfile, onBack }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);
  const [formData, setFormData] = useState<Partial<FamilyMember>>({
    name: '',
    age: 0,
    bloodGroup: 'O+',
    allergies: [],
    healthConditions: [],
    alertsEnabled: true
  });

  const handleSaveMember = () => {
    if (!formData.name) return;

    let updatedMembers = [...(userProfile.familyMembers || [])];
    if (editingMember) {
      updatedMembers = updatedMembers.map(m => m.id === editingMember.id ? { ...m, ...formData } as FamilyMember : m);
    } else {
      updatedMembers.push({
        ...formData,
        id: Math.random().toString(36).substr(2, 9),
      } as FamilyMember);
    }

    onUpdateProfile({ familyMembers: updatedMembers });
    resetForm();
  };

  const handleDeleteMember = (id: string) => {
    onUpdateProfile({ 
      familyMembers: (userProfile.familyMembers || []).filter(m => m.id !== id) 
    });
  };

  const resetForm = () => {
    setIsAdding(false);
    setEditingMember(null);
    setFormData({
      name: '',
      age: 0,
      bloodGroup: 'O+',
      allergies: [],
      healthConditions: [],
      alertsEnabled: true
    });
  };

  const toggleCondition = (condition: string) => {
    setFormData(prev => ({
      ...prev,
      healthConditions: prev.healthConditions?.includes(condition)
        ? prev.healthConditions.filter(c => c !== condition)
        : [...(prev.healthConditions || []), condition]
    }));
  };

  const toggleAlerts = (memberId: string) => {
    const updated = (userProfile.familyMembers || []).map(m => 
      m.id === memberId ? { ...m, alertsEnabled: !m.alertsEnabled } : m
    );
    onUpdateProfile({ familyMembers: updated });
  };

  return (
    <div className="flex flex-col min-h-full bg-white animate-in fade-in duration-300 -mt-4 -mx-4">
      {/* Introduction Banner */}
      <div className="bg-[#E8F8EF] p-8 rounded-b-[3rem] text-center space-y-4 shadow-sm">
        <div className="bg-white w-16 h-16 rounded-3xl flex items-center justify-center mx-auto shadow-sm">
          <UserPlusIcon className="w-8 h-8 text-fresh-green" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-black text-gray-800 tracking-tight">Family Management</h2>
          <p className="text-sm text-gray-600 leading-relaxed max-w-[280px] mx-auto font-medium">
            Manage profiles of your family members to ensure personalized allergy safety and health alerts.
          </p>
        </div>
      </div>

      <div className="p-6 space-y-8">
        {/* Features Checklist */}
        {!isAdding && !editingMember && (
          <div className="grid grid-cols-1 gap-4 bg-gray-50/50 p-6 rounded-[2rem] border border-gray-100">
            {[
              { icon: '➕', text: 'Add family members' },
              { icon: '🚨', text: 'Set allergies & severity' },
              { icon: '❤️', text: 'Add health conditions' },
              { icon: '📇', text: 'View emergency details' },
              { icon: '🔔', text: 'Control alerts per member' },
            ].map((item, i) => (
              <div key={i} className="flex items-center space-x-3">
                <span className="text-lg">{item.icon}</span>
                <span className="text-sm font-bold text-gray-700">{item.text}</span>
              </div>
            ))}
          </div>
        )}

        {/* Action Button / Form Toggle */}
        {!isAdding && !editingMember && (
          <button 
            onClick={() => setIsAdding(true)}
            className="w-full bg-fresh-green text-white py-4 rounded-2xl font-black shadow-lg shadow-green-100 flex items-center justify-center space-x-2 active:scale-95 transition-all"
          >
            <PlusIcon className="w-5 h-5" />
            <span>ADD FAMILY MEMBER</span>
          </button>
        )}

        {/* Members List */}
        {!isAdding && !editingMember && (
          <div className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-4">Family Profiles</h3>
            {(userProfile.familyMembers || []).length === 0 ? (
              <div className="text-center py-12 bg-white rounded-[2rem] border-2 border-dashed border-gray-100">
                <p className="text-gray-400 font-bold text-xs">No family profiles added yet.</p>
              </div>
            ) : (
              (userProfile.familyMembers || []).map(member => (
                <div key={member.id} className="bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm flex items-center space-x-4">
                  <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-[#2ECC71] text-xl font-black shrink-0">
                    {member.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-black text-gray-800 truncate">{member.name}</h4>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-[9px] font-black text-gray-400 uppercase">{member.age} Yrs</span>
                      <span className="text-[9px] font-black text-red-500 bg-red-50 px-1.5 py-0.5 rounded-full border border-red-100 uppercase tracking-tighter">{member.bloodGroup}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => toggleAlerts(member.id)}
                      className={`p-2 rounded-xl border transition-all ${member.alertsEnabled ? 'bg-green-50 text-fresh-green border-green-100' : 'bg-gray-50 text-gray-400 border-gray-100'}`}
                    >
                      {member.alertsEnabled ? <BellIcon className="w-5 h-5" /> : <BellSlashIcon className="w-5 h-5" />}
                    </button>
                    <button 
                      onClick={() => { setEditingMember(member); setFormData(member); }}
                      className="p-2 bg-gray-50 text-gray-400 rounded-xl border border-gray-100"
                    >
                      <IdentificationIcon className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => handleDeleteMember(member.id)}
                      className="p-2 bg-red-50 text-red-500 rounded-xl border border-red-100"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Member Form (Add/Edit) */}
        {(isAdding || editingMember) && (
          <div className="space-y-6 animate-in slide-in-from-bottom duration-300 bg-white pb-32">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black text-gray-800 uppercase tracking-tighter">
                {editingMember ? 'Edit Profile' : 'New Profile'}
              </h3>
              <button onClick={resetForm} className="p-2 bg-gray-50 rounded-full text-gray-400">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Member Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Jane Doe"
                  className="w-full bg-gray-50 p-4 rounded-2xl border border-gray-100 focus:ring-2 focus:ring-[#2ECC71] outline-none font-black text-gray-800 text-sm"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Age</label>
                  <input 
                    type="number" 
                    className="w-full bg-gray-50 p-4 rounded-2xl border border-gray-100 focus:ring-2 focus:ring-[#2ECC71] outline-none font-black text-gray-800 text-sm"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Blood Group</label>
                  <select 
                    className="w-full bg-gray-50 p-4 rounded-2xl border border-gray-100 focus:ring-2 focus:ring-[#2ECC71] outline-none font-black text-gray-800 text-sm"
                    value={formData.bloodGroup}
                    onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                  >
                    {BLOOD_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Health Conditions</label>
                <div className="flex flex-wrap gap-2">
                  {HEALTH_OPTIONS.map(condition => (
                    <button
                      key={condition}
                      onClick={() => toggleCondition(condition)}
                      className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase transition-all border ${
                        formData.healthConditions?.includes(condition)
                          ? 'bg-[#2980B9] text-white border-[#2980B9]'
                          : 'bg-gray-50 text-gray-400 border-gray-100'
                      }`}
                    >
                      {condition}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Allergies</label>
                  <button 
                    onClick={() => setFormData({ 
                      ...formData, 
                      allergies: [...(formData.allergies || []), { name: '', severity: AllergySeverity.MODERATE }] 
                    })}
                    className="p-1 bg-[#2ECC71]/10 text-[#2ECC71] rounded-full"
                  >
                    <PlusIcon className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-2">
                  {(formData.allergies || []).map((allergy, idx) => (
                    <div key={idx} className="flex items-center space-x-2 bg-gray-50 p-3 rounded-2xl border border-gray-100">
                      <input 
                        type="text"
                        placeholder="e.g. Peanuts"
                        className="flex-1 bg-transparent border-none outline-none text-xs font-bold text-gray-700"
                        value={allergy.name}
                        onChange={(e) => {
                          const newAllergies = [...(formData.allergies || [])];
                          newAllergies[idx].name = e.target.value;
                          setFormData({ ...formData, allergies: newAllergies });
                        }}
                      />
                      <select 
                        className="bg-white text-[9px] font-black border-none rounded-lg p-1"
                        value={allergy.severity}
                        onChange={(e) => {
                          const newAllergies = [...(formData.allergies || [])];
                          newAllergies[idx].severity = e.target.value as AllergySeverity;
                          setFormData({ ...formData, allergies: newAllergies });
                        }}
                      >
                        <option value={AllergySeverity.MILD}>MILD</option>
                        <option value={AllergySeverity.MODERATE}>MODERATE</option>
                        <option value={AllergySeverity.SEVERE}>SEVERE</option>
                      </select>
                      <button 
                        onClick={() => {
                          const newAllergies = (formData.allergies || []).filter((_, i) => i !== idx);
                          setFormData({ ...formData, allergies: newAllergies });
                        }}
                        className="text-red-300"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <button 
                onClick={handleSaveMember}
                className="w-full bg-fresh-green text-white py-4 rounded-2xl font-black shadow-lg shadow-green-100 flex items-center justify-center space-x-2"
              >
                <CheckIcon className="w-6 h-6" />
                <span>SAVE PROFILE</span>
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="pb-12 text-center">
        <p className="text-[10px] text-gray-300 font-bold uppercase tracking-widest">
          Everyone's safety is our priority.
        </p>
      </div>
    </div>
  );
};

export default FamilyManagement;
