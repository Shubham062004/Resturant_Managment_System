import { Router } from 'express';
import { authGuard } from '../../middleware/authGuard';
import { PaymentsController } from './payments.controller';

const router = Router();

router.use(authGuard);

/** Payment intent creation — Stripe/Razorpay integration point (PR-007) */
router.post('/intent', PaymentsController.createPaymentIntent);

/** Webhook endpoints — mount with raw body parser in production */
router.post('/webhook/stripe', PaymentsController.stripeWebhook);
router.post('/webhook/razorpay', PaymentsController.razorpayWebhook);

export default router;
