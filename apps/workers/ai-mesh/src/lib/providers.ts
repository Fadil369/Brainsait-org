/**
 * AI Provider Router
 *
 * Routes to the best available provider:
 * 1. CF AI Gateway /compat endpoint — universal OpenAI-compatible proxy with
 *    caching, rate-limiting, and observability for OpenAI + Anthropic
 * 2. GitHub Models — direct call (Azure AI Inference, not in CF Gateway)
 * 3. Anthropic — via CF AI Gateway /anthropic path
 * 4. Workers AI — direct binding (lowest latency, always available)
 *
 * Gateway slug: brainsait-linc
 * Compat URL  : https://gateway.ai.cloudflare.com/v1/{account}/brainsait-linc/compat
 */

import type { Env } from '../index';

interface ProviderResult {
  response: any;
  modelUsed: string;
  provider: string;
}

// Model → Provider mapping
const MODEL_PROVIDERS: Record<string, string> = {
  // OpenAI models — route through CF Gateway /compat (requires OPENAI_API_KEY)
  'gpt-4o': 'openai',
  'gpt-4.1': 'openai',
  'gpt-4o-mini': 'openai',
  'gpt-5': 'openai',
  'o3': 'openai',
  'o4-mini': 'openai',
  // GitHub Models — direct Azure AI Inference (GitHub PAT)
  'DeepSeek-R1': 'github',
  'DeepSeek-V3-0324': 'github',
  'Meta-Llama-3.3-70B-Instruct': 'github',
  'Meta-Llama-4-Scout': 'github',
  'Mistral-Large-2411': 'github',
  // Anthropic — via CF Gateway /anthropic path
  'claude-3-5-sonnet-20241022': 'anthropic',
  'claude-3-5-haiku-20241022': 'anthropic',
  'claude-3-haiku-20240307': 'anthropic',
  // LINC agents — GitHub Models direct (GPT-4o / GPT-4.1 tier, requires GITHUB_MODELS_TOKEN)
  'claimlinc': 'github',
  'authlinc': 'github',
  'drglinc': 'github',
  'clinicallinc': 'github',
  'healthcarelinc': 'github',
  'radiolinc': 'github',
  'codelinc': 'github',
  'bridgelinc': 'github',
  'compliancelinc': 'github',
  'ttlinc': 'github',
  'basma': 'github',
  'masterlinc': 'github',
  'brainsait-nphies-agent': 'github',
};

// LINC agent → underlying model
// GitHub Models model IDs match the names in https://models.inference.ai.azure.com
const AGENT_MODELS: Record<string, string> = {
  'claimlinc': 'gpt-4o',
  'authlinc': 'gpt-4o',
  'drglinc': 'gpt-4.1',
  'clinicallinc': 'gpt-4o',
  'healthcarelinc': 'gpt-4o',
  'radiolinc': 'gpt-4o',
  'codelinc': 'gpt-4.1',
  'bridgelinc': 'gpt-4.1',
  'compliancelinc': 'gpt-4o',
  'ttlinc': 'gpt-4.1',
  'basma': 'gpt-4o-mini',
  'masterlinc': 'gpt-4o',
  'brainsait-nphies-agent': 'gpt-4.1',
};

/** Build the CF AI Gateway base URL for a given provider path */
function gatewayUrl(env: Env, path: string): string {
  return `https://gateway.ai.cloudflare.com/v1/${env.ACCOUNT_ID}/${env.AI_GATEWAY_ID}/${path}`;
}

export async function routeToProvider(opts: {
  model: string;
  messages: any[];
  stream: boolean;
  temperature: number;
  env: Env;
  requestId: string;
}): Promise<ProviderResult> {
  const { model, messages, stream, temperature, env, requestId } = opts;

  const actualModel = AGENT_MODELS[model] ?? model;
  const provider = MODEL_PROVIDERS[model] ?? MODEL_PROVIDERS[actualModel] ?? 'workers-ai';

  try {
    if (provider === 'openai') {
      return await callOpenAI(actualModel, messages, stream, temperature, env, requestId);
    } else if (provider === 'github') {
      return await callGitHubModels(actualModel, messages, stream, temperature, env, requestId);
    } else if (provider === 'anthropic') {
      return await callAnthropic(actualModel, messages, stream, temperature, env, requestId);
    }
  } catch (err) {
    console.error(`Provider ${provider} failed for ${model}:`, err);
  }

  // Final fallback — Workers AI (always available, no external API key needed)
  return await callWorkersAI(messages, env);
}

