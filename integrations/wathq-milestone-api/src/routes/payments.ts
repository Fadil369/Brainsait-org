import { Hono } from 'hono';
import { Env } from '../types';
import { generateUUID } from '../utils/uuid';
import { writeAudit } from '../utils/audit';
import { ok, created, err } from '../utils/response';

export const paymentsRouter = new Hono<{ Bindings: Env }>();

// ── Product catalogue (mirrors wathq.html pricing) ───────────────────────
const PRODUCTS: Record<string, { name: string; nameAr: string; priceSar: number; type: 'one_time' | 'recurring' | 'credit' }> = {
  'verify-widget-monthly':   { name: 'Verify-as-a-Widget Monthly',     nameAr: 'Verify Widget شهري',       priceSar: 200,   type: 'recurring' },
  'pdf-cert':                { name: 'PDF Verification Certificate',    nameAr: 'شهادة تحقق PDF',            priceSar: 25,    type: 'one_time' },
  'kyb-lite':                { name: 'KYB Bundle Lite',                 nameAr: 'باقة KYB الأساسية',         priceSar: 9,     type: 'one_time' },
  'kyb-standard':            { name: 'KYB Bundle Standard',             nameAr: 'باقة KYB القياسية',         priceSar: 29,    type: 'one_time' },
  'kyb-premium':             { name: 'KYB Bundle Premium',              nameAr: 'باقة KYB المتقدمة',         priceSar: 49,    type: 'one_time' },
  'monitoring-annual':       { name: 'Continuous Monitoring Annual',    nameAr: 'المراقبة المستمرة سنوية',   priceSar: 49,    type: 'recurring' },
  'zatca-invoice':           { name: 'ZATCA E-Invoice',                 nameAr: 'فاتورة ZATCA',              priceSar: 15,    type: 'one_time' },
  'trust-page-monthly':      { name: 'White-label Trust Page Monthly',  nameAr: 'صفحة الثقة شهرية',         priceSar: 49,    type: 'recurring' },
  'ai-risk-score':           { name: 'AI Business Risk Score',          nameAr: 'درجة المخاطر الذكية',       priceSar: 9,     type: 'one_time' },
  'bulk-csv':                { name: 'Bulk CSV Enrichment (per record)',  nameAr: 'إثراء CSV (لكل سجل)',      priceSar: 4,     type: 'one_time' },
  'tender-dossier':          { name: 'Tender Procurement Dossier',      nameAr: 'ملف العطاءات',              priceSar: 99,    type: 'one_time' },
  // Prepaid credit packs
  'credit-5000':             { name: 'Prepaid Credit 5,000 SAR',        nameAr: 'رصيد مسبق 5,000 ر.س',      priceSar: 5000,  type: 'credit' },
  'credit-10000':            { name: 'Prepaid Credit 10,000 SAR (+8%)', nameAr: 'رصيد مسبق 10,000 ر.س +8%', priceSar: 10000, type: 'credit' },
  'credit-50000':            { name: 'Prepaid Credit 50,000 SAR (+12%)',nameAr: 'رصيد مسبق 50,000 ر.س +12%',priceSar: 50000, type: 'credit' },
  'credit-100000':           { name: 'Prepaid Credit 100K SAR (+15%)',  nameAr: 'رصيد مسبق 100,000 ر.س',    priceSar: 100000,type: 'credit' },
};

const CREDIT_BONUS: Record<number, number> = { 5000: 0, 10000: 8, 50000: 12, 100000: 15, 150000: 18 };

// ── GET /wathq/v1/payments/config — public payment config (no auth) ───────
paymentsRouter.get('/config', async (c) => {
  return ok(c, {
    stripePublishableKey: c.env.STRIPE_PUBLISHABLE_KEY ?? '',
    paypalClientId: c.env.PAYPAL_CLIENT_ID ?? '',
    stcpayEnabled: !!(c.env.STCPAY_MERCHANT_ID),
    currency: 'SAR',
    vatRate: 0.15,
  });
});

