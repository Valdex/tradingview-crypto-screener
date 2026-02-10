# tradingview-crypto-screener

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)

Programmatic access to TradingView's crypto screener with multi-timeframe support and 80+ technical indicators.

**Key feature:** Built-in multi-timeframe collection with automatic per-symbol merge — fetch any combination of timeframes in one call, get a single object per symbol with indicators grouped by TF.

## Install

```bash
npm install tradingview-crypto-screener
```

Requires Node.js 18+ (uses native `fetch`).

## Quick Start

```typescript
import { scan } from 'tradingview-crypto-screener';

const results = await scan({
  exchange: 'BINANCE',
  timeframe: '1h',
  limit: 50,
});

for (const item of results) {
  console.log(item.s, item.d['Price'], item.d['Relative Strength Index (14)']);
}
```

## API

### `scan(options?): Promise<ScanResult[]>`

Fetch screener data for a single timeframe.

| Option | Type | Default | Description |
|---|---|---|---|
| `url` | `string` | TradingView scanner URL | Custom endpoint |
| `exchange` | `string` | `'BINANCE'` | Exchange name |
| `currency` | `string` | `'USDT'` | Quote currency |
| `market` | `string` | `'crypto'` | Market type |
| `timeframe` | `string` | `'5m'` | Timeframe interval |
| `type` | `string[]` | `['perpetual']` | Instrument type filter |
| `filters` | `Filter[]` | `[]` | Custom filters |
| `columns` | `string[]` | auto from fields | Override column list |
| `limit` | `number` | `150` | Max results |
| `sort` | `{ by, order }` | `{ by: 'close', order: 'desc' }` | Sort configuration |
| `range` | `[number, number]` | `[0, limit]` | Pagination range |

### `collect(options?): Promise<CollectedSymbol[]>`

Fetch and merge data across multiple timeframes.

| Option | Type | Default | Description |
|---|---|---|---|
| `timeframes` | `string[]` | `['5m','15m','1h','4h','1d']` | Timeframes to collect |
| `batchSize` | `number` | `150` | Batch size for pagination |
| `fields` | `FieldDefinition[]` | built-in crypto fields | Custom field definitions |
| `staticKeys` | `string[]` | price/volume/volatility keys | Keys that don't vary by timeframe |

Plus all `scan()` options except `timeframe` and `range`.

**Returns** an array of merged symbols where timeframe-dependent values are grouped:

```typescript
[
  {
    symbol: 'BINANCE:BTCUSDT.P',
    Price: '42500',
    'Relative Strength Index (14)': {
      '15m': { value: '55', rating: 'Buy' },
      '1h':  { value: '48', rating: 'Neutral' },
      '4h':  { value: '62', rating: 'Buy' },
      '1d':  { value: '44', rating: 'Neutral' },
    },
    // ...
  }
]
```

### `Filter`

```typescript
interface Filter {
  left: string;        // Field name (e.g. 'RSI', 'volume', 'change')
  operation: string;   // 'equal' | 'greater' | 'less' | 'in_range' | 'has' | ...
  right: any;          // Value or range (e.g. 500000, [30, 70], ['perpetual'])
}
```

## Available Indicators

### Moving Averages
SMA (5, 10, 20, 30, 50, 100, 200), EMA (5, 10, 20, 30, 50, 100, 200), Hull MA (9), VWMA (20), VWAP

### Oscillators
RSI (7, 14), Stochastic %K/%D, Stochastic RSI Fast/Slow, MACD, Momentum, CCI (20), Awesome Oscillator, Bull Bear Power, Ultimate Oscillator, Williams %R, Rate of Change

### Volatility & Channels
Bollinger Bands, Donchian Channels (20), Keltner Channels (20), ATR (14), ADR (14), Parabolic SAR

### Trend
ADX (14), ADX +DI/-DI, Aroon Up/Down (14), Ichimoku (Conversion, Base, Lead A, Lead B)

### Ratings
Technical Rating, Moving Averages Rating, Oscillators Rating

### Candlestick Patterns (25)
Three Black Crows, Three White Soldiers, Abandoned Baby, Doji, Dragonfly Doji, Gravestone Doji, Engulfing (Bearish/Bullish), Evening Star, Morning Star, Hammer, Hanging Man, Harami (Bearish/Bullish), Inverted Hammer, Kicking (Bearish/Bullish), Long Shadow (Lower/Upper), Marubozu (Black/White), Shooting Star, Spinning Top (Black/White), Tri-Star (Bearish/Bullish)

## Supported Timeframes

`1m`, `5m`, `15m`, `30m`, `1h`, `2h`, `4h`, `1d`, `1W`, `1M`

## Supported Exchanges

Pass any of these as the `exchange` option. Default is `BINANCE`.

<details>
<summary>Full list (120+ exchanges)</summary>

