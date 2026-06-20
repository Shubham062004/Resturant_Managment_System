import { prisma } from '../../config/db';
import AppError from '../../utils/appError';

const branchMenuMap: Record<string, string[]> = {
  'Connaught Place': [
    'Classic Margherita Pizza',
    'Chef Special Supreme Pizza',
    'Veg Maharaja Burger',
    'Spicy Paneer Burger',
    'Kesar Mango Lassi',
    'Sizzling Hot Brownie',
    'Family Combo Pack Large',
  ],
  'Rajouri Garden': [
    'Spicy Paneer Burger',
    'Cheese Garlic Roll Wrap',
    'Iced Cold Coffee',
    'Veg Masala Noodles',
    'Schezwan Chilli Noodles',
    'Gulab Jamun Cup (2 Pcs)',
    'Executive Lunch Thali Box',
  ],
  'Saket': [
    'Classic Margherita Pizza',
    'Tandoori Paneer Pizza',
    'Kadhai Paneer Thali',
    'Shahi Paneer Masala',
    'Jeera Butter Rice',
    'Iced Cold Coffee',
    'Premium Butter Paneer Combo',
  ],
  'Dwarka': [
    'Veg Maharaja Burger',
    'Veg Masala Noodles',
    'Cheese Garlic Roll Wrap',
    'Spicy Veg Wrap',
    'Gulab Jamun Cup (2 Pcs)',
    'Kesar Mango Lassi',
    'Executive Lunch Thali Box',
  ],
  'Karol Bagh': [
    'Kadhai Paneer Thali',
    'Shahi Paneer Masala',
    'Paneer Tikka Biryani',
    'Jeera Butter Rice',
    'Classic Margherita Pizza',
    'Gulab Jamun Cup (2 Pcs)',
    'Sizzling Hot Brownie',
  ],
  'Lajpat Nagar': [
    'Spicy Veg Wrap',
    'Cheese Garlic Roll Wrap',
    'Spicy Paneer Burger',
    'Schezwan Chilli Noodles',
    'Iced Cold Coffee',
    'Kesar Mango Lassi',
    'Premium Butter Paneer Combo',
  ],
  'Vasant Kunj': [
    'Chef Special Supreme Pizza',
    'Tandoori Paneer Pizza',
    'Veg Maharaja Burger',
    'Paneer Tikka Biryani',
    'Sizzling Hot Brownie',
    'Family Combo Pack Large',
    'Executive Lunch Thali Box',
  ],
};

