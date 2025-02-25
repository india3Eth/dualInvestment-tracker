export interface Trade {
    id: string;
    projectId: string;
    userId: string;
    investmentAsset: string;
    linkedPrice: string;
    duration: string | null;
    earningRate: string;
    amount: string;
    status: string;
    projectStatus: string;
    puchaseTime: string;
    settleDate: string;
    projectSettleDateTime: string;
    settleAsset: string | null;
    settleAmount: string;
    settlePrice: string | null;
    queryType: string;
    underlying: string;
    type: string;
    targetAsset: string;
    displayStatus: string;
  }
  
  export interface JsonData {
    code: string;
    message: string | null;
    messageDetail: string | null;
    data: Trade[];
    total: number;
    success: boolean;
  }
  
  export interface Stats {
    totalTrades: number;
    winningTrades: number;
    losingTrades: number;
    averageReturn: number;
    totalInvestment: number;
    activeInvestment?: number; // Added this field for active investments
    byAssetType: Record<string, number>;
    byDirection: Record<string, number>;
  }
  
  export interface FilterOptions {
    dateRange: string;
    assetType: string;
    direction: string;
    status: string;
  }
  
  export interface FileHistoryEntry {
    id: number;
    timestamp: string;
    recordCount: number;
  }