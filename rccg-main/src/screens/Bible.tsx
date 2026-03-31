import React, { useState } from 'react';
import { Book, Calendar, Search, BookOpen, ChevronDown, Loader2 } from 'lucide-react';

const VERSIONS = [
    { id: 'kjv', name: 'KJV (King James Version)' },
    { id: 'web', name: 'WEB (World English Bible)' },
    { id: 'bbe', name: 'BBE (Bible in Basic English)' },
    { id: 'almeida', name: 'JFA (João Ferreira de Almeida)' },
];

export const Bible: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'plan' | 'passage'>('plan');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedVersion, setSelectedVersion] = useState('web');
    const [isLoading, setIsLoading] = useState(false);
    const [passageData, setPassageData] = useState<any>(null);
    const [error, setError] = useState('');

    const handleSearch = async (queryToSearch?: string) => {
        const query = queryToSearch || searchQuery;
        if (!query.trim()) return;

        setIsLoading(true);
        setError('');
        setActiveTab('passage');
        setPassageData(null);

        try {
            const res = await fetch(`https://bible-api.com/${encodeURIComponent(query)}?translation=${selectedVersion}`);
            if (!res.ok) {
                throw new Error('Passage not found. Please ensure the reference is correct.');
            }
            const data = await res.json();
            setPassageData(data);
        } catch (err: any) {
            setError(err.message || 'An error occurred while fetching the passage.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const handleReadNow = () => {
        setSearchQuery('Exodus 4-6');
        handleSearch('Exodus 4-6');
    };

    return (
        <div className="bg-slate-50 min-h-screen py-12">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                        <Book className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Bible Hub</h1>
                        <p className="text-slate-600">Read, search, and study the Word</p>
                    </div>
                </div>

                {/* Search Bar section */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-2 flex flex-col sm:flex-row gap-2 mb-8">
                    <div className="relative flex-grow flex items-center bg-slate-50 rounded-xl px-4 py-3 sm:py-0 border border-slate-100 focus-within:ring-2 focus-within:ring-blue-100 transition-shadow">
                        <Search className="w-5 h-5 text-slate-400 shrink-0" />
                        <input
                            type="text"
                            placeholder="Search passage (e.g. John 3:16 or Psalms 23)"
                            className="bg-transparent border-none outline-none w-full ml-3 text-slate-800 placeholder:text-slate-400"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={handleKeyPress}
                        />
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                        <div className="relative w-full sm:w-64 bg-slate-50 rounded-xl border border-slate-100 flex items-center hover:bg-slate-100 transition-colors">
                            <select
                                className="w-full bg-transparent appearance-none py-3 pl-4 pr-10 outline-none text-slate-800 font-medium cursor-pointer"
                                value={selectedVersion}
                                onChange={(e) => setSelectedVersion(e.target.value)}
                            >
                                {VERSIONS.map(v => (
                                    <option key={v.id} value={v.id}>{v.name}</option>
                                ))}
                            </select>
                            <ChevronDown className="w-5 h-5 text-slate-400 absolute right-3 pointer-events-none" />
                        </div>
                        <button
                            onClick={() => handleSearch()}
                            disabled={isLoading || !searchQuery.trim()}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0 shadow-sm"
                        >
                            Search
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 border-b border-slate-200 mb-8">
                    <button
                        onClick={() => setActiveTab('plan')}
                        className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors border-b-2 ${activeTab === 'plan'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-slate-500 hover:text-slate-800'
                            }`}
                    >
                        <Calendar className="w-4 h-4" />
                        Reading Plan
                    </button>
                    <button
                        onClick={() => setActiveTab('passage')}
                        className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors border-b-2 ${activeTab === 'passage'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-slate-500 hover:text-slate-800'
                            }`}
                    >
                        <BookOpen className="w-4 h-4" />
                        Passage View
                    </button>
                </div>

                {/* Content Area */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 min-h-[500px] p-6 sm:p-10">
                    {activeTab === 'plan' && (
                        <div className="flex flex-col items-center justify-center text-center h-full max-w-2xl mx-auto py-12">
                            <div className="w-16 h-16 bg-orange-50 stroke-1 rounded-2xl flex items-center justify-center mb-6">
                                <Calendar className="w-8 h-8 text-orange-500" strokeWidth={2} />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 mb-3">Today's Reading</h2>
                            <p className="text-slate-600 mb-10 text-lg">
                                Follow along with our daily Bible reading plan and read through the Scripture over the year.
                            </p>

                            <div className="w-full bg-slate-50 border border-slate-200 rounded-3xl p-8 shadow-sm">
                                <p className="text-orange-600 text-sm font-bold tracking-wider mb-2">DAY 88 OF 365</p>
                                <h3 className="text-3xl font-bold text-slate-900 mb-8">Exodus 4-6</h3>
                                <button
                                    onClick={handleReadNow}
                                    className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-xl font-bold text-lg transition-colors shadow-sm focus:ring-4 focus:ring-orange-200"
                                >
                                    Read Now
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'passage' && (
                        <div className="h-full">
                            {isLoading ? (
                                <div className="flex flex-col items-center justify-center h-full py-32">
                                    <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
                                    <p className="text-slate-500 font-medium">Fetching passage...</p>
                                </div>
                            ) : error ? (
                                <div className="flex flex-col items-center justify-center h-full py-32 text-center">
                                    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
                                        <span className="text-2xl">😕</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-2">Oops!</h3>
                                    <p className="text-slate-600 max-w-md">{error}</p>
                                    <button
                                        onClick={() => setError('')}
                                        className="mt-6 text-blue-600 font-semibold hover:underline"
                                    >
                                        Clear Search
                                    </button>
                                </div>
                            ) : passageData ? (
                                <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="mb-8 border-b border-slate-100 pb-6 text-center">
                                        <h2 className="text-3xl font-bold text-slate-900 mb-2">{passageData.reference}</h2>
                                        <p className="text-slate-500 font-medium text-lg">{passageData.translation_name}</p>
                                    </div>
                                    <div className="prose prose-lg prose-slate max-w-none text-slate-800 leading-relaxed font-serif text-justify md:text-left">
                                        {passageData.verses.map((verse: any) => (
                                            <span key={verse.verse} className="inline mr-2">
                                                <sup className="text-blue-600 font-sans font-bold text-xs mr-1">{verse.verse}</sup>
                                                {verse.text}
                                            </span>
                                        ))}
                                    </div>
                                    <div className="mt-12 pt-6 border-t border-slate-100 text-center">
                                        <p className="text-slate-400 text-sm font-medium">Text provided by bible-api.com</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full py-32 text-center">
                                    <Search className="w-12 h-12 text-slate-200 mb-6" strokeWidth={1.5} />
                                    <p className="text-slate-500 text-lg font-medium">Search for a passage to start reading.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
