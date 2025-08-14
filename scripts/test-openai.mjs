#!/usr/bin/env node
import OpenAI from 'openai';

async function main() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error('NO_KEY');
    process.exit(2);
  }
  const client = new OpenAI({ apiKey });
  try {
    const start = Date.now();
    const res = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'Return JSON {"ok":true}' },
        { role: 'user', content: 'Respond now' }
      ],
      max_tokens: 20,
      temperature: 0
    });
    const ms = Date.now() - start;
    const content = res.choices?.[0]?.message?.content || '';
    let parsed;
    try { parsed = JSON.parse(content); } catch {}
    if (parsed?.ok === true) {
      console.log(JSON.stringify({ success: true, model: res.model, latencyMs: ms }));
    } else {
      console.log(JSON.stringify({ success: false, reason: 'UNEXPECTED_CONTENT', content }));
      process.exitCode = 3;
    }
  } catch (e) {
    console.log(JSON.stringify({ success: false, error: e.message || String(e) }));
    process.exitCode = 1;
  }
}
main();
