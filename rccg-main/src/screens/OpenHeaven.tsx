import React, { useState, useEffect } from 'react';
import { Share2 } from 'lucide-react';
import { DailyView } from '../components/open-heaven/DailyView';
import { CalendarView } from '../components/open-heaven/CalendarView';
import { Devotional } from '../components/open-heaven/types';
import { fetchDevotional, formatDateForApi } from '../components/open-heaven/api';

export const OpenHeaven: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [devotional, setDevotional] = useState<Devotional | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      const dateStr = formatDateForApi(selectedDate);
      try {
        const data = await fetchDevotional(dateStr);
        setDevotional(data);
      } catch (e) {
        console.error(e);
        setDevotional(null);
        setError('Unable to load the devotional right now. Please try again.');
      }
      setLoading(false);
    };
    loadData();
  }, [selectedDate]);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Open Heaven Daily Devotional',
        text: devotional ? devotional.title : 'Check out today\'s Open Heaven Devotional',
        url: window.location.href
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <section className="bg-slate-50 min-h-screen relative pb-24">
      {/* Page Header matching rccg-main layout */}
      <div className="pt-12 pb-8 text-center bg-white border-b border-slate-100 shadow-sm mb-10 relative">
        <div className="absolute right-4 sm:right-8 top-1/2 transform -translate-y-1/2">
          <button 
            onClick={handleShare}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-full shadow-sm hover:text-blue-600 hover:border-blue-200 transition"
          >
            <Share2 className="w-4 h-4" />
            <span className="hidden sm:inline">Share</span>
          </button>
        </div>
        <p className="text-xs font-semibold tracking-[0.2em] uppercase text-blue-600 mb-2">
          Daily Devotional
        </p>
        <h1 className="text-4xl font-bold text-slate-900 mb-2">Open Heaven</h1>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row gap-10 items-start">
        {/* Core Daily Viewer */}
        <div className="flex-1 w-full min-w-0">
          <DailyView devotional={devotional} loading={loading} error={error} />
        </div>
        
        {/* Side-by-Side Calendar Component */}
        <aside className="w-full lg:w-[400px] shrink-0 sticky top-12">
          <CalendarView 
            selectedDate={selectedDate} 
            onDateSelect={handleDateSelect} 
            currentDevotional={devotional}
          />
        </aside>
      </div>
    </section>
  );
};
