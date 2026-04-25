// Phase 3: Brand Studio
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Palette, Sparkle, Check } from '@phosphor-icons/react'
import { useLanguage } from '@/contexts/LanguageContext'
import { PhaseShell } from '@/components/PhaseShell'
import { AILoadingScreen } from '@/components/AILoadingScreen'
import { llmPrompt } from '@/lib/llm'
import type { Brand, BrandPersonality, PersonalityProfile, ConceptCard } from '@/types'

interface Props {
  initial?: Brand
  concept?: ConceptCard
  onComplete: (brand: Brand) => void
  onBack: () => void
}

const QUIZ_QUESTIONS = {
  en: [
    { id: 'q1', q: 'How would you describe your approach to healthcare?', options: ['Cutting-edge & innovative', 'Trustworthy & established', 'Compassionate & patient-first', 'Bold & disruptive'] },
    { id: 'q2', q: 'What\'s your company\'s primary value?', options: ['Innovation & technology', 'Trust & safety', 'Care & empathy', 'Speed & efficiency'] },
    { id: 'q3', q: 'Your brand voice is:', options: ['Expert & authoritative', 'Warm & conversational', 'Inspiring & visionary', 'Direct & confident'] },
    { id: 'q4', q: 'What do you want patients to feel?', options: ['Amazed by technology', 'Safe & reassured', 'Cared for & heard', 'Empowered & in control'] },
    { id: 'q5', q: 'Choose your visual style:', options: ['Futuristic & digital', 'Clean & professional', 'Warm & approachable', 'Bold & striking'] },
    { id: 'q6', q: 'Your business model focus:', options: ['B2B enterprise', 'B2C consumer', 'B2B2C hybrid', 'Government/insurance'] },
  ],
  ar: [
    { id: 'q1', q: 'كيف تصف نهجك في الرعاية الصحية؟', options: ['متطور ومبتكر', 'موثوق وراسخ', 'متعاطف والمريض أولاً', 'جريء ومغيّر'] },
    { id: 'q2', q: 'ما القيمة الأساسية لشركتك؟', options: ['الابتكار والتكنولوجيا', 'الثقة والسلامة', 'الرعاية والتعاطف', 'السرعة والكفاءة'] },
    { id: 'q3', q: 'صوت علامتك التجارية:', options: ['خبير وموثوق', 'دافئ وتحادثي', 'ملهم ورؤيوي', 'مباشر وواثق'] },
    { id: 'q4', q: 'ما الذي تريد المرضى أن يشعروا به؟', options: ['الدهشة من التكنولوجيا', 'الأمان والطمأنينة', 'الرعاية والاهتمام', 'التمكين والتحكم'] },
    { id: 'q5', q: 'اختر أسلوبك البصري:', options: ['مستقبلي ورقمي', 'نظيف ومهني', 'دافئ وقريب', 'جريء وبارز'] },
    { id: 'q6', q: 'تركيز نموذج عملك:', options: ['B2B مؤسسي', 'B2C للمستهلك', 'B2B2C هجين', 'حكومي/تأمين'] },
  ],
}

const LOGO_ICONS = ['🏥', '❤️', '🩺', '💊', '🧬', '🔬', '🌡️', '🩻', '⚕️', '🌿', '⭐', '💡', '🔷', '🌐', '✨']

const PERSONALITY_COLORS: Record<BrandPersonality, string[]> = {
  innovative: ['#0c9eeb', '#6366f1', '#8b5cf6'],
  trustworthy: ['#0369a1', '#0891b2', '#059669'],
  compassionate: ['#ec4899', '#f43f5e', '#fb7185'],
  bold: ['#ef4444', '#f97316', '#eab308'],
  elegant: ['#6b7280', '#374151', '#9ca3af'],
  friendly: ['#10b981', '#34d399', '#0c9eeb'],
}

