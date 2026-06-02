export interface Restaurant {
  id: string;
  name: string;
  rating: number;
  reviewsCount: number;
  categories: string[];
  distance: string;
  deliveryTime: string;
  minOrder: number;
  deliveryFee: number;
  image: string;
  featured: boolean;
}

export const mockRestaurants: Restaurant[] = [
  {
    id: 'res_firehouse',
    name: 'Oven Xpress - Firehouse',
    rating: 4.8,
    reviewsCount: 320,
    categories: ['Pizza', 'Burgers'],
    distance: '1.2 miles',
    deliveryTime: '20-30 min',
    minOrder: 15.0,
    deliveryFee: 1.99,
    image:
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&auto=format&fit=crop&q=60',
    featured: true,
  },
  {
    id: 'res_pizza_hearth',
    name: 'Pizza Hearth Kitchen',
    rating: 4.6,
    reviewsCount: 185,
    categories: ['Pizza'],
    distance: '2.5 miles',
    deliveryTime: '25-35 min',
    minOrder: 10.0,
    deliveryFee: 2.99,
    image:
      'https://images.unsplash.com/photo-1590947132387-155cc02f3212?w=500&auto=format&fit=crop&q=60',
    featured: true,
  },
  {
    id: 'res_beijing_bistro',
    name: 'Beijing Express Bistro',
    rating: 4.5,
    reviewsCount: 240,
    categories: ['Chinese'],
    distance: '3.1 miles',
    deliveryTime: '30-40 min',
    minOrder: 20.0,
    deliveryFee: 0.0,
    image:
      'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=500&auto=format&fit=crop&q=60',
    featured: false,
  },
  {
    id: 'res_sweet_spot',
    name: 'The Sweet Spot Patisserie',
    rating: 4.9,
    reviewsCount: 450,
    categories: ['Desserts', 'Drinks'],
    distance: '0.8 miles',
    deliveryTime: '15-25 min',
    minOrder: 8.0,
    deliveryFee: 1.49,
    image:
      'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=500&auto=format&fit=crop&q=60',
    featured: true,
  },
  {
    id: 'res_burger_lab',
    name: 'Burger Craft Lab',
    rating: 4.7,
    reviewsCount: 195,
    categories: ['Burgers'],
    distance: '1.9 miles',
    deliveryTime: '20-30 min',
    minOrder: 12.0,
    deliveryFee: 2.49,
    image:
      'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=60',
    featured: false,
  },
];

export default mockRestaurants;
