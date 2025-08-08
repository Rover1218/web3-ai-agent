import { ChatGroq } from '@langchain/groq';
import { PromptTemplate } from '@langchain/core/prompts';
import { RunnableSequence } from '@langchain/core/runnables';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { StructuredOutputParser } from '@langchain/core/output_parsers';
import { z } from 'zod';
import { ResearchResult, DataTableRow } from './types';
import { 
  fetchCryptoData, 
  fetchDeFiProjects, 
  fetchDuneData, 
  fetchEtherscanGasPrice,
  fetchEtherscanTokenInfo,
  fetchEtherscanTransactions
} from './api';

// Initialize LangChain with Groq
const model = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY,
  model: 'llama-3.1-8b-instant', // Using smaller model to avoid rate limits
  temperature: 0.1,
  maxTokens: 2000, // Reduced token limit
  timeout: 30000, // 30 second timeout
});

// Schema for API requirements analysis
const APIRequirementsSchema = z.object({
  needsCryptoData: z.boolean().describe("Whether crypto market data is needed"),
  cryptoSymbols: z.array(z.string()).describe("List of cryptocurrency symbols to fetch"),
  needsDeFiData: z.boolean().describe("Whether DeFi project data is needed"),
  needsEtherscanData: z.boolean().describe("Whether blockchain/Etherscan data is needed"),
  etherscanActions: z.array(z.string()).describe("List of Etherscan actions needed (gas, token, transactions)"),
  needsDuneData: z.boolean().describe("Whether Dune Analytics data is needed"),
  duneQuery: z.string().optional().describe("Dune query to execute if needed"),
  analysisType: z.enum(['research', 'chat']).describe("Type of analysis to perform"),
  priority: z.enum(['high', 'medium', 'low']).describe("Priority level for data fetching")
});

// Schema for final research result
const ResearchResultSchema = z.object({
  summary: z.string().describe("Comprehensive analysis of the crypto data"),
  dataTable: z.array(z.object({
    project: z.string(),
    tvl: z.string(),
    tvlChange: z.string(),
    price: z.string(),
    priceChange: z.string(),
    sentiment: z.string(),
    newsCount: z.union([z.number(), z.string()])
  })).optional(),
  sources: z.array(z.string()),
  insights: z.array(z.string()).describe("Key insights and actionable recommendations"),
  riskFactors: z.array(z.string()).describe("Potential risks and concerns"),
  marketTrends: z.string().describe("Current market trends and patterns")
});

// Create output parsers
const apiRequirementsParser = StructuredOutputParser.fromZodSchema(APIRequirementsSchema);
const researchResultParser = StructuredOutputParser.fromZodSchema(ResearchResultSchema);

// Prompt for analyzing what APIs are needed
const apiAnalysisPrompt = PromptTemplate.fromTemplate(`
You are an expert crypto analyst assistant. Analyze the user's query and determine which APIs and data sources are needed to provide a comprehensive answer.

User Query: {query}

Available Data Sources:
1. Crypto Market Data (CoinMarketCap/CoinGecko) - for price, market cap, volume data
2. DeFi Projects Data (DeFiLlama) - for TVL, protocol information, rankings
3. Etherscan Blockchain Data - for gas prices, token info, transactions, smart contracts
4. Dune Analytics - for custom blockchain analytics and metrics

{format_instructions}

Analyze the query and determine:
- Which data sources are relevant
- What specific data points are needed
- Priority level for data fetching
- Type of analysis to perform

Be specific about:
- Cryptocurrency symbols if market data is needed
- Etherscan actions (gas, token info, transactions) if blockchain data is needed
- DeFi protocols if TVL/protocol data is needed
`);

// Prompt for final analysis
const researchPrompt = PromptTemplate.fromTemplate(`
You are an expert crypto analyst assistant. Analyze the following data and provide comprehensive insights.

User Query: {query}

Available Data:
- Crypto Market Data: {cryptoData}
- DeFi Projects: {defiProjects}
- Etherscan Blockchain Data: {etherscanData}
- Dune Analytics Data: {duneData}

{format_instructions}

IMPORTANT: You must respond with ONLY a valid JSON object that matches the schema exactly. Do not include any markdown formatting, explanations, or additional text outside the JSON.

Provide a detailed analysis including:
1. Summary of key findings
2. Data table for comparison (if applicable)
3. Key insights and actionable recommendations
4. Risk factors to consider
5. Current market trends
6. Data sources used

Make sure your response is comprehensive and actionable. Return ONLY the JSON object.
`);

