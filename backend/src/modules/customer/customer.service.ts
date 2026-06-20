import { prisma } from '../../config/db';
import AppError from '../../utils/appError';

export class CustomerService {
  /**
   * Get all active branches from database
   */
  public static async getBranches() {
    return prisma.branch.findMany({
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
        latitude: true,
        longitude: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Get branch-specific menu — fetches ALL active products from the
   * same restaurant group the branch belongs to, sorted by featured first.
   * Replaces the old hardcoded branchMenuMap based on branch names.
   */
  public static async getBranchMenu(branchId: string) {
    const branch = await prisma.branch.findUnique({
      where: { id: branchId },
      include: { restaurant: true },
    });

    if (!branch) {
      throw new AppError('Branch not found', 404);
    }

    // Determine current isOpen status based on opening and closing time
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const parseTimeToMinutes = (timeStr: string): number => {
      const match = timeStr.match(/^(\d+):(\d+)\s*(AM|PM)?$/i);
      if (!match) return 0;
      let hours = parseInt(match[1], 10);
      const minutes = parseInt(match[2], 10);
      const ampm = match[3]?.toUpperCase();

      if (ampm === 'PM' && hours !== 12) hours += 12;
      if (ampm === 'AM' && hours === 12) hours = 0;

      return hours * 60 + minutes;
    };

    const openMins = parseTimeToMinutes(branch.openingTime);
    const closeMins = parseTimeToMinutes(branch.closingTime);
    let isOpen = false;
    if (closeMins > openMins) {
      isOpen = currentMinutes >= openMins && currentMinutes <= closeMins;
    } else {
      isOpen = currentMinutes >= openMins || currentMinutes <= closeMins;
    }

    // Compute average rating for this branch from orders & reviews
    const ratingAgg = await prisma.review.aggregate({
      where: {
        product: { restaurantId: branch.restaurantId },
      },
      _avg: { rating: true },
    });
    const branchRating = ratingAgg._avg.rating
      ? parseFloat(ratingAgg._avg.rating.toFixed(1))
      : 4.5;

    const branchDetails = {
      id: branch.id,
      name: branch.name,
      address: branch.address,
      city: branch.city,
      state: branch.state,
      openingTime: branch.openingTime,
      closingTime: branch.closingTime,
      rating: branchRating,
      deliveryTime: '25–35 mins',
      isOpen,
    };

    // Fetch all active products belonging to this branch's restaurant,
    // ordered by featured first, then by rating descending
    const products = await prisma.product.findMany({
      where: {
        restaurantId: branch.restaurantId,
        isAvailable: true,
      },
      include: {
        variants: {
          select: {
            id: true,
            name: true,
            price: true,
            isDefault: true,
            stock: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: [{ featured: 'desc' }, { rating: 'desc' }],
    });

    return {
      branch: branchDetails,
      menu: products,
    };
  }

  /**
   * Get branch-specific offers — fetches real active coupons from the
   * database. Replaces the old hardcoded branchOffersMap.
   */
  public static async getBranchOffers(branchId: string) {
    const branch = await prisma.branch.findUnique({
      where: { id: branchId },
    });

    if (!branch) {
      throw new AppError('Branch not found', 404);
    }

    const now = new Date();

    // Fetch all globally active coupons that haven't expired and haven't
    // hit their usage limit
    const coupons = await prisma.coupon.findMany({
      where: {
        active: true,
        startDate: { lte: now },
        endDate: { gte: now },
        OR: [
          { usageLimit: null },
          { usageLimit: { gt: prisma.coupon.fields.usedCount } },
        ],
      },
      orderBy: [{ discountValue: 'desc' }, { createdAt: 'desc' }],
      take: 20,
    });

    return coupons;
  }
}
