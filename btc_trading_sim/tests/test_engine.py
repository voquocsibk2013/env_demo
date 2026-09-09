import csv as csv_module
import os
import tempfile
import unittest
from datetime import datetime, timedelta

from btc_trading_sim.data import Bar, generate_synthetic, load_csv
from btc_trading_sim.engine import BacktestEngine
from btc_trading_sim.metrics import compute_metrics
from btc_trading_sim.strategies import BuyAndHold, ThresholdRebalance


def make_flat_bars(price, n):
    start = datetime(2021, 1, 1)
    return [Bar(date=start + timedelta(days=i), open=price, high=price, low=price, close=price) for i in range(n)]


class EngineTests(unittest.TestCase):
    def test_buy_and_hold_matches_expected_btc_after_fee(self):
        bars = make_flat_bars(100.0, 10)
        engine = BacktestEngine(fee_rate=0.001, slippage_bps=0.0)
        _equity_curve, trades, portfolio = engine.run(bars, BuyAndHold(), initial_usdc=1000.0, initial_btc=0.0)
        expected_btc = (1000.0 * (1 - 0.001)) / 100.0
        self.assertAlmostEqual(portfolio.btc, expected_btc, places=8)
        self.assertEqual(portfolio.usdc, 0.0)
        self.assertEqual(len(trades), 1)

    def test_portfolio_never_goes_negative(self):
        bars = generate_synthetic(days=300, seed=1)
        engine = BacktestEngine(fee_rate=0.001, slippage_bps=5.0)
        for strat in (BuyAndHold(), ThresholdRebalance(target_btc_weight=0.5, band=0.1)):
            equity_curve, _trades, portfolio = engine.run(bars, strat, initial_usdc=6000.0, initial_btc=0.0)
            self.assertGreaterEqual(portfolio.usdc, -1e-9)
            self.assertGreaterEqual(portfolio.btc, -1e-9)
            for point in equity_curve:
                self.assertGreaterEqual(point.value_usd, 0.0)

    def test_hodl_baseline_has_near_zero_relative_edge(self):
        bars = generate_synthetic(days=500, seed=2)
        engine = BacktestEngine(fee_rate=0.001, slippage_bps=0.0)
        equity_curve, trades, _portfolio = engine.run(bars, BuyAndHold(), initial_usdc=6000.0, initial_btc=0.0)
        m = compute_metrics("buy_and_hold", equity_curve, trades, 6000.0, 0.0)
        # buy_and_hold *is* the hodl baseline, so btc_vs_hodl should be ~0%,
        # modulo the single entry fee it pays that the frictionless baseline doesn't.
        self.assertLess(abs(m.btc_vs_hodl_pct), 1.0)

    def test_threshold_rebalance_accumulates_more_btc_on_a_dip_and_recovery(self):
        start = datetime(2021, 1, 1)
        prices = [100] * 5 + [70] * 5 + [100] * 5  # dip then recovery
        bars = [Bar(date=start + timedelta(days=i), open=p, high=p, low=p, close=p) for i, p in enumerate(prices)]
        engine = BacktestEngine(fee_rate=0.0005, slippage_bps=0.0)
        strat = ThresholdRebalance(target_btc_weight=0.5, band=0.05)
        _equity_curve, trades, portfolio = engine.run(bars, strat, initial_usdc=6000.0, initial_btc=0.0)
        self.assertGreater(len(trades), 1)  # should rebalance on both the dip and the recovery
        naive_end_value = 3000.0 + (3000.0 / 100.0) * prices[-1]  # a static, never-rebalanced 50/50 split
        self.assertGreaterEqual(portfolio.value(prices[-1]), naive_end_value * 0.995)


class CsvLoaderTests(unittest.TestCase):
    def test_load_csv_roundtrip(self):
        with tempfile.NamedTemporaryFile("w", suffix=".csv", delete=False, newline="") as f:
            writer = csv_module.writer(f)
            writer.writerow(["date", "open", "high", "low", "close"])
            writer.writerow(["2021-01-01", "100", "110", "90", "105"])
            writer.writerow(["2021-01-02", "105", "115", "95", "108"])
            path = f.name
        try:
            bars = load_csv(path)
            self.assertEqual(len(bars), 2)
            self.assertEqual(bars[0].close, 105.0)
        finally:
            os.remove(path)


if __name__ == "__main__":
    unittest.main()
