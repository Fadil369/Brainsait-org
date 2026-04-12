#!/bin/bash
# System Health Check Script
# Monitors disk, memory, and Tailscale status

LOG_FILE="/var/log/health.log"
HOSTNAME=$(hostname)
UPTIME=$(uptime)
DISK=$(df -h / | tail -1 | awk '{print $5}')
MEMORY=$(memory_pressure | head -1)

# Check Tailscale status
if command -v tailscale &>/dev/null && tailscale status &>/dev/null; then
    TAILSCALE="Online"
else
    TAILSCALE="Offline"
fi

# Log health status
echo "$(date) | Host: $HOSTNAME | Disk: $DISK | $MEMORY | Tailscale: $TAILSCALE" >> "$LOG_FILE"

# Alert if disk usage > 80%
DISK_PCT=${DISK%\%}
if [ "$DISK_PCT" -gt 80 ]; then
    echo "$(date): WARNING - Disk usage at $DISK" >> "$LOG_FILE"
    # Uncomment and configure your webhook URL
    # curl -s -X POST "YOUR_WEBHOOK_URL" -H "Content-Type: application/json" \
    #   -d "{\"message\": \"Mac disk at $DISK\", \"host\": \"$HOSTNAME\"}"
fi

# Alert if Tailscale is down
if [ "$TAILSCALE" = "Offline" ]; then
    echo "$(date): WARNING - Tailscale is offline" >> "$LOG_FILE"
    # Uncomment and configure your webhook URL
    # curl -s -X POST "YOUR_WEBHOOK_URL" -H "Content-Type: application/json" \
    #   -d "{\"message\": \"Tailscale offline on $HOSTNAME\"}"
fi

# Keep log file under 10MB
if [ -f "$LOG_FILE" ] && [ $(stat -f%z "$LOG_FILE") -gt 10485760 ]; then
    tail -n 1000 "$LOG_FILE" > "$LOG_FILE.tmp"
    mv "$LOG_FILE.tmp" "$LOG_FILE"
fi
