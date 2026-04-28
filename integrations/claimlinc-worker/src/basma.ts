/**
 * Basma Voice Integration — Cloudflare Worker Extension
 * BrainSAIT / LINC Agent #12
 * 
 * Handles voice assistant queries for patient-facing flows:
 *   POST /basma/eligibility   → Check patient insurance eligibility
 *   POST /basma/pa/status     → Check prior auth status
 *   POST /basma/network/kpis  → Executive KPI summary (Arabic + English)
 *   POST /basma/claim/status  → Claim status query
 *   GET  /basma/health        → Health check
 * 
 * Designed for VAPI, ElevenLabs, or any TTS/STT platform webhook.
 * Returns structured JSON + pre-formatted Arabic/English speech text.
 */

import { FACILITIES, getToken, nphiesGet } from "./nphies";

export interface Env {
  NPHIES_USERNAME: string;
  NPHIES_PASSWORD: string;
  NPHIES_TOKEN_URL: string;
  NPHIES_VIEWER_API: string;
  NPHIES_CLIENT_ID: string;
  API_SECRET_KEY: string;
  BASMA_WEBHOOK_SECRET?: string;
}

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Authorization, X-API-Key, Content-Type",
  "Content-Type": "application/json",
};

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data, null, 2), { status, headers: CORS });
}

// ─── Speech Formatters ────────────────────────────────────────────────────

function formatEligibilityResponse(data: any, lang: "ar" | "en" = "ar") {
  const total = data?.TotalItems ?? 0;
  const items = data?.Items ?? [];
  const latest = items[0];

  if (lang === "ar") {
    if (total === 0) {
      return "عذراً، لم يتم العثور على سجل أهلية للمريض في هذا المستشفى.";
    }
    return `تم العثور على ${total} سجل أهلية. آخر طلب: ${latest?.MainResourceIdentifier ?? "غير معروف"}.`;
  } else {
    if (total === 0) {
      return "Sorry, no eligibility record was found for this patient at this facility.";
    }
    return `Found ${total} eligibility record(s). Latest request ID: ${latest?.MainResourceIdentifier ?? "unknown"}.`;
  }
}

function formatPaResponse(data: any, lang: "ar" | "en" = "ar") {
  const total = data?.TotalItems ?? 0;
  const items = data?.Items ?? [];
  const latest = items[0];

  if (lang === "ar") {
    if (total === 0) {
      return "لا توجد طلبات موافقة مسبقة لهذه المنشأة.";
    }
    const outcome = latest?.ResponseOutcome ?? "قيد المعالجة";
    const payer = latest?.ReceiverName ?? "شركة التأمين";
    return `آخر طلب موافقة مسبقة: رقم ${latest?.MainResourceIdentifier ?? "غير معروف"} — النتيجة: ${outcome} — شركة التأمين: ${payer}.`;
  } else {
    if (total === 0) {
      return "No prior authorization requests found for this facility.";
    }
    const outcome = latest?.ResponseOutcome ?? "In progress";
    const payer = latest?.ReceiverName ?? "Insurance company";
    return `Latest PA request: ${latest?.MainResourceIdentifier ?? "unknown"} — Outcome: ${outcome} — Payer: ${payer}.`;
  }
}

function formatNetworkKPIs(lang: "ar" | "en" = "ar") {
  const totalSar = (835690702.81 / 1e6).toFixed(1);
  const rate = "98.6";
  const pa = "51,018";
  const coc = "564";

  if (lang === "ar") {
    return `ملخص شبكة مستشفيات الحياة الوطنية:
إجمالي المطالبات المُسوّاة: ${totalSar} مليون ريال سعودي.
نسبة قبول المطالبات: ${rate}%.
إجمالي طلبات الموافقة المسبقة: ${pa} طلب.
شهادات المطابقة: ${coc} شهادة.
مستشفى الرياض يحتاج مراجعة: نسبة القبول 88.5%.`;
  } else {
    return `Hayat National Hospital Group Network Summary:
Total settled GSS value: SAR ${totalSar} million.
Overall claim approval rate: ${rate}%.
Total prior authorizations: ${pa} requests.
Certificates of Conformance: ${coc} active.
Riyadh branch flagged: 88.5% approval rate, investigation needed.`;
  }
}

