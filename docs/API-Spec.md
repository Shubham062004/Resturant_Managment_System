# Kitchen Dashboard API Specification

## Base URL
`/api/v1/kitchen`

## Endpoints

### 1. Get Active Orders
**GET** `/orders`
- **Response:** `200 OK`
- **Body:** `{ data: { orders: KitchenOrder[] } }`

### 2. Update Order Status
**PATCH** `/orders/:id/status`
- **Body:** `{ status: "QUEUED" | "COOKING" | "READY_FOR_PACKING" | "PACKED" | "COMPLETED" }`
- **Response:** `200 OK`
- **Side effects:** Emits `kds_status_update` socket event.

### 3. Assign Order
**PATCH** `/orders/:id/assign`
- **Body:** `{ stationId?: UUID, assignedTo?: UUID, priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT" }`
- **Response:** `200 OK`

### 4. Get Stations
**GET** `/stations`
- **Response:** `200 OK`
- **Body:** `{ data: { stations: KitchenStation[] } }`

### 5. Create Station
**POST** `/stations`
- **Body:** `{ name: string, description?: string }`
- **Response:** `201 Created`

### 6. Get Analytics
**GET** `/analytics`
- **Response:** `200 OK`
- **Body:** `{ data: { analytics: { totalOrders, completedOrders, metrics } } }`

- `POST /api/v1/inventory/waste` - Log wastage/spoilage
- `GET /api/v1/inventory/analytics` - Get KPIs (low stock, waste today, etc.)

---

## 9. Point of Sale (POS) API

### Terminals & Shifts
- `POST /api/v1/pos/terminals` - Register a new terminal
- `GET /api/v1/pos/terminals/:branchId` - List terminals
- `POST /api/v1/pos/shifts/start` - Open a shift/cash drawer
- `POST /api/v1/pos/shifts/end/:drawerId` - Close shift and reconcile cash

### Order Processing
- `POST /api/v1/pos/orders` - Create a POS order (and nested Kitchen/Core Order)
- `GET /api/v1/pos/orders/:id` - Fetch details of a POS order
- `POST /api/v1/pos/payments` - Process split/full payments for an order
- `GET /api/v1/pos/receipts/:posOrderId` - Generate or fetch receipt

### Analytics
- `GET /api/v1/pos/analytics/today/:branchId` - Today's sales (cash vs digital)
