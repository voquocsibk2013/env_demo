"""Trading strategies for the BTC/USDC backtester.

Each strategy implements on_bar(history, usdc, btc) -> Optional[Order].
`history` is only the bars up to and including the current one, so
strategies cannot see the future (no lookahead bias).
"""
from __future__ import annotations

import statistics
from dataclasses import dataclass
from typing import List, Optional

from .data import Bar


@dataclass
class Order:
    side: str  # "buy" or "sell"
    usdc_amount: float = 0.0  # for buy: USDC to spend
    btc_amount: float = 0.0   # for sell: BTC to sell


class Strategy:
    name = "base"

    def reset(self) -> None:
        """Called once before each run to clear internal state."""

    def on_bar(self, history: List[Bar], usdc: float, btc: float) -> Optional[Order]:
        raise NotImplementedError


class BuyAndHold(Strategy):
    """Baseline: convert all starting USDC to BTC on day one, then do nothing.

    This is the bar every other strategy has to clear. Because it's also the
    BTC-accumulation benchmark itself, "beating buy-and-hold" specifically
    means ending up with more BTC than this strategy would hold.
    """
    name = "buy_and_hold"

    def reset(self):
        self._bought = False

    def on_bar(self, history, usdc, btc):
        if not self._bought and usdc > 0:
            self._bought = True
            return Order("buy", usdc_amount=usdc)
        return None


class DCA(Strategy):
    """Dollar-cost averaging: buy a fixed USDC amount every N days.

    Not a "buy low sell high" strategy, but a strong, boring baseline that's
    genuinely hard to beat after fees -- worth comparing against.
    """
    name = "dca"

    def __init__(self, interval_days: int = 7, amount_usdc: float = 100.0):
        self.interval_days = interval_days
        self.amount_usdc = amount_usdc

    def reset(self):
        self._day = 0

    def on_bar(self, history, usdc, btc):
        self._day += 1
        if self._day % self.interval_days == 0 and usdc > 0:
            return Order("buy", usdc_amount=min(self.amount_usdc, usdc))
        return None


class ThresholdRebalance(Strategy):
    """Keep a target BTC allocation; rebalance only when it drifts past a band.

    This mechanically buys dips (BTC's value share drops -> buy BTC) and
    sells rips (BTC's share rises -> sell BTC) without predicting direction.
    Simple and hard to overfit; a solid volatility-harvesting baseline.
    """
    name = "threshold_rebalance"

    def __init__(self, target_btc_weight: float = 0.5, band: float = 0.10):
        self.target = target_btc_weight
        self.band = band

    def reset(self):
        pass

    def on_bar(self, history, usdc, btc):
        price = history[-1].close
        value = usdc + btc * price
        if value <= 0:
            return None
        btc_value = btc * price
        btc_weight = btc_value / value
        target_btc_value = self.target * value
        if btc_weight > self.target + self.band:
            return Order("sell", btc_amount=(btc_value - target_btc_value) / price)
        elif btc_weight < self.target - self.band:
            return Order("buy", usdc_amount=target_btc_value - btc_value)
        return None


class SmaCrossover(Strategy):
    """Trend-following: go all-in BTC when fast SMA > slow SMA, else all-cash."""
    name = "sma_crossover"

    def __init__(self, fast: int = 20, slow: int = 100):
        self.fast = fast
        self.slow = slow

    def reset(self):
        self._in_btc = False

    def on_bar(self, history, usdc, btc):
        if len(history) < self.slow + 1:
            return None
        closes = [b.close for b in history]
        fast_sma = statistics.fmean(closes[-self.fast:])
        slow_sma = statistics.fmean(closes[-self.slow:])
        if fast_sma > slow_sma and not self._in_btc:
            self._in_btc = True
            if usdc > 0:
                return Order("buy", usdc_amount=usdc)
        elif fast_sma <= slow_sma and self._in_btc:
            self._in_btc = False
            if btc > 0:
                return Order("sell", btc_amount=btc)
        return None


