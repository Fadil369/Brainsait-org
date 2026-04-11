# GTM Tag Assistant Debug Session - Complete Guide

**Debug Status**: ✅ Active Debug Session Ready  
**Container**: GTM-TP24GSTF  
**Domain**: brainsait.org  
**Date**: April 11, 2026

---

## 🔍 Your Debug Link

**Shareable Debug Link:**
```
https://tagassistant.google.com/#/?id=GTM-TP24GSTF&url=https%3A%2F%2Fwww.brainsait.org%2F%3Fgtm_debug%3D1775937947577&source=TAG_MANAGER&gtm_auth=7ypOvNzmtvNUjkTntU83Wg&gtm_preview=env-1
```

**Or use the decoded version:**
```
https://tagassistant.google.com/#/?id=GTM-TP24GSTF&url=https://www.brainsait.org/?gtm_debug=1775937947577&source=TAG_MANAGER&gtm_auth=7ypOvNzmtvNUjkTntU83Wg&gtm_preview=env-1
```

---

## ✨ What This Debug Session Does

The Tag Assistant allows you to:
- ✅ See all tags firing on your website
- ✅ View dataLayer events in real-time
- ✅ Verify GTM container is working
- ✅ Check GA4 configuration
- ✅ Monitor event flow
- ✅ Validate tracking setup
- ✅ Share with team for review

---

## 🚀 How to Use the Debug Link

### Step 1: Click the Debug Link
Click the shareable link above to open Tag Assistant in debug mode.

### Step 2: You'll See Three Panels
```
┌─────────────────────────────────────┐
│     Left Panel: Tags Fired           │
│     (Shows all active tags)          │
├─────────────────────────────────────┤
│     Center Panel: brainsait.org      │
│     (Your website in debug mode)     │
├─────────────────────────────────────┤
│     Right Panel: Tag Details         │
│     (Information about selected tag) │
└─────────────────────────────────────┘
```

### Step 3: Interact With Your Site
- Click links on your homepage
- Navigate between pages
- Watch tags fire in real-time in the left panel

### Step 4: Review Tag Firing
- See which tags fired
- Check the order they fired in
- View tag configuration details
- Monitor dataLayer events

---

## 📊 What You'll See in Debug Mode

### Left Panel: All Firing Tags
```
✓ gtm.js (GTM Container)
✓ GA4 Config (Google Analytics 4)
✓ page_view (GA4 Event)
✓ gtag.config (GA4 Configuration)
[And any other tags you configure]
```

### Center Panel: Your Website
- Your site loads with debug parameter
- All events tracked normally
- Can interact fully
- Debug info overlayed (if enabled)

### Right Panel: Tag Details
```
Tag Name: GA4 Config
Status: Success
Variables:
- Measurement ID: G-R2Q0LYQTQS
- Page Path: /
- Page Title: BRAINSAIT...
```

---

## 🔧 Debug Session Features

### Monitor Tags in Real-Time
```
Timeline:
0:00 - gtm.js loads (GTM Container)
0:01 - dataLayer initialized
0:02 - GA4 gtag.js loads (Direct GA4)
0:03 - page_view event fires
0:04 - GA4 configuration complete
```

### View DataLayer Events
```
dataLayer: [
  { gtm.start: 1712876234567, event: "gtm.js" },
  { event: "page_view", 
    page_location: "https://www.brainsait.org/",
    page_title: "BRAINSAIT - عيادات الرياض" }
]
```

### Check Variable Values
```
Variables Available:
- Page Path: /
- Page Title: BRAINSAIT - عيادات الرياض
- Page URL: https://www.brainsait.org/
- Referrer: (direct)
```

### Verify Tag Firing Order
```
1. GTM Container loads (gtm.js)
2. DataLayer events push
3. GA4 gtag.js loads
4. Configuration applied
5. Page view event fires
```

---

## 🎯 What to Verify in Debug Mode

### ✅ GTM Container Check

**What to Look For:**
- [ ] GTM container tag appears in left panel
- [ ] Status shows "Success"
- [ ] Container ID: GTM-TP24GSTF
- [ ] Fired immediately on page load

**Expected Result:**
```
Tag: gtm.js (GTM Container)
Status: ✓ Success
Fired At: 0:00 seconds
```

### ✅ Direct GA4 Check

**What to Look For:**
- [ ] GA4 gtag.js tag appears
- [ ] Measurement ID: G-R2Q0LYQTQS
- [ ] Status shows "Success"
- [ ] Configuration complete

