import React, { useState, useEffect } from 'react';
import { Video, Clock, ArrowRight } from 'lucide-react';
import { API_BASE_URL } from '../config';
import { motion } from 'motion/react';

interface LiveStreamConfig {
  title: string;
  youtube_url: string;
  service_day: string;
  start_time: string;
  end_time: string;
  timezone: string;
  service_date?: string | null;
  is_recurring: boolean;
}

const DEFAULT_CONFIG: LiveStreamConfig = {
  title: "Sunday Celebration Service",
  youtube_url: "https://www.youtube.com/watch?v=4H4mAG6Wc-Y",
  service_day: "Sunday",
  start_time: "10:00:00",
  end_time: "12:00:00",
  timezone: "Europe/Berlin",
  service_date: null,
  is_recurring: true
};

const DAYS_MAP: Record<string, number> = {
  'Sunday': 0,
  'Monday': 1,
  'Tuesday': 2,
  'Wednesday': 3,
  'Thursday': 4,
  'Friday': 5,
  'Saturday': 6
};

function extractVideoId(url: string) {
  try {
    const parsedUrl = new URL(url);
    if (parsedUrl.hostname.includes('youtube.com')) {
      // Standard watch URL: ?v=VIDEO_ID
      const v = parsedUrl.searchParams.get('v');
      if (v) return v;
      // Live URL format: /live/VIDEO_ID
      const liveMatch = parsedUrl.pathname.match(/\/live\/([^/?]+)/);
      if (liveMatch) return liveMatch[1];
      // Embed URL format: /embed/VIDEO_ID
      const embedMatch = parsedUrl.pathname.match(/\/embed\/([^/?]+)/);
      if (embedMatch) return embedMatch[1];
    }
    if (parsedUrl.hostname.includes('youtu.be')) {
      return parsedUrl.pathname.slice(1).split('?')[0];
    }
  } catch (e) {
    console.error("Invalid YouTube URL:", e);
  }
  return null;
}

