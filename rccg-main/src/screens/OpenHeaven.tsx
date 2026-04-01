import React from 'react';

import React, { useState, useEffect } from 'react';
import { DailyView } from '../components/open-heaven/DailyView';
import { CalendarView } from '../components/open-heaven/CalendarView';
import { Devotional } from '../components/open-heaven/types';
import { fetchDevotional, formatDateForApi } from '../components/open-heaven/api';

type Tab = 'daily' | 'calendar';

export const OpenHeaven: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('daily');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [devotional, setDevotional] = useState<Devotional | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const dateStr = formatDateForApi(selectedDate);
      const data = await fetchDevotional(dateStr);
      setDevotional(data);
      setLoading(false);
    };
    loadData();
  }, [selectedDate]);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setActiveTab('daily');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section className="bg-slate-50 min-h-screen relative pb-24">
      {/* Page Header matching rccg-main layout */}
      <div className="pt-12 pb-6 text-center">
        <p className="text-xs font-semibold tracking-[0.2em] uppercase text-blue-600 mb-2">
          Daily Devotional
        </p>
        <h1 className="text-4xl font-bold text-slate-900 mb-2">Open Heaven</h1>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Core Sub-App Views */}
        {activeTab === 'daily' && (
          <DailyView devotional={devotional} loading={loading} />
        )}
        
        {activeTab === 'calendar' && (
          <CalendarView 
            selectedDate={selectedDate} 
            onDateSelect={handleDateSelect} 
            currentDevotional={devotional}
          />
        )}
      </div>

      {/* Floating Bottom Navigation Tab */}
      <nav className="fixed bottom-0 left-0 w-full z-50 pb-safe bg-white/90 backdrop-blur-xl shadow-[0_-4px_20px_rgba(0,0,0,0.05)] border-t border-slate-200">
        <div className="flex justify-around items-center h-20 w-full px-4 max-w-lg mx-auto">
          <button 
            onClick={() => setActiveTab('daily')}
            className={`flex flex-col items-center justify-center px-6 py-2 rounded-xl transition-all active:scale-95 ${
              activeTab === 'daily' 
                ? 'bg-blue-50 text-blue-700' 
                : 'text-slate-500 hover:opacity-80'
            }`}
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: activeTab === 'daily' ? "'FILL' 1" : "'FILL' 0" }}>
              auto_stories
            </span>
            <span className="font-label text-[10px] uppercase tracking-widest font-bold mt-1">Daily</span>
          </button>

          <button 
            onClick={() => setActiveTab('calendar')}
            className={`flex flex-col items-center justify-center px-6 py-2 rounded-xl transition-all active:scale-95 ${
              activeTab === 'calendar' 
                ? 'bg-blue-50 text-blue-700' 
                : 'text-slate-500 hover:opacity-80'
            }`}
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: activeTab === 'calendar' ? "'FILL' 1" : "'FILL' 0" }}>
              calendar_today
            </span>
            <span className="font-label text-[10px] uppercase tracking-widest font-bold mt-1">Calendar</span>
          </button>
        </div>
      </nav>
    </section>
  );
};
