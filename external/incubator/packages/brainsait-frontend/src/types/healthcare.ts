// Healthcare SME Types
export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
  success: boolean;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
  createdAt: string;
  updatedAt: string;
}

export interface HealthcareSME {
  id: string;
  userId: string;
  user?: User;
  specialization: Specialization;
  yearsOfExperience: number;
  currentPosition: string;
  institution: string;
  licenseNumber: string;
  licenseCountry: string;
  certifications: string[];
  researchInterests: string[];
  publications: Publication[];
  aiExperienceLevel: AIExperienceLevel;
  interestedAIApplications: AIApplication[];
  preferredLanguages: Language[];
  timeZone: string;
  availabilityForMentoring: boolean;
  willingToShareCaseStudies: boolean;
  status: SMEStatus;
  verificationRequestedAt?: string;
  verifiedAt?: string;
  onboardingCompletedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AIChampion {
  id: string;
  userId: string;
  healthcareSMEId: string;
  user?: User;
  healthcareSME?: HealthcareSME;
  level: ChampionLevel;
  specializations: AIApplication[];
  mentorshipCapacity: number;
  availableMenteeSlots: number;
  availableHoursPerWeek: number;
  preferredMenteeLevel: AIExperienceLevel[];
  languagesOffered: Language[];
  timeZone: string;
  bio: string;
  achievements: Achievement[];
  socialLinks: SocialLinks;
  status: ChampionStatus;
  applicationDate: string;
  approvedAt?: string;
  metrics?: ChampionMetrics;
  activeMentorships?: Mentorship[];
  pendingApplications?: MentorshipApplication[];
  reviews?: ChampionReview[];
  createdAt: string;
  updatedAt: string;
}

export interface MentorshipApplication {
  id: string;
  championId: string;
  menteeId: string;
  champion?: AIChampion;
  mentee?: HealthcareSME;
  goals: string[];
  currentLevel: AIExperienceLevel;
  timeCommitment: TimeCommitment;
  preferredLanguage: Language;
  previousExperience: string;
  specificInterests: string[];
  expectedDuration: Duration;
  status: ApplicationStatus;
  appliedAt: string;
  reviewedAt?: string;
  reviewMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Mentorship {
  id: string;
  championId: string;
  menteeId: string;
  champion?: AIChampion;
  mentee?: HealthcareSME;
  startDate: string;
  endDate?: string;
  expectedEndDate?: string;
  goals: string[];
  status: MentorshipStatus;
  progress: number;
  sessions?: MentorshipSession[];
  feedback?: MentorshipFeedback[];
  createdAt: string;
  updatedAt: string;
}

export interface MentorshipSession {
  id: string;
  mentorshipId: string;
  mentorship?: Mentorship;
  scheduledAt: string;
  actualStartTime?: string;
  actualEndTime?: string;
  duration: number;
  agenda: string[];
  status: SessionStatus;
  meetingLink?: string;
  notes?: string;
  homework?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface MentorshipFeedback {
  id: string;
  sessionId: string;
  session?: MentorshipSession;
  fromUserId: string;
  fromUser?: User;
  rating: number;
  feedback: string;
  topicsCovered: string[];
  homeworkCompleted: boolean;
  nextSessionGoals: string[];
  createdAt: string;
}

export interface ChampionMetrics {
  id: string;
  championId: string;
  menteesHelped: number;
  sessionsCompleted: number;
  averageRating: number;
  totalHoursContributed: number;
  lastUpdated: string;
}

export interface ChampionReview {
  id: string;
  championId: string;
  reviewerId: string;
  reviewer?: User;
  mentorshipId: string;
  mentorship?: Mentorship;
  rating: number;
  comment: string;
  isPublic: boolean;
  createdAt: string;
}

export interface OnboardingSurvey {
  id: string;
  healthcareSMEId: string;
  currentChallenges: Challenge[];
  expectedAIBenefits: AIBenefit[];
  implementationConcerns: Concern[];
  preferredLearningFormats: LearningFormat[];
  availableTimePerWeek: TimeAvailability;
  organizationalReadiness: OrganizationalReadiness;
  completedAt: string;
  createdAt: string;
}

export interface LearningProgress {
  id: string;
  userId: string;
  moduleId: string;
  moduleName: string;
  progress: number;
  timeSpent: number;
  completed: boolean;
  completedAt?: string;
  lastAccessedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface CaseStudy {
  id: string;
  authorId: string;
  author?: HealthcareSME;
  title: string;
  description: string;
  specialization: Specialization;
  aiTechnologies: AIApplication[];
  outcomes: string;
  challenges: string;
  lessons: string[];
  attachments: string[];
  isPublic: boolean;
  likes: number;
  views: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface DiscussionForum {
  id: string;
  name: string;
  description: string;
  category: ForumCategory;
  moderators: string[];
  memberCount: number;
  postCount: number;
  isPrivate: boolean;
  createdAt: string;
}

export interface DiscussionPost {
  id: string;
  forumId: string;
  authorId: string;
  author?: User;
  title: string;
  content: string;
  tags: string[];
  likes: number;
  replies: number;
  views: number;
  isPinned: boolean;
  isLocked: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  type: EventType;
  startTime: string;
  endTime: string;
  timeZone: string;
  isVirtual: boolean;
  meetingLink?: string;
  location?: string;
  capacity: number;
  registeredCount: number;
  speakers: EventSpeaker[];
  agenda: EventAgendaItem[];
  tags: string[];
  isRecorded: boolean;
  recordingUrl?: string;
  createdAt: string;
}

// Enums
export enum Specialization {
  CARDIOLOGY = 'CARDIOLOGY',
  NEUROLOGY = 'NEUROLOGY',
  ONCOLOGY = 'ONCOLOGY',
  PEDIATRICS = 'PEDIATRICS',
  PSYCHIATRY = 'PSYCHIATRY',
  SURGERY = 'SURGERY',
  EMERGENCY_MEDICINE = 'EMERGENCY_MEDICINE',
  INTERNAL_MEDICINE = 'INTERNAL_MEDICINE',
  RADIOLOGY = 'RADIOLOGY',
  PATHOLOGY = 'PATHOLOGY',
  ANESTHESIOLOGY = 'ANESTHESIOLOGY',
  DERMATOLOGY = 'DERMATOLOGY',
  OPHTHALMOLOGY = 'OPHTHALMOLOGY',
  ORTHOPEDICS = 'ORTHOPEDICS',
  GYNECOLOGY = 'GYNECOLOGY',
  UROLOGY = 'UROLOGY',
  ENT = 'ENT',
  REHABILITATION = 'REHABILITATION',
  PHARMACY = 'PHARMACY',
  NURSING = 'NURSING',
  ADMINISTRATION = 'ADMINISTRATION',
  RESEARCH = 'RESEARCH',
  PUBLIC_HEALTH = 'PUBLIC_HEALTH',
  HEALTH_INFORMATICS = 'HEALTH_INFORMATICS'
}

export enum AIApplication {
  DIAGNOSTIC_ASSISTANCE = 'DIAGNOSTIC_ASSISTANCE',
  TREATMENT_PLANNING = 'TREATMENT_PLANNING',
  DRUG_DISCOVERY = 'DRUG_DISCOVERY',
  MEDICAL_IMAGING = 'MEDICAL_IMAGING',
  CLINICAL_DECISION_SUPPORT = 'CLINICAL_DECISION_SUPPORT',
  PATIENT_MONITORING = 'PATIENT_MONITORING',
  PREDICTIVE_ANALYTICS = 'PREDICTIVE_ANALYTICS',
  NATURAL_LANGUAGE_PROCESSING = 'NATURAL_LANGUAGE_PROCESSING',
  ROBOTIC_SURGERY = 'ROBOTIC_SURGERY',
  TELEMEDICINE = 'TELEMEDICINE',
  HEALTH_RECORDS_MANAGEMENT = 'HEALTH_RECORDS_MANAGEMENT',
  RESEARCH_AUTOMATION = 'RESEARCH_AUTOMATION',
  QUALITY_ASSURANCE = 'QUALITY_ASSURANCE',
  WORKFLOW_OPTIMIZATION = 'WORKFLOW_OPTIMIZATION'
}

export enum AIExperienceLevel {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
  EXPERT = 'EXPERT'
}

export enum Language {
  EN = 'EN',
  AR = 'AR',
  FR = 'FR',
  ES = 'ES',
  DE = 'DE',
  JA = 'JA',
  ZH = 'ZH'
}

export enum SMEStatus {
  PENDING_VERIFICATION = 'PENDING_VERIFICATION',
  VERIFIED = 'VERIFIED',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED'
}

export enum ChampionLevel {
  JUNIOR = 'JUNIOR',
  SENIOR = 'SENIOR',
  LEAD = 'LEAD'
}

export enum ChampionStatus {
  PENDING_REVIEW = 'PENDING_REVIEW',
  APPROVED = 'APPROVED',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED'
}

export enum ApplicationStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  WITHDRAWN = 'WITHDRAWN'
}

export enum MentorshipStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  PAUSED = 'PAUSED',
  CANCELLED = 'CANCELLED'
}

export enum SessionStatus {
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW'
}

export enum TimeCommitment {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH'
}

export enum Duration {
  ONE_MONTH = '1_MONTH',
  THREE_MONTHS = '3_MONTHS',
  SIX_MONTHS = '6_MONTHS',
  ONE_YEAR = '1_YEAR'
}

export enum Challenge {
  TIME_CONSTRAINTS = 'TIME_CONSTRAINTS',
  INFORMATION_OVERLOAD = 'INFORMATION_OVERLOAD',
  DIAGNOSTIC_UNCERTAINTY = 'DIAGNOSTIC_UNCERTAINTY',
  TREATMENT_DECISIONS = 'TREATMENT_DECISIONS',
  PATIENT_COMMUNICATION = 'PATIENT_COMMUNICATION',
  ADMINISTRATIVE_BURDEN = 'ADMINISTRATIVE_BURDEN',
  RESEARCH_ACCESS = 'RESEARCH_ACCESS',
  CONTINUING_EDUCATION = 'CONTINUING_EDUCATION',
  TECHNOLOGY_ADOPTION = 'TECHNOLOGY_ADOPTION',
  COST_MANAGEMENT = 'COST_MANAGEMENT',
  QUALITY_METRICS = 'QUALITY_METRICS',
  REGULATORY_COMPLIANCE = 'REGULATORY_COMPLIANCE'
}

export enum AIBenefit {
  FASTER_DIAGNOSIS = 'FASTER_DIAGNOSIS',
  IMPROVED_ACCURACY = 'IMPROVED_ACCURACY',
  REDUCED_WORKLOAD = 'REDUCED_WORKLOAD',
  BETTER_OUTCOMES = 'BETTER_OUTCOMES',
  COST_REDUCTION = 'COST_REDUCTION',
  ENHANCED_RESEARCH = 'ENHANCED_RESEARCH',
  PERSONALIZED_TREATMENT = 'PERSONALIZED_TREATMENT',
  PREDICTIVE_INSIGHTS = 'PREDICTIVE_INSIGHTS',
  WORKFLOW_AUTOMATION = 'WORKFLOW_AUTOMATION',
  DECISION_SUPPORT = 'DECISION_SUPPORT',
  PATIENT_ENGAGEMENT = 'PATIENT_ENGAGEMENT',
  PROFESSIONAL_DEVELOPMENT = 'PROFESSIONAL_DEVELOPMENT'
}

export enum Concern {
  DATA_PRIVACY = 'DATA_PRIVACY',
  ALGORITHMIC_BIAS = 'ALGORITHMIC_BIAS',
  RELIABILITY = 'RELIABILITY',
  COST = 'COST',
  TRAINING_REQUIREMENTS = 'TRAINING_REQUIREMENTS',
  INTEGRATION_COMPLEXITY = 'INTEGRATION_COMPLEXITY',
  REGULATORY_APPROVAL = 'REGULATORY_APPROVAL',
  PATIENT_ACCEPTANCE = 'PATIENT_ACCEPTANCE',
  STAFF_RESISTANCE = 'STAFF_RESISTANCE',
  TECHNICAL_SUPPORT = 'TECHNICAL_SUPPORT',
  MAINTENANCE = 'MAINTENANCE',
  LIABILITY_ISSUES = 'LIABILITY_ISSUES'
}

export enum LearningFormat {
  INTERACTIVE_TUTORIALS = 'INTERACTIVE_TUTORIALS',
  VIDEO_COURSES = 'VIDEO_COURSES',
  HANDS_ON_WORKSHOPS = 'HANDS_ON_WORKSHOPS',
  CASE_STUDIES = 'CASE_STUDIES',
  PEER_DISCUSSIONS = 'PEER_DISCUSSIONS',
  EXPERT_WEBINARS = 'EXPERT_WEBINARS',
  DOCUMENTATION = 'DOCUMENTATION',
  SIMULATION_ENVIRONMENTS = 'SIMULATION_ENVIRONMENTS',
  MENTORSHIP_PROGRAMS = 'MENTORSHIP_PROGRAMS',
  CONFERENCE_PRESENTATIONS = 'CONFERENCE_PRESENTATIONS'
}

export enum TimeAvailability {
  LESS_THAN_1_HOUR = 'LESS_THAN_1_HOUR',
  ONE_TO_THREE_HOURS = '1_3_HOURS',
  THREE_TO_FIVE_HOURS = '3_5_HOURS',
  FIVE_TO_TEN_HOURS = '5_10_HOURS',
  MORE_THAN_10_HOURS = 'MORE_THAN_10_HOURS'
}

export enum ForumCategory {
  GENERAL_DISCUSSION = 'GENERAL_DISCUSSION',
  AI_APPLICATIONS = 'AI_APPLICATIONS',
  CASE_STUDIES = 'CASE_STUDIES',
  TECHNICAL_SUPPORT = 'TECHNICAL_SUPPORT',
  NETWORKING = 'NETWORKING',
  ANNOUNCEMENTS = 'ANNOUNCEMENTS'
}

export enum EventType {
  WEBINAR = 'WEBINAR',
  WORKSHOP = 'WORKSHOP',
  CONFERENCE = 'CONFERENCE',
  NETWORKING = 'NETWORKING',
  TRAINING = 'TRAINING'
}

// Supporting interfaces
export interface Publication {
  title: string;
  journal: string;
  year: number;
  doi?: string;
  pubmedId?: string;
}

export interface Achievement {
  title: string;
  description: string;
  date: string;
  verificationUrl?: string;
}

export interface SocialLinks {
  linkedIn?: string;
  twitter?: string;
  researchGate?: string;
  personalWebsite?: string;
}

export interface OrganizationalReadiness {
  hasAIStrategy: boolean;
  hasTechnicalTeam: boolean;
  hasDataInfrastructure: boolean;
  hasChangeManagement: boolean;
  hasEthicsGuidelines: boolean;
}

export interface EventSpeaker {
  id: string;
  name: string;
  title: string;
  organization: string;
  bio: string;
  profilePicture?: string;
}

export interface EventAgendaItem {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  speakerId?: string;
}

// Request/Response types
export interface RegistrationRequest {
  specialization: Specialization;
  yearsOfExperience: number;
  currentPosition: string;
  institution: string;
  licenseNumber: string;
  licenseCountry: string;
  certifications?: string[];
  researchInterests?: string[];
  publications?: Publication[];
  aiExperienceLevel: AIExperienceLevel;
  interestedAIApplications: AIApplication[];
  preferredLanguages: Language[];
  timeZone: string;
  availabilityForMentoring: boolean;
  willingToShareCaseStudies: boolean;
  privacyConsent: boolean;
  termsAccepted: boolean;
}

export interface ChampionRegistrationRequest {
  level: ChampionLevel;
  specializations: AIApplication[];
  mentorshipCapacity: number;
  availableHoursPerWeek: number;
  preferredMenteeLevel: AIExperienceLevel[];
  languagesOffered: Language[];
  timeZone: string;
  bio: string;
  achievements?: Achievement[];
  socialLinks?: SocialLinks;
}