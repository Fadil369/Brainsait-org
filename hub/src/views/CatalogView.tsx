import { useState } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { COURSES, FILTER_TAGS, filterCourses } from '@/data/courses'
import { LEARNING_PATHS } from '@/data/learningPaths'
import type { Course, FilterTag, Chip } from '@/types'

const STRIPE: Record<string, string> = {
  green: 'linear-gradient(90deg,#2E7D32,#43A047)',
  blue: 'linear-gradient(90deg,#0ea5e9,#6366f1)',
  cyan: 'linear-gradient(90deg,#06b6d4,#0ea5e9)',
  orange: 'linear-gradient(90deg,#f59e0b,#ef4444)',
  red: 'linear-gradient(90deg,#ef4444,#f97316)',
  gold: 'linear-gradient(90deg,#d4a574,#f59e0b)',
  purple: 'linear-gradient(90deg,#8b5cf6,#a855f7)',
  teal: 'linear-gradient(90deg,#14b8a6,#06b6d4)',
  pink: 'linear-gradient(90deg,#ec4899,#f43f5e)',
  spark: 'linear-gradient(90deg,#0c9eeb,#10b981)',
}

const CHIP_CLR: Record<string, { bg: string; color: string }> = {
  green: { bg: 'rgba(46,125,50,.18)', color: '#b9f6ca' },
  blue: { bg: 'rgba(14,165,233,.18)', color: '#67e8f9' },
  purple: { bg: 'rgba(139,92,246,.18)', color: '#c4b5fd' },
  orange: { bg: 'rgba(245,158,11,.18)', color: '#fcd34d' },
  cyan: { bg: 'rgba(6,182,212,.18)', color: '#67e8f9' },
  pink: { bg: 'rgba(236,72,153,.18)', color: '#f9a8d4' },
  red: { bg: 'rgba(239,68,68,.18)', color: '#fca5a5' },
  teal: { bg: 'rgba(20,184,166,.18)', color: '#5eead4' },
  open: { bg: 'rgba(255,255,255,.08)', color: '#fff' },
  claude: { bg: 'rgba(204,120,50,.18)', color: '#f5c28a' },
  gold: { bg: 'rgba(212,165,116,.18)', color: '#f5c28a' },
  spark: { bg: 'rgba(12,158,235,.18)', color: '#67e8f9' },
}

function ChipBadge({ chip }: { chip: Chip }) {
  const clr = CHIP_CLR[chip.color] ?? { bg: 'rgba(255,255,255,.08)', color: '#fff' }
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', height: 22, padding: '0 9px',
      borderRadius: 11, fontSize: '.625rem', fontWeight: 600,
      background: clr.bg, color: clr.color,
    }}>
      {chip.label}
    </span>
  )
}

function MetaBox({ label, value }: { label: string; value: string }) {
  return (
    <div style={{
      padding: '7px 9px', borderRadius: 7,
      background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.04)',
    }}>
      <div style={{ fontSize: '.5625rem', color: 'rgba(255,255,255,.45)', textTransform: 'uppercase', letterSpacing: '.8px' }}>{label}</div>
      <div style={{ fontSize: '.6875rem', fontWeight: 700, color: '#fff', marginTop: 1 }}>{value}</div>
    </div>
  )
}

