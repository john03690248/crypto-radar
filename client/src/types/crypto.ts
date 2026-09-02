export interface CryptoAsset {
  symbol: string;         // e.g. BTCUSDT
  baseAsset: string;      // e.g. BTC
  name: string;           // e.g. Bitcoin
  category: CoinCategory; // e.g. layer1, defi, meme, ai
  price: number;
  priceChange24h: number; // percentage, e.g. +3.42
  high24h: number;
  low24h: number;
  volume24h: number;      // 24h quote volume (USDT)
  lastUpdated: number;
}

export type CoinCategory = 'all' | 'layer1' | 'defi' | 'meme' | 'ai' | 'watchlist';

export type FiatCurrency = 'USD' | 'TWD' | 'EUR' | 'JPY';

export interface MarketOverviewStats {
  totalMarketCap: number;
  total24hVolume: number;
  btcDominance: number;
  topGainer: { symbol: string; change: number };
  topLoser: { symbol: string; change: number };
}

export interface NewsFlash {
  id: string;
  title: string;
  source: string;
  url: string;
  summary: string;
  publishedAt: string;
  category?: string;
}
