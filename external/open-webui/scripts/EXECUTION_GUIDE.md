# 🚀 macOS Server Setup - Execution Guide

## ⚡ Quick Execution (Recommended)

Run the automated setup script:

```bash
cd ~/scripts
chmod +x setup-macos-server.sh
./setup-macos-server.sh
```

This will configure everything automatically. After completion, **reboot your Mac**.

---

## 📋 Manual Step-by-Step Execution

If you prefer to run commands manually or need to troubleshoot:

### 1️⃣ Power Management Settings

```bash
# Disable all sleep modes
sudo pmset -a sleep 0
sudo pmset -a disksleep 0
sudo pmset -a displaysleep 0
sudo pmset -a hibernatemode 0

# Enable Wake-on-LAN
sudo pmset -a womp 1

# Enable auto-restart after power failure
sudo pmset -a autorestart 1

# Auto-restart on freeze/kernel panic
sudo systemsetup -setrestartfreeze on

# Verify settings
pmset -g
```

**Expected Output**: All sleep values should be 0, autorestart should be 1

---

### 2️⃣ Disable Automatic Updates

```bash
# Disable auto-update and auto-restart
sudo defaults write /Library/Preferences/com.apple.SoftwareUpdate AutomaticDownload -bool false
sudo defaults write /Library/Preferences/com.apple.SoftwareUpdate AutomaticallyInstallMacOSUpdates -bool false
sudo defaults write /Library/Preferences/com.apple.SoftwareUpdate CriticalUpdateInstall -bool false

# Verify
defaults read /Library/Preferences/com.apple.SoftwareUpdate
```

**Expected Output**: All update flags should be 0 (false)

---

### 3️⃣ Screen Lock & Auto-Login

```bash
# Disable screen lock
defaults write com.apple.screensaver askForPassword -int 0

# Enable auto-login (REPLACE "fadil369" with your username)
sudo defaults write /Library/Preferences/com.apple.loginwindow autoLoginUser "fadil369"
```

⚠️ **Security Note**: This allows unattended boots but reduces physical security. Use FileVault encryption to protect data at rest.

---

### 4️⃣ Setup Monitoring Scripts

```bash
# Make scripts executable
chmod +x ~/scripts/tailscale-watchdog.sh
chmod +x ~/scripts/health-check.sh
chmod +x ~/scripts/verify-server-config.sh

# Create log files
sudo touch /var/log/tailscale-watchdog.log
sudo touch /var/log/health.log
sudo touch /var/log/basma-watchdog.log
sudo touch /var/log/basma-watchdog-error.log
sudo touch /var/log/basma-healthcheck.log
sudo touch /var/log/basma-healthcheck-error.log

# Set permissions
sudo chmod 644 /var/log/tailscale-watchdog.log
sudo chmod 644 /var/log/health.log
sudo chmod 644 /var/log/basma-*.log
```

---

### 5️⃣ Install Launchd Services

```bash
# Copy plist files to LaunchDaemons
sudo cp ~/scripts/com.basma.watchdog.plist /Library/LaunchDaemons/
sudo cp ~/scripts/com.basma.healthcheck.plist /Library/LaunchDaemons/

# Set correct ownership and permissions
sudo chown root:wheel /Library/LaunchDaemons/com.basma.*.plist
sudo chmod 644 /Library/LaunchDaemons/com.basma.*.plist

# Load services
sudo launchctl load /Library/LaunchDaemons/com.basma.watchdog.plist
sudo launchctl load /Library/LaunchDaemons/com.basma.healthcheck.plist

# Verify services are running
sudo launchctl list | grep basma
```

**Expected Output**: You should see both `com.basma.watchdog` and `com.basma.healthcheck` listed

---

### 6️⃣ Thermal & Performance Optimization (Optional)

```bash
# Disable Time Machine (if not needed)
sudo tmutil disable

# Disable Spotlight indexing on specific directories
sudo mdutil -i off /path/to/your/server/data

# Check thermal status
sudo powermetrics --samplers smc -i 5000 -n 1
```

---

### 7️⃣ Network Configuration (Manual)

**Via GUI**:
1. Open **System Preferences** → **Network**
2. Select **Ethernet** (or your primary connection)
3. Click **Advanced** → **TCP/IP**
4. Set **Configure IPv4**: Manual
5. Enter your static IP, subnet mask, router, and DNS
6. Click **OK** → **Apply**

**Service Order**:
1. Click the gear icon (⚙️) at bottom
2. Select **Set Service Order**
3. Drag **Ethernet** to the top
4. Click **OK** → **Apply**

---

### 8️⃣ Tailscale Configuration

```bash
# If using Tailscale CLI
sudo tailscale up --operator=$USER --accept-routes

# If using Tailscale app
open -a Tailscale

# Verify connection
tailscale status

# Add Tailscale to login items
# System Preferences → General → Login Items → Add Tailscale
```

