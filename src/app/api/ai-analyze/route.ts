import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

type Objective = {
  title?: string;
  description?: string;
  current?: number;
  target?: number;
};

function mockResponse(objective?: Objective, remarks?: string) {
  const score = Math.min(100, (objective?.current || 0) / Math.max(1, objective?.target || 1) * 100 + Math.random() * 5);
  const recommendations = [
    'Align tasks to measurable KPIs',
    'Increase cross-team collaboration',
    'Schedule weekly progress reviews'
  ];
  return {
    score: Number(score.toFixed(1)),
    feedback: `AI review of remarks: "${remarks || ''}" suggests focusing on consistency and communication.`,
    recommendations,
  source: 'mock'
  };
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({} as any));
  const { objective, remarks } = body as { objective?: Objective; remarks?: string };

  const apiKey = process.env.OPENAI_API_KEY;
  const debug = req.nextUrl.searchParams.get('debug') === '1';
  const forceMock = req.nextUrl.searchParams.get('forceMock') === '1' || process.env.AI_PROVIDER === 'mock';
  if (forceMock) {
    if (debug) console.warn('[ai-analyze] forceMock enabled');
    return NextResponse.json(mockResponse(objective, remarks));
  }
  if (!apiKey) {
    if (debug) console.warn('[ai-analyze] OPENAI_API_KEY missing - using mock');
    return NextResponse.json(mockResponse(objective, remarks));
  }

  try {
    const { default: OpenAI } = await import('openai');
    const client = new OpenAI({ apiKey });
    const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';

    const title = objective?.title || 'Objective';
    const desc = objective?.description || '';
    const current = objective?.current ?? 0;
    const target = objective?.target ?? 100;
    const progressPct = Math.max(0, Math.min(100, (current / Math.max(1, target)) * 100));

    const system = 'You are an MBO performance analysis assistant. Respond ONLY with valid JSON matching the schema: {"score": number (0-100), "feedback": string, "recommendations": string[]}. Keep score to one decimal.';
    const user = `Analyze this objective and remarks and return JSON only.\nTitle: ${title}\nDescription: ${desc}\nProgress: ${progressPct.toFixed(1)}% (current=${current}, target=${target})\nRemarks: ${remarks || ''}`;

  const completion = await client.chat.completions.create({
      model,
      temperature: 0.2,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
    });

    const content = completion.choices?.[0]?.message?.content || '';

    // Try to parse strict JSON from the model
    let parsed: any = null;
    try {
      parsed = JSON.parse(content);
    } catch {
      // Attempt to extract JSON substring if extra text slipped in
      const match = content.match(/\{[\s\S]*\}/);
      if (match) parsed = JSON.parse(match[0]);
    }

    if (!parsed || typeof parsed.score !== 'number' || !parsed.feedback || !Array.isArray(parsed.recommendations)) {
      if (debug) console.warn('[ai-analyze] Invalid OpenAI JSON response, falling back. Raw:', content);
      return NextResponse.json(mockResponse(objective, remarks));
    }

    const safeScore = Math.max(0, Math.min(100, Number(parsed.score)));
    const response = {
      score: Number(safeScore.toFixed(1)),
      feedback: String(parsed.feedback),
      recommendations: parsed.recommendations.map((r: any) => String(r)).slice(0, 6),
      source: 'openai'
    };
    if (debug) console.log('[ai-analyze] OpenAI success', response);
    return NextResponse.json(response);
  } catch (error: any) {
  if (debug) console.error('[ai-analyze] Error calling OpenAI:', error?.message || error);
  const fallback = mockResponse(objective, remarks);
  if (debug) (fallback as any).errorMessage = error?.message || String(error);
  return NextResponse.json(fallback);
  }
}
