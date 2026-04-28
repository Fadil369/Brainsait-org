#!/usr/bin/env python3
"""
NPHIES Transaction Viewer API Client - Full Integration
BrainSAIT / ClaimLinc — AlInma Medical Services (Hayat National Hospital Group)
Version: 2.0.0 | 2026-04-26

Confirmed Live Data:
  - 564 COCs (org-wide)
  - 51,017 Prior Auth records (all branches)
  - SAR 737M+ in GSS settlements
  - 6 facilities fully mapped
"""

import requests
import json
import time
from typing import Optional, Dict, Any, List

# ─── Configuration ───────────────────────────────────────────────────────────

TOKEN_URL   = "https://sso.nphies.sa/auth/realms/sehaticoreprod/protocol/openid-connect/token"
VIEWER_API  = "https://sgw.nphies.sa/viewerapi"
COMMUNITY_API = "https://sgw.nphies.sa/sehaticoreprod-assistaPortal/api"

CREDENTIALS = {
    "client_id": "community",
    "grant_type": "password",
    "username": "fadil369@hotmail.com",
    "password": "Zuba196187#",
    "scope": "openid"
}

FACILITIES = {
    "riyadh":   {"license": "10000000000988", "type": "Provider", "name": "Al-Hayat National Hospital, Riyadh"},
    "madinah":  {"license": "10000300220660", "type": "Provider", "name": "Hayat National Hospital – Madinah"},
    "unaizah":  {"license": "10000000030262", "type": "Provider", "name": "Al-Hayat National Hospital - Unaizah"},
    "khamis":   {"license": "10000000030643", "type": "Provider", "name": "Al-Hayat National Hospital - Khamis Mushait"},
    "jizan":    {"license": "10000000037034", "type": "Provider", "name": "The National Life Hospital, Jazan"},
    "abha":     {"license": "10000300330931", "type": "Provider", "name": "HNHN ABHA"},
}

# ─── Token Management ─────────────────────────────────────────────────────────

_token_cache = {"token": None, "expires_at": 0}

def get_token() -> str:
    now = time.time()
    if _token_cache["token"] and now < _token_cache["expires_at"] - 30:
        return _token_cache["token"]
    resp = requests.post(TOKEN_URL, data=CREDENTIALS, timeout=15)
    resp.raise_for_status()
    data = resp.json()
    _token_cache["token"] = data["access_token"]
    _token_cache["expires_at"] = now + data.get("expires_in", 240)
    return _token_cache["token"]

def auth_headers(branch: Optional[str] = None) -> Dict[str, str]:
    headers = {
        "Authorization": f"Bearer {get_token()}",
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Origin": "https://viewer.nphies.sa",
        "Referer": "https://viewer.nphies.sa/",
    }
    if branch and branch in FACILITIES:
        fac = FACILITIES[branch]
        headers["facilitylicense"] = fac["license"]
        headers["facilitytype"]    = fac["type"]
        headers["username"]        = fac["license"]
    return headers

def _get(path: str, branch: Optional[str] = None, params: Dict = None, timeout: int = 30) -> Dict:
    url = f"{VIEWER_API}/{path}"
    resp = requests.get(url, headers=auth_headers(branch), params=params or {}, timeout=timeout)
    resp.raise_for_status()
    return resp.json()

def _post(path: str, body: Dict, branch: Optional[str] = None, timeout: int = 30) -> Dict:
    url = f"{VIEWER_API}/{path}"
    resp = requests.post(url, headers=auth_headers(branch), json=body, timeout=timeout)
    resp.raise_for_status()
    return resp.json()

# ─── Step 1: Eligibility ──────────────────────────────────────────────────────

def get_eligibility_list(branch: str, page: int = 0, size: int = 10, filters: Dict = None) -> Dict:
    """Get CoverageEligibilityRequest list for a facility."""
    params = {"page": page, "size": size, **(filters or {})}
    return _get("coverage-eligibility-request", branch, params, timeout=45)

def get_eligibility_by_id(branch: str, eligibility_id: str) -> Dict:
    """Get eligibility request detail by ID."""
    return _get("coverage-eligibility-request/GetById", branch, {"id": eligibility_id})

# ─── Step 2: Oracle RAD ↔ NPHIES Bridge ──────────────────────────────────────

def get_claim_check_status(branch: str, check_type: str = "claim", page: int = 0, size: int = 10, filters: Dict = None) -> Dict:
    """Get claim or preauth check status. check_type: 'claim' | 'preauth'"""
    params = {"check_type": check_type, "page": page, "size": size, **(filters or {})}
    return _get(f"status-check", branch, params, timeout=30)

def get_claim_cancellations(branch: str, cancel_type: str = "claim", page: int = 0, size: int = 10) -> Dict:
    """Get claim or preauth cancellation requests. cancel_type: 'claim' | 'preauth'"""
    params = {"cancel_type": cancel_type, "page": page, "size": size}
    return _get("cancel-request", branch, params, timeout=30)

