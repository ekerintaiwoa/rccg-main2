import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Heart, BookOpen, Users2, Mail, Linkedin, History, Target, ShieldCheck } from 'lucide-react';

export const About: React.FC = () => {
  const [pageData, setPageData] = useState<any>(null);
  const [teamData, setTeamData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [aboutRes, teamRes] = await Promise.all([
          fetch('https://backend-production-f755.up.railway.app/api/about/'),
          fetch('https://backend-production-f755.up.railway.app/api/team/')
        ]);
        if (aboutRes.ok) setPageData(await aboutRes.json());
        if (teamRes.ok) setTeamData(await teamRes.json());
      } catch (err) {
        console.error('Failed to load about page data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen py-32">
        <p className="text-slate-500">Loading...</p>
      </div>
    );
  }

  const fallbackHero = "https://images.unsplash.com/photo-1438032005730-c779502df39b?auto=format&fit=crop&w=1920&q=80";
  const fallbackHistory = "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=800&q=80";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Hero Section */}
      <header className="relative bg-slate-900 py-32 overflow-hidden">
        <div className="absolute inset-0 opacity-40">
          <img
            src={pageData?.hero_image || fallbackHero}
            alt="Church Background"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6">
            {pageData?.hero_title || 'Our Journey'}
          </h1>
          <p className="text-xl text-slate-200 max-w-3xl mx-auto leading-relaxed whitespace-pre-line">
            {pageData?.hero_subtitle || 'The Redeemed Christian Church of God is a worldwide community of believers...'}
          </p>
        </div>
      </header>

      {/* History Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-20 items-center">
            <div className="mb-12 lg:mb-0">
              <img
                src={pageData?.history_image || fallbackHistory}
                alt="RCCG History"
                className="rounded-2xl shadow-2xl w-full h-[500px] object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-1 bg-blue-600"></div>
                <h2 className="text-3xl font-bold text-slate-900">{pageData?.history_title || 'RCCG History'}</h2>
              </div>
              <div className="space-y-4 text-lg text-slate-600 leading-relaxed whitespace-pre-line">
                {pageData?.history_content || ''}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Global Mandate Section */}
      <section className="py-24 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">{pageData?.mandate_title || 'Global Mandate'}</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">{pageData?.mandate_subtitle || 'Our vision and mission for the world.'}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {(pageData?.mandates || []).map((item: any, i: number) => (
              <div key={i} className="bg-white/5 backdrop-blur-sm p-8 rounded-2xl border border-white/10">
                <h3 className="text-xl font-bold mb-4 text-blue-400">{item.title}</h3>
                <p className="text-slate-300">{item.description}</p>
              </div>
            ))}
          </div>
          <div className="max-w-3xl mx-auto space-y-6 text-lg text-slate-300 whitespace-pre-line">
            {pageData?.mandate_conclusion || ''}
          </div>
        </div>
      </section>

      {/* Core Beliefs Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-20 items-center">
            <div>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-1 bg-blue-600"></div>
                <h2 className="text-3xl font-bold text-slate-900">{pageData?.beliefs_title || 'Core Beliefs'}</h2>
              </div>
              <div className="space-y-6 text-lg text-slate-600 leading-relaxed whitespace-pre-line">
                {pageData?.beliefs_content || ''}
              </div>
            </div>
            <div className="mt-12 lg:mt-0 bg-slate-50 p-8 rounded-2xl border border-slate-100">
              <p className="text-slate-600 mb-6 italic whitespace-pre-line">
                "{pageData?.beliefs_quote || ''}"
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Statement of Faith Section */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">{pageData?.faith_title || 'Statement of Faith'}</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">{pageData?.faith_subtitle || 'What we believe and stand for.'}</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {(pageData?.faiths || []).map((item: any) => (
              <div key={item.id} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <h3 className="text-xl font-bold mb-4 text-slate-900">{item.title}</h3>
                <p className="text-slate-600 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Meet Our Pastoral Team</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">A team of dedicated leaders committed to serving our congregation and community.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-12">
            {teamData.map((member: any) => (
              <article key={member.id} className="group">
                <div className="overflow-hidden rounded-2xl mb-6 aspect-[4/5] bg-slate-100">
                  {member.image ? (
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      No Image Available
                    </div>
                  )}
                </div>
                <h3 className="text-2xl font-bold text-slate-900">{member.name}</h3>
                <p className="text-blue-600 font-bold mb-4 uppercase tracking-widest text-xs">{member.role}</p>
                <p className="text-slate-600 leading-relaxed mb-6">{member.description}</p>
                <div className="flex gap-4">
                  {member.email && (
                    <a href={`mailto:${member.email}`}>
                      <Mail className="w-5 h-5 text-slate-400 hover:text-blue-600 transition-colors" />
                    </a>
                  )}
                  {member.linkedin && (
                    <a href={member.linkedin} target="_blank" rel="noreferrer">
                      <Linkedin className="w-5 h-5 text-slate-400 hover:text-blue-600 transition-colors" />
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </motion.div>
  );
};
