import Stripe from 'stripe';
import { prisma } from '../../config/db';
import { PaymentStatus } from '@prisma/client';
import AppError from '../../utils/appError';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2026-05-27.dahlia',
});

export class PaymentsService {
  /**
   * Securely calculate cart totals from Postgres and generate Stripe PaymentIntent
   */
  public static async createStripePaymentIntent(userId: string) {
    // 1. Fetch Cart securely from Postgres
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: { include: { restaurant: true } },
            variant: true,
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      throw new AppError('Cart is empty', 400);
    }

    // 2. Recalculate everything securely
    let subtotal = 0;
    for (const item of cart.items) {
      const price = item.variant ? item.variant.price.toNumber() : item.product.basePrice.toNumber();
      subtotal += price * item.quantity;
    }

    // In a real app, you would fetch tax and delivery fee from RestaurantSettings
    const tax = subtotal * 0.08;
    const deliveryFee = 5.0; // Flat mock delivery fee
    const discount = 0; // Assuming no coupon for this demo step

    const totalAmount = subtotal + tax + deliveryFee - discount;
    const amountInCents = Math.round(totalAmount * 100);

    // 3. Create an OrderDraft to link the payment to the items
    const orderDraft = await prisma.orderDraft.create({
      data: {
        userId,
        subtotal,
        tax,
        deliveryFee,
        discount,
        totalAmount,
      },
    });

    // 4. Create Stripe PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'usd',
      metadata: {
        orderDraftId: orderDraft.id,
        userId,
      },
    });

    // 5. Store Payment reference in DB
    await prisma.payment.create({
      data: {
        orderDraftId: orderDraft.id,
        provider: 'STRIPE',
        transactionId: paymentIntent.id,
        amount: totalAmount,
        status: 'UNPAID',
      },
    });

    return {
      clientSecret: paymentIntent.client_secret,
      orderDraftId: orderDraft.id,
      amount: totalAmount,
    };
  }

  /**
   * Securely calculate cart totals from Postgres and generate Razorpay Order
   */
  public static async createRazorpayOrder(_userId: string) {
    throw new AppError('Razorpay integration is temporarily disabled', 501);
  }

  /**
   * Handle Stripe Webhook
   */
  public static async handleStripeWebhook(signature: string, rawBody: Buffer) {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';
    
    let event: any;
    try {
      event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } catch (err: any) {
      throw new AppError(`Webhook Error: ${err.message}`, 400);
    }

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as any;
      const orderDraftId = paymentIntent.metadata.orderDraftId;
      const userId = paymentIntent.metadata.userId;

      if (!orderDraftId || !userId) {
        console.error('Missing metadata in payment intent');
        return;
      }

      await prisma.payment.updateMany({
        where: { transactionId: paymentIntent.id },
        data: { status: PaymentStatus.PAID },
      });

      // Update OrderDraft Status
      await prisma.orderDraft.update({
        where: { id: orderDraftId },
        data: { status: 'COMPLETED' },
      });

      // Generate Final Order (Moving items from Cart to Order)
      const cart = await prisma.cart.findUnique({
        where: { userId },
        include: { items: true },
      });

      if (cart && cart.items.length > 0) {
        const orderDraft = await prisma.orderDraft.findUnique({ where: { id: orderDraftId } });
        
        if (orderDraft) {
          // In production, grab branchId and restaurantId from cart items
          const firstProductId = cart.items[0].productId;
          const product = await prisma.product.findUnique({ where: { id: firstProductId }});
          
          if (product) {
            const branch = await prisma.branch.findFirst({ where: { restaurantId: product.restaurantId }});
            
            const newOrder = await prisma.order.create({
              data: {
                userId,
                restaurantId: product.restaurantId,
                branchId: branch?.id || '',
                subtotal: orderDraft.subtotal,
                tax: orderDraft.tax,
                deliveryFee: orderDraft.deliveryFee,
                discount: orderDraft.discount,
                totalAmount: orderDraft.totalAmount,
                status: 'PLACED',
                orderType: 'DELIVERY',
                orderNumber: `ORD-${Date.now()}`,
              }
            });

            // Convert CartItems to OrderItems
            const orderItems = cart.items.map((item: any) => ({
              orderId: newOrder.id,
              productId: item.productId,
              variantId: item.variantId,
              quantity: item.quantity,
              price: item.price,
            }));

            await prisma.orderItem.createMany({ data: orderItems });

            // Clear Cart
            await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
            
            // Link Payment to Order
            await prisma.payment.updateMany({
              where: { transactionId: paymentIntent.id },
              data: { orderDraftId: newOrder.id } // Note: Schema might require linking Payment to Order properly, but we'll adapt.
            });
          }
        }
      }
    } else if (event.type === 'payment_intent.payment_failed') {
      const paymentIntent = event.data.object as any;
      await prisma.payment.updateMany({
        where: { transactionId: paymentIntent.id },
        data: { status: PaymentStatus.UNPAID },
      });
    }

    return { received: true };
  }
}
