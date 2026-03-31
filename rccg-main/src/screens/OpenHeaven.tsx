import React from 'react';

interface Devotional {
  id: number;
  date: string; // ISO date from backend
  title: string;
  scripture: string;
  content: string;
  prayer: string;
}

export const OpenHeaven: React.FC = () => {
  const [devotions, setDevotions] = React.useState<Devotional[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [selectedId, setSelectedId] = React.useState<number | null>(null);

  React.useEffect(() => {
    const fetchDevotions = async () => {
      try {
        const res = await fetch('https://backend-production-f755.up.railway.app/api/devotionals/');
        if (!res.ok) {
          throw new Error('Failed to load devotionals');
        }
        const data = (await res.json()) as Devotional[];
        setDevotions(data);

        const todayStr = new Date().toISOString().slice(0, 10);
        const today = data.find((d) => d.date === todayStr);
        setSelectedId(today ? today.id : data[0]?.id ?? null);
      } catch (err) {
        console.error(err);
        setError('Unable to load devotionals right now. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchDevotions();
  }, []);

  const selectedDevotional =
    devotions.find((d) => d.id === selectedId) ?? (devotions.length > 0 ? devotions[0] : null);

  const archive = selectedDevotional
    ? devotions.filter((d) => d.id !== selectedDevotional.id)
    : devotions;

  const displayDate = selectedDevotional
    ? new Date(selectedDevotional.date).toLocaleDateString(undefined, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : new Date().toLocaleDateString(undefined, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

  return (
    <section className="py-20 bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-8 text-center">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-blue-600 mb-2">
            Daily Devotional
          </p>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Open Heaven</h1>
          <p className="text-sm text-slate-500">{displayDate}</p>
        </header>

        {loading && (
          <p className="text-center text-sm text-slate-500">Loading today&apos;s devotional...</p>
        )}

        {error && !loading && (
          <p className="text-center text-sm text-red-500 mb-6">{error}</p>
        )}

        {!loading && !error && selectedDevotional && (
          <article className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sm:p-8 space-y-6 mb-10">
            <div>
              <h2 className="text-xl font-semibold text-slate-900 mb-1">{selectedDevotional.title}</h2>
              {selectedDevotional.scripture && (
                <p className="text-sm font-medium text-blue-600">
                  Memory Verse: {selectedDevotional.scripture}
                </p>
              )}
            </div>

            <div className="space-y-3 text-sm leading-relaxed text-slate-700 whitespace-pre-line">
              {selectedDevotional.content}
            </div>

            {selectedDevotional.prayer && (
              <div className="border-t border-slate-100 pt-4 text-sm text-slate-600 space-y-2">
                <p className="font-semibold text-slate-900">Prayer:</p>
                <p className="whitespace-pre-line">{selectedDevotional.prayer}</p>
              </div>
            )}
          </article>
        )}

        {/* Archive */}
        {!loading && archive.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Archive of Past Devotionals</h2>
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {archive.map((dev) => {
                const dateLabel = new Date(dev.date).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                });
                return (
                  <button
                    key={dev.id}
                    type="button"
                    onClick={() => setSelectedId(dev.id)}
                    className={`w-full flex justify-between items-start gap-3 rounded-lg border px-4 py-3 text-left transition-colors ${
                      dev.id === selectedId
                        ? 'border-blue-200 bg-blue-50'
                        : 'border-slate-100 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <p className="text-xs text-slate-500 mb-0.5">{dateLabel}</p>
                      <p className="text-sm font-medium text-slate-900">{dev.title}</p>
                    </div>
                    <span className="text-xs text-blue-600 font-semibold">
                      {dev.id === selectedId ? 'Selected' : 'View'}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </section>
  );
};
