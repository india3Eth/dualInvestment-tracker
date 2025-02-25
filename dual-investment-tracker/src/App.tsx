import React, { useState, useEffect } from 'react';
import { Trade, Stats, FilterOptions, FileHistoryEntry } from './types';
import { calculateStats, applyFilters } from './utils/dataProcessing';
import _ from 'lodash';
import InputSection from './components/InputSection';
import Dashboard from './components/Dashboard';
import TradesList from './components/TradesList';
import Header from './components/Header';
import DualInvestmentExplainer from './components/DualInvestmentExplainer';


const App: React.FC = () => {
  const [investmentData, setInvestmentData] = useState<Trade[]>([]);
  const [filteredData, setFilteredData] = useState<Trade[]>([]);
  const [fileHistory, setFileHistory] = useState<FileHistoryEntry[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalTrades: 0,
    winningTrades: 0,
    losingTrades: 0,
    averageReturn: 0,
    totalInvestment: 0,
    activeInvestment: 0,
    byAssetType: {},
    byDirection: {}
  });
  const [filters, setFilters] = useState<FilterOptions>({
    dateRange: 'all',
    assetType: 'all',
    direction: 'all',
    status: 'all'
  });
  const [activeTab, setActiveTab] = useState<'dashboard' | 'trades'>('dashboard');

  // Handle data submission from input section
  const handleDataSubmit = (data: Trade[]) => {
    // Add this submission to history
    const newFileEntry: FileHistoryEntry = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      recordCount: data.length
    };
    setFileHistory(prev => [newFileEntry, ...prev]);

    // Combine with existing data (avoiding duplicates by ID)
    const combinedData = _.uniqBy([...data, ...investmentData], 'id');
    setInvestmentData(combinedData);
  };

  // Handle filter changes
  const handleFilterChange = (filterType: keyof FilterOptions, value: string) => {
    const newFilters = { ...filters, [filterType]: value };
    setFilters(newFilters);
  };

  // Update stats and filtered data when investment data changes
  useEffect(() => {
    if (investmentData.length) {
      setStats(calculateStats(investmentData));
      setFilteredData(applyFilters(investmentData, filters));
    }
  }, [investmentData]);

  // Update filtered data when filters change
  useEffect(() => {
    if (investmentData.length) {
      setFilteredData(applyFilters(investmentData, filters));
    }
  }, [filters]);

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <InputSection onDataSubmit={handleDataSubmit} />
        
        {/* Add the DualInvestmentExplainer component */}
        <DualInvestmentExplainer />
        
        {/* Tabs Navigation */}
        <div className="flex border-b mb-6">
          <button 
            className={`py-2 px-4 font-medium ${activeTab === 'dashboard' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('dashboard')}
          >
            Dashboard
          </button>
          <button 
            className={`py-2 px-4 font-medium ${activeTab === 'trades' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('trades')}
          >
            Trades
          </button>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'dashboard' ? (
          <Dashboard stats={stats} fileHistory={fileHistory} investmentData={investmentData}/>
        ) : (
          <TradesList 
            filteredData={filteredData} 
            filters={filters} 
            onFilterChange={handleFilterChange}
            stats={stats}
          />
        )}
      </main>
    </div>
  );
};

export default App;