import React from 'react';
import { Search, Globe, Star, LogOut } from 'lucide-react';
import { FiatCurrency } from '../types/crypto';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  currency: FiatCurrency;
  onCurrencyChange: (c: FiatCurrency) => void;
  showWatchlistOnly: boolean;
  onToggleWatchlistOnly: () => void;
  watchlistCount: number;
  wsConnected: boolean;
  user: { email?: string; username?: string } | null;
  onOpenAuth: () => void;
  onLogout: () => void;
}

export function Header({
  searchQuery,
  onSearchChange,
  currency,
  onCurrencyChange,
  showWatchlistOnly,
  onToggleWatchlistOnly,
  watchlistCount,
  wsConnected,
  user,
  onOpenAuth,
  onLogout,
}: HeaderProps) {
  const displayName = user?.username || user?.email?.split('@')[0] || 'User';
  const initialLetter = (displayName[0] || 'U').toUpperCase();

  return (
    <header className="sticky top-0 z-40 bg-dark-900 border-b border-slate-800">
      
      {/* 頂部全網數據微型摘要條 */}
      <div className="border-b border-slate-800/70 py-1.5 px-4 lg:px-8 text-[11px] text-slate-400">
        <div className="max-w-7xl mx-auto flex items-center justify-between overflow-x-auto gap-6 whitespace-nowrap">
          <div className="flex items-center gap-5">
            <div>
              <span>加密貨幣: </span>
              <strong className="text-slate-200 font-medium">2.4M+</strong>
            </div>
            <div>
              <span>交易平台: </span>
              <strong className="text-slate-200 font-medium">780</strong>
            </div>
            <div>
              <span>24h 成交量: </span>
              <strong className="text-slate-200 font-medium">$84.2B</strong>
            </div>
            <div>
              <span>BTC 市佔率: </span>
              <strong className="text-slate-200 font-medium">58.4%</strong>
            </div>
            <div>
              <span>ETH Gas: </span>
              <strong className="text-slate-200 font-medium">12 Gwei</strong>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-cmc-green' : 'bg-amber-400'}`}></span>
              <span>{wsConnected ? '即時報價' : '連線中'}</span>
            </span>
          </div>
        </div>
      </div>

      {/* 主要導覽列 */}
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-3 flex items-center justify-between gap-4">
        
        {/* Logo */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2.5 cursor-pointer">
            <div className="w-8 h-8 rounded-lg bg-cmc-blue flex items-center justify-center font-black text-white text-base shadow-sm">
              C
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-white leading-none">
                CryptoRadar
              </span>
              <span className="text-[10px] text-slate-400 font-normal">Market Cap</span>
            </div>
          </div>

          {/* 快捷分類連結 */}
          <nav className="hidden md:flex items-center gap-4 text-xs font-medium text-slate-300">
            <button
              onClick={() => showWatchlistOnly && onToggleWatchlistOnly()}
              className={`hover:text-white transition-colors cursor-pointer ${!showWatchlistOnly ? 'text-cmc-blue font-semibold' : ''}`}
            >
              加密貨幣
            </button>
            <button
              onClick={onToggleWatchlistOnly}
              className={`flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer ${showWatchlistOnly ? 'text-cmc-blue font-semibold' : ''}`}
            >
              <Star className={`w-3.5 h-3.5 ${showWatchlistOnly ? 'fill-cmc-gold text-cmc-gold' : ''}`} />
              <span>自選清單</span>
              {watchlistCount > 0 && (
                <span className="px-1.5 py-0.2 rounded bg-slate-800 text-[10px] text-slate-300">
                  {watchlistCount}
                </span>
              )}
            </button>
          </nav>
        </div>

        {/* 右側：搜尋 + 幣別 + 帳號 */}
        <div className="flex items-center gap-3">
          
          {/* 搜尋欄 */}
          <div className="relative w-48 sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="搜尋幣種 (BTC, ETH...)"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-dark-800 border border-slate-700/60 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-slate-500 transition-colors"
            />
          </div>

          {/* 貨幣選單 */}
          <div className="flex items-center bg-dark-800 border border-slate-700/60 rounded-lg px-2.5 py-1.5 text-xs">
            <Globe className="w-3 h-3 text-slate-400 mr-1.5" />
            <select
              value={currency}
              onChange={(e) => onCurrencyChange(e.target.value as FiatCurrency)}
              className="bg-transparent border-none outline-none text-slate-200 text-xs cursor-pointer font-medium"
            >
              <option value="USD" className="bg-dark-900">USD ($)</option>
              <option value="TWD" className="bg-dark-900">TWD (NT$)</option>
              <option value="EUR" className="bg-dark-900">EUR (€)</option>
              <option value="JPY" className="bg-dark-900">JPY (¥)</option>
            </select>
          </div>

          {/* 帳號登入 / 個人資訊 */}
          {user ? (
            <div className="flex items-center gap-2 bg-dark-800 border border-slate-700/60 rounded-lg px-3 py-1.5">
              <div className="w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-bold text-white">
                {initialLetter}
              </div>
              <span className="text-xs text-slate-200 font-medium max-w-[80px] truncate">
                {displayName}
              </span>
              <button
                onClick={onLogout}
                title="登出"
                className="text-slate-400 hover:text-cmc-red ml-1 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="px-3.5 py-1.5 rounded-lg bg-cmc-blue hover:bg-blue-600 text-white font-semibold text-xs transition-colors cursor-pointer shadow-sm"
            >
              登入 / 註冊
            </button>
          )}

        </div>

      </div>
    </header>
  );
}
