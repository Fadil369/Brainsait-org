// Hub i18n — bilingual EN/AR
export type Language = 'en' | 'ar'

export interface HubTranslations {
  // App
  appName: string
  appTagline: string

  // Nav
  courses: string
  paths: string
  diagnostic: string
  quiz: string
  dashboard: string
  enroll: string
  language: string

  // Hero
  heroTitle: string
  heroSubtitle: string
  statCourses: string
  statBilingual: string
  statPaths: string
  statCohorts: string
  statVision: string

  // Quick buttons
  liveCourses: string
  learningPaths: string
  enrollNow: string
  myDashboard: string

  // Sections
  sectionBrainsait: string
  sectionBrainsaitAr: string
  sectionBrainsaitDesc: string
  sectionClaude: string
  sectionClaudeAr: string
  sectionClaudeDesc: string
  sectionEdu: string
  sectionEduAr: string
  sectionEduDesc: string
  sectionSpark: string

  // Filters
  filterAll: string
  filterActive: string
  filterBrainsait: string
  filterClaude: string
  filterNphies: string
  filterFhir: string
  filterRcm: string
  filterAi: string
  filterDev: string
  filterPro: string
  filterEdu: string
  filterSaudi: string

  // Course card
  viewCourse: string
  joinClassroom: string
  enrollCourse: string
  format: string
  level: string
  duration: string
  modules: string
  code: string

  // Paths section
  pathsTitle: string
  pathsDesc: string

  // CTA
  ctaTitle: string
  ctaSubtitle: string
  ctaDesc: string

  // Common
  back: string
  start: string
  next: string
  previous: string
  submit: string
  reset: string
  loading: string

  // Dashboard
  dashTitle: string
  dashDesc: string
  enrolled: string
  completed: string
  noActivity: string

  // Enroll
  enrollTitle: string
  yourName: string
  yourEmail: string
  selectCourse: string
  message: string
  send: string
  enrollDesc: string
}

const en: HubTranslations = {
  appName: 'BrainSAIT Training',
  appTagline: 'Healthcare AI Training Hub',

  courses: 'Courses',
  paths: 'Paths',
  diagnostic: 'Diagnostic',
  quiz: 'Quiz',
  dashboard: 'Dashboard',
  enroll: 'Enroll',
  language: 'عربي',

  heroTitle: 'Unified Training Hub',
  heroSubtitle: 'All healthcare AI courses in one place — NPHIES, FHIR R4, Claude AI, MCP, RCM, and more. Built for Saudi healthcare, in Arabic and English.',
  statCourses: 'Courses',
  statBilingual: 'Bilingual',
  statPaths: 'Learning Paths',
  statCohorts: 'Live Cohorts',
  statVision: 'Vision 2030 Aligned',

  liveCourses: '🎓 Live Courses',
  learningPaths: '🗺️ Learning Paths',
  enrollNow: '📝 Enroll Now',
  myDashboard: '📊 Dashboard',

  sectionBrainsait: 'BrainSAIT Healthcare Courses',
  sectionBrainsaitAr: 'دورات برينسايت الصحية',
  sectionBrainsaitDesc: 'Original courses built for Saudi healthcare — NPHIES compliance, FHIR implementation, RCM automation, and AI strategy aligned with Vision 2030.',
  sectionClaude: 'Claude AI for Healthcare',
  sectionClaudeAr: 'كلاود للذكاء الاصطناعي في الرعاية الصحية',
  sectionClaudeDesc: 'Adapted from Anthropic\'s course catalog — specialized for Saudi healthcare workflows, NPHIES integration, and clinical AI applications.',
  sectionEdu: 'Education & Nonprofit',
  sectionEduAr: 'التعليم والمنظمات غير الربحية',
  sectionEduDesc: 'For healthcare educators, students, and health-focused nonprofits in Saudi Arabia.',
  sectionSpark: '⚡ Featured: Spark الشرارة',

  filterAll: 'All',
  filterActive: '🟢 Active',
  filterBrainsait: 'BrainSAIT',
  filterClaude: 'Claude AI',
  filterNphies: 'NPHIES',
  filterFhir: 'FHIR',
  filterRcm: 'RCM',
  filterAi: 'AI/ML',
  filterDev: 'Developer',
  filterPro: 'Professional',
  filterEdu: 'Education',
  filterSaudi: '🇸🇦 Saudi',

  viewCourse: 'View Course',
  joinClassroom: 'Join ↗',
  enrollCourse: 'Enroll',
  format: 'Format',
  level: 'Level',
  duration: 'Duration',
  modules: 'Modules',
  code: 'Code',

  pathsTitle: 'Learning Paths',
  pathsDesc: 'Structured paths designed for specific roles in Saudi healthcare. Each path builds from foundation to specialization.',

  ctaTitle: 'Start Your Healthcare AI Journey',
  ctaSubtitle: 'ابدأ رحلتك في الذكاء الاصطناعي الصحي',
  ctaDesc: '20 courses, 6 learning paths, bilingual AR/EN — all in one unified hub.',

  back: 'Back',
  start: 'Start',
  next: 'Next',
  previous: 'Previous',
  submit: 'Submit',
  reset: 'Reset',
  loading: 'Loading…',

  dashTitle: 'My Dashboard',
  dashDesc: 'Track your learning progress',
  enrolled: 'Enrolled',
  completed: 'Completed',
  noActivity: 'No activity yet — start by enrolling in a course.',

  enrollTitle: 'Enroll in a Course',
  yourName: 'Your Name',
  yourEmail: 'Your Email',
  selectCourse: 'Select a Course',
  message: 'Message (optional)',
  send: 'Send Enrollment Request',
  enrollDesc: 'Fill in the form and we\'ll get back to you within 24 hours.',
}

