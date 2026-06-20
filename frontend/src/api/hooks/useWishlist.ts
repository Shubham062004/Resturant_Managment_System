import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../services/apiClient';

export interface WishlistItem {
  id: string;
  menuItemId: string;
  productId: string;
  branchId: string;
  savedBranch: {
    id: string;
    name: string;
    city: string;
  };
  createdAt: string;
  updatedAt: string;
  product: {
    id: string;
    name: string;
    slug: string;
    description?: string;
    image?: string;
    basePrice: string;
    rating: number;
    isVeg: boolean;
    isAvailable: boolean;
    category: {
      id: string;
      name: string;
      slug: string;
    };
    variants: Array<{
      id: string;
      name: string;
      price: string;
      isDefault: boolean;
      stock: number;
    }>;
  };
  isAvailableInBranch: boolean;
  statusText: string;
}

export interface WishlistResponse {
  success: boolean;
  data: {
    data: WishlistItem[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  message: string;
}

export interface WishlistSummaryResponse {
  success: boolean;
  data: {
    count: number;
    favoriteCategories: Array<{ name: string; count: number }>;
    mostSavedItem: {
      id: string;
      name: string;
      image: string | null;
      count: number;
    } | null;
    recentlySaved: Array<{
      id: string;
      name: string;
      image: string | null;
      basePrice: string;
    }>;
  };
  message: string;
}

// Hook to fetch wishlist items with filters/sorting/selected branch
export const useWishlist = (filters: {
  page?: number;
  limit?: number;
  search?: string;
  veg?: string;
  category?: string;
  sortBy?: string;
  branchId?: string;
}) => {
  return useQuery<WishlistResponse>({
    queryKey: ['wishlist', filters],
    queryFn: async () => {
      const { data } = await apiClient.get('/customer/wishlist', {
        params: filters,
      });
      return data;
    },
    staleTime: 2000,
  });
};

// Hook to fetch wishlist summary metrics
export const useWishlistSummary = (enabled = true) => {
  return useQuery<WishlistSummaryResponse>({
    queryKey: ['wishlist', 'summary'],
    queryFn: async () => {
      const { data } = await apiClient.get('/customer/wishlist/summary');
      return data;
    },
    enabled,
  });
};

// Hook to add an item to the wishlist
export const useAddWishlist = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      menuItemId,
      branchId,
    }: {
      menuItemId: string;
      branchId: string;
    }) => {
      const { data } = await apiClient.post(`/customer/wishlist/${menuItemId}`, {
        branchId,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      queryClient.invalidateQueries({ queryKey: ['wishlist', 'summary'] });
    },
  });
};

// Hook to remove an item from the wishlist
export const useRemoveWishlist = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (menuItemId: string) => {
      const { data } = await apiClient.delete(`/customer/wishlist/${menuItemId}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      queryClient.invalidateQueries({ queryKey: ['wishlist', 'summary'] });
    },
  });
};

// Hook to clear the wishlist
export const useClearWishlist = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data } = await apiClient.delete('/customer/wishlist');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      queryClient.invalidateQueries({ queryKey: ['wishlist', 'summary'] });
    },
  });
};

// Hook to move all available wishlist items to the cart
export const useMoveWishlistToCart = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (branchId: string) => {
      const { data } = await apiClient.post('/customer/wishlist/move-to-cart', {
        branchId,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      queryClient.invalidateQueries({ queryKey: ['wishlist', 'summary'] });
    },
  });
};

// Hook to add all available wishlist items to the cart
export const useAddAllWishlistToCart = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (branchId: string) => {
      const { data } = await apiClient.post('/customer/wishlist/add-all', {
        branchId,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
};
