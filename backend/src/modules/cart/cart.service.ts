import { prisma } from '../../config/db';
import CartEvent from '../../models/CartEvent';
import AppError from '../../utils/appError';
import logger from '../../utils/logger';

export class CartService {
  /**
   * Get user cart
   */
  public static async getCart(userId: string) {
    let cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                image: true,
                basePrice: true,
                restaurantId: true,
                restaurant: {
                  select: { name: true, slug: true },
                },
              },
            },
            variant: {
              select: {
                id: true,
                name: true,
                price: true,
              },
            },
          },
        },
      },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId },
        include: {
          items: { include: { product: { include: { restaurant: true } }, variant: true } },
        },
      });
    }

    return cart;
  }

  /**
   * Add item to cart
   */
  public static async addItem(
    userId: string,
    data: { productId: string; variantId?: string; quantity: number },
  ) {
    let cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) {
      cart = await prisma.cart.create({ data: { userId } });
    }

    // Verify product exists and get price
    const product = await prisma.product.findUnique({ where: { id: data.productId } });
    if (!product || !product.isAvailable) {
      throw new AppError('Product not found or unavailable', 404);
    }

    let price = product.basePrice;

    if (data.variantId) {
      const variant = await prisma.productVariant.findUnique({ where: { id: data.variantId } });
      if (!variant) {
        throw new AppError('Variant not found', 404);
      }
      price = variant.price;
    }

    // Check if item already exists in cart
    const existingItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId: data.productId,
        variantId: data.variantId || null,
      },
    });

    if (existingItem) {
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + data.quantity },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: data.productId,
          variantId: data.variantId,
          quantity: data.quantity,
          price,
        },
      });
    }

    // Log to MongoDB asynchronously
    CartEvent.create({
      userId,
      cartId: cart.id,
      productId: data.productId,
      variantId: data.variantId,
      action: 'ADD',
      quantity: data.quantity,
    }).catch((err) => logger.error('Failed to log cart event', err));

    return this.getCart(userId);
  }

  /**
   * Update item quantity
   */
  public static async updateItemQuantity(userId: string, itemId: string, quantity: number) {
    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) throw new AppError('Cart not found', 404);

    const item = await prisma.cartItem.findUnique({ where: { id: itemId } });
    if (!item || item.cartId !== cart.id) {
      throw new AppError('Item not found in cart', 404);
    }

    await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
    });

    CartEvent.create({
      userId,
      cartId: cart.id,
      productId: item.productId,
      variantId: item.variantId || undefined,
      action: 'UPDATE_QUANTITY',
      quantity,
    }).catch((err) => logger.error('Failed to log cart event', err));

    return this.getCart(userId);
  }

  /**
   * Remove item from cart
   */
  public static async removeItem(userId: string, itemId: string) {
    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) throw new AppError('Cart not found', 404);

    const item = await prisma.cartItem.findUnique({ where: { id: itemId } });
    if (!item || item.cartId !== cart.id) {
      throw new AppError('Item not found in cart', 404);
    }

    await prisma.cartItem.delete({ where: { id: itemId } });

    CartEvent.create({
      userId,
      cartId: cart.id,
      productId: item.productId,
      variantId: item.variantId || undefined,
      action: 'REMOVE',
    }).catch((err) => logger.error('Failed to log cart event', err));

    return this.getCart(userId);
  }

  /**
   * Clear cart
   */
  public static async clearCart(userId: string) {
    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) return { success: true };

    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

    CartEvent.create({
      userId,
      cartId: cart.id,
      productId: 'ALL',
      action: 'CLEAR',
    }).catch((err) => logger.error('Failed to log cart event', err));

    return this.getCart(userId);
  }

  /**
   * Merge local storage cart after login
   */
  public static async mergeCart(
    userId: string,
    items: Array<{ productId: string; variantId?: string; quantity: number }>,
  ) {
    let cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) {
      cart = await prisma.cart.create({ data: { userId } });
    }

    for (const item of items) {
      await this.addItem(userId, {
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
      }).catch((err) => logger.warn(`Failed to merge cart item ${item.productId}`, err));
    }

    return this.getCart(userId);
  }
}
