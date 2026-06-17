import jwt from 'jsonwebtoken';
import request from 'supertest';
import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest';

import app from '../app';
import { prisma } from '../config/db';
import env from '../config/env';
import ProductViewEvent from '../models/ProductViewEvent';
import RecommendationEvent from '../models/RecommendationEvent';
import SearchAnalytic from '../models/SearchAnalytic';

// Mock DB configs and Prisma client queries
vi.mock('../config/db', () => ({
  prisma: {
    restaurant: {
      count: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    branch: {
      findMany: vi.fn(),
    },
    category: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
    },
    product: {
      count: vi.fn(),
      findMany: vi.fn(),
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      aggregate: vi.fn(),
    },
    review: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findMany: vi.fn(),
      aggregate: vi.fn(),
    },
    favorite: {
      findUnique: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
      findMany: vi.fn(),
    },
    restaurantGroup: {
      count: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
  connectDatabases: vi.fn(),
  disconnectDatabases: vi.fn(),
}));

// Mock MongoDB Mongoose Models
vi.spyOn(ProductViewEvent, 'create').mockReturnValue(
  Promise.resolve({}) as any
);
vi.spyOn(SearchAnalytic, 'create').mockReturnValue(Promise.resolve({}) as any);
vi.spyOn(RecommendationEvent, 'create').mockReturnValue(
  Promise.resolve({}) as any
);
vi.spyOn(RecommendationEvent, 'insertMany').mockReturnValue(
  Promise.resolve([]) as any
);

// Valid UUIDs for test fixtures
const PRODUCT_UUID = '550e8400-e29b-41d4-a716-446655440001';
const RESTAURANT_UUID = '550e8400-e29b-41d4-a716-446655440002';
const CATEGORY_UUID = '550e8400-e29b-41d4-a716-446655440003';
const REVIEW_UUID = '550e8400-e29b-41d4-a716-446655440004';
const FAVORITE_UUID = '550e8400-e29b-41d4-a716-446655440005';
const USER_UUID = '550e8400-e29b-41d4-a716-446655440006';

describe('Catalog API Integration Tests', () => {
  let mockToken: string;

  beforeAll(() => {
    // Generate valid JWT token for auth checks
    mockToken = jwt.sign(
      { id: USER_UUID, email: 'customer@test.com', role: 'CUSTOMER' },
      env.JWT_SECRET,
      { expiresIn: '1h' }
    );
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/v1/catalog/restaurants', () => {
    it('should retrieve a paginated list of active restaurants', async () => {
      (prisma.restaurantGroup.count as any).mockResolvedValue(1);
      (prisma.restaurantGroup.findMany as any).mockResolvedValue([
        {
          id: RESTAURANT_UUID,
          name: 'ABC - Firehouse',
          slug: 'abc-firehouse',
          description: 'A mock pizza outlet',
          rating: 4.8,
          branches: [],
        },
      ]);

      const response = await request(app).get('/api/v1/catalog/restaurants');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].name).toBe('ABC - Firehouse');
      expect(prisma.restaurantGroup.findMany).toHaveBeenCalled();
    });
  });

  describe('GET /api/v1/catalog/restaurants/slug/:slug', () => {
    it('should retrieve full details of restaurant by its slug name', async () => {
      (prisma.restaurantGroup.findUnique as any).mockResolvedValue({
        id: RESTAURANT_UUID,
        name: 'ABC - Firehouse',
        slug: 'abc-firehouse',
        branches: [{ id: FAVORITE_UUID, name: 'Head Branch', isActive: true }],
        categories: [{ id: CATEGORY_UUID, name: 'Pizza', isActive: true }],
        products: [],
      });

      const response = await request(app).get(
        '/api/v1/catalog/restaurants/slug/abc-firehouse'
      );

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('ABC - Firehouse');
      expect(response.body.data.branches).toHaveLength(1);
      expect(prisma.restaurantGroup.findUnique).toHaveBeenCalled();
    });

    it('should throw 404 error if restaurant slug is not active/found', async () => {
      (prisma.restaurantGroup.findUnique as any).mockResolvedValue(null);

      const response = await request(app).get(
        '/api/v1/catalog/restaurants/slug/non-existent'
      );

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/catalog/products', () => {
    it('should retrieve matching products and log search parameters to MongoDB', async () => {
      (prisma.product.count as any).mockResolvedValue(1);
      (prisma.product.findMany as any).mockResolvedValue([
        {
          id: PRODUCT_UUID,
          name: 'Classic Margherita',
          slug: 'classic-margherita',
          basePrice: '12.99',
        },
      ]);

      const response = await request(app)
        .get('/api/v1/catalog/products')
        .query({ search: 'pizza' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
    });
  });

  describe('GET /api/v1/catalog/products/slug/:slug', () => {
    it('should retrieve product and load recommendations, logging views', async () => {
      (prisma.product.findFirst as any).mockResolvedValue({
        id: PRODUCT_UUID,
        name: 'Classic Margherita',
        slug: 'classic-margherita',
        restaurantId: RESTAURANT_UUID,
        categoryId: CATEGORY_UUID,
        reviews: [],
        variants: [],
      });
      (prisma.product.findMany as any).mockResolvedValue([
        { id: REVIEW_UUID, name: 'Double Pepperoni' },
      ]);

      const response = await request(app).get(
        '/api/v1/catalog/products/slug/classic-margherita'
      );

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Classic Margherita');
      expect(response.body.recommendations).toHaveLength(1);
    });
  });

  describe('POST /api/v1/catalog/reviews', () => {
    it('should block review submissions from unauthenticated sessions', async () => {
      const response = await request(app)
        .post('/api/v1/catalog/reviews')
        .send({ productId: PRODUCT_UUID, rating: 5, comment: 'Amazing food!' });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should allow reviews submissions if valid JWT session header is provided', async () => {
      (prisma.product.findUnique as any).mockResolvedValue({
        id: PRODUCT_UUID,
        restaurantId: RESTAURANT_UUID,
      });
      (prisma.review.findFirst as any).mockResolvedValue(null);
      (prisma.review.create as any).mockResolvedValue({
        id: REVIEW_UUID,
        rating: 5,
        comment: 'Great sourdough crust!',
        user: {
          id: USER_UUID,
          firstName: 'Test',
          lastName: 'User',
          avatar: null,
        },
      });
      (prisma.review.aggregate as any).mockResolvedValue({
        _avg: { rating: 5.0 },
        _count: { id: 1 },
      });
      (prisma.product.aggregate as any).mockResolvedValue({
        _avg: { rating: 5.0 },
      });
      (prisma.product.update as any).mockResolvedValue({});
      (prisma.restaurantGroup.update as any).mockResolvedValue({});

      const response = await request(app)
        .post('/api/v1/catalog/reviews')
        .set('Authorization', `Bearer ${mockToken}`)
        .send({
          productId: PRODUCT_UUID,
          rating: 5,
          comment: 'Great sourdough crust!',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.comment).toBe('Great sourdough crust!');
      expect(prisma.review.create).toHaveBeenCalled();
      expect(prisma.product.update).toHaveBeenCalled();
      expect(prisma.restaurantGroup.update).toHaveBeenCalled();
    });
  });

  describe('POST /api/v1/catalog/favorites', () => {
    it('should toggle favorites state from true to false when already favorited', async () => {
      (prisma.product.findUnique as any).mockResolvedValue({
        id: PRODUCT_UUID,
      });
      (prisma.favorite.findUnique as any).mockResolvedValue({
        id: FAVORITE_UUID,
      });
      (prisma.favorite.delete as any).mockResolvedValue({});

      const response = await request(app)
        .post('/api/v1/catalog/favorites')
        .set('Authorization', `Bearer ${mockToken}`)
        .send({ productId: PRODUCT_UUID });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.favorited).toBe(false);
      expect(prisma.favorite.delete).toHaveBeenCalled();
    });
  });
});
