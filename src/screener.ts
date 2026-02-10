import { INTERVAL_MAP, DEFAULT_URL, DEFAULT_HEADERS } from './constants';
import { safeParse, getRating, fetchWithTimeout } from './utils';
import { loadFields } from './fields-loader';
import type { ScanOptions, ScanResult, FieldDefinition, FieldMap, RawTradingViewResponse } from './types';

function buildColumns(fields: FieldMap, suffix: string): string[] {
  return Object.values(fields).map((field) => {
    if (field.interval) {
      return field.field_name + suffix;
    }
    return field.field_name;
  });
}

function transformRow(d: any[], fields: FieldMap, timeframe: string): Record<string, any> {
  const fieldEntries = Object.entries(fields);
  const result: Record<string, any> = { timeframe };

  fieldEntries.forEach(([, meta], index) => {
    const value = d[index];

    switch (meta.format) {
      case 'round':
        result[meta.label] = safeParse(value, 4);
        break;
      case 'percent':
        result[meta.label] = safeParse(value, 2);
        break;
      case 'rating':
      case 'recommendation':
      case 'computed_recommendation': {
        const val = safeParse(value, 4);
        result[meta.label] = { value: val, rating: getRating(val) };
        break;
      }
      case 'float':
        result[meta.label] = safeParse(value, 8);
        break;
      case 'text':
        result[meta.label] = value || '';
        break;
      case 'number_group':
        result[meta.label] = safeParse(value, 2);
        break;
      case 'bool':
        result[meta.label] = value || null;
        break;
      case 'missing':
        result[meta.label] = value || null;
        break;
      default:
        result[meta.label] = safeParse(value, 4);
    }
  });

  // Remove candle fields with falsy values (0 means pattern not detected)
  for (const key of Object.keys(result)) {
    if (key.startsWith('Candle.') && !result[key]) {
      delete result[key];
    }
  }

  return result;
}

export function transformScreenerData(
  rawData: RawTradingViewResponse,
  interval: string,
  fields: FieldMap,
): ScanResult[] {
  return rawData.data.map((item) => ({
    s: item.s,
    d: transformRow(item.d || [], fields, interval),
  }));
}

export async function scan(options: ScanOptions = {}): Promise<ScanResult[]> {
  const {
    url = DEFAULT_URL,
    exchange = 'BINANCE',
    currency = 'USDT',
    market = 'crypto',
    timeframe = '5m',
    type = ['perpetual'],
    filters = [],
    columns,
    limit = 150,
    sort = { by: 'close', order: 'desc' },
    range,
  } = options;

  const suffix = INTERVAL_MAP[timeframe] ?? '|5';
  const fields = loadFields();

  const dynamicColumns = columns ?? buildColumns(fields, suffix);

  const baseFilters = [
    { left: 'exchange', operation: 'equal', right: exchange },
    { left: 'currency', operation: 'equal', right: currency },
    ...filters,
  ];

  const rangeValue = range ?? [0, limit];

  const payload: Record<string, any> = {
    options: { lang: 'en' },
    filter: baseFilters,
    filter2: {
      operator: 'and',
      operands: type.map((t) => ({
        expression: { left: 'typespecs', operation: 'has', right: [t] },
      })),
    },
    markets: [market],
    columns: dynamicColumns,
    sort: { sortBy: sort.by, sortOrder: sort.order },
    range: rangeValue,
  };

  const res = await fetchWithTimeout(url, {
    method: 'POST',
    headers: DEFAULT_HEADERS,
    body: JSON.stringify(payload),
  });

  const raw = (await res.json()) as RawTradingViewResponse;

  if (!Array.isArray(raw?.data)) {
    return [];
  }

  return transformScreenerData(raw, timeframe, fields);
}
