import React from 'react';
import { Stats } from '../../types';

interface PerformanceMetricsProps {
  stats: Stats;
}

const PerformanceMetrics: React.FC<PerformanceMetricsProps> = ({ stats }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow lg:col-span-2">
      <h3 className="text-lg font-medium mb-2">Performance Metrics</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-gray-50 p-3 rounded">
          <span className="text-gray-500 text-sm">Total Investment</span>
          <div className="text-2xl font-bold">${stats.totalInvestment.toFixed(2)}</div>
        </div>
        <div className="bg-gray-50 p-3 rounded">
          <span className="text-gray-500 text-sm">Avg. Return</span>
          <div className="text-2xl font-bold">{stats.averageReturn.toFixed(4)}%</div>
        </div>
        <div className="bg-gray-50 p-3 rounded">
          <span className="text-gray-500 text-sm">Win Rate</span>
          <div className="text-2xl font-bold">
            {stats.winningTrades + stats.losingTrades > 0 
              ? ((stats.winningTrades / (stats.winningTrades + stats.losingTrades)) * 100).toFixed(2) 
              : '0.00'}%
          </div>
        </div>
        <div className="bg-gray-50 p-3 rounded">
          <span className="text-gray-500 text-sm">Active Amount</span>
          <div className="text-2xl font-bold">
            ${(stats.totalInvestment - 
              (stats.winningTrades + stats.losingTrades > 0 
                ? (stats.totalInvestment / stats.totalTrades) * (stats.winningTrades + stats.losingTrades) 
                : 0)
            ).toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceMetrics;