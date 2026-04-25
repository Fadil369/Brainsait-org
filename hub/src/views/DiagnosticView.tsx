import { useState } from 'react'
import {
  DIAGNOSTIC_QUESTIONS,
  DIAGNOSTIC_OPTIONS,
  PROFILES,
  TOOLS_BY_MODULE,
  calculateScores,
  determineProfile,
} from '@/data/diagnostic'
import { useKV } from '@/lib/useKV'
import { navigate } from '@/lib/utils'
import type { SpaceModule, UserProgress } from '@/types'

// Module color map
const MODULE_COLORS: Record<string, { bg: string; text: string; bar: string }> = {
  blue:    { bg: 'rgba(59,130,246,0.15)', text: '#93c5fd', bar: '#3b82f6' },
  emerald: { bg: 'rgba(16,185,129,0.15)', text: '#6ee7b7', bar: '#10b981' },
  purple:  { bg: 'rgba(139,92,246,0.15)', text: '#c4b5fd', bar: '#8b5cf6' },
  orange:  { bg: 'rgba(249,115,22,0.15)', text: '#fdba74', bar: '#f97316' },
  red:     { bg: 'rgba(239,68,68,0.15)', text: '#fca5a5', bar: '#ef4444' },
}

const MODULE_NAMES_AR: Record<SpaceModule, string> = {
  strategy:     'الاستراتيجية',
  partnerships: 'الشراكات',
  architecture: 'البنية التحتية',
  culture:      'الثقافة',
  evaluation:   'التقييم',
}

type Phase = 'start' | 'questions' | 'results'

