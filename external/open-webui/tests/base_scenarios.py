#!/usr/bin/env python3
"""
BrainSAIT LINC Agents — Comprehensive End-to-End Test Suite
Tests 13 agents × realistic Saudi healthcare scenarios
"""
import requests, json, time, sys, os
from datetime import datetime

BASE_URL = "http://localhost:3000"
API_KEY  = "sk-brainsait-4a4bf67acc084d3560faa0670b7f0d6465df4b3d"
HEADERS  = {"Authorization": f"Bearer {API_KEY}", "Content-Type": "application/json"}
TIMEOUT  = 90  # seconds per test

# ─────────────────────────────────────────────────────────
# TEST SCENARIOS  —  13 agents × 2-3 scenarios each
# ─────────────────────────────────────────────────────────
SCENARIOS = [
    # ── MASTERLINC ──────────────────────────────────────
    {
        "agent": "masterlinc",
        "name": "MASTERLINC-01: Triage & Route",
        "journey": "Orchestration",
        "prompt": "I need to process an insurance claim for a diabetic patient and also book a follow-up appointment. Where do I start?",
        "expect_keywords": ["claim", "ClaimLinc", "appointment", "schedule", "route"],
    },
    {
        "agent": "masterlinc",
        "name": "MASTERLINC-02: Emergency Escalation",
        "journey": "Orchestration",
        "prompt": "Patient presenting with chest pain 8/10, diaphoresis, and left arm radiation. What actions should be taken?",
        "expect_keywords": ["emergency", "urgent", "ECG", "cardiac", "escalat"],
    },

    # ── CLAIMLINC ──────────────────────────────────────
    {
        "agent": "claimlinc",
        "name": "CLAIMLINC-01: Tawnia Diabetes Claim",
        "journey": "RCM / Claims",
        "prompt": "Process a claim for Tawnia Insurance. Patient: Ahmed Al-Qahtani, DOB 1985-03-15. Diagnosis: Type 2 Diabetes with nephropathy (ICD-10: E11.65). Services: HbA1c test + nephrology consultation. Total: SAR 850.",
        "expect_keywords": ["E11", "diabetes", "Tawnia", "SAR", "claim"],
    },
    {
        "agent": "claimlinc",
        "name": "CLAIMLINC-02: Rejection Analysis",
        "journey": "RCM / Claims",
        "prompt": "NPHIES returned rejection code X204 for claim #CLM-2026-00892. Diagnosis was J18.9 (pneumonia), treatment was IV antibiotics 5 days. How do I appeal?",
        "expect_keywords": ["X204", "appeal", "pneumonia", "rejection", "resubmit"],
    },

    # ── AUTHLINC ──────────────────────────────────────
    {
        "agent": "authlinc",
        "name": "AUTHLINC-01: MRI Prior Auth",
        "journey": "Prior Authorization",
        "prompt": "Submit prior auth request for Bupa Arabia patient: MRI lumbar spine (CPT 72148). Patient has 3-month history of lower back pain, failed conservative management (physiotherapy × 8 sessions). Insurance ID: BUP-9871234.",
        "expect_keywords": ["prior", "auth", "MRI", "lumbar", "Bupa", "criteria"],
    },
    {
        "agent": "authlinc",
        "name": "AUTHLINC-02: Cardiac Cath Approval",
        "journey": "Prior Authorization",
        "prompt": "Al Rajhi Takaful patient needs cardiac catheterization. Positive stress test, troponin 0.8 ng/mL. What documentation is required for auth approval?",
        "expect_keywords": ["cardiac", "catheterization", "Al Rajhi", "stress test", "document"],
    },

    # ── DRGLINC ──────────────────────────────────────
    {
        "agent": "drglinc",
        "name": "DRGLINC-01: Hip Fracture Case-Mix",
        "journey": "DRG Optimization",
        "prompt": "Calculate Saudi DRG for: 72yo female, NOF (S72.0), hip hemiarthroplasty, DM2 + HTN as comorbidities, LOS 6 days, ICU 1 day. What is the expected DRG group and reimbursement tier?",
        "expect_keywords": ["DRG", "hip", "hemiarthroplasty", "comorbid", "reimburse"],
    },
    {
        "agent": "drglinc",
        "name": "DRGLINC-02: CABG Optimization",
        "journey": "DRG Optimization",
        "prompt": "Optimize documentation for CABG patient: 3-vessel disease, LIMA+SVG grafts, pump time 110min, LOS 8 days, post-op AF. What secondary diagnoses maximize DRG weight?",
        "expect_keywords": ["CABG", "DRG", "documentation", "AF", "weight"],
    },

    # ── CLINICALLINC ──────────────────────────────────
    {
        "agent": "clinicallinc",
        "name": "CLINICALLINC-01: Hypertensive Emergency",
        "journey": "Clinical Decision Support",
        "prompt": "45yo male, BP 210/130, severe headache, confusion. No prior medical history. What is the differential diagnosis and immediate management protocol?",
        "expect_keywords": ["hypertensive", "emergency", "BP", "IV", "protocol"],
    },
    {
        "agent": "clinicallinc",
        "name": "CLINICALLINC-02: Sepsis Protocol",
        "journey": "Clinical Decision Support",
        "prompt": "Post-surgical patient: fever 39.5°C, HR 115, RR 24, WBC 18k, lactate 3.2 mmol/L, BP 90/60. Activate appropriate protocol.",
        "expect_keywords": ["sepsis", "bundle", "antibiotics", "cultures", "protocol"],
    },

    # ── HEALTHCARELINC ──────────────────────────────────
    {
        "agent": "healthcarelinc",
        "name": "HEALTHCARELINC-01: New Patient Journey",
        "journey": "Patient Journey",
        "prompt": "I'm a new patient and I want to register with the hospital and book my first cardiology appointment. What documents do I need and how does the process work?",
        "expect_keywords": ["national ID", "registration", "cardiology", "appointment", "insurance"],
    },
    {
        "agent": "healthcarelinc",
        "name": "HEALTHCARELINC-02: Discharge Planning",
        "journey": "Patient Journey",
        "prompt": "Patient ready for discharge after knee replacement. She lives alone, is diabetic, and has no transport. What discharge planning steps are needed?",
        "expect_keywords": ["discharge", "physiotherapy", "diabetic", "transport", "follow-up"],
    },

    # ── RADIOLINC ──────────────────────────────────────
    {
        "agent": "radiolinc",
        "name": "RADIOLINC-01: CXR Interpretation Support",
        "journey": "Radiology AI",
        "prompt": "CXR findings: bilateral lower zone opacification, air bronchograms present, small right pleural effusion. Patient: 68yo with 4-day fever, productive cough, SpO2 91%. Suggest structured report and next imaging.",
        "expect_keywords": ["pneumonia", "consolidation", "bilateral", "CT", "report"],
    },
    {
        "agent": "radiolinc",
        "name": "RADIOLINC-02: MRI Brain Protocol",
        "journey": "Radiology AI",
        "prompt": "Request MRI brain protocol for 55yo female with sudden onset left-sided weakness and dysarthria, onset 2 hours ago. What sequences are mandatory per Saudi stroke protocol?",
        "expect_keywords": ["DWI", "stroke", "protocol", "perfusion", "sequences"],
    },

    # ── CODELINC ──────────────────────────────────────
    {
        "agent": "codelinc",
        "name": "CODELINC-01: Diabetes Complication Coding",
        "journey": "Medical Coding",
        "prompt": "Code the following encounter: Type 2 DM patient on hemodialysis for ESRD due to diabetic nephropathy. Also has peripheral neuropathy and background diabetic retinopathy. Provide all ICD-10 codes with sequencing rules.",
        "expect_keywords": ["E11", "N18", "ICD-10", "code", "sequence"],
    },
    {
        "agent": "codelinc",
        "name": "CODELINC-02: Surgical Procedure Codes",
        "journey": "Medical Coding",
        "prompt": "Laparoscopic cholecystectomy with intraoperative cholangiogram for acute cholecystitis with cholelithiasis. Patient also had CBD exploration. Provide CPT codes for NPHIES submission.",
        "expect_keywords": ["cholecystectomy", "CPT", "laparoscopic", "cholangiogram", "code"],
    },

    # ── BRIDGELINC ──────────────────────────────────────
    {
        "agent": "bridgelinc",
        "name": "BRIDGELINC-01: FHIR Patient Resource",
        "journey": "FHIR Integration",
        "prompt": "Convert this patient record to FHIR R4 Patient resource: Name: محمد القحطاني, DOB: 1990-06-15, National ID: 1234567890, Gender: Male, Phone: +966501234567, Insurance: Tawnia #TAW123456.",
        "expect_keywords": ["FHIR", "Patient", "resourceType", "identifier", "telecom"],
    },
    {
        "agent": "bridgelinc",
        "name": "BRIDGELINC-02: NPHIES Claim Bundle",
        "journey": "FHIR Integration",
        "prompt": "Build a minimal NPHIES FHIR Claim bundle for: Hospital NPI 7001234, Patient above, Service: ECG (LOINC 11524-6), Date: 2026-04-10, Amount SAR 150, Insurance: Tawnia.",
        "expect_keywords": ["Bundle", "Claim", "NPHIES", "LOINC", "SAR"],
    },

    # ── COMPLIANCELINC ──────────────────────────────────
    {
        "agent": "compliancelinc",
        "name": "COMPLIANCELINC-01: PDPO Assessment",
        "journey": "Compliance",
        "prompt": "We want to share de-identified patient data with a research university in Saudi Arabia. Under Saudi PDPO, what safeguards are required and what constitutes valid de-identification?",
        "expect_keywords": ["PDPO", "de-identify", "consent", "research", "data"],
    },
    {
        "agent": "compliancelinc",
        "name": "COMPLIANCELINC-02: NPHIES Audit Prep",
        "journey": "Compliance",
        "prompt": "We received a CCHI audit notice for our NPHIES claims submission. What are the top 10 compliance checks we must verify before the audit?",
        "expect_keywords": ["CCHI", "audit", "NPHIES", "compliance", "check"],
    },

    # ── TTLINC ──────────────────────────────────────
    {
        "agent": "ttlinc",
        "name": "TTLINC-01: Arabic→English Medical",
        "journey": "Medical Translation",
        "prompt": "ترجم هذا التقرير الطبي إلى الإنجليزية: المريض يشكو من ألم في الصدر يمتد إلى الذراع الأيسر، مصحوب بتعرق وغثيان. تاريخ مرضي: ارتفاع ضغط الدم والسكري. ECG يظهر تغيرات ST.",
        "expect_keywords": ["chest pain", "left arm", "ECG", "hypertension", "diabetes"],
    },
    {
        "agent": "ttlinc",
        "name": "TTLINC-02: Discharge Instructions Arabic",
        "journey": "Medical Translation",
        "prompt": "Translate these discharge instructions to formal Arabic: Take Metformin 500mg twice daily with food. Monitor blood sugar daily. Return if fasting glucose >200. Cardiology follow-up in 2 weeks.",
        "expect_keywords": ["ميتفورمين", "سكر", "قلب", "مغادرة"],
    },

    # ── BASMA ──────────────────────────────────────
    {
        "agent": "basma",
        "name": "BASMA-01: Appointment Booking (Arabic)",
        "journey": "Patient Communication",
        "prompt": "أريد حجز موعد مع طبيب القلب. عندي تأمين من شركة توكيلات طب.",
        "expect_keywords": ["موعد", "قلب", "تأمين", "هوية"],
    },
    {
        "agent": "basma",
        "name": "BASMA-02: Insurance Inquiry (English)",
        "journey": "Patient Communication",
        "prompt": "My name is Sarah Al-Ghamdi. I have Bupa Arabia insurance. I want to know if my coverage includes physiotherapy sessions and how many are covered per year.",
        "expect_keywords": ["Bupa", "physiotherapy", "coverage", "insurance"],
    },

    # ── NPHIES AGENT ──────────────────────────────────
    {
        "agent": "brainsait-nphies-agent",
        "name": "NPHIES-01: Eligibility Check",
        "journey": "NPHIES Operations",
        "prompt": "Perform eligibility verification for: Patient National ID 1098765432, Insurance Company ID 7001 (Tawnia), Date of Service 2026-04-10. Return NPHIES eligibility request structure.",
        "expect_keywords": ["eligibility", "NPHIES", "1098765432", "7001", "coverage"],
    },
    {
        "agent": "brainsait-nphies-agent",
        "name": "NPHIES-02: Claim Status Query",
        "journey": "NPHIES Operations",
        "prompt": "Query claim status for: Organization 7001234, Claim reference CLM-2026-00456. The claim was submitted 5 days ago with no response. Provide the FHIR query structure and error handling steps.",
        "expect_keywords": ["claim", "status", "FHIR", "query", "CLM"],
    },
]

