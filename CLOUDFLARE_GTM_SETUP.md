# Cloudflare Configuration for Google Tag Gateway

## Quick Setup Instructions

### 1. Enable Google Tag Gateway in Cloudflare Dashboard

**Path:**
```
Cloudflare Dashboard 
  → Select Zone: brainsait.org
  → Settings
  → Integrations
  → Google Tag Gateway
```

**Settings to Configure:**

| Field | Value |
|---|---|
| Status | Enable |
| Google Tag ID | GTM-TP24GSTF |
| Measurement Path | /gtm |
| Auto-provision | Yes |

### 2. Alternative: Use Cloudflare API

If you prefer API configuration:

```bash
#!/bin/bash

# Set your Cloudflare credentials
CLOUDFLARE_API_TOKEN="your_api_token_here"
ZONE_ID="117f23e28c474f87e9984bc4b6753a1b"
GTM_CONTAINER_ID="GTM-TP24GSTF"
MEASUREMENT_PATH="/gtm"

# Configure Google Tag Gateway
curl -X PATCH \
  https://api.cloudflare.com/client/v4/zones/$ZONE_ID/settings/google-tag-gateway/config \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"google_tag_id\": \"$GTM_CONTAINER_ID\",
    \"measurement_path\": \"$MEASUREMENT_PATH\"
  }"

echo "Google Tag Gateway configured successfully!"
```

### 3. Verify Configuration

```bash
#!/bin/bash

CLOUDFLARE_API_TOKEN="your_api_token_here"
ZONE_ID="117f23e28c474f87e9984bc4b6753a1b"

# Get current configuration
curl -X GET \
  https://api.cloudflare.com/client/v4/zones/$ZONE_ID/settings/google-tag-gateway/config \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  -H "Content-Type: application/json"

# Should return:
# {
#   "success": true,
#   "result": {
#     "google_tag_id": "GTM-TP24GSTF",
#     "measurement_path": "/gtm",
#     "status": "active"
#   }
# }
```

---

## What Gets Created

### DNS Records (Automatic)
When Google Tag Gateway is enabled, Cloudflare automatically creates:

```
CNAME Record:
Name: gtm.[your-domain]
Value: gtm-ingestion.cloudflare.com
```

This means:
- `brainsait.org/gtm` → Your GTM container
- Users see all requests coming from your domain
- Privacy-first tracking (GDPR friendly)

### URL Paths

| Path | Purpose |
|---|---|
| `/gtm` | Your GTM container (configured above) |
| `/gtm/collect` | GA4 measurement endpoint |
| `/gtm/gtag` | GTM script endpoint |

---

## Testing Google Tag Gateway

### In Browser

```javascript
// Check if GTM is loading through your domain
console.log('GTM Container: GTM-TP24GSTF');
console.log('Domain: brainsait.org/gtm');

// Check dataLayer is working
console.log(window.dataLayer);

// Fire a test event
window.dataLayer.push({
  'event': 'test_event',
  'timestamp': new Date()
});

console.log('Test event sent');
```

### In Cloudflare Analytics

1. Cloudflare Dashboard → Analytics → Web Analytics
2. Filter for path: `/gtm`
3. You should see requests like:
   - `POST /gtm/collect` (GA4 data)
   - `GET /gtm/gtag/js` (GTM script)

### In Google Tag Manager Preview

1. https://tagmanager.google.com/
2. Container: GTM-TP24GSTF
3. Click **Preview** (top right)
4. Enter URL: https://brainsait.org/appstore
5. Refresh page
6. Check **Tags Fired** tab
7. Verify requests are being sent to your `/gtm` path

---

## Server-Side Tagging Details

### Your Server-Side Container

**Tagging Server Endpoint:**
```
https://server-side-tagging-4c55sjwrxa-uc.a.run.app
```

**Configuration Token:**
```
aWQ9R1RNLVQ3N0ZERlAyJmVudj0xJmF1dGg9dzQ1MFc4cEJ6UHMyb1pBNUVlR2tfUQ==
```

