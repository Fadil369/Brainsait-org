#!/bin/bash

# BrainSAIT Platform Deployment Script for Cloudflare
# Usage: ./deploy.sh [environment] [service]
# Examples:
#   ./deploy.sh production all
#   ./deploy.sh staging frontend
#   ./deploy.sh development backend

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Default values
ENVIRONMENT=${1:-staging}
SERVICE=${2:-all}

echo -e "${GREEN}🚀 BrainSAIT Platform Deployment Script${NC}"
echo -e "${YELLOW}Environment: $ENVIRONMENT${NC}"
echo -e "${YELLOW}Service: $SERVICE${NC}"
echo ""

# Check if required tools are installed
check_requirements() {
    echo -e "${YELLOW}Checking requirements...${NC}"
    
    if ! command -v wrangler &> /dev/null; then
        echo -e "${RED}Error: Wrangler CLI is not installed${NC}"
        echo "Install it with: npm install -g wrangler"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        echo -e "${RED}Error: npm is not installed${NC}"
        exit 1
    fi
    
    # Check if authenticated with Cloudflare
    if ! wrangler whoami &> /dev/null; then
        echo -e "${RED}Error: Not authenticated with Cloudflare${NC}"
        echo "Login with: wrangler login"
        exit 1
    fi
    
    echo -e "${GREEN}✓ All requirements met${NC}"
}

# Setup Cloudflare infrastructure
setup_infrastructure() {
    echo -e "${YELLOW}Setting up Cloudflare infrastructure...${NC}"
    
    # Create KV namespaces
    echo "Creating KV namespaces..."
    create_kv_namespace() {
        local namespace_name="$1"
        local env_suffix=""
        if [ "$ENVIRONMENT" != "production" ]; then
            env_suffix="-$ENVIRONMENT"
        fi
        
        local full_name="${namespace_name}${env_suffix}"
        if ! wrangler kv namespace list | grep -q "$full_name"; then
            wrangler kv namespace create "$full_name"
            echo "Created KV namespace: $full_name"
        else
            echo "KV namespace already exists: $full_name"
        fi
    }
    
    create_kv_namespace "brainsait-cache"
    create_kv_namespace "brainsait-sessions"
    create_kv_namespace "brainsait-rate-limit"
    create_kv_namespace "brainsait-metrics"
    create_kv_namespace "brainsait-config"
    
    # Create R2 buckets
    echo "Creating R2 buckets..."
    create_r2_bucket() {
        local bucket_name="$1"
        local env_suffix=""
        if [ "$ENVIRONMENT" != "production" ]; then
            env_suffix="-$ENVIRONMENT"
        fi
        
        local full_name="${bucket_name}${env_suffix}"
        if ! wrangler r2 bucket list | grep -q "$full_name"; then
            wrangler r2 bucket create "$full_name"
            echo "Created R2 bucket: $full_name"
        else
            echo "R2 bucket already exists: $full_name"
        fi
    }
    
    create_r2_bucket "brainsait-documents"
    create_r2_bucket "brainsait-uploads"
    create_r2_bucket "brainsait-backups"
    create_r2_bucket "brainsait-analytics"
    
    # Create D1 database
    echo "Setting up D1 database..."
    local db_name="brainsait-db"
    if [ "$ENVIRONMENT" != "production" ]; then
        db_name="brainsait-db-$ENVIRONMENT"
    fi
    
    if ! wrangler d1 list | grep -q "$db_name"; then
        wrangler d1 create "$db_name"
        echo "Created D1 database: $db_name"
    else
        echo "D1 database already exists: $db_name"
    fi
    
    echo -e "${GREEN}✓ Infrastructure setup complete${NC}"
}

# Build all services
build_services() {
    echo -e "${YELLOW}Building services...${NC}"
    
    # Install dependencies
    echo "Installing dependencies..."
    npm install
    
    # Generate Prisma client
    echo "Generating Prisma client..."
    cd packages/brainsait-backend
    npx prisma generate
    cd ../..
    
    # Build based on service selection
    if [ "$SERVICE" = "all" ] || [ "$SERVICE" = "frontend" ]; then
        echo "Building frontend..."
        npm run build:frontend
    fi
    
    if [ "$SERVICE" = "all" ] || [ "$SERVICE" = "backend" ]; then
        echo "Building backend..."
        npm run build:backend
    fi
    
    if [ "$SERVICE" = "all" ] || [ "$SERVICE" = "ai" ]; then
        echo "Building AI service..."
        cd packages/brainsait-ai
        npm run build
        cd ../..
    fi
    
    if [ "$SERVICE" = "all" ] || [ "$SERVICE" = "docs" ]; then
        echo "Building docs service..."
        cd packages/brainsait-docs
        npm run build
        cd ../..
    fi
    
    echo -e "${GREEN}✓ Build complete${NC}"
}