# ─────────────────────────────────────────────────────────
# TEST RUNNER
# ─────────────────────────────────────────────────────────
def run_test(scenario):
    agent   = scenario['agent']
    payload = {
        "model": agent,
        "messages": [{"role": "user", "content": scenario['prompt']}],
        "stream": False
    }
    start = time.time()
    try:
        resp = requests.post(
            f"{BASE_URL}/api/chat/completions",
            headers=HEADERS,
            json=payload,
            timeout=TIMEOUT
        )
        latency = round(time.time() - start, 2)

        if resp.status_code != 200:
            return {
                "status": "FAIL",
                "error": f"HTTP {resp.status_code}: {resp.text[:200]}",
                "latency": latency,
                "response": ""
            }

        data = resp.json()
        content = data.get('choices', [{}])[0].get('message', {}).get('content', '')

        # Check expected keywords (case-insensitive)
        found    = [k for k in scenario['expect_keywords'] if k.lower() in content.lower()]
        missing  = [k for k in scenario['expect_keywords'] if k.lower() not in content.lower()]
        keyword_score = len(found) / len(scenario['expect_keywords'])

        status = "PASS" if keyword_score >= 0.6 else "WARN" if keyword_score >= 0.3 else "FAIL"

        return {
            "status":         status,
            "latency":        latency,
            "response_len":   len(content),
            "keyword_score":  round(keyword_score, 2),
            "found":          found,
            "missing":        missing,
            "response":       content[:400],
            "error":          ""
        }

    except requests.exceptions.Timeout:
        return {"status": "TIMEOUT", "error": f">{TIMEOUT}s", "latency": TIMEOUT, "response": ""}
    except Exception as e:
        return {"status": "ERROR", "error": str(e)[:200], "latency": round(time.time()-start,2), "response": ""}


