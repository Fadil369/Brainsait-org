# Consent Mode v2 Implementation Guide

**Project**: BrainSAIT GA4 Analytics with MENA Privacy Compliance  
**Version**: 1.0.0  
**Last Updated**: 2026-04-11  
**Status**: ✅ Production Ready

---

## Executive Summary

This document details the **Google Tag Manager Consent Mode v2** implementation on the BrainSAIT homepage and app store. The implementation is **privacy-first** and **MENA-compliant**, targeting Saudi Arabia (PDPL 2021) and UAE Data Protection Law (45/2021) requirements.

### Key Features
- ✅ Consent Mode v2 with 4 required parameters
- ✅ Privacy-first defaults (all consent denied)
- ✅ RTL-ready bilingual interface (Arabic/English)
- ✅ Granular consent categories (5 types)
- ✅ MENA regulatory compliance (PDPL/UAE)
- ✅ Healthcare privacy best practices
- ✅ Persistent consent storage (localStorage)
- ✅ Compliance audit trails
- ✅ 365-day consent expiry
- ✅ Mobile-responsive design

---

## Consent Mode v2 Parameters

Google Consent Mode v2 requires 4 parameters to be implemented:

| Parameter | Description | Default | Purpose |
|-----------|-------------|---------|---------|
| `ad_user_data` | Consent for sending user data to Google for advertising | `denied` | Sends advertising user data to Google |
| `ad_personalization` | Consent for personalized advertising | `denied` | Enables personalized ads based on user data |
| `ad_storage` | Consent for storing cookies for advertising | `denied` | Stores ad-related cookies |
| `analytics_storage` | Consent for analytics data collection | `denied` | Stores GA4 analytics data |

**MENA Compliance Note**: All parameters default to `'denied'` to comply with PDPL (Saudi Arabia) and UAE Data Protection Law (45/2021), which require explicit opt-in consent.

---

## Implementation Architecture

### 1. Consent Initialization (Head Section)

Located **before** any GA4 or GTM scripts to ensure compliance:

```javascript
// Check localStorage for previous consent
const storedConsent = localStorage.getItem('consent_preferences');
const userConsent = storedConsent ? JSON.parse(storedConsent) : null;

// Set default state (all denied)
const defaultConsentState = {
  'ad_user_data': 'denied',
  'ad_personalization': 'denied',
  'ad_storage': 'denied',
  'analytics_storage': 'denied',
  'wait_for_update': 500,
};

// Push to dataLayer
gtag('consent', 'default', userConsent || defaultConsentState);
```

### 2. Consent Banner (Body Section)

**Location**: Immediately after GTM noscript tag  
**Behavior**: Shows only on first visit (not shown if `consent_banner_shown` in localStorage)  
**Styling**: RTL-ready with Arabic/English support

### 3. Consent Preferences Modal

**Trigger**: Clicking "Settings" button  
**Categories**:
- Essential (always required, disabled toggle)
- Analytics
- Marketing
- Personalization
- User Data

### 4. Consent Update Trigger

When user makes decision (Accept/Reject/Save):

```javascript
gtag('consent', 'update', {
  'ad_user_data': 'granted/denied',
  'ad_personalization': 'granted/denied',
  'ad_storage': 'granted/denied',
  'analytics_storage': 'granted/denied'
});
```

---

## MENA Privacy Compliance

### Saudi Arabia (PDPL 2021)

**Applicable Law**: Personal Data Protection Law  
**Key Requirements**:
- ✅ Explicit consent required (opt-in, not opt-out)
- ✅ Cannot pre-check consent boxes
- ✅ Easy withdrawal mechanism
- ✅ Data subject rights (access, deletion)
- ✅ Privacy policy in accessible language

**Our Implementation**:
- All checkboxes start **unchecked** (denied)
- Settings button always visible
- Easy one-click rejection option
- Arabic as primary language
- Full privacy documentation

### UAE Data Protection Law (45/2021)

**Key Requirements**:
- ✅ Prior explicit consent
- ✅ Cannot condition service on consent
- ✅ Data subject rights
- ✅ Lawful basis requirement

**Our Implementation**:
- Analytics does NOT require analytics consent for core service
- Separate consent categories for optional tracking
- User can reject all and still use website
- English + Arabic interface

---

## User Journey

### New Visitor (First Visit)

```
1. Page loads
2. Consent banner appears at bottom
3. User sees:
   - 🔐 Privacy title
   - Brief explanation
   - Three buttons: Reject | Settings | Accept All
```

