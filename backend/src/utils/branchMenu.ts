import { prisma } from '../config/db';

/**
 * Check if a product is available at a branch using BranchMenuItem mapping,
 * falling back to same-restaurant product availability.
 */
export async function isProductAvailableAtBranch(
  productId: string,
  branchId: string
): Promise<boolean> {
  const branch = await prisma.branch.findUnique({
    where: { id: branchId },
    select: { restaurantId: true },
  });
  if (!branch) return false;

  const mapped = await prisma.branchMenuItem.findFirst({
    where: { branchId, productId, isAvailable: true },
  });
  if (mapped) return true;

  const product = await prisma.product.findFirst({
    where: {
      id: productId,
      restaurantId: branch.restaurantId,
      isAvailable: true,
    },
  });
  return !!product;
}

/**
 * Get product IDs available at a branch.
 */
export async function getBranchProductIds(branchId: string): Promise<string[]> {
  const branch = await prisma.branch.findUnique({
    where: { id: branchId },
    select: { restaurantId: true },
  });
  if (!branch) return [];

  const mapped = await prisma.branchMenuItem.findMany({
    where: { branchId, isAvailable: true },
    select: { productId: true },
  });

  if (mapped.length > 0) {
    return mapped.map((m: { productId: string }) => m.productId);
  }

  const products = await prisma.product.findMany({
    where: { restaurantId: branch.restaurantId, isAvailable: true },
    select: { id: true },
  });
  return products.map((p: { id: string }) => p.id);
}