# Deploy frontend to Cloudflare Pages
deploy_frontend() {
    echo -e "${YELLOW}Deploying frontend to Cloudflare Pages...${NC}"
    
    cd packages/brainsait-frontend
    
    # Set environment variables for build
    export NODE_ENV=$ENVIRONMENT
    export NEXT_PUBLIC_ENVIRONMENT=$ENVIRONMENT
    
    if [ "$ENVIRONMENT" = "production" ]; then
        export NEXT_PUBLIC_API_URL="https://api.brainsait.com"
        export NEXT_PUBLIC_AI_URL="https://ai.brainsait.com"
        export NEXT_PUBLIC_DOCS_URL="https://docs.brainsait.com"
    elif [ "$ENVIRONMENT" = "staging" ]; then
        export NEXT_PUBLIC_API_URL="https://staging-api.brainsait.com"
        export NEXT_PUBLIC_AI_URL="https://staging-ai.brainsait.com"
        export NEXT_PUBLIC_DOCS_URL="https://staging-docs.brainsait.com"
    else
        export NEXT_PUBLIC_API_URL="https://dev-api.brainsait.com"
        export NEXT_PUBLIC_AI_URL="https://dev-ai.brainsait.com"
        export NEXT_PUBLIC_DOCS_URL="https://dev-docs.brainsait.com"
    fi
    
    # Build for the specific environment
    npm run build
    
    # Export static files for Next.js
    npm run export
    
    # Deploy to Cloudflare Pages
    local project_name="brainsait-frontend"
    if [ "$ENVIRONMENT" != "production" ]; then
        project_name="brainsait-frontend-$ENVIRONMENT"
    fi
    
    wrangler pages deploy out \
        --project-name="$project_name" \
        --branch="$ENVIRONMENT" \
        --commit-dirty=true \
        --compatibility-date=2024-01-01
    
    cd ../..
    echo -e "${GREEN}✓ Frontend deployed${NC}"
}

# Deploy backend to Cloudflare Workers
deploy_backend() {
    echo -e "${YELLOW}Deploying backend to Cloudflare Workers...${NC}"
    
    cd packages/brainsait-backend
    
    # Deploy with environment-specific configuration
    wrangler deploy \
        --name="brainsait-backend" \
        --env="$ENVIRONMENT" \
        --compatibility-date=2024-01-01 \
        --compatibility-flags=nodejs_compat \
        --minify
    
    cd ../..
    echo -e "${GREEN}✓ Backend deployed${NC}"
}

# Deploy AI service
deploy_ai() {
    echo -e "${YELLOW}Deploying AI service to Cloudflare Workers...${NC}"
    
    cd packages/brainsait-ai
    
    wrangler deploy \
        --name="brainsait-ai" \
        --env="$ENVIRONMENT" \
        --compatibility-date=2024-01-01 \
        --compatibility-flags=nodejs_compat \
        --minify
    
    cd ../..
    echo -e "${GREEN}✓ AI service deployed${NC}"
}

# Deploy docs service
deploy_docs() {
    echo -e "${YELLOW}Deploying docs service to Cloudflare Workers...${NC}"
    
    cd packages/brainsait-docs
    
    wrangler deploy \
        --name="brainsait-docs" \
        --env="$ENVIRONMENT" \
        --compatibility-date=2024-01-01 \
        --compatibility-flags=nodejs_compat \
        --minify
    
    cd ../..
    echo -e "${GREEN}✓ Docs service deployed${NC}"
}

# Run database migrations
run_migrations() {
    echo -e "${YELLOW}Running database migrations...${NC}"
    
    cd packages/brainsait-backend
    
    if [ "$ENVIRONMENT" = "production" ]; then
        echo -e "${RED}⚠️  Production migration - are you sure? (y/n)${NC}"
        read -r confirmation
        if [ "$confirmation" != "y" ]; then
            echo "Migration cancelled"
            return
        fi
    fi
    
    npx prisma migrate deploy
    
    cd ../..
    echo -e "${GREEN}✓ Migrations complete${NC}"
}

