# macOS Server Configuration Scripts

These scripts configure your MacBook as a reliable 24/7 server and Tailscale gateway node.

## 📁 Files

### Main Setup Script
- **`setup-macos-server.sh`** - Main configuration script that sets up everything

### Monitoring Scripts
- **`tailscale-watchdog.sh`** - Monitors and restarts Tailscale if it goes down
- **`health-check.sh`** - System health monitoring (disk, memory, Tailscale)
- **`verify-server-config.sh`** - Verifies all configurations are working

### Launchd Configurations
- **`com.basma.watchdog.plist`** - Auto-runs Tailscale watchdog every 60 seconds
- **`com.basma.healthcheck.plist`** - Auto-runs health check every 5 minutes

## 🚀 Quick Start

1. **Run the main setup script:**
   ```bash
   cd ~/scripts
   chmod +x setup-macos-server.sh
   ./setup-macos-server.sh
   ```

2. **Reboot your Mac** to apply all settings

3. **Verify the configuration:**
   ```bash
   chmod +x verify-server-config.sh
   ./verify-server-config.sh
   ```

## 📋 What Gets Configured

### 1. Power Management
- ✅ Disables all sleep modes (display, disk, system)
- ✅ Enables Wake-on-LAN
- ✅ Auto-restart after power failure
- ✅ Auto-restart on freeze/kernel panic

### 2. Automatic Updates
- ✅ Disables automatic macOS updates
- ✅ Prevents forced reboots
- ✅ You maintain manual update control

### 3. Auto-Login & Security
- ⚠️ Auto-login (manual step required)
- ✅ Disables screen lock (safe with remote access only)

### 4. Tailscale Monitoring
- ✅ Watchdog checks connection every 60 seconds
- ✅ Auto-restarts if connection drops
- ✅ Logs all events

### 5. System Health Monitoring
- ✅ Monitors disk usage (alerts at 80%)
- ✅ Monitors memory pressure
- ✅ Monitors Tailscale status
- ✅ Runs every 5 minutes

## 📊 Monitoring & Logs

View logs in real-time:
```bash
# Health monitoring
tail -f /var/log/health.log

# Tailscale watchdog
tail -f /var/log/tailscale-watchdog.log

# Service logs
tail -f /var/log/basma-watchdog.log
tail -f /var/log/basma-healthcheck.log
```

Check service status:
```bash
sudo launchctl list | grep basma
```

## 🔧 Manual Steps (Optional)

### Enable Auto-Login
```bash
sudo defaults write /Library/Preferences/com.apple.loginwindow autoLoginUser "fadil369"
```

### Set Static IP
System Preferences → Network → Ethernet → Configure IPv4 → Manual

### Connect to UPS
System Preferences → Battery → UPS → Configure graceful shutdown

### Disable Spotlight on Server Directories
```bash
sudo mdutil -i off /path/to/server/data
```

## 🛠 Troubleshooting

### Services not running after reboot
```bash
# Reload services
sudo launchctl load /Library/LaunchDaemons/com.basma.watchdog.plist
sudo launchctl load /Library/LaunchDaemons/com.basma.healthcheck.plist
```

### Tailscale not reconnecting
```bash
# Manual restart
tailscale up --operator=$USER --accept-routes
# or
open -a Tailscale
```

### Check power settings
```bash
pmset -g
```

## 🔄 Uninstall

To remove the server configuration:
```bash
# Stop and remove services
sudo launchctl unload /Library/LaunchDaemons/com.basma.watchdog.plist
sudo launchctl unload /Library/LaunchDaemons/com.basma.healthcheck.plist
sudo rm /Library/LaunchDaemons/com.basma.*.plist

# Remove logs
sudo rm /var/log/basma-*.log
sudo rm /var/log/health.log
sudo rm /var/log/tailscale-watchdog.log

# Re-enable normal power management
sudo pmset -a sleep 10
sudo pmset -a displaysleep 10
sudo pmset -a disksleep 10
```

## ⚠️ Important Notes

1. **Security Tradeoff**: Auto-login reduces physical security. Mitigate with:
   - FileVault (full disk encryption)
   - Controlled physical access
   - Strong Tailscale ACLs

2. **Thermal Management**: 
   - Use clamshell mode with external display (or dummy HDMI plug)
   - Ensure good ventilation
   - Keep ambient temp below 25°C

3. **Network Reliability**:
   - Prefer Ethernet over Wi-Fi
   - Set static IP or DHCP reservation
   - Consider UPS for power protection

4. **macOS Limitations**:
   - macOS isn't designed as a server OS
   - These configurations work around most limitations
   - Monitor regularly for macOS-specific issues

## 📞 Alert Configuration

Edit `health-check.sh` to add webhook notifications:
```bash
# Uncomment and set your webhook URL
curl -s -X POST "YOUR_WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d '{"message": "Alert from Mac server"}'
```

Supports: Slack, Discord, Telegram, custom webhooks, email, etc.

## 🏗 Architecture

```
iPad (mobile)
  └── Jump Desktop → MacBook (gateway node)
                        ├── Tailscale → Linux servers
                        ├── Tailscale → Windows machines
                        ├── Tailscale → Cloud VMs
                        └── Local services (Docker, etc.)
```

## 📝 Risk Mitigation Summary

| Risk | Mitigation |
|------|------------|
| macOS forced reboot | Disabled auto-updates, autorestart enabled |
| Network drop | Ethernet preferred, Tailscale auto-reconnects |
| Power loss | UPS + autorestart on power restore |
| Disk full | Monitoring + alerts at 80% |
| Thermal throttle | Good ventilation, clamshell mode |
| Memory pressure | Monitor, restart heavy services |
| FileVault blocking boot | Auto-login or manage unlock token |

---

**Version**: 1.0  
**Last Updated**: January 2026  
**Tested on**: macOS Sonoma / Ventura
