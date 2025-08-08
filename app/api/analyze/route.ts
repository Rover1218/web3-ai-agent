import { NextRequest, NextResponse } from 'next/server';
import { analyzeCryptoData } from '@/lib/groq';
import { fetchAllData } from '@/lib/api';

export async function POST(request: NextRequest) {
  try {
    const { query, mode = 'research' } = await request.json();

    if (!query || typeof query !== 'string') {
      return NextResponse.json({
        success: false,
        error: 'Query is required and must be a string'
      }, { status: 400 });
    }

    console.log('🔄 Starting analysis for query:', query);

    // Fetch all data using the original method
    const data = await fetchAllData(query);

    // Analyze using the original Groq method
    const result = await analyzeCryptoData(query, data);

    console.log('✅ Analysis completed successfully');

    return NextResponse.json({
      success: true,
      data: result,
      message: 'Analysis completed using standard method'
    });

  } catch (error) {
    console.error('Analysis API error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      message: 'Failed to analyze query'
    }, { status: 500 });
  }
}
