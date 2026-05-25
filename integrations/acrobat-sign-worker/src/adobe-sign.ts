// ── Adobe Sign OAuth2 + API Client ──
// Supports both Commercial (.com) and Government (.us) clouds
// Commercial: x-api-user header for impersonation
// Government: RFC 8693 token exchange impersonation (no x-api-user)
import type { Env, AdobeTokenResponse, AdobeAgreementInfo, AgreementCreationRequest, AgreementResponse, CachedToken, CloudConfig } from './types';

const TOKEN_CACHE_KEY = 'adobe_sign_token_cache';
const TOKEN_REFRESH_BUFFER = 300; // refresh 5 min before expiry

// ── Cloud-specific endpoints ──
const CLOUD_CONFIGS: Record<string, CloudConfig> = {
  commercial: {
    authBaseUrl:  'https://secure.adobesign.com',
    apiBaseUrl:   'https://api.adobesign.com',
    authorizeUrl: 'https://secure.adobesign.com/public/oauth/v2',
    tokenUrl:     'https://secure.adobesign.com/oauth/v2/token',
    validateUrl:  'https://secure.adobesign.com/oauth/v2/token/validate',
    invalidateUrl:'https://secure.adobesign.com/oauth/v2/token/revoke',
    logoutUrl:    'https://secure.adobesign.com/logout',
  },
  gov: {
    authBaseUrl:  'https://secure.na1.adobesign.us',
    apiBaseUrl:   'https://api.na1.adobesign.us',
    authorizeUrl: 'https://secure.na1.adobesign.us/api/gateway/adobesignauthservice/api/v1/authorize',
    tokenUrl:     'https://secure.na1.adobesign.us/api/gateway/adobesignauthservice/api/v1/token',
    validateUrl:  'https://secure.na1.adobesign.us/api/gateway/adobesignauthservice/api/v1/validate_token',
    invalidateUrl:'https://secure.na1.adobesign.us/api/gateway/adobesignauthservice/api/v1/invalidate_token',
    logoutUrl:    'https://secure.na1.adobesign.us/api/gateway/adobesignauthservice/api/v1/logout',
  },
};

export class AdobeSignClient {
  private env: Env;
  private config: CloudConfig;
  private apiBaseUrl: string;

  constructor(env: Env) {
    this.env = env;
    const cloud = env.ADOBE_CLOUD || 'commercial';
    this.config = CLOUD_CONFIGS[cloud] || CLOUD_CONFIGS.commercial;
    this.apiBaseUrl = env.ADOBE_BASE_URL || this.config.apiBaseUrl;
  }

  // ── OAuth2: Get or refresh access token ──
  async getAccessToken(impersonateEmail?: string): Promise<string> {
    // If impersonating (gov cloud), we need a separate token per user
    const cacheKey = impersonateEmail
      ? `${TOKEN_CACHE_KEY}_imp_${impersonateEmail}`
      : TOKEN_CACHE_KEY;

    // Check KV cache
    const cached = await this.env.AUDIT_KV.get(cacheKey);
    if (cached) {
      try {
        const parsed: CachedToken = JSON.parse(cached);
        if (parsed.expires_at > Date.now() / 1000 + TOKEN_REFRESH_BUFFER) {
          return parsed.access_token;
        }
        // Token expiring, try refresh
        if (parsed.refresh_token) {
          return await this.refreshToken(parsed.refresh_token, cacheKey, impersonateEmail);
        }
      } catch { /* cache miss */ }
    }

    // Fresh token
    if (impersonateEmail && this.env.ADOBE_CLOUD === 'gov') {
      return await this.requestImpersonationToken(impersonateEmail, cacheKey);
    }
    return await this.requestNewToken(cacheKey);
  }

  // ── Client credentials / integration key token ──
  private async requestNewToken(cacheKey: string): Promise<string> {
    const params: Record<string, string> = {
      grant_type: 'client_credentials',
      client_id: this.env.ADOBE_CLIENT_ID,
      client_secret: this.env.ADOBE_CLIENT_SECRET,
      scope: this.env.ADOBE_SCOPES || 'agreement_write agreement_read agreement_send',
    };

    const resp = await fetch(this.config.tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(params),
    });

