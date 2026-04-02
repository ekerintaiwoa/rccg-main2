import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, ChevronRight, Type, Volume2, MessageSquare, Send, Share2 } from 'lucide-react';
import { DailyPrayer } from '../types';

// Fallback mock data in case API is empty
const defaultPrayer: DailyPrayer = {
    id: 0,
    date: new Date().toISOString().split('T')[0],
    time_of_day: 'morning',
    title: 'PEACE',
    verse: 'Philippians 4:6-7',
    declaration: 'Lord, I bring my worries to You. Teach me to trust Your timing.',
    points: [
        { id: 1, text: 'Fill my heart with Your peace that surpasses all understanding.', order: 1 },
        { id: 2, text: 'Help me to walk by faith and not by sight today.', order: 2 },
        { id: 3, text: 'Thank You for Your unfailing love and grace. Amen.', order: 3 },
    ]
};

type MediaMode = 'text' | 'voice' | 'both';

export const Prayer: React.FC = () => {
    const [prayer, setPrayer] = useState<DailyPrayer | null>(null);
    const [loading, setLoading] = useState(true);

    // Player state
    const [currentStep, setCurrentStep] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [mediaMode, setMediaMode] = useState<MediaMode>('both');

    // Form state
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [requestText, setRequestText] = useState('');
    const [formStatus, setFormStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

    const synthRef = useRef<SpeechSynthesis | null>(null);

    useEffect(() => {
        synthRef.current = window.speechSynthesis;
        fetchPrayer();
        return () => {
            if (synthRef.current) {
                synthRef.current.cancel();
            }
        };
    }, []);

    const fetchPrayer = async () => {
        try {
            const response = await fetch('/api/prayers/');
            if (response.ok) {
                const data = await response.json();
                if (data && data.length > 0) {
                    setPrayer(data[0]); // most recent
                } else {
                    setPrayer(defaultPrayer);
                }
            } else {
                setPrayer(defaultPrayer);
            }
        } catch (error) {
            console.error('Error fetching prayers:', error);
            setPrayer(defaultPrayer);
        } finally {
            setLoading(false);
        }
    };

    const steps = prayer ? [prayer.declaration, ...prayer.points.map(p => p.text)] : [];
    const totalSteps = steps.length;

    const handlePlayToggle = () => {
        if (isPlaying) {
            synthRef.current?.pause();
            setIsPlaying(false);
        } else {
            setIsPlaying(true);
            if (synthRef.current?.paused) {
                synthRef.current.resume();
            } else {
                speakCurrentStep();
            }
        }
    };

    const speakCurrentStep = () => {
        if (!synthRef.current || mediaMode === 'text') return;

        synthRef.current.cancel();
        const utterance = new SpeechSynthesisUtterance(steps[currentStep]);
        utterance.rate = 0.9;
        utterance.pitch = 1;

        utterance.onend = () => {
            if (currentStep < totalSteps - 1) {
                setCurrentStep(prev => prev + 1);
            } else {
                setIsPlaying(false);
                setCurrentStep(0); // Reset at the end
            }
        };

        synthRef.current.speak(utterance);
    };

    // When step changes while playing, speak the new step
    useEffect(() => {
        if (isPlaying && mediaMode !== 'text') {
            speakCurrentStep();
        }
    }, [currentStep, mediaMode]);

    const handleNext = () => {
        if (currentStep < totalSteps - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            setIsPlaying(false);
            synthRef.current?.cancel();
            setCurrentStep(0);
        }
    };

    const handleModeChange = (mode: MediaMode) => {
        setMediaMode(mode);
        if (mode === 'text' && isPlaying) {
            synthRef.current?.cancel();
            setIsPlaying(false);
        } else if (isPlaying && (mode === 'voice' || mode === 'both')) {
            speakCurrentStep();
        }
    };

    const handleRequestSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormStatus('submitting');
        try {
            const response = await fetch('/api/prayer-requests/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, request_text: requestText })
            });
            if (response.ok) {
                setFormStatus('success');
                setName('');
                setEmail('');
                setRequestText('');
                setTimeout(() => setFormStatus('idle'), 5000);
            } else {
                setFormStatus('error');
            }
        } catch (e) {
            setFormStatus('error');
        }
    };

    if (loading || !prayer) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    const upcomingSteps = steps.slice(currentStep + 1);

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-4xl mx-auto space-y-8">

                {/* Header */}
                <div className="text-center space-y-4 relative">
                    <div className="absolute right-4 sm:right-8 top-0">
                        <button 
                            onClick={() => {
                                if (navigator.share) {
                                    navigator.share({
                                        title: 'Daily Prayer Room',
                                        text: 'Join me in today\'s prayer',
                                        url: window.location.href
                                    }).catch(console.error);
                                } else {
                                    navigator.clipboard.writeText(window.location.href);
                                    alert('Link copied to clipboard!');
                                }
                            }}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-full shadow-sm hover:text-blue-600 hover:border-blue-200 transition"
                        >
                            <Share2 className="w-4 h-4" />
                            <span className="hidden sm:inline">Share</span>
                        </button>
                    </div>
                    <h1 className="text-4xl font-bold text-slate-900 tracking-tight pt-2">Daily Prayer Room</h1>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                        Take a moment to center yourself. Join us in our daily prayers and submit your own requests.
                    </p>
                </div>

                {/* Media Player Widget */}
                <div className="bg-[#12141A] rounded-[2rem] p-8 md:p-10 shadow-2xl relative overflow-hidden">
                    {/* Subtle background glow effect if needed */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>

                    <div className="relative z-10 space-y-8">
                        <div className="flex items-center gap-3 text-sm font-semibold tracking-wider text-yellow-500 uppercase">
                            <span>Prayer FOR {prayer.title}</span>
                            <span className="text-slate-500">•</span>
                            <span className="text-slate-400">Step {currentStep + 1} of {totalSteps}</span>
                        </div>

                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentStep}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.3 }}
                                className="min-h-[120px] flex items-center"
                            >
                                <h2 className="text-3xl md:text-4xl font-medium text-white leading-snug">
                                    "{steps[currentStep]}"
                                </h2>
                            </motion.div>
                        </AnimatePresence>

                        {/* Progress Bar */}
                        <div className="flex items-center gap-2 mb-8">
                            {steps.map((_, idx) => (
                                <div
                                    key={idx}
                                    className={`h-1.5 rounded-full flex-1 transition-all duration-300 ${idx === currentStep ? 'bg-yellow-500' : idx < currentStep ? 'bg-yellow-500/50' : 'bg-slate-700'
                                        }`}
                                />
                            ))}
                        </div>

                        {/* Media Mode Toggle */}
                        <div className="flex bg-[#1E2129] rounded-2xl p-1.5 max-w-md mx-auto relative z-20">
                            <button
                                onClick={() => handleModeChange('text')}
                                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-colors ${mediaMode === 'text' ? 'bg-yellow-500 text-slate-900 shadow-md' : 'text-slate-400 hover:text-slate-200'
                                    }`}
                            >
                                <Type className="w-4 h-4" /> Text
                            </button>
                            <button
                                onClick={() => handleModeChange('voice')}
                                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-colors ${mediaMode === 'voice' ? 'bg-yellow-500 text-slate-900 shadow-md' : 'text-slate-400 hover:text-slate-200'
                                    }`}
                            >
                                <Volume2 className="w-4 h-4" /> Voice
                            </button>
                            <button
                                onClick={() => handleModeChange('both')}
                                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-colors ${mediaMode === 'both' ? 'bg-yellow-500 text-slate-900 shadow-md' : 'text-slate-400 hover:text-slate-200'
                                    }`}
                            >
                                <div className="flex items-center gap-1">
                                    <Type className="w-4 h-4" /> <Volume2 className="w-4 h-4" />
                                </div>
                                Both
                            </button>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center justify-between pt-6 border-t border-slate-800">
                            <button
                                onClick={handlePlayToggle}
                                className="w-16 h-16 bg-yellow-500 hover:bg-yellow-400 text-[#12141A] rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105 active:scale-95"
                            >
                                {isPlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
                            </button>

                            <button
                                onClick={handleNext}
                                className="flex items-center gap-2 px-6 py-3 bg-[#1E2129] hover:bg-[#2A2E39] text-white rounded-full font-medium transition-colors"
                            >
                                {currentStep < totalSteps - 1 ? 'Next' : 'Finish'} <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Upcoming Prayers List */}
                {upcomingSteps.length > 0 && (
                    <div className="bg-[#12141A] rounded-[2rem] p-8 md:p-10 shadow-xl">
                        <h3 className="text-xl font-semibold mb-6 text-white tracking-tight">Upcoming Prayers</h3>
                        <div className="space-y-4">
                            {upcomingSteps.map((stepText, idx) => (
                                <div key={idx} className="flex items-start gap-4 p-4 rounded-2xl bg-[#1E2129] border border-slate-800/50 hover:bg-[#262A35] transition-colors">
                                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-sm font-bold text-slate-400 shrink-0">
                                        {currentStep + idx + 2}
                                    </div>
                                    <p className="text-slate-300 leading-relaxed pt-1 flex-1">
                                        {stepText}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Prayer Request Form */}
                <div className="bg-white rounded-[2rem] p-8 md:p-10 shadow-xl border border-slate-100 mt-12">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 shrink-0">
                            <MessageSquare className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-slate-900">Submit a Prayer Request</h3>
                            <p className="text-slate-500 mt-1">Our team would love to pray with you.</p>
                        </div>
                    </div>

                    <form onSubmit={handleRequestSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Full Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    required
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                                    placeholder="John Doe"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Email Address (Optional)</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                                    placeholder="john@example.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Your Prayer Request</label>
                            <textarea
                                value={requestText}
                                onChange={e => setRequestText(e.target.value)}
                                required
                                rows={4}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow resize-none"
                                placeholder="How can we pray for you today?"
                            ></textarea>
                        </div>

                        <button
                            type="submit"
                            disabled={formStatus === 'submitting'}
                            className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-md shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                        >
                            {formStatus === 'submitting' ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    Submitting...
                                </>
                            ) : (
                                <>
                                    Submit Request <Send className="w-4 h-4" />
                                </>
                            )}
                        </button>

                        {formStatus === 'success' && (
                            <p className="text-green-600 font-medium pt-2">Your prayer request has been submitted successfully!</p>
                        )}
                        {formStatus === 'error' && (
                            <p className="text-red-500 font-medium pt-2">There was an error submitting your request. Please try again.</p>
                        )}
                    </form>
                </div>

            </div>
        </div>
    );
};
