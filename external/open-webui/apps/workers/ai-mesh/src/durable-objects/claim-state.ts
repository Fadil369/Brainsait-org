/**
 * ClaimStateMachine Durable Object
 *
 * Per-claim persistent state machine for NPHIES processing workflow.
 * Tracks: submitted → validating → pending_nphies → approved/denied/appealing
 */

import type { Env } from '../index';

type ClaimStatus =
  | 'init'
  | 'validating'
  | 'pending_nphies'
  | 'submitted_nphies'
  | 'processing'
  | 'approved'
  | 'denied'
  | 'appealing'
  | 'paid'
  | 'error';

interface ClaimRecord {
  claimId: string;
  claim: Record<string, unknown>;
  status: ClaimStatus;
  nphiesTransactionId?: string;
  approvedAmount?: number;
  denialReason?: string;
  appealDeadline?: string;
  timeline: { status: ClaimStatus; timestamp: number; note?: string }[];
  createdAt: number;
  updatedAt: number;
}

export class ClaimStateMachine {
  state: DurableObjectState;
  env: Env;
  private record: ClaimRecord | null = null;

  constructor(state: DurableObjectState, env: Env) {
    this.state = state;
    this.env = env;
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    if (path === '/status') return this.getStatus();
    if (path === '/init' && request.method === 'POST') return this.init(request);
    if (path === '/processing' && request.method === 'POST') return this.transition('processing', request);
    if (path === '/submitted' && request.method === 'POST') return this.transition('submitted_nphies', request);
    if (path === '/approved' && request.method === 'POST') return this.transition('approved', request);
    if (path === '/denied' && request.method === 'POST') return this.transition('denied', request);
    if (path === '/appeal' && request.method === 'POST') return this.transition('appealing', request);
    if (path === '/paid' && request.method === 'POST') return this.transition('paid', request);
    if (path === '/timeline') return this.getTimeline();

    return new Response('Not found', { status: 404 });
  }

  private async load(): Promise<ClaimRecord | null> {
    if (this.record) return this.record;
    this.record = await this.state.storage.get<ClaimRecord>('claim') ?? null;
    return this.record;
  }

  private async save(): Promise<void> {
    if (!this.record) return;
    this.record.updatedAt = Date.now();
    await this.state.storage.put('claim', this.record);
  }

  private async init(request: Request): Promise<Response> {
    const { claimId, claim } = await request.json<{ claimId: string; claim: Record<string, unknown> }>();
    this.record = {
      claimId,
      claim,
      status: 'init',
      timeline: [{ status: 'init', timestamp: Date.now(), note: 'Claim received' }],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await this.save();
    return Response.json({ claimId, status: 'init' });
  }

  private async transition(newStatus: ClaimStatus, request: Request): Promise<Response> {
    const record = await this.load();
    if (!record) return new Response('Claim not found', { status: 404 });

    const body = await request.json<{ note?: string; nphiesId?: string; amount?: number; reason?: string }>().catch(() => ({}));
    record.status = newStatus;
    record.timeline.push({ status: newStatus, timestamp: Date.now(), note: body.note });
    if (body.nphiesId) record.nphiesTransactionId = body.nphiesId;
    if (body.amount) record.approvedAmount = body.amount;
    if (body.reason) record.denialReason = body.reason;
    if (newStatus === 'denied') {
      // 35-day appeal window (Saudi NPHIES rule)
      const deadline = new Date(Date.now() + 35 * 24 * 60 * 60 * 1000);
      record.appealDeadline = deadline.toISOString();
    }
    await this.save();
    return Response.json({ claimId: record.claimId, status: newStatus });
  }

  private async getStatus(): Promise<Response> {
    const record = await this.load();
    if (!record) return Response.json({ status: 'not_found' }, { status: 404 });
    return Response.json({
      claimId: record.claimId,
      status: record.status,
      approvedAmount: record.approvedAmount,
      denialReason: record.denialReason,
      appealDeadline: record.appealDeadline,
      nphiesTransactionId: record.nphiesTransactionId,
      updatedAt: new Date(record.updatedAt).toISOString(),
    });
  }

  private async getTimeline(): Promise<Response> {
    const record = await this.load();
    if (!record) return Response.json({ error: 'not_found' }, { status: 404 });
    return Response.json({ claimId: record.claimId, timeline: record.timeline });
  }
}