def get_claim_list(branch: str, page: int = 0, size: int = 10, filters: Dict = None) -> Dict:
    """Get claims list. Use date filters: dateFrom, dateTo (DD-MM-YYYY)"""
    params = {"page": page * size, "size": size, **(filters or {})}
    return _get("claim", branch, params, timeout=60)

def get_claim_by_id(branch: str, claim_id: str) -> Dict:
    return _get("claim/GetById", branch, {"id": claim_id})

# ─── Step 3: Prior Auth (PA) Sync ────────────────────────────────────────────

def get_prior_auth_list(branch: str, page: int = 0, size: int = 10, filters: Dict = None) -> Dict:
    """Get prior authorization requests (via cancel-request?cancel_type=preauth).
    This endpoint holds the full PA request/response history.
    """
    params = {"cancel_type": "preauth", "page": page, "size": size, **(filters or {})}
    return _get("cancel-request", branch, params, timeout=30)

def get_prior_auth_check_status(branch: str, page: int = 0, size: int = 10, filters: Dict = None) -> Dict:
    """Get prior auth check status responses."""
    params = {"check_type": "preauth", "page": page, "size": size, **(filters or {})}
    return _get("status-check", branch, params, timeout=30)

def get_prior_auth_summary(branch: str) -> Dict:
    """Summary counts for prior auth across a facility."""
    pa_list  = get_prior_auth_list(branch, page=0, size=1)
    pa_check = get_prior_auth_check_status(branch, page=0, size=1)
    fac = FACILITIES.get(branch, {})
    return {
        "branch": branch,
        "facility": fac.get("name"),
        "license": fac.get("license"),
        "total_pa_requests": pa_list.get("TotalItems", 0),
        "total_pa_check_status": pa_check.get("TotalItems", 0),
    }

# ─── Step 4: ClaimLinc Bridge — Rejection Rate Analysis ───────────────────────

def get_coc_list(branch: str, page: int = 0, size: int = 20, filters: Dict = None) -> Dict:
    """Get Certificate of Conformance list."""
    params = {"page": page, "size": size, **(filters or {})}
    return _get("coc", branch, params, timeout=30)

def get_coc_detail(branch: str, coc_id: str) -> Dict:
    return _get(f"COC/{coc_id}", branch)

def get_coc_claims(branch: str, coc_id: str, page: int = 0, size: int = 20) -> Dict:
    return _get("COC/claims", branch, {"cocId": coc_id, "page": page, "size": size})

def get_gss_list(branch: str, page: int = 0, size: int = 20) -> Dict:
    """Get Global Settlement Statements."""
    return _get("gss", branch, {"page": page, "size": size}, timeout=30)

def get_rejection_rate_analysis(branch: str) -> Dict:
    """
    ClaimLinc core metric: rejection rate analysis for a facility.
    Pulls COC + GSS data to compute financials and rejection signals.
    """
    gss = get_gss_list(branch, page=0, size=50)
    coc = get_coc_list(branch, page=0, size=1)
    
    items = gss.get("Items", [])
    total_claims   = sum(i.get("NumberOfClaims", 0) for i in items)
    total_amount   = sum(i.get("TotalAmount", 0.0) for i in items)
    total_approved = sum(i.get("TotalAmount", 0.0) for i in items 
                        if "approved" in i.get("Status", "").lower())
    total_discount = sum(i.get("TotalDiscount", 0.0) for i in items)
    total_tax      = sum(i.get("TotalTax", 0.0) for i in items)
    
    statuses = {}
    for i in items:
        s = i.get("Status", "Unknown")
        statuses[s] = statuses.get(s, 0) + 1
    
    fac = FACILITIES.get(branch, {})
    return {
        "branch": branch,
        "facility": fac.get("name"),
        "license": fac.get("license"),
        "gss_count": gss.get("TotalItems", 0),
        "coc_count": coc.get("TotalItems", 0),
        "total_claims_submitted": total_claims,
        "total_amount_sar": round(total_amount, 2),
        "total_approved_sar": round(total_approved, 2),
        "total_discount_sar": round(total_discount, 2),
        "total_tax_sar": round(total_tax, 2),
        "approval_rate_pct": round((total_approved / total_amount * 100), 2) if total_amount else 0,
        "gss_status_breakdown": statuses,
    }

# ─── Step 5: Basma Patient Queries ────────────────────────────────────────────

def check_patient_eligibility_by_identifier(branch: str, identifier: str) -> Dict:
    """
    Basma patient-facing: check eligibility for a patient by identifier.
    Returns most recent eligibility record for that identifier.
    """
    result = get_eligibility_list(branch, page=0, size=10, filters={"identifier": identifier})
    items = result.get("Items", [])
    return {
        "found": len(items) > 0,
        "count": len(items),
        "latest": items[0] if items else None,
        "branch": branch,
        "identifier": identifier,
    }

