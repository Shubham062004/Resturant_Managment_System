import mongoose from 'mongoose';
import CartEvent from '../../models/CartEvent';
import CheckoutEvent from '../../models/CheckoutEvent';
import SearchAnalytic from '../../models/SearchAnalytic';

export async function seedMongoDB(customerIds: string[]) {
  console.log('🌱 Seeding MongoDB (10,000 Analytics Events)...');

  // Clear existing
  await CartEvent.deleteMany({});
  await CheckoutEvent.deleteMany({});
  await SearchAnalytic.deleteMany({});

  const cartEvents = [];
  const checkoutEvents = [];

  // Generate 10000 realistic cart events across 12 months
  for (let i = 0; i < 10000; i++) {
    const eventDate = new Date();
    eventDate.setDate(eventDate.getDate() - Math.floor(Math.random() * 365));
    
    cartEvents.push({
      userId: customerIds[i % customerIds.length],
      cartId: `cart-${i % 500}`,
      productId: `prod-${i % 100}`,
      action: i % 10 === 0 ? 'REMOVE' : 'ADD',
      quantity: Math.floor(Math.random() * 3) + 1,
      createdAt: eventDate,
    });
  }

  // Generate 2000 checkout events
  for (let i = 0; i < 2000; i++) {
    const eventDate = new Date();
    eventDate.setDate(eventDate.getDate() - Math.floor(Math.random() * 365));
    
    checkoutEvents.push({
      orderId: `ord-${i}`,
      userId: customerIds[i % customerIds.length],
      cartId: `cart-${i % 500}`,
      totalAmount: Math.random() * 100 + 20,
      paymentMethod: i % 2 === 0 ? 'STRIPE' : 'CASH',
      status: i % 20 === 0 ? 'FAILED' : 'SUCCESS',
      createdAt: eventDate,
    });
  }

  // Search Analytics
  const searchTerms = ['vegan pizza', 'spicy burger', 'garlic bread', 'coke', 'pasta', 'gluten free', 'wings'];
  const searchAnalytics = searchTerms.map(term => ({
    term,
    count: Math.floor(Math.random() * 5000) + 100,
    uniqueUsers: Math.floor(Math.random() * 1000) + 50,
    lastSearchedAt: new Date()
  }));

  await CartEvent.insertMany(cartEvents);
  await CheckoutEvent.insertMany(checkoutEvents);
  await SearchAnalytic.insertMany(searchAnalytics);

  console.log(`✅ Inserted ${cartEvents.length} CartEvents, ${checkoutEvents.length} CheckoutEvents, and ${searchAnalytics.length} SearchAnalytics.`);
}
