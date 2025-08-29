# Backend Dockerfile
FROM node:18-alpine

# Install system dependencies
RUN apk add --no-cache \
    curl \
    postgresql-client

# Set working directory
WORKDIR /app

# Copy package files
COPY packages/brainsait-backend/package*.json ./
COPY packages/brainsait-shared/ ../brainsait-shared/

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY packages/brainsait-backend/src/ ./src/
COPY packages/brainsait-backend/prisma/ ./prisma/
COPY packages/brainsait-backend/tsconfig.json ./

# Build the application
RUN npm run build

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S backend -u 1001

# Change ownership of the app directory
RUN chown -R backend:nodejs /app
USER backend

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5000/health || exit 1

# Start command
CMD ["npm", "start"]