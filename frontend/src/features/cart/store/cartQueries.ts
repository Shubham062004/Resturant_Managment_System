import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useAppSelector } from '../../../app/store';
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

const getSelectedBranchId = (): string => {
  try {
    const saved = localStorage.getItem('selectedBranch');
    if (saved) {
      const branch = JSON.parse(saved);
      return branch?.id || '';
    }
  } catch {
    // Ignore
  }
  return '';
};

export interface GuestCart {
  branchId: string;
  items: CartItem[];
  couponCode: string;
  cartTotals: {
    subtotal: number;
    discount: number;
    deliveryFee: number;
    gst: number;
    grandTotal: number;
  };
}

export const loadGuestCart = (): GuestCart => {
  const branchId = getSelectedBranchId();
  const guestCartJson = localStorage.getItem('guest_cart');
  if (guestCartJson) {
    try {
      const parsed = JSON.parse(guestCartJson);
      if (parsed && Array.isArray(parsed.items)) {
        return {
          branchId: parsed.branchId || branchId,
          items: parsed.items,
          couponCode: parsed.couponCode || '',
          cartTotals: parsed.cartTotals || {
            subtotal: 0,
            discount: 0,
            deliveryFee: 0,
            gst: 0,
            grandTotal: 0,
          },
        };
      }
    } catch {
      // Ignore
    }
  }
  return {
    branchId,
    items: [],
    couponCode: '',
    cartTotals: {
      subtotal: 0,
      discount: 0,
      deliveryFee: 0,
      gst: 0,
      grandTotal: 0,
    },
  };
};

export const saveGuestCart = (
  items: CartItem[],
  couponCode = '',
  discount = 0
) => {
  const branchId = getSelectedBranchId();
  const subtotal = items.reduce(
    (sum, item) => sum + parseFloat(item.price) * item.quantity,
    0
  );
  const deliveryFee = subtotal === 0 ? 0 : subtotal >= 200 ? 0 : 20;
  const taxableAmount = Math.max(0, subtotal - discount);
  const gst = taxableAmount * 0.05;
  const grandTotal = taxableAmount + deliveryFee + gst;

  const guestCart: GuestCart = {
    branchId,
    items,
    couponCode,
    cartTotals: {
      subtotal,
      discount,
      deliveryFee,
      gst,
      grandTotal,
    },
  };
  localStorage.setItem('guest_cart', JSON.stringify(guestCart));
  return guestCart;
};

export const applyGuestCoupon = (code: string, discount: number) => {
  const guest = loadGuestCart();
  saveGuestCart(guest.items, code, discount);
};

export const removeGuestCoupon = () => {
  const guest = loadGuestCart();
  saveGuestCart(guest.items, '', 0);
};

export const useCart = () => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  return useQuery({
    queryKey: ['cart', isAuthenticated],
    queryFn: async () => {
      if (!isAuthenticated) {
        const guest = loadGuestCart();
        return {
          id: 'guest-cart',
          items: guest.items,
          branchId: guest.branchId,
          couponCode: guest.couponCode,
          cartTotals: guest.cartTotals,
        } as any;
      }
      const { data } = await apiClient.get('/cart');
      return data.data as Cart;
    },
    retry: false,
  });
};

export const useAddToCart = () => {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  return useMutation({
    mutationFn: async (payload: {
      productId: string;
      variantId?: string;
      quantity: number;
      product?: Product & { restaurant?: { name: string; slug: string } };
      variant?: { id: string; name: string; price: string } | null;
    }) => {
      if (!isAuthenticated) {
        const guest = loadGuestCart();

        const price = payload.variant
          ? payload.variant.price
          : payload.product?.basePrice || '0';

        const existingItemIndex = guest.items.findIndex(
          (item) =>
            item.productId === payload.productId &&
            item.variantId === (payload.variantId || null)
        );

        if (existingItemIndex > -1) {
          guest.items[existingItemIndex].quantity += payload.quantity;
        } else {
          const newCartItem: CartItem = {
            id: `guest-item-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            cartId: 'guest-cart',
            productId: payload.productId,
            variantId: payload.variantId || null,
            quantity: payload.quantity,
            price: price.toString(),
            product: payload.product || {
              id: payload.productId,
              name: 'Item',
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
            variant: payload.variant || null,
          };
          guest.items.push(newCartItem);
        }

        const updated = saveGuestCart(
          guest.items,
          guest.couponCode,
          guest.cartTotals.discount
        );
        return {
          id: 'guest-cart',
          items: updated.items,
          branchId: updated.branchId,
          couponCode: updated.couponCode,
          cartTotals: updated.cartTotals,
        };
      }

      const { data } = await apiClient.post('/cart/items', {
        productId: payload.productId,
        variantId: payload.variantId,
        quantity: payload.quantity,
      });
      return data.data as Cart;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['cart', isAuthenticated], data);
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
};

export const useUpdateCartItem = () => {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  return useMutation({
    mutationFn: async ({ id, quantity }: { id: string; quantity: number }) => {
      if (!isAuthenticated) {
        const guest = loadGuestCart();
        const updatedItems = guest.items.map((item) =>
          item.id === id ? { ...item, quantity } : item
        );

        const updated = saveGuestCart(
          updatedItems,
          guest.couponCode,
          guest.cartTotals.discount
        );
        return {
          id: 'guest-cart',
          items: updated.items,
          branchId: updated.branchId,
          couponCode: updated.couponCode,
          cartTotals: updated.cartTotals,
        };
      }

      const { data } = await apiClient.put(`/cart/items/${id}`, { quantity });
      return data.data as Cart;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['cart', isAuthenticated], data);
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
};

export const useRemoveCartItem = () => {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  return useMutation({
    mutationFn: async (id: string) => {
      if (!isAuthenticated) {
        const guest = loadGuestCart();
        const updatedItems = guest.items.filter((item) => item.id !== id);

        const updated = saveGuestCart(
          updatedItems,
          guest.couponCode,
          guest.cartTotals.discount
        );
        return {
          id: 'guest-cart',
          items: updated.items,
          branchId: updated.branchId,
          couponCode: updated.couponCode,
          cartTotals: updated.cartTotals,
        };
      }

      const { data } = await apiClient.delete(`/cart/items/${id}`);
      return data.data as Cart;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['cart', isAuthenticated], data);
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
};

export const useClearCart = () => {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  return useMutation({
    mutationFn: async () => {
      if (!isAuthenticated) {
        const updated = saveGuestCart([], '', 0);
        return {
          id: 'guest-cart',
          items: updated.items,
          branchId: updated.branchId,
          couponCode: updated.couponCode,
          cartTotals: updated.cartTotals,
        };
      }

      const { data } = await apiClient.delete('/cart');
      return data.data as Cart;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['cart', isAuthenticated], data);
      queryClient.invalidateQueries({ queryKey: ['cart'] });
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
