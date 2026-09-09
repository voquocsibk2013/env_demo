"""Performance metrics for a completed backtest run.

Ending BTC holdings (measured in BTC terms, not USD) is the primary metric,
since the goal is accumulating more BTC, not maximizing USD net worth --
those can diverge (e.g. sitting in USDC during a rally grows USD value less
but can also mean fewer BTC bought back later).
"""
from __future__ import annotations

import math
import statistics
from dataclasses import dataclass
from typing import List

from .engine import EquityPoint, Trade


@dataclass
class Metrics:
    strategy: str
    start_value_usd: float
    end_value_usd: float
    end_btc: float
    end_usdc: float
    hodl_end_btc: float
    btc_vs_hodl_pct: float
    cagr_pct: float
    max_drawdown_pct: float
    sharpe: float
    num_trades: int
    total_fees_usd: float

    def as_row(self):
        return [
            self.strategy,
            f"{self.end_value_usd:,.2f}",
            f"{self.end_btc:.6f}",
            f"{self.btc_vs_hodl_pct:+.2f}%",
            f"{self.cagr_pct:+.2f}%",
            f"{self.max_drawdown_pct:.2f}%",
            f"{self.sharpe:.2f}",
            str(self.num_trades),
            f"{self.total_fees_usd:,.2f}",
        ]


HEADERS = ["strategy", "end_value_$", "end_btc", "btc_vs_hodl", "cagr", "max_dd", "sharpe", "trades", "fees_$"]


def compute_metrics(
    strategy_name: str,
    equity_curve: List[EquityPoint],
    trades: List[Trade],
    initial_usdc: float,
    initial_btc: float,
) -> Metrics:
    first_price = equity_curve[0].price
    last_price = equity_curve[-1].price
    start_value = initial_usdc + initial_btc * first_price
    end_point = equity_curve[-1]
    end_value = end_point.value_usd

    hodl_btc = start_value / first_price  # what pure buy-and-hold would end up holding

    years = max((equity_curve[-1].date - equity_curve[0].date).days / 365.25, 1e-9)
    cagr = ((end_value / start_value) ** (1 / years) - 1) * 100 if start_value > 0 else 0.0

    peak = -math.inf
    max_dd = 0.0
    for p in equity_curve:
        peak = max(peak, p.value_usd)
        if peak > 0:
            max_dd = max(max_dd, (peak - p.value_usd) / peak)

    daily_returns = [
        b.value_usd / a.value_usd - 1
        for a, b in zip(equity_curve, equity_curve[1:])
        if a.value_usd > 0
    ]
    if len(daily_returns) > 1 and statistics.pstdev(daily_returns) > 0:
        sharpe = statistics.fmean(daily_returns) / statistics.pstdev(daily_returns) * math.sqrt(365)
    else:
        sharpe = 0.0

    total_fees = sum(t.fee_usdc for t in trades)
    end_btc_equiv = end_point.btc + end_point.usdc / last_price  # everything valued in BTC terms
    btc_vs_hodl_pct = (end_btc_equiv / hodl_btc - 1) * 100 if hodl_btc > 0 else 0.0

    return Metrics(
        strategy=strategy_name,
        start_value_usd=start_value,
        end_value_usd=end_value,
        end_btc=end_point.btc,
        end_usdc=end_point.usdc,
        hodl_end_btc=hodl_btc,
        btc_vs_hodl_pct=btc_vs_hodl_pct,
        cagr_pct=cagr,
        max_drawdown_pct=max_dd * 100,
        sharpe=sharpe,
        num_trades=len(trades),
        total_fees_usd=total_fees,
    )
