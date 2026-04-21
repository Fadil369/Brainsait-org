#!/bin/bash
# Quick Start - Execute macOS Server Configuration
# This is a convenience wrapper that guides you through the process

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

clear
echo -e "${CYAN}"
cat << "EOF"
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║     macOS Server Configuration for Tailscale Gateway     ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

echo -e "${GREEN}This will configure your Mac for 24/7 server operation${NC}"
echo ""
echo "What will be configured:"
echo "  • Power management (no sleep)"
echo "  • Auto-restart on power failure"
echo "  • Disable automatic updates"
echo "  • Tailscale watchdog (auto-reconnect)"
echo "  • System health monitoring"
echo "  • Auto-recovery services"
echo ""

echo -e "${YELLOW}Prerequisites:${NC}"
echo "  ✓ Admin/sudo access required"
echo "  ✓ Tailscale should be installed"
echo "  ✓ Backup important data first"
echo ""

read -p "Ready to begin? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Setup cancelled."
    exit 0
fi

echo ""
echo -e "${CYAN}Starting setup...${NC}"
echo ""

# Run the main setup script
if [ -f ~/scripts/setup-macos-server.sh ]; then
    bash ~/scripts/setup-macos-server.sh
else
    echo -e "${RED}Error: setup-macos-server.sh not found!${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}Setup script completed!${NC}"
echo ""
echo -e "${CYAN}Next Steps:${NC}"
echo ""
echo "1. Review the output above for any errors"
echo "2. Reboot your Mac to apply all settings:"
echo -e "   ${YELLOW}sudo reboot${NC}"
echo ""
echo "3. After reboot, verify the configuration:"
echo -e "   ${YELLOW}cd ~/scripts && ./verify-server-config.sh${NC}"
echo ""
echo "4. Monitor your system:"
echo -e "   ${YELLOW}tail -f /var/log/health.log${NC}"
echo ""
echo "For detailed documentation, see:"
echo "  • ~/scripts/README.md"
echo "  • ~/scripts/EXECUTION_GUIDE.md"
echo ""
