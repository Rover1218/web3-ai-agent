import { NextRequest, NextResponse } from 'next/server';
import { analyzeWithLangChain, ConversationMemory } from '@/lib/langchain';

// In-memory conversation storage (use Redis in production)
const conversations = new Map<string, ConversationMemory>();

export async function POST(request: NextRequest) {
  try {
    const { query, mode = 'research', conversationId } = await request.json();

    if (!query || typeof query !== 'string') {
      return NextResponse.json({
        success: false,
        error: 'Query is required and must be a string'
      }, { status: 400 });
    }

    // Get or create conversation memory
    let conversation: ConversationMemory;
    if (conversationId && conversations.has(conversationId)) {
      conversation = conversations.get(conversationId)!;
    } else {
      const newConversationId = Date.now().toString(36) + Math.random().toString(36).substring(2);
      conversation = new ConversationMemory();
      conversations.set(newConversationId, conversation);
    }

    // Add user message to conversation
    conversation.addMessage('user', query);

    console.log('🤖 Starting LangChain analysis for query:', query);

    // Analyze with LangChain (this will intelligently fetch required data)
    const result = await analyzeWithLangChain(query, mode);

    // Add assistant response to conversation
    conversation.addMessage('assistant', result.summary);

    // Add conversation context to result
    result.conversationId = conversationId || Array.from(conversations.keys()).pop()!;

    console.log('✅ LangChain analysis completed successfully');

    return NextResponse.json({
      success: true,
      data: result,
      conversationId: conversationId,
      message: 'Analysis completed using LangChain with fallback method'
    });

  } catch (error) {
    console.error('LangChain API error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      message: 'LangChain analysis failed, try using standard mode'
    }, { status: 500 });
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
