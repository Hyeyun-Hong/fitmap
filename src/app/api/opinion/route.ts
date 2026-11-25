import { OPINION_SYSTEM_PROMPT } from "@/lib/prompts";

// API 키는 서버에서만 읽는다. 키가 없거나 호출이 실패하면 fallback 신호만 돌려주고,
// 화면은 계산 결과로 만든 기본 문장을 그대로 보여준다.
export async function POST(req: Request) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return Response.json({ fallback: true });

  try {
    const { input } = (await req.json()) as { input?: string };
    if (!input || typeof input !== "string" || input.length > 8000) return Response.json({ fallback: true });

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL ?? "claude-haiku-5-5",
        max_tokens: 400,
        system: OPINION_SYSTEM_PROMPT,
        messages: [{ role: "user", content: input }],
      }),
    });
    if (!res.ok) return Response.json({ fallback: true });

    const data = (await res.json()) as { content?: { type: string; text?: string }[] };
    const text = data.content?.find((c) => c.type === "text")?.text ?? "";
    const json = text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1);
    const parsed = JSON.parse(json);
    return Response.json({
      headline: String(parsed.headline ?? ""),
      opinion: String(parsed.opinion ?? ""),
      recommendedSize: parsed.recommendedSize ?? null,
      caution: String(parsed.caution ?? ""),
      fallback: false,
    });
  } catch {
    return Response.json({ fallback: true });
  }
}
