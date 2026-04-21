#!/usr/bin/env python3
"""
Slack Template Fetcher for Brainsait
=====================================

This script fetches templates from Slack, converts them to markdown,
translates to Arabic, and prepares Brainsait-branded versions.

Requirements:
    pip install slack_sdk deep-translator python-dotenv

Setup:
    1. Create a Slack App at https://api.slack.com/apps
    2. Add OAuth scopes: channels:read, channels:history, groups:read,
       groups:history, files:read, users:read
    3. Install app to workspace and get Bot User OAuth Token
    4. Set environment variable: export SLACK_BOT_TOKEN="xoxb-..."

Usage:
    python slack_template_fetcher.py --fetch-all
    python slack_template_fetcher.py --fetch-doc F0844KK58B1
    python slack_template_fetcher.py --list-templates
"""

import os
import re
import json
import argparse
from datetime import datetime
from pathlib import Path
from typing import Optional, Dict, List, Any

try:
    from slack_sdk import WebClient
    from slack_sdk.errors import SlackApiError
    SLACK_SDK_AVAILABLE = True
except ImportError:
    SLACK_SDK_AVAILABLE = False
    print("Warning: slack_sdk not installed. Run: pip install slack_sdk")

try:
    from deep_translator import GoogleTranslator
    TRANSLATOR_AVAILABLE = True
except ImportError:
    TRANSLATOR_AVAILABLE = False
    print("Warning: deep-translator not installed. Run: pip install deep-translator")

# Template URLs provided by user
SLACK_DOC_URLS = [
    "https://brainsait.slack.com/docs/T05NCLU87L2/F0844KK58B1",
    "https://brainsait.slack.com/docs/T05NCLU87L2/F084XRVN71P",
    "https://brainsait.slack.com/docs/T05NCLU87L2/F084CGV8LMU",
    "https://brainsait.slack.com/docs/T05NCLU87L2/F09C8Q16QHK",
    "https://brainsait.slack.com/docs/T05NCLU87L2/F0639QWR1KM",
]

SLACK_CHANNEL_TEMPLATES = [
    "onboarding_template",
    "slack_crm_template",
    "project_template",
    "help_template",
    "social_template",
    "one_on_one_coaching_template",
    "customer_onboarding_template",
    "external_partners_template",
    "deal_tracking_template",
    "event_preparation_template",
    "ama_template",
    "marketing_campaign_template",
    "enablement_hub_template",
    "feedback_template",
    "brand_guidelines_template",
    "benefits_hub_template",
    "time_off_request_template",
]

