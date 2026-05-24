import { Hono } from 'hono';
import { Env } from '../types';
import { queryEtimadContract } from '../services/etimad-oauth';
import { generateUUID } from '../utils/uuid';
import { writeAudit } from '../utils/audit';
import { ok, err } from '../utils/response';
import { ETIMAD_ID_TYPE } from '../constants';

export const vendorsRouter = new Hono<{ Bindings: Env }>();

/**
 * GET /wathq/v1/vendors/:crId/debts
 * Returns active debt registry entries for a vendor by Commercial Registry ID.
 */
vendorsRouter.get('/:crId/debts', async (c) => {
  const crId = c.req.param('crId');
  const { status } = c.req.query();

  let query = 'SELECT * FROM debt_registry WHERE vendor_id = (SELECT id FROM vendor_profiles WHERE cr_number = ?)';
  const binds: string[] = [crId];

  if (status) { query += ' AND status = ?'; binds.push(status); }
  query += ' ORDER BY amount_sar DESC';

  const result = await c.env.DB.prepare(query).bind(...binds).all();
  return ok(c, { crId, debts: result.results, count: result.results?.length ?? 0 });
});

/**
 * GET /wathq/v1/vendors/:crId/profile
 */
vendorsRouter.get('/:crId/profile', async (c) => {
  const crId = c.req.param('crId');
  const vendor = await c.env.DB.prepare(
    `SELECT * FROM vendor_profiles WHERE cr_number = ?`,
  ).bind(crId).first();

  if (!vendor) return err(c, 404, 'Vendor not found');
  return ok(c, vendor);
});

/**
 * POST /wathq/v1/vendors/:crId/sync-etimad
 * FR-04: Sync vendor's contracts from Etimad platform.
 */
vendorsRouter.post('/:crId/sync-etimad', async (c) => {
  const crId = c.req.param('crId');
  let body: { contractNumber?: string; idType?: string };
  try {
    body = await c.req.json().catch(() => ({}));
  } catch {
    body = {};
  }

  const idType = body.idType ?? ETIMAD_ID_TYPE.COMMERCIAL_REGISTRY;
  const contractNumber = body.contractNumber ?? crId;

  let etimadData: any = null;
  let syncError: string | null = null;

  try {
    etimadData = await queryEtimadContract(c.env, contractNumber, idType);
  } catch (e) {
    syncError = String(e);
  }

  if (syncError || !etimadData) {
    return ok(c, {
      crId,
      synced: false,
      error: syncError ?? 'No data returned from Etimad',
    });
  }

  // Upsert vendor profile from Etimad response
  const vendorId = generateUUID();
  await c.env.DB.prepare(`
    INSERT INTO vendor_profiles (id, cr_number, name_ar, name_en, etimad_vendor_id)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(cr_number) DO UPDATE SET
      name_ar = excluded.name_ar,
      name_en = excluded.name_en,
      etimad_vendor_id = excluded.etimad_vendor_id,
      updated_at = datetime('now')
  `).bind(
    vendorId, crId,
    etimadData.vendorNameAr ?? '',
    etimadData.vendorNameEn ?? '',
    etimadData.vendorId ?? crId,
  ).run();

  await writeAudit(c.env, {
    entityType: 'vendor_profile',
    entityId: crId,
    action: 'vendor_etimad_sync',
    actorId: c.get('actorId') ?? 'system',
    actorIp: c.get('actorIp'),
    afterState: { crId, synced: true },
    meta: { contractNumber, idType },
  });

  return ok(c, { crId, synced: true, etimadData });
});

/**
 * POST /wathq/v1/vendors
 * Register a new vendor profile.
 */
vendorsRouter.post('/', async (c) => {
  let body: {
    crNumber: string; nameAr: string; nameEn?: string;
    vatNumber?: string; etimadVendorId?: string;
  };
  try {
    body = await c.req.json();
  } catch {
    return err(c, 400, 'Invalid JSON body');
  }

  const { crNumber, nameAr, vatNumber, etimadVendorId } = body;
  if (!crNumber || !nameAr) return err(c, 400, 'crNumber and nameAr are required');

  const existing = await c.env.DB.prepare(
    `SELECT id FROM vendor_profiles WHERE cr_number = ?`,
  ).bind(crNumber).first();

  if (existing) return err(c, 409, `Vendor with CR ${crNumber} already registered`);

  const id = generateUUID();
  await c.env.DB.prepare(`
    INSERT INTO vendor_profiles (id, cr_number, name_ar, name_en, vat_number, etimad_vendor_id)
    VALUES (?, ?, ?, ?, ?, ?)
  `).bind(id, crNumber, nameAr, body.nameEn ?? '', vatNumber ?? null, etimadVendorId ?? null).run();

  await writeAudit(c.env, {
    entityType: 'vendor_profile',
    entityId: id,
    action: 'vendor_registered',
    actorId: c.get('actorId') ?? 'system',
    actorIp: c.get('actorIp'),
    afterState: { crNumber, nameAr },
  });

  return ok(c, { vendorId: id, crNumber }, 201);
});