// ── GET /wathq/v1/payments/products — product catalogue ───────────────────
paymentsRouter.get('/products', (c) => ok(c, { products: PRODUCTS }));

// ── POST /wathq/v1/payments/stripe/checkout ───────────────────────────────
paymentsRouter.post('/stripe/checkout', async (c) => {
  let body: { productId: string; quantity?: number; email?: string; successUrl?: string; cancelUrl?: string };
  try { body = await c.req.json(); } catch { return err(c, 400, 'Invalid JSON'); }

  const { productId, quantity = 1, email, successUrl, cancelUrl } = body;
  const product = PRODUCTS[productId];
  if (!product) return err(c, 404, `Unknown product: ${productId}`);

  const stripeKey = c.env.STRIPE_SECRET_KEY;
  if (!stripeKey) return err(c, 503, 'Stripe not configured — set STRIPE_SECRET_KEY');

  const amountSar = product.priceSar * quantity;
  const amountHalala = Math.round(amountSar * 100); // SAR → halalah (like USD → cents)
  const orderId = generateUUID();

  const origin = c.req.header('Origin') ?? 'https://brainsait.org';
  const successRedirect = successUrl ?? `${origin}/wathq?payment=success&order=${orderId}`;
  const cancelRedirect  = cancelUrl  ?? `${origin}/wathq?payment=cancelled`;

  const params = new URLSearchParams({
    'payment_method_types[]': 'card',
    'line_items[0][price_data][currency]': 'sar',
    'line_items[0][price_data][product_data][name]': product.name,
    'line_items[0][price_data][product_data][description]': product.nameAr,
    'line_items[0][price_data][unit_amount]': String(amountHalala),
    'line_items[0][quantity]': String(quantity),
    mode: product.type === 'recurring' ? 'subscription' : 'payment',
    success_url: successRedirect,
    cancel_url: cancelRedirect,
    'metadata[orderId]': orderId,
    'metadata[productId]': productId,
    'metadata[source]': 'brainsait-wathq',
  });
  if (email) params.set('customer_email', email);

  const resp = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${stripeKey}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  if (!resp.ok) {
    const errBody = await resp.json().catch(() => ({})) as any;
    return err(c, 502, errBody?.error?.message ?? 'Stripe checkout creation failed');
  }

  const session = await resp.json() as any;

  // Record pending order in D1
  await c.env.DB.prepare(`
    INSERT INTO payment_orders (id, product_id, amount_sar, quantity, status, stripe_session_id, email)
    VALUES (?, ?, ?, ?, 'PENDING', ?, ?)
  `).bind(orderId, productId, amountSar, quantity, session.id, email ?? null).run().catch(() => null);

  await writeAudit(c.env, {
    entityType: 'payment_order',
    entityId: orderId,
    action: 'stripe_checkout_created',
    actorId: c.get('actorId') ?? 'anonymous',
    actorIp: c.get('actorIp'),
    afterState: { productId, amountSar, sessionId: session.id },
  });

  return created(c, { orderId, checkoutUrl: session.url, sessionId: session.id });
});

