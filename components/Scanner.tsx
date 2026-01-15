
import React, { useRef, useState, useEffect } from 'react';
import { scanReceipt, analyzeFoodImage } from '../services/geminiService';
import { FoodItem, StorageLocation } from '../types';
import { calculateExpiryStatus } from '../utils';
import { 
  XMarkIcon, 
  SparklesIcon, 
  PhotoIcon,
  ExclamationCircleIcon,
  QrCodeIcon,
  DocumentTextIcon,
  Bars3BottomLeftIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

interface ScannerProps {
  onItemsFound: (items: FoodItem[]) => void;
  onCancel: () => void;
  onManualEntry: () => void;
}

type ScanMode = 'barcode' | 'qrcode' | 'receipt' | 'inspect';

const Scanner: React.FC<ScannerProps> = ({ onItemsFound, onCancel, onManualEntry }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [scanMode, setScanMode] = useState<ScanMode>('barcode');
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' },
        audio: false 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsCameraActive(true);
      }
    } catch (err) {
      console.error("Camera access denied:", err);
      setError("Camera access denied.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  const takeSnapshot = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setPreviewUrl(dataUrl);
        stopCamera();
        processScan(dataUrl);
      }
    }
  };

  const handleCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        setPreviewUrl(dataUrl);
        stopCamera();
        processScan(dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const processScan = async (url: string) => {
    setIsScanning(true);
    setError(null);
    try {
      if (scanMode === 'inspect') {
        const report = await analyzeFoodImage(url);
        setAnalysisResult(report);
        setIsScanning(false);
        return;
      }

      const results = await scanReceipt(url);
      const formattedResults: FoodItem[] = results.map((item) => {
        const expiryDate = item.expiryDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
        return {
          id: Math.random().toString(36).substr(2, 9),
          name: item.name || 'Unknown Item',
          category: item.category || 'Other',
          expiryDate: expiryDate,
          addedDate: new Date().toISOString(),
          location: StorageLocation.PANTRY,
          quantity: item.quantity || '1 unit',
          price: item.price || 0,
          status: calculateExpiryStatus(expiryDate)
        } as FoodItem;
      });
      
      if (formattedResults.length > 0) {
          onItemsFound(formattedResults);
      } else {
          setError("An unexpected error occurred.");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setIsScanning(false);
    }
  };

  const reset = () => {
    setPreviewUrl(null);
    setError(null);
    setAnalysisResult(null);
    startCamera();
  };

  const instructionText = {
    barcode: "Align barcode within frame",
    qrcode: "Align QR Code within frame",
    receipt: "Align receipt within frame",
    inspect: "Capture food to analyze freshness"
  };

  return (
    <div className="fixed inset-0 bg-black z-[200] flex flex-col animate-in fade-in duration-300">
      {/* Top Controls */}
      <div className="flex items-center justify-between p-6">
        <button onClick={onCancel} className="p-2 text-white hover:opacity-70 transition-opacity">
          <XMarkIcon className="w-8 h-8" />
        </button>
      </div>

      {/* Main Viewfinder Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 -mt-10">
        <p className="text-white font-medium mb-12 tracking-wide opacity-90">
          {instructionText[scanMode]}
        </p>

        <div className="relative w-full aspect-square max-w-[320px] bg-black/40 rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
          {isCameraActive && (
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted
              className="w-full h-full object-cover grayscale opacity-60"
              onClick={takeSnapshot}
            />
          )}
          
          {previewUrl && !error && (
            <img src={previewUrl} className="w-full h-full object-cover opacity-50 grayscale" alt="Preview" />
          )}

          {/* Viewfinder Frame */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Corners */}
            <div className={`absolute top-4 left-4 w-10 h-10 border-t-4 border-l-4 rounded-tl-xl opacity-80 ${scanMode === 'inspect' ? 'border-purple-400' : 'border-[#2ECC71]'}`}></div>
            <div className={`absolute top-4 right-4 w-10 h-10 border-t-4 border-r-4 rounded-tr-xl opacity-80 ${scanMode === 'inspect' ? 'border-purple-400' : 'border-[#2ECC71]'}`}></div>
            <div className={`absolute bottom-4 left-4 w-10 h-10 border-b-4 border-l-4 rounded-bl-xl opacity-80 ${scanMode === 'inspect' ? 'border-purple-400' : 'border-[#2ECC71]'}`}></div>
            <div className={`absolute bottom-4 right-4 w-10 h-10 border-b-4 border-r-4 rounded-br-xl opacity-80 ${scanMode === 'inspect' ? 'border-purple-400' : 'border-[#2ECC71]'}`}></div>

            {/* Scan Line */}
            {isCameraActive && !error && (
               <div className={`absolute inset-x-8 top-1/2 h-0.5 bg-gradient-to-r from-transparent to-transparent shadow-[0_0_15px] animate-scan-line z-10 ${scanMode === 'inspect' ? 'via-purple-400 shadow-purple-400' : 'via-[#2ECC71] shadow-[#2ECC71]'}`}></div>
            )}
          </div>

          {/* Error Message Layer */}
          {error && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center animate-in zoom-in duration-300">
              <div className="bg-white/10 p-3 rounded-full mb-4">
                <ExclamationCircleIcon className="w-10 h-10 text-gray-400" />
              </div>
              <p className="text-gray-300 font-medium">{error}</p>
              <button 
                onClick={reset}
                className="mt-6 text-[10px] font-black uppercase tracking-widest text-[#2ECC71] border border-[#2ECC71]/30 px-6 py-2 rounded-full hover:bg-[#2ECC71]/10 transition-all pointer-events-auto"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Processing Layer */}
          {isScanning && (
            <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center space-y-4">
              <div className="relative">
                <div className={`w-12 h-12 border-4 rounded-full ${scanMode === 'inspect' ? 'border-purple-400/20' : 'border-[#2ECC71]/20'}`}></div>
                <div className={`absolute inset-0 border-4 border-t-transparent rounded-full animate-spin ${scanMode === 'inspect' ? 'border-purple-400' : 'border-[#2ECC71]'}`}></div>
              </div>
              <p className={`text-[10px] font-black uppercase tracking-widest animate-pulse ${scanMode === 'inspect' ? 'text-purple-400' : 'text-[#2ECC71]'}`}>
                {scanMode === 'inspect' ? 'Gemini AI Vision Analysis' : 'Processing AI Scan'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Floating Gallery Button */}
      <div className="px-8 flex justify-end mb-4">
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 shadow-xl active:scale-90 transition-all"
        >
          <PhotoIcon className="w-8 h-8 text-white" />
        </button>
      </div>

      {/* Bottom Mode Selector */}
      <div className="bg-black p-6 grid grid-cols-4 gap-2">
        <ModeButton 
          active={scanMode === 'barcode'} 
          onClick={() => { setScanMode('barcode'); reset(); }} 
          icon={<Bars3BottomLeftIcon className="w-5 h-5" />} 
          label="Code" 
        />
        <ModeButton 
          active={scanMode === 'qrcode'} 
          onClick={() => { setScanMode('qrcode'); reset(); }} 
          icon={<QrCodeIcon className="w-5 h-5" />} 
          label="QR" 
        />
        <ModeButton 
          active={scanMode === 'receipt'} 
          onClick={() => { setScanMode('receipt'); reset(); }} 
          icon={<DocumentTextIcon className="w-5 h-5" />} 
          label="Receipt" 
        />
        <ModeButton 
          active={scanMode === 'inspect'} 
          onClick={() => { setScanMode('inspect'); reset(); }} 
          icon={<SparklesIcon className="w-5 h-5" />} 
          label="Vision" 
          special={true}
        />
      </div>

      {/* Analysis Result Overlay */}
      {analysisResult && (
        <div className="absolute inset-0 bg-white z-[250] flex flex-col overflow-y-auto scrollbar-hide animate-in slide-in-from-bottom duration-300">
          <header className="px-6 py-4 border-b flex justify-between items-center sticky top-0 bg-white z-10 shadow-sm">
            <div className="flex items-center space-x-2 text-purple-600">
              <SparklesIcon className="w-5 h-5" />
              <span className="text-sm font-black uppercase tracking-tight">AI Inspection Report</span>
            </div>
            <button onClick={() => setAnalysisResult(null)} className="p-2 bg-gray-50 rounded-full active:scale-90 transition-all">
              <XMarkIcon className="w-6 h-6 text-gray-400" />
            </button>
          </header>
          <div className="p-8 space-y-8 pb-32">
            <div className="aspect-[4/3] rounded-[2.5rem] overflow-hidden shadow-lg border border-gray-100 bg-gray-50">
                <img src={previewUrl!} className="w-full h-full object-cover" alt="Inspected food" />
            </div>
            <div className="space-y-4">
               <div className="flex items-center space-x-2 text-purple-600 opacity-60">
                 <MagnifyingGlassIcon className="w-4 h-4" />
                 <span className="text-[10px] font-black uppercase tracking-widest">Vision Analysis (Gemini 3 Pro)</span>
               </div>
               <div className="bg-gray-50 p-8 rounded-[3rem] border border-gray-100 text-[13px] font-medium text-gray-700 leading-relaxed whitespace-pre-wrap prose prose-sm prose-purple">
                  {analysisResult}
               </div>
            </div>
            <button 
              onClick={() => setAnalysisResult(null)} 
              className="w-full py-5 bg-[#2ECC71] text-white rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-xl shadow-green-100 active:scale-[0.98] transition-all"
            >
              Done Analysis
            </button>
          </div>
        </div>
      )}

      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleCapture} 
        accept="image/*" 
        className="hidden" 
      />
      <canvas ref={canvasRef} className="hidden" />

      <style>{`
        @keyframes scan-line {
          0% { top: 20%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 80%; opacity: 0; }
        }
        .animate-scan-line {
          animation: scan-line 2.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

const ModeButton: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string; special?: boolean }> = ({ active, onClick, icon, label, special }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center justify-center py-4 px-1 rounded-2xl transition-all space-y-1.5 border ${
      active 
        ? (special ? 'bg-purple-500 border-purple-500 text-white shadow-lg shadow-purple-500/20' : 'bg-[#2ECC71] border-[#2ECC71] text-white shadow-lg shadow-[#2ECC71]/20')
        : 'bg-white/5 border-white/10 text-gray-500 hover:bg-white/10'
    }`}
  >
    {icon}
    <span className={`text-[9px] font-black uppercase tracking-tight ${active ? 'text-white' : 'text-gray-500'}`}>
        {label}
    </span>
  </button>
);

export default Scanner;
