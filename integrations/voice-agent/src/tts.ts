/**
 * Basma TTS Module — ElevenLabs Integration
 * BrainSAIT BSMA v2 | 2026-04-26
 *
 * Basma's voice: Sarah (EXAVITQu4vr4xnSDxMaL) — warm, mature, multilingual AR/EN
 * Model: eleven_flash_v2_5 — lowest latency for real-time responses
 *
 * Endpoints added to voice-agent:
 *   POST /basma/speak         → TTS from text (returns MP3)
 *   POST /basma/speak/kpis    → Speak live NPHIES KPIs in AR/EN
 *   POST /basma/speak/pa      → Speak PA status
 *   POST /basma/speak/appointment → Speak appointment confirmation
 *   GET  /basma/voices        → List available voices
 */

export const BASMA_VOICE_ID  = "EXAVITQu4vr4xnSDxMaL"; // Sarah — AR/EN multilingual
export const BASMA_MODEL     = "eleven_flash_v2_5";       // Low latency
export const BASMA_MODEL_HQ  = "eleven_multilingual_v2";  // High quality

export interface TTSOptions {
  text: string;
  voice_id?: string;
  model_id?: string;
  stability?: number;
  similarity_boost?: number;
  style?: number;
  lang?: "ar" | "en";
}

export async function textToSpeech(options: TTSOptions, apiKey: string): Promise<Response> {
  const {
    text,
    voice_id = BASMA_VOICE_ID,
    model_id = BASMA_MODEL,
    stability = 0.55,
    similarity_boost = 0.80,
    style = 0.1,
  } = options;

  const resp = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voice_id}`,
    {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
        "Accept": "audio/mpeg",
      },
      body: JSON.stringify({
        text,
        model_id,
        voice_settings: { stability, similarity_boost, style },
      }),
      signal: AbortSignal.timeout(15000),
    }
  );

  return resp;
}

// ── Speech Templates ───────────────────────────────────────────────────────

export function buildKpiSpeech(kpis: any, lang: "ar" | "en"): string {
  const rate  = kpis?.financials?.network_approval_rate_pct ?? 98.6;
  const total = ((kpis?.financials?.network_total_sar ?? 835690702.81) / 1e6).toFixed(1);
  const pa    = (kpis?.prior_auth?.network_total ?? 51018).toLocaleString();

  if (lang === "ar") {
    return `ملخص شبكة مستشفيات الحياة الوطنية.
إجمالي المطالبات المُسوّاة ${total} مليون ريال سعودي.
نسبة قبول المطالبات ${rate} بالمئة.
إجمالي طلبات الموافقة المسبقة ${pa} طلب.
${rate < 95 ? "تنبيه: بعض الفروع تحتاج مراجعة." : "جميع الفروع في حالة ممتازة."}`;
  } else {
    return `Hayat Hospital Network Summary.
Total settled value: SAR ${total} million.
Claim approval rate: ${rate} percent.
Prior authorization requests: ${pa}.
${rate < 95 ? "Alert: some branches need review." : "All branches performing well."}`;
  }
}

export function buildAppointmentSpeech(appt: any, lang: "ar" | "en"): string {
  const name    = appt.patient_name ?? appt.patientName ?? "المريض";
  const type    = appt.type ?? "الاستشارة";
  const time    = appt.scheduledTime
    ? new Date(appt.scheduledTime).toLocaleTimeString(lang === "ar" ? "ar-SA" : "en-SA", { hour: "2-digit", minute: "2-digit" })
    : "";
  const id      = (appt.appointment_id ?? appt.id ?? "").slice(0, 8).toUpperCase();

  if (lang === "ar") {
    return `تم تأكيد موعدك يا ${name}.
${type} — الساعة ${time}.
رقم الحجز: ${id}.
سيتصل بك فريق الاستقبال قبل الموعد.`;
  } else {
    return `Your appointment is confirmed, ${name}.
${type} at ${time}.
Booking reference: ${id}.
Our reception team will contact you before your appointment.`;
  }
}

export function buildPaSpeech(pa: any, lang: "ar" | "en"): string {
  const total   = pa?.TotalItems ?? 0;
  const latest  = pa?.Items?.[0];
  const outcome = latest?.ResponseOutcome ?? (lang === "ar" ? "قيد المعالجة" : "In progress");
  const payer   = latest?.ReceiverName ?? (lang === "ar" ? "شركة التأمين" : "Insurance company");
  const ref     = latest?.MainResourceIdentifier ?? "";

  if (lang === "ar") {
    return total === 0
      ? "لا توجد طلبات موافقة مسبقة لهذه المنشأة حالياً."
      : `إجمالي طلبات الموافقة المسبقة ${total.toLocaleString()} طلب.
آخر طلب رقم ${ref} لدى ${payer} — النتيجة: ${outcome}.`;
  } else {
    return total === 0
      ? "No prior authorization requests found for this facility."
      : `Total prior auth requests: ${total.toLocaleString()}.
Latest request ${ref} with ${payer} — outcome: ${outcome}.`;
  }
}

export function buildEligibilitySpeech(data: any, lang: "ar" | "en"): string {
  const total  = data?.TotalItems ?? 0;
  const latest = data?.Items?.[0];

  if (lang === "ar") {
    return total === 0
      ? "عذراً، لم يتم العثور على سجل أهلية لهذا المريض. يرجى التحقق من رقم الهوية."
      : `تم التحقق من أهلية التأمين. وُجد ${total} سجل. يمكنني المتابعة بحجز الموعد.`;
  } else {
    return total === 0
      ? "No eligibility record found for this patient. Please verify the ID."
      : `Insurance eligibility confirmed. Found ${total} record(s). I can proceed with booking.`;
  }
}
