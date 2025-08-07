'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Zap, Shield, BarChart3, Terminal, Cpu, Database, Satellite } from 'lucide-react';
import QueryInput from '@/components/QueryInput';
import ResearchResults from '@/components/ResearchResults';
import { ResearchResult } from '@/lib/types';

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ResearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentMode, setCurrentMode] = useState<'research' | 'chat'>('research');

  const handleQuerySubmit = async (query: string, mode: 'research' | 'chat') => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    setCurrentMode(mode);
    
    const endpoint = mode === 'research' ? '/api/research' : '/api/chat';

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process query');
      }

      if (data.success) {
        setResult(data.data);
      } else {
        throw new Error(data.error || 'Failed to get results');
      }
    } catch (err) {
      // Get most helpful error message
      const message = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(message);
      
      // Log additional details
      console.error(`Query failed (${mode} mode):`, err);
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Analysis',
      description: 'Advanced AI algorithms analyze complex crypto data and provide actionable insights.',
      color: 'text-cyan-400',
    },
    {
      icon: Zap,
      title: 'Real-Time Data',
      description: 'Fetch live data from CoinMarketCap, DeFiLlama, and Dune Analytics.',
      color: 'text-pink-400',
    },
    {
      icon: Shield,
      title: 'Multi-Source Verification',
      description: 'Cross-reference data from multiple platforms for accuracy and reliability.',
      color: 'text-green-400',
    },
    {
      icon: BarChart3,
      title: 'Comprehensive Metrics',
      description: 'Track TVL, price movements, social sentiment, and news events.',
      color: 'text-purple-400',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut" as const,
      },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-20 left-20 w-32 h-32 bg-cyan-500/20 rounded-full blur-xl"
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute top-40 right-20 w-24 h-24 bg-pink-500/20 rounded-full blur-xl"
          animate={{
            x: [0, -80, 0],
            y: [0, 60, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-20 left-1/3 w-40 h-40 bg-purple-500/20 rounded-full blur-xl"
          animate={{
            x: [0, 120, 0],
            y: [0, -80, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Header */}
      <motion.header 
        className="relative z-10 text-white py-16 border-b-2 border-cyan-500/30"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        style={{
          background: 'linear-gradient(180deg, rgba(0,0,0,0.8) 0%, rgba(26,26,46,0.9) 50%, rgba(22,33,62,0.8) 100%)',
          backdropFilter: 'blur(10px)',
        }}
      >
        {/* Scan line effect */}
        <div className="absolute inset-0 scan-line opacity-30"></div>
        
        {/* Terminal-style border */}
        <div className="absolute inset-0 border-2 border-cyan-500/20 rounded-none pointer-events-none"></div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          {/* Terminal prompt effect */}
          <motion.div
            className="flex items-center justify-center mb-4"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <span className="text-cyan-400 font-mono text-lg mr-2">$</span>
            <span className="text-green-400 font-mono text-lg animate-pulse">crypto_research_assistant</span>
            <span className="text-cyan-400 font-mono text-lg ml-2">--start</span>
          </motion.div>

          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mb-6"
          >
            <h1 className="text-6xl md:text-8xl font-bold mb-4 font-mono relative">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-pink-500 to-purple-400 animate-pulse">
                Crypto Research Assistant
              </span>
              {/* Glitch effect layers */}
              <span className="absolute inset-0 text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-cyan-400 opacity-0 animate-ping" style={{ animationDelay: '0.5s' }}>
                Crypto Research Assistant
              </span>
              <span className="absolute inset-0 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 opacity-0 animate-ping" style={{ animationDelay: '1s' }}>
                Crypto Research Assistant
              </span>
            </h1>
            
            {/* Subtitle with typewriter effect */}
            <motion.div
              className="text-xl md:text-2xl text-cyan-200 max-w-4xl mx-auto leading-relaxed font-mono"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <span className="text-green-400">AI-powered</span> research assistant for crypto analysts. 
              <br />
              <span className="text-yellow-400">Get comprehensive insights</span> from multiple data sources in seconds.
            </motion.div>
          </motion.div>

          {/* Status indicators */}
          <motion.div
            className="flex justify-center items-center space-x-6 text-sm font-mono"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
              <span className="text-green-400">API Connected</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-cyan-400 rounded-full mr-2 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
              <span className="text-cyan-400">Data Sources Active</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-purple-400 rounded-full mr-2 animate-pulse" style={{ animationDelay: '1s' }}></div>
              <span className="text-purple-400">AI Ready</span>
            </div>
          </motion.div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 relative z-10">
        {/* Query Input */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <QueryInput onQuerySubmit={handleQuerySubmit} isLoading={isLoading} />
        </motion.div>

        {/* Loading State */}
        <AnimatePresence>
          {isLoading && (
            <motion.div 
              className="text-center py-12"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
            >
              <div className="inline-flex items-center px-6 py-4 retro-card neon-border">
                <motion.div 
                  className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full mr-3"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                <span className="text-cyan-400 font-mono">Analyzing your query and fetching data...</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error State */}
        <AnimatePresence>
          {error && (
            <motion.div 
              className="retro-card neon-border border-red-500 p-6 mb-8"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="text-lg font-semibold text-red-400 mb-2 flex items-center">
                <Terminal className="h-5 w-5 mr-2" />
                {error.includes("over capacity") ? "AI Service Busy" : "System Error"}
              </h3>
              {error.includes("over capacity") ? (
                <div className="space-y-3">
                  <p className="text-yellow-300 font-mono">The Groq AI service is currently experiencing high demand. Please try again in a moment.</p>
                  <div className="flex items-center mt-2 bg-black/30 p-3 rounded-md border border-yellow-500/30">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full mr-2 animate-pulse"></div>
                    <p className="text-gray-300 text-sm">
                      You can check the service status at <a href="https://groqstatus.com/" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">groqstatus.com</a>
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-red-300 font-mono">{error}</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              transition={{ duration: 0.5 }}
            >
              <ResearchResults result={result} mode={currentMode} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Features Section */}
        {!result && !isLoading && (
          <motion.section 
            className="mt-16"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.h2 
              className="text-4xl font-bold text-center mb-12 neon-text text-cyan-400"
              variants={itemVariants}
            >
              Why Choose Our Research Assistant?
            </motion.h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <motion.div 
                  key={index} 
                  className="retro-card retro-card-hover p-6 text-center"
                  variants={itemVariants}
                  whileHover={{ 
                    scale: 1.05,
                    rotateY: 5,
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.div 
                    className={`w-16 h-16 ${feature.color} rounded-full flex items-center justify-center mb-4 mx-auto`}
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <feature.icon className="h-8 w-8" />
                  </motion.div>
                  <h3 className="text-xl font-semibold text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Example Queries Section */}
        {!result && !isLoading && (
          <motion.section 
            className="mt-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <div className="retro-card p-8">
              <motion.h2 
                className="text-3xl font-bold text-center mb-8 neon-text text-purple-400"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 1 }}
              >
                Try These Example Queries
              </motion.h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  {
                    title: "DeFi Analysis",
                    query: "Identify DeFi projects with the highest surge in TVL last week and summarize any major social sentiment shifts or news events affecting them."
                  },
                  {
                    title: "Market Trends",
                    query: "Compare the performance of top 5 DeFi protocols and analyze their market sentiment trends."
                  },
                  {
                    title: "Sentiment Analysis",
                    query: "What are the emerging trends in the crypto market based on recent price movements and social sentiment?"
                  },
                  {
                    title: "Correlation Study",
                    query: "Analyze the correlation between TVL growth and social sentiment for major DeFi protocols."
                  }
                ].map((example, index) => (
                  <motion.div 
                    key={index}
                    className="retro-card retro-card-hover p-6 border border-cyan-500/30"
                    initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 1.2 + index * 0.1 }}
                    whileHover={{ 
                      scale: 1.02,
                      borderColor: "rgba(0, 255, 255, 0.6)",
                    }}
                  >
                    <h3 className="font-semibold text-cyan-400 mb-3 flex items-center">
                      <Database className="h-4 w-4 mr-2" />
                      {example.title}
                    </h3>
                    <p className="text-gray-300 text-sm leading-relaxed">
                      "{example.query}"
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.section>
        )}
      </main>

      {/* Footer */}
      <motion.footer 
        className="bg-black/50 backdrop-blur-sm text-white py-8 mt-16 relative z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1.5 }}
      >
        <div className="container mx-auto px-4 text-center">
          <motion.p 
            className="text-gray-300 font-mono"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Powered by Groq AI • Data from CoinMarketCap, DeFiLlama, and Dune Analytics
          </motion.p>
        </div>
      </motion.footer>
    </div>
  );
}
