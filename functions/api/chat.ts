import { callLLM, type ChatRequest } from '../../src/lib/chatCore';

type Env = { ZHIPU_API_KEY: string };
type Context = { request: Request; env: Env };

/**
 * Cloudflare Pages Function. Runs at /api/chat on the deployed site.
 * Reads the API key from the environment binding (configured in
 * Cloudflare dashboard) so it is never shipped to the browser.
 */
export async function onRequestPost({
  request,
  env,
}: Context): Promise<Response> {
  try {
    const body = (await request.json()) as ChatRequest;
    const result = await callLLM(body, env.ZHIPU_API_KEY);
    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: err instanceof Error ? err.message : String(err),
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
