import React from 'react';
import { Book, Image as ImageIcon, Heart, BookOpen, Sun, FileText, Video } from 'lucide-react';
import { Tab } from '../types';

interface SidebarProps {
    activeTab: Tab;
    setActiveTab: (tab: Tab) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
    const sidebarItems: { label: string; value: Tab; icon: React.ReactNode }[] = [
        { label: 'Library', value: 'library', icon: <Book className="w-5 h-5" /> },
        { label: 'Gallery', value: 'gallery', icon: <ImageIcon className="w-5 h-5" /> },
        { label: 'Prayer', value: 'prayer', icon: <Heart className="w-5 h-5" /> },
        { label: 'Bible', value: 'bible', icon: <BookOpen className="w-5 h-5" /> },
        { label: 'Open Heaven', value: 'devotional', icon: <Sun className="w-5 h-5" /> },
        { label: 'Blog', value: 'blog', icon: <FileText className="w-5 h-5" /> },
        { label: 'Live Service', value: 'live', icon: <Video className="w-5 h-5" /> },
    ];

    return (
        <aside className="hidden lg:flex flex-col w-72 bg-slate-900 text-slate-300 h-screen sticky top-0 shrink-0 border-r border-slate-800 shadow-xl z-40">
            <div className="p-8 pb-4">
                <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6 border-b border-slate-800 pb-2">Resources</h2>
                <nav className="space-y-2">
                    {sidebarItems.map((item) => (
                        <button
                            key={item.value}
                            onClick={() => setActiveTab(item.value)}
                            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl font-semibold transition-all ${activeTab === item.value
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                                }`}
                        >
                            <span className={`${activeTab === item.value ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'}`}>
                                {item.icon}
                            </span>
                            {item.label}
                        </button>
                    ))}
                </nav>
            </div>

            <div className="mt-auto p-8 border-t border-slate-800 bg-slate-800/30">
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-2xl p-5 text-center shadow-inner">
                    <p className="text-sm font-semibold text-slate-300 mb-4">Support Our Ministry</p>
                    <button
                        onClick={() => setActiveTab('give')}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white justify-center py-2.5 rounded-xl text-sm font-bold transition-colors flex items-center gap-2"
                    >
                        <Heart className="w-4 h-4" />
                        Give Online
                    </button>
                </div>
            </div>
        </aside>
    );
};
