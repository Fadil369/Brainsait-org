# حزم المهارات

## نظرة عامة

حزم المهارات هي حزم قدرات معيارية تُوسع وكلاء BrainSAIT بوظائف محددة. يصف هذا المستند بنية حزم المهارات والحزم المتاحة وكيفية إنشاء مهارات مخصصة.

---

## البنية

### هيكل الحزمة

```
skill-bundle/
├── manifest.yaml
├── skills/
│   ├── skill1.py
│   └── skill2.py
├── prompts/
│   ├── system.md
│   └── examples/
├── models/
│   └── config.yaml
├── tests/
│   └── test_skills.py
└── README.md
```

### مخطط البيان

```yaml
name: claims-analysis
version: 1.2.0
description: قدرات تحليل المطالبات المتقدمة
author: BrainSAIT
license: proprietary

dependencies:
  - core >= 1.0
  - nlp >= 2.0

skills:
  - name: rejection-analyzer
    entry: skills/rejection_analyzer.py
    class: RejectionAnalyzer

  - name: code-suggester
    entry: skills/code_suggester.py
    class: CodeSuggester

config:
  model: claude-sonnet-4-5-20250929
  temperature: 0.1
  max_tokens: 4096
```

---

## حزم المهارات الأساسية

### حزمة الرعاية الصحية

**الاسم:** `healthcare-core`

**المهارات:**
- `claim-validator` - التحقق من مطالبات FHIR
- `code-mapper` - ربط ICD-10/CPT
- `policy-checker` - التحقق من التغطية
- `document-extractor` - معالجة المستندات الطبية

**التبعيات:**
- نماذج المصطلحات الطبية
- مُحقق FHIR
- قواعد بيانات الترميز

### حزمة معالجة المستندات

**الاسم:** `document-processing`

**المهارات:**
- `ocr-engine` - استخراج النص
- `table-extractor` - التعرف على الجداول
- `form-parser` - استخراج حقول النماذج
- `layout-analyzer` - هيكل المستند

**التبعيات:**
- Tesseract OCR
- نماذج الرؤية الحاسوبية
- نماذج التخطيط

### حزمة التحليلات

**الاسم:** `analytics-core`

**المهارات:**
- `trend-analyzer` - اكتشاف الأنماط
- `anomaly-detector` - تحديد القيم الشاذة
- `forecaster` - التنبؤات
- `report-generator` - التقارير الآلية

**التبعيات:**
- النماذج الإحصائية
- نماذج السلاسل الزمنية
- مكتبات التصور

---

## تثبيت الحزم

### من السجل

```bash
# التثبيت من سجل BrainSAIT
brainsait bundle install healthcare-core

# تثبيت إصدار محدد
brainsait bundle install healthcare-core@1.2.0

# سرد الحزم المثبتة
brainsait bundle list
```

### من المصدر

```bash
# التثبيت من مسار محلي
brainsait bundle install ./my-bundle

# التثبيت من Git
brainsait bundle install git://github.com/brainsait/bundle.git
```

---

## استخدام المهارات

### في تكوين الوكيل

```yaml
# agent.yaml
name: ClaimLinc
version: 1.0

bundles:
  - healthcare-core
  - document-processing

skills:
  - rejection-analyzer
  - code-mapper
  - document-extractor

config:
  rejection-analyzer:
    confidence_threshold: 0.85
```

### في الكود

```python
from brainsait.agents import Agent
from brainsait.skills import SkillRegistry

# تحميل الوكيل مع المهارات
agent = Agent.load("ClaimLinc")

# استخدام المهارة مباشرة
result = agent.skills.rejection_analyzer.analyze(claim_data)

# أو من خلال تنفيذ الوكيل
response = agent.execute(
    task="analyze_rejection",
    data=claim_data
)
```

---

## إنشاء مهارات مخصصة

### مهارة أساسية

