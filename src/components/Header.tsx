import React from 'react';
import { Logo } from './Logo';
import {
  ShieldCheck,
  Eye,
  EyeOff,
  FileDown,
  UserPlus,
  Lock,
  Search,
  FileSpreadsheet,
  Sparkles,
} from 'lucide-react';

export type NavTab =
  | 'dashboard'
  | 'clients'
  | 'portfolios'
  | 'goals'
  | 'risk'
  | 'insurance'
  | 'reviews';

interface HeaderProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  isMasked: boolean;
  onToggleMask: () => void;
  onOpenNewClient: () => void;
  onOpenExcelHub: () => void;
  onDownloadFirmReport: () => void;
  onOpenAdvisoryAi: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  riskAlertsCount: number;
  insuranceGapsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  isMasked,
  onToggleMask,
  onOpenNewClient,
  onOpenExcelHub,
  onDownloadFirmReport,
  onOpenAdvisoryAi,
  searchQuery,
  onSearchChange,
  riskAlertsCount,
  insuranceGapsCount,
}) => {
  const tabs: {
    id: NavTab;
    label: string;
    badge?: number | string;
    badgeColor?: string;
  }[] = [
    { id: 'dashboard', label: 'Executive Overview' },
    { id: 'clients', label: 'Client Accounts (HNI / UHNI)' },
    { id: 'portfolios', label: 'Asset Allocation & Custody' },
    { id: 'goals', label: 'Financial Goals & SIPs' },
    {
      id: 'risk',
      label: 'Risk & Benchmarks',
      badge: riskAlertsCount > 0 ? riskAlertsCount : undefined,
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
    },
    {
      id: 'insurance',
      label: 'Protection & Gaps',
      badge: insuranceGapsCount > 0 ? insuranceGapsCount : undefined,
      badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
    },
    { id: 'reviews', label: 'Fiduciary Reviews (FY)' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      {/* Top Security & Indian Compliance Assurance Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-slate-300 text-xs py-1.5 px-4 sm:px-8 flex flex-wrap items-center justify-between gap-2 border-b border-blue-900/60">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-amber-400 font-medium">
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            256-Bit Bank-Grade Encryption
          </span>
          <span className="hidden md:inline text-slate-500">•</span>
          <span className="hidden md:inline text-slate-300 font-medium">
            Fiduciary Standard & Private Client Wealth Architecture
          </span>
          <span className="hidden lg:inline text-slate-500">•</span>
          <span className="hidden lg:inline text-slate-300">
            Market: India (NSE / BSE) • Financial Year 2026-27
          </span>
        </div>

        <div className="flex items-center gap-4 text-[11px]">
          <span className="flex items-center gap-1 text-emerald-400 font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            Live Custody Feed Connected
          </span>
          <div className="h-3 w-px bg-slate-700"></div>
          <span className="text-slate-400">
            Lead Advisor: <strong className="text-white">Tanaisha Udwadia, CFA</strong>
          </span>
        </div>
      </div>

      {/* Main Header Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex items-center justify-between gap-4">
          {/* Logo & Slogan */}
          <Logo variant="full" />

          {/* Quick Search across clients, PAN, cities, tickers */}
          <div className="hidden md:flex items-center relative flex-1 max-w-xs mx-4">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search clients, PAN, city, NSE tickers..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-slate-800 placeholder:text-slate-400 rounded-lg border border-slate-200 focus:border-blue-700 focus:outline-hidden transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs px-1"
              >
                ✕
              </button>
            )}
          </div>

          {/* Actions: Privacy Mask, Excel Hub, Firm Dossier, Onboard Client */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Presentation Privacy Mode Mask */}
            <button
              onClick={onToggleMask}
              title={isMasked ? 'Reveal confidential client figures' : 'Mask client figures for stakeholder presentations'}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                isMasked
                  ? 'bg-amber-50 text-amber-800 border-amber-300 shadow-xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {isMasked ? <EyeOff className="w-3.5 h-3.5 text-amber-700" /> : <Eye className="w-3.5 h-3.5 text-slate-500" />}
              <span className="hidden sm:inline">{isMasked ? 'Privacy Mask: On' : 'Privacy Mode'}</span>
            </button>

            {/* Advisory AI Quick Launcher */}
            <button
              onClick={onOpenAdvisoryAi}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer bg-gradient-to-r from-amber-50 to-amber-100/70 hover:from-amber-100 hover:to-amber-200/80 text-amber-950 border-amber-300 shadow-xs"
              title="Open Gemini-Powered Fiduciary Advisory AI Chatbot"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
              <span>Advisory AI</span>
              <span className="hidden sm:inline-block text-[9px] bg-amber-500/20 text-amber-900 px-1 py-0.2 rounded font-bold uppercase tracking-wider">
                Chatbot
              </span>
            </button>

            {/* Excel Import / Export Hub Button */}
            <button
              onClick={onOpenExcelHub}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 shadow-xs transition-colors cursor-pointer"
              title="Import or Export Client Spreadsheets (Excel / CSV)"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
              <span>Excel Hub</span>
            </button>

            {/* Firm PDF Report in INR */}
            <button
              onClick={onDownloadFirmReport}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
              title="Download Firm Executive Portfolio & Risk PDF Dossier (INR)"
            >
              <FileDown className="w-3.5 h-3.5 text-slate-600" />
              <span>Firm Dossier (₹)</span>
            </button>

            {/* Add New Client Button */}
            <button
              onClick={onOpenNewClient}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white shadow-xs transition-colors cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Add Client</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation Menu */}
        <nav className="mt-3 flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none border-t border-slate-100 pt-2">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`relative px-3.5 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? 'bg-blue-950 text-white shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span
                    className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold border ${
                      isActive ? 'bg-amber-400 text-blue-950 border-amber-300' : tab.badgeColor
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
