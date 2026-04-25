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
    
    if (isAnthropic) {
      const body = {
        model: 'claude-3-5-haiku-20241022',
        max_tokens: options.maxTokens || 1024,
        system: options.system || 'You are an expert healthcare startup advisor for the MENA region, specializing in Saudi Arabia. Be concise and actionable.',
        messages: messages.filter(m => m.role !== 'system'),
      }
      const res = await fetch(`${API_BASE}/messages`, {
        method: 'POST',
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
  } catch (error) {
    console.warn('LLM API call failed, using mock:', error)
    return mockLLMResponse(messages)
  }
}

export async function llmPrompt(prompt: string, options: LLMOptions = {}): Promise<string> {
  return llm([{ role: 'user', content: prompt }], options)
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
    return `As a healthcare professional who witnessed firsthand the fragmentation in our system, I knew there had to be a better way. Every day, patients struggled with [the problem]. The impact was profound—families unable to access care, providers overwhelmed by administrative burden, and a system crying out for innovation.

That's why I founded [Company Name]. Our mission is simple: leverage technology to make quality healthcare accessible to every person in Saudi Arabia and across the MENA region. We've built a platform that [solution description], and the results speak for themselves.

Vision 2030 has created an unprecedented opportunity for healthcare innovation in the Kingdom. We're not just building a product—we're contributing to a healthier future for our nation.`
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
    return `## Executive Summary
Our platform addresses critical healthcare access challenges in Saudi Arabia by providing a comprehensive digital health solution aligned with Vision 2030 objectives.

## Problem Statement
Healthcare providers face fragmented systems, while patients experience barriers to accessing quality care. Administrative burden consumes 30% of provider time, reducing capacity for direct patient care.

## Target Users
**Primary**: Healthcare providers (physicians, nurses, administrators) in Saudi Arabia
**Secondary**: Patients seeking convenient, quality healthcare access
**Tertiary**: Insurance companies requiring seamless claims processing

## Core Features
1. Intelligent appointment scheduling with AI-powered availability optimization
2. NPHIES-compliant claims processing and real-time eligibility verification
3. Integrated telemedicine with HIPAA/PDPL-compliant video consultations
4. Patient health records with FHIR R4 interoperability
5. Analytics dashboard with real-time KPI tracking

## Technical Architecture
- Frontend: React with TypeScript for type-safe development
- Backend: Node.js with Express on Cloudflare Workers for global edge performance
- Database: PostgreSQL with encrypted PHI storage
- Compliance: PDPL, HIPAA, NPHIES, HL7 FHIR R4`
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
