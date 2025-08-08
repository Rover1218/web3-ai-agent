'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Loader2, Sparkles } from 'lucide-react';

interface QueryInputProps {
  onQuerySubmit: (query: string, mode: 'research' | 'chat') => void;
  isLoading: boolean;
}

export default function QueryInput({ onQuerySubmit, isLoading }: QueryInputProps) {
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState<'research' | 'chat'>('research');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && !isLoading) {
      onQuerySubmit(query.trim(), mode);
    }
  };

  const exampleQueries = [
    "What's the current price of Bitcoin?",
    "Show me top DeFi protocols by TVL",
    "Compare Ethereum and Solana performance"
  ];

  return (
    <div className="w-full max-w-4xl mx-auto px-4">
      {/* Mode toggle */}
      <div className="flex justify-center mb-8">
        <div className="bg-gray-100 border border-gray-200 rounded-2xl p-1.5 flex shadow-sm">
          <button
            onClick={() => setMode('research')}
            className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 font-mono ${
              mode === 'research'
                ? 'bg-white text-blue-600 shadow-sm border border-gray-200'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Research
            </div>
          </button>
          <button
            onClick={() => setMode('chat')}
            className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 font-mono ${
              mode === 'chat'
                ? 'bg-white text-purple-600 shadow-sm border border-gray-200'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded-full bg-gradient-to-r from-purple-400 to-pink-400"></div>
              Chat
            </div>
          </button>
        </div>
      </div>

      {/* Chat mode warning */}
      {mode === 'chat' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 text-center"
        >
          <div className="inline-flex items-center px-4 py-2 text-amber-700 bg-amber-50 border border-amber-200 rounded-xl text-sm font-mono">
            <span>💬 Chat mode provides conversational responses</span>
          </div>
        </motion.div>
      )}

      {/* Query input form */}
      <form onSubmit={handleSubmit} className="mb-12">
        <div className="relative">
          <div className="relative">
            <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={mode === 'research' ? "Ask anything about crypto, DeFi, or blockchain..." : "Chat with me about crypto and Web3..."}
              className="w-full pl-12 pr-20 py-4 text-lg font-mono bg-white border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 placeholder-gray-400"
              disabled={isLoading}
            />
            <motion.button
              type="submit"
              disabled={!query.trim() || isLoading}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 rounded-xl hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Search className="h-5 w-5" />
              )}
            </motion.button>
          </div>
        </div>
      </form>

      {/* Example queries */}
      <div className="mb-8">
        <h3 className="text-gray-700 font-semibold mb-4 text-center font-mono text-lg">Try these examples:</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {exampleQueries.map((exampleQuery, index) => (
            <motion.button
              key={index}
              onClick={() => {
                setQuery(exampleQuery);
                onQuerySubmit(exampleQuery, mode);
              }}
              disabled={isLoading}
              className="p-4 bg-gray-50 border border-gray-200 rounded-xl text-left hover:bg-white hover:border-blue-300 hover:shadow-sm transition-all duration-200 disabled:opacity-50 font-mono group"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <p className="text-gray-600 text-sm font-mono group-hover:text-gray-800 transition-colors">{exampleQuery}</p>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
