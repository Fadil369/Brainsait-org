# 🏥 BRAINSAIT Clinics Pages

Premium, mobile-first landing pages for 14 Saudi healthcare facilities implementing the **Clinical Atelier** design system.

## Overview

This project delivers **14 clinic-specific landing pages** across 3 specialized segments:

- **🦷 Dental** (5 clinics) - Mint accent (#00c4b4)
- **💎 Dermatology** (5 clinics) - Rose gold accent (#c47c5f)
- **🏢 Polyclinic** (4 clinics) - Amber accent (#d4970f)

All pages feature:
- RTL Arabic-first design with English toggle
- WhatsApp Business integration (FAB + CTA buttons)
- Mobile-responsive bottom action bar
- Bilingual interface (العربية / English)
- Clinical Atelier light theme (#003b42 primary, #f3faff background)
- Glassmorphism panels, smooth animations, 44px touch targets

## Quick Start

### View Pages Locally
```bash
python3 -m http.server 8000
# Open: http://localhost:8000/brainsait-outreach/brainsait-outreach/websites/dental/ram-clinics.html
```

### Deploy to Cloudflare Pages
1. Repository is already on GitHub: https://github.com/Fadil369/Clinics-pages
2. Go to Cloudflare Pages → Create Project → Connect to Git
3. Select `Fadil369/Clinics-pages`
4. Build output directory: `brainsait-outreach/brainsait-outreach/websites`
5. Deploy!

## Project Structure

```
brainsait-outreach/websites/
├── dental/                    # 5 dental clinic pages
│   ├── ram-clinics.html
│   ├── sigal-dental-clinic.html
│   ├── imtiaz-dental-center.html
│   ├── avicena-dental-center.html
│   └── star-smiles.html
├── dermatology/               # 5 dermatology clinic pages
│   ├── derma-clinic.html
│   ├── elite-medical-center.html
│   ├── kaya-skin-clinic.html
│   ├── medica-clinics.html
│   └── renewal-reshape.html
└── polyclinic/                # 4 polyclinic pages
    ├── consulting-clinics.html
    ├── dallah-health.html
    ├── first-clinic.html
    └── specialized-medical-center.html
```

## Clinics Included

### Dental (Mint #00c4b4)
- Ram Clinics
- Sigal Dental Clinic
- Imtiaz Dental Center
- Avicena Dental Center
- Star Smiles

### Dermatology (Rose Gold #c47c5f)
- Derma Clinic
- Elite Medical Center
- Kaya Skin Clinic
- Medica Clinics
- Renewal Reshape

### Polyclinic (Amber #d4970f)
- Consulting Clinics
- Dallah Health
- First Clinic
- Specialized Medical Center

## Key Features

✅ RTL Arabic-first with English toggle  
✅ WhatsApp Business integration (FAB)  
✅ Mobile action bar (375px optimized)  
✅ Glassmorphism design  
✅ 6 service cards per segment  
✅ Bilingual interface  
✅ Responsive layouts  
✅ 44px touch targets  

## Design System

**Colors:**
- Primary: #003b42 (Deep Teal)
- Background: #f3faff (Serene Blue)
- Dental: #00c4b4 (Mint)
- Dermatology: #c47c5f (Rose Gold)
- Polyclinic: #d4970f (Amber)

**Typography:**
- Headlines: Manrope 700-800
- Body: Inter 400-600
- Arabic: Noto Kufi Arabic

## Maintenance

### Update Clinic Data
```bash
# Edit clinic info in:
# stitch_frictionless_clinic_booking/facility_sites/subdomains.json

# Regenerate pages:
node regenerate-dental.mjs
node generate-clinic-pages.mjs

# Push to GitHub (auto-deploys via Cloudflare):
git add -A
git commit -m "update: refresh clinic data"
git push
```

## Testing

All pages validated ✓
- Correct colors per segment
- RTL/LTR toggle working
- WhatsApp links functional
- Mobile responsive
- Clinic data substituted
- Arabic text renders

## Support

For questions, refer to DEPLOYMENT_GUIDE.md

---

**Repository**: https://github.com/Fadil369/Clinics-pages  
**Total Pages**: 14 clinic sites  
**Design**: Clinical Atelier Light  
**Framework**: Pure HTML/CSS/JS
