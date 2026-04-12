# PDF to Markdown Converter - دليل الاستخدام

تحويل ملفات PDF إلى Markdown للاستخدام في Obsidian

## ✅ التثبيت (Installation)

Poppler مثبت بالفعل على جهازك! ✓

```bash
which pdftotext
# Output: /opt/homebrew/bin/pdftotext
```

## 🚀 طرق الاستخدام (Usage Methods)

### الطريقة 1: Bash Script (سهل وسريع)

```bash
# تحويل ملف واحد
~/scripts/pdf_to_markdown.sh ECG_Notes.pdf

# تحويل عدة ملفات
~/scripts/pdf_to_markdown.sh file1.pdf file2.pdf file3.pdf

# استخدام تفاعلي (Interactive)
~/scripts/pdf_to_markdown.sh
```

### الطريقة 2: Python Script (متقدم)

```bash
# تحويل ملف واحد
python3 ~/scripts/pdf_to_markdown.py ECG_Notes.pdf

# تحويل كل الملفات في مجلد
python3 ~/scripts/pdf_to_markdown.py --dir ~/Documents/Medical

# نسخ تلقائي إلى Obsidian
python3 ~/scripts/pdf_to_markdown.py ECG_Notes.pdf --obsidian ~/ObsidianVault

# تحويل مع بحث في المجلدات الفرعية
python3 ~/scripts/pdf_to_markdown.py --dir ~/Documents --recursive
```

### الطريقة 3: الأمر المباشر (Manual Command)

```bash
# تحويل بسيط
pdftotext -layout ECG_Notes.pdf ECG_Notes.md

# تحويل مع الحفاظ على التنسيق
pdftotext -layout -nopgbrk ECG_Notes.pdf output.md
```

## 📊 الأوامر المتقدمة (Advanced Commands)

### 1. تحويل مع خيارات إضافية

```bash
# تحويل صفحات محددة (الصفحات 1-10)
pdftotext -f 1 -l 10 -layout ECG_Notes.pdf output.md

# تحويل بدون ترقيم الصفحات
pdftotext -layout -nopgbrk ECG_Notes.pdf output.md

# تحويل إلى UTF-8
pdftotext -enc UTF-8 -layout ECG_Notes.pdf output.md
```

### 2. تحويل دفعي (Batch Conversion)

```bash
# تحويل كل الـ PDFs في المجلد الحالي
for pdf in *.pdf; do
    pdftotext -layout "$pdf" "${pdf%.pdf}.md"
done

# أو استخدام Python script
python3 ~/scripts/pdf_to_markdown.py *.pdf
```

## 🗂️ التنظيم في Obsidian (Obsidian Organization)

### هيكل مقترح للمجلدات:

```
ObsidianVault/
├── 📚 Medical Notes/
│   ├── ECG_Notes.md
│   ├── Cardiology.md
│   └── ...
├── 📄 Imported PDFs/
│   └── (ملفات PDF المحولة تلقائياً)
└── 🏷️ Templates/
    └── pdf-note-template.md
```

### إضافة Metadata في Obsidian:

عند التحويل باستخدام Python script، يتم إضافة metadata تلقائياً:

```markdown
---
title: ECG_Notes
date: 2026-02-15
source: ECG_Notes.pdf
type: pdf-conversion
tags: [pdf, imported, medical-notes]
---

# ECG_Notes

> 📄 Converted from: `ECG_Notes.pdf`
> 📅 Date: 2026-02-15 03:20

---

[محتوى الملف...]
```

## 🔧 نصائح التحسين (Optimization Tips)

### 1. تحسين جودة التحويل

```bash
# استخدام OCR للـ PDFs الممسوحة ضوئياً
brew install tesseract tesseract-lang

# تحويل PDF ممسوح ضوئياً
ocrmypdf input.pdf output.pdf
pdftotext -layout output.pdf output.md
```

### 2. إنشاء Alias سريع

أضف إلى `~/.zshrc` أو `~/.bashrc`:

