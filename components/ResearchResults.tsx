'use client';

import { motion } from 'framer-motion';
import { ResearchResult } from '@/lib/types';
import { Clock, ExternalLink, Database, TrendingUp, MessageSquare, Newspaper, Cpu, MessageCircle } from 'lucide-react';
import DataTable from './DataTable';

const SOURCE_LINKS: Record<string, string> = {
  'CoinMarketCap': 'https://coinmarketcap.com/',
  'DeFiLlama': 'https://defillama.com/',
  'Dune Analytics': 'https://dune.com/',
  'Crypto Market Data': 'https://coinmarketcap.com/',
  'Social Sentiment': 'https://twitter.com/',
  'News Events': 'https://cryptonews.com/',
  'Direct AI Response': 'https://groq.com/',
};

interface ResearchResultsProps {
  result: ResearchResult & {
    showDeFi?: boolean;
    showSentiment?: boolean;
    showNews?: boolean;
    showTable?: boolean;
  };
  mode?: 'research' | 'chat';
}

export default function ResearchResults({ result, mode = 'research' }: ResearchResultsProps) {
  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Summary Section */}
      <motion.div 
        className={`retro-card p-6 ${mode === 'chat' ? 'chat-card' : 'scan-line'}`}
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between mb-4">
          {mode === 'chat' ? (
            <h2 className="text-2xl font-semibold text-pink-400 flex items-center neon-text">
              <MessageCircle className="h-6 w-6 mr-3" />
              Chat Response
            </h2>
          ) : (
            <h2 className="text-2xl font-semibold text-cyan-400 flex items-center neon-text">
              <Cpu className="h-6 w-6 mr-3" />
              Analysis Summary
            </h2>
          )}
          <div className="flex items-center text-sm text-cyan-400">
            <Clock className="h-4 w-4 mr-2" />
            <span className="font-mono">{formatTimestamp(result.timestamp)}</span>
          </div>
        </div>
        <div className="prose max-w-none">
          <div className="text-gray-300 leading-relaxed font-mono text-base space-y-3">
            {result.summary.split('\n').filter(p => p.trim()).map((paragraph, index) => (
              <p key={index} className="mb-3 text-justify">
                {paragraph.trim()}
              </p>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Data Table (Comparison) - Only show in research mode */}
      {mode === 'research' && (result.showTable || (result.dataTable && result.dataTable.length > 0)) && result.dataTable && result.dataTable.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <DataTable data={result.dataTable} title="Protocol Comparison" />
        </motion.div>
      )}

      {/* Data Sources */}
      {mode === 'research' && (
        <motion.div 
          className="retro-card p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h3 className="text-xl font-semibold text-purple-400 mb-4 flex items-center border-b border-purple-500/30 pb-3">
            <Database className="h-5 w-5 mr-3" />
            Data Sources
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            {result.sources.map((source, index) => {
              const url = SOURCE_LINKS[source] || '#';
              return (
                <motion.a
                  key={index}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center p-3 retro-card border border-purple-500/30 hover:border-purple-400 transition-colors group cursor-pointer"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                  whileHover={{
                    scale: 1.02,
                    borderColor: 'rgba(168, 85, 247, 0.7)',
                    boxShadow: '0 0 12px #a855f799',
                  }}
                >
                  <ExternalLink className="h-4 w-4 text-purple-400 mr-3 group-hover:text-pink-400 transition-colors" />
                  <span className="text-sm font-medium text-gray-300 font-mono group-hover:text-pink-400 transition-colors">
                    {source}
                  </span>
                </motion.a>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Detailed Data Sections - Only show in research mode */}
      {mode === 'research' && result.showDeFi && (
        <div className="grid grid-cols-1 gap-6">
          {/* DeFi Projects */}
          {result.data.defiProjects && result.data.defiProjects.length > 0 && (
            <motion.div 
              className="retro-card p-6"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <h3 className="text-xl font-semibold text-green-400 mb-4 flex items-center">
                <TrendingUp className="h-5 w-5 mr-3" />
                Top DeFi Projects
              </h3>
              <div className="space-y-3">
                {result.data.defiProjects.slice(0, 5).map((project, index) => (
                  <motion.div 
                    key={index} 
                    className="flex items-center justify-between p-3 retro-card border border-green-500/20"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
                    whileHover={{ 
                      scale: 1.01,
                      borderColor: "rgba(34, 197, 94, 0.4)",
                    }}
                  >
                    <div>
                      <h4 className="font-medium text-white font-mono text-base">{project.name}</h4>
                      <p className="text-sm text-gray-400">{project.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-sm font-medium text-green-400">
                        ${(project.tvl / 1e6).toFixed(1)}M
                      </p>
                      <p className={`text-sm font-mono ${project.tvlChange7d >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {project.tvlChange7d >= 0 ? '+' : ''}{project.tvlChange7d.toFixed(2)}%
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      )}
      
      {/* Social Sentiment and News Events sections have been removed */}
    </motion.div>
  );
}
