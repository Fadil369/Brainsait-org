// Phase 2: Story Builder
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BookOpen, Sparkle, Check } from '@phosphor-icons/react'
import { useLanguage } from '@/contexts/LanguageContext'
import { PhaseShell } from '@/components/PhaseShell'
import { AILoadingScreen } from '@/components/AILoadingScreen'
import { extractJSON, llmPrompt } from '@/lib/llm'
import type { Story, ConceptCard, UserStory } from '@/types'

interface Props {
  initial?: Story
  concept?: ConceptCard
  onComplete: (story: Story) => void
  onBack: () => void
}

const TEMPLATES = {
  en: [
    { id: 'problem-hero', label: 'Problem Hero', desc: 'Lead with the problem, emerge as the solution' },
    { id: 'patient-journey', label: 'Patient Journey', desc: 'Tell the story through a patient\'s eyes' },
    { id: 'vision-first', label: 'Vision First', desc: 'Start with the future you\'re building toward' },
  ],
  ar: [
    { id: 'problem-hero', label: 'بطل المشكلة', desc: 'ابدأ بالمشكلة واظهر كحل' },
    { id: 'patient-journey', label: 'رحلة المريض', desc: 'احكِ القصة من منظور المريض' },
    { id: 'vision-first', label: 'الرؤية أولاً', desc: 'ابدأ بالمستقبل الذي تبنيه' },
  ],
}

