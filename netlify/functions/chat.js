const SAFETY = "Keep replies short (1-3 sentences), warm and family-friendly. Never produce explicit sexual or violent content. Reply in the language the user writes in (Tamil or English).";
const DEFAULT = "You are Meera, a warm, cheerful friend.";
const json = (code, body) => ({ statusCode: code, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

exports.handler = async (event) => {
  const { neon } = await import("@neondatabase/serverless");
  const sql = process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : null;

  if (event.httpMethod === "GET") {
    const q = event.queryStringParameters || {};
    if (!sql || !q.session) return json(200, { messages: [] });
    const rows = await sql`SELECT role, content FROM messages WHERE session_id = ${String(q.session).slice(0, 64)} AND persona_id = ${String(q.persona || "meera").slice(0, 20)} ORDER BY created_at DESC LIMIT 30`;
    return json(200, { messages: rows.reverse() });
  }
  if (event.httpMethod !== "POST") return json(405, { error: "method" });

  let b;
  try { b = JSON.parse(event.body || "{}"); } catch (e) { return json(400, { error: "bad json" }); }
  const session = String(b.session || "").slice(0, 64);
  const persona = String(b.persona || "meera").slice(0, 20);
  if (b.action === "call_start" || b.action === "call_end") {
    if (!sql || !session) return json(200, { ok: false, logged: false });
    if (b.action === "call_start") {
      const rows = await sql`INSERT INTO call_sessions (session_id, persona_id) VALUES (${session}, ${persona}) RETURNING id`;
      return json(200, { ok: true, call_id: rows[0].id });
    }
    const callId = Number(b.call_id);
    if (Number.isInteger(callId) && callId > 0) {
      await sql`UPDATE call_sessions SET ended_at = now() WHERE id = ${callId} AND session_id = ${session} AND persona_id = ${persona} AND ended_at IS NULL`;
    }
    return json(200, { ok: true });
  }

  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return json(503, { error: "AI not configured" });
  const message = String(b.message || "").slice(0, 1000).trim();
  const romantic = b.romantic === true;
  const style = romantic ? " In romantic mode, be affectionate, gently flirty, sweet and respectful, like a fictional adult companion; keep it non-explicit and do not claim to be a real human." : "";
  if (!message) return json(400, { error: "empty" });

  let prompt = DEFAULT;
  if (sql) {
    const p = await sql`SELECT system_prompt FROM personas WHERE id = ${persona}`;
    if (p.length) prompt = p[0].system_prompt;
  }

  const msgs = [];
  (Array.isArray(b.history) ? b.history : []).slice(-10).forEach((m) => {
    if (!m || (m.role !== "user" && m.role !== "assistant")) return;
    const c = String(m.content || "").slice(0, 1000);
    const last = msgs[msgs.length - 1];
    if (!msgs.length && m.role === "assistant") return;
    if (last && last.role === m.role) last.content += "\n" + c; else msgs.push({ role: m.role, content: c });
  });
  const last = msgs[msgs.length - 1];
  if (last && last.role === "user") { if (last.content.indexOf(message) < 0) last.content += "\n" + message; } else msgs.push({ role: "user", content: message });

  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json" },
    body: JSON.stringify({ model: process.env.ANTHROPIC_MODEL || "claude-sonnet-5-5", max_tokens: 300, system: prompt + style + " " + SAFETY, messages: msgs }),
  });
  if (!r.ok) return json(502, { error: "upstream" });
  const d = await r.json();
  const reply = ((d.content || []).find((c) => c.type === "text") || {}).text;
  if (!reply) return json(502, { error: "empty reply" });

  if (sql && session) {
    await sql`INSERT INTO messages (session_id, persona_id, role, content) VALUES (${session}, ${persona}, 'user', ${message}), (${session}, ${persona}, 'assistant', ${reply})`;
  }
  return json(200, { reply });
};