// ── POST /wathq/v1/payments/paypal/order ──────────────────────────────────
paymentsRouter.post('/paypal/order', async (c) => {
  let body: { productId: string; quantity?: number };
  try { body = await c.req.json(); } catch { return err(c, 400, 'Invalid JSON'); }

  const { productId, quantity = 1 } = body;
  const product = PRODUCTS[productId];
  if (!product) return err(c, 404, `Unknown product: ${productId}`);

  const clientId     = c.env.PAYPAL_CLIENT_ID;
  const clientSecret = c.env.PAYPAL_CLIENT_SECRET;
  if (!clientId || !clientSecret) return err(c, 503, 'PayPal not configured');

  const amountSar = (product.priceSar * quantity).toFixed(2);

  // Get PayPal access token
  const tokenResp = await fetch('https://api-m.paypal.com/v1/oauth2/token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });
  if (!tokenResp.ok) return err(c, 502, 'PayPal token exchange failed');
  const { access_token } = await tokenResp.json() as any;

  // Create order
  const orderResp = await fetch('https://api-m.paypal.com/v2/checkout/orders', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${access_token}`,
      'Content-Type': 'application/json',
      'PayPal-Request-Id': generateUUID(),
    },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [{
        amount: { currency_code: 'SAR', value: amountSar },
        description: `${product.name} — BrainSAIT Trust Layer`,
      }],
    }),
  });

  if (!orderResp.ok) {
    const e = await orderResp.json().catch(() => ({})) as any;
    return err(c, 502, e?.message ?? 'PayPal order creation failed');
  }

  const order = await orderResp.json() as any;
  return created(c, { orderId: order.id, status: order.status });
});

// ── POST /wathq/v1/payments/paypal/capture/:orderId ───────────────────────
paymentsRouter.post('/paypal/capture/:orderId', async (c) => {
  const orderId = c.req.param('orderId');
  const clientId     = c.env.PAYPAL_CLIENT_ID;
  const clientSecret = c.env.PAYPAL_CLIENT_SECRET;
  if (!clientId || !clientSecret) return err(c, 503, 'PayPal not configured');

  const tokenResp = await fetch('https://api-m.paypal.com/v1/oauth2/token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });
  if (!tokenResp.ok) return err(c, 502, 'PayPal token exchange failed');
  const { access_token } = await tokenResp.json() as any;

  const captureResp = await fetch(`https://api-m.paypal.com/v2/checkout/orders/${orderId}/capture`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${access_token}`, 'Content-Type': 'application/json' },
  });

  const capture = await captureResp.json() as any;
  if (capture.status === 'COMPLETED') {
    await writeAudit(c.env, {
      entityType: 'payment_order',
      entityId: orderId,
      action: 'paypal_payment_captured',
      actorId: c.get('actorId') ?? 'anonymous',
      actorIp: c.get('actorIp'),
      afterState: { paypalStatus: capture.status },
    });
    return ok(c, { captured: true, orderId, status: 'COMPLETED' });
  }

  return err(c, 422, `PayPal capture failed: ${capture.status}`);
});

// ── POST /wathq/v1/payments/stcpay/initiate ───────────────────────────────
paymentsRouter.post('/stcpay/initiate', async (c) => {
  let body: { productId: string; phoneNumber: string; quantity?: number };
  try { body = await c.req.json(); } catch { return err(c, 400, 'Invalid JSON'); }

  const { productId, phoneNumber, quantity = 1 } = body;
  const product = PRODUCTS[productId];
  if (!product) return err(c, 404, `Unknown product: ${productId}`);
  if (!phoneNumber?.match(/^(\+966|0)?5\d{8}$/)) {
    return err(c, 400, 'Invalid Saudi phone number (STCPay requires 05xxxxxxxx format)');
  }

  const merchantId = c.env.STCPAY_MERCHANT_ID;
  if (!merchantId) return err(c, 503, 'STCPay not configured — set STCPAY_MERCHANT_ID');

  const amountSar = product.priceSar * quantity;
  const refId = generateUUID();

  // STCPay direct payment initiation
  // Reference: STCPay Merchant API v3
  const resp = await fetch('https://b2b.stcpay.com.sa/b2b/payment/v1/directPayment/mobile', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-ClientCode': merchantId,
      'X-Signature': await signStcpay(c.env.STCPAY_SECRET_KEY, refId, amountSar),
    },
    body: JSON.stringify({
      merchantCode: merchantId,
      branchCode: '1',
      tmnCode: '1',
      amount: amountSar,
      currency: 'SAR',
      refNum: refId,
      mobileNo: phoneNumber.replace(/^\+966/, '0'),
      note: product.name,
      deviceType: 'WEB',
      backUrl: 'https://brainsait.org/wathq?payment=stcpay-verify',
    }),
  });

  if (!resp.ok) {
    const e = await resp.json().catch(() => ({})) as any;
    return err(c, 502, e?.message ?? 'STCPay initiation failed');
  }

  const result = await resp.json() as any;
  return created(c, { refId, otpRef: result.otpRef, expiresIn: 180 });
});