export function StoryPhase({ initial, concept, onComplete, onBack }: Props) {
  const { t, language, isRTL } = useLanguage()
  const [template, setTemplate] = useState(initial?.template || '')
  const [tone, setTone] = useState(initial?.tone ?? 30)
  const [loading, setLoading] = useState(false)
  const [story, setStory] = useState(initial?.narrative || '')
  const [scores, setScores] = useState({ clarity: initial?.clarityScore ?? 0, emotion: initial?.emotionScore ?? 0 })
  const [pitchSummary, setPitchSummary] = useState(initial?.pitchSummary || '')
  const [marketAnalysis, setMarketAnalysis] = useState<string[]>(initial?.marketAnalysis || [])
  const [risks, setRisks] = useState<string[]>(initial?.risks || [])
  const [userStories, setUserStories] = useState<UserStory[]>(initial?.userStories || [])
  const [generated, setGenerated] = useState(!!initial?.narrative)

  const templates = language === 'ar' ? TEMPLATES.ar : TEMPLATES.en

  async function handleGenerate() {
    if (!template) return
    setLoading(true)
    try {
      const toneLabel = tone < 33 ? 'formal and professional' : tone < 66 ? 'balanced and approachable' : 'casual and conversational'
      const prompt = `You are a healthcare startup strategist and product discovery lead for Saudi Arabia / MENA.

Concept:
- Problem: ${concept?.problem || 'Healthcare access challenges'}
- Target Users: ${concept?.targetUsers || 'Healthcare stakeholders in Saudi Arabia'}
- Solution: ${concept?.solution || 'Digital health platform'}

Template: ${template}
Tone: ${toneLabel}

Create a structured JSON response for founder storytelling and product discovery.

Return only valid JSON with this exact shape:
{
  "narrative": "3-4 paragraph founder story",
  "clarityScore": 0-100,
  "emotionScore": 0-100,
  "pitchSummary": "one sentence pitch",
  "marketAnalysis": ["3-5 concrete Saudi/MENA market insights"],
  "risks": ["3-5 execution, regulatory, adoption, or data risks"],
  "userStories": [
    {
      "role": "patient/provider/admin/payer/etc",
      "need": "what they need to do",
      "benefit": "why it matters",
      "acceptanceCriteria": ["3-5 testable criteria"]
    }
  ]
}

The narrative must:
1. Opens with a relatable moment or statistic
2. Shows deep understanding of the problem
3. Introduces the solution naturally
4. Ends with a vision aligned with Saudi Vision 2030

User stories must be practical enough to feed PRD creation.`

      const fallback = {
        narrative: `${concept?.problem || 'Healthcare access challenges'} create daily friction for patients and care teams. The opportunity is to turn that friction into a guided digital experience that makes the next step clear.\n\nOur solution helps ${concept?.targetUsers || 'healthcare stakeholders'} complete important healthcare tasks with less delay, better visibility, and stronger trust.\n\nAligned with Vision 2030, this startup can support a more accessible and efficient health ecosystem across Saudi Arabia and MENA.`,
        clarityScore: 82,
        emotionScore: 74,
        pitchSummary: concept?.solution || 'A digital health platform that reduces healthcare workflow friction.',
        marketAnalysis: ['Vision 2030 supports digital health transformation', 'Bilingual experiences are important for Saudi adoption', 'Healthcare workflows need trust, compliance, and clarity'],
        risks: ['Clinical workflow adoption', 'Healthcare integration complexity', 'Regulatory review timing'],
        userStories: [
          {
            role: 'patient',
            need: 'complete the core healthcare task from mobile',
            benefit: 'I can finish without confusion or repeated calls',
            acceptanceCriteria: ['Supports Arabic and English', 'Shows clear next step', 'Confirms successful completion'],
          },
        ],
      }

      const parsed = extractJSON<typeof fallback>(await llmPrompt(prompt, { maxTokens: 2500 }), fallback)

      setStory(parsed.narrative)
      setScores({ clarity: parsed.clarityScore, emotion: parsed.emotionScore })
      setPitchSummary(parsed.pitchSummary)
      setMarketAnalysis(parsed.marketAnalysis || [])
      setRisks(parsed.risks || [])
      setUserStories(parsed.userStories || [])
      setGenerated(true)
    } finally {
      setLoading(false)
    }
  }

  function handleComplete() {
    onComplete({
      template,
      tone,
      narrative: story,
      clarityScore: scores.clarity,
      emotionScore: scores.emotion,
      pitchSummary,
      marketAnalysis,
      risks,
      userStories,
    })
  }

  return (
    <PhaseShell phaseId="story" subtitle={t.storySubtitle} onBack={onBack}>
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <AILoadingScreen message={language === 'ar' ? 'جاري إنشاء قصتك...' : 'Crafting your story...'} />
            </motion.div>
          ) : (
            <motion.div key="content" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
              {/* Template selection */}
              <div className="glass-card rounded-2xl p-5">
                <h3 className="font-semibold text-sm text-slate-400 uppercase tracking-wide mb-3">{t.storyTemplate}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {templates.map(tmpl => (
                    <button
                      key={tmpl.id}
                      onClick={() => setTemplate(tmpl.id)}
                      className={`p-3 rounded-xl text-left transition-all duration-200 ${
                        template === tmpl.id
                          ? 'bg-spark-500/20 border border-spark-500/50 text-white'
                          : 'glass-card glass-card-hover text-slate-400 hover:text-white'
                      }`}
                      dir={isRTL ? 'rtl' : 'ltr'}
                    >
                      <p className="font-semibold text-sm mb-1">{tmpl.label}</p>
                      <p className="text-xs opacity-70">{tmpl.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Tone slider */}
              <div className="glass-card rounded-2xl p-5">
                <div className={`flex items-center justify-between mb-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <h3 className="font-semibold text-sm text-slate-400 uppercase tracking-wide">{t.toneLabel}</h3>
                  <span className="text-xs text-spark-400 font-medium">
                    {tone < 33 ? t.formal : tone < 66 ? '⚖️ Balanced' : t.casual}
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={tone}
                  onChange={e => setTone(Number(e.target.value))}
                  className="w-full accent-spark-500"
                  dir="ltr"
                />
                <div className={`flex justify-between mt-1 text-xs text-slate-500 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <span>{t.formal}</span>
                  <span>{t.casual}</span>
                </div>
              </div>

              {/* Generated story */}
              {generated && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-card rounded-2xl p-5 border border-spark-500/20"
                >
                  <div className={`flex items-center justify-between mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <h3 className="font-display font-semibold text-white flex items-center gap-2">
                      <BookOpen size={18} className="text-spark-400" />
                      {t.yourStory}
                    </h3>
                    <div className="flex gap-3 text-xs">
                      <span className="text-emerald-400">
                        {t.clarityScore}: <strong>{scores.clarity}</strong>
                      </span>
                      <span className="text-spark-400">
                        {t.emotionScore}: <strong>{scores.emotion}</strong>
                      </span>
                    </div>
                  </div>
                  <textarea
                    value={story}
                    onChange={e => setStory(e.target.value)}
                    rows={10}
                    dir={isRTL ? 'rtl' : 'ltr'}
                    className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 resize-none focus:outline-none focus:border-spark-500/50 transition-colors leading-relaxed"
                  />

                  {(pitchSummary || marketAnalysis.length || userStories.length || risks.length) && (
                    <div className="mt-4 grid gap-3">
                      {pitchSummary && (
                        <div className="rounded-xl border border-white/10 bg-white/[.03] p-3">
                          <p className="text-xs font-semibold uppercase tracking-wide text-spark-300 mb-1">
                            {language === 'ar' ? 'ملخص العرض' : 'Pitch Summary'}
                          </p>
                          <p className="text-sm text-slate-300">{pitchSummary}</p>
                        </div>
                      )}

                      <div className="grid gap-3 sm:grid-cols-2">
                        {marketAnalysis.length > 0 && (
                          <div className="rounded-xl border border-white/10 bg-white/[.03] p-3">
                            <p className="text-xs font-semibold uppercase tracking-wide text-spark-300 mb-2">
                              {language === 'ar' ? 'تحليل السوق' : 'Market Analysis'}
                            </p>
                            <ul className="space-y-1 text-sm text-slate-300">
                              {marketAnalysis.map(item => <li key={item}>• {item}</li>)}
                            </ul>
                          </div>
                        )}
                        {risks.length > 0 && (
                          <div className="rounded-xl border border-white/10 bg-white/[.03] p-3">
                            <p className="text-xs font-semibold uppercase tracking-wide text-amber-300 mb-2">
                              {language === 'ar' ? 'المخاطر' : 'Risks'}
                            </p>
                            <ul className="space-y-1 text-sm text-slate-300">
                              {risks.map(item => <li key={item}>• {item}</li>)}
                            </ul>
                          </div>
                        )}
                      </div>

                      {userStories.length > 0 && (
                        <div className="rounded-xl border border-white/10 bg-white/[.03] p-3">
                          <p className="text-xs font-semibold uppercase tracking-wide text-spark-300 mb-2">
                            {language === 'ar' ? 'قصص المستخدم' : 'User Stories'}
                          </p>
                          <div className="grid gap-2">
                            {userStories.map((item, idx) => (
                              <div key={`${item.role}-${idx}`} className="rounded-lg bg-black/20 p-3 text-sm text-slate-300">
                                <p className="font-semibold text-white">As a {item.role}, I need {item.need}, so that {item.benefit}.</p>
                                <ul className="mt-2 space-y-1 text-xs text-slate-400">
                                  {item.acceptanceCriteria.map(criteria => <li key={criteria}>✓ {criteria}</li>)}
                                </ul>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                {generated ? (
                  <>
                    <button
                      onClick={handleGenerate}
                      className="glass-card glass-card-hover px-4 py-3 rounded-xl text-slate-300 flex items-center gap-2"
                    >
                      <Sparkle size={16} />
                      {t.regenerate}
                    </button>
                    <button onClick={handleComplete} className="spark-btn flex-1 py-3 rounded-xl font-semibold flex items-center justify-center gap-2">
                      <Check size={18} />
                      {t.continue}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleGenerate}
                    disabled={!template}
                    className="spark-btn w-full py-3 rounded-2xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Sparkle size={18} />
                    {t.generateStory}
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
    </PhaseShell>
  )
}
