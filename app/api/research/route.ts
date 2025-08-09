import { NextRequest, NextResponse } from 'next/server';
import { fetchAllData } from '@/lib/api';
import { analyzeCryptoData } from '@/lib/groq';
import { ResearchResult } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const { query, sources = ['groq', 'langchain'] } = await request.json();

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ success: false, error: 'Query is required and must be a string' }, { status: 400 });
    }

    // Define runners for each source
    const runners: Record<string, () => Promise<any>> = {
      groq: async () => {
        const data = await fetchAllData(query);
        return await analyzeCryptoData(query, data);
      },
      langchain: async () => {
        try {
          const { analyzeWithLangChain } = await import('@/lib/langchain');
          return await analyzeWithLangChain(query);
        } catch (e) {
          throw new Error('LangChain source not available');
        }
      },
    };

    // Run all sources in parallel
    const results = await Promise.all(
      sources.map(async (source: string) => {
        try {
          const result = await runners[source]();
          return { source, result };
        } catch (error) {
          return { source, error: error instanceof Error ? error.message : String(error) };
        }
      })
    );

    // Choose primary successful result (prefer groq, then langchain)
    const primary = results.find(r => r.source === 'groq' && !('error' in r))
      || results.find(r => r.source === 'langchain' && !('error' in r))
      || results.find(r => !('error' in r));

    // Optional formatted debug output (kept for troubleshooting)
    const formatted = results.map(r =>
      'error' in r && r.error
        ? `Source: ${r.source}\nError: ${r.error}`
        : `Source: ${r.source}\nResult: ${JSON.stringify((r as any).result, null, 2)}`
    ).join('\n\n');

    if (primary && 'result' in primary) {
      const data: ResearchResult = (primary as any).result;
      return NextResponse.json({ success: true, data, debug: { output: formatted, sourcesTried: results.map(r=>r.source) } });
    }

    return NextResponse.json({ success: false, error: 'All sources failed', results }, { status: 502 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
  // ...existing code...
}

export async function GET() {
  return NextResponse.json({
    message: 'Crypto Research Assistant API',
    endpoints: {
      POST: '/api/research - Submit a research query',
    },
  });
}
