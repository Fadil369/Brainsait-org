import Anthropic from '@anthropic-ai/sdk';

export interface Env {
  // LLM configuration
  ANTHROPIC_API_KEY: string;
  ANTHROPIC_MODEL?: string; // optional override for model selection
  ANTHROPIC_PROVIDER?: 'claude' | 'vllm' | 'github'; // LLM provider (default: 'claude')
  
  // vLLM Configuration (for local/self-hosted models)
  VLLM_API_KEY?: string;
  VLLM_BASE_URL?: string; // e.g., 'http://localhost:8000/v1'

  // GitHub Models configuration
  GITHUB_TOKEN?: string;
  GITHUB_MODEL?: string; // e.g., 'deepseek/DeepSeek-V3-0324'
  GITHUB_MODELS_BASE_URL?: string; // defaults to 'https://models.github.ai/inference'
  
  // Cloudflare Resources
  DB: D1Database;
  R2_STORAGE: R2Bucket;
  CACHE: KVNamespace;
  SESSIONS: KVNamespace;
  RATE_LIMIT: KVNamespace;
  
  // Twilio Voice
  TWILIO_ACCOUNT_SID: string;
  TWILIO_AUTH_TOKEN: string;
  TWILIO_PHONE_NUMBER: string;
  
  // Speech & AI Providers (optional)
  OPENAI_API_KEY?: string;
  OPENAI_TTS_VOICE?: string; // e.g., 'alloy'
  
  // WhatsApp Business
  WHATSAPP_BUSINESS_TOKEN: string;
  WHATSAPP_PHONE_NUMBER_ID: string;
  
  // Security
  JWT_SECRET: string;
  ENCRYPTION_KEY: string;
  
  // Environment
  ENVIRONMENT: 'development' | 'production';
}

export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface VisitorData {
  visitorId?: string;
  userId?: string;
  name?: string;
  phone?: string;
  email?: string;
  company?: string;
  title?: string;
  language?: 'en' | 'ar' | 'mixed';
  appointment_requested?: boolean;
  preferred_time?: string;
  inquiry_type?: string;
  [key: string]: any;
}

export interface CallLog {
  id: string;
  user_id: string;
  visitor_id: string | null;
  call_type: 'inbound' | 'outbound';
  duration_seconds: number;
  language: string;
  summary: string;
  sentiment: string;
  transcript_url: string;
  action_items: Array<{ action: string; deadline: string }>;
  created_at: number;
}

export interface Appointment {
  id: string;
  user_id: string;
  visitor_id: string | null;
  title: string;
  description?: string;
  type: 'demo' | 'consultation' | 'technical' | 'partnership' | 'support' | 'other';
  start_time: number;
  end_time: number;
  timezone: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  meeting_link?: string;
  location?: string;
  attendees?: string[];
  created_at: number;
  updated_at: number;
}

export interface Visitor {
  id: string;
  user_id: string;
  name?: string;
  phone?: string;
  email?: string;
  company?: string;
  title?: string;
  source: string;
  language: string;
  country?: string;
  timezone?: string;
  first_contact: number;
  last_contact: number;
  total_interactions: number;
  lead_score: number;
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
  tags?: string[];
  metadata?: Record<string, any>;
}
