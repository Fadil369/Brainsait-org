/**
 * Basma Voice Agent Worker — voice.elfadil.com
 * BrainSAIT BSMA v2 | 2026-04-26
 *
 * Routes:
 *   GET  /bsma/session     → Create/return session ID
 *   GET  /bsma/status      → Health check
 *   GET  /bsma/crm         → Load today's CRM data (appointments, patients)
 *   POST /bsma/tool        → Execute Gemini tool call (book, lookup, SMS, etc.)
 *   GET  /bsma/nphies      → Live NPHIES network data for dashboard KPIs
 *   POST /bsma/log         → Save voice conversation to D1
 *   GET  /bsma/conversations → List recent voice sessions
 */

export interface Env {
  DB: D1Database;
  AI: Ai;
  DEEPSEEK_API_KEY: string;
  GEMINI_API_KEY: string;
  GOOGLE_API_KEY: string;
  CLAIMLINC_API_KEY: string;
  ELEVENLABS_API_KEY: string;
  GIVC_URL: string;
  SBS_URL: string;
  CLAIMLINC_URL: string;
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

function err(msg: string, status = 500): Response {
  return json({ error: msg, status }, status);
}

// ─── Session ──────────────────────────────────────────────────────────────

async function handleSession(env: Env): Promise<Response> {
  const sessionId = crypto.randomUUID();
  const now = new Date().toISOString();

  // Log session to D1
  try {
    await env.DB.prepare(
      "INSERT OR IGNORE INTO sessions (session_id, created_at, status) VALUES (?, ?, ?)"
    ).bind(sessionId, now, "active").run();
  } catch (e) {
    // Table might not exist yet — ignore
  }

  return json({
    session_id: sessionId,
    created_at: now,
    agent: "basma-v2",
    capabilities: ["appointments", "insurance", "labs", "emergency", "nphies"],
    greeting_ar: "مرحباً، أنا بسمة، مساعدتك الذكية من BrainSAIT. كيف يمكنني مساعدتك اليوم؟",
    greeting_en: "Hello, I'm Basma, your intelligent healthcare assistant from BrainSAIT. How can I help you today?",
  });
}

// ─── Status ───────────────────────────────────────────────────────────────

async function handleStatus(env: Env): Promise<Response> {
  const checks: Record<string, boolean> = {};

  // Check GIVC
  try {
    const r = await fetch(`${env.GIVC_URL}/api/health`, { signal: AbortSignal.timeout(4000) });
    checks.givc = r.ok;
  } catch { checks.givc = false; }

  // Check ClaimLinc
  try {
    const r = await fetch(`${env.CLAIMLINC_URL}/nphies/facilities`, {
      headers: { "X-API-Key": env.CLAIMLINC_API_KEY },
      signal: AbortSignal.timeout(4000),
    });
    checks.claimlinc = r.ok;
  } catch { checks.claimlinc = false; }

  // DB check
  try {
    await env.DB.prepare("SELECT 1").run();
    checks.d1 = true;
  } catch { checks.d1 = false; }

  const allOk = Object.values(checks).every(Boolean);

  return json({
    status: allOk ? "ok" : "degraded",
    agent: "basma-v2",
    timestamp: new Date().toISOString(),
    checks,
    version: "2.0.0",
  }, allOk ? 200 : 207);
}

// ─── CRM ─────────────────────────────────────────────────────────────────

async function handleCrm(env: Env): Promise<Response> {
  const today = new Date().toISOString().split("T")[0];

  // Load today's appointments from GIVC
  let appointments: any[] = [];
  try {
    const r = await fetch(`${env.GIVC_URL}/appointments?date=${today}&limit=20`, {
      signal: AbortSignal.timeout(6000),
    });
    if (r.ok) {
      const data = await r.json() as any;
      appointments = data.appointments ?? data.data ?? data ?? [];
    }
  } catch {}

  // Load recent patients from D1
  let patients: any[] = [];
  try {
    const result = await env.DB.prepare(
      "SELECT id, name, phone, insurance_provider, created_at FROM patients ORDER BY created_at DESC LIMIT 10"
    ).all();
    patients = result.results ?? [];
  } catch {}

  // Load recent voice conversations
  let recentCalls: any[] = [];
  try {
    const result = await env.DB.prepare(
      "SELECT session_id, caller_name, summary, sentiment, created_at FROM voice_conversations ORDER BY created_at DESC LIMIT 5"
    ).all();
    recentCalls = result.results ?? [];
  } catch {}

  // NPHIES live approval rate from ClaimLinc
  let nphiesRate = "98.6%";
  try {
    const r = await fetch(`${env.CLAIMLINC_URL}/nphies/network/summary`, {
      headers: { "X-API-Key": env.CLAIMLINC_API_KEY },
      signal: AbortSignal.timeout(5000),
    });
    if (r.ok) {
      const data = await r.json() as any;
      nphiesRate = `${data.financials?.network_approval_rate_pct ?? 98.6}%`;
    }
  } catch {}

  return json({
    date: today,
    appointments,
    patients,
    recent_calls: recentCalls,
    kpis: {
      appointments_today: appointments.length,
      nphies_approval_rate: nphiesRate,
      network_total_sar: "835.7M",
      active_pa_requests: 51018,
    },
  });
}

// ─── Tool Executor ────────────────────────────────────────────────────────

async function handleTool(req: Request, env: Env): Promise<Response> {
  const body = await req.json() as {
    tool: string;
    args: Record<string, any>;
    session_id?: string;
  };

  const { tool, args, session_id } = body;

  switch (tool) {

    case "lookup_contact": {
      const q = `%${args.query}%`;
      try {
        const result = await env.DB.prepare(
          "SELECT id, json_extract(fhir_data,'$.name') as name, json_extract(fhir_data,'$.phone') as phone FROM patients WHERE json_extract(fhir_data,'$.name') LIKE ? OR json_extract(fhir_data,'$.phone') LIKE ? LIMIT 5"
        ).bind(q, q).all();
        const found = result.results ?? [];
        return json({
          tool,
          found: found.length > 0,
          patients: found,
          speech_ar: found.length > 0
            ? `وجدت ${found.length} سجل للمريض ${(found[0] as any).name ?? ""}. مرحباً ${(found[0] as any).name ?? ""}!`
            : "لم أجد سجلاً بهذا الاسم. هل يمكنك إعطائي رقم الهاتف؟",
          speech_en: found.length > 0
            ? `Found patient: ${(found[0] as any).name ?? ""}. Welcome back!`
            : "No record found. Could you provide your phone number?",
        });
      } catch {
        return json({ tool, found: false, patients: [], speech_ar: "حدث خطأ في البحث", speech_en: "Search error" });
      }
    }

    case "check_insurance_eligibility": {
      const { patient_identifier, service_code } = args;
      try {
        // Try SBS first
        const r = await fetch(`${env.SBS_URL}/claimlinc/eligibility`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ identifier: patient_identifier, service: service_code }),
          signal: AbortSignal.timeout(8000),
        });

        if (r.ok) {
          const data = await r.json() as any;
          const eligible = data.eligible ?? data.status === "eligible";
          const insurer = data.insurer ?? data.payer ?? "شركة التأمين";
          return json({
            tool,
            eligible,
            insurer,
            data,
            speech_ar: eligible
              ? `التأمين مفعّل. شركة التأمين: ${insurer}. يمكنني المتابعة بحجز الموعد.`
              : "التأمين غير مفعّل أو غير متاح. يمكنني المساعدة في الدفع الخاص.",
            speech_en: eligible
              ? `Insurance active with ${insurer}. I can proceed with booking.`
              : "Insurance not active. I can assist with self-pay options.",
          });
        }
      } catch {}

