import { prisma } from '../../config/db';
import AppError from '../../utils/appError';
import { getIO } from '../../config/socket';

export class WaitlistService {
  public static async joinWaitlist(customerId: string, data: any) {
    // Basic calculation for estimated wait time (e.g. 15 mins per current waitlist entry)
    const existingEntries = await prisma.waitlistEntry.count({
      where: { branchId: data.branchId, status: 'WAITING' }
    });

    const estimatedWaitTime = (existingEntries + 1) * 15;

    const entry = await prisma.waitlistEntry.create({
      data: {
        customerId,
        branchId: data.branchId,
        guestCount: data.guestCount,
        estimatedWaitTime,
        status: 'WAITING'
      },
      include: { customer: true }
    });

    getIO().to(`branch_${data.branchId}`).emit('waitlist-updated', entry);
    return entry;
  }

  public static async getBranchWaitlist(branchId: string) {
    return prisma.waitlistEntry.findMany({
      where: { branchId, status: { in: ['WAITING', 'NOTIFIED'] } },
      include: { customer: true },
      orderBy: { joinedAt: 'asc' }
    });
  }

  public static async updateWaitlistStatus(entryId: string, status: any) {
    const existing = await prisma.waitlistEntry.findUnique({ where: { id: entryId } });
    if (!existing) throw new AppError('Waitlist entry not found', 404);

    let updates: any = { status };
    if (status === 'NOTIFIED') updates.notifiedAt = new Date();
    if (status === 'SEATED') updates.seatedAt = new Date();
    if (status === 'CANCELLED' || status === 'NO_SHOW') updates.cancelledAt = new Date();

    const updated = await prisma.waitlistEntry.update({
      where: { id: entryId },
      data: updates,
      include: { customer: true }
    });

    getIO().to(`branch_${updated.branchId}`).emit('waitlist-updated', updated);

    return updated;
  }
}
