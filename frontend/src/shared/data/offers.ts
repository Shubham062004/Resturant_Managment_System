export interface Offer {
  id: string;
  title: string;
  description: string;
  code: string;
  discountPercentage: number;
  minOrderValue: number;
  expiryDate: string;
  bannerImage: string;
  active: boolean;
}

export const mockOffers: Offer[] = [
  {
    id: 'off_welcome50',
    title: '50% Welcome Discount',
    description: 'Get 50% off on your first order with ABC!',
    code: 'WELCOME50',
    discountPercentage: 50,
    minOrderValue: 20.0,
    expiryDate: '2026-12-31',
    bannerImage:
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&auto=format&fit=crop&q=60',
    active: true,
  },
  {
    id: 'off_pizza20',
    title: 'Pizza Party Deal',
    description: 'Craving pizza? Get 20% off all gourmet pizza catalog items.',
    code: 'PIZZAPARTY',
    discountPercentage: 20,
    minOrderValue: 15.0,
    expiryDate: '2026-08-31',
    bannerImage:
      'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=60',
    active: true,
  },
  {
    id: 'off_freedel',
    title: 'Free Delivery Weekend',
    description: 'Free delivery on all orders from featured local outlets.',
    code: 'FREEDELIVERY',
    discountPercentage: 100, // Used as delivery fee deduction indicator
    minOrderValue: 25.0,
    expiryDate: '2026-06-30',
    bannerImage:
      'https://images.unsplash.com/photo-1526367790999-0150786486a9?w=600&auto=format&fit=crop&q=60',
    active: true,
  },
];

export default mockOffers;
