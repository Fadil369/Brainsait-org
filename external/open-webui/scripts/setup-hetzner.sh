#!/bin/bash
# Setup Hetzner Server with Cloudflare Tunnel
# Run this script on your Hetzner server (46.62.128.198)

set -e

echo "🚀 Setting up Hetzner Server with Cloudflare Tunnel"
echo "=================================================="

# Update system
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install essentials
echo "📦 Installing essential packages..."
sudo apt install -y curl wget git htop vim ufw fail2ban nginx postgresql redis-server

# Install Cloudflared
echo "☁️  Installing Cloudflared..."
wget -q https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared-linux-amd64.deb
rm cloudflared-linux-amd64.deb

# Create cloudflared directory
sudo mkdir -p /etc/cloudflared
sudo chmod 755 /etc/cloudflared

# Create configuration
echo "⚙️  Creating Cloudflare Tunnel configuration..."
sudo tee /etc/cloudflared/config.yml > /dev/null << 'EOF'
tunnel: f74a323d-f44c-40b8-b77a-b6f08ab8d3a4
credentials-file: /etc/cloudflared/f74a323d-f44c-40b8-b77a-b6f08ab8d3a4.json

metrics: 0.0.0.0:2000

ingress:
  # SSH Access
  - hostname: hetzner.elfadil.com
    service: ssh://localhost:22
  
  # Main website (brainsait.cloud)
  - hostname: brainsait.cloud
    service: http://localhost:80
  
  - hostname: www.brainsait.cloud
    service: http://localhost:80
  
  # API endpoint
  - hostname: api.elfadil.com
    service: http://localhost:8000
  
  # Admin panel
  - hostname: admin.brainsait.cloud
    service: http://localhost:8080
  
  # Monitoring
  - hostname: monitor.elfadil.com
    service: http://localhost:9090
  
  # PostgreSQL
  - hostname: db.brainsait.cloud
    service: tcp://localhost:5432
  
  # Redis
  - hostname: redis.brainsait.cloud
    service: tcp://localhost:6379
  
  # Catch-all
  - service: http_status:404
EOF

echo ""
echo "⚠️  IMPORTANT: Copy tunnel credentials from your Mac"
echo "    Run on your Mac:"
echo "    scp ~/.cloudflared/f74a323d-f44c-40b8-b77a-b6f08ab8d3a4.json fadil369@46.62.128.198:/tmp/"
echo ""
echo "    Then run on Hetzner:"
echo "    sudo mv /tmp/f74a323d-f44c-40b8-b77a-b6f08ab8d3a4.json /etc/cloudflared/"
echo "    sudo chmod 600 /etc/cloudflared/*.json"
echo ""
read -p "Press Enter after copying credentials..."

# Setup firewall
echo "🔒 Configuring firewall..."
sudo ufw --force reset
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Allow SSH from your current IP
CURRENT_IP=$(echo $SSH_CLIENT | awk '{print $1}')
if [ -n "$CURRENT_IP" ]; then
    sudo ufw allow from $CURRENT_IP to any port 22 comment 'SSH from admin'
fi

# Allow Cloudflare IPs
echo "Allowing Cloudflare IPs..."
curl -s https://www.cloudflare.com/ips-v4 | while read ip; do
    sudo ufw allow from $ip to any port 80,443 proto tcp comment 'Cloudflare'
done

sudo ufw --force enable

# Install and start Cloudflared service
echo "🚀 Installing Cloudflared as service..."
sudo cloudflared service install
sudo systemctl enable cloudflared
sudo systemctl start cloudflared

# Check status
echo ""
echo "📊 Checking service status..."
sudo systemctl status cloudflared --no-pager

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Route DNS: cloudflared tunnel route dns brainsait-infrastructure hetzner.elfadil.com"
echo "2. Route DNS: cloudflared tunnel route dns brainsait-infrastructure brainsait.cloud"
echo "3. Route DNS: cloudflared tunnel route dns brainsait-infrastructure api.elfadil.com"
echo "4. Test SSH: ssh hetzner (from your Mac)"
echo ""