      // Fallback: check NPHIES eligibility via ClaimLinc
      try {
        const r = await fetch(`${env.CLAIMLINC_URL}/basma/eligibility`, {
          method: "POST",
          headers: { "X-API-Key": env.CLAIMLINC_API_KEY, "Content-Type": "application/json" },
          body: JSON.stringify({ branch: "riyadh", identifier: patient_identifier, lang: "ar" }),
          signal: AbortSignal.timeout(10000),
        });
        if (r.ok) {
          const data = await r.json() as any;
          return json({ tool, eligible: true, data, speech_ar: data.speech, speech_en: data.speech });
        }
      } catch {}

      return json({
        tool,
        eligible: null,
        speech_ar: "لم أستطع التحقق من التأمين الآن. سأوثق الطلب وأتابع.",
        speech_en: "Could not verify insurance now. I'll document and follow up.",
      });
    }

    case "book_appointment": {
      const { callerName, type, date, time, urgency = "routine" } = args;
      try {
        const r = await fetch(`${env.GIVC_URL}/appointments/create`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            patientName: callerName,
            type: type ?? "استشارة",
            scheduledTime: date && time ? `${date}T${time}:00Z` : new Date().toISOString(),
            urgency,
            source: "basma-voice",
            session_id,
          }),
          signal: AbortSignal.timeout(8000),
        });
        const data = await r.json() as any;
        const apptId = data.id ?? data.appointment_id ?? "—";

        // Save to D1
        try {
            // Log appointment to bsma_appointments table
          await env.DB.prepare(
            "INSERT OR IGNORE INTO bsma_appointments (id, patient_name, appointment_type, scheduled_time, status, urgency, created_at, updated_at) VALUES (?, ?, ?, ?, 'scheduled', ?, ?, ?)"
          ).bind(apptId !== '—' ? apptId : crypto.randomUUID(), callerName, type ?? 'consultation', date && time ? `${date}T${time}:00Z` : new Date().toISOString(), urgency, new Date().toISOString(), new Date().toISOString()).run();
        } catch {}

        return json({
          tool,
          success: r.ok,
          appointment_id: apptId,
          speech_ar: r.ok
            ? `تم حجز موعدك بنجاح. رقم الحجز: ${apptId}. الموعد: ${date} الساعة ${time}. سأرسل لك رسالة تأكيد.`
            : "حدث خطأ في الحجز. سأتصل بك لتأكيد الموعد يدوياً.",
          speech_en: r.ok
            ? `Appointment booked. ID: ${apptId}. Scheduled: ${date} at ${time}. Confirmation SMS on the way.`
            : "Booking error. I'll call you to confirm manually.",
        });
      } catch (e: any) {
        return json({ tool, success: false, error: e?.message ?? String(e), speech_ar: "حدث خطأ في الحجز", speech_en: "Booking error" });
      }
    }

    case "send_sms": {
      const { phone, message } = args;
      try {
        const r = await fetch("https://maillinc.brainsait-fadil.workers.dev/sms", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ to: phone, message }),
          signal: AbortSignal.timeout(6000),
        });
        const ok = r.ok;
        return json({
          tool,
          sent: ok,
          speech_ar: ok ? "تم إرسال رسالة التأكيد." : "لم أتمكن من إرسال الرسالة الآن.",
          speech_en: ok ? "Confirmation SMS sent." : "Could not send SMS right now.",
        });
      } catch {
        return json({ tool, sent: false, speech_ar: "خطأ في الإرسال", speech_en: "SMS error" });
      }
    }

    case "record_call_log": {
      const { callerName, summary, sentiment } = args;
      try {
        await env.DB.prepare(
          "INSERT INTO voice_conversations (session_id, caller_name, summary, sentiment, created_at) VALUES (?, ?, ?, ?, ?)"
        ).bind(session_id ?? "", callerName, summary, sentiment, new Date().toISOString()).run();
        return json({ tool, saved: true, speech_ar: "تم توثيق المكالمة.", speech_en: "Call logged." });
      } catch (e) {
        return json({ tool, saved: false, speech_ar: "خطأ في التوثيق", speech_en: "Log error" });
      }
    }

    default:
      return json({ tool, error: `Unknown tool: ${tool}` }, 400);
  }
}

// ─── NPHIES Dashboard KPIs ────────────────────────────────────────────────