export class WishlistService {
  /**
   * Get paginated, filtered, and sorted wishlist items
   */
  public static async getWishlist(userId: string, query: any) {
    const {
      page = 1,
      limit = 10,
      search = '',
      veg = '', // 'true' or 'false'
      category = '',
      sortBy = 'newest', // newest, oldest, price_asc, price_desc, rating
      branchId, // currently selected branch for availability validation
    } = query;

    const skip = (Number(page) - 1) * Number(limit);

    // Build the query where clause
    const where: any = { userId };

    // Search and filters are applied to the relation product
    const productWhere: any = { isAvailable: true };

    if (search) {
      productWhere.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (veg === 'true') {
      productWhere.isVeg = true;
    } else if (veg === 'false') {
      productWhere.isVeg = false;
    }

    if (category) {
      productWhere.category = {
        name: { contains: category, mode: 'insensitive' }
      };
    }

    where.product = productWhere;

    // Fetch total count before pagination
    const totalItems = await prisma.wishlist.count({ where });

    // Fetch branch if provided to do availability validation
    let selectedBranch: any = null;
    if (branchId) {
      selectedBranch = await prisma.branch.findUnique({
        where: { id: branchId }
      });
    }

    // Sorting definition
    let orderBy: any = { createdAt: 'desc' };
    if (sortBy === 'newest') {
      orderBy = { createdAt: 'desc' };
    } else if (sortBy === 'oldest') {
      orderBy = { createdAt: 'asc' };
    } else if (sortBy === 'price_asc') {
      orderBy = { product: { basePrice: 'asc' } };
    } else if (sortBy === 'price_desc') {
      orderBy = { product: { basePrice: 'desc' } };
    } else if (sortBy === 'rating') {
      orderBy = { product: { rating: 'desc' } };
    }

    const items = await prisma.wishlist.findMany({
      where,
      include: {
        branch: {
          select: {
            id: true,
            name: true,
            city: true
          }
        },
        product: {
          include: {
            category: {
              select: {
                id: true,
                name: true,
                slug: true
              }
            },
            variants: {
              select: {
                id: true,
                name: true,
                price: true,
                isDefault: true,
                stock: true
              }
            }
          }
        }
      },
      skip,
      take: Number(limit),
      orderBy,
    });

    // Map items to include availability information
    const mappedItems = items.map((item) => {
      let isAvailableInBranch = true;

      if (selectedBranch) {
        const allowedNames = branchMenuMap[selectedBranch.name] || [];
        isAvailableInBranch = allowedNames.includes(item.product.name);
      }

      return {
        id: item.id,
        menuItemId: item.menuItemId,
        productId: item.menuItemId, // alias
        branchId: item.branchId,
        savedBranch: item.branch,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        product: item.product,
        isAvailableInBranch,
        statusText: isAvailableInBranch ? 'Available' : `Currently unavailable in ${selectedBranch?.name || 'selected branch'}`
      };
    });

    return {
      data: mappedItems,
      total: totalItems,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(totalItems / Number(limit))
    };
  }

  /**
   * Add item to wishlist
   */
  public static async addToWishlist(userId: string, menuItemId: string, branchId: string) {
    // Validate product exists
    const product = await prisma.product.findUnique({
      where: { id: menuItemId }
    });
    if (!product) {
      throw new AppError('Product not found', 404);
    }

    // Validate branch exists
    const branch = await prisma.branch.findUnique({
      where: { id: branchId }
    });
    if (!branch) {
      throw new AppError('Branch not found', 404);
    }

    // Create or find existing
    const existing = await prisma.wishlist.findUnique({
      where: {
        userId_menuItemId_branchId: {
          userId,
          menuItemId,
          branchId
        }
      }
    });

    if (existing) {
      return { success: true, message: 'Item already in wishlist', data: existing };
    }

    const created = await prisma.wishlist.create({
      data: {
        userId,
        menuItemId,
        branchId
      }
    });

    return { success: true, message: 'Added to wishlist', data: created };
  }

  /**
   * Remove item from wishlist
   */
  public static async removeFromWishlist(userId: string, menuItemId: string) {
    // Delete instances for this user and item
    const result = await prisma.wishlist.deleteMany({
      where: {
        userId,
        menuItemId
      }
    });

    if (result.count === 0) {
      throw new AppError('Item not found in wishlist', 404);
    }

    return { success: true, message: 'Removed from wishlist' };
  }

  /**
   * Clear user wishlist
   */
  public static async clearWishlist(userId: string) {
    await prisma.wishlist.deleteMany({
      where: { userId }
    });

    return { success: true, message: 'Wishlist cleared successfully' };
  }

  /**
   * Move available wishlist items to cart
   */
  public static async moveToCart(userId: string, branchId: string) {
    // Find user's cart (or create if doesn't exist)
    let cart = await prisma.cart.findUnique({
      where: { userId }
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId }
      });
    }

    // Get all wishlist items
    const wishlistItems = await prisma.wishlist.findMany({
      where: { userId },
      include: { product: { include: { variants: true } } }
    });

    if (wishlistItems.length === 0) {
      throw new AppError('Wishlist is empty', 400);
    }

    const selectedBranch = await prisma.branch.findUnique({
      where: { id: branchId }
    });
    if (!selectedBranch) {
      throw new AppError('Branch not found', 404);
    }

    const allowedNames = branchMenuMap[selectedBranch.name] || [];
    const availableItems = wishlistItems.filter((item) => allowedNames.includes(item.product.name));

    if (availableItems.length === 0) {
      return { success: false, message: 'No items in wishlist are available in the selected branch.' };
    }

