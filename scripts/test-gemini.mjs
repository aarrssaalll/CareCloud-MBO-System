#!/usr/bin/env node
import { config } from 'dotenv';
config();

async function run() {
  const apiKey = process.env.GEMINI_API_KEY;
  try {
    if (apiKey) {
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || 'gemini-1.5-flash' });
      const res = await model.generateContent({ contents: [{ role: 'user', parts: [{ text: 'Return JSON {"ok":true}' }] }] });
      const text = res.response?.text?.() || '';
      try {
        // Try to parse directly first
        let parsed = null;
        try {
          parsed = JSON.parse(text);
        } catch {
          // If direct parsing fails, try to extract JSON from markdown code blocks
          const match = text.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/) || text.match(/(\{[\s\S]*?\})/);
          if (match) {
            parsed = JSON.parse(match[1]);
          }
        }
        if (parsed?.ok === true) {
          console.log(JSON.stringify({ success: true, mode: 'apikey' }));
          return;
        }
      } catch {}
      console.log(JSON.stringify({ success: false, reason: 'UNEXPECTED_CONTENT', text }));
      process.exitCode = 3;
      return;
    }

    const creds = process.env.GOOGLE_APPLICATION_CREDENTIALS && (process.env.GCP_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT);
    if (creds) {
      const { VertexAI } = await import('@google-cloud/vertexai');
      const vertex = new VertexAI({ project: process.env.GCP_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT, location: process.env.GCP_LOCATION || 'us-central1' });
      const model = vertex.getGenerativeModel({ model: process.env.GEMINI_MODEL || 'gemini-1.5-flash' });
      const res = await model.generateContent({ contents: [{ role: 'user', parts: [{ text: 'Return JSON {"ok":true}' }] }] });
      const text = (res?.response?.candidates?.[0]?.content?.parts?.[0]?.text) || '';
      try {
        // Try to parse directly first
        let parsed = null;
        try {
          parsed = JSON.parse(text);
        } catch {
          // If direct parsing fails, try to extract JSON from markdown code blocks
          const match = text.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/) || text.match(/(\{[\s\S]*?\})/);
          if (match) {
            parsed = JSON.parse(match[1]);
          }
        }
        if (parsed?.ok === true) {
          console.log(JSON.stringify({ success: true, mode: 'vertex' }));
          return;
        }
      } catch {}
      console.log(JSON.stringify({ success: false, reason: 'UNEXPECTED_CONTENT', text }));
      process.exitCode = 3;
      return;
    }
    console.log(JSON.stringify({ success: false, reason: 'NO_CREDS' }));
    process.exitCode = 2;
  } catch (e) {
    console.log(JSON.stringify({ success: false, error: e.message || String(e) }));
    process.exitCode = 1;
  }
}
run();
