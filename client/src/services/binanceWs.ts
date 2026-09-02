import { CryptoAsset, CoinCategory } from '../types/crypto';

export const TRACKED_COINS: Array<{
  symbol: string;
  base: string;
  name: string;
  category: CoinCategory;
}> = [
  { symbol: 'BTCUSDT', base: 'BTC', name: 'Bitcoin', category: 'layer1' },
  { symbol: 'ETHUSDT', base: 'ETH', name: 'Ethereum', category: 'layer1' },
  { symbol: 'SOLUSDT', base: 'SOL', name: 'Solana', category: 'layer1' },
  { symbol: 'BNBUSDT', base: 'BNB', name: 'BNB Chain', category: 'layer1' },
  { symbol: 'XRPUSDT', base: 'XRP', name: 'XRP', category: 'layer1' },
  { symbol: 'ADAUSDT', base: 'ADA', name: 'Cardano', category: 'layer1' },
  { symbol: 'DOGEUSDT', base: 'DOGE', name: 'Dogecoin', category: 'meme' },
  { symbol: 'PEPEUSDT', base: 'PEPE', name: 'Pepe', category: 'meme' },
  { symbol: 'SHIBUSDT', base: 'SHIB', name: 'Shiba Inu', category: 'meme' },
  { symbol: 'UNIUSDT', base: 'UNI', name: 'Uniswap', category: 'defi' },
  { symbol: 'AAVEUSDT', base: 'AAVE', name: 'Aave', category: 'defi' },
  { symbol: 'NEARUSDT', base: 'NEAR', name: 'NEAR Protocol', category: 'ai' },
  { symbol: 'FETUSDT', base: 'FET', name: 'Artificial Superintelligence', category: 'ai' },
  { symbol: 'RENDERUSDT', base: 'RENDER', name: 'Render', category: 'ai' },
  { symbol: 'SUIUSDT', base: 'SUI', name: 'Sui Network', category: 'layer1' },
  { symbol: 'AVAXUSDT', base: 'AVAX', name: 'Avalanche', category: 'layer1' },
];

export function getInitialAssets(): CryptoAsset[] {
  return TRACKED_COINS.map(coin => ({
    symbol: coin.symbol,
    baseAsset: coin.base,
    name: coin.name,
    category: coin.category,
    price: 0,
    priceChange24h: 0,
    high24h: 0,
    low24h: 0,
    volume24h: 0,
    lastUpdated: Date.now(),
  }));
}
