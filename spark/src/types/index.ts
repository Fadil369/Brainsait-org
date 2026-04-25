// Types and data models for Spark الشرارة

export type PhaseId = 'brainstorm' | 'story' | 'brand' | 'prd' | 'code' | 'github'

export interface PhaseStatus {
  id: PhaseId
  unlocked: boolean
  completed: boolean
  completedAt?: string
}

export interface Badge {
  id: string
  name: string
  nameAr: string
  description: string
  descriptionAr: string
  icon: string
  xp: number
  earned: boolean
  earnedAt?: string
}

export interface GameState {
  xp: number
  level: number
  badges: Badge[]
  streak: number
  lastActiveDate?: string
  totalPhases: number
}

export interface ConceptCard {
  problem: string
  targetUsers: string
  solution: string
  keywords: string[]
  aiConcepts: string[]
}

export interface Story {
  template: string
  tone: number // 0=formal, 100=casual
  narrative: string
  clarityScore: number
  emotionScore: number
}

export type BrandPersonality = 'innovative' | 'trustworthy' | 'compassionate' | 'bold' | 'elegant' | 'friendly'

export interface PersonalityProfile {
  primary: BrandPersonality
  secondary: BrandPersonality
  description: string
  descriptionAr: string
  colorPalette: string[]
  tone: string
  toneAr: string
}

export interface Brand {
  name: string
  tagline: string
  taglineAr: string
  colors: string[]
  logoIcon: string
  personality: PersonalityProfile
  quizAnswers: Record<string, string>
}

export interface PRDSection {
  id: string
  title: string
  titleAr: string
  content: string
  completed: boolean
}

export interface PRD {
  sections: PRDSection[]
  completenessScore: number
  regulatoryChecklist: Record<string, boolean>
  exportedAt?: string
}

export type TemplateType = 'landing' | 'webapp' | 'dashboard'

export interface CodeFile {
  name: string
  content: string
  language: string
}

export interface GeneratedCode {
  templateType: TemplateType
  files: CodeFile[]
  features: string[]
  architecture: string
  generatedAt: string
}

export interface DeploymentConfig {
  platforms: string[]
  cicd: boolean
  docker: boolean
}

export interface GitHubRepo {
  name: string
  visibility: 'public' | 'private'
  url?: string
  deploymentConfig: DeploymentConfig
  createdAt?: string
}

export interface Journey {
  id: string
  phases: PhaseStatus[]
  concept?: ConceptCard
  story?: Story
  brand?: Brand
  prd?: PRD
  code?: GeneratedCode
  githubRepo?: GitHubRepo
  gameState: GameState
  language: 'en' | 'ar'
  theme: 'dark' | 'light'
  createdAt: string
  updatedAt: string
}
