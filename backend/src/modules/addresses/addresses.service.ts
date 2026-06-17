import { Prisma } from '@prisma/client';

import { prisma } from '../../config/db';
import AppError from '../../utils/appError';

type AddressCreateData = Omit<Prisma.AddressUncheckedCreateInput, 'userId'>;
type AddressUpdateData = Prisma.AddressUpdateInput;

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
  public static async createAddress(userId: string, data: AddressCreateData) {
    const payload: AddressCreateData = { ...data };

    if (payload.isDefault) {
      await prisma.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    } else {
      const count = await prisma.address.count({ where: { userId } });
      if (count === 0) {
        payload.isDefault = true;
      }
    }

    return prisma.address.create({
      data: { ...payload, userId },
    });
  }

  /**
   * Update address
   */
  public static async updateAddress(
    userId: string,
    addressId: string,
    data: AddressUpdateData
  ) {
    const existing = await prisma.address.findUnique({
      where: { id: addressId },
    });
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
    const existing = await prisma.address.findUnique({
      where: { id: addressId },
    });
    if (!existing || existing.userId !== userId) {
      throw new AppError('Address not found', 404);
    }

    await prisma.address.delete({ where: { id: addressId } });

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