# Health check
health_check() {
    echo -e "${YELLOW}Running health checks...${NC}"
    
    if [ "$ENVIRONMENT" = "production" ]; then
        API_URL="https://api.brainsait.com"
        FRONTEND_URL="https://brainsait.com"
        AI_URL="https://ai.brainsait.com"
        DOCS_URL="https://docs.brainsait.com"
    elif [ "$ENVIRONMENT" = "staging" ]; then
        API_URL="https://staging-api.brainsait.com"
        FRONTEND_URL="https://staging.brainsait.com"
        AI_URL="https://staging-ai.brainsait.com"
        DOCS_URL="https://staging-docs.brainsait.com"
    else
        API_URL="http://localhost:5000"
        FRONTEND_URL="http://localhost:3000"
        AI_URL="http://localhost:5001"
        DOCS_URL="http://localhost:5002"
    fi
    
    # Check each service
    if [ "$SERVICE" = "all" ] || [ "$SERVICE" = "backend" ]; then
        if curl -f "$API_URL/health" &> /dev/null; then
            echo -e "${GREEN}✓ Backend is healthy${NC}"
        else
            echo -e "${RED}✗ Backend health check failed${NC}"
        fi
    fi
    
    if [ "$SERVICE" = "all" ] || [ "$SERVICE" = "frontend" ]; then
        if curl -f "$FRONTEND_URL" &> /dev/null; then
            echo -e "${GREEN}✓ Frontend is healthy${NC}"
        else
            echo -e "${RED}✗ Frontend health check failed${NC}"
        fi
    fi
    
    if [ "$SERVICE" = "all" ] || [ "$SERVICE" = "ai" ]; then
        if curl -f "$AI_URL/health" &> /dev/null; then
            echo -e "${GREEN}✓ AI service is healthy${NC}"
        else
            echo -e "${RED}✗ AI service health check failed${NC}"
        fi
    fi
    
    if [ "$SERVICE" = "all" ] || [ "$SERVICE" = "docs" ]; then
        if curl -f "$DOCS_URL/health" &> /dev/null; then
            echo -e "${GREEN}✓ Docs service is healthy${NC}"
        else
            echo -e "${RED}✗ Docs service health check failed${NC}"
        fi
    fi
}

# Main deployment flow
main() {
    check_requirements
    setup_infrastructure
    build_services
    
    # Deploy based on service selection
    if [ "$SERVICE" = "all" ]; then
        deploy_frontend
        deploy_backend
        deploy_ai
        deploy_docs
        run_migrations
    elif [ "$SERVICE" = "frontend" ]; then
        deploy_frontend
    elif [ "$SERVICE" = "backend" ]; then
        deploy_backend
        run_migrations
    elif [ "$SERVICE" = "ai" ]; then
        deploy_ai
    elif [ "$SERVICE" = "docs" ]; then
        deploy_docs
    else
        echo -e "${RED}Unknown service: $SERVICE${NC}"
        echo "Valid services: all, frontend, backend, ai, docs"
        exit 1
    fi
    
    # Run health checks
    sleep 10
    health_check
    
    echo ""
    echo -e "${GREEN}🎉 Deployment complete!${NC}"
    echo -e "${YELLOW}Environment: $ENVIRONMENT${NC}"
    echo -e "${YELLOW}Service(s): $SERVICE${NC}"
    
    # Display deployment URLs
    display_urls
}

# Display deployment URLs
display_urls() {
    echo ""
    echo -e "${GREEN}📡 Deployment URLs:${NC}"
    
    if [ "$ENVIRONMENT" = "production" ]; then
        echo -e "${YELLOW}Frontend:${NC} https://brainsait.com"
        echo -e "${YELLOW}API:${NC} https://api.brainsait.com"
        echo -e "${YELLOW}AI Service:${NC} https://ai.brainsait.com"
        echo -e "${YELLOW}Documentation:${NC} https://docs.brainsait.com"
    elif [ "$ENVIRONMENT" = "staging" ]; then
        echo -e "${YELLOW}Frontend:${NC} https://staging.brainsait.com"
        echo -e "${YELLOW}API:${NC} https://staging-api.brainsait.com"
        echo -e "${YELLOW}AI Service:${NC} https://staging-ai.brainsait.com"
        echo -e "${YELLOW}Documentation:${NC} https://staging-docs.brainsait.com"
    else
        echo -e "${YELLOW}Frontend:${NC} https://dev.brainsait.com"
        echo -e "${YELLOW}API:${NC} https://dev-api.brainsait.com"
        echo -e "${YELLOW}AI Service:${NC} https://dev-ai.brainsait.com"
        echo -e "${YELLOW}Documentation:${NC} https://dev-docs.brainsait.com"
    fi
}

# Run main function
main