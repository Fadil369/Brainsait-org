---
title: API Documentation Template | قالب توثيق واجهة البرمجة
description: Standard template for BrainSAIT API documentation
tags:
  - template
  - api
  - developer
---

!!! info "Translation in Progress / الترجمة قيد الإجراء"
    This content is currently being translated. / هذا المحتوى قيد الترجمة حالياً.

<div dir="rtl">


# API Documentation: [API Name]
# توثيق واجهة البرمجة: [اسم الواجهة]

**Version | الإصدار:** 1.0.0

**Base URL | الرابط الأساسي:** `https://api.brainsait.com/v1`

---

## Overview | نظرة عامة

**English:**
[Brief description of what this API does and its main use cases]

**العربية:**
[وصف موجز لما تفعله هذه الواجهة وحالات استخدامها الرئيسية]

### Key Features | الميزات الرئيسية

- [Feature 1] | [الميزة 1]
- [Feature 2] | [الميزة 2]
- [Feature 3] | [الميزة 3]

---

## Authentication | المصادقة

### OAuth 2.0 Bearer Token | رمز حامل OAuth 2.0

All API requests require authentication using a Bearer token.

تتطلب جميع طلبات الواجهة مصادقة باستخدام رمز Bearer.

```bash
curl -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
     -H "Content-Type: application/json" \
     https://api.brainsait.com/v1/endpoint
```

### Obtaining Tokens | الحصول على الرموز

```http
POST /oauth/token
Content-Type: application/x-www-form-urlencoded

grant_type=client_credentials
&client_id=YOUR_CLIENT_ID
&client_secret=YOUR_CLIENT_SECRET
```

**Response | الاستجابة:**

```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIs...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "scope": "read write"
}
```

---

## Common Headers | الترويسات الشائعة

| Header | الترويسة | Required | مطلوب | Description | الوصف |
|--------|----------|----------|-------|-------------|-------|
| `Authorization` | Authorization | Yes | نعم | Bearer token | رمز Bearer |
| `Content-Type` | Content-Type | Yes | نعم | `application/json` or `application/fhir+json` | نوع المحتوى |
| `Accept-Language` | Accept-Language | No | لا | `en` or `ar` for response language | لغة الاستجابة |
| `X-Request-ID` | X-Request-ID | No | لا | Unique request identifier | معرف الطلب الفريد |

---

## Rate Limits | حدود المعدل

| Plan | الخطة | Requests/Hour | الطلبات/ساعة | Burst | الدفعة |
|------|-------|---------------|--------------|-------|--------|
| Free | مجاني | 100 | 100 | 10/min | 10/دقيقة |
| Standard | قياسي | 1,000 | 1,000 | 100/min | 100/دقيقة |
| Enterprise | مؤسسي | Unlimited | غير محدود | Custom | مخصص |

**Rate Limit Headers | ترويسات حدود المعدل:**

```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 998
X-RateLimit-Reset: 1609459200
```

---

## Endpoints | نقاط النهاية

### Resource: [Resource Name] | المورد: [اسم المورد]

---

#### List [Resources] | قائمة [الموارد]

Retrieve a paginated list of resources.

استرجاع قائمة مقسمة من الموارد.

```http
GET /resources
```

**Query Parameters | معاملات الاستعلام:**

| Parameter | المعامل | Type | النوع | Required | مطلوب | Description | الوصف |
|-----------|---------|------|-------|----------|-------|-------------|-------|
| `page` | page | integer | عدد صحيح | No | لا | Page number (default: 1) | رقم الصفحة |
| `limit` | limit | integer | عدد صحيح | No | لا | Items per page (max: 100) | العناصر لكل صفحة |
| `status` | status | string | نص | No | لا | Filter by status | تصفية بالحالة |
| `from_date` | from_date | date | تاريخ | No | لا | Filter from date | تصفية من تاريخ |

**Request Example | مثال الطلب:**

```bash
curl -X GET "https://api.brainsait.com/v1/resources?page=1&limit=20&status=active" \
     -H "Authorization: Bearer YOUR_TOKEN"
```

**Response Example | مثال الاستجابة:**

```json
{
  "data": [
    {
      "id": "res_123456",
      "name": "Resource Name",
      "name_ar": "اسم المورد",
      "status": "active",
      "created_at": "2025-01-15T10:30:00Z"
    }
  ],
  "meta": {
    "current_page": 1,
    "per_page": 20,
    "total": 150,
    "total_pages": 8
  },
  "links": {
    "first": "/resources?page=1",
    "prev": null,
    "next": "/resources?page=2",
    "last": "/resources?page=8"
  }
}
```

---

#### Get [Resource] | الحصول على [المورد]

Retrieve a single resource by ID.