export const LiveStream: React.FC = () => {
  const [config, setConfig] = useState<LiveStreamConfig>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);

  // Time states
  const [status, setStatus] = useState<'waiting' | 'live' | 'ended'>('waiting');
  const [timeLeft, setTimeLeft] = useState<{ d: number; h: number; m: number; s: number } | null>(null);

  useEffect(() => {
    // 1. Fetch backend configuration
    const fetchConfig = async () => {
      try {
        // We use the production or proxy endpoint appropriately. (Assuming /api/ acts as a proxy via Vite)
        const res = await fetch(`${API_BASE_URL}/api/livestream/`);
        if (res.ok) {
          const data = await res.json();
          setConfig(data);
        }
      } catch (e) {
        console.error("Could not fetch livestream config, using defaults.");
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, []);

  useEffect(() => {
    if (loading) return;

    // 2. Setup the countdown timer
    const calculateTime = () => {
      const now = new Date();
      
      // Get current wall-clock time in the target timezone
      const tzStr = now.toLocaleString('en-US', { timeZone: config.timezone });
      const tzNow = new Date(tzStr);

      const [startH, startM, startS] = config.start_time.split(':').map(Number);
      const [endH, endM, endS] = config.end_time.split(':').map(Number);

      let targetStart: Date;
      let targetEnd: Date;
      let mode: 'waiting' | 'live' | 'ended' = 'waiting';

      if (!config.is_recurring && config.service_date) {
        // One-off specific date
        targetStart = new Date(`${config.service_date}T${config.start_time}`);
        targetEnd = new Date(`${config.service_date}T${config.end_time}`);
        
        // Adjust for timezone - since we are comparing against tzNow (which is wall-clock in target TZ)
        // we can just treat the parsed Date as being in that same "local" frame if we are careful.
        // Actually, simpler to just use wall-clock comparison if we use tzNow.
        const [y, mm, d] = config.service_date.split('-').map(Number);
        targetStart = new Date(tzNow);
        targetStart.setFullYear(y, mm - 1, d);
        targetStart.setHours(startH, startM, startS || 0, 0);

        targetEnd = new Date(tzNow);
        targetEnd.setFullYear(y, mm - 1, d);
        targetEnd.setHours(endH, endM, endS || 0, 0);

        // If end time is <= start time, it logically means it ends at midnight or the next day
        if (targetEnd.getTime() <= targetStart.getTime()) {
          targetEnd.setDate(targetEnd.getDate() + 1);
        }

        if (tzNow.getTime() < targetStart.getTime()) {
          mode = 'waiting';
        } else if (tzNow.getTime() >= targetStart.getTime() && tzNow.getTime() <= targetEnd.getTime()) {
          mode = 'live';
        } else {
          mode = 'ended';
        }
      } else {
        // Recurring weekly logic
        const targetDay = DAYS_MAP[config.service_day] ?? 0;
        const currentDay = tzNow.getDay();
        
        targetStart = new Date(tzNow);
        targetStart.setHours(startH, startM, startS || 0, 0);

        targetEnd = new Date(tzNow);
        targetEnd.setHours(endH, endM, endS || 0, 0);

        // If end time is <= start time, it logically means it ends at midnight or the next day
        if (targetEnd.getTime() <= targetStart.getTime()) {
          targetEnd.setDate(targetEnd.getDate() + 1);
        }

        if (currentDay === targetDay) {
          if (tzNow.getTime() < targetStart.getTime()) {
            mode = 'waiting';
          } else if (tzNow.getTime() >= targetStart.getTime() && tzNow.getTime() <= targetEnd.getTime()) {
            mode = 'live';
          } else {
            mode = 'ended';
            targetStart.setDate(targetStart.getDate() + 7);
          }
        } else {
          mode = 'waiting';
          let daysUntil = (targetDay - currentDay + 7) % 7;
          targetStart.setDate(targetStart.getDate() + daysUntil);
        }
      }

      setStatus(mode);

      const diffMs = targetStart.getTime() - tzNow.getTime();

      if (diffMs > 0 && mode !== 'live') {
        const d = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const h = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
        const m = Math.floor((diffMs / 1000 / 60) % 60);
        const s = Math.floor((diffMs / 1000) % 60);
        setTimeLeft({ d, h, m, s });
      } else {
        setTimeLeft(null);
      }
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [config, loading]);

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  const videoId = extractVideoId(config.youtube_url) || '4H4mAG6Wc-Y';

  return (
    <div className="min-h-[80vh] bg-slate-50 flex flex-col items-center justify-center p-6 lg:p-12 relative overflow-hidden">
      
      {/* Decorative Blob */}
      <div className="absolute top-0 right-0 -mr-32 -mt-32 w-96 h-96 rounded-full bg-blue-100 blur-[100px] opacity-60 z-0 pointer-events-none"></div>

      <div className="z-10 w-full max-w-5xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-full text-sm font-bold uppercase tracking-wider mb-2 ring-1 ring-red-200 animate-pulse">
            <Video className="w-4 h-4" />
            Live Service
          </div>
          <h1 className="text-4xl lg:text-5xl font-extrabold text-[#00264A] tracking-tight">{config.title}</h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto font-medium">
            Join us locally or globally. Tune in {config.is_recurring ? `every ${config.service_day}` : `on ${config.service_date ? new Date(config.service_date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'the scheduled day'}`} starting at {config.start_time.slice(0, 5)} (Berlin time).
          </p>
        </div>

        {/* Content Section (Stream + Countdown) */}
        <div className="bg-white rounded-3xl shadow-2xl shadow-blue-900/5 ring-1 ring-slate-100 p-2 sm:p-4 overflow-hidden space-y-4">
          
          {/* Always show the YouTube player */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black"
          >
            <iframe
              src={`https://www.youtube.com/embed/${videoId}${status === 'live' ? '?autoplay=1' : ''}`}
              title="YouTube Livestream"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute top-0 left-0 w-full h-full border-0"
            />
          </motion.div>

          {/* Show countdown banner when not live */}
          {status !== 'live' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="rounded-2xl bg-slate-900 p-6 text-white text-center"
            >
              <div className="flex flex-col items-center gap-6">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-400" />
                  <p className="text-sm text-blue-200 uppercase tracking-widest font-semibold">
                    {status === 'ended' ? "Service ended — Next service begins in" : "Stream begins in"}
                  </p>
                </div>

                {timeLeft ? (
                  <div className="flex gap-4 sm:gap-6 items-center justify-center">
                    <TimeBox value={timeLeft.d} label="Days" />
                    <TimeSeparator />
                    <TimeBox value={timeLeft.h} label="Hours" />
                    <TimeSeparator />
                    <TimeBox value={timeLeft.m} label="Minutes" />
                    <TimeSeparator />
                    <TimeBox value={timeLeft.s} label="Seconds" />
                  </div>
                ) : (
                  <div className="h-16 flex items-center">
                    <span className="text-xl animate-pulse text-slate-400">Calculating time...</span>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper components for the timer
const TimeBox = ({ value, label }: { value: number; label: string }) => (
  <div className="flex flex-col items-center gap-2">
    <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700 w-16 h-16 sm:w-24 sm:h-24 rounded-2xl flex items-center justify-center shadow-inner">
      <span className="text-3xl sm:text-5xl font-mono font-bold text-white tracking-tighter">
        {value.toString().padStart(2, '0')}
      </span>
    </div>
    <span className="text-xs sm:text-sm font-medium text-slate-400 uppercase tracking-wider">{label}</span>
  </div>
);

const TimeSeparator = () => (
  <div className="text-3xl sm:text-5xl font-mono font-bold text-slate-600 mb-8 animate-pulse">
    :
  </div>
);
