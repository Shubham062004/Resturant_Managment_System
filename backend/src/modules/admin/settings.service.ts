import { prisma } from '../../config/db';

export class SettingsService {
  public static async getSettings(branchId: string) {
    let settings = await prisma.restaurantSettings.findUnique({ where: { branchId } });
    if (!settings) {
      settings = await prisma.restaurantSettings.create({ data: { branchId } });
    }
    return settings;
  }

  public static async updateSettings(branchId: string, data: any) {
    let settings = await prisma.restaurantSettings.findUnique({ where: { branchId } });

    if (settings) {
      return prisma.restaurantSettings.update({
        where: { branchId },
        data,
      });
    } else {
      return prisma.restaurantSettings.create({
        data: {
          branchId,
          ...data,
        },
      });
    }
  }
}
