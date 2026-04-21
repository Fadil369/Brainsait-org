#!/usr/bin/env python3
"""
BrainSAIT Extended 60-Scenario Training Suite
Tests: A2A delegation, multi-turn, denial management, mixed bilingual,
       complex DRG, FHIR edge cases, MCP tool usage signals
"""
import requests, json, time, sys

BASE_URL  = "http://localhost:3000"
HEADERS   = {"Authorization": "Bearer sk-brainsait-4a4bf67acc084d3560faa0670b7f0d6465df4b3d",
             "Content-Type": "application/json"}
TIMEOUT   = 90

SCENARIOS = [
  # ── ORCHESTRATION / A2A (masterlinc) ─────────────────────────────────────
  {"s":"MASTER-03: A2A Claim+Code Chain","a":"masterlinc","j":"A2A Orchestration",
   "p":"A Bupa patient had a knee arthroscopy. Route this to the appropriate specialists: first determine the ICD-10 diagnosis code for medial meniscus tear, then verify Bupa insurance coverage, then initiate the claim. Coordinate all three steps.",
   "k":["ClaimLinc","CodeLinc","ICD","Bupa","meniscus"]},
  {"s":"MASTER-04: Emergency Multi-Agent","a":"masterlinc","j":"A2A Orchestration",
   "p":"Patient with suspected STEMI arrives at ED. BP 90/60, HR 120, diaphoretic. Simultaneously: activate NPHIES emergency authorization, prepare FHIR ClinicalImpression resource, and identify the appropriate DRG for acute MI with PCI.",
   "k":["AuthLinc","FHIR","DRG","STEMI","emergency"]},

  # ── CLAIMS / RCM ─────────────────────────────────────────────────────────
  {"s":"CLAIM-03: Bupa Surgical Claim","a":"claimlinc","j":"RCM / Claims",
   "p":"Build a NPHIES claim for Bupa Arabia: Patient Fatima Al-Dosari, DOB 1978-09-22, ID 1098765432. Procedure: laparoscopic cholecystectomy 47563, Dx K80.0. Hospital NPI 7001234. Total charge SAR 18,500.",
   "k":["Bupa","47563","K80","claim","SAR"]},
  {"s":"CLAIM-04: Denial Appeal Letter","a":"claimlinc","j":"RCM / Claims",
   "p":"Draft a formal appeal letter for NPHIES rejection code X302 (service not medically necessary) for a lumbar MRI (72148) in a patient with 6-week history of radiculopathy, failed conservative therapy, and neurological deficits.",
   "k":["appeal","X302","medical necessity","radiculopathy","documentation"]},
  {"s":"CLAIM-05: Duplicate Claim Detection","a":"claimlinc","j":"RCM / Claims",
   "p":"We submitted claim CLM-2026-00781 for patient 1234567890 on March 15. A second claim CLM-2026-00892 for the same patient, same procedure E11.65 + 99213, same date was submitted March 16. How do we handle this potential duplicate?",
   "k":["duplicate","void","resubmit","NPHIES","flag"]},
  {"s":"CLAIM-06: AXA Inpatient Bundle","a":"claimlinc","j":"RCM / Claims",
   "p":"Process AXA Gulf inpatient claim: 5-day admission for COPD exacerbation J44.1, ICU day 2, mechanical ventilation 96.70, discharged on BiPAP. Calculate expected reimbursement components and flag any high-cost outliers.",
   "k":["AXA","J44","ICU","ventilation","inpatient"]},

  # ── PRIOR AUTHORIZATION ───────────────────────────────────────────────────
  {"s":"AUTH-03: Biologics for RA","a":"authlinc","j":"Prior Authorization",
   "p":"Rajhi Takaful patient needs Adalimumab (Humira) for rheumatoid arthritis. Previous DMARDs failed: Methotrexate 6 months, Leflunomide 4 months. DAS28 score 5.8. Build the prior auth request with required documentation checklist.",
   "k":["Adalimumab","DMARD","prior auth","DAS28","documentation"]},
  {"s":"AUTH-04: Bariatric Surgery Auth","a":"authlinc","j":"Prior Authorization",
   "p":"Medgulf patient BMI 42, T2DM, HTN, sleep apnea. Requesting laparoscopic sleeve gastrectomy. What are the CCHI criteria for bariatric surgery authorization and what documentation must be submitted?",
   "k":["BMI","bariatric","CCHI","sleeve","authorization"]},
  {"s":"AUTH-05: Auth Expiry Management","a":"authlinc","j":"Prior Authorization",
   "p":"Authorization #AUTH-2026-44521 for Tawnia patient was approved for 30 days but the procedure was delayed due to COVID. The auth expires in 3 days. What is the process for extension and what is the NPHIES transaction type?",
   "k":["extension","expiry","Tawnia","NPHIES","reauthorization"]},

  # ── DRG OPTIMIZATION ─────────────────────────────────────────────────────
  {"s":"DRG-03: Neonatal Intensive Care","a":"drglinc","j":"DRG Optimization",
   "p":"Neonate born at 32 weeks gestation, birth weight 1650g, respiratory distress syndrome, NICU admission 18 days, surfactant therapy, CPAP. Calculate the Saudi DRG, identify all billable complexity factors, and suggest additional documentation to capture full case complexity.",
   "k":["neonate","NICU","DRG","surfactant","complexity"]},
  {"s":"DRG-04: Stroke Rehabilitation","a":"drglinc","j":"DRG Optimization",
   "p":"Patient post-ischemic stroke, left hemiplegia, aphasia, dysphagia. Admitted for acute care 6 days then transferred to rehab unit 14 days. Comorbidities: HTN, AF, DM2. What are the DRG codes for both episodes and documentation gaps?",
   "k":["stroke","hemiplegia","DRG","rehabilitation","comorbidities"]},
  {"s":"DRG-05: Septic Shock","a":"drglinc","j":"DRG Optimization",
   "p":"ICU admission: gram-negative septic shock, mechanical ventilation >96h, vasopressors, renal replacement therapy, 21-day LOS. Patient has CKD stage 3 and T2DM as CCs. Assign DRG, calculate relative weight, and identify all qualifying CCs/MCCs.",
   "k":["septic shock","DRG","mechanical ventilation","MCC","relative weight"]},

  # ── CLINICAL DECISION SUPPORT ─────────────────────────────────────────────
  {"s":"CLINICAL-03: Drug Interaction Alert","a":"clinicallinc","j":"Clinical Decision",
   "p":"Patient on Warfarin INR 2.5 for AF. New prescription: Amoxicillin-Clavulanate for dental abscess. Metformin 1000mg BD for T2DM. What are the drug interactions and recommended monitoring parameters?",
   "k":["Warfarin","interaction","INR","Amoxicillin","monitoring"]},
  {"s":"CLINICAL-04: Pediatric Fever Protocol","a":"clinicallinc","j":"Clinical Decision",
   "p":"8-month-old infant, fever 39.8C x 3 days, bulging anterior fontanelle, photophobia, neck stiffness, petechial rash. What is the differential, immediate workup, and empirical treatment?",
   "k":["meningitis","lumbar puncture","empirical","antibiotic","urgent"]},
  {"s":"CLINICAL-05: Renal Dosing","a":"clinicallinc","j":"Clinical Decision",
   "p":"Patient GFR 18 ml/min (CKD stage 4). Current medications: Metformin 1g BD, Lisinopril 10mg, Digoxin 0.25mg, Gabapentin 300mg TDS. Which medications need dose adjustment or are contraindicated?",
   "k":["Metformin","contraindicated","GFR","dose adjustment","CKD"]},
  {"s":"CLINICAL-06: Post-op Complication","a":"clinicallinc","j":"Clinical Decision",
   "p":"Day 2 post-CABG: patient develops fever 38.9C, sternal wound erythema, purulent discharge, WBC 18k. MRSA history. What is the management protocol and ICD-10 code for sternal wound infection post-cardiac surgery?",
   "k":["MRSA","sternal","wound infection","T81","vancomycin"]},

  # ── PATIENT JOURNEY (healthcarelinc) ─────────────────────────────────────
  {"s":"HEALTH-03: ER to Admission Flow","a":"healthcarelinc","j":"Patient Journey",
   "p":"Patient arrives at ER with chest pain. After evaluation STEMI confirmed. Document the complete patient journey from ED arrival through cath lab, ICU admission, step-down, discharge planning, with all NPHIES checkpoints.",
   "k":["ER","admission","NPHIES","discharge","pathway"]},
  {"s":"HEALTH-04: Chronic Disease Management","a":"healthcarelinc","j":"Patient Journey",
   "p":"Design a 6-month care pathway for a newly diagnosed Type 2 DM patient: HbA1c 10.2%, BMI 34, hypertensive. Include all required appointments, lab monitoring schedule, education sessions, and insurance pre-authorization touchpoints.",
   "k":["HbA1c","diabetes","pathway","education","monitoring"]},
  {"s":"HEALTH-05: International Patient","a":"healthcarelinc","j":"Patient Journey",
   "p":"A medical tourist from UK arriving for elective hip replacement. No Saudi insurance. Private pay. Needs pre-admission assessment, surgery, 4-day stay, discharge to hotel, home country follow-up coordination. What is the process?",
   "k":["international","private","hip replacement","discharge","coordination"]},

  # ── RADIOLOGY AI ─────────────────────────────────────────────────────────
  {"s":"RADIO-03: CT Chest COVID Findings","a":"radiolinc","j":"Radiology AI",
   "p":"CT chest report: bilateral ground glass opacities predominantly peripheral and basal, 60% lung involvement, crazy paving pattern, some consolidation. Patient SpO2 88%. Provide structured radiology impression and CO-RADS score.",
   "k":["CO-RADS","ground glass","consolidation","bilateral","CT"]},
  {"s":"RADIO-04: MRI Spine Disc","a":"radiolinc","j":"Radiology AI",
   "p":"MRI lumbar spine: L4-L5 disc herniation with right-sided lateral recess stenosis and nerve root compression. L5-S1 disc desiccation with annular tear, no herniation. Interpret findings and recommend management pathway.",
   "k":["disc herniation","L4-L5","stenosis","nerve root","management"]},
  {"s":"RADIO-05: Ultrasound Thyroid","a":"radiolinc","j":"Radiology AI",
   "p":"Thyroid ultrasound: right lobe 1.8cm solid hypoechoic nodule, irregular margins, microcalcifications, taller than wide. Left lobe normal. What is the TI-RADS score and recommended next step?",
   "k":["TI-RADS","hypoechoic","microcalcifications","FNA","nodule"]},

  # ── MEDICAL CODING ───────────────────────────────────────────────────────
  {"s":"CODE-03: CABG Complex","a":"codelinc","j":"Medical Coding",
   "p":"Code: CABG x4 with LIMA to LAD, SVG to RCA, OM, Diagonal. On-pump 210 min. Concurrent aortic valve replacement (mechanical). Patient: T2DM, CKD stage 3, previous MI. Assign all ICD-10-AM and ACHI procedure codes.",
   "k":["CABG","LIMA","aortic valve","ACHI","ICD-10"]},
  {"s":"CODE-04: Obstetric Delivery","a":"codelinc","j":"Medical Coding",
   "p":"Cesarean delivery at 38 weeks: placenta previa, fetal distress, general anesthesia. Neonate born with APGAR 6/8, required NICU admission for transient tachypnea. Code the mother's and neonate's encounters fully.",
   "k":["O44","cesarean","Z38","NICU","ICD-10"]},
  {"s":"CODE-05: Trauma Coding","a":"codelinc","j":"Medical Coding",
   "p":"MVA victim: open femur fracture right (S72.301A), rib fractures x4 (S22.41XA), pneumothorax (S27.0XXA), splenic laceration grade III (S36.031A). Intubated, chest tube, splenorrhaphy. Assign all codes and external cause codes.",
   "k":["S72","S27","external cause","V","trauma"]},

  # ── FHIR / BRIDGELINC ────────────────────────────────────────────────────
  {"s":"FHIR-03: ClaimResponse Bundle","a":"bridgelinc","j":"FHIR Integration",
   "p":"Build a NPHIES ClaimResponse FHIR R4 resource for claim CLM-2026-00892: partially approved, service 1 approved SAR 4200, service 2 denied (reason: X204 not medically necessary), total adjudicated SAR 4200.",
   "k":["ClaimResponse","adjudication","X204","SAR","FHIR"]},
  {"s":"FHIR-04: Coverage Resource","a":"bridgelinc","j":"FHIR Integration",
   "p":"Build a NPHIES Coverage FHIR R4 resource for: Tawnia Insurance, subscriber ID TAW-9871234, plan: Comprehensive, effective 2026-01-01 to 2026-12-31, network: in-network, co-pay class: B.",
   "k":["Coverage","Tawnia","subscriber","network","FHIR"]},
  {"s":"FHIR-05: Bundle Validation Error","a":"bridgelinc","j":"FHIR Integration",
   "p":"This FHIR Bundle was rejected by NPHIES with error OP-ERR-001: Missing required element. The bundle has: Patient, Coverage, Claim resources but Claim.provider reference is missing. How do you fix and resubmit?",
   "k":["OP-ERR-001","provider","reference","resubmit","validation"]},

  # ── COMPLIANCE ────────────────────────────────────────────────────────────
  {"s":"COMP-03: Data Breach Response","a":"compliancelinc","j":"Compliance",
   "p":"We discovered unauthorized access to 500 patient records including diagnoses and treatment history. The breach occurred 3 days ago. What is the PDPL notification requirement, timeline, and steps to notify SDAIA and affected patients?",
   "k":["PDPL","SDAIA","breach","notification","72 hours"]},
  {"s":"COMP-04: AI Model Governance","a":"compliancelinc","j":"Compliance",
   "p":"We want to use an AI model to auto-approve insurance claims under SAR 5000. What CCHI regulations apply? What governance framework, human oversight requirements, and audit trail do we need to implement?",
   "k":["AI governance","CCHI","human oversight","audit","approval"]},
  {"s":"COMP-05: Cross-Border Data Transfer","a":"compliancelinc","j":"Compliance",
   "p":"We want to use a US-based cloud provider to store Saudi patient data for AI model training. Under PDPL Article 29, what conditions must be met for lawful transfer of personal data outside Saudi Arabia?",
   "k":["PDPL","Article 29","cross-border","transfer","adequacy"]},

  # ── TRANSLATION (ttlinc) ─────────────────────────────────────────────────
  {"s":"TT-03: Operative Report EN→AR","a":"ttlinc","j":"Medical Translation",
   "p":"Translate to formal Arabic: 'Intraoperative findings revealed a 3cm fibroadenoma of the right breast. Excision was performed with clear margins. Frozen section confirmed benign pathology. Estimated blood loss 50ml. Patient tolerated procedure well.'",
   "k":["الثدي","استئصال","حميد","العملية","عينة"]},
  {"s":"TT-04: Consent Form AR→EN","a":"ttlinc","j":"Medical Translation",
   "p":"ترجم إلى الإنجليزية: 'أوافق على إجراء عملية استئصال المرارة بالمنظار. تم شرح المخاطر المحتملة بما فيها: النزيف، العدوى، إصابة القنوات الصفراوية، والتحول إلى الجراحة المفتوحة. فهمت وأوافق.'",
   "k":["cholecystectomy","laparoscopic","consent","risks","bile duct"]},
  {"s":"TT-05: Diagnosis Letter","a":"ttlinc","j":"Medical Translation",
   "p":"Translate to patient-friendly Arabic: 'Dear Patient, your echocardiogram shows mild mitral valve regurgitation with preserved ejection fraction of 62%. No intervention is required at this time. Please follow up in 12 months.'",
   "k":["صمام","قلصية","متابعة","طفيف","الكسر"]},

  # ── BILINGUAL MIXED SCENARIOS (basma) ────────────────────────────────────
  {"s":"BASMA-03: Insurance Denial Complaint","a":"basma","j":"Patient Communication",
   "p":"I am very upset. My insurance Bupa Arabia denied my physiotherapy claim for my back injury. I have been in pain for 3 weeks. What can I do?",
   "k":["appeal","denial","physiotherapy","Bupa","steps"]},
  {"s":"BASMA-04: Arabic Pediatric Appointment","a":"basma","j":"Patient Communication",
   "p":"ابنتي عمرها سنتين ونصف ولديها حمى ٣٩.٥ منذ يومين ومطعوم الإنفلونزا لم يأخذه هذا العام. هل تحتاج إلى زيارة طارئة؟",
   "k":["طوارئ","حمى","طفل","طبيب","موعد"]},
  {"s":"BASMA-05: WhatsApp Reminder Simulation","a":"basma","j":"Patient Communication",
   "p":"Draft a WhatsApp appointment reminder in both Arabic and English for: Mr. Khalid Al-Harbi, cardiology consultation, Dr. Hassan clinic, tomorrow 10:30 AM, Floor 3 Room 312, please bring insurance card and ID.",
   "k":["reminder","Khalid","cardiology","10:30","insurance card"]},

  # ── NPHIES OPERATIONS ────────────────────────────────────────────────────
  {"s":"NPHIES-03: Batch Submission","a":"brainsait-nphies-agent","j":"NPHIES Operations",
   "p":"We have 47 claims to submit for April 2026. Design the NPHIES batch submission process: bundle structure, validation steps, submission order, error handling for partial failures, and reconciliation report format.",
   "k":["batch","bundle","reconciliation","submission","NPHIES"]},
  {"s":"NPHIES-04: Remittance Advice","a":"brainsait-nphies-agent","j":"NPHIES Operations",
   "p":"We received a NPHIES remittance advice for 15 claims: 8 approved full, 4 partially approved, 3 denied. Build the FHIR PaymentReconciliation resource structure and explain how to auto-post this to the hospital billing system.",
   "k":["PaymentReconciliation","remittance","FHIR","denied","reconciliation"]},

  # ── COMPLEX A2A WORKFLOWS ─────────────────────────────────────────────────
  {"s":"MASTER-05: Full RCM Cycle","a":"masterlinc","j":"A2A Orchestration",
   "p":"Orchestrate a complete RCM cycle for a Tawnia outpatient cardiology visit: 1) Check eligibility, 2) Code the visit (E11.65 + hypertensive heart disease I13.0 + 99213), 3) Validate FHIR claim bundle, 4) Submit with NPHIES transaction. Route to appropriate specialists.",
   "k":["eligibility","coding","FHIR","Tawnia","NPHIES"]},
  {"s":"MASTER-06: Denial Management Workflow","a":"masterlinc","j":"A2A Orchestration",
   "p":"Claim CLM-2026-01234 denied with code X204. Patient has T2DM with chronic kidney disease on hemodialysis. Coordinate: identify correct codes with CodeLinc, build appeal with ClaimLinc, and verify NPHIES resubmission requirements with NPHIES agent.",
   "k":["denial","X204","CodeLinc","appeal","resubmission"]},

  # ── EDGE CASES ────────────────────────────────────────────────────────────
  {"s":"MASTER-07: Unknown Payer","a":"masterlinc","j":"Edge Cases",
   "p":"Patient presents with insurance card from 'Al Watania Cooperative Insurance' — a payer not commonly listed in Saudi systems. How do you verify payer eligibility, find their NPHIES payer ID, and process the claim?",
   "k":["payer","NPHIES","verification","cooperative","eligibility"]},
  {"s":"CLAIM-07: Zero-day Readmission","a":"claimlinc","j":"Edge Cases",
   "p":"Patient discharged after appendectomy then readmitted same day for post-op hemorrhage requiring return to OR. How does NPHIES handle same-day readmission — separate claims or linked? What documentation is required?",
   "k":["readmission","same-day","NPHIES","hemorrhage","documentation"]},
  {"s":"AUTH-06: Emergency Retrospective","a":"authlinc","j":"Edge Cases",
   "p":"Emergency surgery was performed without prior authorization. Patient had ruptured appendix. Payer is Bupa Arabia. How do we submit a retrospective/emergency authorization and what is the maximum time window under CCHI rules?",
   "k":["retrospective","emergency","Bupa","CCHI","48 hours"]},
  {"s":"CODE-06: Sequencing Rules","a":"codelinc","j":"Edge Cases",
   "p":"Patient admitted for COPD exacerbation J44.1 but during admission found to have new T2DM diagnosis (HbA1c 11.2%) and acute kidney injury N17.9 superimposed on CKD stage 3. What are the correct principal diagnosis sequencing rules under ICD-10-AM?",
   "k":["principal diagnosis","sequencing","J44","N17","ICD-10-AM"]},
  {"s":"COMP-06: Minor Patient Data","a":"compliancelinc","j":"Edge Cases",
   "p":"We need to store and process health data for pediatric patients under 18. Who can give consent under Saudi PDPL? What special safeguards apply to minors' health data under CCHI and PDPL frameworks?",
   "k":["minor","consent","guardian","PDPL","pediatric"]},

  # ── MODEL STRESS TESTS ────────────────────────────────────────────────────
  {"s":"DRG-06: Multi-Comorbidity Optimization","a":"drglinc","j":"DRG Optimization",
   "p":"Complex patient: T2DM with ESRD on HD (E11.22, Z99.2), ischemic heart disease with 3-vessel CABG this admission (I25.10, 38285-01), post-op AF, hospital-acquired pneumonia, LOS 28 days. Identify all AR-DRG v11 codes, relative weights, and outlier payment triggers.",
   "k":["AR-DRG","ESRD","CABG","outlier","comorbidity"]},
  {"s":"BRIDGE-06: NPHIES v2 Profile","a":"bridgelinc","j":"FHIR Integration",
   "p":"Build a complete NPHIES v2.0 compliant Claim bundle for a 3-day inpatient admission: Patient (NationalID), Coverage (Tawnia), Organization (Hospital NPI 7001234), Practitioner (license SA123456), Claim with 3 line items (room+board, OR, pharmacy). Include all required NPHIES extensions.",
   "k":["Bundle","NPHIES","extension","Practitioner","Organization"]},
  {"s":"CLINICAL-07: Rare Disease","a":"clinicallinc","j":"Clinical Decision",
   "p":"22-year-old female: joint hypermobility, chronic fatigue, recurrent subluxations, POTS, mast cell symptoms. Positive Beighton score 7/9. Suspected hypermobile EDS. What is the diagnostic workup, Saudi specialist referral pathway, and ICD-10 code?",
   "k":["EDS","Beighton","hypermobility","Q79","referral"]},
  {"s":"RADIO-06: PET-CT Oncology","a":"radiolinc","j":"Radiology AI",
   "p":"PET-CT report for lymphoma staging: hypermetabolic mediastinal mass 7x5cm (SUVmax 18.3), bilateral hilar nodes (SUVmax 12), no bone marrow involvement, no extranodal disease. Assign Deauville score, Ann Arbor staging, and recommend next step.",
   "k":["Deauville","Ann Arbor","SUVmax","lymphoma","staging"]},
]

