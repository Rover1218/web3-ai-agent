'use client';

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { DataTableRow } from '@/lib/types';

interface DataTableProps {
  data: DataTableRow[];
  title?: string;
}

export default function DataTable({ data, title = "Data Comparison" }: DataTableProps) {
  if (!data || data.length === 0) {
    return (
      <div className="retro-card border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-blue-600 mb-4 font-mono">{title}</h3>
        <p className="text-gray-600 font-mono">No comparison data available</p>
      </div>
    );
  }

  const getChangeIcon = (change: string) => {
    const value = parseFloat(change.replace(/[%+-]/g, ''));
    if (value > 0) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (value < 0) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-gray-500" />;
  };

  const getChangeColor = (change: string) => {
    const value = parseFloat(change.replace(/[%+-]/g, ''));
    if (value > 0) return 'text-green-600';
    if (value < 0) return 'text-red-600';
    return 'text-gray-500';
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment.toLowerCase()) {
      case 'positive':
        return 'text-green-600 bg-green-50';
      case 'negative':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="retro-card border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-blue-600 mb-4 font-mono">{title}</h3>
      <div className="overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider font-mono">
                Project
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider font-mono">
                TVL
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider font-mono">
                TVL Change
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider font-mono">
                Price
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider font-mono">
                Price Change
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider font-mono">
                Sentiment
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider font-mono">
                News Count
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <motion.tr
                key={index}
                className="border-b border-gray-100 hover:bg-blue-50 transition-colors font-mono"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ backgroundColor: 'rgb(239, 246, 255)' }}
              >
                <td className="px-4 py-3 text-sm font-medium text-gray-800 font-mono">
                  {row.project}
                </td>
                <td className="px-4 py-3 text-sm text-blue-600 font-mono">
                  {row.tvl || 'Not Available'}
                </td>
                <td className="px-4 py-3 text-sm font-mono">
                  <div className="flex items-center space-x-1">
                    {getChangeIcon(row.tvlChange)}
                    <span className={getChangeColor(row.tvlChange)}>
                      {row.tvlChange || 'Not Available'}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-blue-600 font-mono">
                  {row.price || 'Not Available'}
                </td>
                <td className="px-4 py-3 text-sm font-mono">
                  <div className="flex items-center space-x-1">
                    {getChangeIcon(row.priceChange)}
                    <span className={getChangeColor(row.priceChange)}>
                      {row.priceChange || 'Not Available'}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm font-mono">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSentimentColor(row.sentiment)}`}>
                    {row.sentiment || 'Not Available'}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm font-mono">
                  <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded-full text-xs font-medium">
                    {row.newsCount || 'Not Available'}
                  </span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
