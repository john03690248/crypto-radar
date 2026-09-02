import { useState, useEffect, useRef } from 'react';
import { CryptoAsset } from '../types/crypto';
import { TRACKED_COINS, getInitialAssets } from '../services/binanceWs';

export function useCryptoPrices() {
  const [assets, setAssets] = useState<CryptoAsset[]>(getInitialAssets);
  const [wsConnected, setWsConnected] = useState<boolean>(false);
  const wsRef = useRef<WebSocket | null>(null);

  // 1. 初次載入透過 Binance REST API 取得 24h 統計資料
  const fetch24hTicker = async () => {
    try {
      const symbolsParam = JSON.stringify(TRACKED_COINS.map(c => c.symbol));
      const res = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbols=${encodeURIComponent(symbolsParam)}`);
      const data = await res.json();

      if (Array.isArray(data)) {
        setAssets(prev =>
          prev.map(asset => {
            const item = data.find((d: any) => d.symbol === asset.symbol);
            if (!item) return asset;
            return {
              ...asset,
              price: parseFloat(item.lastPrice),
              priceChange24h: parseFloat(item.priceChangePercent),
              high24h: parseFloat(item.highPrice),
              low24h: parseFloat(item.lowPrice),
              volume24h: parseFloat(item.quoteVolume),
              lastUpdated: Date.now(),
            };
          })
        );
      }
    } catch (err) {
      console.warn('REST API 獲取失敗，等待 WebSocket 串流連線:', err);
    }
  };

  // 2. 建立 Binance WebSocket 即時跳價連線
  useEffect(() => {
    fetch24hTicker();

    const streams = TRACKED_COINS.map(c => `${c.symbol.toLowerCase()}@ticker`).join('/');
    const wsUrl = `wss://stream.binance.com:9443/ws/${streams}`;

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setWsConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.s && data.c) {
          const symbol = data.s;
          const currentPrice = parseFloat(data.c);
          const priceChangePercent = parseFloat(data.P);
          const highPrice = parseFloat(data.h);
          const lowPrice = parseFloat(data.l);
          const quoteVolume = parseFloat(data.q);

          setAssets(prev =>
            prev.map(item => {
              if (item.symbol !== symbol) return item;
              return {
                ...item,
                price: currentPrice,
                priceChange24h: priceChangePercent,
                high24h: highPrice,
                low24h: lowPrice,
                volume24h: quoteVolume,
                lastUpdated: Date.now(),
              };
            })
          );
        }
      } catch (err) {
        console.error('WS 資料解析錯誤:', err);
      }
    };

    ws.onerror = () => setWsConnected(false);
    ws.onclose = () => setWsConnected(false);

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  return { assets, wsConnected, refetch: fetch24hTicker };
}
