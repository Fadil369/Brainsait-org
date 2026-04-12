#!/bin/bash
# Tailscale Watchdog Script
# Monitors Tailscale connection and restarts if needed

LOG_FILE="/var/log/tailscale-watchdog.log"

# Check if Tailscale is running
if ! tailscale status &>/dev/null; then
    echo "$(date): Tailscale down, restarting..." >> "$LOG_FILE"
    
    # Try to start Tailscale
    if command -v tailscale &>/dev/null; then
        # CLI version
        sudo tailscale up --operator=$USER --accept-routes >> "$LOG_FILE" 2>&1
    else
        # App Store version
        open -a Tailscale >> "$LOG_FILE" 2>&1
    fi
    
    # Wait and verify
    sleep 5
    if tailscale status &>/dev/null; then
        echo "$(date): Tailscale successfully restarted" >> "$LOG_FILE"
    else
        echo "$(date): Failed to restart Tailscale" >> "$LOG_FILE"
    fi
else
    echo "$(date): Tailscale is running normally" >> "$LOG_FILE"
fi
