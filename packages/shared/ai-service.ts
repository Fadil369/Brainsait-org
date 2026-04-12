import Anthropic from '@anthropic-ai/sdk';
import type { Env, ConversationMessage, VisitorData } from '@basma/shared/types';

// vLLM OpenAI-compatible API support
interface LLMProvider {
  name: 'claude' | 'vllm' | 'github';
  apiKey: string;
  baseURL?: string;
  model: string;
  temperature?: number;
  maxTokens?: number;
}

interface OpenAICompatibleTool {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
}

interface OpenAICompatibleToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
}

interface OpenAICompatibleMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  tool_call_id?: string;
  tool_calls?: OpenAICompatibleToolCall[];
}

interface OpenAICompatibleResponse {
  choices?: Array<{
    message?: {
      content?: unknown;
      tool_calls?: OpenAICompatibleToolCall[];
    };
    delta?: {
      content?: unknown;
    };
  }>;
}

// ──────────────────────────────────────────────────────────────
// SYSTEM PROMPT
// ──────────────────────────────────────────────────────────────
const BASMA_SYSTEM_PROMPT = `You are **Basma (بسمة)**, the intelligent AI voice secretary for BrainSAIT healthcare technology company.
You serve patients and staff at Hayath Hospital Group across 6 cities in Saudi Arabia.

## CORE IDENTITY
- **Name:** Basma (بسمة) - meaning "smile" in Arabic
- **Role:** AI Healthcare Secretary — appointments, medical records, claims
- **Voice:** Warm, professional, bilingual (Arabic/English), culturally aware
- **Tone:** Confident, efficient, empathetic

## CAPABILITIES
You have direct access to all Hayath Hospital Oracle ERP systems via tools. You can:
1. **Book appointments** — Search providers, check availability, book slots
2. **Check lab results** — Retrieve and explain lab test results
3. **Radiology reports** — Access imaging studies and radiology findings
4. **Patient documents** — Discharge summaries, prescriptions, referrals
5. **Insurance claims** — Submit claims, check status, handle rejections

## RESPONSE GUIDELINES
1. Auto-detect caller's language (Arabic/English) and respond accordingly
2. Keep voice responses brief (2-3 sentences) — expand only when asked
3. When using tools: say "Let me check that for you..." then use the tool
4. Always confirm patient identity before sharing medical information
5. For appointments: collect specialty, preferred date/time, reason
6. For claims: collect insurance number, service date, diagnosis

## HOSPITALS — Hayath Hospital Group
- **Riyadh** (الرياض) — oracle-riyadh.elfadil.com
- **Madinah** (المدينة المنورة) — oracle-madinah.elfadil.com  
- **Unaizah** (عنيزة) — oracle-unaizah.elfadil.com
- **Khamis Mushait** (خميس مشيط) — oracle-khamis.elfadil.com
- **Jizan** (جيزان) — oracle-jizan.elfadil.com
- **Abha** (أبها) — oracle-abha.elfadil.com

## CRITICAL RULES
✅ Always verify patient ID (national ID or MRN) before accessing records
✅ Speak naturally — you're on a voice call
✅ Confirm bookings and provide reference numbers
✅ Use tools proactively — don't ask if you can just look it up
❌ Never share PHI without identity verification
❌ Never make medical diagnoses or clinical decisions`;