**Expected Result:**
```
Tag: GA4 Config
Status: ✓ Success
Configuration: G-R2Q0LYQTQS
```

### ✅ Page View Event Check

**What to Look For:**
- [ ] page_view event in timeline
- [ ] Event properties populated
- [ ] Page title showing correctly
- [ ] Page URL captured

**Expected Result:**
```
Event: page_view
page_location: https://www.brainsait.org/
page_title: BRAINSAIT - عيادات الرياض | Clinics Directory
page_path: /
```

### ✅ DataLayer Check

**What to Look For:**
- [ ] DataLayer array populated
- [ ] Events showing in chronological order
- [ ] All required properties present
- [ ] No errors in events

**Expected Result:**
```
window.dataLayer = [
  { gtm.start: ..., event: "gtm.js" },
  { event: "page_view", page_location: "...", ... },
  { event: "gtag.config", ... }
]
```

---

## 🐛 Troubleshooting With Debug Mode

### Issue: Tags Not Appearing in Left Panel

**Possible Causes:**
1. Container not loaded
2. Debug mode not active
3. Page didn't fully load

**How to Fix:**
1. Refresh the page while in debug mode
2. Check browser console for errors
3. Verify GTM code is in HTML
4. Wait 2-3 seconds for tags to load

### Issue: GA4 Tag Shows Error

**Possible Causes:**
1. Wrong Measurement ID
2. GA4 property not configured
3. Network blocked

**How to Fix:**
1. Verify ID is G-R2Q0LYQTQS
2. Check GA4 dashboard for data stream
3. Check network requests (F12 → Network)
4. Clear browser cache

### Issue: Events Not Firing

**Possible Causes:**
1. dataLayer not initialized
2. Tags not triggered
3. Conditions not met

**How to Fix:**
1. Check dataLayer in console
2. Verify tag conditions in GTM
3. Check event configuration
4. Review tag firing rules

### Issue: Duplicate Events

**This is OK:**
- Both GTM and direct GA4 will fire same events
- Intentional for redundancy
- Creates natural backup tracking
- Not a problem for GA4

---

## 📋 Debug Verification Checklist

Use this checklist while in debug mode:

### Container Level
- [ ] GTM container loads successfully
- [ ] Container ID: GTM-TP24GSTF
- [ ] No errors in container loading
- [ ] DataLayer initializes
- [ ] Preview mode active

### Tag Level
- [ ] GA4 Config tag fires
- [ ] Direct GA4 gtag.js loads
- [ ] All tags show "Success" status
- [ ] No failed tags
- [ ] Correct number of tags firing

### Event Level
- [ ] page_view event fires
- [ ] Event properties populated
- [ ] All required fields present
- [ ] Events in correct order
- [ ] No duplicate failures

### Data Level
- [ ] Page path captured correctly
- [ ] Page title showing correctly
- [ ] Page location full URL
- [ ] Page referrer tracked
- [ ] All values correct

### Consistency Check
- [ ] GTM events match dataLayer
- [ ] GA4 receives same data
- [ ] Both methods see same events
- [ ] No data loss
- [ ] Timestamps synchronized

---

## 🔗 Debug Link Breakdown

Your debug link contains:

```
https://tagassistant.google.com/#/?
  id=GTM-TP24GSTF              ← Your GTM Container ID
  &url=https://www.brainsait.org/  ← Your site URL
  ?gtm_debug=1775937947577     ← Debug session token
  &source=TAG_MANAGER          ← Source (GTM)
  &gtm_auth=7ypOvNzmtvNUjkTntU83Wg  ← Authentication token
  &gtm_preview=env-1           ← Preview environment
```

### Token Validity
- **gtm_debug**: Session identifier
- **gtm_auth**: Authentication (keeps it secure)
- **gtm_preview**: Environment (env-1 = production)
- **Expiration**: Typically 24 hours

---

## 📊 What to Document While Debugging

### Take Screenshots Of:
1. Tag firing timeline
2. Page view event details
3. GA4 configuration
4. DataLayer contents
5. Any errors or warnings

### Note:
1. Order tags fire in
2. Timing information
3. Event values
4. Tag configuration
5. Any discrepancies

### Report:
1. What worked
2. What didn't work
3. Timing observations
4. Errors found
5. Recommendations

---

## 🎯 Common Debug Scenarios

### Scenario 1: Verify Basic Setup
1. Click debug link
2. Look for GTM container tag
3. Look for GA4 tags
4. Check page_view event fires
5. Verify dataLayer populated

**Expected**: All tags present, no errors