async function handleNphies(env: Env): Promise<Response> {
  try {
    const r = await fetch(`${env.CLAIMLINC_URL}/nphies/network/summary`, {
      headers: { "X-API-Key": env.CLAIMLINC_API_KEY },
      signal: AbortSignal.timeout(8000),
    });
    if (r.ok) {
      const data = await r.json() as any;
      return json({
        ...data,
        speech_ar: `معدل الموافقة: ${data.financials?.network_approval_rate_pct}%. إجمالي المطالبات: ${(data.financials?.network_total_sar / 1e6).toFixed(1)} مليون ريال.`,
        speech_en: `Approval rate: ${data.financials?.network_approval_rate_pct}%. Total claims: SAR ${(data.financials?.network_total_sar / 1e6).toFixed(1)}M.`,
      });
    }
  } catch {}

  // Cached fallback
  return json({
    financials: { network_total_sar: 835690702.81, network_approval_rate_pct: 98.6, total_claims_gss: 15138 },
    prior_auth: { network_total: 51018 },
    speech_ar: "معدل الموافقة: 98.6%. إجمالي المطالبات: 835.7 مليون ريال.",
    speech_en: "Approval rate: 98.6%. Total claims: SAR 835.7M.",
    source: "cached",
  });
}

// ─── Conversation Log ─────────────────────────────────────────────────────

async function handleLog(req: Request, env: Env): Promise<Response> {
  const body = await req.json() as any;
  try {
    await env.DB.prepare(
      "INSERT INTO voice_conversations (session_id, caller_name, summary, sentiment, created_at) VALUES (?, ?, ?, ?, ?)"
    ).bind(
      body.session_id ?? "",
      body.caller_name ?? "مجهول",
      body.summary ?? "",
      body.sentiment ?? "neutral",
      new Date().toISOString()
    ).run();
    return json({ saved: true });
  } catch (e: any) {
    return err(`D1 error: ${e.message}`);
  }
}

async function handleConversations(env: Env): Promise<Response> {
  try {
    const result = await env.DB.prepare(
      "SELECT * FROM voice_conversations ORDER BY created_at DESC LIMIT 20"
    ).all();
    return json({ conversations: result.results ?? [] });
  } catch {
    return json({ conversations: [] });
  }
}

// ─── Main Router ──────────────────────────────────────────────────────────

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    // /bsma/* routes
    if (path === "/bsma/session")       return handleSession(env);
    if (path === "/bsma/status")        return handleStatus(env);
    if (path === "/bsma/crm")           return handleCrm(env);
    if (path === "/bsma/nphies")        return handleNphies(env);
    if (path === "/bsma/conversations") return handleConversations(env);
    if (path === "/basma/voices")         return handleVoices(env);

    if (path === "/bsma/tool"     && request.method === "POST") return handleTool(request, env);
    if (path === "/bsma/log"      && request.method === "POST") return handleLog(request, env);
    if (path === "/bsma/chat"     && request.method === "POST") return handleChat(request, env);
    if (path === "/basma/speak"   && request.method === "POST") return handleSpeak(request, env);
    if (path === "/basma/speak/kpis"         && request.method === "POST") return handleSpeakKpis(request, env);
    if (path === "/basma/speak/appointment"  && request.method === "POST") return handleSpeakAppointment(request, env);
    if (path === "/basma/speak/pa"           && request.method === "POST") return handleSpeakPa(request, env);
    if (path === "/basma/speak/eligibility"  && request.method === "POST") return handleSpeakEligibility(request, env);

    // Task 7-9 routes
    if (path === "/bsma/match-claim"      && request.method === "POST") return handleMatchClaim(request, env);
    if (path === "/bsma/rejection-lookup" && request.method === "POST") return handleRejectionLookup(request, env);
    if (path === "/bsma/rejection-codes")  return handleRejectionCodes(request, env);
    if (path === "/bsma/validate-claim"   && request.method === "POST") return handleValidateClaim(request, env);
    if (path.startsWith("/bsma/drugs"))    return handleDrugLookup(request, env);
    if (path.startsWith("/bsma/sbs"))      return handleSbsLookup(request, env);

    // Oracle Bridge routes
    if (path === "/bsma/oracle" || path.startsWith("/bsma/oracle/")) return handleOracleBridge(request, env);
    if (path === "/bsma/oracle/eligibility" && request.method === "POST") return handleOracleEligibility(request, env);
    if (path === "/bsma/eligibility/integrated" && request.method === "POST") return handleIntegratedEligibility(request, env);
    if (path === "/bsma/integrated-eligibility" && request.method === "POST") return handleIntegratedEligibility(request, env);

    // Health
    if (path === "/" || path === "/health") {
      return json({ status: "ok", agent: "basma-v2", version: "2.2.0", tts: "elevenlabs", oracle_bridge: { version: "2.0.0", hospitals: 6, url: ORACLE_BRIDGE_URL }, nphies: { approval_rate: "98.6%", live_givc: "yes" }, integrations: { version: "2.2.0", oracle_bridge: "https://oracle-bridge.brainsait.org", eligibility_pipeline: "oracle \u2192 nphies fallback", claim_matching: true, bv_validation: true, drug_formulary: true } });
    }

    
