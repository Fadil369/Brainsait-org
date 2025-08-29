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
    
    echo -e "${GREEN}✓ All requirements met${NC}"
}

# Build all services
build_services() {
    echo -e "${YELLOW}Building services...${NC}"
    
    # Install dependencies
    echo "Installing dependencies..."
    npm ci --workspaces
    
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
    
    # Export static files for Next.js
    npm run export
    
    # Deploy to Cloudflare Pages
    wrangler pages deploy out \
        --project-name=brainsait-frontend \
        --branch=$ENVIRONMENT \
        --commit-dirty=true
    
    cd ../..
    echo -e "${GREEN}✓ Frontend deployed${NC}"
}

# Deploy backend to Cloudflare Workers
deploy_backend() {
    echo -e "${YELLOW}Deploying backend to Cloudflare Workers...${NC}"
    
    wrangler deploy \
        --name brainsait-backend \
        --env $ENVIRONMENT \
        --compatibility-date 2024-01-01
    
    echo -e "${GREEN}✓ Backend deployed${NC}"
}

# Deploy AI service
deploy_ai() {
    echo -e "${YELLOW}Deploying AI service to Cloudflare Workers...${NC}"
    
    cd packages/brainsait-ai
    
    wrangler deploy \
        --name brainsait-ai \
        --env $ENVIRONMENT \
        --compatibility-date 2024-01-01
    
    cd ../..
    echo -e "${GREEN}✓ AI service deployed${NC}"
}

# Deploy docs service
deploy_docs() {
    echo -e "${YELLOW}Deploying docs service to Cloudflare Workers...${NC}"
    
    cd packages/brainsait-docs
    
    wrangler deploy \
        --name brainsait-docs \
        --env $ENVIRONMENT \
        --compatibility-date 2024-01-01
    
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
    sleep 5
    health_check
    
    echo ""
    echo -e "${GREEN}🎉 Deployment complete!${NC}"
    echo -e "${YELLOW}Environment: $ENVIRONMENT${NC}"
    echo -e "${YELLOW}Service(s): $SERVICE${NC}"
}

# Run main function
main