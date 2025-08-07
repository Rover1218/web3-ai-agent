'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Send, Loader2, Terminal, Database, MessageCircle } from 'lucide-react';

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
    "Identify DeFi projects with the highest surge in TVL last week and summarize any major social sentiment shifts or news events affecting them.",
    "Compare the performance of top 5 DeFi protocols and analyze their market sentiment trends.",
    "What are the emerging trends in the crypto market based on recent price movements and social sentiment?",
    "Analyze the correlation between TVL growth and social sentiment for major DeFi protocols."
  ];

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Mode toggle */}
      <div className="flex justify-center mb-4">
        <div className="bg-zinc-900/50 backdrop-blur-md border border-zinc-800 rounded-xl p-1 flex">
          <button 
            onClick={() => setMode('research')} 
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              mode === 'research' 
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' 
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            <Database size={16} />
            <span>Research Mode</span>
          </button>
          <button 
            onClick={() => setMode('chat')} 
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              mode === 'chat' 
                ? 'bg-pink-500/20 text-pink-400 border border-pink-500/30' 
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            <MessageCircle size={16} />
            <span>Chat Mode</span>
          </button>
        </div>
      </div>
      
      {mode === 'chat' && (
        <motion.div 
          className="mb-3 text-center text-xs text-yellow-300 bg-yellow-500/10 border border-yellow-500/20 rounded-md p-2"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <span className="flex items-center justify-center">
            <Terminal size={12} className="mr-1" />
            Chat mode uses Groq AI API which may experience capacity limits. If you encounter errors, try Research mode instead.
          </span>
        </motion.div>
      )}

      <motion.form 
        onSubmit={handleSubmit} 
        className="mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex w-full items-center relative group">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none z-10">
            <Search className="h-6 w-6 text-cyan-400 group-hover:text-pink-400 transition-colors duration-300" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={mode === 'research' ? "Ask your crypto research question..." : "Chat with me about crypto and Web3..."}
            className="retro-input flex-1 pl-12 pr-4 py-4 text-lg font-mono rounded-l-xl rounded-r-none border-r-0 focus:z-10 h-[56px] group-hover:border-pink-400 transition-all duration-300"
            disabled={isLoading}
            style={{ 
              borderTopRightRadius: 0, 
              borderBottomRightRadius: 0,
              wordWrap: 'break-word',
              whiteSpace: 'normal',
              overflow: 'visible'
            }}
          />
          <motion.button
            type="submit"
            disabled={!query.trim() || isLoading}
            className="retro-button h-[56px] w-[56px] flex items-center justify-center rounded-l-none rounded-r-xl -ml-1 px-0 focus:z-10 group-hover:border-pink-400 transition-all duration-300"
            style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </motion.button>
        </div>
      </motion.form>

      <motion.div 
        className="mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <h3 className="text-xl font-semibold text-cyan-400 mb-6 flex items-center">
          <Terminal className="h-5 w-5 mr-2" />
          Example Queries:
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {exampleQueries.map((example, index) => (
            <motion.button
              key={index}
              onClick={() => setQuery(example)}
              className="retro-card retro-card-hover p-4 text-left border border-cyan-500/30 hover:border-cyan-400"
              initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
              whileHover={{ 
                scale: 1.02,
                borderColor: "rgba(0, 255, 255, 0.6)",
              }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="text-gray-300 text-sm font-mono leading-relaxed">
                {example}
              </span>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
