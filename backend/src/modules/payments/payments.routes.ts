import { Router } from 'express';
import { authGuard } from '../../middleware/authGuard';
import { PaymentsController } from './payments.controller';

import express from 'express';

const router = Router();

// Webhook endpoints must bypass JSON parsing and Auth
router.post(
  '/webhook/stripe',
  express.raw({ type: 'application/json' }),
  PaymentsController.stripeWebhook,
);

router.post('/webhook/razorpay', PaymentsController.razorpayWebhook);

// Protected Routes
router.use(authGuard);

/** Payment intent creation — Stripe/Razorpay integration point */
router.post('/intent', PaymentsController.createPaymentIntent);

export default router;
