import { prisma } from '../../config/db';
import AppError from '../../utils/appError';
import { getIO } from '../../config/socket';

export class ReservationService {
  public static async createReservation(customerId: string, data: any) {
    const reservation = await prisma.reservation.create({
      data: {
        customerId,
        branchId: data.branchId,
        tableId: data.tableId,
        reservationDate: data.reservationDate,
        reservationTime: data.reservationTime,
        guestCount: data.guestCount,
        specialRequest: data.specialRequest,
        status: 'PENDING',
      },
      include: { customer: true, table: true },
    });

    getIO().to(`branch_${data.branchId}`).emit('reservation-created', reservation);
    return reservation;
  }

  public static async getCustomerReservations(customerId: string) {
    return prisma.reservation.findMany({
      where: { customerId },
      include: { branch: true, table: true },
      orderBy: [{ reservationDate: 'desc' }, { reservationTime: 'desc' }],
    });
  }

  public static async getBranchReservations(branchId: string, date?: string) {
    const whereClause: any = { branchId };
    if (date) {
      whereClause.reservationDate = date;
    }
    return prisma.reservation.findMany({
      where: whereClause,
      include: { customer: true, table: true },
      orderBy: [{ reservationDate: 'asc' }, { reservationTime: 'asc' }],
    });
  }

  public static async updateReservationStatus(
    reservationId: string,
    data: { status: any; tableId?: string },
  ) {
    const existing = await prisma.reservation.findUnique({ where: { id: reservationId } });
    if (!existing) throw new AppError('Reservation not found', 404);

    const updated = await prisma.reservation.update({
      where: { id: reservationId },
      data: {
        status: data.status,
        ...(data.tableId ? { tableId: data.tableId } : {}),
      },
      include: { customer: true, table: true },
    });

    // Handle side effects like Table status updates
    if (data.status === 'CHECKED_IN' && updated.tableId) {
      await prisma.table.update({
        where: { id: updated.tableId },
        data: { status: 'OCCUPIED' },
      });
      getIO().to(`branch_${updated.branchId}`).emit('table-occupied', { tableId: updated.tableId });
    }

    if (data.status === 'CONFIRMED') {
      getIO().to(`branch_${updated.branchId}`).emit('reservation-confirmed', updated);
    }

    if (data.status === 'COMPLETED' && updated.tableId) {
      await prisma.table.update({
        where: { id: updated.tableId },
        data: { status: 'CLEANING' },
      });
    }

    return updated;
  }
}
