// ESPP Simulator — Pure Calculation Functions
// No DOM dependencies. Safe to import in test environments.
// Reference: ESPP-Calculations.md

// ========== FORMATTING HELPERS ==========

function fmt(n, decimals = 2) {
  return (n ?? 0).toLocaleString('en-GB', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

function fmtE(n, decimals = 2) { return '€' + fmt(n, decimals); }

// ========== CAPITAL GAINS TAX ==========
// Base del ahorro, Spain 2026
// Brackets: 19% up to €6k, 21% €6k–€50k, 23% €50k–€200k, 27% €200k–€300k, 30% >€300k

function capitalGainsTax(gain) {
  if (gain <= 0) return 0;
  let tax = 0;
  const brackets = [
    [6000,    0.19],
    [44000,   0.21],
    [150000,  0.23],
    [100000,  0.27],
    [Infinity, 0.30]
  ];
  let remaining = gain;
  for (const [limit, rate] of brackets) {
    if (remaining <= 0) break;
    const chunk = Math.min(remaining, limit);
    tax += chunk * rate;
    remaining -= chunk;
  }
  return tax;
}

// ========== PERIOD CALCULATION ==========
// contribution  — total euros invested in the period
// startPrice    — share price on first day of the period (in EUR)
// endPrice      — share price on last day of the period (in EUR)
// irpfRate      — employee's IRPF withholding rate (0–100)
// discountPct   — plan discount percentage (default 20)
//
// Returns an object with all intermediate and final values for the period.

function calcPeriod(contribution, startPrice, endPrice, irpfRate, discountPct) {
  const refPrice      = Math.min(startPrice, endPrice);
  const purchasePrice = refPrice * (1 - discountPct / 100);
  const shares        = contribution / purchasePrice;
  const marketValue   = shares * endPrice;    // actual market value at grant = closing price × shares
  const discountComponent     = (refPrice - purchasePrice) * shares; // pure plan discount (ref × discountPct%)
  const appreciationComponent = (endPrice - refPrice) * shares;      // price rise during the period
  const discount      = discountComponent + appreciationComponent;    // total income in kind (rendimiento del trabajo en especie)
  const irpfOnDiscount   = discount * (irpfRate / 100);
  const acquisitionValue = marketValue; // fiscal cost basis = market value at grant (closing price)

  return { contribution, refPrice, purchasePrice, shares, marketValue,
           discount, discountComponent, appreciationComponent, irpfOnDiscount, acquisitionValue };
}

// Export for Node.js / test runners (no-op in browsers)
if (typeof module !== 'undefined') {
  module.exports = { calcPeriod, capitalGainsTax, fmt, fmtE };
}