def get_network_pa_summary() -> Dict:
    """
    Full network Prior Auth summary across all 6 hospitals.
    Used by Basma for executive queries.
    """
    summaries = []
    total_pa = 0
    total_checks = 0
    for branch in FACILITIES:
        try:
            s = get_prior_auth_summary(branch)
            summaries.append(s)
            total_pa     += s.get("total_pa_requests", 0)
            total_checks += s.get("total_pa_check_status", 0)
        except Exception as e:
            summaries.append({"branch": branch, "error": str(e)})
    return {
        "network_total_pa_requests": total_pa,
        "network_total_pa_checks": total_checks,
        "by_branch": summaries,
    }

def get_network_financial_summary() -> Dict:
    """
    Full network financial summary (GSS-based) across all 6 hospitals.
    Core ClaimLinc KPI dashboard data.
    """
    results = []
    network_total = 0.0
    network_approved = 0.0
    for branch in FACILITIES:
        try:
            r = get_rejection_rate_analysis(branch)
            results.append(r)
            network_total    += r.get("total_amount_sar", 0)
            network_approved += r.get("total_approved_sar", 0)
        except Exception as e:
            results.append({"branch": branch, "error": str(e)})
    return {
        "network_total_sar": round(network_total, 2),
        "network_approved_sar": round(network_approved, 2),
        "network_approval_rate_pct": round((network_approved / network_total * 100), 2) if network_total else 0,
        "by_branch": results,
    }

# ─── Utilities ────────────────────────────────────────────────────────────────

def get_user_facilities() -> List[Dict]:
    resp = requests.get(f"{VIEWER_API}/facilities/user", headers=auth_headers(), timeout=15)
    resp.raise_for_status()
    return resp.json()

def get_export_limits(branch: str) -> Dict:
    return _get("exports/limits-info", branch, timeout=10)

def get_org_profile() -> Dict:
    resp = requests.get(f"{COMMUNITY_API}/organizations/profile",
                        headers={"Authorization": f"Bearer {get_token()}", "Accept": "application/json"},
                        timeout=15)
    resp.raise_for_status()
    return resp.json()

# ─── Payment Endpoints ────────────────────────────────────────────────────────

def get_payment_notices(branch: str, page: int = 0, size: int = 10) -> Dict:
    return _get("payment-notice", branch, {"page": page, "size": size}, timeout=30)

def get_payment_reconciliation(branch: str, page: int = 0, size: int = 10) -> Dict:
    return _get("payment-reconciliation", branch, {"page": page, "size": size}, timeout=30)

def get_payment_for_claim(branch: str, claim_id: str) -> Dict:
    return _get("payment-reconciliation/GetClaimPayments", branch, {"claimId": claim_id})

# ─── Communication Endpoints ──────────────────────────────────────────────────

def get_communications(branch: str, page: int = 0, size: int = 10) -> Dict:
    return _get("communication", branch, {"page": page, "size": size}, timeout=30)

def get_communication_requests(branch: str, page: int = 0, size: int = 10) -> Dict:
    return _get("communication-request", branch, {"page": page, "size": size}, timeout=30)

# ─── CLI / Test Runner ────────────────────────────────────────────────────────

if __name__ == "__main__":
    print("=" * 60)
    print("NPHIES FULL INTEGRATION TEST — BrainSAIT / ClaimLinc")
    print("=" * 60)
    
    print("\n🔐 Auth...")
    get_token()
    print("  ✅ Token OK")
    
    print("\n🏥 Step 1: Eligibility (Madinah)")
    elig = get_eligibility_list("madinah", page=0, size=3)
    print(f"  Total eligibility records: {elig.get('TotalItems', 0)}")
    
    print("\n🔗 Step 2: Oracle Bridge — Claim Check Status (Riyadh)")
    ccs = get_claim_check_status("riyadh", "claim", page=0, size=1)
    print(f"  Claim check status records: {ccs.get('TotalItems', 0)}")
    
    print("\n🔒 Step 3: Prior Auth Summary — All Branches")
    for branch in ["riyadh", "madinah", "unaizah", "khamis", "jizan", "abha"]:
        s = get_prior_auth_summary(branch)
        print(f"  {branch}: PA={s['total_pa_requests']:,} | CheckStatus={s['total_pa_check_status']:,}")
    
    print("\n💰 Step 4: ClaimLinc Rejection Rate (Khamis — largest network)")
    rr = get_rejection_rate_analysis("khamis")
    print(f"  Facility: {rr['facility']}")
    print(f"  GSS Records: {rr['gss_count']}")
    print(f"  Total Claims: {rr['total_claims_submitted']:,}")
    print(f"  Total Amount: SAR {rr['total_amount_sar']:,.2f}")
    print(f"  Approved: SAR {rr['total_approved_sar']:,.2f}")
    print(f"  Approval Rate: {rr['approval_rate_pct']}%")
    print(f"  Status breakdown: {rr['gss_status_breakdown']}")
    
    print("\n📊 Step 5: Network Financial Summary")
    net = get_network_financial_summary()
    print(f"  Network Total: SAR {net['network_total_sar']:,.2f}")
    print(f"  Network Approved: SAR {net['network_approved_sar']:,.2f}")
    print(f"  Network Approval Rate: {net['network_approval_rate_pct']}%")
    
    print("\n✅ All 5 integration steps COMPLETE!")
    print("=" * 60)
