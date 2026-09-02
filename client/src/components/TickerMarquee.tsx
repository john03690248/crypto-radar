import React from 'react';
import { CryptoAsset, FiatCurrency } from '../types/crypto';
import { formatPrice } from '../utils/formatters';

interface TickerMarqueeProps {
  assets: CryptoAsset[];
  currency: FiatCurrency;
}

export function TickerMarquee({ assets, currency }: TickerMarqueeProps) {
  const displayCoins = [...assets, ...assets];

  return (
    <div className="w-full bg-dark-900/50 border-b border-slate-800/80 overflow-hidden py-1.5 select-none">
      <div className="flex w-max animate-marquee hover:[animation-play-state:paused]">
        {displayCoins.map((coin, index) => {
          const isUp = coin.priceChange24h >= 0;
          return (
            <div
              key={`${coin.symbol}-${index}`}
              className="flex items-center gap-2 px-4 text-xs border-r border-slate-800/60"
            >
              <span className="font-semibold text-slate-300">{coin.baseAsset}</span>
              <span className="text-slate-200 tabular-nums">{formatPrice(coin.price, currency)}</span>
              <span className={`text-[11px] font-medium tabular-nums ${isUp ? 'text-cmc-green' : 'text-cmc-red'}`}>
                {isUp ? '+' : ''}{coin.priceChange24h.toFixed(2)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
