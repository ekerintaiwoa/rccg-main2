import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../AuthContext';
import { Book as BookIcon, Headphones, HelpCircle, CheckCircle, Lock, Heart, X } from 'lucide-react';

export const Library: React.FC = () => {
    const { token, username, login, logout } = useAuth();
    const [loading, setLoading] = useState(true);

    const [books, setBooks] = useState<any[]>([]);
    const [audios, setAudios] = useState<any[]>([]);
    const [quizzes, setQuizzes] = useState<any[]>([]);

    const [showAuthModal, setShowAuthModal] = useState(false);
    const [isLoginView, setIsLoginView] = useState(true);
    const [authForm, setAuthForm] = useState({ username: '', password: '', email: '' });
    const [authError, setAuthError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const headers = token ? { 'Authorization': `Token ${token}` } : {};
                const [booksRes, audiosRes, quizzesRes] = await Promise.all([
                    fetch('https://backend-production-f755.up.railway.app/api/books/', { headers }),
                    fetch('https://backend-production-f755.up.railway.app/api/audios/', { headers }),
                    fetch('https://backend-production-f755.up.railway.app/api/quizzes/', { headers })
                ]);

                if (booksRes.ok) setBooks(await booksRes.json());
                if (audiosRes.ok) setAudios(await audiosRes.json());
                if (quizzesRes.ok) setQuizzes(await quizzesRes.json());
            } catch (err) {
                console.error("Failed to load library", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [token]);

    const handleAuthSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setAuthError('');
        const endpoint = isLoginView ? 'login/' : 'register/';
        try {
            const res = await fetch(`https://backend-production-f755.up.railway.app/api/${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(authForm)
            });
            const data = await res.json();
            if (res.ok) {
                login(data.token, data.username || authForm.username);
                setShowAuthModal(false);
            } else {
                setAuthError(data.error || data.non_field_errors?.[0] || 'Authentication failed.');
            }
        } catch (err) {
            setAuthError('Network error. Please try again.');
        }
    };

    const submitBookAnswer = async (questionId: number, text: string) => {
        if (!token) return;
        try {
            const res = await fetch('https://backend-production-f755.up.railway.app/api/submit-answer/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${token}`
                },
                body: JSON.stringify({ question_id: questionId, answer_text: text })
            });
            if (res.ok) {
                alert("Answer submitted successfully!");
            } else {
                alert("Found an error submitting answer.");
            }
        } catch (err) {
            console.error(err);
        }
    };

    const requireAuth = (callback: () => void) => {
        if (!token) {
            setShowAuthModal(true);
        } else {
            callback();
        }
    };



    if (loading) return <div className="text-center py-32">Loading library...</div>;

    const bookOfTheWeek = books.find(b => b.is_book_of_the_week);
    const otherBooks = books.filter(b => !b.is_book_of_the_week);

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Header */}
            <div className="bg-slate-900 border-b border-slate-800 py-16 text-center text-white px-4">
                <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Digital Library</h1>
                <p className="text-slate-400 max-w-2xl mx-auto">
                    {token
                        ? `Welcome to the resource center, ${username}. Nurture your spirit with our curated collection.`
                        : "Welcome to our public resource center. Please sign in to read books and listen to audios."}
                </p>
                {token ? (
                    <button onClick={logout} className="mt-6 text-sm text-blue-400 hover:text-white transition">Log out</button>
                ) : (
                    <button onClick={() => setShowAuthModal(true)} className="mt-6 bg-blue-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-blue-500 transition">Log In</button>
                )}
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 space-y-20 relative">

                {/* Book of the Week */}
                {bookOfTheWeek && (
                    <section className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                        <div className="flex flex-col md:flex-row">
                            <div className="md:w-1/3 bg-blue-50 p-8 flex justify-center items-center">
                                {bookOfTheWeek.cover_image ? (
                                    <img src={bookOfTheWeek.cover_image} alt={bookOfTheWeek.title} className="w-full max-w-[200px] h-auto object-cover rounded-md shadow-lg" />
                                ) : (
                                    <div className="w-full max-w-[200px] aspect-[2/3] bg-slate-200 flex items-center justify-center rounded-md text-slate-500 shadow-lg"><BookIcon className="w-12 h-12" /></div>
                                )}
                            </div>
                            <div className="md:w-2/3 p-8 md:p-12">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold mb-4">
                                    <Heart className="w-4 h-4" /> Book of the Week
                                </div>
                                <h2 className="text-3xl font-bold text-slate-900 mb-2">{bookOfTheWeek.title}</h2>
                                <p className="text-lg text-slate-500 mb-6">by {bookOfTheWeek.author}</p>
                                <p className="text-slate-700 leading-relaxed mb-8">{bookOfTheWeek.description}</p>

                                <button
                                    onClick={() => requireAuth(() => window.open(`${bookOfTheWeek.pdf_file}#toolbar=0`, '_blank'))}
                                    className="inline-block bg-slate-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-slate-800 transition"
                                >
                                    {token ? 'Read Book' : 'Sign in to Read'}
                                </button>

                                {/* Questions */}
                                {bookOfTheWeek.questions && bookOfTheWeek.questions.length > 0 && (
                                    <div className="mt-10 pt-8 border-t border-slate-100">
                                        <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                                            <HelpCircle className="w-5 h-5 text-blue-600" /> Reflection Questions
                                        </h3>
                                        <div className="space-y-6">
                                            {bookOfTheWeek.questions.map((q: any) => (
                                                <div key={q.id} className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                                                    <p className="font-medium text-slate-800 mb-3">{q.question_text}</p>
                                                    <form onSubmit={(e) => {
                                                        e.preventDefault();
                                                        requireAuth(() => {
                                                            const target = e.target as typeof e.target & { answer: { value: string } };
                                                            submitBookAnswer(q.id, target.answer.value);
                                                            target.answer.value = '';
                                                        });
                                                    }} className="flex gap-3">
                                                        <input name="answer" type="text" required placeholder={token ? "Type your answer here..." : "Sign in to answer"} className="flex-1 px-4 py-2 rounded-lg border border-slate-300 focus:ring-blue-500 focus:border-blue-500" />
                                                        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium whitespace-nowrap">Submit</button>
                                                    </form>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>
                )}

                {/* Resources Grid */}
                <div className="grid lg:grid-cols-2 gap-12">

                    {/* Books */}
                    <section>
                        <div className="flex items-center gap-3 mb-8">
                            <BookIcon className="w-8 h-8 text-blue-600" />
                            <h2 className="text-2xl font-bold text-slate-900">All Books</h2>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-6">
                            {otherBooks.map(book => (
                                <div key={book.id} className="bg-white p-5 rounded-2xl border border-slate-200 hover:shadow-md transition">
                                    <div className="aspect-[2/3] bg-slate-100 rounded-lg mb-4 overflow-hidden flex items-center justify-center">
                                        {book.cover_image ? (
                                            <img src={book.cover_image} alt={book.title} className="w-full h-full object-cover" />
                                        ) : (
                                            <BookIcon className="w-10 h-10 text-slate-400" />
                                        )}
                                    </div>
                                    <h3 className="font-bold text-slate-900 mb-1 line-clamp-1">{book.title}</h3>
                                    <p className="text-sm text-slate-500 mb-4 line-clamp-1">{book.author}</p>
                                    <button
                                        onClick={() => requireAuth(() => window.open(`${book.pdf_file}#toolbar=0`, '_blank'))}
                                        className="block w-full text-center bg-blue-50 text-blue-700 py-2 rounded-lg font-medium hover:bg-blue-100 transition"
                                    >
                                        {token ? 'Read PDF' : 'Login to Read'}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Audios */}
                    <section>
                        <div className="flex items-center gap-3 mb-8">
                            <Headphones className="w-8 h-8 text-blue-600" />
                            <h2 className="text-2xl font-bold text-slate-900">Audio Messages</h2>
                        </div>
                        <div className="space-y-4">
                            {audios.map(audio => (
                                <div key={audio.id} className="bg-white p-4 rounded-2xl border border-slate-200 flex gap-4 items-center">
                                    <div className="flex-shrink-0 w-16 h-16 bg-slate-100 rounded-lg overflow-hidden flex items-center justify-center">
                                        {audio.cover_image ? (
                                            <img src={audio.cover_image} alt={audio.title} className="w-full h-full object-cover" />
                                        ) : (
                                            <Headphones className="w-6 h-6 text-slate-400" />
                                        )}
                                    </div>
                                    <div className="flex-grow min-w-0">
                                        <h3 className="font-bold text-slate-900 truncate">{audio.title}</h3>
                                        <p className="text-sm text-slate-500 truncate">{audio.speaker}</p>
                                        {token ? (
                                            <audio controls className="w-full mt-2 h-8" src={audio.audio_file}>
                                                Your browser does not support the audio element.
                                            </audio>
                                        ) : (
                                            <button onClick={() => setShowAuthModal(true)} className="w-full mt-2 bg-slate-100 text-slate-600 py-1.5 rounded-lg text-sm font-medium hover:bg-slate-200 transition">
                                                Login to Listen
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                {/* Quizzes */}
                <section>
                    <div className="flex items-center gap-3 mb-8">
                        <CheckCircle className="w-8 h-8 text-blue-600" />
                        <h2 className="text-2xl font-bold text-slate-900">Weekly Quizzes</h2>
                    </div>
                    <div className="grid md:grid-cols-2 gap-8">
                        {quizzes.map(quiz => (
                            <div key={quiz.id} className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8">
                                <h3 className="text-xl font-bold text-slate-900 mb-2">{quiz.title}</h3>
                                <p className="text-slate-600 mb-8">{quiz.description}</p>
                                <div className="space-y-8">
                                    {quiz.questions && quiz.questions.map((q: any, index: number) => (
                                        <div key={q.id}>
                                            <p className="font-medium text-slate-900 mb-3">{index + 1}. {q.question_text}</p>
                                            <div className="space-y-2">
                                                {q.options && q.options.map((opt: any) => (
                                                    <label key={opt.id} className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 hover:bg-slate-50 cursor-pointer transition">
                                                        <input type="radio" name={`question-${q.id}`} value={opt.id} className="w-4 h-4 text-blue-600" />
                                                        <span className="text-slate-700">{opt.option_text}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-8 pt-6 border-t border-slate-100">
                                    <button onClick={() => requireAuth(() => alert("Quiz submitted! (Demo only)"))} className="w-full bg-slate-900 text-white py-3 rounded-lg font-medium hover:bg-slate-800 transition">
                                        {token ? 'Submit Quiz' : 'Login to Submit Quiz'}
                                    </button>
                                </div>
                            </div>
                        ))}
                        {quizzes.length === 0 && <p className="text-slate-500">No active quizzes this week.</p>}
                    </div>
                </section>
            </div>

            <AnimatePresence>
                {showAuthModal && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white p-8 sm:p-10 rounded-3xl shadow-2xl max-w-md w-full relative"
                        >
                            <button
                                onClick={() => setShowAuthModal(false)}
                                className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition"
                            >
                                <X className="w-6 h-6" />
                            </button>

                            <div className="flex justify-center mb-6">
                                <div className="bg-blue-100 p-4 rounded-full">
                                    <Lock className="w-8 h-8 text-blue-600" />
                                </div>
                            </div>
                            <h2 className="text-2xl font-bold text-center text-slate-900 mb-2">Libary Sign In</h2>
                            <p className="text-center text-slate-500 mb-8 text-sm">
                                Please {isLoginView ? 'sign in' : 'create an account'} to read books, listen to audio, and take quizzes.
                            </p>

                            <form onSubmit={handleAuthSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
                                    <input
                                        type="text" required
                                        value={authForm.username} onChange={e => setAuthForm({ ...authForm, username: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                {!isLoginView && (
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Email (Optional)</label>
                                        <input
                                            type="email"
                                            value={authForm.email} onChange={e => setAuthForm({ ...authForm, email: e.target.value })}
                                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                )}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                                    <input
                                        type="password" required
                                        value={authForm.password} onChange={e => setAuthForm({ ...authForm, password: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                {authError && <p className="text-red-500 text-sm">{authError}</p>}
                                <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 mt-2 rounded-xl hover:bg-blue-700 transition">
                                    {isLoginView ? 'Sign In' : 'Register'}
                                </button>
                            </form>
                            <div className="mt-8 text-center text-sm text-slate-600">
                                {isLoginView ? "Don't have an account? " : "Already have an account? "}
                                <button onClick={() => setIsLoginView(!isLoginView)} className="text-blue-600 font-semibold hover:underline">
                                    {isLoginView ? 'Sign up' : 'Log in'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
