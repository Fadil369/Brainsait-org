import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { Env } from './types';
import { requireApiKey, rateLimiter } from './middleware/auth';
import { claimsRouter } from './routes/claims';
import { milestonesRouter } from './routes/milestones';
import { invoicesRouter } from './routes/invoices';
import { bidsRouter } from './routes/bids';
import { guaranteesRouter } from './routes/guarantees';
import { offsetsRouter } from './routes/offsets';
import { vendorsRouter } from './routes/vendors';
import { scanExpiringGuarantees } from './services/escrow';
import { ok } from './utils/response';

const app = new Hono<{ Bindings: Env }>();

// --- Global Middleware ---

app.use('*', cors({
  origin: ['https://brainsait.org', 'https://www.brainsait.org', 'https://*.brainsait-org.pages.dev'],
  allowMethods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-MOF-RqUID'],
  exposeHeaders: ['X-Request-ID'],
  maxAge: 86400,
  credentials: true,
}));

app.use('/wathq/v1/*', rateLimiter);
app.use('/wathq/v1/*', requireApiKey);

// --- Health & Info ---

app.get('/', (c) => ok(c, {
  service: 'Wathq Milestone Verification API',
  version: '1.0.0',
  description: 'AFESWE — Automated Fintech Escrow and Smart Workflow Ecosystem',
  docs: 'https://brainsait.org/wathq',
  status: 'operational',
}));

app.get('/health', (c) => ok(c, {
  status: 'healthy',
  timestamp: new Date().toISOString(),
  region: (c.req.raw as any).cf?.colo ?? 'unknown',
}));

// --- API Routes ---

app.route('/wathq/v1/claims', claimsRouter);
app.route('/wathq/v1/milestones', milestonesRouter);
app.route('/wathq/v1/invoices', invoicesRouter);
app.route('/wathq/v1/bids', bidsRouter);
app.route('/wathq/v1/guarantees', guaranteesRouter);
app.route('/wathq/v1/offsets', offsetsRouter);
app.route('/wathq/v1/vendors', vendorsRouter);

// --- Scheduled Tasks (Cloudflare Cron Triggers) ---

export default {
  fetch: app.fetch,

  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    ctx.waitUntil(runScheduledTasks(event, env));
  },
};

async function runScheduledTasks(event: ScheduledEvent, env: Env): Promise<void> {
  const cron = event.cron;

  // Every 6 hours: scan for guarantees approaching expiry
  if (cron === '0 */6 * * *') {
    const expiringIds = await scanExpiringGuarantees(env);
    if (expiringIds.length > 0) {
      // Queue renewal alerts via WATHQ_QUEUE
      for (const id of expiringIds) {
        await env.WATHQ_QUEUE.send({ type: 'guarantee_renewal_alert', guaranteeId: id });
      }
    }
  }

  // Daily: expire stale Etimad OAuth tokens from KV
  if (cron === '0 0 * * *') {
    // KV TTLs handle expiry automatically — this is a no-op placeholder
    // for future token revocation logic
  }
}
