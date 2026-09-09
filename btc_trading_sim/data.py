"""Historical/synthetic OHLC bar data for the BTC/USDC backtester."""
from __future__ import annotations

import csv
import math
import random
from dataclasses import dataclass
from datetime import datetime, timedelta
from typing import List, Optional


@dataclass(frozen=True)
class Bar:
    date: datetime
    open: float
    high: float
    low: float
    close: float


def load_csv(path: str) -> List[Bar]:
    """Load daily OHLC bars from a CSV with columns: date, open, high, low, close.

    Column matching is case-insensitive and order-independent, so exports
    from Binance/Kraken/Yahoo Finance/CoinGecko all work as long as those
    five columns exist (extra columns like volume are ignored).
    """
    bars = []
    with open(path, newline="") as f:
        reader = csv.DictReader(f)
        fieldmap = {name.strip().lower(): name for name in reader.fieldnames or []}
        required = ["date", "open", "high", "low", "close"]
        missing = [c for c in required if c not in fieldmap]
        if missing:
            raise ValueError(f"CSV missing required columns {missing}; found {reader.fieldnames}")
        for row in reader:
            date = _parse_date(row[fieldmap["date"]])
            bars.append(Bar(
                date=date,
                open=float(row[fieldmap["open"]]),
                high=float(row[fieldmap["high"]]),
                low=float(row[fieldmap["low"]]),
                close=float(row[fieldmap["close"]]),
            ))
    bars.sort(key=lambda b: b.date)
    return bars


def _parse_date(raw: str) -> datetime:
    raw = raw.strip()
    for fmt in ("%Y-%m-%d", "%Y-%m-%dT%H:%M:%S", "%Y-%m-%d %H:%M:%S", "%m/%d/%Y"):
        try:
            return datetime.strptime(raw, fmt)
        except ValueError:
            continue
    try:
        ts = float(raw)
        if ts > 1e12:  # milliseconds
            ts /= 1000.0
        return datetime.utcfromtimestamp(ts)
    except ValueError as e:
        raise ValueError(f"Unrecognized date format: {raw!r}") from e


# Regime-switching synthetic generator.
# NOT calibrated to reproduce actual BTC history -- see generate_synthetic().
_REGIMES = {
    # name: (daily_drift, daily_vol)
    "bull": (0.0035, 0.030),
    "bear": (-0.0035, 0.045),
    "chop": (0.0000, 0.020),
}

_TRANSITIONS = {
    "bull": {"bull": 0.85, "chop": 0.12, "bear": 0.03},
    "bear": {"bear": 0.80, "chop": 0.15, "bull": 0.05},
    "chop": {"chop": 0.70, "bull": 0.18, "bear": 0.12},
}


def generate_synthetic(
    days: int = 1500,
    start_price: float = 20000.0,
    start_date: Optional[datetime] = None,
    seed: Optional[int] = 42,
    jump_prob: float = 0.01,
    jump_size_std: float = 0.08,
) -> List[Bar]:
    """Generate a regime-switching synthetic BTC/USDC daily price series.

    This is NOT real market data and makes no claim to reproduce actual BTC
    history. It exists so the engine and strategies can be exercised
    end-to-end without live network access (this sandbox blocks every
    exchange/data API). It cycles through bull/bear/chop regimes via a
    Markov chain, with an added rare jump term for crash/spike shocks, so
    trend-following and mean-reversion strategies each get stretches where
    they should win and lose. Use load_csv() with real exchange data (see
    fetch_binance_data.py) for anything you intend to trust.
    """
    rng = random.Random(seed)
    start_date = start_date or datetime(2020, 1, 1)
    regime = "chop"
    days_in_regime = 0
    run_length = rng.randint(15, 45)
    price = start_price
    bars = []
    for i in range(days):
        if days_in_regime >= run_length:
            regime = _next_regime(rng, regime)
            days_in_regime = 0
            run_length = rng.randint(15, 45)
        drift, vol = _REGIMES[regime]
        shock = rng.gauss(0, 1)
        ret = drift + vol * shock
        if rng.random() < jump_prob:
            ret += rng.gauss(0, jump_size_std)
        open_p = price
        close_p = max(price * math.exp(ret), 1.0)
        high_p = max(open_p, close_p) * (1 + abs(rng.gauss(0, vol * 0.3)))
        low_p = min(open_p, close_p) * (1 - abs(rng.gauss(0, vol * 0.3)))
        date = start_date + timedelta(days=i)
        bars.append(Bar(date=date, open=open_p, high=high_p, low=low_p, close=close_p))
        price = close_p
        days_in_regime += 1
    return bars


def _next_regime(rng: random.Random, current: str) -> str:
    probs = _TRANSITIONS[current]
    r = rng.random()
    cum = 0.0
    for name, p in probs.items():
        cum += p
        if r <= cum:
            return name
    return current
