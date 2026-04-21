# مرجع API نفيس

## نظرة عامة

توفر هذه الوثيقة المواصفات التقنية للتكامل مع واجهات برمجة تطبيقات نفيس. جميع نقاط النهاية تستخدم تنسيق FHIR R4 وتتطلب مصادقة صحيحة.

---

## التكوين الأساسي

### البيئات

| البيئة | عنوان URL الأساسي | الغرض |
|--------|-------------------|-------|
| بيئة الاختبار | `https://sandbox.nphies.sa/fhir` | الاختبار |
| الإنتاج | `https://api.nphies.sa/fhir` | مباشر |

### المصادقة

**الطريقة:** mTLS + OAuth 2.0

1. **مصادقة الشهادة**
   - شهادة العميل صادرة من نفيس
   - مصافحة mTLS مطلوبة
   - تجديد الشهادة سنويًا

2. **رمز OAuth 2.0**
   ```http
   POST /oauth/token
   Content-Type: application/x-www-form-urlencoded

   grant_type=client_credentials
   &client_id={client_id}
   &client_secret={client_secret}
   &scope=nphies-api
   ```

3. **الاستجابة**
   ```json
   {
     "access_token": "eyJ...",
     "token_type": "Bearer",
     "expires_in": 3600
   }
   ```

### الترويسات

```http
Authorization: Bearer {access_token}
Content-Type: application/fhir+json
Accept: application/fhir+json
X-Request-ID: {uuid}
```

---

## واجهة الأهلية

### التحقق من الأهلية

**نقطة النهاية:** `POST /CoverageEligibilityRequest`

**الطلب:**
```json
{
  "resourceType": "CoverageEligibilityRequest",
  "identifier": [{
    "system": "http://provider.com/eligibility",
    "value": "ELG-2024-001"
  }],
  "status": "active",
  "purpose": ["benefits", "validation"],
  "patient": {
    "reference": "Patient/123"
  },
  "servicedDate": "2024-01-15",
  "created": "2024-01-14T10:00:00Z",
  "provider": {
    "reference": "Organization/hospital"
  },
  "insurer": {
    "reference": "Organization/bupa"
  },
  "item": [{
    "category": {
      "coding": [{
        "system": "http://terminology.hl7.org/CodeSystem/ex-benefitcategory",
        "code": "1"
      }]
    }
  }]
}
```

**الاستجابة:**
```json
{
  "resourceType": "CoverageEligibilityResponse",
  "identifier": [{
    "value": "ELG-RSP-001"
  }],
  "status": "active",
  "purpose": ["benefits"],
  "patient": {
    "reference": "Patient/123"
  },
  "created": "2024-01-14T10:00:05Z",
  "insurer": {
    "reference": "Organization/bupa"
  },
  "outcome": "complete",
  "insurance": [{
    "coverage": {
      "reference": "Coverage/456"
    },
    "inforce": true,
    "item": [{
      "category": {...},
      "benefit": [{
        "type": {...},
        "allowedMoney": {
          "value": 100000,
          "currency": "SAR"
        },
        "usedMoney": {
          "value": 5000,
          "currency": "SAR"
        }
      }]
    }]
  }]
}
```

**رموز الاستجابة:**

| الرمز | المعنى |
|-------|--------|
| 200 | نجاح |
| 400 | طلب خاطئ |
| 401 | غير مصرح |
| 404 | غير موجود |
| 422 | خطأ في التحقق |

---

## واجهة الموافقة المسبقة

### تقديم طلب الموافقة

**نقطة النهاية:** `POST /Claim` (مع use = "preauthorization")

**الطلب:**
```json
{
  "resourceType": "Claim",
  "identifier": [{
    "value": "AUTH-2024-001"
  }],
  "status": "active",
  "type": {
    "coding": [{
      "code": "institutional"
    }]
  },
  "use": "preauthorization",
  "patient": {
    "reference": "Patient/123"
  },
  "created": "2024-01-14T10:00:00Z",
  "provider": {
    "reference": "Organization/hospital"
  },
  "priority": {
    "coding": [{
      "code": "normal"
    }]
  },
  "insurance": [{
    "sequence": 1,
    "focal": true,
    "coverage": {
      "reference": "Coverage/456"
    }
  }],
  "diagnosis": [{
    "sequence": 1,
    "diagnosisCodeableConcept": {
      "coding": [{
        "system": "http://hl7.org/fhir/sid/icd-10-am",
        "code": "M17.11"
      }]
    }
  }],
  "procedure": [{
    "sequence": 1,
    "procedureCodeableConcept": {
      "coding": [{
        "system": "http://www.ama-assn.org/go/cpt",
        "code": "27447"
      }]
    }
  }],
  "item": [{
    "sequence": 1,
    "productOrService": {
      "coding": [{
        "code": "27447"
      }]
    },
    "servicedDate": "2024-01-20",
    "quantity": {
      "value": 1
    },
    "unitPrice": {
      "value": 50000,
      "currency": "SAR"
    }
  }],
  "supportingInfo": [{
    "sequence": 1,
    "category": {
      "coding": [{
        "code": "attachment"
      }]
    },
    "valueAttachment": {
      "contentType": "application/pdf",
      "data": "base64..."
    }
  }]
}
```

