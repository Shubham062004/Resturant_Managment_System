import { prisma } from '../../config/db';
import AppError from '../../utils/appError';

export class AddressService {
  /**
   * Get all addresses for user
   */
  public static async getAddresses(userId: string) {
    return prisma.address.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Create a new address
   */
  public static async createAddress(userId: string, data: Record<string, unknown>) {
    if (data.isDefault) {
      await prisma.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    } else {
      // If no addresses exist, make this default
      const count = await prisma.address.count({ where: { userId } });
      if (count === 0) data.isDefault = true;
    }

    return prisma.address.create({
      data: { ...data, userId },
    });
  }

  /**
   * Update address
   */
  public static async updateAddress(
    userId: string,
    addressId: string,
    data: Record<string, unknown>,
  ) {
    const existing = await prisma.address.findUnique({ where: { id: addressId } });
    if (!existing || existing.userId !== userId) {
      throw new AppError('Address not found', 404);
    }

    if (data.isDefault) {
      await prisma.address.updateMany({
        where: { userId, isDefault: true, id: { not: addressId } },
        data: { isDefault: false },
      });
    }

    return prisma.address.update({
      where: { id: addressId },
      data,
    });
  }

  /**
   * Delete address
   */
  public static async deleteAddress(userId: string, addressId: string) {
    const existing = await prisma.address.findUnique({ where: { id: addressId } });
    if (!existing || existing.userId !== userId) {
      throw new AppError('Address not found', 404);
    }

    await prisma.address.delete({ where: { id: addressId } });

    // If default was deleted, make the most recent one default
    if (existing.isDefault) {
      const recent = await prisma.address.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });
      if (recent) {
        await prisma.address.update({
          where: { id: recent.id },
          data: { isDefault: true },
        });
      }
    }

    return { success: true };
  }
}
