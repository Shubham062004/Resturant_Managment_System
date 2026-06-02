# Database Schema & Data Models

Oven Xpress implements a dual-database pattern, leveraging both relational PostgreSQL and document-based MongoDB. This guide maps out database boundary lines, models, and indexing strategies.

---

## 1. Relational Layer: PostgreSQL & Prisma

PostgreSQL acts as the ledger of truth, managing records requiring strict consistency, ACID guarantees, and structural joins.

```prisma
// High-level Conceptual Model Layout (Synthesized for Database.md representation)

model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String
  name      String
  role      Role     @default(SERVER)
  isActive  Boolean  @default(true)
  orders    Order[]
  createdAt DateTime @default(now())
}

enum Role {
  ADMIN
  MANAGER
  SERVER
  KITCHEN
}

model Table {
  id        String       @id @default(uuid())
  number    String       @unique
  capacity  Int
  status    TableStatus  @default(AVAILABLE)
  bookings  Booking[]
  orders    Order[]
}

enum TableStatus {
  AVAILABLE
  RESERVED
  OCCUPIED
  BILLING
  CLEANING
}

model Booking {
  id          String   @id @default(uuid())
  tableId     String
  table       Table    @relation(fields: [tableId], references: [id])
  guestName   String
  guestCount  Int
  startTime   DateTime
  endTime     DateTime
  status      String   @default("CONFIRMED")
}

model Order {
  id         String      @id @default(uuid())
  tableId    String
  table      Table       @relation(fields: [tableId], references: [id])
  userId     String
  server     User        @relation(fields: [userId], references: [id])
  status     OrderStatus @default(ORDERED)
  total      Decimal     @db.Decimal(10, 2)
  bills      Bill[]
  createdAt  DateTime    @default(now())
}

enum OrderStatus {
  ORDERED
  PREPARING
  SERVED
  COMPLETED
  CANCELLED
}

model Bill {
  id            String        @id @default(uuid())
  orderId       String
  order         Order         @relation(fields: [orderId], references: [id])
  subtotal      Decimal       @db.Decimal(10, 2)
  tax           Decimal       @db.Decimal(10, 2)
  discount      Decimal       @db.Decimal(10, 2) @default(0.00)
  total         Decimal       @db.Decimal(10, 2)
  paymentStatus PaymentStatus @default(UNPAID)
}

enum PaymentStatus {
  UNPAID
  PAID
  PARTIALLY_PAID
  REFUNDED
}
```

---

## 2. Document Layer: MongoDB & Mongoose

MongoDB manages rapid read-heavy configurations, dynamic deep-nested catalogs (e.g. food modifiers, recipes), logging, and high-velocity telemetry.

### A. Menu Catalog (`menus` Collection)

```json
{
  "_id": "ObjectId",
  "name": "Dinner Menu",
  "categories": [
    {
      "name": "Starters",
      "items": [
        {
          "name": "Truffle Fries",
          "price": 12.5,
          "ingredients": [{ "id": "ing_potato", "qty": 200, "unit": "g" }],
          "modifiers": [
            {
              "name": "Extra Sauce",
              "choices": [{ "name": "Garlic Aioli", "extraPrice": 1.5 }]
            }
          ]
        }
      ]
    }
  ]
}
```

### B. Audit Trail / Fraud Guard (`audit_logs` Collection)

- Logged upon high-risk actions (e.g., invoice refund, invoice cancellation, manager override):

```json
{
  "_id": "ObjectId",
  "action": "ORDER_DISCOUNT_APPLIED",
  "timestamp": "ISODate",
  "performedBy": "usr_server_id",
  "approvedBy": "usr_manager_id",
  "payload": {
    "orderId": "ord_postgres_uuid",
    "preDiscount": 120.0,
    "postDiscount": 96.0,
    "ratio": "20%"
  }
}
```

---

## 3. Catalog Query Optimization

Menu/catalog endpoints use Prisma `select` projections and pagination to avoid over-fetching:

| Endpoint                           | Pagination      | Notes                                        |
| :--------------------------------- | :-------------- | :------------------------------------------- |
| `GET /catalog/restaurants`         | `page`, `limit` | Branch hours included via selective `select` |
| `GET /catalog/products`            | `page`, `limit` | Variants loaded in single query              |
| `GET /catalog/branches`            | `page`, `limit` | Filterable by `restaurantId`                 |
| `GET /catalog/categories`          | `page`, `limit` | Filterable by `restaurantId`                 |
| `GET /catalog/favorites`           | `page`, `limit` | Authenticated; product graph via `select`    |
| `GET /catalog/reviews/product/:id` | `page`, `limit` | User profile fields selectively loaded       |

---

## 4. Relational Mapping & Indexing Rules

- **Foreign Keys**: Indexes on all foreign key references (`tableId`, `userId`, `orderId`) are mandatory in PostgreSQL.
- **Compound Indexes**:
  - MongoDB: Composite index on `{"categories.items.name": 1, "isActive": 1}` for high-performance menu querying.
  - PostgreSQL: Joint index on `(tableId, status)` to query active tables at checkout quickly.
