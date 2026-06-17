import { Request, Response, NextFunction } from 'express';

import { aiService } from './ai.service';
import { ForecastingService } from './forecasting.service';
import { MarketingService } from './marketing.service';
import { RecommendationService } from './recommendation.service';

export class AIController {
  // --- Recommendations ---
  public static async getRecommendations(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = (req as any).user?.id; // If authenticated
      const recommendations =
        await RecommendationService.getFoodRecommendations(userId);
      res.status(200).json({ status: 'success', data: recommendations });
    } catch (error) {
      next(error);
    }
  }

  public static async getCombos(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const productIds = ((req.query.productIds as string) || '')
        .split(',')
        .filter(Boolean);
      const combos = await RecommendationService.getSmartCombos(productIds);
      res.status(200).json({ status: 'success', data: combos });
    } catch (error) {
      next(error);
    }
  }

  public static async getTrending(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const trending = await RecommendationService.getTrending();
      res.status(200).json({ status: 'success', data: trending });
    } catch (error) {
      next(error);
    }
  }

  // --- Chat Assistant ---
  public static async postChat(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { messages } = req.body;
      const response = await aiService.chat(messages);
      res.status(200).json({ status: 'success', data: { response } });
    } catch (error) {
      next(error);
    }
  }

  // --- Forecasting ---
  public static async getPredictions(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { branchId, type } = req.query; // type can be 'demand' or 'inventory'

      let data;
      if (type === 'inventory') {
        data = await ForecastingService.predictInventory(branchId as string);
      } else {
        data = await ForecastingService.predictDemand(branchId as string);
      }

      res.status(200).json({ status: 'success', data });
    } catch (error) {
      next(error);
    }
  }

  // --- Customer Segmentation ---
  public static async getCustomerSegment(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userIds = ((req.query.userIds as string) || '')
        .split(',')
        .filter(Boolean);
      const segments = await MarketingService.segmentCustomers(userIds);
      res.status(200).json({ status: 'success', data: segments });
    } catch (error) {
      next(error);
    }
  }
}
