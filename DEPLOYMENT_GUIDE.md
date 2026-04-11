# BRAINSAIT Clinical Atelier - Deployment Guide

## Project Status
✅ **Ready for Cloudflare Pages Deployment**

All 14 clinic landing pages have been created and tested:
- **5 Dental** pages (mint accent #00c4b4)
- **5 Dermatology** pages (rose gold accent #c47c5f)  
- **4 Polyclinic** pages (amber accent #d4970f)

Plus 14 portfolio/directory pages in facility_sites/

## Files Structure

```
brainsait-outreach/
└── brainsait-outreach/
    └── websites/
        ├── dental/
        │   ├── template.html (template)
        │   ├── ram-clinics.html
        │   ├── sigal-dental-clinic.html
        │   ├── imtiaz-dental-center.html
        │   ├── avicena-dental-center.html
        │   └── star-smiles.html
        ├── dermatology/
        │   ├── template.html (template)
        │   ├── derma-clinic.html
        │   ├── elite-medical-center.html
        │   ├── kaya-skin-clinic.html
        │   ├── medica-clinics.html
        │   └── renewal-reshape.html
        └── polyclinic/
            ├── template.html (template)
            ├── consulting-clinics.html
            ├── dallah-health.html
            ├── first-clinic.html
            └── specialized-medical-center.html
```

## Next Steps for GitHub + Cloudflare Pages

### 1. Create a GitHub Repository
```bash
# Go to https://github.com/new and create a repo
# Name it: stitch_frictionless_clinic_booking
# (or your preferred name)
```

### 2. Add Remote and Push
```bash
cd /Volumes/NetworkShare/ME-collection\ /stitch_frictionless_clinic_booking

# Add the remote (replace with your GitHub repo URL)
git remote add origin https://github.com/YOUR_USERNAME/stitch_frictionless_clinic_booking.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### 3. Connect Cloudflare Pages
1. Log in to Cloudflare Dashboard
2. Go to **Pages**
3. Click **Create a project**
4. Select **Connect to Git**
5. Authorize GitHub and select your repo
6. Configure build settings:
   - **Framework preset**: None (static HTML)
   - **Build command**: (leave empty)
   - **Build output directory**: `brainsait-outreach/brainsait-outreach/websites`
7. Deploy!

## Deployment Structure

For Cloudflare Pages to serve these sites properly, you may want to organize them as:

```
/dental/ → serves dental segment pages
/dermatology/ → serves dermatology segment pages
/polyclinic/ → serves polyclinic segment pages
```

Or set up a custom domain routing strategy with Cloudflare Workers.

## Testing Verification ✅

All pages pass validation:
- ✓ Correct segment accent colors
- ✓ RTL Arabic-first layout
- ✓ WhatsApp FAB integration
- ✓ Language toggle (AR/EN)
- ✓ Mobile responsive with bottom action bar
- ✓ Clinical Atelier design system
- ✓ All clinic data substituted correctly
- ✓ Phone, location, website links functional

## Important Notes

1. **WhatsApp Links**: FAB and buttons will open WhatsApp with pre-filled messages when clicked
2. **Mobile Optimization**: Pages detect 375px viewport and show mobile action bar
3. **Bilingual**: All pages default to Arabic (RTL) with EN toggle for English (LTR)
4. **No Build Step Required**: These are pure HTML files - no compilation needed

## Maintenance

To regenerate pages after updating clinic data:
```bash
# Update: stitch_frictionless_clinic_booking/facility_sites/subdomains.json

# Then run:
node regenerate-dental.mjs
node generate-clinic-pages.mjs

# Commit and push
git add -A
git commit -m "update: refresh clinic pages from source data"
git push
```

---

**Ready to deploy!** Follow the GitHub + Cloudflare Pages steps above.