class RsiMeanReversion(Strategy):
    """Mean-reversion: buy a slice when RSI is oversold, sell a slice when overbought."""
    name = "rsi_mean_reversion"

    def __init__(self, period: int = 14, buy_below: float = 30.0,
                 sell_above: float = 70.0, trade_fraction: float = 0.5):
        self.period = period
        self.buy_below = buy_below
        self.sell_above = sell_above
        self.trade_fraction = trade_fraction

    def reset(self):
        pass

    def _rsi(self, closes: List[float]) -> Optional[float]:
        if len(closes) < self.period + 1:
            return None
        window = closes[-(self.period + 1):]
        gains, losses = [], []
        for i in range(1, len(window)):
            change = window[i] - window[i - 1]
            gains.append(max(change, 0.0))
            losses.append(max(-change, 0.0))
        avg_gain = statistics.fmean(gains)
        avg_loss = statistics.fmean(losses)
        if avg_loss == 0:
            return 100.0
        rs = avg_gain / avg_loss
        return 100.0 - (100.0 / (1.0 + rs))

    def on_bar(self, history, usdc, btc):
        rsi = self._rsi([b.close for b in history])
        if rsi is None:
            return None
        if rsi < self.buy_below and usdc > 0:
            return Order("buy", usdc_amount=usdc * self.trade_fraction)
        elif rsi > self.sell_above and btc > 0:
            return Order("sell", btc_amount=btc * self.trade_fraction)
        return None


class DonchianBreakout(Strategy):
    """Trend-following: buy on an N-day high breakout, sell on an N-day low breakdown."""
    name = "donchian_breakout"

    def __init__(self, channel: int = 20):
        self.channel = channel

    def reset(self):
        self._in_btc = False

    def on_bar(self, history, usdc, btc):
        if len(history) <= self.channel:
            return None
        window = history[-(self.channel + 1):-1]  # excludes today, no lookahead
        highest = max(b.high for b in window)
        lowest = min(b.low for b in window)
        price = history[-1].close
        if price > highest and not self._in_btc:
            self._in_btc = True
            if usdc > 0:
                return Order("buy", usdc_amount=usdc)
        elif price < lowest and self._in_btc:
            self._in_btc = False
            if btc > 0:
                return Order("sell", btc_amount=btc)
        return None


class GridTrading(Strategy):
    """Static buy/sell grid between [low, high]; trades a fixed slice whenever
    price crosses a grid line, buying on the way down and selling on the way up.

    Works well in range-bound chop, bleeds capital chasing a level outside
    the grid during a sustained trend. NOTE: in this demo `low`/`high` are
    typically set from the full backtest's price range (see run_backtest.py),
    which is a lookahead simplification for illustration only -- in
    production you'd calibrate the grid from a trailing lookback window.
    """
    name = "grid_trading"

    def __init__(self, low: float, high: float, levels: int = 10, capital_fraction: float = 1.0):
        self.low = low
        self.high = high
        self.levels = levels
        self.capital_fraction = capital_fraction

    def reset(self):
        self._last_level_index: Optional[int] = None

    def _level_index(self, price: float) -> Optional[int]:
        if price < self.low or price > self.high:
            return None
        step = (self.high - self.low) / self.levels
        return int((price - self.low) // step)

    def on_bar(self, history, usdc, btc):
        price = history[-1].close
        idx = self._level_index(price)
        if idx is None:
            self._last_level_index = None
            return None
        if self._last_level_index is None:
            self._last_level_index = idx
            return None
        order = None
        if idx < self._last_level_index and usdc > 0:
            spend = (usdc * self.capital_fraction) / self.levels
            order = Order("buy", usdc_amount=min(spend, usdc))
        elif idx > self._last_level_index and btc > 0:
            amount = (btc * self.capital_fraction) / self.levels
            order = Order("sell", btc_amount=min(amount, btc))
        self._last_level_index = idx
        return order
