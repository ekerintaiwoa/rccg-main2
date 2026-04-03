import React from 'react';
import { motion } from 'motion/react';
import { API_BASE_URL } from '../config';

export const Contact: React.FC = () => {
  const [submitted, setSubmitted] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [pageData, setPageData] = React.useState<any>(null);
  const [pageLoading, setPageLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchPageData = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/contact-info/`);
        if (res.ok) {
          const data = await res.json();
          setPageData(data);
        }
      } catch (err) {
        console.error('Failed to load contact info', err);
      } finally {
        setPageLoading(false);
      }
    };
    fetchPageData();
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setSubmitted(false);

    const formData = new FormData(event.currentTarget);
    const payload = Object.fromEntries(formData.entries());

    try {
      const response = await fetch(`${API_BASE_URL}/api/contact/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        setSubmitted(true);
        event.currentTarget.reset();
      }
    } catch (error) {
      console.error('Failed to send message', error);
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <section className="py-20 bg-slate-50 flex justify-center items-center min-h-[50vh]">
        <p className="text-slate-500">Loading...</p>
      </section>
    );
  }

  return (
    <section className="py-20 bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-slate-900 mb-3">{pageData?.title || 'Contact Us'}</h1>
          <p className="text-slate-600 max-w-2xl mx-auto">
            {pageData?.subtitle || 'We would love to hear from you. Send us a message.'}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-10 items-start">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1" htmlFor="name">
                  Full Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1" htmlFor="email">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1" htmlFor="subject">
                  Subject
                </label>
                <input
                  id="subject"
                  name="subject"
                  type="text"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="How can we help?"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1" htmlFor="message">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={5}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  placeholder="Type your message here"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center w-full sm:w-auto px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors disabled:opacity-60"
              >
                {loading ? 'Sending...' : 'Send Message'}
              </button>

              {submitted && (
                <p className="text-sm text-green-600 mt-2">Thank you! Your message has been sent.</p>
              )}
            </form>
          </div>

          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 mb-2">Service Times</h2>
              <p className="text-sm text-slate-600 whitespace-pre-line">
                {pageData?.service_times || "Sunday Celebration Service – 10:00 AM\nMidweek Bible Study – Wednesday 6:30 PM"}
              </p>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900 mb-2">Visit Us</h2>
              <p className="text-sm text-slate-600 whitespace-pre-line">
                {pageData?.address || "RCCG House of Glory Lübeck\n(Add your church address here)"}
              </p>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900 mb-2">Contact</h2>
              <p className="text-sm text-slate-600">
                Phone: {pageData?.phone || "+49 (0) 000 0000000"}
                <br />
                Email: {pageData?.email || "info@rccg-houseofglory.de"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
