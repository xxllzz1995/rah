import type { ChatRequest, ChatResponse } from './chatCore';

/**
 * Client-side wrapper. Sends the chat request to /api/chat which is handled
 * by the Vite dev plugin in development and the Cloudflare Pages Function
 * in production. The API key never touches the browser.
 */
export async function sendChatMessage(
  req: ChatRequest
): Promise<ChatResponse> {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Chat API error ${res.status}: ${errText}`);
  }
  return res.json();
}
