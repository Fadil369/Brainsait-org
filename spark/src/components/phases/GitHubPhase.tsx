// Phase 6: GitHub Integration
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, GithubLogo, Check, ArrowSquareOut, Rocket } from '@phosphor-icons/react'
import { useLanguage } from '@/contexts/LanguageContext'
import type { GitHubRepo, GeneratedCode, Brand, Journey } from '@/types'

interface Props {
  initial?: GitHubRepo
  code?: GeneratedCode
  brand?: Brand
  journey: Journey
  onComplete: (repo: GitHubRepo) => void
  onBack: () => void
}

const PLATFORMS = [
  { id: 'vercel', label: 'Vercel', icon: '▲', desc: 'Best for React/Next.js', descAr: 'الأفضل لـ React/Next.js' },
  { id: 'netlify', label: 'Netlify', icon: '◆', desc: 'Easy drag-and-drop deploy', descAr: 'نشر سهل بالسحب والإفلات' },
  { id: 'github-pages', label: 'GitHub Pages', icon: '🐙', desc: 'Free static hosting', descAr: 'استضافة ثابتة مجانية' },
  { id: 'railway', label: 'Railway', icon: '🚂', desc: 'Full-stack with databases', descAr: 'تطبيقات كاملة مع قواعد بيانات' },
  { id: 'render', label: 'Render', icon: '☁️', desc: 'Auto-scaling cloud', descAr: 'سحابة قابلة للتوسع' },
]

type Step = 'config' | 'creating' | 'success'

