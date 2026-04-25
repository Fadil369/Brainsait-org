/**
 * BrainSAIT PayPal Integration - Cloudflare Worker
 * Uses Wrangler secrets/vars instead of hardcoded credentials.
 */

const COURSE_PRICING = {
  'collective-brainpower': { name: 'Master Healthcare, Tech & AI', price: '0.00', tier: 'free', currency: 'SAR' },
  'nphies-ai-mastery': { name: 'NPHIES-AI Mastery', price: '2500.00', tier: 'professional', currency: 'SAR' },
  'fhir-r4': { name: 'FHIR R4 Implementation', price: '2500.00', tier: 'professional', currency: 'SAR' },
  'rcm-automation': { name: 'RCM Automation & Revenue Recovery', price: '2500.00', tier: 'professional', currency: 'SAR' },
  'compliance': { name: 'Healthcare Compliance & Regulatory AI', price: '1500.00', tier: 'professional', currency: 'SAR' },
  'vision2030': { name: 'Vision 2030 Digital Health Strategy', price: '1500.00', tier: 'professional', currency: 'SAR' },
  'claude-101': { name: 'Claude 101 for Healthcare', price: '0.00', tier: 'free', currency: 'SAR' },
  'ai-fluency': { name: 'AI Fluency for Healthcare', price: '1500.00', tier: 'professional', currency: 'SAR' },
  agents: { name: 'Building Healthcare AI Agents', price: '2500.00', tier: 'professional', currency: 'SAR' },
  'claude-code': { name: 'Claude Code 101 for Healthcare', price: '2500.00', tier: 'professional', currency: 'SAR' },
  'claude-api': { name: 'Building Healthcare Apps with Claude API', price: '2500.00', tier: 'professional', currency: 'SAR' },
  'claude-code-action': { name: 'Claude Code in Action', price: '2500.00', tier: 'professional', currency: 'SAR' },
  mcp: { name: 'Model Context Protocol for Healthcare', price: '2500.00', tier: 'professional', currency: 'SAR' },
  bedrock: { name: 'Claude with AWS Bedrock', price: '2500.00', tier: 'professional', currency: 'SAR' },
  vertex: { name: 'Claude with Google Vertex AI', price: '2500.00', tier: 'professional', currency: 'SAR' },
  'teaching-ai': { name: 'Teaching AI Fluency', price: '1500.00', tier: 'professional', currency: 'SAR' },
  'ai-students': { name: 'AI Fluency for Students', price: '0.00', tier: 'free', currency: 'SAR' },
  'ai-nonprofit': { name: 'AI Fluency for Nonprofits', price: '0.00', tier: 'free', currency: 'SAR' },
  cowork: { name: 'Claude Cowork for Teams', price: '1500.00', tier: 'professional', currency: 'SAR' },
  'agent-skills': { name: 'Healthcare Agent Skills', price: '2500.00', tier: 'professional', currency: 'SAR' },
};

const CORS = {
  'Access-Control-Allow-Origin': 'https://brainsait.org',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

async function getAccessToken(env) {
  if (!env.PAYPAL_CLIENT_ID || !env.PAYPAL_SECRET) {
    throw new Error('Missing PayPal credentials');
  }

  const resp = await fetch('https://api-m.paypal.com/v1/oauth2/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${btoa(`${env.PAYPAL_CLIENT_ID}:${env.PAYPAL_SECRET}`)}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!resp.ok) {
    throw new Error('Failed to authenticate with PayPal');
  }

  const data = await resp.json();
  return data.access_token;
}

function json(body, init = {}) {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: {
      ...CORS,
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  });
}

async function handleCreateOrder(request, env) {
  const { course_id: courseId, student_name: studentName, student_email: studentEmail } = await request.json();
  const course = COURSE_PRICING[courseId];

  if (!course) {
    return json({ error: 'Invalid course' }, { status: 400 });
  }

  if (course.price === '0.00') {
    return json({ free: true, course_id: courseId, course_name: course.name });
  }

  const token = await getAccessToken(env);
  const resp = await fetch('https://api-m.paypal.com/v2/checkout/orders', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [{
        reference_id: courseId,
        description: `BrainSAIT: ${course.name}`,
        custom_id: JSON.stringify({ studentName, studentEmail }),
        amount: {
          currency_code: course.currency,
          value: course.price,
          breakdown: {
            item_total: {
              currency_code: course.currency,
              value: course.price,
            },
          },
        },
        items: [{
          name: course.name,
          unit_amount: {
            currency_code: course.currency,
            value: course.price,
          },
          quantity: '1',
          category: 'DIGITAL_GOODS',
        }],
      }],
      application_context: {
        brand_name: 'BrainSAIT Training',
        landing_page: 'BILLING',
        user_action: 'PAY_NOW',
        return_url: 'https://brainsait.org/training/dashboard?payment=success',
        cancel_url: 'https://brainsait.org/training/enroll?payment=cancelled',
      },
    }),
  });

  const order = await resp.json();
  return json(order, { status: resp.status });
}

async function handleCaptureOrder(request, env) {
  const { order_id: orderId, course_id: courseId, student_name: studentName, student_email: studentEmail } = await request.json();
  const token = await getAccessToken(env);

  const resp = await fetch(`https://api-m.paypal.com/v2/checkout/orders/${orderId}/capture`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  const capture = await resp.json();

  if (capture.status !== 'COMPLETED') {
    return json({ success: false, capture_status: capture.status }, { status: 400 });
  }

  const course = COURSE_PRICING[courseId];
  return json({
    success: true,
    capture_status: capture.status,
    enrollment: {
      id: `enr_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
      course_id: courseId,
      course_name: course?.name,
      student_name: studentName || 'Unknown',
      student_email: studentEmail || 'Unknown',
      payment_id: orderId,
      amount: course?.price,
      currency: course?.currency,
      status: 'enrolled',
      enrolled_at: new Date().toISOString(),
    },
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const { pathname } = url;

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS });
    }

    try {
      if (pathname === '/api/paypal/config' && request.method === 'GET') {
        if (!env.PAYPAL_CLIENT_ID) {
          return json({ error: 'PayPal is not configured' }, { status: 503 });
        }

        return json({
          client_id: env.PAYPAL_CLIENT_ID,
          currency: 'SAR',
          intent: 'capture',
        });
      }

      if (pathname === '/api/paypal/courses' && request.method === 'GET') {
        return json({
          courses: Object.entries(COURSE_PRICING).map(([id, course]) => ({
            id,
            name: course.name,
            price: course.price,
            currency: course.currency,
            tier: course.tier,
          })),
        });
      }

      if (pathname === '/api/paypal/create-order' && request.method === 'POST') {
        return handleCreateOrder(request, env);
      }

      if (pathname === '/api/paypal/capture-order' && request.method === 'POST') {
        return handleCaptureOrder(request, env);
      }
    } catch (error) {
      return json({ error: error instanceof Error ? error.message : 'Unexpected error' }, { status: 500 });
    }

    return json({ error: 'Not found' }, { status: 404 });
  },
};
