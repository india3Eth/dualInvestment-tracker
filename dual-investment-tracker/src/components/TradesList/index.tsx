import React from 'react';
import { Trade, FilterOptions, Stats } from '../../types';
import { formatDate } from '../../utils/dataProcessing';
import { ArrowUp, ArrowDown } from 'lucide-react';
import Filters from './Filters';

interface TradesListProps {
  filteredData: Trade[];
  filters: FilterOptions;
  onFilterChange: (filterType: keyof FilterOptions, value: string) => void;
  stats: Stats;
}

const TradesList: React.FC<TradesListProps> = ({ 
  filteredData, 
  filters, 
  onFilterChange,
  stats
}) => {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-4 flex justify-between items-center">
        <h3 className="text-lg font-medium">All Trades</h3>
        <Filters 
          filters={filters} 
          onFilterChange={onFilterChange} 
          assetOptions={Object.keys(stats.byAssetType)}
        />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full table-auto">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-left">Asset</th>
              <th className="p-3 text-left">Type</th>
              <th className="p-3 text-left">Amount</th>
              <th className="p-3 text-left">Target Price</th>
              <th className="p-3 text-left">APY</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Settle Price</th>
              <th className="p-3 text-left">Outcome</th>
              <th className="p-3 text-left">Return</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map(trade => {
              // Determine if trade was a win/loss based on Binance Dual Investment rules
              let outcome = 'Pending';
              let outcomeColor = 'text-gray-500';
              let returnValue = '-';
              
              if (trade.status === 'SETTLED') {
                const settlePrice = parseFloat(trade.settlePrice || '0');
                const targetPrice = parseFloat(trade.linkedPrice);
                
                // For "Sell High" (UP), target price reached means you sell at target price
                // For "Buy Low" (DOWN), target price reached means you buy at target price
                if (trade.type === 'UP') {
                  outcome = settlePrice >= targetPrice ? 
                    `Sold ${trade.underlying} at ${targetPrice}` : 
                    `Kept ${trade.underlying}`;
                } else {
                  outcome = settlePrice <= targetPrice ? 
                    `Bought ${trade.underlying} at ${targetPrice}` : 
                    `Kept ${trade.investmentAsset}`;
                }
                
                outcomeColor = 
                  (trade.type === 'UP' && settlePrice >= targetPrice) || 
                  (trade.type === 'DOWN' && settlePrice <= targetPrice) 
                    ? 'text-green-600' 
                    : 'text-blue-600';
                
                // Calculate actual return
                const amount = parseFloat(trade.amount);
                const earningRate = parseFloat(trade.earningRate);
                // const targetPrice = parseFloat(trade.linkedPrice);
                
                // Get duration in days
                const purchaseTime = new Date(parseInt(trade.puchaseTime));
                const settleTime = new Date(parseInt(trade.projectSettleDateTime));
                const durationDays = (settleTime.getTime() - purchaseTime.getTime()) / (1000 * 60 * 60 * 24);
                
                // APY to actual return for period (as a decimal)
                const actualReturnRate = (earningRate / 100) * (durationDays / 365);
                const returnAmountInInvestmentAsset = amount * actualReturnRate;
                
                // Format the display value based on whether target price was reached
                // const settlePrice = parseFloat(trade.settlePrice || '0');
                const targetReached = (trade.type === 'UP' && settlePrice >= targetPrice) || 
                                      (trade.type === 'DOWN' && settlePrice <= targetPrice);
                
                if (targetReached) {
                  if (trade.type === 'DOWN') {
                    // For Buy Low with target reached, return is in the target asset (e.g., SOL)
                    const baseAssetAmount = amount / targetPrice; // Base amount at target price
                    const interestAssetAmount = returnAmountInInvestmentAsset / targetPrice; // Interest in asset
                    
                    returnValue = `${(actualReturnRate * 100).toFixed(4)}% (${interestAssetAmount.toFixed(8)} ${trade.underlying})`;
                  } else {
                    // For Sell High with target reached, return is in USDT/USDC
                    returnValue = `${(actualReturnRate * 100).toFixed(4)}% (${returnAmountInInvestmentAsset.toFixed(2)})`;
                  }
                } else {
                  // When target not reached, return is in the original investment asset
                  if (trade.investmentAsset === 'USDT' || trade.investmentAsset === 'USDC') {
                    returnValue = `${(actualReturnRate * 100).toFixed(4)}% (${returnAmountInInvestmentAsset.toFixed(2)})`;
                  } else {
                    returnValue = `${(actualReturnRate * 100).toFixed(4)}% (${returnAmountInInvestmentAsset.toFixed(8)} ${trade.investmentAsset})`;
                  }
                }
              }
              
              return (
                <tr key={trade.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">{formatDate(trade.puchaseTime)}</td>
                  <td className="p-3">{trade.underlying}</td>
                  <td className="p-3">
                    <span className={`inline-flex items-center ${trade.type === 'UP' ? 'text-green-600' : 'text-red-600'}`}>
                      {trade.type === 'UP' ? 
                        <>
                          <ArrowUp size={16} className="mr-1" /> Sell High
                        </> : 
                        <>
                          <ArrowDown size={16} className="mr-1" /> Buy Low
                        </>
                      }
                    </span>
                  </td>
                  <td className="p-3">
                    {trade.amount} {trade.investmentAsset}
                  </td>
                  <td className="p-3">${parseFloat(trade.linkedPrice).toLocaleString()}</td>
                  <td className="p-3">{trade.earningRate}%</td>
                  <td className="p-3">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                      trade.status === 'SETTLED' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {trade.status === 'SETTLED' ? 'Settled' : 'Active'}
                    </span>
                  </td>
                  <td className="p-3">
                    {trade.settlePrice ? `$${parseFloat(trade.settlePrice).toLocaleString()}` : '-'}
                  </td>
                  <td className={`p-3 font-medium ${outcomeColor}`}>
                    {outcome}
                  </td>
                  <td className="p-3">
                    {returnValue}
                  </td>
                </tr>
              );
            })}
            {filteredData.length === 0 && (
              <tr>
                <td colSpan={10} className="p-4 text-center text-gray-500">
                  No trades found matching the current filters
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TradesList;