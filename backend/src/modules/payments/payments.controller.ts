import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../types/express';
import AppError from '../../utils/appError';

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

      const { provider, orderDraftId } = req.body as {
        provider?: 'STRIPE' | 'RAZORPAY';
        orderDraftId?: string;
      };

      if (!provider || !orderDraftId) {
        return next(new AppError('provider and orderDraftId are required.', 400));
      }

      res.status(501).json({
        success: false,
        error: {
          code: 'NOT_IMPLEMENTED',
          message: `${provider} payment intent creation is scheduled for PR-007.`,
          details: [],
        },
      });
    } catch (error) {
      next(error);
    }
  }

  public static async stripeWebhook(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      res.status(501).json({
        success: false,
        message: 'Stripe webhook handler not yet configured.',
      });
    } catch (error) {
      next(error);
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
