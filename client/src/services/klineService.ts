export type KlineInterval = '15m' | '1h' | '4h' | '1d' | '1w';

export interface CandlestickData {
  time: number; // Unix timestamp in seconds
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface VolumeData {
  time: number;
  value: number;
  color: string;
}

/**
 * 從 Binance API 獲取指定幣種與週期的歷史 K 線數據
 */
export async function fetchKlineData(
  symbol: string,
  interval: KlineInterval = '1h',
  limit: number = 100
): Promise<{ candles: CandlestickData[]; volumes: VolumeData[] }> {
  try {
    const url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`;
    const res = await fetch(url);
    const data = await res.json();

    if (!Array.isArray(data)) {
      throw new Error('K 線數據獲取失敗');
    }

    const candles: CandlestickData[] = [];
    const volumes: VolumeData[] = [];

    for (const item of data) {
      const openTime = Math.floor(item[0] / 1000); // 轉為秒
      const open = parseFloat(item[1]);
      const high = parseFloat(item[2]);
      const low = parseFloat(item[3]);
      const close = parseFloat(item[4]);
      const volume = parseFloat(item[5]);

      candles.push({
        time: openTime,
        open,
        high,
        low,
        close,
      });

      const isUp = close >= open;
      volumes.push({
        time: openTime,
        value: volume,
        color: isUp ? 'rgba(22, 199, 132, 0.35)' : 'rgba(234, 57, 67, 0.35)',
      });
    }

    return { candles, volumes };
  } catch (err) {
    console.error('fetchKlineData error:', err);
    return { candles: [], volumes: [] };
  }
}