---

### 9️⃣ Verification

```bash
# Run verification script
cd ~/scripts
./verify-server-config.sh

# Check service status
sudo launchctl list | grep basma

# Monitor logs in real-time
tail -f /var/log/health.log
tail -f /var/log/tailscale-watchdog.log

# Check power settings
pmset -g

# Test Tailscale
tailscale status
tailscale ip -4
```

---

### 🔟 Final Steps

```bash
# Reboot to apply all settings
sudo reboot
```

After reboot:
```bash
# Wait 2 minutes, then verify everything is running
cd ~/scripts
./verify-server-config.sh
```

---

## 🎯 Success Criteria

After completion, you should have:

- ✅ No automatic sleep or hibernation
- ✅ Auto-restart on power failure enabled
- ✅ Automatic updates disabled
- ✅ Screen lock disabled (or auto-login enabled)
- ✅ Tailscale watchdog running (checks every 60 seconds)
- ✅ Health monitoring running (checks every 5 minutes)
- ✅ All services auto-start on boot
- ✅ Logging to `/var/log/` files

---

## 📊 Monitoring Commands

```bash
# View all logs
tail -f /var/log/health.log

# View Tailscale watchdog
tail -f /var/log/tailscale-watchdog.log

# Check service status
sudo launchctl list | grep basma

# View recent health checks (last 10)
tail -10 /var/log/health.log

# Check system uptime
uptime

# Check disk usage
df -h /

# Check memory pressure
memory_pressure

# View power settings
pmset -g

# View network interfaces
ifconfig

# View Tailscale status
tailscale status
```

---

## 🔄 Restart Services

If services stop running:

```bash
# Unload services
sudo launchctl unload /Library/LaunchDaemons/com.basma.watchdog.plist
sudo launchctl unload /Library/LaunchDaemons/com.basma.healthcheck.plist

# Reload services
sudo launchctl load /Library/LaunchDaemons/com.basma.watchdog.plist
sudo launchctl load /Library/LaunchDaemons/com.basma.healthcheck.plist

# Verify
sudo launchctl list | grep basma
```

---

## 🚨 Troubleshooting

### Services not starting
```bash
# Check for errors in log
cat /var/log/basma-watchdog-error.log
cat /var/log/basma-healthcheck-error.log

# Verify plist syntax
plutil /Library/LaunchDaemons/com.basma.watchdog.plist

# Check file permissions
ls -la ~/scripts/
ls -la /Library/LaunchDaemons/com.basma.*
```

### Tailscale not connecting
```bash
# Restart Tailscale
sudo tailscale down
sudo tailscale up --operator=$USER --accept-routes

# Or via app
killall Tailscale
open -a Tailscale

# Check logs
log show --predicate 'subsystem == "com.tailscale.ipn"' --last 5m
```

### Mac still sleeping
```bash
# Re-apply power settings
sudo pmset -a sleep 0
sudo pmset -a disksleep 0
sudo pmset -a displaysleep 0

# Check for energy saver profiles
pmset -g custom

# Verify
pmset -g
```

---

## 🔗 Quick Reference

| Component | Status Command | Log File |
|-----------|---------------|----------|
| Power Settings | `pmset -g` | System log |
| Watchdog Service | `sudo launchctl list \| grep watchdog` | `/var/log/basma-watchdog.log` |
| Health Check | `sudo launchctl list \| grep healthcheck` | `/var/log/health.log` |
| Tailscale | `tailscale status` | `/var/log/tailscale-watchdog.log` |
| Auto-updates | `defaults read /Library/Preferences/com.apple.SoftwareUpdate` | System Preferences |

---

## 📱 Remote Access Setup

### Jump Desktop Connection
1. Install Jump Desktop on iPad
2. Connect via Tailscale IP: `tailscale ip -4` on Mac
3. Use VNC or RDP (enable in System Preferences → Sharing)

### Enable Screen Sharing (VNC)
```bash
# Enable screen sharing
sudo /System/Library/CoreServices/RemoteManagement/ARDAgent.app/Contents/Resources/kickstart \
  -activate -configure -access -on -users fadil369 -privs -all -restart -agent

# Or via GUI: System Preferences → Sharing → Screen Sharing
```

---

## ⚡ Hardware Recommendations

1. **Cooling**: Use laptop stand with ventilation or clamshell mode
2. **Power**: Connect to UPS (APC, CyberPower)
3. **Network**: Use Ethernet cable, not Wi-Fi
4. **Display**: Use dummy HDMI plug if headless
5. **Location**: Keep in cool, dust-free area

---

## 📞 Support & Resources

- **Tailscale Docs**: https://tailscale.com/kb/
- **macOS pmset Manual**: `man pmset`
- **Launchd Guide**: `man launchd.plist`

---

**Ready to proceed?** Run `./setup-macos-server.sh` and follow the prompts!