استرجاع مورد واحد بواسطة المعرف.

```http
GET /resources/{id}
```

**Path Parameters | معاملات المسار:**

| Parameter | المعامل | Type | النوع | Description | الوصف |
|-----------|---------|------|-------|-------------|-------|
| `id` | id | string | نص | Resource ID | معرف المورد |

**Response Example | مثال الاستجابة:**

```json
{
  "id": "res_123456",
  "name": "Resource Name",
  "name_ar": "اسم المورد",
  "description": "Resource description",
  "description_ar": "وصف المورد",
  "status": "active",
  "metadata": {
    "key": "value"
  },
  "created_at": "2025-01-15T10:30:00Z",
  "updated_at": "2025-01-16T14:20:00Z"
}
```

---

#### Create [Resource] | إنشاء [المورد]

Create a new resource.

إنشاء مورد جديد.

```http
POST /resources
```

**Request Body | محتوى الطلب:**

```json
{
  "name": "New Resource",
  "name_ar": "مورد جديد",
  "description": "Resource description",
  "description_ar": "وصف المورد",
  "type": "standard",
  "metadata": {
    "key": "value"
  }
}
```

**Request Fields | حقول الطلب:**

| Field | الحقل | Type | النوع | Required | مطلوب | Description | الوصف |
|-------|-------|------|-------|----------|-------|-------------|-------|
| `name` | name | string | نص | Yes | نعم | Resource name (English) | اسم المورد (إنجليزي) |
| `name_ar` | name_ar | string | نص | Yes | نعم | Resource name (Arabic) | اسم المورد (عربي) |
| `type` | type | string | نص | Yes | نعم | Resource type | نوع المورد |
| `metadata` | metadata | object | كائن | No | لا | Additional metadata | بيانات إضافية |

**Response | الاستجابة:** `201 Created`

```json
{
  "id": "res_789012",
  "name": "New Resource",
  "name_ar": "مورد جديد",
  "status": "active",
  "created_at": "2025-01-20T09:00:00Z"
}
```

---

#### Update [Resource] | تحديث [المورد]

Update an existing resource.

تحديث مورد موجود.

```http
PUT /resources/{id}
```

**Request Body | محتوى الطلب:**

```json
{
  "name": "Updated Name",
  "name_ar": "الاسم المحدث",
  "status": "inactive"
}
```

**Response | الاستجابة:** `200 OK`

---

#### Delete [Resource] | حذف [المورد]

Delete a resource (soft delete).

حذف مورد (حذف ناعم).

```http
DELETE /resources/{id}
```

**Response | الاستجابة:** `204 No Content`

---

## FHIR Resources | موارد FHIR

For FHIR-compliant endpoints, use `application/fhir+json` content type.

لنقاط النهاية المتوافقة مع FHIR، استخدم نوع المحتوى `application/fhir+json`.

### Claim Submission | تقديم المطالبة

```http
POST /fhir/Claim
Content-Type: application/fhir+json
```

**FHIR Claim Example | مثال مطالبة FHIR:**

```json
{
  "resourceType": "Claim",
  "id": "claim-123",
  "status": "active",
  "type": {
    "coding": [
      {
        "system": "http://terminology.hl7.org/CodeSystem/claim-type",
        "code": "institutional"
      }
    ]
  },
  "patient": {
    "reference": "Patient/patient-456"
  },
  "created": "2025-01-20",
  "provider": {
    "reference": "Organization/org-789"
  },
  "priority": {
    "coding": [
      {
        "code": "normal"
      }
    ]
  },
  "insurance": [
    {
      "sequence": 1,
      "focal": true,
      "coverage": {
        "reference": "Coverage/coverage-012"
      }
    }
  ]
}
```

---

## Error Handling | معالجة الأخطاء

