import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ThumbsUp, MessageSquare, Camera, X, Send, User } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import api from '../../../lib/axios';

export function ProductReviews({ reviews: initialReviews = [], productId }) {
    const [reviews, setReviews] = useState(initialReviews);
    const [newReview, setNewReview] = useState({ rating: 0, content: '', name: '', email: '' });
    const [hoverRating, setHoverRating] = useState(0);
    const [selectedImages, setSelectedImages] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (initialReviews) {
            // Sort by newest first
            const sorted = [...initialReviews].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setReviews(sorted);
        }
    }, [initialReviews]);

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            files.forEach(file => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setSelectedImages(prev => [...prev, reader.result]);
                };
                reader.readAsDataURL(file);
            });
        }
    };

    const removeImage = (index) => {
        setSelectedImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!productId) {
            alert("Product ID missing");
            return;
        }

        setIsSubmitting(true);
        try {
            const reviewPayload = {
                name: newReview.name,
                email: newReview.email,
                rating: newReview.rating || 5,
                comment: newReview.content,
                images: selectedImages
            };

            const response = await api.post(`/product/${productId}/reviews`, reviewPayload);

            if (response.data.success) {
                // Determine new list. If backend sends all reviews, use them.
                const updatedReviews = response.data.reviews
                    ? [...response.data.reviews].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                    : [
                        { ...reviewPayload, createdAt: new Date().toISOString(), _id: Date.now() },
                        ...reviews
                    ];

                setReviews(updatedReviews);
                setNewReview({ rating: 0, content: '', name: '', email: '' });
                setSelectedImages([]);
            }
        } catch (error) {
            console.error("Error submitting review:", error);
            alert(error.response?.data?.message || "Failed to submit review");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="py-12 bg-transparent">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                {/* Left Column: Recent Feedbacks */}
                <div className="lg:col-span-7">
                    <h2 className="text-3xl font-black mb-8 text-foreground uppercase italic tracking-tighter font-['Oswald']">Recent Feedbacks</h2>
                    <div className="space-y-6">
                        {reviews.length === 0 ? (
                            <p className="text-muted-foreground italic">No reviews yet. Be the first to review!</p>
                        ) : (
                            reviews.map((review, idx) => {
                                const author = review.name || review.author || 'Anonymous';
                                const content = review.comment || review.content;
                                const rating = review.rating;
                                const date = review.createdAt ? new Date(review.createdAt).toLocaleDateString() : (review.date || 'Recently');
                                const avatar = review.avatar;

                                return (
                                    <motion.div
                                        key={review._id || review.id || idx}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="bg-card p-6 rounded-[2rem] shadow-sm border border-border/50 flex flex-col sm:flex-row gap-6 items-start"
                                    >
                                        {/* Avatar */}
                                        <div className="flex-shrink-0 w-16 h-16 rounded-full bg-muted flex items-center justify-center overflow-hidden border-2 border-background shadow-md">
                                            <img
                                                src={avatar || `https://ui-avatars.com/api/?name=${author}&background=random`}
                                                alt={author}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>

                                        {/* Content */}
                                        <div className="flex-grow">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
                                                <h4 className="font-bold text-lg text-foreground uppercase italic tracking-tight font-['Oswald']">{author}</h4>
                                                <div className="flex text-amber-500">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star key={i} className={`w-4 h-4 ${i < rating ? 'fill-current' : 'text-muted-foreground/30'}`} />
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="text-xs text-muted-foreground mb-2 font-mono">{date}</div>
                                            <p className="text-muted-foreground text-sm font-medium italic leading-relaxed mb-4">
                                                "{content}"
                                            </p>

                                            {/* Posted Images */}
                                            {review.images && review.images.length > 0 && (
                                                <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                                                    {review.images.map((img, i) => (
                                                        <div key={i} className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border border-border">
                                                            <img src={img} alt="Review" className="w-full h-full object-cover" />
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Right Column: Add a Review */}
                <div className="lg:col-span-5">
                    <h2 className="text-3xl font-black mb-8 text-foreground uppercase italic tracking-tighter font-['Oswald']">Add a Review</h2>
                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* Rating Input */}
                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-muted-foreground mb-3">Add Your Rating <span className="text-primary">*</span></label>
                            <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        className="focus:outline-none transition-transform hover:scale-110"
                                        onMouseEnter={() => setHoverRating(star)}
                                        onMouseLeave={() => setHoverRating(0)}
                                        onClick={() => setNewReview({ ...newReview, rating: star })}
                                    >
                                        <Star
                                            className={`w-8 h-8 ${star <= (hoverRating || newReview.rating)
                                                ? 'fill-amber-400 text-amber-400'
                                                : 'text-muted-foreground/20'
                                                }`}
                                            strokeWidth={2}
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Name Input */}
                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-muted-foreground mb-2">Name <span className="text-primary">*</span></label>
                            <input
                                type="text"
                                required
                                className="w-full bg-secondary/40 dark:bg-card border border-border/50 rounded-xl px-5 py-4 text-sm font-bold text-foreground placeholder:text-muted-foreground/40 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                placeholder="E.G. JOHNNY DRIFT"
                                value={newReview.name}
                                onChange={(e) => setNewReview({ ...newReview, name: e.target.value })}
                            />
                        </div>

                        {/* Email Input */}
                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-muted-foreground mb-2">Email <span className="text-primary">*</span></label>
                            <input
                                type="email"
                                required
                                className="w-full bg-secondary/40 dark:bg-card border border-border/50 rounded-xl px-5 py-4 text-sm font-bold text-foreground placeholder:text-muted-foreground/40 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                placeholder="HELLO@ELECTRIC.COM"
                                value={newReview.email}
                                onChange={(e) => setNewReview({ ...newReview, email: e.target.value })}
                            />
                        </div>

                        {/* Review Textarea */}
                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-muted-foreground mb-2">Write Your Review <span className="text-primary">*</span></label>
                            <textarea
                                required
                                className="w-full bg-secondary/40 dark:bg-card border border-border/50 rounded-xl px-5 py-4 text-sm font-bold text-foreground placeholder:text-muted-foreground/40 focus:ring-2 focus:ring-primary/20 outline-none transition-all min-h-[160px] resize-none"
                                placeholder="TELL US ABOUT YOUR EXPERIENCE..."
                                value={newReview.content}
                                onChange={(e) => setNewReview({ ...newReview, content: e.target.value })}
                            />
                        </div>

                        {/* Image Upload Preview */}
                        {selectedImages.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-2">
                                {selectedImages.map((img, index) => (
                                    <div key={index} className="relative w-16 h-16 rounded-lg overflow-hidden group">
                                        <img src={img} alt="Preview" className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(index)}
                                            className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Submit Button & Actions */}
                        <div className="flex items-center gap-4">
                            <label className="cursor-pointer p-2 rounded-full hover:bg-secondary/20 transition-colors text-muted-foreground" title="Add Photos">
                                <Camera className="w-5 h-5" />
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    className="hidden"
                                    onChange={handleImageUpload}
                                />
                            </label>

                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex-1 bg-amber-400 hover:bg-amber-500 text-white font-bold text-lg py-6 rounded-xl shadow-lg transition-all disabled:opacity-50"
                            >
                                {isSubmitting ? 'Submitting...' : 'Submit'}
                            </Button>
                        </div>

                    </form>
                </div>

            </div>
        </div>
    );
}
