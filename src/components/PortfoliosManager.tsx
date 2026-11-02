import React, { useState } from 'react';
import { Client, Holding } from '../types';
import { MARKET_BENCHMARKS } from '../data/mockData';
import { formatINR, formatPercent } from '../utils/pdfGenerator';
import {
  PieChart,
  TrendingUp,
  RefreshCw,
  Scale,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  DollarSign,
  AlertCircle,
  BarChart3,
} from 'lucide-react';

interface PortfoliosManagerProps {
  clients: Client[];
  isMasked: boolean;
  onSelectClient: (client: Client) => void;
}

export const PortfoliosManager: React.FC<PortfoliosManagerProps> = ({
  clients,
  isMasked,
  onSelectClient,
}) => {
  const [selectedClientId, setSelectedClientId] = useState<string>(clients[0]?.id || '');
  const [showRebalanceModal, setShowRebalanceModal] = useState<boolean>(false);
  const [rebalancedSuccess, setRebalancedSuccess] = useState<boolean>(false);
  const [activeBenchmarkId, setActiveBenchmarkId] = useState<string>('nifty-50');

  const activeClient = clients.find((c) => c.id === selectedClientId) || clients[0];
  const activeBenchmark =
    MARKET_BENCHMARKS.find((b) => b.id === activeBenchmarkId) || MARKET_BENCHMARKS[0];

  const totalInvestable = activeClient ? activeClient.investableAssets : 0;
  const currentAlloc = activeClient
    ? activeClient.allocation
    : { equities: 0, mutualFunds: 0, fixedIncome: 0, goldSilver: 0, realEstate: 0, cash: 0 };
  const targetAlloc = activeClient
    ? activeClient.targetAllocation
    : { equities: 0, mutualFunds: 0, fixedIncome: 0, goldSilver: 0, realEstate: 0, cash: 0 };

  const assetCategories: {
    key: keyof typeof currentAlloc;
    label: string;
    color: string;
    bg: string;
  }[] = [
    { key: 'equities', label: 'Indian Equities (Direct NSE/BSE)', color: 'text-blue-700', bg: 'bg-blue-700' },
    { key: 'mutualFunds', label: 'Mutual Funds (Equity & Hybrid)', color: 'text-indigo-600', bg: 'bg-indigo-600' },
    { key: 'fixedIncome', label: 'Fixed Income, G-Secs & PPF', color: 'text-sky-600', bg: 'bg-sky-600' },
    { key: 'goldSilver', label: 'Gold & Sovereign Gold Bonds (SGB)', color: 'text-amber-500', bg: 'bg-amber-500' },
    { key: 'realEstate', label: 'Real Estate & Indian REITs', color: 'text-amber-700', bg: 'bg-amber-700' },
    { key: 'cash', label: 'Liquid Mutual Funds & Bank Balances', color: 'text-emerald-600', bg: 'bg-emerald-600' },
  ];

  // Rebalancing calculations in INR
  const rebalanceAdjustments = assetCategories.map((cat) => {
    const currPct = currentAlloc[cat.key] || 0;
    const targPct = targetAlloc[cat.key] || 0;
    const variancePct = currPct - targPct;
    const targetValue = (totalInvestable * targPct) / 100;
    const currentValue = (totalInvestable * currPct) / 100;
    const diffDollar = targetValue - currentValue; // positive = buy/allocate, negative = trim
    return {
      ...cat,
      currPct,
      targPct,
      variancePct,
      currentValue,
      targetValue,
      diffDollar,
    };
  });

  const hasSignificantDrift = rebalanceAdjustments.some((r) => Math.abs(r.variancePct) >= 5);

  return (
    <div className="space-y-6">
      {/* Client Selector & Benchmark Row */}
      <div className="rounded-xl bg-white p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold font-serif-brand text-slate-900">
            Portfolio Asset Allocation & Custody Engine (Indian Markets)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            NSE/BSE direct equities, active mutual funds, sovereign debt (G-Secs), SGBs, and REITs under fiduciary care
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-600">Client Account:</label>
            <select
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              className="px-3 py-1.5 text-xs font-semibold bg-slate-50 text-slate-900 rounded-lg border border-slate-200 focus:outline-hidden cursor-pointer"
            >
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({formatINR(c.investableAssets, { compact: true })})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-600">Benchmark:</label>
            <select
              value={activeBenchmarkId}
              onChange={(e) => setActiveBenchmarkId(e.target.value)}
              className="px-3 py-1.5 text-xs font-semibold bg-slate-50 text-slate-900 rounded-lg border border-slate-200 focus:outline-hidden cursor-pointer"
            >
              {MARKET_BENCHMARKS.map((bm) => (
                <option key={bm.id} value={bm.id}>
                  {bm.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Portfolio Performance KPI Row */}
      {activeClient && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-xl bg-white p-5 border border-slate-200 shadow-xs">
            <span className="text-xs font-semibold uppercase text-slate-400">Total Investable Assets</span>
            <div className="text-2xl font-bold font-serif-brand text-slate-900 mt-2">
              {formatINR(activeClient.investableAssets, { masked: isMasked })}
            </div>
            <div className="mt-1 text-xs text-slate-500 font-medium">
              Net Worth: {formatINR(activeClient.totalNetWorth, { compact: true, masked: isMasked })}
            </div>
          </div>

          <div className="rounded-xl bg-white p-5 border border-slate-200 shadow-xs">
            <span className="text-xs font-semibold uppercase text-slate-400">Portfolio YTD vs Benchmark</span>
            <div className="text-2xl font-bold font-serif-brand text-emerald-700 mt-2 flex items-center">
              <ArrowUpRight className="w-5 h-5 mr-0.5" />
              {formatPercent(activeClient.ytdReturnPercent)}
            </div>
            <div className="mt-1 text-xs text-slate-500 font-medium">
              Benchmark ({activeBenchmark.name.split(' ')[0]}): {formatPercent(activeBenchmark.ytdReturn)}
            </div>
          </div>

          <div className="rounded-xl bg-white p-5 border border-slate-200 shadow-xs">
            <span className="text-xs font-semibold uppercase text-slate-400">Capital Gains Status (FY 2026-27)</span>
            <div className="text-2xl font-bold font-serif-brand text-blue-900 mt-2">
              +{formatINR(activeClient.unrealizedGain, { compact: true, masked: isMasked })}
            </div>
            <div className="mt-1 text-xs text-slate-500 font-medium">
              Realized YTD: +{formatINR(activeClient.realizedGainYtd, { compact: true, masked: isMasked })}
            </div>
          </div>

          <div className="rounded-xl bg-white p-5 border border-slate-200 shadow-xs">
            <span className="text-xs font-semibold uppercase text-slate-400">Rebalance Mandate</span>
            <div className="text-2xl font-bold font-serif-brand mt-2 flex items-center gap-2">
              {hasSignificantDrift ? (
                <span className="text-amber-700 text-lg font-bold">Action Needed (Drift &gt; 5%)</span>
              ) : (
                <span className="text-emerald-700 text-lg font-bold">Optimal Alignment</span>
              )}
            </div>
            <div className="mt-1 text-xs">
              <button
                onClick={() => setShowRebalanceModal(true)}
                className="text-blue-800 hover:text-blue-950 font-semibold underline cursor-pointer"
              >
                Run Tactical Rebalancer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Target vs Current Asset Allocation Table & Visualizer */}
      <div className="rounded-xl bg-white p-6 border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 font-serif-brand flex items-center gap-2">
              <Scale className="w-4 h-4 text-blue-900" />
              Target vs Actual Asset Allocation Matrix (Indian Markets)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Tactical tolerance band ±5.0%. Direct equity runs or cash drag trigger automated rebalance tickets.
            </p>
          </div>

          <button
            onClick={() => setShowRebalanceModal(true)}
            className="px-3.5 py-1.5 rounded-lg bg-blue-900 hover:bg-blue-950 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Generate Rebalance Orders</span>
          </button>
        </div>

        {/* Visual Stack Bar */}
        <div className="mt-6 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-600 font-medium">
            <span>Current Asset Distribution:</span>
            <span>100% Fully Allocated</span>
          </div>
          <div className="h-4 w-full rounded-full overflow-hidden flex bg-slate-100 shadow-inner">
            {assetCategories.map((cat) => (
              <div
                key={cat.key}
                style={{ width: `${currentAlloc[cat.key] || 0}%` }}
                className={`${cat.bg} transition-all`}
                title={`${cat.label}: ${currentAlloc[cat.key] || 0}%`}
              />
            ))}
          </div>
        </div>

        {/* Allocation Breakdown Table */}
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Asset Class</th>
                <th className="py-3 px-4">Current %</th>
                <th className="py-3 px-4">Target Mandate %</th>
                <th className="py-3 px-4">Variance</th>
                <th className="py-3 px-4">Current Value (INR)</th>
                <th className="py-3 px-4">Target Value</th>
                <th className="py-3 px-4 text-right">Fiduciary Trade Order</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {rebalanceAdjustments.map((row) => {
                const isOver = row.variancePct > 0;
                const isAlert = Math.abs(row.variancePct) >= 5;
                return (
                  <tr key={row.key} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${row.bg}`} />
                      <span>{row.label}</span>
                    </td>

                    <td className="py-3 px-4 font-semibold text-slate-800">{row.currPct}%</td>

                    <td className="py-3 px-4 text-slate-600">{row.targPct}%</td>

                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                          isAlert
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {isOver ? '+' : ''}
                        {row.variancePct}%
                      </span>
                    </td>

                    <td className="py-3 px-4 font-medium text-slate-900">
                      {formatINR(row.currentValue, { masked: isMasked })}
                    </td>

                    <td className="py-3 px-4 text-slate-600">
                      {formatINR(row.targetValue, { masked: isMasked })}
                    </td>

                    <td className="py-3 px-4 text-right font-semibold">
                      {row.diffDollar > 0 ? (
                        <span className="text-emerald-700">
                          BUY +{formatINR(row.diffDollar, { masked: isMasked })}
                        </span>
                      ) : row.diffDollar < 0 ? (
                        <span className="text-rose-700">
                          TRIM {formatINR(Math.abs(row.diffDollar), { masked: isMasked })}
                        </span>
                      ) : (
                        <span className="text-slate-400">In Balance</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Custody Securities & Scheme Holdings Table */}
      {activeClient && (
        <div className="rounded-xl bg-white border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 font-serif-brand">
                Individual Indian Securities, Schemes & Custody Holdings
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Custody segregated accounts across NSE, BSE, CSDL, NSDL & RBI Retail Direct
              </p>
            </div>
            <span className="text-xs text-slate-500 font-medium">
              {activeClient.holdings.length} Securities Held
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Symbol / Scheme</th>
                  <th className="py-3 px-4">Asset Class</th>
                  <th className="py-3 px-4">Units / Qty</th>
                  <th className="py-3 px-4">Avg Cost (INR)</th>
                  <th className="py-3 px-4">Current Price / NAV</th>
                  <th className="py-3 px-4">Current Value</th>
                  <th className="py-3 px-4">YTD Gain</th>
                  <th className="py-3 px-4 text-right">Yield</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {activeClient.holdings.map((h) => (
                  <tr key={h.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-blue-950 text-sm">{h.symbol}</div>
                      <div className="text-[11px] text-slate-500">{h.name}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-800">{h.assetClass}</div>
                      {h.subCategory && (
                        <div className="text-[10px] text-slate-400">{h.subCategory}</div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-slate-700">
                      {h.quantity.toLocaleString('en-IN')}
                    </td>

                    <td className="py-3.5 px-4 text-slate-600">
                      ₹{h.avgCost.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                    </td>

                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      ₹{h.currentPrice.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                    </td>

                    <td className="py-3.5 px-4 font-bold text-slate-900 text-sm">
                      {formatINR(h.currentValue, { masked: isMasked })}
                    </td>

                    <td className="py-3.5 px-4 font-bold text-emerald-700">
                      <span className="inline-flex items-center">
                        <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
                        {formatPercent(h.ytdReturnPercent)}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right font-medium text-slate-700">
                      {h.annualYieldOrDividend.toFixed(2)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Rebalance Modal */}
      {showRebalanceModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2 text-slate-900">
                <RefreshCw className="w-5 h-5 text-blue-900" />
                <h3 className="text-lg font-bold font-serif-brand">
                  Tactical Rebalance Order Ticket: {activeClient?.name}
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowRebalanceModal(false);
                  setRebalancedSuccess(false);
                }}
                className="text-slate-400 hover:text-slate-600 text-lg px-2 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {rebalancedSuccess ? (
              <div className="p-6 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h4 className="text-base font-bold text-slate-900">
                  Fiduciary Rebalance Batch Staged Successfully
                </h4>
                <p className="text-xs text-slate-600 max-w-md mx-auto">
                  Trade instructions have been queued for execution through primary custody brokers (HDFC Sec / ICICI Direct / Kotak Sec) optimizing for Section 112A LTCG tax thresholds.
                </p>
                <button
                  onClick={() => {
                    setShowRebalanceModal(false);
                    setRebalancedSuccess(false);
                  }}
                  className="px-4 py-2 bg-blue-950 text-white text-xs font-semibold rounded-lg mt-3 cursor-pointer"
                >
                  Return to Portfolios
                </button>
              </div>
            ) : (
              <>
                <p className="text-xs text-slate-600">
                  The following trade transactions will be submitted to re-align portfolio weights with the signed mandate. Capital gains grandfathering and FIFO tax-lot optimization will be applied.
                </p>

                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {rebalanceAdjustments
                    .filter((r) => r.diffDollar !== 0)
                    .map((item) => (
                      <div
                        key={item.key}
                        className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-bold text-slate-900">{item.label}</div>
                          <div className="text-slate-500 text-[11px]">
                            Current: {item.currPct}% → Mandate Target: {item.targPct}%
                          </div>
                        </div>

                        <div className="text-right">
                          {item.diffDollar > 0 ? (
                            <span className="font-bold text-emerald-700 px-2.5 py-1 rounded bg-emerald-50 border border-emerald-200">
                              BUY +{formatINR(item.diffDollar, { masked: isMasked })}
                            </span>
                          ) : (
                            <span className="font-bold text-rose-700 px-2.5 py-1 rounded bg-rose-50 border border-rose-200">
                              TRIM -{formatINR(Math.abs(item.diffDollar), { masked: isMasked })}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                </div>

                <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
                  <button
                    onClick={() => setShowRebalanceModal(false)}
                    className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setRebalancedSuccess(true)}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg shadow-xs cursor-pointer"
                  >
                    Authorize & Stage Orders
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