# Template metadata for better organization
TEMPLATE_METADATA = {
    "onboarding_template": {
        "category": "hr",
        "title_en": "Employee Onboarding",
        "title_ar": "تأهيل الموظفين",
        "description_en": "streamlining new employee onboarding with structured channels and resources",
        "description_ar": "تبسيط عملية تأهيل الموظفين الجدد من خلال قنوات ومصادر منظمة",
    },
    "slack_crm_template": {
        "category": "sales",
        "title_en": "CRM & Sales Pipeline",
        "title_ar": "إدارة علاقات العملاء وخط المبيعات",
        "description_en": "tracking customer relationships and sales opportunities",
        "description_ar": "تتبع علاقات العملاء وفرص المبيعات",
    },
    "project_template": {
        "category": "operations",
        "title_en": "Project Management",
        "title_ar": "إدارة المشاريع",
        "description_en": "coordinating project tasks, milestones, and team collaboration",
        "description_ar": "تنسيق مهام المشروع والمراحل الرئيسية والتعاون بين الفريق",
    },
    "help_template": {
        "category": "support",
        "title_en": "Help Desk & Support",
        "title_ar": "مكتب المساعدة والدعم",
        "description_en": "managing internal or external support requests",
        "description_ar": "إدارة طلبات الدعم الداخلية أو الخارجية",
    },
    "social_template": {
        "category": "marketing",
        "title_en": "Social Media Management",
        "title_ar": "إدارة وسائل التواصل الاجتماعي",
        "description_en": "coordinating social media content and campaigns",
        "description_ar": "تنسيق محتوى وحملات وسائل التواصل الاجتماعي",
    },
    "one_on_one_coaching_template": {
        "category": "hr",
        "title_en": "One-on-One Coaching",
        "title_ar": "التدريب الفردي",
        "description_en": "structuring manager-employee coaching conversations",
        "description_ar": "هيكلة محادثات التدريب بين المدير والموظف",
    },
    "customer_onboarding_template": {
        "category": "customer_success",
        "title_en": "Customer Onboarding",
        "title_ar": "تأهيل العملاء",
        "description_en": "guiding new customers through implementation",
        "description_ar": "توجيه العملاء الجدد خلال عملية التنفيذ",
    },
    "external_partners_template": {
        "category": "partnerships",
        "title_en": "External Partners Collaboration",
        "title_ar": "التعاون مع الشركاء الخارجيين",
        "description_en": "managing communication with external partners and vendors",
        "description_ar": "إدارة التواصل مع الشركاء والموردين الخارجيين",
    },
    "deal_tracking_template": {
        "category": "sales",
        "title_en": "Deal Tracking",
        "title_ar": "تتبع الصفقات",
        "description_en": "tracking sales deals through pipeline stages",
        "description_ar": "تتبع صفقات المبيعات عبر مراحل خط الأنابيب",
    },
    "event_preparation_template": {
        "category": "operations",
        "title_en": "Event Preparation",
        "title_ar": "التحضير للفعاليات",
        "description_en": "planning and coordinating events and conferences",
        "description_ar": "التخطيط والتنسيق للفعاليات والمؤتمرات",
    },
    "ama_template": {
        "category": "engagement",
        "title_en": "Ask Me Anything (AMA)",
        "title_ar": "اسألني أي شيء",
        "description_en": "hosting Q&A sessions with leadership or experts",
        "description_ar": "استضافة جلسات الأسئلة والأجوبة مع القيادة أو الخبراء",
    },
    "marketing_campaign_template": {
        "category": "marketing",
        "title_en": "Marketing Campaign",
        "title_ar": "الحملة التسويقية",
        "description_en": "coordinating marketing campaigns and launches",
        "description_ar": "تنسيق الحملات التسويقية والإطلاقات",
    },
    "enablement_hub_template": {
        "category": "training",
        "title_en": "Enablement Hub",
        "title_ar": "مركز التمكين",
        "description_en": "providing training and enablement resources",
        "description_ar": "موارد التدريب والتمكين",
    },
    "feedback_template": {
        "category": "hr",
        "title_en": "Feedback Collection",
        "title_ar": "جمع الملاحظات",
        "description_en": "gathering and processing team or customer feedback",
        "description_ar": "جمع ومعالجة ملاحظات الفريق أو العملاء",
    },
    "brand_guidelines_template": {
        "category": "marketing",
        "title_en": "Brand Guidelines",
        "title_ar": "إرشادات العلامة التجارية",
        "description_en": "centralizing brand assets and guidelines",
        "description_ar": "مركزة أصول وإرشادات العلامة التجارية",
    },
    "benefits_hub_template": {
        "category": "hr",
        "title_en": "Benefits Hub",
        "title_ar": "مركز المزايا",
        "description_en": "providing employee benefits information and resources",
        "description_ar": "معلومات وموارد مزايا الموظفين",
    },
    "time_off_request_template": {
        "category": "hr",
        "title_en": "Time-Off Request",
        "title_ar": "طلب إجازة",
        "description_en": "managing leave requests and approvals",
        "description_ar": "إدارة طلبات الإجازات والموافقات",
    },
}


