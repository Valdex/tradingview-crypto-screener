import type { Timeframe } from './types';

export const INTERVAL_MAP: Record<Timeframe | string, string> = {
  '1m': '|1',
  '5m': '|5',
  '15m': '|15',
  '30m': '|30',
  '1h': '|60',
  '2h': '|120',
  '4h': '|240',
  '1d': '',
  '1W': '|1W',
  '1w': '|1W',
  '1M': '|1M',
};

export const DEFAULT_URL = 'https://scanner.tradingview.com/crypto/scan?label-product=screener-crypto-old';

export const DEFAULT_HEADERS: Record<string, string> = {
  Accept: 'text/plain, */*',
  'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
  Referer: 'https://www.tradingview.com/',
};

export const DEFAULT_TIMEFRAMES = ['5m', '15m', '1h', '4h', '1d'];
export const DEFAULT_BATCH_SIZE = 150;
export const DEFAULT_LIMIT = 150;
export const DEFAULT_FETCH_TIMEOUT_MS = 10_000;

export const DEFAULT_STATIC_KEYS = [
  'Name', 'Price', 'All Time High', 'All Time Low',
  '1-Month Low', '3-Month Low', '1-Month High', '3-Month High',
  'All Time Performance', 'Average Volume (10 day)', 'Average Volume (30 day)',
  'Monthly Performance', '3-Month Performance', '6-Month Performance',
  'Volatility', 'Volatility Month', 'Volatility Week',
  'Volume 24h Change %', 'Volume 24h in USD', 'Weekly Performance',
  '52 Week High', '52 Week Low',
];
