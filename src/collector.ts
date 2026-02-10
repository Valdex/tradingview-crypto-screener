import { DEFAULT_URL, DEFAULT_HEADERS, DEFAULT_TIMEFRAMES, DEFAULT_BATCH_SIZE, DEFAULT_LIMIT, INTERVAL_MAP } from './constants';
import { fetchWithTimeout, mergeByTimeframe } from './utils';
import { transformScreenerData } from './screener';
import { loadFields } from './fields-loader';
import type { CollectOptions, CollectedSymbol, ScanResult, FieldMap, RawTradingViewResponse } from './types';

function buildColumns(fields: FieldMap, suffix: string): string[] {
  return Object.values(fields).map((field) => {
    if (field.interval) {
      return field.field_name + suffix;
    }
    return field.field_name;
  });
}

async function fetchBatch(
  url: string,
  timeframe: string,
  fields: FieldMap,
  overrides: Record<string, any>,
  targetMap: Map<string, ScanResult[]>,
  start: number,
  end: number,
  batchSize: number,
): Promise<void> {
  const suffix = INTERVAL_MAP[timeframe] ?? '|5';
  const dynamicColumns = buildColumns(fields, suffix);

  let cursor = start;

  while (cursor < end) {
    const nextCursor = Math.min(end, cursor + batchSize);

    const payload: Record<string, any> = {
      ...overrides,
      columns: dynamicColumns,
      range: [cursor, nextCursor],
    };

    const res = await fetchWithTimeout(url, {
      method: 'POST',
      headers: DEFAULT_HEADERS,
      body: JSON.stringify(payload),
    });

    const raw = (await res.json()) as RawTradingViewResponse;
    const rows = Array.isArray(raw?.data) ? transformScreenerData(raw, timeframe, fields) : [];

    if (!rows.length) break;

    for (const r of rows) {
      if (!targetMap.has(r.s)) targetMap.set(r.s, []);
      targetMap.get(r.s)!.push(r);
    }

    if (rows.length < (nextCursor - cursor)) break;
    cursor = nextCursor;
  }
}

export async function collect(options: CollectOptions = {}): Promise<CollectedSymbol[]> {
  const {
    url = DEFAULT_URL,
    exchange = 'BINANCE',
    currency = 'USDT',
    market = 'crypto',
    type = ['perpetual'],
    filters = [],
    timeframes = DEFAULT_TIMEFRAMES,
    batchSize = DEFAULT_BATCH_SIZE,
    limit = DEFAULT_LIMIT,
    sort = { by: 'close', order: 'desc' },
    fields: customFields,
    staticKeys,
  } = options;

  const fields = customFields
    ? customFields.reduce((acc, f) => { acc[f.field_name] = f; return acc; }, {} as FieldMap)
    : loadFields();

  const baseFilters = [
    { left: 'exchange', operation: 'equal', right: exchange },
    { left: 'currency', operation: 'equal', right: currency },
    ...filters,
  ];

  const basePayload: Record<string, any> = {
    options: { lang: 'en' },
    filter: baseFilters,
    filter2: {
      operator: 'and',
      operands: type.map((t) => ({
        expression: { left: 'typespecs', operation: 'has', right: [t] },
      })),
    },
    markets: [market],
    sort: { sortBy: sort.by, sortOrder: sort.order },
  };

  const symbolMap = new Map<string, ScanResult[]>();

  for (const tf of timeframes) {
    await fetchBatch(url, tf, fields, basePayload, symbolMap, 0, limit, batchSize);
  }

  const allSymbols: CollectedSymbol[] = [...symbolMap.entries()].map(([sym, rows]) => ({
    symbol: sym,
    ...mergeByTimeframe(rows.map((r) => r.d), staticKeys),
  }));

  return allSymbols;
}
