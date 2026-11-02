import React, { useState } from 'react';
import { Client, ClientTier, RiskProfileType } from '../types';
import { formatINR, formatPercent } from '../utils/pdfGenerator';
import {
  UserPlus,
  Edit3,
  FileDown,
  ShieldAlert,
  Search,
  Filter,
  ArrowUpRight,
  ChevronRight,
  MapPin,
  FileSpreadsheet,
} from 'lucide-react';

interface ClientsManagerProps {
  clients: Client[];
  isMasked: boolean;
  onSelectClient: (client: Client) => void;
  onOpenAddClient: () => void;
  onOpenEditClient: (client: Client) => void;
  onDownloadClientPdf: (client: Client) => void;
  onOpenExcelHub: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const ClientsManager: React.FC<ClientsManagerProps> = ({
  clients,
  isMasked,
  onSelectClient,
  onOpenAddClient,
  onOpenEditClient,
  onDownloadClientPdf,
  onOpenExcelHub,
  searchQuery,
  onSearchChange,
}) => {
  const [selectedTier, setSelectedTier] = useState<string>('all');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [selectedRisk, setSelectedRisk] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  const cities = Array.from(new Set(clients.map((c) => c.city))).sort();

  const filteredClients = clients.filter((c) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.panNumber.toLowerCase().includes(q) ||
      c.city.toLowerCase().includes(q) ||
      c.occupation.toLowerCase().includes(q);
    const matchesTier = selectedTier === 'all' || c.tier === selectedTier;
    const matchesCity = selectedCity === 'all' || c.city === selectedCity;
    const matchesRisk = selectedRisk === 'all' || c.riskProfile === selectedRisk;
    return matchesSearch && matchesTier && matchesCity && matchesRisk;
  });

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="rounded-xl bg-white p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold font-serif-brand text-slate-900">
            Client Accounts & Family Office Dossiers (India)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage Ultra HNI and High Net Worth Indian client relationships, tax status, and multi-asset mandates
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={onOpenExcelHub}
            className="px-3 py-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
            <span>Excel Sync Hub</span>
          </button>
          <button
            onClick={onOpenAddClient}
            className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Onboard Indian Client</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="rounded-xl bg-white p-4 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative min-w-[220px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search by name, PAN, city..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 focus:bg-white text-slate-800 rounded-lg border border-slate-200 focus:border-blue-700 focus:outline-hidden"
            />
          </div>

