import { NextRequest, NextResponse } from 'next/server';
import { analyzeWithLangChain, ConversationMemory } from '@/lib/langchain';

// In-memory conversation storage (use Redis in production)
const conversations = new Map<string, ConversationMemory>();

export async function POST(request: NextRequest) {
  try {
    const { query, sources = ['langchain'], mode = 'research', conversationId } = await request.json();

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ success: false, error: 'Query is required and must be a string' }, { status: 400 });
    }

    // Define runners for each source
    const runners: Record<string, () => Promise<any>> = {
      langchain: async () => {
        // Get or create conversation memory
        let conversation: ConversationMemory;
        let newConversationId = conversationId;
        if (conversationId && conversations.has(conversationId)) {
          conversation = conversations.get(conversationId)!;
        } else {
          newConversationId = Date.now().toString(36) + Math.random().toString(36).substring(2);
          conversation = new ConversationMemory();
          conversations.set(newConversationId, conversation);
        }
        conversation.addMessage('user', query);
        const result = await analyzeWithLangChain(query, mode);
        conversation.addMessage('assistant', result.summary);
        result.conversationId = newConversationId;
        return result;
      },
      // Add other sources if needed
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

    // Choose primary successful result (prefer langchain)
    const primary = results.find(r => r.source === 'langchain' && !('error' in r))
      || results.find(r => !('error' in r));

    // Optional formatted debug output (kept for troubleshooting)
    const formatted = results.map(r =>
      'error' in r && r.error
        ? `Source: ${r.source}\nError: ${r.error}`
        : `Source: ${r.source}\nResult: ${JSON.stringify((r as any).result, null, 2)}`
    ).join('\n\n');

    if (primary && 'result' in primary) {
      const data = (primary as any).result;
      // Return backward-compatible shape expected by the UI
      return NextResponse.json({ success: true, data, conversationId, debug: { output: formatted, sourcesTried: results.map(r=>r.source) } });
    }

    // If no source succeeded
    return NextResponse.json({ success: false, error: 'All sources failed', results }, { status: 502 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}

// GET endpoint to retrieve conversation history
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversationId');

    if (!conversationId || !conversations.has(conversationId)) {
      return NextResponse.json({
        success: false,
        error: 'Conversation not found'
      }, { status: 404 });
    }

    const conversation = conversations.get(conversationId)!;
    const history = conversation.getConversationHistory();

    return NextResponse.json({
      success: true,
      data: {
        conversationId,
        history,
        messageCount: history.split('\n').length
      }
    });

  } catch (error) {
    console.error('Error retrieving conversation:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// DELETE endpoint to clear conversation
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversationId');

    if (conversationId && conversations.has(conversationId)) {
      const conversation = conversations.get(conversationId)!;
      conversation.clear();
      conversations.delete(conversationId);
    }

    return NextResponse.json({
      success: true,
      message: 'Conversation cleared successfully'
    });

  } catch (error) {
    console.error('Error clearing conversation:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
