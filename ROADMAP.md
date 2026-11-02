# CHARM AI product roadmap

## Stage 1 — Real AI Brain (current)
- Secure server-side AI endpoint at /api/charm.
- AI-generated reply options across all seven styles.
- AI-powered conversation reflection.
- API key stays in hosting environment variables; never ship it in the Android app.
- Friendly errors when the provider key is not configured.

## Stage 2 — Screenshot & Chat Analyser
- User-selected screenshot upload and OCR/vision extraction.
- Preview extracted text before sending it for analysis.
- Clear warning to crop/blur names, phone numbers, profile photos and other private details.
- Never infer a person's private feelings as fact.

## Stage 3 — Personal AI Wingman
- Optional saved style, tone and writing preferences.
- User-controlled memory with view, edit and delete controls.
- No storing private conversations by default.

## Stage 4 — Voice Charm
- Speech-to-text input and text-to-speech playback.
- Practice roleplay with clear start/stop controls.
- Ask permission before microphone access and explain browser/device support.

## Stage 5 — Charm Academy
- Guided lessons, practical examples and progress tracking.
- Topics: curiosity, listening, confidence, respectful flirting, consent and boundaries.

## Release requirements
- Add authentication and per-user rate limits before public launch.
- Add privacy policy, terms, age gate (18+), abuse protections and data-retention controls.
- Configure billing only after the core AI experience is stable.
- Never expose provider secrets in frontend code or the APK.
