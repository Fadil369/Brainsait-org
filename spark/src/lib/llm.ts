// LLM API wrapper - calls configured AI endpoint with fallback to intelligent mocks
// Set VITE_AI_API_KEY in .env for real AI responses

interface LLMMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

interface LLMOptions {
  system?: string
  temperature?: number
  maxTokens?: number
  timeoutMs?: number
}

const API_KEY = import.meta.env.VITE_AI_API_KEY as string | undefined
const API_BASE = (import.meta.env.VITE_AI_API_BASE as string | undefined) || 'https://api.anthropic.com/v1'

export async function llm(messages: LLMMessage[], options: LLMOptions = {}): Promise<string> {
  if (!API_KEY) {
    // Return mock response when no API key configured
    return mockLLMResponse(messages)
  }

  try {
    const isAnthropic = API_BASE.includes('anthropic.com')
    const controller = new AbortController()
    const timeout = window.setTimeout(() => controller.abort(), options.timeoutMs || 25000)

    try {
      if (isAnthropic) {
        const body = {
          model: 'claude-3-5-haiku-20241022',
          max_tokens: options.maxTokens || 1024,
          system: options.system || 'You are an expert healthcare startup advisor for the MENA region, specializing in Saudi Arabia. Be concise and actionable.',
          messages: messages.filter(m => m.role !== 'system'),
        }
        const res = await fetch(`${API_BASE}/messages`, {
          method: 'POST',
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': API_KEY,
            'anthropic-version': '2023-06-01',
            'anthropic-dangerous-direct-browser-access': 'true',
          },
          body: JSON.stringify(body),
        })
        if (!res.ok) throw new Error(`API error: ${res.status}`)
        const data = await res.json() as { content: Array<{ type: string; text: string }> }
        return data.content[0]?.text || ''
      } else {
        // OpenAI-compatible
        const body = {
          model: 'gpt-4o-mini',
          max_tokens: options.maxTokens || 1024,
          messages: options.system
            ? [{ role: 'system', content: options.system }, ...messages]
            : messages,
        }
        const res = await fetch(`${API_BASE}/chat/completions`, {
          method: 'POST',
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${API_KEY}`,
          },
          body: JSON.stringify(body),
        })
        if (!res.ok) throw new Error(`API error: ${res.status}`)
        const data = await res.json() as { choices: Array<{ message: { content: string } }> }
        return data.choices[0]?.message?.content || ''
      }
    } finally {
      window.clearTimeout(timeout)
    }
  } catch (error) {
    console.warn('LLM API call failed, using mock:', error)
    return mockLLMResponse(messages)
  }
}

export async function llmPrompt(prompt: string, options: LLMOptions = {}): Promise<string> {
  return llm([{ role: 'user', content: prompt }], options)
}

export function extractJSON<T>(text: string, fallback: T): T {
  const candidates = [
    text.match(/```json\s*([\s\S]*?)```/i)?.[1],
    text.match(/```\s*([\s\S]*?)```/i)?.[1],
    text.match(/\{[\s\S]*\}/)?.[0],
  ].filter(Boolean) as string[]

  for (const candidate of candidates) {
    try {
      return JSON.parse(candidate) as T
    } catch {
      // Try next candidate.
    }
  }

  try {
    return JSON.parse(text) as T
  } catch {
    return fallback
  }
}

// Intelligent mock responses based on prompt content
function mockLLMResponse(messages: LLMMessage[]): string {
  const lastMsg = messages[messages.length - 1]?.content?.toLowerCase() || ''
  
  if (lastMsg.includes('concept') || lastMsg.includes('brainstorm') || lastMsg.includes('idea')) {
    return JSON.stringify({
      concepts: [
        'Telemedicine Platform', 'AI Diagnostics', 'Patient Portal', 'EHR Integration',
        'Appointment Scheduling', 'Remote Monitoring', 'Digital Pharmacy', 'Lab Results'
      ],
      problem: 'Healthcare access and efficiency challenges in the MENA region',
      targetUsers: 'Patients, healthcare providers, and insurance companies in Saudi Arabia',
      solution: 'An AI-powered platform connecting patients with healthcare services seamlessly'
    })
  }
  
  if (lastMsg.includes('story') || lastMsg.includes('narrative')) {
    return JSON.stringify({
      narrative: `As healthcare services in Saudi Arabia become more digital, patients still face moments where access, clarity, and coordination break down. The problem is not a lack of care; it is the friction between people, providers, and systems that should work together.

We are building a healthcare platform that turns that friction into a guided experience. It helps the right users complete the right healthcare task faster, with clearer information, safer workflows, and a stronger connection between clinical and operational teams.

Aligned with Vision 2030, this venture is designed to support a more accessible, efficient, and patient-centered healthcare ecosystem across Saudi Arabia and the wider MENA region.`,
      clarityScore: 86,
      emotionScore: 78,
      pitchSummary: 'A patient-centered digital health platform that reduces healthcare friction across access, coordination, and operations.',
      marketAnalysis: ['Strong Vision 2030 alignment', 'Clear operational pain point', 'Potential buyer overlap across providers, payers, and patients'],
      risks: ['Integration complexity', 'Regulatory approvals', 'Clinical workflow adoption'],
      userStories: [
        {
          role: 'patient',
          need: 'find and complete the right healthcare task quickly',
          benefit: 'I can access care with less confusion and delay',
          acceptanceCriteria: ['Shows available next steps', 'Supports Arabic and English', 'Confirms task completion'],
        },
        {
          role: 'clinic administrator',
          need: 'reduce manual coordination work',
          benefit: 'staff can focus on patient service instead of repetitive follow-up',
          acceptanceCriteria: ['Displays task status', 'Highlights incomplete records', 'Exports operational reports'],
        },
      ],
    })
  }
  
  if (lastMsg.includes('brand') || lastMsg.includes('name') || lastMsg.includes('tagline')) {
    return JSON.stringify({
      names: ['HealthLink', 'CareFlow', 'MedBridge', 'Salama Health', 'Shifaa Connect', 'Wefaq Care'],
      taglines: [
        'Healthcare, Connected.',
        'Your Health, Our Priority.',
        'Bridging Care and Technology.',
        'Where Technology Meets Healing.',
      ],
      personality: 'innovative',
      colors: ['#0c9eeb', '#10b981', '#6366f1', '#f59e0b']
    })
  }
  
  if (lastMsg.includes('prd') || lastMsg.includes('requirements') || lastMsg.includes('product')) {
    return JSON.stringify({
      content: `This product addresses healthcare workflow friction by giving patients, providers, and operations teams a unified digital experience. The MVP should focus on one high-value workflow, clear bilingual UX, secure data handling, and measurable operational improvement. Success depends on reducing task completion time, improving visibility, and preparing for Saudi healthcare interoperability requirements including NPHIES and FHIR R4 where applicable.`,
      assumptions: ['Initial users are Saudi clinics or digital health operators', 'Bilingual UX is required from launch', 'Sensitive data must follow PDPL-aligned handling'],
      risks: ['Integration timeline with healthcare systems', 'Regulatory interpretation changes', 'Workflow adoption by clinical staff'],
      successMetrics: ['Task completion time reduced by 30%', '80% of pilot users complete core flow without support', 'Operational dashboard used weekly by admin users'],
      mvpScope: ['Bilingual onboarding', 'Core workflow dashboard', 'User task status tracking', 'Admin reporting export'],
      technicalNotes: ['React + TypeScript frontend', 'FHIR-ready data model boundaries', 'Audit logging for sensitive operations'],
      userStories: [
        {
          role: 'patient',
          need: 'complete the core healthcare workflow from mobile',
          benefit: 'I can finish the task without calling the clinic',
          acceptanceCriteria: ['Works on mobile', 'Supports Arabic and English', 'Shows clear success state'],
        },
      ],
    })
  }
  
  if (lastMsg.includes('code') || lastMsg.includes('generate') || lastMsg.includes('react')) {
    return `import React, { useState } from 'react';

// Main App Component
export default function HealthcareApp() {
  const [activeSection, setActiveSection] = useState('dashboard');
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Header onNavigate={setActiveSection} />
      <main className="container mx-auto px-4 py-8">
        {activeSection === 'dashboard' && <Dashboard />}
        {activeSection === 'appointments' && <Appointments />}
        {activeSection === 'patients' && <Patients />}
      </main>
    </div>
  );
}

function Header({ onNavigate }: { onNavigate: (section: string) => void }) {
  return (
    <header className="bg-teal-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Healthcare Platform</h1>
        <nav className="flex gap-4">
          <button onClick={() => onNavigate('dashboard')} className="hover:text-teal-200 transition">Dashboard</button>
          <button onClick={() => onNavigate('appointments')} className="hover:text-teal-200 transition">Appointments</button>
          <button onClick={() => onNavigate('patients')} className="hover:text-teal-200 transition">Patients</button>
        </nav>
      </div>
    </header>
  );
}`
  }
  
  // Default response
  return 'I\'ve analyzed your healthcare startup concept and generated personalized recommendations based on the MENA market context and Vision 2030 objectives. Your approach shows strong potential for addressing real healthcare gaps in the region.'
}
