# مصادقة API

## نظرة عامة

يصف هذا المستند طرق المصادقة لواجهات برمجة تطبيقات BrainSAIT.

---

## طرق المصادقة

### مفتاح API

```http
GET /v1/claims
X-API-Key: your-api-key
```

### OAuth 2.0

```http
POST /oauth/token
Content-Type: application/x-www-form-urlencoded

grant_type=client_credentials
&client_id=your-client-id
&client_secret=your-secret
```

الاستجابة:
```json
{
  "access_token": "eyJ...",
  "token_type": "Bearer",
  "expires_in": 3600
}
```

الاستخدام:
```http
GET /v1/claims
Authorization: Bearer eyJ...
```

---

## أفضل ممارسات الأمان

1. **عدم كشف الأسرار أبداً** في الكود من جانب العميل
2. **تدوير المفاتيح** بانتظام
3. **استخدام HTTPS** دائماً
4. **تحديد النطاقات** للحد الأدنى المطلوب
5. **مراقبة الاستخدام** للشذوذات

---

## إدارة المفاتيح

- إنشاء المفاتيح في لوحة التحكم
- إلغاء المفاتيح المخترقة فوراً
- استخدام مفاتيح مختلفة لكل بيئة

---

## المستندات ذات الصلة

- [نظرة عامة على API](overview.ar.md)
- [Vault والأسرار](../devops/vault_secrets.ar.md)
- [الأمان](../infrastructure/security.ar.md)

---

*آخر تحديث: يناير 2025*
