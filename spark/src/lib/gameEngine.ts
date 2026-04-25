// Gamification engine - XP, levels, badges, streak tracking
import type { GameState, Badge } from '@/types'

export const BADGES: Badge[] = [
  {
    id: 'first-spark',
    name: 'First Spark',
    nameAr: 'الشرارة الأولى',
    description: 'Started your healthcare startup journey',
    descriptionAr: 'بدأت رحلة شركتك الصحية الناشئة',
    icon: '⚡',
    xp: 50,
    earned: false,
  },
  {
    id: 'idea-explorer',
    name: 'Idea Explorer',
    nameAr: 'مستكشف الأفكار',
    description: 'Completed the Brainstorm phase',
    descriptionAr: 'أكملت مرحلة العصف الذهني',
    icon: '💡',
    xp: 100,
    earned: false,
  },
  {
    id: 'storyteller',
    name: 'Storyteller',
    nameAr: 'الراوي',
    description: 'Crafted your founder story',
    descriptionAr: 'صغت قصة مؤسسك',
    icon: '📖',
    xp: 150,
    earned: false,
  },
  {
    id: 'brand-builder',
    name: 'Brand Builder',
    nameAr: 'بانٍ العلامة التجارية',
    description: 'Created your brand identity',
    descriptionAr: 'أنشأت هويتك التجارية',
    icon: '🎨',
    xp: 200,
    earned: false,
  },
  {
    id: 'product-visionary',
    name: 'Product Visionary',
    nameAr: 'صاحب رؤية المنتج',
    description: 'Completed your PRD',
    descriptionAr: 'أكملت وثيقة المنتج',
    icon: '📋',
    xp: 250,
    earned: false,
  },
  {
    id: 'code-wizard',
    name: 'Code Wizard',
    nameAr: 'ساحر الكود',
    description: 'Generated production-ready code',
    descriptionAr: 'أنشأت كوداً جاهزاً للإنتاج',
    icon: '✨',
    xp: 300,
    earned: false,
  },
  {
    id: 'repo-rocketeer',
    name: 'Repo Rocketeer',
    nameAr: 'صاروخ المستودع',
    description: 'Pushed your code to GitHub',
    descriptionAr: 'دفعت كودك إلى GitHub',
    icon: '🚀',
    xp: 500,
    earned: false,
  },
  {
    id: 'streak-3',
    name: '3-Day Streak',
    nameAr: 'تسلسل 3 أيام',
    description: 'Built for 3 days in a row',
    descriptionAr: 'بنيت لمدة 3 أيام متتالية',
    icon: '🔥',
    xp: 75,
    earned: false,
  },
  {
    id: 'halfway-hero',
    name: 'Halfway Hero',
    nameAr: 'بطل المنتصف',
    description: 'Completed 3 phases',
    descriptionAr: 'أتممت 3 مراحل',
    icon: '🏅',
    xp: 200,
    earned: false,
  },
  {
    id: 'visionary',
    name: 'Visionary',
    nameAr: 'صاحب رؤية',
    description: 'Completed all 6 phases',
    descriptionAr: 'أتممت كل المراحل الست',
    icon: '👑',
    xp: 1000,
    earned: false,
  },
]

export function createInitialGameState(): GameState {
  return {
    xp: 0,
    level: 1,
    badges: BADGES.map(b => ({ ...b })),
    streak: 0,
    totalPhases: 0,
  }
}

export function calculateLevel(xp: number): number {
  // Level thresholds: 0, 100, 250, 450, 700, 1000, 1350, 1750, 2200, 2700
  const thresholds = [0, 100, 250, 450, 700, 1000, 1350, 1750, 2200, 2700]
  let level = 1
  for (let i = 1; i < thresholds.length; i++) {
    if (xp >= thresholds[i]) level = i + 1
    else break
  }
  return Math.min(level, 10)
}

export function getXPForNextLevel(currentLevel: number): number {
  const thresholds = [0, 100, 250, 450, 700, 1000, 1350, 1750, 2200, 2700, Infinity]
  return thresholds[currentLevel] || Infinity
}

export function getXPForLevel(level: number): number {
  const thresholds = [0, 100, 250, 450, 700, 1000, 1350, 1750, 2200, 2700]
  return thresholds[level - 1] || 0
}

export function addXP(gameState: GameState, amount: number): { newState: GameState; leveledUp: boolean } {
  const newXP = gameState.xp + amount
  const oldLevel = gameState.level
  const newLevel = calculateLevel(newXP)
  return {
    newState: { ...gameState, xp: newXP, level: newLevel },
    leveledUp: newLevel > oldLevel,
  }
}

export function earnBadge(gameState: GameState, badgeId: string): { newState: GameState; badge: Badge | null } {
  const badgeIndex = gameState.badges.findIndex(b => b.id === badgeId)
  if (badgeIndex === -1 || gameState.badges[badgeIndex].earned) {
    return { newState: gameState, badge: null }
  }
  
  const badge = gameState.badges[badgeIndex]
  const newBadges = gameState.badges.map((b, i) =>
    i === badgeIndex ? { ...b, earned: true, earnedAt: new Date().toISOString() } : b
  )
  const newXP = gameState.xp + badge.xp
  const newLevel = calculateLevel(newXP)
  
  return {
    newState: { ...gameState, xp: newXP, level: newLevel, badges: newBadges },
    badge: { ...badge, earned: true, earnedAt: new Date().toISOString() },
  }
}

export function updateStreak(gameState: GameState): GameState {
  const today = new Date().toDateString()
  const lastActive = gameState.lastActiveDate
  
  if (lastActive === today) return gameState
  
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const isConsecutive = lastActive === yesterday.toDateString()
  
  return {
    ...gameState,
    streak: isConsecutive ? gameState.streak + 1 : 1,
    lastActiveDate: today,
  }
}

export const PHASE_XP: Record<string, number> = {
  brainstorm: 100,
  story: 150,
  brand: 200,
  prd: 250,
  code: 300,
  github: 500,
}

export const PHASE_BADGES: Record<string, string> = {
  brainstorm: 'idea-explorer',
  story: 'storyteller',
  brand: 'brand-builder',
  prd: 'product-visionary',
  code: 'code-wizard',
  github: 'repo-rocketeer',
}