function CourseCard({ course, t }: { course: Course; t: ReturnType<typeof useLanguage>['t'] }) {
  const isActive = course.status === 'active'
  const isSpark = course.section === 'spark'

  if (isSpark) {
    return (
      <div style={{
        background: 'linear-gradient(135deg,rgba(12,158,235,.12),rgba(16,185,129,.12))',
        border: '1px solid rgba(12,158,235,.3)', borderRadius: 14, overflow: 'hidden',
        display: 'flex', flexDirection: 'column', transition: 'transform .2s, box-shadow .2s',
      }}
        className="glass-card-hover"
      >
        <div style={{ height: 4, background: STRIPE.spark }} />
        <div style={{ padding: 20, flex: 1, display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '.6875rem', fontWeight: 700, color: '#0c9eeb', marginBottom: 8, display: 'block' }}>
            ⚡ BrainSAIT Original
          </span>
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 10 }}>
            {course.chips.map((c, i) => <ChipBadge key={i} chip={c} />)}
          </div>
          <div style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: 4, lineHeight: 1.25 }}>{course.titleEn}</div>
          <div style={{ fontSize: '.78rem', fontWeight: 600, color: '#0c9eeb', marginBottom: 8, direction: 'rtl' }}>{course.titleAr}</div>
          <div style={{ fontSize: '.75rem', color: 'rgba(255,255,255,.72)', lineHeight: 1.55, flex: 1, marginBottom: 14 }}>{course.descEn}</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 16 }}>
            <MetaBox label={t.format} value={course.format} />
            <MetaBox label={t.level} value={course.level} />
          </div>
          <a
            href={course.courseUrl ?? '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="spark-btn"
            style={{ display: 'flex', justifyContent: 'center', padding: '8px 16px', borderRadius: 8, textDecoration: 'none', fontSize: '.8125rem' }}
          >
            Launch Spark ↗
          </a>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)',
      borderRadius: 14, overflow: 'hidden', display: 'flex', flexDirection: 'column',
      transition: 'transform .2s, box-shadow .2s',
    }}
      className="glass-card-hover"
    >
      <div style={{ height: 4, background: STRIPE[course.stripe] ?? STRIPE.blue }} />
      <div style={{ padding: 20, flex: 1, display: 'flex', flexDirection: 'column' }}>
        {course.source && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', padding: '3px 8px', borderRadius: 6,
            fontSize: '.5625rem', fontWeight: 700, marginBottom: 8,
            background: course.section === 'brainsait' ? 'rgba(46,125,50,.15)' : 'rgba(204,120,50,.12)',
            color: course.section === 'brainsait' ? '#b9f6ca' : '#f5c28a',
          }}>
            {course.source}
          </span>
        )}
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 10 }}>
          {course.chips.map((c, i) => <ChipBadge key={i} chip={c} />)}
        </div>
        <div style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: 4, lineHeight: 1.25 }}>{course.titleEn}</div>
        <div style={{ fontSize: '.78rem', fontWeight: 600, color: '#0c9eeb', marginBottom: 8, direction: 'rtl' }}>{course.titleAr}</div>
        <div style={{ fontSize: '.75rem', color: 'rgba(255,255,255,.72)', lineHeight: 1.55, flex: 1, marginBottom: 14 }}>{course.descEn}</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 16 }}>
          <MetaBox label={t.format} value={course.format} />
          <MetaBox label={t.level} value={course.level} />
          {course.duration && <MetaBox label={t.duration} value={course.duration} />}
          {course.modules && <MetaBox label={t.modules} value={course.modules} />}
          {course.classroomCode && <MetaBox label={t.code} value={course.classroomCode} />}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <a
            href={`#/course/${course.id}`}
            style={{
              flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center',
              padding: '8px 12px', borderRadius: 7, fontSize: '.75rem', fontWeight: 600,
              background: '#fff', color: '#050810', textDecoration: 'none',
              transition: 'background .2s',
            }}
          >
            {t.viewCourse}
          </a>
          {isActive && course.classroomUrl && (
            <a
              href={course.classroomUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex', justifyContent: 'center', alignItems: 'center',
                padding: '8px 12px', borderRadius: 7, fontSize: '.75rem', fontWeight: 600,
                background: 'transparent', color: '#fff',
                border: '1px solid rgba(255,255,255,.24)', textDecoration: 'none',
                transition: 'border-color .2s',
              }}
            >
              {t.joinClassroom}
            </a>
          )}
          {!isActive && (
            <a
              href={`#/enroll?course=${course.id}`}
              style={{
                display: 'flex', justifyContent: 'center', alignItems: 'center',
                padding: '8px 12px', borderRadius: 7, fontSize: '.75rem', fontWeight: 600,
                background: '#2E7D32', color: '#fff', textDecoration: 'none',
              }}
            >
              {t.enrollCourse}
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

function SectionHeader({ icon, en, ar, desc }: { icon: string; en: string; ar: string; desc: string }) {
  return (
    <div style={{ padding: '40px 0 20px', borderTop: '1px solid rgba(255,255,255,.08)', marginTop: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
        <span style={{ fontSize: '1.5rem' }}>{icon}</span>
        <div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>{en}</div>
          <div style={{ fontSize: '.875rem', color: '#0c9eeb', direction: 'rtl' }}>{ar}</div>
        </div>
      </div>
      <p style={{ fontSize: '.8125rem', color: 'rgba(255,255,255,.72)', maxWidth: 600 }}>{desc}</p>
    </div>
  )
}

function FeaturedBanner({ course, t }: { course: Course; t: ReturnType<typeof useLanguage>['t'] }) {
  return (
    <div style={{
      background: 'linear-gradient(135deg,rgba(46,125,50,.12),rgba(14,165,233,.12))',
      border: '1px solid rgba(255,255,255,.08)',
      borderRadius: 14, padding: 24, marginBottom: 16,
      display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap',
    }}>
      <div style={{ fontSize: '2.5rem' }}>{course.section === 'spark' ? '⚡' : '🏥'}</div>
      <div style={{ flex: 1, minWidth: 240 }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 800, margin: 0, marginBottom: 4 }}>{course.titleEn}</h3>
        <p style={{ fontSize: '.875rem', color: '#0c9eeb', direction: 'rtl', margin: '0 0 6px' }}>{course.titleAr}</p>
        <p style={{ fontSize: '.8125rem', color: 'rgba(255,255,255,.72)', margin: 0 }}>{course.descEn}</p>
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <a
          href={`#/course/${course.id}`}
          style={{
            padding: '8px 16px', borderRadius: 7, fontSize: '.75rem', fontWeight: 600,
            background: '#fff', color: '#050810', textDecoration: 'none',
          }}
        >
          {t.viewCourse}
        </a>
        {course.classroomUrl && (
          <a
            href={course.classroomUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: '8px 16px', borderRadius: 7, fontSize: '.75rem', fontWeight: 600,
              background: '#2E7D32', color: '#fff', textDecoration: 'none',
            }}
          >
            {t.joinClassroom}
          </a>
        )}
        {course.section === 'spark' && course.courseUrl && (
          <a
            href={course.courseUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="spark-btn"
            style={{
              padding: '8px 16px', borderRadius: 7, fontSize: '.75rem',
              textDecoration: 'none', display: 'inline-flex', alignItems: 'center',
            }}
          >
            Launch App ↗
          </a>
        )}
      </div>
    </div>
  )
}

const CONTAINER = { maxWidth: 1320, margin: '0 auto', padding: '0 24px' }
const GRID: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
  gap: 20,
  paddingBottom: 24,
}

export function CatalogView() {
  const { t, language } = useLanguage()
  const [activeFilter, setActiveFilter] = useState<FilterTag>('all')

  const activeCourses = COURSES.filter(c => c.status === 'active' && c.section !== 'spark')
  const sparkCourse = COURSES.find(c => c.section === 'spark')!

  const brainsaitCourses = COURSES.filter(c => c.section === 'brainsait')
  const claudeCourses = COURSES.filter(c => c.section === 'claude')
  const eduCourses = COURSES.filter(c => c.section === 'edu')

  const filtered = filterCourses(COURSES.filter(c => c.section !== 'spark'), activeFilter)
  const isFiltered = activeFilter !== 'all'

  return (
    <div>
      {/* Hero */}
      <header style={{
        padding: '64px 0 40px',
        background: 'linear-gradient(135deg,#050810 0%,#0b1220 55%,#16112b 100%)',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: -80, left: -60, width: 280, height: 280, borderRadius: '50%',
          background: 'rgba(6,182,212,.14)', filter: 'blur(24px)',
        }} />
        <div style={{
          position: 'absolute', bottom: -100, right: -40, width: 340, height: 340, borderRadius: '50%',
          background: 'rgba(139,92,246,.12)', filter: 'blur(28px)',
        }} />
        <div style={{ ...CONTAINER, position: 'relative' }}>
          <h1 style={{ fontSize: 'clamp(1.75rem,4vw,2.75rem)', fontWeight: 800, lineHeight: 1.1, margin: '0 0 6px' }}>
            {t.heroTitle}
          </h1>
          <p style={{ fontSize: 'clamp(1rem,2.5vw,1.25rem)', fontWeight: 600, color: '#0c9eeb', direction: 'rtl', margin: '0 0 12px' }}>
            {language === 'en' ? 'مركز التدريب الموحد' : t.heroTitle}
          </p>
          <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,.72)', maxWidth: 720, lineHeight: 1.6, margin: '0 0 32px' }}>
            {t.heroSubtitle}
          </p>
          {/* Stats */}
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 24 }}>
            {[
              { val: '20', lbl: t.statCourses },
              { val: 'AR/EN', lbl: t.statBilingual },
              { val: '6', lbl: t.statPaths },
              { val: '2', lbl: t.statCohorts },
              { val: '2030', lbl: t.statVision },
            ].map(s => (
              <div key={s.val} style={{
                textAlign: 'center', padding: '12px 20px', borderRadius: 12,
                background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.08)',
              }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#67e8f9' }}>{s.val}</div>
                <div style={{ fontSize: '.625rem', color: 'rgba(255,255,255,.55)', textTransform: 'uppercase', letterSpacing: 1, marginTop: 2 }}>{s.lbl}</div>
              </div>
            ))}
          </div>
          {/* Quick buttons */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <a href="#featured" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 22px', borderRadius: 8, fontSize: '.8125rem', fontWeight: 600, textDecoration: 'none', background: '#fff', color: '#050810' }}>{t.liveCourses}</a>
            <a href="#paths" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 22px', borderRadius: 8, fontSize: '.8125rem', fontWeight: 600, textDecoration: 'none', background: '#2E7D32', color: '#fff' }}>{t.learningPaths}</a>
            <a href="#/enroll" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 22px', borderRadius: 8, fontSize: '.8125rem', fontWeight: 600, textDecoration: 'none', border: '1px solid rgba(255,255,255,.24)', color: '#fff' }}>{t.enrollNow}</a>
            <a href="#/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 22px', borderRadius: 8, fontSize: '.8125rem', fontWeight: 600, textDecoration: 'none', border: '1px solid rgba(255,255,255,.24)', color: '#fff' }}>{t.myDashboard}</a>
          </div>
        </div>
      </header>

      {/* Featured live banners */}
      <section id="featured" style={{ padding: '32px 0 0' }}>
        <div style={CONTAINER}>
          {activeCourses.map(c => <FeaturedBanner key={c.id} course={c} t={t} />)}
          <FeaturedBanner course={sparkCourse} t={t} />
        </div>
      </section>

      {/* Filter bar */}
      <div style={{
        position: 'sticky', top: 60, zIndex: 40,
        background: 'rgba(5,8,16,.95)',
        borderBottom: '1px solid rgba(255,255,255,.08)',
        backdropFilter: 'blur(12px)',
      }}>
        <div style={{ ...CONTAINER }}>
          <div style={{ display: 'flex', gap: 6, padding: '14px 0', flexWrap: 'wrap', overflowX: 'auto' }}>
            {FILTER_TAGS.map(ft => (
              <button
                key={ft.key}
                onClick={() => setActiveFilter(ft.key)}
                style={{
                  padding: '7px 14px', borderRadius: 18,
                  border: '1px solid ' + (activeFilter === ft.key ? '#fff' : 'rgba(255,255,255,.12)'),
                  background: activeFilter === ft.key ? '#fff' : 'transparent',
                  color: activeFilter === ft.key ? '#050810' : 'rgba(255,255,255,.55)',
                  fontSize: '.75rem', fontWeight: 600, cursor: 'pointer',
                  fontFamily: 'inherit', whiteSpace: 'nowrap', transition: 'all .15s',
                }}
              >
                {language === 'en' ? ft.label : ft.labelAr}
                <span style={{ fontSize: '.625rem', opacity: .6, marginLeft: 4 }}>{ft.count}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Course content */}
      <div style={CONTAINER}>
        {isFiltered ? (
          <>
            <div style={{ padding: '24px 0 8px' }}>
              <p style={{ fontSize: '.875rem', color: 'rgba(255,255,255,.55)' }}>
                {filtered.length} {language === 'en' ? 'courses found' : 'دورة'}
              </p>
            </div>
            <div style={GRID}>
              {filtered.map(c => <CourseCard key={c.id} course={c} t={t} />)}
            </div>
          </>
        ) : (
          <>
            <SectionHeader icon="🏥" en={t.sectionBrainsait} ar={t.sectionBrainsaitAr} desc={t.sectionBrainsaitDesc} />
            <div style={GRID}>{brainsaitCourses.map(c => <CourseCard key={c.id} course={c} t={t} />)}</div>

            <SectionHeader icon="🤖" en={t.sectionClaude} ar={t.sectionClaudeAr} desc={t.sectionClaudeDesc} />
            <div style={GRID}>{claudeCourses.map(c => <CourseCard key={c.id} course={c} t={t} />)}</div>

            <SectionHeader icon="🎓" en={t.sectionEdu} ar={t.sectionEduAr} desc={t.sectionEduDesc} />
            <div style={GRID}>{eduCourses.map(c => <CourseCard key={c.id} course={c} t={t} />)}</div>
          </>
        )}
      </div>

      {/* Learning Paths */}
      <section id="paths" style={{ padding: '40px 0', borderTop: '1px solid rgba(255,255,255,.08)' }}>
        <div style={CONTAINER}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <span style={{ fontSize: '1.5rem' }}>🗺️</span>
            <div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>{t.pathsTitle}</div>
              <div style={{ fontSize: '.875rem', color: '#0c9eeb', direction: 'rtl' }}>
                {language === 'en' ? 'المسارات التعليمية' : t.pathsTitle}
              </div>
            </div>
          </div>
          <p style={{ fontSize: '.8125rem', color: 'rgba(255,255,255,.72)', marginBottom: 24 }}>{t.pathsDesc}</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 16 }}>
            {LEARNING_PATHS.map(path => (
              <div key={path.nameEn} style={{
                padding: 24, borderRadius: 14,
                background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)',
                transition: 'transform .2s',
              }}
                className="glass-card-hover"
              >
                <div style={{ fontSize: '1.75rem', marginBottom: 12 }}>{path.icon}</div>
                <div style={{ fontSize: '.9rem', fontWeight: 700, marginBottom: 2 }}>{path.nameEn}</div>
                <div style={{ fontSize: '.72rem', color: '#0c9eeb', marginBottom: 8, direction: 'rtl' }}>{path.nameAr}</div>
                <div style={{ fontSize: '.72rem', color: 'rgba(255,255,255,.72)', marginBottom: 12, lineHeight: 1.5 }}>{path.desc}</div>
                <div style={{ fontSize: '.6875rem', color: 'rgba(255,255,255,.45)' }}>
                  <strong style={{ color: '#fff' }}>{path.courses} courses</strong> · {path.weeks} weeks
                </div>
                <a
                  href="#/paths"
                  style={{
                    display: 'block', marginTop: 14, padding: '7px 12px', borderRadius: 7,
                    background: 'rgba(12,158,235,.12)', border: '1px solid rgba(12,158,235,.2)',
                    color: '#0c9eeb', fontSize: '.6875rem', fontWeight: 600,
                    textDecoration: 'none', textAlign: 'center',
                  }}
                >
                  View Path →
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '48px 0', borderTop: '1px solid rgba(255,255,255,.08)' }}>
        <div style={CONTAINER}>
          <div style={{
            background: 'linear-gradient(135deg,rgba(46,125,50,.16),rgba(14,165,233,.16))',
            border: '1px solid rgba(255,255,255,.08)', borderRadius: 16,
            padding: '40px 28px', maxWidth: 680, margin: '0 auto', textAlign: 'center',
          }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 6px' }}>{t.ctaTitle}</h2>
            <p style={{ color: '#0c9eeb', direction: 'rtl', margin: '0 0 10px', fontSize: '1rem' }}>{t.ctaSubtitle}</p>
            <p style={{ color: 'rgba(255,255,255,.72)', margin: '0 0 20px' }}>{t.ctaDesc}</p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href="#/enroll" style={{ padding: '10px 22px', borderRadius: 8, background: '#fff', color: '#050810', fontSize: '.875rem', fontWeight: 600, textDecoration: 'none' }}>📝 {t.enrollNow}</a>
              <a href="#/dashboard" style={{ padding: '10px 22px', borderRadius: 8, background: '#2E7D32', color: '#fff', fontSize: '.875rem', fontWeight: 600, textDecoration: 'none' }}>📊 {t.myDashboard}</a>
              <a href="https://spark.brainsait.org" target="_blank" rel="noopener noreferrer" className="spark-btn" style={{ padding: '10px 22px', borderRadius: 8, fontSize: '.875rem', textDecoration: 'none' }}>⚡ Try Spark</a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,.08)', padding: '24px 0' }}>
        <div style={{ ...CONTAINER, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ fontSize: '.75rem', color: 'rgba(255,255,255,.45)' }}>© 2026 BrainSAIT LTD · Riyadh, Saudi Arabia</div>
          <div style={{ display: 'flex', gap: 14 }}>
            {['#/', '#/paths', '#/diagnostic', '#/quiz', '#/enroll'].map((href, i) => (
              <a key={href} href={href} style={{ fontSize: '.6875rem', color: 'rgba(255,255,255,.45)', textDecoration: 'none' }}>
                {['Courses', 'Paths', 'Diagnostic', 'Quiz', 'Enroll'][i]}
              </a>
            ))}
          </div>
        </div>
      </footer>

      <style>{`
        @media (max-width: 600px) {
          section > div > div[style*="grid-template-columns"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
