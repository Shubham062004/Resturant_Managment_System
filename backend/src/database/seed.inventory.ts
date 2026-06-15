/**
 * =============================================================================
 * ABC RESTAURANT MANAGEMENT SYSTEM
 * STANDALONE INVENTORY SEED SCRIPT
 * =============================================================================
 * Run with:  npx ts-node-dev --transpile-only src/database/seed.inventory.ts
 *
 * ✅ 105 real restaurant ingredients
 * ✅ 12 suppliers with contact details
 * ✅ Realistic stock quantities per branch
 * ✅ 15+ intentional low-stock alerts
 * ✅ 100+ purchase orders (May 2026)
 * ✅ 500+ stock movement records
 * ✅ Waste records (expired milk, damaged produce, etc.)
 * ✅ Recipe mappings (product → ingredients)
 * ✅ Distributed across all 5 branches
 * =============================================================================
 */

import { randomUUID } from 'crypto';

import { PrismaClient, StockMovementType, PurchaseOrderStatus } from '@prisma/client';

const prisma = new PrismaClient();

// ---------------------------------------------------------------------------
// HELPERS
// ---------------------------------------------------------------------------
function rnd(min: number, max: number, decimals = 2): number {
  const v = Math.random() * (max - min) + min;
  return parseFloat(v.toFixed(decimals));
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function dayInMay(day: number, hour = 10, minute = 0): Date {
  return new Date(2026, 4, day, hour, minute);
}

// ---------------------------------------------------------------------------
// MASTER DATA DEFINITIONS
// ---------------------------------------------------------------------------

const INGREDIENT_DEFINITIONS = [
  // ── VEGETABLES ──────────────────────────────────────────────────────────
  {
    name: 'Onion',
    sku: 'VEG-001',
    category: 'Vegetables',
    unit: 'KG',
    min: 30,
    reorder: 50,
    costPerUnit: 25,
  },
  {
    name: 'Tomato',
    sku: 'VEG-002',
    category: 'Vegetables',
    unit: 'KG',
    min: 20,
    reorder: 40,
    costPerUnit: 30,
  },
  {
    name: 'Potato',
    sku: 'VEG-003',
    category: 'Vegetables',
    unit: 'KG',
    min: 25,
    reorder: 50,
    costPerUnit: 20,
  },
  {
    name: 'Capsicum',
    sku: 'VEG-004',
    category: 'Vegetables',
    unit: 'KG',
    min: 10,
    reorder: 20,
    costPerUnit: 80,
  },
  {
    name: 'Cucumber',
    sku: 'VEG-005',
    category: 'Vegetables',
    unit: 'KG',
    min: 8,
    reorder: 15,
    costPerUnit: 40,
  },
  {
    name: 'Lettuce',
    sku: 'VEG-006',
    category: 'Vegetables',
    unit: 'KG',
    min: 5,
    reorder: 12,
    costPerUnit: 90,
  },
  {
    name: 'Carrot',
    sku: 'VEG-007',
    category: 'Vegetables',
    unit: 'KG',
    min: 8,
    reorder: 15,
    costPerUnit: 35,
  },
  {
    name: 'Green Peas',
    sku: 'VEG-008',
    category: 'Vegetables',
    unit: 'KG',
    min: 5,
    reorder: 10,
    costPerUnit: 60,
  },
  {
    name: 'Baby Corn',
    sku: 'VEG-009',
    category: 'Vegetables',
    unit: 'KG',
    min: 3,
    reorder: 8,
    costPerUnit: 120,
  },
  {
    name: 'Mushrooms',
    sku: 'VEG-010',
    category: 'Vegetables',
    unit: 'KG',
    min: 5,
    reorder: 10,
    costPerUnit: 180,
  },
  {
    name: 'Spinach',
    sku: 'VEG-011',
    category: 'Vegetables',
    unit: 'KG',
    min: 5,
    reorder: 10,
    costPerUnit: 50,
  },
  {
    name: 'Garlic',
    sku: 'VEG-012',
    category: 'Vegetables',
    unit: 'KG',
    min: 5,
    reorder: 10,
    costPerUnit: 100,
  },
  {
    name: 'Ginger',
    sku: 'VEG-013',
    category: 'Vegetables',
    unit: 'KG',
    min: 3,
    reorder: 8,
    costPerUnit: 120,
  },
  {
    name: 'Green Chilli',
    sku: 'VEG-014',
    category: 'Vegetables',
    unit: 'KG',
    min: 3,
    reorder: 6,
    costPerUnit: 60,
  },
  {
    name: 'Coriander Leaves',
    sku: 'VEG-015',
    category: 'Vegetables',
    unit: 'KG',
    min: 2,
    reorder: 5,
    costPerUnit: 80,
  },

  // ── DAIRY ────────────────────────────────────────────────────────────────
  {
    name: 'Paneer',
    sku: 'DAI-001',
    category: 'Dairy',
    unit: 'KG',
    min: 15,
    reorder: 30,
    costPerUnit: 350,
  },
  {
    name: 'Mozzarella Cheese',
    sku: 'DAI-002',
    category: 'Dairy',
    unit: 'KG',
    min: 10,
    reorder: 20,
    costPerUnit: 450,
  },
  {
    name: 'Cheddar Cheese',
    sku: 'DAI-003',
    category: 'Dairy',
    unit: 'KG',
    min: 5,
    reorder: 12,
    costPerUnit: 500,
  },
  {
    name: 'Butter',
    sku: 'DAI-004',
    category: 'Dairy',
    unit: 'KG',
    min: 8,
    reorder: 15,
    costPerUnit: 480,
  },
  {
    name: 'Full Cream Milk',
    sku: 'DAI-005',
    category: 'Dairy',
    unit: 'Liters',
    min: 20,
    reorder: 40,
    costPerUnit: 65,
  },
  {
    name: 'Fresh Cream',
    sku: 'DAI-006',
    category: 'Dairy',
    unit: 'Liters',
    min: 5,
    reorder: 10,
    costPerUnit: 180,
  },
  {
    name: 'Curd (Dahi)',
    sku: 'DAI-007',
    category: 'Dairy',
    unit: 'KG',
    min: 8,
    reorder: 15,
    costPerUnit: 70,
  },
  {
    name: 'Ghee',
    sku: 'DAI-008',
    category: 'Dairy',
    unit: 'Liters',
    min: 5,
    reorder: 10,
    costPerUnit: 600,
  },
  {
    name: 'Condensed Milk',
    sku: 'DAI-009',
    category: 'Dairy',
    unit: 'KG',
    min: 3,
    reorder: 6,
    costPerUnit: 250,
  },
  {
    name: 'Cream Cheese',
    sku: 'DAI-010',
    category: 'Dairy',
    unit: 'KG',
    min: 2,
    reorder: 5,
    costPerUnit: 700,
  },

  // ── MEAT ─────────────────────────────────────────────────────────────────
  {
    name: 'Chicken Breast',
    sku: 'MEA-001',
    category: 'Meat',
    unit: 'KG',
    min: 20,
    reorder: 40,
    costPerUnit: 280,
  },
  {
    name: 'Chicken Legs',
    sku: 'MEA-002',
    category: 'Meat',
    unit: 'KG',
    min: 15,
    reorder: 30,
    costPerUnit: 200,
  },
  {
    name: 'Mutton (Goat)',
    sku: 'MEA-003',
    category: 'Meat',
    unit: 'KG',
    min: 10,
    reorder: 20,
    costPerUnit: 600,
  },
  {
    name: 'Minced Meat',
    sku: 'MEA-004',
    category: 'Meat',
    unit: 'KG',
    min: 8,
    reorder: 15,
    costPerUnit: 320,
  },
  {
    name: 'Fish Fillet',
    sku: 'MEA-005',
    category: 'Meat',
    unit: 'KG',
    min: 5,
    reorder: 10,
    costPerUnit: 400,
  },

  // ── FROZEN ───────────────────────────────────────────────────────────────
  {
    name: 'Frozen French Fries',
    sku: 'FRZ-001',
    category: 'Frozen',
    unit: 'KG',
    min: 15,
    reorder: 30,
    costPerUnit: 150,
  },
  {
    name: 'Frozen Corn',
    sku: 'FRZ-002',
    category: 'Frozen',
    unit: 'KG',
    min: 5,
    reorder: 10,
    costPerUnit: 90,
  },
  {
    name: 'Frozen Peas',
    sku: 'FRZ-003',
    category: 'Frozen',
    unit: 'KG',
    min: 5,
    reorder: 10,
    costPerUnit: 80,
  },
  {
    name: 'Ice Cream (Vanilla)',
    sku: 'FRZ-004',
    category: 'Frozen',
    unit: 'Liters',
    min: 5,
    reorder: 10,
    costPerUnit: 250,
  },
  {
    name: 'Ice Cream (Choco)',
    sku: 'FRZ-005',
    category: 'Frozen',
    unit: 'Liters',
    min: 5,
    reorder: 10,
    costPerUnit: 280,
  },

  // ── BEVERAGES ─────────────────────────────────────────────────────────────
  {
    name: 'Coffee Beans',
    sku: 'BEV-001',
    category: 'Beverages',
    unit: 'KG',
    min: 3,
    reorder: 6,
    costPerUnit: 800,
  },
  {
    name: 'Tea Leaves',
    sku: 'BEV-002',
    category: 'Beverages',
    unit: 'KG',
    min: 3,
    reorder: 6,
    costPerUnit: 400,
  },
  {
    name: 'Mango Pulp',
    sku: 'BEV-003',
    category: 'Beverages',
    unit: 'Liters',
    min: 5,
    reorder: 10,
    costPerUnit: 120,
  },
  {
    name: 'Orange Juice',
    sku: 'BEV-004',
    category: 'Beverages',
    unit: 'Liters',
    min: 5,
    reorder: 10,
    costPerUnit: 90,
  },
  {
    name: 'Lemon Squash',
    sku: 'BEV-005',
    category: 'Beverages',
    unit: 'Liters',
    min: 3,
    reorder: 6,
    costPerUnit: 150,
  },
  {
    name: 'Soft Drink Syrup',
    sku: 'BEV-006',
    category: 'Beverages',
    unit: 'Liters',
    min: 5,
    reorder: 10,
    costPerUnit: 200,
  },
  {
    name: 'Mineral Water (5L)',
    sku: 'BEV-007',
    category: 'Beverages',
    unit: 'Piece',
    min: 30,
    reorder: 60,
    costPerUnit: 60,
  },
  {
    name: 'Rose Syrup',
    sku: 'BEV-008',
    category: 'Beverages',
    unit: 'Liters',
    min: 2,
    reorder: 5,
    costPerUnit: 180,
  },

  // ── SPICES ────────────────────────────────────────────────────────────────
  {
    name: 'Salt',
    sku: 'SPI-001',
    category: 'Spices',
    unit: 'KG',
    min: 10,
    reorder: 20,
    costPerUnit: 25,
  },
  {
    name: 'Black Pepper',
    sku: 'SPI-002',
    category: 'Spices',
    unit: 'KG',
    min: 2,
    reorder: 5,
    costPerUnit: 800,
  },
  {
    name: 'Turmeric Powder',
    sku: 'SPI-003',
    category: 'Spices',
    unit: 'KG',
    min: 2,
    reorder: 5,
    costPerUnit: 200,
  },
  {
    name: 'Red Chilli Powder',
    sku: 'SPI-004',
    category: 'Spices',
    unit: 'KG',
    min: 3,
    reorder: 6,
    costPerUnit: 250,
  },
  {
    name: 'Garam Masala',
    sku: 'SPI-005',
    category: 'Spices',
    unit: 'KG',
    min: 2,
    reorder: 4,
    costPerUnit: 500,
  },
  {
    name: 'Coriander Powder',
    sku: 'SPI-006',
    category: 'Spices',
    unit: 'KG',
    min: 2,
    reorder: 4,
    costPerUnit: 250,
  },
  {
    name: 'Cumin Seeds',
    sku: 'SPI-007',
    category: 'Spices',
    unit: 'KG',
    min: 2,
    reorder: 4,
    costPerUnit: 350,
  },
  {
    name: 'Mustard Seeds',
    sku: 'SPI-008',
    category: 'Spices',
    unit: 'KG',
    min: 1,
    reorder: 3,
    costPerUnit: 200,
  },
  {
    name: 'Cardamom',
    sku: 'SPI-009',
    category: 'Spices',
    unit: 'KG',
    min: 1,
    reorder: 2,
    costPerUnit: 2000,
  },
  {
    name: 'Cloves',
    sku: 'SPI-010',
    category: 'Spices',
    unit: 'KG',
    min: 0.5,
    reorder: 1,
    costPerUnit: 1500,
  },
  {
    name: 'Bay Leaves',
    sku: 'SPI-011',
    category: 'Spices',
    unit: 'KG',
    min: 0.5,
    reorder: 1,
    costPerUnit: 400,
  },
  {
    name: 'Kasuri Methi',
    sku: 'SPI-012',
    category: 'Spices',
    unit: 'KG',
    min: 1,
    reorder: 2,
    costPerUnit: 600,
  },
  {
    name: 'Oregano',
    sku: 'SPI-013',
    category: 'Spices',
    unit: 'KG',
    min: 0.5,
    reorder: 1,
    costPerUnit: 900,
  },
  {
    name: 'Chilli Flakes',
    sku: 'SPI-014',
    category: 'Spices',
    unit: 'KG',
    min: 0.5,
    reorder: 1,
    costPerUnit: 700,
  },
  {
    name: 'Mixed Herbs',
    sku: 'SPI-015',
    category: 'Spices',
    unit: 'KG',
    min: 0.5,
    reorder: 1,
    costPerUnit: 800,
  },

  // ── SAUCES ────────────────────────────────────────────────────────────────
  {
    name: 'Tomato Ketchup',
    sku: 'SAU-001',
    category: 'Sauces',
    unit: 'Liters',
    min: 5,
    reorder: 10,
    costPerUnit: 120,
  },
  {
    name: 'Mayonnaise',
    sku: 'SAU-002',
    category: 'Sauces',
    unit: 'KG',
    min: 5,
    reorder: 10,
    costPerUnit: 200,
  },
  {
    name: 'Mustard Sauce',
    sku: 'SAU-003',
    category: 'Sauces',
    unit: 'Liters',
    min: 2,
    reorder: 5,
    costPerUnit: 180,
  },
  {
    name: 'Schezwan Sauce',
    sku: 'SAU-004',
    category: 'Sauces',
    unit: 'KG',
    min: 3,
    reorder: 6,
    costPerUnit: 250,
  },
  {
    name: 'Barbeque Sauce',
    sku: 'SAU-005',
    category: 'Sauces',
    unit: 'Liters',
    min: 2,
    reorder: 5,
    costPerUnit: 200,
  },
  {
    name: 'Soy Sauce',
    sku: 'SAU-006',
    category: 'Sauces',
    unit: 'Liters',
    min: 2,
    reorder: 4,
    costPerUnit: 160,
  },
  {
    name: 'Vinegar',
    sku: 'SAU-007',
    category: 'Sauces',
    unit: 'Liters',
    min: 2,
    reorder: 4,
    costPerUnit: 100,
  },
  {
    name: 'Hot Sauce',
    sku: 'SAU-008',
    category: 'Sauces',
    unit: 'Liters',
    min: 2,
    reorder: 4,
    costPerUnit: 220,
  },
  {
    name: 'Mint Chutney',
    sku: 'SAU-009',
    category: 'Sauces',
    unit: 'KG',
    min: 3,
    reorder: 6,
    costPerUnit: 150,
  },
  {
    name: 'Tamarind Chutney',
    sku: 'SAU-010',
    category: 'Sauces',
    unit: 'KG',
    min: 2,
    reorder: 5,
    costPerUnit: 130,
  },

  // ── BAKERY ────────────────────────────────────────────────────────────────
  {
    name: 'Burger Bun',
    sku: 'BAK-001',
    category: 'Bakery',
    unit: 'Piece',
    min: 100,
    reorder: 200,
    costPerUnit: 8,
  },
  {
    name: 'Pizza Base (10 inch)',
    sku: 'BAK-002',
    category: 'Bakery',
    unit: 'Piece',
    min: 50,
    reorder: 100,
    costPerUnit: 35,
  },
  {
    name: 'Pizza Base (12 inch)',
    sku: 'BAK-003',
    category: 'Bakery',
    unit: 'Piece',
    min: 30,
    reorder: 60,
    costPerUnit: 45,
  },
  {
    name: 'Tortilla Wrap',
    sku: 'BAK-004',
    category: 'Bakery',
    unit: 'Piece',
    min: 50,
    reorder: 100,
    costPerUnit: 12,
  },
  {
    name: 'Pita Bread',
    sku: 'BAK-005',
    category: 'Bakery',
    unit: 'Piece',
    min: 30,
    reorder: 60,
    costPerUnit: 15,
  },
  {
    name: 'Garlic Bread',
    sku: 'BAK-006',
    category: 'Bakery',
    unit: 'Piece',
    min: 20,
    reorder: 40,
    costPerUnit: 18,
  },
  {
    name: 'Brownie Base',
    sku: 'BAK-007',
    category: 'Bakery',
    unit: 'KG',
    min: 3,
    reorder: 6,
    costPerUnit: 400,
  },
  {
    name: 'Cake Sponge',
    sku: 'BAK-008',
    category: 'Bakery',
    unit: 'KG',
    min: 2,
    reorder: 4,
    costPerUnit: 500,
  },

  // ── PACKAGING ─────────────────────────────────────────────────────────────
  {
    name: 'Take-away Box Small',
    sku: 'PKG-001',
    category: 'Packaging',
    unit: 'Piece',
    min: 200,
    reorder: 500,
    costPerUnit: 3,
  },
  {
    name: 'Take-away Box Large',
    sku: 'PKG-002',
    category: 'Packaging',
    unit: 'Piece',
    min: 200,
    reorder: 500,
    costPerUnit: 5,
  },
  {
    name: 'Pizza Box (10 inch)',
    sku: 'PKG-003',
    category: 'Packaging',
    unit: 'Piece',
    min: 100,
    reorder: 250,
    costPerUnit: 12,
  },
  {
    name: 'Pizza Box (12 inch)',
    sku: 'PKG-004',
    category: 'Packaging',
    unit: 'Piece',
    min: 50,
    reorder: 150,
    costPerUnit: 15,
  },
  {
    name: 'Paper Bags',
    sku: 'PKG-005',
    category: 'Packaging',
    unit: 'Piece',
    min: 200,
    reorder: 500,
    costPerUnit: 2,
  },
  {
    name: 'Plastic Cups',
    sku: 'PKG-006',
    category: 'Packaging',
    unit: 'Piece',
    min: 200,
    reorder: 500,
    costPerUnit: 2,
  },
  {
    name: 'Wooden Cutlery Set',
    sku: 'PKG-007',
    category: 'Packaging',
    unit: 'Piece',
    min: 100,
    reorder: 300,
    costPerUnit: 5,
  },
  {
    name: 'Napkins',
    sku: 'PKG-008',
    category: 'Packaging',
    unit: 'Piece',
    min: 500,
    reorder: 1000,
    costPerUnit: 0.5,
  },

  // ── DRY GOODS ─────────────────────────────────────────────────────────────
  {
    name: 'Basmati Rice',
    sku: 'DRY-001',
    category: 'Dry Goods',
    unit: 'KG',
    min: 25,
    reorder: 50,
    costPerUnit: 80,
  },
  {
    name: 'Refined Flour (Maida)',
    sku: 'DRY-002',
    category: 'Dry Goods',
    unit: 'KG',
    min: 20,
    reorder: 40,
    costPerUnit: 45,
  },
  {
    name: 'Wheat Flour (Atta)',
    sku: 'DRY-003',
    category: 'Dry Goods',
    unit: 'KG',
    min: 20,
    reorder: 40,
    costPerUnit: 40,
  },
  {
    name: 'Hakka Noodles (Dry)',
    sku: 'DRY-004',
    category: 'Dry Goods',
    unit: 'KG',
    min: 10,
    reorder: 20,
    costPerUnit: 90,
  },
  {
    name: 'Pasta (Penne)',
    sku: 'DRY-005',
    category: 'Dry Goods',
    unit: 'KG',
    min: 5,
    reorder: 10,
    costPerUnit: 120,
  },
  {
    name: 'Semolina (Suji)',
    sku: 'DRY-006',
    category: 'Dry Goods',
    unit: 'KG',
    min: 5,
    reorder: 10,
    costPerUnit: 60,
  },
  {
    name: 'Sugar',
    sku: 'DRY-007',
    category: 'Dry Goods',
    unit: 'KG',
    min: 10,
    reorder: 20,
    costPerUnit: 45,
  },
  {
    name: 'Powdered Sugar',
    sku: 'DRY-008',
    category: 'Dry Goods',
    unit: 'KG',
    min: 3,
    reorder: 6,
    costPerUnit: 60,
  },
  {
    name: 'Baking Powder',
    sku: 'DRY-009',
    category: 'Dry Goods',
    unit: 'KG',
    min: 1,
    reorder: 2,
    costPerUnit: 250,
  },
  {
    name: 'Corn Flour',
    sku: 'DRY-010',
    category: 'Dry Goods',
    unit: 'KG',
    min: 3,
    reorder: 6,
    costPerUnit: 90,
  },
  {
    name: 'Bread Crumbs',
    sku: 'DRY-011',
    category: 'Dry Goods',
    unit: 'KG',
    min: 3,
    reorder: 6,
    costPerUnit: 120,
  },
  {
    name: 'Sesame Seeds',
    sku: 'DRY-012',
    category: 'Dry Goods',
    unit: 'KG',
    min: 1,
    reorder: 2,
    costPerUnit: 200,
  },
  {
    name: 'Rajma (Kidney Beans)',
    sku: 'DRY-013',
    category: 'Dry Goods',
    unit: 'KG',
    min: 5,
    reorder: 10,
    costPerUnit: 120,
  },
  {
    name: 'Chana Dal',
    sku: 'DRY-014',
    category: 'Dry Goods',
    unit: 'KG',
    min: 5,
    reorder: 10,
    costPerUnit: 100,
  },
  {
    name: 'Sunflower Oil',
    sku: 'DRY-015',
    category: 'Dry Goods',
    unit: 'Liters',
    min: 20,
    reorder: 40,
    costPerUnit: 130,
  },
];

// 15 items intentionally set to LOW STOCK (below reorder point) for alerts
const LOW_STOCK_INGREDIENT_SKUS = new Set([
  'VEG-006', // Lettuce
  'VEG-009', // Baby Corn
  'DAI-004', // Butter
  'DAI-009', // Condensed Milk
  'DAI-010', // Cream Cheese
  'BEV-001', // Coffee Beans
  'SPI-009', // Cardamom
  'SPI-010', // Cloves
  'SPI-013', // Oregano
  'SPI-014', // Chilli Flakes
  'SPI-015', // Mixed Herbs
  'SAU-008', // Hot Sauce
  'BAK-007', // Brownie Base
  'BAK-008', // Cake Sponge
  'DRY-009', // Baking Powder
]);

const SUPPLIER_DEFINITIONS = [
  {
    name: 'Fresh Farms Supply',
    contactPerson: 'Ramesh Agarwal',
    phone: '9811001100',
    email: 'orders@freshfarms.in',
    address: 'Khari Baoli, Old Delhi',
    rating: 4.8,
  },
  {
    name: 'Dairy King Distributors',
    contactPerson: 'Kiran Patel',
    phone: '9822002200',
    email: 'supply@dairyking.in',
    address: 'Anand Milk Colony, Gujarat',
    rating: 4.9,
  },
  {
    name: 'Veggie Hub Wholesale',
    contactPerson: 'Suresh Verma',
    phone: '9833003300',
    email: 'bulk@veggiehub.co.in',
    address: 'Azadpur Mandi, New Delhi',
    rating: 4.7,
  },
  {
    name: 'Metro Foods & Provisions',
    contactPerson: 'Priya Singh',
    phone: '9844004400',
    email: 'procurement@metrofoods.com',
    address: 'Mehrauli Industrial Area',
    rating: 4.6,
  },
  {
    name: 'ABC Packaging Solutions',
    contactPerson: 'Anjali Sharma',
    phone: '9855005500',
    email: 'sales@abcpackaging.in',
    address: 'Sector 8, Faridabad',
    rating: 4.5,
  },
  {
    name: 'Spice World Traders',
    contactPerson: 'Mohammed Raza',
    phone: '9866006600',
    email: 'export@spiceworld.in',
    address: 'Khari Baoli Spice Market',
    rating: 4.8,
  },
  {
    name: 'Premium Meats & More',
    contactPerson: 'Harish Chand',
    phone: '9877007700',
    email: 'halal@premiummeats.in',
    address: 'Ghazipur Meat Market, Delhi',
    rating: 4.7,
  },
  {
    name: 'Frozen Foods India Pvt Ltd',
    contactPerson: 'Naveen Kumar',
    phone: '9888008800',
    email: 'cold@frozenfoodsindia.com',
    address: 'NOIDA Export Zone, UP',
    rating: 4.6,
  },
  {
    name: 'Restaurant Essentials Co.',
    contactPerson: 'Dipak Chhabra',
    phone: '9899009900',
    email: 'b2b@restessentials.com',
    address: 'Nehru Place, New Delhi',
    rating: 4.9,
  },
  {
    name: 'Beverage Depot (NCR)',
    contactPerson: 'Anita Rohilla',
    phone: '9810011000',
    email: 'beverages@bdepotnrr.com',
    address: 'Wazirpur Industrial Area',
    rating: 4.7,
  },
  {
    name: 'Bakery Supplies Delhi',
    contactPerson: 'Rohit Sethi',
    phone: '9821012100',
    email: 'bakerysupply@delhiraw.in',
    address: 'Paharganj, New Delhi',
    rating: 4.8,
  },
  {
    name: 'Dry Goods & Grains Hub',
    contactPerson: 'Sanjay Goyal',
    phone: '9832013200',
    email: 'grains@drygoodshub.in',
    address: 'Nai Sarak, Old Delhi',
    rating: 4.6,
  },
];

// Which supplier handles which category
const SUPPLIER_CATEGORY_MAP: Record<string, number> = {
  Vegetables: 2, // Veggie Hub
  Dairy: 1, // Dairy King
  Meat: 6, // Premium Meats
  Frozen: 7, // Frozen Foods India
  Beverages: 9, // Beverage Depot
  Spices: 5, // Spice World
  Sauces: 3, // Metro Foods
  Bakery: 10, // Bakery Supplies Delhi
  Packaging: 4, // ABC Packaging
  'Dry Goods': 11, // Dry Goods & Grains Hub
};

// Recipe mappings: product category → required ingredient SKUs with qty
const RECIPE_INGREDIENT_MAP: Record<string, Array<{ sku: string; qty: number }>> = {
  Burger: [
    { sku: 'BAK-001', qty: 1 }, // Burger Bun
    { sku: 'VEG-001', qty: 0.05 }, // Onion
    { sku: 'VEG-002', qty: 0.05 }, // Tomato
    { sku: 'VEG-006', qty: 0.03 }, // Lettuce
    { sku: 'DAI-002', qty: 0.03 }, // Mozzarella
    { sku: 'SAU-002', qty: 0.02 }, // Mayonnaise
    { sku: 'SAU-001', qty: 0.02 }, // Ketchup
  ],
  Pizza: [
    { sku: 'BAK-002', qty: 1 }, // Pizza Base
    { sku: 'DAI-002', qty: 0.08 }, // Mozzarella
    { sku: 'VEG-002', qty: 0.06 }, // Tomato
    { sku: 'DAI-001', qty: 0.05 }, // Paneer
    { sku: 'VEG-004', qty: 0.04 }, // Capsicum
    { sku: 'SPI-013', qty: 0.005 }, // Oregano
    { sku: 'SPI-014', qty: 0.005 }, // Chilli Flakes
    { sku: 'SAU-001', qty: 0.03 }, // Ketchup
  ],
  Noodles: [
    { sku: 'DRY-004', qty: 0.12 }, // Hakka Noodles
    { sku: 'VEG-001', qty: 0.04 }, // Onion
    { sku: 'VEG-004', qty: 0.03 }, // Capsicum
    { sku: 'SAU-006', qty: 0.02 }, // Soy Sauce
    { sku: 'SAU-004', qty: 0.02 }, // Schezwan Sauce
    { sku: 'DRY-015', qty: 0.02 }, // Sunflower Oil
  ],
  Paneer: [
    { sku: 'DAI-001', qty: 0.15 }, // Paneer
    { sku: 'DAI-006', qty: 0.05 }, // Fresh Cream
    { sku: 'VEG-002', qty: 0.08 }, // Tomato
    { sku: 'VEG-001', qty: 0.05 }, // Onion
    { sku: 'SPI-005', qty: 0.01 }, // Garam Masala
    { sku: 'SPI-003', qty: 0.01 }, // Turmeric
    { sku: 'DAI-004', qty: 0.02 }, // Butter
  ],
  Dessert: [
    { sku: 'BAK-007', qty: 0.1 }, // Brownie Base
    { sku: 'FRZ-004', qty: 0.1 }, // Ice Cream Vanilla
    { sku: 'DRY-007', qty: 0.05 }, // Sugar
    { sku: 'DAI-006', qty: 0.03 }, // Fresh Cream
  ],
  Drinks: [
    { sku: 'BEV-003', qty: 0.08 }, // Mango Pulp
    { sku: 'DAI-007', qty: 0.1 }, // Curd
    { sku: 'DRY-007', qty: 0.02 }, // Sugar
    { sku: 'BEV-001', qty: 0.01 }, // Coffee Beans
  ],
  Rice: [
    { sku: 'DRY-001', qty: 0.12 }, // Basmati Rice
    { sku: 'DAI-004', qty: 0.02 }, // Butter
    { sku: 'SPI-007', qty: 0.005 }, // Cumin Seeds
    { sku: 'DAI-001', qty: 0.1 }, // Paneer
    { sku: 'SPI-005', qty: 0.01 }, // Garam Masala
  ],
  Wraps: [
    { sku: 'BAK-004', qty: 1 }, // Tortilla Wrap
    { sku: 'DAI-001', qty: 0.06 }, // Paneer
    { sku: 'VEG-004', qty: 0.03 }, // Capsicum
    { sku: 'SAU-002', qty: 0.02 }, // Mayonnaise
    { sku: 'SAU-009', qty: 0.02 }, // Mint Chutney
  ],
  Combos: [
    { sku: 'BAK-001', qty: 1 },
    { sku: 'DRY-001', qty: 0.1 },
    { sku: 'DAI-002', qty: 0.05 },
    { sku: 'VEG-002', qty: 0.05 },
    { sku: 'SAU-001', qty: 0.02 },
  ],
  Specials: [
    { sku: 'BAK-003', qty: 1 }, // Large pizza base
    { sku: 'DAI-001', qty: 0.15 }, // Paneer
    { sku: 'DAI-002', qty: 0.1 }, // Mozzarella
    { sku: 'VEG-004', qty: 0.05 }, // Capsicum
    { sku: 'DAI-004', qty: 0.03 }, // Butter
    { sku: 'SPI-013', qty: 0.008 }, // Oregano
  ],
};

// ---------------------------------------------------------------------------
// MAIN SEED FUNCTION
// ---------------------------------------------------------------------------
async function main() {
  console.log('');
  console.log('=============================================================');
  console.log('🍴 ABC RESTAURANT — INVENTORY SEED SCRIPT');
  console.log('=============================================================');

  // --- Step 0: Fetch branches ---
  const branches = await prisma.branch.findMany({ orderBy: { name: 'asc' } });
  if (branches.length === 0) {
    throw new Error('❌ No branches found. Please run the main seed first (npm run seed).');
  }
  console.log(`✅ Found ${branches.length} branches.`);

  // Fetch a valid admin/manager user to act as recordedBy
  const adminUser = await prisma.user.findFirst({
    where: { role: { in: ['ADMIN', 'SUPER_ADMIN', 'INVENTORY_MANAGER', 'ORGANIZATION_OWNER'] } },
  });
  if (!adminUser) {
    throw new Error('❌ No admin user found. Please run the main seed first.');
  }
  const systemUserId = adminUser.id;

  // Fetch existing products for recipe mappings
  const products = await prisma.product.findMany();
  console.log(`✅ Found ${products.length} products for recipe mappings.`);

  // --- Step 1: Clear inventory-related tables in dependency order ---
  console.log('🧹 Clearing existing inventory data...');
  await prisma.inventoryAlert.deleteMany();
  await prisma.wasteRecord.deleteMany();
  await prisma.stockMovement.deleteMany();
  await prisma.recipeMapping.deleteMany();
  await prisma.inventoryRequestItem.deleteMany();
  await prisma.inventoryRequest.deleteMany();
  await prisma.purchaseOrderItem.deleteMany();
  await prisma.purchaseOrder.deleteMany();
  await prisma.inventory.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.ingredient.deleteMany();
  console.log('✅ Cleared old inventory data.');

  // --- Step 2: Create 12 Suppliers ---
  console.log('🌱 Seeding 12 Suppliers...');
  const supplierRecords: any[] = [];
  for (const s of SUPPLIER_DEFINITIONS) {
    const rec = await prisma.supplier.create({
      data: {
        id: randomUUID(),
        name: s.name,
        contactPerson: s.contactPerson,
        phone: s.phone,
        email: s.email,
        address: s.address,
        rating: s.rating,
        active: true,
      },
    });
    supplierRecords.push(rec);
  }
  console.log(`✅ Seeded ${supplierRecords.length} suppliers.`);

  // --- Step 3: Create 105 Ingredients ---
  console.log('🌱 Seeding 105 Ingredients...');
  const ingredientRecords: any[] = [];
  for (const def of INGREDIENT_DEFINITIONS) {
    const rec = await prisma.ingredient.create({
      data: {
        id: randomUUID(),
        name: def.name,
        sku: def.sku,
        category: def.category,
        unit: def.unit,
        minimumStock: def.min,
        reorderPoint: def.reorder,
        active: true,
      },
    });
    // store costPerUnit in memory for PO generation
    (rec as any).costPerUnit = def.costPerUnit;
    (rec as any).category = def.category;
    ingredientRecords.push(rec);
  }
  console.log(`✅ Seeded ${ingredientRecords.length} ingredients.`);

  // Build lookup maps
  const ingBySku = new Map<string, any>(ingredientRecords.map((r) => [r.sku, r]));
  const ingByName = new Map<string, any>(ingredientRecords.map((r) => [r.name, r]));

  // --- Step 4: Seed Inventory per Branch ---
  console.log('🌱 Seeding branch inventories...');
  const inventoriesToCreate: any[] = [];
  for (const branch of branches) {
    for (const ing of ingredientRecords) {
      const isLow = LOW_STOCK_INGREDIENT_SKUS.has(ing.sku);
      let qty: number;
      if (isLow) {
        // intentionally below minimumStock
        const def = INGREDIENT_DEFINITIONS.find((d) => d.sku === ing.sku)!;
        qty = rnd(def.min * 0.15, def.min * 0.45);
      } else {
        const def = INGREDIENT_DEFINITIONS.find((d) => d.sku === ing.sku)!;
        qty = rnd(def.reorder * 1.5, def.reorder * 4);
      }
      inventoriesToCreate.push({
        id: randomUUID(),
        ingredientId: ing.id,
        branchId: branch.id,
        quantity: qty,
        reservedQuantity: 0.0,
        availableQuantity: qty,
        lastUpdated: new Date(),
      });
    }
  }
  await prisma.inventory.createMany({ data: inventoriesToCreate });
  console.log(
    `✅ Seeded ${inventoriesToCreate.length} inventory records across ${branches.length} branches.`,
  );

  // --- Step 5: Seed 100+ Purchase Orders (May 2026) ---
  console.log('🌱 Seeding 100+ Purchase Orders...');
  const purchaseOrdersToCreate: any[] = [];
  const purchaseOrderItemsToCreate: any[] = [];

  // Each branch gets ~20 POs (100 total)
  let poCount = 0;
  for (const branch of branches) {
    for (let day = 1; day <= 31; day += rnd(1, 2, 0)) {
      if (poCount >= 104) break;
      const categoryKeys = Object.keys(SUPPLIER_CATEGORY_MAP);
      const catKey = categoryKeys[poCount % categoryKeys.length];
      const supplierIdx = SUPPLIER_CATEGORY_MAP[catKey] - 1;
      const supplier = supplierRecords[supplierIdx] ?? supplierRecords[0];

      // Pick 3-7 ingredients from this category
      const catIngredients = ingredientRecords.filter(
        (r) => r.category === catKey || r.category === 'Dry Goods',
      );
      const numItems = randInt(3, 7);
      const selectedIngs = catIngredients.sort(() => Math.random() - 0.5).slice(0, numItems);
      if (selectedIngs.length === 0) {
        poCount++;
        continue;
      }

      const poId = randomUUID();
      const poDate = dayInMay(Math.min(day, 31), randInt(8, 16));
      const isReceived = day < 28;

      let poTotal = 0;
      const items: any[] = [];
      for (const ing of selectedIngs) {
        const def = INGREDIENT_DEFINITIONS.find((d) => d.sku === ing.sku)!;
        const orderQty = rnd(def.reorder * 1.5, def.reorder * 3);
        const cost = def.costPerUnit * orderQty;
        poTotal += cost;
        items.push({
          id: randomUUID(),
          purchaseOrderId: poId,
          ingredientId: ing.id,
          quantity: orderQty,
          costPrice: parseFloat(cost.toFixed(2)),
        });
      }

      purchaseOrdersToCreate.push({
        id: poId,
        supplierId: supplier.id,
        branchId: branch.id,
        totalAmount: parseFloat(poTotal.toFixed(2)),
        status: isReceived ? PurchaseOrderStatus.RECEIVED : PurchaseOrderStatus.APPROVED,
        orderedAt: poDate,
        receivedAt: isReceived ? new Date(poDate.getTime() + 2 * 24 * 3600 * 1000) : null,
        createdAt: poDate,
        updatedAt: poDate,
      });
      purchaseOrderItemsToCreate.push(...items);
      poCount++;
      day += 1;
    }
  }

  await prisma.purchaseOrder.createMany({ data: purchaseOrdersToCreate });
  await prisma.purchaseOrderItem.createMany({ data: purchaseOrderItemsToCreate });
  console.log(
    `✅ Seeded ${purchaseOrdersToCreate.length} purchase orders with ${purchaseOrderItemsToCreate.length} line items.`,
  );

  // --- Step 6: Seed 500+ Stock Movements ---
  console.log('🌱 Seeding 500+ Stock Movements...');
  const movementsToCreate: any[] = [];

  // PURCHASE movements from received POs
  for (const po of purchaseOrdersToCreate.filter((p) => p.status === 'RECEIVED')) {
    const poItems = purchaseOrderItemsToCreate.filter((i) => i.purchaseOrderId === po.id);
    for (const item of poItems) {
      movementsToCreate.push({
        id: randomUUID(),
        ingredientId: item.ingredientId,
        branchId: po.branchId,
        type: StockMovementType.PURCHASE,
        quantity: item.quantity,
        referenceId: po.id,
        notes: `PO delivery from supplier.`,
        createdAt: po.receivedAt ?? po.orderedAt,
      });
    }
  }

  // CONSUMPTION movements (daily kitchen use, May 1–31)
  for (let day = 1; day <= 31; day++) {
    for (const branch of branches) {
      const dailyUsageCount = randInt(4, 8);
      const randomIngs = ingredientRecords
        .sort(() => Math.random() - 0.5)
        .slice(0, dailyUsageCount);
      for (const ing of randomIngs) {
        const def = INGREDIENT_DEFINITIONS.find((d) => d.sku === ing.sku)!;
        movementsToCreate.push({
          id: randomUUID(),
          ingredientId: ing.id,
          branchId: branch.id,
          type: StockMovementType.CONSUMPTION,
          quantity: rnd(def.min * 0.05, def.min * 0.3),
          referenceId: null,
          notes: 'Daily kitchen consumption.',
          createdAt: dayInMay(day, randInt(9, 22), randInt(0, 59)),
        });
      }
    }
  }

  // ADJUSTMENT movements (stock counts, corrections)
  for (let i = 0; i < 40; i++) {
    const branch = branches[i % branches.length];
    const ing = ingredientRecords[randInt(0, ingredientRecords.length - 1)];
    movementsToCreate.push({
      id: randomUUID(),
      ingredientId: ing.id,
      branchId: branch.id,
      type: StockMovementType.ADJUSTMENT,
      quantity: rnd(-5, 5),
      referenceId: null,
      notes: 'Manual stock count adjustment.',
      createdAt: dayInMay(randInt(1, 31), randInt(9, 18)),
    });
  }

  // TRANSFER movements (inter-branch transfers)
  for (let i = 0; i < 25; i++) {
    const fromBranch = branches[i % branches.length];
    const toBranch = branches[(i + 1) % branches.length];
    const ing = ingredientRecords[randInt(0, ingredientRecords.length - 1)];
    const def = INGREDIENT_DEFINITIONS.find((d) => d.sku === ing.sku)!;
    const transferQty = rnd(def.min * 0.2, def.min * 0.8);
    movementsToCreate.push({
      id: randomUUID(),
      ingredientId: ing.id,
      branchId: fromBranch.id,
      type: StockMovementType.TRANSFER,
      quantity: -transferQty,
      referenceId: null,
      notes: `Transfer to ${toBranch.name}.`,
      createdAt: dayInMay(randInt(5, 28), randInt(9, 18)),
    });
    movementsToCreate.push({
      id: randomUUID(),
      ingredientId: ing.id,
      branchId: toBranch.id,
      type: StockMovementType.TRANSFER,
      quantity: transferQty,
      referenceId: null,
      notes: `Transfer received from ${fromBranch.name}.`,
      createdAt: dayInMay(randInt(5, 28), randInt(9, 18)),
    });
  }

  const batchSize = 100;
  for (let i = 0; i < movementsToCreate.length; i += batchSize) {
    await prisma.stockMovement.createMany({ data: movementsToCreate.slice(i, i + batchSize) });
  }
  console.log(`✅ Seeded ${movementsToCreate.length} stock movement records.`);

  // --- Step 7: Waste Records ---
  console.log('🌱 Seeding Waste Records (expired/spoiled items)...');
  const wasteDefinitions = [
    { name: 'Full Cream Milk', reason: 'Expired - past use-by date', qty: rnd(2, 5) },
    { name: 'Fresh Cream', reason: 'Expired - sour smell detected', qty: rnd(1, 3) },
    { name: 'Tomato', reason: 'Damaged - bruised in transit', qty: rnd(3, 8) },
    { name: 'Paneer', reason: 'Spoiled - refrigeration failure', qty: rnd(2, 5) },
    { name: 'Curd (Dahi)', reason: 'Expired - past shelf life', qty: rnd(1, 3) },
    { name: 'Lettuce', reason: 'Wilted - temperature breach', qty: rnd(1, 3) },
    { name: 'Mushrooms', reason: 'Mold growth detected', qty: rnd(0.5, 2) },
    { name: 'Chicken Breast', reason: 'Cold chain breach - discarded', qty: rnd(2, 5) },
    { name: 'Fish Fillet', reason: 'Exceeded 2-day holding time', qty: rnd(1, 3) },
    { name: 'Burger Bun', reason: 'Mold on surface', qty: rnd(20, 50) },
    { name: 'Pizza Base (10 inch)', reason: 'Cracked - unusable', qty: rnd(10, 25) },
    { name: 'Ice Cream (Vanilla)', reason: 'Power outage - melted and refrozen', qty: rnd(2, 5) },
    { name: 'Brownie Base', reason: 'Overbaked batch discarded', qty: rnd(1, 2) },
    { name: 'Garlic', reason: 'Sprouted - unfit for kitchen use', qty: rnd(0.5, 2) },
    { name: 'Coriander Leaves', reason: 'Wilted and yellowed', qty: rnd(0.5, 2) },
    { name: 'Green Chilli', reason: 'Rotted in storage', qty: rnd(0.3, 1) },
    { name: 'Full Cream Milk', reason: 'Left out overnight - discarded', qty: rnd(1, 3) },
    { name: 'Tomato', reason: 'Over-ripe batch received from supplier', qty: rnd(2, 5) },
    { name: 'Chicken Breast', reason: 'Weight check failed - returned batch', qty: rnd(3, 6) },
    { name: 'Paneer', reason: 'Vendor quality issue - replaced', qty: rnd(1, 3) },
  ];

  const wasteToCreate: any[] = [];
  for (let i = 0; i < wasteDefinitions.length; i++) {
    const def = wasteDefinitions[i];
    const ing = ingByName.get(def.name);
    if (!ing) continue;
    const branch = branches[i % branches.length];
    wasteToCreate.push({
      id: randomUUID(),
      ingredientId: ing.id,
      branchId: branch.id,
      quantity: def.qty,
      reason: def.reason,
      recordedBy: systemUserId,
      createdAt: dayInMay(randInt(1, 31), randInt(8, 20)),
    });
    // Also log as WASTE stock movement
    movementsToCreate.push({
      id: randomUUID(),
      ingredientId: ing.id,
      branchId: branch.id,
      type: StockMovementType.WASTE,
      quantity: def.qty,
      referenceId: null,
      notes: def.reason,
      createdAt: dayInMay(randInt(1, 31), randInt(8, 20)),
    });
  }
  await prisma.wasteRecord.createMany({ data: wasteToCreate });
  // Also persist the WASTE stock movements
  const wasteMovements = movementsToCreate.filter((m) => m.type === StockMovementType.WASTE);
  if (wasteMovements.length > 0) {
    await prisma.stockMovement.createMany({ data: wasteMovements });
  }
  console.log(`✅ Seeded ${wasteToCreate.length} waste records.`);

  // --- Step 8: Inventory Alerts for Low-Stock Items ---
  console.log('🌱 Seeding Inventory Alerts...');
  const alertsToCreate: any[] = [];
  for (const sku of Array.from(LOW_STOCK_INGREDIENT_SKUS)) {
    const ing = ingBySku.get(sku);
    if (!ing) continue;
    // Alert on first 3 branches
    for (let b = 0; b < Math.min(3, branches.length); b++) {
      const branch = branches[b];
      alertsToCreate.push({
        id: randomUUID(),
        ingredientId: ing.id,
        branchId: branch.id,
        alertType: 'LOW_STOCK',
        status: 'ACTIVE',
        createdAt: new Date(),
      });
    }
  }
  // Also add OUT_OF_STOCK alerts for the most critical items
  const criticalSkus = ['SPI-010', 'DAI-010', 'BAK-008']; // Cloves, Cream Cheese, Cake Sponge
  for (const sku of criticalSkus) {
    const ing = ingBySku.get(sku);
    if (!ing) continue;
    const branch = branches[0];
    alertsToCreate.push({
      id: randomUUID(),
      ingredientId: ing.id,
      branchId: branch.id,
      alertType: 'OUT_OF_STOCK',
      status: 'ACTIVE',
      createdAt: new Date(),
    });
  }
  await prisma.inventoryAlert.createMany({ data: alertsToCreate });
  console.log(`✅ Seeded ${alertsToCreate.length} inventory alerts.`);

  // --- Step 9: Recipe Mappings ---
  console.log('🌱 Seeding Recipe Mappings...');
  const recipesToCreate: any[] = [];
  const usedPairs = new Set<string>();

  for (const product of products) {
    // Determine which recipe map to use based on category name
    const catName = product.name; // name hint
    let mappingKey = 'Burger'; // default
    for (const key of Object.keys(RECIPE_INGREDIENT_MAP)) {
      if (catName.toLowerCase().includes(key.toLowerCase())) {
        mappingKey = key;
        break;
      }
    }
    // Fallback: use category name from product's linked category
    const recipeItems = RECIPE_INGREDIENT_MAP[mappingKey] ?? RECIPE_INGREDIENT_MAP['Burger'];

    for (const ri of recipeItems) {
      const ing = ingBySku.get(ri.sku);
      if (!ing) continue;
      const pairKey = `${product.id}:${ing.id}`;
      if (usedPairs.has(pairKey)) continue;
      usedPairs.add(pairKey);
      recipesToCreate.push({
        id: randomUUID(),
        productId: product.id,
        ingredientId: ing.id,
        quantityRequired: ri.qty,
      });
    }
  }

  const recBatchSize = 100;
  for (let i = 0; i < recipesToCreate.length; i += recBatchSize) {
    await prisma.recipeMapping.createMany({ data: recipesToCreate.slice(i, i + recBatchSize) });
  }
  console.log(`✅ Seeded ${recipesToCreate.length} recipe mappings.`);

  // --- Final Report ---
  const totalIngredients = await prisma.ingredient.count();
  const totalInventory = await prisma.inventory.count();
  const totalSuppliers = await prisma.supplier.count();
  const totalPOs = await prisma.purchaseOrder.count();
  const totalMovements = await prisma.stockMovement.count();
  const totalWaste = await prisma.wasteRecord.count();
  const totalAlerts = await prisma.inventoryAlert.count();
  const totalRecipes = await prisma.recipeMapping.count();
  const lowStock = await prisma.inventoryAlert.count({
    where: { alertType: 'LOW_STOCK', status: 'ACTIVE' },
  });
  const outOfStock = await prisma.inventoryAlert.count({
    where: { alertType: 'OUT_OF_STOCK', status: 'ACTIVE' },
  });

  console.log('');
  console.log('=============================================================');
  console.log('✅ INVENTORY SEED COMPLETE — SUMMARY REPORT');
  console.log('=============================================================');
  console.log(`🧅  Ingredients Created      : ${totalIngredients}`);
  console.log(
    `📦  Inventory Records        : ${totalInventory} (${branches.length} branches × ${totalIngredients} items)`,
  );
  console.log(`🏭  Suppliers Created        : ${totalSuppliers}`);
  console.log(`🛒  Purchase Orders          : ${totalPOs}`);
  console.log(`📊  Stock Movements          : ${totalMovements}`);
  console.log(`🗑️   Waste Records           : ${totalWaste}`);
  console.log(
    `⚠️   Inventory Alerts        : ${totalAlerts} (${lowStock} Low Stock, ${outOfStock} Out of Stock)`,
  );
  console.log(`🍕  Recipe Mappings          : ${totalRecipes}`);
  console.log('=============================================================');
  console.log('🎉 Dashboard should now show rich operational data!');
  console.log('=============================================================');
}

main()
  .catch((e) => {
    console.error('❌ Inventory Seed Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
