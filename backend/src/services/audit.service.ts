import AuditLog from '../models/AuditLog';
import UserSession from '../models/UserSession';
import logger from '../utils/logger';

export class AuditService {
  private static getBrowser(userAgent: string): string {
    const ua = userAgent.toLowerCase();
    if (ua.includes('firefox')) return 'Firefox';
    if (ua.includes('chrome') && !ua.includes('chromium')) return 'Chrome';
    if (ua.includes('safari') && !ua.includes('chrome')) return 'Safari';
    if (ua.includes('edge') || ua.includes('edg')) return 'Edge';
    if (ua.includes('opera') || ua.includes('opr')) return 'Opera';
    return 'Browser';
  }

  private static getDevice(userAgent: string): string {
    const ua = userAgent.toLowerCase();
    if (ua.includes('mobi') || ua.includes('iphone') || ua.includes('android')) {
      return 'Mobile';
    }
    if (ua.includes('ipad') || ua.includes('tablet')) {
      return 'Tablet';
    }
    return 'Desktop';
  }

  /**
   * Saves an audit log event to MongoDB
   */
  public static async writeLog(
    userId: string,
    action: 'LOGIN' | 'LOGOUT' | 'PASSWORD_RESET' | 'EMAIL_VERIFICATION' | 'ROLE_CHANGE',
    ipAddress: string,
    userAgent: string,
    payload?: Record<string, any>,
  ): Promise<void> {
    try {
      await AuditLog.create({
        userId,
        action,
        ipAddress,
        userAgent,
        payload,
      });
      logger.info(`[Audit Log] Action [${action}] recorded for User [${userId}]`);
    } catch (error) {
      logger.error('[Audit Service] Failed to write audit log in MongoDB:', error);
    }
  }

  /**
   * Logs a new user session entry in MongoDB
   */
  public static async registerSession(
    userId: string,
    ipAddress: string,
    userAgent: string,
    tokenHash: string,
  ): Promise<void> {
    try {
      const browser = this.getBrowser(userAgent);
      const device = this.getDevice(userAgent);

      await UserSession.create({
        userId,
        device,
        browser,
        ip: ipAddress,
        tokenHash,
      });
      logger.info(`[Session Service] User [${userId}] session registered (${device} / ${browser})`);
    } catch (error) {
      logger.error('[Audit Service] Failed to register session in MongoDB:', error);
    }
  }

  /**
   * Sets logout time for a specific active session
   */
  public static async terminateSession(tokenHash: string): Promise<void> {
    try {
      await UserSession.updateOne(
        { tokenHash, logoutTime: { $exists: false } },
        { $set: { logoutTime: new Date() } },
      );
      logger.info(
        `[Session Service] Session terminated for token hash starting with ${tokenHash.slice(0, 10)}`,
      );
    } catch (error) {
      logger.error('[Audit Service] Failed to terminate session in MongoDB:', error);
    }
  }

  /**
   * Sets logout time for all active user sessions (e.g. logout-all, password reset)
   */
  public static async terminateAllSessions(userId: string): Promise<void> {
    try {
      await UserSession.updateMany(
        { userId, logoutTime: { $exists: false } },
        { $set: { logoutTime: new Date() } },
      );
      logger.info(`[Session Service] All active sessions terminated for User [${userId}]`);
    } catch (error) {
      logger.error('[Audit Service] Failed to terminate all user sessions in MongoDB:', error);
    }
  }
}
