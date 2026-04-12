/**
 * AI Provider Router
 *
 * Routes to the best available provider based on:
 * 1. Model ID mapping
 * 2. Cloudflare AI Gateway (for caching, observability)
 * 3. Provider health / availability
 * 4. Workers AI fallback
 */

import type { Env } from '../index';

interface ProviderResult {
  response: any;
  modelUsed: string;
  provider: string;
}

// Model → Provider mapping
const MODEL_PROVIDERS: Record<string, string> = {
  'gpt-4o': 'github',
  'gpt-4.1': 'github',
  'gpt-4o-mini': 'github',
  'DeepSeek-R1': 'github',
  'DeepSeek-V3-0324': 'github',
  'claude-3-5-sonnet-20241022': 'anthropic',
  'claude-3-haiku-20240307': 'anthropic',
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

// LINC agent → actual model mapping
const AGENT_MODELS: Record<string, string> = {
  'claimlinc': 'gpt-4o',
  'authlinc': 'gpt-4o',
  'drglinc': 'DeepSeek-R1',
  'clinicallinc': 'gpt-4o',
  'healthcarelinc': 'gpt-4o',
  'radiolinc': 'gpt-4o',
  'codelinc': 'DeepSeek-R1',
  'bridgelinc': 'gpt-4.1',
  'compliancelinc': 'gpt-4o',
  'ttlinc': 'DeepSeek-V3-0324',
  'basma': 'gpt-4o',
  'masterlinc': 'gpt-4o',
  'brainsait-nphies-agent': 'gpt-4.1',
};

export async function routeToProvider(opts: {
  model: string;
  messages: any[];
  stream: boolean;
  temperature: number;
  env: Env;
  requestId: string;
}): Promise<ProviderResult> {
  const { model, messages, stream, temperature, env, requestId } = opts;

  // Resolve actual model if agent ID
  const actualModel = AGENT_MODELS[model] ?? model;
  const provider = MODEL_PROVIDERS[model] ?? MODEL_PROVIDERS[actualModel] ?? 'workers-ai';

  try {
    if (provider === 'github') {
      return await callGitHubModels(actualModel, messages, stream, temperature, env, requestId);
    } else if (provider === 'anthropic') {
      return await callAnthropic(actualModel, messages, stream, temperature, env, requestId);
    }
  } catch (err) {
    console.error(`Provider ${provider} failed:`, err);
  }

  // Fallback to Workers AI
  return await callWorkersAI(messages, env);
}

async function callGitHubModels(
  model: string,
  messages: any[],
  stream: boolean,
  temperature: number,
  env: Env,
  requestId: string,
): Promise<ProviderResult> {
  // Route via Cloudflare AI Gateway for observability
  const gatewayUrl = `https://gateway.ai.cloudflare.com/v1/${env.ACCOUNT_ID}/${env.AI_GATEWAY_ID}/github/chat/completions`;

  const resp = await fetch(gatewayUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.GITHUB_MODELS_TOKEN}`,
      'Content-Type': 'application/json',
      'cf-aig-metadata': JSON.stringify({ requestId, model }),
    },
    body: JSON.stringify({ model, messages, stream, temperature, max_tokens: 4096 }),
  });

  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`GitHub Models ${resp.status}: ${err}`);
  }

  const response = await resp.json();
  return { response, modelUsed: model, provider: 'github' };
}

async function callAnthropic(
  model: string,
  messages: any[],
  stream: boolean,
  temperature: number,
  env: Env,
  requestId: string,
): Promise<ProviderResult> {
  // Route via Cloudflare AI Gateway
  const gatewayUrl = `https://gateway.ai.cloudflare.com/v1/${env.ACCOUNT_ID}/${env.AI_GATEWAY_ID}/anthropic/v1/messages`;

  // Convert OpenAI format to Anthropic format
  const system = messages.find((m) => m.role === 'system')?.content ?? '';
  const anthropicMsgs = messages.filter((m) => m.role !== 'system');

  const resp = await fetch(gatewayUrl, {
    method: 'POST',
    headers: {
      'x-api-key': env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
      'cf-aig-metadata': JSON.stringify({ requestId, model }),
    },
    body: JSON.stringify({
      model,
      system,
      messages: anthropicMsgs,
      max_tokens: 4096,
      temperature,
      stream,
    }),
  });

  if (!resp.ok) {
    throw new Error(`Anthropic ${resp.status}: ${await resp.text()}`);
  }

  const anthropicResp: any = await resp.json();

  // Convert to OpenAI format
  const response = {
    id: anthropicResp.id,
    object: 'chat.completion',
    model,
    choices: [{
      index: 0,
      message: {
        role: 'assistant',
        content: anthropicResp.content?.[0]?.text ?? '',
      },
      finish_reason: anthropicResp.stop_reason ?? 'stop',
    }],
    usage: anthropicResp.usage,
  };

  return { response, modelUsed: model, provider: 'anthropic' };
}

async function callWorkersAI(messages: any[], env: Env): Promise<ProviderResult> {
  const systemMsg = messages.find((m) => m.role === 'system')?.content ?? '';
  const userMsg = messages.filter((m) => m.role !== 'system');

  const result = await env.AI.run('@cf/meta/llama-3.3-70b-instruct-fp8-fast', {
    messages: [
      ...(systemMsg ? [{ role: 'system', content: systemMsg }] : []),
      ...userMsg,
    ],
  }) as any;

  const response = {
    id: `workers-${crypto.randomUUID()}`,
    object: 'chat.completion',
    model: '@cf/meta/llama-3.3-70b-instruct-fp8-fast',
    choices: [{
      index: 0,
      message: { role: 'assistant', content: result.response ?? result },
      finish_reason: 'stop',
    }],
  };

  return { response, modelUsed: '@cf/meta/llama-3.3-70b-instruct-fp8-fast', provider: 'workers-ai' };
}
