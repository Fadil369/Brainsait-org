import { useState } from 'react'
import { QUIZ_QUESTIONS } from '@/data/quiz'
import { navigate } from '@/lib/utils'

type Phase = 'start' | 'questions' | 'results'

export function QuizView() {
  const [phase, setPhase] = useState<Phase>('start')
  const [currentQ, setCurrentQ] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [showAnswer, setShowAnswer] = useState(false)
  const [score, setScore] = useState(0)

  const total = QUIZ_QUESTIONS.length
  const question = QUIZ_QUESTIONS[currentQ]

  function handleSelect(idx: number) {
    if (showAnswer) return
    setSelected(idx)
    setShowAnswer(true)
    if (idx === question.correct) setScore(s => s + 1)
  }

  function goNext() {
    if (currentQ < total - 1) {
      setCurrentQ(q => q + 1)
      setSelected(null)
      setShowAnswer(false)
    } else {
      setPhase('results')
    }
  }

  function restart() {
    setPhase('start')
    setCurrentQ(0)
    setSelected(null)
    setShowAnswer(false)
    setScore(0)
  }

  const progressPct = Math.round((currentQ / total) * 100)
  const pct = Math.round((score / total) * 100)

  // ── Start screen ──────────────────────────────────────────────────────────
  if (phase === 'start') {
    return (
      <div className="rtl-section" style={{ minHeight: '100vh', background: 'var(--background)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
        <div className="glass-card fade-in-up" style={{ borderRadius: 20, maxWidth: 520, width: '100%', padding: '48px 36px', textAlign: 'center' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: 16 }}>🧠</div>
          <h1 style={{ fontFamily: 'Noto Kufi Arabic, sans-serif', fontSize: '1.75rem', fontWeight: 800, color: '#fff', marginBottom: 10 }}>
            اختبار مجموعة أدوات الابتكار
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.5)', marginBottom: 8 }}>
            UN Innovation Toolkit Quick Quiz
          </p>
          <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.75, marginBottom: 32 }}>
            {total} سؤالاً لاختبار معرفتك بمحاور S.P.A.C.E. وأدوات الابتكار.
          </p>
          <button
            onClick={() => setPhase('questions')}
            className="spark-btn"
            style={{ width: '100%', padding: '14px 0', borderRadius: 12, border: 'none', cursor: 'pointer', fontFamily: 'Noto Kufi Arabic, sans-serif', fontSize: '1rem', fontWeight: 700 }}
          >
            ابدأ الاختبار
          </button>
        </div>
      </div>
    )
  }

  // ── Results screen ────────────────────────────────────────────────────────
  if (phase === 'results') {
    const medal = pct >= 80 ? '🏆' : pct >= 60 ? '🎖️' : '📚'
    const msg = pct >= 80
      ? 'ممتاز! أنت خبير في مجموعة أدوات الابتكار.'
      : pct >= 60
      ? 'جيد! لديك فهم جيد للأدوات.'
      : 'استمر في التعلم — راجع المواد وحاول مجدداً.'

    return (
      <div className="rtl-section" style={{ minHeight: '100vh', background: 'var(--background)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
        <div className="glass-card fade-in-up" style={{ borderRadius: 20, maxWidth: 520, width: '100%', padding: '48px 36px', textAlign: 'center' }}>
          <div style={{ fontSize: '4rem', marginBottom: 16 }}>{medal}</div>
          <div style={{
            fontSize: '3rem', fontWeight: 800, marginBottom: 8,
            background: 'linear-gradient(135deg, #0c9eeb, #10b981)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>
            {score} / {total}
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'rgba(255,255,255,0.8)', marginBottom: 6 }}>
            {pct}%
          </div>
          <p style={{ fontFamily: 'Noto Kufi Arabic, sans-serif', fontSize: '0.9375rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.75, marginBottom: 36 }}>
            {msg}
          </p>

          {/* Score bar */}
          <div style={{ height: 8, borderRadius: 999, background: 'rgba(255,255,255,0.08)', marginBottom: 36 }}>
            <div style={{
              height: '100%', borderRadius: 999,
              background: pct >= 80 ? 'linear-gradient(90deg,#10b981,#059669)' : pct >= 60 ? 'linear-gradient(90deg,#0c9eeb,#10b981)' : 'linear-gradient(90deg,#f97316,#ef4444)',
              width: `${pct}%`, transition: 'width 0.8s ease',
            }} />
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={restart}
              style={{
                padding: '12px 24px', borderRadius: 10,
                border: '1px solid rgba(255,255,255,0.15)', background: 'transparent',
                color: 'rgba(255,255,255,0.7)', cursor: 'pointer',
                fontFamily: 'Noto Kufi Arabic, sans-serif', fontSize: '0.875rem', fontWeight: 600,
              }}
            >
              أعد الاختبار
            </button>
            <button
              onClick={() => navigate('/diagnostic')}
              className="spark-btn"
              style={{ padding: '12px 24px', borderRadius: 10, border: 'none', cursor: 'pointer', fontFamily: 'Noto Kufi Arabic, sans-serif', fontSize: '0.875rem', fontWeight: 600 }}
            >
              التشخيص الكامل →
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Questions screen ──────────────────────────────────────────────────────
  return (
    <div className="rtl-section" style={{ minHeight: '100vh', background: 'var(--background)', padding: '32px 20px 80px' }}>
      <div style={{ maxWidth: 620, margin: '0 auto' }}>
        {/* Progress */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', fontFamily: 'Noto Kufi Arabic, sans-serif' }}>
              {currentQ + 1} / {total}
            </span>
            <span style={{ fontSize: '0.78rem', color: '#10b981', fontFamily: 'Noto Kufi Arabic, sans-serif' }}>
              {score} صحيح
            </span>
          </div>
          <div style={{ height: 4, borderRadius: 999, background: 'rgba(255,255,255,0.08)' }}>
            <div style={{
              height: '100%', borderRadius: 999,
              background: 'linear-gradient(90deg, #0c9eeb, #10b981)',
              width: `${progressPct}%`, transition: 'width 0.3s',
            }} />
          </div>
        </div>

        {/* Module */}
        <div style={{
          display: 'inline-block', marginBottom: 16,
          padding: '3px 12px', borderRadius: 999,
          background: 'rgba(12,158,235,0.12)', color: '#0c9eeb',
          fontSize: '0.75rem', fontWeight: 700, fontFamily: 'Noto Kufi Arabic, sans-serif',
        }}>
          {question.module}
        </div>

        {/* Question card */}
        <div className="glass-card fade-in-up" style={{ borderRadius: 18, padding: '28px 24px', marginBottom: 16 }}>
          <p style={{
            fontFamily: 'Noto Kufi Arabic, sans-serif',
            fontSize: 'clamp(0.95rem, 2.8vw, 1.1rem)',
            fontWeight: 700, color: '#fff', lineHeight: 1.8, marginBottom: 24,
          }}>
            {question.q}
          </p>

          {/* Options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {question.opts.map((opt, idx) => {
              const isCorrect = idx === question.correct
              const isSelected = selected === idx
              let bg = 'rgba(255,255,255,0.03)'
              let border = '1px solid rgba(255,255,255,0.1)'
              let color = 'rgba(255,255,255,0.75)'

              if (showAnswer) {
                if (isCorrect) {
                  bg = 'rgba(16,185,129,0.12)'
                  border = '1px solid rgba(16,185,129,0.5)'
                  color = '#34d399'
                } else if (isSelected && !isCorrect) {
                  bg = 'rgba(239,68,68,0.12)'
                  border = '1px solid rgba(239,68,68,0.5)'
                  color = '#fca5a5'
                }
              } else if (isSelected) {
                bg = 'rgba(12,158,235,0.12)'
                border = '1px solid rgba(12,158,235,0.5)'
                color = '#0c9eeb'
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelect(idx)}
                  style={{
                    width: '100%', padding: '11px 14px', borderRadius: 10,
                    background: bg, border, color,
                    cursor: showAnswer ? 'default' : 'pointer',
                    fontFamily: 'Noto Kufi Arabic, sans-serif',
                    fontSize: '0.875rem', fontWeight: 600, textAlign: 'right',
                    transition: 'all 0.15s',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  }}
                >
                  <span style={{ fontSize: '0.85rem' }}>
                    {showAnswer && isCorrect ? '✓' : showAnswer && isSelected && !isCorrect ? '✗' : ''}
                  </span>
                  <span>{opt}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Next button */}
        {showAnswer && (
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <button
              onClick={goNext}
              className="spark-btn"
              style={{ padding: '11px 28px', borderRadius: 10, border: 'none', cursor: 'pointer', fontFamily: 'Noto Kufi Arabic, sans-serif', fontSize: '0.875rem', fontWeight: 700 }}
            >
              {currentQ < total - 1 ? 'التالي →' : 'النتائج →'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
