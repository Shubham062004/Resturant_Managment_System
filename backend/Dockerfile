# Stage 1: Build source resources
FROM node:18-alpine AS builder
RUN apk add --no-cache openssl
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# Generate Prisma Client and compile TypeScript
RUN npx prisma generate --schema src/database/schema.prisma
RUN npm run build

# Stage 2: Production-grade lightweight runtime
FROM node:18-alpine
RUN apk add --no-cache openssl
WORKDIR /app
ENV NODE_ENV=production

# Install only production-level dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy compiled code and Prisma schemas
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/database/schema.prisma ./src/database/schema.prisma

# Generate database schema in the production container context
RUN npx prisma generate --schema src/database/schema.prisma

EXPOSE 5000
CMD ["node", "dist/server.js"]
