import { prisma } from '../../config/db';
import AppError from '../../utils/appError';
import {
  getBranchProductIds,
  isProductAvailableAtBranch,
} from '../../utils/branchMenu';

export class WishlistService {
  /**
   * Get paginated, filtered, and sorted wishlist items
   */
  public static async getWishlist(
    userId: string,
    query: Record<string, unknown>
  ) {
    const {
      page = 1,
      limit = 10,
      search = '',
      veg = '',
      category = '',
      sortBy = 'newest',
      branchId,
    } = query;

    const skip = (Number(page) - 1) * Number(limit);
    const where: Record<string, unknown> = { userId };
    const productWhere: Record<string, unknown> = { isAvailable: true };

    if (search) {
      productWhere.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (veg === 'true') productWhere.isVeg = true;
    else if (veg === 'false') productWhere.isVeg = false;

    if (category) {
      productWhere.category = {
        name: { contains: category, mode: 'insensitive' },
      };
    }

    where.product = productWhere;

    const totalItems = await prisma.wishlist.count({ where });

    let selectedBranch: { id: string; name: string } | null = null;
    let branchProductIds: string[] = [];
    if (branchId) {
      selectedBranch = await prisma.branch.findUnique({
        where: { id: branchId as string },
        select: { id: true, name: true },
      });
      if (selectedBranch) {
        branchProductIds = await getBranchProductIds(branchId as string);
      }
    }

    let orderBy: Record<string, unknown> = { createdAt: 'desc' };
    if (sortBy === 'oldest') orderBy = { createdAt: 'asc' };
    else if (sortBy === 'price_asc')
      orderBy = { product: { basePrice: 'asc' } };
    else if (sortBy === 'price_desc')
      orderBy = { product: { basePrice: 'desc' } };
    else if (sortBy === 'rating') orderBy = { product: { rating: 'desc' } };

    const items = await prisma.wishlist.findMany({
      where,
      include: {
        branch: { select: { id: true, name: true, city: true } },
        product: {
          include: {
            category: { select: { id: true, name: true, slug: true } },
            variants: {
              select: {
                id: true,
                name: true,
                price: true,
                isDefault: true,
                stock: true,
              },
            },
          },
        },
      },
      skip,
      take: Number(limit),
      orderBy,
    });

    const mappedItems = items.map((item) => {
      const isAvailableInBranch = selectedBranch
        ? branchProductIds.includes(item.menuItemId)
        : true;

      return {
        id: item.id,
        menuItemId: item.menuItemId,
        productId: item.menuItemId,
        branchId: item.branchId,
        savedBranch: item.branch,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        product: item.product,
        isAvailableInBranch,
        statusText: isAvailableInBranch
          ? 'Available'
          : `Currently unavailable in ${selectedBranch?.name || 'selected branch'}`,
      };
    });

    return {
      data: mappedItems,
      total: totalItems,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(totalItems / Number(limit)),
    };
  }

  public static async addToWishlist(
    userId: string,
    menuItemId: string,
    branchId: string
  ) {
    const product = await prisma.product.findUnique({
      where: { id: menuItemId },
    });
    if (!product) throw new AppError('Product not found', 404);

    const branch = await prisma.branch.findUnique({ where: { id: branchId } });
    if (!branch) throw new AppError('Branch not found', 404);

    const existing = await prisma.wishlist.findUnique({
      where: { userId_menuItemId_branchId: { userId, menuItemId, branchId } },
    });

    if (existing) {
      return {
        success: true,
        message: 'Item already in wishlist',
        data: existing,
      };
    }

    const created = await prisma.wishlist.create({
      data: { userId, menuItemId, branchId },
    });

    return { success: true, message: 'Added to wishlist', data: created };
  }

  public static async removeFromWishlist(userId: string, menuItemId: string) {
    const result = await prisma.wishlist.deleteMany({
      where: { userId, menuItemId },
    });
    if (result.count === 0)
      throw new AppError('Item not found in wishlist', 404);
    return { success: true, message: 'Removed from wishlist' };
  }

  public static async clearWishlist(userId: string) {
    await prisma.wishlist.deleteMany({ where: { userId } });
    return { success: true, message: 'Wishlist cleared successfully' };
  }

  private static async getAvailableWishlistItems(
    userId: string,
    branchId: string
  ) {
    const wishlistItems = await prisma.wishlist.findMany({
      where: { userId },
      include: { product: { include: { variants: true } } },
    });

    if (wishlistItems.length === 0) return [];

    const branchProductIds = await getBranchProductIds(branchId);
    return wishlistItems.filter((item) =>
      branchProductIds.includes(item.menuItemId)
    );
  }

  public static async moveToCart(userId: string, branchId: string) {
    let cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) cart = await prisma.cart.create({ data: { userId } });

    const branch = await prisma.branch.findUnique({ where: { id: branchId } });
    if (!branch) throw new AppError('Branch not found', 404);

    const availableItems = await this.getAvailableWishlistItems(
      userId,
      branchId
    );
    if (availableItems.length === 0) {
      return {
        success: false,
        message: 'No items in wishlist are available in the selected branch.',
      };
    }

    for (const item of availableItems) {
      const defaultVariant =
        item.product.variants.find((v) => v.isDefault) ||
        item.product.variants[0];
      const price = defaultVariant
        ? defaultVariant.price
        : item.product.basePrice;

      const existingCartItem = await prisma.cartItem.findFirst({
        where: {
          cartId: cart.id,
          productId: item.menuItemId,
          variantId: defaultVariant?.id || null,
        },
      });

      if (existingCartItem) {
        await prisma.cartItem.update({
          where: { id: existingCartItem.id },
          data: { quantity: existingCartItem.quantity + 1 },
        });
      } else {
        await prisma.cartItem.create({
          data: {
            cartId: cart.id,
            productId: item.menuItemId,
            variantId: defaultVariant?.id || null,
            quantity: 1,
            price,
          },
        });
      }

      await prisma.wishlist.delete({ where: { id: item.id } });
    }

    return {
      success: true,
      message: `Successfully moved ${availableItems.length} items to cart.`,
      movedCount: availableItems.length,
    };
  }

