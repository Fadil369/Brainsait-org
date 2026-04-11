# Quick GTM/GA4 Testing Guide - 5 Minute Setup

## 🚀 One-Page Testing Checklist

### Before You Start
- [ ] You have a modern browser (Chrome, Firefox, Safari, Edge)
- [ ] You have access to https://brainsait.org
- [ ] You have a Google account (for GA4 access)

---

## Test 1: Website Loads Without Errors ✅ (1 minute)

**Steps:**
1. Open: https://brainsait.org
2. Press `F12` to open DevTools
3. Click the **Console** tab
4. Look for any **red error messages**

**Expected Result:**
- Page loads normally
- Console shows NO red errors
- Warnings are OK (yellow messages)

**Troubleshooting:**
- If page doesn't load: Check internet connection
- If red errors: Screenshot and share with support

---

## Test 2: GTM Container is Running ✅ (2 minutes)

**Steps:**
1. Keep DevTools open on **Console** tab
2. Type this command:
   ```javascript
   console.log(window.dataLayer)
   ```
3. Press Enter

**Expected Result:**
```
Array [
  { gtm.start: 1712873821234, event: "gtm.js" },
  { event: "page_view", page_location: "https://brainsait.org/", page_title: "BRAINSAIT - عيادات الرياض | Clinics Directory", ... }
]
```

**What This Means:**
- ✅ GTM has initialized
- ✅ Page view event was recorded
- ✅ Data is being collected

---

## Test 3: Data Flowing to Google ✅ (2 minutes)

**Steps:**
1. Go to DevTools **Network** tab
2. Filter by typing: `google` in the filter box
3. You should see multiple requests like:
   - `gtm.js` (GTM script)
   - `collect` or `g` (GA4 data)
   - Might also see `/gtm` (Cloudflare server-side tagging)

4. Click on one of the requests
5. Check the **Status** column - should be **200** (green)

**Expected Result:**
```
Request: gtm.js?id=GTM-TP24GSTF
Status: 200 ✅
Request: /gtm (from Cloudflare)
Status: 200 ✅
```

**What This Means:**
- ✅ GTM is loading
- ✅ Data is being sent to Google
- ✅ Cloudflare server-side tagging is working

---

## Test 4: Events Showing in GA4 Dashboard ✅ (Optional - 1-2 seconds)

**Steps:**
1. Open new tab: https://analytics.google.com/
2. Log in if needed
3. Select your property
4. Go to: **Reports** → **Realtime**
5. In another tab, refresh: https://brainsait.org
6. Come back to Analytics tab

**Expected Result:**
- **Active users**: Shows 1 (you)
- **Page views**: Shows your page
- **Page title**: "BRAINSAIT - عيادات الرياض"

**What This Means:**
- ✅ GA4 is receiving data
- ✅ Real-time tracking is working
- ✅ Full integration is successful

---

## Test 5: GTM Preview Mode (Advanced - Optional)

**Steps:**
1. Open: https://tagmanager.google.com/
2. Log in with your Google account
3. Select: **GTM-TP24GSTF**
4. Click: **Preview** button
5. A preview tag appears - click the URL field
6. Type: `https://brainsait.org`
7. Press Enter or click **Connect**
8. Refresh the brainsait.org page

**Expected Result:**
- Preview console shows events firing
- You see `gtm.js`, `page_view`, and other events
- No errors in preview console

**What This Means:**
- ✅ GTM container is configured correctly
- ✅ All events are firing as expected
- ✅ Ready for production

---

## Quick Troubleshooting

| Issue | Fix | Verification |
|-------|-----|--------------|
| No data in console | Refresh page | Run `console.log(window.dataLayer)` again |
| 404 errors in Network tab | Normal (for `/gtm` until Cloudflare enabled) | Check `/gtm` is listed but not critical |
| Red errors in Console | Might be external script issue | Take screenshot, share with support |
| GA4 shows 0 users | Wait 1-2 seconds and refresh GA4 tab | Real-time dashboard updates with delay |
| Page won't load | Check internet connection | Try different network or device |

---

## Success Indicators ✅

You'll know it's working when you see:

1. ✅ **Console**: `dataLayer` array with events
2. ✅ **Network**: Requests to `google` with status 200
3. ✅ **GA4**: Active users showing 1+ in realtime
4. ✅ **GTM Preview**: Events firing and green checkmarks

---

## Quick Reference

**Measurement ID**: G-R2Q0LYQTQS  
**GTM Container**: GTM-TP24GSTF  
**Website**: https://brainsait.org  
**GA4 Access**: https://analytics.google.com/  
**GTM Preview**: https://tagmanager.google.com/  

---

## Next: Advanced Testing

Once basics work, you can test:
- [ ] Visit multiple pages and check tracking
- [ ] Test on mobile device
- [ ] Test on different browsers
- [ ] Monitor for 24 hours for data trends
- [ ] Set up GA4 alerts
- [ ] Create custom dashboards

---

**Estimated Time to Complete**: 5-10 minutes  
**Success Rate**: >95% if all steps followed  
**Support**: Contact if any step shows unexpected results

---

Last Updated: April 11, 2026
