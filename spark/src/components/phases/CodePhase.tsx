// Phase 5: Code Generator
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Code, Sparkle, Check, CopySimple, DownloadSimple } from '@phosphor-icons/react'
import { useLanguage } from '@/contexts/LanguageContext'
import { PhaseShell } from '@/components/PhaseShell'
import { AILoadingScreen } from '@/components/AILoadingScreen'
import { llmPrompt } from '@/lib/llm'
import type { GeneratedCode, CodeFile, TemplateType, Brand, PRD } from '@/types'

interface Props {
  initial?: GeneratedCode
  brand?: Brand
  prd?: PRD
  onComplete: (code: GeneratedCode) => void
  onBack: () => void
}

const TEMPLATES: { id: TemplateType; label: string; labelAr: string; desc: string; descAr: string; icon: string }[] = [
  { id: 'landing', label: 'Landing Page', labelAr: 'صفحة هبوط', desc: 'Marketing site with hero, features, pricing', descAr: 'موقع تسويقي مع قسم رئيسي وميزات وأسعار', icon: '🌐' },
  { id: 'webapp', label: 'Web App', labelAr: 'تطبيق ويب', desc: 'Full dashboard with auth and data views', descAr: 'لوحة تحكم كاملة مع مصادقة وعرض بيانات', icon: '⚡' },
  { id: 'dashboard', label: 'Admin Dashboard', labelAr: 'لوحة إدارة', desc: 'Data-rich admin panel with charts and tables', descAr: 'لوحة إدارة غنية بالبيانات مع رسوم بيانية وجداول', icon: '📊' },
]

const FEATURES = [
  { id: 'auth', label: 'Authentication', labelAr: 'المصادقة' },
  { id: 'forms', label: 'Smart Forms', labelAr: 'نماذج ذكية' },
  { id: 'charts', label: 'Data Charts', labelAr: 'مخططات البيانات' },
  { id: 'accessibility', label: 'Accessibility (WCAG)', labelAr: 'إمكانية الوصول' },
  { id: 'animations', label: 'Animations', labelAr: 'الرسوم المتحركة' },
  { id: 'rtl', label: 'Arabic/RTL Support', labelAr: 'دعم العربية/RTL' },
  { id: 'api', label: 'API Integration', labelAr: 'تكامل API' },
  { id: 'responsive', label: 'Mobile Responsive', labelAr: 'تجاوب مع الجوال' },
]

const ENHANCEMENTS = [
  { id: 'error-handling', label: 'Error Handling', labelAr: 'معالجة الأخطاء' },
  { id: 'mobile', label: 'Mobile Optimization', labelAr: 'تحسين الجوال' },
  { id: 'seo', label: 'SEO Optimization', labelAr: 'تحسين محركات البحث' },
  { id: 'performance', label: 'Performance', labelAr: 'الأداء' },
]