class SlackTemplateConverter:
    """Converts Slack formatting to Markdown."""

    @staticmethod
    def slack_to_markdown(text: str) -> str:
        """Convert Slack mrkdwn to standard Markdown."""
        if not text:
            return ""

        # Bold: *text* -> **text**
        text = re.sub(r'\*([^*]+)\*', r'**\1**', text)

        # Italic: _text_ -> *text*
        text = re.sub(r'_([^_]+)_', r'*\1*', text)

        # Strikethrough: ~text~ -> ~~text~~
        text = re.sub(r'~([^~]+)~', r'~~\1~~', text)

        # Links: <url|text> -> [text](url)
        text = re.sub(r'<(https?://[^|>]+)\|([^>]+)>', r'[\2](\1)', text)

        # Plain links: <url> -> url
        text = re.sub(r'<(https?://[^>]+)>', r'\1', text)

        # User mentions: <@U...> -> @user
        text = re.sub(r'<@([A-Z0-9]+)>', r'@user', text)

        # Channel mentions: <#C...|channel-name> -> #channel-name
        text = re.sub(r'<#[A-Z0-9]+\|([^>]+)>', r'#\1', text)

        # Emoji: :emoji_name: -> :emoji_name: (keep as is for compatibility)

        return text


class MarkdownTranslator:
    """Translates markdown content while preserving formatting."""

    def __init__(self):
        self.translator = None
        if TRANSLATOR_AVAILABLE:
            self.translator = GoogleTranslator(source='en', target='ar')

    def translate_text(self, text: str) -> str:
        """Translate text to Arabic, preserving code blocks and links."""
        if not self.translator or not text.strip():
            return text

        # Split by code blocks to preserve them
        code_block_pattern = r'(```[\s\S]*?```)'
        parts = re.split(code_block_pattern, text)

        translated_parts = []
        for i, part in enumerate(parts):
            if part.startswith('```') and part.endswith('```'):
                # Keep code blocks unchanged
                translated_parts.append(part)
            else:
                # Translate non-code parts
                translated_parts.append(self._translate_preserving_markdown(part))

        return ''.join(translated_parts)

    def _translate_preserving_markdown(self, text: str) -> str:
        """Translate text while preserving markdown formatting."""
        if not text.strip():
            return text

        # Store links and replace with placeholders
        links = []
        link_pattern = r'\[([^\]]+)\]\(([^)]+)\)'

        def store_link(match):
            links.append((match.group(1), match.group(2)))
            return f'[[LINK_{len(links)-1}]]'

        text = re.sub(link_pattern, store_link, text)

        # Store inline code
        inline_codes = []
        inline_pattern = r'`([^`]+)`'

        def store_code(match):
            inline_codes.append(match.group(1))
            return f'[[CODE_{len(inline_codes)-1}]]'

        text = re.sub(inline_pattern, store_code, text)

        # Translate paragraphs
        paragraphs = text.split('\n\n')
        translated_paragraphs = []

        for para in paragraphs:
            if para.strip():
                try:
                    # Skip if it's just whitespace or special characters
                    if re.match(r'^[\s\-#*>]+$', para.strip()):
                        translated_paragraphs.append(para)
                    else:
                        translated = self.translator.translate(para)
                        translated_paragraphs.append(translated if translated else para)
                except Exception as e:
                    print(f"Warning: Translation failed for paragraph. Error: {e}")
                    translated_paragraphs.append(para)
            else:
                translated_paragraphs.append(para)

        text = '\n\n'.join(translated_paragraphs)

        # Restore inline codes
        for i, code in enumerate(inline_codes):
            text = text.replace(f'[[CODE_{i}]]', f'`{code}`')

        # Restore links (translate link text, keep URL)
        for i, (link_text, url) in enumerate(links):
            try:
                translated_text = self.translator.translate(link_text)
                text = text.replace(f'[[LINK_{i}]]', f'[{translated_text}]({url})')
            except Exception:
                text = text.replace(f'[[LINK_{i}]]', f'[{link_text}]({url})')

        return text