export function GitHubPhase({ initial, code, brand, journey, onComplete, onBack }: Props) {
  const { t, language, isRTL } = useLanguage()
  const [repoName, setRepoName] = useState(
    initial?.name || (brand?.name?.toLowerCase().replace(/\s+/g, '-') || 'healthcare-startup')
  )
  const [visibility, setVisibility] = useState<'public' | 'private'>(initial?.visibility || 'public')
  const [platforms, setPlatforms] = useState<string[]>(initial?.deploymentConfig?.platforms || ['vercel'])
  const [cicd, setCicd] = useState(initial?.deploymentConfig?.cicd ?? true)
  const [docker, setDocker] = useState(initial?.deploymentConfig?.docker ?? false)
  const [step, setStep] = useState<Step>(initial?.url ? 'success' : 'config')
  const [repoUrl, setRepoUrl] = useState(initial?.url || '')
  const [progress, setProgress] = useState(0)
  const [progressLabel, setProgressLabel] = useState('')

  function togglePlatform(id: string) {
    setPlatforms(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id])
  }

  async function handleCreate() {
    setStep('creating')
    
    // Simulate repo creation with progress
    const steps = [
      { label: language === 'ar' ? 'تحليل ملفات الكود...' : 'Analyzing code files...', progress: 15 },
      { label: language === 'ar' ? 'إنشاء المستودع...' : 'Creating repository...', progress: 30 },
      { label: language === 'ar' ? 'رفع الكود...' : 'Uploading code files...', progress: 55 },
      { label: language === 'ar' ? 'توليد ملف README...' : 'Generating README...', progress: 70 },
      { label: language === 'ar' ? 'إعداد سير عمل CI/CD...' : 'Setting up CI/CD workflows...', progress: 85 },
      { label: language === 'ar' ? 'الإعداد النهائي...' : 'Finalizing setup...', progress: 100 },
    ]

    for (const s of steps) {
      await new Promise<void>(resolve => setTimeout(resolve, 800 + Math.random() * 400))
      setProgress(s.progress)
      setProgressLabel(s.label)
    }

    // Simulate GitHub URL (demo mode — real GitHub API integration coming soon)
    const slug = repoName.toLowerCase().replace(/\s+/g, '-')
    const url = `https://github.com/your-username/${slug}`
    setRepoUrl(url)
    
    await new Promise<void>(resolve => setTimeout(resolve, 500))
    setStep('success')
    
    onComplete({
      name: repoName,
      visibility,
      url,
      deploymentConfig: { platforms, cicd, docker },
      createdAt: new Date().toISOString(),
    })
  }

  // Journey summary
  const completedPhases = journey.phases.filter(p => p.completed).length

  return (
    <div className="min-h-screen" style={{ background: '#050810' }}>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className={`flex items-center gap-3 mb-8 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <button onClick={onBack} className="glass-card glass-card-hover p-2 rounded-xl text-slate-400 hover:text-white transition-colors">
            <ArrowLeft size={20} className={isRTL ? 'rotate-180' : ''} />
          </button>
          <div>
            <h1 className="font-display font-bold text-2xl text-white flex items-center gap-2">
              <span>🚀</span> {t.githubTitle}
            </h1>
            <p className="text-slate-400 text-sm mt-0.5">{t.githubSubtitle}</p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === 'config' && (
            <motion.div key="config" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
              {/* Journey summary */}
              <div className="glass-card rounded-2xl p-5 border border-spark-500/20">
                <h3 className="font-display font-semibold text-white mb-3">
                  {language === 'ar' ? '🎉 ملخص رحلتك' : '🎉 Your Journey Summary'}
                </h3>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="glass-card rounded-xl p-3">
                    <div className="text-2xl font-display font-bold text-spark-400">{completedPhases}</div>
                    <div className="text-xs text-slate-500">{language === 'ar' ? 'المراحل' : 'Phases'}</div>
                  </div>
                  <div className="glass-card rounded-xl p-3">
                    <div className="text-2xl font-display font-bold text-amber-400">{journey.gameState.xp}</div>
                    <div className="text-xs text-slate-500">{language === 'ar' ? 'نقاط الخبرة' : 'XP'}</div>
                  </div>
                  <div className="glass-card rounded-xl p-3">
                    <div className="text-2xl font-display font-bold text-emerald-400">{code?.files?.length || 0}</div>
                    <div className="text-xs text-slate-500">{language === 'ar' ? 'الملفات' : 'Files'}</div>
                  </div>
                </div>
              </div>

              {/* Repo config */}
              <div className="glass-card rounded-2xl p-5 space-y-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-2">{t.repoName}</label>
                  <input
                    value={repoName}
                    onChange={e => setRepoName(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                    className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-spark-500/50 font-mono text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-2">{t.visibility}</label>
                  <div className="flex gap-2">
                    {(['public', 'private'] as const).map(v => (
                      <button
                        key={v}
                        onClick={() => setVisibility(v)}
                        className={`flex-1 py-2 rounded-xl text-sm transition-all ${
                          visibility === v
                            ? 'bg-spark-500/20 border border-spark-500/50 text-white'
                            : 'glass-card glass-card-hover text-slate-400'
                        }`}
                      >
                        {v === 'public' ? `🌐 ${t.publicRepo}` : `🔒 ${t.privateRepo}`}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Deployment platforms */}
              <div className="glass-card rounded-2xl p-5">
                <h3 className="font-semibold text-sm text-slate-400 uppercase tracking-wide mb-3">{t.deploymentPlatforms}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {PLATFORMS.map(p => (
                    <button
                      key={p.id}
                      onClick={() => togglePlatform(p.id)}
                      className={`flex items-center gap-3 p-3 rounded-xl text-left transition-all duration-200 ${
                        platforms.includes(p.id)
                          ? 'bg-spark-500/20 border border-spark-500/50'
                          : 'glass-card glass-card-hover'
                      }`}
                    >
                      <span className="text-lg">{p.icon}</span>
                      <div>
                        <p className="font-medium text-sm text-white">{p.label}</p>
                        <p className="text-xs text-slate-500">{isRTL ? p.descAr : p.desc}</p>
                      </div>
                      {platforms.includes(p.id) && <Check size={16} className="text-spark-400 ml-auto" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* CI/CD & Docker */}
              <div className="glass-card rounded-2xl p-5 space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={cicd} onChange={e => setCicd(e.target.checked)} className="accent-spark-500 w-4 h-4" />
                  <div>
                    <p className="text-sm text-white">{language === 'ar' ? 'إضافة CI/CD Workflows' : 'Add CI/CD Workflows'}</p>
                    <p className="text-xs text-slate-500">GitHub Actions for automated testing & deployment</p>
                  </div>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={docker} onChange={e => setDocker(e.target.checked)} className="accent-spark-500 w-4 h-4" />
                  <div>
                    <p className="text-sm text-white">{language === 'ar' ? 'إضافة إعداد Docker' : 'Add Docker Configuration'}</p>
                    <p className="text-xs text-slate-500">Dockerfile + docker-compose.yml</p>
                  </div>
                </label>
              </div>

              <button
                onClick={handleCreate}
                className="spark-btn w-full py-4 rounded-2xl font-semibold text-lg flex items-center justify-center gap-3"
              >
                <GithubLogo size={22} />
                {t.createRepo}
              </button>
            </motion.div>
          )}

          {step === 'creating' && (
            <motion.div key="creating" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="py-16">
              <div className="text-center mb-8">
                <motion.div
                  className="text-6xl mb-4"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                >
                  ⚙️
                </motion.div>
                <h2 className="font-display font-bold text-xl text-white mb-2">
                  {language === 'ar' ? 'جاري إنشاء مستودعك...' : 'Creating your repository...'}
                </h2>
                <p className="text-slate-400 text-sm">{progressLabel}</p>
              </div>
              <div className="h-3 rounded-full bg-slate-800 overflow-hidden max-w-sm mx-auto">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: 'linear-gradient(90deg, #0c9eeb, #10b981)' }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <p className="text-center text-spark-400 font-display font-bold mt-3">{progress}%</p>
            </motion.div>
          )}

          {step === 'success' && (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8 space-y-6">
              <motion.div
                className="text-7xl"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 1, repeat: 3 }}
              >
                🚀
              </motion.div>
              <div>
                <h2 className="font-display font-bold text-3xl text-white mb-2">{t.congratulations}</h2>
                <p className="text-slate-400">{t.repoCreated}</p>
              </div>

              {repoUrl && (
                <div className="glass-card rounded-2xl p-4 border border-emerald-500/30 max-w-md mx-auto">
                  <p className="text-xs text-slate-500 mb-2">{language === 'ar' ? 'رابط المستودع (تجريبي)' : 'Repository URL (demo)'}</p>
                  <div className="flex items-center gap-2">
                    <code className="text-emerald-400 text-sm flex-1 text-left truncate">{repoUrl}</code>
                    <button
                      onClick={() => navigator.clipboard.writeText(repoUrl)}
                      className="text-slate-400 hover:text-white transition-colors text-xs px-2 py-1 glass-card rounded"
                      title="Copy URL"
                    >
                      Copy
                    </button>
                  </div>
                  <p className="text-xs text-slate-600 mt-2">{language === 'ar' ? '⚠️ هذا عرض توضيحي — التكامل الحقيقي مع GitHub قادم قريباً' : '⚠️ Demo mode — real GitHub API integration coming soon'}</p>
                </div>
              )}

              {/* Final stats */}
              <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto">
                <div className="glass-card rounded-2xl p-3 text-center">
                  <div className="text-xl font-display font-bold text-amber-400">{journey.gameState.xp}</div>
                  <div className="text-xs text-slate-500">Total XP</div>
                </div>
                <div className="glass-card rounded-2xl p-3 text-center">
                  <div className="text-xl font-display font-bold text-spark-400">{journey.gameState.level}</div>
                  <div className="text-xs text-slate-500">Level</div>
                </div>
                <div className="glass-card rounded-2xl p-3 text-center">
                  <div className="text-xl font-display font-bold text-emerald-400">
                    {journey.gameState.badges.filter(b => b.earned).length}
                  </div>
                  <div className="text-xs text-slate-500">Badges</div>
                </div>
              </div>

              <div className="flex flex-col gap-3 max-w-sm mx-auto">
                {repoUrl && (
                  <button
                    onClick={() => navigator.clipboard.writeText(repoUrl)}
                    className="spark-btn py-3 rounded-xl font-semibold flex items-center justify-center gap-2"
                  >
                    <GithubLogo size={18} />
                    {language === 'ar' ? 'نسخ رابط المستودع' : 'Copy Repository URL'}
                  </button>
                )}
                <button onClick={onBack} className="glass-card glass-card-hover py-3 rounded-xl text-slate-300 flex items-center justify-center gap-2">
                  <Rocket size={16} />
                  {language === 'ar' ? 'العودة إلى لوحة التحكم' : 'Back to Dashboard'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
