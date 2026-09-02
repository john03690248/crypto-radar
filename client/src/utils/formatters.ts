import { FiatCurrency } from '../types/crypto';

const FIAT_RATES: Record<FiatCurrency, { rate: number; symbol: string; prefix: string }> = {
  USD: { rate: 1, symbol: '$', prefix: '$' },
  TWD: { rate: 32.5, symbol: 'NT$', prefix: 'NT$' },
  EUR: { rate: 0.95, symbol: '€', prefix: '€' },
  JPY: { rate: 153.2, symbol: '¥', prefix: '¥' },
};

export function formatPrice(priceUsd: number, currency: FiatCurrency = 'USD'): string {
  if (priceUsd === 0 || isNaN(priceUsd)) return '$0.00';
  const { rate, prefix } = FIAT_RATES[currency] || FIAT_RATES.USD;
  const converted = priceUsd * rate;

  if (converted >= 1000) {
    return `${prefix}${converted.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  } else if (converted >= 1) {
    return `${prefix}${converted.toFixed(2)}`;
  } else if (converted >= 0.0001) {
    return `${prefix}${converted.toFixed(4)}`;
  } else {
    return `${prefix}${converted.toFixed(6)}`;
  }
}

export function formatCompactNumber(numUsd: number, currency: FiatCurrency = 'USD'): string {
  const { rate, prefix } = FIAT_RATES[currency] || FIAT_RATES.USD;
  const converted = numUsd * rate;

  if (converted >= 1e12) return `${prefix}${(converted / 1e12).toFixed(2)}T`;
  if (converted >= 1e9) return `${prefix}${(converted / 1e9).toFixed(2)}B`;
  if (converted >= 1e6) return `${prefix}${(converted / 1e6).toFixed(2)}M`;
  if (converted >= 1e3) return `${prefix}${(converted / 1e3).toFixed(2)}K`;
  return `${prefix}${converted.toFixed(2)}`;
}
