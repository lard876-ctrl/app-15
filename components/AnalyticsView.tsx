
import React, { useState } from 'react';
import { FoodItem } from '../types';
import { 
  CurrencyRupeeIcon,
  ArchiveBoxIcon,
  SparklesIcon,
  ArrowTrendingUpIcon,
  TrophyIcon,
  LightBulbIcon,
  FireIcon
} from '@heroicons/react/24/outline';

interface AnalyticsViewProps {
  inventory: FoodItem[];
  onBack?: () => void;
}

const AnalyticsView: React.FC<AnalyticsViewProps> = ({ inventory, onBack }) => {
  const [period, setPeriod] = useState<'Week' | 'Month' | 'Year'>('Month');
  const [activeTab, setActiveTab] = useState<'Trends' | 'Achievement' | 'Insights'>('Trends');

  // Helper to get data based on period
  const getDataForPeriod = () => {
    switch (period) {
      case 'Week':
        return {
          stats: [
            { label: 'Money Saved', value: '₹1,240', subtext: 'This week', icon: <CurrencyRupeeIcon className="w-4 h-4 text-green-600" />, bgColor: 'bg-green-100' },
            { label: 'Food Rescued', value: '4.2 lbs', subtext: 'This week', icon: <ArchiveBoxIcon className="w-4 h-4 text-green-700" />, bgColor: 'bg-green-100' },
            { label: 'Carbon Reduced', value: '8.4 kg', subtext: 'CO₂ equivalent', icon: <SparklesIcon className="w-4 h-4 text-blue-500" />, bgColor: 'bg-blue-100' },
            { label: 'Waste Reduction', value: '15.2%', subtext: '+1.2% vs last week', icon: <ArrowTrendingUpIcon className="w-4 h-4 text-orange-500" />, bgColor: 'bg-orange-100' }
          ],
          chart: [
            { label: 'Mon', saved: 2, wasted: 0 },
            { label: 'Tue', saved: 5, wasted: 2 },
            { label: 'Wed', saved: 8, wasted: 0 },
            { label: 'Thu', saved: 4, wasted: 1 },
            { label: 'Fri', saved: 7, wasted: 4 },
            { label: 'Sat', saved: 12, wasted: 1 },
            { label: 'Sun', saved: 9, wasted: 0 },
          ],
          chartMax: 15
        };
      case 'Year':
        return {
          stats: [
            { label: 'Money Saved', value: '₹48,900', subtext: 'This year', icon: <CurrencyRupeeIcon className="w-4 h-4 text-green-600" />, bgColor: 'bg-green-100' },
            { label: 'Food Rescued', value: '284.5 lbs', subtext: 'This year', icon: <ArchiveBoxIcon className="w-4 h-4 text-green-700" />, bgColor: 'bg-green-100' },
            { label: 'Carbon Reduced', value: '542.1 kg', subtext: 'CO₂ equivalent', icon: <SparklesIcon className="w-4 h-4 text-blue-500" />, bgColor: 'bg-blue-100' },
            { label: 'Waste Reduction', value: '41.8%', subtext: '+8.5% vs last year', icon: <ArrowTrendingUpIcon className="w-4 h-4 text-orange-500" />, bgColor: 'bg-orange-100' }
          ],
          chart: [
            { label: 'Jan', saved: 60, wasted: 10 },
            { label: 'Mar', saved: 75, wasted: 15 },
            { label: 'May', saved: 90, wasted: 5 },
            { label: 'Jul', saved: 85, wasted: 12 },
            { label: 'Sep', saved: 110, wasted: 8 },
            { label: 'Nov', saved: 125, wasted: 5 },
          ],
          chartMax: 150
        };
      case 'Month':
      default:
        return {
          stats: [
            { label: 'Money Saved', value: '₹10,540', subtext: 'This month', icon: <CurrencyRupeeIcon className="w-4 h-4 text-green-600" />, bgColor: 'bg-green-100' },
            { label: 'Food Rescued', value: '23.4 lbs', subtext: 'This month', icon: <ArchiveBoxIcon className="w-4 h-4 text-green-700" />, bgColor: 'bg-green-100' },
            { label: 'Carbon Reduced', value: '45.8 kg', subtext: 'CO₂ equivalent', icon: <SparklesIcon className="w-4 h-4 text-blue-500" />, bgColor: 'bg-blue-100' },
            { label: 'Waste Reduction', value: '32.5%', subtext: '+4.2% vs last month', icon: <ArrowTrendingUpIcon className="w-4 h-4 text-orange-500" />, bgColor: 'bg-orange-100' }
          ],
          chart: [
            { label: 'W1', saved: 15, wasted: 2 },
            { label: 'W2', saved: 18, wasted: 5 },
            { label: 'W3', saved: 21, wasted: 1 },
            { label: 'W4', saved: 19, wasted: 3 },
            { label: 'W5', saved: 23, wasted: 0 },
            { label: 'W6', saved: 25, wasted: 1 },
          ],
          chartMax: 30
        };
    }
  };

  const currentData = getDataForPeriod();

  const achievements = [
    { title: 'Waste Warrior', description: 'Reduced meat waste by 50% this week', date: '2 days ago', icon: <TrophyIcon className="w-5 h-5" />, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { title: 'Climate Hero', description: 'Saved 10kg of CO2 by composting', date: '1 week ago', icon: <SparklesIcon className="w-5 h-5" />, color: 'text-blue-600', bg: 'bg-blue-50' },
    { title: 'Budget Master', description: 'Stayed 20% under grocery budget', date: 'Oct 2023', icon: <CurrencyRupeeIcon className="w-5 h-5" />, color: 'text-green-600', bg: 'bg-green-50' },
  ];

  const insights = [
    { type: 'Urgent', text: 'You frequently waste milk on Fridays. Consider buying a smaller carton.', icon: <FireIcon className="w-4 h-4" />, color: 'text-red-600', bg: 'bg-red-50' },
    { type: 'Optimization', text: 'Freezing spinach extends its life by 6 months. You have 200g expiring soon.', icon: <LightBulbIcon className="w-4 h-4" />, color: 'text-blue-600', bg: 'bg-blue-50' },
    { type: 'Savings', text: 'Switching to bulk grains could save you ₹500/month based on your consumption.', icon: <CurrencyRupeeIcon className="w-4 h-4" />, color: 'text-green-600', bg: 'bg-green-50' },
  ];

  return (
    <div className="flex flex-col min-h-full bg-white animate-in fade-in duration-300 -mt-4 -mx-4">
      {/* Content wrapper */}
      <div className="flex-1 overflow-y-visible">
        {/* Period Selection */}
        <div className="px-6 pt-6 pb-4">
          <div className="flex bg-gray-50 p-1 rounded-xl">
            {(['Week', 'Month', 'Year'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all ${
                  period === p ? 'bg-green-700 text-white shadow-md' : 'text-gray-400'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Grid - Updated to match screenshot structure */}
        <div className="px-6 grid grid-cols-2 gap-4 mt-2">
          {currentData.stats.map((stat, idx) => (
            <div key={idx} className="bg-gray-100/60 p-4 rounded-[2rem] flex flex-col">
              <div className="flex items-center space-x-2 mb-3 pl-1">
                <div className={`${stat.bgColor} p-1.5 rounded-full border border-white/40 shadow-sm`}>
                  {stat.icon}
                </div>
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">{stat.label}</span>
              </div>
              <div className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="text-xl font-black text-gray-800 tracking-tight">{stat.value}</div>
                <div className="text-[9px] font-bold text-gray-300 mt-0.5 uppercase tracking-tighter">{stat.subtext}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="px-6 mt-10 flex border-b border-gray-100 bg-white sticky top-0 z-10 shadow-sm">
          {(['Trends', 'Achievement', 'Insights'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-4 text-sm font-bold relative transition-colors ${
                activeTab === tab ? 'text-green-700' : 'text-gray-400'
              }`}
            >
              {tab}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-green-700 rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="px-8 py-8 pb-32">
          {activeTab === 'Trends' && (
            <div key={period} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black text-gray-800">{period}ly Trends</h2>
              </div>

              {/* Legend */}
              <div className="flex items-center space-x-6 mb-8">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-700 rounded-sm"></div>
                  <span className="text-xs font-bold text-gray-400">Food Saved</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-orange-500 rounded-sm"></div>
                  <span className="text-xs font-bold text-gray-400">Food Wasted</span>
                </div>
              </div>

              {/* Bar Chart Container */}
              <div className="flex items-end justify-between h-56 w-full border-b border-gray-100 pb-2 relative mb-6 pl-8 pr-2">
                {/* Y-Axis Labels */}
                <div className="absolute left-0 bottom-2 h-full flex flex-col justify-between text-[10px] font-bold text-gray-300 py-1">
                  <span>{currentData.chartMax}</span>
                  <span>{Math.round(currentData.chartMax * 0.66)}</span>
                  <span>{Math.round(currentData.chartMax * 0.33)}</span>
                  <span>0</span>
                </div>

                {currentData.chart.map((data, idx) => (
                  <div key={idx} className="flex flex-col items-center space-y-2 w-full max-w-[40px]">
                    <div className="flex items-end space-x-1 w-full h-44">
                      <div 
                        className="bg-green-700 rounded-t transition-all duration-1000 flex-1" 
                        style={{ height: `${(data.saved / currentData.chartMax) * 100}%` }}
                      ></div>
                      {data.wasted > 0 && (
                        <div 
                          className="bg-orange-500 rounded-t transition-all duration-1000 flex-1" 
                          style={{ height: `${(data.wasted / currentData.chartMax) * 100}%` }}
                        ></div>
                      )}
                    </div>
                    <span className="text-[10px] font-bold text-gray-300">{data.label}</span>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-center text-gray-300 font-bold uppercase tracking-widest">
                {period === 'Week' ? 'Days of current week' : period === 'Month' ? 'Weeks of current month' : 'Months of current year'}
              </p>
            </div>
          )}

          {activeTab === 'Achievement' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-2xl font-black text-gray-800 mb-6">Recent Badges</h2>
              {achievements.map((item, idx) => (
                <div key={idx} className="flex items-center p-5 bg-white border border-gray-100 rounded-[2rem] shadow-sm space-x-4">
                  <div className={`${item.bg} ${item.color} p-3 rounded-2xl`}>
                    {item.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-black text-gray-800">{item.title}</h4>
                    <p className="text-xs text-gray-400 font-bold mt-1">{item.description}</p>
                  </div>
                  <span className="text-[10px] font-black text-gray-300 uppercase">{item.date}</span>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'Insights' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-2xl font-black text-gray-800 mb-2">Smart Insights</h2>
              <div className="bg-green-700 p-6 rounded-[2.5rem] text-white shadow-xl mb-6">
                <p className="text-xs font-bold uppercase tracking-widest opacity-70 mb-2">AI Summary</p>
                <p className="text-lg font-black leading-tight">Your waste levels are 12% lower than average households in your area. Great job!</p>
              </div>
              
              <div className="space-y-4">
                {insights.map((item, idx) => (
                  <div key={idx} className={`p-5 rounded-[2rem] border border-gray-100 shadow-sm flex space-x-4 ${item.bg}`}>
                    <div className={`${item.color} mt-1`}>
                      {item.icon}
                    </div>
                    <div>
                      <span className={`text-[10px] font-black uppercase tracking-widest ${item.color}`}>{item.type}</span>
                      <p className="text-sm font-bold text-gray-800 mt-1 leading-relaxed">{item.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsView;
