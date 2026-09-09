"""Fetch real daily BTC/USDC OHLC history from Binance's public REST API and
save it as a CSV compatible with data.load_csv().

IMPORTANT: this needs unrestricted internet access and will NOT work inside
a network-sandboxed session -- this Claude Code remote environment's egress
proxy blocks api.binance.com (and every other market-data host) by policy.
Run this on your own machine, then pass the resulting CSV to run_backtest.py
via --csv.

Usage:
    python3 fetch_binance_data.py --symbol BTCUSDC --days 1500 --out btc_usdc_daily.csv
"""
from __future__ import annotations

import argparse
import csv
import json
import time
import urllib.request

BASE_URL = "https://api.binance.com/api/v3/klines"


def fetch_klines(symbol: str, interval: str, days: int):
    end_ms = int(time.time() * 1000)
    day_ms = 24 * 60 * 60 * 1000
    cursor = end_ms - days * day_ms
    all_rows = []
    while cursor < end_ms:
        url = f"{BASE_URL}?symbol={symbol}&interval={interval}&startTime={cursor}&limit=1000"
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=20) as r:
            batch = json.load(r)
        if not batch:
            break
        all_rows.extend(batch)
        cursor = batch[-1][0] + day_ms
        if len(batch) < 1000:
            break
        time.sleep(0.2)  # be polite to the public rate limit
    return all_rows


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--symbol", default="BTCUSDC")
    parser.add_argument("--interval", default="1d")
    parser.add_argument("--days", type=int, default=1500)
    parser.add_argument("--out", default="btc_usdc_daily.csv")
    args = parser.parse_args()

    rows = fetch_klines(args.symbol, args.interval, args.days)
    with open(args.out, "w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(["date", "open", "high", "low", "close", "volume"])
        for k in rows:
            date = time.strftime("%Y-%m-%d", time.gmtime(k[0] / 1000))
            writer.writerow([date, k[1], k[2], k[3], k[4], k[5]])
    print(f"Wrote {len(rows)} rows to {args.out}")


if __name__ == "__main__":
    main()