function formatClaimStatus(data: any, lang: "ar" | "en" = "ar") {
  const total = data?.TotalItems ?? 0;
  const items = data?.Items ?? [];
  const latest = items[0];

  if (lang === "ar") {
    if (total === 0) return "لم يتم العثور على مطالبات لهذه المنشأة.";
    return `تم العثور على ${total} مطالبة. آخر مطالبة: ${latest?.MainResourceIdentifier ?? "غير معروف"} — الجهة: ${latest?.ReceiverName ?? "غير محددة"}.`;
  } else {
    if (total === 0) return "No claims found for this facility.";
    return `Found ${total} claim(s). Latest: ${latest?.MainResourceIdentifier ?? "unknown"} — Receiver: ${latest?.ReceiverName ?? "N/A"}.`;
  }
}

// ─── Route Handlers ───────────────────────────────────────────────────────

async function handleEligibility(req: Request, env: Env): Promise<Response> {
  const body = await req.json() as {
    branch: string;
    identifier?: string;
    lang?: "ar" | "en";
    page?: number;
    size?: number;
  };

  const { branch = "riyadh", identifier, lang = "ar", page = 0, size = 5 } = body;
  if (!FACILITIES[branch]) {
    return json({ error: `Unknown branch: ${branch}` }, 400);
  }

  const params: Record<string, string> = {
    page: String(page),
    size: String(size),
  };
  if (identifier) params.identifier = identifier;

  const r = await nphiesGet(env, "coverage-eligibility-request", branch, params);
  const data = await r.json();

  const speech = formatEligibilityResponse(data, lang);

  return json({
    branch,
    facility: FACILITIES[branch].name,
    data,
    speech,                    // TTS-ready text for Basma
    lang,
    query: { identifier },
  });
}

async function handlePaStatus(req: Request, env: Env): Promise<Response> {
  const body = await req.json() as {
    branch: string;
    lang?: "ar" | "en";
    identifier?: string;
    page?: number;
    size?: number;
  };

  const { branch = "riyadh", lang = "ar", identifier, page = 0, size = 5 } = body;
  if (!FACILITIES[branch]) return json({ error: `Unknown branch: ${branch}` }, 400);

  const params: Record<string, string> = {
    cancel_type: "preauth",
    page: String(page),
    size: String(size),
  };
  if (identifier) params.identifier = identifier;

  const r = await nphiesGet(env, "cancel-request", branch, params);
  const data = await r.json();
  const speech = formatPaResponse(data, lang);

  return json({
    branch,
    facility: FACILITIES[branch].name,
    data,
    speech,
    lang,
  });
}

async function handleNetworkKPIs(req: Request, env: Env): Promise<Response> {
  const body = await req.json() as { lang?: "ar" | "en" };
  const lang = body?.lang ?? "ar";
  const speech = formatNetworkKPIs(lang);

  return json({
    network: {
      total_sar: 835690702.81,
      approval_rate_pct: 98.6,
      total_pa: 51018,
      total_coc: 564,
      branches: ["riyadh", "madinah", "unaizah", "khamis", "jizan", "abha"],
    },
    speech,
    lang,
  });
}

async function handleClaimStatus(req: Request, env: Env): Promise<Response> {
  const body = await req.json() as {
    branch: string;
    lang?: "ar" | "en";
    check_type?: "claim" | "preauth";
    page?: number;
    size?: number;
  };

  const { branch = "riyadh", lang = "ar", check_type = "claim", page = 0, size = 5 } = body;
  if (!FACILITIES[branch]) return json({ error: `Unknown branch: ${branch}` }, 400);

  const r = await nphiesGet(env, "status-check", branch, {
    check_type,
    page: String(page),
    size: String(size),
  });
  const data = await r.json();
  const speech = formatClaimStatus(data, lang);

  return json({ branch, facility: FACILITIES[branch].name, data, speech, lang });
}

// ─── Main Handler (merged into main worker) ───────────────────────────────

export async function handleBasma(request: Request, env: Env): Promise<Response | null> {
  const url = new URL(request.url);
  const path = url.pathname.replace(/^\/basma\/?/, "");

  if (request.method === "GET" && path === "health") {
    return json({
      status: "ok",
      service: "Basma Voice Integration",
      version: "1.0.0",
      capabilities: ["eligibility", "pa/status", "network/kpis", "claim/status"],
      languages: ["ar", "en"],
    });
  }

  if (request.method !== "POST") return null;

  try {
    if (path === "eligibility")  return handleEligibility(request, env);
    if (path === "pa/status")    return handlePaStatus(request, env);
    if (path === "network/kpis") return handleNetworkKPIs(request, env);
    if (path === "claim/status") return handleClaimStatus(request, env);
  } catch (e: any) {
    return json({ error: `Basma error: ${e.message}` }, 500);
  }

  return null;
}
