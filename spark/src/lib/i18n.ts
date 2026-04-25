// Internationalization system - English & Arabic with RTL support

export type Language = 'en' | 'ar'

export interface Translations {
  // App
  appName: string
  appTagline: string
  
  // Navigation
  dashboard: string
  brainstorm: string
  story: string
  brand: string
  prd: string
  code: string
  github: string
  
  // Phase descriptions
  brainstormDesc: string
  storyDesc: string
  brandDesc: string
  prdDesc: string
  codeDesc: string
  githubDesc: string
  
  // Common actions
  continue: string
  back: string
  save: string
  generate: string
  regenerate: string
  cancel: string
  done: string
  next: string
  skip: string
  export: string
  copy: string
  download: string
  
  // Status
  locked: string
  completed: string
  inProgress: string
  unlocked: string
  
  // Game
  level: string
  xp: string
  badges: string
  streak: string
  days: string
  
  // Dashboard
  journeyProgress: string
  yourBadges: string
  currentPhase: string
  startJourney: string
  continueJourney: string
  
  // Phase 1 - Brainstorm
  brainstormTitle: string
  brainstormSubtitle: string
  enterHealthcareIdea: string
  ideaPlaceholder: string
  relatedConcepts: string
  conceptCard: string
  problem: string
  targetUsers: string
  solution: string
  saveConcept: string
  generatingConcepts: string
  
  // Phase 2 - Story
  storyTitle: string
  storySubtitle: string
  storyTemplate: string
  toneLabel: string
  formal: string
  casual: string
  generateStory: string
  yourStory: string
  clarityScore: string
  emotionScore: string
  
  // Phase 3 - Brand
  brandTitle: string
  brandSubtitle: string
  personalityQuiz: string
  brandName: string
  tagline: string
  colorPalette: string
  logoIcon: string
  generateBrand: string
  
  // Phase 4 - PRD
  prdTitle: string
  prdSubtitle: string
  sections: string
  completeness: string
  regulatoryChecklist: string
  exportPDF: string
  investorReady: string
  
  // Phase 5 - Code
  codeTitle: string
  codeSubtitle: string
  selectTemplate: string
  landingPage: string
  webApp: string
  adminDashboard: string
  selectFeatures: string
  generateCode: string
  codePreview: string
  
  // Phase 6 - GitHub
  githubTitle: string
  githubSubtitle: string
  repoName: string
  visibility: string
  publicRepo: string
  privateRepo: string
  deploymentPlatforms: string
  createRepo: string
  success: string
  repoCreated: string
  
  // AI Loading
  generatingWithAI: string
  healthcareFacts: string[]
  
  // Errors
  aiError: string
  retry: string
  
  // Celebrations
  phaseComplete: string
  badgeEarned: string
  levelUp: string
  congratulations: string
  
  // Settings
  language: string
  theme: string
  darkMode: string
  lightMode: string
}

