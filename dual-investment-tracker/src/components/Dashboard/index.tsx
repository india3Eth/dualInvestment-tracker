import React from 'react';
import { Stats, FileHistoryEntry, Trade } from '../../types';
import TradeSummary from './TradeSummary';
import AssetDistribution from './AssetDistribution';
import DirectionDistribution from './DirectionDistribution';
import RecentUploads from './RecentUploads';
import PerformanceMetrics from './PerformanceMetrics';


interface DashboardProps {
  stats: Stats;
  fileHistory: FileHistoryEntry[];
  investmentData: Trade[];
}

const Dashboard: React.FC<DashboardProps> = ({ stats, fileHistory, investmentData }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <TradeSummary stats={stats} />
      <AssetDistribution 
            byAssetType={stats.byAssetType} 
            investmentData={investmentData}
       />
      <DirectionDistribution byDirection={stats.byDirection} />
      <PerformanceMetrics stats={stats} />
      <RecentUploads fileHistory={fileHistory} />
    </div>
  );
};

export default Dashboard;