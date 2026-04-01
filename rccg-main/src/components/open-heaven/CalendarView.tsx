import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Devotional } from './types';
import { formatDisplayDate } from './api';

interface CalendarViewProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  currentDevotional: Devotional | null;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ selectedDate, onDateSelect, currentDevotional }) => {
  const [viewDate, setViewDate] = useState(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));

  const monthName = viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDay }, (_, i) => i);

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-12"
    >
      <section className="flex items-center justify-between">
        <div>
          <p className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface-variant mb-2">Spiritual Journey</p>
          <h2 className="font-headline text-3xl font-bold text-primary leading-tight">{monthName}</h2>
          <div className="h-[1px] w-12 bg-secondary-container mt-4"></div>
        </div>
        <div className="flex gap-2">
          <button onClick={prevMonth} className="p-2 rounded-full hover:bg-surface-container transition-colors active:scale-95 text-primary">
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          <button onClick={nextMonth} className="p-2 rounded-full hover:bg-surface-container transition-colors active:scale-95 text-primary">
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
      </section>

      <div className="grid grid-cols-7 gap-2">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
          <div key={d} className="text-center font-label text-[10px] text-on-surface-variant py-2">{d}</div>
        ))}
        {blanks.map(b => <div key={`b-${b}`} className="aspect-square"></div>)}
        {days.map(d => {
          const isSelected = d === selectedDate.getDate() && month === selectedDate.getMonth() && year === selectedDate.getFullYear();
          return (
            <button 
              key={d}
              onClick={() => onDateSelect(new Date(year, month, d))}
              className={`aspect-square flex flex-col items-center justify-center rounded-xl transition-all active:scale-95 ${
                isSelected 
                  ? 'bg-primary text-white shadow-xl shadow-primary/10 relative overflow-hidden' 
                  : 'bg-surface-container-low hover:bg-surface-container'
              }`}
            >
              <span className={`font-label text-sm ${isSelected ? 'relative z-10 font-bold' : 'text-on-surface-variant'}`}>{d}</span>
              {isSelected && <div className="w-1 h-1 rounded-full bg-secondary-container mt-1 relative z-10"></div>}
              {isSelected && <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary-container opacity-50"></div>}
            </button>
          );
        })}
      </div>

      <section className="space-y-6">
        <div className="p-8 rounded-3xl bg-secondary-container text-on-secondary-container shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-headline text-2xl font-bold mb-2">
                {currentDevotional?.title || 'Loading...'}
              </h3>
              <p className="font-body text-base italic opacity-90 leading-relaxed">
                "{currentDevotional?.memory_verse_text?.substring(0, 60)}..."
              </p>
            </div>
            <span className="material-symbols-outlined text-3xl">auto_stories</span>
          </div>
          <div className="mt-6 flex items-center gap-4">
            <span className="font-label text-[10px] tracking-widest bg-on-secondary-container/10 px-3 py-1 rounded-full uppercase">5 min read</span>
            <span className="font-label text-[10px] tracking-widest bg-on-secondary-container/10 px-3 py-1 rounded-full uppercase">
              {currentDevotional?.bible_reading || 'Scripture'}
            </span>
          </div>
          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="mt-8 w-full bg-primary text-white py-4 rounded-full font-label tracking-widest text-xs uppercase hover:opacity-90 transition-opacity active:scale-95"
          >
            Start Today's Reading
          </button>
        </div>

        <div className="bg-surface-container-low p-6 rounded-xl">
          <h4 className="font-headline text-lg font-bold text-primary mb-4">Past Readings</h4>
          <div className="space-y-4">
            {[
              { day: '06', title: 'Walking by Faith', label: 'Yesterday' },
              { day: '04', title: 'The Gift of Patience', label: 'Monday' }
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4 hover:bg-surface-container-lowest p-3 rounded-xl transition-colors cursor-pointer group">
                <div className="w-12 h-12 rounded-lg bg-surface-container-highest flex items-center justify-center font-headline text-primary font-bold">{item.day}</div>
                <div className="flex-1">
                  <p className="font-label text-[10px] text-on-surface-variant uppercase tracking-wider">{item.label}</p>
                  <p className="font-headline text-md text-on-surface font-semibold">{item.title}</p>
                </div>
                <span className="material-symbols-outlined text-on-surface-variant opacity-40 group-hover:opacity-100 transition-opacity">chevron_right</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </motion.div>
  );
};
