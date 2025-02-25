import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Trade } from '../../types';

// Custom theme colors
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

interface AssetDistributionProps {
  byAssetType: Record<string, number>;
  investmentData: Trade[];
}

const AssetDistribution: React.FC<AssetDistributionProps> = ({ byAssetType, investmentData }) => {
  // Calculate asset metrics with accurate average acquisition price
  const assetMetrics = useMemo(() => {
    const metrics: Record<string, { 
      avgPrice: number,
      pendingValue: number,
      totalAcquired: number,
      totalInvested: number
    }> = {};
    
    Object.keys(byAssetType).forEach(asset => {
      const assetTrades = investmentData.filter(trade => trade.underlying === asset);
      
      // Initialize metrics
      let totalInvested = 0;
      let totalAcquired = 0;
      let pendingValue = 0;
      
      // Process settled DOWN trades (actual acquisitions)
      const settledDownTrades = assetTrades.filter(trade => {
        if (trade.status !== 'SETTLED' || trade.type !== 'DOWN') return false;
        
        const settlePrice = parseFloat(trade.settlePrice || '0');
        const targetPrice = parseFloat(trade.linkedPrice);
        
        // Only count it as an acquisition if target price was reached
        return settlePrice <= targetPrice;
      });
      
      // Calculate total acquired and total invested
      settledDownTrades.forEach(trade => {
        const amount = parseFloat(trade.amount);
        const targetPrice = parseFloat(trade.linkedPrice);
        
        // For DOWN trades with target reached, we acquire the asset at target price
        const acquiredAmount = amount / targetPrice;
        
        totalInvested += amount;
        totalAcquired += acquiredAmount;
      });
      
      // Calculate pending trades (active DOWN trades)
      const pendingDownTrades = assetTrades.filter(
        trade => trade.type === 'DOWN' && trade.status === 'PURCHASE_SUCCESS'
      );
      
      pendingDownTrades.forEach(trade => {
        if (trade.investmentAsset === 'USDT' || trade.investmentAsset === 'USDC') {
          pendingValue += parseFloat(trade.amount);
        } else {
          // Convert to USD value based on linked price
          pendingValue += parseFloat(trade.amount) * parseFloat(trade.linkedPrice);
        }
      });
      
      // Calculate average acquisition price (only if we have acquired assets)
      const avgPrice = totalAcquired > 0 ? totalInvested / totalAcquired : 0;
      
      metrics[asset] = { 
        avgPrice, 
        pendingValue,
        totalAcquired,
        totalInvested
      };
    });
    
    return metrics;
  }, [byAssetType, investmentData]);
  
  // Generate pie chart data based on total invested amounts
  const pieChartData = useMemo(() => {
    return Object.entries(assetMetrics).map(([assetName, metrics]) => ({
      name: assetName,
      value: metrics.totalInvested + metrics.pendingValue // Include both invested and pending
    })).filter(item => item.value > 0); // Only include assets with value > 0
  }, [assetMetrics]);
  
  // Calculate total value for percentage calculation
  const totalValue = pieChartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-medium mb-2">Assets Distribution</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={pieChartData}
              cx="50%"
              cy="50%"
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              label={({ name, value }) => {
                const percentage = ((value / totalValue) * 100).toFixed(0);
                return `${name} ${percentage}%`;
              }}
            >
              {pieChartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: number) => `$${value.toFixed(2)}`}
              labelFormatter={(name) => `${name}`}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      {/* Asset Metrics Table (Enhanced) */}
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-2 text-left">Asset</th>
              <th className="p-2 text-right">Acquired</th>
              <th className="p-2 text-right">Avg. Price</th>
              <th className="p-2 text-right">Total Invested</th>
              <th className="p-2 text-right">Pending (USDT)</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(assetMetrics).map(([asset, metrics]) => (
              <tr key={asset} className="border-b hover:bg-gray-50">
                <td className="p-2 font-medium">{asset}</td>
                <td className="p-2 text-right">
                  {metrics.totalAcquired > 0 
                    ? metrics.totalAcquired.toFixed(8) 
                    : '-'}
                </td>
                <td className="p-2 text-right">
                  {metrics.avgPrice > 0 
                    ? `$${metrics.avgPrice.toFixed(2)}` 
                    : '-'}
                </td>
                <td className="p-2 text-right">
                  ${metrics.totalInvested.toFixed(2)}
                </td>
                <td className="p-2 text-right">
                  ${metrics.pendingValue.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Acquisition Strategy Reminder */}
      <div className="mt-4 p-2 bg-blue-50 rounded text-sm text-blue-700">
        <p>
          <strong>Note:</strong> For "Buy Low" trades, the average price reflects actual acquisitions where the 
          settlement price was below your target price. Pending value shows active trades that may 
          result in asset acquisition.
        </p>
      </div>
    </div>
  );
};

export default AssetDistribution;