          {/* Tier Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedTier}
              onChange={(e) => setSelectedTier(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-slate-50 text-slate-700 rounded-lg border border-slate-200 focus:outline-hidden cursor-pointer"
            >
              <option value="all">All Tiers ({clients.length})</option>
              <option value="Ultra HNI">Ultra HNI (₹10 Cr+)</option>
              <option value="High Net Worth (HNI)">High Net Worth (₹1 Cr - ₹10 Cr)</option>
              <option value="Affluent">Affluent (₹25L - ₹1 Cr)</option>
            </select>
          </div>

          {/* City Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-slate-50 text-slate-700 rounded-lg border border-slate-200 focus:outline-hidden cursor-pointer"
            >
              <option value="all">All Cities</option>
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          {/* Risk Profile Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <select
              value={selectedRisk}
              onChange={(e) => setSelectedRisk(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-slate-50 text-slate-700 rounded-lg border border-slate-200 focus:outline-hidden cursor-pointer"
            >
              <option value="all">All Risk Profiles</option>
              <option value="Conservative">Conservative</option>
              <option value="Moderately Conservative">Moderately Conservative</option>
              <option value="Balanced">Balanced</option>
              <option value="Growth">Growth</option>
              <option value="Aggressive Growth">Aggressive Growth</option>
            </select>
          </div>
        </div>

        {/* View Switcher: Table vs Cards */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
          <button
            onClick={() => setViewMode('table')}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
              viewMode === 'table' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Table View
          </button>
          <button
            onClick={() => setViewMode('cards')}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
              viewMode === 'cards' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Card Dossiers
          </button>
        </div>
      </div>

      {/* Clients Display */}
      {viewMode === 'table' ? (
        <div className="rounded-xl bg-white border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Client Dossier</th>
                  <th className="py-3 px-4">City & Status</th>
                  <th className="py-3 px-4">Tier & KYC</th>
                  <th className="py-3 px-4">Investable Assets (INR)</th>
                  <th className="py-3 px-4">Estimated Net Worth</th>
                  <th className="py-3 px-4">Portfolio YTD</th>
                  <th className="py-3 px-4">Protection</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredClients.map((c) => {
                  const hasGaps = c.insuranceGaps.length > 0;
                  return (
                    <tr
                      key={c.id}
                      className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                      onClick={() => onSelectClient(c)}
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 group-hover:text-blue-900 transition-colors text-sm">
                          {c.name}
                        </div>
                        <div className="text-[11px] text-slate-500">{c.occupation}</div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          PAN: {c.panNumber}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>{c.city}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">{c.residentStatus}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex flex-col gap-1 items-start">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                              c.tier === 'Ultra HNI'
                                ? 'bg-amber-50 text-amber-900 border-amber-300'
                                : 'bg-blue-50 text-blue-900 border-blue-200'
                            }`}
                          >
                            {c.tier}
                          </span>
                          <span className="text-[10px] text-emerald-800 font-medium">✓ {c.kycStatus}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 text-sm">
                          {formatINR(c.investableAssets, { masked: isMasked })}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {c.holdings.length} Securities Held
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800">
                          {formatINR(c.totalNetWorth, { masked: isMasked })}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Liab: {formatINR(c.liabilities, { compact: true, masked: isMasked })}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-emerald-700 flex items-center">
                          <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
                          {formatPercent(c.ytdReturnPercent)}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          +{formatINR(c.unrealizedGain, { compact: true, masked: isMasked })}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        {hasGaps ? (
                          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
                            <ShieldAlert className="w-3 h-3 text-rose-600" />
                            <span>{c.insuranceGaps.length} Shortfall{c.insuranceGaps.length > 1 ? 's' : ''}</span>
                          </div>
                        ) : (
                          <span className="text-[10px] font-semibold text-emerald-800 px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200">
                            Protected
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onOpenEditClient(c)}
                            title="Edit Client Profile"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-900 hover:bg-slate-100 border border-transparent hover:border-slate-300 transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDownloadClientPdf(c)}
                            title="Download PDF Advisory Statement (INR)"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-900 hover:bg-slate-100 border border-transparent hover:border-slate-300 transition-colors cursor-pointer"
                          >
                            <FileDown className="w-3.5 h-3.5" />
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
      ) : (
        /* Card Dossiers View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredClients.map((c) => {
            const hasGaps = c.insuranceGaps.length > 0;
            return (
              <div
                key={c.id}
                className="rounded-xl bg-white border border-slate-200 p-5 shadow-xs hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between group cursor-pointer"
                onClick={() => onSelectClient(c)}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-900 transition-colors font-serif-brand">
                        {c.name}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {c.city} • {c.occupation}
                      </p>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        c.tier === 'Ultra HNI'
                          ? 'bg-amber-50 text-amber-900 border-amber-300'
                          : 'bg-blue-50 text-blue-900 border-blue-200'
                      }`}
                    >
                      {c.tier}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3 py-3 border-y border-slate-100 bg-slate-50/50 rounded-lg px-3">
                    <div>
                      <span className="text-[10px] font-semibold text-slate-400 uppercase">Investable Assets</span>
                      <div className="text-base font-bold text-slate-900 font-serif-brand">
                        {formatINR(c.investableAssets, { masked: isMasked })}
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] font-semibold text-slate-400 uppercase">Total Net Worth</span>
                      <div className="text-base font-bold text-slate-800 font-serif-brand">
                        {formatINR(c.totalNetWorth, { masked: isMasked })}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Risk: {c.riskProfile}</span>
                    <span className="font-bold text-emerald-700">{formatPercent(c.ytdReturnPercent)} YTD</span>
                  </div>

                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span className="text-slate-500">Benchmark:</span>
                    <span className="font-semibold text-slate-700">{c.benchmark.split(' ')[0]}</span>
                  </div>

                  {hasGaps && (
                    <div className="mt-3 p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-[11px] font-medium flex items-center gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                      <span>{c.insuranceGaps[0].category}: Shortfall</span>
                    </div>
                  )}
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onOpenEditClient(c)}
                      title="Edit Record"
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDownloadClientPdf(c)}
                      title="Download PDF Statement (INR)"
                      className="p-1.5 text-slate-400 hover:text-blue-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                    >
                      <FileDown className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={() => onSelectClient(c)}
                    className="text-xs font-bold text-blue-900 hover:text-blue-950 flex items-center gap-1 cursor-pointer"
                  >
                    <span>Inspect Dossier</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
