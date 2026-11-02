import React from 'react';
import { Client, ReviewSession, RiskAlert } from '../types';
import { MARKET_BENCHMARKS } from '../data/mockData';
import { formatINR, formatPercent, formatIndianDate } from '../utils/pdfGenerator';
import {
  TrendingUp,
  ShieldAlert,
  Calendar,
  Users,
  PieChart,
  ArrowUpRight,
  AlertTriangle,
  Award,
  ChevronRight,
  FileDown,
  FileSpreadsheet,
  BarChart3,
  Coins,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { NavTab } from './Header';

interface DashboardOverviewProps {
  clients: Client[];
  reviews: ReviewSession[];
  riskAlerts: RiskAlert[];
  isMasked: boolean;
  onSelectClient: (client: Client) => void;
  onNavigateTab: (tab: NavTab) => void;
  onResolveAlert: (id: string) => void;
  onDownloadClientPdf: (client: Client) => void;
  onDownloadFirmReport: () => void;
  onOpenExcelHub: () => void;
  onOpenAdvisoryAi?: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  clients,
  reviews,
  riskAlerts,
  isMasked,
  onSelectClient,
  onNavigateTab,
  onResolveAlert,
  onDownloadClientPdf,
  onDownloadFirmReport,
  onOpenExcelHub,
  onOpenAdvisoryAi,
}) => {
  const totalInvestable = clients.reduce((sum, c) => sum + c.investableAssets, 0);
  const totalNetWorth = clients.reduce((sum, c) => sum + c.totalNetWorth, 0);
  const totalLiabilities = clients.reduce((sum, c) => sum + c.liabilities, 0);
  const avgYtd = clients.length ? clients.reduce((sum, c) => sum + c.ytdReturnPercent, 0) / clients.length : 0;
  const totalUnrealizedGains = clients.reduce((sum, c) => sum + c.unrealizedGain, 0);
  const totalGapsCount = clients.reduce((sum, c) => sum + c.insuranceGaps.length, 0);
  const criticalGapsCount = clients.reduce(
    (sum, c) => sum + c.insuranceGaps.filter((g) => g.severity === 'Critical').length,
    0
  );
  const activeAlerts = riskAlerts.filter((a) => !a.resolved);
  const totalSipInflows = clients.reduce(
    (acc, c) => acc + c.sipCommitments.reduce((sAcc, s) => sAcc + s.amount, 0),
    0
  );

  // Consolidated weighted asset allocation across all clients
  const firmAllocation = clients.reduce(
    (acc, c) => {
      acc.equities += (c.investableAssets * c.allocation.equities) / 100;
      acc.mutualFunds += (c.investableAssets * c.allocation.mutualFunds) / 100;
      acc.fixedIncome += (c.investableAssets * c.allocation.fixedIncome) / 100;
      acc.goldSilver += (c.investableAssets * c.allocation.goldSilver) / 100;
      acc.realEstate += (c.investableAssets * c.allocation.realEstate) / 100;
      acc.cash += (c.investableAssets * c.allocation.cash) / 100;
      return acc;
    },
    { equities: 0, mutualFunds: 0, fixedIncome: 0, goldSilver: 0, realEstate: 0, cash: 0 }
  );

  const allocPercentages = {
    equities: totalInvestable ? Math.round((firmAllocation.equities / totalInvestable) * 100) : 0,
    mutualFunds: totalInvestable ? Math.round((firmAllocation.mutualFunds / totalInvestable) * 100) : 0,
    fixedIncome: totalInvestable ? Math.round((firmAllocation.fixedIncome / totalInvestable) * 100) : 0,
    goldSilver: totalInvestable ? Math.round((firmAllocation.goldSilver / totalInvestable) * 100) : 0,
    realEstate: totalInvestable ? Math.round((firmAllocation.realEstate / totalInvestable) * 100) : 0,
    cash: totalInvestable ? Math.round((firmAllocation.cash / totalInvestable) * 100) : 0,
  };

  return (
    <div className="space-y-6">
      {/* Welcome & Indian Wealth Advisory Mission Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-950 via-slate-900 to-blue-900 text-white p-6 sm:p-8 shadow-md border border-blue-900/50">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-500/15 via-transparent to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-400/30 text-amber-300 text-xs font-semibold mb-3">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>CapitalVest Indian Family Office & HNI Wealth Advisory</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight font-serif-brand">
              Building Wealth. Securing Generations.
            </h1>
            <p className="mt-2 text-slate-300 text-sm leading-relaxed">
              Fiduciary multi-asset portfolio management, direct equity surveillance, systematic mutual fund planning, sovereign fixed-income preservation, and insurance protection audits for Indian households.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-300">
              <span>Lead Wealth Advisor: <strong className="text-amber-300">Tanaisha Udwadia, CFA</strong></span>
              <span>•</span>
              <span>Financial Year: <strong className="text-white">FY 2026-27</strong></span>
              <span>•</span>
              <span>Market Regime: <strong className="text-emerald-400">NSE / BSE Active</strong></span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => (onOpenAdvisoryAi ? onOpenAdvisoryAi() : onNavigateTab('dashboard'))}
              className="px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white text-xs font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer border border-amber-400/40"
              title="Open CapitalVest Advisory AI Popup"
            >
              <Sparkles className="w-4 h-4 text-amber-200 animate-pulse" />
              <span>Advisory AI (Chatbot)</span>
            </button>
            <button
              onClick={onOpenExcelHub}
              className="px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Excel Sync Hub</span>
            </button>
            <button
              onClick={onDownloadFirmReport}
              className="px-3.5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-blue-950 text-xs font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <FileDown className="w-4 h-4" />
              <span>Export Dossier (₹)</span>
            </button>
            <button
              onClick={() => onNavigateTab('reviews')}
              className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/20 text-xs font-medium transition-all flex items-center gap-2 cursor-pointer"
            >
              <Calendar className="w-4 h-4 text-amber-300" />
              <span>Review Calendar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Critical Risk & Protection Shortfall Alert Banner */}
      {activeAlerts.length > 0 && (
        <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 shadow-xs">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-amber-100 text-amber-800 shrink-0 mt-0.5">
                <AlertTriangle className="w-5 h-5 text-amber-700" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                    Fiduciary Risk Advisory: {activeAlerts.length} Surveillance Triggers Active
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-200 text-amber-900">
                    High Priority
                  </span>
                </div>
                <p className="text-xs text-amber-800/90 mt-1">
                  <strong>{activeAlerts[0].clientName}:</strong> {activeAlerts[0].message}
                </p>
                <p className="text-[11px] text-amber-700 mt-0.5 font-medium">
                  Prescribed Action: {activeAlerts[0].suggestedAction}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => onResolveAlert(activeAlerts[0].id)}
                className="px-2.5 py-1 text-xs font-semibold rounded bg-amber-200 hover:bg-amber-300 text-amber-900 transition-colors cursor-pointer"
              >
                Mark Mitigated
              </button>
              <button
                onClick={() => onNavigateTab('risk')}
                className="px-2.5 py-1 text-xs font-semibold rounded bg-amber-800 hover:bg-amber-900 text-white transition-colors cursor-pointer flex items-center gap-1"
              >
                <span>View All ({activeAlerts.length})</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Primary KPI Cards Grid (INR) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Investable Assets */}
        <div className="rounded-xl bg-white p-5 border border-slate-200 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold tracking-wider uppercase text-slate-500">
              Investable Assets Under Advisory
            </span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-700">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-serif-brand text-slate-900">
              {formatINR(totalInvestable, { masked: isMasked })}
            </div>
            <div className="mt-1 flex items-center gap-2 text-xs">
              <span className="inline-flex items-center text-emerald-700 font-semibold">
                <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
                {formatPercent(avgYtd)} Composite YTD
              </span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-500 font-medium">
                {formatINR(totalUnrealizedGains, { compact: true, masked: isMasked })} Unrealized
              </span>
            </div>
          </div>
        </div>

        {/* Aggregate Net Worth & Liabilities */}
        <div className="rounded-xl bg-white p-5 border border-slate-200 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold tracking-wider uppercase text-slate-500">
              Total Managed Family Net Worth
            </span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-700">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-serif-brand text-slate-900">
              {formatINR(totalNetWorth, { masked: isMasked })}
            </div>
            <div className="mt-1 flex items-center gap-2 text-xs">
              <span className="text-slate-700 font-semibold">{clients.length} Client Families</span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-500">
                Liabilities: {formatINR(totalLiabilities, { compact: true, masked: isMasked })}
              </span>
            </div>
          </div>
        </div>

        {/* Protection & Insurance Gaps */}
        <div className="rounded-xl bg-white p-5 border border-slate-200 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold tracking-wider uppercase text-slate-500">
              Family Protection Gaps
            </span>
            <div className="p-2 rounded-lg bg-rose-50 text-rose-700">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-serif-brand text-slate-900">
              {totalGapsCount} Identified
            </div>
            <div className="mt-1 flex items-center gap-2 text-xs">
              <span className="text-rose-700 font-semibold">{criticalGapsCount} Critical Deficits</span>
              <span className="text-slate-400">•</span>
              <button
                onClick={() => onNavigateTab('insurance')}
                className="text-blue-700 hover:text-blue-900 underline font-medium cursor-pointer"
              >
                Review Gaps
              </button>
            </div>
          </div>
        </div>

        {/* Monthly Systematic Inflows (SIP) */}
        <div className="rounded-xl bg-white p-5 border border-slate-200 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold tracking-wider uppercase text-slate-500">
              Monthly SIP Commitments
            </span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-serif-brand text-slate-900">
              {formatINR(totalSipInflows, { masked: isMasked })}/mo
            </div>
            <div className="mt-1 flex items-center gap-2 text-xs">
              <span className="text-slate-700 font-medium">Automatic Inflows</span>
              <span className="text-slate-400">•</span>
              <button
                onClick={() => onNavigateTab('goals')}
                className="text-blue-700 hover:text-blue-900 underline font-medium cursor-pointer"
              >
                Track Goals
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Indian Market Benchmarks Ticker */}
      <div className="rounded-xl bg-white p-4 border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-blue-900" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Indian Market Benchmarks (Indicative Sample Levels)
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">
            Source: NSE / BSE / CRISIL • As of 31 Oct 2026
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mt-3">
          {MARKET_BENCHMARKS.map((bm) => (
            <div key={bm.id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80">
              <div className="text-[10px] font-bold text-slate-600 truncate">{bm.name}</div>
              <div className="text-sm font-bold text-slate-900 mt-0.5">
                {bm.currentLevel.toLocaleString('en-IN', { maximumFractionDigits: 1 })}
              </div>
              <div className="mt-1 flex items-center justify-between text-[11px]">
                <span className="text-emerald-700 font-semibold">{formatPercent(bm.ytdReturn)} YTD</span>
                <span className="text-slate-400">{formatPercent(bm.oneYearReturn)} 1Y</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Two Column Layout: Asset Allocation & Review Timelines */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Composite Indian Asset Allocation Bar Chart */}
        <div className="lg:col-span-2 rounded-xl bg-white p-6 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900 font-serif-brand flex items-center gap-2">
                <PieChart className="w-4 h-4 text-blue-800" />
                Composite Asset Allocation (Indian Markets)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Total ₹{(totalInvestable / 10000000).toFixed(2)} Cr Investable Assets across Indian Equities, Mutual Funds, G-Secs, SGBs, REITs & Cash
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('portfolios')}
              className="text-xs font-semibold text-blue-800 hover:text-blue-950 flex items-center gap-1 cursor-pointer"
            >
              <span>Detailed Portfolios</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Allocation Progress Bar */}
          <div className="mt-5">
            <div className="h-4 w-full rounded-full overflow-hidden flex bg-slate-100 shadow-inner">
              <div
                style={{ width: `${allocPercentages.equities}%` }}
                className="bg-blue-800 hover:opacity-90 transition-all"
                title={`Indian Equities: ${allocPercentages.equities}%`}
              />
              <div
                style={{ width: `${allocPercentages.mutualFunds}%` }}
                className="bg-indigo-600 hover:opacity-90 transition-all"
                title={`Mutual Funds: ${allocPercentages.mutualFunds}%`}
              />
              <div
                style={{ width: `${allocPercentages.fixedIncome}%` }}
                className="bg-sky-600 hover:opacity-90 transition-all"
                title={`Fixed Income & Small Savings: ${allocPercentages.fixedIncome}%`}
              />
              <div
                style={{ width: `${allocPercentages.goldSilver}%` }}
                className="bg-amber-500 hover:opacity-90 transition-all"
                title={`Gold & SGBs: ${allocPercentages.goldSilver}%`}
              />
              <div
                style={{ width: `${allocPercentages.realEstate}%` }}
                className="bg-amber-700 hover:opacity-90 transition-all"
                title={`Real Estate & REITs: ${allocPercentages.realEstate}%`}
              />
              <div
                style={{ width: `${allocPercentages.cash}%` }}
                className="bg-emerald-600 hover:opacity-90 transition-all"
                title={`Cash & Liquid Reserves: ${allocPercentages.cash}%`}
              />
            </div>
          </div>

          {/* Asset Allocation Badges / Stats */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-800"></span>
                <span className="text-xs font-semibold text-slate-700">Direct Equities</span>
              </div>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="text-base font-bold text-slate-900">{allocPercentages.equities}%</span>
                <span className="text-xs text-slate-500">
                  {formatINR(firmAllocation.equities, { compact: true, masked: isMasked })}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
                <span className="text-xs font-semibold text-slate-700">Mutual Funds</span>
              </div>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="text-base font-bold text-slate-900">{allocPercentages.mutualFunds}%</span>
                <span className="text-xs text-slate-500">
                  {formatINR(firmAllocation.mutualFunds, { compact: true, masked: isMasked })}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-600"></span>
                <span className="text-xs font-semibold text-slate-700">G-Secs & Deposits</span>
              </div>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="text-base font-bold text-slate-900">{allocPercentages.fixedIncome}%</span>
                <span className="text-xs text-slate-500">
                  {formatINR(firmAllocation.fixedIncome, { compact: true, masked: isMasked })}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <span className="text-xs font-semibold text-slate-700">Gold & SGBs</span>
              </div>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="text-base font-bold text-slate-900">{allocPercentages.goldSilver}%</span>
                <span className="text-xs text-slate-500">
                  {formatINR(firmAllocation.goldSilver, { compact: true, masked: isMasked })}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-700"></span>
                <span className="text-xs font-semibold text-slate-700">Real Estate / REITs</span>
              </div>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="text-base font-bold text-slate-900">{allocPercentages.realEstate}%</span>
                <span className="text-xs text-slate-500">
                  {formatINR(firmAllocation.realEstate, { compact: true, masked: isMasked })}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                <span className="text-xs font-semibold text-slate-700">Cash Reserves</span>
              </div>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="text-base font-bold text-slate-900">{allocPercentages.cash}%</span>
                <span className="text-xs text-slate-500">
                  {formatINR(firmAllocation.cash, { compact: true, masked: isMasked })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Review Calendar Card */}
        <div className="rounded-xl bg-white p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900 font-serif-brand flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-700" />
                Upcoming Reviews
              </h2>
              <button
                onClick={() => onNavigateTab('reviews')}
                className="text-xs font-semibold text-blue-800 hover:text-blue-950 cursor-pointer"
              >
                All Reviews
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {reviews.slice(0, 3).map((r) => (
                <div
                  key={r.id}
                  className="p-3 rounded-lg bg-slate-50 hover:bg-slate-100/80 border border-slate-200/70 transition-all cursor-pointer"
                  onClick={() => onNavigateTab('reviews')}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{r.clientName}</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200">
                      {r.date}
                    </span>
                  </div>
                  <div className="text-[11px] font-medium text-amber-800 mt-1">{r.type}</div>
                  <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{r.agenda}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-center">
            <span className="text-xs text-slate-500">
              Advising under Indian Fiduciary Code • Lead Advisor: Tanaisha Udwadia, CFA
            </span>
          </div>
        </div>
      </div>

      {/* Top Client Accounts Snapshot Table */}
      <div className="rounded-xl bg-white border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 font-serif-brand">
              Active Client Portfolio Dossiers (India)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Select any client to inspect asset holdings, financial goals, insurance gaps, or download PDF report
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('clients')}
            className="text-xs font-bold px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
          >
            <span>Manage All Clients ({clients.length})</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Client Name & City</th>
                <th className="py-3 px-4">Tier & Risk Mandate</th>
                <th className="py-3 px-4">Investable Assets (INR)</th>
                <th className="py-3 px-4">Net Worth</th>
                <th className="py-3 px-4">YTD Return</th>
                <th className="py-3 px-4">Protection Status</th>
                <th className="py-3 px-4">Next Review</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {clients.map((c) => {
                const hasGaps = c.insuranceGaps.length > 0;
                return (
                  <tr
                    key={c.id}
                    className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                    onClick={() => onSelectClient(c)}
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 group-hover:text-blue-900 transition-colors">
                        {c.name}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                        <span>{c.city}</span>
                        <span>•</span>
                        <span className="font-mono text-[10px] text-slate-400">PAN: {c.panNumber}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${
                          c.tier === 'Ultra HNI'
                            ? 'bg-amber-50 text-amber-900 border-amber-300'
                            : 'bg-blue-50 text-blue-900 border-blue-200'
                        }`}
                      >
                        {c.tier}
                      </span>
                      <div className="text-[11px] font-medium text-slate-700 mt-0.5">
                        {c.riskProfile}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{formatINR(c.investableAssets, { masked: isMasked })}</div>
                      <div className="text-[11px] text-slate-500">
                        {c.holdings.length} Securities Held
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{formatINR(c.totalNetWorth, { masked: isMasked })}</div>
                      <div className="text-[10px] text-slate-400">
                        Liab: {formatINR(c.liabilities, { compact: true, masked: isMasked })}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-emerald-700">{formatPercent(c.ytdReturnPercent)}</div>
                      <div className="text-[10px] text-slate-500">
                        vs {c.benchmark.split(' ')[0]}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      {hasGaps ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
                          <AlertTriangle className="w-3 h-3 text-rose-600" />
                          {c.insuranceGaps.length} Shortfall{c.insuranceGaps.length > 1 ? 's' : ''}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          Fully Protected
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-slate-600">{c.nextReviewDate}</td>

                    <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onDownloadClientPdf(c)}
                          title="Download Client Report PDF (INR)"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-950 hover:bg-slate-100 border border-transparent hover:border-slate-300 transition-colors cursor-pointer"
                        >
                          <FileDown className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onSelectClient(c)}
                          className="px-2.5 py-1 text-xs font-semibold rounded bg-blue-900 hover:bg-blue-950 text-white transition-colors cursor-pointer"
                        >
                          Dossier
                        </button>
                      </div>
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
