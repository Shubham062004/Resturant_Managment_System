import { Router } from 'express';
import { validateCoupon, getActiveCoupons } from './coupons.controller';
import { validate } from '../../middleware/validate';
import { validateCouponSchema } from './coupons.validation';
import { authGuard } from '../../middleware/authGuard';

const router = Router();

// Public route to view active offers
router.get('/active', getActiveCoupons);

// Authenticated route to validate a coupon against user and order
router.post('/validate', authGuard, validate(validateCouponSchema), validateCoupon);

export default router;
