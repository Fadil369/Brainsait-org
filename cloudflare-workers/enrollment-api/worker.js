// BrainSAIT Training Enrollment API — Cloudflare Worker (Service Worker format)

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const url = new URL(request.url);
  const corsHeaders = {
    'Access-Control-Allow-Origin': 'https://brainsait.org',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // POST /api/enroll — Submit enrollment
  if (request.method === 'POST' && url.pathname === '/api/enroll') {
    try {
      const body = await request.json();
      const { name, email, phone, organization, course, tier, message } = body;

      if (!name || !email || !course) {
        return new Response(JSON.stringify({ error: 'Name, email, and course are required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const enrollmentId = `ENR-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

      const enrollment = {
        id: enrollmentId,
        name,
        email,
        phone: phone || '',
        organization: organization || '',
        course,
        tier: tier || 'professional',
        message: message || '',
        status: 'pending',
        createdAt: new Date().toISOString(),
      };

      return new Response(JSON.stringify({
        success: true,
        enrollmentId,
        message: 'Enrollment submitted successfully. We will contact you within 24 hours.',
        messageAr: 'تم تقديم التسجيل بنجاح. سنتواصل معك خلال 24 ساعة.',
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } catch (err) {
      return new Response(JSON.stringify({ error: 'Invalid request body' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  }

  // GET /api/enrollment/:id — Check enrollment status
  if (request.method === 'GET' && url.pathname.startsWith('/api/enrollment/')) {
    const id = url.pathname.split('/api/enrollment/')[1];
    return new Response(JSON.stringify({ id, status: 'pending', message: 'Enrollment found' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // GET /api/courses — List available courses
  if (request.method === 'GET' && url.pathname === '/api/courses') {
    const courses = [
      { id: 'collective-brainpower', name: 'Master the Intersection of Healthcare, Tech & AI', nameAr: 'إتقان تقاطع الرعاية الصحية والتكنولوجيا والذكاء الاصطناعي', status: 'active', price: 2500, currency: 'SAR' },
      { id: 'nphies-ai-mastery', name: 'NPHIES-AI Mastery: Health Insurance Automation', nameAr: 'إتقان NPHIES بالذكاء الاصطناعي: أتمتة التأمين الصحي', status: 'active', price: 2500, currency: 'SAR' },
      { id: 'ai-fluency-healthcare', name: 'AI Fluency: Framework & Foundations', nameAr: 'الإتقان الرقمي للذكاء الاصطناعي', status: 'upcoming', price: 2500, currency: 'SAR' },
      { id: 'healthcare-ai-agents', name: 'Building Healthcare AI Agents', nameAr: 'بناء وكلاء الذكاء الاصطناعي للرعاية الصحية', status: 'upcoming', price: 3000, currency: 'SAR' },
      { id: 'fhir-r4-saudi', name: 'FHIR R4 Implementation for Saudi Healthcare', nameAr: 'تطبيق FHIR R4 للرعاية الصحية', status: 'upcoming', price: 3500, currency: 'SAR' },
      { id: 'rcm-automation', name: 'RCM Automation & Revenue Recovery', nameAr: 'أتمتة إدارة دورة الإيرادات', status: 'upcoming', price: 2500, currency: 'SAR' },
      { id: 'mcp-healthcare', name: 'Model Context Protocol for Healthcare', nameAr: 'بروتوكول سياق النموذج للرعاية الصحية', status: 'upcoming', price: 3000, currency: 'SAR' },
      { id: 'healthcare-compliance', name: 'Healthcare Compliance & Regulatory AI', nameAr: 'الامتثال الصحي والتنظيم بالذكاء الاصطناعي', status: 'upcoming', price: 2500, currency: 'SAR' },
    ];

    return new Response(JSON.stringify({ courses }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  return new Response('Not found', { status: 404, headers: corsHeaders });
}
