import React from 'react';
import { motion } from 'motion/react';
import { Devotional } from './types';
import { formatDisplayDate } from './api';

interface DailyViewProps {
  devotional: Devotional | null;
  loading: boolean;
}

export const DailyView: React.FC<DailyViewProps> = ({ devotional, loading }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-on-surface-variant font-label uppercase tracking-widest">Loading Devotional...</div>
      </div>
    );
  }

  if (!devotional) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
        <h2 className="font-headline text-3xl font-bold text-primary mb-4">No Devotional Found</h2>
        <p className="text-on-surface-variant">We couldn't find a reading for this date. Please try another day.</p>
      </div>
    );
  }

  const displayDate = formatDisplayDate(new Date(devotional.date));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-12"
    >
      <section className="space-y-6">
        <div className="space-y-2">
          <p className="font-label text-[0.75rem] uppercase tracking-[0.2em] text-on-surface-variant font-extrabold">
            {displayDate}
          </p>
          <h2 className="font-headline text-5xl md:text-6xl font-bold text-primary leading-tight">
            {devotional.title}
          </h2>
        </div>
        <div className="w-24 h-1 bg-secondary-container rounded-full"></div>

        <div className="bg-secondary-container text-on-secondary-container rounded-xl p-8 md:p-10 shadow-sm">
          <div className="flex items-start gap-4 mb-4">
            <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>auto_stories</span>
            <span className="font-label font-bold tracking-widest text-xs uppercase pt-1">The Daily Scripture</span>
          </div>
          <blockquote className="font-headline text-2xl md:text-3xl italic leading-relaxed">
            "{devotional.memory_verse_text || devotional.memory_verse}"
          </blockquote>
          <p className="mt-6 font-label font-extrabold text-sm text-right">— {devotional.memory_verse.toUpperCase()}</p>
        </div>

        {devotional.bible_reading && (
          <div className="bg-surface-container-low text-on-surface rounded-xl p-8 md:p-10 shadow-sm border border-outline-variant/30">
            <div className="flex items-start gap-4 mb-4">
               <span className="material-symbols-outlined text-3xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>menu_book</span>
              <span className="font-label font-bold tracking-widest text-xs uppercase pt-1 text-primary">Today's Bible Reading</span>
            </div>
            <p className="font-headline text-xl leading-relaxed">
              {devotional.bible_reading}
            </p>
          </div>
        )}
      </section>

      <article className="space-y-8 text-lg leading-loose text-on-surface">
        <div className="space-y-6 first-letter:text-7xl first-letter:font-headline first-letter:font-bold first-letter:mr-3 first-letter:float-left first-letter:text-primary">
          {devotional.content.map((para, i) => (
            <p key={i}>{para}</p>
          ))}

          {devotional.reflection && (
            <div className="bg-surface-container-low rounded-xl p-8 my-10 space-y-4">
              <h3 className="font-headline text-xl font-bold text-primary">Points for Reflection</h3>
              <ul className="space-y-4 font-body text-base">
                {devotional.reflection.map((point, i) => (
                  <li key={i} className="flex gap-4">
                    <span className="text-secondary-container font-bold">•</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </article>

      <section className="bg-primary text-on-primary rounded-full px-10 py-12 text-center space-y-6 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary-container opacity-50"></div>
        <div className="relative z-10 space-y-4">
          <span className="material-symbols-outlined text-secondary-fixed text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>flare</span>
          <h3 className="font-headline text-2xl font-bold">Key Point</h3>
          <p className="font-body text-xl italic max-w-md mx-auto leading-relaxed">
            "{devotional.prayer_point}"
          </p>
        </div>
      </section>

      <div className="flex flex-col items-center gap-4 py-8">
        <button className="bg-primary text-on-primary font-label font-bold tracking-widest px-12 py-5 rounded-full hover:opacity-90 active:scale-95 transition-all shadow-lg text-sm uppercase">
          Amen
        </button>
        <p className="font-label text-xs text-on-surface-variant font-medium">1,240 people joined in this prayer today</p>
      </div>
    </motion.div>
  );
};
