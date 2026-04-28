# Session: 2026-04-24 (Oracle MCP Server + Portal Gateway v5)

## ما تم إنجازه

### 1. Portal Gateway v5.0
- نشر `portal-gateway-v5` على Cloudflare Workers
- يخدم `brainsait.org/*` و `www.brainsait.org/*`
- `/health` endpoint يعمل ✅

### 2. Oracle CDP Stack (Pi-local)
- Chrome Chromium CDP على port 9222 عبر pm2 (`oracle-chrome`)
- تسجيل دخول ناجح: U29200 / U29201 → oracle-riyadh.brainsait.org
- مستخدم: Heba Osman — Laboratory Reception - 1133
- الـ brainsait.org domain هو الصحيح (مش elfadil.com)

### 3. Oracle MCP Server
- مسار: `/home/fadil369/oracle-mcp-server/`
- 11 MCP tool:
  - `portal_login`, `portal_navigate`, `portal_menu_navigate`
  - `oracle_claims_search`, `oracle_patient_search`
  - `portal_extract_table`, `portal_screenshot`
  - `portal_api_request`, `portal_list_branches`, `portal_run_js`
- يعمل عبر CDP (مش Playwright direct) — أسرع، بدون timeout
- `oracle-core.mjs` — navigation engine بـ ADF selectors صحيحة

### ADF Selectors المكتشفة
- Hamburger btn: `pt1:OasisHedarToolBar:hamburgerBtn`
- Menu items: visible after hamburger click, click by text content
- Claims Submission: CntRgn:0, date fields: `qryId1:val00`, `qryId1:val10`
- Search button: `[class*="p_AFIconOnly"][id*="CntRgn"]`
- U29200 له صلاحية: Manage Claims, Claims Submission, Patient Search, Documents Panel

### المشكلة المتبقية
- Claims search رجع "No data" لـ March 2026 — ممكن لا توجد claims لهذا المستخدم في تلك الفترة
- Session conflict OS-572 يحتاج معالجة عند login

### المرحلة التالية
- دمج oracle-mcp-server مع Basma/OpenClaw
- إضافة Basma tools لـ claims + patient search
- pm2 startup config لـ oracle-chrome على البي