/**
 * OpenAI via CF AI Gateway /compat universal endpoint.
 * Requires OPENAI_API_KEY secret on the worker.
 */
async function callOpenAI(
  model: string,
  messages: any[],
  stream: boolean,
  temperature: number,
  env: Env,
  requestId: string,
): Promise<ProviderResult> {
  const url = gatewayUrl(env, 'compat/chat/completions');

  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
      'cf-aig-metadata': JSON.stringify({ requestId, agent: requestId, model }),
    },
    body: JSON.stringify({
      model: `openai/${model}`,   // compat provider prefix
      messages,
      stream,
      temperature,
      max_tokens: 4096,
    }),
  });

  if (!resp.ok) {
    throw new Error(`OpenAI via gateway ${resp.status}: ${await resp.text()}`);
  }

  const response = await resp.json();
  return { response, modelUsed: model, provider: 'openai-gateway' };
}

/**
 * GitHub Models — Azure AI Inference endpoint.
 * Not a native CF Gateway provider; called directly but tagged for gateway logging.
 */
async function callGitHubModels(
  model: string,
  messages: any[],
  stream: boolean,
  temperature: number,
  env: Env,
  requestId: string,
): Promise<ProviderResult> {
  const url = 'https://models.inference.ai.azure.com/chat/completions';

  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.GITHUB_MODELS_TOKEN}`,
      'Content-Type': 'application/json',
      'cf-aig-metadata': JSON.stringify({ requestId, model, source: 'github-models' }),
    },
    body: JSON.stringify({ model, messages, stream, temperature, max_tokens: 4096 }),
  });

  if (!resp.ok) {
    throw new Error(`GitHub Models ${resp.status}: ${await resp.text()}`);
  }

  const response = await resp.json();
  return { response, modelUsed: model, provider: 'github' };
}

/**
 * Anthropic via CF AI Gateway /anthropic path.
 * Requires ANTHROPIC_API_KEY secret on the worker.
 */
async function callAnthropic(
  model: string,
  messages: any[],
  stream: boolean,
  temperature: number,
  env: Env,
  requestId: string,
): Promise<ProviderResult> {
  const url = gatewayUrl(env, 'anthropic/v1/messages');

  const system = messages.find((m) => m.role === 'system')?.content ?? '';
  const anthropicMsgs = messages.filter((m) => m.role !== 'system');

  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      'x-api-key': env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
      'cf-aig-metadata': JSON.stringify({ requestId, model }),
    },
    body: JSON.stringify({ model, system, messages: anthropicMsgs, max_tokens: 4096, temperature, stream }),
  });

  if (!resp.ok) {
    throw new Error(`Anthropic via gateway ${resp.status}: ${await resp.text()}`);
  }

  const r: any = await resp.json();

  // Normalize to OpenAI response format
  const response = {
    id: r.id,
    object: 'chat.completion',
    model,
    choices: [{ index: 0, message: { role: 'assistant', content: r.content?.[0]?.text ?? '' }, finish_reason: r.stop_reason ?? 'stop' }],
    usage: r.usage,
  };

  return { response, modelUsed: model, provider: 'anthropic' };
}

/** Workers AI — direct Cloudflare binding, zero external latency, always available. */
async function callWorkersAI(messages: any[], env: Env): Promise<ProviderResult> {
  const systemMsg = messages.find((m) => m.role === 'system')?.content ?? '';
  const userMsgs = messages.filter((m) => m.role !== 'system');

  const result = await env.AI.run('@cf/meta/llama-3.3-70b-instruct-fp8-fast', {
    messages: [
      ...(systemMsg ? [{ role: 'system', content: systemMsg }] : []),
      ...userMsgs,
    ],
  }) as any;

  const response = {
    id: `workers-${crypto.randomUUID()}`,
    object: 'chat.completion',
    model: '@cf/meta/llama-3.3-70b-instruct-fp8-fast',
    choices: [{ index: 0, message: { role: 'assistant', content: result.response ?? result }, finish_reason: 'stop' }],
  };

  return { response, modelUsed: '@cf/meta/llama-3.3-70b-instruct-fp8-fast', provider: 'workers-ai' };
}
