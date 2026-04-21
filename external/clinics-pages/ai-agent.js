/**
 * BrainSAIT Clinic AI Guide Agent
 * Bilingual (AR/EN) conversational assistant that guides users from
 * service discovery → clinic selection → booking → payment.
 *
 * Usage: <script src="/ai-agent.js"></script>
 * Optional attr on the script tag:
 *   data-payment-url  (default: /payment.html)
 *   data-lang         (default: auto-detect from <html lang>)
 *   data-whatsapp     (default: 966500000000)
 */
(function () {
  'use strict';

  /* ─────────────────────────────────────────────
   * CONFIGURATION
   * ───────────────────────────────────────────── */
  const STORAGE_KEY = 'bs_agent_v2';
  const PAYMENT_URL =
    (document.currentScript && document.currentScript.getAttribute('data-payment-url')) ||
    '/payment.html';
  const AUTO_LANG =
    (document.currentScript && document.currentScript.getAttribute('data-lang')) ||
    document.documentElement.lang ||
    'ar';
  // Business WhatsApp number — override via data-whatsapp attribute on the script tag,
  // or update this default to the actual clinic/business WhatsApp number.
  // TODO: Replace '966500000000' with the real business number before going live.
  const WA_NUMBER =
    (document.currentScript && document.currentScript.getAttribute('data-whatsapp')) ||
    '966500000000';

  /* ─────────────────────────────────────────────
   * CLINIC KNOWLEDGE BASE
   * ───────────────────────────────────────────── */
  const CLINICS = {
    dental: [
      { id: 'ram-clinics',         name: { ar: 'رام كلينكس',      en: 'RAM Clinics'       }, price: 150 },
      { id: 'sigal-dental-clinic', name: { ar: 'سيجال للأسنان',   en: 'Sigal Dental'      }, price: 180 },
      { id: 'imtiaz-dental-center',name: { ar: 'مركز امتياز',     en: 'Imtiaz Dental'     }, price: 160 },
      { id: 'avicena-dental-center',name:{ ar: 'مركز أفيسينا',    en: 'Avicena Dental'    }, price: 200 },
      { id: 'star-smiles',         name: { ar: 'ستار سمايلز',     en: 'Star Smiles'       }, price: 170 },
    ],
    dermatology: [
      { id: 'derma-clinic',        name: { ar: 'عيادة ديرما',     en: 'Derma Clinic'      }, price: 220 },
      { id: 'elite-medical-center',name: { ar: 'إيليت ميديكال',   en: 'Elite Medical'     }, price: 250 },
      { id: 'kaya-skin-clinic',    name: { ar: 'كايا للجلدية',    en: 'Kaya Skin'         }, price: 240 },
      { id: 'medica-clinics',      name: { ar: 'ميديكا كلينكس',   en: 'Medica Clinics'    }, price: 200 },
      { id: 'renewal-reshape',     name: { ar: 'رينيوال ريشيب',   en: 'Renewal Reshape'   }, price: 280 },
    ],
    polyclinic: [
      { id: 'consulting-clinics',  name: { ar: 'كونسلتنج كلينكس', en: 'Consulting Clinics'}, price: 120 },
      { id: 'dallah-health',       name: { ar: 'دله للصحة',       en: 'Dallah Health'     }, price: 130 },
      { id: 'first-clinic',        name: { ar: 'فيرست كلينك',     en: 'First Clinic'      }, price: 110 },
      { id: 'specialized-medical-center', name: { ar: 'المركز الطبي المتخصص', en: 'Specialized Medical' }, price: 160 },
    ],
  };

  /* ─────────────────────────────────────────────
   * BILINGUAL TEXT
   * ───────────────────────────────────────────── */
  const T = {
    ar: {
      bubble_hint:    'مرحباً! هل أساعدك في الحجز؟ 👋',
      greeting:       'مرحباً! أنا مساعدك الذكي في BrainSAIT.\nكيف يمكنني مساعدتك اليوم؟',
      choose_service: 'ما نوع الخدمة التي تبحث عنها؟',
      choose_clinic:  'رائع! إليك العيادات المتاحة:',
      chose:          'اخترت:',
      booking_prompt: 'ممتاز! هل تريد حجز موعد الآن؟',
      collect_name:   'بكل سرور! ما اسمك الكريم؟',
      collect_phone:  'شكراً {name}! أدخل رقم هاتفك للتأكيد:',
      collect_date:   'ما التاريخ المفضل لموعدك؟ (مثال: 15 يناير)',
      payment_intro:  'رائع! ملخص حجزك:',
      payment_cta:    'انتقل إلى الدفع الآن →',
      confirm_thanks: 'شكراً! جارٍ توجيهك إلى صفحة الدفع...',
      service_dental: '🦷 الأسنان',
      service_derma:  '💎 الجلدية',
      service_poly:   '🏥 عيادة شاملة',
      btn_yes:        'نعم، احجز لي',
      btn_no:         'لاحقاً',
      btn_help:       '❓ مساعدة',
      btn_back:       '↩ رجوع',
      input_ph:       'اكتب ردك هنا…',
      send:           'إرسال',
      close:          '✕',
      lang_switch:    'EN',
      price_label:    'رسوم الاستشارة:',
      sar:            'ريال',
      whatsapp_msg:   'مرحباً، أرغب في حجز موعد في عيادة {clinic}',
      phone_error:    'يبدو أن رقم الهاتف غير صحيح. يرجى إدخاله مجدداً.',
      proactive_1:    'يبدو أنك تستعرض عياداتنا 😊 هل أساعدك في اختيار الأنسب لك؟',
      proactive_2:    'أنا هنا إذا أردت المساعدة في الحجز والدفع!',
    },
    en: {
      bubble_hint:    'Hi! Can I help you book? 👋',
      greeting:       'Hello! I\'m your BrainSAIT smart assistant.\nHow can I help you today?',
      choose_service: 'Which type of service are you looking for?',
      choose_clinic:  'Great! Here are the available clinics:',
      chose:          'You chose:',
      booking_prompt: 'Excellent! Would you like to book an appointment now?',
      collect_name:   'Sure! What\'s your full name?',
      collect_phone:  'Thanks {name}! Enter your phone number for confirmation:',
      collect_date:   'What\'s your preferred date? (e.g., Jan 15)',
      payment_intro:  'Great! Your booking summary:',
      payment_cta:    'Proceed to Payment →',
      confirm_thanks: 'Thank you! Redirecting to the payment page…',
      service_dental: '🦷 Dental',
      service_derma:  '💎 Dermatology',
      service_poly:   '🏥 Polyclinic',
      btn_yes:        'Yes, book for me',
      btn_no:         'Maybe later',
      btn_help:       '❓ Help',
      btn_back:       '↩ Back',
      input_ph:       'Type your reply…',
      send:           'Send',
      close:          '✕',
      lang_switch:    'عربي',
      price_label:    'Consultation fee:',
      sar:            'SAR',
      whatsapp_msg:   'Hello, I\'d like to book an appointment at {clinic}',
      phone_error:    'Phone number looks incorrect. Please re-enter.',
      proactive_1:    'Looks like you\'re browsing our clinics 😊 Want help finding the right one?',
      proactive_2:    'I\'m here if you need help booking or paying!',
    },
  };

  /* ─────────────────────────────────────────────
   * INJECTED STYLES
   * ───────────────────────────────────────────── */
  function injectStyles() {
    if (document.getElementById('bs-agent-styles')) return;
    const style = document.createElement('style');
    style.id = 'bs-agent-styles';
    style.textContent = `
      #bs-agent-root *{box-sizing:border-box;font-family:'Inter','Noto Kufi Arabic',sans-serif}
      #bs-agent-root{position:fixed;bottom:24px;right:24px;z-index:99999;display:flex;flex-direction:column;align-items:flex-end;gap:12px}
      #bs-agent-root[dir=rtl]{right:auto;left:24px;align-items:flex-start}
      
      /* Bubble */
      #bs-bubble{display:flex;align-items:center;gap:10px;background:linear-gradient(135deg,#003b42,#00c4b4);color:#fff;border:none;border-radius:999px;padding:14px 20px;cursor:pointer;font-size:14px;font-weight:600;box-shadow:0 4px 20px rgba(0,196,180,.45);transition:transform .2s,box-shadow .2s;max-width:280px;text-align:left}
      #bs-bubble:hover{transform:translateY(-3px);box-shadow:0 8px 28px rgba(0,196,180,.55)}
      #bs-bubble .bs-avatar{width:36px;height:36px;border-radius:50%;background:rgba(255,255,255,.2);display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0}
      .bs-pulse{animation:bs-pulse 2s infinite}
      @keyframes bs-pulse{0%,100%{box-shadow:0 4px 20px rgba(0,196,180,.45)}50%{box-shadow:0 4px 32px rgba(0,196,180,.8)}}
      
      /* Chat window */
      #bs-chat{width:360px;max-height:540px;background:#0d1117;border:1px solid rgba(0,196,180,.25);border-radius:16px;box-shadow:0 16px 48px rgba(0,0,0,.6);display:flex;flex-direction:column;overflow:hidden;animation:bs-slideup .25s ease-out}
      @keyframes bs-slideup{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
      @media(max-width:420px){#bs-chat{width:calc(100vw - 32px)}}
      
      /* Header */
      #bs-header{background:linear-gradient(135deg,#003b42,#005a60);padding:14px 16px;display:flex;align-items:center;gap:10px;flex-shrink:0}
      #bs-header .bs-avatar{width:38px;height:38px;border-radius:50%;background:rgba(255,255,255,.15);display:flex;align-items:center;justify-content:center;font-size:20px}
      #bs-header .bs-info{flex:1;min-width:0}
      #bs-header .bs-name{color:#fff;font-weight:700;font-size:14px}
      #bs-header .bs-status{color:rgba(255,255,255,.65);font-size:11px;display:flex;align-items:center;gap:4px}
      #bs-header .bs-dot{width:7px;height:7px;background:#00c4b4;border-radius:50%;animation:bs-blink 1.5s infinite}
      @keyframes bs-blink{0%,100%{opacity:1}50%{opacity:.4}}
      #bs-header-actions{display:flex;gap:6px}
      .bs-icon-btn{background:rgba(255,255,255,.1);border:none;color:#fff;width:30px;height:30px;border-radius:8px;cursor:pointer;font-size:13px;display:flex;align-items:center;justify-content:center;transition:background .2s}
      .bs-icon-btn:hover{background:rgba(255,255,255,.2)}
      
      /* Messages */
      #bs-messages{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:10px;scroll-behavior:smooth}
      #bs-messages::-webkit-scrollbar{width:4px}
      #bs-messages::-webkit-scrollbar-track{background:transparent}
      #bs-messages::-webkit-scrollbar-thumb{background:rgba(0,196,180,.3);border-radius:2px}
      
      .bs-msg{display:flex;flex-direction:column;gap:4px;max-width:88%}
      .bs-msg.bs-agent{align-self:flex-start}
      .bs-msg.bs-user{align-self:flex-end;align-items:flex-end}
      .bs-bubble-text{padding:10px 14px;border-radius:12px;font-size:13px;line-height:1.55;word-break:break-word}
      .bs-msg.bs-agent .bs-bubble-text{background:rgba(255,255,255,.07);color:#e2e8f0;border-bottom-left-radius:3px}
      .bs-msg.bs-user .bs-bubble-text{background:linear-gradient(135deg,#003b42,#00c4b4);color:#fff;border-bottom-right-radius:3px}
      .bs-msg-time{font-size:10px;color:rgba(255,255,255,.3);padding:0 4px}
      
      /* Typing indicator */
      #bs-typing{display:none;align-items:center;gap:6px;padding:10px 14px;background:rgba(255,255,255,.07);border-radius:12px;border-bottom-left-radius:3px;width:fit-content;margin:4px 0}
      #bs-typing.show{display:flex}
      .bs-dot-typing{width:7px;height:7px;background:rgba(0,196,180,.7);border-radius:50%;animation:bs-typing-dot 1.2s ease-in-out infinite}
      .bs-dot-typing:nth-child(2){animation-delay:.2s}
      .bs-dot-typing:nth-child(3){animation-delay:.4s}
      @keyframes bs-typing-dot{0%,80%,100%{transform:scale(1);opacity:.6}40%{transform:scale(1.2);opacity:1}}
      
      /* Quick replies */
      #bs-quick-replies{padding:0 12px 8px;display:flex;flex-wrap:wrap;gap:8px;flex-shrink:0}
      .bs-qr-btn{background:rgba(0,196,180,.1);border:1px solid rgba(0,196,180,.35);color:#00c4b4;padding:7px 13px;border-radius:20px;cursor:pointer;font-size:12px;font-weight:600;transition:all .2s;white-space:nowrap}
      .bs-qr-btn:hover{background:rgba(0,196,180,.2);border-color:#00c4b4;transform:translateY(-1px)}
      
      /* Summary card */
      .bs-summary-card{background:rgba(0,196,180,.08);border:1px solid rgba(0,196,180,.25);border-radius:10px;padding:12px;font-size:12px;color:#cbd5e1;line-height:1.7}
      .bs-summary-card strong{color:#00c4b4;font-size:13px;display:block;margin-bottom:6px}
      .bs-summary-row{display:flex;justify-content:space-between;gap:8px}
      
      /* Input bar */
      #bs-input-bar{padding:12px;border-top:1px solid rgba(255,255,255,.07);display:flex;gap:8px;flex-shrink:0}
      #bs-input{flex:1;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);color:#e2e8f0;border-radius:10px;padding:10px 12px;font-size:13px;outline:none;transition:border-color .2s}
      #bs-input:focus{border-color:rgba(0,196,180,.5)}
      #bs-input::placeholder{color:rgba(255,255,255,.3)}
      #bs-send-btn{background:linear-gradient(135deg,#003b42,#00c4b4);border:none;color:#fff;width:38px;height:38px;border-radius:10px;cursor:pointer;font-size:16px;display:flex;align-items:center;justify-content:center;transition:transform .2s}
      #bs-send-btn:hover{transform:scale(1.08)}
      #bs-voice-btn{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);color:#94a3b8;width:38px;height:38px;border-radius:10px;cursor:pointer;font-size:16px;display:flex;align-items:center;justify-content:center;transition:all .2s}
      #bs-voice-btn.listening{background:rgba(239,68,68,.15);border-color:rgba(239,68,68,.5);color:#ef4444;animation:bs-pulse 1s infinite}
      
      /* CTA button inside messages */
      .bs-cta-btn{display:inline-flex;align-items:center;gap:6px;background:linear-gradient(135deg,#003b42,#00c4b4);color:#fff;border:none;padding:10px 20px;border-radius:8px;cursor:pointer;font-size:13px;font-weight:700;margin-top:8px;transition:transform .2s,box-shadow .2s;text-decoration:none}
      .bs-cta-btn:hover{transform:translateY(-2px);box-shadow:0 6px 20px rgba(0,196,180,.4)}
      
      /* Progress bar */
      #bs-progress{height:3px;background:rgba(255,255,255,.06);flex-shrink:0}
      #bs-progress-bar{height:100%;background:linear-gradient(90deg,#003b42,#00c4b4);transition:width .5s ease;border-radius:0 2px 2px 0}
    `;
    document.head.appendChild(style);
  }

  /* ─────────────────────────────────────────────
   * STATE MANAGEMENT
   * ───────────────────────────────────────────── */
  const DEFAULT_STATE = {
    open: false,
    step: 'IDLE',
    lang: AUTO_LANG.startsWith('en') ? 'en' : 'ar',
    service: null,
    clinicId: null,
    clinicName: null,
    price: null,
    userName: null,
    userPhone: null,
    preferredDate: null,
    proactiveSent: false,
    visitCount: 0,
    messages: [],
  };

  let STATE = loadState();

  /* ─────────────────────────────────────────────
   * SECURITY: HTML ESCAPING
   * Prevents XSS when user-supplied text is
   * inserted into innerHTML templates.
   * ───────────────────────────────────────────── */
  function esc(str) {
    if (str == null) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function loadState() {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      return raw ? Object.assign({}, DEFAULT_STATE, JSON.parse(raw)) : Object.assign({}, DEFAULT_STATE);
    } catch (_) {
      return Object.assign({}, DEFAULT_STATE);
    }
  }

  function saveState() {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(STATE));
    } catch (_) {}
  }

  /* ─────────────────────────────────────────────
   * PROGRESS MAP
   * ───────────────────────────────────────────── */
  const PROGRESS = {
    IDLE: 0, GREETING: 10, SERVICE_SELECT: 25, CLINIC_SELECT: 40,
    BOOKING_PROMPT: 55, COLLECT_NAME: 65, COLLECT_PHONE: 75,
    COLLECT_DATE: 82, PAYMENT_SUMMARY: 92, DONE: 100,
  };

  /* ─────────────────────────────────────────────
   * DOM REFERENCES (lazily populated)
   * ───────────────────────────────────────────── */
  let root, bubble, chatWin, messagesEl, typingEl, quickRepliesEl,
      inputEl, progressBar, voiceBtn;
  let speechRecog = null;
  let proactiveTimer = null;

  /* ─────────────────────────────────────────────
   * BUILD DOM
   * ───────────────────────────────────────────── */
  function buildWidget() {
    root = document.createElement('div');
    root.id = 'bs-agent-root';
    root.dir = STATE.lang === 'ar' ? 'rtl' : 'ltr';

    // Floating bubble
    bubble = document.createElement('button');
    bubble.id = 'bs-bubble';
    bubble.className = 'bs-pulse';
    bubble.innerHTML = `<span class="bs-avatar">🤖</span><span id="bs-bubble-text"></span>`;
    bubble.addEventListener('click', toggleChat);
    root.appendChild(bubble);

    // Chat window
    chatWin = document.createElement('div');
    chatWin.id = 'bs-chat';
    chatWin.style.display = 'none';
    chatWin.innerHTML = `
      <div id="bs-progress"><div id="bs-progress-bar" style="width:0%"></div></div>
      <div id="bs-header">
        <div class="bs-avatar">🤖</div>
        <div class="bs-info">
          <div class="bs-name">BrainSAIT Guide</div>
          <div class="bs-status"><span class="bs-dot"></span><span id="bs-status-text">Online</span></div>
        </div>
        <div id="bs-header-actions">
          <button class="bs-icon-btn" id="bs-lang-btn" title="Switch Language"></button>
          <button class="bs-icon-btn" id="bs-close-btn" title="Close">✕</button>
        </div>
      </div>
      <div id="bs-messages"></div>
      <div id="bs-typing"><div class="bs-dot-typing"></div><div class="bs-dot-typing"></div><div class="bs-dot-typing"></div></div>
      <div id="bs-quick-replies"></div>
      <div id="bs-input-bar">
        <input id="bs-input" type="text" autocomplete="off" />
        <button id="bs-voice-btn" title="Voice input">🎤</button>
        <button id="bs-send-btn">➤</button>
      </div>
    `;
    root.appendChild(chatWin);

    document.body.appendChild(root);

    // Cache refs
    messagesEl    = document.getElementById('bs-messages');
    typingEl      = document.getElementById('bs-typing');
    quickRepliesEl= document.getElementById('bs-quick-replies');
    inputEl       = document.getElementById('bs-input');
    progressBar   = document.getElementById('bs-progress-bar');
    voiceBtn      = document.getElementById('bs-voice-btn');

    // Events
    document.getElementById('bs-close-btn').addEventListener('click', () => { toggleChat(); });
    document.getElementById('bs-lang-btn').addEventListener('click', switchLang);
    document.getElementById('bs-send-btn').addEventListener('click', onSend);
    inputEl.addEventListener('keydown', (e) => { if (e.key === 'Enter') onSend(); });
    voiceBtn.addEventListener('click', toggleVoice);

    updateBubbleText();
    updateLangBtn();
    updateProgress();
  }

  /* ─────────────────────────────────────────────
   * HELPERS
   * ───────────────────────────────────────────── */
  function t(key) {
    return T[STATE.lang][key] || T['ar'][key] || key;
  }

  function updateBubbleText() {
    const el = document.getElementById('bs-bubble-text');
    if (el) el.textContent = t('bubble_hint');
    if (inputEl) inputEl.placeholder = t('input_ph');
    const statusEl = document.getElementById('bs-status-text');
    if (statusEl) statusEl.textContent = STATE.lang === 'ar' ? 'متاح الآن' : 'Online';
    const langBtn = document.getElementById('bs-lang-btn');
    if (langBtn) langBtn.textContent = t('lang_switch');
  }

  function updateLangBtn() {
    const langBtn = document.getElementById('bs-lang-btn');
    if (langBtn) langBtn.textContent = t('lang_switch');
  }

  function updateProgress() {
    const pct = PROGRESS[STATE.step] || 0;
    if (progressBar) progressBar.style.width = pct + '%';
  }

  function toggleChat() {
    STATE.open = !STATE.open;
    chatWin.style.display = STATE.open ? 'flex' : 'none';
    chatWin.style.flexDirection = 'column';
    bubble.className = STATE.open ? '' : 'bs-pulse';

    if (STATE.open && STATE.step === 'IDLE') {
      startGreeting();
    } else if (STATE.open) {
      scrollToBottom();
    }
    saveState();
  }

  function scrollToBottom() {
    if (messagesEl) messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function timeStr() {
    return new Date().toLocaleTimeString(STATE.lang === 'ar' ? 'ar-SA' : 'en-US',
      { hour: '2-digit', minute: '2-digit' });
  }

  /* ─────────────────────────────────────────────
   * MESSAGE RENDERING
   * ───────────────────────────────────────────── */
  function addMessage(text, role, html) {
    const wrap = document.createElement('div');
    wrap.className = `bs-msg bs-${role}`;

    const bubble2 = document.createElement('div');
    bubble2.className = 'bs-bubble-text';
    if (html) {
      bubble2.innerHTML = html;
    } else {
      bubble2.textContent = text;
    }

    const time = document.createElement('div');
    time.className = 'bs-msg-time';
    time.textContent = timeStr();

    wrap.appendChild(bubble2);
    wrap.appendChild(time);
    messagesEl.appendChild(wrap);
    scrollToBottom();

    // Persist
    let persistedText = text || '';
    const persistedHtml = html || '';
    if (!persistedText && persistedHtml) {
      const temp = document.createElement('div');
      temp.innerHTML = persistedHtml;
      persistedText = temp.textContent || temp.innerText || '';
    }
    STATE.messages.push({ text: persistedText, html: persistedHtml, role, ts: Date.now() });
    if (STATE.messages.length > 40) STATE.messages.shift();
    saveState();
  }

  function showTyping(ms) {
    return new Promise((resolve) => {
      typingEl.classList.add('show');
      scrollToBottom();
      setTimeout(() => {
        typingEl.classList.remove('show');
        resolve();
      }, ms || 900);
    });
  }

  function clearQuickReplies() {
    if (quickRepliesEl) quickRepliesEl.innerHTML = '';
  }

  function showQuickReplies(options) {
    clearQuickReplies();
    options.forEach(({ label, value, handler }) => {
      const btn = document.createElement('button');
      btn.className = 'bs-qr-btn';
      btn.textContent = label;
      btn.addEventListener('click', () => {
        clearQuickReplies();
        addMessage(label, 'user');
        if (handler) handler(value || label);
      });
      quickRepliesEl.appendChild(btn);
    });
    scrollToBottom();
  }

  /* ─────────────────────────────────────────────
   * CONVERSATION STEPS
   * ───────────────────────────────────────────── */
  async function startGreeting() {
    STATE.step = 'GREETING';
    STATE.visitCount++;
    updateProgress();
    saveState();

    await showTyping(700);
    addMessage(t('greeting'), 'agent');

    await showTyping(600);
    addMessage(t('choose_service'), 'agent');

    showQuickReplies([
      { label: t('service_dental'),  value: 'dental',       handler: selectService },
      { label: t('service_derma'),   value: 'dermatology',  handler: selectService },
      { label: t('service_poly'),    value: 'polyclinic',   handler: selectService },
    ]);

    STATE.step = 'SERVICE_SELECT';
    updateProgress();
    saveState();
  }

  async function selectService(service) {
    STATE.service = service;
    STATE.step = 'CLINIC_SELECT';
    updateProgress();
    saveState();

    await showTyping(700);
    addMessage(t('choose_clinic'), 'agent');

    const clinics = CLINICS[service] || [];
    showQuickReplies(
      clinics.map((c) => ({
        label: c.name[STATE.lang],
        value: c.id,
        handler: (id) => selectClinic(id, service),
      }))
    );
  }

  async function selectClinic(clinicId, service) {
    const clinics = CLINICS[service || STATE.service] || [];
    const clinic = clinics.find((c) => c.id === clinicId);
    if (!clinic) return;

    STATE.clinicId   = clinicId;
    STATE.clinicName = clinic.name[STATE.lang];
    STATE.price      = clinic.price;
    STATE.step       = 'BOOKING_PROMPT';
    updateProgress();
    saveState();

    await showTyping(600);
    addMessage(`${t('chose')} ${clinic.name[STATE.lang]} ✓`, 'agent');

    await showTyping(700);
    addMessage(t('booking_prompt'), 'agent');

    showQuickReplies([
      { label: t('btn_yes'), value: 'yes', handler: startCollecting },
      { label: t('btn_no'),  value: 'no',  handler: handleMaybeLater },
      { label: t('btn_back'),value: 'back',handler: () => selectService(STATE.service) },
    ]);
  }

  function handleMaybeLater() {
    addMessage(STATE.lang === 'ar' ? 'حسناً! أنا هنا متى تحتاجني 😊' : 'Alright! I\'m here whenever you\'re ready 😊', 'agent');
    clearQuickReplies();
    showQuickReplies([
      { label: t('btn_back'), value: 'back', handler: () => startGreeting() },
    ]);
  }

  async function startCollecting() {
    STATE.step = 'COLLECT_NAME';
    updateProgress();
    saveState();

    await showTyping(600);
    addMessage(t('collect_name'), 'agent');
    clearQuickReplies();
    inputEl.focus();
  }

  async function handleInput(value) {
    const v = value.trim();
    if (!v) return;

    switch (STATE.step) {
      case 'COLLECT_NAME':
        STATE.userName = v;
        STATE.step = 'COLLECT_PHONE';
        updateProgress();
        saveState();
        await showTyping(500);
        addMessage(t('collect_phone').replace('{name}', v), 'agent');
        break;

      case 'COLLECT_PHONE':
        if (!isValidPhone(v)) {
          await showTyping(400);
          addMessage(t('phone_error'), 'agent');
          break;
        }
        STATE.userPhone = v;
        STATE.step = 'COLLECT_DATE';
        updateProgress();
        saveState();
        await showTyping(500);
        addMessage(t('collect_date'), 'agent');
        break;

      case 'COLLECT_DATE':
        STATE.preferredDate = v;
        STATE.step = 'PAYMENT_SUMMARY';
        updateProgress();
        saveState();
        await showTyping(700);
        showPaymentSummary();
        break;

      default:
        break;
    }
  }

  function showPaymentSummary() {
    const lang = STATE.lang;
    // All user-supplied values are HTML-escaped to prevent XSS
    const summaryHTML = `
      <div class="bs-summary-card">
        <strong>${esc(t('payment_intro'))}</strong>
        <div class="bs-summary-row">
          <span>${lang === 'ar' ? 'العيادة:' : 'Clinic:'}</span>
          <span><b>${esc(STATE.clinicName)}</b></span>
        </div>
        <div class="bs-summary-row">
          <span>${lang === 'ar' ? 'الاسم:' : 'Name:'}</span>
          <span>${esc(STATE.userName)}</span>
        </div>
        <div class="bs-summary-row">
          <span>${lang === 'ar' ? 'الهاتف:' : 'Phone:'}</span>
          <span>${esc(STATE.userPhone)}</span>
        </div>
        <div class="bs-summary-row">
          <span>${lang === 'ar' ? 'الموعد:' : 'Date:'}</span>
          <span>${esc(STATE.preferredDate)}</span>
        </div>
        <div class="bs-summary-row">
          <span>${esc(t('price_label'))}</span>
          <span><b>${esc(String(STATE.price))} ${esc(t('sar'))}</b></span>
        </div>
      </div>
    `;
    addMessage('', 'agent', summaryHTML);

    // CTA button — payment URL is built from known-safe URLSearchParams
    const ctaHTML = `<a class="bs-cta-btn" href="${buildPaymentURL()}" target="_self">${esc(t('payment_cta'))}</a>`;
    addMessage('', 'agent', ctaHTML);

    // WhatsApp fallback — WA_NUMBER is a digit-only config constant, no escaping needed in href
    const wpMsg = encodeURIComponent(t('whatsapp_msg').replace('{clinic}', STATE.clinicName || ''));
    const wpFallbackHTML = `<a class="bs-cta-btn" style="background:linear-gradient(135deg,#128c7e,#25d366);margin-top:4px"
      href="https://wa.me/${WA_NUMBER}?text=${wpMsg}" target="_blank">
      💬 ${lang === 'ar' ? 'تواصل عبر واتساب' : 'Chat on WhatsApp'}
    </a>`;
    addMessage('', 'agent', wpFallbackHTML);

    showQuickReplies([
      { label: t('btn_back'), value: 'back', handler: () => {
          STATE.step = 'COLLECT_DATE';
          updateProgress();
          saveState();
          addMessage(t('collect_date'), 'agent');
          clearQuickReplies();
      }},
    ]);
  }

  function buildPaymentURL() {
    const params = new URLSearchParams({
      clinic:   STATE.clinicId   || '',
      name:     STATE.clinicName || '',
      patient:  STATE.userName   || '',
      phone:    STATE.userPhone  || '',
      date:     STATE.preferredDate || '',
      service:  STATE.service    || '',
      price:    STATE.price      || '',
      lang:     STATE.lang,
    });
    return `${PAYMENT_URL}?${params.toString()}`;
  }

  function isValidPhone(v) {
    // Accept Saudi/GCC mobile formats and generic international
    return /^[\+\d\s\-()]{7,17}$/.test(v);
  }

  /* ─────────────────────────────────────────────
   * INPUT HANDLER
   * ───────────────────────────────────────────── */
  function onSend() {
    const v = inputEl.value.trim();
    if (!v) return;
    addMessage(v, 'user');
    inputEl.value = '';
    handleInput(v);
  }

  /* ─────────────────────────────────────────────
   * LANGUAGE SWITCH
   * ───────────────────────────────────────────── */
  function switchLang() {
    STATE.lang = STATE.lang === 'ar' ? 'en' : 'ar';
    root.dir   = STATE.lang === 'ar' ? 'rtl' : 'ltr';
    updateBubbleText();
    updateLangBtn();
    saveState();
  }

  /* ─────────────────────────────────────────────
   * VOICE INPUT (Web Speech API)
   * ───────────────────────────────────────────── */
  function toggleVoice() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      voiceBtn.title = 'Voice not supported in this browser';
      return;
    }
    if (speechRecog) {
      speechRecog.stop();
      speechRecog = null;
      voiceBtn.classList.remove('listening');
      return;
    }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    speechRecog = new SR();
    speechRecog.lang = STATE.lang === 'ar' ? 'ar-SA' : 'en-US';
    speechRecog.interimResults = false;
    speechRecog.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      inputEl.value = transcript;
      onSend();
    };
    speechRecog.onerror = () => {
      voiceBtn.classList.remove('listening');
      speechRecog = null;
    };
    speechRecog.onend = () => {
      voiceBtn.classList.remove('listening');
      speechRecog = null;
    };
    speechRecog.start();
    voiceBtn.classList.add('listening');
  }

  /* ─────────────────────────────────────────────
   * PROACTIVE ENGAGEMENT
   * ───────────────────────────────────────────── */
  function scheduleProactive() {
    if (STATE.proactiveSent || STATE.open || STATE.step !== 'IDLE') return;

    proactiveTimer = setTimeout(() => {
      if (STATE.open || STATE.step !== 'IDLE') return;

      // Show a subtle nudge in the bubble hint area
      const el = document.getElementById('bs-bubble-text');
      if (el) {
        el.textContent = STATE.visitCount > 1 ? t('proactive_2') : t('proactive_1');
        bubble.style.maxWidth = '320px';
      }
      STATE.proactiveSent = true;
      saveState();
    }, 9000);
  }

  /* ─────────────────────────────────────────────
   * PAGE CONTEXT DETECTION
   * ───────────────────────────────────────────── */
  function detectPageContext() {
    const path = window.location.pathname + window.location.search;
    const hash = window.location.hash;

    // If the user lands on the payment page after completing payment, congratulate them
    if (path.includes('payment.html')) {
      const params = new URLSearchParams(window.location.search);
      const status = params.get('status');
      if (status === 'paid' && STATE.step !== 'DONE') {
        STATE.step = 'DONE';
        STATE.open = true;
        updateProgress();
        saveState();
        setTimeout(() => {
          chatWin.style.display = 'flex';
          chatWin.style.flexDirection = 'column';
          const msg = STATE.lang === 'ar'
            ? '🎉 تم الدفع بنجاح! سيتواصل معك فريقنا قريباً لتأكيد الموعد.'
            : '🎉 Payment successful! Our team will contact you shortly to confirm your appointment.';
          addMessage(msg, 'agent');
        }, 800);
      }
    }

    // Auto-select service if on a specific segment page
    if (path.includes('dental') && !STATE.service) STATE.service = 'dental';
    if (path.includes('dermatology') && !STATE.service) STATE.service = 'dermatology';
    if (path.includes('polyclinic') && !STATE.service) STATE.service = 'polyclinic';

    // Auto-detect clinic from URL
    if (!STATE.clinicId) {
      const match = path.match(/\/([a-z-]+)\.html/);
      if (match) {
        const id = match[1];
        for (const [seg, list] of Object.entries(CLINICS)) {
          const found = list.find((c) => c.id === id);
          if (found) {
            STATE.clinicId   = found.id;
            STATE.clinicName = found.name[STATE.lang];
            STATE.price      = found.price;
            STATE.service    = seg;
            saveState();
            break;
          }
        }
      }
    }
  }

  /* ─────────────────────────────────────────────
   * INIT
   * ───────────────────────────────────────────── */
  function init() {
    injectStyles();
    buildWidget();
    detectPageContext();
    scheduleProactive();

    // Restore open state
    if (STATE.open) {
      chatWin.style.display = 'flex';
      chatWin.style.flexDirection = 'column';
      scrollToBottom();
    }

    // Restore messages to DOM if any
    if (STATE.messages.length > 0 && STATE.open) {
      STATE.messages.forEach((m) => {
        const wrap = document.createElement('div');
        wrap.className = `bs-msg bs-${m.role}`;
        const bub = document.createElement('div');
        bub.className = 'bs-bubble-text';
        bub.textContent = m.text || '';
        const tm = document.createElement('div');
        tm.className = 'bs-msg-time';
        tm.textContent = timeStr();
        wrap.appendChild(bub);
        wrap.appendChild(tm);
        messagesEl.appendChild(wrap);
      });
      scrollToBottom();
    }
  }

  /* ─────────────────────────────────────────────
   * BOOTSTRAP
   * ───────────────────────────────────────────── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Public API
  window.BrainSAITAgent = {
    open:    () => { if (!STATE.open) toggleChat(); },
    close:   () => { if (STATE.open)  toggleChat(); },
    reset:   () => { sessionStorage.removeItem(STORAGE_KEY); location.reload(); },
    getState: () => STATE,
  };
})();