const en: Translations = {
  appName: 'Spark الشرارة',
  appTagline: 'Healthcare Startup Builder',
  
  dashboard: 'Dashboard',
  brainstorm: 'Brainstorm',
  story: 'Story',
  brand: 'Brand',
  prd: 'PRD',
  code: 'Code',
  github: 'GitHub',
  
  brainstormDesc: 'Define your healthcare problem',
  storyDesc: 'Craft your founder narrative',
  brandDesc: 'Build your visual identity',
  prdDesc: 'Write your product spec',
  codeDesc: 'Generate production code',
  githubDesc: 'Push to your repository',
  
  continue: 'Continue',
  back: 'Back',
  save: 'Save',
  generate: 'Generate',
  regenerate: 'Regenerate',
  cancel: 'Cancel',
  done: 'Done',
  next: 'Next',
  skip: 'Skip',
  export: 'Export',
  copy: 'Copy',
  download: 'Download',
  
  locked: 'Locked',
  completed: 'Completed',
  inProgress: 'In Progress',
  unlocked: 'Unlocked',
  
  level: 'Level',
  xp: 'XP',
  badges: 'Badges',
  streak: 'Streak',
  days: 'days',
  
  journeyProgress: 'Journey Progress',
  yourBadges: 'Your Badges',
  currentPhase: 'Current Phase',
  startJourney: 'Start Your Journey',
  continueJourney: 'Continue Journey',
  
  brainstormTitle: 'Brainstorm Canvas',
  brainstormSubtitle: 'Explore your healthcare idea and discover related concepts',
  enterHealthcareIdea: 'Enter your healthcare idea or problem',
  ideaPlaceholder: 'e.g., Patient appointment scheduling is broken in Saudi clinics...',
  relatedConcepts: 'Related Concepts',
  conceptCard: 'Concept Card',
  problem: 'Problem',
  targetUsers: 'Target Users',
  solution: 'Solution',
  saveConcept: 'Save Concept',
  generatingConcepts: 'Generating related concepts...',
  
  storyTitle: 'Story Builder',
  storySubtitle: 'Transform your concept into a compelling founder story',
  storyTemplate: 'Story Template',
  toneLabel: 'Story Tone',
  formal: 'Formal',
  casual: 'Casual',
  generateStory: 'Generate My Story',
  yourStory: 'Your Story',
  clarityScore: 'Clarity',
  emotionScore: 'Emotion',
  
  brandTitle: 'Brand Studio',
  brandSubtitle: 'Build your visual identity with AI-powered personality insights',
  personalityQuiz: 'Personality Quiz',
  brandName: 'Brand Name',
  tagline: 'Tagline',
  colorPalette: 'Color Palette',
  logoIcon: 'Logo Icon',
  generateBrand: 'Generate Brand',
  
  prdTitle: 'PRD Workshop',
  prdSubtitle: 'Build your investor-ready product requirements document',
  sections: 'Sections',
  completeness: 'Completeness',
  regulatoryChecklist: 'Regulatory Checklist',
  exportPDF: 'Export PDF',
  investorReady: 'Investor Ready',
  
  codeTitle: 'Code Generator',
  codeSubtitle: 'Transform your PRD into production-ready code',
  selectTemplate: 'Select Template',
  landingPage: 'Landing Page',
  webApp: 'Web App',
  adminDashboard: 'Dashboard',
  selectFeatures: 'Select Features',
  generateCode: 'Generate Code',
  codePreview: 'Code Preview',
  
  githubTitle: 'GitHub Integration',
  githubSubtitle: 'Push your generated code to a real GitHub repository',
  repoName: 'Repository Name',
  visibility: 'Visibility',
  publicRepo: 'Public',
  privateRepo: 'Private',
  deploymentPlatforms: 'Deployment Platforms',
  createRepo: 'Create Repository',
  success: 'Success!',
  repoCreated: 'Your repository has been created',
  
  generatingWithAI: 'Generating with AI...',
  healthcareFacts: [
    'Saudi Arabia\'s Vision 2030 aims to privatize 290 hospitals',
    'The MENA healthcare market is projected to reach $243B by 2030',
    'NPHIES is revolutionizing health insurance in Saudi Arabia',
    '70% of Saudi healthcare AI startups focus on diagnostics',
    'Saudi Arabia has the highest smartphone penetration in MENA at 97%',
    'The Saudi Digital Health Strategy targets 70% of healthcare services online by 2030',
    'Remote patient monitoring is growing 25% annually in the GCC',
    'Healthcare AI adoption in Saudi Arabia doubled in 2024',
  ],
  
  aiError: 'AI generation failed. Please try again.',
  retry: 'Retry',
  
  phaseComplete: 'Phase Complete!',
  badgeEarned: 'Badge Earned!',
  levelUp: 'Level Up!',
  congratulations: 'Congratulations!',
  
  language: 'Language',
  theme: 'Theme',
  darkMode: 'Dark Mode',
  lightMode: 'Light Mode',
}