const ar: HubTranslations = {
  appName: 'تدريب برينسايت',
  appTagline: 'مركز التدريب الموحد',

  courses: 'الدورات',
  paths: 'المسارات',
  diagnostic: 'التشخيص',
  quiz: 'الاختبار',
  dashboard: 'لوحتي',
  enroll: 'التسجيل',
  language: 'English',

  heroTitle: 'مركز التدريب الموحد',
  heroSubtitle: 'جميع دورات الذكاء الاصطناعي الصحي في مكان واحد — NPHIES وFHIR R4 وكلاود والمزيد. مصمم للرعاية الصحية السعودية، بالعربية والإنجليزية.',
  statCourses: 'دورة',
  statBilingual: 'ثنائي اللغة',
  statPaths: 'مسارات تعليمية',
  statCohorts: 'دورات حية',
  statVision: 'متوافق مع رؤية 2030',

  liveCourses: '🎓 الدورات الحية',
  learningPaths: '🗺️ المسارات التعليمية',
  enrollNow: '📝 سجّل الآن',
  myDashboard: '📊 لوحتي',

  sectionBrainsait: 'BrainSAIT Healthcare Courses',
  sectionBrainsaitAr: 'دورات برينسايت الصحية',
  sectionBrainsaitDesc: 'دورات أصلية مبنية للرعاية الصحية السعودية — امتثال NPHIES وتنفيذ FHIR وأتمتة RCM واستراتيجية الذكاء الاصطناعي.',
  sectionClaude: 'Claude AI for Healthcare',
  sectionClaudeAr: 'كلاود للذكاء الاصطناعي في الرعاية الصحية',
  sectionClaudeDesc: 'دورات مُكيَّفة من كتالوج Anthropic — متخصصة لسير عمل الرعاية الصحية السعودية وتكامل NPHIES وتطبيقات الذكاء الاصطناعي السريري.',
  sectionEdu: 'Education & Nonprofit',
  sectionEduAr: 'التعليم والمنظمات غير الربحية',
  sectionEduDesc: 'للمعلمين والطلاب والمنظمات غير الربحية في مجال الرعاية الصحية في المملكة العربية السعودية.',
  sectionSpark: '⚡ مميز: شرارة Spark',

  filterAll: 'الكل',
  filterActive: '🟢 نشط',
  filterBrainsait: 'برينسايت',
  filterClaude: 'كلاود AI',
  filterNphies: 'NPHIES',
  filterFhir: 'FHIR',
  filterRcm: 'RCM',
  filterAi: 'AI/ML',
  filterDev: 'مطور',
  filterPro: 'محترف',
  filterEdu: 'تعليم',
  filterSaudi: '🇸🇦 سعودي',

  viewCourse: 'عرض الدورة',
  joinClassroom: 'انضم ↗',
  enrollCourse: 'سجّل',
  format: 'الصيغة',
  level: 'المستوى',
  duration: 'المدة',
  modules: 'الوحدات',
  code: 'الكود',

  pathsTitle: 'المسارات التعليمية',
  pathsDesc: 'مسارات منظمة مصممة لأدوار محددة في الرعاية الصحية السعودية. كل مسار يبني من الأساس إلى التخصص.',

  ctaTitle: 'Start Your Healthcare AI Journey',
  ctaSubtitle: 'ابدأ رحلتك في الذكاء الاصطناعي الصحي',
  ctaDesc: '20 دورة و6 مسارات تعليمية، ثنائية اللغة AR/EN — كل ذلك في مركز موحد واحد.',

  back: 'رجوع',
  start: 'ابدأ',
  next: 'التالي',
  previous: 'السابق',
  submit: 'إرسال',
  reset: 'إعادة',
  loading: 'جاري التحميل…',

  dashTitle: 'لوحتي',
  dashDesc: 'تتبع تقدمك التعليمي',
  enrolled: 'مسجل',
  completed: 'مكتمل',
  noActivity: 'لا يوجد نشاط بعد — ابدأ بالتسجيل في دورة.',

  enrollTitle: 'التسجيل في دورة',
  yourName: 'اسمك',
  yourEmail: 'بريدك الإلكتروني',
  selectCourse: 'اختر دورة',
  message: 'رسالة (اختياري)',
  send: 'إرسال طلب التسجيل',
  enrollDesc: 'املأ النموذج وسنرد عليك خلال 24 ساعة.',
}

export const translations: Record<Language, HubTranslations> = { en, ar }