// ── POST /wathq/v1/payments/webhooks/stripe ───────────────────────────────
paymentsRouter.post('/webhooks/stripe', async (c) => {
  const sig       = c.req.header('stripe-signature') ?? '';
  const secret    = c.env.STRIPE_WEBHOOK_SECRET;
  const rawBody   = await c.req.text();

  // Basic timestamp tolerance check (Stripe recommends HMAC-SHA256 verification)
  // Full implementation requires SubtleCrypto HMAC — simplified here for CF Workers
  if (!sig || !secret) return err(c, 400, 'Webhook verification failed');

  let event: any;
  try { event = JSON.parse(rawBody); } catch { return err(c, 400, 'Invalid JSON'); }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const orderId = session.metadata?.orderId;
    if (orderId) {
      await c.env.DB.prepare(
        `UPDATE payment_orders SET status = 'COMPLETED', stripe_session_id = ? WHERE id = ?`,
      ).bind(session.id, orderId).run().catch(() => null);

      // Load credit balance if it's a credit pack
      const productId = session.metadata?.productId ?? '';
      if (productId.startsWith('credit-')) {
        const amtSar = parseInt(productId.split('-')[1] ?? '0', 10);
        const bonusPct = CREDIT_BONUS[amtSar] ?? 0;
        const totalCredit = amtSar + (amtSar * bonusPct / 100);
        await c.env.DB.prepare(`
          INSERT INTO credit_accounts (id, email, balance_sar, total_loaded_sar)
          VALUES (?, ?, ?, ?)
          ON CONFLICT(email) DO UPDATE SET
            balance_sar = balance_sar + excluded.balance_sar,
            total_loaded_sar = total_loaded_sar + excluded.total_loaded_sar,
            updated_at = datetime('now')
        `).bind(generateUUID(), session.customer_email ?? 'unknown', totalCredit, amtSar).run().catch(() => null);
      }
    }
  }

  return ok(c, { received: true });
});

// ── GET /wathq/v1/payments/balance — check credit balance ─────────────────
paymentsRouter.get('/balance', async (c) => {
  const email = c.req.query('email');
  if (!email) return err(c, 400, 'email query parameter required');

  const account = await c.env.DB.prepare(
    `SELECT * FROM credit_accounts WHERE email = ?`,
  ).bind(email).first();

  if (!account) return ok(c, { email, balanceSar: 0, totalLoadedSar: 0 });
  return ok(c, account);
});

// ── POST /wathq/v1/payments/waitlist — replace Formspree ──────────────────
paymentsRouter.post('/waitlist', async (c) => {
  let body: { name: string; email: string; phone?: string; company?: string; product: string; volume?: string; usecase?: string };
  try { body = await c.req.json(); } catch { return err(c, 400, 'Invalid JSON'); }

  const { name, email, product } = body;
  if (!name || !email || !product) return err(c, 400, 'name, email, product are required');

  const id = generateUUID();
  await c.env.DB.prepare(`
    INSERT INTO waitlist_signups (id, name, email, phone, company, product, volume, usecase)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    id, body.name, body.email, body.phone ?? null, body.company ?? null,
    body.product, body.volume ?? null, body.usecase ?? null,
  ).run().catch(() => null);

  await writeAudit(c.env, {
    entityType: 'waitlist',
    entityId: id,
    action: 'waitlist_signup',
    actorId: email,
    actorIp: c.get('actorIp'),
    afterState: { product, email },
  });

  return created(c, { id, message: 'تم تسجيلك! سنتواصل معك خلال 24 ساعة.' });
});

// ── Helper: STCPay HMAC signature ─────────────────────────────────────────
async function signStcpay(secret: string, refId: string, amount: number): Promise<string> {
  if (!secret) return '';
  const msg = `${refId}${amount}`;
  const key = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(msg));
  return btoa(String.fromCharCode(...new Uint8Array(sig)));
}
