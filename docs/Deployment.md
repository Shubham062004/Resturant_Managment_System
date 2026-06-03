# Deployment Guide

## CI/CD Pipeline
- **Frontend**: Automatically deployed to Vercel upon merges to `main`.
- **Backend**: Deployed to Render via deploy hooks triggered by `.github/workflows/backend-deploy.yml`.

## Local Docker Deployment
Use `docker-compose.prod.yml` to spin up the full stack using production images:
```bash
docker-compose -f docker-compose.prod.yml up --build -d
```
Ensure you have a `.env` file populating keys for Postgres, Mongo, and Redis.
