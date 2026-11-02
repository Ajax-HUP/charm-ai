# Connect the CHARM AI brain

The app now calls a server-side endpoint at `/api/charm`. The provider key is read only on the server and must never be added to React code, the APK, or a public GitHub file.

## Vercel setup
1. Import the `Ajax-HUP/charm-ai` GitHub repository into Vercel (or open its existing project).
2. In Project Settings → Environment Variables, add:
   - Name: `OPENAI_API_KEY`
   - Value: your private OpenAI API key
   - Environments: Production, Preview, Development as needed
3. Optionally add `OPENAI_MODEL` with value `gpt-4o-mini`.
4. Redeploy the project after saving the variables.
5. Test Charm Chat and Chat Analyser on the deployed website.

API usage is billed by the provider. Set a spending limit and usage alerts in the provider dashboard before sharing the app publicly.

## Android APK
The APK cannot call a relative website API address from its local app origin. After Vercel gives the project a deployed URL, set the GitHub Actions repository variable `VITE_API_BASE_URL` to that exact HTTPS origin (for example, `https://your-project.vercel.app`, without a trailing slash), then run the Android APK workflow again. This is a public endpoint URL, not a secret. Never put `OPENAI_API_KEY` in GitHub Actions variables used by the frontend build.

## Roadmap
See [ROADMAP.md](./ROADMAP.md) for Screenshot & Chat Analyser, Personal AI Wingman, Voice Charm and Charm Academy.

## Before public launch
Add authentication, per-user rate limiting, abuse controls, privacy policy, terms, age verification (18+), and clear data retention/deletion controls. Do not upload identifiable chat screenshots; redact names, numbers and profile photos first.
