// Hub data types

export type Language = 'en' | 'ar'

export type FilterTag =
  | 'all' | 'active' | 'brainsait' | 'claude' | 'nphies'
  | 'fhir' | 'rcm' | 'ai' | 'dev' | 'pro' | 'edu' | 'saudi' | 'featured'

export type CourseSection = 'brainsait' | 'claude' | 'edu' | 'spark'

export interface Course {
  id: string
  titleEn: string
  titleAr: string
  descEn: string
  section: CourseSection
  tags: FilterTag[]
  stripe: string        // CSS gradient class e.g. 'green' | 'blue' etc.
  chips: Chip[]
  format: string
  level: string
  duration?: string
  modules?: string
  classroomCode?: string
  classroomUrl?: string
  enrollSlug?: string
  courseUrl?: string   // external URL (for Spark card)
  status?: 'active' | 'upcoming' | 'self-paced'
  source?: string      // e.g. "BrainSAIT Original", "Adapted from Claude 101"
}

export interface Chip {
  label: string
  color: string // tailwind color key: green | blue | purple | orange | cyan | pink | red | teal | gold | claude | open
}

// Diagnostic types
export type SpaceModule = 'strategy' | 'partnerships' | 'architecture' | 'culture' | 'evaluation'

export interface DiagnosticQuestion {
  module: string       // Arabic label
  moduleEn: SpaceModule
  color: string        // blue | emerald | purple | orange | red
  q: string            // Arabic question text
}

export interface DiagnosticOption {
  text: string         // Arabic label
  value: number        // 1-5
}

export type ProfileKey = 'motivator' | 'strategist' | 'collaborator' | 'implementor' | 'earlyStage' | 'trailblazer'

export interface InnovationProfile {
  emoji: string
  name: string         // Arabic
  desc: string         // Arabic
}

export interface Tool {
  name: string         // Arabic
  desc: string         // Arabic
}

// Quiz types
export interface QuizQuestion {
  q: string            // Arabic
  opts: string[]       // Arabic
  correct: number      // index
  module: string       // Arabic
}

// Learning path types
export interface LearningPath {
  icon: string
  nameEn: string
  nameAr: string
  desc: string
  courses: number
  weeks: number
  courseIds: string[]
}

// User progress (localStorage)
export interface UserProgress {
  completedCourses: string[]
  enrolledCourses: string[]
  diagnosticScore?: Record<SpaceModule, number>
  quizScore?: number
  lastVisited?: string
}
