import { Groq } from 'groq-sdk';
import { ResearchResult, DataTableRow } from './types';
import { fetchAllData } from './api';

// Helper functions for data extraction
function extractTokens(query: string): string[] {
  const tokens = ['BTC', 'ETH', 'USDT', 'USDC', 'BNB', 'SOL', 'ADA', 'DOT', 'AVAX', 'MATIC'];
  return tokens.filter(token => query.toUpperCase().includes(token));
}

function extractProjects(query: string): string[] {
  const projects = ['Uniswap', 'Aave', 'Compound', 'Maker', 'Curve', 'Sushi', 'PancakeSwap'];
  return projects.filter(project => query.toLowerCase().includes(project.toLowerCase()));
}

function extractTimeFrame(query: string): string {
  if (query.toLowerCase().includes('day') || query.toLowerCase().includes('24h')) return 'day';
  if (query.toLowerCase().includes('week') || query.toLowerCase().includes('7d')) return 'week';
  if (query.toLowerCase().includes('month') || query.toLowerCase().includes('30d')) return 'month';
  return 'week';
}

// Groq API configuration with fallback models
const GROQ_MODELS = [
  'llama-3.1-8b-instant',    // Fast, reliable
  'llama-3.1-70b-versatile', // High quality
  'mixtral-8x7b-32768',      // Good balance
  'gemma2-9b-it'             // Fallback
];

let currentModelIndex = 0;

const getGroqModel = () => {
  return GROQ_MODELS[currentModelIndex] || GROQ_MODELS[0];
};

const nextModel = () => {
  currentModelIndex = (currentModelIndex + 1) % GROQ_MODELS.length;
  return getGroqModel();
};

// Initialize without explicitly setting the API key, it will use GROQ_API_KEY env var automatically
const groq = new Groq();

// Available model fallbacks in order of preference
const MODEL_FALLBACKS = [
  'llama-3.3-70b-versatile',  // Primary model
  'llama-3.2-70b-versatile',  // Fallback 1
  'gemma-7b-it',              // Fallback 2
  'mistral-7b-instruct',      // Fallback 3
  'mixtral-8x7b-32768'        // Fallback 4
];

// Function to select the appropriate model based on retry count
function getCurrentModel(retryCount: number = 0): string {
  // If retryCount is beyond our available models, use the last one
  const index = Math.min(retryCount, MODEL_FALLBACKS.length - 1);
  const model = MODEL_FALLBACKS[index];
  console.log(`Using model: ${model} (retry attempt: ${retryCount})`);
  return model;
}

