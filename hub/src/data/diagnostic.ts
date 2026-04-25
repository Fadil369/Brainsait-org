import type { DiagnosticQuestion, DiagnosticOption, InnovationProfile, Tool, ProfileKey, SpaceModule } from '@/types'

export const DIAGNOSTIC_QUESTIONS: DiagnosticQuestion[] = [
  // Strategy (7 total — 5 original + 2 extra)
  { module: 'الاستراتيجية', moduleEn: 'strategy', color: 'blue', q: 'منظمتي/فريق لديها مجموعة واضحة من أهداف الابتكار لتوجيه جهود الابتكار.' },
  { module: 'الاستراتيجية', moduleEn: 'strategy', color: 'blue', q: 'منظمتي/فريق يفهم ما هو مطلوب من الموارد والقدرات لتنفيذ أنشطة الابتكار وتحقيق الأهداف.' },
  { module: 'الاستراتيجية', moduleEn: 'strategy', color: 'blue', q: 'منظمتي/فريق تعامل جهود الابتكار كمحفظة استثمارات توازن بين المخاطر والمكافآت.' },
  { module: 'الاستراتيجية', moduleEn: 'strategy', color: 'blue', q: 'منظمتي/فريق تقيّم الاتجاهات والتقنيات الناشئة عند رسم مسار جهود الابتكار.' },
  { module: 'الاستراتيجية', moduleEn: 'strategy', color: 'blue', q: 'منظمتي/فريق تعتبر النظام البيئي الأوسع عند اختيار تكتيكات واستراتيجيات الابتكار.' },
  { module: 'الاستراتيجية', moduleEn: 'strategy', color: 'blue', q: 'منظمتي/فريق لديها خارطة طريق واضحة لمشاريع الابتكار المستقبلية.' },
  { module: 'الاستراتيجية', moduleEn: 'strategy', color: 'blue', q: 'منظمتي/فريق تراجع وتُحدّث استراتيجيتها الابتكارية بانتظام.' },
  // Partnerships (5 total)
  { module: 'الشراكات', moduleEn: 'partnerships', color: 'emerald', q: 'منظمتي/فريق تفهم كيفية التواصل القيمة لجذب الشركاء المحتملين.' },
  { module: 'الشراكات', moduleEn: 'partnerships', color: 'emerald', q: 'منظمتي/فريق تحدد أولويات الشراكات المحتملة لتعزيز القيمة المشتركة.' },
  { module: 'الشراكات', moduleEn: 'partnerships', color: 'emerald', q: 'منظمتي/فريق تجد شركاء جدد يوفرون قيمة فريدة وتتفاعل معهم بفعالية.' },
  { module: 'الشراكات', moduleEn: 'partnerships', color: 'emerald', q: 'منظمتي/فريق تدير وتخفّف المخاطر المرتبطة بالشراكات بشكل استباقي.' },
  { module: 'الشراكات', moduleEn: 'partnerships', color: 'emerald', q: 'منظمتي/فريق تبني علاقات طويلة المدى مع الشركاء الاستراتيجيين.' },
  // Architecture (5 total)
  { module: 'البنية التحتية', moduleEn: 'architecture', color: 'purple', q: 'منظمتي/فريق تحصل على أفكار جديدة بشكل فعال من مجموعة واسعة من أصحاب المصلحة.' },
  { module: 'البنية التحتية', moduleEn: 'architecture', color: 'purple', q: 'منظمتي/فريق تطبق تقنيات التصميم المرتكز على المستخدم لضمان أن الحلول تعكس احتياجات المستخدمين النهائيين.' },
  { module: 'البنية التحتية', moduleEn: 'architecture', color: 'purple', q: 'منظمتي/فريق تخطط للتوسع عبر عمليات تطوير الحلول والاختبار.' },
  { module: 'البنية التحتية', moduleEn: 'architecture', color: 'purple', q: 'منظمتي/فريق تتنظم لتنفيذ الابتكار بفعالية.' },
  { module: 'البنية التحتية', moduleEn: 'architecture', color: 'purple', q: 'منظمتي/فريق لديها أنظمة رقمية فعالة لإدارة أفكار ومشاريع الابتكار.' },
  // Culture (5 total)
  { module: 'الثقافة', moduleEn: 'culture', color: 'orange', q: 'منظمتي/فريق أقامت ثقافة التعلم بناءً على نجاحات وإخفاقات الابتكار.' },
  { module: 'الثقافة', moduleEn: 'culture', color: 'orange', q: 'منظمتي/فريق تقدم إرشادات حول تحديد ما يشكل حدود المخاطر "المقبولة".' },
  { module: 'الثقافة', moduleEn: 'culture', color: 'orange', q: 'منظمتي/فريق تخلق حوافز لتحمل المخاطر الاستراتيجية من خلال الابتكار.' },
  { module: 'الثقافة', moduleEn: 'culture', color: 'orange', q: 'منظمتي/فريق تفهم كيفية إشراك الهيئات الحاكمة بفعالية حول الابتكار.' },
  { module: 'الثقافة', moduleEn: 'culture', color: 'orange', q: 'الموظفون في منظمتي/فريق يشعرون بالحرية في تجربة أفكار جديدة حتى لو كانت مخاطرة.' },
  // Evaluation (5 total)
  { module: 'التقييم', moduleEn: 'evaluation', color: 'red', q: 'منظمتي/فريق تقيّم بيئتها التمكينية للابتكار (الثقافة، البنية التحتية، الشراكات).' },
  { module: 'التقييم', moduleEn: 'evaluation', color: 'red', q: 'منظمتي/فريق تفهم أي من مشاريع الابتكار تحقق التأثير المطلوب.' },
  { module: 'التقييم', moduleEn: 'evaluation', color: 'red', q: 'منظمتي/فريق تحلل صحة خط إنتاج المشاريع عبر دورة حياة الابتكار.' },
  { module: 'التقييم', moduleEn: 'evaluation', color: 'red', q: 'منظمتي/فريق تتواصل بفعالية مع أصحاب المصلحة حول نتائج الابتكار.' },
  { module: 'التقييم', moduleEn: 'evaluation', color: 'red', q: 'منظمتي/فريق تستخدم بيانات التقييم لتحسين عمليات الابتكار المستمرة.' },
]