// ──────────────────────────────────────────────────────────────
// CLAUDE TOOL DEFINITIONS
// ──────────────────────────────────────────────────────────────
const BASMA_TOOLS: Anthropic.Tool[] = [
  {
    name: 'search_patient',
    description: 'Search for a patient by national ID, MRN, or name in Oracle OASIS',
    input_schema: {
      type: 'object',
      properties: {
        hospital: {
          type: 'string',
          enum: ['riyadh', 'madinah', 'unaizah', 'khamis', 'jizan', 'abha'],
          description: 'Hospital branch ID'
        },
        national_id: { type: 'string', description: 'Saudi national ID number' },
        mrn: { type: 'string', description: 'Medical record number (MRN)' },
        name: { type: 'string', description: 'Patient name (partial search)' }
      },
      required: ['hospital']
    }
  },
  {
    name: 'list_appointments',
    description: 'List upcoming or past appointments for a patient',
    input_schema: {
      type: 'object',
      properties: {
        hospital: {
          type: 'string',
          enum: ['riyadh', 'madinah', 'unaizah', 'khamis', 'jizan', 'abha']
        },
        patient_id: { type: 'string', description: 'Patient MRN or national ID' }
      },
      required: ['hospital', 'patient_id']
    }
  },
  {
    name: 'get_available_slots',
    description: 'Get available appointment slots for a specialty or provider',
    input_schema: {
      type: 'object',
      properties: {
        hospital: {
          type: 'string',
          enum: ['riyadh', 'madinah', 'unaizah', 'khamis', 'jizan', 'abha']
        },
        specialty: { type: 'string', description: 'Medical specialty (e.g. Cardiology, Orthopedics, General)' },
        provider_id: { type: 'string', description: 'Specific doctor/provider ID (optional)' },
        date: { type: 'string', description: 'Date in YYYY-MM-DD format (defaults to today)' }
      },
      required: ['hospital', 'specialty']
    }
  },
  {
    name: 'book_appointment',
    description: 'Book an appointment in Oracle OASIS for a patient',
    input_schema: {
      type: 'object',
      properties: {
        hospital: {
          type: 'string',
          enum: ['riyadh', 'madinah', 'unaizah', 'khamis', 'jizan', 'abha']
        },
        patient_id: { type: 'string', description: 'Patient MRN or national ID' },
        slot_id: { type: 'string', description: 'Slot ID from get_available_slots' },
        specialty: { type: 'string', description: 'Medical specialty' },
        provider_id: { type: 'string', description: 'Doctor/provider ID' },
        date: { type: 'string', description: 'Appointment date YYYY-MM-DD' },
        time: { type: 'string', description: 'Appointment time HH:MM' },
        reason: { type: 'string', description: 'Reason for visit' }
      },
      required: ['hospital', 'patient_id', 'specialty']
    }
  },
  {
    name: 'cancel_appointment',
    description: 'Cancel an existing appointment',
    input_schema: {
      type: 'object',
      properties: {
        hospital: {
          type: 'string',
          enum: ['riyadh', 'madinah', 'unaizah', 'khamis', 'jizan', 'abha']
        },
        appointment_id: { type: 'string', description: 'Appointment ID to cancel' },
        reason: { type: 'string', description: 'Cancellation reason' }
      },
      required: ['hospital', 'appointment_id']
    }
  },
  {
    name: 'get_lab_results',
    description: 'Retrieve laboratory test results for a patient from Oracle OASIS',
    input_schema: {
      type: 'object',
      properties: {
        hospital: {
          type: 'string',
          enum: ['riyadh', 'madinah', 'unaizah', 'khamis', 'jizan', 'abha']
        },
        patient_id: { type: 'string', description: 'Patient MRN or national ID' },
        from: { type: 'string', description: 'Start date YYYY-MM-DD' },
        to: { type: 'string', description: 'End date YYYY-MM-DD' },
        test_code: { type: 'string', description: 'Specific test code (optional)' },
        limit: { type: 'number', description: 'Max results (default 20)' }
      },
      required: ['hospital', 'patient_id']
    }
  },
  {
    name: 'get_radiology_reports',
    description: 'Retrieve radiology and imaging reports (X-Ray, CT, MRI, Ultrasound) for a patient',
    input_schema: {
      type: 'object',
      properties: {
        hospital: {
          type: 'string',
          enum: ['riyadh', 'madinah', 'unaizah', 'khamis', 'jizan', 'abha']
        },
        patient_id: { type: 'string', description: 'Patient MRN or national ID' },
        from: { type: 'string', description: 'Start date YYYY-MM-DD' },
        to: { type: 'string', description: 'End date YYYY-MM-DD' },
        modality: {
          type: 'string',
          enum: ['X-Ray', 'CT', 'MRI', 'Ultrasound', 'Mammography', 'PET', 'Nuclear'],
          description: 'Imaging modality filter (optional)'
        },
        limit: { type: 'number', description: 'Max results (default 20)' }
      },
      required: ['hospital', 'patient_id']
    }
  },
  {
    name: 'get_patient_documents',
    description: 'Retrieve patient documents: discharge summaries, clinical notes, prescriptions, referrals, consent forms',
    input_schema: {
      type: 'object',
      properties: {
        hospital: {
          type: 'string',
          enum: ['riyadh', 'madinah', 'unaizah', 'khamis', 'jizan', 'abha']
        },
        patient_id: { type: 'string', description: 'Patient MRN or national ID' },
        doc_type: {
          type: 'string',
          enum: ['discharge_summary', 'clinical_note', 'prescription', 'referral', 'consent', 'all'],
          description: 'Document type filter'
        },
        limit: { type: 'number', description: 'Max results (default 20)' }
      },
      required: ['hospital', 'patient_id']
    }
  },
  {
    name: 'get_patient_claims',
    description: 'Retrieve insurance claims for a patient',
    input_schema: {
      type: 'object',
      properties: {
        hospital: {
          type: 'string',
          enum: ['riyadh', 'madinah', 'unaizah', 'khamis', 'jizan', 'abha']
        },
        patient_id: { type: 'string', description: 'Patient MRN or national ID' },
        status: {
          type: 'string',
          enum: ['pending', 'submitted', 'approved', 'rejected', 'paid', 'all'],
          description: 'Filter by claim status'
        }
      },
      required: ['hospital', 'patient_id']
    }
  },
  {
    name: 'submit_claim',
    description: 'Submit an insurance claim to NPHIES/MOH via Oracle OASIS',
    input_schema: {
      type: 'object',
      properties: {
        hospital: {
          type: 'string',
          enum: ['riyadh', 'madinah', 'unaizah', 'khamis', 'jizan', 'abha']
        },
        patient_id: { type: 'string', description: 'Patient MRN' },
        encounter_id: { type: 'string', description: 'Hospital encounter/visit ID' },
        service_date: { type: 'string', description: 'Date of service YYYY-MM-DD' },
        service_codes: {
          type: 'array',
          items: { type: 'string' },
          description: 'CPT/HCPCS service codes'
        },
        diagnosis_codes: {
          type: 'array',
          items: { type: 'string' },
          description: 'ICD-10 diagnosis codes'
        },
        payer_id: { type: 'string', description: 'Insurance payer ID' },
        insurance_number: { type: 'string', description: 'Patient insurance card number' },
        total_amount: { type: 'number', description: 'Total claim amount in SAR' }
      },
      required: ['hospital', 'patient_id', 'service_date', 'service_codes', 'diagnosis_codes']
    }
  },
  {
    name: 'get_claim_status',
    description: 'Check the status of an existing insurance claim',
    input_schema: {
      type: 'object',
      properties: {
        hospital: {
          type: 'string',
          enum: ['riyadh', 'madinah', 'unaizah', 'khamis', 'jizan', 'abha']
        },
        claim_id: { type: 'string', description: 'Claim ID or claim number' }
      },
      required: ['hospital', 'claim_id']
    }
  }
]