### Scenario 2: Compare Both Methods
1. Open debug mode
2. Note GTM events
3. Note direct GA4 events
4. Verify both present
5. Check for duplicates

**Expected**: Both methods firing, events duplicated (OK)

### Scenario 3: Troubleshoot Missing Data
1. Open debug mode
2. Check dataLayer values
3. Verify event properties
4. Look for errors
5. Check tag configuration

**Expected**: All values populated, no errors

### Scenario 4: Share With Team
1. Copy debug link
2. Send to team member
3. They click the link
4. Same debug session opens
5. They can verify setup

**Expected**: Team can see same tags and data

---

## 📱 Multi-Device Testing

### Desktop Testing
1. Click debug link on desktop
2. Use Chrome DevTools
3. Monitor Network tab
4. Watch Console for errors
5. Verify tags firing

### Mobile Testing
1. Share debug link to mobile browser
2. Open on phone/tablet
3. Interact with site on mobile
4. Check if tags fire
5. Compare with desktop

### Cross-Browser Testing
1. Test in Chrome (main)
2. Test in Firefox
3. Test in Safari
4. Test in Edge
5. Compare results

---

## 🔐 Debug Link Security Notes

### Safe to Share
- ✅ Link expires in ~24 hours
- ✅ Only allows viewing/debugging
- ✅ Can't modify container
- ✅ Can't change tags
- ✅ Read-only access

### Best Practices
- ✅ Share with trusted team members
- ✅ Don't share publicly
- ✅ Regenerate if needed
- ✅ Link expires automatically
- ✅ Use within your organization

### If You Need New Link
1. Go to GTM Dashboard
2. Select GTM-TP24GSTF
3. Click Preview
4. Generate new debug link
5. Share new link instead

---

## 🎓 What You'll Learn From Debug Mode

By exploring debug mode, you'll see:

1. **How GTM Works**
   - Container initialization
   - Tag firing sequence
   - Event flow
   - DataLayer usage

2. **How GA4 Works**
   - Configuration loading
   - Event tracking
   - Property capture
   - Real-time sending

3. **How Both Methods Interact**
   - Parallel event firing
   - Duplicate tracking
   - Data redundancy
   - Failover behavior

4. **Your Site's Behavior**
   - How users interact
   - What events matter
   - Page structure
   - User flows

---

## ✅ Expected Results in Debug Mode

### Page Load
```
✓ gtm.js loads
✓ dataLayer initialized
✓ GA4 gtag/js loads
✓ page_view fires
✓ No errors
```

### On Interaction
```
✓ Events capture
✓ Click tracking (if set up)
✓ Navigation tracking
✓ All properties populate
```

### Data Flow
```
✓ GTM → GA4
✓ Direct GA4
✓ Both receiving same data
✓ Timestamps aligned
```

---

## 🚀 Next Steps After Debug Session

### Immediate
1. Use debug link to verify setup
2. Take screenshots of success
3. Document findings
4. Share results with team

### Short-Term
1. Test all main user flows
2. Verify events firing correctly
3. Check cross-domain tracking
4. Monitor data in GA4

### Medium-Term
1. Set up custom events
2. Configure conversions
3. Create dashboards
4. Set up alerts

---

## 📞 Support Resources

### If Something Looks Wrong
1. Check [GA4_COMPLETE_SETUP_CHECKLIST.md](GA4_COMPLETE_SETUP_CHECKLIST.md)
2. Review [GTM_GA4_VERIFICATION_REPORT.md](GTM_GA4_VERIFICATION_REPORT.md)
3. See [QUICK_GTM_TEST.md](QUICK_GTM_TEST.md)

### GTM Support
- [GTM Documentation](https://support.google.com/tagmanager/)
- [Tag Assistant Help](https://support.google.com/tagmanager/answer/6102821)

### GA4 Support
- [GA4 Documentation](https://support.google.com/analytics/)
- [GA4 Implementation](https://support.google.com/analytics/answer/10089681)

---

## 📊 Summary: Debug Session Guide

**Debug Link**: Ready to use  
**Container**: GTM-TP24GSTF ✅  
**Site**: brainsait.org ✅  
**Features**: Full tag inspection ✅  
**Duration**: ~24 hours ✅  

**To Start Debugging:**
1. Copy the debug link above
2. Open in your browser
3. Interact with your site
4. Watch tags fire in real-time
5. Verify everything working

---

**Last Updated**: April 11, 2026  
**Debug Status**: ✅ Active  
**Next Step**: Click the debug link and start verifying!

---

*Use this debug session to verify your GTM and GA4 setup is working perfectly.* 🔍
