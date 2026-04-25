import { useLanguage } from '@/contexts/LanguageContext'
import { useKV } from '@/lib/useKV'
import { COURSES_BY_ID } from '@/data/courses'
import { navigate } from '@/lib/utils'
import { clearAllKV } from '@/lib/useKV'
import type { UserProgress, SpaceModule } from '@/types'

const MODULE_NAMES: Record<SpaceModule, string> = {
  strategy:     'Strategy',
  partnerships: 'Partnerships',
  architecture: 'Architecture',
  culture:      'Culture',
  evaluation:   'Evaluation',
}

const MODULE_NAMES_AR: Record<SpaceModule, string> = {
  strategy:     'الاستراتيجية',
  partnerships: 'الشراكات',
  architecture: 'البنية التحتية',
  culture:      'الثقافة',
  evaluation:   'التقييم',
}

export function DashboardView() {
  const { t, isRTL } = useLanguage()
  const [progress, setProgress] = useKV<UserProgress>('progress', {
    completedCourses: [],
    enrolledCourses: [],
  })

  const enrolled = (progress.enrolledCourses ?? []).map(id => COURSES_BY_ID[id]).filter(Boolean)
  const completed = (progress.completedCourses ?? []).map(id => COURSES_BY_ID[id]).filter(Boolean)
  const diagScores = progress.diagnosticScore
  const modules: SpaceModule[] = ['strategy', 'partnerships', 'architecture', 'culture', 'evaluation']

  function handleReset() {
    clearAllKV()
    setProgress({ completedCourses: [], enrolledCourses: [] })
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--background)' }} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div style={{
        padding: '60px 20px 36px',
        background: 'linear-gradient(180deg, rgba(12,158,235,0.06) 0%, transparent 100%)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <h1 className="gradient-text" style={{ fontFamily: 'Space Grotesk, Inter, sans-serif', fontSize: 'clamp(1.5rem, 4vw, 2.2rem)', fontWeight: 800, marginBottom: 8 }}>
            {t.dashTitle}
          </h1>
          <p style={{ fontSize: '0.9375rem', color: 'rgba(255,255,255,0.5)' }}>{t.dashDesc}</p>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '36px 20px 80px' }}>
        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 32 }}>
          {[
            { icon: '📚', label: isRTL ? 'مسجّل' : t.enrolled, val: enrolled.length, color: '#0c9eeb' },
            { icon: '✅', label: isRTL ? 'مكتمل' : t.completed, val: completed.length, color: '#10b981' },
            { icon: '🔬', label: isRTL ? 'التشخيص' : 'Diagnostic', val: diagScores ? '✓' : '—', color: '#8b5cf6' },
          ].map(stat => (
            <div key={stat.label} className="glass-card" style={{ borderRadius: 12, padding: '20px 16px', textAlign: 'center' }}>
              <div style={{ fontSize: '1.75rem', marginBottom: 6 }}>{stat.icon}</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: stat.color, marginBottom: 2 }}>
                {stat.val}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Empty state */}
        {enrolled.length === 0 && completed.length === 0 && !diagScores && (
          <div className="glass-card" style={{ borderRadius: 16, padding: '48px 32px', textAlign: 'center', marginBottom: 28 }}>
            <div style={{ fontSize: '3rem', marginBottom: 12 }}>📊</div>
            <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: 20 }}>{t.noActivity}</p>
            <button
              onClick={() => navigate('/')}
              className="spark-btn"
              style={{ padding: '11px 24px', borderRadius: 10, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.875rem', fontWeight: 700 }}
            >
              {isRTL ? 'تصفح الدورات →' : 'Browse Courses →'}
            </button>
          </div>
        )}

        {/* Enrolled courses */}
        {enrolled.length > 0 && (
          <div style={{ marginBottom: 28 }}>
            <h2 style={{ fontFamily: 'Space Grotesk, Inter, sans-serif', fontSize: '1rem', fontWeight: 700, color: '#0c9eeb', marginBottom: 14 }}>
              {isRTL ? 'الدورات المسجّلة' : 'Enrolled Courses'}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {enrolled.map(course => {
                const isDone = (progress.completedCourses ?? []).includes(course.id)
                return (
                  <div
                    key={course.id}
                    className="glass-card glass-card-hover"
                    style={{ borderRadius: 12, padding: '14px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }}
                    onClick={() => navigate(`/course/${course.id}`)}
                  >
                    <span style={{ fontSize: '1.2rem' }}>{isDone ? '✅' : '📖'}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#fff', marginBottom: 2 }}>
                        {isRTL ? course.titleAr : course.titleEn}
                      </div>
                      <div style={{ fontSize: '0.73rem', color: 'rgba(255,255,255,0.4)' }}>
                        {course.level} · {course.format}
                      </div>
                    </div>
                    <span style={{
                      fontSize: '0.7rem', padding: '3px 10px', borderRadius: 999, fontWeight: 700,
                      background: isDone ? 'rgba(16,185,129,0.15)' : 'rgba(12,158,235,0.12)',
                      color: isDone ? '#34d399' : '#0c9eeb',
                    }}>
                      {isDone ? (isRTL ? 'مكتمل' : 'Done') : (isRTL ? 'جاري' : 'In Progress')}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Completed courses */}
        {completed.length > 0 && (
          <div style={{ marginBottom: 28 }}>
            <h2 style={{ fontFamily: 'Space Grotesk, Inter, sans-serif', fontSize: '1rem', fontWeight: 700, color: '#10b981', marginBottom: 14 }}>
              {isRTL ? 'الدورات المكتملة' : 'Completed Courses'}
            </h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {completed.map(course => (
                <div
                  key={course.id}
                  className="glass-card"
                  style={{ borderRadius: 10, padding: '8px 14px', cursor: 'pointer' }}
                  onClick={() => navigate(`/course/${course.id}`)}
                >
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#34d399' }}>
                    ✓ {isRTL ? course.titleAr : course.titleEn}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Diagnostic scores */}
        {diagScores && (
          <div className="glass-card" style={{ borderRadius: 16, padding: '24px', marginBottom: 28 }}>
            <h2 style={{ fontFamily: 'Space Grotesk, Inter, sans-serif', fontSize: '1rem', fontWeight: 700, color: '#8b5cf6', marginBottom: 18 }}>
              {isRTL ? 'نتائج التشخيص' : 'Diagnostic Results'}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {modules.map(mod => {
                const score = diagScores[mod] ?? 0
                return (
                  <div key={mod}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                      <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.65)', fontWeight: 600 }}>
                        {isRTL ? MODULE_NAMES_AR[mod] : MODULE_NAMES[mod]}
                      </span>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#8b5cf6' }}>{score}%</span>
                    </div>
                    <div style={{ height: 6, borderRadius: 999, background: 'rgba(255,255,255,0.08)' }}>
                      <div style={{
                        height: '100%', borderRadius: 999,
                        background: 'linear-gradient(90deg, #8b5cf6, #0c9eeb)',
                        width: `${score}%`, transition: 'width 0.6s ease',
                      }} />
                    </div>
                  </div>
                )
              })}
            </div>
            <button
              onClick={() => navigate('/diagnostic')}
              style={{
                marginTop: 16, padding: '9px 18px', borderRadius: 8, border: '1px solid rgba(139,92,246,0.3)',
                background: 'transparent', color: '#8b5cf6', cursor: 'pointer',
                fontFamily: 'inherit', fontSize: '0.8rem', fontWeight: 600,
              }}
            >
              {isRTL ? 'أعد التشخيص' : 'Retake Diagnostic'}
            </button>
          </div>
        )}

        {/* Quick actions */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          <button
            onClick={() => navigate('/')}
            className="spark-btn"
            style={{ padding: '11px 22px', borderRadius: 10, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.875rem', fontWeight: 700 }}
          >
            {isRTL ? 'تصفح الدورات' : 'Browse Courses'}
          </button>
          <button
            onClick={() => navigate('/enroll')}
            style={{
              padding: '11px 22px', borderRadius: 10,
              border: '1px solid rgba(255,255,255,0.15)', background: 'transparent',
              color: 'rgba(255,255,255,0.65)', cursor: 'pointer',
              fontFamily: 'inherit', fontSize: '0.875rem', fontWeight: 600,
            }}
          >
            {t.enroll}
          </button>
          {(enrolled.length > 0 || completed.length > 0 || diagScores) && (
            <button
              onClick={handleReset}
              style={{
                padding: '11px 22px', borderRadius: 10,
                border: '1px solid rgba(239,68,68,0.25)', background: 'transparent',
                color: 'rgba(239,68,68,0.7)', cursor: 'pointer',
                fontFamily: 'inherit', fontSize: '0.875rem', fontWeight: 600,
              }}
            >
              {isRTL ? 'إعادة الضبط' : 'Reset Progress'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
