import React from 'react';
import { CryptoAsset, FiatCurrency } from '../types/crypto';
import { formatCompactNumber } from '../utils/formatters';
import { TrendingUp } from 'lucide-react';

interface MarketOverviewProps {
  assets: CryptoAsset[];
  currency: FiatCurrency;
}

export function MarketOverview({ assets, currency }: MarketOverviewProps) {
  const totalVolume = assets.reduce((acc, curr) => acc + (curr.volume24h || 0), 0);
  const sortedByGain = [...assets].sort((a, b) => (b.priceChange24h || 0) - (a.priceChange24h || 0));
  const topGainer = sortedByGain.length > 0 ? sortedByGain[0] : null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      
      {/* 1. 市值指標 */}
      <div className="bg-dark-900 border border-slate-800 rounded-xl p-4">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>加密貨幣全球總市值</span>
          <span className="text-cmc-green text-[11px] font-semibold flex items-center">
            <TrendingUp className="w-3 h-3 mr-0.5" /> +2.4%
          </span>
        </div>
        <div className="mt-2 text-xl font-bold text-white tabular-nums">
          $2.84T
        </div>
        <div className="mt-1 text-[11px] text-slate-500">
          過去 24 小時全網估值
        </div>
      </div>

      {/* 2. 24h 交易量 */}
      <div className="bg-dark-900 border border-slate-800 rounded-xl p-4">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>24 小時總交易量</span>
          <span className="text-slate-400 text-[11px]">即時累計</span>
        </div>
        <div className="mt-2 text-xl font-bold text-white tabular-nums">
          {formatCompactNumber(totalVolume, currency)}
        </div>
        <div className="mt-1 text-[11px] text-slate-500">
          Binance 現貨市場串流
        </div>
      </div>

      {/* 3. 恐懼與貪婪指數 */}
      <div className="bg-dark-900 border border-slate-800 rounded-xl p-4">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>市場情緒 (Fear & Greed)</span>
          <span className="text-cmc-green text-[11px] font-semibold">貪婪</span>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-xl font-bold text-white tabular-nums">74</span>
          <span className="text-xs text-slate-400">/ 100</span>
        </div>
        <div className="mt-1.5 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
          <div className="bg-cmc-green h-full rounded-full" style={{ width: '74%' }}></div>
        </div>
      </div>

      {/* 4. 今日領漲幣種 */}
      <div className="bg-dark-900 border border-slate-800 rounded-xl p-4">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>今日漲幅第一</span>
          <span className="text-cmc-green text-[11px] font-semibold">熱門</span>
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-bold text-white">{topGainer?.baseAsset || '--'}</span>
            <span className="text-xs text-slate-400">{topGainer?.name || ''}</span>
          </div>
          <span className="text-sm font-semibold text-cmc-green tabular-nums">
            +{((topGainer?.priceChange24h ?? 0)).toFixed(2)}%
          </span>
        </div>
        <div className="mt-1 text-[11px] text-slate-500">
          領先主要現貨交易對
        </div>
      </div>

    </div>
  );
}
