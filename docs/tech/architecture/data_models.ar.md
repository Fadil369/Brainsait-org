# نماذج البيانات

## نماذج FHIR

نستخدم FHIR R4 لجميع البيانات الصحية:

### الموارد الأساسية

- **Patient**: بيانات المريض
- **Claim**: المطالبات
- **Coverage**: التغطية التأمينية
- **Encounter**: الزيارات
- **Observation**: الملاحظات السريرية
- **Procedure**: الإجراءات الطبية

## مخطط قاعدة البيانات

### الجداول الرئيسية

```sql
-- المرضى
patients (
  id, national_id, name_ar, name_en,
  date_of_birth, gender, mobile, email
)

-- المطالبات
claims (
  id, claim_number, patient_id, provider_id,
  payer_id, status, total_amount, fhir_bundle
)

-- سجلات التدقيق
audit_logs (
  id, entity_type, entity_id, action,
  user_id, ip_address, changes, created_at
)
```

## العلاقات

- مريض واحد → مطالبات متعددة
- مطالبة واحدة → زيارة واحدة
- زيارة واحدة → إجراءات متعددة