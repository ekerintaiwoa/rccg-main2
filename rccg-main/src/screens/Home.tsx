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

interface SlideData {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  ctaPrimary: string;
  ctaSecondary: string;
}

const DEFAULT_SLIDES: SlideData[] = [
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

export const Home: React.FC<HomeProps> = ({ setActiveTab }) => {
  const [slides, setSlides] = React.useState<SlideData[]>(DEFAULT_SLIDES);
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
    if (!slides.length) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 7000);

    return () => clearInterval(interval);
  }, [slides.length]);

  React.useEffect(() => {
    const fetchSlides = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/slides/`);
        if (!res.ok) {
          throw new Error(`Failed to load slides: ${res.statusText}`);
        }

        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const mappedSlides = data.map((slide: any) => ({
            id: slide.id,
            title: slide.title,
            subtitle: slide.subtitle || '',
            description: slide.description || '',
            image: resolveMediaUrl(slide.image_url || slide.image_file) || hero,
            ctaPrimary: slide.cta_primary || 'Learn More',
            ctaSecondary: slide.cta_secondary || '',
          }));
          setSlides(mappedSlides);
          setCurrentSlide(0);
        }
      } catch (err) {
        console.error('Failed to load slides', err);
      }
    };

    fetchSlides();
  }, []);

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
      {/* Mission-Focused Hero */}
      <section className="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 text-white py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="brand-heading text-4xl sm:text-5xl text-white font-extrabold mb-4">Worship God. Grow in Faith. Impact the World.</h1>
            <p className="text-lg sm:text-xl text-blue-100 max-w-2xl mx-auto leading-relaxed mb-8">We are a family of believers passionate about God, committed to raising champions and taking territories for Christ.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button onClick={() => setActiveTab('about')} className="btn-primary text-white font-bold">Join Us This Sunday</button>
              <button onClick={() => setActiveTab('live')} className="px-8 py-3 border border-white rounded-lg text-white font-bold hover:bg-white/10 transition-colors">Watch Live Service</button>
            </div>
          </div>

          {/* Service Times Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { title: 'Sunday Service', time: '09:00 - 11:30' },
              { title: 'Wednesday Study', time: '18:30 - 20:00' },
              { title: 'Friday Prayer', time: '18:30 - 20:00' },
              { title: 'Holy Ghost Svc', time: '1st Fri 22:00' }
            ].map((s, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <p className="text-xs font-semibold text-blue-100">{s.title}</p>
                <p className="font-bold text-white">{s.time}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { icon: '🙏', title: 'Worship', desc: "Experience God's presence in our powerful services." },
              { icon: '📖', title: 'Word', desc: 'Teachings that transform lives and build strong faith.' },
              { icon: '❤️', title: 'Community', desc: 'Connect, grow, and do life together in love.' },
              { icon: '🌍', title: 'Mission', desc: 'Raising champions and taking territories for Christ.' }
            ].map((v, i) => (
              <div key={i} className="text-center">
                <div className="text-5xl mb-3">{v.icon}</div>
                <h3 className="font-bold text-xl text-slate-900 mb-2">{v.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Slide Showcase Section */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-600 mb-3">Featured Messages</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">Recent Highlights from Our Church Family</h2>
              <p className="text-slate-600 max-w-2xl leading-relaxed mb-8">Explore key themes from our latest ministry focus, including worship, prayer, outreach, and life transformation.</p>

              <div className="grid gap-4">
                <div className="rounded-[28px] overflow-hidden border border-slate-200 bg-white shadow-2xl">
                  <div className="relative h-72 overflow-hidden">
                    <img src={slides[currentSlide].image} alt={slides[currentSlide].title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                      <p className="text-xs uppercase tracking-[0.35em] text-blue-300 mb-2">{slides[currentSlide].subtitle}</p>
                      <h3 className="text-2xl font-bold mb-2">{slides[currentSlide].title}</h3>
                      <p className="text-sm text-slate-100 max-w-xl">{slides[currentSlide].description}</p>
                    </div>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <button onClick={handlePrimaryClick} className="btn-primary w-full px-6 py-4 text-sm font-semibold">{slides[currentSlide].ctaPrimary}</button>
                  <button onClick={handleSecondaryClick} className="w-full px-6 py-4 border border-slate-200 rounded-3xl text-slate-700 font-semibold hover:bg-slate-100 transition">{slides[currentSlide].ctaSecondary || 'Learn More'}</button>
                </div>
              </div>
            </div>

            <div className="grid gap-4">
              {slides.map((slide, index) => (
                <button key={slide.id} onClick={() => setCurrentSlide(index)} className={`text-left rounded-3xl border px-5 py-4 transition ${currentSlide === index ? 'border-blue-600 bg-blue-50' : 'border-slate-200 bg-white hover:border-slate-400'}`}>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500 mb-2">{slide.subtitle}</p>
                  <h4 className="font-semibold text-slate-900 mb-1">{slide.title}</h4>
                  <p className="text-sm text-slate-600 line-clamp-2">{slide.description}</p>
                </button>
              ))}
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
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3">Upcoming Events</h2>
            <p className="text-slate-600 text-lg">Join us and grow your faith</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 mb-10">
            {events.length === 0 ? (
              <div className="col-span-full py-12 text-center card">
                <p className="text-slate-500 font-medium text-lg">No upcoming events scheduled right now.</p>
                <p className="text-slate-400 text-sm mt-1">Check back soon for more gatherings.</p>
              </div>
            ) : (
              events.slice(0, 3).map((event) => {
                const dateObj = new Date(event.date);
                const month = dateObj.toLocaleString('en-US', { month: 'short' }).toUpperCase();
                const day = dateObj.getDate();
                const imageSrc = resolveMediaUrl(event.image_file) || resolveMediaUrl(event.image_url) || 'https://images.unsplash.com/photo-1438032005730-c779502df39b?auto=format&fit=crop&w=800&q=80';

                return (
                  <div key={event.id} className="card overflow-hidden hover:shadow-lg transition-shadow group cursor-pointer" onClick={() => setActiveTab('events')}>
                    <div className="h-48 overflow-hidden relative">
                      <img src={imageSrc} alt={event.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-lg text-xs font-bold text-blue-600">{month} {day}</div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-slate-900 mb-2">{event.title}</h3>
                      <p className="text-slate-600 text-sm mb-3 flex items-center gap-2"><Clock className="w-4 h-4" />{event.time}</p>
                      <p className="text-slate-600 text-sm line-clamp-2 mb-4">{event.description}</p>
                      <button className="text-blue-600 font-semibold text-sm hover:underline">Learn More →</button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="text-center">
            <button onClick={() => setActiveTab('events')} className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors">
              View Full Calendar <ArrowRight className="w-5 h-5" />
            </button>
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
