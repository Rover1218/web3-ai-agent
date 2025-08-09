import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

// Initialize the Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || 'your-groq-api-key',
});

// Exponential backoff retry logic
async function retryWithExponentialBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000,
  factor: number = 2
): Promise<T> {
  let retries = 0;
  let delay = initialDelay;

  while (true) {
    try {
      return await fn();
    } catch (error: any) {
      retries++;
      // Check for both 503 and rate limit errors
      const isCapacityError = error.status === 503;
      const isRateLimitError = error.error?.error?.code === 'rate_limit_exceeded';
      
      if (retries > maxRetries || (!isCapacityError && !isRateLimitError)) {
        throw error;
      }
      
      console.log(`Retrying due to ${isRateLimitError ? 'rate limit' : 'capacity'} error (retry ${retries}/${maxRetries}). Waiting ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= factor; // Exponential backoff
    }
  }
}

// Available model fallbacks in order of preference
const MODEL_FALLBACKS = [
  'llama-3.3-70b-versatile',
  'llama-3.2-70b-versatile',
  'gemma-7b-it',
  'mistral-7b-instruct',
  'mixtral-8x7b-32768'
];

// Direct chat endpoint that bypasses the data collection pipeline
export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();

    if (!query) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    // Try each model in sequence if the preferred one fails
    let lastError: any = null;
    
    for (const model of MODEL_FALLBACKS) {
      try {
        // Direct conversation with the LLM using retry logic
        const completion = await retryWithExponentialBackoff(async () => {
          return groq.chat.completions.create({
            messages: [
              {
                role: 'system',
                content: 'You are an expert crypto analyst and Web3 assistant. Provide helpful, educational responses to questions about blockchain technology, cryptocurrencies, DeFi, NFTs, and the wider Web3 ecosystem. Stay current on market trends, technical concepts, and best practices. Be conversational yet precise.',
              },
              {
                role: 'user',
                content: query,
              },
            ],
            model,
            temperature: 0.7, // Slightly higher temperature for more varied responses
            max_tokens: 2500,
          });
        });

        const response = completion.choices[0]?.message?.content;
        if (!response) {
          throw new Error('No response from Groq API');
        }

        console.log(`Successfully used model: ${model}`);
        return NextResponse.json({
          success: true,
          summary: response,
          modelUsed: model,
          timestamp: new Date().toISOString()
        });
      } catch (err: any) {
        console.error(`Error with model ${model}:`, err);
        lastError = err;
        
        // Check if it's a rate limit or capacity error
        const isCapacityError = err.status === 503;
        const isRateLimitError = err.error?.error?.code === 'rate_limit_exceeded';
        
        // If it's not a capacity/rate limit error or we've tried all models, don't try other models
        if (!isCapacityError && !isRateLimitError) {
          break;
        }
        // Continue to next model if it's a capacity/rate limit error
        console.log(`Trying next model due to ${isRateLimitError ? 'rate limit' : 'capacity'} error with ${model}...`);
      }
    }

    // If we get here, all models failed
    throw lastError || new Error('All models failed to respond');
  } catch (err: any) {
    console.error('Chat API error:', err);
    
    // Check for specific Groq API over capacity error
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    const isCapacityError = errorMessage.includes('over capacity') || (err.status === 503);
    const isRateLimitError = errorMessage.includes('rate_limit_exceeded') || errorMessage.includes('Rate limit reached');
    
    return NextResponse.json(
      { 
        success: false, 
        error: isRateLimitError 
          ? 'The AI service has reached its rate limit. Please try again later.'
          : (isCapacityError 
              ? 'The AI service is currently over capacity. Please try again in a few moments.'
              : 'Failed to process chat query'),
        details: errorMessage
      },
      { status: (isCapacityError || isRateLimitError) ? 503 : 500 }
    );
  }
}
