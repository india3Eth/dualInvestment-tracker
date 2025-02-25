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
  const activeTrades = data.filter(trade => trade.status === 'PURCHASE_SUCCESS');
  
  // Calculate wins/losses based on Binance Dual Investment rules
  const winningTrades = settledTrades.filter(trade => {
    const settlePrice = parseFloat(trade.settlePrice || '0');
    const targetPrice = parseFloat(trade.linkedPrice);
    
    // For "Sell High" (UP), you win when settlement price is >= target price
    // For "Buy Low" (DOWN), you win when settlement price is <= target price
    if (trade.type === 'UP') {
      return settlePrice >= targetPrice;
    } else if (trade.type === 'DOWN') {
      return settlePrice <= targetPrice;
    }
    return false;
  });
  
  // Calculate returns
  let totalReturn = 0;
  let totalSettledInvestment = 0;
  
  settledTrades.forEach(trade => {
    const amount = parseFloat(trade.amount);
    const earningRate = parseFloat(trade.earningRate);
    
    // Convert to USD equivalent for consistent measurement
    let usdValue = 0;
    if (trade.investmentAsset === 'USDT' || trade.investmentAsset === 'USDC') {
      usdValue = amount;
    } else {
      // For crypto assets, convert to USD based on the target price
      usdValue = amount * parseFloat(trade.linkedPrice);
    }
    
    totalSettledInvestment += usdValue;
    
                  // Calculate actual return (Dual Investment always pays the APY regardless of outcome)
    const durationInDays = calculateDurationInDays(trade);
    const annualizedReturn = earningRate;
    
    // APY is always applied on the investment amount, not the USD value
    const actualReturn = (annualizedReturn / 100) * (durationInDays / 365);
    const returnAmount = amount * actualReturn;
    
    // Convert return to USD for statistics
    if (trade.investmentAsset === 'USDT' || trade.investmentAsset === 'USDC') {
      totalReturn += returnAmount;
    } else {
      totalReturn += returnAmount * parseFloat(trade.linkedPrice);
    }
  });
  
  const averageReturn = settledTrades.length 
    ? (totalReturn / totalSettledInvestment) * 100 
    : 0;
  
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
    
    // Count by asset type (underlying asset)
    if (!byAssetType[trade.underlying]) {
      byAssetType[trade.underlying] = 0;
    }
    byAssetType[trade.underlying] += usdValue;
    
    // Count by direction
    byDirection[trade.type] += usdValue;
  });
  
  // Calculate active investment amount
  const activeInvestment = activeTrades.reduce((sum, trade) => {
    const amount = parseFloat(trade.amount);
    
    // Convert to USD equivalent
    let usdValue = 0;
    if (trade.investmentAsset === 'USDT' || trade.investmentAsset === 'USDC') {
      usdValue = amount;
    } else {
      usdValue = amount * parseFloat(trade.linkedPrice);
    }
    
    return sum + usdValue;
  }, 0);
  
  return {
    totalTrades: data.length,
    winningTrades: winningTrades.length,
    losingTrades: settledTrades.length - winningTrades.length,
    averageReturn,
    totalInvestment,
    activeInvestment,
    byAssetType,
    byDirection
  };
};

// Helper function to calculate duration in days between purchase and settlement
const calculateDurationInDays = (trade: Trade): number => {
  if (!trade.puchaseTime || !trade.projectSettleDateTime) {
    return 0;
  }
  
  const purchaseTime = new Date(parseInt(trade.puchaseTime));
  const settleTime = new Date(parseInt(trade.projectSettleDateTime));
  
  const durationMs = settleTime.getTime() - purchaseTime.getTime();
  return durationMs / (1000 * 60 * 60 * 24); // Convert ms to days
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
    result = result.filter(item => {
      if (filters.status === 'PURCHASE_SUCCESS') {
        return item.status === 'PURCHASE_SUCCESS';
      } else if (filters.status === 'SETTLED') {
        return item.status === 'SETTLED';
      }
      return true;
    });
  }
  
  return result;
};

export const formatDate = (timestamp: string): string => {
  if (!timestamp) return 'N/A';
  return new Date(parseInt(timestamp)).toLocaleDateString();
};