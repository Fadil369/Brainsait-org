# Consent Mode v2 Quick Testing Guide

**Project**: BrainSAIT Consent Mode v2  
**Version**: 1.0.0  
**Estimated Time**: 15 minutes

---

## 🚀 Quick Start Testing

### Step 1: Test Fresh Consent Banner (2 mins)

1. Open index.html in **private/incognito window** (disables localStorage)
2. You should see:
   - Dark consent banner at bottom
   - "🔐 Your Privacy" title
   - Three buttons: Reject | Settings | Accept All

**Expected Result**: ✅ Banner appears

---

### Step 2: Test "Accept All" Flow (2 mins)

1. Click **"Accept All"** button
2. Banner should disappear immediately
3. Open **DevTools** (F12 or right-click → Inspect)
4. Go to **Application** tab → **localStorage**
5. Verify `consent_preferences` contains:
   ```json
   {
     "ad_user_data": "granted",
     "ad_personalization": "granted",
     "ad_storage": "granted",
     "analytics_storage": "granted",
     "timestamp": 1712834400000
   }
   ```

**Expected Result**: ✅ Banner disappears, localStorage shows all "granted"

---

### Step 3: Test Persistence (1 min)

1. Refresh the page (F5)
2. Banner should **NOT** reappear
3. Open DevTools → localStorage again
4. Verify `consent_banner_shown` = "true"

**Expected Result**: ✅ Banner stays hidden on refresh

---

### Step 4: Test "Reject" Flow (2 mins)

1. Clear localStorage:
   - DevTools → Application → localStorage → delete all
2. Refresh page
3. Click **"Reject"** button
4. Banner should disappear
5. Open DevTools → localStorage
6. Verify `consent_preferences` contains:
   ```json
   {
     "ad_user_data": "denied",
     "ad_personalization": "denied",
     "ad_storage": "denied",
     "analytics_storage": "denied"
   }
   ```

**Expected Result**: ✅ All values show "denied"

---

### Step 5: Test Granular Settings (3 mins)

1. Clear localStorage again
2. Refresh page
3. Click **"Settings"** button
4. Modal should open with:
   - Unchecked toggles (all denied)
   - 5 categories listed
   - English text visible

5. **Toggle the following**:
   - ✅ Check "Analytics & Performance"
   - ✅ Check "Marketing & Ads"
   - ⬜ Leave "Personalization" unchecked

6. Click **"Save Preferences"**
7. Modal should close
8. Open DevTools → localStorage
9. Verify mixed state:
   ```json
   {
     "ad_user_data": "denied",
     "ad_personalization": "denied",
     "ad_storage": "granted",
     "analytics_storage": "granted"
   }
   ```

**Expected Result**: ✅ Modal saves individual preferences correctly

---

### Step 6: Test Language Toggle (2 mins)

1. Click **"EN"** button (top right)
2. Page should switch to English (LTR layout)
3. Consent banner text should be in English:
   - "🔐 Your Privacy"
   - "We use cookies..."

4. Click **"EN"** again to switch back to Arabic (RTL)
5. Text should be in Arabic:
   - "🔐 حماية خصوصيتك"
   - "نستخدم الكوكيز..."

**Expected Result**: ✅ Text and layout properly switch between Arabic/English

---

### Step 7: Test Settings Anytime (1 min)

1. Click **"Settings"** button again
2. Modal should open with previous choices remembered
3. Toggle **"Personalization"** ON (check it)
4. Click **"Save Preferences"**
5. Modal closes
6. Open DevTools → localStorage
7. Verify `ad_personalization` now = "granted"

**Expected Result**: ✅ Can change preferences anytime

---

## 🔍 GA4 Verification

### Verify GA4 is Respecting Consent

1. Go to your **Google Analytics dashboard**
2. Check **Real-time** → **Overview**
3. If user clicked "Accept All":
   - ✅ Should see active user and real-time events
   - ✅ Page view should be recorded
4. If user clicked "Reject":
   - ✅ May still see user in Real-time (GTM loads)
   - ✅ But NO events should be tracked
   - ✅ GA4 dashboard should show $0 data

### Advanced: Use GTM Tag Assistant

