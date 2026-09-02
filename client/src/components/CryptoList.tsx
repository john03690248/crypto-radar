import React from 'react';
import { CryptoAsset, CoinCategory, FiatCurrency } from '../types/crypto';
import { formatPrice, formatCompactNumber } from '../utils/formatters';
import { Star, TrendingUp, TrendingDown } from 'lucide-react';

interface CryptoListProps {
  assets: CryptoAsset[];
  currency: FiatCurrency;
  searchQuery: string;
  watchlist: string[];
  onToggleWatchlist: (symbol: string) => void;
  onSelectCoin: (asset: CryptoAsset) => void;
  selectedCategory: CoinCategory;
  onSelectCategory: (cat: CoinCategory) => void;
  showWatchlistOnly: boolean;
}

const CATEGORIES: Array<{ id: CoinCategory; label: string }> = [
  { id: 'all', label: '全部' },
  { id: 'layer1', label: 'Layer 1' },
  { id: 'defi', label: 'DeFi' },
  { id: 'ai', label: 'AI' },
  { id: 'meme', label: 'Memes' },
];

function Sparkline({ isUp }: { isUp: boolean }) {
  const points = isUp
    ? '0,28 15,24 30,26 45,18 60,20 75,12 90,15 105,8 120,4'
    : '0,6 15,10 30,8 45,16 60,14 75,22 90,19 105,26 120,28';

  const strokeColor = isUp ? '#16c784' : '#ea3943';

  return (
    <svg className="w-24 h-8 inline-block overflow-visible" viewBox="0 0 120 32">
      <polyline
        fill="none"
        stroke={strokeColor}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}

const COIN_COLORS: Record<string, string> = {
  BTC: 'bg-[#f7931a] text-white',
  ETH: 'bg-[#627eea] text-white',
  SOL: 'bg-[#14f195] text-black',
  BNB: 'bg-[#f3ba2f] text-black',
  XRP: 'bg-[#23292f] text-white border border-slate-600',
  ADA: 'bg-[#0033ad] text-white',
  DOGE: 'bg-[#c2a633] text-white',
  PEPE: 'bg-[#55a947] text-white',
  SHIB: 'bg-[#e44225] text-white',
  UNI: 'bg-[#ff007a] text-white',
  AAVE: 'bg-[#b6509e] text-white',
  NEAR: 'bg-[#000000] text-white border border-slate-600',
  FET: 'bg-[#1b2559] text-white',
  RENDER: 'bg-[#e53935] text-white',
  SUI: 'bg-[#4da2ff] text-white',
  AVAX: 'bg-[#e84142] text-white',
};

export function CryptoList({
  assets,
  currency,
  searchQuery,
  watchlist,
  onToggleWatchlist,
  onSelectCoin,
  selectedCategory,
  onSelectCategory,
  showWatchlistOnly,
}: CryptoListProps) {
  
  const filteredAssets = assets.filter((asset) => {
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch =
      query === '' ||
      asset.symbol.toLowerCase().includes(query) ||
      asset.baseAsset.toLowerCase().includes(query) ||
      asset.name.toLowerCase().includes(query);

    const matchesCategory = selectedCategory === 'all' || asset.category === selectedCategory;
    const matchesWatchlist = !showWatchlistOnly || watchlist.includes(asset.symbol);

    return matchesSearch && matchesCategory && matchesWatchlist;
  });

  return (
    <div className="bg-dark-900 border border-slate-800 rounded-xl overflow-hidden">
      
      {/* 分類選項列 */}
      <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        <div className="text-xs text-slate-400 whitespace-nowrap">
          顯示 <span className="font-semibold text-slate-200">{filteredAssets.length}</span> 項資產
        </div>
      </div>

      {/* CMC 數據表格 */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-dark-950/60 text-slate-400 border-b border-slate-800 font-semibold uppercase text-[11px]">
            <tr>
              <th className="py-3 px-3 w-8 text-center">#</th>
              <th className="py-3 px-2 w-8 text-center"></th>
              <th className="py-3 px-4">名稱</th>
              <th className="py-3 px-4 text-right">價格</th>
              <th className="py-3 px-4 text-right">24h 漲跌</th>
              <th className="py-3 px-4 text-right hidden lg:table-cell">24h 最高 / 最低</th>
              <th className="py-3 px-4 text-right hidden sm:table-cell">24h 成交量</th>
              <th className="py-3 px-4 text-center hidden md:table-cell w-32">過去 7 天趨勢</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-sans tabular-nums">
            {filteredAssets.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-500 font-normal">
                  {showWatchlistOnly ? '自選清單目前為空，可點擊星星加入關注。' : '無符合條件的加密貨幣'}
                </td>
              </tr>
            ) : (
              filteredAssets.map((coin, index) => {
                const isSaved = watchlist.includes(coin.symbol);
                const isUp = (coin.priceChange24h ?? 0) >= 0;
                const badgeColor = COIN_COLORS[coin.baseAsset] || 'bg-slate-700 text-white';

                return (
                  <tr
                    key={coin.symbol}
                    onClick={() => onSelectCoin(coin)}
                    className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                  >
                    {/* 排名 */}
                    <td className="py-3.5 px-3 text-center text-slate-500 text-xs">
                      {index + 1}
                    </td>

                    {/* 星號 */}
                    <td className="py-3.5 px-2 text-center" onClick={(e) => { e.stopPropagation(); onToggleWatchlist(coin.symbol); }}>
                      <button className="p-1 rounded hover:bg-slate-700/50 cursor-pointer">
                        <Star className={`w-3.5 h-3.5 ${isSaved ? 'fill-cmc-gold text-cmc-gold' : 'text-slate-600 hover:text-slate-400'}`} />
                      </button>
                    </td>

                    {/* 幣種名稱 */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-6 h-6 rounded-full ${badgeColor} flex items-center justify-center font-bold text-[10px] shrink-0`}>
                          {coin.baseAsset.slice(0, 3)}
                        </div>
                        <div className="flex items-baseline gap-1.5">
                          <span className="font-bold text-white text-sm group-hover:text-cmc-blue transition-colors">{coin.name}</span>
                          <span className="text-slate-400 text-xs font-medium uppercase">{coin.baseAsset}</span>
                        </div>
                      </div>
                    </td>

                    {/* 即時價格 */}
                    <td className="py-3.5 px-4 text-right font-semibold text-white text-sm">
                      {formatPrice(coin.price, currency)}
                    </td>

                    {/* 24h 漲跌幅 */}
                    <td className="py-3.5 px-4 text-right">
                      <span className={`inline-flex items-center gap-0.5 font-semibold text-xs ${isUp ? 'text-cmc-green' : 'text-cmc-red'}`}>
                        {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {isUp ? '+' : ''}{(coin.priceChange24h ?? 0).toFixed(2)}%
                      </span>
                    </td>

                    {/* 24h 最高 / 最低 */}
                    <td className="py-3.5 px-4 text-right hidden lg:table-cell text-xs text-slate-400">
                      <div>高: <span className="text-slate-200">{formatPrice(coin.high24h, currency)}</span></div>
                      <div>低: <span className="text-slate-400">{formatPrice(coin.low24h, currency)}</span></div>
                    </td>

                    {/* 24h 成交量 */}
                    <td className="py-3.5 px-4 text-right hidden sm:table-cell text-slate-200 font-medium">
                      {formatCompactNumber(coin.volume24h, currency)}
                    </td>

                    {/* 7 天趨勢 Sparkline */}
                    <td className="py-3.5 px-4 text-center hidden md:table-cell">
                      <Sparkline isUp={isUp} />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}
