import { Request, Response, NextFunction } from 'express';

import { prisma } from '../../config/db';

export class CustomersController {
  public static async getAllCustomers(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const customers = await prisma.user.findMany({
        where: { role: 'CUSTOMER' },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          createdAt: true,
          _count: {
            select: { orders: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
      res.status(200).json({ status: 'success', data: customers });
    } catch (error) {
      next(error);
    }
  }

  public static async getCustomerDetails(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const customer = await prisma.user.findUnique({
        where: { id: req.params.id, role: 'CUSTOMER' },
        include: {
          orders: {
            orderBy: { createdAt: 'desc' },
            take: 10,
          },
          addresses: true,
        },
      });
      res.status(200).json({ status: 'success', data: customer });
    } catch (error) {
      next(error);
    }
  }
}
