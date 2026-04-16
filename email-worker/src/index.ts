import { EmailMessage } from "cloudflare:email";

export interface Env {
  SEND_EMAIL: SendEmail;
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

function isValidPartnerApplication(data: unknown): data is PartnerApplication {
  if (typeof data !== "object" || data === null) return false;
  const d = data as Record<string, unknown>;
  const requiredFields = ["firstName", "lastName", "email", "organization", "country", "partnerType", "description"];
  return requiredFields.every((f) => typeof d[f] === "string" && (d[f] as string).trim().length > 0);
}

function isValidEmail(email: string): boolean {
  const atIndex = email.indexOf("@");
  if (atIndex <= 0 || atIndex !== email.lastIndexOf("@")) return false;
  const domain = email.slice(atIndex + 1);
  const dotIndex = domain.lastIndexOf(".");
  return dotIndex > 0 && dotIndex < domain.length - 1 && !domain.includes(" ");
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

    const subject = `[Partner Application] ${safeFirstName} ${safeLastName} — ${safeOrg}`;
    const htmlBody = buildEmailHtml(body);
    const textBody = buildEmailText(body);

    // Build raw MIME email
    const rawEmail = [
      `From: PartnerLinc <no-reply@brainsait.org>`,
      `To: partner@brainsait.org`,
      `Reply-To: ${safeFirstName} ${safeLastName} <${safeEmail}>`,
      `Subject: ${subject}`,
      `MIME-Version: 1.0`,
      `Content-Type: multipart/alternative; boundary="boundary_alt"`,
      ``,
      `--boundary_alt`,
      `Content-Type: text/plain; charset=UTF-8`,
      `Content-Transfer-Encoding: quoted-printable`,
      ``,
      textBody,
      `--boundary_alt`,
      `Content-Type: text/html; charset=UTF-8`,
      `Content-Transfer-Encoding: quoted-printable`,
      ``,
      htmlBody,
      `--boundary_alt--`,
    ].join("\r\n");

    const message = new EmailMessage(
      "no-reply@brainsait.org",
      "partner@brainsait.org",
      rawEmail,
    );

    try {
      await env.SEND_EMAIL.send(message);
    } catch (err) {
      console.error("Failed to send email:", err);
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
