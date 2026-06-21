import {
  Star,
  Heart,
  Clock,
  Flame,
  ArrowLeft,
  Send,
  Trash2,
  Edit2,
  Check,
  AlertCircle,
  Leaf,
} from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';

import { useAppSelector } from '../../../app/store';
import { useToast } from '../../../shared/components/ui/Toast';
import {
  useAddToCart,
  useCart,
  useUpdateCartItem,
  useRemoveCartItem,
} from '../../cart/store/cartQueries';
import FoodCard from '../components/FoodCard';
import HeartButton from '../components/HeartButton';
import QuantityStepper from '../components/QuantityStepper';
import {
  useProductBySlug,
  useTrackRecommendationClick,
  useCreateReview,
  useUpdateReview,
  useDeleteReview,
} from '../store/catalogQueries';

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const favoritedIds = useAppSelector((state) => state.favorite.favoritedIds);
  const toast = useToast();
  const addToCart = useAddToCart();
  const updateCartItem = useUpdateCartItem();
  const removeCartItem = useRemoveCartItem();
  const { data: cart } = useCart();

  // Find if this product is in the cart matching the selected variant
  const cartItem = cart?.items.find(
    (i: any) =>
      i.productId === product?.id &&
      (selectedVariantId ? i.variantId === selectedVariantId : !i.variantId)
  );
  const cartQty = cartItem?.quantity || 0;

  const {
    data: response,
    isLoading,
    isError,
    refetch,
  } = useProductBySlug(slug || '');
  const trackRecommendationClickMutation = useTrackRecommendationClick();
  const createReviewMutation = useCreateReview();
  const updateReviewMutation = useUpdateReview();
  const deleteReviewMutation = useDeleteReview();

  const [selectedVariantId, setSelectedVariantId] = useState<string>('');
  const [activeImage, setActiveImage] = useState<string>('');
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>('');
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const product = response?.data;
  const recommendations = response?.recommendations || [];

  useEffect(() => {
    if (product) {
      if (product.variants && product.variants.length > 0) {
        const defaultVar =
          product.variants.find((v) => v.isDefault) || product.variants[0];
        setSelectedVariantId(defaultVar.id);
      }
      if (product.image) {
        setActiveImage(product.image);
      }
    }
  }, [product]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#08070F] pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 animate-pulse">
          <div className="aspect-square bg-white/5 rounded-3xl" />
          <div className="space-y-6 pt-8">
            <div className="h-10 bg-white/5 rounded w-3/4" />
            <div className="h-6 bg-white/5 rounded w-1/4" />
            <div className="h-24 bg-white/5 rounded w-full" />
            <div className="h-12 bg-white/5 rounded w-full" />
            <div className="h-16 bg-white/5 rounded w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="min-h-screen bg-[#08070F] text-white pt-32 pb-20 px-4 flex items-center justify-center">
        <div className="bg-red-500/[0.02] border border-red-500/10 p-10 rounded-2xl text-center max-w-md w-full">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <p className="text-red-400 font-bold mb-3 font-display text-2xl">
            Item Not Found
          </p>
          <p className="text-neutral-400 text-sm mb-6">
            This item might be temporarily out of stock or removed from the
            menu.
          </p>
          <Link
            to="/restaurants"
            className="inline-block py-2.5 px-6 bg-primary hover:bg-primary-hover text-white rounded-xl text-sm font-semibold transition-colors"
          >
            Browse Menu
          </Link>
        </div>
      </div>
    );
  }

  const activeVariant = product.variants?.find(
    (v) => v.id === selectedVariantId
  );
  const displayPrice = activeVariant ? activeVariant.price : product.basePrice;

  // removed old handleFavoriteToggle helper

  const handleRecClick = (recSlug: string, recId: string) => {
    trackRecommendationClickMutation.mutate(
      {
        productId: product.id,
        recommendedProductId: recId,
      },
      {
        onSuccess: () => navigate(`/product/${recSlug}`),
        onError: () => navigate(`/product/${recSlug}`),
      }
    );
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackMsg(null);

    if (!user) {
      setFeedbackMsg({
        type: 'error',
        text: 'You must be logged in to submit a review.',
      });
      return;
    }

    if (reviewComment.trim().length < 3) {
      setFeedbackMsg({
        type: 'error',
        text: 'Comment must be at least 3 characters long.',
      });
      return;
    }

    const payload = {
      productId: product.id,
      rating: reviewRating,
      comment: reviewComment,
    };

    if (editingReviewId) {
      updateReviewMutation.mutate(
        { ...payload, id: editingReviewId },
        {
          onSuccess: () => {
            setFeedbackMsg({
              type: 'success',
              text: 'Review updated successfully!',
            });
            handleCancelEdit();
            refetch();
          },
          onError: (err: any) => {
            setFeedbackMsg({
              type: 'error',
              text:
                err.response?.data?.error?.message ||
                'Failed to update review.',
            });
          },
        }
      );
    } else {
      createReviewMutation.mutate(payload, {
        onSuccess: () => {
          setFeedbackMsg({
            type: 'success',
            text: 'Review submitted successfully!',
          });
          handleCancelEdit();
          refetch();
        },
        onError: (err: any) => {
          setFeedbackMsg({
            type: 'error',
            text:
              err.response?.data?.error?.message || 'Failed to submit review.',
          });
        },
      });
    }
  };

  const handleEditClick = (review: any) => {
    setEditingReviewId(review.id);
    setReviewRating(review.rating);
    setReviewComment(review.comment || '');
    setFeedbackMsg(null);
    document
      .getElementById('review-form-section')
      ?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleDeleteClick = (reviewId: string) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      setFeedbackMsg(null);
      deleteReviewMutation.mutate(reviewId, {
        onSuccess: () => {
          setFeedbackMsg({
            type: 'success',
            text: 'Review deleted successfully!',
          });
          refetch();
        },
        onError: (err: any) => {
          setFeedbackMsg({
            type: 'error',
            text:
              err.response?.data?.error?.message || 'Failed to delete review.',
          });
        },
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingReviewId(null);
    setReviewRating(5);
    setReviewComment('');
  };

  return (
    <div className="min-h-screen bg-[#08070F] text-white pt-24 pb-24 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation Breadcrumb */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="text-neutral-400 hover:text-white flex items-center gap-2 text-sm font-medium transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
        </div>

        {/* 1. Main Grid Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start mb-20">
          {/* Left Column: Image Gallery */}
          <div className="space-y-6">
            <div className="aspect-square rounded-3xl overflow-hidden bg-neutral-900 relative shadow-2xl">
              <HeartButton
                productId={product.id}
                className="!top-6 !right-6"
                size={24}
              />
              <img
                src={
                  activeImage ||
                  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c'
                }
                alt={product.name}
                className="w-full h-full object-cover"
              />

              <div className="absolute top-6 left-6 flex gap-2">
                {product.isVeg ? (
                  <span className="bg-emerald-500/90 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
                    <Leaf size={14} /> Veg
                  </span>
                ) : (
                  <span className="bg-red-500/90 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                    Non-Veg
                  </span>
                )}
                {product.featured && (
                  <span className="bg-amber-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1">
                    <Star size={14} fill="currentColor" /> Bestseller
                  </span>
                )}
              </div>
            </div>

            {product.gallery && product.gallery.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                {product.gallery.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(imgUrl)}
                    className={`w-20 h-20 shrink-0 rounded-xl overflow-hidden border-2 transition-all ${
                      activeImage === imgUrl
                        ? 'border-primary scale-95 shadow-lg shadow-primary/20'
                        : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={imgUrl}
                      alt={`Thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Title, Variant Selector, Details */}
          <div className="rounded-3xl border border-white/5 bg-white/[0.02] p-8 shadow-xl space-y-8">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-primary uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-full">
                  {product.category?.name || 'Category'}
                </span>
              </div>

              <h1 className="text-3xl md:text-5xl font-bold font-display text-white tracking-tight leading-tight">
                {product.name}
              </h1>

              <div className="flex items-center gap-4 text-sm text-neutral-400">
                <div className="flex items-center gap-1 text-amber-400 font-bold bg-amber-400/10 px-2 py-1 rounded-md">
                  <Star size={16} className="fill-current" />
                  <span>{product.rating?.toFixed(1) || '0.0'}</span>
                </div>
                <span>•</span>
                <span>{product.reviews?.length || 0} reviews</span>
                {product.restaurant && (
                  <>
                    <span>•</span>
                    <Link
                      to={`/restaurants/${product.restaurant.slug}`}
                      className="hover:text-white underline decoration-white/20 underline-offset-4"
                    >
                      {product.restaurant.name}
                    </Link>
                  </>
                )}
              </div>
            </div>

            <p className="text-neutral-400 text-base leading-relaxed">
              {product.description || product.shortDescription}
            </p>

            {/* Tags */}
            <div className="flex gap-4 border-y border-white/5 py-5">
              {product.calories && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
                    <Flame size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-semibold">
                      Energy
                    </p>
                    <p className="text-sm font-bold text-white">
                      {product.calories} kcal
                    </p>
                  </div>
                </div>
              )}
              {product.preparationTime && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <Clock size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-semibold">
                      Prep Time
                    </p>
                    <p className="text-sm font-bold text-white">
                      {product.preparationTime} mins
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Variants */}
            {product.variants && product.variants.length > 0 && (
              <div className="space-y-4">
                <p className="text-sm text-white font-semibold">
                  Choose Options:
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {product.variants.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariantId(v.id)}
                      className={`p-4 rounded-xl border text-left transition-all ${
                        selectedVariantId === v.id
                          ? 'bg-primary/10 border-primary text-white shadow-md'
                          : 'bg-white/[0.03] border-white/10 text-neutral-400 hover:border-white/30 hover:text-white'
                      }`}
                    >
                      <p className="text-sm font-medium mb-1">{v.name}</p>
                      <p className="text-sm font-bold text-white">
                        ₹{parseFloat(v.price).toFixed(0)}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Action Bar */}
            <div className="flex items-center justify-between pt-4">
              <div>
                <p className="text-xs text-neutral-500 uppercase tracking-widest font-semibold mb-1">
                  Total Amount
                </p>
                <p className="text-4xl font-bold text-primary">
                  ₹{parseFloat(displayPrice).toFixed(0)}
                </p>
              </div>

              {cartQty > 0 ? (
                <QuantityStepper
                  quantity={cartQty}
                  onIncrease={async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (cartItem) {
                      await updateCartItem.mutateAsync({
                        id: cartItem.id,
                        quantity: cartQty + 1,
                      });
                    }
                  }}
                  onDecrease={async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (cartItem) {
                      if (cartQty > 1) {
                        await updateCartItem.mutateAsync({
                          id: cartItem.id,
                          quantity: cartQty - 1,
                        });
                      } else {
                        await removeCartItem.mutateAsync(cartItem.id);
                      }
                    }
                  }}
                  isLoading={
                    updateCartItem.isPending || removeCartItem.isPending
                  }
                  size="lg"
                />
              ) : (
                <button
                  disabled={addToCart.isPending}
                  onClick={async () => {
                    try {
                      await addToCart.mutateAsync({
                        productId: product.id,
                        variantId: selectedVariantId || undefined,
                        quantity: 1,
                        product,
                        variant: activeVariant || undefined,
                      });
                      toast.success('Added to cart successfully!');
                    } catch {
                      toast.error('Could not add to cart.');
                    }
                  }}
                  className="h-14 px-8 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold text-sm shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 flex items-center justify-center min-w-[160px]"
                >
                  {addToCart.isPending ? 'Adding...' : 'Add to Order'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 2. Frequently Bought Together */}
        {recommendations.length > 0 && (
          <div className="mb-20">
            <h2 className="text-2xl sm:text-3xl font-bold font-display text-white mb-8 border-b border-white/5 pb-4">
              Frequently Bought Together
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
              {recommendations.map((rec) => (
                <div
                  onClick={() => handleRecClick(rec.slug, rec.id)}
                  key={rec.id}
                  className="cursor-pointer"
                >
                  <FoodCard product={rec} showAddToCart={false} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. Reviews Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-7 space-y-6">
            <h2 className="text-2xl font-bold font-display text-white border-b border-white/5 pb-4">
              Reviews & Ratings ({product.reviews?.length || 0})
            </h2>

            {product.reviews && product.reviews.length > 0 ? (
              <div className="space-y-4">
                {product.reviews.map((rev) => {
                  const isAuthor = user ? rev.userId === user.id : false;
                  return (
                    <div
                      key={rev.id}
                      className="rounded-2xl border border-white/5 bg-white/[0.02] p-6"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold">
                            {rev.user.firstName.charAt(0)}
                            {rev.user.lastName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-white text-sm">
                              {rev.user.firstName} {rev.user.lastName}
                            </p>
                            <p className="text-xs text-neutral-500 mt-0.5">
                              {new Date(rev.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-1 text-amber-400">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${i < rev.rating ? 'fill-current' : 'text-neutral-700'}`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-neutral-300 text-sm leading-relaxed">
                        {rev.comment}
                      </p>

                      {isAuthor && (
                        <div className="flex gap-4 justify-end mt-4 pt-3 border-t border-white/5">
                          <button
                            onClick={() => handleEditClick(rev)}
                            className="text-xs text-neutral-400 hover:text-white flex items-center gap-1"
                          >
                            <Edit2 size={12} /> Edit
                          </button>
                          <button
                            onClick={() => handleDeleteClick(rev.id)}
                            className="text-xs text-red-500 hover:text-red-400 flex items-center gap-1"
                          >
                            <Trash2 size={12} /> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 rounded-2xl border border-white/5 bg-white/[0.02]">
                <p className="text-neutral-500 text-sm">
                  No reviews yet. Be the first to review!
                </p>
              </div>
            )}
          </div>

          <div id="review-form-section" className="lg:col-span-5">
            <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-8 sticky top-32">
              <h3 className="text-xl font-bold font-display text-white mb-6">
                {editingReviewId ? 'Edit Review' : 'Write a Review'}
              </h3>

              {user ? (
                <form onSubmit={handleReviewSubmit} className="space-y-5">
                  <div>
                    <label className="text-xs text-neutral-400 font-semibold block mb-3">
                      Rating
                    </label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewRating(star)}
                          className="text-amber-400 focus:outline-none hover:scale-110 transition-transform"
                        >
                          <Star
                            className={`h-8 w-8 ${star <= reviewRating ? 'fill-current' : 'text-neutral-700'}`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-neutral-400 font-semibold block mb-3">
                      Feedback
                    </label>
                    <textarea
                      rows={4}
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="What did you think about this item?"
                      className="w-full p-4 bg-black/40 border border-white/10 rounded-xl text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-primary/50 transition-colors resize-none"
                    />
                  </div>

                  {feedbackMsg && (
                    <div
                      className={`p-3 rounded-xl text-xs flex items-center gap-2 ${feedbackMsg.type === 'success' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}
                    >
                      {feedbackMsg.type === 'success' ? (
                        <Check size={14} />
                      ) : (
                        <AlertCircle size={14} />
                      )}
                      <span>{feedbackMsg.text}</span>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      type="submit"
                      className="flex-1 h-11 bg-primary hover:bg-primary-hover text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all"
                    >
                      <Send size={16} />{' '}
                      {editingReviewId ? 'Update' : 'Post Review'}
                    </button>
                    {editingReviewId && (
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="h-11 px-6 bg-white/5 hover:bg-white/10 text-white rounded-xl text-sm font-bold transition-all"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              ) : (
                <div className="text-center py-8">
                  <p className="text-neutral-400 text-sm mb-4">
                    Please log in to leave a review.
                  </p>
                  <Link
                    to="/login"
                    className="py-2.5 px-6 bg-primary text-white rounded-xl text-sm font-bold inline-block"
                  >
                    Sign In
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
