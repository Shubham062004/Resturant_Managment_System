import { prisma } from '../../config/db';
import { getIO } from '../../config/socket';
import AppError from '../../utils/appError';

export class QROrderingService {
  public static async getMenuForTable(qrCode: string) {
    const table = await prisma.table.findUnique({
      where: { qrCode, active: true },
      include: { branch: true },
    });

    if (!table) throw new AppError('Invalid or inactive QR Code', 404);

    // Fetch active categories and products
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      include: { products: true },
    });
    return { table, categories };
  }

  public static async placeOrder(qrCode: string, data: any) {
    const table = await prisma.table.findUnique({
      where: { qrCode, active: true },
    });
    if (!table) throw new AppError('Invalid or inactive QR Code', 404);

    // Get an anonymous user or a dummy user for guest orders if not authenticated
    // In our system, order requires userId. We can find or create a GUEST user.
    let guestUser = await prisma.user.findFirst({
      where: { email: 'guest@abc.local' },
    });
    if (!guestUser) {
      guestUser = await prisma.user.create({
        data: {
          email: 'guest@abc.local',
          firstName: 'Guest',
          lastName: 'User',
          role: 'CUSTOMER',
        },
      });
    }

    const order = await prisma.order.create({
      data: {
        userId: guestUser.id,
        tableId: table.id,
        branchId: table.branchId,
        subtotal: data.subtotal,
        tax: data.tax,
        totalAmount: data.totalAmount,
        orderType: 'DINE_IN',
        status: 'PLACED',
        items: {
          create: data.items.map((item: any) => ({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      include: { table: true, items: true },
    });

    // Notify kitchen
    getIO().to(`branch_${table.branchId}`).emit('qr-order-placed', order);

    return order;
  }
}
