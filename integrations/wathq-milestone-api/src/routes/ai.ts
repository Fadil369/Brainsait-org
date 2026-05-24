import { Hono } from 'hono';
import { Env } from '../types';
import { ok, err } from '../utils/response';

export const aiRouter = new Hono<{ Bindings: Env }>();

const DEMO_CALLS_LIMIT = 3;
const DEMO_WINDOW_SEC = 86400; // 24h

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

aiRouter.post('/analyze', async (c) => {
  const body = await c.req.json<{ type: string; text: string; sessionId?: string }>();
  const { type, text, sessionId } = body;

  if (!type || !text?.trim()) {
    return err(c, 400, 'type and text are required');
  }
  if (!['tender', 'naphis', 'contract'].includes(type)) {
    return err(c, 400, 'type must be tender | naphis | contract');
  }

  const ip = c.req.header('cf-connecting-ip') ?? c.req.header('x-forwarded-for') ?? 'unknown';
  const kvKey = `demo-calls:${sessionId ?? ip}`;

  // Check/enforce demo rate limit
  const usedStr = await c.env.WATHQ_KV.get(kvKey);
  const used = usedStr ? parseInt(usedStr, 10) : 0;

  if (used >= DEMO_CALLS_LIMIT) {
    return c.json({
      success: false,
      demo_limit_reached: true,
      remaining_calls: 0,
      upgrade_url: '/wathq.html',
      message: 'لقد استنفدت الاستفسارات المجانية. يرجى الترقية للوصول الكامل.',
    }, 429);
  }

  const geminiKey = c.env.GEMINI_API_KEY;
  if (!geminiKey) {
    return err(c, 503, 'AI service not configured');
  }

  const systemPrompt = SYSTEM_PROMPTS[type];
  const model = 'gemini-2.5-flash-preview-09-2025';
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`;

  const payload = {
    contents: [{ parts: [{ text }] }],
    systemInstruction: { parts: [{ text: systemPrompt }] },
    generationConfig: { temperature: 0.3, maxOutputTokens: 1024 },
  };

  const geminiResp = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!geminiResp.ok) {
    const errBody = await geminiResp.text();
    console.error('Gemini error:', errBody);
    return err(c, 502, 'AI analysis failed');
  }

  const geminiData = await geminiResp.json() as any;
  const analysis = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

  // Increment demo counter
  const newUsed = used + 1;
  await c.env.WATHQ_KV.put(kvKey, String(newUsed), { expirationTtl: DEMO_WINDOW_SEC });

  return ok(c, {
    analysis,
    is_demo: true,
    calls_used: newUsed,
    remaining_calls: DEMO_CALLS_LIMIT - newUsed,
    upgrade_url: '/wathq.html',
  });
});