class BrainsaitTemplateGenerator:
    """Generates Brainsait-branded templates."""

    def __init__(self, output_dir: str = "docs/brand/templates/slack"):
        self.output_dir = Path(output_dir)
        self.translator = MarkdownTranslator()
        self.converter = SlackTemplateConverter()

    def generate_template(self, template_name: str, content: str = None) -> Dict[str, str]:
        """Generate EN and AR versions of a template."""
        metadata = TEMPLATE_METADATA.get(template_name, {})

        # Generate English version
        en_content = self._generate_english_template(template_name, content, metadata)

        # Generate Arabic version
        ar_content = self._generate_arabic_template(template_name, content, metadata)

        # Save files
        en_path = self.output_dir / "english" / f"{template_name}.md"
        ar_path = self.output_dir / "arabic" / f"{template_name}.ar.md"

        return {
            "en": en_content,
            "ar": ar_content,
            "en_path": str(en_path),
            "ar_path": str(ar_path),
        }

    def _generate_english_template(self, template_name: str, content: str, metadata: dict) -> str:
        """Generate Brainsait-branded English template."""
        title = metadata.get("title_en", template_name.replace("_", " ").title())
        description = metadata.get("description_en", "Template description")
        category = metadata.get("category", "general")

        template = f'''---
title: "{title}"
description: "{description}"
template_id: "{template_name}"
category: "{category}"
language: "en"
version: "1.0"
last_updated: "{datetime.now().strftime('%Y-%m-%d')}"
tags:
  - template
  - slack
  - {category}
---

# {title}

<div class="template-meta" markdown>
**Category:** {category.replace("_", " ").title()} | **Version:** 1.0 | **Status:** Active
</div>

## Overview

{description}

This template provides a structured approach to {title.lower()} within your organization,
aligned with Brainsait's operational standards and best practices.

---

## Channel Structure

### Primary Channels

| Channel | Purpose | Visibility |
|---------|---------|------------|
| `#main` | Central hub for all communications | Public |
| `#announcements` | Official announcements and updates | Public |
| `#resources` | Shared documents and reference materials | Public |

### Optional Channels

| Channel | Purpose | When to Use |
|---------|---------|-------------|
| `#questions` | Q&A and support requests | For high-volume workflows |
| `#feedback` | Collect feedback and suggestions | For iterative processes |

---

## Workflow Steps

### Phase 1: Setup

1. **Create the channel** using this template
2. **Invite stakeholders** with appropriate permissions
3. **Pin essential resources** to the channel

### Phase 2: Onboarding

1. Welcome new members with the introduction message
2. Share relevant documentation and guidelines
3. Assign initial tasks or action items

### Phase 3: Ongoing Operations

1. Maintain regular updates and check-ins
2. Archive completed items appropriately
3. Iterate on processes based on feedback

---

## Key Messages

### Welcome Message

> Welcome to [{title}]! This channel serves as our central hub for {description.lower()}.
>
> **Quick Links:**
> - [Documentation](#)
> - [Guidelines](#)
> - [Support](#)

### Check-in Template

```
## Daily/Weekly Check-in

**Progress:**
- [ ] Task 1
- [ ] Task 2

**Blockers:**
- None / [Describe blocker]

**Next Steps:**
- [Action item 1]
- [Action item 2]
```

---

## Best Practices

!!! tip "Brainsait Recommendations"
    - **Consistency**: Use standardized naming conventions
    - **Documentation**: Keep channel topics and descriptions updated
    - **Engagement**: Encourage active participation from all members
    - **Organization**: Use threads to keep conversations organized

---

## Integration Points

This template integrates with:

- **Brainsait Agents**: Connect with relevant ClaimLinc, PolicyLinc, or DocsLinc agents
- **Notion**: Sync key documents and databases
- **Google Workspace**: Link shared drives and calendars

---

## Customization

Adapt this template to your specific needs by:

1. Modifying channel names to match your naming conventions
2. Adding custom workflows specific to your department
3. Integrating with your existing tools and systems

---

<div class="template-footer" markdown>
*Brainsait Template v1.0 | Last Updated: {datetime.now().strftime('%Y-%m-%d')}*
</div>
'''

        if content:
            template += f"\n\n---\n\n## Original Slack Content\n\n{self.converter.slack_to_markdown(content)}\n"

        return template

    def _generate_arabic_template(self, template_name: str, content: str, metadata: dict) -> str:
        """Generate Brainsait-branded Arabic template."""
        title = metadata.get("title_ar", template_name.replace("_", " ").title())
        description = metadata.get("description_ar", "وصف القالب")
        category = metadata.get("category", "general")
        category_ar = self._translate_category(category)

        template = f'''---
title: "{title}"
description: "{description}"
template_id: "{template_name}"
category: "{category}"
language: "ar"
version: "1.0"
last_updated: "{datetime.now().strftime('%Y-%m-%d')}"
tags:
  - قالب
  - سلاك
  - {category_ar}
---

<div dir="rtl" markdown>

# {title}

<div class="template-meta" markdown>
**الفئة:** {category_ar} | **الإصدار:** 1.0 | **الحالة:** نشط
</div>

## نظرة عامة

{description}

يوفر هذا القالب نهجًا منظمًا لـ{title} داخل مؤسستك،
بما يتوافق مع معايير Brainsait التشغيلية وأفضل الممارسات.

---

## هيكل القنوات

### القنوات الرئيسية

| القناة | الغرض | الرؤية |
|--------|-------|--------|
| `#الرئيسية` | المركز المركزي لجميع الاتصالات | عامة |
| `#الإعلانات` | الإعلانات والتحديثات الرسمية | عامة |
| `#الموارد` | المستندات والمواد المرجعية المشتركة | عامة |

### القنوات الاختيارية

| القناة | الغرض | متى تستخدم |
|--------|-------|------------|
| `#الأسئلة` | الأسئلة والأجوبة وطلبات الدعم | لسير العمل عالي الحجم |
| `#الملاحظات` | جمع الملاحظات والاقتراحات | للعمليات التكرارية |

---

## خطوات سير العمل

### المرحلة الأولى: الإعداد

1. **إنشاء القناة** باستخدام هذا القالب
2. **دعوة أصحاب المصلحة** مع الصلاحيات المناسبة
3. **تثبيت الموارد الأساسية** في القناة

### المرحلة الثانية: التأهيل

1. الترحيب بالأعضاء الجدد برسالة تعريفية
2. مشاركة الوثائق والإرشادات ذات الصلة
3. تعيين المهام أو بنود العمل الأولية

### المرحلة الثالثة: العمليات المستمرة

1. الحفاظ على التحديثات والمتابعات المنتظمة
2. أرشفة العناصر المكتملة بشكل مناسب
3. تكرار العمليات بناءً على الملاحظات

---

## الرسائل الرئيسية

### رسالة الترحيب

> مرحبًا بكم في [{title}]! تعمل هذه القناة كمركز مركزي لـ{description}.
>
> **روابط سريعة:**
> - [التوثيق](#)
> - [الإرشادات](#)
> - [الدعم](#)

### قالب المتابعة

```
## المتابعة اليومية/الأسبوعية

**التقدم:**
- [ ] المهمة 1
- [ ] المهمة 2

**العوائق:**
- لا يوجد / [وصف العائق]

**الخطوات التالية:**
- [بند العمل 1]
- [بند العمل 2]
```

---

## أفضل الممارسات

!!! tip "توصيات Brainsait"
    - **الاتساق**: استخدم اصطلاحات تسمية موحدة
    - **التوثيق**: حافظ على تحديث موضوعات القنوات ووصفها
    - **المشاركة**: شجع المشاركة الفعالة من جميع الأعضاء
    - **التنظيم**: استخدم المحادثات المترابطة للحفاظ على تنظيم المحادثات

---

## نقاط التكامل

يتكامل هذا القالب مع:

- **وكلاء Brainsait**: الاتصال مع وكلاء ClaimLinc أو PolicyLinc أو DocsLinc ذوي الصلة
- **Notion**: مزامنة المستندات وقواعد البيانات الرئيسية
- **Google Workspace**: ربط المحركات المشتركة والتقويمات

---

## التخصيص

قم بتكييف هذا القالب وفقًا لاحتياجاتك الخاصة من خلال:

1. تعديل أسماء القنوات لتتوافق مع اصطلاحات التسمية الخاصة بك
2. إضافة سير عمل مخصص لقسمك
3. التكامل مع أدواتك وأنظمتك الحالية

---

<div class="template-footer" markdown>
*قالب Brainsait الإصدار 1.0 | آخر تحديث: {datetime.now().strftime('%Y-%m-%d')}*
</div>

</div>
'''

        if content:
            translated_content = self.translator.translate_text(self.converter.slack_to_markdown(content))
            template += f"\n\n---\n\n## محتوى Slack الأصلي\n\n{translated_content}\n"

        return template

    def _translate_category(self, category: str) -> str:
        """Translate category name to Arabic."""
        translations = {
            "hr": "الموارد البشرية",
            "sales": "المبيعات",
            "operations": "العمليات",
            "support": "الدعم",
            "marketing": "التسويق",
            "customer_success": "نجاح العملاء",
            "partnerships": "الشراكات",
            "engagement": "المشاركة",
            "training": "التدريب",
            "general": "عام",
        }
        return translations.get(category, category)

    def save_template(self, template_name: str, en_content: str, ar_content: str):
        """Save template files to disk."""
        # Create directories if they don't exist
        (self.output_dir / "english").mkdir(parents=True, exist_ok=True)
        (self.output_dir / "arabic").mkdir(parents=True, exist_ok=True)

        # Save English version
        en_path = self.output_dir / "english" / f"{template_name}.md"
        with open(en_path, 'w', encoding='utf-8') as f:
            f.write(en_content)
        print(f"Saved: {en_path}")

        # Save Arabic version
        ar_path = self.output_dir / "arabic" / f"{template_name}.ar.md"
        with open(ar_path, 'w', encoding='utf-8') as f:
            f.write(ar_content)
        print(f"Saved: {ar_path}")


