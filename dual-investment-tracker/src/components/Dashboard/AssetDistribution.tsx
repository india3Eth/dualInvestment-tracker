import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Trade } from '../../types';

// Custom theme colors
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

interface AssetDistributionProps {
  byAssetType: Record<string, number>;
  investmentData: Trade[]; // Add this to pass all trade data
}

const AssetDistribution: React.FC<AssetDistributionProps> = ({ byAssetType, investmentData }) => {
  const data = Object.entries(byAssetType).map(([name, value]) => ({ name, value }));

  // Calculate average acquisition price and pending trade value for each asset
  const assetMetrics: Record<string, { avgPrice: number, pendingValue: number }> = {};
  
  Object.keys(byAssetType).forEach(asset => {
    const assetTrades = investmentData.filter(trade => trade.underlying === asset);
    
    // Calculate average acquisition price
    let totalPrice = 0;
    let totalQuantity = 0;
    
    assetTrades.forEach(trade => {
      totalPrice += parseFloat(trade.linkedPrice);
      totalQuantity += 1;
    });
    
    const avgPrice = totalPrice / (totalQuantity || 1);
    
    // Calculate pending trade value (trades with DOWN direction and PURCHASE_SUCCESS status)
    const pendingDownTrades = assetTrades.filter(
      trade => trade.type === 'DOWN' && 
      trade.status === 'PURCHASE_SUCCESS'
    );
    
    let pendingValue = 0;
    pendingDownTrades.forEach(trade => {
      if (trade.investmentAsset === 'USDT' || trade.investmentAsset === 'USDC') {
        pendingValue += parseFloat(trade.amount);
      }
    });
    
    assetMetrics[asset] = { avgPrice, pendingValue };
  });

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-medium mb-2">Assets Distribution</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      {/* Asset Metrics Table */}
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-2 text-left">Asset</th>
              <th className="p-2 text-left">Avg. Price</th>
              <th className="p-2 text-left">Pending (USDT)</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(assetMetrics).map(([asset, metrics]) => (
              <tr key={asset} className="border-b">
                <td className="p-2 font-medium">{asset}</td>
                <td className="p-2">${metrics.avgPrice.toFixed(2)}</td>
                <td className="p-2">${metrics.pendingValue.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AssetDistribution;