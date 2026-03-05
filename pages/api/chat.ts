import type { NextApiRequest, NextApiResponse } from "next";

type ChatBody = {
  messages: { role: "user" | "assistant" | "system"; content: string }[];
  characterId?: string;
};

type ChatResponse = {
  reply: string;
};

async function callDeepSeek(messages: ChatBody["messages"]): Promise<string> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    throw new Error("Missing DEEPSEEK_API_KEY");
  }

  const res = await fetch("https://api.deepseek.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages,
      temperature: 0.9
    })
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`DeepSeek error: ${res.status} ${text}`);
  }

  const json = (await res.json()) as any;
  const content = json.choices?.[0]?.message?.content;
  if (!content || typeof content !== "string") {
    throw new Error("DeepSeek returned empty content");
  }
  return content;
}

async function callOpenAI(messages: ChatBody["messages"]): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing OPENAI_API_KEY");
  }

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages,
      temperature: 0.9
    })
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OpenAI error: ${res.status} ${text}`);
  }

  const json = (await res.json()) as any;
  const content = json.choices?.[0]?.message?.content;
  if (!content || typeof content !== "string") {
    throw new Error("OpenAI returned empty content");
  }
  return content;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ChatResponse | { error: string }>
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const body = req.body as ChatBody;
    if (!body?.messages || !Array.isArray(body.messages)) {
      return res.status(400).json({ error: "Invalid request body" });
    }

    const hasDeepSeekKey = Boolean(process.env.DEEPSEEK_API_KEY);
    const hasOpenAIKey = Boolean(process.env.OPENAI_API_KEY);

    if (!hasDeepSeekKey && !hasOpenAIKey) {
      return res.status(500).json({
        error:
          "No AI key configured. Set DEEPSEEK_API_KEY or OPENAI_API_KEY in your environment."
      });
    }

    const reply = await (hasDeepSeekKey
      ? callDeepSeek(body.messages)
      : callOpenAI(body.messages));

    return res.status(200).json({ reply });
  } catch (error: any) {
    console.error("Chat API error", error);
    return res.status(500).json({
      error: "Failed to generate AI reply."
    });
  }
}

