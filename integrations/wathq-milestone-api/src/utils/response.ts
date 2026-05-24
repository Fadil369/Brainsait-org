import { Context } from 'hono';

export function ok(c: Context, data: unknown, status = 200): Response {
  return c.json({ success: true, data }, status as 200);
}

export function created(c: Context, data: unknown): Response {
  return c.json({ success: true, data }, 201);
}

export function err(c: Context, status: number, message: string, code?: string): Response {
  return c.json(
    { success: false, error: { message, ...(code ? { code } : {}) } },
    status as 400,
  );
}
