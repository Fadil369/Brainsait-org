# مرجع ملف FHIR R4

## نظرة عامة

توفر هذه الوثيقة مرجعًا شاملاً لملفات FHIR R4 المستخدمة في تكامل نفيس. فهم هذه الملفات ضروري لنجاح معالجة المطالبات وتبادل بيانات الرعاية الصحية.

---

## أساسيات FHIR

### ما هو FHIR؟

موارد التشغيل البيني السريع للرعاية الصحية (FHIR) هو معيار لتبادل معلومات الرعاية الصحية إلكترونيًا. يستخدم نفيس FHIR R4 كأساس له.

### المفاهيم الرئيسية

- **الموارد** - الوحدات الأساسية للبيانات (المريض، المطالبة، إلخ)
- **الملفات** - قيود على الموارد لحالات استخدام محددة
- **الامتدادات** - عناصر بيانات مخصصة
- **الحزم** - مجموعات من الموارد

---

## الموارد الأساسية

### المريض (Patient)

**الغرض:** تمثيل المريض الذي يتلقى الرعاية.

**العناصر الرئيسية:**
```json
{
  "resourceType": "Patient",
  "identifier": [{
    "system": "http://nphies.sa/identifier/iqama",
    "value": "1234567890"
  }],
  "name": [{
    "family": "الأحمد",
    "given": ["محمد"]
  }],
  "gender": "male",
  "birthDate": "1985-03-15"
}
```

**الحقول المطلوبة:**
- `identifier` - الهوية الوطنية/الإقامة
- `name` - اسم المريض (بالعربية)
- `gender` - ذكر/أنثى
- `birthDate` - YYYY-MM-DD

---

### التغطية (Coverage)

**الغرض:** معلومات بوليصة التأمين.

**العناصر الرئيسية:**
```json
{
  "resourceType": "Coverage",
  "identifier": [{
    "system": "http://payer.com/policy",
    "value": "POL-12345"
  }],
  "status": "active",
  "beneficiary": {
    "reference": "Patient/123"
  },
  "payor": [{
    "reference": "Organization/bupa"
  }],
  "class": [{
    "type": {
      "coding": [{
        "code": "group"
      }]
    },
    "value": "GROUP-A"
  }]
}
```

**الحقول المطلوبة:**
- `identifier` - رقم البوليصة
- `status` - نشط/ملغى
- `beneficiary` - مرجع المريض
- `payor` - منظمة التأمين

---

### المطالبة (Claim)

**الغرض:** مطالبة فوترة للخدمات المقدمة.

**العناصر الرئيسية:**
```json
{
  "resourceType": "Claim",
  "identifier": [{
    "system": "http://provider.com/claim",
    "value": "CLM-2024-001"
  }],
  "status": "active",
  "type": {
    "coding": [{
      "system": "http://terminology.hl7.org/CodeSystem/claim-type",
      "code": "institutional"
    }]
  },
  "use": "claim",
  "patient": {
    "reference": "Patient/123"
  },
  "created": "2024-01-15",
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
  "diagnosis": [...],
  "procedure": [...],
  "item": [...]
}
```

**الحقول المطلوبة:**
- `identifier` - رقم المطالبة
- `status` - نشط
- `type` - مؤسسي/مهني
- `patient` - مرجع المريض
- `provider` - منظمة مقدم الخدمة
- `insurance` - مرجع التغطية
- `diagnosis` - رموز ICD-10
- `item` - بنود الخدمة

---

### استجابة المطالبة (ClaimResponse)

**الغرض:** استجابة الدافع للمطالبة.

**العناصر الرئيسية:**
```json
{
  "resourceType": "ClaimResponse",
  "identifier": [{
    "value": "RSP-2024-001"
  }],
  "status": "active",
  "type": {
    "coding": [{
      "code": "institutional"
    }]
  },
  "use": "claim",
  "patient": {
    "reference": "Patient/123"
  },
  "created": "2024-01-16",
  "insurer": {
    "reference": "Organization/payer"
  },
  "outcome": "complete",
  "adjudication": [...],
  "item": [...]
}
```

**قيم النتيجة:**
- `queued` - في انتظار المعالجة
- `complete` - اكتمل التحكيم
- `error` - خطأ في المعالجة
- `partial` - معالجة جزئية

---

### المقابلة (Encounter)

**الغرض:** سجل زيارة/إدخال المريض.

**العناصر الرئيسية:**
```json
{
  "resourceType": "Encounter",
  "identifier": [{
    "value": "ENC-2024-001"
  }],
  "status": "finished",
  "class": {
    "code": "IMP",
    "display": "inpatient"
  },
  "type": [{
    "coding": [{
      "code": "185349003",
      "display": "Encounter for check up"
    }]
  }],
  "subject": {
    "reference": "Patient/123"
  },
  "period": {
    "start": "2024-01-10",
    "end": "2024-01-15"
  },
  "diagnosis": [...]
}
```

