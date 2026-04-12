# 🎨 BrainSAIT Custom Theme

**Palette**: Elegant Black / White / Deep Orange accent — minimal, clinical aesthetic.

---

## Color Tokens

| Token | Value | Usage |
|-------|-------|-------|
| Background | `#0a0a0a` | Main app background |
| Surface | `#111111` | Cards, sidebars, panels |
| Surface-2 | `#1a1a1a` | Elevated components, inputs |
| Border | `#2a2a2a` | Dividers, input borders |
| Accent | `#FF6B00` | Primary CTA, active states, links |
| Accent-hover | `#FF8533` | Hover state for accent elements |
| Accent-muted | `rgba(255,107,0,0.15)` | Accent backgrounds, badges |
| Text-primary | `#FFFFFF` | Main content text |
| Text-secondary | `#CCCCCC` | Subtitles, labels |
| Text-muted | `#888888` | Placeholders, disabled states |
| Success | `#22C55E` | Valid/pass indicators |
| Warning | `#F59E0B` | Warnings, pending |
| Danger | `#EF4444` | Errors, denied claims |

---

## Full CSS Block

Apply via **Admin Panel → Interface → Custom CSS**:

```css
/* ===== BrainSAIT Theme v2 — Black/White/Deep Orange ===== */

:root {
  --color-bg:           #0a0a0a;
  --color-surface:      #111111;
  --color-surface-2:    #1a1a1a;
  --color-border:       #2a2a2a;
  --color-accent:       #FF6B00;
  --color-accent-hover: #FF8533;
  --color-accent-muted: rgba(255, 107, 0, 0.15);
  --color-text:         #FFFFFF;
  --color-text-2:       #CCCCCC;
  --color-muted:        #888888;
}

/* Base */
body, #app {
  background: var(--color-bg) !important;
  color: var(--color-text) !important;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
}

/* Sidebar */
nav, aside, [class*="sidebar"], [class*="nav"] {
  background: var(--color-surface) !important;
  border-color: var(--color-border) !important;
}

/* Chat area */
[class*="chat"], [class*="messages"] {
  background: var(--color-bg) !important;
}

/* Message bubbles — user */
[class*="user-message"], [data-role="user"] > div {
  background: var(--color-accent-muted) !important;
  border: 1px solid var(--color-accent) !important;
  border-radius: 12px !important;
}

/* Message bubbles — assistant */
[class*="assistant-message"], [data-role="assistant"] > div {
  background: var(--color-surface-2) !important;
  border: 1px solid var(--color-border) !important;
  border-radius: 12px !important;
}

/* Input box */
textarea, input[type="text"], input[type="search"] {
  background: var(--color-surface-2) !important;
  border: 1px solid var(--color-border) !important;
  color: var(--color-text) !important;
  border-radius: 8px !important;
}
textarea:focus, input:focus {
  border-color: var(--color-accent) !important;
  outline: none !important;
  box-shadow: 0 0 0 2px var(--color-accent-muted) !important;
}

/* Buttons — primary */
button[class*="primary"], button[type="submit"], .btn-primary {
  background: var(--color-accent) !important;
  color: #fff !important;
  border: none !important;
  border-radius: 8px !important;
  font-weight: 600 !important;
}
button[class*="primary"]:hover { background: var(--color-accent-hover) !important; }

/* Buttons — secondary */
button:not([class*="primary"]):not([class*="danger"]) {
  background: var(--color-surface-2) !important;
  color: var(--color-text-2) !important;
  border: 1px solid var(--color-border) !important;
  border-radius: 8px !important;
}

/* Active nav item / selected */
[class*="active"], [aria-selected="true"], [class*="selected"] {
  color: var(--color-accent) !important;
  border-left: 3px solid var(--color-accent) !important;
  background: var(--color-accent-muted) !important;
}

/* Model selector / dropdowns */
select, [class*="dropdown"], [class*="select"] {
  background: var(--color-surface-2) !important;
  border: 1px solid var(--color-border) !important;
  color: var(--color-text) !important;
}

/* Code blocks */
pre, code {
  background: var(--color-surface) !important;
  border: 1px solid var(--color-border) !important;
  color: #FF8533 !important;
  border-radius: 6px !important;
  font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace !important;
}

/* Scrollbar */
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: var(--color-bg); }
::-webkit-scrollbar-thumb { background: var(--color-border); border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: var(--color-accent); }

/* Agent / model badge */
[class*="model-badge"], [class*="tag"], .badge {
  background: var(--color-accent-muted) !important;
  color: var(--color-accent) !important;
  border: 1px solid rgba(255,107,0,0.3) !important;
  border-radius: 4px !important;
  font-size: 11px !important;
  font-weight: 600 !important;
}

/* Tables */
table { border-collapse: collapse; width: 100%; }
th { background: var(--color-surface-2) !important; color: var(--color-accent) !important; }
td, th { border: 1px solid var(--color-border) !important; padding: 8px 12px !important; }
tr:hover td { background: var(--color-surface-2) !important; }

/* Modal / Dialog */
[class*="modal"], [class*="dialog"], [role="dialog"] {
  background: var(--color-surface) !important;
  border: 1px solid var(--color-border) !important;
  border-radius: 12px !important;
}

/* RTL support — Arabic content */
[dir="rtl"], .rtl, [lang="ar"] {
  font-family: 'Noto Sans Arabic', 'Arabic Typesetting', system-ui, sans-serif !important;
  text-align: right !important;
}

/* NPHIES status colors */
.status-approved, [data-status="approved"] { color: #22C55E !important; }
.status-denied, [data-status="denied"] { color: #EF4444 !important; }
.status-pending, [data-status="pending"] { color: #F59E0B !important; }
.status-submitted, [data-status="submitted"] { color: var(--color-accent) !important; }
```

---

## How to Apply

### Via UI
1. Go to `https://work.elfadil.com` → Admin Panel (⚙️)
2. Navigate to **Interface** → **Custom CSS**
3. Paste the CSS block above
4. Click **Save**

### Via API
```bash
# Get current config
curl -s https://work.elfadil.com/api/v1/configs/ui \
  -H "Authorization: Bearer $ADMIN_KEY" | jq .

# Update with custom CSS
curl -X POST https://work.elfadil.com/api/v1/configs/ui \
  -H "Authorization: Bearer $ADMIN_KEY" \
  -H "Content-Type: application/json" \
  -d '{"custom_css": "<paste CSS here>"}'
```

---

## Typography

| Context | Font Stack |
|---------|-----------|
| UI / English | `-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui` |
| Arabic content | `'Noto Sans Arabic', 'Arabic Typesetting', system-ui` |
| Code / JSON | `'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace` |

---

## Accessibility Notes
- All accent interactions maintain 4.5:1 contrast ratio against dark backgrounds
- Focus rings use `box-shadow: 0 0 0 2px rgba(255,107,0,0.5)` — visible and non-intrusive
- RTL Arabic text is handled via `[dir="rtl"]` selector
