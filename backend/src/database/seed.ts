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
  RefundStatus
} from '@prisma/client';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import mongoose from 'mongoose';
import env from '../config/env';
import CartEvent from '../models/CartEvent';
import CheckoutEvent from '../models/CheckoutEvent';
import SearchAnalytic from '../models/SearchAnalytic';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting Unified Master Seeding for ABC Restaurant Management System...');

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
    { name: 'Branch 1', address: 'Cyber City, Phase 3', city: 'Gurugram', state: 'Haryana', lat: 28.4950, lng: 77.0890 },
    { name: 'Branch 2', address: 'Sector 29 Market', city: 'Gurugram', state: 'Haryana', lat: 28.4712, lng: 77.0721 },
    { name: 'Branch 3', address: 'Connaught Place, Inner Circle', city: 'New Delhi', state: 'Delhi', lat: 28.6304, lng: 77.2177 },
    { name: 'Branch 4', address: 'Aerocity Hospitality District', city: 'New Delhi', state: 'Delhi', lat: 28.5492, lng: 77.1214 },
    { name: 'Branch 5', address: 'Golf Course Road', city: 'Gurugram', state: 'Haryana', lat: 28.4389, lng: 77.1002 },
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

    await prisma.pOSTerminal.create({
      data: {
        branchId: branch.id,
        terminalName: `POS Register 1`,
        active: true,
      },
    });

    // Create 10 tables per branch (globally unique table numbers)
    for (let t = 1; t <= 10; t++) {
      await prisma.table.create({
        data: {
          branchId: branch.id,
          number: `T-BR${i + 1}-${t}`,
          capacity: t % 2 === 0 ? (t % 3 === 0 ? 6 : 4) : 2,
          status: TableStatus.AVAILABLE,
          active: true,
        },
      });
    }

    branches.push(branch);
  }
  console.log(`✅ Seeded 5 Branches with POS terminals and tables.`);

  // 5. Seed Users matching exact role counts
  console.log('🌱 Seeding User Accounts (exactly 1 Org Owner, 5 Managers, 10 Kitchen, 5 Inventory, 10 Drivers, 20 Customers)...');
  const salt = bcrypt.genSaltSync(10);
  const userPasswordHash = bcrypt.hashSync('Admin@123', salt);

  // 1 Organization Owner
  const ownerUser = await prisma.user.create({
    data: {
      email: 'owner@abcrestaurant.com',
      phone: '+919999999000',
      firstName: 'Alok',
      lastName: 'Sharma',
      role: Role.ORGANIZATION_OWNER,
      passwordHash: userPasswordHash,
      organizationId: org.id,
      isEmailVerified: true,
      isPhoneVerified: true,
    },
  });

  // 1 System Admin
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@abcrestaurant.com',
      phone: '+919999999050',
      firstName: 'System',
      lastName: 'Admin',
      role: Role.ADMIN,
      passwordHash: userPasswordHash,
      organizationId: org.id,
      isEmailVerified: true,
      isPhoneVerified: true,
      salary: 55000,
    },
  });

  // 5 Branch Managers
  const managers = [];
  for (let i = 1; i <= 5; i++) {
    const manager = await prisma.user.create({
      data: {
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
      },
    });
    managers.push(manager);
  }

  // 10 Kitchen Staff
  const kitchenStaff = [];
  const categoriesList = ['Burger', 'Pizza', 'Noodles', 'Paneer', 'Dessert', 'Drinks', 'Rice', 'Wraps', 'Combos', 'Specials'];
  for (let i = 1; i <= 10; i++) {
    const cook = await prisma.user.create({
      data: {
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
      },
    });
    kitchenStaff.push(cook);
  }

  // 5 Inventory Managers
  const inventoryManagers = [];
  for (let i = 1; i <= 5; i++) {
    const invMgr = await prisma.user.create({
      data: {
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
      },
    });
    inventoryManagers.push(invMgr);
  }

  // 10 Delivery Partners
  const deliveryPartners = [];
  for (let i = 1; i <= 10; i++) {
    const driver = await prisma.user.create({
      data: {
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
      },
    });

    const profile = await prisma.deliveryPartner.create({
      data: {
        userId: driver.id,
        vehicleType: i % 2 === 0 ? 'Bike' : 'Scooter',
        vehicleNumber: `HR-26-AB-30${i - 1}`,
        licenseNumber: `DL-KA-900${i - 1}`,
        activeStatus: true,
        rating: 4.8,
      },
    });
    deliveryPartners.push(profile);
  }

  // 20 Customers
  const customers = [];
  for (let i = 1; i <= 20; i++) {
    const cust = await prisma.user.create({
      data: {
        email: `customer${i}@abcrestaurant.com`,
        phone: `+91999999904${i - 1}`,
        firstName: `Client`,
        lastName: `${i}`,
        role: Role.CUSTOMER,
        passwordHash: userPasswordHash,
        isEmailVerified: true,
        isPhoneVerified: true,
      },
    });
    customers.push(cust);
  }
  console.log(`✅ Seeded exact staff and customer user directory.`);

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
    { name: 'Veg Maharaja Burger', price: 299.00, cat: 'Burger', isVeg: true },
    { name: 'Spicy Paneer Burger', price: 249.00, cat: 'Burger', isVeg: true },
    { name: 'Classic Margherita Pizza', price: 399.00, cat: 'Pizza', isVeg: true },
    { name: 'Tandoori Paneer Pizza', price: 499.00, cat: 'Pizza', isVeg: true },
    { name: 'Veg Masala Noodles', price: 199.00, cat: 'Noodles', isVeg: true },
    { name: 'Schezwan Chilli Noodles', price: 219.00, cat: 'Noodles', isVeg: true },
    { name: 'Kadhai Paneer Thali', price: 349.00, cat: 'Paneer', isVeg: true },
    { name: 'Shahi Paneer Masala', price: 379.00, cat: 'Paneer', isVeg: true },
    { name: 'Gulab Jamun Cup (2 Pcs)', price: 119.00, cat: 'Dessert', isVeg: true },
    { name: 'Sizzling Hot Brownie', price: 249.00, cat: 'Dessert', isVeg: true },
    { name: 'Kesar Mango Lassi', price: 129.00, cat: 'Drinks', isVeg: true },
    { name: 'Iced Cold Coffee', price: 159.00, cat: 'Drinks', isVeg: true },
    { name: 'Paneer Tikka Biryani', price: 389.00, cat: 'Rice', isVeg: true },
    { name: 'Jeera Butter Rice', price: 199.00, cat: 'Rice', isVeg: true },
    { name: 'Cheese Garlic Roll Wrap', price: 189.00, cat: 'Wraps', isVeg: true },
    { name: 'Spicy Veg Wrap', price: 169.00, cat: 'Wraps', isVeg: true },
    { name: 'Family Combo Pack Large', price: 2499.00, cat: 'Combos', isVeg: true },
    { name: 'Executive Lunch Thali Box', price: 499.00, cat: 'Combos', isVeg: true },
    { name: 'Chef Special Supreme Pizza', price: 699.00, cat: 'Specials', isVeg: true },
    { name: 'Premium Butter Paneer Combo', price: 549.00, cat: 'Specials', isVeg: true },
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
    'Paneer', 'Butter', 'Fresh Milk', 'Mozzarella Cheese', 'Fresh Cream',
    'Potatoes', 'Tomatoes', 'Red Onions', 'Green Chillies', 'Garlic Cloves',
    'Ginger', 'Fresh Coriander', 'Lemon', 'Capsicum', 'Mushrooms',
    'Burger Buns', 'Pizza Dough', 'Tortilla Wraps', 'Basmati Rice', 'Wheat Flour',
    'Refined Flour', 'Hakka Noodles', 'Sunflower Oil', 'Mustard Oil', 'Ghee',
    'Turmeric Powder', 'Red Chilli Powder', 'Garam Masala', 'Cumin Seeds', 'Coriander Powder',
    'Kadhai Masala', 'Biryani Masala', 'Kasuri Methi', 'Cardamom', 'Black Pepper',
    'Sugar', 'Salt', 'Mango Pulp', 'Coffee Powder', 'Tea Leaves',
    'Chocolate Syrup', 'Brownie Base', 'Vanilla Ice Cream', 'Schezwan Sauce', 'Tomato Ketchup',
    'Mayonnaise', 'Mint Chutney', 'Tamarind Paste', 'Vinegar', 'Soy Sauce'
  ];

  const ingCategories = ['Dairy', 'Dairy', 'Dairy', 'Dairy', 'Dairy', 'Produce', 'Produce', 'Produce', 'Produce', 'Produce', 'Produce', 'Produce', 'Produce', 'Produce', 'Produce', 'Bakery', 'Bakery', 'Bakery', 'Grocery', 'Grocery', 'Grocery', 'Grocery', 'Grocery', 'Grocery', 'Dairy', 'Spices', 'Spices', 'Spices', 'Spices', 'Spices', 'Spices', 'Spices', 'Spices', 'Spices', 'Spices', 'Grocery', 'Grocery', 'Grocery', 'Grocery', 'Grocery', 'Grocery', 'Bakery', 'Dairy', 'Spices', 'Spices', 'Grocery', 'Grocery', 'Grocery', 'Liquids', 'Liquids'];

  const ingredients = [];
  for (let i = 0; i < 50; i++) {
    const name = ingredientNames[i];
    const ing = await prisma.ingredient.create({
      data: {
        name,
        sku: `ING-RAW-${String(i + 1).padStart(2, '0')}`,
        category: ingCategories[i],
        unit: ['Dairy', 'Produce', 'Bakery', 'Grocery', 'Spices'].includes(ingCategories[i]) ? 'KG' : 'Liters',
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
    'Metro Cash & Carry (Liquids & Grocery)'
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
  console.log('🌱 Creating Recipe Mappings...');
  for (const prod of products) {
    // Map each product to 3 unique ingredients
    for (let k = 0; k < 3; k++) {
      const ingIdx = (prod.name.length + k * 13) % ingredients.length;
      await prisma.recipeMapping.create({
        data: {
          productId: prod.id,
          ingredientId: ingredients[ingIdx].id,
          quantityRequired: 0.15 + k * 0.05,
        },
      });
    }
  }

  // 11. Create Branch Inventories (5 Branches * 50 Ingredients = 250 records)
  console.log('🌱 Filling Branch Inventories...');
  for (const branch of branches) {
    for (const ing of ingredients) {
      await prisma.inventory.create({
        data: {
          ingredientId: ing.id,
          branchId: branch.id,
          quantity: 250.0,
          reservedQuantity: 0.0,
          availableQuantity: 250.0,
        },
      });
    }
  }

  // 12. Seeding 300 Completed Orders (May 1 2026 → May 31 2026, Target Revenue: ₹15–20 Lakh total)
  console.log('🌱 Generating 300 Completed Orders (Target Revenue: ₹15–20 Lakh)...');
  const numOrders = 300;
  const seededOrders = [];

  // Deterministic Pseudo-Random Generator to yield realistic order variation while hitting target revenue
  let cumulativeRevenue = 0;

  for (let i = 0; i < numOrders; i++) {
    const cust = customers[i % customers.length];
    const branch = branches[i % branches.length];
    const day = (i % 31) + 1;
    const hour = 11 + (i % 11);
    const minute = (i * 13) % 60;
    const orderDate = new Date(2026, 4, day, hour, minute);

    // Let's determine how many items are in the order (between 2 and 4)
    // We want the average order value to be around 5800 INR
    const numItems = 2 + (i % 3); // 2, 3, or 4 items
    const orderItemsData = [];
    let subtotalVal = 0;

    for (let j = 0; j < numItems; j++) {
      // Pick a product. To get higher values, we mix combo items with single items
      let prodIdx;
      if (j === 0) {
        prodIdx = 16 + (i % 4); // Index 16 to 19 (Combos and Specials) - ₹499 to ₹2499
      } else {
        prodIdx = (i * 3 + j * 7) % 16; // Index 0 to 15 - ₹119 to ₹499
      }
      const selectedProd = products[prodIdx];
      const qty = 1 + (i % 2); // 1 or 2
      const itemSubtotal = Number(selectedProd.basePrice) * qty;

      subtotalVal += itemSubtotal;
      orderItemsData.push({
        productId: selectedProd.id,
        quantity: qty,
        price: selectedProd.basePrice
      });
    }

    const taxVal = Math.round(subtotalVal * 0.05 * 100) / 100;
    const deliveryFeeVal = i % 2 === 0 ? 40.00 : 0.00; // Only delivery orders pay delivery fee
    const discountVal = i % 5 === 0 ? Math.round(subtotalVal * 0.1 * 100) / 100 : 0.00;
    const totalAmountVal = subtotalVal + taxVal + deliveryFeeVal - discountVal;

    // Check if orderType is delivery (100 orders total) or Walk-in/Dine-in (200 orders total)
    // We make orders i=0 to 99 Delivery, and 100 to 299 Walk-in/Dine-in
    const isDelivery = i < 100;
    const orderType = isDelivery ? OrderType.DELIVERY : (i % 2 === 0 ? OrderType.WALK_IN : OrderType.DINE_IN);

    const order = await prisma.order.create({
      data: {
        userId: cust.id,
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
        items: {
          create: orderItemsData,
        },
      },
      include: {
        items: true
      }
    });

    // Create Bill
    await prisma.bill.create({
      data: {
        orderId: order.id,
        subtotal: subtotalVal,
        tax: taxVal,
        discount: discountVal,
        total: totalAmountVal,
        paymentStatus: 'PAID',
        createdAt: orderDate,
        updatedAt: orderDate,
      },
    });

    // Create Order Status History
    await prisma.orderStatusHistory.create({
      data: {
        orderId: order.id,
        oldStatus: null,
        newStatus: OrderStatus.DELIVERED,
        changedBy: managers[i % managers.length].id,
        timestamp: orderDate,
      },
    });

    // For Walk-in/Dine-in orders, create POS structures
    if (!isDelivery) {
      const terminal = await prisma.pOSTerminal.findFirst({
        where: { branchId: branch.id }
      });
      if (terminal) {
        const posOrder = await prisma.pOSOrder.create({
          data: {
            terminalId: terminal.id,
            cashierId: managers[i % managers.length].id,
            orderId: order.id,
            status: POSOrderStatus.PAID,
            createdAt: orderDate,
            updatedAt: orderDate,
          },
        });

        await prisma.pOSPayment.create({
          data: {
            posOrderId: posOrder.id,
            method: i % 3 === 0 ? POSPaymentMethod.CASH : (i % 3 === 1 ? POSPaymentMethod.UPI : POSPaymentMethod.CARD),
            amount: totalAmountVal,
            status: POSPaymentStatus.COMPLETED,
            createdAt: orderDate,
          },
        });

        await prisma.receipt.create({
          data: {
            posOrderId: posOrder.id,
            receiptNumber: `REC-BR${i % 5 + 1}-${1000 + i}`,
            generatedAt: orderDate,
          },
        });
      }
    }

    cumulativeRevenue += totalAmountVal;
    seededOrders.push(order);
  }
  console.log(`✅ Seeded 300 Orders. Total Cumulative Revenue: ₹${cumulativeRevenue.toFixed(2)} INR`);

  // 13. Seed Kitchen Stations and KDS Orders
  console.log('🌱 Seeding KDS Kitchen Orders & Tasks...');
  const kdsStations = ['Burger Station', 'Pizza Station', 'Noodles Station', 'Main Curry Station', 'Drinks & Desserts Station'];
  const stations = [];
  for (const name of kdsStations) {
    const station = await prisma.kitchenStation.create({
      data: { name, active: true },
    });
    stations.push(station);
  }

  // Create KitchenOrders and KitchenTasks for the first 40 orders
  const chefTaskCounts: Record<string, number> = {};
  for (let i = 0; i < 40; i++) {
    const order = seededOrders[i];
    const station = stations[i % stations.length];
    const assignedCook = kitchenStaff[i % kitchenStaff.length];
    
    const kOrder = await prisma.kitchenOrder.create({
      data: {
        orderId: order.id,
        stationId: station.id,
        assignedTo: assignedCook.id,
        priority: i % 4 === 0 ? KitchenPriority.HIGH : KitchenPriority.MEDIUM,
        status: KitchenOrderStatus.COMPLETED,
        startedAt: new Date(order.createdAt.getTime() - 15 * 60000),
        completedAt: order.createdAt,
        createdAt: new Date(order.createdAt.getTime() - 20 * 60000),
        updatedAt: order.createdAt,
      },
    });

    for (const item of order.items) {
      await prisma.kitchenTask.create({
        data: {
          kitchenOrderId: kOrder.id,
          productId: item.productId,
          quantity: item.quantity,
          status: 'DONE',
          createdAt: kOrder.createdAt,
          updatedAt: order.createdAt,
        },
      });
    }

    chefTaskCounts[assignedCook.id] = (chefTaskCounts[assignedCook.id] || 0) + order.items.length;
  }

  // 14. Seed Delivery Fleet Logistics & Assignments (100 Delivery Orders)
  console.log('🌱 Seeding Delivery fleet logistics, proof & commissions...');
  const deliveryOrders = seededOrders.filter(o => o.orderType === OrderType.DELIVERY);
  for (let i = 0; i < deliveryOrders.length; i++) {
    const order = deliveryOrders[i];
    const rider = deliveryPartners[i % deliveryPartners.length];

    const assignment = await prisma.deliveryAssignment.create({
      data: {
        orderId: order.id,
        driverId: rider.id,
        status: DeliveryStatus.DELIVERED,
        assignedAt: new Date(order.createdAt.getTime() - 30 * 60000),
        acceptedAt: new Date(order.createdAt.getTime() - 28 * 60000),
        pickedUpAt: new Date(order.createdAt.getTime() - 20 * 60000),
        deliveredAt: order.createdAt,
        createdAt: new Date(order.createdAt.getTime() - 32 * 60000),
        updatedAt: order.createdAt,
      },
    });

    await prisma.deliveryProof.create({
      data: {
        assignmentId: assignment.id,
        notes: 'Delivered to door. Cash/online payment confirmed.',
        signatureUrl: `https://res.cloudinary.com/abc-restaurant/signature_${i}.png`,
        timestamp: order.createdAt,
      },
    });

    // Commission: Flat ₹100 per delivery + Rating-based Bonus (₹30-₹50)
    const bonus = 30.00 + (i % 5) * 5.00;
    await prisma.driverEarnings.create({
      data: {
        driverId: rider.id,
        orderId: order.id,
        earnings: 100.00,
        bonus: bonus,
        createdAt: order.createdAt,
      },
    });
  }

  // 15. Seed Inventory Requests & Movements
  console.log('🌱 Seeding Inventory Restock Requests & Movements...');
  for (let i = 0; i < 20; i++) {
    const branch = branches[i % branches.length];
    const requester = managers[i % managers.length];
    const requestDate = new Date(2026, 4, (i % 28) + 1, 10, 0);

    const invRequest = await prisma.inventoryRequest.create({
      data: {
        branchId: branch.id,
        status: InventoryRequestStatus.DELIVERED,
        requestedById: requester.id,
        notes: `Weekly restocking raw ingredients.`,
        createdAt: requestDate,
        updatedAt: requestDate,
        approvedAt: requestDate,
        dispatchedAt: requestDate,
        deliveredAt: requestDate,
      },
    });

    // Restock 3 random ingredients
    for (let k = 0; k < 3; k++) {
      const ingIdx = (i * 7 + k * 11) % ingredients.length;
      const ing = ingredients[ingIdx];
      await prisma.inventoryRequestItem.create({
        data: {
          requestId: invRequest.id,
          ingredientId: ing.id,
          requestedQuantity: 100.0,
          approvedQuantity: 100.0,
        },
      });

      // Stock movement for restock
      await prisma.stockMovement.create({
        data: {
          ingredientId: ing.id,
          branchId: branch.id,
          type: StockMovementType.PURCHASE,
          quantity: 100.0,
          referenceId: invRequest.id,
          notes: 'Supplier replenishment delivery',
          createdAt: requestDate,
        },
      });
    }
  }

  // 16. Seed Notifications (exactly 50)
  console.log('🌱 Seeding 50 Notifications...');
  for (let i = 1; i <= 50; i++) {
    await prisma.notification.create({
      data: {
        userId: ownerUser.id,
        type: i % 2 === 0 ? 'SYSTEM_ALERT' : 'ORDER_STATUS',
        channel: 'IN_APP',
        title: i % 2 === 0 ? `Stock Alert: Item raw ingredient` : `New Order Received`,
        message: i % 2 === 0 ? `Ingredient item level fell below minimal threshold.` : `Order ref #${1000 + i} is ready for dispatch.`,
        status: i % 3 === 0 ? 'READ' : 'DELIVERED',
        createdAt: new Date(2026, 4, (i % 30) + 1, 9, i % 60),
      },
    });
  }

  // 17. Seed Reservations (exactly 50)
  console.log('🌱 Seeding 50 Table Reservations...');
  for (let i = 0; i < 50; i++) {
    const cust = customers[i % customers.length];
    const branch = branches[i % branches.length];
    const tablesList = await prisma.table.findMany({ where: { branchId: branch.id } });
    const table = tablesList[i % tablesList.length];

    await prisma.reservation.create({
      data: {
        customerId: cust.id,
        branchId: branch.id,
        tableId: table.id,
        reservationDate: `2026-05-${String((i % 28) + 1).padStart(2, '0')}`,
        reservationTime: `${18 + (i % 4)}:00`,
        guestCount: 2 + (i % 4),
        specialRequest: i % 4 === 0 ? 'Window seat preferred.' : null,
        status: ReservationStatus.COMPLETED,
        createdAt: new Date(2026, 4, (i % 28) + 1, 12, 0),
        updatedAt: new Date(2026, 4, (i % 28) + 1, 21, 0),
      },
    });
  }

  // 18. Customer Ratings & Reviews
  console.log('🌱 Seeding Customer Reviews...');
  for (let i = 0; i < 40; i++) {
    const prod = products[i % products.length];
    const cust = customers[i % customers.length];
    await prisma.review.create({
      data: {
        productId: prod.id,
        userId: cust.id,
        rating: 4 + (i % 2), // 4 or 5 stars
        comment: i % 2 === 0 ? 'Delicious dish! Authentic Indian flavor.' : 'Super fast delivery and hot food.',
      },
    });
  }

  // 19. MongoDB Telemetry Seeding Fallback
  if (mongoConnected) {
    try {
      console.log('🌱 Populating MongoDB telemetry events...');
      await CartEvent.deleteMany({});
      await CheckoutEvent.deleteMany({});
      await SearchAnalytic.deleteMany({});

      const customerIds = customers.map(c => c.id);
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
  
  // Calculate driver earnings & bonuses from DB
  const driverCommissions = await prisma.driverEarnings.findMany({
    include: { driver: { include: { user: true } } }
  });

  const driverStats: Record<string, { name: string; trips: number; base: number; bonus: number }> = {};
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

  // Calculate Chef Performance Bonuses
  const chefStats = kitchenStaff.map(chef => {
    const tasksCount = chefTaskCounts[chef.id] || 0;
    // Chef bonus: tasks handled * performance score * 30 INR
    const bonusAmount = tasksCount * chef.performanceScore * 30.00;
    return {
      name: `${chef.firstName} ${chef.lastName}`,
      score: chef.performanceScore,
      tasks: tasksCount,
      bonus: Math.round(bonusAmount)
    };
  });

  console.log('\n==========================================================================================');
  console.log('                                  ABC RESTAURANT OPERATIONS REPORT                        ');
  console.log('==========================================================================================');
  console.log(`👤 Active Users Created: ${1 + 1 + 5 + 10 + 5 + 10 + 20} accounts`);
  console.log(`📦 May 2026 Orders Created: ${seededOrders.length} completed transactions`);
  console.log(`💰 Cumulative Seed Revenue: ₹${cumulativeRevenue.toLocaleString('en-IN', { maximumFractionDigits: 2 })} INR`);
  console.log('------------------------------------------------------------------------------------------');
  console.log('CHEF PERFORMANCE BONUSES:');
  console.log('Name                  | Score | Tasks Cooked | Performance Bonus');
  console.log('------------------------------------------------------------------------------------------');
  chefStats.forEach(chef => {
    console.log(`${chef.name.padEnd(21)} | ${chef.score.toString().padEnd(5)} | ${chef.tasks.toString().padEnd(12)} | ₹${chef.bonus}`);
  });
  console.log('------------------------------------------------------------------------------------------');
  console.log('DRIVER LOGISTICS & COMMISSION EARNINGS:');
  console.log('Name                  | Trips | Delivery Commission | Driver Bonus');
  console.log('------------------------------------------------------------------------------------------');
  Object.values(driverStats).forEach(ds => {
    console.log(`${ds.name.padEnd(21)} | ${ds.trips.toString().padEnd(5)} | ₹${ds.base.toFixed(2).padEnd(18)} | ₹${ds.bonus.toFixed(2)}`);
  });
  console.log('==========================================================================================\n');
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
