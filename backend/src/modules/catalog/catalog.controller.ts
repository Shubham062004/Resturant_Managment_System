import { Response, NextFunction } from 'express';

import { AuthRequest } from '../../types/express';

import { CatalogService } from './catalog.service';

export class CatalogController {
  public static async getRestaurants(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const filters = req.query as any;
      const result = await CatalogService.getRestaurants(filters);

      res.status(200).json({
        success: true,
        data: result.restaurants,
        meta: result.meta,
        message: 'Restaurants retrieved successfully.',
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getRestaurantById(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const restaurant = await CatalogService.getRestaurantById(id);

      res.status(200).json({
        success: true,
        data: restaurant,
        message: 'Restaurant retrieved successfully.',
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getRestaurantBySlug(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { slug } = req.params;
      const restaurant = await CatalogService.getRestaurantBySlug(slug);

      res.status(200).json({
        success: true,
        data: restaurant,
        message: 'Restaurant details retrieved successfully.',
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getBranches(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const filters = req.query as {
        restaurantId?: string;
        page?: number;
        limit?: number;
      };
      const result = await CatalogService.getBranches(filters);

      res.status(200).json({
        success: true,
        data: result.branches,
        meta: result.meta,
        message: 'Branches retrieved successfully.',
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getCategories(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const filters = req.query as {
        restaurantId?: string;
        page?: number;
        limit?: number;
      };
      const result = await CatalogService.getCategories(filters);

      res.status(200).json({
        success: true,
        data: result.categories,
        meta: result.meta,
        message: 'Categories retrieved successfully.',
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getCategoryBySlug(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { slug } = req.params;
      const { restaurantId } = req.query as { restaurantId?: string };
      const category = await CatalogService.getCategoryBySlug(
        slug,
        restaurantId
      );

      res.status(200).json({
        success: true,
        data: category,
        message: 'Category details and products retrieved successfully.',
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getProducts(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const filters = req.query as any;
      const userId = req.user?.id;
      const result = await CatalogService.getProducts(filters, userId);

      res.status(200).json({
        success: true,
        data: result.products,
        meta: result.meta,
        message: 'Products retrieved successfully.',
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getFeaturedProducts(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const products = await CatalogService.getFeaturedProducts();

      res.status(200).json({
        success: true,
        data: products,
        message: 'Featured products retrieved successfully.',
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getProductBySlug(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { slug } = req.params;
      const userId = req.user?.id;
      const result = await CatalogService.getProductBySlug(slug, userId);

      res.status(200).json({
        success: true,
        data: result.product,
        recommendations: result.recommendations,
        message:
          'Product details, reviews, and recommendations retrieved successfully.',
      });
    } catch (error) {
      next(error);
    }
  }

  public static async trackRecommendationClick(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { productId, recommendedProductId } = req.body;
      const userId = req.user?.id;
      await CatalogService.trackRecommendationClick(
        productId,
        recommendedProductId,
        userId
      );

      res.status(200).json({
        success: true,
        message: 'Recommendation click tracked successfully.',
      });
    } catch (error) {
      next(error);
    }
  }

  public static async createReview(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthenticated.' });
        return;
      }

      const review = await CatalogService.createReview(req.user.id, req.body);

      res.status(201).json({
        success: true,
        data: review,
        message: 'Review submitted successfully.',
      });
    } catch (error) {
      next(error);
    }
  }

  public static async updateReview(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthenticated.' });
        return;
      }

      const { id } = req.params;
      const review = await CatalogService.updateReview(
        req.user.id,
        id,
        req.body
      );

      res.status(200).json({
        success: true,
        data: review,
        message: 'Review updated successfully.',
      });
    } catch (error) {
      next(error);
    }
  }

  public static async deleteReview(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthenticated.' });
        return;
      }

      const { id } = req.params;
      await CatalogService.deleteReview(req.user.id, id);

      res.status(200).json({
        success: true,
        data: null,
        message: 'Review deleted successfully.',
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getReviewsByProductId(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { productId } = req.params;
      const filters = req.query as { page?: number; limit?: number };
      const result = await CatalogService.getReviewsByProductId(
        productId,
        filters
      );

      res.status(200).json({
        success: true,
        data: result.reviews,
        meta: result.meta,
        message: 'Reviews retrieved successfully.',
      });
    } catch (error) {
      next(error);
    }
  }

  public static async toggleFavorite(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthenticated.' });
        return;
      }

      const { productId } = req.body;
      const result = await CatalogService.toggleFavorite(
        req.user.id,
        productId
      );

      res.status(200).json({
        success: true,
        data: result,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getFavorites(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthenticated.' });
        return;
      }

      const filters = req.query as { page?: number; limit?: number };
      const result = await CatalogService.getFavorites(req.user.id, filters);

      res.status(200).json({
        success: true,
        data: result.products,
        meta: result.meta,
        message: 'Favorites retrieved successfully.',
      });
    } catch (error) {
      next(error);
    }
  }
}
