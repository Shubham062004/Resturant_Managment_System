# 🔥 Oven Xpress - Restaurant Management System

Oven Xpress is an enterprise-grade, cloud-native Restaurant Management System (RMS) designed to unify FOH (Front-of-House) and BOH (Back-of-House) workflows.

This repository houses the complete production-ready project foundation, fully scaffolded with a modular feature-based architecture, dual-database capability, containerized orchestration, strict linting parameters, and robust CI/CD validation.

---

## 🏗️ Repository Architecture

Oven Xpress implements a monorepo workspace layout using `npm` workspaces to cleanly partition the frontend web client and backend API while centralizing global git hooks and linting configurations.

```
oven-xpress/ (c:\Users\shubh\OneDrive\Desktop\Projects\Resturant_Managment_System)
├── frontend/             # Vite + React + TS + Tailwind CSS client
├── backend/              # Node.js + Express + TypeScript + Prisma + Mongoose api
├── docs/                 # Product and Technical blueprint documents
├── infrastructure/       # Global routing proxy templates & docker setups
└── .github/              # Automated GitHub Actions validation pipelines
```

### Technical Core Specs

- **Frontend**: React (v18), TypeScript, Vite, Tailwind CSS (v3), React Router DOM (v6), Redux Toolkit, TanStack Query (React Query v5), Axios, Framer Motion, and Lucide Icons.
- **Backend**: Node.js, Express, TypeScript, PostgreSQL (Primary SQL), MongoDB (Document catalog/logs), Prisma ORM, Mongoose ODM, Zod payload schema validation, JWT auth, and Winston logging.
- **Infrastructure**: Multi-stage production Dockerfiles, Docker Compose, Nginx Reverse Proxy.
- **Quality Barriers**: ESLint, Prettier, Husky pre-commit hooks, Lint-staged, and Conventional Commits.

---

## ⚡ Quick Start: Running Locally

You can spin up the complete environment including PostgreSQL and MongoDB servers instantly via Docker or execute services natively using npm commands.

### Option A: Standard Orchestration (Docker Compose - Recommended)

Ensure Docker Desktop is active on your machine, then run:

```bash
# 1. Build and boot all services (db-postgres, db-mongodb, backend, frontend)
docker compose up --build -d

# 2. Check service status
docker compose ps

# 3. Stream terminal logs
docker compose logs -f
```

- **Frontend Web Client**: [http://localhost](http://localhost) (Proxied via Nginx)
- **Backend Healthcheck**: [http://localhost:5000/api/v1/health](http://localhost:5000/api/v1/health)
- **PostgreSQL Port**: `5432`
- **MongoDB Port**: `27017`

---

### Option B: Local Development Environment (Native Run)

If you wish to run the packages directly on your local system:

#### 1. Setup Environment Configurations

Copy env parameters from templates in root, frontend, and backend:

```bash
# Root environment
cp .env.example .env

# Backend environment
cp backend/.env.example backend/.env

# Frontend environment
cp frontend/.env.example frontend/.env
```

#### 2. Install Project Dependencies

Run from the workspace root to install all required dependencies for both frontend and backend concurrently:

```bash
npm install
```

#### 3. Initialize Databases

Make sure local PostgreSQL and MongoDB servers are running on your local machine, then synchronize Prisma schemas:

```bash
# Generate Prisma Relational Client
npm run build --workspace=backend
```

#### 4. Boot Dev Servers Concurrently

Start both Vite development client and Express ts-node watch servers concurrently:

```bash
npm run dev
```

- **Vite Dev Server**: [http://localhost:5173](http://localhost:5173)
- **Express API Server**: [http://localhost:5000](http://localhost:5000)

---

## 💎 Linting & Code Quality Commands

Oven Xpress enforces strict visual formatting and type stability rules.

- **Format Check**: Enforces Prettier checks on code blocks:
  ```bash
  npm run format
  ```
- **Lint Check**: Checks for compilation errors or syntax deviations:
  ```bash
  npm run lint
  ```
- **Pre-commit Gatekeeping**: Husky triggers `lint-staged` automatically during git commit operations to format and check modified files before writing changes.

---

## 📝 Git Commit Conventions

We enforce **Conventional Commits** via commitlint hooks. Example message structures:

- **Features**: `feat(auth): integrate token storage in localStorage`
- **Bug Fixes**: `fix(tables): resolve grid toggle crash on mobile layouts`
- **Documentation**: `docs(architecture): clarify dual database transaction boundaries`
- **Refactoring**: `refactor(backend): modularize token generator service class`
