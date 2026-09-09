"""Event-driven BTC/USDC backtest engine."""
from __future__ import annotations

from dataclasses import dataclass
from typing import List, Optional, Tuple

from .data import Bar
from .strategies import Order, Strategy


@dataclass
class Trade:
    date: object
    side: str
    price: float
    usdc_amount: float  # spent (buy) or net proceeds (sell), after fee
    btc_amount: float
    fee_usdc: float


@dataclass
class EquityPoint:
    date: object
    price: float
    usdc: float
    btc: float
    value_usd: float


class Portfolio:
    def __init__(self, usdc: float, btc: float):
        self.usdc = usdc
        self.btc = btc

    def value(self, price: float) -> float:
        return self.usdc + self.btc * price


class BacktestEngine:
    def __init__(self, fee_rate: float = 0.001, slippage_bps: float = 5.0):
        """fee_rate: fraction taken as exchange fee per trade (0.001 = 0.10%).
        slippage_bps: execution price penalty in basis points, worse for the
        trader in both directions (buys fill higher, sells fill lower).
        """
        self.fee_rate = fee_rate
        self.slippage_bps = slippage_bps

    def run(
        self, bars: List[Bar], strategy: Strategy, initial_usdc: float, initial_btc: float = 0.0
    ) -> Tuple[List[EquityPoint], List[Trade], Portfolio]:
        portfolio = Portfolio(initial_usdc, initial_btc)
        equity_curve: List[EquityPoint] = []
        trades: List[Trade] = []
        strategy.reset()

        for i, bar in enumerate(bars):
            history = bars[: i + 1]  # strategy never sees future bars
            order = strategy.on_bar(history, portfolio.usdc, portfolio.btc)
            if order is not None:
                trade = self._execute(order, bar, portfolio)
                if trade:
                    trades.append(trade)
            equity_curve.append(EquityPoint(
                date=bar.date, price=bar.close,
                usdc=portfolio.usdc, btc=portfolio.btc,
                value_usd=portfolio.value(bar.close),
            ))
        return equity_curve, trades, portfolio

    def _execute(self, order: Order, bar: Bar, portfolio: Portfolio) -> Optional[Trade]:
        slip = self.slippage_bps / 10000.0
        if order.side == "buy":
            exec_price = bar.close * (1 + slip)
            spend = min(order.usdc_amount, portfolio.usdc)
            if spend <= 0:
                return None
            fee = spend * self.fee_rate
            btc_bought = (spend - fee) / exec_price
            portfolio.usdc -= spend
            portfolio.btc += btc_bought
            return Trade(bar.date, "buy", exec_price, spend, btc_bought, fee)
        elif order.side == "sell":
            exec_price = bar.close * (1 - slip)
            amount = min(order.btc_amount, portfolio.btc)
            if amount <= 0:
                return None
            proceeds = amount * exec_price
            fee = proceeds * self.fee_rate
            portfolio.btc -= amount
            portfolio.usdc += proceeds - fee
            return Trade(bar.date, "sell", exec_price, proceeds - fee, amount, fee)
        return None