1. Open **GTM Tag Assistant Chrome extension**
2. URL bar shows "debug mode" indicator
3. Click GTM Tag Assistant icon
4. Check if:
   - ✅ GA4 config tag is firing
   - ✅ When analytics_storage = "denied", no data sent
   - ✅ When analytics_storage = "granted", data sent

---

## 📱 Mobile Testing

### Test on Mobile Device

1. Use **Chrome DevTools** device emulation:
   - F12 → Click device icon → Select "iPhone 12"
2. Or use real device and open in mobile browser
3. Verify:
   - ✅ Banner is full width
   - ✅ Buttons stack vertically on small screens
   - ✅ Text is readable
   - ✅ Toggles are touchable (48px minimum)
4. Test both orientations (portrait/landscape)

---

## 🐛 Common Issues & Fixes

### Issue: Banner Shows Every Time

**Cause**: localStorage not persisting  
**Fix**:
```javascript
// Check in console
localStorage.getItem('consent_banner_shown');
// Should return "true" after consent
```

### Issue: GA4 Not Recording

**Cause**: analytics_storage is "denied"  
**Fix**:
1. Click Settings
2. Toggle "Analytics & Performance" ON
3. Save Preferences
4. Wait 24 hours for GA4 to update

### Issue: Settings Modal Won't Open

**Cause**: JavaScript error  
**Fix**:
```javascript
// Test in console
openConsentSettings();
// Should open modal
```

### Issue: Language Toggle Not Working

**Cause**: updateConsentLanguage not called  
**Fix**:
```javascript
// Manually test
updateConsentLanguage('ar');
updateConsentLanguage('en');
```

---

## 📊 Test Results Checklist

Use this checklist to verify all functionality:

### Consent Banner Display
- [ ] Banner appears on first visit
- [ ] Banner positioned at bottom
- [ ] Three buttons visible (Reject, Settings, Accept All)
- [ ] Text visible in English and Arabic

### Accept Flow
- [ ] Click "Accept All" hides banner
- [ ] localStorage saved with all "granted"
- [ ] Banner doesn't reappear on refresh
- [ ] GA4 tracking enabled

### Reject Flow
- [ ] Click "Reject" hides banner
- [ ] localStorage saved with all "denied"
- [ ] Banner doesn't reappear on refresh
- [ ] GA4 tracking disabled

### Settings Modal
- [ ] "Settings" button opens modal
- [ ] All 5 categories visible
- [ ] Essential cookies toggle disabled
- [ ] Other toggles work properly
- [ ] "Save Preferences" updates localStorage
- [ ] Modal closes after saving

### Granular Preferences
- [ ] Can enable/disable each category
- [ ] Mixed states save correctly
- [ ] GA4 respects individual preferences
- [ ] Can change anytime

### Language Support
- [ ] EN button switches to English
- [ ] Arabic text displays RTL properly
- [ ] English text displays LTR properly
- [ ] Language toggle works from banner and modal

### Mobile Responsive
- [ ] Banner displays on mobile
- [ ] Buttons are touchable (48px+)
- [ ] Modal is readable on small screens
- [ ] Toggles work on mobile

### Consent Persistence
- [ ] Consent stored in localStorage
- [ ] Consent expires after 365 days
- [ ] Can clear and re-prompt
- [ ] Audit trail available

---

## 🎯 Success Criteria

✅ **All tests pass** if:

1. ✅ Banner appears on first visit
2. ✅ User can make informed choice (Accept/Reject/Settings)
3. ✅ Preferences persist across sessions
4. ✅ GA4 respects consent choice
5. ✅ User can change preferences anytime
6. ✅ Arabic and English both work
7. ✅ Mobile is fully functional
8. ✅ No console errors

---

## 📞 Need Help?

1. **Check console errors**: DevTools → Console (check for red errors)
2. **Verify localStorage**: DevTools → Application → localStorage
3. **Test GA4 firing**: Use GTM Tag Assistant extension
4. **Review code**: Check `consent-banner` and `consent-modal` IDs in HTML

---

**Testing Complete!** If all checks pass, consent mode v2 is ready for production.

Next step: Deploy to appstore.html and create privacy policy page.
