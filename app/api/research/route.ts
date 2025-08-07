import { NextRequest, NextResponse } from 'next/server';
import { fetchAllData } from '@/lib/api';
import { analyzeCryptoData } from '@/lib/groq';
import { ResearchResult } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();

    if (!query) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    // Fetch data from multiple sources
    const data = await fetchAllData(query);

    // Analyze data with Groq AI
    const result: ResearchResult = await analyzeCryptoData(query, data);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Research API error:', error);
    
    // Check for specific Groq API over capacity error
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const isCapacityError = errorMessage.includes('over capacity');
    
    return NextResponse.json(
      { 
        success: false, 
        error: isCapacityError 
          ? 'The AI service is currently over capacity. Please try again in a few moments.'
          : 'Failed to process research query',
        details: errorMessage
      },
      { status: isCapacityError ? 503 : 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Crypto Research Assistant API',
    endpoints: {
      POST: '/api/research - Submit a research query',
    },
  });
}
