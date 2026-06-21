import { Router } from 'express';
import { authGuard } from '../../middleware/authGuard';
import { CustomerController } from './customer.controller';
import { WishlistController } from './wishlist.controller';

const router = Router();

// Public Customer Routes
router.get('/branches', CustomerController.getBranches);
router.get('/menu', CustomerController.getBranchMenu);
router.get('/offers', CustomerController.getBranchOffers);

// Authenticated Customer Wishlist Routes
router.get('/wishlist', authGuard, WishlistController.getWishlist);
router.get('/wishlist/summary', authGuard, WishlistController.getWishlistSummary);
router.post('/wishlist/move-to-cart', authGuard, WishlistController.moveToCart);
router.post('/wishlist/add-all', authGuard, WishlistController.addAllToCart);
router.post('/wishlist/:menuItemId', authGuard, WishlistController.addToWishlist);
router.delete('/wishlist/:menuItemId', authGuard, WishlistController.removeFromWishlist);
router.delete('/wishlist', authGuard, WishlistController.clearWishlist);

// Authenticated Customer Cart Merge Routes
router.post('/cart/merge', authGuard, CustomerController.mergeCart);

export default router;

