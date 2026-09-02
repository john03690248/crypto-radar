import React, { useState, useEffect } from 'react';
import { useCryptoPrices } from './hooks/useCryptoPrices';
import { Header } from './components/Header';
import { TickerMarquee } from './components/TickerMarquee';
import { MarketOverview } from './components/MarketOverview';
import { CryptoList } from './components/CryptoList';
import { CryptoChartModal } from './components/CryptoChartModal';
import { NewsFlashSection } from './components/NewsFlashSection';
import { AuthModal } from './components/AuthModal';
import { CryptoAsset, CoinCategory, FiatCurrency } from './types/crypto';
import { api } from './services/api';

const LOCAL_WATCHLIST_KEY = 'cryptoradar_watchlist_v1';
const LOCAL_TOKEN_KEY = 'cryptoradar_auth_token_v1';
const LOCAL_USER_KEY = 'cryptoradar_user_v1';

export function App() {
  const { assets, wsConnected } = useCryptoPrices();

  // 狀態管理
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<CoinCategory>('all');
  const [showWatchlistOnly, setShowWatchlistOnly] = useState<boolean>(false);
  const [currency, setCurrency] = useState<FiatCurrency>('USD');

  // K 線圖選中幣種
  const [selectedChartAsset, setSelectedChartAsset] = useState<CryptoAsset | null>(null);

  // 會員與 Token 狀態
  const [user, setUser] = useState<{ email?: string; username?: string } | null>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_USER_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem(LOCAL_TOKEN_KEY);
  });

  // 追蹤清單狀態
  const [watchlist, setWatchlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_WATCHLIST_KEY);
      return saved ? JSON.parse(saved) : ['BTCUSDT', 'ETHUSDT', 'SOLUSDT'];
    } catch {
      return ['BTCUSDT', 'ETHUSDT', 'SOLUSDT'];
    }
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  // 載入雲端追蹤清單
  const loadCloudWatchlist = async () => {
    if (!token) return;
    const cloudSymbols = await api.getWatchlist();
    if (cloudSymbols.length > 0) {
      setWatchlist(cloudSymbols);
      localStorage.setItem(LOCAL_WATCHLIST_KEY, JSON.stringify(cloudSymbols));
    }
  };

  useEffect(() => {
    if (user && token) {
      loadCloudWatchlist();
    }
  }, [user, token]);

  // 切換自選清單
  const handleToggleWatchlist = async (symbol: string) => {
    const isCurrentlySaved = watchlist.includes(symbol);
    const nextWatchlist = isCurrentlySaved
      ? watchlist.filter(s => s !== symbol)
      : [...watchlist, symbol];

    setWatchlist(nextWatchlist);
    localStorage.setItem(LOCAL_WATCHLIST_KEY, JSON.stringify(nextWatchlist));

    if (token) {
      if (isCurrentlySaved) {
        await api.removeFromWatchlist(symbol);
      } else {
        await api.addToWatchlist(symbol);
      }
    }
  };

  const handleLoginSuccess = (userData: { email: string; username?: string }, jwtToken: string) => {
    setUser(userData);
    setToken(jwtToken);
    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(userData));
    localStorage.setItem(LOCAL_TOKEN_KEY, jwtToken);
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(LOCAL_USER_KEY);
    localStorage.removeItem(LOCAL_TOKEN_KEY);
    setWatchlist(['BTCUSDT', 'ETHUSDT', 'SOLUSDT']);
  };

  // 當資產跳價時，保持選中的圖表資產也是最新跳價狀態
  const activeChartAsset = selectedChartAsset
    ? assets.find(a => a.symbol === selectedChartAsset.symbol) || selectedChartAsset
    : null;

  return (
    <div className="min-h-screen bg-dark-950 text-slate-200 flex flex-col selection:bg-cmc-blue selection:text-white">
      
      {/* 1. CMC 專業頂部導覽列 */}
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        currency={currency}
        onCurrencyChange={setCurrency}
        showWatchlistOnly={showWatchlistOnly}
        onToggleWatchlistOnly={() => setShowWatchlistOnly(prev => !prev)}
        watchlistCount={watchlist.length}
        wsConnected={wsConnected}
        user={user}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* 2. 微型行情跑馬帶 */}
      <TickerMarquee assets={assets} currency={currency} />

      {/* 3. 主頁面內容 */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-5 space-y-5">
        
        {/* 市場核心總覽 */}
        <MarketOverview assets={assets} currency={currency} />

        {/* 最新市場快訊 */}
        <NewsFlashSection />

        {/* 頁面標題區塊 */}
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 pt-2">
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              {showWatchlistOnly ? '自選追蹤清單 (Watchlist)' : '今日加密貨幣市值排名'}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              點擊任一幣種開啟 TradingView 專業 K 線圖與深度歷史行情
            </p>
          </div>
        </div>

        {/* CMC 專業行情表格 */}
        <CryptoList
          assets={assets}
          currency={currency}
          searchQuery={searchQuery}
          watchlist={watchlist}
          onToggleWatchlist={handleToggleWatchlist}
          onSelectCoin={(coin) => setSelectedChartAsset(coin)}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          showWatchlistOnly={showWatchlistOnly}
        />

      </main>

      {/* 4. 專業 Footer */}
      <footer className="border-t border-slate-800 bg-dark-900 py-6 px-4 lg:px-8 mt-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">CryptoRadar</span>
            <span>© 2026 • 實時行情數據源自 Binance API & Supabase</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span>API 狀態: 正常</span>
            <span>•</span>
            <span>延遲: 24ms</span>
          </div>
        </div>
      </footer>

      {/* 5. 互動式 K 線圖 Modal */}
      <CryptoChartModal
        isOpen={Boolean(selectedChartAsset)}
        asset={activeChartAsset}
        currency={currency}
        onClose={() => setSelectedChartAsset(null)}
        isSavedInWatchlist={selectedChartAsset ? watchlist.includes(selectedChartAsset.symbol) : false}
        onToggleWatchlist={handleToggleWatchlist}
      />

      {/* 6. 登入 / 註冊對話框 */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

    </div>
  );
}

export default App;