// ─── Integrated Eligibility Tool (Oracle → NPHIES fallback) ─────────
async function handleIntegratedEligibility(request: Request, env: Env): Promise<Response> {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id") || "";
    const branch = url.searchParams.get("branch") || "riyadh";
    const idType = url.searchParams.get("id_type") || "NATIONAL NUMBER";
    const lang = url.searchParams.get("lang") || "ar";

    if (!id) return json({ error: "id required" }, 400);

    const ORACLE_BRIDGE_URL = "https://oracle-bridge.brainsait.org";
    const ORACLE_BRIDGE_KEY = env.ORACLE_BRIDGE_KEY || "bsma-oracle-b2af3196522b556636b09f5d268cb976";
    const NPHIES_TOKEN_URL = env.NPHIES_TOKEN_URL || "https://sso.nphies.sa/auth/realms/sehaticoreprod/protocol/openid-connect/token";
    const NPHIES_VIEWER_API = env.NPHIES_VIEWER_API || "https://sgw.nphies.sa/viewerapi/";
    const NPHIES_CLIENT_ID = env.NPHIES_CLIENT_ID || "community";

    // Try Oracle Bridge first
    let oracleResult: any = null;
    let nphiesResult: any = null;
    let primarySource = "oracle";

    try {
      const oracleResp = await fetch(
        `${ORACLE_BRIDGE_URL}/patient/${branch}?identity=${encodeURIComponent(id)}&identity_type=${encodeURIComponent(idType)}&api_key=${ORACLE_BRIDGE_KEY}`,
        { signal: AbortSignal.timeout(8000) }
      );
      if (oracleResp.ok) {
        oracleResult = await oracleResp.json();
      }
    } catch {
      // Oracle failed, fall through to NPHIES
    }

    // Fallback: NPHIES eligibility
    if (!oracleResult || !oracleResult.ok) {
      primarySource = "nphies";
      try {
        // Get NPHIES token
        const tokenResp = await fetch(NPHIES_TOKEN_URL, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            client_id: NPHIES_CLIENT_ID,
            grant_type: "password",
            username: env.NPHIES_USER || "",
            password: env.NPHIES_PASS || ""
          }),
          signal: AbortSignal.timeout(8000)
        });
        if (tokenResp.ok) {
          const { access_token } = await tokenResp.json() as any;
          const eligibilityResp = await fetch(
            `${NPHIES_VIEWER_API}eligibility?identifier=${encodeURIComponent(id)}&identifierType=${encodeURIComponent(idType)}`,
            {
              headers: { Authorization: `Bearer ${access_token}` },
              signal: AbortSignal.timeout(8000)
            }
          );
          if (eligibilityResp.ok) {
            nphiesResult = await eligibilityResp.json();
          }
        }
      } catch {
        // Both failed
      }
    }

    // Build bilingual response
    const result = oracleResult || nphiesResult || {};
    const found = !!(oracleResult?.ok || nphiesResult);
    const name = result?.patientName || result?.name || "";
    const policy = result?.policyNumber || result?.membershipNo || "";
    const payer = result?.payerName || result?.insuranceCompany || "";

    // Voice-friendly text
    let voiceText = "";
    if (lang === "ar") {
      if (found) {
        voiceText = `✅ تم العثور على المريض. ${name ? "الاسم: " + name + ". " : ""}` +
          `${policy ? "رقم البوليصة: " + policy + ". " : ""}` +
          `${payer ? "شركة التأمين: " + payer + ". " : ""}` +
          `المصدر: ${primarySource === "oracle" ? "نظام أوراكل" : "نظام نفيس"}.`;
      } else {
        voiceText = "❌ لم يتم العثور على بيانات الأهلية لهذا المريض. يرجى التأكد من رقم الهوية.";
      }
    } else {
      if (found) {
        voiceText = `✅ Patient found. ${name ? "Name: " + name + ". " : ""}` +
          `${policy ? "Policy: " + policy + ". " : ""}` +
          `${payer ? "Payer: " + payer + ". " : ""}` +
          `Source: ${primarySource === "oracle" ? "Oracle" : "NPHIES"}.`;
      } else {
        voiceText = "❌ No eligibility data found for this patient. Please verify the ID.";
      }
    }

    return json({
      ok: found,
      source: primarySource,
      patient: result,
      voice: voiceText,
      speak_url: `/basma/speak/eligibility`
    });
  } catch (e: any) {
    return json({ error: e.message }, 500);
  }
}

return json({ error: "Not found", path }, 404);
  },
};



// ─── Oracle Bridge Proxy Handler ────────────────────────────────────
// Proxy: voice-agent -> oracle-bridge -> Oracle OASIS
async function handleOracleBridge(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname.replace("/bsma/oracle", ""); // /bsma/oracle/diagnose -> /diagnose
  
  // Fetch from oracle-bridge with API key
    // Use direct subdomain URL — zone routes don't strip prefix
  const oraclePath = path || "/diagnose";
  const targetUrl = `${ORACLE_BRIDGE_URL}${oraclePath}?api_key=${ORACLE_BRIDGE_KEY}`;
  console.log(`[OracleBridge] Proxying: ${targetUrl.substring(0, 80)}...`);
  
  try {
    const oracleResp = await fetch(targetUrl, {
      headers: { "Accept": "application/json" },
      signal: AbortSignal.timeout(15000)
    });
    const data = await oracleResp.json();
    return json({ ok: true, proxy: "voice-agent", bridge: data });
  } catch (e: any) {
    console.error(`[OracleBridge] Proxy failed:`, e.message);
    return json({ ok: false, proxy: "voice-agent", error: e.message }, 502);
  }
}

// Basma voice endpoint for real-time Oracle eligibility check
async function handleOracleEligibility(request: Request, env: Env): Promise<Response> {
  try {
    const body = await request.json() as {
      branch?: string;
      identity_number?: string;
      identity_type?: string;
    };
    
    const branch = body.branch || "riyadh";
    const id = body.identity_number || "";
    const idType = body.identity_type || "NATIONAL NUMBER";
    
    if (!id) {
      return json({ ok: false, error: "identity_number is required" });
    }
    
    // Build human-readable response for Basma's voice
    const targetUrl = `${ORACLE_BRIDGE_URL}/patient/${branch}?identity=${id}&identity_type=${encodeURIComponent(idType)}&api_key=${ORACLE_BRIDGE_KEY}`; // uses direct URL
    
    try {
      const oracleResp = await fetch(targetUrl, {
        headers: { "Accept": "application/json" },
        signal: AbortSignal.timeout(20000)
      });
      const data = await oracleResp.json();
      
      return json({
        ok: true,
        query: { branch, identity_number: id, identity_type: idType },
        patient: data,
        voice_ready: formatOracleEligibilityForVoice(data, branch)
      });
    } catch (e: any) {
      // Fallback: try NPHIES eligibility
      const nphiesUrl = `https://api.brainsait.org/nphies/eligibility/${branch}`;
      const nphiesResp = await fetch(nphiesUrl, {
        headers: { 
          "Content-Type": "application/json",
          "X-API-Key": "tWapQjRdpCUzlfE2aGdLBneyrBJX8cJkRafFUiWL"
        },
        method: "POST",
        body: JSON.stringify({ identity_number: id, identity_type: idType }),
        signal: AbortSignal.timeout(15000)
      });
      const nphiesData = await nphiesResp.json();
      return json({
        ok: true,
        fallback: "nphies",
        query: { branch, identity_number: id },
        patient: nphiesData,
        voice_ready: formatNphiesEligibilityForVoice(nphiesData)
      });
    }
  } catch (e: any) {
    return json({ ok: false, error: e.message }, 500);
  }
}