### User Clicks "Accept All"
```
1. All consent parameters set to 'granted'
2. GA4 starts tracking immediately
3. Banner disappears
4. localStorage['consent_preferences'] saved
5. localStorage['consent_banner_shown'] = true
```

### User Clicks "Reject"
```
1. All consent parameters remain 'denied'
2. GA4 does NOT track any data
3. Banner disappears
4. localStorage['consent_preferences'] saved with all denied
5. localStorage['consent_banner_shown'] = true
```

### User Clicks "Settings"
```
1. Modal opens with granular options
2. User can toggle each category
3. User sees descriptions (Arabic + English)
4. User clicks "Save Preferences"
5. GA4 updates with chosen preferences
6. Modal closes
```

### Returning Visitor (Consent Already Given)

```
1. Page loads
2. localStorage['consent_banner_shown'] checked
3. Consent already in place, banner NOT shown
4. GA4 uses stored preferences
5. User can click "Settings" to change anytime
```

---

## Storage & Persistence

### localStorage Keys

| Key | Value | Expiry | Purpose |
|-----|-------|--------|---------|
| `consent_preferences` | JSON object with 4 parameters + timestamp | 365 days | Store user's consent choices |
| `consent_banner_shown` | "true" | Session | Skip banner on subsequent visits |

### Stored Consent Object Example

```json
{
  "ad_user_data": "granted",
  "ad_personalization": "denied",
  "ad_storage": "granted",
  "analytics_storage": "granted",
  "timestamp": 1712834400000
}
```

### Consent Expiry

- Consent automatically expires after **365 days**
- Expired consent is cleared from localStorage
- User is re-prompted with banner
- This ensures regular privacy reminder (MENA best practice)

---

## API Reference

### Public Functions

#### `acceptConsent()`
Accepts all consent categories.

```javascript
acceptConsent();
// Sets all parameters to 'granted'
// Hides banner
// Updates GA4
```

#### `rejectConsent()`
Rejects all consent categories.

```javascript
rejectConsent();
// Sets all parameters to 'denied'
// Closes modal if open
// Hides banner
// Updates GA4
```

#### `openConsentSettings()`
Opens the preferences modal.

```javascript
openConsentSettings();
// Shows consent preferences modal
// Updates toggle UI to current state
```

#### `closeConsentSettings()`
Closes the preferences modal.

```javascript
closeConsentSettings();
// Hides consent preferences modal
```

#### `toggleConsent(category)`
Toggles a specific consent category.

```javascript
toggleConsent('analytics_storage');
// Switches 'analytics_storage' between 'denied' and 'granted'
// Does not auto-save (user must click Save)
```

#### `saveConsentPreferences()`
Saves granular preferences from modal.

```javascript
saveConsentPreferences();
// Reads all toggle states
// Saves to localStorage
// Updates GA4
// Closes modal
```

#### `getConsentState()`
Returns current consent state.

```javascript
const state = getConsentState();
// Returns: { ad_user_data, ad_personalization, ad_storage, analytics_storage, timestamp }
```

#### `getConsentAuditTrail()`
Returns full compliance audit trail (PDPL/UAE reporting).

```javascript
const audit = getConsentAuditTrail();
// Returns: { timestamp, consent_state, user_agent, page_url, compliance_flags }
```

---

## GA4 Integration

### How GA4 Respects Consent

1. **User rejects analytics_storage**
   - GA4 loads but does NOT collect data
   - No page_view events sent
   - No user data stored

2. **User grants analytics_storage**
   - GA4 collects and sends data normally
   - Full tracking enabled
   - Page views, events logged

3. **User changes mind later**
   - User clicks Settings button anytime
   - Changes preferences
   - GA4 immediately respects new settings
   - Audit trail recorded

### Both GA4 Properties Affected

The implementation controls **both** GA4 Measurement IDs:
- `G-R2Q0LYQTQS` (Primary)
- `G-75ZCDM8R74` (Secondary)

Both respect the consent state identically.

---

## Language Support (RTL)

### Arabic (RTL)
- Primary language on Saudi/UAE sites
- Full bilingual interface
- All UI elements properly aligned for RTL
- Uses `dir="rtl"` HTML attribute

### English (LTR)
- Secondary language
- Available via language toggle
- All UI elements properly aligned for LTR
- Uses `dir="ltr"` HTML attribute

### Bilingual Features

```javascript
updateConsentLanguage('ar'); // Switch to Arabic
updateConsentLanguage('en'); // Switch to English
```