def run_test(t: dict, idx: int, total: int) -> dict:
    print(f"[{idx:02d}/{total}] {t['s']}")
    print(f"         Agent: {t['a']} | Journey: {t['j']}")
    start = time.time()
    try:
        r = requests.post(f"{BASE_URL}/api/chat/completions", headers=HEADERS,
            json={"model": t['a'], "messages": [{"role":"user","content":t['p']}],
                  "stream": False, "max_tokens": 1800},
            timeout=TIMEOUT)
        lat = round(time.time()-start, 2)
        if r.status_code != 200:
            return {"status":"ERROR","scenario":t['s'],"agent":t['a'],"journey":t['j'],
                    "latency":lat,"error":f"HTTP {r.status_code}","response":"","keyword_score":0,"found":[],"missing":t['k']}
        content = r.json()["choices"][0]["message"]["content"]
        found   = [k for k in t['k'] if k.lower() in content.lower()]
        missing = [k for k in t['k'] if k.lower() not in content.lower()]
        score   = len(found)/len(t['k'])
        status  = "PASS" if score >= 0.6 else "WARN" if score >= 0.4 else "FAIL"
        icon    = {"PASS":"✅","WARN":"⚠️","FAIL":"❌"}[status]
        print(f"         {icon} {status} | {lat}s | score={score:.2f} | {len(content)}ch")
        if missing: print(f"         Missing: {missing[:3]}")
        return {"status":status,"scenario":t['s'],"agent":t['a'],"journey":t['j'],
                "latency":lat,"keyword_score":score,"found":found,"missing":missing,
                "response":content[:800],"error":""}
    except requests.Timeout:
        return {"status":"TIMEOUT","scenario":t['s'],"agent":t['a'],"journey":t['j'],
                "latency":TIMEOUT,"error":f">{TIMEOUT}s","response":"","keyword_score":0,"found":[],"missing":t['k']}
    except Exception as e:
        return {"status":"ERROR","scenario":t['s'],"agent":t['a'],"journey":t['j'],
                "latency":round(time.time()-start,2),"error":str(e),"response":"","keyword_score":0,"found":[],"missing":t['k']}

