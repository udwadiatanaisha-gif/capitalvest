import React, { useState } from 'react';
import { Client, RiskAlert, RiskProfileType } from '../types';
import { formatINR, formatPercent } from '../utils/pdfGenerator';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Activity,
  Layers,
  TrendingDown,
  Scale,
  ShieldCheck,
  Zap,
} from 'lucide-react';

interface RiskCenterProps {
  clients: Client[];
  riskAlerts: RiskAlert[];
  isMasked: boolean;
  onResolveAlert: (alertId: string) => void;
  onSelectClient: (client: Client) => void;
}

export const RiskCenter: React.FC<RiskCenterProps> = ({
  clients,
  riskAlerts,
  isMasked,
  onResolveAlert,
  onSelectClient,
}) => {
  const [filterSeverity, setFilterSeverity] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [selectedScenario, setSelectedScenario] = useState<string>('rate_hike');

  const filteredAlerts = riskAlerts.filter(
    (a) => filterSeverity === 'all' || a.severity === filterSeverity
  );

  const activeAlerts = filteredAlerts.filter((a) => !a.resolved);
  const resolvedAlerts = filteredAlerts.filter((a) => a.resolved);

  const stressScenarios: Record<
    string,
    { title: string; desc: string; eqDrop: number; fiDrop: number; goldGain: number; cashSafe: boolean }
  > = {
    rate_hike: {
      title: 'RBI Repo Rate Hike Shock (+100 bps)',
      desc: 'Reserve Bank of India overtightens policy against stubborn food/fuel inflation; bond yields spike, banking and high-PE equities compress.',
      eqDrop: -10.5,
      fiDrop: -4.2,
      goldGain: +3.8,
      cashSafe: true,
    },
    it_derating: {
      title: 'Global Tech & IT Services Slowdown (-20%)',
      desc: 'US/EU enterprise discretionary spending freeze impacts Tier-1 Indian IT exporters (TCS, Infosys, Wipro); domestic manufacturing & capex plays remain resilient.',
      eqDrop: -18.0,
      fiDrop: +2.5,
      goldGain: +6.5,
      cashSafe: true,
    },
    crude_shock: {
      title: 'Crude Oil & Geopolitical Supply Surge ($110/bbl)',
      desc: 'Brent crude surpasses $110/bbl expanding India current account deficit; INR depreciates, domestic equities decline while Sovereign Gold Bonds rally sharply.',
      eqDrop: -14.2,
      fiDrop: -6.0,
      goldGain: +19.5,
      cashSafe: true,
    },
  };

  const activeScenario = stressScenarios[selectedScenario];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-xl bg-white p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold font-serif-brand text-slate-900">
            Fiduciary Risk Surveillance & Compliance Center (India)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time portfolio surveillance, asset drift monitoring, and macroeconomic stress testing under Indian fiduciary guidelines
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-300">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            Fiduciary Standard Active
          </span>
        </div>
      </div>

      {/* Fiduciary Risk Indicators KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl bg-white p-5 border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold uppercase text-slate-400">Composite Sharpe Ratio (vs NIFTY)</span>
          <div className="text-2xl font-bold font-serif-brand text-blue-900 mt-2">1.38</div>
          <div className="text-xs text-emerald-700 font-semibold mt-1">
            Top Quartile Risk-Adjusted Returns
          </div>
        </div>

        <div className="rounded-xl bg-white p-5 border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold uppercase text-slate-400">Portfolio Beta (vs NIFTY 50)</span>
          <div className="text-2xl font-bold font-serif-brand text-slate-900 mt-2">0.78</div>
          <div className="text-xs text-slate-500 mt-1">Lower Volatility Than Benchmark</div>
        </div>

        <div className="rounded-xl bg-white p-5 border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold uppercase text-slate-400">Max Historical Drawdown</span>
          <div className="text-2xl font-bold font-serif-brand text-slate-900 mt-2">-9.4%</div>
          <div className="text-xs text-slate-500 mt-1">vs -18.2% NIFTY 50 Benchmark Peak-to-Trough</div>
        </div>

        <div className="rounded-xl bg-white p-5 border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold uppercase text-slate-400">Open Risk Alerts</span>
          <div className="text-2xl font-bold font-serif-brand text-amber-700 mt-2">
            {activeAlerts.length} Active
          </div>
          <div className="text-xs text-slate-500 mt-1">{resolvedAlerts.length} Mitigated Recently</div>
        </div>
      </div>

      {/* Live Risk Alerts Panel */}
      <div className="rounded-xl bg-white p-6 border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 font-serif-brand flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-700" />
              Surveillance Risk Alerts & Drift Warnings
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Automated notifications when direct equity allocation drifts beyond ±5%, liquid cash drag accumulates, or family cover is deficient
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Severity:</span>
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value as any)}
              className="px-2.5 py-1 text-xs bg-slate-50 text-slate-700 rounded-lg border border-slate-200 focus:outline-hidden cursor-pointer"
            >
              <option value="all">All Severities</option>
              <option value="high">High Severity Only</option>
              <option value="medium">Medium Severity</option>
              <option value="low">Low Severity</option>
            </select>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {activeAlerts.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
              <p className="text-xs font-bold text-slate-800 mt-2">No Active Risk Alerts</p>
              <p className="text-[11px] text-slate-500">
                All client custody portfolios are within prescribed asset allocation bounds.
              </p>
            </div>
          ) : (
            activeAlerts.map((alert) => (
              <div
                key={alert.id}
                className="p-4 rounded-xl bg-slate-50 hover:bg-slate-100/70 border border-slate-200/90 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                      alert.severity === 'high'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">{alert.clientName}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.2 rounded uppercase ${
                          alert.severity === 'high'
                            ? 'bg-rose-100 text-rose-900 border border-rose-300'
                            : 'bg-amber-100 text-amber-900 border border-amber-300'
                        }`}
                      >
                        {alert.type}
                      </span>
                      <span className="text-[10px] text-slate-400">{alert.date}</span>
                    </div>

                    <p className="text-xs text-slate-700 mt-1">{alert.message}</p>
                    <p className="text-[11px] text-blue-900 font-semibold mt-1 flex items-center gap-1">
                      <Zap className="w-3 h-3 text-amber-600" />
                      <span>Prescribed Mitigation: {alert.suggestedAction}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
                  <button
                    onClick={() => onResolveAlert(alert.id)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Mitigate & Close</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Stress Testing Simulation Sandbox */}
      <div className="rounded-xl bg-white p-6 border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 font-serif-brand flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-900" />
              Indian Macroeconomic Stress Testing Simulator
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Simulate portfolio resilience under RBI rate shocks, IT multiple de-ratings, and crude oil spikes
            </p>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
            {Object.entries(stressScenarios).map(([key, sc]) => (
              <button
                key={key}
                onClick={() => setSelectedScenario(key)}
                className={`px-3 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
                  selectedScenario === key ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {sc.title.split(' ')[0]} Shock
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5 p-4 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">{activeScenario.title}</h3>
            <span className="text-xs font-semibold text-slate-500">CapitalVest Dynamic Stress Engine</span>
          </div>
          <p className="text-xs text-slate-600 mt-1">{activeScenario.desc}</p>

          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-white border border-slate-200">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Indian Equities Impact</span>
              <div className="text-base font-bold text-rose-700 mt-1">{activeScenario.eqDrop}%</div>
            </div>
            <div className="p-3 rounded-lg bg-white border border-slate-200">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Fixed Income / G-Secs</span>
              <div
                className={`text-base font-bold mt-1 ${
                  activeScenario.fiDrop >= 0 ? 'text-emerald-700' : 'text-rose-700'
                }`}
              >
                {activeScenario.fiDrop >= 0 ? '+' : ''}
                {activeScenario.fiDrop}%
              </div>
            </div>
            <div className="p-3 rounded-lg bg-white border border-slate-200">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Gold & SGB Ballast</span>
              <div className="text-base font-bold text-emerald-700 mt-1">+{activeScenario.goldGain}%</div>
            </div>
            <div className="p-3 rounded-lg bg-white border border-slate-200">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Liquid Cash Buffer</span>
              <div className="text-base font-bold text-blue-900 mt-1">100% Principal Safe</div>
            </div>
          </div>
        </div>

        {/* Client Stress Resilience Table */}
        <div className="mt-5 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-2.5 px-4">Client Portfolio</th>
                <th className="py-2.5 px-4">Investable Assets</th>
                <th className="py-2.5 px-4">Risk Mandate</th>
                <th className="py-2.5 px-4">Estimated Drawdown</th>
                <th className="py-2.5 px-4">Stressed Valuation (INR)</th>
                <th className="py-2.5 px-4 text-right">Downside Cushion</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {clients.map((c) => {
                const eqP = (c.allocation.equities + c.allocation.mutualFunds * 0.7) / 100;
                const fiP = c.allocation.fixedIncome / 100;
                const goldP = c.allocation.goldSilver / 100;
                const simReturn =
                  eqP * activeScenario.eqDrop +
                  fiP * activeScenario.fiDrop +
                  goldP * activeScenario.goldGain;
                const stressedVal = c.investableAssets * (1 + simReturn / 100);

                return (
                  <tr key={c.id} className="hover:bg-slate-50/60">
                    <td className="py-3 px-4 font-bold text-slate-900">{c.name}</td>
                    <td className="py-3 px-4">{formatINR(c.investableAssets, { masked: isMasked })}</td>
                    <td className="py-3 px-4 font-medium">{c.riskProfile}</td>
                    <td className="py-3 px-4 font-bold text-rose-700">
                      {simReturn.toFixed(1)}%
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      {formatINR(stressedVal, { masked: isMasked })}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {simReturn > -10 ? 'High Resilience' : 'Moderate Cushion'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
