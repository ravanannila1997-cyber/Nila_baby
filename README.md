# Nila_baby - AI Video Call (3D avatar)

Tamil/English AI companion with 3D avatars, voice in/out and chat history.

## Features
- 3 characters, each with its own avatar: Nila (model.glb), Meera (base_basic_pbr.glb), Mathu (base_basic_shaded.glb)
- Voice (mic + speech) and text chat, Tamil / English
- Chat history saved in Neon Postgres (`db/schema.sql`)
- AI replies via Netlify Function `netlify/functions/chat.js` (family-friendly system prompt)

## Netlify environment variables
- `DATABASE_URL` - Neon connection string
- `ANTHROPIC_API_KEY` - API key for AI replies (without it the app uses simple built-in replies)
