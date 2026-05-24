// Vercel Serverless Function: /api/generate.js
// This keeps your Anthropic API key on the server. Never exposed to the browser.

export default async function handler(req, res) {
  // CORS headers for local dev
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { prompt } = req.body;

  if (!prompt || typeof prompt !== "string" || prompt.length < 50) {
    return res.status(400).json({ error: "Invalid or missing prompt" });
  }

  // Rate limiting: basic protection against abuse
  // For production, add proper rate limiting (e.g., upstash/ratelimit)

  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "API key not configured. Set ANTHROPIC_API_KEY in Vercel environment variables." });
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-opus-4-6",
        max_tokens: 1500,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      console.error("Anthropic API error:", response.status, errBody);
      return res.status(502).json({
        error: `Anthropic API returned ${response.status}`,
      });
    }

    const data = await response.json();

    if (data.content && data.content.length > 0) {
      const letter = data.content
        .filter((block) => block.type === "text")
        .map((block) => block.text)
        .join("\n");

      return res.status(200).json({ letter });
    }

    return res.status(502).json({ error: "No content in Anthropic response" });
  } catch (err) {
    console.error("Generate error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
