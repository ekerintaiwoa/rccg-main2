import React, { useEffect, useMemo, useState } from 'react';
import { Share2 } from 'lucide-react';

interface BlogPostApi {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  published_at: string | null;
}

export const Blog: React.FC = () => {
  const [posts, setPosts] = useState<BlogPostApi[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(() => {
    const params = new URLSearchParams(window.location.search);
    const postParam = params.get('post');
    return postParam ? parseInt(postParam, 10) : null;
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (selectedId) {
      params.set('post', selectedId.toString());
    } else {
      params.delete('post');
    }
    const url = new URL(window.location.href);
    url.search = params.toString();
    window.history.pushState({}, '', url);
  }, [selectedId]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchPosts = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('https://backend-production-f755.up.railway.app/api/blogs/');
        if (!response.ok) {
          throw new Error('Failed to load blog posts');
        }
        const data: BlogPostApi[] = await response.json();
        if (!isMounted) return;
        setPosts(data);
        if (data.length > 0) {
          setSelectedId(prev => (prev === null ? data[0].id : prev));
        }
      } catch (err) {
        if (!isMounted) return;
        setError('Unable to load blog posts right now.');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchPosts();

    return () => {
      isMounted = false;
    };
  }, []);

  const selectedPost = useMemo(
    () => posts.find((post) => post.id === selectedId) || null,
    [posts, selectedId]
  );

  const formatDate = (iso: string | null): string => {
    if (!iso) return '';
    const date = new Date(iso);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <section className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-slate-900 mb-3">Church Blog</h1>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Stories, teachings, and updates from our church family to encourage your walk with God.
          </p>
        </div>

        {loading && (
          <p className="text-center text-slate-500">Loading blog posts...</p>
        )}

        {error && !loading && (
          <p className="text-center text-red-500 mb-6">{error}</p>
        )}

        {!loading && !error && posts.length === 0 && (
          <p className="text-center text-slate-500">No blog posts available yet.</p>
        )}

        {!loading && !error && posts.length > 0 && (
          <>
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              {posts.map((post) => (
                <article
                  key={post.id}
                  onClick={() => setSelectedId(post.id)}
                  className={`bg-slate-50 border rounded-2xl p-6 cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5 ${
                    selectedId === post.id
                      ? 'border-blue-500 ring-2 ring-blue-100'
                      : 'border-slate-100'
                  }`}
                >
                  {post.published_at && (
                    <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest mb-2">
                      {formatDate(post.published_at)}
                    </p>
                  )}
                  <h2 className="text-lg font-bold text-slate-900 mb-2">{post.title}</h2>
                  <p className="text-sm text-slate-600 mb-4 line-clamp-3">{post.excerpt}</p>
                  <p className="text-xs text-slate-500 font-medium">By {post.author}</p>
                </article>
              ))}
            </div>

            {selectedPost && (
              <div className="max-w-3xl mx-auto text-left bg-white border border-slate-100 rounded-2xl shadow-sm p-8 relative">
                <button 
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: selectedPost.title,
                        text: selectedPost.excerpt,
                        url: window.location.href
                      }).catch(console.error);
                    } else {
                      navigator.clipboard.writeText(window.location.href);
                      alert('Link copied to clipboard!');
                    }
                  }}
                  className="absolute right-4 sm:right-8 top-8 p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition"
                  title="Share Post"
                >
                  <Share2 className="w-5 h-5" />
                </button>
                <p className="text-sm font-semibold text-blue-600 uppercase tracking-widest mb-2">
                  {selectedPost.published_at ? formatDate(selectedPost.published_at) : ''}
                </p>
                <h2 className="text-2xl font-bold text-slate-900 mb-3">{selectedPost.title}</h2>
                <p className="text-sm text-slate-500 mb-4">By {selectedPost.author}</p>
                <div className="h-px bg-slate-100 mb-6" />
                <div className="prose max-w-none text-slate-700">
                  {selectedPost.content
                    .split(/\n\n+/)
                    .map((para, idx) => (
                      <p key={idx} className="mb-4">
                        {para.trim()}
                      </p>
                    ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};
