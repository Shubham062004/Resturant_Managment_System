import { Router } from 'express';
import { AIController } from './ai.controller';
import { authGuard, restrictTo } from '../../middleware/authGuard';

const router = Router();

// Public / Authenticated user routes for recommendations and assistant
router.get('/recommendations', AIController.getRecommendations);
router.get('/trending', AIController.getTrending);
router.get('/combos', AIController.getCombos);
router.post('/chat', AIController.postChat);

// Admin and Owner insights & forecasting
router.use('/predictions', authGuard, restrictTo('ADMIN', 'SUPER_ADMIN', 'BRANCH_MANAGER', 'ORGANIZATION_OWNER', 'FRANCHISE_OWNER'));
router.get('/predictions', AIController.getPredictions);

router.use('/customer-segment', authGuard, restrictTo('ADMIN', 'SUPER_ADMIN', 'BRANCH_MANAGER', 'ORGANIZATION_OWNER', 'FRANCHISE_OWNER'));
router.get('/customer-segment', AIController.getCustomerSegment);

export default router;