  public static async addAllToCart(userId: string, branchId: string) {
    let cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) cart = await prisma.cart.create({ data: { userId } });

    const branch = await prisma.branch.findUnique({ where: { id: branchId } });
    if (!branch) throw new AppError('Branch not found', 404);

    const availableItems = await this.getAvailableWishlistItems(
      userId,
      branchId
    );
    if (availableItems.length === 0) {
      return {
        success: false,
        message: 'No items in wishlist are available in the selected branch.',
      };
    }

    for (const item of availableItems) {
      const defaultVariant =
        item.product.variants.find((v) => v.isDefault) ||
        item.product.variants[0];
      const price = defaultVariant
        ? defaultVariant.price
        : item.product.basePrice;

      const existingCartItem = await prisma.cartItem.findFirst({
        where: {
          cartId: cart.id,
          productId: item.menuItemId,
          variantId: defaultVariant?.id || null,
        },
      });

      if (existingCartItem) {
        await prisma.cartItem.update({
          where: { id: existingCartItem.id },
          data: { quantity: existingCartItem.quantity + 1 },
        });
      } else {
        await prisma.cartItem.create({
          data: {
            cartId: cart.id,
            productId: item.menuItemId,
            variantId: defaultVariant?.id || null,
            quantity: 1,
            price,
          },
        });
      }
    }

    return {
      success: true,
      message: `Successfully added ${availableItems.length} items to cart.`,
      addedCount: availableItems.length,
    };
  }

  public static async getWishlistSummary(userId: string) {
    const count = await prisma.wishlist.count({ where: { userId } });

    const recentlySaved = await prisma.wishlist.findMany({
      where: { userId },
      include: {
        product: {
          select: { id: true, name: true, image: true, basePrice: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 4,
    });

    const allSaved = await prisma.wishlist.findMany({
      where: { userId },
      include: { product: { include: { category: true } } },
    });

    const categoryCounts: Record<string, number> = {};
    const itemCounts: Record<
      string,
      { count: number; name: string; image: string | null }
    > = {};

    allSaved.forEach((item) => {
      const catName = item.product.category.name;
      categoryCounts[catName] = (categoryCounts[catName] || 0) + 1;

      const pId = item.menuItemId;
      if (!itemCounts[pId]) {
        itemCounts[pId] = {
          count: 0,
          name: item.product.name,
          image: item.product.image,
        };
      }
      itemCounts[pId].count += 1;
    });

    const favoriteCategories = Object.keys(categoryCounts)
      .map((name) => ({ name, count: categoryCounts[name] }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);

    let mostSavedItem = null;
    let maxItemCount = 0;
    for (const pId of Object.keys(itemCounts)) {
      if (itemCounts[pId].count > maxItemCount) {
        maxItemCount = itemCounts[pId].count;
        mostSavedItem = {
          id: pId,
          name: itemCounts[pId].name,
          image: itemCounts[pId].image,
          count: itemCounts[pId].count,
        };
      }
    }

    return {
      count,
      favoriteCategories,
      mostSavedItem,
      recentlySaved: recentlySaved.map((item) => item.product),
    };
  }
}
