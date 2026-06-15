import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const ingredients = [
  { name: 'Red Onion', sku: 'ING-1001', category: 'VEGETABLES', unit: 'Kg', minimumStock: 5, reorderPoint: 10, costPrice: 40 },
  { name: 'Garlic', sku: 'ING-1002', category: 'VEGETABLES', unit: 'Kg', minimumStock: 2, reorderPoint: 5, costPrice: 120 },
  { name: 'Chicken Breast', sku: 'ING-2001', category: 'MEAT', unit: 'Kg', minimumStock: 10, reorderPoint: 15, costPrice: 250 },
  { name: 'Minced Beef', sku: 'ING-2002', category: 'MEAT', unit: 'Kg', minimumStock: 8, reorderPoint: 12, costPrice: 350 },
  { name: 'Cheddar Cheese', sku: 'ING-3001', category: 'DAIRY', unit: 'Kg', minimumStock: 5, reorderPoint: 8, costPrice: 400 },
  { name: 'Mozzarella', sku: 'ING-3002', category: 'DAIRY', unit: 'Kg', minimumStock: 6, reorderPoint: 10, costPrice: 450 },
  { name: 'Milk (Full Cream)', sku: 'ING-3003', category: 'DAIRY', unit: 'Litre', minimumStock: 10, reorderPoint: 15, costPrice: 60 },
  { name: 'Butter', sku: 'ING-3004', category: 'DAIRY', unit: 'Kg', minimumStock: 3, reorderPoint: 5, costPrice: 500 },
  { name: 'Salt', sku: 'ING-4001', category: 'SPICES', unit: 'Kg', minimumStock: 10, reorderPoint: 15, costPrice: 20 },
  { name: 'Black Pepper', sku: 'ING-4002', category: 'SPICES', unit: 'Kg', minimumStock: 2, reorderPoint: 4, costPrice: 800 },
  { name: 'Chili Powder', sku: 'ING-4003', category: 'SPICES', unit: 'Kg', minimumStock: 2, reorderPoint: 5, costPrice: 400 },
  { name: 'Turmeric', sku: 'ING-4004', category: 'SPICES', unit: 'Kg', minimumStock: 2, reorderPoint: 4, costPrice: 300 },
  { name: 'All-Purpose Flour', sku: 'ING-5001', category: 'BAKERY', unit: 'Kg', minimumStock: 20, reorderPoint: 30, costPrice: 45 },
  { name: 'Yeast', sku: 'ING-5002', category: 'BAKERY', unit: 'Gram', minimumStock: 500, reorderPoint: 1000, costPrice: 2 },
  { name: 'Sugar', sku: 'ING-5003', category: 'BAKERY', unit: 'Kg', minimumStock: 15, reorderPoint: 25, costPrice: 40 },
  { name: 'Baking Powder', sku: 'ING-5004', category: 'BAKERY', unit: 'Gram', minimumStock: 500, reorderPoint: 800, costPrice: 3 },
  { name: 'Pizza Box (Large)', sku: 'ING-6001', category: 'PACKAGING', unit: 'Piece', minimumStock: 100, reorderPoint: 200, costPrice: 15 },
  { name: 'Pizza Box (Medium)', sku: 'ING-6002', category: 'PACKAGING', unit: 'Piece', minimumStock: 100, reorderPoint: 200, costPrice: 12 },
  { name: 'Tissue Paper', sku: 'ING-6003', category: 'PACKAGING', unit: 'Pack', minimumStock: 50, reorderPoint: 100, costPrice: 25 },
  { name: 'French Fries', sku: 'ING-7001', category: 'FROZEN_ITEMS', unit: 'Kg', minimumStock: 15, reorderPoint: 20, costPrice: 120 }
];

async function seed() {
  console.log('Seeding 20 ingredients...');
  for (const ing of ingredients) {
    try {
      await prisma.ingredient.upsert({
        where: { sku: ing.sku },
        update: ing,
        create: ing
      });
      console.log(`+ Added: ${ing.name}`);
    } catch (err) {
      console.error(`- Failed to add ${ing.name}:`, err);
    }
  }
  console.log('Done!');
}

seed().catch(console.error).finally(() => prisma.$disconnect());
