export const AI_PROVIDER =
  (typeof process !== 'undefined' && (process.env.NEXT_PUBLIC_AI_PROVIDER || process.env.AI_PROVIDER)) ||
  'mock';

export const AI_API_ROUTE =
  (typeof process !== 'undefined' && (process.env.NEXT_PUBLIC_AI_API_ROUTE || '/api/ai-analyze')) ||
  '/api/ai-analyze';

export function getRouteForProvider(provider: string): string {
  switch (provider) {
    case 'openai':
      return '/api/ai-analyze';
    case 'gemini':
      return '/api/ai-analyze-gemini';
    default:
      return '/api/ai-analyze';
  }
}
