import React from 'react';
import { Stats } from '../../types';

interface TradeSummaryProps {
  stats: Stats;
}

const TradeSummary: React.FC<TradeSummaryProps> = ({ stats }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-medium mb-2">Trade Summary</h3>
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gray-50 p-3 rounded">
          <span className="text-gray-500 text-sm">Total Trades</span>
          <div className="text-2xl font-bold">{stats.totalTrades}</div>
        </div>
        <div className="bg-gray-50 p-3 rounded">
          <span className="text-gray-500 text-sm">Active Trades</span>
          <div className="text-2xl font-bold">
            {stats.totalTrades - (stats.winningTrades + stats.losingTrades)}
          </div>
        </div>
        <div className="bg-gray-50 p-3 rounded">
          <span className="text-gray-500 text-sm">Wins</span>
          <div className="text-2xl font-bold text-green-600">{stats.winningTrades}</div>
        </div>
        <div className="bg-gray-50 p-3 rounded">
          <span className="text-gray-500 text-sm">Losses</span>
          <div className="text-2xl font-bold text-red-600">{stats.losingTrades}</div>
        </div>
      </div>
    </div>
  );
};

export default TradeSummary;