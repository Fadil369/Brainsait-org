# إدارة Vault والأسرار

## نظرة عامة

يصف هذا المستند ممارسات إدارة الأسرار في BrainSAIT باستخدام HashiCorp Vault وأدوات أخرى للتخزين والتوزيع الآمن لبيانات الاعتماد.

---

## البنية

### نشر Vault
- مجموعة عالية التوفر
- فك التشفير التلقائي (cloud KMS)
- تسجيل التدقيق
- استرداد الكوارث

### أنواع الأسرار
- بيانات اعتماد قواعد البيانات
- مفاتيح API
- شهادات TLS
- مفاتيح التشفير
- رموز OAuth

---

## دورة حياة الأسرار

### الإنشاء
1. إنشاء سر آمن
2. التخزين في Vault
3. تعيين سياسات الوصول
4. تكوين التدوير

### التوزيع
- الأسرار الديناميكية
- الرموز قصيرة العمر
- الوصول في الوقت المناسب

### التدوير
- التدوير التلقائي
- بدون وقت توقف
- مسار التدقيق

---

## التكوين

### سياسة Vault

```hcl
path "secret/data/production/*" {
  capabilities = ["read"]
}

path "database/creds/readonly" {
  capabilities = ["read"]
}
```

### تكامل Kubernetes

```yaml
vault.hashicorp.com/agent-inject: "true"
vault.hashicorp.com/role: "myapp"
vault.hashicorp.com/agent-inject-secret-db: "database/creds/myapp"
```

---

## المستندات ذات الصلة

- [الأمان](../infrastructure/security.ar.md)
- [SecUnit](../agents/secunit.ar.md)
- [CI/CD](cicd.ar.md)

---

*آخر تحديث: يناير 2025*
