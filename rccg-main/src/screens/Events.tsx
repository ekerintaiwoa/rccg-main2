import React from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, MapPin, X } from 'lucide-react';

interface EventApi {
  id: number;
  title: string;
  date: string; // ISO date from backend
  time: string;
  description: string;
  category: string;
  image_url: string | null;
  image_file?: string | null;
}

export const Events: React.FC = () => {
  const [events, setEvents] = React.useState<EventApi[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [selectedEventId, setSelectedEventId] = React.useState<number | null>(null);
  const [showDetailModal, setShowDetailModal] = React.useState(false);

  const resolveMediaUrl = (path?: string | null): string | null => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `http://127.0.0.1:8000${path}`;
  };

  React.useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch('http://127.0.0.1:8000/api/events/');
        if (!res.ok) {
          throw new Error('Failed to load events');
        }
        const data = (await res.json()) as EventApi[];
        setEvents(data);
      } catch (err) {
        console.error(err);
        setError('Unable to load events right now. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const monthName = today.toLocaleString('default', { month: 'long' });
  const numDays = new Date(currentYear, currentMonth + 1, 0).getDate();
  const days = Array.from({ length: numDays }, (_, i) => i + 1);
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const weekDays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  const selectedEvent = React.useMemo(
    () => events.find((e) => e.id === selectedEventId) || null,
    [events, selectedEventId]
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16"
    >
      <div className="mb-12">
        <h1 className="text-4xl font-extrabold text-slate-900 mb-4">Church Events & Calendar</h1>
        <p className="text-lg text-slate-600 max-w-2xl">Stay connected with our community. From weekly worship to small groups and youth services, there's a place for everyone.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Calendar View */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 flex items-center justify-between border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-900">{`${monthName} ${currentYear}`}</h2>
              <div className="flex gap-2">
                <button className="p-2 hover:bg-slate-50 rounded-lg border border-slate-200 transition-colors">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button className="p-2 hover:bg-slate-50 rounded-lg border border-slate-200 transition-colors">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-7 bg-slate-50 border-b border-slate-100">
              {weekDays.map(day => (
                <div key={day} className="py-3 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">{day}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-px bg-slate-200">
              {/* Empty slots for days before the 1st of the month */}
              {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                <div key={`empty-${i}`} className="min-h-[120px] bg-slate-50 p-2 opacity-30" />
              ))}
              
              {days.map(day => {
                const isToday = day === today.getDate();
                // Filter events matching this specific year, month, and day
                const dayEvents = events.filter((e) => {
                  const ed = new Date(e.date);
                  return ed.getFullYear() === currentYear && ed.getMonth() === currentMonth && ed.getDate() === day;
                });
                
                return (
                  <div key={day} className={`min-h-[120px] bg-white p-2 transition-colors hover:bg-slate-50 ${isToday ? 'ring-2 ring-blue-600 ring-inset' : ''}`}>
                    <span className={`text-sm font-medium ${isToday ? 'text-blue-600 font-bold' : 'text-slate-400'}`}>{day}</span>
                    <div className="mt-2 space-y-1">
                      {dayEvents.map(event => {
                        const badgeClasses =
                          event.category === 'worship' ? 'bg-blue-50 text-blue-600'
                          : event.category === 'youth' ? 'bg-orange-50 text-orange-600'
                          : event.category === 'small-group' || event.category === 'groups' ? 'bg-green-50 text-green-700'
                          : 'bg-purple-50 text-purple-600';
                          
                        return (
                          <div key={event.id} onClick={(e) => {
                            e.stopPropagation();
                            setSelectedEventId(event.id);
                            setShowDetailModal(true);
                          }} className={`text-[10px] p-1 rounded font-bold truncate cursor-pointer hover:opacity-80 ${badgeClasses}`}>
                            {event.title}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
              {/* Optional: Add trailing empty boxes to complete the 7xN grid */}
              {Array.from({ length: (7 - ((firstDayOfMonth + numDays) % 7)) % 7 }).map((_, i) => (
                <div key={`next-empty-${i}`} className="min-h-[120px] bg-slate-50 p-2 opacity-30" />
              ))}
            </div>
          </div>
        </div>

        {/* Weekly List */}
        <div className="space-y-8">
          <h3 className="text-2xl font-bold text-slate-900">Weekly Events</h3>
          {loading && (
            <p className="text-sm text-slate-500">Loading events...</p>
          )}

          {error && !loading && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          {!loading && !error && events.length === 0 && (
            <p className="text-sm text-slate-500">No upcoming events have been added yet.</p>
          )}

          {!loading && !error && events.length > 0 && (
            <div className="space-y-4">
              {events.map((event) => {
                const dateObj = new Date(event.date);
                const month = dateObj.toLocaleString('en-US', { month: 'short' }).toUpperCase();
                const day = dateObj.getDate();
                const imageSrc =
                  resolveMediaUrl(event.image_file) ||
                  resolveMediaUrl(event.image_url) ||
                  'https://images.unsplash.com/photo-1438032005730-c779502df39b?auto=format&fit=crop&w=800&q=80';

                const badgeClasses =
                  event.category === 'worship'
                    ? 'bg-blue-50 text-blue-600'
                    : event.category === 'youth'
                    ? 'bg-orange-50 text-orange-600'
                    : event.category === 'small-group' || event.category === 'groups'
                    ? 'bg-green-50 text-green-700'
                    : 'bg-purple-50 text-purple-600';

                return (
                  <div
                    key={event.id}
                    onClick={() => {
                      setSelectedEventId(event.id);
                      setShowDetailModal(true);
                    }}
                    className={`bg-white border p-5 rounded-2xl shadow-sm flex gap-4 hover:border-blue-600 transition-all group cursor-pointer ${
                      selectedEventId === event.id ? 'border-blue-500 ring-2 ring-blue-100' : 'border-slate-200'
                    }`}
                  >
                    <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0 hidden sm:block">
                      <img
                        src={imageSrc}
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div
                      className={`w-16 h-16 shrink-0 rounded-xl flex flex-col items-center justify-center font-bold ${badgeClasses}`}
                    >
                      <span className="text-[10px] uppercase">{month}</span>
                      <span className="text-xl leading-none">{day}</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {event.title}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                        <Clock className="w-3 h-3" />
                        {event.time}
                      </div>
                      <p className="text-sm text-slate-600 mt-2 line-clamp-2">{event.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <button className="w-full py-4 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors">
            View All Upcoming Events
          </button>
        </div>
      </div>

      {selectedEvent && showDetailModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 px-4">
          <div className="relative max-w-2xl w-full bg-white rounded-2xl shadow-xl overflow-hidden">
            <button
              onClick={() => setShowDetailModal(false)}
              className="absolute top-3 right-3 z-10 rounded-full bg-white/90 border border-slate-200 p-1 text-slate-500 hover:text-slate-800 hover:bg-white"
              aria-label="Close event details"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="h-56 sm:h-64 overflow-hidden">
              <img
                src={
                  resolveMediaUrl(selectedEvent.image_file) ||
                  resolveMediaUrl(selectedEvent.image_url) ||
                  'https://images.unsplash.com/photo-1438032005730-c779502df39b?auto=format&fit=crop&w=800&q=80'
                }
                alt={selectedEvent.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-6 sm:p-8">
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest mb-2">
                {new Date(selectedEvent.date).toLocaleDateString(undefined, {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}{' '}
                • {selectedEvent.time}
              </p>
              <h4 className="text-2xl font-bold text-slate-900 mb-3">{selectedEvent.title}</h4>
              <div className="flex items-center gap-3 text-sm text-slate-500 mb-4">
                <Clock className="w-4 h-4" />
                <span>{selectedEvent.time}</span>
              </div>
              <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
                {selectedEvent.description}
              </p>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};