export function BrandPhase({ initial, concept, onComplete, onBack }: Props) {
  const { t, language, isRTL } = useLanguage()
  const [step, setStep] = useState<'quiz' | 'studio'>(initial ? 'studio' : 'quiz')
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>(initial?.quizAnswers || {})
  const [loading, setLoading] = useState(false)
  const [brand, setBrand] = useState<Partial<Brand>>(initial || {})
  const [generatedNames, setGeneratedNames] = useState<string[]>([])
  const [generatedTaglines, setGeneratedTaglines] = useState<string[]>([])

  const questions = language === 'ar' ? QUIZ_QUESTIONS.ar : QUIZ_QUESTIONS.en
  const allAnswered = questions.every(q => quizAnswers[q.id])

  async function handleGenerateBrand() {
    setLoading(true)
    try {
      const prompt = `You are a healthcare brand strategist for the Saudi Arabia / MENA market.

Startup concept:
- Problem: ${concept?.problem || 'Healthcare access'}
- Solution: ${concept?.solution || 'Digital health platform'}

Personality quiz answers: ${JSON.stringify(quizAnswers)}

Generate a brand kit as JSON:
{
  "personality": "innovative|trustworthy|compassionate|bold|elegant|friendly",
  "names": ["6 creative brand names mixing English/Arabic healthcare terms"],
  "taglines": ["4 compelling taglines under 8 words each"],
  "toneDescription": "2-sentence brand voice description",
  "toneDescriptionAr": "وصف صوت العلامة التجارية بالعربية"
}

Names should be memorable, healthcare-appropriate, and work in both English and Arabic contexts.
Respond with JSON only.`

      const res = await llmPrompt(prompt)
      let parsed: { personality: BrandPersonality; names: string[]; taglines: string[]; toneDescription: string; toneDescriptionAr: string }
      try {
        const json = res.match(/\{[\s\S]*\}/)?.[0] || res
        parsed = JSON.parse(json)
      } catch {
        parsed = {
          personality: 'innovative',
          names: ['HealthLink', 'CareFlow', 'MedBridge', 'Salama', 'Shifaa', 'Wefaq'],
          taglines: ['Healthcare, Connected.', 'Your Health, Our Mission.', 'Care Beyond Boundaries.', 'Where Technology Heals.'],
          toneDescription: 'Confident and innovative, yet deeply human.',
          toneDescriptionAr: 'واثق ومبتكر، وإنساني في جوهره.',
        }
      }

      const personality: PersonalityProfile = {
        primary: parsed.personality as BrandPersonality || 'innovative',
        secondary: 'trustworthy',
        description: parsed.toneDescription,
        descriptionAr: parsed.toneDescriptionAr,
        colorPalette: PERSONALITY_COLORS[parsed.personality as BrandPersonality] || PERSONALITY_COLORS.innovative,
        tone: parsed.toneDescription.split('.')[0],
        toneAr: parsed.toneDescriptionAr.split('.')[0],
      }

      setGeneratedNames(parsed.names || [])
      setGeneratedTaglines(parsed.taglines || [])
      setBrand(prev => ({
        ...prev,
        personality,
        colors: personality.colorPalette,
        quizAnswers,
        logoIcon: prev.logoIcon || '❤️',
      }))
      setStep('studio')
    } finally {
      setLoading(false)
    }
  }

  function handleComplete() {
    onComplete({
      name: brand.name || 'HealthLink',
      tagline: brand.tagline || 'Healthcare, Connected.',
      taglineAr: brand.taglineAr || 'الرعاية الصحية، متصلة.',
      colors: brand.colors || PERSONALITY_COLORS.innovative,
      logoIcon: brand.logoIcon || '❤️',
      personality: brand.personality || {
        primary: 'innovative', secondary: 'trustworthy',
        description: '', descriptionAr: '',
        colorPalette: PERSONALITY_COLORS.innovative,
        tone: '', toneAr: '',
      },
      quizAnswers,
    })
  }

  return (
    <PhaseShell phaseId="brand" subtitle={t.brandSubtitle} onBack={onBack}>
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <AILoadingScreen message={language === 'ar' ? 'جاري إنشاء هويتك التجارية...' : 'Building your brand identity...'} />
            </motion.div>
          ) : step === 'quiz' ? (
            <motion.div key="quiz" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5">
              <p className="text-slate-400 text-sm glass-card rounded-xl p-3">
                {language === 'ar' ? 'أجب على هذه الأسئلة لمساعدتنا في إنشاء هوية علامتك التجارية.' : 'Answer these questions to help us create your brand personality.'}
              </p>
              {questions.map((q, idx) => (
                <motion.div
                  key={q.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="glass-card rounded-2xl p-5"
                >
                  <p className="font-medium text-white mb-3 text-sm" dir={isRTL ? 'rtl' : 'ltr'}>{q.q}</p>
                  <div className="grid grid-cols-2 gap-2">
                    {q.options.map(opt => (
                      <button
                        key={opt}
                        onClick={() => setQuizAnswers(prev => ({ ...prev, [q.id]: opt }))}
                        className={`p-2.5 rounded-xl text-xs text-left transition-all duration-200 ${
                          quizAnswers[q.id] === opt
                            ? 'bg-spark-500/20 border border-spark-500/50 text-white'
                            : 'glass-card glass-card-hover text-slate-400 hover:text-white'
                        }`}
                        dir={isRTL ? 'rtl' : 'ltr'}
                      >
                        {quizAnswers[q.id] === opt && <span className="mr-1">✓</span>}
                        {opt}
                      </button>
                    ))}
                  </div>
                </motion.div>
              ))}
              <button
                onClick={handleGenerateBrand}
                disabled={!allAnswered}
                className="spark-btn w-full py-3 rounded-2xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Palette size={18} />
                {t.generateBrand}
              </button>
            </motion.div>
          ) : (
            <motion.div key="studio" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
              {/* Personality card */}
              {brand.personality && (
                <div className="glass-card rounded-2xl p-5 border border-spark-500/20">
                  <p className="text-xs text-slate-400 uppercase tracking-wide mb-2">{language === 'ar' ? 'شخصيتك التجارية' : 'Your Brand Personality'}</p>
                  <p className="text-sm text-slate-200">{language === 'ar' ? brand.personality.descriptionAr : brand.personality.description}</p>
                </div>
              )}

              {/* Name selection */}
              <div className="glass-card rounded-2xl p-5">
                <h3 className="font-semibold text-sm text-slate-400 uppercase tracking-wide mb-3">{t.brandName}</h3>
                <div className="flex flex-wrap gap-2 mb-3">
                  {generatedNames.map(name => (
                    <button
                      key={name}
                      onClick={() => setBrand(prev => ({ ...prev, name }))}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                        brand.name === name
                          ? 'bg-spark-500/20 border border-spark-500/50 text-white'
                          : 'glass-card glass-card-hover text-slate-300'
                      }`}
                    >
                      {name}
                    </button>
                  ))}
                </div>
                <input
                  value={brand.name || ''}
                  onChange={e => setBrand(prev => ({ ...prev, name: e.target.value }))}
                  placeholder={language === 'ar' ? 'أو اكتب اسمك الخاص...' : 'Or type your own name...'}
                  className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-spark-500/50"
                  dir={isRTL ? 'rtl' : 'ltr'}
                />
              </div>

              {/* Tagline */}
              <div className="glass-card rounded-2xl p-5">
                <h3 className="font-semibold text-sm text-slate-400 uppercase tracking-wide mb-3">{t.tagline}</h3>
                <div className="flex flex-col gap-2 mb-3">
                  {generatedTaglines.map(tl => (
                    <button
                      key={tl}
                      onClick={() => setBrand(prev => ({ ...prev, tagline: tl }))}
                      className={`px-4 py-2 rounded-xl text-sm text-left transition-all duration-200 ${
                        brand.tagline === tl
                          ? 'bg-spark-500/20 border border-spark-500/50 text-white'
                          : 'glass-card glass-card-hover text-slate-300'
                      }`}
                    >
                      {tl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color palette */}
              <div className="glass-card rounded-2xl p-5">
                <h3 className="font-semibold text-sm text-slate-400 uppercase tracking-wide mb-3">{t.colorPalette}</h3>
                <div className="flex gap-2 flex-wrap">
                  {Object.entries(PERSONALITY_COLORS).map(([key, colors]) => (
                    <button
                      key={key}
                      onClick={() => setBrand(prev => ({ ...prev, colors }))}
                      className={`flex gap-1 p-1.5 rounded-xl border-2 transition-all ${
                        JSON.stringify(brand.colors) === JSON.stringify(colors)
                          ? 'border-white' : 'border-transparent'
                      }`}
                    >
                      {colors.map(c => (
                        <div key={c} className="w-6 h-6 rounded-full" style={{ background: c }} />
                      ))}
                    </button>
                  ))}
                </div>
              </div>

              {/* Logo icon */}
              <div className="glass-card rounded-2xl p-5">
                <h3 className="font-semibold text-sm text-slate-400 uppercase tracking-wide mb-3">{t.logoIcon}</h3>
                <div className="flex flex-wrap gap-2">
                  {LOGO_ICONS.map(icon => (
                    <button
                      key={icon}
                      onClick={() => setBrand(prev => ({ ...prev, logoIcon: icon }))}
                      className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all ${
                        brand.logoIcon === icon
                          ? 'bg-spark-500/30 border border-spark-500/60 scale-110'
                          : 'glass-card glass-card-hover'
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => { setStep('quiz'); handleGenerateBrand() }}
                  className="glass-card glass-card-hover px-4 py-3 rounded-xl text-slate-300 flex items-center gap-2"
                >
                  <Sparkle size={16} />
                  {t.regenerate}
                </button>
                <button
                  onClick={handleComplete}
                  disabled={!brand.name}
                  className="spark-btn flex-1 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                >
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
