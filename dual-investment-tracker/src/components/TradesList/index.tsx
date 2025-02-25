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
              <th className="p-3 text-left">Direction</th>
              <th className="p-3 text-left">Amount</th>
              <th className="p-3 text-left">Target Price</th>
              <th className="p-3 text-left">Earning Rate</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Settle Price</th>
              <th className="p-3 text-left">Result</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map(trade => {
              // Determine if trade was a win/loss
              let result = 'Pending';
              let resultColor = 'text-gray-500';
              
              if (trade.status === 'SETTLED') {
                if (trade.type === 'UP') {
                  result = parseFloat(trade.settlePrice || '0') > parseFloat(trade.linkedPrice) ? 'Win' : 'Loss';
                } else {
                  result = parseFloat(trade.settlePrice || '0') < parseFloat(trade.linkedPrice) ? 'Win' : 'Loss';
                }
                resultColor = result === 'Win' ? 'text-green-600' : 'text-red-600';
              }
              
              return (
                <tr key={trade.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">{formatDate(trade.puchaseTime)}</td>
                  <td className="p-3">{trade.underlying}</td>
                  <td className="p-3">
                    <span className={`inline-flex items-center ${trade.type === 'UP' ? 'text-green-600' : 'text-red-600'}`}>
                      {trade.type === 'UP' ? <ArrowUp size={16} className="mr-1" /> : <ArrowDown size={16} className="mr-1" />}
                      {trade.type}
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
                  <td className={`p-3 font-medium ${resultColor}`}>
                    {result}
                  </td>
                </tr>
              );
            })}
            {filteredData.length === 0 && (
              <tr>
                <td colSpan={9} className="p-4 text-center text-gray-500">
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