export const DIAGNOSTIC_OPTIONS: DiagnosticOption[] = [
  { text: 'لا أوافق بشدة', value: 1 },
  { text: 'لا أوافق', value: 2 },
  { text: 'محايد', value: 3 },
  { text: 'أوافق', value: 4 },
  { text: 'أوافق بشدة', value: 5 },
]

export const PROFILES: Record<ProfileKey, InnovationProfile> = {
  motivator: {
    emoji: '🔥',
    name: 'المحفِّز',
    desc: 'أنت الأقوى في تطوير ثقافة الابتكار وتحفيز الآخرين. تتميز بقدرتك على خلق بيئة تشجع على الابتكار والتجريب.',
  },
  strategist: {
    emoji: '🎯',
    name: 'الاستراتيجي',
    desc: 'أنت الأقوى في وضع استراتيجية واضحة للابتكار. تتميز بقدرتك على رسم المسار المستقبلي وتحديد الأهداف.',
  },
  collaborator: {
    emoji: '🤝',
    name: 'المتعاون',
    desc: 'أنت الأقوى في بناء الشراكات وتحقيق التعاون. تتميز بقدرتك على العثور على الشركاء المناسبين وإدارة العلاقات.',
  },
  implementor: {
    emoji: '⚡',
    name: 'المنفِّذ',
    desc: 'أنت الأقوى في تنفيذ المشاريع وتحقيق النتائج. تتميز بقدرتك على تحويل الأفكار إلى حلول عملية.',
  },
  earlyStage: {
    emoji: '🌱',
    name: 'المبتكر المبكر',
    desc: 'لديك مشاريع ابتكارية لكن تحتاج لاستراتيجية أوضح وبنية تحتية أقوى لتحقيق أقصى تأثير.',
  },
  trailblazer: {
    emoji: '🚀',
    name: 'الرائد',
    desc: 'أنت تقود الابتكار بفعالية مع فهم قوي للنظام البيئي. تتميز بقدرتك على تحقيق نتائج ملموسة وتحفيز الآخرين.',
  },
}

