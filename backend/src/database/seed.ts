import { randomUUID } from 'crypto';

import {
  PrismaClient,
  Role,
  OrderStatus,
  OrderType,
  TableStatus,
  ReservationStatus,
  InventoryRequestStatus,
  KitchenPriority,
  KitchenOrderStatus,
  DeliveryStatus,
  PurchaseOrderStatus,
  StockMovementType,
  TransferStatus,
  POSOrderStatus,
  POSPaymentMethod,
  POSPaymentStatus,
  ShiftStatus,
  DiscountType,
  OtpType,
  RefundStatus,
} from '@prisma/client';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

import env from '../config/env';
import CartEvent from '../models/CartEvent';
import CheckoutEvent from '../models/CheckoutEvent';
import SearchAnalytic from '../models/SearchAnalytic';

const prisma = new PrismaClient();

async function main() {
  console.log(
    '🚀 Starting Batch-Optimized Unified Seeding for ABC Restaurant Management System...',
  );

  // 1. Establish MongoDB connection if URI is available
  let mongoConnected = false;
  try {
    if (env.MONGODB_URI) {
      mongoose.set('strictQuery', true);
      await mongoose.connect(env.MONGODB_URI);
      mongoConnected = true;
      console.log('✅ MongoDB connection verified.');
    }
  } catch (err) {
    console.warn('⚠️ MongoDB connection skipped or failed.');
  }

  // 2. Strict Purge of PostgreSQL tables (manually sequenced to bypass raw session replication role triggers)
  console.log('🧹 Purging all tables in dependency order...');

  await prisma.notification.deleteMany();
  await prisma.notificationPreference.deleteMany();
  await prisma.notificationTemplate.deleteMany();
  await prisma.campaign.deleteMany();
  await prisma.aIInsight.deleteMany();
  await prisma.customerSegment.deleteMany();
  await prisma.recommendation.deleteMany();

  await prisma.driverEarnings.deleteMany();
  await prisma.deliveryProof.deleteMany();
  await prisma.deliveryAssignment.deleteMany();
  await prisma.deliveryPartner.deleteMany();

  await prisma.kitchenTask.deleteMany();
  await prisma.kitchenOrder.deleteMany();
  await prisma.kitchenStation.deleteMany();

  await prisma.stockMovement.deleteMany();
  await prisma.wasteRecord.deleteMany();
  await prisma.recipeMapping.deleteMany();
  await prisma.inventoryAlert.deleteMany();
  await prisma.inventoryTransfer.deleteMany();
  await prisma.inventoryRequestItem.deleteMany();
  await prisma.inventoryRequest.deleteMany();
  await prisma.inventory.deleteMany();

  await prisma.purchaseOrderItem.deleteMany();
  await prisma.purchaseOrder.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.ingredient.deleteMany();

  await prisma.receipt.deleteMany();
  await prisma.pOSPayment.deleteMany();
  await prisma.pOSOrder.deleteMany();
  await prisma.cashDrawer.deleteMany();
  await prisma.pOSTerminal.deleteMany();

  await prisma.bill.deleteMany();
  await prisma.refund.deleteMany();
  await prisma.orderStatusHistory.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.orderDraft.deleteMany();

  await prisma.couponUsage.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.address.deleteMany();

  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.review.deleteMany();

  await prisma.waitlistEntry.deleteMany();
  await prisma.reservation.deleteMany();
  await prisma.table.deleteMany();
  await prisma.guestProfile.deleteMany();

  await prisma.otp.deleteMany();
  await prisma.emailVerificationToken.deleteMany();
  await prisma.passwordResetToken.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.tenantSettings.deleteMany();
  await prisma.user.deleteMany();

  await prisma.restaurantSettings.deleteMany();
  await prisma.branch.deleteMany();
  await prisma.category.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.restaurantGroup.deleteMany();
  await prisma.franchise.deleteMany();
  await prisma.organization.deleteMany();

  console.log('✅ Purging complete.');

  // 3. Create Root Organization
  console.log('🌱 Seeding Core Organization and Franchise Structures...');
  const org = await prisma.organization.create({
    data: {
      name: 'ABC Restaurant Management System',
      slug: 'abc-restaurant-group',
      status: 'ACTIVE',
    },
  });

  const franchise = await prisma.franchise.create({
    data: {
      organizationId: org.id,
      ownerName: 'Shubham Gupta',
      active: true,
    },
  });

  const restGroup = await prisma.restaurantGroup.create({
    data: {
      organizationId: org.id,
      name: 'ABC Premium Eateries',
      slug: 'abc-premium-eateries',
      status: 'ACTIVE',
    },
  });

  // 4. Create 5 Branches (exactly "Branch 1" to "Branch 5")
  const branches = [];
  const branchLocations = [
    {
      name: 'Branch 1',
      address: 'Cyber City, Phase 3',
      city: 'Gurugram',
      state: 'Haryana',
      lat: 28.495,
      lng: 77.089,
    },
    {
      name: 'Branch 2',
      address: 'Sector 29 Market',
      city: 'Gurugram',
      state: 'Haryana',
      lat: 28.4712,
      lng: 77.0721,
    },
    {
      name: 'Branch 3',
      address: 'Connaught Place, Inner Circle',
      city: 'New Delhi',
      state: 'Delhi',
      lat: 28.6304,
      lng: 77.2177,
    },
    {
      name: 'Branch 4',
      address: 'Aerocity Hospitality District',
      city: 'New Delhi',
      state: 'Delhi',
      lat: 28.5492,
      lng: 77.1214,
    },
    {
      name: 'Branch 5',
      address: 'Golf Course Road',
      city: 'Gurugram',
      state: 'Haryana',
      lat: 28.4389,
      lng: 77.1002,
    },
  ];

  for (let i = 0; i < 5; i++) {
    const loc = branchLocations[i];
    const branch = await prisma.branch.create({
      data: {
        organizationId: org.id,
        franchiseId: franchise.id,
        restaurantId: restGroup.id,
        name: loc.name,
        address: loc.address,
        city: loc.city,
        state: loc.state,
        latitude: loc.lat,
        longitude: loc.lng,
        openingTime: '09:00',
        closingTime: '23:00',
        deliveryRadius: 8.5,
        isActive: true,
      },
    });

    await prisma.restaurantSettings.create({
      data: {
        branchId: branch.id,
        taxRate: 5.0,
        deliveryFee: 40.0,
        currency: 'INR',
        autoAcceptOrders: true,
      },
    });

    branches.push(branch);
  }
  console.log(`✅ Seeded 5 Branches and Restaurant Settings.`);

  // Create POS Terminals for each branch
  const terminals = [];
  for (let i = 0; i < 5; i++) {
    const term = await prisma.pOSTerminal.create({
      data: {
        branchId: branches[i].id,
        terminalName: `POS Register 1`,
        active: true,
      },
    });
    terminals.push(term);
  }

  // Create 10 tables per branch (globally unique table numbers)
  const tablesToCreate = [];
  for (let i = 0; i < 5; i++) {
    const branch = branches[i];
    for (let t = 1; t <= 10; t++) {
      const id = randomUUID();
      tablesToCreate.push({
        id,
        branchId: branch.id,
        number: `T-BR${i + 1}-${t}`,
        capacity: t % 2 === 0 ? (t % 3 === 0 ? 6 : 4) : 2,
        status: TableStatus.AVAILABLE,
        active: true,
      });
    }
  }
  await prisma.table.createMany({ data: tablesToCreate });
  const dbTables = await prisma.table.findMany();

  // 5. Seed Users matching exact role counts
  console.log(
    '🌱 Seeding User Accounts (exactly 1 Org Owner, 1 System Admin, 5 Managers, 10 Kitchen, 5 Inventory, 10 Drivers, 20 Customers)...',
  );
  const salt = bcrypt.genSaltSync(10);
  const userPasswordHash = bcrypt.hashSync('Admin@123', salt);

  const usersToCreate: any[] = [];

  // 1 Organization Owner
  const ownerId = randomUUID();
  usersToCreate.push({
    id: ownerId,
    email: 'owner@abcrestaurant.com',
    phone: '+919999999000',
    firstName: 'Alok',
    lastName: 'Sharma',
    role: Role.ORGANIZATION_OWNER,
    passwordHash: userPasswordHash,
    organizationId: org.id,
    isEmailVerified: true,
    isPhoneVerified: true,
  });

  // 1 System Admin
  const adminId = randomUUID();
  usersToCreate.push({
    id: adminId,
    email: 'admin@abcrestaurant.com',
    phone: '+919999999050',
    firstName: 'System',
    lastName: 'Admin',
    role: Role.SUPER_ADMIN,
    passwordHash: userPasswordHash,
    organizationId: org.id,
    isEmailVerified: true,
    isPhoneVerified: true,
    salary: 55000,
  });

  // 5 Branch Managers
  const managerIds = [];
  for (let i = 1; i <= 5; i++) {
    const id = randomUUID();
    managerIds.push(id);
    usersToCreate.push({
      id,
      email: `manager.br${i}@abcrestaurant.com`,
      phone: `+91999999900${i}`,
      firstName: `Manager`,
      lastName: `Branch ${i}`,
      role: Role.BRANCH_MANAGER,
      passwordHash: userPasswordHash,
      organizationId: org.id,
      franchiseId: franchise.id,
      isEmailVerified: true,
      isPhoneVerified: true,
      salary: 48000,
      attendanceCount: 25,
      performanceScore: 4.8,
    });
  }

  // 10 Kitchen Staff
  const kitchenStaffIds = [];
  const categoriesList = [
    'Burger',
    'Pizza',
    'Noodles',
    'Paneer',
    'Dessert',
    'Drinks',
    'Rice',
    'Wraps',
    'Combos',
    'Specials',
  ];
  for (let i = 1; i <= 10; i++) {
    const id = randomUUID();
    kitchenStaffIds.push(id);
    usersToCreate.push({
      id,
      email: `cook${i}@abcrestaurant.com`,
      phone: `+91999999901${i - 1}`,
      firstName: `Chef`,
      lastName: `${i}`,
      role: Role.KITCHEN_STAFF,
      passwordHash: userPasswordHash,
      organizationId: org.id,
      isEmailVerified: true,
      isPhoneVerified: true,
      salary: 28000,
      attendanceCount: 24,
      performanceScore: parseFloat((4.0 + (i % 10) * 0.1).toFixed(1)),
      assignedCategory: categoriesList[(i - 1) % categoriesList.length],
    });
  }

  // 5 Inventory Managers
  const inventoryManagerIds = [];
  for (let i = 1; i <= 5; i++) {
    const id = randomUUID();
    inventoryManagerIds.push(id);
    usersToCreate.push({
      id,
      email: `inventory${i}@abcrestaurant.com`,
      phone: `+91999999902${i}`,
      firstName: `Store`,
      lastName: `Keeper ${i}`,
      role: Role.INVENTORY_MANAGER,
      passwordHash: userPasswordHash,
      organizationId: org.id,
      isEmailVerified: true,
      isPhoneVerified: true,
      salary: 32000,
      attendanceCount: 26,
      performanceScore: 4.5,
    });
  }

  // 10 Delivery Partners
  const driverUserIds = [];
  for (let i = 1; i <= 10; i++) {
    const id = randomUUID();
    driverUserIds.push(id);
    usersToCreate.push({
      id,
      email: `rider${i}@abcrestaurant.com`,
      phone: `+91999999903${i - 1}`,
      firstName: `Rider`,
      lastName: `${i}`,
      role: Role.DELIVERY_PARTNER,
      passwordHash: userPasswordHash,
      organizationId: org.id,
      isEmailVerified: true,
      isPhoneVerified: true,
      salary: 18000,
      attendanceCount: 23,
      performanceScore: parseFloat((4.2 + (i % 9) * 0.1).toFixed(1)),
    });
  }

  // 20 Customers
  const customerIds = [];
  for (let i = 1; i <= 20; i++) {
    const id = randomUUID();
    customerIds.push(id);
    usersToCreate.push({
      id,
      email: `customer${i}@abcrestaurant.com`,
      phone: `+91999999904${i - 1}`,
      firstName: `Client`,
      lastName: `${i}`,
      role: Role.CUSTOMER,
      passwordHash: userPasswordHash,
      isEmailVerified: true,
      isPhoneVerified: true,
    });
  }

  await prisma.user.createMany({ data: usersToCreate });

  // Create profiles for delivery partners
  const driverProfiles = [];
  for (let i = 0; i < 10; i++) {
    const profile = await prisma.deliveryPartner.create({
      data: {
        userId: driverUserIds[i],
        vehicleType: i % 2 === 0 ? 'Bike' : 'Scooter',
        vehicleNumber: `HR-26-AB-30${i}`,
        licenseNumber: `DL-KA-900${i}`,
        activeStatus: true,
        rating: 4.8,
      },
    });
    driverProfiles.push(profile);
  }

  console.log(`✅ Seeded exact user list and driver profiles.`);

  // 6. Seed Categories
  console.log('🌱 Seeding Menu Categories...');
  const categories = [];
  for (const name of categoriesList) {
    const cat = await prisma.category.create({
      data: {
        restaurantId: restGroup.id,
        name,
        slug: name.toLowerCase(),
        isActive: true,
      },
    });
    categories.push(cat);
  }

  // 7. Seed 20 Menu Products
  console.log('🌱 Seeding 20 Menu Products...');
  const productData = [
    { name: 'Veg Maharaja Burger', price: 299.0, cat: 'Burger', isVeg: true },
    { name: 'Spicy Paneer Burger', price: 249.0, cat: 'Burger', isVeg: true },
    { name: 'Classic Margherita Pizza', price: 399.0, cat: 'Pizza', isVeg: true },
    { name: 'Tandoori Paneer Pizza', price: 499.0, cat: 'Pizza', isVeg: true },
    { name: 'Veg Masala Noodles', price: 199.0, cat: 'Noodles', isVeg: true },
    { name: 'Schezwan Chilli Noodles', price: 219.0, cat: 'Noodles', isVeg: true },
    { name: 'Kadhai Paneer Thali', price: 349.0, cat: 'Paneer', isVeg: true },
    { name: 'Shahi Paneer Masala', price: 379.0, cat: 'Paneer', isVeg: true },
    { name: 'Gulab Jamun Cup (2 Pcs)', price: 119.0, cat: 'Dessert', isVeg: true },
    { name: 'Sizzling Hot Brownie', price: 249.0, cat: 'Dessert', isVeg: true },
    { name: 'Kesar Mango Lassi', price: 129.0, cat: 'Drinks', isVeg: true },
    { name: 'Iced Cold Coffee', price: 159.0, cat: 'Drinks', isVeg: true },
    { name: 'Paneer Tikka Biryani', price: 389.0, cat: 'Rice', isVeg: true },
    { name: 'Jeera Butter Rice', price: 199.0, cat: 'Rice', isVeg: true },
    { name: 'Cheese Garlic Roll Wrap', price: 189.0, cat: 'Wraps', isVeg: true },
    { name: 'Spicy Veg Wrap', price: 169.0, cat: 'Wraps', isVeg: true },
    { name: 'Family Combo Pack Large', price: 2499.0, cat: 'Combos', isVeg: true },
    { name: 'Executive Lunch Thali Box', price: 499.0, cat: 'Combos', isVeg: true },
    { name: 'Chef Special Supreme Pizza', price: 699.0, cat: 'Specials', isVeg: true },
    { name: 'Premium Butter Paneer Combo', price: 549.0, cat: 'Specials', isVeg: true },
  ];

  const products = [];
  for (const prod of productData) {
    const category = categories.find((c) => c.name === prod.cat)!;
    const dbProd = await prisma.product.create({
      data: {
        restaurantId: restGroup.id,
        categoryId: category.id,
        name: prod.name,
        slug: prod.name.toLowerCase().replace(/ /g, '-'),
        basePrice: prod.price,
        isVeg: prod.isVeg,
        isAvailable: true,
        preparationTime: 15 + (prod.price % 10),
      },
    });
    products.push(dbProd);
  }

  // 8. Seed 50 Ingredients
  console.log('🌱 Seeding 50 Ingredients...');
  const ingredientNames = [
    'Paneer',
    'Butter',
    'Fresh Milk',
    'Mozzarella Cheese',
    'Fresh Cream',
    'Potatoes',
    'Tomatoes',
    'Red Onions',
    'Green Chillies',
    'Garlic Cloves',
    'Ginger',
    'Fresh Coriander',
    'Lemon',
    'Capsicum',
    'Mushrooms',
    'Burger Buns',
    'Pizza Dough',
    'Tortilla Wraps',
    'Basmati Rice',
    'Wheat Flour',
    'Refined Flour',
    'Hakka Noodles',
    'Sunflower Oil',
    'Mustard Oil',
    'Ghee',
    'Turmeric Powder',
    'Red Chilli Powder',
    'Garam Masala',
    'Cumin Seeds',
    'Coriander Powder',
    'Kadhai Masala',
    'Biryani Masala',
    'Kasuri Methi',
    'Cardamom',
    'Black Pepper',
    'Sugar',
    'Salt',
    'Mango Pulp',
    'Coffee Powder',
    'Tea Leaves',
    'Chocolate Syrup',
    'Brownie Base',
    'Vanilla Ice Cream',
    'Schezwan Sauce',
    'Tomato Ketchup',
    'Mayonnaise',
    'Mint Chutney',
    'Tamarind Paste',
    'Vinegar',
    'Soy Sauce',
  ];

  const ingCategories = [
    'Dairy',
    'Dairy',
    'Dairy',
    'Dairy',
    'Dairy',
    'Produce',
    'Produce',
    'Produce',
    'Produce',
    'Produce',
    'Produce',
    'Produce',
    'Produce',
    'Produce',
    'Produce',
    'Bakery',
    'Bakery',
    'Bakery',
    'Grocery',
    'Grocery',
    'Grocery',
    'Grocery',
    'Grocery',
    'Grocery',
    'Dairy',
    'Spices',
    'Spices',
    'Spices',
    'Spices',
    'Spices',
    'Spices',
    'Spices',
    'Spices',
    'Spices',
    'Spices',
    'Grocery',
    'Grocery',
    'Grocery',
    'Grocery',
    'Grocery',
    'Grocery',
    'Bakery',
    'Dairy',
    'Spices',
    'Spices',
    'Grocery',
    'Grocery',
    'Grocery',
    'Liquids',
    'Liquids',
  ];

  const ingredients = [];
  for (let i = 0; i < 50; i++) {
    const name = ingredientNames[i];
    const ing = await prisma.ingredient.create({
      data: {
        name,
        sku: `ING-RAW-${String(i + 1).padStart(2, '0')}`,
        category: ingCategories[i],
        unit: ['Dairy', 'Produce', 'Bakery', 'Grocery', 'Spices'].includes(ingCategories[i])
          ? 'KG'
          : 'Liters',
        minimumStock: 15.0,
        reorderPoint: 30.0,
        active: true,
      },
    });
    ingredients.push(ing);
  }

  // 9. Seed 5 Suppliers
  console.log('🌱 Seeding 5 Suppliers...');
  const supplierNames = [
    'Delhi Dairy & Agro Foods',
    'Royal Spices & Grain Distributors',
    'Fresh Farm Vegetables Gurgaon',
    'Gurgaon Bakers & Confectionery',
    'Metro Cash & Carry (Liquids & Grocery)',
  ];
  const suppliers = [];
  for (let i = 0; i < 5; i++) {
    const sup = await prisma.supplier.create({
      data: {
        name: supplierNames[i],
        contactPerson: `Spokesperson ${i + 1}`,
        phone: `+91987654321${i}`,
        email: `contact@supplier${i + 1}.com`,
        address: `Gali No. ${i + 1}, Industrial Area, NCR`,
        rating: 4.5 + i * 0.1,
        active: true,
      },
    });
    suppliers.push(sup);
  }

  // 10. Map Recipes (Products to Ingredients)
  console.log('🌱 Batch Creating Recipe Mappings...');
  const recipesToCreate = [];
  for (const prod of products) {
    for (let k = 0; k < 3; k++) {
      const ingIdx = (prod.name.length + k * 13) % ingredients.length;
      recipesToCreate.push({
        productId: prod.id,
        ingredientId: ingredients[ingIdx].id,
        quantityRequired: 0.15 + k * 0.05,
      });
    }
  }
  await prisma.recipeMapping.createMany({ data: recipesToCreate });

  // 11. Create Branch Inventories (5 Branches * 50 Ingredients = 250 records)
  console.log('🌱 Batch Filling Branch Inventories...');
  const inventoriesToCreate = [];
  for (const branch of branches) {
    for (const ing of ingredients) {
      inventoriesToCreate.push({
        ingredientId: ing.id,
        branchId: branch.id,
        quantity: 250.0,
        reservedQuantity: 0.0,
        availableQuantity: 250.0,
      });
    }
  }
  await prisma.inventory.createMany({ data: inventoriesToCreate });

  // 12. Seeding 300 Completed Orders (May 1 2026 → May 31 2026, Target Revenue: ₹15–20 Lakh total)
  console.log('🌱 Batch Generating 300 Completed Orders (Target Revenue: ₹15–20 Lakh)...');
  const numOrders = 300;

  const ordersToCreate = [];
  const orderItemsToCreate = [];
  const billsToCreate = [];
  const statusHistoriesToCreate = [];
  const posOrdersToCreate = [];
  const posPaymentsToCreate = [];
  const receiptsToCreate = [];

  let cumulativeRevenue = 0;

  for (let i = 0; i < numOrders; i++) {
    const orderId = randomUUID();
    const custId = customerIds[i % customerIds.length];
    const branch = branches[i % branches.length];
    const day = (i % 31) + 1;
    const hour = 11 + (i % 11);
    const minute = (i * 13) % 60;
    const orderDate = new Date(2026, 4, day, hour, minute);

    const numItems = 2 + (i % 3);
    let subtotalVal = 0;

    for (let j = 0; j < numItems; j++) {
      let prodIdx;
      if (j === 0) {
        prodIdx = 16 + (i % 4);
      } else {
        prodIdx = (i * 3 + j * 7) % 16;
      }
      const selectedProd = products[prodIdx];
      const qty = j === 0 ? 4 + (i % 2) : 2 + (i % 2);
      const itemSubtotal = Number(selectedProd.basePrice) * qty;

      subtotalVal += itemSubtotal;
      orderItemsToCreate.push({
        orderId: orderId,
        productId: selectedProd.id,
        quantity: qty,
        price: selectedProd.basePrice,
      });
    }

    const taxVal = Math.round(subtotalVal * 0.05 * 100) / 100;
    const deliveryFeeVal = i < 100 ? 40.0 : 0.0;
    const discountVal = i % 5 === 0 ? Math.round(subtotalVal * 0.1 * 100) / 100 : 0.0;
    const totalAmountVal = subtotalVal + taxVal + deliveryFeeVal - discountVal;

    const isDelivery = i < 100;
    const orderType = isDelivery
      ? OrderType.DELIVERY
      : i % 2 === 0
        ? OrderType.WALK_IN
        : OrderType.DINE_IN;

    ordersToCreate.push({
      id: orderId,
      orderNumber: `ORD-${10000 + i}`,
      userId: custId,
      branchId: branch.id,
      restaurantId: restGroup.id,
      subtotal: subtotalVal,
      tax: taxVal,
      deliveryFee: deliveryFeeVal,
      discount: discountVal,
      totalAmount: totalAmountVal,
      status: OrderStatus.DELIVERED,
      orderType: orderType,
      notes: i % 7 === 0 ? 'Please make it extra spicy.' : null,
      createdAt: orderDate,
      updatedAt: orderDate,
    });

    billsToCreate.push({
      orderId: orderId,
      subtotal: subtotalVal,
      tax: taxVal,
      discount: discountVal,
      total: totalAmountVal,
      paymentStatus: 'PAID' as any,
      createdAt: orderDate,
      updatedAt: orderDate,
    });

    statusHistoriesToCreate.push({
      orderId: orderId,
      oldStatus: null,
      newStatus: OrderStatus.DELIVERED,
      changedBy: managerIds[i % managerIds.length],
      timestamp: orderDate,
    });

    if (!isDelivery) {
      const term = terminals[i % terminals.length];
      const posOrderId = randomUUID();
      posOrdersToCreate.push({
        id: posOrderId,
        terminalId: term.id,
        cashierId: managerIds[i % managerIds.length],
        orderId: orderId,
        status: POSOrderStatus.PAID,
        createdAt: orderDate,
        updatedAt: orderDate,
      });

      posPaymentsToCreate.push({
        posOrderId: posOrderId,
        method:
          i % 3 === 0
            ? POSPaymentMethod.CASH
            : i % 3 === 1
              ? POSPaymentMethod.UPI
              : POSPaymentMethod.CARD,
        amount: totalAmountVal,
        status: POSPaymentStatus.COMPLETED,
        createdAt: orderDate,
      });

      receiptsToCreate.push({
        posOrderId: posOrderId,
        receiptNumber: `REC-BR${(i % 5) + 1}-${1000 + i}`,
        generatedAt: orderDate,
      });
    }

    cumulativeRevenue += totalAmountVal;
  }

  // Perform bulk inserts for all Order related structures
  await prisma.order.createMany({ data: ordersToCreate });
  await prisma.orderItem.createMany({ data: orderItemsToCreate });
  await prisma.bill.createMany({ data: billsToCreate });
  await prisma.orderStatusHistory.createMany({ data: statusHistoriesToCreate });
  await prisma.pOSOrder.createMany({ data: posOrdersToCreate });
  await prisma.pOSPayment.createMany({ data: posPaymentsToCreate });
  await prisma.receipt.createMany({ data: receiptsToCreate });

  console.log(
    `✅ Bulk Seeded 300 Orders. Total Cumulative Revenue: ₹${cumulativeRevenue.toFixed(2)} INR`,
  );

  // 13. Seed Kitchen Stations and KDS Orders
  console.log('🌱 Seeding KDS Kitchen Stations...');
  const kdsStations = [
    'Burger Station',
    'Pizza Station',
    'Noodles Station',
    'Main Curry Station',
    'Drinks & Desserts Station',
  ];
  const stations = [];
  for (const name of kdsStations) {
    const station = await prisma.kitchenStation.create({
      data: { name, active: true },
    });
    stations.push(station);
  }

  // Create KitchenOrders and KitchenTasks for the first 40 orders
  console.log('🌱 Batch Creating KDS Orders & Tasks...');
  const kitchenOrdersToCreate = [];
  const kitchenTasksToCreate = [];
  const chefTaskCounts: Record<string, number> = {};

  for (let i = 0; i < 40; i++) {
    const order = ordersToCreate[i];
    const station = stations[i % stations.length];
    const cookId = kitchenStaffIds[i % kitchenStaffIds.length];
    const kOrderId = randomUUID();

    kitchenOrdersToCreate.push({
      id: kOrderId,
      orderId: order.id,
      stationId: station.id,
      assignedTo: cookId,
      priority: i % 4 === 0 ? KitchenPriority.HIGH : KitchenPriority.MEDIUM,
      status: KitchenOrderStatus.COMPLETED,
      startedAt: new Date(order.createdAt.getTime() - 15 * 60000),
      completedAt: order.createdAt,
      createdAt: new Date(order.createdAt.getTime() - 20 * 60000),
      updatedAt: order.createdAt,
    });

    const items = orderItemsToCreate.filter((item) => item.orderId === order.id);
    for (const item of items) {
      kitchenTasksToCreate.push({
        kitchenOrderId: kOrderId,
        productId: item.productId,
        quantity: item.quantity,
        status: 'DONE',
        createdAt: new Date(order.createdAt.getTime() - 20 * 60000),
        updatedAt: order.createdAt,
      });
    }

    chefTaskCounts[cookId] = (chefTaskCounts[cookId] || 0) + items.length;
  }
  await prisma.kitchenOrder.createMany({ data: kitchenOrdersToCreate });
  await prisma.kitchenTask.createMany({ data: kitchenTasksToCreate });

  // 14. Seed Delivery Assignments (100 Delivery Orders)
  console.log('🌱 Batch Seeding Delivery Logs & Commissions...');

  const deliveryAssignmentsToCreate = [];
  const deliveryProofsToCreate = [];
  const driverEarningsToCreate = [];

  for (let i = 0; i < 100; i++) {
    const order = ordersToCreate[i]; // The first 100 orders are DELIVERY
    const rider = driverProfiles[i % driverProfiles.length];
    const assignId = randomUUID();

    deliveryAssignmentsToCreate.push({
      id: assignId,
      orderId: order.id,
      driverId: rider.id,
      status: DeliveryStatus.DELIVERED,
      assignedAt: new Date(order.createdAt.getTime() - 30 * 60000),
      acceptedAt: new Date(order.createdAt.getTime() - 28 * 60000),
      pickedUpAt: new Date(order.createdAt.getTime() - 20 * 60000),
      deliveredAt: order.createdAt,
      createdAt: new Date(order.createdAt.getTime() - 32 * 60000),
      updatedAt: order.createdAt,
    });

    deliveryProofsToCreate.push({
      assignmentId: assignId,
      notes: 'Delivered to door. Cash/online payment confirmed.',
      signatureUrl: `https://res.cloudinary.com/abc-restaurant/signature_${i}.png`,
      timestamp: order.createdAt,
    });

    const bonus = 30.0 + (i % 5) * 5.0;
    driverEarningsToCreate.push({
      driverId: rider.id,
      orderId: order.id,
      earnings: 100.0,
      bonus: bonus,
      createdAt: order.createdAt,
    });
  }
  await prisma.deliveryAssignment.createMany({ data: deliveryAssignmentsToCreate });
  await prisma.deliveryProof.createMany({ data: deliveryProofsToCreate });
  await prisma.driverEarnings.createMany({ data: driverEarningsToCreate });

  // 15. Seed Inventory Requests & Movements
  console.log('🌱 Batch Seeding Inventory Requests & Movements...');

  const requestsToCreate = [];
  const requestItemsToCreate = [];
  const movementsToCreate = [];

  for (let i = 0; i < 20; i++) {
    const branch = branches[i % branches.length];
    const requesterId = managerIds[i % managerIds.length];
    const requestDate = new Date(2026, 4, (i % 28) + 1, 10, 0);
    const reqId = randomUUID();

    requestsToCreate.push({
      id: reqId,
      branchId: branch.id,
      status: InventoryRequestStatus.DELIVERED,
      requestedById: requesterId,
      notes: `Weekly restocking raw ingredients.`,
      createdAt: requestDate,
      updatedAt: requestDate,
      approvedAt: requestDate,
      dispatchedAt: requestDate,
      deliveredAt: requestDate,
    });

    // Restock 3 random ingredients
    for (let k = 0; k < 3; k++) {
      const ingIdx = (i * 7 + k * 11) % ingredients.length;
      const ing = ingredients[ingIdx];

      requestItemsToCreate.push({
        requestId: reqId,
        ingredientId: ing.id,
        requestedQuantity: 100.0,
        approvedQuantity: 100.0,
      });

      movementsToCreate.push({
        ingredientId: ing.id,
        branchId: branch.id,
        type: StockMovementType.PURCHASE,
        quantity: 100.0,
        referenceId: reqId,
        notes: 'Supplier replenishment delivery',
        createdAt: requestDate,
      });
    }
  }
  await prisma.inventoryRequest.createMany({ data: requestsToCreate });
  await prisma.inventoryRequestItem.createMany({ data: requestItemsToCreate });
  await prisma.stockMovement.createMany({ data: movementsToCreate });

  // 16. Seed Notifications (exactly 50)
  console.log('🌱 Seeding 50 Notifications...');
  const notificationsToCreate = [];
  for (let i = 1; i <= 50; i++) {
    notificationsToCreate.push({
      userId: adminId, // Send system notifications to Admin user
      type: i % 2 === 0 ? 'SYSTEM_ALERT' : 'ORDER_STATUS',
      channel: 'IN_APP',
      title: i % 2 === 0 ? `Stock Alert: Item raw ingredient` : `New Order Received`,
      message:
        i % 2 === 0
          ? `Ingredient item level fell below minimal threshold.`
          : `Order ref #${1000 + i} is ready for dispatch.`,
      status: i % 3 === 0 ? 'READ' : 'DELIVERED',
      createdAt: new Date(2026, 4, (i % 30) + 1, 9, i % 60),
    });
  }
  await prisma.notification.createMany({ data: notificationsToCreate });

  // 17. Seed Reservations (exactly 50)
  console.log('🌱 Seeding 50 Table Reservations...');
  const reservationsToCreate = [];
  for (let i = 0; i < 50; i++) {
    const custId = customerIds[i % customerIds.length];
    const branch = branches[i % branches.length];
    const branchTables = dbTables.filter((t) => t.branchId === branch.id);
    const table = branchTables[i % branchTables.length];

    reservationsToCreate.push({
      customerId: custId,
      branchId: branch.id,
      tableId: table.id,
      reservationDate: `2026-05-${String((i % 28) + 1).padStart(2, '0')}`,
      reservationTime: `${18 + (i % 4)}:00`,
      guestCount: 2 + (i % 4),
      specialRequest: i % 4 === 0 ? 'Window seat preferred.' : null,
      status: ReservationStatus.COMPLETED,
      createdAt: new Date(2026, 4, (i % 28) + 1, 12, 0),
      updatedAt: new Date(2026, 4, (i % 28) + 1, 21, 0),
    });
  }
  await prisma.reservation.createMany({ data: reservationsToCreate });

  // 18. Customer Ratings & Reviews
  console.log('🌱 Seeding Customer Reviews...');
  const reviewsToCreate = [];
  for (let i = 0; i < 40; i++) {
    const prod = products[i % products.length];
    const custId = customerIds[i % customerIds.length];
    reviewsToCreate.push({
      productId: prod.id,
      userId: custId,
      rating: 4 + (i % 2),
      comment:
        i % 2 === 0
          ? 'Delicious dish! Authentic Indian flavor.'
          : 'Super fast delivery and hot food.',
    });
  }
  await prisma.review.createMany({ data: reviewsToCreate });

  // 19. MongoDB Telemetry Seeding Fallback
  if (mongoConnected) {
    try {
      console.log('🌱 Populating MongoDB telemetry events...');
      await CartEvent.deleteMany({});
      await CheckoutEvent.deleteMany({});
      await SearchAnalytic.deleteMany({});

      const cartEvents = [];
      const checkoutEvents = [];

      for (let i = 0; i < 1500; i++) {
        const day = (i % 30) + 1;
        cartEvents.push({
          userId: customerIds[i % customerIds.length],
          cartId: `cart-${i % 50}`,
          productId: products[i % products.length].id,
          action: 'ADD',
          quantity: 1,
          timestamp: new Date(2026, 4, day),
        });
      }

      for (let i = 0; i < 300; i++) {
        const day = (i % 30) + 1;
        checkoutEvents.push({
          userId: customerIds[i % customerIds.length],
          orderDraftId: `draft-${i}`,
          step: 'PAYMENT_COMPLETED',
          timestamp: new Date(2026, 4, day),
          metadata: {
            totalAmount: 450,
            paymentMethod: 'UPI',
            cartId: `cart-${i % 50}`,
          },
        });
      }

      await CartEvent.insertMany(cartEvents);
      await CheckoutEvent.insertMany(checkoutEvents);
      console.log('✅ MongoDB Analytics events committed successfully.');
    } catch (mongoErr: any) {
      console.warn('⚠️ MongoDB seed telemetry skipped:', mongoErr.message);
    }
  }

  // 20. Calculate and Display Chef & Driver Performance Bonuses
  console.log('\n📊 Calculating staff operational bonuses...');

  const driverCommissions = await prisma.driverEarnings.findMany({
    include: { driver: { include: { user: true } } },
  });

  const driverStats: Record<string, { name: string; trips: number; base: number; bonus: number }> =
    {};
  for (const dec of driverCommissions) {
    const dId = dec.driverId;
    const name = `${dec.driver.user.firstName} ${dec.driver.user.lastName}`;
    if (!driverStats[dId]) {
      driverStats[dId] = { name, trips: 0, base: 0, bonus: 0 };
    }
    driverStats[dId].trips += 1;
    driverStats[dId].base += Number(dec.earnings);
    driverStats[dId].bonus += Number(dec.bonus);
  }

  const chefStats = kitchenStaffIds.map((cId, idx) => {
    const chefUser = usersToCreate.find((u) => u.id === cId)!;
    const tasksCount = chefTaskCounts[cId] || 0;
    const bonusAmount = tasksCount * chefUser.performanceScore! * 30.0;
    return {
      name: `${chefUser.firstName} ${chefUser.lastName}`,
      score: chefUser.performanceScore!,
      tasks: tasksCount,
      bonus: Math.round(bonusAmount),
    };
  });

  console.log(
    '\n==========================================================================================',
  );
  console.log(
    '                                  ABC RESTAURANT OPERATIONS REPORT                        ',
  );
  console.log(
    '==========================================================================================',
  );
  console.log(`👤 Active Users Created: ${1 + 1 + 5 + 10 + 5 + 10 + 20} accounts`);
  console.log(`📦 May 2026 Orders Created: ${ordersToCreate.length} completed transactions`);
  console.log(
    `💰 Cumulative Seed Revenue: ₹${cumulativeRevenue.toLocaleString('en-IN', { maximumFractionDigits: 2 })} INR`,
  );
  console.log(
    '------------------------------------------------------------------------------------------',
  );
  console.log('CHEF PERFORMANCE BONUSES:');
  console.log('Name                  | Score | Tasks Cooked | Performance Bonus');
  console.log(
    '------------------------------------------------------------------------------------------',
  );
  chefStats.forEach((chef) => {
    console.log(
      `${chef.name.padEnd(21)} | ${chef.score.toString().padEnd(5)} | ${chef.tasks.toString().padEnd(12)} | ₹${chef.bonus}`,
    );
  });
  console.log(
    '------------------------------------------------------------------------------------------',
  );
  console.log('DRIVER LOGISTICS & COMMISSION EARNINGS:');
  console.log('Name                  | Trips | Delivery Commission | Driver Bonus');
  console.log(
    '------------------------------------------------------------------------------------------',
  );
  Object.values(driverStats).forEach((ds) => {
    console.log(
      `${ds.name.padEnd(21)} | ${ds.trips.toString().padEnd(5)} | ₹${ds.base.toFixed(2).padEnd(18)} | ₹${ds.bonus.toFixed(2)}`,
    );
  });
  console.log(
    '==========================================================================================\n',
  );
}

main()
  .catch((e) => {
    console.error('❌ Master Seeding Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await mongoose.disconnect();
  });