    if (!resp.ok) {
      const text = await resp.text();
      throw new Error(`Adobe token request failed (${resp.status}): ${text}`);
    }

    const data: AdobeTokenResponse = await resp.json();
    return this.cacheToken(data, cacheKey);
  }

  // ── Refresh expired token ──
  private async refreshToken(refreshToken: string, cacheKey: string, impersonateEmail?: string): Promise<string> {
    const params: Record<string, string> = {
      grant_type: 'refresh_token',
      client_id: this.env.ADOBE_CLIENT_ID,
      client_secret: this.env.ADOBE_CLIENT_SECRET,
      refresh_token: refreshToken,
    };

    const resp = await fetch(this.config.tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(params),
    });

    if (!resp.ok) {
      // Refresh failed, get fresh token
      if (impersonateEmail && this.env.ADOBE_CLOUD === 'gov') {
        return await this.requestImpersonationToken(impersonateEmail, cacheKey);
      }
      return await this.requestNewToken(cacheKey);
    }

    const data: AdobeTokenResponse = await resp.json();
    return this.cacheToken(data, cacheKey, impersonateEmail);
  }

  // ── Gov cloud impersonation via RFC 8693 token exchange ──
  // Exchange admin token for user-specific token
  private async requestImpersonationToken(userEmail: string, cacheKey: string): Promise<string> {
    // 1. Get admin token first (with acc_imp + offline_access scopes)
    const adminToken = await this.getAccessToken(); // no impersonateEmail = base admin token

    // 2. Build unsecured JWT with user email (base64(alg:none) + base64(user_email))
    const headerB64 = btoa(JSON.stringify({ alg: 'none' }));
    const payloadB64 = btoa(JSON.stringify({ user_email: userEmail }));
    const subjectToken = `${headerB64}.${payloadB64}`;

    // 3. Exchange admin token for impersonation token
    const params: Record<string, string> = {
      grant_type: 'urn:ietf:params:oauth:grant-type:token-exchange',
      client_id: this.env.ADOBE_CLIENT_ID,
      client_secret: this.env.ADOBE_CLIENT_SECRET,
      scope: this.env.ADOBE_SCOPES || 'agreement_write agreement_read agreement_send',
      actor_token_type: 'access_token',
      actor_token: adminToken,
      subject_token_type: 'jwt',
      subject_token: subjectToken,
    };

    const resp = await fetch(this.config.tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(params),
    });

    if (!resp.ok) {
      const text = await resp.text();
      throw new Error(`Adobe impersonation token failed (${resp.status}): ${text}`);
    }

    const data: AdobeTokenResponse = await resp.json();
    return this.cacheToken(data, cacheKey, userEmail);
  }

  // ── Cache token in KV ──
  private async cacheToken(data: AdobeTokenResponse, cacheKey: string, impersonateEmail?: string): Promise<string> {
    const cached: CachedToken = {
      access_token: data.access_token,
      refresh_token: data.refresh_token || null,
      expires_at: Math.floor(Date.now() / 1000) + data.expires_in,
      api_access_point: data.api_access_point,
      impersonated_for: impersonateEmail,
    };

    await this.env.AUDIT_KV.put(cacheKey, JSON.stringify(cached), {
      expirationTtl: Math.max(60, data.expires_in - 60),
    });

    // Update base URL if API returned a different access point (commercial)
    if (data.api_access_point) {
      this.apiBaseUrl = data.api_access_point;
    }

    return data.access_token;
  }

  // ── Generic REST API call ──
  private async api<T>(method: string, path: string, body?: any, impersonateEmail?: string): Promise<T> {
    const token = await this.getAccessToken(impersonateEmail);

    const headers: Record<string, string> = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'x-request-id': crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`,
    };

    // Commercial cloud supports x-api-user header directly
    // Gov cloud does NOT — impersonation happens at token level
    if (impersonateEmail && this.env.ADOBE_CLOUD === 'commercial') {
      headers['x-api-user'] = `email:${impersonateEmail}`;
    }

    const resp = await fetch(`${this.apiBaseUrl}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!resp.ok) {
      const text = await resp.text();
      throw new Error(`Adobe API ${method} ${path} failed (${resp.status}): ${text}`);
    }

    if (resp.status === 204) return {} as T;
    return resp.json() as Promise<T>;
  }

  // ── Upload document to transient storage ──
  async uploadDocument(documentName: string, documentBase64: string, impersonateEmail?: string): Promise<string> {
    const token = await this.getAccessToken(impersonateEmail);
    const binaryData = Uint8Array.from(atob(documentBase64), c => c.charCodeAt(0));

    const headers: Record<string, string> = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/pdf',
      'x-request-id': crypto.randomUUID?.() || `${Date.now()}`,
    };
    if (impersonateEmail && this.env.ADOBE_CLOUD === 'commercial') {
      headers['x-api-user'] = `email:${impersonateEmail}`;
    }

    const resp = await fetch(`${this.apiBaseUrl}/api/rest/v6/transientDocuments`, {
      method: 'POST',
      headers,
      body: binaryData,
    });

    if (!resp.ok) {
      const text = await resp.text();
      throw new Error(`Document upload failed (${resp.status}): ${text}`);
    }

    const result = await resp.json() as { transientDocumentId: string };
    return result.transientDocumentId;
  }

  // ── Create agreement (send for signing) ──
  async createAgreement(req: AgreementCreationRequest, impersonateEmail?: string): Promise<AgreementResponse> {
    // 1. Upload document
    const transientDocId = await this.uploadDocument(req.documentName, req.documentBase64, impersonateEmail);

    // 2. Build agreement request
    const agreementRequest: any = {
      name: req.documentName,
      signatureType: 'ESIGN',
      state: 'IN_PROCESS',
      fileInfos: [{ transientDocumentId: transientDocId }],
      participantSetsInfo: [
        {
          order: 1,
          role: 'SIGNER',
          memberInfos: [
            {
              email: req.signerEmail,
              name: req.signerName,
              ...(req.signerPhone ? { phone: req.signerPhone } : {}),
            },
          ],
        },
      ],
      ...(req.fields ? {
        mergeFieldInfo: Object.entries(req.fields).map(([name, defaultValue]) => ({
          fieldName: name,
          defaultValue,
        })),
      } : {}),
      ...(req.callbackUrl ? { callbackInfo: { url: req.callbackUrl } } : {}),
      expirationTime: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    };

    // 3. Create agreement
    const result = await this.api<{ id: string }>('POST', '/api/rest/v6/agreements', agreementRequest, impersonateEmail);

    // 4. Get signing URL for embed (with clickjacking defense)
    let signingUrl: string | undefined;
    try {
      const viewRequest: any = {};
      if (req.frameParent) {
        viewRequest.frameParent = req.frameParent;
      }
      const viewResp = await this.api<any>('POST', `/api/rest/v6/agreements/${result.id}/views`, viewRequest, impersonateEmail);
      signingUrl = viewResp.signingUrlSetInfos?.[0]?.signingUrls?.[0]?.esignUrl;
    } catch { /* embed URL optional */ }

    return {
      id: result.id,
      status: 'OUT_FOR_SIGNATURE',
      signingUrl,
    };
  }

  // ── Get agreement status ──
  async getAgreementStatus(agreementId: string, impersonateEmail?: string): Promise<AdobeAgreementInfo> {
    return this.api<AdobeAgreementInfo>('GET', `/api/rest/v6/agreements/${agreementId}`, undefined, impersonateEmail);
  }

  // ── Download signed document ──
  async downloadSignedDocument(agreementId: string, impersonateEmail?: string): Promise<Uint8Array> {
    const token = await this.getAccessToken(impersonateEmail);
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/pdf',
    };
    if (impersonateEmail && this.env.ADOBE_CLOUD === 'commercial') {
      headers['x-api-user'] = `email:${impersonateEmail}`;
    }

    const resp = await fetch(`${this.apiBaseUrl}/api/rest/v6/agreements/${agreementId}/combinedDocument`, {
      method: 'GET',
      headers,
    });

    if (!resp.ok) throw new Error(`Download failed (${resp.status})`);
    return new Uint8Array(await resp.arrayBuffer());
  }

  // ── Download audit trail ──
  async downloadAuditTrail(agreementId: string, impersonateEmail?: string): Promise<Uint8Array> {
    const token = await this.getAccessToken(impersonateEmail);
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/pdf',
    };
    if (impersonateEmail && this.env.ADOBE_CLOUD === 'commercial') {
      headers['x-api-user'] = `email:${impersonateEmail}`;
    }

    const resp = await fetch(`${this.apiBaseUrl}/api/rest/v6/agreements/${agreementId}/auditTrail`, {
      method: 'GET',
      headers,
    });

    if (!resp.ok) throw new Error(`Audit trail download failed (${resp.status})`);
    return new Uint8Array(await resp.arrayBuffer());
  }

  // ── Create webhook for agreement events ──
  async createWebhook(callbackUrl: string, impersonateEmail?: string): Promise<string> {
    const result = await this.api<{ id: string }>('POST', '/api/rest/v6/webhooks', {
      name: `BrainSAIT-TrustLayer-${Date.now()}`,
      scope: 'AGREEMENT',
      state: 'ACTIVE',
      webhookSubscriptionEvents: [
        'AGREEMENT_ALL',
      ],
      webhookUrlInfo: { url: callbackUrl },
      applicationInfo: { applicationName: 'BrainSAIT Trust Layer' },
    }, impersonateEmail);

    return result.id;
  }

  // ── Cancel agreement ──
  async cancelAgreement(agreementId: string, reason: string, impersonateEmail?: string): Promise<void> {
    await this.api('PUT', `/api/rest/v6/agreements/${agreementId}/status`, {
      value: 'CANCEL',
      comment: reason,
    }, impersonateEmail);
  }

  // ── Build authorization URL (for interactive OAuth flows) ──
  buildAuthorizeUrl(redirectUri: string, state: string, loginHint?: string): string {
    const params = new URLSearchParams({
      client_id: this.env.ADOBE_CLIENT_ID,
      response_type: 'code',
      redirect_uri: redirectUri,
      scope: this.env.ADOBE_SCOPES || 'agreement_write agreement_read',
      state,
      ...(loginHint ? { login_hint: loginHint } : {}),
    });
    return `${this.config.authorizeUrl}?${params.toString()}`;
  }

  // ── Exchange authorization code for token ──
  async exchangeCodeForToken(code: string, redirectUri: string): Promise<AdobeTokenResponse> {
    const resp = await fetch(this.config.tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: this.env.ADOBE_CLIENT_ID,
        client_secret: this.env.ADOBE_CLIENT_SECRET,
        code,
        redirect_uri: redirectUri,
      }),
    });

    if (!resp.ok) {
      const text = await resp.text();
      throw new Error(`Code exchange failed (${resp.status}): ${text}`);
    }

    return resp.json() as Promise<AdobeTokenResponse>;
  }

  // ── Validate token ──
  async validateToken(token: string): Promise<boolean> {
    const resp = await fetch(this.config.validateUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: this.env.ADOBE_CLIENT_ID,
        client_secret: this.env.ADOBE_CLIENT_SECRET,
        token,
        type: 'access_token',
      }),
    });

    if (!resp.ok) return false;
    const data = await resp.json() as { valid?: boolean };
    return data.valid === true;
  }

  // ── Invalidate/revoke token ──
  async invalidateToken(token: string): Promise<void> {
    await fetch(this.config.invalidateUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: this.env.ADOBE_CLIENT_ID,
        client_secret: this.env.ADOBE_CLIENT_SECRET,
        token,
        token_type: 'access_token',
      }),
    });
  }
}
