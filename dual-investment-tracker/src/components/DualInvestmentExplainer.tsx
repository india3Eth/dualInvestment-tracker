import React, { useState } from 'react';
import { ArrowUp, ArrowDown, Info, X } from 'lucide-react';

const DualInvestmentExplainer: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mb-6 relative">
      {!isOpen ? (
        <button 
          onClick={() => setIsOpen(true)}
          className="flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          <Info size={16} className="mr-1" /> How does Dual Investment work?
        </button>
      ) : (
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-medium">Understanding Binance Dual Investment</h3>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="border rounded-lg p-4">
              <div className="flex items-center mb-2 text-green-600 font-medium">
                <ArrowUp size={18} className="mr-1" /> Sell High
              </div>
              <p className="text-sm mb-2">
                Sell High gives you a chance to sell your cryptocurrency at a target price (higher than current price)
                on a future date while earning rewards regardless of the market direction.
              </p>
              <div className="bg-gray-50 p-3 rounded text-sm mb-2">
                <div className="font-medium">Scenario 1: Target Price is reached</div>
                <p className="text-xs">
                  If the settlement price ≥ the Target Price, you will sell your crypto, including the 
                  subscription amount and rewards, at your desired high price.
                </p>
              </div>
              <div className="bg-gray-50 p-3 rounded text-sm">
                <div className="font-medium">Scenario 2: Target Price is not reached</div>
                <p className="text-xs">
                  If the settlement price ≤ the Target Price, you won't sell your crypto and will 
                  receive your subscription amount plus rewards in the same cryptocurrency.
                </p>
              </div>
            </div>
            
            <div className="border rounded-lg p-4">
              <div className="flex items-center mb-2 text-red-600 font-medium">
                <ArrowDown size={18} className="mr-1" /> Buy Low
              </div>
              <p className="text-sm mb-2">
                Buy Low gives you a chance to buy cryptocurrency at a target price (lower than current price)
                on a future date while earning rewards regardless of the market direction.
              </p>
              <div className="bg-gray-50 p-3 rounded text-sm mb-2">
                <div className="font-medium">Scenario 1: Target Price is reached</div>
                <p className="text-xs">
                  If the settlement price ≤ the Target Price, you will buy the crypto at your desired low price
                  using your subscription amount plus rewards.
                </p>
              </div>
              <div className="bg-gray-50 p-3 rounded text-sm">
                <div className="font-medium">Scenario 2: Target Price is not reached</div>
                <p className="text-xs">
                  If the settlement price ≥ the Target Price, you won't buy the crypto and will
                  receive your subscription amount plus rewards in your investment currency (often USDT).
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 rounded text-sm">
            <p className="font-medium">Important Note:</p>
            <p>The key benefit of Dual Investment is that you earn the stated APY rewards regardless of whether 
            the target price is reached or not. Your profit/loss depends on both the earned rewards and 
            the price movement of the underlying asset.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DualInvestmentExplainer;