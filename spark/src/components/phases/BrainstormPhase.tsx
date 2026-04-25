// Phase 1: Brainstorm Canvas
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Lightbulb, Sparkle, Check } from '@phosphor-icons/react'
import { useLanguage } from '@/contexts/LanguageContext'
import { PhaseShell } from '@/components/PhaseShell'
import { AILoadingScreen } from '@/components/AILoadingScreen'
import { llmPrompt } from '@/lib/llm'
import type { ConceptCard } from '@/types'

interface Props {
  initial?: ConceptCard
  onComplete: (concept: ConceptCard) => void
  onBack: () => void
}

const EXAMPLE_IDEAS = [
  'Patient appointment scheduling is broken in Saudi clinics',
  'Chronic disease management needs better remote monitoring',
  'Health insurance claims take weeks to process in KSA',
  'Mental health support is stigmatized and hard to access in MENA',
]

const EXAMPLE_IDEAS_AR = [
  'جدولة مواعيد المرضى معطوبة في العيادات السعودية',
  'إدارة الأمراض المزمنة تحتاج إلى رصد عن بُعد أفضل',
  'مطالبات التأمين الصحي تستغرق أسابيع للمعالجة في المملكة',
  'الدعم النفسي يعاني من وصمة اجتماعية وصعوبة في الوصول',
]

