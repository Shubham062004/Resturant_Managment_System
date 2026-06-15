import { Router } from 'express';

import { authGuard, restrictTo } from '../../middleware/authGuard';
import validate from '../../middleware/validate';

import { WaitlistController } from './waitlist.controller';
import { joinWaitlistSchema, updateWaitlistStatusSchema } from './waitlist.validation';

const router = Router();

router.use(authGuard);

router.post('/', validate(joinWaitlistSchema), WaitlistController.joinWaitlist);
router.get(
  '/branch/:branchId',
  restrictTo('ADMIN', 'SUPER_ADMIN', 'CASHIER'),
  WaitlistController.getBranchWaitlist,
);
router.patch(
  '/:id',
  restrictTo('ADMIN', 'SUPER_ADMIN', 'CASHIER'),
  validate(updateWaitlistStatusSchema),
  WaitlistController.updateWaitlistStatus,
);

export default router;