    // Add each available item to the cart
    for (const item of availableItems) {
      const defaultVariant = item.product.variants.find(v => v.isDefault) || item.product.variants[0];
      const price = defaultVariant ? defaultVariant.price : item.product.basePrice;

      // Check if item already exists in cart
      const existingCartItem = await prisma.cartItem.findFirst({
        where: {
          cartId: cart.id,
          productId: item.menuItemId,
          variantId: defaultVariant?.id || null
        }
      });

      if (existingCartItem) {
        await prisma.cartItem.update({
          where: { id: existingCartItem.id },
          data: { quantity: existingCartItem.quantity + 1 }
        });
      } else {
        await prisma.cartItem.create({
          data: {
            cartId: cart.id,
            productId: item.menuItemId,
            variantId: defaultVariant?.id || null,
            quantity: 1,
            price
          }
        });
      }

      // Delete from wishlist
      await prisma.wishlist.delete({
        where: { id: item.id }
      });
    }

    return {
      success: true,
      message: `Successfully moved ${availableItems.length} items to cart.`,
      movedCount: availableItems.length
    };
  }

  /**
   * Add all available wishlist items to cart (keep in wishlist)
   */
  public static async addAllToCart(userId: string, branchId: string) {
    let cart = await prisma.cart.findUnique({
      where: { userId }
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId }
      });
    }

    const wishlistItems = await prisma.wishlist.findMany({
      where: { userId },
      include: { product: { include: { variants: true } } }
    });

    if (wishlistItems.length === 0) {
      throw new AppError('Wishlist is empty', 400);
    }

    const selectedBranch = await prisma.branch.findUnique({
      where: { id: branchId }
    });
    if (!selectedBranch) {
      throw new AppError('Branch not found', 404);
    }

    const allowedNames = branchMenuMap[selectedBranch.name] || [];
    const availableItems = wishlistItems.filter((item) => allowedNames.includes(item.product.name));

    if (availableItems.length === 0) {
      return { success: false, message: 'No items in wishlist are available in the selected branch.' };
    }

    for (const item of availableItems) {
      const defaultVariant = item.product.variants.find(v => v.isDefault) || item.product.variants[0];
      const price = defaultVariant ? defaultVariant.price : item.product.basePrice;

      const existingCartItem = await prisma.cartItem.findFirst({
        where: {
          cartId: cart.id,
          productId: item.menuItemId,
          variantId: defaultVariant?.id || null
        }
      });

      if (existingCartItem) {
        await prisma.cartItem.update({
          where: { id: existingCartItem.id },
          data: { quantity: existingCartItem.quantity + 1 }
        });
      } else {
        await prisma.cartItem.create({
          data: {
            cartId: cart.id,
            productId: item.menuItemId,
            variantId: defaultVariant?.id || null,
            quantity: 1,
            price
          }
        });
      }
    }

    return {
      success: true,
      message: `Successfully added ${availableItems.length} items to cart.`,
      addedCount: availableItems.length
    };
  }

  /**
   * Get customer dashboard wishlist summary metrics
   */
  public static async getWishlistSummary(userId: string) {
    const count = await prisma.wishlist.count({
      where: { userId }
    });

    const recentlySaved = await prisma.wishlist.findMany({
      where: { userId },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            image: true,
            basePrice: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 4
    });

    const allSaved = await prisma.wishlist.findMany({
      where: { userId },
      include: {
        product: {
          include: { category: true }
        }
      }
    });

    const categoryCounts: Record<string, number> = {};
    const itemCounts: Record<string, { count: number; name: string; image: string | null }> = {};

    allSaved.forEach((item) => {
      const catName = item.product.category.name;
      categoryCounts[catName] = (categoryCounts[catName] || 0) + 1;

      const pId = item.menuItemId;
      if (!itemCounts[pId]) {
        itemCounts[pId] = { count: 0, name: item.product.name, image: item.product.image };
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
          count: itemCounts[pId].count
        };
      }
    }

    return {
      count,
      favoriteCategories,
      mostSavedItem,
      recentlySaved: recentlySaved.map((item) => item.product)
    };
  }
}
