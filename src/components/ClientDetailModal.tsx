import React, { useState } from 'react';
import { Client } from '../types';
import { formatINR, formatPercent } from '../utils/pdfGenerator';
import {
  X,
  FileDown,
  Edit3,
  Calendar,
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  PieChart,
  Target,
  FileCheck,
  ArrowUpRight,
  User,
  Phone,
  Mail,
  AlertTriangle,
  Lock,
  MapPin,
  Coins,
} from 'lucide-react';

interface ClientDetailModalProps {
  client: Client;
  isMasked: boolean;
  onClose: () => void;
  onEditClient: (client: Client) => void;
  onDownloadPdf: (client: Client) => void;
}

export const ClientDetailModal: React.FC<ClientDetailModalProps> = ({
  client,
  isMasked,
  onClose,
  onEditClient,
  onDownloadPdf,
}) => {
  const [activeTab, setActiveTab] = useState<'holdings' | 'goals' | 'insurance' | 'sips' | 'notes'>(
    'holdings'
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Modal Top Bar */}
        <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-blue-900 text-white p-5 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                  client.tier === 'Ultra HNI'
                    ? 'bg-amber-400 text-blue-950 border-amber-300'
                    : 'bg-blue-800 text-white border-blue-700'
                }`}
              >
                {client.tier}
              </span>
              <span className="text-xs text-amber-300 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                {client.kycStatus}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold font-serif-brand mt-1.5 text-white">
              {client.name}
            </h2>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 mt-1">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {client.city} • {client.residentStatus}
              </span>
              <span>•</span>
              <span className="font-mono text-amber-300">PAN: {client.panNumber}</span>
              <span>•</span>
              <span>Lead Advisor: {client.advisor}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onDownloadPdf(client)}
              className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-blue-950 font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>Export PDF (₹)</span>
            </button>
            <button
              onClick={() => onEditClient(client)}
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium text-xs flex items-center gap-1.5 border border-white/20 transition-colors cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Record</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Client KPI Ribbon (INR) */}
        <div className="bg-slate-50 border-b border-slate-200 p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Total Net Worth</span>
            <div className="text-base font-bold text-slate-900 font-serif-brand">
              {formatINR(client.totalNetWorth, { masked: isMasked })}
            </div>
            <span className="text-[10px] text-slate-500">
              Liabilities: {formatINR(client.liabilities, { compact: true, masked: isMasked })}
            </span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Investable Assets</span>
            <div className="text-base font-bold text-blue-950 font-serif-brand">
              {formatINR(client.investableAssets, { masked: isMasked })}
            </div>
            <span className="text-[10px] text-slate-500">
              {client.holdings.length} Securities Held
            </span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Portfolio Return (YTD)</span>
            <div className="text-base font-bold text-emerald-700 flex items-center font-serif-brand">
              <ArrowUpRight className="w-4 h-4 mr-0.5" />
              {formatPercent(client.ytdReturnPercent)}
            </div>
            <span className="text-[10px] text-slate-500">
              Benchmark: {client.benchmark.split(' ')[0]}
            </span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Risk & Emergency Fund</span>
            <div className="text-base font-bold text-slate-900 font-serif-brand">
              {client.riskProfile}
            </div>
            <span className="text-[10px] text-emerald-700 font-semibold">
              Emergency: {client.emergencyFundStatus} ({client.emergencyFundMonths}M)
            </span>
          </div>
        </div>

        {/* Dossier Tabs */}
        <div className="border-b border-slate-200 px-5 flex items-center gap-4 text-xs font-semibold bg-white overflow-x-auto">
          <button
            onClick={() => setActiveTab('holdings')}
            className={`py-3 border-b-2 whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'holdings'
                ? 'border-blue-900 text-blue-950'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <PieChart className="w-4 h-4" />
            <span>Holdings & Allocation ({client.holdings.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('goals')}
            className={`py-3 border-b-2 whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'goals'
                ? 'border-blue-900 text-blue-950'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Target className="w-4 h-4" />
            <span>Financial Goals ({client.goals.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('insurance')}
            className={`py-3 border-b-2 whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'insurance'
                ? 'border-blue-900 text-blue-950'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Protection & Gaps ({client.insuranceGaps.length} Gaps)</span>
          </button>

          <button
            onClick={() => setActiveTab('sips')}
            className={`py-3 border-b-2 whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'sips'
                ? 'border-blue-900 text-blue-950'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Coins className="w-4 h-4" />
            <span>SIP Schedule ({client.sipCommitments.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('notes')}
            className={`py-3 border-b-2 whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'notes'
                ? 'border-blue-900 text-blue-950'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Fiduciary Notes & Tax Details</span>
          </button>
        </div>

        {/* Dossier Body Content */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {activeTab === 'holdings' && (
            <div className="space-y-4">
              {/* Asset Allocation Breakdown bar */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-xs font-bold text-slate-800 block mb-2">
                  Asset Allocation Distribution vs Mandate Target
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  <div className="p-2 bg-white rounded border border-slate-200">
                    <span className="text-slate-500">Indian Equities:</span>{' '}
                    <strong>{client.allocation.equities}%</strong> (Target: {client.targetAllocation.equities}%)
                  </div>
                  <div className="p-2 bg-white rounded border border-slate-200">
                    <span className="text-slate-500">Mutual Funds:</span>{' '}
                    <strong>{client.allocation.mutualFunds}%</strong> (Target: {client.targetAllocation.mutualFunds}%)
                  </div>
                  <div className="p-2 bg-white rounded border border-slate-200">
                    <span className="text-slate-500">Fixed Income & G-Sec:</span>{' '}
                    <strong>{client.allocation.fixedIncome}%</strong> (Target: {client.targetAllocation.fixedIncome}%)
                  </div>
                  <div className="p-2 bg-white rounded border border-slate-200">
                    <span className="text-slate-500">Gold & SGB:</span>{' '}
                    <strong>{client.allocation.goldSilver}%</strong> (Target: {client.targetAllocation.goldSilver}%)
                  </div>
                  <div className="p-2 bg-white rounded border border-slate-200">
                    <span className="text-slate-500">Real Estate / REITs:</span>{' '}
                    <strong>{client.allocation.realEstate}%</strong> (Target: {client.targetAllocation.realEstate}%)
                  </div>
                  <div className="p-2 bg-white rounded border border-slate-200">
                    <span className="text-slate-500">Cash Reserves:</span>{' '}
                    <strong>{client.allocation.cash}%</strong> (Target: {client.targetAllocation.cash}%)
                  </div>
                </div>
              </div>

              {/* Holdings Table */}
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase text-[10px]">
                    <tr>
                      <th className="py-2.5 px-3">Symbol / Scheme</th>
                      <th className="py-2.5 px-3">Instrument Name</th>
                      <th className="py-2.5 px-3">Asset Class</th>
                      <th className="py-2.5 px-3">Units / Qty</th>
                      <th className="py-2.5 px-3">Market Value</th>
                      <th className="py-2.5 px-3">YTD Gain</th>
                      <th className="py-2.5 px-3 text-right">Yield</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {client.holdings.map((h) => (
                      <tr key={h.id} className="hover:bg-slate-50/70">
                        <td className="py-2.5 px-3 font-bold text-blue-900">{h.symbol}</td>
                        <td className="py-2.5 px-3 font-medium text-slate-800">{h.name}</td>
                        <td className="py-2.5 px-3 text-slate-500">{h.assetClass}</td>
                        <td className="py-2.5 px-3 font-semibold text-slate-700">{h.quantity.toLocaleString('en-IN')}</td>
                        <td className="py-2.5 px-3 font-bold text-slate-900">
                          {formatINR(h.currentValue, { masked: isMasked })}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-emerald-700">
                          {formatPercent(h.ytdReturnPercent)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-medium text-slate-600">
                          {h.annualYieldOrDividend.toFixed(2)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'goals' && (
            <div className="space-y-3">
              {client.goals.map((g) => {
                const pct = Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100));
                return (
                  <div key={g.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-slate-900">{g.title}</h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-900">
                        Target Year: {g.targetYear}
                      </span>
                    </div>

                    <div className="mt-3 space-y-1">
                      <div className="flex justify-between text-xs text-slate-600">
                        <span>Funded: {formatINR(g.currentAmount, { masked: isMasked })}</span>
                        <span>
                          Goal Target: {formatINR(g.targetAmount, { masked: isMasked })} ({pct}%)
                        </span>
                      </div>
                      <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${pct}%` }}
                          className="h-full bg-blue-900 rounded-full"
                        />
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                      <span>Monthly SIP Required: {formatINR(g.monthlySipRequired, { masked: isMasked })}/mo</span>
                      <span className="font-bold text-emerald-700">
                        Success Probability: {g.probabilityOfSuccess}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'insurance' && (
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-950 text-xs">
                <strong>Fiduciary Protection Standard:</strong> Insurance contracts represent pure risk transfer and are kept strictly segregated from investable portfolio assets.
              </div>

              {client.insuranceGaps.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-rose-800 uppercase tracking-wider flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    Identified Family Protection Shortfalls
                  </h4>

                  {client.insuranceGaps.map((gap) => (
                    <div
                      key={gap.id}
                      className="p-4 rounded-xl bg-rose-50/70 border border-rose-200 text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-rose-950 text-sm">{gap.category}</span>
                        <span className="font-bold text-rose-700">
                          Shortfall: {formatINR(gap.shortfall, { masked: isMasked })}
                        </span>
                      </div>
                      <p className="text-slate-700">{gap.description}</p>
                      <p className="text-blue-950 font-semibold pt-1">
                        Recommended Action: {gap.mitigationAction}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Active Underwritten Policies
                </h4>
                <div className="space-y-2">
                  {client.insurancePolicies.map((pol) => (
                    <div
                      key={pol.id}
                      className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between"
                    >
                      <div>
                        <div className="font-bold text-slate-900">{pol.type}</div>
                        <div className="text-slate-500">
                          {pol.provider} • Policy #{pol.policyNumber}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          Nominee: {pol.nominee}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-bold text-slate-900 text-sm">
                          {formatINR(pol.sumInsured, { masked: isMasked })}
                        </div>
                        <div className="text-slate-500">
                          Premium: {formatINR(pol.annualPremium, { masked: isMasked })}/yr
                        </div>
                        <span className="text-[10px] text-emerald-800 font-semibold">
                          Renews: {pol.renewalDate}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'sips' && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Active Monthly Systematic Investment Plans (SIP)
              </h4>
              {client.sipCommitments.length === 0 ? (
                <p className="text-xs text-slate-500 p-4 bg-slate-50 rounded-lg text-center">
                  No active SIP mandates registered for this client account.
                </p>
              ) : (
                client.sipCommitments.map((sip) => (
                  <div
                    key={sip.id}
                    className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-slate-900 text-sm">{sip.schemeName}</div>
                      <div className="text-slate-500 mt-0.5">
                        Category: {sip.category} • Frequency: {sip.frequency}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-emerald-700 text-base">
                        {formatINR(sip.amount, { masked: isMasked })}/mo
                      </div>
                      <span className="text-[11px] text-slate-500">Trigger Day: {sip.sipDate}th of month</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <h4 className="font-bold text-slate-900 text-sm font-serif-brand">
                  Fiduciary Advisor Dossier & Strategy Notes
                </h4>
                <p className="text-slate-700 leading-relaxed">{client.notes}</p>
                <div className="pt-2 text-slate-400 text-[11px] border-t border-slate-200">
                  Onboarded on: {client.onboardingDate} • Tax Bracket: {client.taxBracket} • Financial Year: {client.financialYear}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-950 space-y-1">
                <span className="font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" />
                  Indian Client Confidentiality & Fiduciary Disclosures
                </span>
                <p className="text-[11px] text-blue-900/90 leading-relaxed">
                  All holdings, bank sweep balances, PAN records, and nominee allocations are maintained with bank-grade 256-bit encryption under strict fiduciary non-disclosure.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 border-t border-slate-200 p-4 flex items-center justify-between text-xs">
          <span className="text-slate-500">
            Fiduciary Custody ID: {client.id} • Lead Advisor: {client.advisor}
          </span>
          <button
            onClick={() => onDownloadPdf(client)}
            className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <FileDown className="w-4 h-4" />
            <span>Download Official PDF Statement (INR)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