---

## واجهة المطالبات

### تقديم المطالبة

**نقطة النهاية:** `POST /Claim`

**الطلب:** (مشابه للموافقة ولكن `use: "claim"`)

### الحصول على حالة المطالبة

**نقطة النهاية:** `GET /Claim/{id}`

**الاستجابة:**
```json
{
  "resourceType": "Claim",
  "id": "123",
  "status": "active",
  ...
}
```

### البحث في المطالبات

**نقطة النهاية:** `GET /Claim?patient={patient_id}&created=ge{date}`

---

## واجهة استجابة المطالبة

### الحصول على نتيجة التحكيم

**نقطة النهاية:** `GET /ClaimResponse?request={claim_id}`

**الاستجابة:**
```json
{
  "resourceType": "ClaimResponse",
  "status": "active",
  "type": {...},
  "use": "claim",
  "patient": {...},
  "created": "2024-01-20T10:00:00Z",
  "insurer": {...},
  "outcome": "complete",
  "disposition": "Claim settled",
  "item": [{
    "itemSequence": 1,
    "adjudication": [{
      "category": {
        "coding": [{
          "code": "submitted"
        }]
      },
      "amount": {
        "value": 50000,
        "currency": "SAR"
      }
    },
    {
      "category": {
        "coding": [{
          "code": "eligible"
        }]
      },
      "amount": {
        "value": 45000,
        "currency": "SAR"
      }
    },
    {
      "category": {
        "coding": [{
          "code": "benefit"
        }]
      },
      "amount": {
        "value": 40500,
        "currency": "SAR"
      }
    }]
  }],
  "payment": {
    "type": {...},
    "date": "2024-01-25",
    "amount": {
      "value": 40500,
      "currency": "SAR"
    }
  }
}
```

---

## معالجة الأخطاء

### تنسيق استجابة الخطأ

```json
{
  "resourceType": "OperationOutcome",
  "issue": [{
    "severity": "error",
    "code": "processing",
    "details": {
      "coding": [{
        "system": "http://nphies.sa/error-codes",
        "code": "ERR-001"
      }]
    },
    "diagnostics": "Invalid patient identifier"
  }]
}
```

### رموز الأخطاء الشائعة

| الرمز | الوصف | الحل |
|-------|-------|------|
| ERR-001 | معرف غير صالح | تحقق من هوية المريض |
| ERR-002 | التغطية غير موجودة | تحقق من البوليصة |
| ERR-003 | رمز غير صالح | استخدم رمزًا صالحًا |
| ERR-004 | حقل مطلوب مفقود | أكمل جميع الحقول |
| ERR-005 | تقديم مكرر | تحقق من المطالبات السابقة |

---

## حدود المعدل

| نقطة النهاية | الحد | النافذة |
|--------------|------|---------|
| الأهلية | 100/دقيقة | لكل مقدم خدمة |
| المطالبات | 500/دقيقة | لكل مقدم خدمة |
| الحالة | 1000/دقيقة | لكل مقدم خدمة |

---

## Webhooks

### Webhook حالة المطالبة

```json
{
  "event": "claim.status.changed",
  "claim_id": "123",
  "status": "complete",
  "timestamp": "2024-01-20T10:00:00Z"
}
```

---

## دعم SDK

### مثال Python

```python
from brainsait import NphiesClient

client = NphiesClient(
    cert_path="/path/to/cert.pem",
    key_path="/path/to/key.pem",
    client_id="your_client_id",
    client_secret="your_secret"
)

# التحقق من الأهلية
response = client.check_eligibility(
    patient_id="123",
    service_date="2024-01-15",
    payer="bupa"
)

# تقديم المطالبة
claim_response = client.submit_claim(claim_bundle)
```

---

## الوثائق ذات الصلة

- [نظرة عامة على نفيس](overview.md)
- [ملف FHIR R4](fhir_r4_profile.md)
- [سير العمل](workflows.md)
- [خط أنابيب الأتمتة](../claims/automation_pipeline.md)

---

*آخر تحديث: يناير 2025*
