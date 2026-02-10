import { collect } from '../src';

async function main() {
  const symbols = await collect({
    exchange: 'BINANCE',
    timeframes: ['15m', '1h', '4h', '1d'],
    limit: 5,
  });

  console.log(`Collected ${symbols.length} symbols across 4 timeframes:\n`);

  for (const sym of symbols) {
    console.log(`${sym.symbol}`);
    console.log(`  Price: ${sym['Price']}`);

    if (sym['Relative Strength Index (14)']) {
      console.log(`  RSI(14) by timeframe:`);
      for (const [tf, val] of Object.entries(sym['Relative Strength Index (14)'])) {
        const v = val as any;
        console.log(`    ${tf}: ${v?.value ?? v}`);
      }
    }

    if (sym['Technical Rating']) {
      console.log(`  Technical Rating by timeframe:`);
      for (const [tf, val] of Object.entries(sym['Technical Rating'])) {
        const v = val as any;
        console.log(`    ${tf}: ${v?.rating ?? v}`);
      }
    }

    console.log();
  }
}

main().catch(console.error);
