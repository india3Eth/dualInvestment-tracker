import React, { useState, useEffect } from 'react';
import { Trade } from '../../types';
import { ArrowUp, ArrowDown, Filter } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';

interface AssetAcquisitionProps {
  investmentData: Trade[];
}

interface AssetSummary {
  asset: string;
  totalQuantity: number;
  totalInvested: number;
  averagePrice: number;
  currentValue: number;
  roi: number;
  buyLowCount: number;
  sellHighCount: number;
  trades: Trade[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const AssetAcquisitionTracker: React.FC<AssetAcquisitionProps> = ({ investmentData }) => {
  const [assetSummaries, setAssetSummaries] = useState<AssetSummary[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState<'all' | 'month' | 'quarter' | 'year'>('all');
  
  // Calculate asset acquisition data
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
    
    // Group by underlying asset
    const assetGroups: Record<string, Trade[]> = {};
    filteredData.forEach(trade => {
      if (!assetGroups[trade.underlying]) {
        assetGroups[trade.underlying] = [];
      }
      assetGroups[trade.underlying].push(trade);
    });
    
    // Calculate stats for each asset
    const summaries: AssetSummary[] = [];
    
    Object.entries(assetGroups).forEach(([asset, trades]) => {
      let totalQuantity = 0;
      let totalInvested = 0;
      let buyLowCount = 0;
      let sellHighCount = 0;
      
      // Get all completed acquisitions (DOWN type with target reached)
      const acquisitions = trades.filter(trade => {
        if (trade.status !== 'SETTLED') return false;
        
        const settlePrice = parseFloat(trade.settlePrice || '0');
        const targetPrice = parseFloat(trade.linkedPrice);
        
        // For DOWN type, we acquire the asset when price is <= target
        return trade.type === 'DOWN' && settlePrice <= targetPrice;
      });
      
      // Get all completed sales (UP type with target reached)
      const sales = trades.filter(trade => {
        if (trade.status !== 'SETTLED') return false;
        
        const settlePrice = parseFloat(trade.settlePrice || '0');
        const targetPrice = parseFloat(trade.linkedPrice);
        
        // For UP type, we sell the asset when price is >= target
        return trade.type === 'UP' && settlePrice >= targetPrice;
      });
      
      // Calculate for acquisitions
      acquisitions.forEach(trade => {
        const amount = parseFloat(trade.amount);
        const targetPrice = parseFloat(trade.linkedPrice);
        const quantity = amount / targetPrice;
        
        totalQuantity += quantity;
        totalInvested += amount;
        buyLowCount++;
      });
      
      // Adjust for sales
      sales.forEach(trade => {
        const targetPrice = parseFloat(trade.linkedPrice);
        const amount = parseFloat(trade.amount);
        
        // If trade amount is in crypto units rather than USDT
        if (trade.investmentAsset === asset) {
          totalQuantity -= amount;
          totalInvested -= amount * targetPrice;
        }
        
        sellHighCount++;
      });
      
      // Only include assets we've actually acquired
      if (totalQuantity > 0) {
        const averagePrice = totalInvested / totalQuantity;
        
        // Simple ROI calculation (can be enhanced with real-time price data)
        // Here we assume a hypothetical current market price 5% above average
        const estimatedCurrentPrice = averagePrice * 1.05;
        const currentValue = totalQuantity * estimatedCurrentPrice;
        const roi = ((currentValue - totalInvested) / totalInvested) * 100;
        
        summaries.push({
          asset,
          totalQuantity,
          totalInvested,
          averagePrice,
          currentValue,
          roi,
          buyLowCount,
          sellHighCount,
          trades: trades
        });
      }
    });
    
    // Sort by total invested amount (descending)
    summaries.sort((a, b) => b.totalInvested - a.totalInvested);
    setAssetSummaries(summaries);
    
    // Set selected asset to the one with highest investment if none selected
    if (!selectedAsset && summaries.length > 0) {
      setSelectedAsset(summaries[0].asset);
    }
  }, [investmentData, timeframe]);
  
  // Create acquisition history data for selected asset
  const getAcquisitionHistoryData = () => {
    if (!selectedAsset) return [];
    
    const assetSummary = assetSummaries.find(s => s.asset === selectedAsset);
    if (!assetSummary) return [];
    
    // Get all acquisitions in chronological order
    const acquisitions = assetSummary.trades
      .filter(trade => {
        if (trade.status !== 'SETTLED') return false;
        const settlePrice = parseFloat(trade.settlePrice || '0');
        const targetPrice = parseFloat(trade.linkedPrice);
        return trade.type === 'DOWN' && settlePrice <= targetPrice;
      })
      .sort((a, b) => parseInt(a.puchaseTime) - parseInt(b.puchaseTime));
    
    // Create cumulative acquisition data
    let runningTotal = 0;
    let runningQuantity = 0;
    
    return acquisitions.map(trade => {
      const date = new Date(parseInt(trade.puchaseTime));
      const amount = parseFloat(trade.amount);
      const targetPrice = parseFloat(trade.linkedPrice);
      const quantity = amount / targetPrice;
      
      runningTotal += amount;
      runningQuantity += quantity;
      
      return {
        date: date.toLocaleDateString(),
        timestamp: date.getTime(),
        price: targetPrice,
        quantity,
        cumulative: runningQuantity,
        averagePrice: runningTotal / runningQuantity
      };
    });
  };
  
  // Get acquisition history for chart
  const historyData = getAcquisitionHistoryData();
  
  // Pie chart data for asset distribution
  const pieChartData = assetSummaries.map((summary, index) => ({
    name: summary.asset,
    value: summary.totalInvested,
    color: COLORS[index % COLORS.length]
  }));
  
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium">Asset Acquisition Tracker</h2>
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
        </div>
      </div>
      
      {assetSummaries.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Asset Distribution Chart */}
          <div className="bg-gray-50 p-4 rounded">
            <h3 className="text-md font-medium mb-2">Asset Distribution</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => `$${value.toFixed(2)}`} 
                    labelFormatter={(name) => `${name}`}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Asset Acquisition Summary */}
          <div className="lg:col-span-2">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-2 text-left">Asset</th>
                    <th className="p-2 text-right">Quantity</th>
                    <th className="p-2 text-right">Avg. Price</th>
                    <th className="p-2 text-right">Total Invested</th>
                    <th className="p-2 text-right">Est. Value</th>
                    <th className="p-2 text-right">ROI</th>
                    <th className="p-2 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {assetSummaries.map((summary) => (
                    <tr 
                      key={summary.asset} 
                      className={`border-b hover:bg-gray-50 ${selectedAsset === summary.asset ? 'bg-blue-50' : ''}`}
                    >
                      <td className="p-2 font-medium">{summary.asset}</td>
                      <td className="p-2 text-right">{summary.totalQuantity.toFixed(8)}</td>
                      <td className="p-2 text-right">${summary.averagePrice.toFixed(2)}</td>
                      <td className="p-2 text-right">${summary.totalInvested.toFixed(2)}</td>
                      <td className="p-2 text-right">${summary.currentValue.toFixed(2)}</td>
                      <td className="p-2 text-right">
                        <span className={summary.roi >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {summary.roi.toFixed(2)}%
                        </span>
                      </td>
                      <td className="p-2 text-center">
                        <button 
                          className={`px-2 py-1 rounded text-xs ${
                            selectedAsset === summary.asset 
                              ? 'bg-blue-600 text-white' 
                              : 'bg-gray-200 hover:bg-gray-300'
                          }`}
                          onClick={() => setSelectedAsset(summary.asset)}
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Selected Asset Details */}
          {selectedAsset && (
            <div className="lg:col-span-3 mt-4">
              <div className="bg-gray-50 p-4 rounded">
                <h3 className="text-md font-medium mb-2">
                  {selectedAsset} Acquisition History & Average Price
                </h3>
                
                {historyData.length > 0 ? (
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={historyData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="date" 
                          tickFormatter={(tick) => new Date(tick).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        />
                        <YAxis yAxisId="left" domain={['auto', 'auto']} />
                        <YAxis yAxisId="right" orientation="right" domain={['auto', 'auto']} />
                        <Tooltip />
                        <Legend />
                        <Line 
                          yAxisId="left"
                          type="monotone" 
                          dataKey="price" 
                          name="Purchase Price" 
                          stroke="#8884d8" 
                          dot={{ r: 4 }} 
                        />
                        <Line 
                          yAxisId="left"
                          type="monotone" 
                          dataKey="averagePrice" 
                          name="Running Avg Price" 
                          stroke="#82ca9d" 
                          strokeWidth={2}
                        />
                        <Line 
                          yAxisId="right"
                          type="monotone" 
                          dataKey="cumulative" 
                          name="Total Quantity" 
                          stroke="#ff7300" 
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No acquisition history available for {selectedAsset}
                  </div>
                )}
                
                {/* Stats Summary for Selected Asset */}
                {assetSummaries.find(s => s.asset === selectedAsset) && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    <div className="bg-white p-3 rounded shadow-sm">
                      <div className="text-sm text-gray-500">Total Acquired</div>
                      <div className="text-lg font-semibold">
                        {assetSummaries.find(s => s.asset === selectedAsset)?.totalQuantity.toFixed(8)} {selectedAsset}
                      </div>
                    </div>
                    <div className="bg-white p-3 rounded shadow-sm">
                      <div className="text-sm text-gray-500">Average Price</div>
                      <div className="text-lg font-semibold">
                        ${assetSummaries.find(s => s.asset === selectedAsset)?.averagePrice.toFixed(2)}
                      </div>
                    </div>
                    <div className="bg-white p-3 rounded shadow-sm">
                      <div className="text-sm text-gray-500">Buy Low Trades</div>
                      <div className="text-lg font-semibold flex items-center">
                        <ArrowDown size={16} className="text-red-600 mr-1" />
                        {assetSummaries.find(s => s.asset === selectedAsset)?.buyLowCount}
                      </div>
                    </div>
                    <div className="bg-white p-3 rounded shadow-sm">
                      <div className="text-sm text-gray-500">Sell High Trades</div>
                      <div className="text-lg font-semibold flex items-center">
                        <ArrowUp size={16} className="text-green-600 mr-1" />
                        {assetSummaries.find(s => s.asset === selectedAsset)?.sellHighCount}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          No asset acquisition data available. Complete some "Buy Low" trades first.
        </div>
      )}
    </div>
  );
};

export default AssetAcquisitionTracker;