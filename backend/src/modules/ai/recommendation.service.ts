import { prisma } from '../../config/db';

import { aiService } from './ai.service';

export class RecommendationService {
  /**
   * Fetch recommendations for a user.
   */
  public static async getFoodRecommendations(userId?: string) {
    // Generate mocked recommended products. In production, we'd query Prisma for order history
    // and pass it to aiService.generateCompletion()

    // Using a mock prompt for the architecture
    const prompt = `Generate 4 food recommendations for user ${userId || 'guest'}. Output as JSON array.`;
    await aiService.generateCompletion(prompt); // fire and forget log

    const products = await prisma.product.findMany({ take: 4 });
    return products.map((p) => ({
      product: p,
      reason: 'Based on your previous orders and favorites.',
      matchScore: Math.floor(Math.random() * 20) + 80, // 80-99%
    }));
  }

  /**
   * Fetch smart combo based on a cart items list.
   */
  public static async getSmartCombos(productIds: string[]) {
    if (!productIds || productIds.length === 0) return [];

    const prompt = `Generate a smart combo upsell for these product IDs: ${productIds.join(',')}.`;
    await aiService.generateCompletion(prompt);

    // Mock response: Just grab random products to upsell
    const upsellProducts = await prisma.product.findMany({ take: 2 });
    return {
      comboTitle: 'Complete your meal',
      discountPercentage: 10,
      items: upsellProducts,
    };
  }

  /**
   * Fetch trending items.
   */
  public static async getTrending() {
    const products = await prisma.product.findMany({
      take: 5,
      orderBy: { basePrice: 'desc' },
    }); // Mock logic
    return products.map((p) => ({
      product: p,
      trendReason: 'Trending in your city',
      score: 95,
    }));
  }
}