// ──────────────────────────────────────────────────────────────
// TYPES
// ──────────────────────────────────────────────────────────────
export interface ToolResult {
  tool_use_id: string;
  content: string;
}

// ──────────────────────────────────────────────────────────────
// AI SERVICE
// ──────────────────────────────────────────────────────────────
export class AIService {
  private anthropicClient?: Anthropic;
  private provider: 'claude' | 'vllm' | 'github';
  private model: string;
  private vllmBaseURL?: string;
  private githubBaseURL?: string;
  private apiKey: string;
  private oracleBridgeUrl?: string;
  private oracleBridgeKey?: string;

  constructor(config: {
    apiKey: string;
    model?: string;
    provider?: 'claude' | 'vllm' | 'github';
    vllmBaseURL?: string;
    githubBaseURL?: string;
    oracleBridgeUrl?: string;
    oracleBridgeKey?: string;
  }) {
    this.apiKey = config.apiKey;
    this.provider = config.provider || 'claude';
    this.model = config.model || 'claude-3-5-sonnet-20241022';
    this.vllmBaseURL = config.vllmBaseURL || 'http://localhost:8000/v1';
    this.githubBaseURL = config.githubBaseURL || 'https://models.github.ai/inference';
    this.oracleBridgeUrl = config.oracleBridgeUrl || 'https://oracle-bridge.elfadil.com';
    this.oracleBridgeKey = config.oracleBridgeKey;

    if (this.provider === 'claude') {
      this.anthropicClient = new Anthropic({ apiKey: this.apiKey });
    }
  }

