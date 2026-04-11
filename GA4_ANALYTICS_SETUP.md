# BrainSAIT Clinic Pages — Google Analytics 4 (GA4) Setup Guide

## Overview
Complete GA4 implementation for all 14 clinic booking pages with conversion tracking, engagement metrics, and segment analysis.

---

## 1. GA4 Property Setup

### Create New GA4 Property (if not exists):
1. Go to [Google Analytics](https://analytics.google.com)
2. Create new property: "BrainSAIT Clinic Bookings"
3. Select "Web" as platform
4. Set timezone to "Asia/Riyadh" (UTC+3)
5. Copy **Measurement ID** (format: `G-XXXXXXXXXX`)

### Recommended Configuration:
- **Data retention:** 4 months (free tier default)
- **Reporting identity:** User-ID and Cookie-based
- **Cross-domain tracking:** Enable for clinic subdomains

---

## 2. Implementation

### Step 1: Add GA4 Tracking Code to All Templates

Update all three templates (`dental/template-v2.html`, `dermatology/template-v2.html`, `polyclinic/template-v2.html`):

Add this in `<head>` section (replace `G-XXXXXXXXXX` with your Measurement ID):

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX', {
    'page_path': window.location.pathname,
    'clinic_segment': '{{SEGMENT}}',
    'clinic_name': '{{CLINIC_NAME}}'
  });
</script>
```

### Step 2: Add Custom Event Tracking

Add to `<script>` section in each template:

```javascript
// ─── GA4 Event Tracking ───
function trackEvent(eventName, eventData = {}) {
  if (typeof gtag !== 'undefined') {
    gtag('event', eventName, {
      'clinic_name': '{{CLINIC_NAME}}',
      'clinic_id': '{{CLINIC_SLUG}}',
      'segment': '{{SEGMENT}}',
      'location': '{{CLINIC_LOCATION}}',
      ...eventData
    });
  }
  console.log(`📊 Event tracked: ${eventName}`, eventData);
}

// Track page load
document.addEventListener('DOMContentLoaded', () => {
  trackEvent('clinic_page_load', {
    'page_type': 'clinic_landing',
    'language': document.documentElement.lang
  });
});

