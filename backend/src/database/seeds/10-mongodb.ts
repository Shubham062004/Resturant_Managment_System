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

  // Generate 10000 realistic cart events across May 2026
  for (let i = 0; i < 10000; i++) {
    const day = (i % 31) + 1;
    const eventDate = new Date(
      2026,
      4,
      day,
      Math.floor(Math.random() * 24),
      Math.floor(Math.random() * 60)
    );

    cartEvents.push({
      userId: customerIds[i % customerIds.length],
      cartId: `cart-${i % 500}`,
      productId: `prod-${i % 100}`,
      action: i % 10 === 0 ? 'REMOVE' : 'ADD',
      quantity: Math.floor(Math.random() * 3) + 1,
      timestamp: eventDate,
    });
  }

  // Generate 2000 checkout events across May 2026
  for (let i = 0; i < 2000; i++) {
    const day = (i % 31) + 1;
    const eventDate = new Date(
      2026,
      4,
      day,
      Math.floor(Math.random() * 24),
      Math.floor(Math.random() * 60)
    );

    checkoutEvents.push({
      userId: customerIds[i % customerIds.length],
      orderDraftId: `draft-${i}`,
      step: i % 20 === 0 ? 'PAYMENT_FAILED' : 'PAYMENT_COMPLETED',
      timestamp: eventDate,
      metadata: {
        totalAmount: Math.random() * 100 + 20,
        paymentMethod: i % 2 === 0 ? 'STRIPE' : 'CASH',
        cartId: `cart-${i % 500}`,
      },
    });
  }

  // Search Analytics
  const searchTerms = [
    'vegan pizza',
    'spicy burger',
    'garlic bread',
    'coke',
    'pasta',
    'gluten free',
    'wings',
  ];
  const searchAnalytics = [];
  for (let i = 0; i < 500; i++) {
    const term = searchTerms[i % searchTerms.length];
    const day = (i % 31) + 1;
    const eventDate = new Date(
      2026,
      4,
      day,
      Math.floor(Math.random() * 24),
      Math.floor(Math.random() * 60)
    );
    searchAnalytics.push({
      query: term,
      resultsCount: Math.floor(Math.random() * 20),
      timestamp: eventDate,
      userId: customerIds[i % customerIds.length],
    });
  }

  await CartEvent.insertMany(cartEvents);
  await CheckoutEvent.insertMany(checkoutEvents);
  await SearchAnalytic.insertMany(searchAnalytics);

  console.log(
    `✅ Inserted ${cartEvents.length} CartEvents, ${checkoutEvents.length} CheckoutEvents, and ${searchAnalytics.length} SearchAnalytics.`
  );
}
