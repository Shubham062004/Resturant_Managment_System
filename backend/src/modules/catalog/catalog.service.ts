import { prisma } from '../../config/db';
import AppError from '../../utils/appError';
import ProductViewEvent from '../../models/ProductViewEvent';
import SearchAnalytic from '../../models/SearchAnalytic';
import RecommendationEvent from '../../models/RecommendationEvent';
import logger from '../../utils/logger';

export class CatalogService {
  /**
   * Get paginated list of restaurants with filtering and sorting options
   */
  public static async getRestaurants(filters: {
    search?: string;
    rating?: number;
    veg?: boolean;
    openNow?: boolean;
    sortBy?: 'popularity' | 'rating' | 'name';
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
  }) {
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

    // Build Prisma query condition
    const where: any = {
      status: 'ACTIVE',
    };

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters.rating) {
      where.rating = { gte: filters.rating };
    }

    // If veg filter is enabled, find restaurants that sell at least one vegetarian product
    if (filters.veg) {
      where.products = {
        some: {
          isVeg: true,
          isAvailable: true,
        },
      };
    }

    // Determine sorting options
    let orderBy: any = {};
    const sortField = filters.sortBy || 'popularity';
    const sortOrder = filters.sortOrder || 'desc';

    if (sortField === 'rating') {
      orderBy = { rating: sortOrder };
    } else if (sortField === 'name') {
      orderBy = { name: sortOrder };
    } else {
      // default: popularity (can be sorted by rating or createdAt since no ordering count is tracked yet)
      orderBy = { rating: sortOrder };
    }

    // Get total count
    const total = await prisma.restaurant.count({ where });