const ar: Translations = {
  appName: 'الشرارة Spark',
  appTagline: 'منصة بناء الشركات الصحية الناشئة',
  
  dashboard: 'لوحة التحكم',
  brainstorm: 'العصف الذهني',
  story: 'القصة',
  brand: 'العلامة التجارية',
  prd: 'وثيقة المنتج',
  code: 'الكود البرمجي',
  github: 'جيت هاب',
  
  brainstormDesc: 'حدّد مشكلتك الصحية',
  storyDesc: 'صُغ قصة مؤسسك',
  brandDesc: 'ابنِ هويتك البصرية',
  prdDesc: 'اكتب مواصفات منتجك',
  codeDesc: 'أنشئ كوداً جاهزاً للإنتاج',
  githubDesc: 'ادفع إلى مستودعك',
  
  continue: 'متابعة',
  back: 'رجوع',
  save: 'حفظ',
  generate: 'توليد',
  regenerate: 'إعادة التوليد',
  cancel: 'إلغاء',
  done: 'تم',
  next: 'التالي',
  skip: 'تخطي',
  export: 'تصدير',
  copy: 'نسخ',
  download: 'تنزيل',
  
  locked: 'مقفل',
  completed: 'مكتمل',
  inProgress: 'قيد التنفيذ',
  unlocked: 'مفتوح',
  
  level: 'المستوى',
  xp: 'نقاط XP',
  badges: 'الشارات',
  streak: 'التسلسل',
  days: 'أيام',
  
  journeyProgress: 'تقدم الرحلة',
  yourBadges: 'شاراتك',
  currentPhase: 'المرحلة الحالية',
  startJourney: 'ابدأ رحلتك',
  continueJourney: 'واصل الرحلة',
  
  brainstormTitle: 'لوحة العصف الذهني',
  brainstormSubtitle: 'استكشف فكرتك الصحية واكتشف المفاهيم المرتبطة',
  enterHealthcareIdea: 'أدخل فكرتك أو مشكلتك الصحية',
  ideaPlaceholder: 'مثال: جدولة مواعيد المرضى معطوبة في العيادات السعودية...',
  relatedConcepts: 'المفاهيم المرتبطة',
  conceptCard: 'بطاقة المفهوم',
  problem: 'المشكلة',
  targetUsers: 'المستخدمون المستهدفون',
  solution: 'الحل',
  saveConcept: 'حفظ المفهوم',
  generatingConcepts: 'جاري توليد المفاهيم المرتبطة...',
  
  storyTitle: 'صانع القصص',
  storySubtitle: 'حوّل مفهومك إلى قصة مؤسس مقنعة',
  storyTemplate: 'قالب القصة',
  toneLabel: 'أسلوب القصة',
  formal: 'رسمي',
  casual: 'غير رسمي',
  generateStory: 'أنشئ قصتي',
  yourStory: 'قصتك',
  clarityScore: 'الوضوح',
  emotionScore: 'التأثير العاطفي',
  
  brandTitle: 'استوديو العلامة التجارية',
  brandSubtitle: 'ابنِ هويتك البصرية بمساعدة الذكاء الاصطناعي',
  personalityQuiz: 'اختبار الشخصية',
  brandName: 'اسم العلامة التجارية',
  tagline: 'الشعار',
  colorPalette: 'لوحة الألوان',
  logoIcon: 'أيقونة الشعار',
  generateBrand: 'أنشئ العلامة التجارية',
  
  prdTitle: 'ورشة وثيقة المنتج',
  prdSubtitle: 'ابنِ وثيقة متطلبات منتج جاهزة للمستثمرين',
  sections: 'الأقسام',
  completeness: 'الاكتمال',
  regulatoryChecklist: 'قائمة التحقق التنظيمي',
  exportPDF: 'تصدير PDF',
  investorReady: 'جاهز للمستثمرين',
  
  codeTitle: 'مولّد الكود',
  codeSubtitle: 'حوّل وثيقة منتجك إلى كود جاهز للإنتاج',
  selectTemplate: 'اختر القالب',
  landingPage: 'صفحة هبوط',
  webApp: 'تطبيق ويب',
  adminDashboard: 'لوحة تحكم',
  selectFeatures: 'اختر الميزات',
  generateCode: 'أنشئ الكود',
  codePreview: 'معاينة الكود',
  
  githubTitle: 'تكامل GitHub',
  githubSubtitle: 'ادفع كودك المولّد إلى مستودع GitHub حقيقي',
  repoName: 'اسم المستودع',
  visibility: 'الرؤية',
  publicRepo: 'عام',
  privateRepo: 'خاص',
  deploymentPlatforms: 'منصات النشر',
  createRepo: 'إنشاء المستودع',
  success: 'نجح!',
  repoCreated: 'تم إنشاء مستودعك',
  
  generatingWithAI: 'جاري التوليد بالذكاء الاصطناعي...',
  healthcareFacts: [
    'تهدف رؤية المملكة 2030 إلى خصخصة 290 مستشفى',
    'من المتوقع أن يصل سوق الرعاية الصحية في منطقة الشرق الأوسط وشمال أفريقيا إلى 243 مليار دولار بحلول 2030',
    'نفيس يُحدث ثورة في التأمين الصحي في المملكة العربية السعودية',
    '70٪ من شركات الذكاء الاصطناعي الصحية السعودية تركز على التشخيص',
    'المملكة العربية السعودية لديها أعلى معدل انتشار للهاتف الذكي في منطقة الشرق الأوسط بنسبة 97٪',
    'تستهدف استراتيجية الصحة الرقمية السعودية 70٪ من الخدمات الصحية عبر الإنترنت بحلول 2030',
    'تنمو مراقبة المرضى عن بُعد بنسبة 25٪ سنوياً في دول الخليج',
    'تضاعف اعتماد الذكاء الاصطناعي في الرعاية الصحية في المملكة العربية السعودية عام 2024',
  ],
  
  aiError: 'فشل توليد الذكاء الاصطناعي. يرجى المحاولة مرة أخرى.',
  retry: 'إعادة المحاولة',
  
  phaseComplete: 'اكتملت المرحلة!',
  badgeEarned: 'حصلت على شارة!',
  levelUp: 'ارتقاء مستوى!',
  congratulations: 'تهانينا!',
  
  language: 'اللغة',
  theme: 'المظهر',
  darkMode: 'الوضع الداكن',
  lightMode: 'الوضع الفاتح',
}

export const translations: Record<Language, Translations> = { en, ar }
