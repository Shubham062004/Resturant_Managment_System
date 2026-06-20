import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiClient } from '../../../services/apiClient';
import type { Product } from '../../customer/store/catalogQueries';

export interface CartItem {
  id: string;
  cartId: string;
  productId: string;
  variantId?: string | null;
  quantity: number;
  price: string;
  product: Product & {
    restaurant?: { name: string; slug: string };
  };
  variant?: { id: string; name: string; price: string } | null;
}

export interface Cart {
  id: string;
  userId?: string | null;
  items: CartItem[];
}

export interface Address {
  id: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  isDefault: boolean;
}

export interface Coupon {
  id: string;
  code: string;
  description?: string | null;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_DELIVERY';
  discountValue: string;
  minimumAmount: string;
  maxDiscount?: string | null;
  startDate: string;
  endDate: string;
}

export const useCart = (enabled = true) =>
  useQuery({
    queryKey: ['cart'],
    queryFn: async () => {
      const { data } = await apiClient.get('/cart');
      return data.data as Cart;
    },
    enabled,
    retry: false,
  });

export const useAddToCart = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      productId: string;
      variantId?: string;
      quantity: number;
    }) => {
      const { data } = await apiClient.post('/cart/items', payload);
      return data.data as Cart;
    },
    onMutate: async (newItem) => {
      await queryClient.cancelQueries({ queryKey: ['cart'] });
      const previousCart = queryClient.getQueryData<Cart>(['cart']);

      if (previousCart) {
        const tempItem: CartItem = {
          id: `temp-${Date.now()}`,
          cartId: previousCart.id,
          productId: newItem.productId,
          variantId: newItem.variantId || null,
          quantity: newItem.quantity,
          price: '0',
          product: {
            id: newItem.productId,
            name: 'Adding...',
            basePrice: '0',
            image: '',
            isVeg: true,
            isAvailable: true,
            featured: false,
            rating: 5,
            slug: '',
            gallery: [],
            variants: [],
            restaurantId: '',
            categoryId: '',
          },
        };

        queryClient.setQueryData(['cart'], {
          ...previousCart,
          items: [...previousCart.items, tempItem],
        });
      }

      return { previousCart };
    },
    onError: (err, newItem, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(['cart'], context.previousCart);
      }
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['cart'], data);
    },
  });
};

export const useUpdateCartItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, quantity }: { id: string; quantity: number }) => {
      const { data } = await apiClient.put(`/cart/items/${id}`, { quantity });
      return data.data as Cart;
    },
    onMutate: async ({ id, quantity }) => {
      await queryClient.cancelQueries({ queryKey: ['cart'] });
      const previousCart = queryClient.getQueryData<Cart>(['cart']);

      if (previousCart) {
        const updatedItems = previousCart.items.map((item) =>
          item.id === id ? { ...item, quantity } : item
        );
        queryClient.setQueryData(['cart'], {
          ...previousCart,
          items: updatedItems,
        });
      }

      return { previousCart };
    },
    onError: (err, newVariables, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(['cart'], context.previousCart);
      }
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['cart'], data);
    },
  });
};

export const useRemoveCartItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.delete(`/cart/items/${id}`);
      return data.data as Cart;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['cart'] });
      const previousCart = queryClient.getQueryData<Cart>(['cart']);

      if (previousCart) {
        const updatedItems = previousCart.items.filter((item) => item.id !== id);
        queryClient.setQueryData(['cart'], {
          ...previousCart,
          items: updatedItems,
        });
      }

      return { previousCart };
    },
    onError: (err, id, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(['cart'], context.previousCart);
      }
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['cart'], data);
    },
  });
};

export const useClearCart = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data } = await apiClient.delete('/cart');
      return data.data as Cart;
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['cart'] });
      const previousCart = queryClient.getQueryData<Cart>(['cart']);

      if (previousCart) {
        queryClient.setQueryData(['cart'], {
          ...previousCart,
          items: [],
        });
      }

      return { previousCart };
    },
    onError: (err, newVariables, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(['cart'], context.previousCart);
      }
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['cart'], data);
    },
  });
};

export const useActiveCoupons = () =>
  useQuery({
    queryKey: ['coupons', 'active'],
    queryFn: async () => {
      const { data } = await apiClient.get('/coupons/active');
      return data.data as Coupon[];
    },
  });

export const useValidateCoupon = () =>
  useMutation({
    mutationFn: async (payload: { code: string; orderAmount: number }) => {
      const { data } = await apiClient.post('/coupons/validate', payload);
      return data.data as { coupon: Coupon; discountAmount: number };
    },
  });

export const useAddresses = (enabled = true) =>
  useQuery({
    queryKey: ['addresses'],
    queryFn: async () => {
      const { data } = await apiClient.get('/addresses');
      return data.data as Address[];
    },
    enabled,
    retry: false,
  });

export const useCreateAddress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Omit<Address, 'id'>) => {
      const { data } = await apiClient.post('/addresses', payload);
      return data.data as Address;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
    },
  });
};

export const useUpdateAddress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...payload
    }: Partial<Omit<Address, 'id'>> & { id: string }) => {
      const { data } = await apiClient.put(`/addresses/${id}`, payload);
      return data.data as Address;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
    },
  });
};

export const useDeleteAddress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/addresses/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
    },
  });
};
