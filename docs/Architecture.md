# Architecture Specification: Polyglot Persistence & KDS

## 1. Real-Time Kitchen Display System (KDS)
The KDS uses Socket.io to keep kitchen screens synchronized instantly without polling.

### Event Flow:
1. Customer places order (`POST /api/v1/orders`) -> Order created in PostgreSQL.
2. Express emits `kds_new_order` to `staff_room`.
3. Chef drags order to "Cooking" (`PATCH /api/v1/kitchen/orders/:id/status`).
4. Express saves new status in PostgreSQL, logs event in MongoDB, and emits `kds_status_update`.
5. Frontend Redux store (`kitchenSlice`) receives event and updates state.

## 2. Polyglot Persistence Architecture
We utilize two database engines simultaneously to optimize for different workloads:

- **PostgreSQL (via Prisma):** Relational data (Orders, Users, Products). Requires ACID compliance.
- **MongoDB (via Mongoose):** Telemetry & Time-series data (KitchenEvents, KitchenMetrics). Requires high write throughput for analytic tracking without locking transactional tables.