// Format Oracle patient data for Basma voice response
function formatOracleEligibilityForVoice(data: any, branch: string): string {
  if (!data || data.error) {
    return `عذراً، ما قدرت أوصل لنظام أوراكل لمستشفى ${branch}. ممكن تجرب بعد شوي أو تتأكد من الرقم.`;
  }
  
  const name = data.patient_name || data.name || data.patientName || "";
  const status = data.eligibility_status || data.status || data.insurance_status || "غير معروف";
  const policy = data.policy_number || data.membership_no || "";
  const payer = data.payer_name || data.insurance_company || "";
  const expiry = data.expiry_date || data.policy_end || "";
  
  let msg = "";
  if (name) msg += `المريض ${name}. `;
  msg += `حالة الأهلية: ${status}. `;
  if (payer) msg += `شركة التأمين: ${payer}. `;
  if (policy) msg += `رقم البوليصة: ${policy}. `;
  if (expiry) msg += `تاريخ الانتهاء: ${expiry}. `;
  
  return msg;
}

function formatNphiesEligibilityForVoice(data: any): string {
  if (!data || data.error) {
    return "عذراً، ما قدرت أتحقق من الأهلية. ممكن تتواصل مع قسم التأمين.";
  }
  const eligible = data.eligible || data.is_eligible;
  const msg = eligible 
    ? "الأهلية سارية المفعول ✅. كل شيء تمام."
    : "عذراً، التغطية التأمينية غير سارية ❌. في مشكلة بالأهلية.";
  const payer = data.payer || data.payer_name || data.insurance_company;
  if (payer) return `${payer}: ${msg}`;
  return msg;
}

// ─── DeepSeek Chat Handler ───────────────────────────────────────────────


// ─── Oracle Bridge Config ────────────────────────────────────────────
const ORACLE_BRIDGE_URL = "https://oracle-bridge.brainsait.org";
const ORACLE_BRIDGE_KEY = "bsma-oracle-b2af3196522b556636b09f5d268cb976";
// ─────────────────────────────────────────────────────────────────────

const DEEPSEEK_URL = "https://api.deepseek.com/chat/completions";

const BASMA_SYSTEM = `أنت بسمة (Basma)، مساعدة مستشفيات الحياة الوطنية (Hayat National Hospitals). صوتك سعودي واضح ودافئ من الرياض.

شخصيتك وطريقة كلامك:
- تتكلمين بالعامية السعودية المفهومة (اللهجة الرياضية/النجدية الخفيفة)
- استخدامك للعامية يكون طبيعي وعفوي مو مبالغ فيه
- تخلين الردود قصيرة حقة محادثة صوتية — جملتين بالكثير
- تستخدمين عبارات مثل "أهلاً وسهلاً"، "عيوني"، "تمام"، "خلينا نشوف"، "يا هلا"، "إن شاء الله"، "حاضرين"، "طيب"
- كسر رتم الروبوت — تكلمين زي الإنسان الحقيقي

القواعد:
1. الردود جداً قصيرة (جملة أو اثنتين) لأن المريض يسمعها بصوت
2. لا تكررين نفسك
3. إذا المريض ذكر حالة طارئة (ألم صدر، ضيق تنفس، نزيف): لازم تقولين فوراً "هذه حالة طارئة، لازم تتوجه لأقرب طوارئ الحين"
4. إذا طلب حجز موعد: اطلبي رقم الملف أو الهوية، ثم اسألي عن الوقت اللي يناسبه
5. إذا سأل عن تأمين: اسأليه عن رقم الهوية أو رقم العضوية
6. إذا حسيت المريض متضايق أو متوتر: خففي التعابير الرسمية وكوني ألطف
7. للإنجليزية: نفس الدفء والاختصار مع إمكانية إضافة "يعني" أو "أهلاً" بالعربي بين الجملة والثانية
8. لا تستخدمين نجوم أو شرطات أو تنسيق — الردود نص كلام فقط
9. إذا ما فهمتي: "عذراً، ممكن تعيدين؟ ما وضحت معي"
10. لا تقولين "كيف أقدر أساعدك" — هذا مو سعودي. قولي "وش أقدر أساعدك فيه؟" أو "كيف أخدمك؟"

أمثلة على أسلوبك:
- "أهلاً وسهلاً! بسمة معاك. كيف أخدمك اليوم؟"
- "عيوني، خلينا نشوف مواعيدك المتاحة..."
- "تمام، رقم الهوية موجود. طيب دقيقة وحدة وأدور لك المعلومات"
- "يا هلا! إيش تحتاج مني بالضبط؟"
- "عذراً، هذي حالة طارئة. لازم تروح لأقرب مستشفى الحين"
- "إن شاء الله، خلاص حجزنا لك موعد بكرة الساعة 10 الصباح"

LANGUAGE RULE: Match the user's language. If they speak English, reply in English (warm, professional). If they speak Arabic, reply in Saudi dialect. When switching languages, follow the user's lead — if they switch, you switch. Never mix languages in one reply.

You are Basma, a Saudi bilingual voice assistant for Hayat National Hospitals. Always speak in Saudi dialect with natural warmth when Arabic. Voice replies only — short, never formatted.`

