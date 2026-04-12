#!/bin/bash
# Verification Script for macOS Server Configuration

echo "================================================"
echo "macOS Server Configuration Verification"
echo "================================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

check_pass() {
    echo -e "${GREEN}✓${NC} $1"
}

check_fail() {
    echo -e "${RED}✗${NC} $1"
}

check_warn() {
    echo -e "${YELLOW}⚠${NC} $1"
}

echo "Checking Power Management Settings..."
echo "------------------------------------"

# Check sleep settings
SLEEP=$(pmset -g | grep -i "sleep" | grep -c " 0")
if [ "$SLEEP" -ge 3 ]; then
    check_pass "Sleep modes disabled"
else
    check_fail "Sleep modes not fully disabled"
fi

# Check autorestart
AUTORESTART=$(pmset -g | grep -i "autorestart" | grep -c " 1")
if [ "$AUTORESTART" -ge 1 ]; then
    check_pass "Auto-restart enabled"
else
    check_fail "Auto-restart not enabled"
fi

echo ""
echo "Checking Automatic Updates..."
echo "------------------------------------"
AUTO_UPDATE=$(defaults read /Library/Preferences/com.apple.SoftwareUpdate AutomaticDownload 2>/dev/null)
if [ "$AUTO_UPDATE" = "0" ]; then
    check_pass "Automatic updates disabled"
else
    check_warn "Automatic updates may still be enabled"
fi

echo ""
echo "Checking Tailscale..."
echo "------------------------------------"
if command -v tailscale &>/dev/null; then
    check_pass "Tailscale CLI installed"
    if tailscale status &>/dev/null; then
        check_pass "Tailscale is connected"
        echo "   IP: $(tailscale ip -4 2>/dev/null)"
    else
        check_fail "Tailscale not connected"
    fi
elif [ -d "/Applications/Tailscale.app" ]; then
    check_pass "Tailscale app installed"
else
    check_fail "Tailscale not found"
fi

echo ""
echo "Checking Launchd Services..."
echo "------------------------------------"
if sudo launchctl list | grep -q "com.basma.watchdog"; then
    check_pass "Watchdog service running"
else
    check_fail "Watchdog service not running"
fi

if sudo launchctl list | grep -q "com.basma.healthcheck"; then
    check_pass "Health check service running"
else
    check_fail "Health check service not running"
fi

echo ""
echo "Checking Scripts..."
echo "------------------------------------"
if [ -x ~/scripts/tailscale-watchdog.sh ]; then
    check_pass "Tailscale watchdog script executable"
else
    check_fail "Tailscale watchdog script not found or not executable"
fi

if [ -x ~/scripts/health-check.sh ]; then
    check_pass "Health check script executable"
else
    check_fail "Health check script not found or not executable"
fi

echo ""
echo "Checking Log Files..."
echo "------------------------------------"
for log in /var/log/health.log /var/log/tailscale-watchdog.log /var/log/basma-watchdog.log; do
    if [ -f "$log" ]; then
        check_pass "$(basename $log) exists"
        SIZE=$(stat -f%z "$log" 2>/dev/null || echo "0")
        echo "   Size: $(numfmt --to=iec $SIZE 2>/dev/null || echo $SIZE bytes)"
    else
        check_warn "$(basename $log) not found"
    fi
done

echo ""
echo "System Information..."
echo "------------------------------------"
echo "Hostname: $(hostname)"
echo "Uptime: $(uptime | awk '{print $3,$4}' | sed 's/,$//')"
echo "Disk Usage: $(df -h / | tail -1 | awk '{print $5}')"
echo "Memory Pressure: $(memory_pressure | head -1)"

echo ""
echo "Recent Health Log (last 5 entries)..."
echo "------------------------------------"
if [ -f /var/log/health.log ]; then
    tail -5 /var/log/health.log
else
    echo "No health log entries yet"
fi

echo ""
echo "================================================"
