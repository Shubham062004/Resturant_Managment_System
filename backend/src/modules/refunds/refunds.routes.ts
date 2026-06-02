import { Router } from 'express';
import { RefundsController } from './refunds.controller';
import { authGuard, restrictTo } from '../../middleware/authGuard';
import { validate } from '../../middleware/validate';
import { createRefundSchema } from './refunds.validation';

const router = Router();

router.use(authGuard);

// Only admins or authorized staff can process refunds
router.post(
  '/',
  restrictTo('ADMIN', 'SUPER_ADMIN'),
  validate(createRefundSchema),
  RefundsController.processRefund
);

router.get('/:id', RefundsController.getRefundById);

export default router;
