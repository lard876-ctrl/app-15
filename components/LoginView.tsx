
import React, { useState } from 'react';
import { 
  SparklesIcon, 
  EnvelopeIcon, 
  LockClosedIcon, 
  EyeIcon, 
  EyeSlashIcon,
  FingerPrintIcon
} from '@heroicons/react/24/outline';

interface LoginViewProps {
  onLogin: () => void;
}

const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      onLogin();
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 animate-in fade-in duration-700">
      {/* Branding - Matching Screenshot Style */}
      <div className="mb-10 text-center flex flex-col items-center">
        <div className="relative mb-6">
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#2ECC71] to-[#D1FAE5] flex items-center justify-center shadow-lg">
            <SparklesIcon className="w-10 h-10 text-white" />
          </div>
          {/* Small yellow accent circle from screenshot */}
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-300 rounded-full border-2 border-white shadow-sm"></div>
        </div>
        <h1 className="text-3xl font-black text-[#2C3E50] tracking-tight uppercase">Expronix</h1>
        <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em] mt-2">Intelligence In Your Pantry</p>
      </div>

      {/* Login Form Container */}
      <div className="w-full max-w-sm space-y-6">
        <div className="text-left mb-8 px-2">
          <h2 className="text-xl font-black text-[#2C3E50] tracking-tight">Welcome Back</h2>
          <p className="text-xs font-bold text-gray-400 mt-1">Sign in to manage your inventory</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            {/* Email Input - Pill style from screenshot */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                <EnvelopeIcon className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="email"
                required
                className="block w-full pl-12 pr-5 py-4 bg-[#E5E7EB]/50 border-none rounded-full text-sm font-bold text-gray-800 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2ECC71]/20 transition-all shadow-inner"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Password Input - Pill style from screenshot */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                <LockClosedIcon className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                required
                className="block w-full pl-12 pr-12 py-4 bg-[#E5E7EB]/50 border-none rounded-full text-sm font-bold text-gray-800 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2ECC71]/20 transition-all shadow-inner"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-5 flex items-center text-gray-300 hover:text-gray-500"
              >
                {showPassword ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between px-4">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input type="checkbox" className="w-3.5 h-3.5 rounded-sm border-gray-300 text-[#2ECC71] focus:ring-[#2ECC71]" />
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-tight">Remember me</span>
            </label>
            <button type="button" className="text-[10px] font-black text-[#2ECC71] uppercase tracking-tight">Forgot Password?</button>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-[#2ECC71] to-[#10B981] text-white py-4 rounded-full font-black text-[12px] uppercase tracking-[0.1em] shadow-xl shadow-green-200 active:scale-95 transition-all flex items-center justify-center space-x-3 disabled:opacity-70"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <span>Secure Login</span>
            )}
          </button>
        </form>

        {/* Order adjustment: Separator then Social Logins */}
        <div className="relative flex items-center justify-center py-2">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
          <span className="relative bg-white px-4 text-[9px] font-black text-gray-300 uppercase tracking-[0.2em]">Or continue with</span>
        </div>

        {/* Social Logins - Side by side pills from screenshot */}
        <div className="grid grid-cols-2 gap-3">
          <button className="flex items-center justify-center py-3 bg-[#E5E7EB]/50 rounded-lg active:scale-95 transition-all">
            <span className="text-[10px] font-black uppercase text-gray-600 tracking-widest">Google</span>
          </button>
          <button className="flex items-center justify-center py-3 bg-[#E5E7EB]/50 rounded-lg active:scale-95 transition-all">
            <span className="text-[10px] font-black uppercase text-gray-600 tracking-widest">Apple</span>
          </button>
        </div>

        <div className="text-center pt-4">
          <p className="text-[10px] font-bold text-gray-400 tracking-tight uppercase">
            Don't have an account? <button className="text-[#2ECC71] font-black ml-1">Create Now</button>
          </p>
        </div>
      </div>

      {/* Footer Biometric Hint */}
      <div className="mt-auto mb-8 flex flex-col items-center space-y-2 opacity-20">
        <FingerPrintIcon className="w-6 h-6 text-gray-400" />
        <span className="text-[7px] font-black uppercase tracking-[0.4em]">Biometric Ready</span>
      </div>
    </div>
  );
};

export default LoginView;
