# Product Requirements Document (PRD) - Oven Xpress

Oven Xpress is an enterprise-grade, cloud-native Restaurant Management System (RMS) designed to unify front-of-house (FOH) and back-of-house (BOH) workflows. It provides real-time POS transaction processing, dynamic table booking, interactive menu customization, staffing coordination, and actionable analytics.

---

## 1. Executive Summary & Goals

Modern restaurants suffer from fragmented systems: separate tools for billing, reservation management, online orders, and inventory. Oven Xpress resolves this by delivering a single, cohesive, high-performance platform capable of handling real-time data with sub-second latency, offline capabilities, and multi-location synchronization.

### Key Objectives

- **Sub-Second Order Dispatch**: Reduce average communication lag between billing desks and Kitchen Display Systems (KDS) to < 300ms.
- **Maximize Occupancy**: Intelligent table reservations with dynamic seating algorithms to boost seat utilization.
- **Unified Menu & Supply Control**: Synchronized inventory depletion based on menu recipes.
- **Analytical Insights**: High-throughput reporting engine tracking labor costs, menu item popularity, and peak operating hours.

---

## 2. Core Functional Modules

### A. Point of Sale (POS) & Billing

- **Draft & Split Billing**: Support splitting tickets by guest, items, or custom ratios.
- **Offline Operations**: Cache transactions locally when internet is offline and sync upon reconnecting.
- **Payment Integration**: Scaffold endpoints for card processors, mobile wallets, and digital billing links.

### B. Kitchen Display System (KDS)

- **Real-time Order Queue**: Color-coded queue indicating preparation status (Preparing, Ready, Delayed).
- **Station Routing**: Route drinks to the bar station, starters to the grill, and mains to the cook line automatically.
- **Prep Time Estimations**: Calculate actual vs estimated recipe duration to optimize dispatch times.

### C. Reservation & Table Management

- **Interactive Floor Grid**: Visual dashboard matching physical layouts (tables, dining areas, bars).
- **Status Flags**: Real-time table states: `Available`, `Reserved`, `Occupied (Dining)`, `Billing`, `Cleaning`.
- **Waitlist Optimization**: Estimate queuing wait-times based on average dining duration.

### D. Inventory & Recipe Integration

- **Real-time Ingredient Depletion**: Automatically deduct inventory stocks upon order placement based on standardized recipes.
- **Low-stock Triggers**: Alerts when items fall below set margins.

---

## 3. User Personas

- **System Administrator**: Manages enterprise tenants, general settings, database backups, and global features.
- **Store Manager**: Manages table layouts, employee rosters, menu updates, and runs shift reports.
- **Server**: Places guest orders, splits checks, manages table seating statuses, and tracks active orders.
- **Kitchen Staff**: Reviews KDS queues, bumps completed dishes, and updates recipe ingredient availability.
- **Cashier**: Processes transactions, handles refunds, and prints shift close summaries.

---

## 4. Non-Functional Requirements

### Security & Compliance

- **Data Sovereignty**: Tokenized, secure sessions via double-wrapped JWT and RBAC.
- **Auditing**: Log all transactional actions (price edits, refunds, deletions) for fraud prevention.

### Scalability & Availability

- **Uptime**: Enforce high-availability architecture with standard Docker scaling.
- **Throughput**: Support up to 500 concurrent connections per branch location under standard loads.
