import { scan } from '../src';

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

  console.log(`Found ${results.length} symbols matching filters:\n`);

  for (const item of results) {
    const d = item.d;
    console.log(`${item.s}`);
    console.log(`  Price: ${d['Price']}`);
    console.log(`  Volume: ${d['Volume']}`);
    console.log(`  RSI(14): ${d['Relative Strength Index (14)']?.value ?? 'N/A'}`);
    console.log(`  MACD: ${d['MACD Level (12, 26)']?.value ?? 'N/A'}`);
    console.log(`  Bollinger Upper: ${d['Bollinger Upper Band (20)']?.value ?? 'N/A'}`);
    console.log(`  Bollinger Lower: ${d['Bollinger Lower Band (20)']?.value ?? 'N/A'}`);
    console.log();
  }
}

main().catch(console.error);