export function BrainstormPhase({ initial, onComplete, onBack }: Props) {
  const { t, language, isRTL } = useLanguage()
  const [input, setInput] = useState(initial?.problem || '')
  const [loading, setLoading] = useState(false)
  const [concepts, setConcepts] = useState<string[]>(initial?.aiConcepts || [])
  const [selectedConcepts, setSelectedConcepts] = useState<string[]>([])
  const [card, setCard] = useState<Partial<ConceptCard>>(initial || {})
  const [step, setStep] = useState<'input' | 'concepts' | 'card'>(
    initial?.aiConcepts?.length ? 'card' : 'input'
  )

  const examples = language === 'ar' ? EXAMPLE_IDEAS_AR : EXAMPLE_IDEAS

  async function handleGenerate() {
    if (!input.trim()) return
    setLoading(true)
    try {
      const prompt = `You are a healthcare startup advisor for the MENA/Saudi Arabia market.
The founder says: "${input}"

Generate a JSON response with:
{
  "concepts": ["8 related healthcare concepts/terms as bubble suggestions"],
  "problem": "clear one-sentence problem statement",
  "targetUsers": "specific target user description",
  "solution": "concise solution approach"
}

Focus on Vision 2030 alignment, NPHIES/FHIR compliance opportunities, and MENA market context.
Respond with valid JSON only.`

      const res = await llmPrompt(prompt)
      let parsed: { concepts: string[]; problem: string; targetUsers: string; solution: string }
      try {
        const json = res.match(/\{[\s\S]*\}/)?.[0] || res
        parsed = JSON.parse(json)
      } catch {
        parsed = {
          concepts: ['Telemedicine', 'AI Diagnostics', 'Patient Portal', 'EHR', 'Claims Processing', 'Remote Monitoring', 'Digital Pharmacy', 'Lab Integration'],
          problem: input,
          targetUsers: 'Healthcare providers and patients in Saudi Arabia',
          solution: 'Digital platform connecting patients and providers'
        }
      }
      setConcepts(parsed.concepts || [])
      setCard({ problem: parsed.problem, targetUsers: parsed.targetUsers, solution: parsed.solution, keywords: [input] })
      setStep('concepts')
    } finally {
      setLoading(false)
    }
  }

  function toggleConcept(c: string) {
    setSelectedConcepts(prev =>
      prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]
    )
  }

  function handleSave() {
    const finalCard: ConceptCard = {
      problem: card.problem || input,
      targetUsers: card.targetUsers || '',
      solution: card.solution || '',
      keywords: [input, ...selectedConcepts],
      aiConcepts: concepts,
    }
    onComplete(finalCard)
  }

  return (
    <PhaseShell phaseId="brainstorm" subtitle={t.brainstormSubtitle} onBack={onBack}>
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <AILoadingScreen message={t.generatingConcepts} />
          </motion.div>
        ) : step === 'input' ? (
          <motion.div key="input" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <div className="glass-card rounded-2xl p-6 mb-4">
              <label className="block text-sm font-medium text-slate-300 mb-3">
                {t.enterHealthcareIdea}
              </label>
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder={t.ideaPlaceholder}
                rows={4}
                dir={isRTL ? 'rtl' : 'ltr'}
                className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 resize-none focus:outline-none focus:border-spark-500/50 transition-colors"
              />
            </div>

            {/* Example ideas */}
            <div className="mb-6">
              <p className="text-xs text-slate-500 uppercase tracking-wide mb-3">
                {language === 'ar' ? 'أمثلة للإلهام' : 'Examples for inspiration'}
              </p>
              <div className="flex flex-wrap gap-2">
                {examples.map(ex => (
                  <button
                    key={ex}
                    onClick={() => setInput(ex)}
                    className="text-xs glass-card glass-card-hover px-3 py-1.5 rounded-full text-slate-400 hover:text-white transition-colors"
                    dir={isRTL ? 'rtl' : 'ltr'}
                  >
                    {ex.slice(0, 40)}...
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={!input.trim()}
              className="spark-btn w-full py-3 rounded-2xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Sparkle size={18} />
              {t.generate}
            </button>
          </motion.div>
        ) : step === 'concepts' ? (
          <motion.div key="concepts" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
            <div className="glass-card rounded-2xl p-6">
              <h3 className="font-display font-semibold text-white mb-4 flex items-center gap-2">
                <Lightbulb size={20} className="text-spark-400" />
                {t.relatedConcepts}
              </h3>
              <div className="flex flex-wrap gap-2">
                {concepts.map(c => (
                  <motion.button
                    key={c}
                    onClick={() => toggleConcept(c)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                      selectedConcepts.includes(c)
                        ? 'bg-spark-500 text-white border border-spark-400'
                        : 'glass-card glass-card-hover text-slate-300 hover:text-white'
                    }`}
                    whileTap={{ scale: 0.95 }}
                  >
                    {selectedConcepts.includes(c) && <span className="mr-1">✓</span>}
                    {c}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Draft concept card */}
            <div className="glass-card rounded-2xl p-6 border border-spark-500/20 space-y-4">
              <h3 className="font-display font-semibold text-white">{t.conceptCard}</h3>
              {(['problem', 'targetUsers', 'solution'] as const).map(field => (
                <div key={field}>
                  <label className="block text-xs text-slate-400 uppercase tracking-wide mb-1">
                    {t[field]}
                  </label>
                  <textarea
                    value={card[field] || ''}
                    onChange={e => setCard(prev => ({ ...prev, [field]: e.target.value }))}
                    rows={2}
                    dir={isRTL ? 'rtl' : 'ltr'}
                    className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-600 resize-none focus:outline-none focus:border-spark-500/50 transition-colors"
                  />
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep('input')} className="glass-card glass-card-hover px-4 py-3 rounded-xl text-slate-300 flex-1">
                {t.back}
              </button>
              <button
                onClick={handleSave}
                className="spark-btn flex-[2] py-3 rounded-xl font-semibold flex items-center justify-center gap-2"
              >
                <Check size={18} />
                {t.saveConcept}
              </button>
            </div>
          </motion.div>
        ) : (
          // Recap view when already completed
          <motion.div key="card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="glass-card rounded-2xl p-6 border border-emerald-500/20 space-y-4">
              <div className="flex items-center gap-2 text-emerald-400">
                <Check size={20} weight="bold" />
                <span className="font-semibold">{t.completed}</span>
              </div>
              {(['problem', 'targetUsers', 'solution'] as const).map(field => (
                <div key={field}>
                  <label className="block text-xs text-slate-400 uppercase tracking-wide mb-1">{t[field]}</label>
                  <p className="text-sm text-slate-200" dir={isRTL ? 'rtl' : 'ltr'}>{initial?.[field]}</p>
                </div>
              ))}
            </div>
            <button onClick={handleSave} className="spark-btn w-full py-3 rounded-2xl font-semibold">
              {t.continue}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </PhaseShell>
  )
}
