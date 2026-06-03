import crypto from 'crypto';
import { prisma } from '../../config/db';
import AppError from '../../utils/appError';
import { getIO } from '../../config/socket';

export class TableService {
  public static async createTable(data: any) {
    const tableId = crypto.randomUUID();
    const qrCode = `ovenxpress.com/qr/${tableId}`;

    const table = await prisma.table.create({
      data: {
        id: tableId,
        branchId: data.branchId,
        number: data.number,
        capacity: data.capacity,
        x: data.x,
        y: data.y,
        qrCode,
      }
    });

    getIO().to(`branch_${data.branchId}`).emit('table-updated', table);
    return table;
  }

  public static async getBranchTables(branchId: string) {
    return prisma.table.findMany({
      where: { branchId, active: true },
      orderBy: { number: 'asc' }
    });
  }

  public static async updateTable(id: string, data: any) {
    const existing = await prisma.table.findUnique({ where: { id } });
    if (!existing) throw new AppError('Table not found', 404);

    const table = await prisma.table.update({
      where: { id },
      data
    });

    getIO().to(`branch_${table.branchId}`).emit('table-updated', table);

    if (data.status === 'AVAILABLE') {
       getIO().to(`branch_${table.branchId}`).emit('table-available', table);
    } else if (data.status === 'OCCUPIED') {
       getIO().to(`branch_${table.branchId}`).emit('table-occupied', table);
    }

    return table;
  }

  public static async getTableByQR(qrCode: string) {
    const table = await prisma.table.findUnique({ where: { qrCode } });
    if (!table) throw new AppError('Invalid QR code', 404);
    return table;
  }
}