def generate_all_templates():
    """Generate all Brainsait-branded templates."""
    generator = BrainsaitTemplateGenerator()

    for template_name in SLACK_CHANNEL_TEMPLATES:
        print(f"\nGenerating: {template_name}")
        result = generator.generate_template(template_name)
        generator.save_template(template_name, result["en"], result["ar"])

    print(f"\nGenerated {len(SLACK_CHANNEL_TEMPLATES)} templates!")


def main():
    parser = argparse.ArgumentParser(description="Slack Template Fetcher for Brainsait")
    parser.add_argument("--generate-all", action="store_true",
                        help="Generate all Brainsait-branded templates")
    parser.add_argument("--list", action="store_true",
                        help="List all available templates")
    parser.add_argument("--template", type=str,
                        help="Generate a specific template")

    args = parser.parse_args()

    if args.list:
        print("\nAvailable Slack Templates:")
        print("-" * 50)
        for name, meta in TEMPLATE_METADATA.items():
            print(f"  {name}")
            print(f"    EN: {meta.get('title_en', 'N/A')}")
            print(f"    AR: {meta.get('title_ar', 'N/A')}")
            print(f"    Category: {meta.get('category', 'N/A')}")
            print()

    elif args.generate_all:
        generate_all_templates()

    elif args.template:
        generator = BrainsaitTemplateGenerator()
        if args.template in TEMPLATE_METADATA:
            result = generator.generate_template(args.template)
            generator.save_template(args.template, result["en"], result["ar"])
        else:
            print(f"Unknown template: {args.template}")
            print("Use --list to see available templates")

    else:
        parser.print_help()


if __name__ == "__main__":
    main()
