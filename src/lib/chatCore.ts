import type {
  Companion,
  ChatMessage,
  PlayerStats,
  Task,
} from '../types/game';
import { buildSystemPrompt } from './prompts';

const ZHIPU_MODEL = 'glm-4-flash';
const ZHIPU_URL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';

export type ChatRequest = {
  companion: Companion;
  playerCode: string;
  messages: ChatMessage[];
  stats?: PlayerStats;
  focusedTask?: Task | null;
};

export type ChatResponse = {
  text: string;
};

/**
 * Calls Zhipu GLM-4-Flash with game context.
 * Shared by the Vite dev middleware and the Cloudflare Pages Function.
 */
export async function callLLM(
  req: ChatRequest,
  apiKey: string
): Promise<ChatResponse> {
  if (!apiKey) {
    throw new Error('ZHIPU_API_KEY is not configured');
  }

  const systemPrompt = buildSystemPrompt(req.companion, req.playerCode, {
    stats: req.stats,
    focusedTask: req.focusedTask ?? null,
  });

  const messages = [
    { role: 'system', content: systemPrompt },
    ...req.messages.map((m) => ({ role: m.role, content: m.content })),
  ];

  const res = await fetch(ZHIPU_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: ZHIPU_MODEL,
      messages,
      temperature: 0.9,
      max_tokens: 500,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Zhipu API error ${res.status}: ${errText}`);
  }

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const text = data?.choices?.[0]?.message?.content ?? '（无响应）';
  return { text };
}