export const TOOLS_BY_MODULE: Record<SpaceModule, Tool[]> = {
  strategy: [
    { name: 'عناوين المستقبل', desc: 'تحديد أهداف الابتكار والرؤيا المستقبلية' },
    { name: 'مخطط السيناريو', desc: 'تحليل السيناريوهات المستقبلية المحتملة' },
    { name: 'تحليل النظام البيئي', desc: 'فهم اللاعبين والعلاقات في نظامك البيئي' },
    { name: 'استراتيجية المحفظة', desc: 'تحليل وتحسين محفظة مشاريعك' },
    { name: 'مخطط الابتكار', desc: 'التخطيط التفصيلي لمشروع ابتكار محدد' },
  ],
  partnerships: [
    { name: 'تحديد قيمة العرض', desc: 'تطوير عرض قيمة مقنع للشركاء' },
    { name: 'العثور على شركاء مختلفين', desc: 'البحث عن شركاء جدد غير تقليديين' },
    { name: 'التحضير للشراكة', desc: 'تصميم وإدارة الشراكات بفعالية' },
    { name: 'تحديد أولويات الشركاء', desc: 'اختيار الشركاء الأفضل موقعاً' },
  ],
  architecture: [
    { name: 'مسح الأفق', desc: 'الحصول على أفكار جديدة لتحديات محددة' },
    { name: 'التصميم المرتكز على المستخدم', desc: 'ضمان تطابق الحلول مع احتياجات المستخدمين' },
    { name: 'من الاختبار إلى التوسع', desc: 'تصميم اختبارات تجريبية للتوسع الناجح' },
    { name: 'نموذج التشغيل', desc: 'دمج الابتكار في العمليات اليومية' },
  ],
  culture: [
    { name: 'احتضان الفشل', desc: 'خلق ثقافة تتعلم من الإخفاقات' },
    { name: 'خلق حوافز وفرص', desc: 'تحفيز السلوكيات الابتكارية' },
    { name: 'تحديد المخاطر الاستراتيجية', desc: 'فهم وتوسيع نطاق تحمل المخاطر' },
    { name: 'إشراك الهيئات الحاكمة', desc: 'الحصول على الدعم من صناع القرار' },
  ],
  evaluation: [
    { name: 'سرد قصص الابتكار', desc: 'التواصل الفعال عن نتائج الابتكار' },
    { name: 'تقييم بوابة-المرحلة', desc: 'تقييم وإدارة مشاريع الابتكار' },
    { name: 'تحليل دورة الحياة', desc: 'تحديد الاختناقات وتحسين العمليات' },
    { name: 'مسح البيئة التمكينية', desc: 'تقييم بيئة الابتكار الحالية' },
  ],
}

export function calculateScores(
  answers: (number | null)[],
  questions: DiagnosticQuestion[],
): Record<SpaceModule, number> {
  const modules: Record<SpaceModule, number[]> = {
    strategy: [], partnerships: [], architecture: [], culture: [], evaluation: [],
  }
  questions.forEach((q, i) => {
    const a = answers[i]
    if (a !== null) modules[q.moduleEn].push(a)
  })
  const result = {} as Record<SpaceModule, number>
  for (const [key, vals] of Object.entries(modules) as [SpaceModule, number[]][]) {
    result[key] = vals.length > 0
      ? Math.round((vals.reduce((a, b) => a + b, 0) / (vals.length * 5)) * 100)
      : 0
  }
  return result
}

export function determineProfile(scores: Record<SpaceModule, number>): ProfileKey {
  const entries = (Object.entries(scores) as [SpaceModule, number][]).sort((a, b) => b[1] - a[1])
  const top = entries[0][0]

  if (top === 'culture' && scores.culture >= 60) return 'motivator'
  if (top === 'strategy' && scores.strategy >= 60) return 'strategist'
  if (top === 'partnerships' && scores.partnerships >= 60) return 'collaborator'
  if (top === 'architecture' && scores.architecture >= 60) return 'implementor'

  const avg = Object.values(scores).reduce((a, b) => a + b, 0) / 5
  if (avg < 40) return 'earlyStage'
  if (avg >= 70) return 'trailblazer'

  const map: Record<SpaceModule, ProfileKey> = {
    culture: 'motivator', strategy: 'strategist', partnerships: 'collaborator',
    architecture: 'implementor', evaluation: 'trailblazer',
  }
  return map[top] ?? 'earlyStage'
}
