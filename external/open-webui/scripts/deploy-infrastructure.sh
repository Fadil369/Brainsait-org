#!/bin/bash
# Deploy BrainSAIT Infrastructure to Servers
# Quick deployment script

set -e

TUNNEL_ID="f74a323d-f44c-40b8-b77a-b6f08ab8d3a4"
TUNNEL_CREDS="$HOME/.cloudflared/${TUNNEL_ID}.json"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}"
cat << 'EOF'
╔══════════════════════════════════════════════════════════╗
║                                                           ║
║     🚀 BRAINSAIT INFRASTRUCTURE DEPLOYMENT 🚀           ║
║                                                           ║
╚══════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

# Check tunnel is running
if ! pgrep -f "cloudflared.*brainsait-infrastructure" > /dev/null; then
    echo -e "${YELLOW}⚠️  Warning: Tunnel doesn't appear to be running${NC}"
    echo "Consider running: cloudflared tunnel run --config ~/.cloudflared/brainsait-infrastructure.yml brainsait-infrastructure"
    echo ""
fi

deploy_hetzner() {
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}📦 Deploying to Hetzner Server (46.62.128.198)${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    
    # Copy credentials
    echo "1️⃣  Copying tunnel credentials..."
    scp -o ConnectTimeout=10 "$TUNNEL_CREDS" fadil369@46.62.128.198:/tmp/ || {
        echo -e "${RED}❌ Failed to copy credentials. Check connection to 46.62.128.198${NC}"
        return 1
    }
    
    # Copy setup script
    echo "2️⃣  Copying setup script..."
    scp -o ConnectTimeout=10 ~/scripts/setup-hetzner.sh fadil369@46.62.128.198:/tmp/
    
    echo ""
    echo -e "${GREEN}✅ Files copied successfully!${NC}"
    echo ""
    echo -e "${YELLOW}Next steps:${NC}"
    echo "  1. SSH to Hetzner: ${GREEN}ssh fadil369@46.62.128.198${NC}"
    echo "  2. Run setup: ${GREEN}sudo /tmp/setup-hetzner.sh${NC}"
    echo "  3. Route DNS (from Mac):"
    echo "     ${GREEN}cloudflared tunnel route dns brainsait-infrastructure hetzner.elfadil.com${NC}"
    echo "     ${GREEN}cloudflared tunnel route dns brainsait-infrastructure brainsait.cloud${NC}"
    echo "     ${GREEN}cloudflared tunnel route dns brainsait-infrastructure api.elfadil.com${NC}"
    echo "  4. Test: ${GREEN}ssh hetzner${NC}"
    echo ""
    
    read -p "Do you want to SSH to Hetzner now? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        ssh fadil369@46.62.128.198
    fi
}

deploy_nphies() {
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}🏥 Deploying to NPHIES Server (82.25.101.65)${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    
    # Copy credentials
    echo "1️⃣  Copying tunnel credentials..."
    scp -o ConnectTimeout=10 "$TUNNEL_CREDS" root@82.25.101.65:/tmp/ || {
        echo -e "${RED}❌ Failed to copy credentials. Check connection to 82.25.101.65${NC}"
        return 1
    }
    
    # Copy setup script
    echo "2️⃣  Copying setup script..."
    scp -o ConnectTimeout=10 ~/scripts/setup-nphies.sh root@82.25.101.65:/tmp/
    
    echo ""
    echo -e "${GREEN}✅ Files copied successfully!${NC}"
    echo ""
    echo -e "${YELLOW}Next steps:${NC}"
    echo "  1. SSH to NPHIES: ${GREEN}ssh root@82.25.101.65${NC}"
    echo "  2. Run setup: ${GREEN}/tmp/setup-nphies.sh${NC}"
    echo "  3. Route DNS (from Mac):"
    echo "     ${GREEN}cloudflared tunnel route dns brainsait-infrastructure nphies.elfadil.com${NC}"
    echo "     ${GREEN}cloudflared tunnel route dns brainsait-infrastructure nphies-ssh.elfadil.com${NC}"
    echo "  4. Test: ${GREEN}ssh nphies${NC}"
    echo ""
    
    read -p "Do you want to SSH to NPHIES now? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        ssh root@82.25.101.65
    fi
}

