#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
ACCOUNT_NAME="brainsait-org"

deploy_site () {
  local slug="$1"
  local project="$2"
  echo "Deploying $slug -> $project"
  wrangler pages deploy "$ROOT_DIR/$slug" --project-name "$project"
}

deploy_site "ram-clinics" "ram-clinics-site"
deploy_site "sigal-dental-clinic" "sigal-dental-clinic-site"
deploy_site "imtiaz-dental-center" "imtiaz-dental-center-site"
deploy_site "avicena-dental-center" "avicena-dental-center-site"
deploy_site "star-smiles" "star-smiles-site"
deploy_site "derma-clinic" "derma-clinic-site"
deploy_site "elite-medical-center" "elite-medical-center-site"
deploy_site "kaya-skin-clinic" "kaya-skin-clinic-site"
deploy_site "medica-clinics" "medica-clinics-site"
deploy_site "renewal-reshape" "renewal-reshape-site"
deploy_site "consulting-clinics" "consulting-clinics-site"
deploy_site "dallah-health" "dallah-health-site"
deploy_site "first-clinic" "first-clinic-site"
deploy_site "specialized-medical-center" "specialized-medical-center-site"

echo "All facility sites deployed. Attach custom domains in Cloudflare Pages:"
echo "ram-clinics.brainsait.org, sigal-dental-clinic.brainsait.org, ..."
echo "Account hint: $ACCOUNT_NAME"
