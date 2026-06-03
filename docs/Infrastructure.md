# Infrastructure & Scaling Strategy

## High-Level Architecture
- **Frontend**: Next.js/Vite on Vercel Edge Network.
- **Backend**: Express API on Render (autoscaling configured for 1-5 instances).
- **Relational DB**: Neon PostgreSQL (Serverless, auto-suspend disabled for prod).
- **Document DB**: MongoDB Atlas for high-throughput AI logs.
- **Cache/Queue**: Upstash Redis for BullMQ jobs and caching.

## Scaling Triggers
- **10k Users**: Default autoscaling on Render handles this gracefully.
- **50k Users**: Increase Render instances to 5, upgrade Neon compute size.
- **100k Users**: Implement Redis caching for catalog routes, introduce database read-replicas.
