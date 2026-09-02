import React, { useEffect, useRef, useState } from 'react';
import {
  createChart,
  IChartApi,
  CandlestickSeries,
  AreaSeries,
  HistogramSeries,
  Time,
} from 'lightweight-charts';
import { CryptoAsset, FiatCurrency } from '../types/crypto';
import { fetchKlineData, KlineInterval, CandlestickData } from '../services/klineService';
import { formatPrice, formatCompactNumber } from '../utils/formatters';
import { X, Star, TrendingUp, TrendingDown, BarChart2, Activity, RefreshCw } from 'lucide-react';

interface CryptoChartModalProps {
  asset: CryptoAsset | null;
  currency: FiatCurrency;
  isOpen: boolean;
  onClose: () => void;
  isSavedInWatchlist: boolean;
  onToggleWatchlist: (symbol: string) => void;
}

const INTERVALS: Array<{ id: KlineInterval; label: string }> = [
  { id: '15m', label: '15分' },
  { id: '1h', label: '1小時' },
  { id: '4h', label: '4小時' },
  { id: '1d', label: '日K' },
  { id: '1w', label: '週K' },
];

export function CryptoChartModal({
  asset,
  currency,
  isOpen,
  onClose,
  isSavedInWatchlist,
  onToggleWatchlist,
}: CryptoChartModalProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const mainSeriesRef = useRef<any>(null);
  const lastCandleRef = useRef<CandlestickData | null>(null);

  const [interval, setInterval] = useState<KlineInterval>('1h');
  const [chartType, setChartType] = useState<'candlestick' | 'area'>('candlestick');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hoverData, setHoverData] = useState<{
    time?: string;
    open?: number;
    high?: number;
    low?: number;
    close?: number;
  } | null>(null);

  const targetSymbol = asset?.symbol;

  // 1. 初始化與切換週期/幣種時載入歷史 K 線
  useEffect(() => {
    if (!isOpen || !targetSymbol || !chartContainerRef.current) return;

    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
      mainSeriesRef.current = null;
      lastCandleRef.current = null;
    }

    const container = chartContainerRef.current;
    const chart = createChart(container, {
      width: container.clientWidth,
      height: 420,
      layout: {
        background: { color: '#0c1017' },
        textColor: '#94a3b8',
        fontSize: 12,
      },
      grid: {
        vertLines: { color: 'rgba(30, 41, 59, 0.35)' },
        horzLines: { color: 'rgba(30, 41, 59, 0.35)' },
      },
      crosshair: {
        vertLine: { color: '#475569', width: 1, style: 3, labelBackgroundColor: '#334155' },
        horzLine: { color: '#475569', width: 1, style: 3, labelBackgroundColor: '#334155' },
      },
      timeScale: {
        borderColor: '#1e293b',
        timeVisible: true,
        secondsVisible: false,
      },
      rightPriceScale: {
        borderColor: '#1e293b',
        autoScale: true,
      },
    });

    chartRef.current = chart;

    let mainSeries: any = null;
    let volumeSeries: any = null;

    if (chartType === 'candlestick') {
      mainSeries = chart.addSeries(CandlestickSeries, {
        upColor: '#16c784',
        downColor: '#ea3943',
        borderUpColor: '#16c784',
        borderDownColor: '#ea3943',
        wickUpColor: '#16c784',
        wickDownColor: '#ea3943',
      });
    } else {
      mainSeries = chart.addSeries(AreaSeries, {
        topColor: 'rgba(56, 97, 251, 0.35)',
        bottomColor: 'rgba(56, 97, 251, 0.0)',
        lineColor: '#3861fb',
        lineWidth: 2,
      });
    }

    mainSeriesRef.current = mainSeries;

    volumeSeries = chart.addSeries(HistogramSeries, {
      priceFormat: { type: 'volume' },
      priceScaleId: 'volume',
    });

    chart.priceScale('volume').applyOptions({
      scaleMargins: {
        top: 0.8,
        bottom: 0,
      },
    });

    setIsLoading(true);

    fetchKlineData(targetSymbol, interval, 120).then(({ candles, volumes }) => {
      if (candles.length > 0 && chartRef.current) {
        // 保存最後一根 K 棒供即時跳價動態更新
        lastCandleRef.current = { ...candles[candles.length - 1] };

        if (chartType === 'candlestick') {
          mainSeries.setData(
            candles.map(c => ({
              time: c.time as Time,
              open: c.open,
              high: c.high,
              low: c.low,
              close: c.close,
            }))
          );
        } else {
          mainSeries.setData(
            candles.map(c => ({
              time: c.time as Time,
              value: c.close,
            }))
          );
        }

        volumeSeries.setData(
          volumes.map(v => ({
            time: v.time as Time,
            value: v.value,
            color: v.color,
          }))
        );

        chart.timeScale().fitContent();
      }
      setIsLoading(false);
    });

    chart.subscribeCrosshairMove((param) => {
      if (param.time && param.seriesData && mainSeries) {
        const data: any = param.seriesData.get(mainSeries);
        if (data) {
          setHoverData({
            time: typeof param.time === 'number' ? new Date(param.time * 1000).toLocaleString() : String(param.time),
            open: data.open ?? data.value,
            high: data.high ?? data.value,
            low: data.low ?? data.value,
            close: data.close ?? data.value,
          });
          return;
        }
      }
      setHoverData(null);
    });

    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
        mainSeriesRef.current = null;
        lastCandleRef.current = null;
      }
    };
  }, [isOpen, targetSymbol, interval, chartType]);

  // 2. ⚡ 核心靈魂：即時跳價時，動態更新最後一根 K 棒！
  useEffect(() => {
    if (!isOpen || !asset?.price || !mainSeriesRef.current || !lastCandleRef.current) return;

    const currentPrice = asset.price;
    const lastCandle = lastCandleRef.current;

    // 計算最新高低點與收盤價
    const newHigh = Math.max(lastCandle.high, currentPrice);
    const newLow = Math.min(lastCandle.low, currentPrice);

    const updatedCandle: CandlestickData = {
      time: lastCandle.time,
      open: lastCandle.open,
      high: newHigh,
      low: newLow,
      close: currentPrice,
    };

    // 局部即時更新最新 K 棒 (無感 60fps 平滑跳動)
    if (chartType === 'candlestick') {
      mainSeriesRef.current.update({
        time: updatedCandle.time as Time,
        open: updatedCandle.open,
        high: updatedCandle.high,
        low: updatedCandle.low,
        close: updatedCandle.close,
      });
    } else {
      mainSeriesRef.current.update({
        time: updatedCandle.time as Time,
        value: currentPrice,
      });
    }

    lastCandleRef.current = updatedCandle;
  }, [asset?.price, isOpen, chartType]);

  if (!isOpen || !asset) return null;

  const isUp = (asset.priceChange24h ?? 0) >= 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-sm">
      <div className="w-full max-w-5xl bg-dark-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* 1. Modal 頂部行情資訊列 */}
        <div className="px-5 py-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4 bg-dark-950/60">
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => onToggleWatchlist(asset.symbol)}
              title={isSavedInWatchlist ? '從自選移除' : '加入自選清單'}
              className="p-1.5 rounded-lg bg-dark-800 hover:bg-slate-700 border border-slate-700 transition-colors cursor-pointer"
            >
              <Star className={`w-4 h-4 ${isSavedInWatchlist ? 'fill-cmc-gold text-cmc-gold' : 'text-slate-400'}`} />
            </button>

            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-bold text-white">{asset.name}</span>
                <span className="text-xs font-semibold text-slate-400 uppercase">{asset.baseAsset} / USDT</span>
              </div>
              <div className="flex items-center gap-3 mt-0.5">
                <span className="text-xl font-extrabold text-white tabular-nums font-mono">
                  {formatPrice(asset.price, currency)}
                </span>
                <span className={`inline-flex items-center text-xs font-semibold tabular-nums ${isUp ? 'text-cmc-green' : 'text-cmc-red'}`}>
                  {isUp ? <TrendingUp className="w-3 h-3 mr-0.5" /> : <TrendingDown className="w-3 h-3 mr-0.5" />}
                  {isUp ? '+' : ''}{(asset.priceChange24h ?? 0).toFixed(2)}%
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden sm:flex items-center gap-4 text-xs text-slate-400 tabular-nums">
              <div>
                <span className="text-slate-500 block text-[10px]">24h 最高</span>
                <span className="text-slate-200 font-medium">{formatPrice(asset.high24h, currency)}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">24h 最低</span>
                <span className="text-slate-200 font-medium">{formatPrice(asset.low24h, currency)}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">24h 成交額</span>
                <span className="text-slate-200 font-medium">{formatCompactNumber(asset.volume24h, currency)}</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

        </div>

        {/* 2. 工具列：週期切換與圖表樣式 */}
        <div className="px-5 py-2.5 border-b border-slate-800/80 bg-dark-900 flex flex-wrap items-center justify-between gap-3 text-xs">
          
          <div className="flex items-center gap-1 bg-dark-950/80 border border-slate-800 rounded-lg p-0.5">
            {INTERVALS.map((item) => {
              const isActive = interval === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setInterval(item.id)}
                  className={`px-3 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-slate-800 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-dark-950/80 border border-slate-800 rounded-lg p-0.5">
              <button
                onClick={() => setChartType('candlestick')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer ${
                  chartType === 'candlestick' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <BarChart2 className="w-3.5 h-3.5" />
                <span>K 線 (Candle)</span>
              </button>
              <button
                onClick={() => setChartType('area')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer ${
                  chartType === 'area' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                <span>走勢 (Area)</span>
              </button>
            </div>
          </div>

        </div>

        {/* 3. 十字準星浮動資訊 (OHLC) */}
        <div className="px-5 py-1.5 bg-dark-950/40 border-b border-slate-800/40 text-[11px] text-slate-400 flex flex-wrap items-center gap-4 font-mono tabular-nums min-h-[28px]">
          {hoverData ? (
            <>
              <span className="text-slate-500 font-sans">{hoverData.time}</span>
              <span>開: <strong className="text-slate-200">${hoverData.open?.toFixed(2)}</strong></span>
              <span>高: <strong className="text-slate-200">${hoverData.high?.toFixed(2)}</strong></span>
              <span>低: <strong className="text-slate-200">${hoverData.low?.toFixed(2)}</strong></span>
              <span>收: <strong className="text-slate-200">${hoverData.close?.toFixed(2)}</strong></span>
            </>
          ) : (
            <span className="text-slate-500 font-sans">即時跳價動態同步中 • 移動滑鼠至圖表上查看十字準星詳細報價 (OHLC)</span>
          )}
        </div>

        {/* 4. 圖表渲染主畫布 */}
        <div className="relative flex-1 bg-dark-900 min-h-[420px] p-2">
          {isLoading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-dark-900/60 backdrop-blur-xs text-xs text-slate-400 gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-cmc-blue" />
              <span>載入 Binance 歷史 K 線數據中...</span>
            </div>
          )}
          <div ref={chartContainerRef} className="w-full h-full" />
        </div>

      </div>
    </div>
  );
}
