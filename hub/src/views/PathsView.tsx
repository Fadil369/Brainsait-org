import { useLanguage } from '@/contexts/LanguageContext'
import { LEARNING_PATHS } from '@/data/learningPaths'
import { COURSES_BY_ID } from '@/data/courses'
import { navigate } from '@/lib/utils'

export function PathsView() {
  const { t, isRTL } = useLanguage()

  return (
    <div style={{ minHeight: '100vh', background: 'var(--background)' }} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Hero */}
      <div style={{
        padding: '72px 20px 48px',
        background: 'linear-gradient(180deg, rgba(12,158,235,0.06) 0%, transparent 100%)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: 12 }}>🗺️</div>
          <h1 className="gradient-text" style={{ fontFamily: 'Space Grotesk, Inter, sans-serif', fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, marginBottom: 12 }}>
            {t.pathsTitle}
          </h1>
          <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.6)', maxWidth: 580, margin: '0 auto', lineHeight: 1.7 }}>
            {t.pathsDesc}
          </p>
        </div>
      </div>

      {/* Paths grid */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 20px 80px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: 20,
        }}>
          {LEARNING_PATHS.map((path, i) => {
            const pathCourses = path.courseIds.map(id => COURSES_BY_ID[id]).filter(Boolean)

            return (
              <div
                key={path.nameEn}
                className="glass-card glass-card-hover fade-in-up"
                style={{ borderRadius: 16, padding: '24px', animationDelay: `${i * 60}ms` }}
              >
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 16 }}>
                  <div style={{
                    width: 52, height: 52, borderRadius: 12, flexShrink: 0,
                    background: 'rgba(12,158,235,0.12)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.6rem',
                  }}>
                    {path.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ fontFamily: 'Space Grotesk, Inter, sans-serif', fontSize: '1rem', fontWeight: 800, color: '#fff', marginBottom: 2 }}>
                      {isRTL ? path.nameAr : path.nameEn}
                    </h3>
                    <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)' }}>
                      {isRTL ? path.nameEn : path.nameAr}
                    </p>
                  </div>
                </div>

                {/* Stats row */}
                <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0c9eeb' }}>{path.courses}</div>
                    <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.4)' }}>{isRTL ? 'دورات' : 'Courses'}</div>
                  </div>
                  <div style={{ width: 1, background: 'rgba(255,255,255,0.08)' }} />
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#10b981' }}>{path.weeks}</div>
                    <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.4)' }}>{isRTL ? 'أسبوع' : 'Weeks'}</div>
                  </div>
                  <div style={{ flex: 1 }} />
                </div>

                {/* Flow */}
                <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', marginBottom: 16, fontFamily: 'monospace' }}>
                  {path.desc}
                </p>

                {/* Course list */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 20 }}>
                  {pathCourses.map((course, ci) => (
                    <div
                      key={course.id}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        padding: '7px 10px', borderRadius: 8,
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.06)',
                      }}
                    >
                      <span style={{
                        width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                        background: 'rgba(12,158,235,0.15)', color: '#0c9eeb',
                        fontSize: '0.65rem', fontWeight: 800,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {ci + 1}
                      </span>
                      <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.7)', flex: 1 }}>
                        {isRTL ? course.titleAr : course.titleEn}
                      </span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <button
                  onClick={() => navigate(`/course/${pathCourses[0]?.id ?? ''}`)}
                  className="spark-btn"
                  style={{ width: '100%', padding: '11px 0', borderRadius: 10, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.875rem', fontWeight: 700 }}
                >
                  {isRTL ? 'ابدأ المسار →' : 'Start Path →'}
                </button>
              </div>
            )
          })}
        </div>

        {/* Bottom CTA */}
        <div className="glass-card" style={{ borderRadius: 16, padding: '32px', marginTop: 40, textAlign: 'center' }}>
          <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: 16 }}>
            {isRTL ? 'غير متأكد من المسار المناسب لك؟' : 'Not sure which path is right for you?'}
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/diagnostic')}
              className="spark-btn"
              style={{ padding: '11px 24px', borderRadius: 10, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.875rem', fontWeight: 700 }}
            >
              {isRTL ? 'التشخيص الابتكاري →' : 'Take the Diagnostic →'}
            </button>
            <button
              onClick={() => navigate('/')}
              style={{
                padding: '11px 24px', borderRadius: 10,
                border: '1px solid rgba(255,255,255,0.15)', background: 'transparent',
                color: 'rgba(255,255,255,0.65)', cursor: 'pointer',
                fontFamily: 'inherit', fontSize: '0.875rem', fontWeight: 600,
              }}
            >
              {t.courses}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
