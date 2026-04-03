import React from 'react';
import { motion } from 'motion/react';
import { API_BASE_URL } from '../config';
import { Search, Play, Headphones, FileText, ChevronLeft, ChevronRight } from 'lucide-react';

interface SermonApi {
  id: number;
  title: string;
  series: string;
  date: string; // ISO from backend
  speaker: string;
  description: string;
  duration: string;
  thumbnail_url: string | null;
  thumbnail_file?: string | null;
}

export const Sermons: React.FC = () => {
  const [sermons, setSermons] = React.useState<SermonApi[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const resolveMediaUrl = (path?: string | null): string | null => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${API_BASE_URL}${path}`;
  };

  React.useEffect(() => {
    const fetchSermons = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/sermons/`);
        if (!res.ok) {
          throw new Error('Failed to load sermons');
        }
        const data = (await res.json()) as SermonApi[];
        setSermons(data);
      } catch (err) {
        console.error(err);
        setError('Unable to load sermons right now. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchSermons();
  }, []);
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Hero Section */}
      <section className="relative bg-slate-900 text-white py-24 overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <img 
            src="https://images.unsplash.com/photo-1438032005730-c779502df39b?auto=format&fit=crop&w=1920&q=80" 
            alt="Church" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/80 to-transparent"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <span className="inline-block px-3 py-1 bg-blue-600 text-xs font-bold uppercase tracking-widest rounded-lg mb-6">Current Series</span>
            <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">Walking in Light: <br />The Epistles of John</h1>
            <p className="text-lg md:text-xl text-slate-300 mb-8 leading-relaxed">
              Join us for an 8-week journey through 1st, 2nd, and 3rd John as we explore what it truly means to live in fellowship with God and one another.
            </p>
            <div className="flex flex-wrap gap-4">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-bold flex items-center gap-2 transition-all">
                <Play className="w-5 h-5 fill-current" />
                Watch Latest
              </button>
              <button className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white px-8 py-3 rounded-lg font-bold transition-all border border-white/20">
                Browse Series
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Library Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Filters */}
        <div className="mb-12">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="flex-1 max-w-md">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Search Library</label>
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Search by title, verse, or keyword..." 
                  className="w-full pl-10 pr-4 py-3 rounded-xl border-slate-200 focus:ring-blue-600 focus:border-blue-600"
                />
                <Search className="w-5 h-5 text-slate-400 absolute left-3 top-3.5" />
              </div>
            </div>
            <div className="flex flex-wrap gap-4">
              {['Series', 'Speaker', 'Topic'].map((filter) => (
                <div key={filter} className="w-full sm:w-auto">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">{filter}</label>
                  <select className="w-full rounded-xl border-slate-200 focus:ring-blue-600 focus:border-blue-600 min-w-[160px]">
                    <option>All {filter}s</option>
                  </select>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sermon Grid */}
        {loading && (
          <p className="text-center text-sm text-slate-500">Loading sermons...</p>
        )}

        {error && !loading && (
          <p className="text-center text-sm text-red-500 mb-6">{error}</p>
        )}

        {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sermons.map((sermon) => {
            const formattedDate = new Date(sermon.date).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            });
            const thumbnailSrc =
              resolveMediaUrl(sermon.thumbnail_file) ||
              resolveMediaUrl(sermon.thumbnail_url) ||
              'https://images.unsplash.com/photo-1490730141103-6ac27d020028?auto=format&fit=crop&w=800&q=80';
            return (
            <article key={sermon.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group border border-slate-100">
              <div className="relative aspect-video overflow-hidden">
                <img src={thumbnailSrc} alt={sermon.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                  <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center text-blue-600 transform scale-0 group-hover:scale-100 transition-transform duration-300 shadow-lg">
                    <Play className="w-6 h-6 fill-current" />
                  </div>
                </div>
                <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded font-medium">{sermon.duration}</span>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{sermon.series}</span>
                  <span className="text-xs text-slate-500">• {formattedDate}</span>
                </div>
                <h3 className="text-lg font-bold mb-2 group-hover:text-blue-600 transition-colors leading-tight">{sermon.title}</h3>
                <p className="text-sm text-slate-600 line-clamp-2 mb-4">{sermon.description}</p>
                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                  <span className="text-sm font-medium text-slate-700">{sermon.speaker}</span>
                  <div className="flex gap-3 text-slate-400">
                    <Headphones className="w-5 h-5 cursor-pointer hover:text-blue-600 transition-colors" />
                    <FileText className="w-5 h-5 cursor-pointer hover:text-blue-600 transition-colors" />
                  </div>
                </div>
              </div>
            </article>
          );})}
        </div>
        )}

        {/* Pagination */}
        <div className="mt-16 flex justify-center">
          <nav className="flex items-center gap-2">
            <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-blue-600 text-white font-bold">1</button>
            <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50 font-medium">2</button>
            <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50 font-medium">3</button>
            <span className="px-2 text-slate-400">...</span>
            <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50 font-medium">12</button>
            <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50">
              <ChevronRight className="w-5 h-5" />
            </button>
          </nav>
        </div>
      </section>
    </motion.div>
  );
};
