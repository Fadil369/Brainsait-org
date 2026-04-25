// Phase 4: PRD Workshop
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, FileText, Sparkle, Check, DownloadSimple } from '@phosphor-icons/react'
import { useLanguage } from '@/contexts/LanguageContext'
import { AILoadingScreen } from '@/components/AILoadingScreen'
import { llmPrompt } from '@/lib/llm'
import type { PRD, PRDSection, Brand, ConceptCard } from '@/types'

interface Props {
  initial?: PRD
  brand?: Brand
  concept?: ConceptCard
  onComplete: (prd: PRD) => void
  onBack: () => void
}

const SECTIONS: { id: string; title: string; titleAr: string; prompt: string }[] = [
  { id: 'executive-summary', title: 'Executive Summary', titleAr: 'الملخص التنفيذي', prompt: 'executive summary for investors' },
  { id: 'problem', title: 'Problem Statement', titleAr: 'بيان المشكلة', prompt: 'detailed problem statement with market evidence' },
  { id: 'target-users', title: 'Target Users & Personas', titleAr: 'المستخدمون المستهدفون', prompt: 'user personas and target market segments' },
  { id: 'solution', title: 'Solution & Value Proposition', titleAr: 'الحل وعرض القيمة', prompt: 'solution description and unique value proposition' },
  { id: 'features', title: 'Core Features & Roadmap', titleAr: 'الميزات الأساسية وخارطة الطريق', prompt: 'MVP features and 12-month roadmap' },
  { id: 'technical', title: 'Technical Architecture', titleAr: 'الهندسة التقنية', prompt: 'technical stack, architecture, and infrastructure' },
  { id: 'regulatory', title: 'Regulatory & Compliance', titleAr: 'الامتثال التنظيمي', prompt: 'NPHIES, PDPL, HIPAA, FHIR R4, Saudi MOH compliance requirements' },
  { id: 'business-model', title: 'Business Model', titleAr: 'نموذج العمل', prompt: 'revenue model, pricing strategy, and unit economics' },
  { id: 'go-to-market', title: 'Go-to-Market Strategy', titleAr: 'استراتيجية الدخول للسوق', prompt: 'GTM strategy for Saudi Arabia and MENA market' },
  { id: 'metrics', title: 'Success Metrics & KPIs', titleAr: 'مقاييس النجاح ومؤشرات الأداء', prompt: 'key performance indicators and success metrics' },
]

const REGULATORY_ITEMS = [
  { id: 'nphies', label: 'NPHIES Integration', labelAr: 'تكامل نفيس' },
  { id: 'pdpl', label: 'PDPL Compliance (Saudi Data Privacy)', labelAr: 'امتثال نظام حماية البيانات الشخصية' },
  { id: 'fhir', label: 'FHIR R4 Interoperability', labelAr: 'قابلية التشغيل البيني FHIR R4' },
  { id: 'moh', label: 'Saudi MOH Approval Path', labelAr: 'مسار موافقة وزارة الصحة السعودية' },
  { id: 'hipaa', label: 'HIPAA Alignment', labelAr: 'توافق HIPAA' },
  { id: 'iso27001', label: 'ISO 27001 Security', labelAr: 'أمن ISO 27001' },
]