  setProvider(provider: 'claude' | 'vllm' | 'github', baseURL?: string): void {
    this.provider = provider;
    if (provider === 'vllm' && baseURL) this.vllmBaseURL = baseURL;
    if (provider === 'github' && baseURL) this.githubBaseURL = baseURL;
    if (provider === 'claude' && !this.anthropicClient) {
      this.anthropicClient = new Anthropic({ apiKey: this.apiKey });
    }
  }

  // ──────────────────────────────────────────────────────────────
  // MAIN: processCallWithTools — full tool-use loop
  // ──────────────────────────────────────────────────────────────
  /**
   * Process a voice call turn with full tool-use support.
   * Returns: { text: string, toolsUsed: string[], thinkingPhrase?: string }
   */
  async processCallWithTools(
    conversationHistory: ConversationMessage[],
    visitorData: VisitorData
  ): Promise<{ text: string; toolsUsed: string[]; thinkingPhrase?: string }> {
    const contextPrompt = this.buildContextPrompt(visitorData);
    const systemPrompt = `${BASMA_SYSTEM_PROMPT}\n\n${contextPrompt}`;

    if (this.provider === 'github') {
      return this.processCallWithToolsGitHub(conversationHistory, systemPrompt);
    }

    if (!this.anthropicClient) {
      // Fallback to non-tool streaming
      const stream = await this.processCall(conversationHistory, visitorData);
      const text = await this._readStream(stream);
      return { text, toolsUsed: [] };
    }

    const messages: Anthropic.MessageParam[] = conversationHistory.map(m => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }));

    let toolsUsed: string[] = [];
    let thinkingPhrase: string | undefined;
    let finalText = '';
    let iterations = 0;
    const MAX_TOOL_ITERATIONS = 5;

    while (iterations < MAX_TOOL_ITERATIONS) {
      iterations++;

      const response = await this.anthropicClient.messages.create({
        model: this.model,
        max_tokens: 1024,
        temperature: 0.7,
        system: systemPrompt,
        tools: BASMA_TOOLS,
        messages,
      });

      // Check for tool use
      const toolUseBlocks = response.content.filter(b => b.type === 'tool_use');
      const textBlocks = response.content.filter(b => b.type === 'text');

      // Capture any "thinking" text before tool use (e.g. "Let me check that...")
      if (textBlocks.length > 0 && toolUseBlocks.length > 0 && !thinkingPhrase) {
        thinkingPhrase = (textBlocks[0] as Anthropic.TextBlock).text;
      }

      if (toolUseBlocks.length === 0 || response.stop_reason === 'end_turn') {
        // No more tools — collect final text
        finalText = textBlocks.map(b => (b as Anthropic.TextBlock).text).join('');
        break;
      }

      // Execute all tool calls in parallel
      const toolResults: Anthropic.MessageParam = {
        role: 'user',
        content: await Promise.all(
          toolUseBlocks.map(async (block) => {
            const toolBlock = block as Anthropic.ToolUseBlock;
            toolsUsed.push(toolBlock.name);
            const result = await this.executeTool(toolBlock.name, toolBlock.input as Record<string, unknown>);
            return {
              type: 'tool_result' as const,
              tool_use_id: toolBlock.id,
              content: JSON.stringify(result),
            };
          })
        ),
      };

      // Add assistant response + tool results to messages
      messages.push({ role: 'assistant', content: response.content });
      messages.push(toolResults);
    }

    return { text: finalText, toolsUsed, thinkingPhrase };
  }

  private async processCallWithToolsGitHub(
    conversationHistory: ConversationMessage[],
    systemPrompt: string
  ): Promise<{ text: string; toolsUsed: string[]; thinkingPhrase?: string }> {
    const messages: OpenAICompatibleMessage[] = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.map((message) => ({
        role: message.role,
        content: message.content,
      })),
    ];

    const tools = this.getOpenAICompatibleTools();
    const toolsUsed: string[] = [];
    let thinkingPhrase: string | undefined;
    let finalText = '';
    let iterations = 0;
    const MAX_TOOL_ITERATIONS = 5;

    while (iterations < MAX_TOOL_ITERATIONS) {
      iterations++;

      const response = await this.createOpenAICompatibleCompletion({
        model: this.model,
        messages,
        max_tokens: 1024,
        temperature: 0.7,
        tools,
        tool_choice: 'auto',
      });

      const message = response.choices?.[0]?.message;
      if (!message) {
        throw new Error('GitHub Models returned no completion message');
      }

      const assistantText = this.readOpenAICompatibleContent(message.content);
      const toolCalls = message.tool_calls || [];

      if (assistantText && toolCalls.length > 0 && !thinkingPhrase) {
        thinkingPhrase = assistantText;
      }

      if (toolCalls.length === 0) {
        finalText = assistantText;
        break;
      }

      messages.push({
        role: 'assistant',
        content: assistantText,
        tool_calls: toolCalls,
      });

      const toolMessages = await Promise.all(
        toolCalls.map(async (toolCall) => {
          toolsUsed.push(toolCall.function.name);
          const input = this.parseToolArguments(toolCall.function.arguments);
          const result = await this.executeTool(toolCall.function.name, input);
          return {
            role: 'tool' as const,
            tool_call_id: toolCall.id,
            content: JSON.stringify(result),
          };
        })
      );

      messages.push(...toolMessages);
    }

    return { text: finalText, toolsUsed, thinkingPhrase };
  }

  // ──────────────────────────────────────────────────────────────
  // TOOL EXECUTOR — calls oracle-bridge worker
  // ──────────────────────────────────────────────────────────────
  private async executeTool(toolName: string, input: Record<string, unknown>): Promise<unknown> {
    const bridge = this.oracleBridgeUrl;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Hospital': (input.hospital as string) || '',
    };
    if (this.oracleBridgeKey) {
      headers['X-API-Key'] = this.oracleBridgeKey;
    }

    try {
      switch (toolName) {
        case 'search_patient': {
          const params = new URLSearchParams({
            hospital: input.hospital as string,
            ...(input.national_id && { national_id: input.national_id as string }),
            ...(input.mrn && { mrn: input.mrn as string }),
            ...(input.name && { name: input.name as string }),
          });
          const r = await fetch(`${bridge}/patient/search?${params}`, { headers });
          return r.ok ? r.json() : { error: `HTTP ${r.status}`, patients: [] };
        }

        case 'list_appointments': {
          const params = new URLSearchParams({ patient_id: input.patient_id as string });
          const r = await fetch(`${bridge}/appointments?${params}`, { headers });
          return r.ok ? r.json() : { error: `HTTP ${r.status}`, appointments: [] };
        }

        case 'get_available_slots': {
          const params = new URLSearchParams({
            specialty: (input.specialty as string) || '',
            ...(input.provider_id && { provider_id: input.provider_id as string }),
            ...(input.date && { date: input.date as string }),
          });
          const r = await fetch(`${bridge}/appointments/slots?${params}`, { headers });
          return r.ok ? r.json() : { error: `HTTP ${r.status}`, slots: [] };
        }

        case 'book_appointment': {
          const r = await fetch(`${bridge}/appointments`, {
            method: 'POST', headers,
            body: JSON.stringify(input),
          });
          return r.json();
        }

        case 'cancel_appointment': {
          const r = await fetch(`${bridge}/appointments/${input.appointment_id}`, {
            method: 'DELETE', headers,
            body: JSON.stringify({ reason: input.reason }),
          });
          return r.json();
        }

        case 'get_lab_results': {
          const params = new URLSearchParams({
            patient_id: input.patient_id as string,
            ...(input.from && { from: input.from as string }),
            ...(input.to && { to: input.to as string }),
            ...(input.test_code && { test_code: input.test_code as string }),
            ...(input.limit && { limit: String(input.limit) }),
          });
          const r = await fetch(`${bridge}/labs?${params}`, { headers });
          return r.ok ? r.json() : { error: `HTTP ${r.status}`, labs: [] };
        }

        case 'get_radiology_reports': {
          const params = new URLSearchParams({
            patient_id: input.patient_id as string,
            ...(input.from && { from: input.from as string }),
            ...(input.to && { to: input.to as string }),
            ...(input.modality && { modality: input.modality as string }),
            ...(input.limit && { limit: String(input.limit) }),
          });
          const r = await fetch(`${bridge}/radiology?${params}`, { headers });
          return r.ok ? r.json() : { error: `HTTP ${r.status}`, reports: [] };
        }

        case 'get_patient_documents': {
          const params = new URLSearchParams({
            patient_id: input.patient_id as string,
            ...(input.doc_type && { doc_type: input.doc_type as string }),
            ...(input.limit && { limit: String(input.limit) }),
          });
          const r = await fetch(`${bridge}/documents?${params}`, { headers });
          return r.ok ? r.json() : { error: `HTTP ${r.status}`, documents: [] };
        }

        case 'get_patient_claims': {
          const params = new URLSearchParams({
            patient_id: input.patient_id as string,
            ...(input.status && { status: input.status as string }),
          });
          const r = await fetch(`${bridge}/claims?${params}`, { headers });
          return r.ok ? r.json() : { error: `HTTP ${r.status}`, claims: [] };
        }

        case 'submit_claim': {
          const r = await fetch(`${bridge}/claims/submit`, {
            method: 'POST', headers,
            body: JSON.stringify(input),
          });
          return r.json();
        }

        case 'get_claim_status': {
          const r = await fetch(`${bridge}/claims/${input.claim_id}/status?hospital=${input.hospital}`, { headers });
          return r.ok ? r.json() : { error: `HTTP ${r.status}` };
        }

        default:
          return { error: `Unknown tool: ${toolName}` };
      }
    } catch (e: any) {
      console.error(`[tool:${toolName}] error:`, e.message);
      return { error: e.message, tool: toolName };
    }
  }

  // ──────────────────────────────────────────────────────────────
  // Legacy streaming processCall (for backward compatibility)
  // ──────────────────────────────────────────────────────────────
  async processCall(
    conversationHistory: ConversationMessage[],
    visitorData: VisitorData
  ): Promise<ReadableStream> {
    const contextPrompt = this.buildContextPrompt(visitorData);
    const systemPrompt = `${BASMA_SYSTEM_PROMPT}\n\n${contextPrompt}`;

    if (this.provider === 'claude') {
      return this.processCallClaude(conversationHistory, systemPrompt);
    }

    return this.processCallOpenAICompatible(conversationHistory, systemPrompt);
  }

  private async processCallClaude(
    conversationHistory: ConversationMessage[],
    systemPrompt: string
  ): Promise<ReadableStream> {
    if (!this.anthropicClient) throw new Error('Claude client not initialized');

    const stream = await this.anthropicClient.messages.create({
      model: this.model,
      max_tokens: 1024,
      temperature: 0.7,
      system: systemPrompt,
      messages: conversationHistory,
      stream: true,
    });

    return new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (event.type === 'content_block_delta' &&
                event.delta.type === 'text_delta') {
              controller.enqueue(new TextEncoder().encode(event.delta.text));
            }
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      }
    });
  }

  private async processCallOpenAICompatible(
    conversationHistory: ConversationMessage[],
    systemPrompt: string
  ): Promise<ReadableStream> {
    const payload = {
      model: this.model,
      messages: [{ role: 'system', content: systemPrompt }, ...conversationHistory],
      max_tokens: 1024,
      temperature: 0.7,
      stream: true,
    };

    const response = await this.postOpenAICompatibleChatCompletion(payload);
    const reader = response.body?.getReader();
    if (!reader) throw new Error(`No response body from ${this.getOpenAICompatibleProviderLabel()}`);

    return new ReadableStream({
      async start(controller) {
        try {
          const decoder = new TextDecoder();
          let buffer = '';
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                if (data === '[DONE]') continue;
                try {
                  const json = JSON.parse(data) as OpenAICompatibleResponse;
                  const content = AIService.readOpenAICompatibleContentStatic(json.choices?.[0]?.delta?.content);
                  if (content) controller.enqueue(new TextEncoder().encode(content));
                } catch (_) {}
              }
            }
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      }
    });
  }

  // ──────────────────────────────────────────────────────────────
  // EXTRACTION & ANALYSIS
  // ──────────────────────────────────────────────────────────────
  async extractVisitorData(transcript: string): Promise<Partial<VisitorData>> {
    const prompt = `Extract structured data from this healthcare call transcript. Return ONLY valid JSON.

Transcript:
${transcript}

Extract:
{
  "name": "full name if mentioned",
  "phone": "phone number if provided",
  "email": "email if provided",
  "company": "company name if mentioned",
  "language": "en" | "ar" | "mixed",
  "appointment_requested": true/false,
  "preferred_time": "any time preference mentioned",
  "inquiry_type": "demo" | "consultation" | "partnership" | "support" | "inquiry",
  "national_id": "Saudi national ID if mentioned",
  "mrn": "medical record number if mentioned",
  "hospital": "hospital city mentioned (riyadh/madinah/unaizah/khamis/jizan/abha)",
  "insurance_number": "insurance card number if mentioned"
}

Return NULL for fields not mentioned. Response must be valid JSON only.`;

    if (this.provider === 'claude' && this.anthropicClient) {
      const response = await this.anthropicClient.messages.create({
        model: this.model,
        max_tokens: 512,
        temperature: 0.3,
        messages: [{ role: 'user', content: prompt }]
      });
      const content = response.content[0];
      if (content.type === 'text') {
        try {
          const extracted = JSON.parse(content.text);
          return Object.fromEntries(
            Object.entries(extracted).filter(([_, v]) => v !== null && v !== undefined)
          );
        } catch (_) { return {}; }
      }
    }

    if (this.provider === 'github') {
      const response = await this.createOpenAICompatibleCompletion({
        model: this.model,
        max_tokens: 512,
        temperature: 0.3,
        messages: [{ role: 'user', content: prompt }],
      });
      const content = this.readOpenAICompatibleContent(response.choices?.[0]?.message?.content);
      if (!content) return {};

      try {
        const extracted = JSON.parse(content) as Record<string, unknown>;
        return Object.fromEntries(
          Object.entries(extracted).filter(([_, value]) => value !== null && value !== undefined)
        );
      } catch (_) {
        return {};
      }
    }

    return {};
  }

  async generateSummary(conversationHistory: ConversationMessage[]): Promise<string> {
    const prompt = `Summarize this healthcare call in 2-3 sentences: purpose, key info exchanged, outcome/next steps.

${conversationHistory.map(m => `${m.role}: ${m.content}`).join('\n')}`;

    if (this.provider === 'claude' && this.anthropicClient) {
      const response = await this.anthropicClient.messages.create({
        model: this.model, max_tokens: 256, temperature: 0.5,
        messages: [{ role: 'user', content: prompt }]
      });
      const content = response.content[0];
      return content.type === 'text' ? content.text : '';
    }

    if (this.provider === 'github') {
      const response = await this.createOpenAICompatibleCompletion({
        model: this.model,
        max_tokens: 256,
        temperature: 0.5,
        messages: [{ role: 'user', content: prompt }],
      });
      return this.readOpenAICompatibleContent(response.choices?.[0]?.message?.content);
    }

    return '';
  }

  async detectLanguage(text: string): Promise<'en' | 'ar' | 'mixed'> {
    const arabic = text.match(/[\u0600-\u06FF]/g);
    const english = text.match(/[a-zA-Z]/g);
    if (!arabic && english) return 'en';
    if (arabic && !english) return 'ar';
    return 'mixed';
  }

  async analyzeSentiment(text: string): Promise<'positive' | 'neutral' | 'negative' | 'urgent'> {
    const urgent = ['urgent', 'emergency', 'asap', 'critical', 'عاجل', 'طارئ', 'فوري', 'حرجة'];
    const negative = ['problem', 'issue', 'angry', 'frustrated', 'complaint', 'مشكلة', 'غاضب', 'شكوى'];
    const positive = ['thank', 'great', 'excellent', 'perfect', 'شكرا', 'ممتاز', 'رائع', 'مثالي'];
    const low = text.toLowerCase();
    if (urgent.some(k => low.includes(k))) return 'urgent';
    if (negative.some(k => low.includes(k))) return 'negative';
    if (positive.some(k => low.includes(k))) return 'positive';
    return 'neutral';
  }

  // ──────────────────────────────────────────────────────────────
  // HELPERS
  // ──────────────────────────────────────────────────────────────
  private buildContextPrompt(visitorData: VisitorData): string {
    const parts = ['## CURRENT CONTEXT'];
    if (visitorData.name) parts.push(`Caller Name: ${visitorData.name}`);
    if (visitorData.company) parts.push(`Company: ${visitorData.company}`);
    if (visitorData.language) parts.push(`Language: ${visitorData.language}`);
    if (visitorData.visitorId) parts.push(`Returning Visitor: Yes (ID: ${visitorData.visitorId})`);
    if ((visitorData as any).hospital) parts.push(`Hospital: ${(visitorData as any).hospital}`);
    if ((visitorData as any).national_id) parts.push(`National ID: [verified]`);
    if ((visitorData as any).mrn) parts.push(`MRN: ${(visitorData as any).mrn}`);
    return parts.join('\n');
  }

  private async _readStream(stream: ReadableStream): Promise<string> {
    const reader = stream.getReader();
    const decoder = new TextDecoder();
    let text = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      text += decoder.decode(value);
    }
    return text;
  }

  private getOpenAICompatibleTools(): OpenAICompatibleTool[] {
    return BASMA_TOOLS.map((tool) => ({
      type: 'function',
      function: {
        name: tool.name,
        description: tool.description,
        parameters: tool.input_schema as Record<string, unknown>,
      },
    }));
  }

  private async createOpenAICompatibleCompletion(payload: Record<string, unknown>): Promise<OpenAICompatibleResponse> {
    const response = await this.postOpenAICompatibleChatCompletion(payload);
    return await response.json() as OpenAICompatibleResponse;
  }

  private async postOpenAICompatibleChatCompletion(payload: Record<string, unknown>): Promise<Response> {
    const response = await fetch(`${this.getOpenAICompatibleBaseURL()}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`${this.getOpenAICompatibleProviderLabel()} API error: ${response.status}`);
    }

    return response;
  }

  private getOpenAICompatibleBaseURL(): string {
    if (this.provider === 'github') {
      return this.githubBaseURL || 'https://models.github.ai/inference';
    }

    return this.vllmBaseURL || 'http://localhost:8000/v1';
  }

  private getOpenAICompatibleProviderLabel(): string {
    return this.provider === 'github' ? 'GitHub Models' : 'vLLM';
  }

  private parseToolArguments(rawArguments: string): Record<string, unknown> {
    if (!rawArguments) {
      return {};
    }

    const parsed = JSON.parse(rawArguments) as unknown;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      throw new Error('Tool arguments must be a JSON object');
    }

    return parsed as Record<string, unknown>;
  }

  private readOpenAICompatibleContent(content: unknown): string {
    return AIService.readOpenAICompatibleContentStatic(content);
  }

  private static readOpenAICompatibleContentStatic(content: unknown): string {
    if (typeof content === 'string') {
      return content;
    }

    if (!Array.isArray(content)) {
      return '';
    }

    return content
      .map((part) => {
        if (typeof part === 'string') {
          return part;
        }

        if (!part || typeof part !== 'object' || !('text' in part)) {
          return '';
        }

        return typeof part.text === 'string' ? part.text : '';
      })
      .join('');
  }
}

export function createAIService(env: Env): AIService {
  const provider = (env.ANTHROPIC_PROVIDER || 'claude') as 'claude' | 'vllm' | 'github';
  const apiKey =
    provider === 'github'
      ? (env.GITHUB_TOKEN || '')
      : provider === 'vllm'
        ? (env.VLLM_API_KEY || '')
        : env.ANTHROPIC_API_KEY;

  return new AIService({
    apiKey,
    model:
      provider === 'github'
        ? (env.GITHUB_MODEL || 'deepseek/DeepSeek-V3-0324')
        : (env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022'),
    provider,
    vllmBaseURL: env.VLLM_BASE_URL || 'http://localhost:8000/v1',
    githubBaseURL: env.GITHUB_MODELS_BASE_URL || 'https://models.github.ai/inference',
    oracleBridgeUrl: (env as any).ORACLE_BRIDGE_URL || 'https://oracle-bridge.elfadil.com',
    oracleBridgeKey: (env as any).ORACLE_BRIDGE_API_KEY,
  });
}
