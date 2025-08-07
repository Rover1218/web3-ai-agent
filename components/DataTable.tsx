'use client';

import { motion } from 'framer-motion';
import { DataTableRow } from '@/lib/types';
import { TrendingUp, TrendingDown, Minus, BarChart3 } from 'lucide-react';

interface DataTableProps {
  data: DataTableRow[];
  title?: string;
}

export default function DataTable({ data, title = "Research Results" }: DataTableProps) {
  if (!data || data.length === 0) {
    return (
      <motion.div 
        className="retro-card p-6"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h3 className="text-xl font-semibold text-cyan-400 mb-4 flex items-center">
          <BarChart3 className="h-5 w-5 mr-2" />
          {title}
        </h3>
        <p className="text-gray-400 font-mono">No comparison data available to display.</p>
      </motion.div>
    );
  }

  const formatCurrency = (value: string) => {
    if (!value || value === 'N/A') return value;
    const num = parseFloat(value.replace(/[$,BMK]/g, ''));
    if (isNaN(num)) return value;
    
    if (value.includes('B')) return value; // Already formatted
    if (value.includes('M')) return value; // Already formatted
    if (value.includes('K')) return value; // Already formatted
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  const formatPercentage = (value: string) => {
    if (!value || value === 'N/A') return value;
    const num = parseFloat(value.replace(/[%,]/g, ''));
    if (isNaN(num)) return value;
    return `${num > 0 ? '+' : ''}${num.toFixed(2)}%`;
  };

  const getChangeIcon = (value: string) => {
    if (!value || value === 'N/A') return <Minus className="h-4 w-4 text-gray-400" />;
    const num = parseFloat(value.replace(/[%,]/g, ''));
    if (isNaN(num)) return <Minus className="h-4 w-4 text-gray-400" />;
    if (num > 0) return <TrendingUp className="h-4 w-4 text-green-400" />;
    if (num < 0) return <TrendingDown className="h-4 w-4 text-red-400" />;
    return <Minus className="h-4 w-4 text-gray-400" />;
  };

  const getChangeColor = (value: string) => {
    if (!value || value === 'N/A') return 'text-gray-400';
    const num = parseFloat(value.replace(/[%,]/g, ''));
    if (isNaN(num)) return 'text-gray-400';
    return num >= 0 ? 'text-green-400' : 'text-red-400';
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment.toLowerCase()) {
      case 'positive':
        return 'text-green-400 bg-green-400/10';
      case 'negative':
        return 'text-red-400 bg-red-400/10';
      case 'neutral':
        return 'text-gray-400 bg-gray-400/10';
      default:
        return 'text-gray-400 bg-gray-400/10';
    }
  };

  return (
    <motion.div 
      className="retro-card overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="px-6 py-4 border-b border-cyan-500/30">
        <h3 className="text-xl font-semibold text-cyan-400 flex items-center">
          <BarChart3 className="h-5 w-5 mr-2" />
          {title}
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th>Project</th>
              <th>TVL</th>
              <th>TVL Change</th>
              <th>Price</th>
              <th>Price Change</th>
              <th>Sentiment</th>
              <th>News Count</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <motion.tr 
                key={index} 
                className="hover:bg-cyan-500/5 transition-colors"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                whileHover={{ 
                  scale: 1.01,
                  backgroundColor: "rgba(0, 255, 255, 0.1)",
                }}
              >
                <td className="font-medium text-white font-mono">{row.project}</td>
                <td className="font-mono text-cyan-400">{formatCurrency(row.tvl)}</td>
                <td>
                  <div className="flex items-center space-x-1">
                    {getChangeIcon(row.tvlChange)}
                    <span className={`font-mono ${getChangeColor(row.tvlChange)}`}>
                      {formatPercentage(row.tvlChange)}
                    </span>
                  </div>
                </td>
                <td className="font-mono text-cyan-400">{formatCurrency(row.price)}</td>
                <td>
                  <div className="flex items-center space-x-1">
                    {getChangeIcon(row.priceChange)}
                    <span className={`font-mono ${getChangeColor(row.priceChange)}`}>
                      {formatPercentage(row.priceChange)}
                    </span>
                  </div>
                </td>
                <td>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium font-mono ${getSentimentColor(row.sentiment)}`}>
                    {typeof row.sentiment === 'string' 
                      ? row.sentiment.charAt(0).toUpperCase() + row.sentiment.slice(1).toLowerCase()
                      : 'Neutral'}
                  </span>
                </td>
                <td className="text-center">
                  {(typeof row.newsCount === 'number') ? (
                    <span className="inline-flex items-center justify-center w-6 h-6 bg-cyan-400/20 text-cyan-400 text-xs font-medium rounded-full font-mono">
                      {row.newsCount}
                    </span>
                  ) : (
                    <span className="text-gray-400 text-xs font-mono">
                      {row.newsCount || 'Not Available'}
                    </span>
                  )}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
