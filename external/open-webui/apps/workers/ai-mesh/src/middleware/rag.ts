/**
 * RAG Middleware — Medical Knowledge Augmentation
 *
 * Enriches LLM messages with relevant context from:
 * - Vectorize medical-records-index (1536d)
 * - R2 brainsait-healthcare-files
 *
 * Activated for clinical agents. Skipped for translation/formatting tasks.
 */

import type { Env } from '../index';

// Agents that benefit from RAG augmentation
const RAG_ENABLED_AGENTS = new Set([
  'claimlinc', 'authlinc', 'drglinc', 'clinicallinc',
  'healthcarelinc', 'radiolinc', 'codelinc', 'bridgelinc',
  'compliancelinc', 'brainsait-nphies-agent', 'masterlinc',
]);

export async function ragMiddleware(
  messages: any[],
  model: string,
  env: Env,
): Promise<{ augmentedMessages: any[]; sources: string[] }> {
  const agentId = model.toLowerCase().replace(/[^a-z0-9-]/g, '');
  if (!RAG_ENABLED_AGENTS.has(agentId)) {
    return { augmentedMessages: messages, sources: [] };
  }

  // Extract the latest user query
  const lastUser = [...messages].reverse().find((m) => m.role === 'user');
  if (!lastUser?.content) return { augmentedMessages: messages, sources: [] };

  const query = typeof lastUser.content === 'string'
    ? lastUser.content
    : lastUser.content.map((p: any) => p.text ?? '').join(' ');

  try {
    // Embed query with Workers AI
    const embedResult = await env.AI.run('@cf/baai/bge-large-en-v1.5', { text: query }) as any;
    const queryVector: number[] = embedResult?.data?.[0] ?? embedResult;

    if (!Array.isArray(queryVector) || queryVector.length === 0) {
      return { augmentedMessages: messages, sources: [] };
    }

    // Search SEARCH_INDEX (1024d — matches bge-large-en-v1.5 output)
    const results = await env.SEARCH_INDEX.query(queryVector, {
      topK: parseInt(env.MAX_RAG_RESULTS ?? '5'),
      returnMetadata: 'all',
    });

    if (!results.matches?.length) return { augmentedMessages: messages, sources: [] };

    // Build context block
    const contextParts = results.matches
      .filter((m) => m.score > 0.7)
      .map((m) => {
        const meta = m.metadata as Record<string, string> | null;
        const title = meta?.title ?? meta?.key ?? m.id;
        const text = meta?.text ?? '';
        return `[Source: ${title}]\n${text}`;
      });

    if (!contextParts.length) return { augmentedMessages: messages, sources: [] };

    const contextBlock = `<medical_context>\n${contextParts.join('\n\n')}\n</medical_context>`;
    const sources = results.matches.map((m) => {
      const meta = m.metadata as Record<string, string> | null;
      return meta?.title ?? m.id;
    });

    // Inject context as system message before first user turn
    const augmented = [...messages];
    const systemIdx = augmented.findIndex((m) => m.role === 'system');
    const injection = { role: 'system', content: contextBlock };

    if (systemIdx >= 0) {
      // Append to existing system message
      augmented[systemIdx] = {
        ...augmented[systemIdx],
        content: augmented[systemIdx].content + '\n\n' + contextBlock,
      };
    } else {
      augmented.unshift(injection);
    }

    return { augmentedMessages: augmented, sources };
  } catch (err) {
    console.error('RAG middleware error:', err);
    return { augmentedMessages: messages, sources: [] };
  }
}
