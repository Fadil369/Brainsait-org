import { useState, useEffect } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { COURSES } from '@/data/courses'
import { navigate } from '@/lib/utils'

export function EnrollView() {
  const { t, isRTL } = useLanguage()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [course, setCourse] = useState('')
  const [message, setMessage] = useState('')
  const [submitted, setSubmitted] = useState(false)

  // Pre-select course from URL param (?course=slug)
  useEffect(() => {
    const param = new URLSearchParams(window.location.hash.split('?')[1] ?? '').get('course')
    if (param) setCourse(param)
  }, [])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const selectedCourse = COURSES.find(c => c.enrollSlug === course || c.id === course)
    const subject = encodeURIComponent(`Enrollment Request: ${selectedCourse?.titleEn ?? course}`)
    const body = encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\nCourse: ${selectedCourse?.titleEn ?? course}\n\n${message}`
    )
    window.location.href = `mailto:training@brainsait.org?subject=${subject}&body=${body}`
    setSubmitted(true)
  }

  const enrollableCourses = COURSES.filter(c => c.enrollSlug || c.classroomUrl)

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '12px 16px', borderRadius: 10,
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.12)',
    color: '#fff', fontSize: '0.9rem', fontFamily: 'inherit',
    outline: 'none',
    transition: 'border-color 0.15s',
  }
  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '0.78rem', fontWeight: 700,
    color: 'rgba(255,255,255,0.5)', marginBottom: 6,
    textTransform: 'uppercase', letterSpacing: '0.06em',
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--background)' }} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div style={{
        padding: '60px 20px 36px',
        background: 'linear-gradient(180deg, rgba(12,158,235,0.06) 0%, transparent 100%)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <h1 className="gradient-text" style={{ fontFamily: 'Space Grotesk, Inter, sans-serif', fontSize: 'clamp(1.5rem, 4vw, 2.2rem)', fontWeight: 800, marginBottom: 8 }}>
            {t.enrollTitle}
          </h1>
          <p style={{ fontSize: '0.9375rem', color: 'rgba(255,255,255,0.5)' }}>{t.enrollDesc}</p>
        </div>
      </div>

      <div style={{ maxWidth: 700, margin: '0 auto', padding: '40px 20px 80px' }}>
        {submitted ? (
          // Success state
          <div className="glass-card fade-in-up" style={{ borderRadius: 20, padding: '56px 36px', textAlign: 'center' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: 16 }}>🎉</div>
            <h2 style={{ fontFamily: 'Space Grotesk, Inter, sans-serif', fontSize: '1.5rem', fontWeight: 800, color: '#fff', marginBottom: 10 }}>
              {isRTL ? 'تم الإرسال!' : 'Request Sent!'}
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, marginBottom: 32 }}>
              {isRTL
                ? 'شكراً! سيفتح تطبيق البريد الإلكتروني لإكمال الإرسال. سنرد عليك خلال 24 ساعة.'
                : 'Your email client should have opened to complete the request. We\'ll get back to you within 24 hours.'}
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={() => { setSubmitted(false); setName(''); setEmail(''); setMessage('') }}
                style={{
                  padding: '11px 22px', borderRadius: 10,
                  border: '1px solid rgba(255,255,255,0.15)', background: 'transparent',
                  color: 'rgba(255,255,255,0.65)', cursor: 'pointer',
                  fontFamily: 'inherit', fontSize: '0.875rem', fontWeight: 600,
                }}
              >
                {isRTL ? 'طلب آخر' : 'Another Request'}
              </button>
              <button
                onClick={() => navigate('/')}
                className="spark-btn"
                style={{ padding: '11px 22px', borderRadius: 10, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.875rem', fontWeight: 700 }}
              >
                {isRTL ? 'تصفح الدورات' : 'Browse Courses'}
              </button>
            </div>
          </div>
        ) : (
          // Form
          <div className="glass-card fade-in-up" style={{ borderRadius: 20, padding: '36px 32px' }}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Name */}
              <div>
                <label style={labelStyle}>{t.yourName} *</label>
                <input
                  required
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder={isRTL ? 'اسمك الكامل' : 'Your full name'}
                  style={inputStyle}
                />
              </div>

              {/* Email */}
              <div>
                <label style={labelStyle}>{t.yourEmail} *</label>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder={isRTL ? 'your@email.com' : 'your@email.com'}
                  style={{ ...inputStyle, direction: 'ltr' }}
                />
              </div>

              {/* Course select */}
              <div>
                <label style={labelStyle}>{t.selectCourse} *</label>
                <select
                  required
                  value={course}
                  onChange={e => setCourse(e.target.value)}
                  style={{
                    ...inputStyle,
                    cursor: 'pointer',
                    backgroundImage: 'none',
                    appearance: 'auto',
                  }}
                >
                  <option value="" style={{ background: '#050810' }}>
                    {isRTL ? '— اختر دورة —' : '— Select a course —'}
                  </option>
                  {enrollableCourses.map(c => (
                    <option key={c.id} value={c.enrollSlug ?? c.id} style={{ background: '#050810' }}>
                      {isRTL ? c.titleAr : c.titleEn}
                    </option>
                  ))}
                </select>
              </div>

              {/* Message */}
              <div>
                <label style={labelStyle}>{t.message}</label>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder={isRTL ? 'أي معلومات إضافية...' : 'Any additional info or questions…'}
                  rows={4}
                  style={{ ...inputStyle, resize: 'vertical', minHeight: 100 }}
                />
              </div>

              {/* Note */}
              <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.35)', lineHeight: 1.6, margin: '-8px 0' }}>
                {isRTL
                  ? 'سيفتح تطبيق البريد الإلكتروني لإرسال طلبك إلى training@brainsait.org'
                  : 'This will open your email client to send to training@brainsait.org'}
              </p>

              {/* Submit */}
              <button
                type="submit"
                className="spark-btn"
                style={{ width: '100%', padding: '14px 0', borderRadius: 12, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '1rem', fontWeight: 700 }}
              >
                {t.send} →
              </button>
            </form>
          </div>
        )}

        {/* Alternative contact */}
        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.3)' }}>
            {isRTL ? 'أو تواصل مباشرة:' : 'Or contact directly:'}{' '}
            <a href="mailto:training@brainsait.org" style={{ color: '#0c9eeb', textDecoration: 'none' }}>
              training@brainsait.org
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
