import { DEFAULT_FETCH_TIMEOUT_MS, DEFAULT_STATIC_KEYS } from './constants';

export function safeParse(val: any, dec: number): string {
  if (val == null) return '';
  const num = Number(val);
  if (!Number.isFinite(num)) return '';

  let s = num.toFixed(dec);
  s = s.replace(/(\.\d*?[1-9])0+$/, '$1').replace(/\.0+$/, '');
  return s;
}

export function getRating(value: string | number): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (!Number.isFinite(num)) return 'Error';
  if (num >= -1 && num < -0.5) return 'Strong Sell';
  if (num >= -0.5 && num < -0.1) return 'Sell';
  if (num >= -0.1 && num <= 0.1) return 'Neutral';
  if (num > 0.1 && num <= 0.5) return 'Buy';
  if (num > 0.5 && num <= 1) return 'Strong Buy';
  return 'Error';
}

export async function fetchWithTimeout(
  resource: string,
  options: RequestInit & { timeout?: number } = {},
): Promise<Response> {
  const timeout = options.timeout ?? DEFAULT_FETCH_TIMEOUT_MS;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const { timeout: _, ...fetchOptions } = options;
    return await fetch(resource, { ...fetchOptions, signal: controller.signal });
  } finally {
    clearTimeout(id);
  }
}

export function mergeByTimeframe(
  rows: Record<string, any>[],
  staticKeys?: string[],
): Record<string, any> {
  if (!Array.isArray(rows)) return {};

  const invariants = Array.isArray(staticKeys) && staticKeys.length ? staticKeys : DEFAULT_STATIC_KEYS;
  const merged: Record<string, any> = {};

  for (const key of invariants) {
    for (const row of rows) {
      if (row && key in row) {
        merged[key] = row[key];
        break;
      }
    }
  }

  for (const row of rows) {
    if (!row || typeof row !== 'object') continue;
    const tf = row.timeframe;
    if (!tf) continue;

    for (const [key, value] of Object.entries(row)) {
      if (key === 'timeframe' || invariants.includes(key)) continue;
      if (!(key in merged)) merged[key] = {};
      merged[key][tf] = value;
    }
  }

  return merged;
}
