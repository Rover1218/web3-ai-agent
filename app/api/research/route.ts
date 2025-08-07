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
    try {
      const result: ResearchResult = await analyzeCryptoData(query, data);
      
      return NextResponse.json({
        success: true,
        data: result,
      });
    } catch (groqError) {
      console.error('Error analyzing data with Groq:', groqError);
      
      // Check if this is a rate limit or capacity error
      const errorMessage = groqError instanceof Error ? groqError.message : 'Unknown error';
      const isRateLimitError = errorMessage.includes('rate_limit_exceeded') || errorMessage.includes('Rate limit reached');
      const isCapacityError = errorMessage.includes('over capacity');
      
      // If API error, return more detailed error to the client
      return NextResponse.json(
        { 
          success: false, 
          error: isRateLimitError 
            ? 'The AI service has reached its rate limit. Please try again later.'
            : (isCapacityError 
                ? 'The AI service is currently over capacity. Please try again in a few moments.'
                : 'Failed to process research query with AI'),
          fallbackData: {
            summary: "We're experiencing high demand on our AI service. Here's a basic analysis of the available data.",
            dataTable: data.defiProjects?.slice(0, 5) || [],
            sources: ['Basic data analysis (AI service unavailable)'],
            showDeFi: true,
            showSentiment: false,
            showNews: false,
            showTable: true
          },
          details: errorMessage
        },
        { status: isCapacityError || isRateLimitError ? 503 : 500 }
      );
    }
  } catch (error) {
    console.error('Research API error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to process research query',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
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
