import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

type Objective = {
  title?: string;
  description?: string;
  current?: number;
  target?: number;
};

function mockResponse(objective?: Objective, remarks?: string) {
  const score = Math.min(
    100,
    ((objective?.current || 0) / Math.max(1, objective?.target || 1)) * 100 + Math.random() * 5
  );
  return {
    score: Number(score.toFixed(1)),
    feedback: `AI review of remarks: "${remarks || ''}" suggests focusing on consistency and communication.`,
    recommendations: [
      'Align tasks to measurable KPIs',
      'Increase cross-team collaboration',
      'Schedule weekly progress reviews',
    ],
    source: 'mock',
  };
}

export async function POST(req: NextRequest) {
  const debug = req.nextUrl.searchParams.get('debug') === '1';
  const forceMock = req.nextUrl.searchParams.get('forceMock') === '1' || process.env.AI_PROVIDER === 'mock';
  const body = await req.json().catch(() => ({} as any));
  const { objective, remarks } = body as { objective?: Objective; remarks?: string };

  const apiKey = process.env.GEMINI_API_KEY; // Google Generative AI (API key based)
  const gcpCreds = process.env.GOOGLE_APPLICATION_CREDENTIALS; // Vertex AI (service account file path)
  const gcpProject = process.env.GCP_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT;
  const location = process.env.GCP_LOCATION || 'us-central1';
  const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

  // Helper: produce prompt string
  const title = objective?.title || 'Objective';
  const desc = objective?.description || '';
  const current = objective?.current ?? 0;
  const target = objective?.target ?? 100;
  const progressPct = Math.max(0, Math.min(100, (current / Math.max(1, target)) * 100));
  const userPrompt = `Analyze this objective and remarks and return JSON only.\nTitle: ${title}\nDescription: ${desc}\nProgress: ${progressPct.toFixed(1)}% (current=${current}, target=${target})\nRemarks: ${remarks || ''}`;
  const schemaHint = 'Respond ONLY with valid JSON matching: {"score": number (0-100), "feedback": string, "recommendations": string[]}';

  try {
    if (forceMock) {
      if (debug) console.warn('[gemini] forceMock enabled');
      return NextResponse.json(mockResponse(objective, remarks));
    }
    // Option A: Google Generative AI with API key
    if (apiKey) {
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(apiKey);
      const modelClient = genAI.getGenerativeModel({ model });
      const result = await modelClient.generateContent({
        contents: [{
          role: 'user',
          parts: [{ text: `${schemaHint}\n\n${userPrompt}` }],
        }],
      });
      const text = result.response?.text?.() || '';
      let parsed: any = null;
      try { parsed = JSON.parse(text); } catch {
        const match = text.match(/\{[\s\S]*\}/);
        if (match) parsed = JSON.parse(match[0]);
      }
      if (!parsed || typeof parsed.score !== 'number' || !parsed.feedback || !Array.isArray(parsed.recommendations)) {
        if (debug) console.warn('[gemini] Invalid JSON from API key path. Raw:', text);
        return NextResponse.json(mockResponse(objective, remarks));
      }
      const safeScore = Math.max(0, Math.min(100, Number(parsed.score)));
      const response = {
        score: Number(safeScore.toFixed(1)),
        feedback: String(parsed.feedback),
        recommendations: parsed.recommendations.map((r: any) => String(r)).slice(0, 6),
        source: 'gemini-apikey',
      };
      if (debug) console.log('[gemini] Success via API key', response);
      return NextResponse.json(response);
    }

    // Option B: Vertex AI with service account (ADC)
    if (gcpCreds && gcpProject) {
      const { VertexAI } = await import('@google-cloud/vertexai');
      const vertex = new VertexAI({ project: gcpProject, location });
      const modelClient = vertex.getGenerativeModel({ model });
      const result = await modelClient.generateContent({
        contents: [
          {
            role: 'user',
            parts: [{ text: `${schemaHint}\n\n${userPrompt}` }],
          },
        ],
      });
      const candidates = (result as any)?.response?.candidates || [];
      const text = candidates[0]?.content?.parts?.[0]?.text || '';
      let parsed: any = null;
      try { parsed = JSON.parse(text); } catch {
        const match = text.match(/\{[\s\S]*\}/);
        if (match) parsed = JSON.parse(match[0]);
      }
      if (!parsed || typeof parsed.score !== 'number' || !parsed.feedback || !Array.isArray(parsed.recommendations)) {
        if (debug) console.warn('[gemini] Invalid JSON from Vertex AI. Raw:', text);
        return NextResponse.json(mockResponse(objective, remarks));
      }
      const safeScore = Math.max(0, Math.min(100, Number(parsed.score)));
      const response = {
        score: Number(safeScore.toFixed(1)),
        feedback: String(parsed.feedback),
        recommendations: parsed.recommendations.map((r: any) => String(r)).slice(0, 6),
        source: 'gemini-vertex',
      };
      if (debug) console.log('[gemini] Success via Vertex', response);
      return NextResponse.json(response);
    }

    if (debug) console.warn('[gemini] No credentials found (GEMINI_API_KEY or GOOGLE_APPLICATION_CREDENTIALS/GCP_PROJECT_ID). Using mock');
    return NextResponse.json(mockResponse(objective, remarks));
  } catch (error: any) {
    if (debug) console.error('[gemini] Error:', error?.message || error);
    const fb = mockResponse(objective, remarks) as any;
    if (debug) fb.errorMessage = error?.message || String(error);
    return NextResponse.json(fb);
  }
}
