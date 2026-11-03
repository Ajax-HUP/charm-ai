const SYSTEM_PROMPT = `You are CharmAI, a warm, witty, emotionally intelligent conversation coach for adults (18+).
Help users communicate naturally, confidently and respectfully. Match the requested style: Smooth, Funny, Romantic, Bold, Nonchalant, Playful or Mysterious.
Never encourage manipulation, coercion, harassment, deception, pressure, stalking, or ignoring rejection. Respect consent and boundaries. Do not claim to know another person's hidden feelings from messages; describe observable tone with uncertainty.
Keep suggestions concise, natural, and adaptable. Avoid over-the-top pickup lines. Encourage the user to sound like themselves.
Return valid JSON only, with keys "replies" (array of exactly 3 short strings) and "note" (one short helpful sentence). For analysis requests, use "replies" as an empty array and put a balanced reflection with practical next steps in "note".`;

const allowedStyles = ["Smooth", "Funny", "Romantic", "Bold", "Nonchalant", "Playful", "Mysterious"];

function getPrompt(action, context, style, preferences) {
  const task = action === "analyse"
    ? "Reflect on this conversation. Mention observable tone, balance, what is uncertain, and one respectful next step. Do not mind-read."
    : "Create three distinct reply options to the user's situation in the selected style. Make them sound natural, not scripted.";
  const input = action === "analyse"
    ? context
    : `Situation: ${context || "The user wants a natural conversation starter."}\nPreferred style: ${style}\nUser preferences: ${String(preferences || "No extra preferences").slice(0, 500)}`;
  return `${SYSTEM_PROMPT}\n\nTASK: ${task}\n\n${input}`;
}

function parseResult(raw) {
  const cleaned = String(raw || "").replace(/^```json\s*/i, "").replace(/\s*```$/, "");
  const result = JSON.parse(cleaned);
  return {
    replies: Array.isArray(result.replies) ? result.replies.slice(0, 3).map(x => String(x).slice(0, 600)) : [],
    note: String(result.note || "").slice(0, 1200)
  };
}

async function askGemini(prompt) {
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash-lite";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.8, responseMimeType: "application/json", maxOutputTokens: 700 }
    })
  });
  const data = await response.json();
  if (!response.ok) {
    console.error("Gemini provider error:", data?.error?.message || response.status);
    const error = new Error("The live AI provider could not complete that request.");
    error.status = response.status;
    throw error;
  }
  const raw = data?.candidates?.[0]?.content?.parts?.map(p => p.text || "").join("") || "";
  return { result: parseResult(raw), model };
}

async function askOpenAI(prompt) {
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model, temperature: 0.8, response_format: { type: "json_object" },
      messages: [{ role: "system", content: SYSTEM_PROMPT }, { role: "user", content: prompt.replace(SYSTEM_PROMPT, "") }]
    })
  });
  const data = await response.json();
  if (!response.ok) {
    console.error("OpenAI provider error:", data?.error?.message || response.status);
    const error = new Error("The live AI provider could not complete that request.");
    error.status = response.status;
    throw error;
  }
  return { result: parseResult(data?.choices?.[0]?.message?.content || "{}"), model };
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed." });
  }

  const hasGemini = Boolean(process.env.GEMINI_API_KEY);
  const hasOpenAI = Boolean(process.env.OPENAI_API_KEY);
  if (!hasGemini && !hasOpenAI) {
    return res.status(503).json({ error: "Connect a Gemini API key in Vercel to enable live CharmAI. Free offline tools are still available." });
  }

  try {
    const { action = "generate", context = "", style = "Smooth", preferences = "" } = req.body || {};
    if (!allowedStyles.includes(style)) return res.status(400).json({ error: "Choose a valid conversation style." });
    if (typeof context !== "string" || context.length > 4000) return res.status(400).json({ error: "Your context must be under 4,000 characters." });
    if (!["generate", "analyse"].includes(action)) return res.status(400).json({ error: "Unknown CharmAI action." });

    const prompt = getPrompt(action, context, style, preferences);
    const { result, model } = hasGemini ? await askGemini(prompt) : await askOpenAI(prompt);
    return res.status(200).json({ ...result, provider: hasGemini ? "gemini" : "openai", model });
  } catch (error) {
    console.error("CharmAI API error:", error);
    const status = error.status === 429 ? 429 : 502;
    return res.status(status).json({ error: status === 429 ? "The free AI usage limit has been reached. Please try again later." : "The live AI service could not complete that request. Please try again." });
  }
}
