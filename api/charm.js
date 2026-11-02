const SYSTEM_PROMPT = `You are CHARM AI, a warm, witty, emotionally intelligent conversation coach for adults (18+).
Help users communicate naturally, confidently and respectfully. Match the requested style: Smooth, Funny, Romantic, Bold, Nonchalant, Playful or Mysterious.
Never encourage manipulation, coercion, harassment, deception, pressure, stalking, or ignoring rejection. Respect consent and boundaries. Do not claim to know another person's hidden feelings from messages; describe observable tone with uncertainty.
Keep suggestions concise, natural, and adaptable. Avoid over-the-top pickup lines. Encourage the user to sound like themselves.
Return valid JSON only, with keys "replies" (array of exactly 3 short strings) and "note" (one short helpful sentence). For analysis requests, use "replies" as an empty array and put a balanced reflection with practical next steps in "note".`;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed." });
  }

  if (!process.env.OPENAI_API_KEY) {
    return res.status(503).json({
      error: "CHARM AI's brain is not connected yet. Add the OPENAI_API_KEY environment variable in your hosting settings."
    });
  }

  try {
    const { action = "generate", context = "", style = "Smooth", messages = [] } = req.body || {};
    const allowedStyles = ["Smooth", "Funny", "Romantic", "Bold", "Nonchalant", "Playful", "Mysterious"];
    if (!allowedStyles.includes(style)) return res.status(400).json({ error: "Choose a valid conversation style." });
    if (typeof context !== "string" || context.length > 4000) return res.status(400).json({ error: "Your context must be under 4,000 characters." });
    if (!["generate", "analyse"].includes(action)) return res.status(400).json({ error: "Unknown CHARM AI action." });

    const task = action === "analyse"
      ? "Reflect on this anonymised conversation. Mention observable tone, balance, what is uncertain, and one respectful next step. Do not mind-read."
      : "Create three distinct reply options to the user's situation in the selected style. Make them sound natural, not scripted.";

    const input = action === "analyse"
      ? context
      : `Situation: ${context || "The user wants a natural conversation starter."}\nPreferred style: ${style}\nUser profile: ${String(req.body?.preferences || "No extra preferences").slice(0, 500)}`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        temperature: 0.85,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: `${task}\n\n${input}` }
        ]
      })
    });

    const data = await response.json();
    if (!response.ok) {
      console.error("AI provider error:", data?.error?.message || response.status);
      return res.status(502).json({ error: "The AI service could not complete that request. Please try again." });
    }

    const raw = data?.choices?.[0]?.message?.content || "{}";
    let result;
    try { result = JSON.parse(raw); }
    catch { return res.status(502).json({ error: "CHARM AI received an unreadable response. Please try again." }); }

    const replies = Array.isArray(result.replies) ? result.replies.slice(0, 3).map(x => String(x).slice(0, 600)) : [];
    return res.status(200).json({ replies, note: String(result.note || "").slice(0, 1200), model: process.env.OPENAI_MODEL || "gpt-4o-mini" });
  } catch (error) {
    console.error("CHARM AI API error:", error);
    return res.status(500).json({ error: "Something went wrong. Please try again in a moment." });
  }
}
