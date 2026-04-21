#!/bin/bash
# macOS Server Setup Script
# Configures Mac for 24/7 server operation as Tailscale gateway

set -e

echo "================================================"
echo "macOS Server Configuration Script"
echo "================================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running on macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
    echo -e "${RED}Error: This script is for macOS only${NC}"
    exit 1
fi

echo -e "${YELLOW}This script will configure your Mac for server operation.${NC}"
echo -e "${YELLOW}Some commands require sudo access.${NC}"
echo ""
read -p "Continue? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
fi

echo ""
echo -e "${GREEN}[1/10] Configuring Power Management...${NC}"
echo "Disabling sleep modes..."
sudo pmset -a sleep 0
sudo pmset -a disksleep 0
sudo pmset -a displaysleep 0
sudo pmset -a hibernatemode 0

echo "Enabling Wake-on-LAN..."
sudo pmset -a womp 1

echo "Enabling auto-restart after power failure..."
sudo pmset -a autorestart 1

echo "Configuring restart on freeze..."
sudo systemsetup -setrestartfreeze on 2>/dev/null || echo "Note: restartfreeze may not be available on all macOS versions"

echo -e "${GREEN}Power management configured successfully${NC}"
echo ""

echo -e "${GREEN}[2/10] Disabling Automatic Updates...${NC}"
sudo defaults write /Library/Preferences/com.apple.SoftwareUpdate AutomaticDownload -bool false
sudo defaults write /Library/Preferences/com.apple.SoftwareUpdate AutomaticallyInstallMacOSUpdates -bool false
sudo defaults write /Library/Preferences/com.apple.SoftwareUpdate CriticalUpdateInstall -bool false
echo -e "${GREEN}Automatic updates disabled${NC}"
echo ""

echo -e "${GREEN}[3/10] Configuring Screen Lock...${NC}"
defaults write com.apple.screensaver askForPassword -int 0
echo -e "${GREEN}Screen lock disabled${NC}"
echo -e "${YELLOW}Note: For auto-login, run manually: sudo defaults write /Library/Preferences/com.apple.loginwindow autoLoginUser \"your_username\"${NC}"
echo ""

echo -e "${GREEN}[4/10] Setting Script Permissions...${NC}"
chmod +x ~/scripts/tailscale-watchdog.sh
chmod +x ~/scripts/health-check.sh
chmod +x ~/scripts/setup-macos-server.sh
echo -e "${GREEN}Scripts are now executable${NC}"
echo ""

echo -e "${GREEN}[5/10] Creating Log Files...${NC}"
sudo touch /var/log/tailscale-watchdog.log
sudo touch /var/log/basma-watchdog.log
sudo touch /var/log/basma-watchdog-error.log
sudo touch /var/log/basma-healthcheck.log
sudo touch /var/log/basma-healthcheck-error.log
sudo touch /var/log/health.log
sudo chmod 644 /var/log/tailscale-watchdog.log
sudo chmod 644 /var/log/basma-*.log
sudo chmod 644 /var/log/health.log
echo -e "${GREEN}Log files created${NC}"
echo ""

echo -e "${GREEN}[6/10] Installing Launchd Services...${NC}"
if [ -f ~/scripts/com.basma.watchdog.plist ]; then
    sudo cp ~/scripts/com.basma.watchdog.plist /Library/LaunchDaemons/
    sudo chown root:wheel /Library/LaunchDaemons/com.basma.watchdog.plist
    sudo chmod 644 /Library/LaunchDaemons/com.basma.watchdog.plist
    sudo launchctl load /Library/LaunchDaemons/com.basma.watchdog.plist 2>/dev/null || echo "Watchdog service will start on next boot"
    echo -e "${GREEN}Tailscale watchdog service installed${NC}"
fi

if [ -f ~/scripts/com.basma.healthcheck.plist ]; then
    sudo cp ~/scripts/com.basma.healthcheck.plist /Library/LaunchDaemons/
    sudo chown root:wheel /Library/LaunchDaemons/com.basma.healthcheck.plist
    sudo chmod 644 /Library/LaunchDaemons/com.basma.healthcheck.plist
    sudo launchctl load /Library/LaunchDaemons/com.basma.healthcheck.plist 2>/dev/null || echo "Health check service will start on next boot"
    echo -e "${GREEN}Health check service installed${NC}"
fi
echo ""

echo -e "${GREEN}[7/10] Disabling Time Machine (optional)...${NC}"
read -p "Disable Time Machine? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    sudo tmutil disable
    echo -e "${GREEN}Time Machine disabled${NC}"
else
    echo -e "${YELLOW}Time Machine left enabled${NC}"
fi
echo ""

echo -e "${GREEN}[8/10] Checking Tailscale Installation...${NC}"
if command -v tailscale &>/dev/null; then
    echo -e "${GREEN}Tailscale CLI found${NC}"
    tailscale status || echo -e "${YELLOW}Tailscale not connected yet${NC}"
elif [ -d "/Applications/Tailscale.app" ]; then
    echo -e "${GREEN}Tailscale app found${NC}"
else
    echo -e "${YELLOW}Tailscale not found. Please install from https://tailscale.com/download/mac${NC}"
fi
echo ""

echo -e "${GREEN}[9/10] Network Configuration Tips...${NC}"
echo "Consider these manual steps:"
echo "- Set static IP or DHCP reservation on your router"
echo "- System Preferences → Network → Ethernet → Configure IPv4 → Manual"
echo "- Drag Ethernet above Wi-Fi in network service order"
echo ""

echo -e "${GREEN}[10/10] Verification...${NC}"
echo "Current power settings:"
pmset -g
echo ""

echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}Setup Complete!${NC}"
echo -e "${GREEN}================================================${NC}"
echo ""
echo "Next steps:"
echo "1. Reboot to apply all settings"
echo "2. Ensure Tailscale is running and connected"
echo "3. Configure auto-login if needed:"
echo "   sudo defaults write /Library/Preferences/com.apple.loginwindow autoLoginUser \"fadil369\""
echo "4. Monitor logs:"
echo "   tail -f /var/log/health.log"
echo "   tail -f /var/log/tailscale-watchdog.log"
echo "5. Consider connecting to UPS for power protection"
echo ""
echo "To verify services are running:"
echo "   sudo launchctl list | grep basma"
echo ""
