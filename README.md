# 🔥 ABC - Enterprise Restaurant Management System (RMS)

ABC is an enterprise-grade, cloud-native Restaurant Management System (RMS) designed to unify FOH (Front-of-House) and BOH (Back-of-House) workflows in a multi-tenant, high-performance monorepo workspace.

This repository houses the complete production-ready project foundation, fully scaffolded with a modular feature-based architecture, dual-database capability, containerized orchestration, strict linting parameters, and robust CI/CD validation.

---

## 🏗️ Project Architecture & Layout

ABC implements a monorepo workspace layout containing decoupled frontend and backend services:

```text
├── backend/                   # Node.js + Express + Prisma (PostgreSQL) + Mongoose (MongoDB)
│   ├── src/
│   │   ├── database/          # Prisma schema, migrations, and seed scripts
│   │   │   ├── seeders/       # Specialized ERP & dummy history simulation generators
│   │   │   └── seeds/         # Foundational database seed components (01-10)
│   │   └── modules/           # Modular backend feature logic
│   └── package.json           # Backend dependency configurations and scripts
│
├── frontend/                  # React (v18) + TypeScript + Vite + Tailwind CSS
│   ├── src/
│   │   ├── features/          # Domain-specific modules (Auth, Orders, Manager, etc.)
│   │   │   └── history/       # Complete ERP History tracking pages
│   │   ├── routes/            # App routing with role-based protected guards
│   │   └── layouts/           # Customer, Admin, Staff, and Manager layouts
│   └── package.json           # Frontend dependency configurations and scripts
│
├── docker-compose.yml         # Containerized development orchestration
└── package.json               # Monorepo root workspace settings and scripts
```

---

## ⚙️ Tech Stack

- **Frontend**: React (v18), TypeScript, Vite, Tailwind CSS (v3), React Router DOM (v6), Redux Toolkit, React Query (v5).
- **Backend**: Node.js, Express, TypeScript, PostgreSQL (Primary DB via Prisma ORM), MongoDB (Logs/Analytics via Mongoose ODM), Socket.io (Real-time updates), Zod.
- **Infrastructure**: Multi-stage Docker, Nginx reverse proxy, GitHub Actions (CI/CD), Vercel configurations.
- **Quality & Security**: Helmet, CORS, Express Rate Limiting, Zod Request Validation, ESLint, Prettier, Husky, Lint-Staged.

---

## 🚀 Key Modules & Features

### 1. Unified Dashboard Ecosystem & Role-Based Portals

- **Owner / Administrator Dashboard**: Beautiful workspace with real-time performance analytics, branch administration, inventory health monitoring, payroll controls, and AI Insights.
- **Branch Manager Operations Console**: Deep branch operations control containing custom table layouts, kitchen KDS interfaces, active orders trackers, reservation manager, and staff rosters.
- **Staff Portal & Work Queue**: Dedicated UI for kitchen staff, cashiers, and chefs with real-time preparation status queues, attendance tracking, and individual performance ratings.
- **Driver & Delivery Workspace**: Dedicated workspace for vehicle validation, order tracking, real-time driver delivery queues, and earnings dashboards.
- **Super Admin Workspace**: Platform-level control panel to govern multi-tenant organization hierarchy, billing configurations, and franchise settings.

### 2. Deep ERP History Logging (12 Dedicated Sub-Modules)

A comprehensive historical database logger and visualizer with granular metrics for:

- **Orders & Cart History**: Unified order statuses, refund workflows, and custom payment audit logs.
- **Staff & Attendance logs**: Shifts, attendance records, check-in/out timestamps, and working hours analysis.
- **Inventory & Ingredients**: Stock movements, supplier shipments, waste audits, and recipe consumptions.
- **Salary & Bonuses**: Monthly salary revisions, incentives, deduction lists, and payroll confirmations.
- **Audit & System Logs**: User actions (login/logout/changes) and network level logging for platform security.

---

## ⚡ Quick Start & Development

### 1. Containerized Run (Docker Compose)

Spins up PostgreSQL, MongoDB, Backend API, and Frontend client automatically:

```bash
docker compose up --build -d
```

- **Frontend Client**: [http://localhost](http://localhost)
- **Backend Health API**: [http://localhost:5000/api/v1/health](http://localhost:5000/api/v1/health)

### 2. Native Development Build

To run the monorepo locally on your host environment:

1.  **Install dependencies**:
    ```bash
    npm install
    ```
2.  **Generate DB client and build project components**:
    ```bash
    npm run build
    ```
3.  **Start all services simultaneously in development mode**:
    ```bash
    npm run dev
    ```

---

## 💾 Database Seeding & Mock Environments

The backend service is equipped with advanced seed generators to establish mock environments with rich historical records.

Inside the `backend` workspace, you can use the following npm scripts:

- **`npm run seed`**: Seeds foundational models such as system organizations, branches, core users, menus, and transaction outlines.
- **`npm run seed:inventory`**: Populates the database with detailed ingredient records, inventory levels, and branch-specific stock limits.
- **`npm run seed:mongodb`**: Seeds MongoDB instances with mock analytics, activity timelines, and tracking alerts.
- **`npm run seed:dummy-history`**: Generates a massive 365-day historical dataset (orders, checkout pipelines, branch-level sales) simulating active business records.
- **`npm run seed:dummy-erp-history`** (via node/ts-node): Injects 10k+ operational records including staff attendance logs, payroll summaries, inventory requests, purchase orders, audit histories, and stock movements.
- **`npm run create-demo-data`**: Cleans the active database and runs the foundational seed pipeline sequentially.

---

## 🧪 Testing & Validation

- **End-to-End Testing**: Managed via Playwright configuration scripts in the root directory. Run E2E suites with:
  ```bash
  npm run test
  ```
- **Unit & Integration Testing**: Structured Jest and Vitest validation suites. Run unit tests with:
  ```bash
  npm run test -w backend
  ```
- **Code Quality Pipelines**: Strictly validated using pre-commit Husky hooks checking formatting (Prettier) and style rules (ESLint). Run manual lint fixes using:
  ```bash
  npm run lint:fix
  ```
