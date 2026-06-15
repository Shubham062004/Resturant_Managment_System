import { Router } from 'express';
import { z } from 'zod';

import validate from '../../middleware/validate';

import { QROrderingController } from './qr.controller';

const router = Router();

export const placeQROrderSchema = {
  body: z.object({
    items: z.array(
      z.object({
        productId: z.string().uuid(),
        variantId: z.string().uuid().optional(),
        quantity: z.number().int().positive(),
        price: z.number().positive(),
      }),
    ),
    subtotal: z.number().positive(),
    tax: z.number().nonnegative(),
    totalAmount: z.number().positive(),
  }),
};

// GET /api/v1/qr-ordering/:qrCode/menu
router.get('/:qrCode/menu', QROrderingController.getMenuForTable);

// POST /api/v1/qr-ordering/:qrCode/order
router.post('/:qrCode/order', validate(placeQROrderSchema), QROrderingController.placeOrder);

export default router;
