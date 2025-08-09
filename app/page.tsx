'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Loader2, ExternalLink, TrendingUp, BarChart3, Globe, Shield, Zap } from 'lucide-react';
import QueryInput from '@/components/QueryInput';
import ResearchResults from '@/components/ResearchResults';
import { ResearchResult } from '@/lib/types';

export default function Home() {
  const [result, setResult] = useState<ResearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentMode, setCurrentMode] = useState<'research' | 'chat'>('research');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isUsingLangChain, setIsUsingLangChain] = useState(true);
  const [isUsingFallback, setIsUsingFallback] = useState(false);

  const handleQuerySubmit = async (query: string, mode: 'research' | 'chat') => {
    setIsLoading(true);
    setError(null);
    setCurrentMode(mode);
    setIsUsingFallback(false);

    try {
      const endpoint = mode === 'chat'
        ? '/api/chat'
        : (isUsingLangChain ? '/api/analyze-langchain' : '/api/analyze');
      
      // Add timeout to the fetch request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          query, 
          mode,
          conversationId,
          includeHistory: true 
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const result = await response.json();

      if (result.success) {
        if (mode === 'chat') {
          // Normalize chat response into ResearchResult shape for UI rendering
          const normalized: ResearchResult = {
            summary: result.summary || 'No response',
            data: {},
            dataTable: [],
            sources: ['Direct AI Response'],
            timestamp: result.timestamp || new Date().toISOString(),
            showDeFi: false,
            showTable: false,
            showEtherscan: false,
            isCryptoQuery: true,
          };
          setResult(normalized);
        } else {
          setResult(result.data);
          if (result.conversationId) {
            setConversationId(result.conversationId);
          }
          // Check if fallback was used
          if (result.message && result.message.includes('fallback')) {
            setIsUsingFallback(true);
          }
        }
      } else {
        setError(result.error || 'Analysis failed');
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        setError('Request timed out. Please try again or use standard mode.');
      } else {
        setError(err instanceof Error ? err.message : 'Network error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const clearConversation = () => {
    setResult(null);
    setError(null);
    setConversationId(null);
    setIsUsingFallback(false);
  };

  const toggleMode = () => {
    setIsUsingLangChain(!isUsingLangChain);
    clearConversation();
  };

  const features = [
    {
      icon: <TrendingUp className="h-6 w-6" />,
      title: "Real-time Market Data",
      description: "Get live cryptocurrency prices, market caps, and trading volumes from CoinMarketCap and CoinGecko."
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: "DeFi Analytics",
      description: "Track TVL, protocol performance, and DeFi project rankings with DeFiLlama integration."
    },
    {
      icon: <Globe className="h-6 w-6" />,
      title: "Blockchain Insights",
      description: "Access Ethereum gas prices, token information, and transaction data via Etherscan."
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "AI-Powered Analysis",
      description: "Advanced analysis using Groq AI and LangChain for intelligent data interpretation."
    }
  ];

  const exampleQueries = [
    "Compare the top 5 DeFi protocols by TVL",
    "What's the current Ethereum gas price?",
    "Show me Bitcoin and Ethereum price analysis",
    "Which DeFi projects are trending this week?",
    "Analyze the market sentiment for UNI token"
  ];

  return (
    <div className="min-h-screen bg-white font-mono">
      {/* Background Pattern */}
      <div className="fixed inset-0 opacity-5">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="10" cy="10" r="1" fill="currentColor" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dots)" />
        </svg>
      </div>

      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 bg-clip-text text-transparent font-mono">
                  Web3 AI Agent
                </h1>
                <p className="text-sm text-gray-600 font-mono">Powered by LangChain & Groq</p>
              </div>
            </div>
            
            {/* LangChain Toggle */}
            <div className="flex items-center space-x-4">
              <span className="text-gray-600 text-sm font-mono">Engine:</span>
              <button
                onClick={toggleMode}
                className={`px-4 py-2 rounded-lg border transition-colors text-sm font-medium font-mono ${
                  isUsingLangChain 
                    ? 'bg-blue-600 text-white border-blue-600' 
                    : 'bg-white text-gray-600 border-gray-200 hover:border-blue-600'
                }`}
              >
                {isUsingLangChain ? 'LangChain' : 'Standard'}
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Terminal Prompt */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <div className="inline-flex items-center space-x-2 bg-gray-100 border border-gray-200 rounded-lg px-4 py-2 font-mono text-sm">
            <span className="text-blue-600">user@web3-agent</span>
            <span className="text-gray-400">:</span>
            <span className="text-green-600">~</span>
            <span className="text-gray-400">$</span>
            <span className="text-gray-700">analyze crypto data</span>
          </div>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-6xl font-bold text-center mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 bg-clip-text text-transparent font-mono"
        >
          Intelligent Crypto Analysis
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xl text-gray-700 text-center mb-12 max-w-3xl mx-auto font-mono"
        >
          Ask questions about <span className="text-green-600 font-semibold">cryptocurrencies</span>, 
          analyze <span className="text-blue-600 font-semibold">DeFi protocols</span>, 
          and get <span className="text-purple-600 font-semibold">blockchain insights</span> with AI-powered intelligence.
        </motion.p>

        {/* Status indicators */}
        <div className="flex justify-center gap-4 mb-6">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600 font-mono">System Online</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-sm text-gray-600 font-mono">
              {isUsingLangChain ? 'LangChain Mode' : 'Standard Mode'}
            </span>
          </div>
          {isUsingFallback && (
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-yellow-600 font-mono">Using Fallback</span>
            </div>
          )}
        </div>

        {/* Query Input */}
        <QueryInput onQuerySubmit={handleQuerySubmit} isLoading={isLoading} />

        {/* Loading State */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600 font-mono">
              {isUsingLangChain ? '🤖 LangChain is analyzing your query and fetching relevant data...' : 'Analyzing your query...'}
            </p>
          </motion.div>
        )}

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8"
          >
            <h3 className="text-lg font-semibold text-red-800 mb-2 font-mono">Analysis Error</h3>
            <p className="text-red-700 mb-4 font-mono">{error}</p>
            <button
              onClick={() => setError(null)}
              className="text-red-600 hover:text-red-800 underline font-mono"
            >
              Try again
            </button>
          </motion.div>
        )}

        {/* Results */}
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <ResearchResults result={result} />
            
            {/* Conversation Controls */}
            {conversationId && (
              <div className="mt-6 text-center">
                <button
                  onClick={clearConversation}
                  className="text-gray-500 hover:text-gray-700 text-sm underline font-mono"
                >
                  Clear conversation history
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* Features Section */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          className="py-16"
        >
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12 font-mono">
            Powered by Advanced AI & Data Sources
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <div className="text-white">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2 font-mono">{feature.title}</h3>
                <p className="text-gray-600 text-sm font-mono">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Example Queries */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          className="py-16"
        >
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-8 font-mono">
            Try These Example Queries
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {exampleQueries.map((query, index) => (
              <motion.button
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => handleQuerySubmit(query, 'research')}
                disabled={isLoading}
                className="p-4 border border-gray-200 rounded-lg text-left hover:border-blue-600 transition-colors disabled:opacity-50 font-mono"
              >
                <p className="text-gray-700 text-sm font-mono">{query}</p>
              </motion.button>
            ))}
          </div>
        </motion.section>
      </main>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-gray-100 border-t border-gray-200 py-8 mt-16"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-gray-600">
            <p className="mb-2 font-mono">
              Powered by <span className="font-semibold">Groq AI</span> • 
              Enhanced with <span className="font-semibold">LangChain</span>
            </p>
            <p className="text-sm font-mono">
              Data from CoinMarketCap, DeFiLlama, Dune Analytics, and Etherscan
            </p>
          </div>
        </div>
      </motion.footer>
    </div>
  );
}