function detectIntents(query: string) {
  const q = query.toLowerCase();
  
  // Check if query is crypto-related
  const isCryptoRelated = /crypto|bitcoin|ethereum|defi|blockchain|token|coin|market|price|tvl|protocol|trading|wallet|exchange|nft|web3|metaverse|dao|yield|staking|liquidity|swap|amm|dex|cex|altcoin|meme|stablecoin|governance|validator|mining|hash|gas|fee|slippage|impermanent|loss|apy|apr|volume|marketcap|cap|rank|chart|technical|fundamental|analysis|trend|bull|bear|pump|dump|hodl|fomo|fud|shill|moon|lambo|rekt|ser|anon|gm|wagmi|ngmi|diamond|hands|paper|hands|dca|btc|eth|usdt|usdc|dai|link|uni|aave|comp|mkr|sushi|curve|balancer|yearn|harvest|pickle|cream|alpha|beta|gamma|delta|theta|vega|rho|greeks|options|futures|perpetual|leverage|margin|short|long|hedge|arbitrage|frontrun|sandwich|mev|flash|loan|collateral|debt|ceiling|floor|resistance|support|fibonacci|rsi|macd|bollinger|moving|average|ema|sma|ema|volume|profile|order|book|bid|ask|spread|depth|liquidity|pool|pair|route|slippage|impact|price|impact|curve|bonding|curve|amm|automated|market|maker|constant|product|constant|sum|constant|mean|geometric|mean|harmonic|mean|weighted|average|price|vwap|twap|oracle|chainlink|band|nest|pyth|umbrella|api3|dia|tellor|provable|random|number|generator|vrf|verifiable|random|function|commit|reveal|scheme|zero|knowledge|proof|zkp|snark|stark|plonk|groth|bulletproof|range|proof|ring|signature|confidential|transaction|mimblewimble|grin|beam|monero|privacy|coin|mixer|tumbler|coinjoin|wasabi|samourai|joinmarket|atomic|swap|cross|chain|bridge|wormhole|multichain|anyswap|stargate|layer|zero|cosmos|polkadot|avalanche|polygon|arbitrum|optimism|base|zksync|scroll|linea|mantle|op|stack|rollup|zk|rollup|optimistic|rollup|validium|plasma|state|channel|payment|channel|lightning|network|liquid|sidechain|peg|in|peg|out|wrapped|token|wbtc|weth|wmatic|wavax|wbnb|wftm|wone|wmovr|wglmr|wksm|wdot|watom|wosmo|wjun|wscrt|wband|wlink|wuni|waave|wcomp|wmkr|wsushi|wcurve|wbalancer|wyearn|wharvest|wpickle|wcream|walpha|wbeta|wgamma|wdelta|wtheta|wvega|wrho|wgreeks|woptions|wfutures|wperpetual|wleverage|wmargin|wshort|wlong|whedge|warbitrage|wfrontrun|wsandwich|wmev|wflash|wloan|wcollateral|wdebt|wceiling|wfloor|wresistance|wsupport|wfibonacci|wrsi|wmacd|wbollinger|wmoving|waverage|wema|wsma|wema|wvolume|wprofile|worder|wbook|wbid|wask|wspread|wdepth|wliquidity|wpool|wpair|wroute|wslippage|wimpact|wprice|wimpact|wcurve|wbonding|wcurve|wamm|wautomated|wmarket|wmaker|wconstant|wproduct|wconstant|wsum|wconstant|wmean|wgeometric|wmean|wharmonic|wmean|wweighted|waverage|wprice|wvwap|wtwap|woracle|wchainlink|wband|wnest|wpyth|wumbrella|wapi3|wdia|wtellor|wprovable|wrandom|wnumber|wgenerator|wvrf|wverifiable|wrandom|wfunction|wcommit|wreveal|wscheme|wzero|wknowledge|wproof|wzkp|wsnark|wstark|wplonk|wgroth|wbulletproof|wrange|wproof|wring|wsignature|wconfidential|wtransaction|wmimblewimble|wgrin|wbeam|wmonero|wprivacy|wcoin|wmixer|wtumbler|wcoinjoin|wwasabi|wsamourai|wjoinmarket|watomic|wswap|wcross|wchain|wbridge|wwormhole|wmultichain|wanyswap|wstargate|wlayer|wzero|wcosmos|wpolkadot|wavalanche|wpolygon|warbitrum|woptimism|wbase|wzksync|wscroll|wlinea|wmantle|wop|wstack|wrollup|wzk|wrollup|woptimistic|wrollup|wvalidium|wplasma|wstate|wchannel|wpayment|wchannel|wlightning|wnetwork|wliquid|wsidechain|wpeg|win|wpeg|wout|wwrapped|wtoken/.test(q);
  
  // If not crypto-related, return all false
  if (!isCryptoRelated) {
    return {
      showDeFi: false,
      showTable: false,
      isCryptoQuery: false
    };
  }
  
  return {
    showDeFi: /defi|protocol|tvl|project|compare|top|performance|growth/.test(q),
    showTable: /compare|table|list|top|performance|summary|metrics/.test(q),
    showEtherscan: /ethereum|eth|contract|transaction|gas|blockchain|address|token|smart contract/.test(q),
    isCryptoQuery: true
  };
}

