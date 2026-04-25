import { useLanguage } from '@/contexts/LanguageContext'
import { COURSES_BY_ID } from '@/data/courses'
import { useKV } from '@/lib/useKV'
import { navigate } from '@/lib/utils'
import type { UserProgress } from '@/types'
import { ArrowLeft, ArrowRight } from '@phosphor-icons/react'

interface Props { id: string }

const STRIPE_GRADIENT: Record<string, string> = {
  green:  'linear-gradient(135deg, #10b981 0%, #059669 100%)',
  blue:   'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
  cyan:   'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
  orange: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
  red:    'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
  gold:   'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
  teal:   'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)',
  purple: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
  pink:   'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
  spark:  'linear-gradient(135deg, #0c9eeb 0%, #10b981 100%)',
}

const CHIP_STYLE: Record<string, { bg: string; color: string }> = {
  green:  { bg: 'rgba(16,185,129,0.15)', color: '#34d399' },
  blue:   { bg: 'rgba(59,130,246,0.15)', color: '#93c5fd' },
  cyan:   { bg: 'rgba(6,182,212,0.15)', color: '#67e8f9' },
  orange: { bg: 'rgba(249,115,22,0.15)', color: '#fdba74' },
  red:    { bg: 'rgba(239,68,68,0.15)', color: '#fca5a5' },
  gold:   { bg: 'rgba(245,158,11,0.15)', color: '#fcd34d' },
  teal:   { bg: 'rgba(20,184,166,0.15)', color: '#5eead4' },
  purple: { bg: 'rgba(139,92,246,0.15)', color: '#c4b5fd' },
  pink:   { bg: 'rgba(236,72,153,0.15)', color: '#f9a8d4' },
  claude: { bg: 'rgba(99,102,241,0.15)', color: '#a5b4fc' },
  open:   { bg: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)' },
  spark:  { bg: 'rgba(12,158,235,0.18)', color: '#0c9eeb' },
}

function StatusBadge({ status }: { status?: string }) {
  if (!status) return null
  const map: Record<string, { label: string; color: string }> = {
    active:     { label: '🟢 Active', color: '#22c55e' },
    'self-paced': { label: '📖 Self-Paced', color: '#94a3b8' },
    upcoming:   { label: '🔜 Upcoming', color: '#f59e0b' },
  }
  const s = map[status]
  if (!s) return null
  return (
    <span style={{
      fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.05em',
      color: s.color, textTransform: 'uppercase', padding: '2px 8px',
      border: `1px solid ${s.color}44`, borderRadius: 999,
    }}>
      {s.label}
    </span>
  )
}