// Chain for analyzing API requirements
export const apiAnalysisChain = RunnableSequence.from([
  {
    query: (input: any) => input.query,
    format_instructions: () => apiRequirementsParser.getFormatInstructions(),
  },
  apiAnalysisPrompt,
  model,
  apiRequirementsParser,
]);

// Chain for final research analysis
export const researchChain = RunnableSequence.from([
  {
    query: (input: any) => input.query,
    cryptoData: (input: any) => JSON.stringify(input.data.cryptoData || []),
    defiProjects: (input: any) => JSON.stringify(input.data.defiProjects || []),
    etherscanData: (input: any) => JSON.stringify(input.data.etherscanData || {}),
    duneData: (input: any) => JSON.stringify(input.data.duneData || []),
    format_instructions: () => researchResultParser.getFormatInstructions(),
  },
  researchPrompt,
  model,
  researchResultParser,
]);

// Function to fetch data based on API requirements with timeout
async function fetchRequiredData(requirements: any) {
  const data: any = {};
  const timeout = 15000; // 15 second timeout for data fetching

  try {
    // Fetch crypto market data if needed
    if (requirements.needsCryptoData && requirements.cryptoSymbols.length > 0) {
      console.log('📊 Fetching crypto market data for:', requirements.cryptoSymbols);
      const cryptoPromise = fetchCryptoData(requirements.cryptoSymbols);
      data.cryptoData = await Promise.race([
        cryptoPromise,
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Crypto data fetch timeout')), timeout)
        )
      ]);
    }

    // Fetch DeFi data if needed
    if (requirements.needsDeFiData) {
      console.log('🏛️ Fetching DeFi projects data');
      const defiPromise = fetchDeFiProjects();
      data.defiProjects = await Promise.race([
        defiPromise,
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('DeFi data fetch timeout')), timeout)
        )
      ]);
    }

    // Fetch Etherscan data if needed
    if (requirements.needsEtherscanData) {
      console.log('🔗 Fetching Etherscan blockchain data');
      data.etherscanData = {};

      for (const action of requirements.etherscanActions) {
        try {
          switch (action) {
            case 'gas':
              data.etherscanData.gasPrice = await Promise.race([
                fetchEtherscanGasPrice(),
                new Promise((_, reject) => 
                  setTimeout(() => reject(new Error('Gas price fetch timeout')), timeout)
                )
              ]);
              break;
            case 'token':
              // For now, we'll fetch a default token (USDT)
              data.etherscanData.tokenInfo = await Promise.race([
                fetchEtherscanTokenInfo('0xdAC17F958D2ee523a2206206994597C13D831ec7'),
                new Promise((_, reject) => 
                  setTimeout(() => reject(new Error('Token info fetch timeout')), timeout)
                )
              ]);
              break;
            case 'transactions':
              // For now, we'll fetch recent transactions from a known address
              data.etherscanData.transactions = await Promise.race([
                fetchEtherscanTransactions('0x28C6c06298d514Db089934071355E5743bf21d60'),
                new Promise((_, reject) => 
                  setTimeout(() => reject(new Error('Transactions fetch timeout')), timeout)
                )
              ]);
              break;
          }
        } catch (error) {
          console.error(`Error fetching Etherscan ${action} data:`, error);
          // Continue with other actions even if one fails
        }
      }
    }

    // Fetch Dune data if needed
    if (requirements.needsDuneData && requirements.duneQuery) {
      console.log('📈 Fetching Dune Analytics data');
      try {
        data.duneData = await Promise.race([
          fetchDuneData(requirements.duneQuery),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Dune data fetch timeout')), timeout)
          )
        ]);
      } catch (error) {
        console.error('Error fetching Dune data:', error);
        data.duneData = [];
      }
    }

  } catch (error) {
    console.error('Error fetching required data:', error);
  }

  return data;
}

