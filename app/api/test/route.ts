import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      message: 'API is working correctly',
      timestamp: new Date().toISOString(),
      environment: {
        GROQ_API_KEY: process.env.GROQ_API_KEY ? 'Set' : 'Not Set',
        NODE_ENV: process.env.NODE_ENV || 'development'
      }
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
