import { Router } from 'express';
import { NotificationController } from './notification.controller';
import { PreferenceController } from './preference.controller';
import { authGuard } from '../../middleware/authGuard';

const router = Router();

// Protect all routes
router.use(authGuard);

// Notification Inbox
router.get('/', NotificationController.getNotifications);
router.patch('/:id/read', NotificationController.markAsRead);
router.post('/test', NotificationController.sendTestNotification);

// Preferences
router.get('/preferences', PreferenceController.getPreferences);
router.patch('/preferences', PreferenceController.updatePreferences);

export default router;