// Main function to analyze query and fetch data intelligently with fallback
export async function analyzeWithLangChain(
  query: string,
  mode: 'research' | 'chat' = 'research'
): Promise<ResearchResult> {
  try {
    console.log('🤖 Analyzing query with LangChain:', query);

    // Step 1: Analyze what APIs are needed with timeout
    console.log('📋 Analyzing API requirements...');
    const apiRequirements = await Promise.race([
      apiAnalysisChain.invoke({ query }),
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('API requirements analysis timeout')), 20000)
      )
    ]) as any;
    console.log('📋 API Requirements:', apiRequirements);

    // Step 2: Fetch required data
    console.log('📊 Fetching required data...');
    const data = await fetchRequiredData(apiRequirements);
    console.log('📊 Fetched data structure:', Object.keys(data));

    // Step 3: Perform final analysis with timeout
    console.log('🧠 Performing final analysis...');
    let result;
    try {
      result = await Promise.race([
        researchChain.invoke({ query, data }),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Final analysis timeout')), 30000)
        )
      ]) as any;
    } catch (parseError) {
      console.error('Parsing error, attempting manual JSON extraction:', parseError);
      
      // Try to extract JSON from the response manually
      try {
        const response = await model.invoke([
          ['system', 'You are a crypto analyst. Respond with ONLY valid JSON.'],
          ['human', `Analyze this data for query "${query}": ${JSON.stringify(data)}`]
        ]);
        
        const text = response.content as string;
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          result = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('No valid JSON found in response');
        }
      } catch (manualError) {
        console.error('Manual JSON extraction failed:', manualError);
        throw parseError; // Re-throw original error for fallback
      }
    }

    // Step 4: Format the response
    const response: ResearchResult = {
      summary: result.summary,
      data: data,
      dataTable: result.dataTable || [],
      sources: result.sources,
      timestamp: new Date().toISOString(),
      showDeFi: apiRequirements.needsDeFiData,
      showTable: !!result.dataTable,
      showEtherscan: apiRequirements.needsEtherscanData,
      isCryptoQuery: true,
      insights: result.insights,
      riskFactors: result.riskFactors,
      marketTrends: result.marketTrends,
    };

    console.log('✅ LangChain analysis completed successfully');
    return response;

  } catch (error) {
    console.error('LangChain analysis error:', error);
    
    // Check if it's a rate limit error
    if (error && typeof error === 'object' && 'status' in error && error.status === 429) {
      console.log('🔄 Rate limit exceeded, falling back to standard analysis...');
      try {
        // Import the original analysis function
        const { analyzeCryptoData } = await import('./groq');
        const { fetchAllData } = await import('./api');
        
        const data = await fetchAllData(query);
        const result = await analyzeCryptoData(query, data);
        
        return {
          ...result,
          insights: ['Analysis completed using standard method due to Groq rate limit'],
          riskFactors: ['Consider upgrading your Groq plan for higher rate limits'],
          marketTrends: 'Data analysis completed with standard method',
        };
      } catch (fallbackError) {
        console.error('Fallback analysis also failed:', fallbackError);
      }
    }
    
    // Fallback to basic analysis
    console.log('🔄 Falling back to basic analysis...');
    
    try {
      // Import the original analysis function
      const { analyzeCryptoData } = await import('./groq');
      const { fetchAllData } = await import('./api');
      
      const data = await fetchAllData(query);
      const result = await analyzeCryptoData(query, data);
      
      return {
        ...result,
        insights: ['Analysis completed using fallback method due to LangChain timeout'],
        riskFactors: ['Consider using standard mode for faster responses'],
        marketTrends: 'Data analysis completed with basic method',
      };
    } catch (fallbackError) {
      console.error('Fallback analysis also failed:', fallbackError);
      
      // Final fallback response
      return {
        summary: `Analysis completed. ${error instanceof Error ? error.message : 'Unknown error occurred'}. Please try using the standard mode.`,
        data: {},
        sources: ['Fallback Analysis'],
        timestamp: new Date().toISOString(),
        showDeFi: false,
        showTable: false,
        showEtherscan: false,
        isCryptoQuery: true,
        insights: ['LangChain integration encountered an error'],
        riskFactors: ['Use standard mode for more reliable responses'],
        marketTrends: 'Unable to complete analysis with current setup',
      };
    }
  }
}

// Memory and conversation management
export class ConversationMemory {
  private messages: Array<{ role: 'user' | 'assistant'; content: string; timestamp: Date }> = [];
  private maxMessages = 10;

  addMessage(role: 'user' | 'assistant', content: string) {
    this.messages.push({ role, content, timestamp: new Date() });
    
    // Keep only the last N messages
    if (this.messages.length > this.maxMessages) {
      this.messages = this.messages.slice(-this.maxMessages);
    }
  }

  getConversationHistory(): string {
    return this.messages
      .map(msg => `${msg.role}: ${msg.content}`)
      .join('\n');
  }

  clear() {
    this.messages = [];
  }
}

// Tool for data analysis
export const dataAnalysisTool = {
  name: 'analyze_crypto_data',
  description: 'Analyze cryptocurrency and DeFi data using LangChain',
  schema: z.object({
    query: z.string().describe('The analysis query'),
    mode: z.enum(['research', 'chat']).describe('Analysis mode')
  }),
  func: async (input: { query: string; mode: 'research' | 'chat' }) => {
    return await analyzeWithLangChain(input.query, input.mode);
  }
};
