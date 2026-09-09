"""Minimal walk-forward validation demo.

Grid-searches SmaCrossover parameters on the first part of a dataset
(train) and checks whether the in-sample-best parameters actually hold up
on the untouched remainder (test). This makes the overfitting risk
concrete: a parameter pair that only looks good on the data it was chosen
from is fit to noise, not signal.

Run from the repository root:
    python3 -m btc_trading_sim.optimize
"""
from __future__ import annotations

from typing import List, Tuple

from .data import Bar, generate_synthetic
from .engine import BacktestEngine
from .metrics import Metrics, compute_metrics
from .strategies import SmaCrossover


def split(bars: List[Bar], train_fraction: float = 0.6) -> Tuple[List[Bar], List[Bar]]:
    cut = int(len(bars) * train_fraction)
    return bars[:cut], bars[cut:]


def grid_search_sma(
    bars: List[Bar], capital: float, fee_rate: float, slippage_bps: float,
    fast_range=range(5, 41, 5), slow_range=range(50, 201, 25),
) -> List[Tuple[int, int, Metrics]]:
    engine = BacktestEngine(fee_rate=fee_rate, slippage_bps=slippage_bps)
    results = []
    for fast in fast_range:
        for slow in slow_range:
            if fast >= slow:
                continue
            strat = SmaCrossover(fast=fast, slow=slow)
            equity_curve, trades, _ = engine.run(bars, strat, initial_usdc=capital, initial_btc=0.0)
            m = compute_metrics(strat.name, equity_curve, trades, capital, 0.0)
            results.append((fast, slow, m))
    results.sort(key=lambda r: r[2].btc_vs_hodl_pct, reverse=True)
    return results


def run_walk_forward(bars: List[Bar], capital: float = 6000.0, fee_rate: float = 0.001, slippage_bps: float = 5.0):
    train, test = split(bars)
    train_results = grid_search_sma(train, capital, fee_rate, slippage_bps)
    best_fast, best_slow, best_train_metrics = train_results[0]

    engine = BacktestEngine(fee_rate=fee_rate, slippage_bps=slippage_bps)
    test_strat = SmaCrossover(fast=best_fast, slow=best_slow)
    equity_curve, trades, _ = engine.run(test, test_strat, initial_usdc=capital, initial_btc=0.0)
    test_metrics = compute_metrics(test_strat.name, equity_curve, trades, capital, 0.0)

    print(f"Train bars: {len(train)}, test bars: {len(test)}")
    print(f"Best in-sample params: fast={best_fast}, slow={best_slow}")
    print(f"  train btc_vs_hodl: {best_train_metrics.btc_vs_hodl_pct:+7.2f}%   sharpe: {best_train_metrics.sharpe:.2f}")
    print(f"  test  btc_vs_hodl: {test_metrics.btc_vs_hodl_pct:+7.2f}%   sharpe: {test_metrics.sharpe:.2f}")
    if test_metrics.btc_vs_hodl_pct < best_train_metrics.btc_vs_hodl_pct * 0.3:
        print("  -> Large train/test gap: these parameters are likely overfit to the training window.")
    else:
        print("  -> Test performance roughly holds up; less likely to be pure overfitting (still verify on real data).")
    return best_train_metrics, test_metrics


if __name__ == "__main__":
    bars = generate_synthetic(days=1500, seed=7)
    run_walk_forward(bars)