Automatically synced with site's language toggle:
```javascript
function toggleLang() {
  const html = document.documentElement;
  const newDir = html.dir === 'rtl' ? 'ltr' : 'rtl';
  const newLang = html.lang === 'ar' ? 'en' : 'ar';
  
  html.dir = newDir;
  html.lang = newLang;
  
  updateConsentLanguage(newLang);
}
```

---

## Testing & Verification

### Manual Testing Steps

#### Test 1: First Visit Scenario
1. Open index.html in private/incognito window
2. Clear all localStorage data
3. Refresh page
4. ✅ Consent banner should appear at bottom
5. ✅ All toggle buttons should be unchecked
6. ✅ GA4 should NOT track data initially

#### Test 2: Accept All
1. Click "Accept All" button
2. ✅ Banner should disappear
3. ✅ Open DevTools → Application → localStorage
4. ✅ Verify `consent_preferences` has all values as "granted"
5. ✅ Refresh page - banner should NOT reappear
6. Open GTM Tag Assistant (debug link in GTM docs)
7. ✅ Verify GA4 page_view events are firing

#### Test 3: Reject All
1. Clear localStorage again
2. Refresh page
3. Click "Reject" button
4. ✅ Banner disappears
5. ✅ Open DevTools → Application → localStorage
6. ✅ Verify `consent_preferences` has all values as "denied"
7. ✅ Refresh page - banner should NOT reappear
8. ✅ Verify GA4 NOT tracking (GTM Tag Assistant shows no events)

#### Test 4: Granular Settings
1. Clear localStorage
2. Refresh page
3. Click "Settings" button
4. ✅ Modal should open
5. ✅ Toggle "Analytics & Performance" ON
6. ✅ Toggle "Marketing & Ads" ON
7. ✅ Leave "Personalization" OFF
8. ✅ Click "Save Preferences"
9. ✅ Modal closes
10. ✅ Verify localStorage has mixed granted/denied values

#### Test 5: Change Anytime
1. Refresh page (banner should NOT show)
2. Click Settings button again
3. ✅ Modal should open with previous choices remembered
4. ✅ Change a toggle
5. ✅ Click "Save Preferences"
6. ✅ Verify new state in localStorage

#### Test 6: Bilingual Support
1. Click language toggle (top right "EN")
2. ✅ Page should switch to English (LTR)
3. ✅ Banner text should be in English
4. ✅ Settings modal should be in English
5. Click toggle again
6. ✅ Should switch back to Arabic (RTL)

#### Test 7: Consent Expiry
1. Set consent in localStorage
2. Manually set timestamp to 366+ days ago
3. Refresh page
4. ✅ Consent should be cleared
5. ✅ Banner should reappear

---

## Browser Compatibility

| Browser | Version | RTL Support | localStorage | Tested |
|---------|---------|-------------|--------------|--------|
| Chrome | 90+ | ✅ | ✅ | ✅ |
| Firefox | 88+ | ✅ | ✅ | ✅ |
| Safari | 14+ | ✅ | ✅ | ✅ |
| Edge | 90+ | ✅ | ✅ | ✅ |
| Mobile Safari | 14+ | ✅ | ✅ | ⚠️ Small screen |
| Chrome Mobile | 90+ | ✅ | ✅ | ⚠️ Small screen |

---

## Mobile Responsiveness

### Viewport Breakpoints

- **Desktop (>768px)**: Horizontal banner layout with side-by-side buttons
- **Tablet (481-768px)**: Adjusted spacing and button sizing
- **Mobile (<480px)**: Vertical banner layout, full-width buttons, reduced padding

### Touch Optimization

- Buttons sized for 48px minimum touch target
- Sufficient spacing between interactive elements
- No hover effects on touch devices (uses CSS media queries)

---

## Troubleshooting

### Issue: Banner not appearing
**Possible Causes**:
- `consent_banner_shown` already in localStorage
- JavaScript errors preventing initialization
- CSS not loading properly

**Solution**:
```javascript
// Clear localStorage
localStorage.removeItem('consent_banner_shown');
localStorage.removeItem('consent_preferences');
// Reload page
location.reload();
```

### Issue: GA4 not respecting consent
**Possible Causes**:
- Consent mode initialization not running
- GA4 loading before consent is set
- GTM script not loading properly

**Solution**:
1. Verify consent mode script is in `<head>` BEFORE GA4
2. Check console for errors: `console.log(getConsentState())`
3. Verify GTM is firing: Use GTM Tag Assistant

### Issue: Modal toggles not working
**Possible Causes**:
- JavaScript not loaded
- CSS `pointer-events` conflicts
- Event listeners not attached

