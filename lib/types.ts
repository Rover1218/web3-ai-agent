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
  };
  dataTable?: DataTableRow[];
  sources: string[];
  timestamp: string;
  showDeFi?: boolean;
  showSentiment?: boolean;
  showNews?: boolean;
  showTable?: boolean;
  isCryptoQuery?: boolean;
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
