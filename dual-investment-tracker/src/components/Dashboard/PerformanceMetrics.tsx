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
          <span className="text-gray-500 text-sm">Avg. APY Return</span>
          <div className="text-2xl font-bold">{stats.averageReturn.toFixed(4)}%</div>
        </div>
        <div className="bg-gray-50 p-3 rounded">
          <span className="text-gray-500 text-sm">Target Price Hit Rate</span>
          <div className="text-2xl font-bold">
            {stats.winningTrades + stats.losingTrades > 0 
              ? ((stats.winningTrades / (stats.winningTrades + stats.losingTrades)) * 100).toFixed(2) 
              : '0.00'}%
          </div>
          <div className="text-xs text-gray-500">
            ({stats.winningTrades} / {stats.winningTrades + stats.losingTrades})
          </div>
        </div>
        <div className="bg-gray-50 p-3 rounded">
          <span className="text-gray-500 text-sm">Active Amount</span>
          <div className="text-2xl font-bold">
            ${(stats.activeInvestment || 0).toFixed(2)}
          </div>
        </div>
      </div>
      
      <div className="mt-4 p-3 bg-blue-50 rounded text-sm">
        <p className="font-medium text-blue-700">Dual Investment Reminder:</p>
        <p className="text-blue-600">
          Remember that with Binance Dual Investment, you earn rewards regardless of market direction. 
          For "Sell High" (UP), target price being reached means you sell your asset at your desired high price.
          For "Buy Low" (DOWN), target price being reached means you buy the asset at your desired low price.
        </p>
      </div>
    </div>
  );
};

export default PerformanceMetrics;