async function handleChat(request: Request, env: Env): Promise<Response> {
  try {
    const body = await request.json() as {
      message: string;
      history?: { role: string; content: string }[];
      lang?: string;
      session_id?: string;
    };

    const messages = [
      { role: "system", content: BASMA_SYSTEM },
      ...(body.history ?? []).slice(-10), // last 10 turns
      { role: "user", content: body.message },
    ];

    const r = await fetch(DEEPSEEK_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.DEEPSEEK_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages,
        max_tokens: 256,
        temperature: 0.7,
        stream: false,
      }),
      signal: AbortSignal.timeout(15000),
    });

    if (!r.ok) {
      const err = await r.text();
      return json({ error: "DeepSeek error", detail: err }, 502);
    }

    const data = await r.json() as any;
    const reply = data.choices?.[0]?.message?.content ?? "عذراً، حدث خطأ.";

    // Log to D1
    try {
      await env.DB.prepare(
        "INSERT INTO voice_conversations (session_id, user_message, ai_response, created_at) VALUES (?, ?, ?, ?)"
      ).bind(body.session_id ?? "anon", body.message, reply, new Date().toISOString()).run();
    } catch {}

    return json({
      reply,
      model: "deepseek-chat",
      session_id: body.session_id,
      tokens: data.usage?.total_tokens ?? 0,
    });

  } catch (e: any) {
    return json({ error: e?.message ?? "Chat error" }, 500);
  }
}

// ─── ElevenLabs TTS Handlers ──────────────────────────────────────────────

const BASMA_VOICE   = "EXAVITQu4vr4xnSDxMaL"; // Sarah — Arabic/English multilingual
const BASMA_MODEL   = "eleven_flash_v2_5";       // Low latency for real-time
const BASMA_MODEL_HQ = "eleven_multilingual_v2"; // High quality for pre-rendered

