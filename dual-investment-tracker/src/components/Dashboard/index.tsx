import React, { useState } from 'react';
import { Stats, FileHistoryEntry, Trade } from '../../types';
import TradeSummary from './TradeSummary';
import AssetDistribution from './AssetDistribution';
import DirectionDistribution from './DirectionDistribution';
import RecentUploads from './RecentUploads';
import PerformanceMetrics from './PerformanceMetrics';
import AssetAcquisitionTracker from './AssetAcquisitionTracker';
import AssetReturnsTracker from './AssetReturnsTracker';

interface DashboardProps {
  stats: Stats;
  fileHistory: FileHistoryEntry[];
  investmentData: Trade[];
}

const Dashboard: React.FC<DashboardProps> = ({ stats, fileHistory, investmentData }) => {
  const [activeView, setActiveView] = useState<'summary' | 'acquisition' | 'returns'>('summary');

  return (
    <div>
      {/* Dashboard Toggle */}
      <div className="flex border-b mb-6">
        <button 
          className={`py-2 px-4 font-medium ${activeView === 'summary' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveView('summary')}
        >
          Performance Summary
        </button>
        <button 
          className={`py-2 px-4 font-medium ${activeView === 'acquisition' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveView('acquisition')}
        >
          Asset Acquisition
        </button>
        <button 
          className={`py-2 px-4 font-medium ${activeView === 'returns' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveView('returns')}
        >
          Asset Returns
        </button>
      </div>

      {/* Summary View */}
      {activeView === 'summary' && (
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
      )}

      {/* Asset Acquisition View */}
      {activeView === 'acquisition' && (
        <AssetAcquisitionTracker investmentData={investmentData} />
      )}
      
      {/* Asset Returns View */}
      {activeView === 'returns' && (
        <AssetReturnsTracker investmentData={investmentData} />
      )}
    </div>
  );
};

export default Dashboard;