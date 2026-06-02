import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../../app/store';
import {
  useProductBySlug,
  useToggleFavorite,
  useTrackRecommendationClick,
  useCreateReview,
  useUpdateReview,
  useDeleteReview,
} from '../store/catalogQueries';
import { Star, Heart, Clock, Flame, ArrowLeft, Send, Trash2, Edit2, Check, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const { user } = useAppSelector((state) => state.auth);
  const favoritedIds = useAppSelector((state) => state.favorite.favoritedIds);

  const { data: response, isLoading, isError, refetch } = useProductBySlug(slug || '');
  const toggleFavoriteMutation = useToggleFavorite();
  const trackRecommendationClickMutation = useTrackRecommendationClick();
  const createReviewMutation = useCreateReview();
  const updateReviewMutation = useUpdateReview();
  const deleteReviewMutation = useDeleteReview();

  const [selectedVariantId, setSelectedVariantId] = useState<string>('');
  const [activeImage, setActiveImage] = useState<string>('');
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>('');
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const product = response?.data;
  const recommendations = response?.recommendations || [];
  const isFavorited = product ? !!favoritedIds[product.id] : false;

  useEffect(() => {
    if (product) {
      if (product.variants && product.variants.length > 0) {
        const defaultVar = product.variants.find((v) => v.isDefault) || product.variants[0];
        setSelectedVariantId(defaultVar.id);
      }
      if (product.image) {
        setActiveImage(product.image);
      }
    }
  }, [product]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#08070F] text-white pt-32 pb-20 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="min-h-screen bg-[#08070F] text-white pt-32 pb-20 px-4">
        <div className="glass-card max-w-lg mx-auto p-10 border border-red-500/10 bg-red-500/[0.02] text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <p className="text-red-400 font-bold mb-4 font-display text-2xl">Item Not Found</p>
          <p className="text-neutral-400 text-sm mb-6">The requested product could not be loaded. It may be temporarily unavailable.</p>
          <Link to="/menu" className="btn-primary py-2.5 px-6 rounded-lg text-sm font-medium inline-block transition-all">
            Browse All Menus
          </Link>
        </div>
      </div>
    );
  }

  // Get active variant price details
  const activeVariant = product.variants.find((v) => v.id === selectedVariantId);
  const displayPrice = activeVariant ? activeVariant.price : product.basePrice;

  const handleFavoriteToggle = () => {
    toggleFavoriteMutation.mutate(product.id);
  };

  const handleRecClick = (recSlug: string, recId: string) => {
    trackRecommendationClickMutation.mutate({
      productId: product.id,
      recommendedProductId: recId,
    }, {
      onSuccess: () => {
        navigate(`/product/${recSlug}`);
      },
      onError: () => {
        // Safe fallback if click tracking triggers network warnings
        navigate(`/product/${recSlug}`);
      }
    });
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackMsg(null);

    if (!user) {
      setFeedbackMsg({ type: 'error', text: 'You must be logged in to submit a review.' });
      return;
    }

    if (reviewComment.trim().length < 3) {
      setFeedbackMsg({ type: 'error', text: 'Comment must be at least 3 characters long.' });
      return;
    }

    if (editingReviewId) {
      updateReviewMutation.mutate(
        {
          id: editingReviewId,
          rating: reviewRating,
          comment: reviewComment,
        },
        {
          onSuccess: () => {
            setFeedbackMsg({ type: 'success', text: 'Review updated successfully!' });
            setEditingReviewId(null);
            setReviewComment('');
            setReviewRating(5);
            refetch();
          },
          onError: (err: any) => {
            setFeedbackMsg({
              type: 'error',
              text: err.response?.data?.error?.message || 'Failed to update review.',
            });
          },
        }
      );
    } else {
      createReviewMutation.mutate(
        {
          productId: product.id,
          rating: reviewRating,
          comment: reviewComment,
        },
        {
          onSuccess: () => {
            setFeedbackMsg({ type: 'success', text: 'Review submitted successfully!' });
            setReviewComment('');
            setReviewRating(5);
            refetch();
          },
          onError: (err: any) => {
            setFeedbackMsg({
              type: 'error',
              text: err.response?.data?.error?.message || 'Failed to submit review.',
            });
          },
        }
      );
    }
  };

  const handleEditClick = (review: any) => {
    setEditingReviewId(review.id);
    setReviewRating(review.rating);
    setReviewComment(review.comment || '');
    setFeedbackMsg(null);

    // Scroll to review form smoothly
    const element = document.getElementById('review-form-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleDeleteClick = (reviewId: string) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      setFeedbackMsg(null);
      deleteReviewMutation.mutate(reviewId, {
        onSuccess: () => {
          setFeedbackMsg({ type: 'success', text: 'Review deleted successfully!' });
          refetch();
        },
        onError: (err: any) => {
          setFeedbackMsg({
            type: 'error',
            text: err.response?.data?.error?.message || 'Failed to delete review.',
          });
        },
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingReviewId(null);
    setReviewRating(5);
    setReviewComment('');
    setFeedbackMsg(null);
  };

  return (
    <div className="min-h-screen bg-[#08070F] text-white pt-24 pb-24 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navigation Breadcrumb */}
        <div className="mb-8">
          <Link
            to={product.restaurant ? `/restaurants/${product.restaurant.slug}` : '/menu'}
            className="text-neutral-400 hover:text-white flex items-center gap-2 text-sm font-medium transition-colors"
          >
            <ArrowLeft className="h-4 w-4 text-primary" /> Back to {product.restaurant?.name || 'Catalog'}
          </Link>
        </div>

        {/* 1. Main Grid Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start mb-16">
          
          {/* Left Column: Image Gallery and Slider */}
          <div className="space-y-6">
            <div className="glass-card aspect-square rounded-3xl overflow-hidden border border-white/5 bg-white/[0.01] relative shadow-2xl flex items-center justify-center">
              <img
                src={activeImage}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              
              {/* Floating indicators */}
              <div className="absolute top-6 left-6 p-1 bg-black/60 rounded-lg border border-white/10 backdrop-blur-md">
                <div className={`w-3.5 h-3.5 border flex items-center justify-center p-0.5 ${product.isVeg ? 'border-green-500' : 'border-red-500'}`}>
                  <div className={`w-2 h-2 rounded-full ${product.isVeg ? 'bg-green-500' : 'bg-red-500'}`} />
                </div>
              </div>
            </div>

            {/* Gallery Thumbnails */}
            {product.gallery && product.gallery.length > 1 && (
              <div className="flex gap-4">
                {product.gallery.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(imgUrl)}
                    className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                      activeImage === imgUrl ? 'border-primary scale-95 shadow-lg shadow-primary/20' : 'border-white/5 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={imgUrl} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Title, Variant Selector, Rating Breakdown */}
          <div className="glass-panel p-8 rounded-3xl border border-white/5 bg-white/[0.01] shadow-2xl space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-primary uppercase tracking-widest">
                  {product.category?.name}
                </span>
                
                {/* Favorite toggle button */}
                <button
                  onClick={handleFavoriteToggle}
                  className={`p-2.5 rounded-xl border border-white/5 transition-all flex items-center justify-center active:scale-90 ${
                    isFavorited
                      ? 'bg-red-500/15 text-red-500 border-red-500/20'
                      : 'bg-white/5 text-neutral-400 hover:text-white'
                  }`}
                >
                  <Heart className={`h-5 w-5 ${isFavorited ? 'fill-current' : ''}`} />
                </button>
              </div>

              <h1 className="text-3xl md:text-4xl font-bold font-display tracking-tight text-white">
                {product.name}
              </h1>

              {/* Stars summary */}
              <div className="flex items-center gap-4 text-sm text-neutral-400">
                <div className="flex items-center gap-1 text-amber-400">
                  <Star className="h-4.5 w-4.5 fill-current" />
                  <span className="font-bold text-white">{product.rating.toFixed(1)}</span>
                </div>
                <span>•</span>
                <span>{product.reviews?.length || 0} customer reviews</span>
              </div>
            </div>

            <p className="text-neutral-300 font-sans font-light leading-relaxed">
              {product.description}
            </p>

            {/* Health Info Badges */}
            <div className="flex gap-4 border-y border-white/5 py-4">
              {product.calories && (
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500">
                    <Flame className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[10px] text-neutral-500 uppercase tracking-widest">Energy</p>
                    <p className="text-sm font-semibold text-white">{product.calories} kcal</p>
                  </div>
                </div>
              )}
              {product.preparationTime && (
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[10px] text-neutral-500 uppercase tracking-widest">Speed</p>
                    <p className="text-sm font-semibold text-white">{product.preparationTime} mins</p>
                  </div>
                </div>
              )}
            </div>

            {/* Variant Selector */}
            {product.variants && product.variants.length > 0 && (
              <div className="space-y-3">
                <p className="text-sm text-neutral-400 font-medium">Select Variant Configurations:</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {product.variants.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariantId(v.id)}
                      className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between h-20 ${
                        selectedVariantId === v.id
                          ? 'bg-primary/10 border-primary text-white shadow-lg'
                          : 'bg-[#111019] border-white/5 text-neutral-400 hover:border-white/10 hover:text-white'
                      }`}
                    >
                      <span className="text-xs font-semibold">{v.name}</span>
                      <span className="text-sm font-bold text-white">${parseFloat(v.price).toFixed(2)}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Price tag & add to cart placeholder */}
            <div className="flex items-center justify-between pt-6 border-t border-white/5">
              <div>
                <p className="text-xs text-neutral-500 uppercase tracking-widest font-sans">Total Price</p>
                <p className="text-3xl font-extrabold text-primary">${parseFloat(displayPrice).toFixed(2)}</p>
              </div>

              {/* Cart action is ignored in this PR catalog scope. We render a placeholder customize alert button. */}
              <button
                className="py-3.5 px-8 bg-primary hover:bg-primary-dark text-white rounded-xl font-semibold shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95 text-sm"
              >
                Add To Cart Selection
              </button>
            </div>

          </div>
        </div>

        {/* 2. Review Form & Reviews list */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mt-16 items-start">
          
          {/* Reviews list (takes 2 columns) */}
          <div className="lg:col-span-2 space-y-8">
            <h2 className="text-2xl font-bold font-display text-white border-b border-white/5 pb-4">
              Customer Feedback ({product.reviews?.length || 0})
            </h2>

            {product.reviews && product.reviews.length > 0 ? (
              <div className="space-y-6">
                {product.reviews.map((rev) => {
                  const isAuthor = user ? rev.userId === user.id : false;
                  return (
                    <div
                      key={rev.id}
                      className="glass-card p-5 rounded-2xl border border-white/5 bg-white/[0.01]"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          {rev.user.avatar ? (
                            <img
                              src={rev.user.avatar}
                              alt={`${rev.user.firstName} avatar`}
                              className="h-10 w-10 rounded-full border border-white/10 object-cover"
                            />
                          ) : (
                            <div className="h-10 w-10 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold text-sm">
                              {rev.user.firstName.charAt(0)}{rev.user.lastName.charAt(0)}
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-white text-sm">
                              {rev.user.firstName} {rev.user.lastName}
                            </p>
                            <p className="text-[10px] text-neutral-500 mt-0.5">
                              {new Date(rev.createdAt).toLocaleDateString(undefined, {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </p>
                          </div>
                        </div>

                        {/* Stars badge */}
                        <div className="flex gap-1 text-amber-500">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3.5 w-3.5 ${
                                i < rev.rating ? 'fill-current' : 'text-neutral-700'
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      <p className="mt-4 text-neutral-300 text-sm font-sans font-light leading-relaxed">
                        {rev.comment}
                      </p>

                      {/* Author Edit/Delete Tools */}
                      {isAuthor && (
                        <div className="flex gap-4 justify-end mt-4 border-t border-white/5 pt-3">
                          <button
                            onClick={() => handleEditClick(rev)}
                            className="text-xs text-neutral-400 hover:text-white flex items-center gap-1 transition-colors"
                          >
                            <Edit2 className="h-3 w-3" /> Edit
                          </button>
                          <button
                            onClick={() => handleDeleteClick(rev.id)}
                            className="text-xs text-red-500 hover:text-red-400 flex items-center gap-1 transition-colors"
                          >
                            <Trash2 className="h-3 w-3" /> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 bg-white/[0.01] border border-white/5 rounded-2xl">
                <p className="text-neutral-500 text-sm">No reviews yet for this product. Be the first to share your experience!</p>
              </div>
            )}
          </div>

          {/* Review write box (takes 1 column) */}
          <div id="review-form-section" className="glass-panel p-6 rounded-2xl border border-white/5 bg-white/[0.01]">
            <h3 className="text-xl font-bold font-display text-white mb-6">
              {editingReviewId ? 'Edit Your Review' : 'Add Product Review'}
            </h3>

            {user ? (
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                {/* Clickable Stars */}
                <div>
                  <label className="text-xs text-neutral-400 font-medium block mb-2">Your Rating Score:</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        className="text-amber-500 focus:outline-none hover:scale-110 transition-transform"
                      >
                        <Star
                          className={`h-6 w-6 ${
                            star <= reviewRating ? 'fill-current' : 'text-neutral-700'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Review Text */}
                <div>
                  <label className="text-xs text-neutral-400 font-medium block mb-2">Write Review details:</label>
                  <textarea
                    rows={4}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Tell us what you liked or disliked about this dish..."
                    className="w-full p-3 bg-[#111019] border border-white/10 rounded-xl text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-primary/50 transition-colors resize-none"
                  />
                </div>

                {/* Notifications feedback */}
                {feedbackMsg && (
                  <div
                    className={`p-3 rounded-lg text-xs flex items-start gap-2 ${
                      feedbackMsg.type === 'success'
                        ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                        : 'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}
                  >
                    {feedbackMsg.type === 'success' ? (
                      <Check className="h-4 w-4 shrink-0" />
                    ) : (
                      <AlertCircle className="h-4 w-4 shrink-0" />
                    )}
                    <span>{feedbackMsg.text}</span>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 py-2.5 px-4 bg-primary hover:bg-primary-dark text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all active:scale-95"
                  >
                    <Send className="h-4 w-4" /> Submit Review
                  </button>
                  {editingReviewId && (
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="py-2.5 px-4 bg-white/5 hover:bg-white/10 text-neutral-300 rounded-xl text-sm font-semibold transition-all active:scale-95"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            ) : (
              <div className="text-center py-6 bg-[#111019] rounded-xl border border-white/5">
                <p className="text-neutral-400 text-sm mb-4">Please log in to submit reviews.</p>
                <Link
                  to="/login"
                  className="py-2 px-5 bg-primary hover:bg-primary-dark text-white rounded-lg text-xs font-semibold inline-block transition-all"
                >
                  Log In Now
                </Link>
              </div>
            )}
          </div>

        </div>

        {/* 3. Recommended Items Slider */}
        {recommendations.length > 0 && (
          <div className="mt-20">
            <h2 className="text-2xl font-bold font-display text-white mb-8 border-b border-white/5 pb-4">
              You May Also Like (Recommended Selects)
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {recommendations.map((rec) => (
                <div
                  key={rec.id}
                  onClick={() => handleRecClick(rec.slug, rec.id)}
                  className="glass-card p-4 rounded-xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] hover:border-white/10 transition-all duration-300 cursor-pointer shadow-lg group"
                >
                  <div className="aspect-square rounded-lg overflow-hidden mb-3">
                    <img
                      src={rec.image}
                      alt={rec.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <h4 className="font-bold text-sm text-white group-hover:text-primary transition-colors line-clamp-1">
                    {rec.name}
                  </h4>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
                    <div className="flex items-center gap-0.5 text-amber-500 text-xs">
                      <Star className="h-3 w-3 fill-current" /> {rec.rating.toFixed(1)}
                    </div>
                    <span className="text-primary font-bold text-sm">
                      ${parseFloat(rec.basePrice).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ProductDetailPage;
