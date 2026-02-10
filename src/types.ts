export interface Filter {
  left: string;
  operation: 'equal' | 'greater' | 'less' | 'in_range' | 'has' | 'not_equal' | 'crosses' | 'crosses_above' | 'crosses_below';
  right: string | number | boolean | [number, number] | string[];
}

export interface SortOption {
  by: string;
  order: 'asc' | 'desc';
}

export interface ScanOptions {
  url?: string;
  exchange?: string;
  currency?: string;
  market?: string;
  timeframe?: string;
  type?: string[];
  filters?: Filter[];
  columns?: string[];
  limit?: number;
  sort?: SortOption;
  range?: [number, number];
}

export interface CollectOptions extends Omit<ScanOptions, 'timeframe' | 'range'> {
  timeframes?: string[];
  batchSize?: number;
  fields?: FieldDefinition[];
  staticKeys?: string[];
}

export interface FieldDefinition {
  label: string;
  field_name: string;
  format: 'text' | 'float' | 'round' | 'percent' | 'rating' | 'recommendation' | 'computed_recommendation' | 'number_group' | 'bool' | 'missing';
  interval: boolean;
  historical: boolean;
}

export interface FieldMap {
  [key: string]: FieldDefinition;
}

export interface RatingValue {
  value: string;
  rating: string;
}

export interface SymbolData {
  symbol: string;
  data: Record<string, any>;
}

export interface ScanResult {
  s: string;
  d: Record<string, any>;
}

export interface CollectedSymbol {
  symbol: string;
  [key: string]: any;
}

export interface RawTradingViewResponse {
  totalCount?: number;
  data: Array<{
    s: string;
    d: any[];
  }>;
}

export type Timeframe = '1m' | '5m' | '15m' | '30m' | '1h' | '2h' | '4h' | '1d' | '1W' | '1w' | '1M';