**GCP Project:**
```
gtm-t77fdfp2-yzfkn
```

### What This Means

- **Client sends to:** `/gtm` (your Cloudflare domain)
- **Cloudflare forwards to:** Server-side container
- **Server-side forwards to:** Google Analytics, other tags
- **Benefits:**
  - Users don't connect directly to Google
  - Server-side processing (faster)
  - Privacy-compliant (GDPR/CCPA)
  - Ad blockers less effective

---

## Configuration Completion Checklist

### Step 1: Cloudflare Setup
- [ ] Log in to Cloudflare Dashboard
- [ ] Select zone: brainsait.org
- [ ] Go to Settings → Integrations
- [ ] Enable Google Tag Gateway
- [ ] Set Google Tag ID: GTM-TP24GSTF
- [ ] Set Measurement Path: /gtm
- [ ] Click Save

### Step 2: Verify in GTM Admin
- [ ] Go to: https://tagmanager.google.com/
- [ ] Select Container: GTM-TP24GSTF
- [ ] Click **Preview**
- [ ] Visit: https://brainsait.org/appstore
- [ ] Check **Tags Fired** tab
- [ ] Verify GA4 tags are firing

### Step 3: Verify in GA4
- [ ] Go to: https://analytics.google.com/
- [ ] Check **Real-time** report
- [ ] You should see active events
- [ ] Wait 24 hours for historical data

### Step 4: Verify in Cloudflare Analytics
- [ ] Cloudflare Dashboard → Analytics
- [ ] Check requests to `/gtm` path
- [ ] Verify 200/206 status codes
- [ ] Check no 404 errors

---

## Next: Get Your GA4 Measurement ID

To complete setup, you need your **GA4 Measurement ID**:

1. Go to: https://analytics.google.com/
2. Admin (bottom left) → Properties
3. Property Settings
4. Copy the **Measurement ID** (format: G-XXXXXXXXXX)

**Then replace in appstore.html:**
```html
<!-- Change this -->
gtag('config', 'GA4_MEASUREMENT_ID', {

<!-- To this (your actual ID) -->
gtag('config', 'G-XXXXXXXXXX', {
```

---

## If Something Goes Wrong

### GTM Container Not Loading

**Check:**
1. Is GTM Container ID correct? (GTM-TP24GSTF ✓)
2. Is GTM enabled in Cloudflare? (Check dashboard)
3. Did you wait 5-10 minutes for propagation?
4. Check browser console for errors
5. Verify DNS propagation: `nslookup gtm.brainsait.org`

### GA4 Not Receiving Data

**Check:**
1. Is GA4 Measurement ID correct? (G-XXXXXXXXXX format)
2. Are tags firing in GTM Preview? (Check Tags Fired tab)
3. Is GA4 property receiving data? (Check Admin → Debug View)
4. Did you wait 24 hours? (First-time data takes up to 24 hours)

### Events Not Showing

**Check:**
1. Is gtag() function defined? `console.log(window.gtag)`
2. Are custom events firing? `console.log(window.dataLayer)`
3. Check GTM trigger conditions
4. Verify event names match exactly (case-sensitive)

---

## Support & Testing

### Quick Test
```javascript
// Paste in browser console on https://brainsait.org/appstore

// 1. Check GTM is loaded
console.log('GTM Status:', window.google_tag_manager ? 'Loaded ✓' : 'Not loaded ✗');

// 2. Check dataLayer
console.log('DataLayer:', window.dataLayer.length, 'events');

// 3. Fire test event
window.dataLayer.push({
  'event': 'test_gtm',
  'test_param': 'working'
});
console.log('Test event sent ✓');

// 4. Check GA4 gtag function
console.log('gtag function:', typeof window.gtag);
```

Expected output:
```
GTM Status: Loaded ✓
DataLayer: 5 events
Test event sent ✓
gtag function: function
```

---