```bash
# Alias للتحويل السريع
alias pdf2md="python3 ~/scripts/pdf_to_markdown.py"
alias pdf2obs="python3 ~/scripts/pdf_to_markdown.py --obsidian ~/ObsidianVault"

# استخدام:
pdf2md file.pdf
pdf2obs file.pdf
```

ثم:
```bash
source ~/.zshrc  # أو ~/.bashrc
```

### 3. Automator Workflow (macOS)

إنشاء Quick Action للتحويل من Finder:

1. افتح **Automator**
2. اختر **Quick Action**
3. أضف **Run Shell Script**
4. اكتب:
```bash
for f in "$@"
do
    python3 ~/scripts/pdf_to_markdown.py "$f"
done
```
5. احفظ باسم "Convert PDF to Markdown"

الآن: انقر بالزر الأيمن على PDF → Quick Actions → Convert PDF to Markdown

## 📱 مزامنة مع Obsidian (Sync Options)

### iCloud Drive

```bash
# تحويل مباشرة إلى iCloud Obsidian Vault
python3 ~/scripts/pdf_to_markdown.py ECG_Notes.pdf \
    --obsidian ~/Library/Mobile\ Documents/iCloud~md~obsidian/Documents/MyVault
```

### Obsidian Sync

الملفات ستتم مزامنتها تلقائياً عند وضعها في Vault.

## 🧪 أمثلة عملية (Practical Examples)

### مثال 1: ملاحظات طبية

```bash
# تحويل ملف ECG
python3 ~/scripts/pdf_to_markdown.py ~/Documents/Medical/ECG_Notes.pdf

# النتيجة:
# ✅ Created: ECG_Notes.md
# 📊 Size: 45.2 KB
```

### مثال 2: مكتبة بحثية

```bash
# تحويل كل الأبحاث
python3 ~/scripts/pdf_to_markdown.py \
    --dir ~/Documents/Research \
    --recursive \
    --obsidian ~/ObsidianVault

# النتيجة:
# 🔄 Found 23 PDF file(s)
# ✅ Successfully converted: 23
```

### مثال 3: كتب دراسية

```bash
# تحويل فصول منفصلة
for chapter in Chapter*.pdf; do
    pdftotext -layout "$chapter" "Notes-${chapter%.pdf}.md"
done
```

## 🆘 حل المشاكل (Troubleshooting)

### مشكلة: نص غير واضح أو رموز غريبة

**الحل:**
```bash
# جرب encoding مختلف
pdftotext -enc UTF-8 file.pdf output.md
# أو
pdftotext -enc Latin1 file.pdf output.md
```

### مشكلة: PDF ممسوح ضوئياً (صورة)

**الحل:** استخدم OCR
```bash
brew install ocrmypdf
ocrmypdf --language ara+eng input.pdf output-ocr.pdf
pdftotext -layout output-ocr.pdf output.md
```

### مشكلة: التنسيق غير محفوظ

**الحل:** استخدم `-layout`
```bash
pdftotext -layout -nopgbrk file.pdf output.md
```

## 📚 موارد إضافية (Additional Resources)

- **Poppler Docs**: https://poppler.freedesktop.org/
- **Obsidian Help**: https://help.obsidian.md/
- **Python Script**: `~/scripts/pdf_to_markdown.py`
- **Bash Script**: `~/scripts/pdf_to_markdown.sh`

## ✨ ملخص الأوامر السريعة (Quick Commands Summary)

```bash
# أسرع طريقة
pdftotext -layout file.pdf file.md

# مع metadata لـ Obsidian
python3 ~/scripts/pdf_to_markdown.py file.pdf

# نسخ تلقائي لـ Obsidian
python3 ~/scripts/pdf_to_markdown.py file.pdf --obsidian ~/ObsidianVault

# تحويل مجلد كامل
python3 ~/scripts/pdf_to_markdown.py --dir ~/Documents/PDFs

# تحويل تفاعلي
~/scripts/pdf_to_markdown.sh
```

---

**هل تستخدم iCloud Drive أو Obsidian Sync؟**

أخبرني لأضيف إعدادات مخصصة! 🚀
