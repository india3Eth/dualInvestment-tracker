import React, { useState, useEffect } from 'react';
import { Trade } from '../../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DollarSign, Percent, Calendar } from 'lucide-react';

interface AssetReturnsTrackerProps {
  investmentData: Trade[];
}

interface AssetReturn {
  asset: string;
  totalReturn: number;
  totalInvested: number;
  returnRate: number;
  completedTrades: number;
  winRate: number;
  averageDuration: number;
}

const AssetReturnsTracker: React.FC<AssetReturnsTrackerProps> = ({ investmentData }) => {
  const [assetReturns, setAssetReturns] = useState<AssetReturn[]>([]);
  const [timeframe, setTimeframe] = useState<'all' | 'month' | 'quarter' | 'year'>('all');
  const [sortBy, setSortBy] = useState<'returnRate' | 'totalReturn'>('returnRate');
  
  // Calculate asset returns
  useEffect(() => {
    if (!investmentData.length) return;
    
    // Filter by timeframe if needed
    let filteredData = [...investmentData];
    if (timeframe !== 'all') {
      const now = Date.now();
      const timeRanges: Record<string, number> = {
        'month': 30 * 24 * 60 * 60 * 1000,
        'quarter': 90 * 24 * 60 * 60 * 1000,
        'year': 365 * 24 * 60 * 60 * 1000
      };
      
      filteredData = filteredData.filter(trade => {
        const purchaseTime = parseInt(trade.puchaseTime);
        return now - purchaseTime <= timeRanges[timeframe];
      });
    }
    
    // Get only settled trades
    const settledTrades = filteredData.filter(trade => trade.status === 'SETTLED');
    
    // Group by underlying asset
    const assetGroups: Record<string, Trade[]> = {};
    settledTrades.forEach(trade => {
      if (!assetGroups[trade.underlying]) {
        assetGroups[trade.underlying] = [];
      }
      assetGroups[trade.underlying].push(trade);
    });
    
    // Calculate returns for each asset
    const returns: AssetReturn[] = [];
    
    Object.entries(assetGroups).forEach(([asset, trades]) => {
      let totalReturn = 0;
      let totalInvested = 0;
      let winCount = 0;
      let totalDuration = 0;
      
      trades.forEach(trade => {
        const amount = parseFloat(trade.amount);
        const earningRate = parseFloat(trade.earningRate);
        const settlePrice = parseFloat(trade.settlePrice || '0');
        const targetPrice = parseFloat(trade.linkedPrice);
        
        // Convert to USD equivalent
        let investmentUSD = 0;
        if (trade.investmentAsset === 'USDT' || trade.investmentAsset === 'USDC') {
          investmentUSD = amount;
        } else {
          investmentUSD = amount * targetPrice;
        }
        
        totalInvested += investmentUSD;
        
        // Calculate duration in days
        const purchaseTime = new Date(parseInt(trade.puchaseTime));
        const settleTime = new Date(parseInt(trade.projectSettleDateTime));
        const durationDays = (settleTime.getTime() - purchaseTime.getTime()) / (1000 * 60 * 60 * 24);
        totalDuration += durationDays;
        
        // Calculate return
        const actualReturnRate = (earningRate / 100) * (durationDays / 365);
        const returnAmount = amount * actualReturnRate;
        
        // Convert return to USD
        let returnUSD = 0;
        if (trade.investmentAsset === 'USDT' || trade.investmentAsset === 'USDC') {
          returnUSD = returnAmount;
        } else {
          returnUSD = returnAmount * targetPrice;
        }
        
        totalReturn += returnUSD;
        
        // Check if trade was a win (target price reached)
        const targetReached = (trade.type === 'UP' && settlePrice >= targetPrice) || 
                              (trade.type === 'DOWN' && settlePrice <= targetPrice);
        if (targetReached) {
          winCount++;
        }
      });
      
      const returnRate = (totalReturn / totalInvested) * 100;
      const winRate = (winCount / trades.length) * 100;
      const averageDuration = totalDuration / trades.length;
      
      returns.push({
        asset,
        totalReturn,
        totalInvested,
        returnRate,
        completedTrades: trades.length,
        winRate,
        averageDuration
      });
    });
    
    // Sort by chosen criterion
    returns.sort((a, b) => {
      if (sortBy === 'returnRate') {
        return b.returnRate - a.returnRate;
      } else {
        return b.totalReturn - a.totalReturn;
      }
    });
    
    setAssetReturns(returns);
  }, [investmentData, timeframe, sortBy]);
  
  // Prepare chart data
  const chartData = assetReturns.map(ret => ({
    asset: ret.asset,
    returnRate: parseFloat(ret.returnRate.toFixed(2)),
    totalReturn: parseFloat(ret.totalReturn.toFixed(2))
  }));
  
  // Calculate overall totals
  const overallInvestment = assetReturns.reduce((sum, item) => sum + item.totalInvested, 0);
  const overallReturn = assetReturns.reduce((sum, item) => sum + item.totalReturn, 0);
  const overallReturnRate = overallInvestment > 0 ? (overallReturn / overallInvestment) * 100 : 0;
  const totalCompletedTrades = assetReturns.reduce((sum, item) => sum + item.completedTrades, 0);
  
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium">Asset Returns Tracker</h2>
        <div className="flex space-x-2">
          <select 
            value={timeframe} 
            onChange={(e) => setTimeframe(e.target.value as any)}
            className="border rounded p-1 text-sm"
          >
            <option value="all">All Time</option>
            <option value="month">Last Month</option>
            <option value="quarter">Last Quarter</option>
            <option value="year">Last Year</option>
          </select>
          
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value as any)}
            className="border rounded p-1 text-sm"
          >
            <option value="returnRate">Sort by Return %</option>
            <option value="totalReturn">Sort by Total Return $</option>
          </select>
        </div>
      </div>
      
      {/* Overall Return Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg flex items-center">
          <div className="bg-blue-100 p-3 rounded-full mr-3">
            <DollarSign className="text-blue-700" size={24} />
          </div>
          <div>
            <div className="text-sm text-blue-700">Total Return</div>
            <div className="text-xl font-bold">${overallReturn.toFixed(2)}</div>
          </div>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg flex items-center">
          <div className="bg-green-100 p-3 rounded-full mr-3">
            <Percent className="text-green-700" size={24} />
          </div>
          <div>
            <div className="text-sm text-green-700">Average Return Rate</div>
            <div className="text-xl font-bold">{overallReturnRate.toFixed(2)}%</div>
          </div>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-lg flex items-center">
          <div className="bg-purple-100 p-3 rounded-full mr-3">
            <Calendar className="text-purple-700" size={24} />
          </div>
          <div>
            <div className="text-sm text-purple-700">Completed Trades</div>
            <div className="text-xl font-bold">{totalCompletedTrades}</div>
          </div>
        </div>
      </div>
      
      {/* Chart Section */}
      {chartData.length > 0 ? (
        <div className="mb-6">
          <h3 className="text-md font-medium mb-2">Returns by Asset</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="asset" />
                <YAxis yAxisId="left" orientation="left" label={{ value: 'Return Rate (%)', angle: -90, position: 'insideLeft' }} />
                <YAxis yAxisId="right" orientation="right" label={{ value: 'Total Return ($)', angle: 90, position: 'insideRight' }} />
                <Tooltip formatter={(value, name) => [
                  name === 'returnRate' ? `${value}%` : `$${value}`,
                  name === 'returnRate' ? 'Return Rate' : 'Total Return'
                ]} />
                <Legend />
                <Bar yAxisId="left" dataKey="returnRate" name="Return Rate (%)" fill="#8884d8" />
                <Bar yAxisId="right" dataKey="totalReturn" name="Total Return ($)" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          No return data available. Complete some trades first.
        </div>
      )}
      
      {/* Returns Table */}
      {assetReturns.length > 0 && (
        <div>
          <h3 className="text-md font-medium mb-2">Detailed Returns by Asset</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-2 text-left">Asset</th>
                  <th className="p-2 text-right">Return Rate</th>
                  <th className="p-2 text-right">Total Return</th>
                  <th className="p-2 text-right">Total Invested</th>
                  <th className="p-2 text-right">Win Rate</th>
                  <th className="p-2 text-right">Avg. Duration</th>
                  <th className="p-2 text-center">Trades</th>
                </tr>
              </thead>
              <tbody>
                {assetReturns.map((ret) => (
                  <tr key={ret.asset} className="border-b hover:bg-gray-50">
                    <td className="p-2 font-medium">{ret.asset}</td>
                    <td className="p-2 text-right">
                      <span className={ret.returnRate >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {ret.returnRate.toFixed(2)}%
                      </span>
                    </td>
                    <td className="p-2 text-right">${ret.totalReturn.toFixed(2)}</td>
                    <td className="p-2 text-right">${ret.totalInvested.toFixed(2)}</td>
                    <td className="p-2 text-right">{ret.winRate.toFixed(1)}%</td>
                    <td className="p-2 text-right">{ret.averageDuration.toFixed(1)} days</td>
                    <td className="p-2 text-center">{ret.completedTrades}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetReturnsTracker;