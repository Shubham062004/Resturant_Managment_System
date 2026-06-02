import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { apiClient } from '../../../services/apiClient';
import { setFavorites, toggleFavoriteState } from './favoriteSlice';

// Type definitions
export interface Restaurant {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  coverImage?: string;
  rating: number;
  status: string;
  branches: Branch[];
}

export interface Branch {
  id: string;
  restaurantId: string;
  name: string;
  address: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  openingTime: string;
  closingTime: string;
  deliveryRadius: number;
  isActive: boolean;
}

export interface Category {
  id: string;
  restaurantId: string;
  name: string;
  slug: string;
  image?: string;
  description?: string;
  sortOrder: number;
  isActive: boolean;
}

export interface ProductVariant {
  id: string;
  productId: string;
  name: string;
  price: string;
  stock: number;
  isDefault: boolean;
}

export interface UserSummary {
  id: string;
  firstName: string;
  lastName: string;
  avatar?: string;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  rating: number;
  comment?: string;
  createdAt: string;
  updatedAt: string;
  user: UserSummary;
}

export interface Product {
  id: string;
  restaurantId: string;
  categoryId: string;
  name: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  image?: string;
  gallery: string[];
  basePrice: string;
  rating: number;
  calories?: number;
  preparationTime?: number;
  isVeg: boolean;
  isAvailable: boolean;
  featured: boolean;
  variants: ProductVariant[];
  reviews?: Review[];
  restaurant?: Restaurant;
  category?: Category;
}

export interface RestaurantsResponse {
  success: boolean;
  data: Restaurant[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  message: string;
}

export interface RestaurantResponse {
  success: boolean;
  data: Restaurant & {
    categories: Category[];
    products: Product[];
  };
  message: string;
}

export interface ProductsResponse {
  success: boolean;
  data: Product[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  message: string;
}

export interface ProductResponse {
  success: boolean;
  data: Product & {
    reviews: Review[];
    category: Category;
    restaurant: Restaurant;
  };
  recommendations: Product[];
  message: string;
}

export interface ReviewsResponse {
  success: boolean;
  data: Review[];
  message: string;
}

export interface FavoritesResponse {
  success: boolean;
  data: Product[];
  message: string;
}

// 1. Fetch Restaurants
export const useRestaurants = (filters: {
  search?: string;
  rating?: number | null;
  veg?: boolean;
  openNow?: boolean;
  sortBy?: string;
  sortOrder?: string;
  page?: number;
  limit?: number;
}) => {
  return useQuery<RestaurantsResponse>({
    queryKey: ['restaurants', filters],
    queryFn: async () => {
      const cleanParams: any = { ...filters };
      if (cleanParams.rating === null) delete cleanParams.rating;
      if (!cleanParams.search) delete cleanParams.search;
      if (!cleanParams.veg) delete cleanParams.veg;
      if (!cleanParams.openNow) delete cleanParams.openNow;

      const { data } = await apiClient.get('/catalog/restaurants', { params: cleanParams });
      return data;
    },
  });
};

// 2. Fetch Restaurant by Slug
export const useRestaurantBySlug = (slug: string) => {
  return useQuery<RestaurantResponse>({
    queryKey: ['restaurant', slug],
    queryFn: async () => {
      const { data } = await apiClient.get(`/catalog/restaurants/slug/${slug}`);
      return data;
    },
    enabled: !!slug,
  });
};

// 3. Fetch Category details & products by slug
export const useCategoryBySlug = (slug: string, restaurantId?: string) => {
  return useQuery<{ success: boolean; data: Category & { products: Product[] }; message: string }>({
    queryKey: ['category', slug, restaurantId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/catalog/categories/slug/${slug}`, {
        params: restaurantId ? { restaurantId } : {},
      });
      return data;
    },
    enabled: !!slug,
  });
};

// 4. Fetch Products
export const useProducts = (filters: {
  search?: string;
  restaurantId?: string;
  categoryId?: string;
  isVeg?: boolean;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  sortOrder?: string;
  page?: number;
  limit?: number;
}) => {
  return useQuery<ProductsResponse>({
    queryKey: ['products', filters],
    queryFn: async () => {
      const cleanParams: any = { ...filters };
      if (!cleanParams.search) delete cleanParams.search;
      if (!cleanParams.restaurantId) delete cleanParams.restaurantId;
      if (!cleanParams.categoryId) delete cleanParams.categoryId;
      if (cleanParams.isVeg === undefined) delete cleanParams.isVeg;

      const { data } = await apiClient.get('/catalog/products', { params: cleanParams });
      return data;
    },
  });
};

// 5. Fetch Featured Products
export const useFeaturedProducts = () => {
  return useQuery<{ success: boolean; data: Product[]; message: string }>({
    queryKey: ['products', 'featured'],
    queryFn: async () => {
      const { data } = await apiClient.get('/catalog/products/featured');
      return data;
    },
  });
};

// 6. Fetch Product by Slug
export const useProductBySlug = (slug: string) => {
  return useQuery<ProductResponse>({
    queryKey: ['product', slug],
    queryFn: async () => {
      const { data } = await apiClient.get(`/catalog/products/slug/${slug}`);
      return data;
    },
    enabled: !!slug,
  });
};

// 7. Track recommendation click
export const useTrackRecommendationClick = () => {
  return useMutation({
    mutationFn: async ({
      productId,
      recommendedProductId,
    }: {
      productId: string;
      recommendedProductId: string;
    }) => {
      const { data } = await apiClient.post('/catalog/products/recommendations/click', {
        productId,
        recommendedProductId,
      });
      return data;
    },
  });
};

// 8. Reviews: Create Review
export const useCreateReview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (reviewData: { productId: string; rating: number; comment: string }) => {
      const { data } = await apiClient.post('/catalog/reviews', reviewData);
      return data;
    },
    onSuccess: () => {
      // Invalidate target product details query to trigger reviews reload and rating recalculation
      queryClient.invalidateQueries({ queryKey: ['product'] });
      queryClient.invalidateQueries({ queryKey: ['restaurant'] });
    },
  });
};

// 9. Reviews: Update Review
export const useUpdateReview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      rating,
      comment,
    }: {
      id: string;
      rating: number;
      comment: string;
    }) => {
      const { data } = await apiClient.put(`/catalog/reviews/${id}`, { rating, comment });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product'] });
      queryClient.invalidateQueries({ queryKey: ['restaurant'] });
    },
  });
};

// 10. Reviews: Delete Review
export const useDeleteReview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.delete(`/catalog/reviews/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product'] });
      queryClient.invalidateQueries({ queryKey: ['restaurant'] });
    },
  });
};

// 11. Toggle Favorite (Optimistic Updates enabled)
export const useToggleFavorite = () => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId: string) => {
      const { data } = await apiClient.post('/catalog/favorites', { productId });
      return data;
    },
    onMutate: async (productId) => {
      // Optimistically toggle Redux store state immediately
      dispatch(toggleFavoriteState(productId));
      return { productId };
    },
    onError: (err, productId, context) => {
      // Revert optimistic toggle in Redux if request fails
      if (context) {
        dispatch(toggleFavoriteState(context.productId));
      }
    },
    onSuccess: () => {
      // Invalidate favorites query
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });
};

// 12. Fetch Favorites list and sync Redux state
export const useFavorites = () => {
  const dispatch = useDispatch();

  return useQuery<FavoritesResponse>({
    queryKey: ['favorites'],
    queryFn: async () => {
      const { data } = await apiClient.get('/catalog/favorites');
      // Sync with Redux cache
      if (data && data.success && Array.isArray(data.data)) {
        const productIds = data.data.map((prod: Product) => prod.id);
        dispatch(setFavorites(productIds));
      }
      return data;
    },
  });
};
