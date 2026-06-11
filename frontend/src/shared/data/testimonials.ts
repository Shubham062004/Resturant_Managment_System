export interface Testimonial {
  id: string;
  name: string;
  role: string;
  rating: number;
  comment: string;
  avatar: string;
}

export const mockTestimonials: Testimonial[] = [
  {
    id: 'test_1',
    name: 'Marcus Vance',
    role: 'Loyal Customer',
    rating: 5,
    comment:
      'ABC has revolutionized our dinner schedules. The pizza is delivered burning hot, and the location detection was spot on!',
    avatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=60',
  },
  {
    id: 'test_2',
    name: 'Sarah Connor',
    role: 'Office Manager',
    rating: 5,
    comment:
      'We use the POS and delivery client for office lunches weekly. The Beijing Bistro Chinese selection is highly recommended!',
    avatar:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=60',
  },
  {
    id: 'test_3',
    name: 'Devon Miller',
    role: 'Food Blogger',
    rating: 4.8,
    comment:
      'The Burger Craft Lab selection has some of the best modifiers and recipes I have tasted. Rapid delivery and awesome customer layout.',
    avatar:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=60',
  },
];

export default mockTestimonials;
