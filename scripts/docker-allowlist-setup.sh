#!/bin/bash

# BrainSAIT Docker Desktop Firewall Allowlist Setup Script
# Purpose: Configure firewall to allow Docker Desktop domains
# Security: HIPAA-compliant network configuration

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Docker domains array
declare -A DOCKER_DOMAINS=(
  ["api.segment.io"]="Analytics"
  ["cdn.segment.com"]="Analytics"
  ["notify.bugsnag.com"]="Error Reports"
  ["sessions.bugsnag.com"]="Error Reports"
  ["auth.docker.io"]="Authentication (Critical)"
  ["cdn.auth0.com"]="Authentication (Critical)"
  ["login.docker.com"]="Authentication (Critical)"
  ["auth.docker.com"]="Authentication (Critical)"
  ["desktop.docker.com"]="Update (Critical)"
  ["hub.docker.com"]="Docker Hub (Critical)"
  ["registry-1.docker.io"]="Docker Pull/Push (Critical)"
  ["production.cloudflare.docker.com"]="Docker CDN (Paid)"
  ["docker-images-prod.6aa30f8b08e16409b46e0173d6de2f56.r2.cloudflarestorage.com"]="Docker Storage"
  ["docker-pinata-support.s3.amazonaws.com"]="Troubleshooting"
  ["api.dso.docker.com"]="Docker Scout"
  ["api.docker.com"]="Docker API (Critical)"
)

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}BrainSAIT Docker Allowlist Setup${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Function to check if running as root (for iptables)
check_root() {
  if [[ "$FIREWALL_TYPE" == "iptables" ]] && [[ $EUID -ne 0 ]]; then
    echo -e "${RED}Error: iptables configuration requires root privileges${NC}"
    echo "Please run: sudo $0"
    exit 1
  fi
}

# Function to test domain connectivity
test_domain() {
  local domain=$1
  if curl -s --head --max-time 5 "https://$domain" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ $domain${NC}"
    return 0
  else
    echo -e "${RED}❌ $domain${NC}"
    return 1
  fi
}

# Function to resolve domain to IP
resolve_domain() {
  local domain=$1
  local ip=$(dig +short "$domain" | grep -E '^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$' | head -n1)
  echo "$ip"
}

# Function to create allowlist file
create_allowlist_file() {
  local output_file="$1"
  echo "# BrainSAIT Docker Desktop Firewall Allowlist" > "$output_file"
  echo "# Generated on: $(date)" >> "$output_file"
  echo "" >> "$output_file"
  
  for domain in "${!DOCKER_DOMAINS[@]}"; do
    echo "https://$domain # ${DOCKER_DOMAINS[$domain]}" >> "$output_file"
  done
  
  echo -e "\n${GREEN}✅ Allowlist file created: $output_file${NC}"
}

# Function to generate Cloudflare firewall rule
generate_cloudflare_rule() {
  cat > cloudflare-docker-rule.txt << 'EOF'
# Cloudflare Firewall Rule for Docker Desktop
# Navigate to: Cloudflare Dashboard > Security > WAF > Custom Rules

Rule Name: Allow Docker Desktop Domains
Expression:
(http.host in {
  "api.segment.io"
  "cdn.segment.com"
  "notify.bugsnag.com"
  "sessions.bugsnag.com"
  "auth.docker.io"
  "cdn.auth0.com"
  "login.docker.com"
  "auth.docker.com"
  "desktop.docker.com"
  "hub.docker.com"
  "registry-1.docker.io"
  "production.cloudflare.docker.com"
  "docker-images-prod.6aa30f8b08e16409b46e0173d6de2f56.r2.cloudflarestorage.com"
  "docker-pinata-support.s3.amazonaws.com"
  "api.dso.docker.com"
  "api.docker.com"
}) and (cf.threat_score < 10)

Action: Allow
EOF
  
  echo -e "\n${GREEN}✅ Cloudflare rule saved to: cloudflare-docker-rule.txt${NC}"
}

# Function to test all domains
test_all_domains() {
  echo -e "\n${BLUE}Testing connectivity to Docker domains...${NC}\n"
  
  local success_count=0
  local total_count=${#DOCKER_DOMAINS[@]}
  
  for domain in "${!DOCKER_DOMAINS[@]}"; do
    if test_domain "$domain"; then
      ((success_count++))
    fi
  done
  
  echo -e "\n${BLUE}Results: $success_count/$total_count domains accessible${NC}"
  
  if [[ $success_count -eq $total_count ]]; then
    echo -e "${GREEN}✅ All domains are accessible!${NC}"
  else
    echo -e "${YELLOW}⚠️  Some domains are not accessible. Check your firewall configuration.${NC}"
  fi
}

# Function to display domain resolution
display_domain_ips() {
  echo -e "\n${BLUE}Resolving Docker domains to IPs...${NC}\n"
  
  for domain in "${!DOCKER_DOMAINS[@]}"; do
    local ip=$(resolve_domain "$domain")
    if [[ -n "$ip" ]]; then
      printf "%-60s -> %-15s (%s)\n" "$domain" "$ip" "${DOCKER_DOMAINS[$domain]}"
    else
      printf "%-60s -> ${RED}Not resolved${NC} (%s)\n" "$domain" "${DOCKER_DOMAINS[$domain]}"
    fi
  done
}

# Main menu
show_menu() {
  echo -e "\n${BLUE}What would you like to do?${NC}"
  echo "1. Test connectivity to all Docker domains"
  echo "2. Display domain IP resolution"
  echo "3. Generate allowlist file"
  echo "4. Generate Cloudflare firewall rule"
  echo "5. Generate all configuration files"
  echo "6. Exit"
  echo -n "Enter your choice [1-6]: "
}

# Main execution
main() {
  while true; do
    show_menu
    read choice
    
    case $choice in
      1)
        test_all_domains
        ;;
      2)
        display_domain_ips
        ;;
      3)
        create_allowlist_file "docker-allowlist.txt"
        ;;
      4)
        generate_cloudflare_rule
        ;;
      5)
        echo -e "\n${BLUE}Generating all configuration files...${NC}"
        create_allowlist_file "docker-allowlist.txt"
        generate_cloudflare_rule
        display_domain_ips > docker-domain-ips.txt
        echo -e "\n${GREEN}✅ All configuration files generated!${NC}"
        echo -e "Files created:"
        echo "  - docker-allowlist.txt"
        echo "  - cloudflare-docker-rule.txt"
        echo "  - docker-domain-ips.txt"
        ;;
      6)
        echo -e "\n${GREEN}Thank you for using BrainSAIT Docker Allowlist Setup!${NC}\n"
        exit 0
        ;;
      *)
        echo -e "${RED}Invalid choice. Please try again.${NC}"
        ;;
    esac
  done
}

# Run main function
main