```python
from brainsait.skills import Skill, skill_method

class CustomAnalyzer(Skill):
    """مهارة تحليل مخصصة."""

    name = "custom-analyzer"
    version = "1.0.0"

    def __init__(self, config):
        super().__init__(config)
        self.threshold = config.get('threshold', 0.8)

    @skill_method
    async def analyze(self, data: dict) -> dict:
        """تحليل بيانات الإدخال.

        Args:
            data: بيانات الإدخال للتحليل

        Returns:
            نتائج التحليل
        """
        # التنفيذ
        result = self._process(data)
        return {
            'status': 'success',
            'confidence': result.confidence,
            'findings': result.findings
        }

    def _process(self, data):
        # منطق المعالجة الداخلي
        pass
```

### مهارة مع الذكاء الاصطناعي

```python
from brainsait.skills import AISkill, skill_method

class IntelligentAnalyzer(AISkill):
    """مهارة تحليل مدعومة بالذكاء الاصطناعي."""

    system_prompt = """
    أنت خبير في تحليل المطالبات الطبية.
    حلل بيانات المطالبة المقدمة وحدد المشكلات.
    """

    @skill_method
    async def analyze(self, claim: dict) -> dict:
        response = await self.llm.complete(
            messages=[
                {"role": "system", "content": self.system_prompt},
                {"role": "user", "content": json.dumps(claim)}
            ],
            temperature=0.1
        )

        return self._parse_response(response)
```

---

## اختبار المهارات

### اختبارات الوحدة

```python
import pytest
from my_bundle.skills import CustomAnalyzer

@pytest.fixture
def analyzer():
    config = {'threshold': 0.8}
    return CustomAnalyzer(config)

async def test_analyze_valid_data(analyzer):
    data = {'field': 'value'}
    result = await analyzer.analyze(data)

    assert result['status'] == 'success'
    assert result['confidence'] >= 0.8

async def test_analyze_invalid_data(analyzer):
    with pytest.raises(ValidationError):
        await analyzer.analyze({})
```

### اختبارات التكامل

```python
async def test_skill_integration():
    agent = Agent.load("TestAgent")

    result = await agent.execute(
        task="analyze",
        data=test_data
    )

    assert result.success
    assert len(result.findings) > 0
```

---

## إصدار الحزم

### الإصدار الدلالي

- **كبير:** تغييرات كاسرة
- **صغير:** ميزات جديدة (متوافقة مع الخلف)
- **تصحيحي:** إصلاح الأخطاء

### التوافق

```yaml
# تحديد التوافق في البيان
compatibility:
  min_core: 1.0.0
  max_core: 2.0.0

dependencies:
  - nlp ^2.0  # متوافق مع 2.x
  - utils ~1.2  # متوافق مع 1.2.x
```

---

## التوزيع

### النشر

```bash
# بناء الحزمة
brainsait bundle build

# النشر في السجل
brainsait bundle publish

# السجل الخاص
brainsait bundle publish --registry private.registry.com
```

### إدارة السجل

```bash
# إضافة سجل
brainsait registry add private https://private.registry.com

# تعيين بيانات الاعتماد
brainsait registry login private

# سرد السجلات
brainsait registry list
```

---

## أفضل الممارسات

### التصميم

1. مسؤولية واحدة لكل مهارة
2. واجهات واضحة
3. توثيق شامل
4. اختبار شامل

### الأداء

1. العمليات غير المتزامنة
2. التخزين المؤقت الفعال
3. إدارة الموارد
4. معالجة الأخطاء

### الأمان

1. التحقق من الإدخال
2. تطهير الإخراج
3. تبعيات آمنة
4. تسجيل التدقيق

---

## المستندات ذات الصلة

- [MasterLinc](masterlinc.ar.md)
- [DevLinc](devlinc.ar.md)
- [نظرة عامة على البنية](../architecture/overview.ar.md)
- [مرجع API](../apis/overview.ar.md)

---

*آخر تحديث: يناير 2025*