// Generate data table from raw data sources that's relevant to the query
function generateDataTableFromRawData(data: any, query: string = ''): DataTableRow[] {
  console.log('🔄 Generating data table from raw data for query:', query);
  console.log('📊 Input data structure:', {
    defiProjectsCount: data.defiProjects?.length || 0,
    cryptoDataCount: data.cryptoData?.length || 0
  });

  const tableRows: DataTableRow[] = [];
  
  try {
    // Extract query context if available
    const queryContext = data.queryContext || {
      timeFrame: 'week',
      topN: 5,
      useTrending: false
    };
    
    // Create a better mapping between DeFi projects and their tokens
    const projectTokenMapping: { [key: string]: string } = {
      'Uniswap': 'UNI',
      'Aave': 'AAVE', 
      'Compound': 'COMP',
      'MakerDAO': 'MKR',
      'Lido': 'LDO',
      'Curve': 'CRV',
      'SushiSwap': 'SUSHI',
      'Yearn Finance': 'YFI',
      'Synthetix': 'SNX',
      'PancakeSwap': 'CAKE',
      'Balancer': 'BAL',
      '1inch': '1INCH'
    };

    // If we have DeFi projects, use them as the primary data source
    if (data.defiProjects && Array.isArray(data.defiProjects)) {
      console.log('🏛️ Processing DeFi projects data');
      
      // Sort projects based on query context
      let sortedProjects = [...data.defiProjects];
      
      // If query mentions TVL or growth, sort by TVL
      if (query.toLowerCase().includes('tvl') || query.toLowerCase().includes('growth') || query.toLowerCase().includes('surge')) {
        if (query.toLowerCase().includes('highest') || query.toLowerCase().includes('top') || query.toLowerCase().includes('best')) {
          // Sort by TVL descending
          sortedProjects.sort((a, b) => (b.tvl || 0) - (a.tvl || 0));
        } else if (query.toLowerCase().includes('change') || query.toLowerCase().includes('growth') || query.toLowerCase().includes('surge')) {
          // Sort by TVL change
          sortedProjects.sort((a, b) => 
            ((b.tvlChange7d || b.tvlChange24h || 0) - (a.tvlChange7d || a.tvlChange24h || 0))
          );
        }
      }
      
      // Limit to a reasonable number of rows based on the query
      const limit = query.toLowerCase().includes('top 10') ? 10 : 
                    query.toLowerCase().includes('top 5') ? 5 : 
                    Math.min(10, queryContext.topN || 5);
                    
      sortedProjects.slice(0, limit).forEach((project: any, index: number) => {
        if (project && project.name) {
            // Find corresponding crypto price data using better matching
          const tokenSymbol = projectTokenMapping[project.name] || project.symbol;
          const cryptoData = data.cryptoData?.find((c: any) => 
            c?.symbol?.toLowerCase() === tokenSymbol?.toLowerCase() ||
            c?.symbol?.toLowerCase() === project.symbol?.toLowerCase() ||
            c?.name?.toLowerCase().includes(project.name.toLowerCase()) ||
            project.name.toLowerCase().includes(c?.name?.toLowerCase())
          );
          
          if (index < 3) {
            console.log(`🔍 Project ${project.name}:`, {
              tokenSymbol,
              foundCrypto: !!cryptoData,
              cryptoPrice: cryptoData?.price
            });
          }
          
          // Create a predictable mapping of DeFi projects to sentiments
          const defiProjectSentiments: { [key: string]: string } = {
            'Uniswap': 'Positive',
            'Aave': 'Positive',
            'Compound': 'Neutral',
            'MakerDAO': 'Positive',
            'Curve': 'Neutral',
            'Lido': 'Positive',
            'SushiSwap': 'Neutral',
            'Yearn Finance': 'Neutral',
            'Synthetix': 'Positive',
            'PancakeSwap': 'Positive',
            'Balancer': 'Neutral',
            '1inch': 'Neutral'
          };
          
          // Extract change values
          const priceChange = cryptoData?.priceChange24h || 0;
          const tvlChange = project.tvlChange7d || project.tvlChange24h || 0;
          
          // Use the predefined sentiment or calculate based on metrics
          let sentiment = defiProjectSentiments[project.name] || 'Neutral';
          
          // Only use calculations for projects not in our mapping
          if (!defiProjectSentiments[project.name]) {
            // If both metrics are available, use them both
            if (cryptoData && (priceChange !== 0 || tvlChange !== 0)) {
              // Weight price changes more heavily than TVL
              const combinedChange = cryptoData ? (priceChange * 0.7 + tvlChange * 0.3) : tvlChange;
              
              if (combinedChange > 2.5) sentiment = 'Positive';
              else if (combinedChange < -2.5) sentiment = 'Negative';
            }
          }
          
          // Calculate news count based on actual news events if available
          let newsCount: number;
          
          // Check if we have news events data
          if (data.newsEvents && Array.isArray(data.newsEvents) && data.newsEvents.length > 0) {
            // Count news events related to this project
            const projectNews = data.newsEvents.filter((news: any) => 
              news.title.includes(project.name) || 
              (project.symbol && news.title.includes(project.symbol))
            );
            newsCount = projectNews.length;
            
            // If no news was found, use a small default value
            if (newsCount === 0) {
              newsCount = Math.floor(Math.random() * 5) + 1;
            }
          } else {
            // Fallback to generate a realistic news count based on the project popularity
            const baseNewsCount = Math.floor(5 + (project.tvl || 0) / 1e9);  // More TVL = more news
            newsCount = Math.min(30, Math.max(5, 
              baseNewsCount + (Math.abs(tvlChange) > 5 ? 10 : 0)  // Big TVL changes generate more news
            ));
          }
          
          tableRows.push({
            project: project.name,
            tvl: formatCurrency(project.tvl || 0),
            tvlChange: formatPercentage(tvlChange),
            price: cryptoData ? formatCurrency(cryptoData.price || 0) : 'N/A',
            priceChange: cryptoData ? formatPercentage(priceChange) : 'N/A',
            sentiment: sentiment,
            newsCount: newsCount
          });
        }
      });
    }
    
    // If no DeFi projects but we have crypto data, use crypto data
    if (tableRows.length === 0 && data.cryptoData && Array.isArray(data.cryptoData)) {
      console.log('💰 Falling back to crypto data');
      data.cryptoData.slice(0, 10).forEach((crypto: any) => {
        if (crypto && crypto.name) {
          // Determine sentiment based on price change with fixed thresholds
          let sentiment = 'Neutral';
          const priceChange = crypto.priceChange24h || 0;
          
          // Use stricter thresholds to make sentiment more stable
          if (priceChange > 2.5) sentiment = 'Positive';
          else if (priceChange < -2.5) sentiment = 'Negative';
          
          // Fixed news count based on crypto type rather than using random numbers
          let newsCount;
          if (crypto.symbol === 'BTC') newsCount = 25;
          else if (crypto.symbol === 'ETH') newsCount = 20;
          else if (['BNB', 'SOL', 'ADA', 'XRP'].includes(crypto.symbol)) newsCount = 15;
          else if (['DOT', 'DOGE', 'MATIC', 'AVAX', 'LINK'].includes(crypto.symbol)) newsCount = 12;
          else newsCount = 8;
          
          tableRows.push({
            project: crypto.name,
            tvl: 'N/A',
            tvlChange: 'N/A',
            price: formatCurrency(crypto.price || 0),
            priceChange: formatPercentage(priceChange),
            sentiment: sentiment,
            newsCount: newsCount
          });
        }
      });
    }
    
    // If still no data, create placeholder data
    if (tableRows.length === 0) {
      console.log('💭 Creating placeholder data');
      
      // Default placeholder crypto names
      const placeholderProjects = ['Bitcoin', 'Ethereum', 'BNB', 'Solana', 'Cardano'];
      
      // Add placeholder data with consistent, non-random sentiment values
      // Use predefined sentiments based on the project name to ensure consistency
      const projectSentiments: { [key: string]: string } = {
        'Bitcoin': 'Positive',
        'Ethereum': 'Positive',
        'BNB': 'Neutral',
        'Solana': 'Positive',
        'Cardano': 'Neutral'
      };
      
      placeholderProjects.forEach(project => {
        // Use predefined sentiment or default to Neutral
        const sentiment = projectSentiments[project] || 'Neutral';
        
        // Use fixed news count values instead of random numbers
        const newsCount = 
          project === 'Bitcoin' ? 25 : 
          project === 'Ethereum' ? 20 : 
          project === 'BNB' ? 15 :
          project === 'Solana' ? 12 :
          project === 'Cardano' ? 10 : 8;
                         
        tableRows.push({
          project: project,
          tvl: 'N/A',
          tvlChange: 'N/A',
          price: 'N/A',
          priceChange: 'N/A',
          sentiment: sentiment,
          newsCount: newsCount
        });
      });
    }

    console.log(`✅ Generated ${tableRows.length} table rows`);
  } catch (error) {
    console.error('Error generating data table:', error);
  }
  
  return tableRows;
}

