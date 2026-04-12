/**
 * R2 Audit Logger — HIPAA-compliant interaction audit trail
 */

import type { R2Bucket } from '@cloudflare/workers-types';

interface AuditEntry {
  requestId: string;
  sessionId: string;
  model: string;
  modelUsed: string;
  provider: string;
  messageCount: number;
  latencyMs: number;
  ragSources: string[];
  timestamp: string;
}

export async function auditLog(bucket: R2Bucket, entry: AuditEntry): Promise<void> {
  try {
    const date = new Date(entry.timestamp);
    const key = `audit/${date.getUTCFullYear()}/${String(date.getUTCMonth() + 1).padStart(2, '0')}/${String(date.getUTCDate()).padStart(2, '0')}/${entry.requestId}.json`;

    await bucket.put(key, JSON.stringify(entry), {
      httpMetadata: { contentType: 'application/json' },
      customMetadata: {
        model: entry.model,
        provider: entry.provider,
        latencyMs: entry.latencyMs.toString(),
      },
    });
  } catch (err) {
    console.error('Audit log failed:', err);
    // Non-fatal — audit failures should not break the main request
  }
}
