
import React, { useEffect, useRef, useState } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { UserProfile, FoodItem } from '../types';
import { XMarkIcon, MicrophoneIcon, SparklesIcon, SpeakerWaveIcon } from '@heroicons/react/24/outline';

interface LiveAssistantProps {
  onClose: () => void;
  userProfile: UserProfile;
  inventory: FoodItem[];
}

interface TranscriptLine {
  role: 'user' | 'model';
  text: string;
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

const LiveAssistant: React.FC<LiveAssistantProps> = ({ onClose, userProfile, inventory }) => {
  const [isConnecting, setIsConnecting] = useState(true);
  const [isModelSpeaking, setIsModelSpeaking] = useState(false);
  const [transcripts, setTranscripts] = useState<TranscriptLine[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [currentOutput, setCurrentOutput] = useState('');
  
  const sessionRef = useRef<any>(null);
  const nextStartTimeRef = useRef(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcripts, currentInput, currentOutput]);

  useEffect(() => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    audioContextRef.current = outputAudioContext;
    const outputNode = outputAudioContext.createGain();
    outputNode.connect(outputAudioContext.destination);

    const inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    let inputProcessor: ScriptProcessorNode | null = null;
    let micStream: MediaStream | null = null;

    const sessionPromise = ai.live.connect({
      model: 'gemini-2.5-flash-native-audio-preview-12-2025',
      callbacks: {
        onopen: async () => {
          setIsConnecting(false);
          try {
            micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const source = inputAudioContext.createMediaStreamSource(micStream);
            inputProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
            
            inputProcessor.onaudioprocess = (audioProcessingEvent) => {
              const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
              const l = inputData.length;
              const int16 = new Int16Array(l);
              for (let i = 0; i < l; i++) {
                int16[i] = inputData[i] * 32768;
              }
              const pcmBlob = {
                data: encode(new Uint8Array(int16.buffer)),
                mimeType: 'audio/pcm;rate=16000',
              };
              sessionPromise.then(session => session.sendRealtimeInput({ media: pcmBlob }));
            };
            source.connect(inputProcessor);
            inputProcessor.connect(inputAudioContext.destination);
          } catch (err) {
            console.error('Mic error:', err);
          }
        },
        onmessage: async (message: LiveServerMessage) => {
          // Handle Audio Playback
          const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
          if (audioData) {
            setIsModelSpeaking(true);
            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputAudioContext.currentTime);
            const buffer = await decodeAudioData(decode(audioData), outputAudioContext, 24000, 1);
            const source = outputAudioContext.createBufferSource();
            source.buffer = buffer;
            source.connect(outputNode);
            source.start(nextStartTimeRef.current);
            nextStartTimeRef.current += buffer.duration;
            sourcesRef.current.add(source);
            source.onended = () => {
              sourcesRef.current.delete(source);
              if (sourcesRef.current.size === 0) setIsModelSpeaking(false);
            };
          }

          // Handle Transcriptions
          if (message.serverContent?.inputTranscription) {
            setCurrentInput(prev => prev + message.serverContent!.inputTranscription!.text);
          }
          if (message.serverContent?.outputTranscription) {
            setCurrentOutput(prev => prev + message.serverContent!.outputTranscription!.text);
          }
          
          if (message.serverContent?.turnComplete) {
            setTranscripts(prev => [
              ...prev, 
              ...(currentInput ? [{ role: 'user', text: currentInput } as TranscriptLine] : []),
              ...(currentOutput ? [{ role: 'model', text: currentOutput } as TranscriptLine] : [])
            ]);
            setCurrentInput('');
            setCurrentOutput('');
          }

          if (message.serverContent?.interrupted) {
            sourcesRef.current.forEach(s => s.stop());
            sourcesRef.current.clear();
            nextStartTimeRef.current = 0;
            setIsModelSpeaking(false);
          }
        },
        onerror: (e) => console.error('Live Error:', e),
        onclose: () => console.log('Live Closed'),
      },
      config: {
        responseModalities: [Modality.AUDIO],
        outputAudioTranscription: {},
        inputAudioTranscription: {},
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } }
        },
        systemInstruction: `You are the Expronix AI Voice Assistant.
        User Profile: ${JSON.stringify(userProfile)}.
        Inventory Summary: ${inventory.length} items.
        Help the user manage their food, check safety, and suggest recipes.
        Be very conversational and helpful. If they have allergies like ${userProfile.allergies.map(a=>a.name).join(', ')}, always prioritize that in your advice.
        Keep responses concise as this is a voice conversation. You are professional but warm.`
      }
    });

    sessionRef.current = sessionPromise;

    return () => {
      sessionPromise.then(s => s.close());
      micStream?.getTracks().forEach(t => t.stop());
      inputProcessor?.disconnect();
      inputAudioContext.close();
      outputAudioContext.close();
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[200] flex flex-col bg-white animate-in fade-in duration-300">
      {/* Immersive Header */}
      <header className="px-6 py-8 flex justify-between items-center bg-white border-b border-gray-50">
        <div className="flex items-center space-x-3">
          <div className="bg-fresh-green/10 p-2.5 rounded-2xl">
            <SparklesIcon className="w-6 h-6 text-fresh-green" />
          </div>
          <div>
            <h2 className="text-xl font-black text-gray-800 tracking-tighter uppercase">Expronix Live</h2>
            <div className="flex items-center space-x-1.5">
              <div className={`w-2 h-2 rounded-full ${isConnecting ? 'bg-gray-300 animate-pulse' : 'bg-green-500 animate-pulse'}`}></div>
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                {isConnecting ? 'Initializing' : 'Live Connection Active'}
              </span>
            </div>
          </div>
        </div>
        <button onClick={onClose} className="p-3 bg-gray-100 rounded-full text-gray-400 hover:text-red-500 transition-all active:scale-90">
          <XMarkIcon className="w-6 h-6" />
        </button>
      </header>

      {/* Visual Feedback Area */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        {/* Dynamic Waveform Background */}
        <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
            <div className={`w-[80vw] h-[80vw] bg-fresh-green rounded-full blur-[100px] transition-all duration-700 transform ${isModelSpeaking ? 'scale-125 opacity-20' : 'scale-100 opacity-10'}`}></div>
            <div className={`absolute w-[60vw] h-[60vw] bg-deep-blue rounded-full blur-[80px] transition-all duration-1000 transform ${!isModelSpeaking && !isConnecting ? 'scale-110 opacity-15' : 'scale-90 opacity-5'}`}></div>
        </div>

        {/* Conversation Transcript */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-hide relative z-10">
          {transcripts.length === 0 && !currentInput && !currentOutput && (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 px-12">
               <div className="p-6 bg-fresh-green/5 rounded-[2.5rem] border border-fresh-green/10 animate-pulse">
                <MicrophoneIcon className="w-12 h-12 text-fresh-green" />
               </div>
               <p className="text-sm font-black text-gray-400 uppercase tracking-widest leading-relaxed">
                 {isConnecting ? "Establishing encrypted link..." : "How can I help you today?"}
               </p>
            </div>
          )}
          
          {transcripts.map((line, i) => (
            <div key={i} className={`flex ${line.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] p-5 rounded-[2rem] text-sm font-bold leading-relaxed shadow-sm border ${
                line.role === 'user' 
                  ? 'bg-fresh-green text-white border-fresh-green rounded-br-none' 
                  : 'bg-white text-gray-800 border-gray-100 rounded-bl-none'
              }`}>
                {line.text}
              </div>
            </div>
          ))}

          {currentInput && (
            <div className="flex justify-end animate-in slide-in-from-right-4 duration-200">
              <div className="max-w-[85%] p-5 rounded-[2rem] rounded-br-none bg-fresh-green/10 text-fresh-green font-black text-sm border border-fresh-green/20 italic">
                {currentInput}
              </div>
            </div>
          )}

          {currentOutput && (
            <div className="flex justify-start animate-in slide-in-from-left-4 duration-200">
              <div className="max-w-[85%] p-5 rounded-[2rem] rounded-bl-none bg-white text-gray-800 font-bold text-sm border border-gray-100 shadow-sm">
                {currentOutput}
              </div>
            </div>
          )}
          <div ref={transcriptEndRef} />
        </div>

        {/* Real-time Status Visualizer */}
        <div className="p-8 pb-12 bg-white/80 backdrop-blur-md border-t border-gray-50 relative z-20">
          <div className="flex flex-col items-center space-y-6">
            <div className="flex items-center space-x-8">
                <div className={`flex flex-col items-center space-y-2 transition-opacity ${isModelSpeaking ? 'opacity-30' : 'opacity-100'}`}>
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center border border-gray-100">
                        <MicrophoneIcon className="w-8 h-8 text-gray-300" />
                    </div>
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Listening</span>
                </div>

                <div className="relative">
                    <div className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 ${isModelSpeaking ? 'bg-fresh-green shadow-xl shadow-green-100 scale-110' : 'bg-gray-100 shadow-inner'}`}>
                        {isModelSpeaking ? (
                            <SpeakerWaveIcon className="w-12 h-12 text-white animate-pulse" />
                        ) : (
                            <div className="flex items-center space-x-1">
                                <div className="w-1 h-4 bg-fresh-green/30 rounded-full animate-bounce"></div>
                                <div className="w-1 h-8 bg-fresh-green/60 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                                <div className="w-1 h-5 bg-fresh-green/30 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                            </div>
                        )}
                    </div>
                    {isModelSpeaking && (
                        <div className="absolute -inset-2 border-2 border-fresh-green/20 rounded-full animate-ping"></div>
                    )}
                </div>

                <div className={`flex flex-col items-center space-y-2 transition-opacity ${isModelSpeaking ? 'opacity-100' : 'opacity-30'}`}>
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center border border-gray-100">
                        <SpeakerWaveIcon className="w-8 h-8 text-gray-300" />
                    </div>
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Speaking</span>
                </div>
            </div>
            
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] animate-pulse">
                {isModelSpeaking ? 'Model is Responding' : isConnecting ? 'Establishing Link' : 'Voice UI Ready'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveAssistant;
