import { describe, it, expect, vi } from 'vitest';
import { prismaMock } from '../../tests/prisma.mock';
import { OrdersService } from './orders.service';
import { Prisma } from '@prisma/client';

// Mock the socket server to prevent "Socket.io not initialized" warnings
vi.mock('../../config/socket', () => ({
  getIO: vi.fn(() => ({
    to: vi.fn(() => ({
      emit: vi.fn(),
    })),
  })),
}));

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

    // Mock direct Prisma database calls
    prismaMock.cart.findUnique.mockResolvedValue({
      id: 'cart-1',
      userId: 'user-1',
      items: [
        {
          id: 'item-1',
          productId: 'prod-1',
          quantity: 2,
          price: new Prisma.Decimal(10.25),
          product: { id: 'prod-1', name: 'Margherita Pizza' },
        },
      ],
    } as any);

    prismaMock.order.create.mockResolvedValue(mockOrder as any);
    prismaMock.cartItem.deleteMany.mockResolvedValue({ count: 1 } as any);

    const result = await OrdersService.createOrderFromCart('u1', {
      userId: 'user-1',
      branchId: 'branch-1',
      orderType: 'DELIVERY',
      paymentMethod: 'CARD',
      items: [{ productId: 'prod-1', quantity: 2, unitPrice: 10.25, subtotal: 20.5 }]
    } as any);

    expect(result).toBeDefined();
    expect(result.id).toBe('order-1');
    expect(prismaMock.order.create).toHaveBeenCalled();
  });
});
