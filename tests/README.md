# BrainSAIT Test Suites

## base_scenarios.py
26 base scenarios covering all 13 LINC agents across core journeys.

```bash
python3 tests/base_scenarios.py
```

## extended_scenarios.py
50 extended scenarios: A2A orchestration, complex RCM, clinical edge cases, bilingual flows.

```bash
python3 tests/extended_scenarios.py
```

**Combined: 76 scenarios — 100% pass rate validated April 2026**

### Requirements
- Open-WebUI running on `localhost:3000`
- Admin API key set (dev only — never commit real keys)