`BINANCE`, `BINANCEUS`, `BYBIT`, `OKX`, `COINBASE`, `KRAKEN`, `KUCOIN`, `GATE`, `BITFINEX`, `BITGET`, `HTX`, `MEXC`, `BITSTAMP`, `GEMINI`, `UPBIT`, `BITHUMB`, `BITFLYER`, `CRYPTOCOM`, `COINEX`, `POLONIEX`, `BTSE`, `BITMART`, `BITRUE`, `LBANK`, `WHITEBIT`, `PHEMEX`, `BINGX`, `DERIBIT`, `BITMEX`, `BTCC`, `PIONEX`, `TOOBIT`, `KCEX`, `DEEPCOIN`, `ZOOMEX`, `WOONETWORK`, `XTCOM`, `COINW`, `BITKUB`, `BITAZZA`, `BITVAVO`, `BITSO`, `BLOFIN`, `BYDFI`, `DELTA`, `DELTAIN`, `BITUNIX`, `WEEX`, `BLUEFIN`, `AERODROME`, `AERODROMESLIPSTREAM`, `AGNI`, `BASESWAP`, `BISWAP`, `BLACKHOLE3`, `CAMELOT`, `CAMELOT3ARBITRUM`, `CETUS`, `CURVE`, `CURVEARBITRUM`, `DEDUST`, `HONEYSWAP`, `KATANA`, `KATANA3`, `LFJ2DOT2`, `LYNEX`, `MERCHANTMOELB`, `METEORADLMM`, `METEORADYN`, `MMFINANCE`, `NILE`, `ORCA`, `PANCAKESWAP`, `PANCAKESWAP3ARBITRUM`, `PANCAKESWAP3BASE`, `PANCAKESWAP3BSC`, `PANCAKESWAP3ETH`, `PANCAKESWAP3LINEA`, `PANCAKESWAP3ZKSYNC`, `PANGOLIN`, `PHARAOH`, `PULSEX`, `PULSEX2`, `QUICKSWAP`, `QUICKSWAP3POLYGON`, `QUICKSWAP3POLYGONZKEVM`, `RAMSES2`, `RAYDIUM`, `RAYDIUMCLMM`, `RAYDIUMCPMM`, `SHADOW`, `SPOOKYSWAP`, `STONFI`, `STONFI2`, `SUNSWAP2`, `SUNSWAP3`, `SUSHISWAP`, `SUSHISWAPPOLYGON`, `SYNCSWAP`, `SYNCSWAP2`, `THRUSTER3`, `TRADERJOE`, `TURBOSFINANCE`, `UNISWAP`, `UNISWAP3ARBITRUM`, `UNISWAP3AVALANCHE`, `UNISWAP3BASE`, `UNISWAP3BSC`, `UNISWAP3ETH`, `UNISWAP3OPTIMISM`, `UNISWAP3POLYGON`, `UNISWAPBASE`, `UNISWAPUNICHAIN`, `VELODROME`, `VELODROME2`, `VELODROMESLIPSTREAM`, `VVS3`, `VVSFINANCE`, `WAGMISONIC`, `ZKSWAP`

</details>

## Examples

Run any example with `npx tsx examples/<name>.ts`.

### Basic Scan

Single timeframe, top symbols by volume:

```typescript
import { scan } from 'tradingview-crypto-screener';

async function main() {
  const results = await scan({
    exchange: 'BINANCE',
    timeframe: '1h',
    limit: 10,
    sort: { by: 'volume', order: 'desc' },
  });

  for (const item of results) {
    const d = item.d;
    console.log(`${item.s}`);
    console.log(`  Price: ${d['Price']}  Change: ${d['Change %']}%`);
    console.log(`  RSI(14): ${d['Relative Strength Index (14)']?.value ?? 'N/A'}`);
    console.log(`  Technical Rating: ${d['Technical Rating']?.rating ?? 'N/A'}`);
  }
}

main();
```

### Multi-Timeframe Collection

Collect and merge data across 4 timeframes — each indicator is grouped by TF:

```typescript
import { collect } from 'tradingview-crypto-screener';

async function main() {
  const symbols = await collect({
    exchange: 'BINANCE',
    timeframes: ['15m', '1h', '4h', '1d'],
    limit: 5,
  });

  for (const sym of symbols) {
    console.log(sym.symbol);
    console.log(`  Price: ${sym['Price']}`);

    // RSI grouped by timeframe
    if (sym['Relative Strength Index (14)']) {
      console.log('  RSI(14) by timeframe:');
      for (const [tf, val] of Object.entries(sym['Relative Strength Index (14)'])) {
        console.log(`    ${tf}: ${(val as any)?.value}`);
      }
    }
  }
}

main();
```

Output:

```
BINANCE:BTCUSDT.P
  Price: 68788.4
  RSI(14) by timeframe:
    15m: 42.7663
    1h: 44.3309
    4h: 44.122
    1d: 31.9076
```

### Custom Filters

Filter by RSI range, minimum volume, and change %:

```typescript
import { scan } from 'tradingview-crypto-screener';

async function main() {
  const results = await scan({
    exchange: 'BINANCE',
    timeframe: '1h',
    filters: [
      { left: 'RSI', operation: 'in_range', right: [30, 70] },
      { left: 'volume', operation: 'greater', right: 500000 },
      { left: 'change', operation: 'in_range', right: [-3, 3] },
    ],
    limit: 20,
    sort: { by: 'Recommend.All', order: 'desc' },
  });

  for (const item of results) {
    const d = item.d;
    console.log(`${item.s}`);
    console.log(`  Price: ${d['Price']}  Volume: ${d['Volume']}`);
    console.log(`  RSI(14): ${d['Relative Strength Index (14)']?.value ?? 'N/A'}`);
    console.log(`  MACD: ${d['MACD Level (12, 26)']?.value ?? 'N/A'}`);
    console.log(`  Bollinger: ${d['Bollinger Lower Band (20)']?.value} — ${d['Bollinger Upper Band (20)']?.value}`);
  }
}

main();
```

## Disclaimer

This library uses TradingView's unofficial public screener API. It is not affiliated with, endorsed by, or connected to TradingView in any way. The API may change or become unavailable without notice. Use at your own risk.

## License

[MIT](LICENSE)
