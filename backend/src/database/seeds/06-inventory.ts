import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';

export async function seedInventory(prisma: PrismaClient, branches: any[]) {
  console.log('🌱 Seeding Inventory (Ingredients, Suppliers, POs)...');

  // Skip if models are stripped, but assume full schema
  const suppliers = [];
  const ingredients = [];
  
  for (let i = 1; i <= 10; i++) {
    suppliers.push({
      id: randomUUID(),
      name: `Supplier ${i} Wholesale`,
      contactName: `Contact ${i}`,
      email: `supplier${i}@wholesale.com`,
      phone: `555-010${i}`,
      address: `123 Distribution Way, Warehouse ${i}`,
      isActive: true,
    });
  }
  
  await prisma.supplier.createMany({ data: suppliers });

  // Add Ingredients (we will assign them to the first branch for demo)
  for (let i = 1; i <= 50; i++) {
    ingredients.push({
      id: randomUUID(),
      name: `Ingredient ${i} (Flour/Tomato/Cheese)`,
      sku: `ING-${i.toString().padStart(4, '0')}`,
      unit: 'KG',
      costPerUnit: Math.random() * 10 + 1,
      minStockLevel: 50,
      maxStockLevel: 500,
      category: 'GENERAL',
      minimumStock: 50,
      reorderPoint: 50,
    });
  }

  await prisma.ingredient.createMany({ data: ingredients });
  
  // Link to branches via Inventory table
  const inventoryItems = [];
  for (const branch of branches) {
    for (const ing of ingredients) {
      inventoryItems.push({
        id: randomUUID(),
        branchId: branch.id,
        ingredientId: ing.id,
        quantity: Math.floor(Math.random() * 400) + 50,
        lastRestockDate: new Date(),
      });
    }
  }

  await prisma.inventory.createMany({ data: inventoryItems });

  return { suppliers, ingredients };
}
