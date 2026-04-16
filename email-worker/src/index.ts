import { EmailMessage } from "cloudflare:email";

export interface Env {
  SEND_EMAIL_TEAM: SendEmail;
  SEND_EMAIL_APPLICANT: SendEmail;
}

interface PartnerApplication {
  firstName: string;
  lastName: string;
  email: string;
  organization: string;
  country: string;
  partnerType: string;
  description: string;
}

const COUNTRY_NAMES: Record<string, string> = {
  SA: "Saudi Arabia",
  AE: "UAE",
  QA: "Qatar",
  BH: "Bahrain",
  KW: "Kuwait",
  OM: "Oman",
  JO: "Jordan",
  EG: "Egypt",
  OTHER: "Other",
};

const PARTNER_TYPE_NAMES: Record<string, string> = {
  tech: "Technology Partner",
  health: "Healthcare Provider",
  dist: "Distribution Partner",
  integ: "Integration Partner",
};

function buildEmailHtml(app: PartnerApplication): string {
  const countryName = COUNTRY_NAMES[app.country] ?? app.country;
  const partnerTypeName = PARTNER_TYPE_NAMES[app.partnerType] ?? app.partnerType;

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>New Partner Application</title></head>
<body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;color:#1a1a2e;background:#f8f9fa;">
  <div style="background:linear-gradient(135deg,#1a1a2e,#16213e);padding:30px;border-radius:12px 12px 0 0;text-align:center;">
    <h1 style="color:#d4a574;margin:0;font-size:24px;">🤝 New Partner Application</h1>
    <p style="color:#94a3b8;margin:8px 0 0;">Received via brainsait.org/partners</p>
  </div>
  <div style="background:#ffffff;padding:30px;border-radius:0 0 12px 12px;border:1px solid #e2e8f0;">
    <table style="width:100%;border-collapse:collapse;">
      <tr>
        <td style="padding:12px 0;border-bottom:1px solid #f1f5f9;width:40%;font-weight:600;color:#64748b;font-size:13px;text-transform:uppercase;letter-spacing:0.5px;">Full Name</td>
        <td style="padding:12px 0;border-bottom:1px solid #f1f5f9;color:#1a1a2e;font-size:15px;">${app.firstName} ${app.lastName}</td>
      </tr>
      <tr>
        <td style="padding:12px 0;border-bottom:1px solid #f1f5f9;font-weight:600;color:#64748b;font-size:13px;text-transform:uppercase;letter-spacing:0.5px;">Work Email</td>
        <td style="padding:12px 0;border-bottom:1px solid #f1f5f9;color:#1a1a2e;font-size:15px;"><a href="mailto:${app.email}" style="color:#8b5cf6;">${app.email}</a></td>
      </tr>
      <tr>
        <td style="padding:12px 0;border-bottom:1px solid #f1f5f9;font-weight:600;color:#64748b;font-size:13px;text-transform:uppercase;letter-spacing:0.5px;">Organization</td>
        <td style="padding:12px 0;border-bottom:1px solid #f1f5f9;color:#1a1a2e;font-size:15px;">${app.organization}</td>
      </tr>
      <tr>
        <td style="padding:12px 0;border-bottom:1px solid #f1f5f9;font-weight:600;color:#64748b;font-size:13px;text-transform:uppercase;letter-spacing:0.5px;">Country</td>
        <td style="padding:12px 0;border-bottom:1px solid #f1f5f9;color:#1a1a2e;font-size:15px;">${countryName}</td>
      </tr>
      <tr>
        <td style="padding:12px 0;border-bottom:1px solid #f1f5f9;font-weight:600;color:#64748b;font-size:13px;text-transform:uppercase;letter-spacing:0.5px;">Partnership Type</td>
        <td style="padding:12px 0;border-bottom:1px solid #f1f5f9;color:#1a1a2e;font-size:15px;">
          <span style="background:#ede9fe;color:#7c3aed;padding:3px 10px;border-radius:20px;font-size:13px;font-weight:600;">${partnerTypeName}</span>
        </td>
      </tr>
      <tr>
        <td style="padding:12px 0;font-weight:600;color:#64748b;font-size:13px;text-transform:uppercase;letter-spacing:0.5px;vertical-align:top;">Vision</td>
        <td style="padding:12px 0;color:#1a1a2e;font-size:15px;line-height:1.6;">${app.description}</td>
      </tr>
    </table>
    <div style="margin-top:24px;padding:16px;background:#f8fafc;border-radius:8px;border-left:4px solid #8b5cf6;">
      <p style="margin:0;font-size:13px;color:#64748b;">
        Reply directly to <a href="mailto:${app.email}" style="color:#8b5cf6;">${app.email}</a> to respond to this applicant.
        Application submitted at ${new Date().toUTCString()}.
      </p>
    </div>
  </div>
</body>
</html>`;
}

function buildEmailText(app: PartnerApplication): string {
  const countryName = COUNTRY_NAMES[app.country] ?? app.country;
  const partnerTypeName = PARTNER_TYPE_NAMES[app.partnerType] ?? app.partnerType;

  return `New Partner Application — BrainSAIT

Full Name:        ${app.firstName} ${app.lastName}
Work Email:       ${app.email}
Organization:     ${app.organization}
Country:          ${countryName}
Partnership Type: ${partnerTypeName}

Vision:
${app.description}

---
Reply to: ${app.email}
Submitted: ${new Date().toUTCString()}
`;
}

function buildConfirmationHtml(app: PartnerApplication): string {
  const partnerTypeName = PARTNER_TYPE_NAMES[app.partnerType] ?? app.partnerType;

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>Partnership Application Received — BrainSAIT</title></head>
<body style="margin:0;padding:0;background:#0f0f1a;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f0f1a;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#1a1a2e 0%,#16213e 60%,#1e1b4b 100%);border-radius:16px 16px 0 0;padding:40px 40px 36px;text-align:center;">
            <div style="display:inline-block;background:linear-gradient(135deg,#8b5cf6,#a78bfa);border-radius:12px;padding:10px 18px;margin-bottom:20px;">
              <span style="color:#ffffff;font-size:13px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">BrainSAIT</span>
            </div>
            <h1 style="margin:0 0 10px;color:#f8fafc;font-size:26px;font-weight:700;letter-spacing:-0.5px;">Application Received ✅</h1>
            <p style="margin:0;color:#94a3b8;font-size:15px;line-height:1.5;">Your partnership application is now under review</p>
          </td>
        </tr>

        <!-- Greeting -->
        <tr>
          <td style="background:#1e1e3a;padding:36px 40px 24px;">
            <p style="margin:0 0 16px;color:#e2e8f0;font-size:16px;line-height:1.7;">Dear <strong style="color:#f8fafc;">${app.firstName}</strong>,</p>
            <p style="margin:0 0 16px;color:#cbd5e1;font-size:15px;line-height:1.7;">
              Thank you for applying to the <strong style="color:#a78bfa;">BrainSAIT Partner Program</strong>. We have successfully received your application for <strong style="color:#f8fafc;">${app.organization}</strong> and our team is already reviewing it.
            </p>
            <p style="margin:0;color:#cbd5e1;font-size:15px;line-height:1.7;">
              You can expect to hear from us within <strong style="color:#d4a574;">24–48 hours</strong>.
            </p>
          </td>
        </tr>

        <!-- Application Summary -->
        <tr>
          <td style="background:#1e1e3a;padding:0 40px 28px;">
            <div style="background:#16213e;border:1px solid #2d3a5e;border-radius:12px;padding:24px;">
              <p style="margin:0 0 16px;color:#64748b;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:2px;">Application Summary</p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #1e2d4a;color:#64748b;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;width:42%;">Organization</td>
                  <td style="padding:10px 0;border-bottom:1px solid #1e2d4a;color:#e2e8f0;font-size:14px;">${app.organization}</td>
                </tr>
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #1e2d4a;color:#64748b;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Partnership Type</td>
                  <td style="padding:10px 0;border-bottom:1px solid #1e2d4a;">
                    <span style="background:#3b2d6e;color:#a78bfa;padding:3px 10px;border-radius:20px;font-size:12px;font-weight:600;">${partnerTypeName}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:10px 0;color:#64748b;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Reference</td>
                  <td style="padding:10px 0;color:#94a3b8;font-size:13px;font-family:monospace;">${crypto.randomUUID().split("-")[0]}</td>
                </tr>
              </table>
            </div>
          </td>
        </tr>

        <!-- What Happens Next -->
        <tr>
          <td style="background:#1e1e3a;padding:0 40px 32px;">
            <p style="margin:0 0 16px;color:#64748b;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:2px;">What Happens Next</p>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding:12px 0;border-bottom:1px solid #1e2d4a;vertical-align:top;">
                  <table cellpadding="0" cellspacing="0"><tr>
                    <td style="width:32px;height:32px;background:linear-gradient(135deg,#8b5cf6,#a78bfa);border-radius:50%;text-align:center;vertical-align:middle;color:#fff;font-size:13px;font-weight:700;">1</td>
                    <td style="padding-left:14px;color:#cbd5e1;font-size:14px;line-height:1.5;vertical-align:middle;"><strong style="color:#e2e8f0;">AI Screening</strong> — PartnerLinc reviews your application instantly and scores your partnership fit.</td>
                  </tr></table>
                </td>
              </tr>
              <tr>
                <td style="padding:12px 0;border-bottom:1px solid #1e2d4a;vertical-align:top;">
                  <table cellpadding="0" cellspacing="0"><tr>
                    <td style="width:32px;height:32px;background:linear-gradient(135deg,#0ea5e9,#38bdf8);border-radius:50%;text-align:center;vertical-align:middle;color:#fff;font-size:13px;font-weight:700;">2</td>
                    <td style="padding-left:14px;color:#cbd5e1;font-size:14px;line-height:1.5;vertical-align:middle;"><strong style="color:#e2e8f0;">Team Review</strong> — Our partnership team validates technical and commercial fit within 24–48 hours.</td>
                  </tr></table>
                </td>
              </tr>
              <tr>
                <td style="padding:12px 0;vertical-align:top;">
                  <table cellpadding="0" cellspacing="0"><tr>
                    <td style="width:32px;height:32px;background:linear-gradient(135deg,#d4a574,#f59e0b);border-radius:50%;text-align:center;vertical-align:middle;color:#fff;font-size:13px;font-weight:700;">3</td>
                    <td style="padding-left:14px;color:#cbd5e1;font-size:14px;line-height:1.5;vertical-align:middle;"><strong style="color:#e2e8f0;">Onboarding</strong> — You receive your integration roadmap, agreement drafts, and API credentials.</td>
                  </tr></table>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- CTA -->
        <tr>
          <td style="background:#1e1e3a;padding:0 40px 36px;text-align:center;">
            <div style="background:linear-gradient(135deg,#1a1a2e,#1e1b4b);border:1px solid #3730a3;border-radius:12px;padding:24px;">
              <p style="margin:0 0 16px;color:#a5b4fc;font-size:14px;">Have a question while you wait? Chat with <strong>PartnerLinc</strong>, our AI partnership advisor.</p>
              <a href="https://brainsait.org/partners#apply" style="display:inline-block;background:linear-gradient(135deg,#8b5cf6,#a78bfa);color:#ffffff;text-decoration:none;font-size:14px;font-weight:700;padding:12px 28px;border-radius:8px;letter-spacing:-0.3px;">Talk to PartnerLinc →</a>
            </div>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#16213e;border-radius:0 0 16px 16px;padding:28px 40px;text-align:center;">
            <p style="margin:0 0 10px;color:#475569;font-size:12px;line-height:1.6;">
              © ${new Date().getFullYear()} BrainSAIT. All rights reserved.<br>
              <a href="https://brainsait.org" style="color:#8b5cf6;text-decoration:none;">brainsait.org</a> ·
              <a href="https://brainsait.org/privacy-policy.html" style="color:#8b5cf6;text-decoration:none;">Privacy Policy</a> ·
              <a href="https://brainsait.org/terms-of-use.html" style="color:#8b5cf6;text-decoration:none;">Terms</a>
            </p>
            <p style="margin:0;color:#334155;font-size:11px;">
              You received this email because you submitted a partner application at brainsait.org.<br>
              Questions? Reply to this email or contact <a href="mailto:partner@brainsait.org" style="color:#64748b;">partner@brainsait.org</a>.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function buildConfirmationText(app: PartnerApplication): string {
  const partnerTypeName = PARTNER_TYPE_NAMES[app.partnerType] ?? app.partnerType;

  return `BrainSAIT Partner Program — Application Received

Dear ${app.firstName},

Thank you for applying to the BrainSAIT Partner Program. We have successfully received your application for ${app.organization} and our team is already reviewing it.

You can expect to hear from us within 24–48 hours.

─────────────────────────────────
APPLICATION SUMMARY
─────────────────────────────────
Organization:     ${app.organization}
Partnership Type: ${partnerTypeName}

─────────────────────────────────
WHAT HAPPENS NEXT
─────────────────────────────────
1. AI Screening — PartnerLinc reviews your application and scores your partnership fit.
2. Team Review — Our partnership team validates technical and commercial fit (24–48h).
3. Onboarding — You receive your integration roadmap, agreement drafts, and API credentials.

Have a question while you wait? Chat with PartnerLinc at:
https://brainsait.org/partners#apply

─────────────────────────────────
© ${new Date().getFullYear()} BrainSAIT · brainsait.org
Questions? Contact partner@brainsait.org
`;
}

function isValidPartnerApplication(data: unknown): data is PartnerApplication {
  if (typeof data !== "object" || data === null) return false;
  const d = data as Record<string, unknown>;
  const requiredFields = ["firstName", "lastName", "email", "organization", "country", "partnerType", "description"];
  return requiredFields.every((f) => typeof d[f] === "string" && (d[f] as string).trim().length > 0);
}

function isValidEmail(email: string): boolean {
  if (email.length === 0) return false;
  if (/[\u0000-\u001F\u007F\s]/.test(email)) return false;
  if (/[<>"]/.test(email)) return false;

  const atIndex = email.indexOf("@");
  if (atIndex <= 0 || atIndex !== email.lastIndexOf("@")) return false;

  const domain = email.slice(atIndex + 1);
  const dotIndex = domain.lastIndexOf(".");
  return dotIndex > 0 && dotIndex < domain.length - 1;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "https://brainsait.org",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (request.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!isValidPartnerApplication(body)) {
      return new Response(JSON.stringify({ error: "Missing or invalid required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!isValidEmail(body.email)) {
      return new Response(JSON.stringify({ error: "Invalid email address" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Sanitize header values: strip newlines and carriage returns to prevent header injection
    const sanitizeHeader = (value: string) => value.replace(/[\r\n]+/g, " ").trim();
    const safeFirstName = sanitizeHeader(body.firstName);
    const safeLastName = sanitizeHeader(body.lastName);
    const safeOrg = sanitizeHeader(body.organization);
    const safeEmail = sanitizeHeader(body.email);
    const createMimeBoundary = (prefix: string) => `${prefix}_${crypto.randomUUID()}`;

    // Build team notification email (internal, to partner@brainsait.org)
    const teamSubject = `[Partner Application] ${safeFirstName} ${safeLastName} — ${safeOrg}`;
    const teamBoundary = createMimeBoundary("team_boundary");
    const teamRawEmail = [
      `From: PartnerLinc <no-reply@brainsait.org>`,
      `To: partner@brainsait.org`,
      `Reply-To: ${safeFirstName} ${safeLastName} <${safeEmail}>`,
      `Subject: ${teamSubject}`,
      `MIME-Version: 1.0`,
      `Content-Type: multipart/alternative; boundary="${teamBoundary}"`,
      ``,
      `--${teamBoundary}`,
      `Content-Type: text/plain; charset=UTF-8`,
      `Content-Transfer-Encoding: quoted-printable`,
      ``,
      buildEmailText(body),
      `--${teamBoundary}`,
      `Content-Type: text/html; charset=UTF-8`,
      `Content-Transfer-Encoding: quoted-printable`,
      ``,
      buildEmailHtml(body),
      `--${teamBoundary}--`,
    ].join("\r\n");

    // Build applicant confirmation email (branded, to the applicant)
    const confirmSubject = `Your BrainSAIT Partner Application — We've Received It!`;
    const confirmBoundary = createMimeBoundary("confirm_boundary");
    const confirmRawEmail = [
      `From: BrainSAIT Partners <partner@brainsait.org>`,
      `To: ${safeFirstName} ${safeLastName} <${safeEmail}>`,
      `Reply-To: partner@brainsait.org`,
      `Subject: ${confirmSubject}`,
      `MIME-Version: 1.0`,
      `Content-Type: multipart/alternative; boundary="${confirmBoundary}"`,
      ``,
      `--${confirmBoundary}`,
      `Content-Type: text/plain; charset=UTF-8`,
      `Content-Transfer-Encoding: quoted-printable`,
      ``,
      buildConfirmationText(body),
      `--${confirmBoundary}`,
      `Content-Type: text/html; charset=UTF-8`,
      `Content-Transfer-Encoding: quoted-printable`,
      ``,
      buildConfirmationHtml(body),
      `--${confirmBoundary}--`,
    ].join("\r\n");

    try {
      await Promise.all([
        env.SEND_EMAIL_TEAM.send(new EmailMessage("no-reply@brainsait.org", "partner@brainsait.org", teamRawEmail)),
        env.SEND_EMAIL_APPLICANT.send(new EmailMessage("partner@brainsait.org", safeEmail, confirmRawEmail)),
      ]);
    } catch (err) {
      console.error("Failed to send email(s):", err);
      return new Response(JSON.stringify({ error: "Failed to deliver notification email" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true, message: "Application received. You will hear from us within 24–48 hours." }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  },
} satisfies ExportedHandler<Env>;
