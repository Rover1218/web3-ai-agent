export interface CryptoData {
  id: string;
  name: string;
  symbol: string;
  price: number;
  priceChange24h: number;
  marketCap: number;
  volume24h: number;
  circulatingSupply: number;
}

export interface DeFiProject {
  id: string;
  name: string;
  symbol: string;
  tvl: number;
  tvlChange24h: number;
  tvlChange7d: number;
  chains: string[];
  category: string;
  url: string;
}

export interface SocialSentiment {
  project: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  score: number;
  mentions: number;
  sources: string[];
}

export interface NewsEvent {
  title: string;
  description: string;
  source: string;
  url: string;
  publishedAt: string;
  sentiment: 'positive' | 'negative' | 'neutral';
}

export interface EtherscanTokenInfo {
  contractAddress: string;
  tokenName: string;
  tokenSymbol: string;
  tokenDecimal: string;
  totalSupply: string;
}

export interface EtherscanTransaction {
  blockNumber: string;
  timeStamp: string;
  hash: string;
  nonce: string;
  blockHash: string;
  transactionIndex: string;
  from: string;
  to: string;
  value: string;
  gas: string;
  gasPrice: string;
  isError: string;
  txreceipt_status: string;
  input: string;
  contractAddress: string;
  cumulativeGasUsed: string;
  gasUsed: string;
  confirmations: string;
}

export interface EtherscanGasPrice {
  SafeLow: string;
  Standard: string;
  Fast: string;
  Fastest: string;
  suggestBaseFee: string;
  LastBlock: string;
}

export interface EtherscanContractSource {
  SourceCode: string;
  ABI: string;
  ContractName: string;
  CompilerVersion: string;
  OptimizationUsed: string;
  Runs: string;
  ConstructorArguments: string;
  EVMVersion: string;
  Library: string;
  LicenseType: string;
  Proxy: string;
  Implementation: string;
  SwarmSource: string;
}

export interface ResearchQuery {
  query: string;
  timestamp: string;
  sources: string[];
}

export interface ResearchResult {
  summary: string;
  data: {
    defiProjects?: DeFiProject[];
    cryptoData?: CryptoData[];
    socialSentiment?: SocialSentiment[];
    newsEvents?: NewsEvent[];
    etherscanData?: {
      tokenInfo?: EtherscanTokenInfo;
      transactions?: EtherscanTransaction[];
      gasPrice?: EtherscanGasPrice;
      contractSource?: EtherscanContractSource;
    };
    duneData?: any[];
  };
  dataTable?: DataTableRow[];
  sources: string[];
  timestamp: string;
  showDeFi?: boolean;
  showSentiment?: boolean;
  showNews?: boolean;
  showTable?: boolean;
  showEtherscan?: boolean;
  isCryptoQuery?: boolean;
  // New LangChain fields
  insights?: string[];
  riskFactors?: string[];
  marketTrends?: string;
  conversationId?: string;
  // Citation fields
  citations?: {
    id: string;
    text: string;
    source: string;
    url?: string;
  }[];
}

export interface DataTableRow {
  project: string;
  tvl: string;
  tvlChange: string;
  price: string;
  priceChange: string;
  sentiment: string;
  newsCount: number | string;
}

export interface APIResponse {
  success: boolean;
  data?: any;
  error?: string;
}

// New interfaces for LangChain features
export interface ConversationContext {
  id: string;
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export interface AnalysisRequest {
  query: string;
  mode: 'research' | 'chat';
  conversationId?: string;
  includeHistory?: boolean;
}

export interface APIRequirements {
  needsCryptoData: boolean;
  cryptoSymbols: string[];
  needsDeFiData: boolean;
  needsEtherscanData: boolean;
  etherscanActions: string[];
  needsDuneData: boolean;
  duneQuery?: string;
  analysisType: 'research' | 'chat';
  priority: 'high' | 'medium' | 'low';
}
