import { Router } from 'express';
import jwt from 'jsonwebtoken';
import env from '../../config/env';
import { CatalogController } from './catalog.controller';
import { authGuard } from '../../middleware/authGuard';
import { validate } from '../../middleware/validate';
import { sanitizeInput } from '../../middleware/sanitize';
import { DecodedToken } from '../../middleware/authGuard';
import {
  restaurantQuerySchema,
  productQuerySchema,
  createReviewSchema,
  updateReviewSchema,
  favoriteToggleSchema,
} from './catalog.validation';

const router = Router();

// Apply sanitization globally for catalog routes
router.use(sanitizeInput);

// Helper middleware to optionally resolve authenticated user credentials (for logging search/view events)
const optionalAuth = (req: any, res: any, next: any) => {
  try {
    let token: string | undefined;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (token) {
      const decoded = jwt.verify(token, env.JWT_SECRET) as DecodedToken;
      req.user = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
      };
    }
  } catch {
    // Gracefully bypass if token is invalid or expired
  }
  next();
};

// Restaurant endpoints
router.get(
  '/restaurants',
  validate({ query: restaurantQuerySchema }),
  CatalogController.getRestaurants,
);
router.get('/restaurants/slug/:slug', CatalogController.getRestaurantBySlug);
router.get('/restaurants/:id', CatalogController.getRestaurantById);

// Branch endpoints
router.get('/branches', CatalogController.getBranches);

// Category endpoints
router.get('/categories', CatalogController.getCategories);
router.get('/categories/slug/:slug', CatalogController.getCategoryBySlug);

// Product endpoints
router.get(
  '/products',
  optionalAuth,
  validate({ query: productQuerySchema }),
  CatalogController.getProducts,
);
router.get('/products/featured', CatalogController.getFeaturedProducts);
router.get('/products/slug/:slug', optionalAuth, CatalogController.getProductBySlug);
router.post(
  '/products/recommendations/click',
  optionalAuth,
  CatalogController.trackRecommendationClick,
);

// Review endpoints (Authenticated)
router.post(
  '/reviews',
  authGuard,
  validate({ body: createReviewSchema }),
  CatalogController.createReview,
);
router.put(
  '/reviews/:id',
  authGuard,
  validate({ body: updateReviewSchema }),
  CatalogController.updateReview,
);
router.delete('/reviews/:id', authGuard, CatalogController.deleteReview);
router.get('/reviews/product/:productId', CatalogController.getReviewsByProductId);

// Favorites endpoints (Authenticated)
router.post(
  '/favorites',
  authGuard,
  validate({ body: favoriteToggleSchema }),
  CatalogController.toggleFavorite,
);
router.get('/favorites', authGuard, CatalogController.getFavorites);

export default router;