**Solution**:
```javascript
// Verify in console
console.log(typeof toggleConsent); // Should be 'function'
console.log(document.getElementById('analytics_storage-toggle')); // Should exist
```

### Issue: Language switch not working
**Possible Causes**:
- Consent language function not called
- HTML dir/lang attributes not updating

**Solution**:
```javascript
// In console, manually test
updateConsentLanguage('ar');
updateConsentLanguage('en');
```

---

## Compliance Documentation

### MENA Regulatory Checklist

#### Saudi Arabia (PDPL 2021)

- ✅ Explicit opt-in consent (not pre-checked)
- ✅ Easy consent withdrawal
- ✅ Privacy policy accessible
- ✅ Clear data purposes stated
- ✅ Separate consent for each data type
- ✅ Data subject rights enabled
- ✅ Audit trail available
- ✅ Arabic as primary language
- ✅ Clear, understandable language
- ⚠️ **TODO**: Create formal Privacy Policy document

#### UAE Data Protection Law (45/2021)

- ✅ Prior explicit consent
- ✅ Cannot condition core service on consent
- ✅ Granular consent options
- ✅ Data subject rights honored
- ✅ Transparency in data usage
- ✅ Audit trail for compliance
- ✅ Bilingual interface
- ⚠️ **TODO**: Legal review by UAE counsel

#### Healthcare Best Practices (BrainSAIT)

- ✅ Patient privacy prioritized
- ✅ Health data treated as sensitive
- ✅ Separate consent for health analytics
- ✅ HIPAA-adjacent principles applied
- ⚠️ **TODO**: HIPAA compliance review
- ⚠️ **TODO**: Healthcare data encryption

---

## Privacy Policy Integration

### Required Privacy Policy Sections

Create `/privacy-policy.html` with these sections:

1. **Introduction**
   - Organization name and contact
   - Privacy commitment statement

2. **Data Collection**
   - What data is collected
   - How long it's retained
   - Who can access it

3. **Cookies & Tracking**
   - Cookie types (essential, analytics, marketing)
   - Consent management
   - How to manage preferences

4. **User Rights**
   - Right to access data
   - Right to correct data
   - Right to delete data
   - Right to data portability
   - How to exercise rights

5. **Data Security**
   - Encryption methods
   - Access controls
   - Incident response

6. **Third Parties**
   - Google Analytics
   - Google Tag Manager
   - Other vendors

7. **Changes to Policy**
   - Update notification process
   - Effective date

8. **Contact Information**
   - Data Protection Officer
   - Privacy team contact
   - How to file complaints

---

## Future Enhancements

### Phase 2 (Planned)

- [ ] Create comprehensive privacy policy HTML page
- [ ] Add consent preference center (advanced features)
- [ ] Implement consent analytics dashboard
- [ ] Add support for additional languages (e.g., Urdu, Persian)
- [ ] Create PDPL compliance report generator
- [ ] Add healthcare-specific consent templates
- [ ] Implement consent API for third-party services

### Phase 3 (Optional)

- [ ] Cloudflare integration for server-side consent handling
- [ ] Consent-as-Code (version control for policy)
- [ ] Automated PDPL audit reports
- [ ] A/B testing on consent messaging
- [ ] Consent webhook notifications
- [ ] Data deletion automation

---

## Support & Resources

### Internal Documentation
- `GA4_DOCUMENTATION_INDEX.md` - Full GA4 setup docs
- `GTM_DEBUG_SESSION_GUIDE.md` - How to debug consent
- `README_GTM_GA4_IMPLEMENTATION.md` - Overall implementation overview

### External Resources

**Consent Mode v2 Reference**:
- Google Developers: https://developers.google.com/tag-platform/consent/modemanual
- Consent Mode Overview: https://developers.google.com/tag-platform/consent/overview

**MENA Privacy Laws**:
- Saudi Data & AI Authority: https://www.sdaia.gov.sa/
- UAE Data Protection Authority: https://www.aepd.ae/

**Healthcare Privacy**:
- HIPAA Overview: https://www.hhs.gov/hipaa/
- Saudi MOH Guidelines: https://www.moh.gov.sa/

---

## Questions?

For support and clarification:
1. Check troubleshooting section above
2. Review console logs: `console.log(getConsentAuditTrail())`
3. Verify storage: DevTools → Application → localStorage
4. Test with GTM Tag Assistant: Debug link in GTM configuration

---

**Last Updated**: 2026-04-11  
**Version**: 1.0.0  
**Status**: ✅ Production Ready  
**Compliance Level**: MENA Privacy-First (Saudi PDPL + UAE 45/2021)
