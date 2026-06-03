import { describe, it, expect } from 'vitest';
import { OrdersService } from './orders.service';
import { prismaMock } from '../../tests/prisma.mock';
import { Prisma } from '@prisma/client';

describe('OrdersService', () => {
  it('should create an order successfully', async () => {
    const mockOrder = {
      id: 'order-1',
      userId: 'user-1',
      branchId: 'branch-1',
      status: 'PENDING',
      orderType: 'DELIVERY',
      totalAmount: new Prisma.Decimal(20.50),
    };
    
    // Mock the transaction
    prismaMock.$transaction.mockResolvedValue(mockOrder as any);

    const result = await OrdersService.createOrderFromCart('u1', {
      userId: 'user-1',
      branchId: 'branch-1',
      orderType: 'DELIVERY',
      paymentMethod: 'CARD',
      items: [{ productId: 'prod-1', quantity: 2, unitPrice: 10, subtotal: 20 }]
    } as any);

    expect(result).toBeDefined();
    expect(result.id).toBe('order-1');
    expect(prismaMock.$transaction).toHaveBeenCalled();
  });
});