### Error Response Format | تنسيق استجابة الخطأ

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "message_ar": "فشل التحقق",
    "details": [
      {
        "field": "name",
        "code": "REQUIRED",
        "message": "Name is required",
        "message_ar": "الاسم مطلوب"
      }
    ],
    "request_id": "req_abc123"
  }
}
```

### HTTP Status Codes | رموز حالة HTTP

| Code | الرمز | Meaning | المعنى |
|------|-------|---------|--------|
| `200` | نجاح | OK - Request succeeded | الطلب نجح |
| `201` | تم الإنشاء | Created - Resource created | تم إنشاء المورد |
| `204` | لا محتوى | No Content - Deleted successfully | تم الحذف بنجاح |
| `400` | طلب خاطئ | Bad Request - Invalid input | إدخال غير صالح |
| `401` | غير مصرح | Unauthorized - Invalid token | رمز غير صالح |
| `403` | محظور | Forbidden - Insufficient permissions | صلاحيات غير كافية |
| `404` | غير موجود | Not Found - Resource not found | المورد غير موجود |
| `422` | غير قابل للمعالجة | Unprocessable - Business rule violation | انتهاك قواعد العمل |
| `429` | طلبات كثيرة | Too Many Requests - Rate limited | تجاوز حدود المعدل |
| `500` | خطأ خادم | Internal Error - Server error | خطأ في الخادم |

### Error Codes | رموز الأخطاء

| Code | الرمز | Description | الوصف |
|------|-------|-------------|-------|
| `VALIDATION_ERROR` | خطأ التحقق | Request validation failed | فشل التحقق من الطلب |
| `AUTHENTICATION_ERROR` | خطأ المصادقة | Invalid or expired token | رمز غير صالح أو منتهي |
| `AUTHORIZATION_ERROR` | خطأ التفويض | Insufficient permissions | صلاحيات غير كافية |
| `NOT_FOUND` | غير موجود | Resource not found | المورد غير موجود |
| `DUPLICATE_ERROR` | خطأ تكرار | Resource already exists | المورد موجود مسبقاً |
| `BUSINESS_RULE_ERROR` | خطأ قواعد العمل | Business rule violated | انتهاك قواعد العمل |

---

## Webhooks | خطافات الويب

### Event Types | أنواع الأحداث

| Event | الحدث | Description | الوصف |
|-------|-------|-------------|-------|
| `resource.created` | تم إنشاء المورد | New resource created | تم إنشاء مورد جديد |
| `resource.updated` | تم تحديث المورد | Resource updated | تم تحديث المورد |
| `resource.deleted` | تم حذف المورد | Resource deleted | تم حذف المورد |
| `claim.submitted` | تم تقديم المطالبة | Claim submitted to payer | تم تقديم المطالبة للدافع |
| `claim.adjudicated` | تم تسوية المطالبة | Claim decision received | تم استلام قرار المطالبة |

### Webhook Payload | محتوى خطاف الويب

```json
{
  "id": "evt_abc123",
  "type": "resource.created",
  "created_at": "2025-01-20T10:00:00Z",
  "data": {
    "id": "res_789012",
    "object": "resource",
    "name": "New Resource"
  }
}
```

### Webhook Security | أمان خطافات الويب

Verify webhook signatures using the `X-Signature` header:

```python
import hmac
import hashlib

def verify_webhook(payload, signature, secret):
    expected = hmac.new(
        secret.encode(),
        payload.encode(),
        hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(expected, signature)
```

---

## SDKs & Libraries | مكتبات التطوير

### Python SDK | مكتبة بايثون

```bash
pip install brainsait-sdk
```

```python
from brainsait import Client

client = Client(api_key="YOUR_API_KEY")

# List resources | قائمة الموارد
resources = client.resources.list(status="active")

# Create resource | إنشاء مورد
new_resource = client.resources.create(
    name="New Resource",
    name_ar="مورد جديد",
    type="standard"
)
```

### TypeScript SDK | مكتبة تايب سكريبت

```bash
npm install @brainsait/sdk
```

```typescript
import { BrainSAIT } from '@brainsait/sdk';

const client = new BrainSAIT({
  apiKey: 'YOUR_API_KEY'
});

// List resources | قائمة الموارد
const resources = await client.resources.list({ status: 'active' });

// Create resource | إنشاء مورد
const newResource = await client.resources.create({
  name: 'New Resource',
  name_ar: 'مورد جديد',
  type: 'standard'
});
```

---

## Testing | الاختبار

### Sandbox Environment | بيئة الاختبار

**Base URL | الرابط الأساسي:** `https://sandbox.api.brainsait.com/v1`

Test credentials:
- Client ID: `sandbox_client_id`
- Client Secret: `sandbox_client_secret`

### Test Data | بيانات الاختبار

| ID | Type | الوصف |
|----|------|-------|
| `test_patient_001` | Patient | Test patient record |
| `test_claim_001` | Claim | Sample approved claim |
| `test_claim_002` | Claim | Sample rejected claim |

---

## Changelog | سجل التغييرات

### Version 1.0.0 (2025-01-01)

**Added | أضيف:**
- Initial API release | الإصدار الأولي
- Core CRUD operations | عمليات CRUD الأساسية
- FHIR R4 support | دعم FHIR R4

---

## Support | الدعم

- **Documentation | التوثيق:** https://docs.brainsait.com
- **API Status | حالة الواجهة:** https://status.brainsait.com
- **Email | البريد:** api-support@brainsait.com

---

**BrainSAIT API Documentation** | توثيق واجهة برمجة برينسايت

OID: `1.3.6.1.4.1.61026`


</div>