# ─────────────────────────────────────────────────────────
# MAIN
# ─────────────────────────────────────────────────────────
def main():
    print()
    print("=" * 72)
    print("  BrainSAIT LINC — Comprehensive Agent Test Suite")
    print(f"  Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"  Endpoint: {BASE_URL}  |  Tests: {len(SCENARIOS)}")
    print("=" * 72)

    results = []
    totals  = {"PASS": 0, "WARN": 0, "FAIL": 0, "TIMEOUT": 0, "ERROR": 0}
    journey_results = {}

    for i, sc in enumerate(SCENARIOS, 1):
        label = f"[{i:02d}/{len(SCENARIOS)}] {sc['name']}"
        print(f"\n{label}")
        print(f"  Agent  : {sc['agent']}")
        print(f"  Journey: {sc['journey']}")
        print(f"  Prompt : {sc['prompt'][:80]}{'...' if len(sc['prompt'])>80 else ''}")

        result = run_test(sc)
        result.update({"scenario": sc['name'], "agent": sc['agent'], "journey": sc['journey']})
        results.append(result)
        totals[result['status']] += 1

        # Track per-journey
        jkey = sc['journey']
        journey_results.setdefault(jkey, [])
        journey_results[jkey].append(result['status'])

        status_icon = {"PASS":"✅","WARN":"⚠️","FAIL":"❌","TIMEOUT":"⏱","ERROR":"💥"}.get(result['status'],"?")
        print(f"  Result : {status_icon} {result['status']:7} | {result.get('latency','?')}s | "
              f"keywords {result.get('keyword_score','-')} | response {result.get('response_len',0)}ch")
        if result.get('missing'):
            print(f"  Missing: {result['missing']}")
        if result.get('error'):
            print(f"  Error  : {result['error']}")
        if result.get('response'):
            print(f"  Preview: {result['response'][:200]}")

        # Small delay to avoid rate limiting
        time.sleep(1)

    # ─── SUMMARY ──────────────────────────────────────
    print()
    print("=" * 72)
    print("  TEST SUMMARY")
    print("=" * 72)
    print(f"  Total  : {len(SCENARIOS)}")
    print(f"  PASS   : {totals['PASS']} ✅")
    print(f"  WARN   : {totals['WARN']} ⚠️")
    print(f"  FAIL   : {totals['FAIL']} ❌")
    print(f"  TIMEOUT: {totals['TIMEOUT']} ⏱")
    print(f"  ERROR  : {totals['ERROR']} 💥")
    pass_rate = round((totals['PASS'] + totals['WARN']) / len(SCENARIOS) * 100)
    print(f"\n  Pass Rate: {pass_rate}%")

    print()
    print("  BY JOURNEY:")
    for journey, statuses in sorted(journey_results.items()):
        jp = statuses.count('PASS')
        jw = statuses.count('WARN')
        jf = statuses.count('FAIL') + statuses.count('TIMEOUT') + statuses.count('ERROR')
        icon = "✅" if jf == 0 else "⚠️" if jf < len(statuses) else "❌"
        print(f"  {icon} {journey:<30} P={jp} W={jw} F={jf}")

    print()
    print("  BY AGENT:")
    agent_map = {}
    for r in results:
        ag = r['agent']
        agent_map.setdefault(ag, []).append(r['status'])
    for ag, statuses in sorted(agent_map.items()):
        p = statuses.count('PASS')
        w = statuses.count('WARN')
        f = statuses.count('FAIL') + statuses.count('TIMEOUT') + statuses.count('ERROR')
        icon = "✅" if f==0 else "⚠️" if f < len(statuses) else "❌"
        avg_lat = "--"
        lats = [rr.get('latency',0) for rr in results if rr['agent']==ag and isinstance(rr.get('latency'),float)]
        if lats: avg_lat = f"{round(sum(lats)/len(lats),1)}s"
        print(f"  {icon} {ag:<35} P={p} W={w} F={f}  avg_lat={avg_lat}")

    # Save JSON report
    report_path = "/tmp/brainsait_test_report.json"
    with open(report_path, 'w') as f:
        json.dump({
            "timestamp": datetime.now().isoformat(),
            "totals": totals,
            "pass_rate": pass_rate,
            "results": results
        }, f, indent=2)
    print(f"\n  Report saved: {report_path}")
    print("=" * 72)

    return 0 if totals['FAIL'] + totals['TIMEOUT'] + totals['ERROR'] == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