export function CourseDetailView({ id }: Props) {
  const { t, isRTL } = useLanguage()
  const course = COURSES_BY_ID[id]
  const [progress, setProgress] = useKV<UserProgress>('progress', {
    completedCourses: [],
    enrolledCourses: [],
  })

  if (!course) {
    return (
      <div style={{ maxWidth: 800, margin: '80px auto', padding: '0 20px', textAlign: 'center' }}>
        <p style={{ color: 'rgba(255,255,255,0.5)' }}>Course not found.</p>
        <button
          onClick={() => navigate('/')}
          style={{ marginTop: 16, color: '#0c9eeb', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem' }}
        >
          ← Back to catalog
        </button>
      </div>
    )
  }

  const gradient = STRIPE_GRADIENT[course.stripe] ?? STRIPE_GRADIENT.blue
  const isEnrolled = progress.enrolledCourses?.includes(course.id)
  const isCompleted = progress.completedCourses?.includes(course.id)

  function toggleEnroll() {
    if (course.courseUrl?.startsWith('http')) {
      window.open(course.courseUrl, '_blank')
      return
    }
    setProgress(prev => {
      const enrolled = prev.enrolledCourses ?? []
      if (enrolled.includes(course.id)) return prev
      return { ...prev, enrolledCourses: [...enrolled, course.id] }
    })
  }

  function toggleComplete() {
    setProgress(prev => {
      const completed = prev.completedCourses ?? []
      if (completed.includes(course.id)) {
        return { ...prev, completedCourses: completed.filter(c => c !== course.id) }
      }
      return { ...prev, completedCourses: [...completed, course.id] }
    })
  }

  const BackIcon = isRTL ? ArrowRight : ArrowLeft

  return (
    <div style={{ minHeight: '100vh', background: 'var(--background)' }} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Hero stripe */}
      <div style={{ background: gradient, padding: '60px 20px 40px', position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, rgba(5,8,16,0) 0%, rgba(5,8,16,0.7) 100%)',
        }} />
        <div style={{ maxWidth: 900, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <button
            onClick={() => navigate('/')}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 8, padding: '6px 14px', color: 'rgba(255,255,255,0.85)',
              cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600,
              fontFamily: 'inherit', marginBottom: 24,
            }}
          >
            <BackIcon size={14} />
            {t.back}
          </button>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                <StatusBadge status={course.status} />
                {course.chips.map(chip => {
                  const cs = CHIP_STYLE[chip.color] ?? CHIP_STYLE.open
                  return (
                    <span
                      key={chip.label}
                      style={{
                        fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px',
                        borderRadius: 999, background: cs.bg, color: cs.color,
                      }}
                    >
                      {chip.label}
                    </span>
                  )
                })}
              </div>
              <h1 style={{
                fontFamily: 'Space Grotesk, Inter, sans-serif',
                fontSize: 'clamp(1.4rem, 4vw, 2.2rem)',
                fontWeight: 800, color: '#fff', lineHeight: 1.2, marginBottom: 10,
              }}>
                {course.titleEn}
              </h1>
              {course.titleAr && (
                <p style={{
                  fontFamily: 'Noto Kufi Arabic, Noto Sans Arabic, sans-serif',
                  fontSize: '1rem', color: 'rgba(255,255,255,0.7)', direction: 'rtl',
                  textAlign: isRTL ? 'start' : 'end', marginBottom: 6,
                }}>
                  {course.titleAr}
                </p>
              )}
              <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.9375rem', lineHeight: 1.65, marginTop: 12 }}>
                {course.descEn}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 20px 80px' }}>
        {/* Info grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: 12, marginBottom: 28,
        }}>
          {[
            { label: t.format, val: course.format },
            { label: t.level, val: course.level },
            ...(course.duration ? [{ label: t.duration, val: course.duration }] : []),
            ...(course.modules ? [{ label: t.modules, val: course.modules }] : []),
            ...(course.classroomCode ? [{ label: t.code, val: course.classroomCode }] : []),
          ].map(({ label, val }) => (
            <div
              key={label}
              className="glass-card"
              style={{ borderRadius: 10, padding: '12px 16px' }}
            >
              <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.45)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
                {label}
              </div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff' }}>{val}</div>
            </div>
          ))}
        </div>

        {/* Source */}
        {course.source && (
          <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.35)', marginBottom: 24 }}>
            Source: {course.source}
          </p>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
          {/* Primary action */}
          {course.classroomUrl ? (
            <a
              href={course.classroomUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="spark-btn"
              style={{ padding: '12px 28px', borderRadius: 10, fontSize: '0.9375rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}
            >
              {t.joinClassroom} ↗
            </a>
          ) : course.courseUrl?.startsWith('http') ? (
            <a
              href={course.courseUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="spark-btn"
              style={{ padding: '12px 28px', borderRadius: 10, fontSize: '0.9375rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}
            >
              Launch ↗
            </a>
          ) : (
            <button
              onClick={toggleEnroll}
              className="spark-btn"
              style={{ padding: '12px 28px', borderRadius: 10, fontSize: '0.9375rem', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
            >
              {isEnrolled ? '✓ Enrolled' : t.enrollCourse}
            </button>
          )}

          {/* Mark complete (only for enrolled self-paced) */}
          {(isEnrolled || course.status === 'self-paced') && !course.courseUrl?.startsWith('http') && (
            <button
              onClick={toggleComplete}
              style={{
                padding: '12px 24px', borderRadius: 10, fontSize: '0.875rem', fontWeight: 600,
                border: '1px solid rgba(255,255,255,0.15)', background: 'transparent',
                color: isCompleted ? '#22c55e' : 'rgba(255,255,255,0.65)',
                cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              {isCompleted ? '✓ Completed' : 'Mark Complete'}
            </button>
          )}

          {/* Enroll via form */}
          {course.enrollSlug && !course.classroomUrl && (
            <a
              href={`#/enroll?course=${course.enrollSlug}`}
              style={{
                padding: '12px 24px', borderRadius: 10, fontSize: '0.875rem', fontWeight: 600,
                border: '1px solid rgba(12,158,235,0.35)', background: 'transparent',
                color: '#0c9eeb', textDecoration: 'none', display: 'inline-flex', alignItems: 'center',
              }}
            >
              📝 Request Access
            </a>
          )}
        </div>

        {/* Classroom code highlight */}
        {course.classroomCode && (
          <div
            className="glass-card"
            style={{ borderRadius: 12, padding: '20px 24px', marginTop: 28, maxWidth: 420 }}
          >
            <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)', marginBottom: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Google Classroom Code
            </p>
            <p style={{ fontFamily: 'Space Grotesk, monospace', fontSize: '1.75rem', fontWeight: 800, color: '#0c9eeb', letterSpacing: '0.08em' }}>
              {course.classroomCode}
            </p>
            <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>
              Go to classroom.google.com → Join class → Enter this code
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
