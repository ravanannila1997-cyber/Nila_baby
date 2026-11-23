# Nila_baby - AI Video Call (3D avatar)

Tamil/English AI companion with a 3D avatar, voice in/out and chat history.

## Features
- 3 personas: Meera (friend), Arun (mentor), Priya (language buddy)
- Voice (mic + speech) and text chat, Tamil / English
- Chat history saved in Neon Postgres (`db/schema.sql`)
- AI replies via Netlify Function `netlify/functions/chat.js` (family-friendly system prompt)

## Netlify environment variables
- `DATABASE_URL` - Neon connection string
- `ANTHROPIC_API_KEY` - API key for AI replies (without it the app uses simple built-in replies)