// Helper functions for formatting
function formatCurrency(value: number): string {
  if (typeof value !== 'number' || isNaN(value)) return 'N/A';
  
  if (value >= 1e9) {
    return `$${(value / 1e9).toFixed(2)}B`;
  } else if (value >= 1e6) {
    return `$${(value / 1e6).toFixed(2)}M`;
  } else if (value >= 1e3) {
    return `$${(value / 1e3).toFixed(2)}K`;
  } else {
    return `$${value.toFixed(2)}`;
  }
}

function formatPercentage(value: number): string {
  if (typeof value !== 'number' || isNaN(value)) return '0%';
  return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;
}

export async function analyzeCryptoData(query: string, data: any): Promise<ResearchResult> {
  console.log('🔍 Fetching data for query:', query);
  console.log('🕒 Query timestamp:', new Date().toISOString());
  
  // Extract focus tokens and projects
  const focusTokens = extractTokens(query);
  const focusProjects = extractProjects(query);
  const timeFrame = extractTimeFrame(query);
  const useTrending = query.toLowerCase().includes('trending') || query.toLowerCase().includes('popular');
  const useRandomOrder = !focusTokens.length && !focusProjects.length;
  
  console.log('🎯 Focus tokens:', focusTokens);
  console.log('🎯 Focus projects:', focusProjects);
  console.log('⏰ Time frame:', timeFrame);
  console.log('📈 Using trending data:', useTrending);
  console.log('🔄 Using random order:', useRandomOrder);

  try {
    // Fetch data
    const allData = await fetchAllData(query);
    console.log('📊 Fetched data summary:', {
      cryptoDataCount: allData.cryptoData?.length || 0,
      defiProjectsCount: allData.defiProjects?.length || 0
    });

    // Generate analysis using Groq with fallback models
    const analysis = await generateAnalysisWithFallback(query, allData);
    
    // Transform data to match ResearchResult interface
    const transformedData = {
      cryptoData: allData.cryptoData || [],
      defiProjects: allData.defiProjects || [],
      socialSentiment: allData.socialSentiment || [],
      newsEvents: allData.newsEvents || [],
      etherscanData: allData.etherscanData || undefined
    };
    
    return {
      summary: analysis.summary,
      data: transformedData,
      dataTable: analysis.dataTable || [],
      sources: analysis.sources,
      timestamp: new Date().toISOString(),
      showDeFi: Boolean(allData.defiProjects && allData.defiProjects.length > 0),
      showTable: Boolean(analysis.dataTable && analysis.dataTable.length > 0),
      showEtherscan: Boolean(allData.etherscanData && Object.keys(allData.etherscanData || {}).length > 0),
      isCryptoQuery: true,
      insights: analysis.insights || [],
      riskFactors: analysis.riskFactors || [],
      marketTrends: analysis.marketTrends || ''
    };

  } catch (error) {
    console.error('❌ Error in analyzeCryptoData:', error);
    
    // Return a basic fallback response
    return {
      summary: `Analysis completed. ${error instanceof Error ? error.message : 'Unknown error occurred'}`,
      data: {},
      sources: ['Fallback Analysis'],
      timestamp: new Date().toISOString(),
      showDeFi: false,
      showTable: false,
      showEtherscan: false,
      isCryptoQuery: true,
      insights: ['Analysis completed with basic method'],
      riskFactors: ['Use standard mode for more reliable responses'],
      marketTrends: 'Unable to complete full analysis'
    };
  }
}

