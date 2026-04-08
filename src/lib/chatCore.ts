import type { Companion, ChatMessage } from '../types/game';
import { buildSystemPrompt } from './prompts';

const ZHIPU_MODEL = 'glm-4-flash';
const ZHIPU_URL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';

export type ChatRequest = {
  companion: Companion;
  playerCode: string;
  messages: ChatMessage[];
};

export type ChatResponse = {
  text: string;
};

/**
 * Calls Zhipu GLM-4-Flash (免费 + 国内可直连) with the game context.
 * Shared by the Vite dev middleware and the Cloudflare Pages Function
 * so local + production behave identically.
 */
export async function callLLM(
  req: ChatRequest,
  apiKey: string
): Promise<ChatResponse> {
  if (!apiKey) {
    throw new Error('ZHIPU_API_KEY is not configured');
  }

  const systemPrompt = buildSystemPrompt(req.companion, req.playerCode);

  // OpenAI-compatible chat format
  const messages = [
    { role: 'system', content: systemPrompt },
    ...req.messages.map((m) => ({
      role: m.role, // 'user' | 'assistant'
      content: m.content,
    })),
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
