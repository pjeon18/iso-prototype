import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react";

/**
 * Dev-server proxy for the optional LLM-driven partner (APPROVED_PLAN.md §D2).
 * Forwards POST /api/partner → Anthropic Messages API, injecting
 * ANTHROPIC_API_KEY from .env SERVER-SIDE. The key never reaches browser code.
 * With no key (or on any upstream error) it returns a non-200 and the client
 * silently falls back to the scripted persona engine.
 */
function partnerProxy(apiKey: string | undefined): Plugin {
  return {
    name: "iso-partner-proxy",
    configureServer(server) {
      server.middlewares.use("/api/partner", (req, res) => {
        if (req.method !== "POST") {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: "method_not_allowed" }));
          return;
        }
        if (!apiKey) {
          res.statusCode = 503;
          res.end(JSON.stringify({ error: "no_api_key" }));
          return;
        }
        let body = "";
        req.on("data", (chunk) => (body += chunk));
        req.on("end", async () => {
          try {
            const { system, messages } = JSON.parse(body || "{}");
            const upstream = await fetch("https://api.anthropic.com/v1/messages", {
              method: "POST",
              headers: {
                "content-type": "application/json",
                "x-api-key": apiKey,
                "anthropic-version": "2023-06-01",
              },
              body: JSON.stringify({
                model: "claude-haiku-4-5-20251001",
                max_tokens: 200,
                system,
                messages,
              }),
            });
            const data = await upstream.text();
            res.statusCode = upstream.status;
            res.setHeader("content-type", "application/json");
            res.end(data);
          } catch {
            res.statusCode = 502;
            res.end(JSON.stringify({ error: "proxy_error" }));
          }
        });
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    // GitHub Pages serves project sites from /<repo>/ — CI sets BASE_PATH.
    // Locally the base stays "/" so nothing changes for dev.
    base: env.BASE_PATH || "/",
    plugins: [react(), partnerProxy(env.ANTHROPIC_API_KEY)],
  };
});