// Replace existing event calls:
// openCalendar() → trackEvent('clinic_calendar_click')
// openWhatsApp() → trackEvent('clinic_whatsapp_click')
// callClinic() → trackEvent('clinic_phone_click')
// toggleLanguage() → trackEvent('clinic_language_toggle', { 'language': newLang })
// scrollToServices() → trackEvent('clinic_services_scroll')
```

---

## 3. Key Events to Track

| Event Name | Trigger | Purpose |
|------------|---------|---------|
| `clinic_page_load` | Page loads | User traffic, landing page effectiveness |
| `clinic_calendar_click` | "Book Now" via calendar | Booking intent (primary conversion) |
| `clinic_whatsapp_click` | WhatsApp button clicked | Booking intent (secondary) |
| `clinic_phone_click` | Phone call button clicked | Contact intent |
| `clinic_services_scroll` | User scrolls to services | Engagement metric |
| `clinic_language_toggle` | Language toggle clicked | User preference, UX engagement |
| `clinic_fab_click` | FAB button clicked | Mobile-specific engagement |
| `clinic_bottom_nav_click` | Bottom nav button clicked | Mobile navigation usage |
| `clinic_view_full_page` | "Open Full Page" link | Deep engagement signal |

---

## 4. Conversion Goals

### Goal 1: Booking Conversion (Primary)
- **Trigger:** `clinic_calendar_click` or `clinic_whatsapp_click`
- **Value:** High (user actively seeking to book)
- **Segment:** All clinics
- **Expected monthly:** 50-200 conversions per clinic

### Goal 2: Engagement (Secondary)
- **Trigger:** `clinic_services_scroll`
- **Value:** Medium (user exploring services)
- **Expected rate:** 40-60% of visitors

### Goal 3: Contact Intent
- **Trigger:** `clinic_phone_click`
- **Value:** Medium (user wants direct contact)
- **Expected rate:** 10-20% of visitors

---

## 5. Custom Dimensions & Metrics

### Custom Dimensions (Add in GA4 Admin → Custom Definitions):

```
clinic_name          → Dimension (clinic name)
clinic_id            → Dimension (clinic slug)
clinic_segment       → Dimension (dental/derma/polyclinic)
clinic_location      → Dimension (geographic location)
language_preference  → Dimension (ar/en)
device_type          → Dimension (mobile/desktop/tablet)
engagement_time      → Metric (time on page)
booking_attempts     → Metric (# calendar/whatsapp clicks per user)
```

### Custom Metrics (Add in GA4 Admin → Custom Definitions):

```
booking_conversions  → Event count (clinic_calendar_click + clinic_whatsapp_click)
engagement_rate      → Event count / page_load
service_exploration  → clinic_services_scroll / page_load
```

---

## 6. Dashboard & Reports

### Create Custom Dashboard in GA4:

**Dashboard Name:** "BrainSAIT Clinic Bookings Overview"

**Key Cards:**
1. **Clinic Performance:** Event count by `clinic_name` (last 7 days)
2. **Booking Conversions:** Sum of `clinic_calendar_click` + `clinic_whatsapp_click`
3. **Segment Breakdown:** Events by `clinic_segment` (pie chart)
4. **Mobile vs Desktop:** Sessions by device (line chart)
5. **Language Preference:** `clinic_language_toggle` count by language
6. **Top Performing Clinics:** Event count ranked by clinic (bar chart)
7. **Engagement Funnel:** page_load → services_scroll → booking_click
8. **Geographic Heatmap:** Sessions by `clinic_location`

---

## 7. Audience Segments

Create audiences in GA4 → Audience Builder:

### Segment 1: "High-Intent Users"
- Condition: `clinic_calendar_click` OR `clinic_whatsapp_click` in last 30 days
- Purpose: Remarketing to users who clicked booking

### Segment 2: "Mobile Users"
- Condition: Device = mobile
- Purpose: Mobile-specific optimization tracking

### Segment 3: "Arabic Language Preference"
- Condition: `language_preference` = "ar"
- Purpose: RTL-specific UX tracking

### Segment 4: "Service Explorers"
- Condition: `clinic_services_scroll` in last session
- Purpose: Users interested in specific services

---

## 8. Alerts & Notifications

Set up GA4 Alerts (Admin → Alerts):

- **Alert 1:** "Booking Conversion Spike" - Notify if `clinic_calendar_click` > 50/day
- **Alert 2:** "Bounce Rate Alert" - Notify if bounce rate > 60%
- **Alert 3:** "Traffic Drop" - Notify if sessions < 100/day

---

## 9. Integration with Google Search Console

1. Link GA4 property to Search Console
2. Monitor organic traffic to clinic pages
3. Track search queries leading to clinics

---

## 10. Ecommerce Tracking (Optional, for future)

If implementing paid bookings:

```javascript
gtag('event', 'purchase', {
  'transaction_id': 'T_12345',
  'value': 250.00,
  'currency': 'SAR',
  'clinic_name': '{{CLINIC_NAME}}',
  'items': [{
    'item_name': 'Consultation',
    'item_category': 'dental',
    'price': 250.00
  }]
});
```

---

## 11. Data Privacy & GDPR Compliance

- **User consent:** Implement cookie consent banner before GA4 loads
- **Data retention:** Set to 4 months (GA4 default)
- **PII handling:** Never pass personally identifiable information
- **Privacy Policy:** Update to include GA4 data collection

---

## 12. Monthly KPI Report Template

Generate monthly reports tracking:

| KPI | Target | Actual | YoY Change |
|-----|--------|--------|-----------|
| Total Sessions | 5000 | TBD | - |
| Booking Conversions | 100 | TBD | - |
| Conversion Rate | 2% | TBD | - |
| Avg Session Duration | 2:30 | TBD | - |
| Mobile Traffic % | 65% | TBD | - |
| Bounce Rate | <50% | TBD | - |
| Language Toggle Rate | 30% | TBD | - |

---

## 13. Implementation Checklist

- [ ] Create GA4 property
- [ ] Add GA4 tracking code to all 3 templates
- [ ] Add custom event tracking functions
- [ ] Regenerate all 14 clinic pages
- [ ] Test events in GA4 Real-Time
- [ ] Create custom dimensions & metrics
- [ ] Build custom dashboard
- [ ] Set up audience segments
- [ ] Configure alerts
- [ ] Add Google Search Console link
- [ ] Implement cookie consent banner
- [ ] Document reporting cadence (daily/weekly/monthly)
- [ ] Train team on GA4 interface
- [ ] Schedule monthly review meetings

---

## 14. Verification

### Test GA4 Implementation:

1. Go to any clinic page
2. Open browser DevTools → Network tab
3. Search for `gtag` requests
4. Go to GA4 → Realtime → confirm events appear within 1-2 seconds
5. Click buttons and verify events fire:
   - Click "Book Now" → `clinic_calendar_click` event
   - Click WhatsApp → `clinic_whatsapp_click` event
   - Toggle language → `clinic_language_toggle` event

---

## Support

For GA4 questions: https://support.google.com/analytics/  
For implementation help: Check `DEPLOYMENT_GUIDE.md`

---

**Last updated:** April 11, 2026  
**GA4 Measurement ID:** `G-XXXXXXXXXX` (Update with your ID)

