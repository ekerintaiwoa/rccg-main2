import React from 'react';
import { Menu, X } from 'lucide-react';
import logo from '../../logo.png';
import { Tab } from '../types';

interface NavbarProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const navItems: { label: string; value: Tab }[] = [
    { label: 'Home', value: 'home' },
    { label: 'Events', value: 'events' },
    { label: 'Sermons', value: 'sermons' },
    { label: 'Live', value: 'live' },
    { label: 'About', value: 'about' },
    { label: 'Contact', value: 'contact' },
  ];

  return (
    <header className="sticky top-0 z-50 shadow-sm bg-white/80 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center gap-4 cursor-pointer" onClick={() => setActiveTab('home')}>
            <img src={logo} alt="RCCG Logo" className="w-12 h-12 object-contain" />
            <div className="hidden sm:flex flex-col">
              <span className="brand-heading text-lg leading-tight">RCCG House of Glory</span>
              <span className="text-xs text-slate-500">Jesus Christ the same yesterday, today and forever</span>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8">
            {navItems.map((item) => (
              <button
                key={item.value}
                onClick={() => setActiveTab(item.value)}
                className={`transition-colors font-medium ${activeTab === item.value ? 'text-slate-900 border-b-2 border-slate-900 pb-1' : 'text-slate-600 hover:text-slate-900'}`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveTab('give')}
              className="btn-primary hidden md:inline-flex items-center gap-2"
              aria-label="Give Online"
            >
              Donate
            </button>

            {/* Mobile menu button */}
            <div className="lg:hidden">
              <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-slate-700">
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile panel */}
      {isOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white/95">
          <div className="max-w-7xl mx-auto px-4 py-4 grid grid-cols-1 gap-2">
            {navItems.concat([{ label: 'Library', value: 'library' }, { label: 'Gallery', value: 'gallery' }, { label: 'Prayer', value: 'prayer' } as any]).map((item) => (
              <button
                key={item.value}
                onClick={() => {
                  setActiveTab(item.value as Tab);
                  setIsOpen(false);
                }}
                className={`w-full text-left py-3 px-2 font-medium ${activeTab === item.value ? 'text-slate-900' : 'text-slate-600'}`}
              >
                {item.label}
              </button>
            ))}

            <div className="mt-2">
              <button
                onClick={() => { setActiveTab('give'); setIsOpen(false); }}
                className="w-full btn-primary text-center"
              >
                Give Online
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
