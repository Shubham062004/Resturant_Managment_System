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
