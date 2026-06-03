import { Router } from 'express';
import { AuthController } from './auth.controller';
import { authGuard } from '../../middleware/authGuard';
import { validate } from '../../middleware/validate';
import { authRateLimiter, otpRateLimiter } from '../../middleware/rateLimiter';
import { sanitizeInput } from '../../middleware/sanitize';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
  resendVerificationSchema,
  sendOtpSchema,
  verifyOtpSchema,
  googleAuthSchema,
} from './auth.validation';

const router = Router();

// Global input sanitization for auth routes
router.use(sanitizeInput);

router.post('/register', validate({ body: registerSchema }), AuthController.register);
router.post('/login', authRateLimiter, validate({ body: loginSchema }), AuthController.login);
router.post('/verify-login-otp', authRateLimiter, AuthController.verifyLoginOtp);
router.post('/refresh', AuthController.refresh);
router.post('/logout', AuthController.logout);
router.post('/logout-all', authGuard, AuthController.logoutAll);

router.post(
  '/forgot-password',
  authRateLimiter,
  validate({ body: forgotPasswordSchema }),
  AuthController.forgotPassword,
);
router.post(
  '/reset-password',
  validate({ body: resetPasswordSchema }),
  AuthController.resetPassword,
);
router.post('/verify-email', validate({ body: verifyEmailSchema }), AuthController.verifyEmail);
router.post(
  '/resend-verification',
  validate({ body: resendVerificationSchema }),
  AuthController.resendVerification,
);

router.post('/send-otp', otpRateLimiter, validate({ body: sendOtpSchema }), AuthController.sendOtp);
router.post('/verify-otp', validate({ body: verifyOtpSchema }), AuthController.verifyOtp);

router.post('/google', validate({ body: googleAuthSchema }), AuthController.googleAuth);

router.get('/me', authGuard, AuthController.getMe);

export default router;
