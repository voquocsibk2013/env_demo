"""CLI: run one or more strategies over BTC/USDC price data and compare them
against a buy-and-hold baseline, ranked by BTC accumulated (not USD value).

Run from the repository root as a module (needed for the package's relative
imports):

    python3 -m btc_trading_sim.run_backtest --synthetic
    python3 -m btc_trading_sim.run_backtest --csv btc_usdc_daily.csv
    python3 -m btc_trading_sim.run_backtest --csv btc_usdc_daily.csv \\
        --strategies sma_crossover,rsi_mean_reversion
"""
from __future__ import annotations

import argparse
import sys

from .data import generate_synthetic, load_csv
from .engine import BacktestEngine
from .metrics import HEADERS, compute_metrics
from .strategies import (
    DCA,
    BuyAndHold,
    DonchianBreakout,
    GridTrading,
    RsiMeanReversion,
    SmaCrossover,
    ThresholdRebalance,
)


def build_strategies(names, price_low, price_high):
    catalog = {
        "buy_and_hold": lambda: BuyAndHold(),
        "dca": lambda: DCA(interval_days=7, amount_usdc=100.0),
        "threshold_rebalance": lambda: ThresholdRebalance(target_btc_weight=0.5, band=0.10),
        "sma_crossover": lambda: SmaCrossover(fast=20, slow=100),
        "rsi_mean_reversion": lambda: RsiMeanReversion(period=14, buy_below=30, sell_above=70),
        "donchian_breakout": lambda: DonchianBreakout(channel=20),
        "grid_trading": lambda: GridTrading(low=price_low, high=price_high, levels=10),
    }
    selected = list(catalog.keys()) if names is None else names
    out = []
    for n in selected:
        if n not in catalog:
            raise SystemExit(f"Unknown strategy '{n}'. Choices: {list(catalog)}")
        out.append(catalog[n]())
    return out


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--csv", help="Path to a daily OHLC CSV (date,open,high,low,close)")
    parser.add_argument("--synthetic", action="store_true",
                         help="Use the built-in synthetic regime-switching generator instead of real data")
    parser.add_argument("--days", type=int, default=1500, help="Days of synthetic data to generate")
    parser.add_argument("--seed", type=int, default=42, help="Synthetic data RNG seed")
    parser.add_argument("--capital", type=float, default=6000.0, help="Starting portfolio value in USD, all in USDC")
    parser.add_argument("--fee-bps", type=float, default=10.0, help="Fee in basis points per trade (10 = 0.10%%)")
    parser.add_argument("--slippage-bps", type=float, default=5.0, help="Execution slippage in basis points")
    parser.add_argument("--strategies", help="Comma-separated strategy names to run (default: all)")
    args = parser.parse_args()

    if not args.csv and not args.synthetic:
        print("No data source given, defaulting to --synthetic (see --help for real data via --csv)\n",
              file=sys.stderr)
        args.synthetic = True

    bars = load_csv(args.csv) if args.csv else generate_synthetic(days=args.days, seed=args.seed)
    prices = [b.close for b in bars]

    engine = BacktestEngine(fee_rate=args.fee_bps / 10000.0, slippage_bps=args.slippage_bps)
    names = args.strategies.split(",") if args.strategies else None
    strategies = build_strategies(names, price_low=min(prices), price_high=max(prices))

    source_desc = "SYNTHETIC - not real market data" if args.synthetic else args.csv
    print(f"Data: {len(bars)} bars, {bars[0].date.date()} -> {bars[-1].date.date()}, "
          f"price {bars[0].close:,.0f} -> {bars[-1].close:,.0f} ({source_desc})")
    print()

    rows = []
    for strat in strategies:
        equity_curve, trades, _portfolio = engine.run(bars, strat, initial_usdc=args.capital, initial_btc=0.0)
        m = compute_metrics(strat.name, equity_curve, trades, args.capital, 0.0)
        rows.append(m.as_row())

    widths = [max(len(h), max(len(r[i]) for r in rows)) for i, h in enumerate(HEADERS)]

    def fmt_row(r):
        return "  ".join(c.ljust(widths[i]) for i, c in enumerate(r))

    print(fmt_row(HEADERS))
    print("  ".join("-" * w for w in widths))
    for r in sorted(rows, key=lambda r: float(r[3].rstrip("%")), reverse=True):
        print(fmt_row(r))

    print()
    print("btc_vs_hodl: % more (or fewer) BTC-equivalent ended up held vs. buying BTC once and holding.")


if __name__ == "__main__":
    main()
