import type { Plugin } from 'vite';
import { callLLM, type ChatRequest } from './src/lib/chatCore';

/**
 * Vite dev server plugin that mounts /api/chat locally so development
 * matches the Cloudflare Pages Function behavior in production.
 * The API key comes from .env.local via loadEnv in vite.config.ts.
 */
export function devApiPlugin(apiKey: string): Plugin {
  return {
    name: 'rah-dev-api',
    configureServer(server) {
      server.middlewares.use('/api/chat', async (req, res, next) => {
        if (req.method !== 'POST') return next();

        let body = '';
        req.on('data', (chunk) => (body += chunk));
        req.on('end', async () => {
          try {
            const payload = JSON.parse(body) as ChatRequest;
            const result = await callLLM(payload, apiKey);
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(result));
          } catch (err) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(
              JSON.stringify({
                error: err instanceof Error ? err.message : String(err),
              })
            );
          }
        });
      });
    },
  };
}
