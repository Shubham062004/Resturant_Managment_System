export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
}

export const mockCategories: Category[] = [
  {
    id: 'cat_pizza',
    name: 'Pizza',
    slug: 'pizza',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=150&auto=format&fit=crop&q=60',
  },
  {
    id: 'cat_burgers',
    name: 'Burgers',
    slug: 'burgers',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=150&auto=format&fit=crop&q=60',
  },
  {
    id: 'cat_chinese',
    name: 'Chinese',
    slug: 'chinese',
    image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=150&auto=format&fit=crop&q=60',
  },
  {
    id: 'cat_desserts',
    name: 'Desserts',
    slug: 'desserts',
    image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=150&auto=format&fit=crop&q=60',
  },
  {
    id: 'cat_drinks',
    name: 'Drinks',
    slug: 'drinks',
    image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=150&auto=format&fit=crop&q=60',
  },
];

export default mockCategories;
