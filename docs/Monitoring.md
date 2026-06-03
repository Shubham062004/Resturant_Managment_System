# Monitoring & Observability

## Tools
- **Sentry**: Tracks unhandled exceptions, promise rejections, and performance bottlenecks in the Express backend.
- **Pino + Better Stack**: Structured logging. Logs are shipped to Better Stack (Logtail) for search and alerting.

## Health Checks
- `/api/health`: Basic API uptime.
- `/api/health/database`: Verifies connections to Postgres and Mongo.
- `/api/health/redis`: Ping status of Upstash Redis.
