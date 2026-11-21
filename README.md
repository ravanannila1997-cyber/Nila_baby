# மீரா – AI Video Call (GitHub + Netlify)

Files: `index.html`, `model.glb`, `netlify.toml`, `netlify/functions/chat.js`

1. Upload all files to a GitHub repo (keep the folder structure).
2. Netlify > Add new site > Import from Git > pick the repo (no build command).
3. Site settings > Environment variables > add `ANTHROPIC_API_KEY`.
4. Deploy. Without the key the site still works with simple built-in replies.

Notes
- Open the deployed URL (file:// will not load model.glb).
- Mic and voice need HTTPS (Netlify gives it) and Chrome/Edge/Safari.
- Replace `model.glb` with a rigged GLB (Mixamo animations named “idle”/“wave”) or an ARKit-blendshape GLB to get gestures, blink and lip-sync automatically.
- Set a monthly spend limit in the Anthropic console to control cost.
