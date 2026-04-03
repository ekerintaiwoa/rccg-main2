import React from 'react';
import { motion } from 'motion/react';
import { Play, ArrowRight, CheckCircle2 } from 'lucide-react';
import { API_BASE_URL } from '../config';
import { EVENTS } from '../constants';
import { Tab } from '../types';
import hero from '../../hero.jpeg';

interface HomeProps {
  setActiveTab: (tab: Tab) => void;
}

interface EventApi {
  id: number;
  title: string;
  date: string; // ISO date from backend
  time: string;
  description: string;
  category: string;
  is_upcoming: boolean;
  image_url: string | null;
  image_file?: string | null;
}

interface HomeSectionBullet {
  id: number;
  text: string;
  order: number;
}

interface HomeSection {
  id: number;
  title: string;
  description: string;
  image: string | null;
  button_text: string;
  button_link: string;
  order: number;
  bullets: HomeSectionBullet[];
}

export const Home: React.FC<HomeProps> = ({ setActiveTab }) => {
  const slides = [
    {
      id: 1,
      title: '2026: Our Year of Dominion',
      subtitle: 'Genesis 1:26',
      description:
        "Step into a year of authority, purpose, and God-given dominion as we align our lives with God's original mandate.",
      ctaPrimary: 'Plan Your Visit',
      ctaSecondary: 'Watch Live',
      image: hero,
    },
    {
      id: 2,
      title: 'A Home for Every Nation',
      subtitle: 'RCCG House of Glory Lübeck',
      description:
        "No matter your background, there is a place for you here to belong, grow, and serve in God's family.",
      ctaPrimary: "I'm New",
      ctaSecondary: 'View Events',
      image:
        'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=1600&q=80',
    },
    {
      id: 3,
      title: 'Growing Stronger in the Word',
      subtitle: 'Sermons, Bible Study & Prayer',
      description:
        'From Sunday messages to midweek Bible studies, we are committed to helping you build a strong foundation in the Word.',
      ctaPrimary: 'Latest Sermons',
      ctaSecondary: 'Give Online',
      image:
        'https://images.unsplash.com/photo-1490730141103-6ac27d020028?auto=format&fit=crop&w=1600&q=80',
    },
    {
      id: 4,
      title: 'Raising the Next Generation',
      subtitle: 'Children, Teens & Youth Ministry',
      description:
        'Dynamic ministries for children, teenagers, and young adults where destinies are shaped and gifts are discovered.',
      ctaPrimary: 'Family Ministries',
      ctaSecondary: 'View Events',
      image:
        'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1600&q=80',
    },
    {
      id: 5,
      title: 'Loving God, Serving People',
      subtitle: 'Outreach & Community Impact',
      description:
        'Through outreach, missions, and practical acts of love, we bring the light of Christ to our city and beyond.',
      ctaPrimary: 'Get Involved',
      ctaSecondary: 'Give Online',
      image:
        'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=1600&q=80',
    },
  ];

  const [currentSlide, setCurrentSlide] = React.useState(0);
  const [showDevotionalPrompt, setShowDevotionalPrompt] = React.useState(false);
  const [events, setEvents] = React.useState<EventApi[]>([]);
  const [eventsError, setEventsError] = React.useState<string | null>(null);
  const [homeSections, setHomeSections] = React.useState<HomeSection[]>([]);

  const resolveMediaUrl = (path?: string | null): string | null => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${API_BASE_URL}${path}`;
  };

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 7000);

    return () => clearInterval(interval);
  }, [slides.length]);

  React.useEffect(() => {
    const hasSeenPrompt = sessionStorage.getItem('openHeavenPromptSeen');
    if (hasSeenPrompt) return;

    const onScroll = () => {
      if (window.scrollY > 400) {
        setShowDevotionalPrompt(true);
        sessionStorage.setItem('openHeavenPromptSeen', '1');
        window.removeEventListener('scroll', onScroll);
      }
    };

    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  React.useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/events/`);
        if (!res.ok) {
          throw new Error('Failed to load events');
        }
        const data = (await res.json()) as EventApi[];
        const upcomingOnly = data.filter(e => e.is_upcoming);
        setEvents(upcomingOnly);
      } catch (err) {
        console.error(err);
        setEventsError('Unable to load events. Showing default sample events.');
      }
    };

    const fetchHomeSections = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/home-sections/`);
        if (res.ok) {
          const data = await res.json();
          setHomeSections(data);
        }
      } catch (err) {
        console.error('Failed to load home sections', err);
      }
    };

    fetchEvents();
    fetchHomeSections();
  }, []);

  const handlePrimaryClick = () => {
    const label = slides[currentSlide].ctaPrimary;

    if (label.includes('Visit') || label.includes("I'm New") || label.includes('Family')) {
      setActiveTab('about');
    } else if (label.includes('Sermon') || label.includes('Latest')) {
      setActiveTab('sermons');
    } else if (label.includes('Give')) {
      setActiveTab('give');
    } else if (label.includes('Involved')) {
      setActiveTab('events');
    } else {
      setActiveTab('about');
    }
  };

  const handleSecondaryClick = () => {
    const label = slides[currentSlide].ctaSecondary;

    if (label.includes('Watch')) {
      setActiveTab('sermons');
    } else if (label.includes('Events')) {
      setActiveTab('events');
    } else if (label.includes('Give')) {
      setActiveTab('give');
    } else {
      setActiveTab('about');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Hero Carousel Section */}
      <section className="bg-slate-50 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-center">
          <div className="relative w-full max-w-4xl overflow-hidden rounded-3xl bg-white border border-slate-200 shadow-2xl text-slate-900">
            {/* Background image */}
            <div className="absolute inset-0 z-0">
              <motion.img
                key={slides[currentSlide].id}
                src={slides[currentSlide].image}
                alt={slides[currentSlide].title}
                className="w-full h-full object-cover opacity-40"
                initial={{ opacity: 0, scale: 1.02 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/90 to-blue-50/80" />
            </div>

            {/* Content */}
            <div className="relative z-10 px-6 py-10 sm:px-10 sm:py-12 flex flex-col lg:flex-row items-center gap-10">
              <div className="flex-1 text-center lg:text-left">
                <motion.h1
                  key={slides[currentSlide].title}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6 }}
                  className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-3 sm:mb-4"
                >
                  {slides[currentSlide].title}
                </motion.h1>

                {slides[currentSlide].subtitle && (
                  <motion.p
                    key={slides[currentSlide].subtitle}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.05 }}
                    className="text-base sm:text-lg md:text-xl text-blue-700 font-semibold mb-3"
                  >
                    {slides[currentSlide].subtitle}
                  </motion.p>
                )}

                <motion.p
                  key={slides[currentSlide].description}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="max-w-xl text-sm sm:text-base md:text-lg text-slate-600 mb-6 sm:mb-8 mx-auto lg:mx-0"
                >
                  {slides[currentSlide].description}
                </motion.p>

                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.15 }}
                  className="flex flex-col sm:flex-row justify-center lg:justify-start items-center gap-4 mb-6"
                >
                  <button
                    onClick={handlePrimaryClick}
                    className="w-full sm:w-auto px-8 py-3 sm:py-4 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 hover:scale-105 transition-transform shadow-lg"
                  >
                    {slides[currentSlide].ctaPrimary}
                  </button>

                  <button
                    onClick={handleSecondaryClick}
                    className="w-full sm:w-auto px-8 py-3 sm:py-4 bg-blue-50 border border-blue-100 text-blue-700 font-bold rounded-lg hover:bg-blue-100 transition-all flex items-center justify-center gap-2"
                  >
                    {slides[currentSlide].ctaSecondary.includes('Watch') && (
                      <Play className="w-5 h-5" />
                    )}
                    {slides[currentSlide].ctaSecondary}
                  </button>
                </motion.div>

                {/* Dots */}
                <div className="flex justify-center lg:justify-start gap-2">
                  {slides.map((slide, index) => (
                    <button
                      key={slide.id}
                      onClick={() => setCurrentSlide(index)}
                      className={`h-2 rounded-full transition-all ${currentSlide === index ? 'w-6 bg-blue-600' : 'w-2 bg-blue-200'
                        }`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>
              </div>

              {/* Side image on large screens */}
              <div className="hidden lg:block flex-1 max-w-md">
                <div className="relative w-full pt-[70%] rounded-3xl overflow-hidden border border-slate-200 shadow-xl">
                  <motion.img
                    key={`side-${slides[currentSlide].id}`}
                    src={slides[currentSlide].image}
                    alt={slides[currentSlide].title}
                    className="absolute inset-0 w-full h-full object-cover"
                    initial={{ opacity: 0.5, scale: 1.02 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6 }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dynamic Welcome Sections */}
      {homeSections.length > 0 ? (
        homeSections.map((section, index) => (
          <section key={section.id} className={`py-24 ${index % 2 !== 0 ? 'bg-slate-50' : 'bg-white'}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid md:grid-cols-2 gap-16 items-center">
                {/* Image side */}
                <div className={`relative ${index % 2 !== 0 ? 'md:order-2' : ''}`}>
                  {section.image ? (
                    <img
                      src={resolveMediaUrl((section as any).image) || ''}
                      alt={section.title}
                      className="rounded-2xl shadow-2xl w-full h-[500px] object-cover"
                    />
                  ) : (
                    <div className="rounded-2xl shadow-2xl w-full h-[500px] bg-slate-200 flex items-center justify-center">
                      <span className="text-slate-400 font-medium">No Image</span>
                    </div>
                  )}
                </div>
                {/* Text side */}
                <div className={`${index % 2 !== 0 ? 'md:order-1' : ''}`}>
                  <h2 className="text-4xl font-bold text-slate-900 mb-6">{section.title}</h2>
                  <p className="text-lg text-slate-600 mb-8 leading-relaxed whitespace-pre-wrap">
                    {section.description}
                  </p>
                  {section.bullets && section.bullets.length > 0 && (
                    <ul className="space-y-4 mb-10">
                      {section.bullets.map((bullet) => (
                        <li key={bullet.id} className="flex items-start gap-3">
                          <CheckCircle2 className="w-6 h-6 text-blue-600 shrink-0 mt-0.5" />
                          <span className="text-slate-700 font-medium">{bullet.text}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  {section.button_text && (
                    <button
                      onClick={() => setActiveTab(section.button_link as Tab)}
                      className="inline-flex items-center gap-2 px-6 py-3 border-2 border-blue-600 text-blue-600 font-bold rounded-lg hover:bg-blue-600 hover:text-white transition-all"
                    >
                      {section.button_text}
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </section>
        ))
      ) : (
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=800&q=80"
                  alt="RCCG Community"
                  className="rounded-2xl shadow-2xl w-full h-[500px] object-cover"
                />
              </div>
              <div>
                <h2 className="text-4xl font-bold text-slate-900 mb-6">Welcome to RCCG</h2>
                <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                  The Redeemed Christian Church of God is a worldwide community of believers dedicated to holiness, prayer,
                  and spreading the Gospel of Jesus Christ to every nation. Whether you're seeking spiritual growth or a
                  place to call home, you are welcome here.
                </p>
                <ul className="space-y-4 mb-10">
                  {[
                    'Bible-based teaching and spiritual guidance.',
                    'A global mandate to reach every family in every nation.',
                    'A commitment to holiness and Christ-like living.',
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle2 className="w-6 h-6 text-blue-600 shrink-0 mt-0.5" />
                      <span className="text-slate-700 font-medium">{item}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => setActiveTab('about')}
                  className="inline-flex items-center gap-2 px-6 py-3 border-2 border-blue-600 text-blue-600 font-bold rounded-lg hover:bg-blue-600 hover:text-white transition-all"
                >
                  Plan Your Visit
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Upcoming Events */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-bold text-slate-900">Upcoming Events</h2>
              <p className="text-slate-500 mt-2">Life is better together. See what's happening this month.</p>
            </div>
            <button
              onClick={() => setActiveTab('events')}
              className="hidden sm:flex items-center gap-2 text-blue-600 font-semibold hover:underline"
            >
              View Calendar <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {events.length === 0 ? (
              <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-slate-100">
                <p className="text-slate-500 font-medium text-lg">No upcoming events scheduled right now.</p>
                <p className="text-slate-400 text-sm mt-1">Please check back later.</p>
              </div>
            ) : (
              events.slice(0, 3).map((event) => {
                const dateObj = new Date(event.date);
                const month = dateObj.toLocaleString('en-US', { month: 'short' }).toUpperCase();
                const day = dateObj.getDate();
                const dateLabel = `${month} ${day}`;
                
                const imageSrc = resolveMediaUrl(event.image_file) || resolveMediaUrl(event.image_url) || 'https://images.unsplash.com/photo-1438032005730-c779502df39b?auto=format&fit=crop&w=800&q=80';

                return (
                  <div
                    key={event.id}
                    className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group"
                  >
                    <div className="h-48 overflow-hidden">
                      <img
                        src={imageSrc}
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-6">
                      <div className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-2">
                        {dateLabel} • {event.time}
                      </div>
                      <h3 className="text-xl font-bold mb-3 text-slate-800">{event.title}</h3>
                      <p className="text-slate-600 text-sm mb-4 line-clamp-2">{event.description}</p>
                      <button
                        onClick={() => setActiveTab('events')}
                        className="text-blue-600 font-medium text-sm hover:underline"
                      >
                        Learn more
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>

      {/* Open Heaven prompt modal */}
      {showDevotionalPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-100 p-6 sm:p-7">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-blue-600 mb-2">
              Daily Devotional
            </p>
            <h3 className="text-2xl font-bold text-slate-900 mb-3">
              Read the Open Heaven for Today
            </h3>
            <p className="text-sm text-slate-600 mb-5">
              Stay refreshed in God&apos;s presence. Take a moment to read today&apos;s Open Heaven devotional.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => {
                  setShowDevotionalPrompt(false);
                  setActiveTab('devotional');
                }}
                className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors"
              >
                Read Today&apos;s Devotional
              </button>
              <button
                onClick={() => setShowDevotionalPrompt(false)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-lg border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};