route_dns_hetzner() {
    echo ""
    echo -e "${BLUE}📡 Routing DNS for Hetzner...${NC}"
    cloudflared tunnel route dns brainsait-infrastructure hetzner.elfadil.com
    cloudflared tunnel route dns brainsait-infrastructure brainsait.cloud
    cloudflared tunnel route dns brainsait-infrastructure www.brainsait.cloud
    cloudflared tunnel route dns brainsait-infrastructure api.elfadil.com
    cloudflared tunnel route dns brainsait-infrastructure admin.brainsait.cloud
    cloudflared tunnel route dns brainsait-infrastructure monitor.elfadil.com
    echo -e "${GREEN}✅ Hetzner DNS routes configured${NC}"
}

route_dns_nphies() {
    echo ""
    echo -e "${BLUE}📡 Routing DNS for NPHIES...${NC}"
    cloudflared tunnel route dns brainsait-infrastructure nphies.elfadil.com
    cloudflared tunnel route dns brainsait-infrastructure nphies-ssh.elfadil.com
    cloudflared tunnel route dns brainsait-infrastructure nphies-api.elfadil.com
    cloudflared tunnel route dns brainsait-infrastructure nphies-monitor.elfadil.com
    echo -e "${GREEN}✅ NPHIES DNS routes configured${NC}"
}

show_menu() {
    echo ""
    echo -e "${YELLOW}Select deployment option:${NC}"
    echo ""
    echo "  1) Deploy to Hetzner (46.62.128.198)"
    echo "  2) Deploy to NPHIES (82.25.101.65)"
    echo "  3) Deploy to BOTH servers"
    echo "  4) Just route DNS for Hetzner"
    echo "  5) Just route DNS for NPHIES"
    echo "  6) Route DNS for both"
    echo "  7) Check tunnel status"
    echo "  8) Exit"
    echo ""
    read -p "Enter choice [1-8]: " choice
    
    case $choice in
        1)
            deploy_hetzner
            ;;
        2)
            deploy_nphies
            ;;
        3)
            deploy_hetzner
            echo ""
            deploy_nphies
            ;;
        4)
            route_dns_hetzner
            ;;
        5)
            route_dns_nphies
            ;;
        6)
            route_dns_hetzner
            route_dns_nphies
            ;;
        7)
            echo ""
            cloudflared tunnel info brainsait-infrastructure
            echo ""
            cloudflared tunnel route dns list | grep brainsait-infrastructure || echo "No routes found"
            ;;
        8)
            echo "Exiting..."
            exit 0
            ;;
        *)
            echo -e "${RED}Invalid option${NC}"
            ;;
    esac
}

# Main
if [ ! -f "$TUNNEL_CREDS" ]; then
    echo -e "${RED}❌ Error: Tunnel credentials not found at $TUNNEL_CREDS${NC}"
    exit 1
fi

# If arguments provided, use them
if [ $# -gt 0 ]; then
    case $1 in
        hetzner)
            deploy_hetzner
            ;;
        nphies)
            deploy_nphies
            ;;
        both)
            deploy_hetzner
            deploy_nphies
            ;;
        dns-hetzner)
            route_dns_hetzner
            ;;
        dns-nphies)
            route_dns_nphies
            ;;
        dns-both)
            route_dns_hetzner
            route_dns_nphies
            ;;
        *)
            echo "Usage: $0 [hetzner|nphies|both|dns-hetzner|dns-nphies|dns-both]"
            exit 1
            ;;
    esac
else
    # Interactive mode
    show_menu
fi