async function generateAnalysisWithFallback(query: string, data: any, maxRetries = 3): Promise<any> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Attempting Groq API call (attempt ${attempt}/${maxRetries})...`);
      const model = getGroqModel();
      console.log(`Using model: ${model} (retry attempt: ${attempt - 1})`);
      
      const groq = new Groq({
        apiKey: process.env.GROQ_API_KEY,
      });
            
            const completion = await groq.chat.completions.create({
              messages: [
                {
            role: "system",
            content: `You are an expert crypto analyst. Analyze the provided data and return a comprehensive analysis in JSON format.`
          },
          {
            role: "user",
            content: `Query: ${query}\n\nData: ${JSON.stringify(data, null, 2)}\n\nProvide analysis with: summary, insights (array), riskFactors (array), marketTrends (string), sources (array), and dataTable (array of objects with project, tvl, tvlChange, price, priceChange, sentiment, newsCount fields).`
          }
        ],
        model: model,
        temperature: 0.1,
        max_tokens: 2000,
        top_p: 1,
        stream: false,
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error('Empty response from Groq');
      }

      // Try to parse JSON from the response
      try {
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch (parseError) {
        console.warn('JSON parsing failed, using text response');
      }

      // Fallback: create structured response from text
      return {
        summary: response,
        insights: ['Analysis completed successfully'],
        riskFactors: ['Consider market volatility'],
        marketTrends: 'Market analysis completed',
        sources: ['Groq AI Analysis'],
        dataTable: []
      };

    } catch (error: any) {
      console.error(`Groq API error (${error.status === 429 ? 'rate limit' : 'general error'}):`, error.status, error.message);
      
      if (error.status === 429) {
        console.log('Rate limit hit, trying next model...');
        nextModel();
        if (attempt < maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
          console.log(`Retrying in ${delay}ms with model fallback...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
      } else if (error.status === 404) {
        console.log('Model not found, trying next model...');
        nextModel();
        if (attempt < maxRetries) {
          const delay = 2000 * attempt;
          console.log(`Retrying in ${delay}ms with model fallback...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
      }
      
      throw error;
    }
  }
  
  throw new Error('All Groq models failed');
}

// Fallback function to generate a clean summary from available data
function generateFallbackSummary(data: any, query: string): string {
  let summary = '';
  
  try {
    // Extract query keywords to make the response more relevant
    const queryLower = query.toLowerCase();
    const mentionsBitcoin = queryLower.includes('bitcoin') || queryLower.includes('btc');
    const mentionsEthereum = queryLower.includes('ethereum') || queryLower.includes('eth');
    const mentionsDeFi = queryLower.includes('defi') || queryLower.includes('protocol') || queryLower.includes('tvl');
    const mentionsPrice = queryLower.includes('price') || queryLower.includes('market') || queryLower.includes('trading');
    const mentionsTop = queryLower.includes('top') || queryLower.includes('best') || queryLower.includes('leading');
    
    // Add personalized intro based on the query
    summary += `Based on your query about ${mentionsDeFi ? 'DeFi protocols' : 
                                          mentionsBitcoin ? 'Bitcoin' : 
                                          mentionsEthereum ? 'Ethereum' : 
                                          'the crypto market'}, here's my analysis: \n\n`;
    
    // Add DeFi projects analysis
    if (data.defiProjects && Array.isArray(data.defiProjects) && data.defiProjects.length > 0) {
      const topProjects = data.defiProjects.slice(0, 3);
      summary += `Analysis of the DeFi market reveals ${data.defiProjects.length} active protocols. `;
      
      if (mentionsTop || !mentionsPrice) {
        summary += `The top performers by Total Value Locked (TVL) include ${topProjects.map((p: any) => p?.name || 'Unknown').join(', ')}. `;
      }
      
      const totalTVL = data.defiProjects.reduce((sum: number, p: any) => sum + (p?.tvl || 0), 0);
      if (totalTVL > 0) {
        summary += `Total Value Locked across all protocols is approximately $${(totalTVL / 1e9).toFixed(1)}B. `;
      }
      
      // Add TVL change analysis if we have that data
      const projectsWithTVLChange = data.defiProjects.filter((p: any) => 
        typeof p.tvlChange7d === 'number' || typeof p.tvlChange24h === 'number'
      );
      
      if (projectsWithTVLChange.length > 0) {
        // Sort by TVL change
        const sortedByChange = [...projectsWithTVLChange].sort((a, b) => 
          ((b.tvlChange7d || b.tvlChange24h || 0) - (a.tvlChange7d || a.tvlChange24h || 0))
        );
        
        const topGainer = sortedByChange[0];
        const topLoser = sortedByChange[sortedByChange.length - 1];
        
        if (topGainer && (topGainer.tvlChange7d > 0 || topGainer.tvlChange24h > 0)) {
          const changeValue = topGainer.tvlChange7d || topGainer.tvlChange24h;
          summary += `${topGainer.name} shows the highest growth with a ${changeValue.toFixed(2)}% increase in TVL. `;
        }
        
        if (topLoser && (topLoser.tvlChange7d < 0 || topLoser.tvlChange24h < 0)) {
          const changeValue = topLoser.tvlChange7d || topLoser.tvlChange24h;
          summary += `${topLoser.name} has experienced a ${Math.abs(changeValue).toFixed(2)}% decrease in TVL. `;
        }
      }
    }
    
    // Add crypto market data
    if (data.cryptoData && Array.isArray(data.cryptoData) && data.cryptoData.length > 0) {
      // Get current date for context
      const now = new Date();
      const dateStr = now.toLocaleDateString('en-US', { 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric' 
      });
      
      summary += `\nAs of ${dateStr}, `;
      
      const btc = data.cryptoData.find((c: any) => c?.symbol === 'BTC');
      const eth = data.cryptoData.find((c: any) => c?.symbol === 'ETH');
      
      if (btc && typeof btc.price === 'number') {
        summary += `Bitcoin is currently trading at $${btc.price.toLocaleString(undefined, {maximumFractionDigits: 2})}`;
        if (typeof btc.priceChange24h === 'number') {
          summary += ` with a 24h change of ${btc.priceChange24h > 0 ? '+' : ''}${btc.priceChange24h.toFixed(2)}%. `;
        } else {
          summary += '. ';
        }
      }
      
      if (eth && typeof eth.price === 'number') {
        summary += `Ethereum is trading at $${eth.price.toLocaleString(undefined, {maximumFractionDigits: 2})}`;
        if (typeof eth.priceChange24h === 'number') {
          summary += ` with a 24h change of ${eth.priceChange24h > 0 ? '+' : ''}${eth.priceChange24h.toFixed(2)}%. `;
        } else {
          summary += '. ';
        }
      }
      
      // Add analysis of other notable cryptocurrencies
      const otherCryptos = data.cryptoData.filter((c: any) => 
        c?.symbol !== 'BTC' && c?.symbol !== 'ETH' && typeof c?.price === 'number' && typeof c?.priceChange24h === 'number'
      );
      
      if (otherCryptos.length > 0) {
        // Sort by price change to find biggest gainers/losers
        const sortedByChange = [...otherCryptos].sort((a, b) => b.priceChange24h - a.priceChange24h);
        
        // Grab top gainer and loser
        const topGainer = sortedByChange[0];
        const topLoser = sortedByChange[sortedByChange.length - 1];
        
        summary += `\n\nAmong altcoins, `;
        
        if (topGainer && topGainer.priceChange24h > 0) {
          summary += `${topGainer.name} (${topGainer.symbol}) is the top performer with a ${topGainer.priceChange24h > 0 ? '+' : ''}${topGainer.priceChange24h.toFixed(2)}% price change, currently at $${topGainer.price.toLocaleString(undefined, {maximumFractionDigits: 2})}. `;
        }
        
        if (topLoser && topLoser.priceChange24h < 0) {
          summary += `${topLoser.name} (${topLoser.symbol}) shows the largest decline at ${topLoser.priceChange24h.toFixed(2)}%, trading at $${topLoser.price.toLocaleString(undefined, {maximumFractionDigits: 2})}. `;
        }
      }
    }
    
    // Add conclusion and recommendations
    summary += `\n\nIn summary, ${generateDynamicConclusion(query, data)}`;
    
  } catch (error) {
    console.error('Error in generateFallbackSummary:', error);
    summary = 'Analysis completed with available data. Some sources may be unavailable.';
  }
  
  return summary || 'Analysis completed with available data. Some sources may be unavailable.';
}

// Generate a dynamic conclusion based on the query and data
function generateDynamicConclusion(query: string, data: any): string {
  const queryLower = query.toLowerCase();
  let conclusion = '';
  
  // Check if market is mostly up or down
  let positiveChanges = 0;
  let negativeChanges = 0;
  
  // Count price changes direction
  if (data.cryptoData && Array.isArray(data.cryptoData)) {
    data.cryptoData.forEach((crypto: any) => {
      if (crypto?.priceChange24h > 0) positiveChanges++;
      else if (crypto?.priceChange24h < 0) negativeChanges++;
    });
  }
  
  // Count TVL changes direction
  if (data.defiProjects && Array.isArray(data.defiProjects)) {
    data.defiProjects.forEach((project: any) => {
      const change = project?.tvlChange24h || project?.tvlChange7d;
      if (change > 0) positiveChanges++;
      else if (change < 0) negativeChanges++;
    });
  }
  
  const marketSentiment = positiveChanges > negativeChanges ? 'positive' : 
                          negativeChanges > positiveChanges ? 'negative' : 'mixed';
                          
  // Generate conclusion based on query type
  if (queryLower.includes('invest') || queryLower.includes('buy')) {
    switch (marketSentiment) {
      case 'positive':
        conclusion = 'the market is showing mostly positive momentum. Consider researching projects with strong fundamentals and consistent growth before making investment decisions. Always diversify your portfolio and invest only what you can afford to lose.';
        break;
      case 'negative':
        conclusion = 'the market is showing some bearish signals. Consider waiting for stability or look for projects that have shown resilience during downturns. Risk management should be prioritized in current conditions.';
        break;
      default:
        conclusion = 'the market shows mixed signals. Focus on projects with strong fundamentals and consider dollar-cost averaging rather than lump-sum investments given the current volatility.';
    }
  } else if (queryLower.includes('trend') || queryLower.includes('movement')) {
    switch (marketSentiment) {
      case 'positive':
        conclusion = 'the current trend appears bullish with most assets showing positive price action. Keep an eye on trading volumes and potential resistance levels that might indicate trend reversals.';
        break;
      case 'negative':
        conclusion = 'the trend appears bearish in the short term with several assets showing price declines. Watch for potential support levels where reversals might occur.';
        break;
      default:
        conclusion = 'we\'re seeing consolidation across many assets with mixed signals. This often precedes significant market movements, so monitor key technical indicators for breakout signals.';
    }
  } else {
    switch (marketSentiment) {
      case 'positive':
        conclusion = 'the overall crypto market shows strength at the moment. Keep monitoring key resistance levels and news events that might impact this positive trend.';
        break;
      case 'negative':
        conclusion = 'caution is advised as several assets are showing downward pressure. Consider watching key support levels and market catalysts that could reverse this trend.';
        break;
      default:
        conclusion = 'the market lacks clear direction at the moment. This might present opportunities for both entries and exits depending on your investment strategy and risk tolerance.';
    }
  }
  
  return conclusion;
}

export async function generateInsights(query: string, data: any): Promise<string> {
  try {
    const prompt = `
Based on the following crypto data, provide insights for the query: "${query}"

Data: ${JSON.stringify(data, null, 2)}

Provide a concise, professional analysis focusing on:
- Key trends and patterns
- Notable changes in metrics
- Potential implications for investors
- Risk factors to consider
`;

    let retryCount = 0;
    const maxRetries = 2;
    let retryDelay = 1000; // Start with 1 second delay
    
    while (retryCount <= maxRetries) {
      try {
        const completion = await groq.chat.completions.create({
          messages: [
            {
              role: 'system',
              content: 'You are a crypto market analyst. Provide clear, actionable insights.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          model: getCurrentModel(retryCount),
          temperature: 0.3,
          max_tokens: 1000,
        });

        return completion.choices[0]?.message?.content || 'Unable to generate insights at this time.';
      } catch (retryError) {
        const errorMessage = retryError instanceof Error ? retryError.message : 'Unknown error';
        const isCapacityError = errorMessage.includes('over capacity');
        const isRateLimitError = errorMessage.includes('rate_limit_exceeded') || errorMessage.includes('Rate limit reached');
        
        console.error(`Groq API error (${isRateLimitError ? 'rate limit' : (isCapacityError ? 'capacity issue' : 'general error')}) - attempt ${retryCount + 1}/${maxRetries + 1}:`, retryError);
        
        if (retryCount >= maxRetries) {
          throw retryError; // Re-throw if we've exhausted retries
        }
        
        // Calculate backoff delay with exponential increase
        retryDelay *= 2;
        console.log(`Retrying in ${retryDelay}ms with model fallback...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        retryCount++;
      }
    }
    
    // This should never be reached due to the throw in the catch block above
    return 'Unable to generate insights after multiple attempts.';
  } catch (error) {
    console.error('Error generating insights:', error);
    
    // If this is a capacity/server error, update env flag to skip future API calls
    if ((error as any)?.message?.includes('over capacity') || (error as any)?.status === 503) {
      console.log('⚠️ Groq API is over capacity, enabling fallback mode');
      process.env.SKIP_GROQ_API = 'true';
    }
    
    // Generate a fallback insight message based on the query type
    const queryLower = query.toLowerCase();
    
    if (queryLower.includes('invest') || queryLower.includes('buy')) {
      return 'Based on the available data, remember that cryptocurrency investments carry significant risk. Always conduct thorough research, diversify your portfolio, and invest only what you can afford to lose.';
    } else if (queryLower.includes('trend') || queryLower.includes('market')) {
      return 'Market trends show varying patterns across different assets. Focus on fundamentals and long-term potential rather than short-term price movements when evaluating projects.';
    } else {
      return 'The crypto market is constantly evolving. Stay informed about project developments, regulatory changes, and broader market conditions to make better decisions.';
    }
  }
}
