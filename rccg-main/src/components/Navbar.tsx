import React from 'react';
import { Cross, Menu, X } from 'lucide-react';
import logo from '../../logo.png';
import { Tab } from '../types';

interface NavbarProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const desktopNavItems: { label: string; value: Tab }[] = [
    { label: 'Home', value: 'home' },
    { label: 'Events', value: 'events' },
    { label: 'Sermons', value: 'sermons' },
    { label: 'About', value: 'about' },
    { label: 'Contact', value: 'contact' },
  ];

  const mobileNavItems: { label: string; value: Tab }[] = [
    { label: 'Home', value: 'home' },
    { label: 'Events', value: 'events' },
    { label: 'Sermons', value: 'sermons' },
    { label: 'Library', value: 'library' },
    { label: 'Gallery', value: 'gallery' },
    { label: 'Prayer', value: 'prayer' },
    { label: 'Bible', value: 'bible' },
    { label: 'Open Heaven', value: 'devotional' },
    { label: 'Blog', value: 'blog' },
    { label: 'About', value: 'about' },
    { label: 'Contact', value: 'contact' },
  ];

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20 gap-8">
          <div className="flex items-center gap-3 cursor-pointer shrink-0" onClick={() => setActiveTab('home')}>
            <img src={logo} alt="RCCG Logo" className="w-14 h-14 object-contain" />
            <div className="flex flex-col hidden sm:flex">
              <span className="text-xl font-extrabold tracking-tight text-[#00264A] whitespace-nowrap leading-tight">
                Rccg House of Glory Parish Lübeck
              </span>
              <span className="text-sm font-semibold italic text-blue-800 whitespace-nowrap mt-0.5">
                Jesus Christ the same yesterday, and to day, and for ever (Hebrews 13:8).
              </span>
            </div>
          </div>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center space-x-8">
            {desktopNavItems.map((item) => (
              <button
                key={item.value}
                onClick={() => setActiveTab(item.value)}
                className={`font-medium transition-colors ${activeTab === item.value
                  ? 'text-blue-600 border-b-2 border-blue-600 pb-1'
                  : 'text-slate-600 hover:text-blue-600'
                  }`}
              >
                {item.label}
              </button>
            ))}
            <button
              onClick={() => setActiveTab('give')}
              className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-all shadow-sm"
            >
              Give Online
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-slate-600 p-2"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 py-4 px-4 space-y-4">
          {mobileNavItems.map((item) => (
            <button
              key={item.value}
              onClick={() => {
                setActiveTab(item.value);
                setIsOpen(false);
              }}
              className={`block w-full text-left font-medium py-2 ${activeTab === item.value ? 'text-blue-600' : 'text-slate-600'
                }`}
            >
              {item.label}
            </button>
          ))}
          <button
            onClick={() => {
              setActiveTab('give');
              setIsOpen(false);
            }}
            className="block w-full bg-blue-600 text-white px-5 py-3 rounded-lg font-semibold text-center"
          >
            Give Online
          </button>
        </div>
      )}
    </nav>
  );
};
