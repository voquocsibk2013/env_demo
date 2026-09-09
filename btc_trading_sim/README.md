# BTC/USDC Trading Simulator

A dependency-free (stdlib-only) backtesting engine for testing BTC/USDC
trading strategies, built to answer one question: **does a given strategy
end up holding more BTC than just buying once and holding?**

That's a deliberately different question from "did USD net worth go up."
Every metric here is reported in BTC-equivalent terms first, because sitting
in USDC during a rally can grow your USD balance while leaving you with
*fewer* BTC than you started chasing.

## Why synthetic data, and how to use real data instead

This was built inside a network-sandboxed session that blocks every
exchange/market-data API (Binance, Coinbase, Kraken, CoinGecko, Yahoo
Finance all returned `EGRESS_BLOCKED` / 403 here) — only npm/pypi/github
were reachable. So there was no way to pull real BTC/USDC history from
inside that environment. Two ways around it:

1. **Bring your own CSV.** `data.load_csv()` reads any CSV with
   `date,open,high,low,close` columns (case-insensitive, any order, extra
   columns ignored) — this is the format Binance, Kraken, and Yahoo Finance
   exports already use.
2. **Run `fetch_binance_data.py` on a machine with normal internet access**
   (not in this sandbox) to pull real daily BTC/USDC klines straight from
   Binance's public REST API into that CSV format:
   ```
   python3 fetch_binance_data.py --symbol BTCUSDC --days 1500 --out btc_usdc_daily.csv
   ```

Until you plug in real data, `--synthetic` generates a regime-switching
price series (Markov chain over bull/bear/chop regimes, plus rare jump
shocks) so the engine and strategies can be exercised end-to-end. **It is
not calibrated to reproduce actual BTC history and results on it are
illustrative only** — validate anything promising on real data before
trusting it.

## Quick start

```bash
# from the repo root
python3 -m btc_trading_sim.run_backtest --synthetic --capital 6000
```

Compare specific strategies, or plug in real data:

```bash
python3 -m btc_trading_sim.run_backtest --csv btc_usdc_daily.csv \
    --strategies sma_crossover,threshold_rebalance,rsi_mean_reversion
```

Check whether a strategy's "best" parameters are real signal or overfitting
noise via a simple train/test split:

```bash
python3 -m btc_trading_sim.optimize
```

Run the test suite:

```bash
python3 -m unittest discover btc_trading_sim/tests
```

## Strategies included

| name | idea | tends to win when | tends to lose when |
|---|---|---|---|
| `buy_and_hold` | buy once, never trade | strong sustained trend (up) | — it's the baseline other strategies are measured against |
| `dca` | buy a fixed $ amount every N days | choppy/declining markets (averages down) | strong sustained uptrend (buys in too slowly) |
| `threshold_rebalance` | hold target BTC/USDC weight, rebalance past a drift band | range-bound/choppy markets | strong sustained trend either direction (fights it) |
| `sma_crossover` | full BTC when fast SMA > slow SMA, else full cash | strong trends, protects capital in crashes | choppy markets (whipsaws) |
| `rsi_mean_reversion` | buy oversold, sell overbought | range-bound markets | strong trends (buys dips that keep dipping) |
| `donchian_breakout` | buy N-day-high breakouts, sell N-day-low breakdowns | strong trends, especially early | choppy markets (false breakouts) |
| `grid_trading` | fixed buy/sell grid across a price range | range-bound markets | trending outside the grid range |

Across random synthetic seeds run during development: in strong uptrends
`buy_and_hold` was nearly unbeatable; in declining/choppy paths
`sma_crossover` and `threshold_rebalance` clearly beat it. **No single
strategy won across all regimes** — which is the actual finding worth
taking seriously, not an artifact to explain away.

## Design notes / what's deliberately simple

- **Fees and slippage** are modeled (`--fee-bps`, `--slippage-bps`,
  default 0.10% fee + 0.05% slippage per trade) — enough trades in a
  strategy and this dominates the results, which is realistic.
- **No lookahead**: every strategy only sees bars up to and including the
  current one. The one exception is `grid_trading`'s `low`/`high` grid
  bounds, which `run_backtest.py` sets from the full dataset's min/max —
  called out in that strategy's docstring since it's illustrative only; a
  real deployment would calibrate the grid from a trailing window.
- **Position sizing** is simplistic (all-in/all-out or fixed fractions) by
  design, to keep each strategy's logic legible. Extending to
  volatility-scaled position sizing or a portfolio of strategies run
  concurrently would be the natural next step.
- **`optimize.py`** only grid-searches one strategy (`sma_crossover`) over
  two parameters as a demonstration. The pattern (train/test split, compare
  in-sample-best vs out-of-sample) generalizes to any strategy/parameter set.

## Suggested next steps

1. Pull real BTC/USDC history (`fetch_binance_data.py` on an unrestricted
   machine, or any CSV export) and re-run every strategy on it.
2. Widen the walk-forward split to multiple folds across different market
   regimes (2018 bear, 2020-21 bull, 2022 crash, 2023-24 chop) rather than
   one train/test cut.
3. If a strategy survives that, paper-trade it against a live price feed
   before ever touching real capital.