---

### الملاحظة (Observation)

**الغرض:** الملاحظات والنتائج السريرية.

**العناصر الرئيسية:**
```json
{
  "resourceType": "Observation",
  "status": "final",
  "category": [{
    "coding": [{
      "system": "http://terminology.hl7.org/CodeSystem/observation-category",
      "code": "laboratory"
    }]
  }],
  "code": {
    "coding": [{
      "system": "http://loinc.org",
      "code": "2339-0",
      "display": "Glucose"
    }]
  },
  "subject": {
    "reference": "Patient/123"
  },
  "valueQuantity": {
    "value": 95,
    "unit": "mg/dL"
  }
}
```

---

### الإجراء (Procedure)

**الغرض:** الإجراء السريري المنفذ.

**العناصر الرئيسية:**
```json
{
  "resourceType": "Procedure",
  "status": "completed",
  "code": {
    "coding": [{
      "system": "http://www.ama-assn.org/go/cpt",
      "code": "27447",
      "display": "Total knee replacement"
    }]
  },
  "subject": {
    "reference": "Patient/123"
  },
  "performedDateTime": "2024-01-12"
}
```

---

## ملفات نفيس الخاصة

### الامتدادات السعودية

**امتدادات المريض:**
- `nationality` - رمز الدولة
- `occupation` - رمز الوظيفة
- `educationLevel` - رمز التعليم

**امتدادات التغطية:**
- `policyHolder` - معلومات صاحب العمل
- `classOfBusiness` - فئة التأمين

**امتدادات المطالبة:**
- `episodeSequence` - رقم الحلقة
- `careType` - نوع الرعاية

---

## أنظمة الرموز

### رموز التشخيص

**النظام:** `http://hl7.org/fhir/sid/icd-10-am`

```json
{
  "coding": [{
    "system": "http://hl7.org/fhir/sid/icd-10-am",
    "code": "J06.9",
    "display": "Acute upper respiratory infection"
  }]
}
```

### رموز الإجراءات

**نظام ACHI:** `http://terminology.hl7.org/CodeSystem/achi`

**نظام CPT:** `http://www.ama-assn.org/go/cpt`

### رموز الخدمات

**نظام HCPCS:** `http://www.cms.gov/Medicare/Coding/HCPCSReleaseCodeSets`

---

## هيكل الحزمة

### حزمة تقديم المطالبة

```json
{
  "resourceType": "Bundle",
  "type": "collection",
  "entry": [
    {
      "resource": {
        "resourceType": "Claim",
        ...
      }
    },
    {
      "resource": {
        "resourceType": "Patient",
        ...
      }
    },
    {
      "resource": {
        "resourceType": "Coverage",
        ...
      }
    },
    {
      "resource": {
        "resourceType": "Encounter",
        ...
      }
    }
  ]
}
```

---

## قواعد التحقق

### الأخطاء الشائعة

| الخطأ | الوصف | الحل |
|-------|-------|------|
| INVALID_CODE | الرمز ليس في النظام | استخدم رمزًا صالحًا |
| MISSING_FIELD | حقل مطلوب مفقود | أضف الحقل |
| INVALID_REFERENCE | المرجع غير موجود | صحح المرجع |
| DATE_FORMAT | تنسيق تاريخ غير صالح | استخدم YYYY-MM-DD |
| CARDINALITY | عدد خاطئ من العناصر | تحقق من الحد الأدنى/الأقصى |

### أدوات التحقق

- HAPI FHIR Validator
- بيئة اختبار نفيس
- مدقق برينسايت (ClaimLinc)

---

## أفضل الممارسات

### إنشاء الموارد

1. استخدم المعرفات الصحيحة
2. ضمّن جميع الحقول المطلوبة
3. استخدم أنظمة الرموز المناسبة
4. تحقق قبل التقديم

### دقة الترميز

1. استخدم الرمز الأكثر تحديدًا
2. ضمّن جميع التشخيصات ذات الصلة
3. رتّب بشكل مناسب
4. أضف الرموز الداعمة

### تجميع الحزمة

1. ضمّن جميع الموارد المرجعية
2. استخدم نوع الحزمة المناسب
3. تحقق من الحزمة الكاملة
4. تحقق من ترتيب الموارد

---

## الوثائق ذات الصلة

- [نظرة عامة على نفيس](overview.md)
- [مرجع API](api_reference.md)
- [سير العمل](workflows.md)
- [خط أنابيب الأتمتة](../claims/automation_pipeline.md)

---

*آخر تحديث: يناير 2025*
