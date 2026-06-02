import { Router } from 'express';
import { getCart, addItem, updateItemQuantity, removeItem, clearCart, mergeCart } from './cart.controller';
import { validate } from '../../middleware/validate';
import { addToCartSchema, updateCartItemSchema, mergeCartSchema } from './cart.validation';
import { authGuard } from '../../middleware/authGuard';

const router = Router();

// All cart routes require authentication
router.use(authGuard);

router.get('/', getCart);
router.post('/items', validate(addToCartSchema), addItem);
router.put('/items/:id', validate(updateCartItemSchema), updateItemQuantity);
router.delete('/items/:id', removeItem);
router.delete('/', clearCart);
router.post('/merge', validate(mergeCartSchema), mergeCart);

export default router;
