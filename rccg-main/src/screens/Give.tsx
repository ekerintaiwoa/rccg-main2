import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import * as Icons from 'lucide-react';
import { ShieldCheck, HelpCircle, Mail, DollarSign, X, Lock, CheckCircle, Clock } from 'lucide-react';
import { useAuth } from '../AuthContext';

interface GivingPurpose {
  id: number;
  title: string;
  description: string;
  icon: string;
  color: string;
}

interface OnlineGivingPage {
  title: string;
  subtitle: string;
  currency_symbol: string;
  bank_account_name: string;
  bank_iban: string;
  bank_bic: string;
  purposes: GivingPurpose[];
}

export const Give: React.FC = () => {
  const { token, username, login } = useAuth();
  const [amount, setAmount] = useState('50');
  const [frequency, setFrequency] = useState<'one-time' | 'recurring'>('one-time');
  const [pageData, setPageData] = useState<OnlineGivingPage | null>(null);
  const [givingAs, setGivingAs] = useState<'anonymous' | 'member' | 'guest'>('anonymous');
  const [guestData, setGuestData] = useState({ firstName: '', lastName: '', email: '' });
  const [purpose, setPurpose] = useState('General Fund');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [generatedRef, setGeneratedRef] = useState<string | null>(null);

  const [showHistory, setShowHistory] = useState(false);
  const [historyRecords, setHistoryRecords] = useState<any[]>([]);

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLoginView, setIsLoginView] = useState(true);
  const [authForm, setAuthForm] = useState({ username: '', password: '', email: '' });
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    const fetchPageData = async () => {
      try {
        const res = await fetch('http://127.0.0.1:8000/api/online-giving/');
        if (res.ok) {
          const data = await res.json();
          setPageData(data);
          if (data.purposes && data.purposes.length > 0) {
            setPurpose(data.purposes[0].title);
          }
        }
      } catch (err) {
        console.error('Failed to load online giving page data', err);
      }
    };
    fetchPageData();
  }, []);

  const fetchHistory = async () => {
    if (!token) return;
    try {
      const res = await fetch('http://127.0.0.1:8000/api/giving-records/', {
        headers: { 'Authorization': `Token ${token}` }
      });
      if (res.ok) setHistoryRecords(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (showHistory && token) fetchHistory();
  }, [showHistory, token]);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    const endpoint = isLoginView ? 'login/' : 'register/';
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/${endpoint}`, {
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

  const handleGivingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (givingAs === 'member' && !token) {
      setShowAuthModal(true);
      return;
    }

    const payload = {
      amount: parseFloat(amount) || 0,
      currency: pageData?.currency_symbol || '€',
      purpose: purpose,
      is_anonymous: givingAs === 'anonymous',
      first_name: givingAs === 'guest' ? guestData.firstName : '',
      last_name: givingAs === 'guest' ? guestData.lastName : '',
      email: givingAs === 'guest' ? guestData.email : '',
      reference_code: 'DUMMY-' + Math.random().toString(36).substring(7)
    };

    const headers: any = { 'Content-Type': 'application/json' };
    if (token && givingAs === 'member') {
      headers['Authorization'] = `Token ${token}`;
    }

    try {
      const res = await fetch('http://127.0.0.1:8000/api/giving-records/', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const data = await res.json();
        setGeneratedRef(data.reference_code);
        setIsSubmitted(true);
      } else {
        alert('Error processing your request.');
      }
    } catch (err) {
      alert('Network error.');
    }
  };

  const currencySymbol = pageData?.currency_symbol || '€';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="bg-slate-50 min-h-screen"
    >
      {/* Hero */}
      <section className="bg-white py-20 border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6">
            {pageData?.title || 'Support Our Mission'}
          </h1>
          <p className="text-lg text-slate-600 leading-relaxed mb-8">
            {pageData?.subtitle || '"Each of you should give what you have decided in your heart to give, not reluctantly or under compulsion, for God loves a cheerful giver." — 2 Corinthians 9:7'}
          </p>
          <div className="flex justify-center">
            <span className="inline-flex items-center px-4 py-2 bg-slate-100 rounded-full text-sm font-medium text-slate-700">
              <ShieldCheck className="w-4 h-4 mr-2 text-green-500" />
              Secure 256-bit Encryption
            </span>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 py-16 grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Form */}
        <div className="lg:col-span-7 bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
          <h2 className="text-2xl font-bold mb-8 text-slate-900">Online Giving</h2>
          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            {/* Frequency */}
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setFrequency('one-time')}
                className={`py-3 px-4 border-2 rounded-xl font-bold transition-all ${frequency === 'one-time' ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
              >
                One-time
              </button>
              <button
                type="button"
                onClick={() => setFrequency('recurring')}
                className={`py-3 px-4 border-2 rounded-xl font-bold transition-all ${frequency === 'recurring' ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
              >
                Recurring
              </button>
            </div>

            {/* Presets */}
            <div className="grid grid-cols-4 gap-3">
              {['5', '10', '20', '50'].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setAmount(val)}
                  className={`py-3 border-2 rounded-xl font-bold transition-all ${amount === val ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-200 text-slate-600 hover:border-blue-600 hover:text-blue-600'
                    }`}
                >
                  {currencySymbol}{val}
                </button>
              ))}
            </div>

            {/* Custom Amount */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-500 font-bold">{currencySymbol}</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Other Amount"
                className="w-full pl-8 pr-4 py-3 border-slate-200 rounded-xl focus:ring-blue-600 focus:border-blue-600"
              />
            </div>

            {/* Fund Selector */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Apply my gift to:</label>
              <select
                value={purpose}
                onChange={e => setPurpose(e.target.value)}
                className="w-full py-3 border-slate-200 rounded-xl focus:ring-blue-600 focus:border-blue-600">
                {pageData?.purposes?.map((p) => (
                  <option key={p.id} value={p.title}>{p.title}</option>
                ))}
              </select>
            </div>

            {/* Giving Options */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">Giving As:</label>
              <div className="grid grid-cols-3 gap-3">
                <button type="button" onClick={() => setGivingAs('anonymous')} className={`py-2 rounded-lg font-medium border-2 transition-all ${givingAs === 'anonymous' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600'}`}>Anonymous</button>
                <button type="button" onClick={() => setGivingAs('member')} className={`py-2 rounded-lg font-medium border-2 transition-all ${givingAs === 'member' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600'}`}>Member</button>
                <button type="button" onClick={() => setGivingAs('guest')} className={`py-2 rounded-lg font-medium border-2 transition-all ${givingAs === 'guest' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600'}`}>Guest</button>
              </div>
            </div>

            {/* Sub-form for options */}
            <AnimatePresence>
              {givingAs === 'guest' && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="space-y-4 overflow-hidden pt-2">
                  <div className="grid grid-cols-2 gap-4">
                    <input type="text" placeholder="First Name" value={guestData.firstName} onChange={e => setGuestData({ ...guestData, firstName: e.target.value })} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-blue-600" required />
                    <input type="text" placeholder="Last Name" value={guestData.lastName} onChange={e => setGuestData({ ...guestData, lastName: e.target.value })} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-blue-600" required />
                  </div>
                  <input type="email" placeholder="Email Address" value={guestData.email} onChange={e => setGuestData({ ...guestData, email: e.target.value })} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-blue-600" required />
                </motion.div>
              )}
              {givingAs === 'member' && !token && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="text-center pt-2">
                  <p className="text-sm text-slate-500 mb-2">You must be logged in to track giving as a member.</p>
                  <button type="button" onClick={() => setShowAuthModal(true)} className="px-6 py-2 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800">Log In</button>
                </motion.div>
              )}
              {givingAs === 'member' && token && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="pt-2">
                  <p className="text-sm text-slate-600 bg-slate-100 py-3 px-4 rounded-xl flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Giving as <strong>{username}</strong></p>
                </motion.div>
              )}
            </AnimatePresence>

            {isSubmitted ? (
              <div className="space-y-4 pt-6 mt-6 border-t border-slate-100">
                <h3 className="text-sm font-bold uppercase tracking-widest text-blue-600 flex items-center gap-2"><CheckCircle className="w-5 h-5" /> Details Generated</h3>

                <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                  <p className="text-sm text-slate-600 mb-4">Please complete your giving by transferring the amount to the following bank account. <strong>You must include the exact Reference Code below</strong> to ensure we can correctly allocate your giving.</p>
                  <div className="space-y-3">
                    <div>
                      <span className="text-xs text-slate-500 uppercase font-bold">Account Name</span>
                      <p className="font-mono text-slate-900 font-medium">{pageData?.bank_account_name || 'Loading bank details...'}</p>
                    </div>
                    <div>
                      <span className="text-xs text-slate-500 uppercase font-bold">IBAN</span>
                      <p className="font-mono text-slate-900 font-medium">{pageData?.bank_iban || '...'}</p>
                    </div>
                    <div>
                      <span className="text-xs text-slate-500 uppercase font-bold">BIC</span>
                      <p className="font-mono text-slate-900 font-medium">{pageData?.bank_bic || '...'}</p>
                    </div>
                    <div>
                      <span className="text-xs text-slate-500 uppercase font-bold">Amount</span>
                      <p className="font-mono text-slate-900 font-extrabold">{currencySymbol}{amount}</p>
                    </div>
                    <div className="pt-3 border-t border-slate-200 mt-2">
                      <span className="text-xs text-slate-500 uppercase font-bold">Reference Code</span>
                      <div className="flex items-center gap-2 mt-1 px-4 py-3 bg-blue-100 rounded-lg justify-between border border-blue-200 border-dashed">
                        <code className="text-blue-900 font-extrabold tracking-wider text-xl">{generatedRef}</code>
                        <button
                          type="button"
                          onClick={() => navigator.clipboard.writeText(generatedRef || '')}
                          className="bg-white text-xs px-3 py-1.5 shadow-sm rounded border border-blue-200 text-blue-600 hover:bg-blue-50 font-bold transition"
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="w-full py-4 bg-green-50 text-green-800 font-bold rounded-xl border border-green-100 text-center mt-4">
                  Thank you for your generosity!
                </div>
              </div>
            ) : (
              <button type="button" onClick={handleGivingSubmit} className="w-full mt-6 py-4 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-lg rounded-xl shadow-lg transition-all active:scale-[0.98]">
                Generate Transfer Details
              </button>
            )}

            {!isSubmitted && (
              <p className="text-center text-xs text-slate-400 mt-4">
                By giving, you agree to our Terms of Service. All donations are tax-deductible.
              </p>
            )}
          </form>
        </div>

        {/* Info Column */}
        <div className="lg:col-span-5 space-y-8">
          {(pageData?.purposes || [
            { id: 1, icon: 'Heart', title: 'General Fund', description: 'Powers our weekly services, community programs, and daily operations of the church.', color: 'blue' },
            { id: 2, icon: 'Globe', title: 'Missions', description: 'Supporting local and global outreach partners who are bringing light to the world.', color: 'green' },
            { id: 3, icon: 'Building2', title: 'Building Project', description: 'Investment into our new sanctuary and youth wing development.', color: 'orange' }
          ]).map((item) => {
            const IconComp = (Icons as any)[item.icon] || Icons.Heart;
            return (
              <div key={item.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${item.color === 'blue' ? 'bg-blue-50 text-blue-600' :
                  item.color === 'green' ? 'bg-green-50 text-green-600' :
                    'bg-orange-50 text-orange-600'
                  }`}>
                  <IconComp className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold mb-2 text-slate-900">{item.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{item.description}</p>
              </div>
            );
          })}

          <div className="pt-6">
            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Need help?</h4>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <Clock className="w-5 h-5 text-slate-400 shrink-0 mt-1" />
                <div>
                  <p className="font-bold text-slate-900">How do I see my giving history?</p>
                  <button
                    onClick={() => token ? setShowHistory(true) : setShowAuthModal(true)}
                    className="text-sm text-blue-600 hover:underline font-semibold mt-1">
                    {token ? 'View My Giving History' : 'Log in to view history'}
                  </button>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Mail className="w-5 h-5 text-slate-400 shrink-0 mt-1" />
                <div>
                  <p className="font-bold text-slate-900">Email Support</p>
                  <p className="text-sm text-slate-500">Contact giving@gracecommunity.church for any assistance.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      {/* Auth Modal */}
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
              <h2 className="text-2xl font-bold text-center text-slate-900 mb-2">Member Sign In</h2>
              <p className="text-center text-slate-500 mb-8 text-sm">
                Please {isLoginView ? 'sign in' : 'create an account'} to track your giving.
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

      {/* History Modal */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white p-6 sm:p-8 rounded-3xl shadow-2xl max-w-2xl w-full relative max-h-[85vh] overflow-hidden flex flex-col"
            >
              <button
                onClick={() => setShowHistory(false)}
                className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition z-10"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                <Clock className="w-6 h-6 text-blue-600" />
                <h2 className="text-2xl font-bold text-slate-900">Giving History</h2>
              </div>

              <div className="overflow-y-auto flex-1 pr-2">
                {historyRecords.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-slate-500">No giving records found.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {historyRecords.map(record => (
                      <div key={record.id} className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex justify-between items-center hover:bg-slate-100 transition">
                        <div>
                          <p className="font-bold text-slate-900">{record.purpose}</p>
                          <div className="flex gap-3 text-xs text-slate-500 mt-1">
                            <span>{new Date(record.created_at).toLocaleDateString()}</span>
                            <span>•</span>
                            <span className="font-mono">Ref: {record.reference_code}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-extrabold text-blue-700">{record.currency}{record.amount}</p>
                          <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${record.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                            {record.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div >
  );
};
