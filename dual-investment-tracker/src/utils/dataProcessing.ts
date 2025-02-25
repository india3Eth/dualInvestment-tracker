import _ from 'lodash';
import { Trade, Stats, FilterOptions } from '../types';

export const calculateStats = (data: Trade[]): Stats => {
  if (!data.length) {
    return {
      totalTrades: 0,
      winningTrades: 0,
      losingTrades: 0,
      averageReturn: 0,
      totalInvestment: 0,
      byAssetType: {},
      byDirection: {}
    };
  }

  // Get settled trades
  const settledTrades = data.filter(trade => trade.status === 'SETTLED');
  
  // Calculate wins/losses
  const winningTrades = settledTrades.filter(trade => {
    if (trade.type === 'UP') {
      return parseFloat(trade.settlePrice || '0') > parseFloat(trade.linkedPrice);
    } else if (trade.type === 'DOWN') {
      return parseFloat(trade.settlePrice || '0') < parseFloat(trade.linkedPrice);
    }
    return false;
  });
  
  // Calculate average return
  let totalReturn = 0;
  settledTrades.forEach(trade => {
    const amount = parseFloat(trade.amount);
    const earningRate = parseFloat(trade.earningRate);
    totalReturn += (amount * earningRate) / 100;
  });
  
  const averageReturn = settledTrades.length ? totalReturn / settledTrades.length : 0;
  
  // Total investment by asset
  const byAssetType: Record<string, number> = {};
  const byDirection: Record<string, number> = { UP: 0, DOWN: 0 };
  
  let totalInvestment = 0;
  
  data.forEach(trade => {
    const amount = parseFloat(trade.amount);
    
    // Convert to USD equivalent for consistent measurement
    let usdValue = 0;
    if (trade.investmentAsset === 'USDT' || trade.investmentAsset === 'USDC') {
      usdValue = amount;
    } else {
      usdValue = amount * parseFloat(trade.linkedPrice);
    }
    
    totalInvestment += usdValue;
    
    // Count by asset type
    if (!byAssetType[trade.underlying]) {
      byAssetType[trade.underlying] = 0;
    }
    byAssetType[trade.underlying] += usdValue;
    
    // Count by direction
    byDirection[trade.type] += usdValue;
  });
  
  return {
    totalTrades: data.length,
    winningTrades: winningTrades.length,
    losingTrades: settledTrades.length - winningTrades.length,
    averageReturn,
    totalInvestment,
    byAssetType,
    byDirection
  };
};

export const applyFilters = (data: Trade[], filters: FilterOptions): Trade[] => {
  let result = [...data];
  
  // Filter by date range
  if (filters.dateRange !== 'all') {
    const now = Date.now();
    const timeRanges: Record<string, number> = {
      'week': 7 * 24 * 60 * 60 * 1000,
      'month': 30 * 24 * 60 * 60 * 1000,
      'quarter': 90 * 24 * 60 * 60 * 1000
    };
    
    result = result.filter(item => {
      const purchaseTime = parseInt(item.puchaseTime);
      return now - purchaseTime <= timeRanges[filters.dateRange];
    });
  }
  
  // Filter by asset type
  if (filters.assetType !== 'all') {
    result = result.filter(item => item.underlying === filters.assetType);
  }
  
  // Filter by direction
  if (filters.direction !== 'all') {
    result = result.filter(item => item.type === filters.direction);
  }
  
  // Filter by status
  if (filters.status !== 'all') {
    result = result.filter(item => item.status === filters.status);
  }
  
  return result;
};

export const formatDate = (timestamp: string): string => {
  if (!timestamp) return 'N/A';
  return new Date(parseInt(timestamp)).toLocaleDateString();
};