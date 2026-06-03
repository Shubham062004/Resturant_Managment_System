# Disaster Recovery Plan

## Database Recovery
- **Neon (PostgreSQL)**: Utilizes Point-in-Time Recovery (PITR). Restore is available up to 7 days in the past directly from the Neon console.
- **MongoDB Atlas**: Continuous cloud backups. Snapshot restores can be triggered via Atlas dashboard.

## Rollback Procedures
- **Vercel**: Instant rollback available by selecting a previous deployment in the Vercel dashboard and clicking "Promote to Production".
- **Render**: Select the previous successful deployment and trigger a manual rollback.
