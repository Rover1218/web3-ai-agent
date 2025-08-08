'use client';

import { motion } from 'framer-motion';
import { ExternalLink, TrendingUp, AlertTriangle, BarChart3 } from 'lucide-react';
import { ResearchResult } from '@/lib/types';
import DataTable from './DataTable';

interface ResearchResultsProps {
  result: ResearchResult;
}

const SOURCE_LINKS = {
  'CoinMarketCap': 'https://coinmarketcap.com/',
  'DeFiLlama': 'https://defillama.com/',
  'Dune Analytics': 'https://dune.com/',
  'Etherscan': 'https://etherscan.io/',
  'Groq AI': 'https://groq.com/',
  'LangChain': 'https://langchain.com/'
};

export default function ResearchResults({ result }: ResearchResultsProps) {
  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Summary Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="retro-card border border-gray-200 p-6"
      >
        <div className="flex items-start justify-between mb-4">
          <h2 className={`text-xl font-semibold font-mono ${result.showDeFi ? 'text-purple-600' : 'text-blue-600'}`}>
            {result.showDeFi ? 'Research Analysis' : 'Chat Response'}
          </h2>
          <span className="text-gray-600 text-sm font-mono">
            {new Date(result.timestamp).toLocaleTimeString()}
          </span>
        </div>
        <div className="prose prose-gray max-w-none">
          <p className="text-gray-700 leading-relaxed font-mono">{result.summary}</p>
        </div>
      </motion.div>

      {/* LangChain Insights */}
      {result.insights && result.insights.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="retro-card border border-gray-200 p-6"
        >
          <div className="flex items-center mb-4">
            <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
            <h3 className="text-lg font-semibold text-green-600 font-mono">
              Key Insights & Recommendations
            </h3>
          </div>
          <ul className="space-y-3">
            {result.insights.map((insight, index) => (
              <li key={index} className="flex items-start space-x-3">
                <span className="text-green-600 mt-1 font-bold">•</span>
                <span className="text-gray-700 leading-relaxed font-mono">{insight}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* Risk Factors */}
      {result.riskFactors && result.riskFactors.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="retro-card border border-gray-200 p-6"
        >
          <div className="flex items-center mb-4">
            <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
            <h3 className="text-lg font-semibold text-red-600 font-mono">
              Risk Factors & Considerations
            </h3>
          </div>
          <ul className="space-y-3">
            {result.riskFactors.map((risk, index) => (
              <li key={index} className="flex items-start space-x-3">
                <span className="text-red-600 mt-1 font-bold">⚠</span>
                <span className="text-gray-700 leading-relaxed font-mono">{risk}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* Market Trends */}
      {result.marketTrends && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="retro-card border border-gray-200 p-6"
        >
          <div className="flex items-center mb-4">
            <BarChart3 className="h-5 w-5 text-purple-600 mr-2" />
            <h3 className="text-lg font-semibold text-purple-600 font-mono">
              Market Trends & Patterns
            </h3>
          </div>
          <p className="text-gray-700 leading-relaxed font-mono">{result.marketTrends}</p>
        </motion.div>
      )}

      {/* Data Table */}
      {result.showTable && result.dataTable && result.dataTable.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <DataTable data={result.dataTable} title="Protocol Comparison" />
        </motion.div>
      )}

      {/* Data Sources */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="retro-card border border-gray-200 p-6"
      >
        <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2 font-mono">
          Data Sources
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {result.sources.map((source, index) => (
            <motion.a
              key={index}
              href={SOURCE_LINKS[source as keyof typeof SOURCE_LINKS] || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-blue-600 transition-colors group font-mono"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="text-gray-700 group-hover:text-purple-600 transition-colors font-mono">
                {source}
              </span>
              <ExternalLink className="h-4 w-4 text-blue-600 group-hover:text-purple-600 transition-colors" />
            </motion.a>
          ))}
        </div>
      </motion.div>

      {/* DeFi Projects */}
      {result.showDeFi && result.data.defiProjects && result.data.defiProjects.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="retro-card border border-gray-200 p-6"
        >
          <h3 className="text-lg font-semibold text-green-600 mb-4 font-mono">
            Top DeFi Projects
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {result.data.defiProjects.slice(0, 6).map((project, index) => (
              <motion.a
                key={project.id}
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 border border-gray-200 rounded-lg hover:border-green-600 transition-colors group font-mono"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{ borderColor: 'rgb(229, 231, 235)' }}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-800 group-hover:text-green-600 transition-colors font-mono">
                    {project.name}
                  </h4>
                  <span className="text-sm text-gray-600 font-mono">{project.category}</span>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 font-mono">TVL:</span>
                    <span className="text-green-600 font-mono">
                      ${(project.tvl / 1e9).toFixed(2)}B
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 font-mono">24h Change:</span>
                    <span className={`font-mono ${project.tvlChange24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {project.tvlChange24h >= 0 ? '+' : ''}{project.tvlChange24h.toFixed(2)}%
                    </span>
                  </div>
                </div>
              </motion.a>
            ))}
          </div>
        </motion.div>
      )}

      {/* Etherscan Data */}
      {result.showEtherscan && result.data.etherscanData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="retro-card border border-gray-200 p-6"
        >
          <h3 className="text-lg font-semibold text-blue-600 mb-4 font-mono">
            Blockchain Data (Etherscan)
          </h3>
          
          {/* Gas Price */}
          {result.data.etherscanData.gasPrice && (
            <div className="mb-6">
              <h4 className="font-semibold text-gray-800 mb-2 font-mono">Current Gas Prices (Gwei)</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600 font-mono">Safe Low</div>
                  <div className="font-mono text-lg text-green-600">
                    {result.data.etherscanData.gasPrice.SafeLow || 'N/A'}
                  </div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600 font-mono">Standard</div>
                  <div className="font-mono text-lg text-blue-600">
                    {result.data.etherscanData.gasPrice.Standard || 'N/A'}
                  </div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600 font-mono">Fast</div>
                  <div className="font-mono text-lg text-orange-600">
                    {result.data.etherscanData.gasPrice.Fast || 'N/A'}
                  </div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600 font-mono">Fastest</div>
                  <div className="font-mono text-lg text-red-600">
                    {result.data.etherscanData.gasPrice.Fastest || 'N/A'}
                  </div>
                </div>
              </div>
              {/* Debug info */}
              <div className="mt-2 text-xs text-gray-500 font-mono">
                Last updated: {new Date().toLocaleTimeString()}
              </div>
            </div>
          )}

          {/* Token Information */}
          {result.data.etherscanData.tokenInfo && (
            <div className="mb-6">
              <h4 className="font-semibold text-gray-800 mb-2 font-mono">Token Information</h4>
              <div className="bg-gray-50 p-4 rounded-lg font-mono text-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div><span className="text-gray-600 font-mono">Name:</span> {result.data.etherscanData.tokenInfo.tokenName}</div>
                  <div><span className="text-gray-600 font-mono">Symbol:</span> {result.data.etherscanData.tokenInfo.tokenSymbol}</div>
                  <div><span className="text-gray-600 font-mono">Decimals:</span> {result.data.etherscanData.tokenInfo.tokenDecimal}</div>
                  <div><span className="text-gray-600 font-mono">Total Supply:</span> {result.data.etherscanData.tokenInfo.totalSupply}</div>
                </div>
              </div>
            </div>
          )}

          {/* Recent Transactions */}
          {result.data.etherscanData.transactions && result.data.etherscanData.transactions.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-800 mb-2 font-mono">Recent Transactions</h4>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {result.data.etherscanData.transactions.slice(0, 5).map((tx, index) => (
                  <div key={index} className="bg-gray-50 p-3 rounded-lg font-mono text-xs">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="text-gray-600 font-mono">Hash: {tx.hash.substring(0, 10)}...</div>
                        <div className="text-gray-600 font-mono">From: {tx.from.substring(0, 10)}...</div>
                        <div className="text-gray-600 font-mono">To: {tx.to.substring(0, 10)}...</div>
                      </div>
                      <div className="text-right">
                        <div className="text-green-600 font-mono">{(parseInt(tx.value) / 1e18).toFixed(4)} ETH</div>
                        <div className="text-gray-600 font-mono">{tx.gasUsed} gas</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