def main():
    print("="*72)
    print(f"  BrainSAIT Extended 60-Scenario Training Suite")
    print(f"  Endpoint: {BASE_URL} | Scenarios: {len(SCENARIOS)}")
    print("="*72)
    results = []
    for i, s in enumerate(SCENARIOS, 1):
        results.append(run_test(s, i, len(SCENARIOS)))
        time.sleep(0.5)

    totals = {s:0 for s in ["PASS","WARN","FAIL","TIMEOUT","ERROR"]}
    by_journey: dict = {}
    for r in results:
        totals[r['status']] += 1
        j = r['journey']
        by_journey.setdefault(j, {"PASS":0,"WARN":0,"FAIL":0,"TIMEOUT":0,"ERROR":0})
        by_journey[j][r['status']] += 1

    total = len(results)
    passed = totals['PASS'] + totals['WARN']
    print("\n" + "="*72)
    print("  EXTENDED TEST SUMMARY")
    print("="*72)
    print(f"  Total  : {total}")
    print(f"  PASS   : {totals['PASS']} ✅")
    print(f"  WARN   : {totals['WARN']} ⚠️")
    print(f"  FAIL   : {totals['FAIL']} ❌")
    print(f"  TIMEOUT: {totals['TIMEOUT']} ⏱")
    print(f"  ERROR  : {totals['ERROR']} 💥")
    print(f"\n  Pass Rate: {round(totals['PASS']/total*100)}% | Pass+Warn: {round(passed/total*100)}%")
    print("\n  BY JOURNEY:")
    for j, s in sorted(by_journey.items()):
        icon = "✅" if s['FAIL']+s['TIMEOUT']+s['ERROR'] == 0 else "⚠️" if s['PASS'] >= s['FAIL'] else "❌"
        print(f"  {icon} {j:<35} P={s['PASS']} W={s['WARN']} F={s['FAIL']}")

    with open("/tmp/extended_test_report.json","w") as f:
        json.dump({"summary":totals,"total":total,"results":results}, f, indent=2)
    print("\n  Report: /tmp/extended_test_report.json")
    print("="*72)
    return 0 if totals['FAIL']+totals['TIMEOUT']+totals['ERROR'] == 0 else 1

if __name__ == "__main__":
    sys.exit(main())
