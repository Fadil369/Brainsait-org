# Document Service Dockerfile
FROM node:18-alpine

# Install system dependencies for Puppeteer
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    curl

# Tell Puppeteer to use the installed Chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Set working directory
WORKDIR /app

# Copy package files
COPY packages/brainsait-docs/package*.json ./
COPY packages/brainsait-shared/ ../brainsait-shared/

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY packages/brainsait-docs/src/ ./src/
COPY packages/brainsait-docs/templates/ ./templates/
COPY packages/brainsait-docs/tsconfig.json ./

# Build the application
RUN npm run build

# Create directories for output and temp files
RUN mkdir -p output temp logs

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S docs -u 1001

# Change ownership of the app directory
RUN chown -R docs:nodejs /app
USER docs

# Expose port
EXPOSE 5002

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5002/health || exit 1

# Start command
CMD ["npm", "start"]