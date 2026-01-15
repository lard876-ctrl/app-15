
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { UserProfile, FoodItem } from '../types';
import { 
  XMarkIcon, 
  PaperAirplaneIcon, 
  SparklesIcon,
  UserIcon,
  CpuChipIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

interface Message {
  role: 'user' | 'model';
  text: string;
}

interface ChatAssistantProps {
  onClose: () => void;
  userProfile: UserProfile;
  inventory: FoodItem[];
}

const ChatAssistant: React.FC<ChatAssistantProps> = ({ onClose, userProfile, inventory }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: `Hi ${userProfile.name}! I'm your Expronix Assistant. How can I help you manage your kitchen today?` }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<any>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    chatRef.current = ai.chats.create({
      model: 'gemini-3-pro-preview',
      config: {
        systemInstruction: `You are the Expronix AI Chatbot. 
        Your goal is to help users reduce food waste and ensure food safety.
        
        USER CONTEXT:
        - Name: ${userProfile.name}
        - Allergies: ${userProfile.allergies.map(a => `${a.name} (${a.severity})`).join(', ')}
        - Health Conditions: ${userProfile.healthConditions.join(', ')}
        
        INVENTORY:
        - Total Items: ${inventory.length}
        - Items: ${inventory.map(i => `${i.name} (Exp: ${i.expiryDate}, Loc: ${i.location})`).join(', ')}
        
        RULES:
        1. Always be professional, helpful, and safety-conscious.
        2. If a user asks about recipes, prioritize using items nearing expiry from their inventory.
        3. ALWAYS cross-check ingredients against their allergies and health conditions.
        4. Keep responses concise but informative.
        5. Use a friendly tone.`,
      },
    });
  }, []);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setIsLoading(true);

    try {
      const response = await chatRef.current.sendMessageStream({ message: userText });
      
      let fullResponse = "";
      setMessages(prev => [...prev, { role: 'model', text: '' }]);

      for await (const chunk of response) {
        const c = chunk as GenerateContentResponse;
        fullResponse += c.text;
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1].text = fullResponse;
          return newMessages;
        });
      }
    } catch (error) {
      console.error("Chat Error:", error);
      setMessages(prev => [...prev, { role: 'model', text: "I'm sorry, I encountered an error. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] bg-white flex flex-col animate-in slide-in-from-bottom duration-300">
      <header className="bg-white border-b px-6 py-4 flex justify-between items-center sticky top-0 z-10 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="bg-fresh-green/10 p-2 rounded-xl">
            <SparklesIcon className="w-6 h-6 text-fresh-green" />
          </div>
          <div>
            <h2 className="text-lg font-black text-gray-800 tracking-tight">AI Chat Assistant</h2>
            <div className="flex items-center space-x-1">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Active • Gemini 3 Pro</span>
            </div>
          </div>
        </div>
        <button onClick={onClose} className="p-2 bg-gray-50 rounded-full text-gray-400">
          <XMarkIcon className="w-6 h-6" />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/30">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex max-w-[85%] space-x-3 ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center ${msg.role === 'user' ? 'bg-deep-blue text-white' : 'bg-white border text-fresh-green shadow-sm'}`}>
                {msg.role === 'user' ? <UserIcon className="w-5 h-5" /> : <CpuChipIcon className="w-5 h-5" />}
              </div>
              <div className={`p-4 rounded-[1.5rem] text-sm leading-relaxed shadow-sm border ${
                msg.role === 'user' 
                  ? 'bg-deep-blue text-white border-deep-blue rounded-tr-none' 
                  : 'bg-white text-gray-800 border-gray-100 rounded-tl-none font-medium'
              }`}>
                {msg.text || (isLoading && idx === messages.length - 1 ? <ArrowPathIcon className="w-4 h-4 animate-spin opacity-50" /> : '')}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white border-t border-gray-100 pb-10">
        <div className="flex items-center space-x-2 bg-gray-50 p-2 rounded-[2rem] border border-gray-200 focus-within:ring-2 focus-within:ring-fresh-green transition-all">
          <input 
            type="text"
            className="flex-1 bg-transparent px-4 py-2 outline-none text-sm font-medium text-gray-800"
            placeholder="Ask about recipes, expiry, or safety..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className={`p-3 rounded-full transition-all ${
              !input.trim() || isLoading ? 'bg-gray-200 text-gray-400' : 'bg-fresh-green text-white shadow-lg active:scale-95'
            }`}
          >
            <PaperAirplaneIcon className="w-5 h-5" />
          </button>
        </div>
        <p className="text-[9px] text-center text-gray-300 mt-3 font-bold uppercase tracking-widest">
          Expronix AI can make mistakes. Verify important safety info.
        </p>
      </div>
    </div>
  );
};

export default ChatAssistant;
