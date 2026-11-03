# CharmAI authentication setup

CharmAI now uses Supabase Auth for persistent Google and email/password sign-in.

## 1. Create or open a Supabase project
Open https://supabase.com/dashboard and create a project for CharmAI. In Project Settings > API, copy the Project URL and the API key labelled anon / publishable. Never put a service-role key in the frontend.

## 2. Add Vercel environment variables
In Vercel > charm-ai > Settings > Environment Variables, add these for Production (and Preview if desired):
- VITE_SUPABASE_URL = your Supabase Project URL
- VITE_SUPABASE_ANON_KEY = your Supabase anon / publishable key

Redeploy after saving environment variables.

## 3. Configure email sign-in
In Supabase > Authentication > URL Configuration:
- Set Site URL to https://charm-ai-beta.vercel.app
- Add https://charm-ai-beta.vercel.app to Redirect URLs
- Add your local development URL if you use one

In Authentication > Providers > Email, enable email signups. Email confirmation can remain enabled; new users will need to confirm their address before their first sign-in.

## 4. Configure Google sign-in
In Supabase > Authentication > Providers > Google, enable Google and enter the Google OAuth Client ID and Client Secret from Google Cloud Console. Supabase displays an OAuth callback URL. Add that exact callback URL to the Authorized redirect URIs in your Google Cloud OAuth client. Also add https://charm-ai-beta.vercel.app as an authorized JavaScript origin in Google Cloud. Save the provider settings.

## Notes
- Google sign-in will not work until Google OAuth is configured in Supabase and Google Cloud.
- Email sign-up/sign-in uses Supabase Auth and persistent browser sessions.
- Keep API secrets out of source code and GitHub. The browser only receives the Supabase anon / publishable key.
- Before a public launch, configure Supabase security controls, privacy/terms, account deletion, and 18+ age gating.