export function DiagnosticView() {
  const [phase, setPhase] = useState<Phase>('start')
  const [currentQ, setCurrentQ] = useState(0)
  const [answers, setAnswers] = useState<(number | null)[]>(
    Array(DIAGNOSTIC_QUESTIONS.length).fill(null)
  )
  const [, setProgress] = useKV<UserProgress>('progress', {
    completedCourses: [],
    enrolledCourses: [],
  })

  const total = DIAGNOSTIC_QUESTIONS.length
  const question = DIAGNOSTIC_QUESTIONS[currentQ]
  const colorMap = MODULE_COLORS[question?.color ?? 'blue']

  function selectAnswer(val: number) {
    setAnswers(prev => {
      const next = [...prev]
      next[currentQ] = val
      return next
    })
  }

  function goNext() {
    if (currentQ < total - 1) {
      setCurrentQ(q => q + 1)
    } else {
      // Compute and save results
      const scores = calculateScores(answers, DIAGNOSTIC_QUESTIONS)
      setProgress(prev => ({ ...prev, diagnosticScore: scores }))
      setPhase('results')
    }
  }

  function goPrev() {
    if (currentQ > 0) setCurrentQ(q => q - 1)
  }

  function restart() {
    setAnswers(Array(DIAGNOSTIC_QUESTIONS.length).fill(null))
    setCurrentQ(0)
    setPhase('start')
  }

  // ── Start screen ─────────────────────────────────────────────────────────
  if (phase === 'start') {
    return (
      <div className="rtl-section" style={{ minHeight: '100vh', background: 'var(--background)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
        <div className="glass-card fade-in-up" style={{ borderRadius: 20, maxWidth: 560, width: '100%', padding: '48px 40px', textAlign: 'center' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: 16 }}>🔬</div>
          <h1 style={{ fontFamily: 'Noto Kufi Arabic, sans-serif', fontSize: '1.75rem', fontWeight: 800, color: '#fff', marginBottom: 10 }}>
            التشخيص الابتكاري
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, marginBottom: 8 }}>
            S.P.A.C.E. Innovation Assessment
          </p>
          <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.75, marginBottom: 32 }}>
            {total} سؤالاً في 5 محاور: الاستراتيجية، الشراكات، البنية التحتية، الثقافة، التقييم.
            اكتشف ملفك الابتكاري الشخصي وأدوات التحسين.
          </p>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 32 }}>
            {Object.entries(MODULE_NAMES_AR).map(([key, label]) => (
              <span key={key} style={{ fontSize: '0.75rem', padding: '4px 12px', borderRadius: 999, background: 'rgba(12,158,235,0.12)', color: '#0c9eeb', fontWeight: 600 }}>
                {label}
              </span>
            ))}
          </div>
          <button
            onClick={() => setPhase('questions')}
            className="spark-btn"
            style={{ width: '100%', padding: '14px 0', borderRadius: 12, border: 'none', cursor: 'pointer', fontFamily: 'Noto Kufi Arabic, sans-serif', fontSize: '1rem', fontWeight: 700 }}
          >
            ابدأ التشخيص
          </button>
        </div>
      </div>
    )
  }

  // ── Results screen ────────────────────────────────────────────────────────
  if (phase === 'results') {
    const scores = calculateScores(answers, DIAGNOSTIC_QUESTIONS)
    const profileKey = determineProfile(scores)
    const profile = PROFILES[profileKey]
    const modules: SpaceModule[] = ['strategy', 'partnerships', 'architecture', 'culture', 'evaluation']

    return (
      <div className="rtl-section" style={{ minHeight: '100vh', background: 'var(--background)', padding: '40px 20px 80px' }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          {/* Profile card */}
          <div className="glass-card fade-in-up" style={{ borderRadius: 20, padding: '40px 32px', marginBottom: 24, textAlign: 'center' }}>
            <div style={{ fontSize: '4rem', marginBottom: 12 }}>{profile.emoji}</div>
            <h2 style={{ fontFamily: 'Noto Kufi Arabic, sans-serif', fontSize: '1.6rem', fontWeight: 800, color: '#0c9eeb', marginBottom: 10 }}>
              {profile.name}
            </h2>
            <p style={{ fontSize: '0.9375rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.75, maxWidth: 480, margin: '0 auto' }}>
              {profile.desc}
            </p>
          </div>

          {/* Scores */}
          <div className="glass-card" style={{ borderRadius: 20, padding: '28px 32px', marginBottom: 24 }}>
            <h3 style={{ fontFamily: 'Noto Kufi Arabic, sans-serif', fontSize: '1rem', fontWeight: 700, color: '#fff', marginBottom: 20 }}>
              نتائجك عبر المحاور
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {modules.map(mod => {
                const score = scores[mod] ?? 0
                const q = DIAGNOSTIC_QUESTIONS.find(q => q.moduleEn === mod)
                const col = MODULE_COLORS[q?.color ?? 'blue']
                return (
                  <div key={mod}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: '0.875rem', color: col.text, fontWeight: 600 }}>
                        {MODULE_NAMES_AR[mod]}
                      </span>
                      <span style={{ fontSize: '0.875rem', color: col.text, fontWeight: 700 }}>
                        {score}%
                      </span>
                    </div>
                    <div style={{ height: 8, borderRadius: 999, background: 'rgba(255,255,255,0.08)' }}>
                      <div style={{
                        height: '100%', borderRadius: 999,
                        background: col.bar,
                        width: `${score}%`,
                        transition: 'width 0.6s ease',
                      }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Tools */}
          <div className="glass-card" style={{ borderRadius: 20, padding: '28px 32px', marginBottom: 28 }}>
            <h3 style={{ fontFamily: 'Noto Kufi Arabic, sans-serif', fontSize: '1rem', fontWeight: 700, color: '#fff', marginBottom: 20 }}>
              الأدوات الموصى بها
            </h3>
            {modules.map(mod => {
              const tools = TOOLS_BY_MODULE[mod]
              const q = DIAGNOSTIC_QUESTIONS.find(q => q.moduleEn === mod)
              const col = MODULE_COLORS[q?.color ?? 'blue']
              return (
                <div key={mod} style={{ marginBottom: 20 }}>
                  <div style={{
                    fontSize: '0.75rem', fontWeight: 700, color: col.text,
                    textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8,
                  }}>
                    {MODULE_NAMES_AR[mod]}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 8 }}>
                    {tools.map(tool => (
                      <div
                        key={tool.name}
                        style={{
                          padding: '10px 12px', borderRadius: 10,
                          background: col.bg, border: `1px solid ${col.bar}22`,
                        }}
                      >
                        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: col.text, marginBottom: 2 }}>
                          {tool.name}
                        </div>
                        <div style={{ fontSize: '0.73rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.4 }}>
                          {tool.desc}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              onClick={restart}
              style={{
                padding: '12px 24px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.15)',
                background: 'transparent', color: 'rgba(255,255,255,0.7)', cursor: 'pointer',
                fontFamily: 'Noto Kufi Arabic, sans-serif', fontSize: '0.9rem', fontWeight: 600,
              }}
            >
              أعد التشخيص
            </button>
            <button
              onClick={() => navigate('/quiz')}
              className="spark-btn"
              style={{ padding: '12px 24px', borderRadius: 10, border: 'none', cursor: 'pointer', fontFamily: 'Noto Kufi Arabic, sans-serif', fontSize: '0.9rem', fontWeight: 600 }}
            >
              جرّب الاختبار السريع →
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Questions screen ──────────────────────────────────────────────────────
  const answered = answers.filter(a => a !== null).length
  const progressPct = Math.round((currentQ / total) * 100)

  return (
    <div className="rtl-section" style={{ minHeight: '100vh', background: 'var(--background)', padding: '32px 20px 80px' }}>
      <div style={{ maxWidth: 680, margin: '0 auto' }}>
        {/* Top progress */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', fontFamily: 'Noto Kufi Arabic, sans-serif' }}>
              {currentQ + 1} / {total}
            </span>
            <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', fontFamily: 'Noto Kufi Arabic, sans-serif' }}>
              {answered} أجوبة
            </span>
          </div>
          <div style={{ height: 4, borderRadius: 999, background: 'rgba(255,255,255,0.08)' }}>
            <div style={{
              height: '100%', borderRadius: 999,
              background: 'linear-gradient(90deg, #0c9eeb, #10b981)',
              width: `${progressPct}%`, transition: 'width 0.3s ease',
            }} />
          </div>
        </div>

        {/* Module label */}
        <div style={{
          display: 'inline-block', marginBottom: 20,
          padding: '4px 14px', borderRadius: 999,
          background: colorMap.bg, color: colorMap.text,
          fontSize: '0.78rem', fontWeight: 700, fontFamily: 'Noto Kufi Arabic, sans-serif',
        }}>
          {question.module}
        </div>

        {/* Question card */}
        <div className="glass-card fade-in-up" style={{ borderRadius: 18, padding: '32px 28px', marginBottom: 20 }}>
          <p style={{
            fontFamily: 'Noto Kufi Arabic, sans-serif',
            fontSize: 'clamp(1rem, 3vw, 1.2rem)',
            fontWeight: 700, color: '#fff', lineHeight: 1.75, marginBottom: 28,
          }}>
            {question.q}
          </p>

          {/* Options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {DIAGNOSTIC_OPTIONS.map(opt => {
              const selected = answers[currentQ] === opt.value
              return (
                <button
                  key={opt.value}
                  onClick={() => selectAnswer(opt.value)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 16px', borderRadius: 10, cursor: 'pointer',
                    fontFamily: 'Noto Kufi Arabic, sans-serif',
                    fontSize: '0.9rem', fontWeight: 600, textAlign: 'right',
                    border: selected ? '1px solid #0c9eeb' : '1px solid rgba(255,255,255,0.1)',
                    background: selected ? 'rgba(12,158,235,0.12)' : 'rgba(255,255,255,0.03)',
                    color: selected ? '#0c9eeb' : 'rgba(255,255,255,0.75)',
                    transition: 'all 0.15s',
                    width: '100%',
                  }}
                >
                  <span style={{
                    width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                    border: selected ? '6px solid #0c9eeb' : '2px solid rgba(255,255,255,0.25)',
                    background: selected ? '#0c9eeb22' : 'transparent',
                    transition: 'all 0.15s',
                  }} />
                  <span style={{ flex: 1 }}>{opt.text}</span>
                  <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)' }}>{opt.value}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Navigation */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'space-between' }}>
          <button
            onClick={goPrev}
            disabled={currentQ === 0}
            style={{
              padding: '11px 22px', borderRadius: 10,
              border: '1px solid rgba(255,255,255,0.15)',
              background: 'transparent',
              color: currentQ === 0 ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.7)',
              cursor: currentQ === 0 ? 'not-allowed' : 'pointer',
              fontFamily: 'Noto Kufi Arabic, sans-serif', fontSize: '0.875rem', fontWeight: 600,
            }}
          >
            ← السابق
          </button>
          <button
            onClick={goNext}
            disabled={answers[currentQ] === null}
            className={answers[currentQ] !== null ? 'spark-btn' : ''}
            style={{
              padding: '11px 28px', borderRadius: 10, border: 'none',
              background: answers[currentQ] !== null ? undefined : 'rgba(255,255,255,0.08)',
              color: answers[currentQ] !== null ? '#fff' : 'rgba(255,255,255,0.3)',
              cursor: answers[currentQ] !== null ? 'pointer' : 'not-allowed',
              fontFamily: 'Noto Kufi Arabic, sans-serif', fontSize: '0.875rem', fontWeight: 700,
            }}
          >
            {currentQ < total - 1 ? 'التالي →' : 'عرض النتائج →'}
          </button>
        </div>
      </div>
    </div>
  )
}
