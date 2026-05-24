interface Env {
  GEMINI_API_KEY: string;
  WATHQ_KV?: KVNamespace;
}

const DEMO_CALLS_LIMIT = 3;
const DEMO_WINDOW_SEC = 86400;

const SYSTEM_PROMPTS: Record<string, string> = {
  tender: `أنت خبير حكومي سعودي متخصص في تحليل كراسات الشروط والعطاءات الحكومية.
مهمتك: تحليل النص المقدم وتحديد:
1. أي مخالفات لنظام المنافسات والمشتريات الحكومية (GTPL)
2. مخاطر مالية أو تشغيلية
3. نقاط القوة والضعف
4. توصيات للتحسين
استخدم رموز ⚠ للمخاطر، ✓ للنقاط الإيجابية، ⚡ للتنبيهات. أجب بالعربية بأسلوب مهني.`,

  naphis: `أنت خبير ترميز طبي سعودي متخصص في مراجعة مطالبات نظام نفيس.
مهمتك: فحص المطالبة الطبية والتحقق من:
1. دقة رموز ICD-10 وتطابقها مع التشخيص
2. مناسبة الإجراءات الطبية للتشخيص
3. معقولية التكلفة مقابل المعيار الوطني
4. الامتثال لمعايير مجلس الضمان الصحي التعاوني (CCHI)
استخدم رموز ⚠ للمخاوف، ✓ للتطابق، ⚡ للتنبيهات. أجب بالعربية بأسلوب مهني.`,

  contract: `أنت محامٍ سعودي متخصص في مراجعة العقود الحكومية.
مهمتك: مراجعة بنود العقد والتحقق من:
1. توافقها مع نظام المنافسات والمشتريات الحكومية
2. توازن الالتزامات بين الطرفين
3. مناسبة بنود الجزاءات والغرامات
4. حماية حقوق الملكية الفكرية والبيانات
5. آليات حل النزاعات
استخدم رموز ⚠ للمخاطر، ✓ للبنود السليمة، ⚡ للتنبيهات. أجب بالعربية بأسلوب مهني.`,
};

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS });
}

export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
  const headers = { ...CORS, 'Content-Type': 'application/json' };

  let body: { type?: string; text?: string; sessionId?: string };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ success: false, error: 'Invalid JSON' }), { status: 400, headers });
  }

  const { type, text, sessionId } = body;

  if (!type || !text?.trim()) {
    return new Response(JSON.stringify({ success: false, error: 'type and text are required' }), { status: 400, headers });
  }

  if (!['tender', 'naphis', 'contract'].includes(type)) {
    return new Response(JSON.stringify({ success: false, error: 'type must be tender | naphis | contract' }), { status: 400, headers });
  }

  const geminiKey = env.GEMINI_API_KEY;
  if (!geminiKey) {
    return new Response(JSON.stringify({ success: false, error: 'AI service not configured' }), { status: 503, headers });
  }

  // Server-side rate limiting via KV (bind WATHQ_KV in Pages → Settings → Functions)
  let used = 0;
  let kvKey = '';
  if (env.WATHQ_KV) {
    const ip = request.headers.get('cf-connecting-ip') ?? request.headers.get('x-forwarded-for') ?? 'unknown';
    kvKey = `demo-calls:${sessionId ?? ip}`;
    const stored = await env.WATHQ_KV.get(kvKey);
    used = stored ? parseInt(stored, 10) : 0;

    if (used >= DEMO_CALLS_LIMIT) {
      return new Response(JSON.stringify({
        success: false,
        demo_limit_reached: true,
        remaining_calls: 0,
        upgrade_url: '/wathq',
        message: 'لقد استنفدت الاستفسارات المجانية. يرجى الترقية للوصول الكامل.',
      }), { status: 429, headers });
    }
  }

  // Call Gemini
  const model = 'gemini-2.0-flash';
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`;

  let geminiResp: Response;
  try {
    geminiResp = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text }] }],
        systemInstruction: { parts: [{ text: SYSTEM_PROMPTS[type] }] },
        generationConfig: { temperature: 0.3, maxOutputTokens: 1024 },
      }),
    });
  } catch (e) {
    console.error('Gemini fetch error:', e);
    return new Response(JSON.stringify({ success: false, error: 'AI service unreachable' }), { status: 502, headers });
  }

  if (!geminiResp.ok) {
    const errText = await geminiResp.text();
    console.error('Gemini error', geminiResp.status, errText);
    return new Response(JSON.stringify({ success: false, error: 'AI analysis failed' }), { status: 502, headers });
  }

  const geminiData = await geminiResp.json() as any;
  const analysis: string = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

  if (!analysis) {
    return new Response(JSON.stringify({ success: false, error: 'Empty AI response' }), { status: 502, headers });
  }

  // Persist updated counter
  const newUsed = used + 1;
  if (env.WATHQ_KV && kvKey) {
    await env.WATHQ_KV.put(kvKey, String(newUsed), { expirationTtl: DEMO_WINDOW_SEC });
  }

  return new Response(JSON.stringify({
    success: true,
    data: {
      analysis,
      is_demo: true,
      calls_used: newUsed,
      remaining_calls: DEMO_CALLS_LIMIT - newUsed,
      upgrade_url: '/wathq',
    },
  }), { status: 200, headers });
}
