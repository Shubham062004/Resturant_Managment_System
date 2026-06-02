import { prisma } from '../config/db';
import { Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';

async function main() {
  console.log('Starting optimized seed operations...');

  // 1. Clean existing records (idempotent setup)
  console.log('Cleaning up existing database records...');
  await prisma.favorite.deleteMany();
  await prisma.review.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.branch.deleteMany();
  await prisma.restaurant.deleteMany();

  // Create active system user if not exists to associate reviews
  let mockUser = await prisma.user.findFirst({
    where: { email: 'customer@test.com' },
  });

  if (!mockUser) {
    mockUser = await prisma.user.create({
      data: {
        id: randomUUID(),
        email: 'customer@test.com',
        firstName: 'Marcus',
        lastName: 'Vance',
        role: 'CUSTOMER',
        isEmailVerified: true,
      },
    });
  }

  // Pre-generate arrays for bulk creation
  const restaurants: any[] = [];
  const branches: any[] = [];
  const categories: any[] = [];
  const products: any[] = [];
  const variants: any[] = [];
  const reviews: any[] = [];

  // 2. Restaurants Metadata Config
  const restaurantConfigs = [
    {
      name: 'Oven Xpress - Firehouse',
      slug: 'oven-xpress-firehouse',
      description: 'Ancient firebrick stone ovens baking artisan pizzas and gourmet burgers.',
      logo: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=100&auto=format&fit=crop&q=80',
      coverImage:
        'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80',
      rating: 4.8,
      address: '456 5th Ave',
      city: 'New York',
      state: 'NY',
      lat: 40.7527,
      lng: -73.9818,
      categories: ['Pizza', 'Burgers', 'Drinks'],
    },
    {
      name: 'Pizza Hearth Kitchen',
      slug: 'pizza-hearth-kitchen',
      description: 'Artisanal sourdough thin crust pizzas baked to perfection at 800°F.',
      logo: 'https://images.unsplash.com/photo-1590947132387-155cc02f3212?w=100&auto=format&fit=crop&q=80',
      coverImage:
        'https://images.unsplash.com/photo-1590947132387-155cc02f3212?w=800&auto=format&fit=crop&q=80',
      rating: 4.6,
      address: '78 Montague St',
      city: 'Brooklyn',
      state: 'NY',
      lat: 40.6942,
      lng: -73.9936,
      categories: ['Pizza', 'Appetizers', 'Drinks'],
    },
    {
      name: 'Beijing Express Bistro',
      slug: 'beijing-express-bistro',
      description: 'Fast, bold, and fresh Chinese wok favorites and street side delicacies.',
      logo: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=100&auto=format&fit=crop&q=80',
      coverImage:
        'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800&auto=format&fit=crop&q=80',
      rating: 4.5,
      address: '31-15 30th Ave',
      city: 'Astoria',
      state: 'NY',
      lat: 40.7675,
      lng: -73.9213,
      categories: ['Chinese', 'Appetizers', 'Drinks'],
    },
    {
      name: 'The Sweet Spot Patisserie',
      slug: 'the-sweet-spot-patisserie',
      description:
        'Gourmet French patisserie serving rich cakes, pastries, and specialty dessert coffees.',
      logo: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=100&auto=format&fit=crop&q=80',
      coverImage:
        'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=800&auto=format&fit=crop&q=80',
      rating: 4.9,
      address: '210 Hudson St',
      city: 'Jersey City',
      state: 'NJ',
      lat: 40.7186,
      lng: -74.0321,
      categories: ['Desserts', 'Drinks', 'Appetizers'],
    },
    {
      name: 'Burger Craft Lab',
      slug: 'burger-craft-lab',
      description: 'Gourmet dry-aged beef blends and custom hand-cut fry configurations.',
      logo: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=100&auto=format&fit=crop&q=80',
      coverImage:
        'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=80',
      rating: 4.7,
      address: '120 Broadway',
      city: 'New York',
      state: 'NY',
      lat: 40.7082,
      lng: -74.011,
      categories: ['Burgers', 'Appetizers', 'Drinks'],
    },
  ];

  // Templates for product generation (at least 20 items per restaurant = 100 products total)
  const productTemplates: Record<string, { names: string[]; images: string[] }> = {
    Pizza: {
      names: [
        'Classic Margherita',
        'Double Pepperoni',
        'Veggie Feast',
        'BBQ Chicken',
        'Hawaiian Lava',
        'Truffle Mushroom',
        'Fiery Jalapeno',
        'Four Cheese Special',
        'Meat Lovers Supreme',
        'Spicy Buffalo Pizza',
      ],
      images: [
        'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=500&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?w=500&auto=format&fit=crop&q=80',
      ],
    },
    Burgers: {
      names: [
        'Classic Cheese',
        'Double Bacon Stack',
        'Smoky BBQ Burger',
        'Spicy Avocado Crunch',
        'Swiss Mushroom Melt',
        'Crispy Chicken Club',
        'Vegas Truffle Patty',
        'Monster Beef Tower',
        'Garden Veggie Patty',
        'Aloha Teriyaki Burger',
      ],
      images: [
        'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=500&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1550547660-d9450f859349?w=500&auto=format&fit=crop&q=80',
      ],
    },
    Chinese: {
      names: [
        'General Tso Chicken',
        'Kung Pao Shrimp',
        'Szechuan Beef',
        'Sweet & Sour Pork',
        'Vegetable Lo Mein',
        'Egg Drop Soup',
        'Beijing Roast Duck',
        'Crispy Spring Rolls',
        'Orange Peel Chicken',
        'Steamed Dumplings',
      ],
      images: [
        'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=500&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=500&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500&auto=format&fit=crop&q=80',
      ],
    },
    Desserts: {
      names: [
        'Decadent Chocolate Fudge',
        'Classic New York Cheesecake',
        'Warm Apple Crisp',
        'Molten Lava Cookie',
        'Red Velvet Slice',
        'Strawberry Tart',
        'Tiramisu Cup',
        'Glazed Cinnamon Roll',
        'Matcha Mille Crepe',
        'Artisanal Gelato Scoop',
      ],
      images: [
        'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=500&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1587314168485-3236d6710814?w=500&auto=format&fit=crop&q=80',
      ],
    },
    Drinks: {
      names: [
        'Cold Brew Float',
        'Sparkling Lemonade',
        'Mango Passion Fruit Smoothie',
        'Iced Vanilla Latte',
        'Classic Milk Tea',
        'Hot Matcha Latte',
        'Craft Root Beer',
        'Sparkling Water Splash',
        'Fresh Orange Squeeze',
        'Spiced Chai Brew',
      ],
      images: [
        'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1497515114629-f71d768fd07c?w=500&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=500&auto=format&fit=crop&q=80',
      ],
    },
    Appetizers: {
      names: [
        'Mozzarella Stick Stack',
        'Garlic Sourdough Knots',
        'Cheesy Loaded Waffle Fries',
        'BBQ Chicken Wings',
        'Crispy Calamari Rings',
        'Spicy Jalapeno Poppers',
        'Sweet Potato Crisps',
        'Onion Ring Tower',
        'Stuffed Mushrooms',
        'Creamy Tomato Bruschetta',
      ],
      images: [
        'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=500&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1607532941433-304659e8198a?w=500&auto=format&fit=crop&q=80',
      ],
    },
  };

  for (const config of restaurantConfigs) {
    const restaurantId = randomUUID();
    restaurants.push({
      id: restaurantId,
      name: config.name,
      slug: config.slug,
      description: config.description,
      logo: config.logo,
      coverImage: config.coverImage,
      rating: config.rating,
    });

    branches.push({
      id: randomUUID(),
      restaurantId,
      name: `${config.name} - Head Branch`,
      address: config.address,
      city: config.city,
      state: config.state,
      latitude: config.lat,
      longitude: config.lng,
      openingTime: '08:00 AM',
      closingTime: '11:00 PM',
      deliveryRadius: 8.5,
    });

    let sortOrder = 1;
    for (const catName of config.categories) {
      const categoryId = randomUUID();
      const categorySlug = `${catName.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-')}`;

      categories.push({
        id: categoryId,
        restaurantId,
        name: catName,
        slug: categorySlug,
        description: `Gourmet select ${catName} dishes.`,
        sortOrder: sortOrder++,
      });

      const templates = productTemplates[catName];
      if (templates) {
        for (let i = 0; i < templates.names.length; i++) {
          const productId = randomUUID();
          const prodName = templates.names[i];
          const prodSlug = `${prodName.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-')}`;
          const basePrice = parseFloat((9.99 + i * 1.5).toFixed(2));
          const calories = 250 + i * 45;
          const prepTime = 10 + i * 2;
          const rating = parseFloat((4.0 + i * 0.1).toFixed(1));

          products.push({
            id: productId,
            restaurantId,
            categoryId,
            name: prodName,
            slug: prodSlug,
            description: `Freshly prepared chef spec ${prodName} using natural local ingredients.`,
            shortDescription: `Fresh and hot ${prodName}.`,
            image: templates.images[i % templates.images.length],
            gallery: [
              templates.images[i % templates.images.length],
              'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=500&auto=format&fit=crop&q=80',
            ],
            basePrice: new Prisma.Decimal(basePrice),
            rating,
            calories,
            preparationTime: prepTime,
            isVeg: i % 3 === 0,
            isAvailable: true,
            featured: i % 4 === 0,
          });

          if (catName === 'Pizza') {
            variants.push(
              {
                id: randomUUID(),
                productId,
                name: 'Small (10")',
                price: new Prisma.Decimal(basePrice),
                isDefault: true,
              },
              {
                id: randomUUID(),
                productId,
                name: 'Medium (12")',
                price: new Prisma.Decimal(basePrice + 3.0),
                isDefault: false,
              },
              {
                id: randomUUID(),
                productId,
                name: 'Large (14")',
                price: new Prisma.Decimal(basePrice + 6.0),
                isDefault: false,
              },
            );
          } else if (catName === 'Burgers') {
            variants.push(
              {
                id: randomUUID(),
                productId,
                name: 'Single Patty',
                price: new Prisma.Decimal(basePrice),
                isDefault: true,
              },
              {
                id: randomUUID(),
                productId,
                name: 'Double Patty',
                price: new Prisma.Decimal(basePrice + 2.5),
                isDefault: false,
              },
            );
          } else {
            variants.push({
              id: randomUUID(),
              productId,
              name: 'Regular',
              price: new Prisma.Decimal(basePrice),
              isDefault: true,
            });
          }

          reviews.push({
            id: randomUUID(),
            productId,
            userId: mockUser.id,
            rating: Math.min(5, Math.max(1, Math.round(rating))),
            comment: `Absolutely loved this dish! Highly recommended.`,
          });
        }
      }
    }
  }

  console.log('Inserting restaurants...');
  await prisma.restaurant.createMany({ data: restaurants });

  console.log('Inserting branches...');
  await prisma.branch.createMany({ data: branches });

  console.log('Inserting categories...');
  await prisma.category.createMany({ data: categories });

  console.log('Inserting products...');
  await prisma.product.createMany({ data: products });

  console.log('Inserting variants...');
  await prisma.productVariant.createMany({ data: variants });

  console.log('Inserting reviews...');
  await prisma.review.createMany({ data: reviews });

  console.log(
    `Bulk Seeding complete. Seeded ${restaurants.length} Restaurants and ${products.length} Products successfully.`,
  );
}

main()
  .catch((e) => {
    console.error('Error during seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