    // Fetch restaurants along with branches
    let restaurants = await prisma.restaurant.findMany({
      where,
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        logo: true,
        coverImage: true,
        rating: true,
        status: true,
        branches: {
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            openingTime: true,
            closingTime: true,
            isActive: true,
          },
        },
      },
      orderBy,
      skip,
      take: limit,
    });

    // If openNow filter is enabled, check current system time against branch opening/closing hours
    if (filters.openNow) {
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();

      const parseTimeToMinutes = (timeStr: string): number => {
        // Example time strings: "08:00 AM", "11:30 PM"
        const match = timeStr.match(/^(\d+):(\d+)\s*(AM|PM)$/i);
        if (!match) return 0;
        let hours = parseInt(match[1], 10);
        const minutes = parseInt(match[2], 10);
        const ampm = match[3].toUpperCase();

        if (ampm === 'PM' && hours !== 12) hours += 12;
        if (ampm === 'AM' && hours === 12) hours = 0;

        return hours * 60 + minutes;
      };

      restaurants = restaurants.filter((restaurant) => {
        return restaurant.branches.some((branch) => {
          const openMins = parseTimeToMinutes(branch.openingTime);
          const closeMins = parseTimeToMinutes(branch.closingTime);
          if (closeMins > openMins) {
            return currentMinutes >= openMins && currentMinutes <= closeMins;
          } else {
            // Overnights (e.g. 11:00 PM to 02:00 AM)
            return currentMinutes >= openMins || currentMinutes <= closeMins;
          }
        });
      });
    }

    const totalPages = Math.ceil(total / limit);

    return {
      restaurants,
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  /**
   * Get restaurant by ID
   */
  public static async getRestaurantById(id: string) {
    const restaurant = await prisma.restaurant.findUnique({
      where: { id },
      include: {
        branches: { where: { isActive: true } },
        categories: { where: { isActive: true }, orderBy: { sortOrder: 'asc' } },
        products: { where: { isAvailable: true }, include: { variants: true } },
      },
    });

    if (!restaurant) {
      throw new AppError('Restaurant not found', 404);
    }

    return restaurant;
  }

  /**
   * Get restaurant by slug
   */
  public static async getRestaurantBySlug(slug: string) {
    const restaurant = await prisma.restaurant.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        logo: true,
        coverImage: true,
        rating: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        branches: {
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            address: true,
            city: true,
            state: true,
            openingTime: true,
            closingTime: true,
            isActive: true,
          },
        },
        categories: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            image: true,
            sortOrder: true,
          },
        },
        products: {
          where: { isAvailable: true },
          take: 50,
          select: {
            id: true,
            name: true,
            slug: true,
            shortDescription: true,
            basePrice: true,
            rating: true,
            isVeg: true,
            featured: true,
            image: true,
            gallery: true,
            categoryId: true,
            category: {
              select: { id: true, name: true, slug: true },
            },
            variants: {
              select: {
                id: true,
                name: true,
                price: true,
                isDefault: true,
              },
            },
          },
        },
      },
    });

    if (!restaurant) {
      throw new AppError('Restaurant not found', 404);
    }

    return restaurant;
  }

  /**
   * Get branches
   */
  public static async getBranches(filters: {
    restaurantId?: string;
    page?: number;
    limit?: number;
  }) {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    const where: { isActive: boolean; restaurantId?: string } = { isActive: true };
    if (filters.restaurantId) {
      where.restaurantId = filters.restaurantId;
    }

    const [branches, total] = await prisma.$transaction([
      prisma.branch.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          address: true,
          city: true,
          state: true,
          openingTime: true,
          closingTime: true,
          isActive: true,
          restaurant: {
            select: {
              id: true,
              name: true,
              slug: true,
              logo: true,
            },
          },
        },
      }),
      prisma.branch.count({ where }),
    ]);

    return {
      branches,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get active categories
   */
  public static async getCategories(filters: {
    restaurantId?: string;
    page?: number;
    limit?: number;
  }) {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    const where: { isActive: boolean; restaurantId?: string } = { isActive: true };
    if (filters.restaurantId) {
      where.restaurantId = filters.restaurantId;
    }

    const [categories, total] = await prisma.$transaction([
      prisma.category.findMany({
        where,
        orderBy: { sortOrder: 'asc' },
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          image: true,
          sortOrder: true,
          restaurantId: true,
        },
      }),
      prisma.category.count({ where }),
    ]);

    return {
      categories,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get category by slug or ID
   */
  public static async getCategoryBySlug(slug: string, restaurantId?: string) {
    const where: any = { slug };
    if (restaurantId) {
      where.restaurantId = restaurantId;
    }

    const category = await prisma.category.findFirst({
      where,
      include: {
        products: {
          where: { isAvailable: true },
          include: {
            variants: true,
            restaurant: true,
          },
        },
      },
    });

    if (!category) {
      throw new AppError('Category not found', 404);
    }

    return category;
  }

  /**
   * Fetch products with multi-criteria filters & record searches in MongoDB
   */
  public static async getProducts(
    filters: {
      search?: string;
      restaurantId?: string;
      categoryId?: string;
      isVeg?: boolean;
      minPrice?: number;
      maxPrice?: number;
      sortBy?: 'price' | 'rating' | 'name';
      sortOrder?: 'asc' | 'desc';
      page?: number;
      limit?: number;
    },
    userId?: string,
  ) {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {
      isAvailable: true,
    };

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
        { shortDescription: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters.restaurantId) {
      where.restaurantId = filters.restaurantId;
    }

    if (filters.categoryId) {
      where.categoryId = filters.categoryId;
    }

    if (filters.isVeg !== undefined) {
      where.isVeg = filters.isVeg;
    }

    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      where.basePrice = {};
      if (filters.minPrice !== undefined) {
        where.basePrice.gte = filters.minPrice;
      }
      if (filters.maxPrice !== undefined) {
        where.basePrice.lte = filters.maxPrice;
      }
    }

    let orderBy: any = {};
    const sortField = filters.sortBy || 'name';
    const sortOrder = filters.sortOrder || 'asc';

    if (sortField === 'price') {
      orderBy = { basePrice: sortOrder };
    } else if (sortField === 'rating') {
      orderBy = { rating: sortOrder };
    } else {
      orderBy = { name: sortOrder };
    }

    const total = await prisma.product.count({ where });

    const products = await prisma.product.findMany({
      where,
      include: {
        variants: true,
        restaurant: true,
        category: true,
      },
      orderBy,
      skip,
      take: limit,
    });

    // Trigger asynchronous logging to MongoDB for Search Analytics
    if (filters.search) {
      SearchAnalytic.create({
        query: filters.search,
        userId: userId || null,
        resultsCount: total,
        timestamp: new Date(),
      }).catch((err) => logger.error('MongoDB search analytics logging failed:', err));
    }

    const totalPages = Math.ceil(total / limit);

    return {
      products,
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  /**
   * Fetch featured products
   */
  public static async getFeaturedProducts() {
    return prisma.product.findMany({
      where: {
        featured: true,
        isAvailable: true,
      },
      include: {
        variants: true,
        restaurant: true,
      },
      take: 10,
    });
  }

  /**
   * Retrieve Product Detail, log View event, load reviews & recommendations
   */
  public static async getProductBySlug(slug: string, userId?: string) {
    const product = await prisma.product.findFirst({
      where: { slug, isAvailable: true },
      include: {
        variants: true,
        category: true,
        restaurant: true,
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    // Logging Product View Event asynchronously
    ProductViewEvent.create({
      userId: userId || null,
      productId: product.id,
      restaurantId: product.restaurantId,
      timestamp: new Date(),
    }).catch((err) => logger.error('MongoDB product view event logging failed:', err));

    // Get Recommendations: items in same category, up to 5 items (excluding current item)
    const recommendations = await prisma.product.findMany({
      where: {
        categoryId: product.categoryId,
        id: { not: product.id },
        isAvailable: true,
      },
      include: {
        variants: true,
        restaurant: true,
      },
      take: 5,
    });

    // Logging Recommendation Impressions in MongoDB asynchronously
    if (recommendations.length > 0) {
      const records = recommendations.map((rec) => ({
        userId: userId || null,
        productId: product.id,
        recommendedProductId: rec.id,
        eventType: 'IMPRESSION' as const,
        timestamp: new Date(),
      }));

      RecommendationEvent.insertMany(records).catch((err) =>
        logger.error('MongoDB recommendation events logging failed:', err),
      );
    }

    return {
      product,
      recommendations,
    };
  }

  /**
   * Record recommendation click in MongoDB
   */
  public static async trackRecommendationClick(
    productId: string,
    recommendedProductId: string,
    userId?: string,
  ) {
    await RecommendationEvent.create({
      userId: userId || null,
      productId,
      recommendedProductId,
      eventType: 'CLICK',
      timestamp: new Date(),
    }).catch((err) => logger.error('MongoDB recommendation click logging failed:', err));

    return { success: true };
  }

  /**
   * Reviews: Add product review and recalculate ratings
   */
  public static async createReview(
    userId: string,
    data: {
      productId: string;
      rating: number;
      comment: string;
    },
  ) {
    // Verify product exists
    const product = await prisma.product.findUnique({
      where: { id: data.productId },
    });

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    // Check if user already reviewed this product
    const existingReview = await prisma.review.findFirst({
      where: {
        productId: data.productId,
        userId,
      },
    });

    if (existingReview) {
      throw new AppError('You have already submitted a review for this product.', 400);
    }

    const review = await prisma.review.create({
      data: {
        productId: data.productId,
        userId,
        rating: data.rating,
        comment: data.comment,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    });

    // Recalculate rating averages for Product and Restaurant
    await this.updateRatingAverages(data.productId, product.restaurantId);

    return review;
  }

  /**
   * Reviews: Edit review details
   */
  public static async updateReview(
    userId: string,
    reviewId: string,
    data: {
      rating?: number;
      comment?: string;
    },
  ) {
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      include: { product: true },
    });

    if (!review) {
      throw new AppError('Review not found', 404);
    }

    if (review.userId !== userId) {
      throw new AppError('Unauthorized. You can only modify your own reviews.', 403);
    }

    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data: {
        rating: data.rating !== undefined ? data.rating : undefined,
        comment: data.comment !== undefined ? data.comment : undefined,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    });

    // Recalculate rating averages
    await this.updateRatingAverages(review.productId, review.product.restaurantId);

    return updatedReview;
  }

  /**
   * Reviews: Delete review
   */
  public static async deleteReview(userId: string, reviewId: string) {
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      include: { product: true },
    });

    if (!review) {
      throw new AppError('Review not found', 404);
    }

    if (review.userId !== userId) {
      throw new AppError('Unauthorized. You can only delete your own reviews.', 403);
    }

    await prisma.review.delete({
      where: { id: reviewId },
    });

    // Recalculate rating averages
    await this.updateRatingAverages(review.productId, review.product.restaurantId);

    return { success: true };
  }

  /**
   * Get reviews by product ID
   */
  public static async getReviewsByProductId(
    productId: string,
    filters: { page?: number; limit?: number } = {},
  ) {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    const where = { productId };

    const [reviews, total] = await prisma.$transaction([
      prisma.review.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          rating: true,
          comment: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.review.count({ where }),
    ]);

    return {
      reviews,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Manage User Favorites
   */
  public static async toggleFavorite(userId: string, productId: string) {
    // Verify product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });

    if (existingFavorite) {
      await prisma.favorite.delete({
        where: {
          id: existingFavorite.id,
        },
      });
      return { favorited: false, message: 'Removed from favorites' };
    } else {
      await prisma.favorite.create({
        data: {
          userId,
          productId,
        },
      });
      return { favorited: true, message: 'Added to favorites' };
    }
  }

  /**
   * Get User Favorites list
   */
  public static async getFavorites(
    userId: string,
    filters: { page?: number; limit?: number } = {},
  ) {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    const where = { userId };

    const [favorites, total] = await prisma.$transaction([
      prisma.favorite.findMany({
        where,
        skip,
        take: limit,
        select: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              shortDescription: true,
              basePrice: true,
              rating: true,
              isVeg: true,
              image: true,
              gallery: true,
              variants: {
                select: {
                  id: true,
                  name: true,
                  price: true,
                  isDefault: true,
                },
              },
              restaurant: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  logo: true,
                },
              },
            },
          },
        },
      }),
      prisma.favorite.count({ where }),
    ]);

    return {
      products: favorites.map((fav) => fav.product),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Recalculate product rating average & restaurant rating average
   */
  private static async updateRatingAverages(productId: string, restaurantId: string) {
    try {
      // 1. Recalculate Product average rating
      const productReviews = await prisma.review.aggregate({
        where: { productId },
        _avg: { rating: true },
        _count: { id: true },
      });

      const avgProductRating = productReviews._avg.rating || 0;

      await prisma.product.update({
        where: { id: productId },
        data: {
          rating: parseFloat(avgProductRating.toFixed(1)),
        },
      });

      // 2. Recalculate Restaurant average rating (average of its products' ratings)
      const restaurantProducts = await prisma.product.aggregate({
        where: { restaurantId, isAvailable: true },
        _avg: { rating: true },
      });

      const avgRestaurantRating = restaurantProducts._avg.rating || 0;

      await prisma.restaurant.update({
        where: { id: restaurantId },
        data: {
          rating: parseFloat(avgRestaurantRating.toFixed(1)),
        },
      });
    } catch (err) {
      logger.error('Failed to update rating averages for product/restaurant:', err);
    }
  }
}
