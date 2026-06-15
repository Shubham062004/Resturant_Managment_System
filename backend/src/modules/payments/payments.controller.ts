import { Response, NextFunction } from 'express';

import { AuthRequest } from '../../types/express';
import AppError from '../../utils/appError';

import { PaymentsService } from './payments.service';

/**
 * Payment foundation — implement Stripe/Razorpay SDK calls in PR-007.
 * @see docs/PAYMENT_INTEGRATION_PLAN.md
 */
export class PaymentsController {
  public static async createPaymentIntent(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      if (!req.user) {
        return next(new AppError('Unauthenticated.', 401));
      }

      const { provider } = req.body as { provider?: 'STRIPE' | 'RAZORPAY' };

      if (!provider) {
        return next(new AppError('provider is required.', 400));
      }

      if (provider === 'STRIPE') {
        const result = await PaymentsService.createStripePaymentIntent(req.user.id);
        res.status(200).json({ success: true, data: result });
      } else {
        const result = await PaymentsService.createRazorpayOrder(req.user.id);
        res.status(200).json({ success: true, data: result });
      }
    } catch (error) {
      next(error);
    }
  }

  public static async stripeWebhook(
    req: AuthRequest,
    res: Response,
    _next: NextFunction,
  ): Promise<void> {
    try {
      const signature = req.headers['stripe-signature'] as string;
      if (!signature) {
        res.status(400).send('Missing stripe-signature header');
        return;
      }

      const result = await PaymentsService.handleStripeWebhook(signature, req.body);
      res.status(200).json(result);
    } catch (error) {
      // Stripe webhooks require non-200 responses for retries if parsing fails
      res.status(400).send(`Webhook Error: ${(error as any).message}`);
    }
  }

  public static async razorpayWebhook(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      res.status(501).json({
        success: false,
        message: 'Razorpay webhook handler not yet configured.',
      });
    } catch (error) {
      next(error);
    }
  }
}
