import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';
import { motion, AnimatePresence } from 'motion/react';
import { ImageIcon, Maximize2, X } from 'lucide-react';

const resolveImageUrl = (imageUrl: string | undefined | null): string => {
    if (!imageUrl) return '';
    if (/^https?:\/\//i.test(imageUrl)) return imageUrl;

    const apiOrigin = new URL(API_BASE_URL).origin;
    return imageUrl.startsWith('/') ? `${apiOrigin}${imageUrl}` : `${apiOrigin}/${imageUrl}`;
};

export const Gallery: React.FC = () => {
    const [images, setImages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState<any | null>(null);

    useEffect(() => {
        const fetchGallery = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/gallery/`);
                if (res.ok) {
                    setImages(await res.json());
                }
            } catch (err) {
                console.error("Failed to load gallery images", err);
            } finally {
                setLoading(false);
            }
        };
        fetchGallery();
    }, []);

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center text-slate-500">Loading gallery...</div>;
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Header */}
            <div className="bg-slate-900 border-b border-slate-800 py-20 text-center text-white px-4">
                <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Our Photo Gallery</h1>
                <p className="text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed">
                    Explore highlights from our events, worship sessions, and community gatherings.
                </p>
            </div>

            {/* Gallery Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
                {images.length === 0 ? (
                    <div className="text-center py-20 bg-white border border-slate-200 rounded-3xl">
                        <ImageIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-2xl font-bold text-slate-900 mb-2">No photos yet</h3>
                        <p className="text-slate-500">Check back later for beautiful moments captured!</p>
                    </div>
                ) : (
                    <motion.div
                        initial="hidden" animate="show"
                        variants={{
                            hidden: { opacity: 0 },
                            show: { opacity: 1, transition: { staggerChildren: 0.1 } }
                        }}
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[300px]"
                    >
                        {images.filter(img => img.image).map((img) => (
                            <motion.div
                                key={img.id}
                                variants={{
                                    hidden: { opacity: 0, scale: 0.95 },
                                    show: { opacity: 1, scale: 1 }
                                }}
                                className="group relative rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all cursor-pointer bg-white"
                                onClick={() => setSelectedImage(img)}
                            >
                                <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                                    <img
                                        src={resolveImageUrl(img.image)}
                                        alt={img.title || 'Gallery image'}
                                        className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                                    />
                                </div>

                                {/* Overlay overlaying description on hover */}
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                                    <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="text-white font-bold text-xl">{img.title}</h3>
                                            <Maximize2 className="w-5 h-5 text-white/70" />
                                        </div>
                                        {img.description && (
                                            <p className="text-white/80 text-sm line-clamp-2">{img.description}</p>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </div>

            {/* Fullscreen Lightbox Modal */}
            <AnimatePresence>
                {selectedImage && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 md:p-8"
                        onClick={() => setSelectedImage(null)}
                    >
                        <button
                            className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition z-10"
                            onClick={() => setSelectedImage(null)}
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="max-w-5xl w-full max-h-[90vh] flex flex-col items-center"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="relative w-full flex justify-center">
                                <img
                                    src={resolveImageUrl(selectedImage.image)}
                                    alt={selectedImage.title}
                                    className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-2xl"
                                />
                            </div>

                            {/* Lightbox Caption */}
                            {(selectedImage.title || selectedImage.description) && (
                                <div className="mt-6 text-center max-w-2xl bg-slate-900/50 p-6 rounded-2xl backdrop-blur-md border border-white/10">
                                    {selectedImage.title && <h3 className="text-2xl font-bold text-white mb-2">{selectedImage.title}</h3>}
                                    {selectedImage.description && <p className="text-slate-300">{selectedImage.description}</p>}
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