export function CodePhase({ initial, brand, prd, onComplete, onBack }: Props) {
  const { t, language, isRTL } = useLanguage()
  const [templateType, setTemplateType] = useState<TemplateType>(initial?.templateType || 'landing')
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>(initial?.features || ['responsive', 'rtl'])
  const [loading, setLoading] = useState(false)
  const [files, setFiles] = useState<CodeFile[]>(initial?.files || [])
  const [activeFile, setActiveFile] = useState<string>('')
  const [generated, setGenerated] = useState(!!initial?.files?.length)
  const [copied, setCopied] = useState(false)

  function toggleFeature(id: string) {
    setSelectedFeatures(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id])
  }

  async function handleGenerate() {
    setLoading(true)
    try {
      const brandName = brand?.name || 'HealthTech'
      const primaryColor = brand?.colors?.[0] || '#0c9eeb'
      const secondaryColor = brand?.colors?.[1] || '#10b981'

      const featureList = selectedFeatures.join(', ')
      const prdSummary = prd?.sections.filter(s => s.content).slice(0, 3).map(s => `${s.title}: ${s.content.slice(0, 200)}`).join('\n') || ''

      const prompt = `You are an expert React/TypeScript developer creating a production-ready ${templateType} for a healthcare startup.

Brand: ${brandName}
Tagline: ${brand?.tagline || 'Healthcare, Connected.'}
Primary Color: ${primaryColor}
Secondary Color: ${secondaryColor}
Personality: ${brand?.personality?.primary || 'innovative'}

Features to include: ${featureList}

PRD Summary:
${prdSummary}

Generate 3 files for a ${templateType}:

FILE: src/App.tsx
[Complete React/TypeScript component using Tailwind CSS, with the brand colors integrated, healthcare-focused UI, bilingual support if RTL feature selected]

FILE: src/index.css
[Tailwind directives and custom CSS with brand colors as CSS variables]

FILE: README.md
[Setup instructions, tech stack, deployment guide for Vercel/Netlify]

Format each file as:
FILE: [filename]
\`\`\`[language]
[code]
\`\`\`

Make the code production-ready with:
- TypeScript interfaces
- Proper accessibility (ARIA labels)
- Saudi-specific healthcare context (NPHIES mentions, Vision 2030)
- Beautiful UI with the brand colors`

      const res = await llmPrompt(prompt, { maxTokens: 4096 })

      // Parse files from response
      const fileMatches = res.matchAll(/FILE:\s*([^\n]+)\n```[\w]*\n([\s\S]*?)```/g)
      const parsedFiles: CodeFile[] = []
      for (const match of fileMatches) {
        const name = match[1].trim()
        const content = match[2].trim()
        const ext = name.split('.').pop() || 'txt'
        const langMap: Record<string, string> = { tsx: 'tsx', ts: 'typescript', css: 'css', md: 'markdown', json: 'json' }
        parsedFiles.push({ name, content, language: langMap[ext] || 'text' })
      }

      if (parsedFiles.length === 0) {
        // Fallback: create basic files
        parsedFiles.push({
          name: 'src/App.tsx',
          language: 'tsx',
          content: `import React from 'react';

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="py-6 px-4" style={{ background: '${primaryColor}' }}>
        <h1 className="text-2xl font-bold text-white">${brandName}</h1>
        <p className="text-white/80">${brand?.tagline || 'Healthcare, Connected.'}</p>
      </header>
      <main className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Welcome to ${brandName}</h2>
        <p className="text-gray-600">Your healthcare platform is ready to launch.</p>
      </main>
    </div>
  );
}`
        })
        parsedFiles.push({ name: 'README.md', language: 'markdown', content: `# ${brandName}\n\n${brand?.tagline || ''}\n\n## Setup\n\`\`\`bash\nnpm install\nnpm run dev\n\`\`\`` })
      }

      setFiles(parsedFiles)
      setActiveFile(parsedFiles[0]?.name || '')
      setGenerated(true)
    } finally {
      setLoading(false)
    }
  }

  async function copyToClipboard() {
    const activeContent = files.find(f => f.name === activeFile)?.content || ''
    await navigator.clipboard.writeText(activeContent)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function downloadAll() {
    files.forEach(file => {
      const blob = new Blob([file.content], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = file.name.replaceAll('/', '-')
      a.click()
      URL.revokeObjectURL(url)
    })
  }

  function handleComplete() {
    onComplete({
      templateType,
      files,
      features: selectedFeatures,
      architecture: `React + TypeScript + Tailwind CSS (${templateType})`,
      generatedAt: new Date().toISOString(),
    })
  }

  const activeFileContent = files.find(f => f.name === activeFile)?.content || ''

  return (
    <PhaseShell phaseId="code" subtitle={t.codeSubtitle} onBack={onBack} maxWidth="xl">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <AILoadingScreen message={language === 'ar' ? 'جاري إنشاء الكود البرمجي...' : 'Generating your production code...'} />
            </motion.div>
          ) : !generated ? (
            <motion.div key="config" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
              {/* Template selection */}
              <div className="glass-card rounded-2xl p-5">
                <h3 className="font-semibold text-sm text-slate-400 uppercase tracking-wide mb-3">{t.selectTemplate}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {TEMPLATES.map(tmpl => (
                    <button
                      key={tmpl.id}
                      onClick={() => setTemplateType(tmpl.id)}
                      className={`p-4 rounded-xl text-left transition-all duration-200 ${
                        templateType === tmpl.id
                          ? 'bg-spark-500/20 border border-spark-500/50'
                          : 'glass-card glass-card-hover'
                      }`}
                      dir={isRTL ? 'rtl' : 'ltr'}
                    >
                      <span className="text-2xl mb-2 block">{tmpl.icon}</span>
                      <p className="font-semibold text-sm text-white mb-1">{isRTL ? tmpl.labelAr : tmpl.label}</p>
                      <p className="text-xs text-slate-500">{isRTL ? tmpl.descAr : tmpl.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Features */}
              <div className="glass-card rounded-2xl p-5">
                <h3 className="font-semibold text-sm text-slate-400 uppercase tracking-wide mb-3">{t.selectFeatures}</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {FEATURES.map(feat => (
                    <button
                      key={feat.id}
                      onClick={() => toggleFeature(feat.id)}
                      className={`p-2.5 rounded-xl text-xs text-left transition-all duration-200 ${
                        selectedFeatures.includes(feat.id)
                          ? 'bg-spark-500/20 border border-spark-500/50 text-white'
                          : 'glass-card glass-card-hover text-slate-400'
                      }`}
                      dir={isRTL ? 'rtl' : 'ltr'}
                    >
                      {selectedFeatures.includes(feat.id) && <span className="mr-1">✓</span>}
                      {isRTL ? feat.labelAr : feat.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleGenerate}
                className="spark-btn w-full py-3 rounded-2xl font-semibold flex items-center justify-center gap-2"
              >
                <Code size={18} />
                {t.generateCode}
              </button>
            </motion.div>
          ) : (
            <motion.div key="preview" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              {/* File browser */}
              <div className="glass-card rounded-2xl overflow-hidden">
                {/* File tabs */}
                <div className="flex items-center gap-1 px-3 py-2 border-b border-white/5 overflow-x-auto">
                  {files.map(file => (
                    <button
                      key={file.name}
                      onClick={() => setActiveFile(file.name)}
                      className={`px-3 py-1 rounded text-xs whitespace-nowrap transition-all ${
                        activeFile === file.name
                          ? 'bg-spark-500/30 text-spark-300'
                          : 'text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      {file.name.split('/').pop()}
                    </button>
                  ))}
                </div>
                {/* Code view */}
                <div className="relative">
                  <div className="absolute top-2 right-2 flex gap-1 z-10">
                    <button onClick={copyToClipboard} className="glass-card px-2 py-1 rounded text-xs text-slate-400 hover:text-white flex items-center gap-1">
                      <CopySimple size={12} />
                      {copied ? '✓' : t.copy}
                    </button>
                  </div>
                  <pre className="code-block p-4 text-xs text-slate-300 overflow-auto max-h-96 leading-relaxed">
                    <code>{activeFileContent}</code>
                  </pre>
                </div>
              </div>

              {/* Enhancement options */}
              <div className="glass-card rounded-2xl p-4">
                <h3 className="font-semibold text-xs text-slate-500 uppercase tracking-wide mb-3">
                  {language === 'ar' ? 'خيارات التحسين' : 'Enhancement Options'}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {ENHANCEMENTS.map(enh => (
                    <button
                      key={enh.id}
                      onClick={() => toggleFeature(enh.id)}
                      className={`px-3 py-1.5 rounded-full text-xs transition-all ${
                        selectedFeatures.includes(enh.id)
                          ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300'
                          : 'glass-card glass-card-hover text-slate-400'
                      }`}
                    >
                      {isRTL ? enh.labelAr : enh.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={handleGenerate} className="glass-card glass-card-hover px-4 py-3 rounded-xl text-slate-300 flex items-center gap-2">
                  <Sparkle size={16} />
                  {t.regenerate}
                </button>
                <button onClick={downloadAll} className="glass-card glass-card-hover px-4 py-3 rounded-xl text-slate-300 flex items-center gap-2">
                  <DownloadSimple size={16} />
                  {t.download}
                </button>
                <button onClick={handleComplete} className="spark-btn flex-1 py-3 rounded-xl font-semibold flex items-center justify-center gap-2">
                  <Check size={18} />
                  {t.continue}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
    </PhaseShell>
  )
}
