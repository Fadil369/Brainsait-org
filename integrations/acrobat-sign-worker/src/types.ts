// ── Acrobat Sign API Types ──

export interface Env {
  ADOBE_CLIENT_ID: string;
  ADOBE_CLIENT_SECRET: string;
  ADOBE_SCOPES: string;
  ADOBE_CLOUD: 'commercial' | 'gov';          // determines base URL
  ADOBE_BASE_URL: string;                       // override if set, otherwise auto from cloud
  ADOBE_WEBHOOK_SECRET: string;
  ADOBE_ADMIN_EMAIL: string;                    // admin email for impersonation (gov cloud)
  DB: D1Database;
  AUDIT_KV: KVNamespace;
}

export interface AdobeTokenResponse {
  access_token: string;
  refresh_token?: string;
  token_type: string;
  expires_in: number;
  scope?: string;
  api_access_point?: string;  // commercial only
}

export interface AgreementCreationRequest {
  documentName: string;
  documentBase64: string;       // Base64-encoded PDF
  signerEmail: string;
  signerName: string;
  signerPhone?: string;
  callbackUrl?: string;         // Webhook URL for status updates
  fields?: Record<string, string>; // Pre-fill fields
  crNumber?: string;            // BrainSAIT CR context
  verificationId?: string;      // BrainSAIT verification ID
  frameParent?: string;         // Clickjacking defense for iframe embeds
}

export interface AgreementResponse {
  id: string;
  status: 'OUT_FOR_SIGNATURE' | 'SIGNED' | 'CANCELLED' | 'EXPIRED' | 'ABORTED';
  message?: string;
  signingUrl?: string;          // Embed signing URL
}

export interface SigningRecord {
  id: string;
  agreement_id: string;
  cr_number: string;
  verification_id: string;
  signer_email: string;
  signer_name: string;
  status: string;
  document_name: string;
  created_at: string;
  signed_at: string | null;
  signed_pdf_url: string | null;
  audit_trail_url: string | null;
}

// Adobe Sign API response shapes
export interface AdobeAgreementInfo {
  id: string;
  status: string;
  name: string;
  message?: string;
  participantSetsInfo?: Array<{
    id: string;
    memberInfos: Array<{
      email: string;
      name: string;
      status: string;
    }>;
  }>;
  displayDate?: string;
  createdDate?: string;
  expirationTime?: string;
}

export interface AdobeWebhookEvent {
  webhookId: string;
  webhookNotificationId: string;
  event: string;
  eventDate: string;
  eventResourceType: string;
  eventResource: {
    id: string;
    agreement?: AdobeAgreementInfo;
  };
  name?: string;
  scope?: string;
}

// Token cache shape in KV
export interface CachedToken {
  access_token: string;
  refresh_token: string | null;
  expires_at: number;       // unix timestamp
  api_access_point?: string;
  impersonated_for?: string; // email of impersonated user (gov only)
}

// Auth endpoint config per cloud type
export interface CloudConfig {
  authBaseUrl: string;       // OAuth token endpoints
  apiBaseUrl: string;        // REST API endpoints
  authorizeUrl: string;
  tokenUrl: string;
  validateUrl: string;
  invalidateUrl: string;
  logoutUrl: string;
}
