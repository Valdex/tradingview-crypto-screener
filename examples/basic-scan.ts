import { scan } from '../src';

async function main() {
  const results = await scan({
    exchange: 'BINANCE',
    timeframe: '1h',
    limit: 10,
    sort: { by: 'volume', order: 'desc' },
  });

  console.log(`Found ${results.length} symbols:\n`);

  for (const item of results) {
    const d = item.d;
    console.log(`${item.s}`);
    console.log(`  Price: ${d['Price']}  Change: ${d['Change %']}%`);
    console.log(`  RSI(14): ${d['Relative Strength Index (14)']?.value ?? 'N/A'}`);
    console.log(`  Technical Rating: ${d['Technical Rating']?.rating ?? 'N/A'}`);
    console.log();
  }
}

main().catch(console.error);
