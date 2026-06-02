# Backend Modules

This folder hosts decoupled backend feature domains (e.g. `auth/`, `menu/`, `orders/`, `tables/`).
Each module is a cluster consisting of:

- `*.routes.ts` - HTTP endpoint routes
- `*.controller.ts` - Request/Response orchestrators
- `*.service.ts` - Business logic and DB transaction execution
- `*.validation.ts` - Zod schema specifications
