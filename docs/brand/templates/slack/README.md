# Slack Template Translator Workflow

This directory contains Brainsait-branded Slack channel templates in both English and Arabic, designed for easy import into Notion.

## Directory Structure

```
slack/
├── english/               # English templates
│   ├── onboarding_template.md
│   ├── project_template.md
│   └── ... (17 templates)
├── arabic/                # Arabic translations
│   ├── onboarding_template.ar.md
│   ├── project_template.ar.md
│   └── ... (17 templates)
├── index.md              # English index page
├── index.ar.md           # Arabic index page
└── README.md             # This file
```

## Fetching Custom Slack Content

To fetch content from your specific Slack URLs (like the `/docs/` URLs you provided), follow these steps:

### Prerequisites

1. Install dependencies:
   ```bash
   pip install slack_sdk deep-translator python-dotenv
   ```

2. Create a Slack App:
   - Go to https://api.slack.com/apps
   - Create New App → From scratch
   - Name: "Brainsait Template Fetcher"
   - Workspace: brainsait

3. Add OAuth Scopes (Bot Token Scopes):
   - `channels:read`
   - `channels:history`
   - `groups:read`
   - `groups:history`
   - `files:read`
   - `users:read`

4. Install App to Workspace and copy the Bot User OAuth Token

5. Set environment variable:
   ```bash
   export SLACK_BOT_TOKEN="xoxb-your-token-here"
   ```

### Fetching Document URLs

For URLs like `https://brainsait.slack.com/docs/T05NCLU87L2/F0844KK58B1`:

```python
from slack_sdk import WebClient

client = WebClient(token=os.environ["SLACK_BOT_TOKEN"])

# The F... ID is the file ID
file_id = "F0844KK58B1"

# Get file info
response = client.files_info(file=file_id)
file_info = response["file"]

# Extract content
title = file_info.get("title", "Untitled")
content = file_info.get("preview", "")  # For posts
# or
content = file_info.get("content", "")  # For text files
```

### Using the Generator Script

Run the template generator:

```bash
# List all available templates
python scripts/slack_template_fetcher.py --list

# Generate all templates
python scripts/slack_template_fetcher.py --generate-all

# Generate a specific template
python scripts/slack_template_fetcher.py --template onboarding_template
```

## Template Structure

Each template includes:

### Frontmatter (YAML)
```yaml
---
title: "Template Title"
description: "Brief description"
template_id: "template_name"
category: "hr|sales|operations|..."
language: "en|ar"
version: "1.0"
last_updated: "2025-12-31"
tags:
  - template
  - slack
---
```

### Sections
1. **Overview** - Purpose and description
2. **Channel Structure** - Recommended channels table
3. **Workflow Steps** - Phase-by-phase implementation
4. **Key Messages** - Welcome message and check-in templates
5. **Best Practices** - Brainsait recommendations
6. **Integration Points** - Connections to other tools
7. **Customization** - Adaptation guidelines

## Importing to Notion

### Method 1: Direct Import
1. Open template markdown file
2. Copy content (Cmd/Ctrl + A, Cmd/Ctrl + C)
3. In Notion, paste (Cmd/Ctrl + V)
4. Notion auto-converts markdown

### Method 2: File Import
1. In Notion, click "..." menu → Import
2. Select "Markdown & CSV"
3. Upload the `.md` file
4. Adjust as needed

### Method 3: Database Import
Create a Notion database with properties matching the frontmatter:
- Title (text)
- Description (text)
- Category (select)
- Language (select)
- Version (text)
- Tags (multi-select)

## Customizing Templates

### Adding Your Slack Content

1. Fetch content from Slack using the API
2. Convert Slack formatting to Markdown:
   - `*bold*` → `**bold**`
   - `_italic_` → `*italic*`
   - `<url|text>` → `[text](url)`

3. Add to template under "Original Slack Content" section:
   ```markdown
   ## Original Slack Content

   [Your fetched content here]
   ```

### Translation

The script includes automatic translation to Arabic. For manual translation:

1. Use Google Translate or DeepL for initial translation
2. Review and refine technical terms
3. Ensure RTL formatting is preserved
4. Wrap Arabic content in `<div dir="rtl">` tags

## Your Specific URLs

Here are the URLs you provided and how to access them:

### Document URLs (Slack Files)
| URL | File ID | Status |
|-----|---------|--------|
| `/docs/T05NCLU87L2/F0844KK58B1` | F0844KK58B1 | Requires API access |
| `/docs/T05NCLU87L2/F084XRVN71P` | F084XRVN71P | Requires API access |
| `/docs/T05NCLU87L2/F084CGV8LMU` | F084CGV8LMU | Requires API access |
| `/docs/T05NCLU87L2/F09C8Q16QHK` | F09C8Q16QHK | Requires API access |
| `/docs/T05NCLU87L2/F0639QWR1KM` | F0639QWR1KM | Requires API access |

### Channel Templates (Pre-built)
All 17 channel templates have been generated with Brainsait branding:
- ✅ onboarding_template
- ✅ slack_crm_template
- ✅ project_template
- ✅ help_template
- ✅ social_template
- ✅ one_on_one_coaching_template
- ✅ customer_onboarding_template
- ✅ external_partners_template
- ✅ deal_tracking_template
- ✅ event_preparation_template
- ✅ ama_template
- ✅ marketing_campaign_template
- ✅ enablement_hub_template
- ✅ feedback_template
- ✅ brand_guidelines_template
- ✅ benefits_hub_template
- ✅ time_off_request_template

## Next Steps

1. **Set up Slack API access** to fetch your custom document content
2. **Review generated templates** and customize as needed
3. **Import to Notion** and set up your workspace
4. **Connect with Brainsait agents** for automation

---

*Generated by Brainsait Template Workflow | 2025-12-31*
