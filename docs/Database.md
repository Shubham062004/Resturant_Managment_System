# Database Design: Kitchen Module

## PostgreSQL (Relational)

### `KitchenStation`
- `id` (UUID)
- `name` (String)
- `active` (Boolean)

### `KitchenOrder`
- `id` (UUID)
- `orderId` (UUID) -> References `Order`
- `stationId` (UUID) -> References `KitchenStation`
- `priority` (Enum: LOW, MEDIUM, HIGH, URGENT)
- `status` (Enum: QUEUED, COOKING, READY_FOR_PACKING, PACKED, COMPLETED)
- `startedAt` (DateTime)
- `completedAt` (DateTime)

### `KitchenTask`
- `id` (UUID)
- `kitchenOrderId` (UUID) -> References `KitchenOrder`
- `productId` (UUID) -> References `Product`
- `quantity` (Int)

---

## MongoDB (Document)

### `KitchenEvent`
Tracks every state change in the KDS for audit and performance tracking.
- `orderId` (String)
- `stationId` (String)
- `eventType` (String)
- `metadata` (Mixed)
- `timestamp` (Date)

### `KitchenMetric`
Aggregated analytic data.
- `avgPreparationTime` (Number, seconds)
- `completedOrders` (Number)
- `delayedOrders` (Number)
