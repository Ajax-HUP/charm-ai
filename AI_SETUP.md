# Connect the CharmAI brain

CharmAI supports Google's Gemini API (recommended for starting with its free tier) and OpenAI. Provider keys are server-only. Never put them in React code, GitHub frontend variables, an APK, or public files.

## Recommended: Gemini free tier

1. Open [Google AI Studio](https://aistudio.google.com/app/apikey).
2. Sign in and create an API key for a project.
3. Copy the key privately. Do not send it in chat or commit it to GitHub.
4. Open the Vercel project for `charm-ai`.
5. Go to Settings → Environment Variables.
6. Add `GEMINI_API_KEY` with your new key. Select Production (and Preview if you test previews).
7. Optionally add `GEMINI_MODEL` with value `gemini-2.5-flash-lite`.
8. Save and redeploy the latest deployment.
9. Open CharmAI and test Charm Chat and Chat Analyser.

The API endpoint uses Gemini when `GEMINI_API_KEY` is set. It falls back to OpenAI only if no Gemini key is configured. Free-tier quotas and model access depend on your Google AI Studio project and can change. Review the current [Gemini pricing](https://ai.google.dev/gemini-api/docs/pricing) and [rate limits](https://ai.google.dev/gemini-api/docs/rate-limits). Free-tier content may be used to improve Google's products, so do not send private or identifiable conversations.

## OpenAI alternative

Set `OPENAI_API_KEY` and optionally `OPENAI_MODEL=gpt-4o-mini` in Vercel. OpenAI API usage is billed separately from ChatGPT subscriptions.

## Android APK

The APK cannot call a relative website API address from its local app origin. Set the GitHub Actions repository variable `VITE_API_BASE_URL` to `https://charm-ai-beta.vercel.app` (no trailing slash), then run the Android APK workflow again. This is a public endpoint URL, not a secret. Never add provider API keys to frontend or GitHub Actions build variables.

## Launch checklist

Before accepting public users, add authentication, per-user rate limiting, abuse controls, privacy policy, terms, age gating (18+), and clear data retention/deletion controls. Avoid storing sensitive chat screenshots. Test the deployed app on Android and desktop, and verify all error states and offline fallbacks.
