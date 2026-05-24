interface Env {
  WATHQ_KV?: KVNamespace;
}

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

  let body: {
    name?: string;
    email?: string;
    company?: string;
    product?: string;
    usecase?: string;
    source?: string;
  };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ success: false, error: 'Invalid JSON' }), { status: 400, headers });
  }

  const { name, email, company, product, usecase, source } = body;

  if (!name?.trim() || !email?.trim()) {
    return new Response(JSON.stringify({ success: false, error: 'name and email are required' }), { status: 400, headers });
  }

  // Persist to KV if bound (Pages → Settings → Functions → KV bindings: WATHQ_KV)
  if (env.WATHQ_KV) {
    const key = `waitlist:${Date.now()}:${email.toLowerCase().trim()}`;
    await env.WATHQ_KV.put(key, JSON.stringify({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      company: company?.trim() ?? '',
      product: product ?? 'TrustOS',
      usecase: usecase?.trim() ?? '',
      source: source ?? 'trustos-landing',
      submitted_at: new Date().toISOString(),
    }));
  }

  return new Response(JSON.stringify({
    success: true,
    message: 'تم استلام طلبك بنجاح! سنتواصل معك خلال 48 ساعة.',
  }), { status: 200, headers });
}
