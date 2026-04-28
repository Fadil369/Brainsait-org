#!/usr/bin/env python3
"""
Oracle RAD ↔ NPHIES Bridge
BrainSAIT / ClaimLinc — Step 2 of full ecosystem integration

Maps Oracle RAD hospital branches to NPHIES facility licenses
and provides unified query functions across both systems.
"""

# ─── Oracle RAD ↔ NPHIES Branch Mapping ─────────────────────────────────────

ORACLE_TO_NPHIES = {
    "riyadh":  {
        "oracle_branch": "riyadh",
        "nphies_license": "10000000000988",
        "nphies_name": "Al-Hayat National Hospital,",
        "nphies_registry": "1048",
    },
    "madinah": {
        "oracle_branch": "madinah",
        "nphies_license": "10000300220660",
        "nphies_name": "Aldar National Hospital (Hayat National Hospital – Madinah Branch 5)",
        "nphies_registry": "1122",
    },
    "unaizah": {
        "oracle_branch": "unaizah",
        "nphies_license": "10000000030262",
        "nphies_name": "Al-Hayat National Hospital - Unaizah - Al-Qassim",
        "nphies_registry": "1075",
    },
    "khamis":  {
        "oracle_branch": "khamis",
        "nphies_license": "10000000030643",
        "nphies_name": "Al-Hayat National Hospital-Khamis Mushait",
        "nphies_registry": "1085",
    },
    "jizan":   {
        "oracle_branch": "jizan",
        "nphies_license": "10000000037034",
        "nphies_name": "The National Life Hospital, Jazan",
        "nphies_registry": "1172",
    },
    "abha":    {
        "oracle_branch": "abha",
        "nphies_license": "10000300330931",
        "nphies_name": "HNHN ABHA",
        "nphies_registry": "1460",
    },
}

# ─── Network KPIs (live as of 2026-04-26) ────────────────────────────────────

NETWORK_SNAPSHOT = {
    "as_of": "2026-04-26",
    "source": "NPHIES Transaction Viewer + Oracle RAD",
    "org": "AlInma Medical Services Company (Hayat National Hospital Group)",
    "org_id": 624,
    "financials": {
        "network_total_sar": 835_690_702.81,
        "network_approved_sar": 824_333_150.45,
        "network_approval_rate_pct": 98.6,
        "total_claims_gss": 15_138,
    },
    "by_branch": {
        "riyadh":  {"total_sar": 97_868_522.80,  "approved_sar": 86_567_405.65,  "claims": 1653,  "gss_count": 20,  "approval_pct": 88.5},
        "madinah": {"total_sar": 91_844_403.34,  "approved_sar": 91_844_403.34,  "claims": 1851,  "gss_count": 12,  "approval_pct": 100.0},
        "unaizah": {"total_sar": 120_756_616.44, "approved_sar": 120_700_181.23, "claims": 1919,  "gss_count": 13,  "approval_pct": 100.0},
        "khamis":  {"total_sar": 200_878_960.62, "approved_sar": 200_878_960.62, "claims": 3899,  "gss_count": 12,  "approval_pct": 100.0},
        "jizan":   {"total_sar": 211_608_564.04, "approved_sar": 211_608_564.04, "claims": 2891,  "gss_count": 11,  "approval_pct": 100.0},
        "abha":    {"total_sar": 112_733_635.57, "approved_sar": 112_733_635.57, "claims": 2925,  "gss_count": 11,  "approval_pct": 100.0},
    },
    "prior_auth": {
        "network_total_pa": 51_018,
        "network_pa_check_status": 10_673,
        "by_branch": {
            "riyadh":  {"pa": 16_229, "check_status": 430},
            "madinah": {"pa": 8_194,  "check_status": 85},
            "unaizah": {"pa": 7_251,  "check_status": 141},
            "khamis":  {"pa": 14_397, "check_status": 319},
            "jizan":   {"pa": 4_370,  "check_status": 9539},
            "abha":    {"pa": 577,    "check_status": 159},
        }
    },
    "coc": {
        "total_coc_org_wide": 564,
    }
}


def get_nphies_license(oracle_branch: str) -> str:
    """Get NPHIES facility license for an Oracle RAD branch."""
    return ORACLE_TO_NPHIES.get(oracle_branch, {}).get("nphies_license", "")


def get_branch_snapshot(branch: str) -> dict:
    """Get financial + PA snapshot for a specific branch."""
    fin = NETWORK_SNAPSHOT["by_branch"].get(branch, {})
    pa  = NETWORK_SNAPSHOT["prior_auth"]["by_branch"].get(branch, {})
    mapping = ORACLE_TO_NPHIES.get(branch, {})
    return {
        "branch": branch,
        "oracle_branch": mapping.get("oracle_branch"),
        "nphies_license": mapping.get("nphies_license"),
        "nphies_name": mapping.get("nphies_name"),
        "financials": fin,
        "prior_auth": pa,
    }


def get_network_summary() -> dict:
    """Full network summary for executive/Basma queries."""
    return NETWORK_SNAPSHOT


if __name__ == "__main__":
    import json
    print("=== Oracle RAD ↔ NPHIES Branch Mapping ===\n")
    for branch, data in ORACLE_TO_NPHIES.items():
        snap = get_branch_snapshot(branch)
        fin = snap["financials"]
        pa = snap["prior_auth"]
        print(f"  {branch.upper()}")
        print(f"    NPHIES License: {data['nphies_license']}")
        print(f"    Financial: SAR {fin.get('total_sar', 0):,.2f} | Approval: {fin.get('approval_pct', 0)}%")
        print(f"    Prior Auth: {pa.get('pa', 0):,} requests | {pa.get('check_status', 0):,} check-status")
        print()
    
    net = get_network_summary()
    print(f"NETWORK TOTAL: SAR {net['financials']['network_total_sar']:,.2f}")
    print(f"APPROVAL RATE: {net['financials']['network_approval_rate_pct']}%")
    print(f"TOTAL PA: {net['prior_auth']['network_total_pa']:,}")
