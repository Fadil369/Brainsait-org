import { useState, useEffect } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { navigate } from '@/lib/utils'
import { List, X } from '@phosphor-icons/react'

interface NavProps {
  currentView: string
}

export function Nav({ currentView }: NavProps) {
  const { t, language, setLanguage, isRTL } = useLanguage()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    setOpen(false)
  }, [currentView])

  const links = [
    { key: 'catalog', label: t.courses, hash: '#/' },
    { key: 'paths', label: t.paths, hash: '#/paths' },
    { key: 'diagnostic', label: t.diagnostic, hash: '#/diagnostic' },
    { key: 'quiz', label: t.quiz, hash: '#/quiz' },
    { key: 'dashboard', label: t.dashboard, hash: '#/dashboard' },
  ]

  return (
    <nav
      style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(5, 8, 16, 0.92)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        backdropFilter: 'blur(16px)',
      }}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div style={{ maxWidth: 1320, margin: '0 auto', padding: '0 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60 }}>
          {/* Logo */}
          <a
            href="#/"
            style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}
          >
            <span style={{ fontSize: '1.35rem' }}>🏥</span>
            <div>
              <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#fff', fontFamily: 'Space Grotesk, Inter, sans-serif' }}>
                BrainSAIT
              </span>
              <span style={{ fontSize: '0.75rem', color: '#0c9eeb', marginLeft: isRTL ? 0 : 6, marginRight: isRTL ? 6 : 0, display: 'inline-block' }}>
                {isRTL ? 'التدريب' : 'Training'}
              </span>
            </div>
          </a>

          {/* Desktop links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }} className="hidden-mobile">
            {links.map(link => (
              <a
                key={link.key}
                href={link.hash}
                style={{
                  padding: '6px 12px',
                  borderRadius: 8,
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  textDecoration: 'none',
                  color: currentView === link.key ? '#0c9eeb' : 'rgba(255,255,255,0.72)',
                  background: currentView === link.key ? 'rgba(12,158,235,0.12)' : 'transparent',
                  transition: 'all 0.15s',
                }}
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
              style={{
                padding: '5px 12px',
                borderRadius: 8,
                border: '1px solid rgba(255,255,255,0.16)',
                background: 'transparent',
                color: 'rgba(255,255,255,0.72)',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              {t.language}
            </button>
            <a
              href="#/enroll"
              style={{
                padding: '6px 14px',
                borderRadius: 8,
                background: 'linear-gradient(135deg, #0c9eeb, #10b981)',
                color: '#fff',
                fontSize: '0.75rem',
                fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              {t.enroll}
            </a>
            {/* Mobile menu toggle */}
            <button
              onClick={() => setOpen(o => !o)}
              style={{
                display: 'none',
                background: 'transparent',
                border: 'none',
                color: '#fff',
                cursor: 'pointer',
                padding: 4,
              }}
              className="show-mobile"
            >
              {open ? <X size={22} /> : <List size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.08)',
          padding: '12px 20px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
        }}>
          {links.map(link => (
            <a
              key={link.key}
              href={link.hash}
              onClick={() => setOpen(false)}
              style={{
                padding: '10px 12px',
                borderRadius: 8,
                fontSize: '0.9rem',
                fontWeight: 600,
                textDecoration: 'none',
                color: currentView === link.key ? '#0c9eeb' : 'rgba(255,255,255,0.82)',
                background: currentView === link.key ? 'rgba(12,158,235,0.12)' : 'transparent',
              }}
            >
              {link.label}
            </a>
          ))}
          <a
            href="#/enroll"
            onClick={() => setOpen(false)}
            style={{
              marginTop: 8, padding: '10px 12px', borderRadius: 8,
              background: 'linear-gradient(135deg, #0c9eeb, #10b981)',
              color: '#fff', fontSize: '0.875rem', fontWeight: 700, textDecoration: 'none',
              textAlign: 'center',
            }}
          >
            {t.enroll}
          </a>
        </div>
      )}

      <style>{`
        @media (min-width: 768px) {
          .hidden-mobile { display: flex !important; }
          .show-mobile { display: none !important; }
        }
        @media (max-width: 767px) {
          .hidden-mobile { display: none !important; }
          .show-mobile { display: block !important; }
        }
      `}</style>
    </nav>
  )
}

// navigate helper exposed for use in views
export { navigate }
