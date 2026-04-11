# GTM Debug Session - Quick Reference Card

## 🔍 Your Debug Link

**Click Here to Start Debugging:**
```
https://tagassistant.google.com/#/?id=GTM-TP24GSTF&url=https%3A%2F%2Fwww.brainsait.org%2F%3Fgtm_debug%3D1775937947577&source=TAG_MANAGER&gtm_auth=7ypOvNzmtvNUjkTntU83Wg&gtm_preview=env-1
```

---

## ⚡ Quick Start (2 Minutes)

1. **Copy** the debug link above
2. **Paste** into browser address bar
3. **Press** Enter
4. **Wait** for page to load with debug panel
5. **Watch** tags fire in left panel
6. **Interact** with website to see events

---

## 📊 What You'll See

### Left Panel: Tags Firing
```
✓ gtm.js (GTM Container)
✓ GA4 Config (Google Analytics)
✓ page_view (Tracking Event)
```

### Center: Your Website
```
brainsait.org loads normally
(with debug overlay)
```

### Right Panel: Details
```
Selected tag information
Variables and configuration
Firing status
```

---

## ✅ What to Verify

- [ ] GTM container loads (gtm.js)
- [ ] GA4 gtag.js loads
- [ ] page_view event fires
- [ ] All tags show "Success"
- [ ] DataLayer populated
- [ ] No red errors

---

## 🎯 Test Scenarios

### Test 1: Basic Load
1. Click debug link
2. Page loads
3. Look for tags in left panel
4. **Result**: Should see GTM + GA4 tags

### Test 2: Page Interactions
1. Click links on page
2. Navigate between pages
3. **Result**: Tags continue firing

### Test 3: Event Tracking
1. Open debug link
2. Check page_view event
3. Verify all properties populated
4. **Result**: Event complete and accurate

---

## 🔧 Quick Troubleshooting

| Issue | Solution |
|-------|----------|
| No tags showing | Refresh page, wait 3 seconds |
| Tags show error | Check browser console (F12) |
| GA4 ID wrong | Verify G-R2Q0LYQTQS in tag details |
| Duplicate events | Normal - both methods intentional |
| Link expired | Generate new from GTM → Preview |

---

## 📋 Info About Debug Link

- **Container**: GTM-TP24GSTF ✅
- **Site**: brainsait.org ✅
- **Type**: Tag Assistant Debug
- **Duration**: ~24 hours
- **Shareable**: Yes (safe to share with team)
- **Purpose**: Verify tracking setup

---

## 🎓 Debug Features

✅ See all tags firing in real-time  
✅ View dataLayer events  
✅ Check event properties  
✅ Verify GA4 configuration  
✅ Monitor tag firing order  
✅ Inspect variable values  
✅ Share debug session with team  

---

## 🚀 Next Steps

1. **Click** the debug link
2. **Wait** for page to load
3. **Verify** tags in left panel
4. **Check** there are no errors
5. **Document** what you see
6. **Share** results with team

---

## 📞 Need Help?

- **Setup Issues**: See [GA4_COMPLETE_SETUP_CHECKLIST.md](GA4_COMPLETE_SETUP_CHECKLIST.md)
- **Technical Details**: See [GTM_DEBUG_SESSION_GUIDE.md](GTM_DEBUG_SESSION_GUIDE.md)
- **Quick Test**: See [QUICK_GTM_TEST.md](QUICK_GTM_TEST.md)

---

**Status**: ✅ Debug Session Ready  
**Container**: GTM-TP24GSTF  
**Valid**: 24 hours  
**Safe**: ✅ Secure & read-only

---

*Click the debug link above to start verifying your GTM and GA4 setup!* 🔍