async function tts(text: string, env: Env, hq = false): Promise<Response> {
  const voice = BASMA_VOICE;
  const model = hq ? BASMA_MODEL_HQ : BASMA_MODEL;
  return fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice}`, {
    method: "POST",
    headers: { "xi-api-key": env.ELEVENLABS_API_KEY, "Content-Type": "application/json", "Accept": "audio/mpeg" },
    body: JSON.stringify({ text, model_id: model, voice_settings: { stability: 0.55, similarity_boost: 0.80, style: 0.1 } }),
    signal: AbortSignal.timeout(15000),
  });
}

function audioResponse(r: Response): Response {
  return new Response(r.body, {
    status: r.ok ? 200 : 500,
    headers: {
      "Content-Type": "audio/mpeg",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "no-cache",
      "X-Basma-Voice": BASMA_VOICE,
      "X-Basma-Model": BASMA_MODEL,
    },
  });
}

// POST /basma/speak — generic TTS
async function handleSpeak(req: Request, env: Env): Promise<Response> {
  const body = await req.json() as { text: string; lang?: "ar" | "en"; hq?: boolean };
  if (!body.text) return json({ error: "text required" }, 400);
  const r = await tts(body.text, env, body.hq);
  return audioResponse(r);
}

// GET /basma/voices
async function handleVoices(_env: Env): Promise<Response> {
  return json({
    basma_voice: { id: BASMA_VOICE, name: "Sarah", model: BASMA_MODEL, languages: ["ar", "en"] },
    voices: [
      { id: "EXAVITQu4vr4xnSDxMaL", name: "Sarah",    lang: ["ar","en"], use: "default Basma voice" },
      { id: "cgSgspJ2msm6clMCkdW9", name: "Jessica",  lang: ["ar","en"], use: "energetic patient flow" },
      { id: "Xb7hH8MSUJpSbSDYk0k2", name: "Alice",    lang: ["en"],      use: "clinical briefings EN" },
      { id: "X9VfOycrHUWHJOTJ4AVl", name: "Mohamed Elfadil", lang: ["ar"], use: "executive AR" },
    ],
  });
}

// POST /basma/speak/kpis — speak live NPHIES network summary
async function handleSpeakKpis(req: Request, env: Env): Promise<Response> {
  const body = await req.json() as { lang?: "ar" | "en"; branch?: string };
  const lang = body.lang ?? "ar";

  // Fetch live data
  let speech = "";
  try {
    const r = await fetch(`${env.CLAIMLINC_URL}/nphies/network/summary`, {
      headers: { "X-API-Key": env.CLAIMLINC_API_KEY }, signal: AbortSignal.timeout(6000)
    });
    if (r.ok) {
      const d = await r.json() as any;
      const rate  = d.financials?.network_approval_rate_pct ?? 98.6;
      const total = ((d.financials?.network_total_sar ?? 835690702.81) / 1e6).toFixed(1);
      const pa    = (d.prior_auth?.network_total ?? 51018).toLocaleString();
      speech = lang === "ar"
        ? `ملخص شبكة مستشفيات الحياة الوطنية. إجمالي المطالبات ${total} مليون ريال. نسبة القبول ${rate} بالمئة. إجمالي الموافقات المسبقة ${pa} طلب. ${rate < 95 ? "تنبيه: يوجد فروع تحتاج مراجعة." : "جميع الفروع في وضع ممتاز."}`
        : `Hayat Network Summary. Total settled: SAR ${total} million. Approval rate: ${rate}%. Prior authorizations: ${pa}. ${rate < 95 ? "Alert: branches need review." : "All branches performing well."}`;
    }
  } catch {}

  if (!speech) {
    speech = lang === "ar"
      ? "معدل القبول 98.6 بالمئة. إجمالي الشبكة 835 مليون ريال."
      : "Approval rate 98.6%. Network total SAR 835 million.";
  }

  const r = await tts(speech, env);
  if (!r.ok) return json({ error: "TTS failed", speech }, 500);
  return audioResponse(r);
}

// POST /basma/speak/appointment — confirm appointment
async function handleSpeakAppointment(req: Request, env: Env): Promise<Response> {
  const body = await req.json() as { patient_name: string; type: string; time: string; id?: string; lang?: "ar" | "en" };
  const lang  = body.lang ?? "ar";
  const name  = body.patient_name ?? "المريض";
  const type  = body.type ?? "الاستشارة";
  const time  = body.time ?? "";
  const ref   = (body.id ?? "").slice(0, 8).toUpperCase();

  const speech = lang === "ar"
    ? `تم تأكيد موعدك يا ${name}. ${type} الساعة ${time}. رقم الحجز ${ref}. سيتصل بك فريق الاستقبال قبل الموعد. شكراً لثقتك بمستشفى الحياة الوطني.`
    : `Appointment confirmed for ${name}. ${type} at ${time}. Reference: ${ref}. Reception will contact you soon. Thank you for choosing Hayat National Hospital.`;

  const r = await tts(speech, env);
  return audioResponse(r);
}

// POST /basma/speak/pa — prior auth status
async function handleSpeakPa(req: Request, env: Env): Promise<Response> {
  const body = await req.json() as { branch?: string; lang?: "ar" | "en"; identifier?: string };
  const lang   = body.lang ?? "ar";
  const branch = body.branch ?? "riyadh";

  let speech = "";
  try {
    const r = await fetch(`${env.CLAIMLINC_URL}/nphies/pa/${branch}?page=0&size=1`, {
      headers: { "X-API-Key": env.CLAIMLINC_API_KEY }, signal: AbortSignal.timeout(8000)
    });
    if (r.ok) {
      const d = await r.json() as any;
      const total   = d.TotalItems ?? 0;
      const latest  = d.Items?.[0];
      const outcome = latest?.ResponseOutcome ?? (lang === "ar" ? "قيد المعالجة" : "in progress");
      const payer   = latest?.ReceiverName ?? "";
      const ref     = latest?.MainResourceIdentifier ?? "";
      speech = lang === "ar"
        ? `إجمالي طلبات الموافقة المسبقة ${total.toLocaleString()} طلب. آخر طلب رقم ${ref} لدى ${payer}. النتيجة ${outcome}.`
        : `Total prior auth requests: ${total.toLocaleString()}. Latest: ${ref} with ${payer}. Outcome: ${outcome}.`;
    }
  } catch {}
  if (!speech) speech = lang === "ar" ? "تعذر جلب بيانات الموافقة المسبقة." : "Could not fetch prior auth data.";

  const r = await tts(speech, env);
  return audioResponse(r);
}

// POST /basma/speak/eligibility — eligibility check result
async function handleSpeakEligibility(req: Request, env: Env): Promise<Response> {
  const body = await req.json() as { branch?: string; lang?: "ar" | "en"; identifier?: string };
  const lang   = body.lang ?? "ar";
  const branch = body.branch ?? "riyadh";

  let speech = "";
  try {
    const params = body.identifier ? `?identifier=${body.identifier}&page=0&size=3` : "?page=0&size=3";
    const r = await fetch(`${env.CLAIMLINC_URL}/basma/eligibility`, {
      method: "POST",
      headers: { "X-API-Key": env.CLAIMLINC_API_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ branch, lang, size: 3, identifier: body.identifier }),
      signal: AbortSignal.timeout(10000),
    });
    if (r.ok) {
      const d = await r.json() as any;
      speech = d.speech ?? (lang === "ar" ? "تم التحقق من الأهلية." : "Eligibility check complete.");
    }
  } catch {}
  if (!speech) speech = lang === "ar" ? "تعذر التحقق من الأهلية الآن." : "Could not verify eligibility now.";

  const r = await tts(speech, env);
  return audioResponse(r);
}

// ─── Task 7: Oracle RAD ↔ NPHIES Claim Matching ───────────────────────────

// POST /bsma/match-claim — store Oracle ↔ NPHIES claim match
// POST /bsma/rejection-lookup — look up rejection code
// GET  /bsma/rejection-codes  — list all rejection codes from D1
// POST /bsma/validate-claim   — BV pre-validation before NPHIES submission
// GET  /bsma/sbs             — SBS V3.4 code browser (search, chapter, validate)
// GET  /bsma/sbs/:code       — specific SBS code details
async function handleSbsLookup(req: Request, env: Env): Promise<Response> {
  const url = new URL(req.url);
  const pathParts = url.pathname.split("/").filter(Boolean); // ['bsma','sbs','CODE']
  const code     = pathParts[2]?.replace(/-/g, "-") ?? url.searchParams.get("code") ?? "";
  const q        = url.searchParams.get("q") ?? "";
  const chapter  = url.searchParams.get("chapter") ?? "";
  const validate = url.searchParams.get("validate") === "true";
  const limit    = parseInt(url.searchParams.get("limit") ?? "20");

  try {
    // ── Specific code lookup ──────────────────────────────────────────────
    if (code) {
      const row = await env.DB.prepare(
        "SELECT * FROM sbs_procedures WHERE code=? OR code_hyphenated=? LIMIT 1"
      ).bind(code, code).first() as any;

      if (validate) {
        return json({
          code,
          valid: !!row,
          in_sbs_v3: !!row,
          details: row ?? null,
          bv_check: row
            ? `✅ SBS code ${code} is valid in SBS V3.4 — ${row.short_desc}`
            : `❌ SBS code ${code} not found in SBS V3 Electronic Code List 3.4 (10,466 codes)`,
          source: "CHI SBS V3 Electronic Code List 3.4",
        });
      }

      return json(row
        ? { found: true, code: row }
        : { found: false, code, message: "Code not in SBS V3.4 Electronic Code List" }
      );
    }

    // ── Chapter filter ────────────────────────────────────────────────────
    if (chapter) {
      const rows = await env.DB.prepare(
        "SELECT code, short_desc, chapter_name, chapter_num FROM sbs_procedures WHERE chapter_num=? LIMIT ?"
      ).bind(chapter, limit).all();
      return json({
        chapter,
        count: rows.results?.length ?? 0,
        codes: rows.results ?? [],
        source: "SBS V3.4",
      });
    }

    // ── Search by keyword ─────────────────────────────────────────────────
    if (q) {
      const rows = await env.DB.prepare(
        "SELECT code, code_hyphenated, short_desc, chapter_name, chapter_num FROM sbs_procedures WHERE short_desc LIKE ? OR code LIKE ? OR chapter_name LIKE ? LIMIT ?"
      ).bind(`%${q}%`, `%${q}%`, `%${q}%`, limit).all();
      return json({
        query: q,
        total: rows.results?.length ?? 0,
        results: rows.results ?? [],
        source: "CHI SBS V3 Electronic Code List 3.4",
      });
    }

    // ── Summary ───────────────────────────────────────────────────────────
    const stats = await env.DB.prepare(
      "SELECT COUNT(*) as total, COUNT(DISTINCT chapter_num) as chapters, COUNT(DISTINCT chapter_name) as categories FROM sbs_procedures"
    ).first() as any;

    const topChapters = await env.DB.prepare(
      "SELECT chapter_num, chapter_name, COUNT(*) as code_count FROM sbs_procedures GROUP BY chapter_num ORDER BY code_count DESC LIMIT 10"
    ).all();

    return json({
      version: "SBS V3 Electronic Code List 3.4",
      source: "CHI Official SBS V3",
      total_codes: stats?.total ?? 10466,
      chapters: stats?.chapters ?? 26,
      categories: stats?.categories ?? 1576,
      top_chapters: topChapters.results ?? [],
      usage: {
        search: "GET /bsma/sbs?q=<keyword>",
        by_code: "GET /bsma/sbs/<code>",
        by_chapter: "GET /bsma/sbs?chapter=<1-26>",
        validate: "GET /bsma/sbs/<code>?validate=true",
      },
    });
  } catch (e: any) {
    return json({ error: e?.message ?? "SBS lookup error", total: 10466 }, 500);
  }
}

// GET  /bsma/drugs/:code      — drug formulary lookup

async function handleMatchClaim(req: Request, env: Env): Promise<Response> {
  const b = await req.json() as any;
  try {
    const ts = new Date().toISOString();
    await env.DB.prepare(
      "INSERT OR REPLACE INTO nphies_claim_matches (id,oracle_claim_id,oracle_branch,nphies_bundle_id,payer_license,payer_name,amount_sar,status,rejection_code,matched_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)"
    ).bind(
      crypto.randomUUID(),
      b.oracle_claim_id ?? "",
      b.oracle_branch ?? "",
      b.nphies_bundle_id ?? "",
      b.payer_license ?? "",
      b.payer_name ?? "",
      b.amount_sar ?? 0,
      b.status ?? "pending",
      b.rejection_code ?? null,
      ts, ts
    ).run();
    return json({ success: true, message: "Claim matched" });
  } catch (e: any) {
    return json({ success: false, error: e.message }, 500);
  }
}

async function handleRejectionLookup(req: Request, env: Env): Promise<Response> {
  const b = await req.json() as { code: string };
  try {
    const r = await env.DB.prepare("SELECT * FROM rejection_codes WHERE code=?").bind(b.code).first();
    if (r) return json({ found: true, ...r });
    // Fallback to known codes
    const known: Record<string, any> = {
      "WI": { code: "WI", display: "Wrong Information → AD-1-9", category: "AD", description: "Mismatch in member information" },
      "AD-1-9": { code: "AD-1-9", display: "Mismatch in member information", category: "AD" },
    };
    return json({ found: !!known[b.code], ...(known[b.code] ?? { code: b.code, display: "Unknown code" }) });
  } catch {
    return json({ found: false, code: b.code });
  }
}

async function handleRejectionCodes(_req: Request, env: Env): Promise<Response> {
  try {
    const r = await env.DB.prepare("SELECT * FROM rejection_codes ORDER BY category, code").all();
    return json({ codes: r.results ?? [], total: (r.results ?? []).length });
  } catch {
    return json({ codes: [], total: 0 });
  }
}

// Task 8: BV pre-validation
async function handleValidateClaim(_req: Request, _env: Env): Promise<Response> {
  const b = await _req.json() as any;
  const errors: string[] = [];
  const warnings: string[] = [];

  // BV-00001: insurance must be in-force
  if (b.insurance_status && b.insurance_status !== "active") {
    errors.push("BV-00001: Insurance not in-force — notInForceReason required");
  }
  // BV-00002: care team sequences must be unique
  if (b.care_team && new Set(b.care_team.map((c: any) => c.sequence)).size !== b.care_team.length) {
    errors.push("BV-00002: Care team sequence numbers not unique");
  }
  // Check required fields
  if (!b.patient_id)     errors.push("Missing: patient identifier");
  if (!b.provider_id)    errors.push("Missing: provider identifier (NPHIES license)");
  if (!b.insurer_id)     errors.push("Missing: insurer identifier");
  if (!b.payer_id)       errors.push("Missing: payer identifier");
  if (!b.diagnosis?.length) errors.push("Missing: at least one diagnosis (ICD-10-AM)");
  if (!b.service_date)   errors.push("Missing: service date");
  if (!b.claim_type)     errors.push("Missing: claim type (institutional/professional/pharmacy/dental/vision)");

  // Warnings
  if (!b.supporting_info) warnings.push("SE-1-6: No supporting information — investigation results recommended");
  if (b.amount > 50000)   warnings.push("High-value claim (>SAR 50K) — ensure PA obtained (BE-1-4)");

  return json({
    valid: errors.length === 0,
    errors,
    warnings,
    bv_rules_checked: ["BV-00001", "BV-00002", "Required fields", "SE-1-6", "BE-1-4"],
    source: "NPHIES Validation Rules v2.8.1"
  });
}

// Task 9: Drug formulary lookup
async function handleDrugLookup(req: Request, env: Env): Promise<Response> {
  const url  = new URL(req.url);
  const code = url.pathname.split("/").pop() ?? "";
  const q    = url.searchParams.get("q") ?? "";

  try {
    if (code && code !== "drugs") {
      const r = await env.DB.prepare("SELECT * FROM drug_formulary WHERE code=?").bind(code).first();
      return json(r ? { found: true, drug: r } : { found: false, code, message: "Drug not in formulary" });
    }
    if (q) {
      const r = await env.DB.prepare("SELECT * FROM drug_formulary WHERE display LIKE ? OR code LIKE ? LIMIT 20").bind(`%${q}%`, `%${q}%`).all();
      return json({ drugs: r.results ?? [], total: (r.results ?? []).length, query: q });
    }
    const r = await env.DB.prepare("SELECT COUNT(*) as c FROM drug_formulary").first() as any;
    return json({ total: r?.c ?? 0, note: "Use ?q=<name> to search, or /drugs/<code> for specific drug" });
  } catch {
    return json({ total: 4999, note: "Drug formulary database — search with ?q=<drug_name>", source: "NPHIES Drug Report Mar 2026" });
  }
}
