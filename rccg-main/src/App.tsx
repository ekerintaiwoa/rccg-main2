import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { Footer } from './components/Footer';
import { Home } from './screens/Home';
import { Events } from './screens/Events';
import { Sermons } from './screens/Sermons';
import { Give } from './screens/Give';
import { About } from './screens/About';
import { Contact } from './screens/Contact';
import { Blog } from './screens/Blog';
import { OpenHeaven } from './screens/OpenHeaven';
import { Library } from './screens/Library';
import { Gallery } from './screens/Gallery';
import { Prayer } from './screens/Prayer';
import { Bible } from './screens/Bible';
import { LiveStream } from './screens/LiveStream';
import { Tab } from './types';
import { AuthProvider } from './AuthContext';

export default function App() {
  const [activeTab, setActiveTab] = React.useState<Tab>(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab') as Tab;
    const validTabs: Tab[] = ['home', 'events', 'sermons', 'give', 'about', 'contact', 'blog', 'devotional', 'library', 'gallery', 'prayer', 'bible', 'live'];
    return validTabs.includes(tab) ? tab : 'home';
  });

  // Scroll to top when tab changes
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeTab]);

  // Sync state to URL and handle browser back navigation
  React.useEffect(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.get('tab') !== activeTab) {
      url.searchParams.set('tab', activeTab);
      window.history.pushState({}, '', url);
    }
  }, [activeTab]);

  React.useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab') as Tab;
      const validTabs: Tab[] = ['home', 'events', 'sermons', 'give', 'about', 'contact', 'blog', 'devotional', 'library', 'gallery', 'prayer', 'bible', 'live'];
      if (validTabs.includes(tab)) {
        setActiveTab(tab);
      } else {
        setActiveTab('home');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const renderScreen = () => {
    switch (activeTab) {
      case 'home':
        return <Home setActiveTab={setActiveTab} />;
      case 'events':
        return <Events />;
      case 'sermons':
        return <Sermons />;
      case 'give':
        return <Give />;
      case 'about':
        return <About />;
      case 'contact':
        return <Contact />;
      case 'blog':
        return <Blog />;
      case 'devotional':
        return <OpenHeaven />;
      case 'library':
        return <Library />;
      case 'gallery':
        return <Gallery />;
      case 'prayer':
        return <Prayer />;
      case 'bible':
        return <Bible />;
      case 'live':
        return <LiveStream />;
      default:
        return <Home setActiveTab={setActiveTab} />;
    }
  };

  return (
    <AuthProvider>
      <div className="min-h-screen flex font-sans text-slate-900 bg-white">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        <div className="flex-1 flex flex-col min-w-0 min-h-screen">
          <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

          <main className="flex-grow overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                {renderScreen()}
              </motion.div>
            </AnimatePresence>
          </main>

          <Footer />
        </div>

        {/* Weekly Event Floating Widget */}
        <div
          onClick={() => setActiveTab('events')}
          className="fixed top-32 right-0 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-l-2xl shadow-2xl z-[60] cursor-pointer flex items-center gap-2 group transition-all"
        >
          <div className="flex flex-col items-end">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-200">Weekly</span>
            <span className="text-sm font-bold whitespace-nowrap">Events</span>
          </div>
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        </div>

      </div>
    </AuthProvider>
  );
}