export function PRDPhase({ initial, brand, concept, onComplete, onBack }: Props) {
  const { t, language, isRTL } = useLanguage()
  const [activeSection, setActiveSection] = useState(initial?.sections[0]?.id || SECTIONS[0].id)
  const [loadingSection, setLoadingSection] = useState<string | null>(null)
  const [sections, setSections] = useState<PRDSection[]>(
    initial?.sections || SECTIONS.map(s => ({ ...s, content: '', completed: false }))
  )
  const [regulatory, setRegulatory] = useState<Record<string, boolean>>(initial?.regulatoryChecklist || {})

  const completedCount = sections.filter(s => s.completed && s.content).length
  const completeness = Math.round((completedCount / SECTIONS.length) * 100)
  const currentSection = sections.find(s => s.id === activeSection)

  async function handleGenerateSection(sectionId: string) {
    const sectionDef = SECTIONS.find(s => s.id === sectionId)
    if (!sectionDef) return
    setLoadingSection(sectionId)
    try {
      const prompt = `You are writing a PRD section for a healthcare startup targeting Saudi Arabia / MENA.

Startup context:
- Problem: ${concept?.problem || 'Healthcare access challenges'}
- Solution: ${concept?.solution || 'Digital health platform'}
- Brand: ${brand?.name || 'HealthLink'} — ${brand?.tagline || ''}
- Brand personality: ${brand?.personality?.primary || 'innovative'}

Write the "${sectionDef.title}" section with:
${sectionDef.prompt}

Requirements:
- 250-400 words
- Reference Vision 2030 where appropriate
- Be specific to the Saudi/MENA healthcare context
- Use a ${brand?.personality?.primary || 'professional'} tone matching the brand personality
- Include specific metrics, percentages, or market data where relevant

Write only the section content, no headers needed.`

      const content = await llmPrompt(prompt)
      setSections(prev => prev.map(s =>
        s.id === sectionId ? { ...s, content, completed: true } : s
      ))
    } finally {
      setLoadingSection(null)
    }
  }

  function updateSectionContent(sectionId: string, content: string) {
    setSections(prev => prev.map(s =>
      s.id === sectionId ? { ...s, content, completed: content.length > 50 } : s
    ))
  }

  function handleExportPDF() {
    const brandColors = brand?.colors || ['#0c9eeb', '#10b981']
    const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>${brand?.name || 'Healthcare Startup'} — Product Requirements Document</title>
<style>
  body { font-family: 'Segoe UI', sans-serif; max-width: 800px; margin: 0 auto; padding: 40px; color: #1e293b; }
  .header { padding: 32px; border-radius: 12px; background: linear-gradient(135deg, ${brandColors[0]}, ${brandColors[1] || brandColors[0]}); color: white; margin-bottom: 32px; }
  .header h1 { margin: 0 0 8px; font-size: 28px; }
  .header p { margin: 0; opacity: 0.85; }
  .section { margin-bottom: 28px; padding: 24px; border-radius: 8px; border: 1px solid #e2e8f0; }
  .section h2 { color: ${brandColors[0]}; margin: 0 0 12px; font-size: 18px; }
  .section p { line-height: 1.7; color: #374151; white-space: pre-wrap; }
  .regulatory { background: #f8fafc; padding: 20px; border-radius: 8px; }
  .regulatory h2 { color: #1e293b; margin: 0 0 12px; }
  .item { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
  .check { color: #10b981; font-weight: bold; }
  .cross { color: #94a3b8; }
  .footer { text-align: center; color: #94a3b8; font-size: 12px; margin-top: 40px; }
</style>
</head>
<body>
  <div class="header">
    <h1>${brand?.logoIcon || '⚡'} ${brand?.name || 'Healthcare Startup'}</h1>
    <p>${brand?.tagline || 'Product Requirements Document'}</p>
    <p style="margin-top:8px;font-size:13px">Generated by Spark الشرارة • ${new Date().toLocaleDateString()}</p>
  </div>
  ${sections.filter(s => s.content).map(s => `
  <div class="section">
    <h2>${s.title}</h2>
    <p>${s.content}</p>
  </div>`).join('')}
  <div class="regulatory">
    <h2>Regulatory Checklist</h2>
    ${REGULATORY_ITEMS.map(item => `
    <div class="item">
      <span class="${regulatory[item.id] ? 'check' : 'cross'}">${regulatory[item.id] ? '✓' : '○'}</span>
      <span>${item.label}</span>
    </div>`).join('')}
  </div>
  <div class="footer">Generated with Spark الشرارة • Healthcare Startup Builder</div>
</body>
</html>`
    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${brand?.name || 'startup'}-prd.html`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function handleGenerateAll() {
    for (const section of SECTIONS) {
      const current = sections.find(s => s.id === section.id)
      if (!current?.completed) {
        await handleGenerateSection(section.id)
      }
    }
  }

  function handleComplete() {
    onComplete({
      sections,
      completenessScore: completeness,
      regulatoryChecklist: regulatory,
    })
  }

  return (
    <div className="min-h-screen" style={{ background: '#050810' }}>
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className={`flex items-center justify-between mb-8 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <button onClick={onBack} className="glass-card glass-card-hover p-2 rounded-xl text-slate-400 hover:text-white transition-colors">
              <ArrowLeft size={20} className={isRTL ? 'rotate-180' : ''} />
            </button>
            <div>
              <h1 className="font-display font-bold text-2xl text-white flex items-center gap-2">
                <span>📋</span> {t.prdTitle}
              </h1>
              <p className="text-slate-400 text-sm mt-0.5">{t.prdSubtitle}</p>
            </div>
          </div>
          {/* Completeness badge */}
          <div className="glass-card rounded-2xl px-4 py-2 text-center">
            <div className={`text-2xl font-display font-bold ${completeness >= 80 ? 'text-emerald-400' : 'text-spark-400'}`}>
              {completeness}%
            </div>
            <div className="text-xs text-slate-500">{t.completeness}</div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-5">
          {/* Section sidebar */}
          <div className="lg:w-56 flex-shrink-0">
            <div className="glass-card rounded-2xl p-3 space-y-1 lg:sticky lg:top-20">
              {sections.map(section => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs transition-all duration-200 ${
                    activeSection === section.id
                      ? 'bg-spark-500/20 text-spark-300 border border-spark-500/30'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                  dir={isRTL ? 'rtl' : 'ltr'}
                >
                  <div className="flex items-center gap-2">
                    {section.completed && section.content
                      ? <span className="text-emerald-400 flex-shrink-0">✓</span>
                      : <span className="w-3 flex-shrink-0" />
                    }
                    <span>{isRTL ? section.titleAr : section.title}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Section editor */}
          <div className="flex-1">
            <AnimatePresence mode="wait">
              {loadingSection === activeSection ? (
                <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <AILoadingScreen message={language === 'ar' ? 'جاري كتابة القسم...' : 'Writing this section...'} />
                </motion.div>
              ) : currentSection ? (
                <motion.div key={activeSection} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-4">
                  <div className="glass-card rounded-2xl p-5">
                    <div className={`flex items-center justify-between mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <h2 className="font-display font-semibold text-white">
                        {isRTL ? currentSection.titleAr : currentSection.title}
                      </h2>
                      <button
                        onClick={() => handleGenerateSection(activeSection)}
                        className="glass-card glass-card-hover px-3 py-1.5 rounded-lg text-xs text-spark-400 flex items-center gap-1.5"
                      >
                        <Sparkle size={14} />
                        {t.generate}
                      </button>
                    </div>
                    <textarea
                      value={currentSection.content}
                      onChange={e => updateSectionContent(activeSection, e.target.value)}
                      placeholder={language === 'ar' ? 'اكتب هنا أو استخدم الذكاء الاصطناعي للتوليد...' : 'Write here or use AI to generate...'}
                      rows={14}
                      dir={isRTL ? 'rtl' : 'ltr'}
                      className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 resize-none focus:outline-none focus:border-spark-500/50 transition-colors leading-relaxed"
                    />
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>

            {/* Regulatory checklist */}
            <div className="glass-card rounded-2xl p-5 mt-4">
              <h3 className="font-semibold text-sm text-slate-400 uppercase tracking-wide mb-3">{t.regulatoryChecklist}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {REGULATORY_ITEMS.map(item => (
                  <label key={item.id} className="flex items-center gap-2 cursor-pointer group" dir={isRTL ? 'rtl' : 'ltr'}>
                    <input
                      type="checkbox"
                      checked={!!regulatory[item.id]}
                      onChange={e => setRegulatory(prev => ({ ...prev, [item.id]: e.target.checked }))}
                      className="accent-spark-500 w-4 h-4"
                    />
                    <span className="text-sm text-slate-400 group-hover:text-slate-200 transition-colors">
                      {isRTL ? item.labelAr : item.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-4 flex-wrap">
              <button
                onClick={handleGenerateAll}
                disabled={!!loadingSection}
                className="glass-card glass-card-hover px-4 py-3 rounded-xl text-slate-300 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Sparkle size={16} />
                {language === 'ar' ? 'توليد الكل' : 'Generate All'}
              </button>
              <button onClick={handleExportPDF} className="glass-card glass-card-hover px-4 py-3 rounded-xl text-slate-300 flex items-center gap-2">
                <DownloadSimple size={16} />
                {language === 'ar' ? 'تصدير HTML' : 'Export HTML'}
              </button>
              <button
                onClick={handleComplete}
                className="spark-btn flex-1 py-3 rounded-xl font-semibold flex items-center justify-center gap-2"
              >
                <Check size={18} />
                {completeness >= 70 ? t.investorReady : t.continue}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
