import React from 'react';
import { Logo } from './Logo';
import { ShieldCheck, Lock, Award, FileText } from 'lucide-react';
import { NavTab } from './Header';

interface FooterProps {
  onNavigateTab: (tab: NavTab) => void;
  onDownloadFirmReport: () => void;
  onOpenAdvisoryAi?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigateTab,
  onDownloadFirmReport,
  onOpenAdvisoryAi,
}) => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 mt-16">
      {/* Upper Footer: Pillars of Wealth Protection (India) */}
      <div className="border-b border-slate-800 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-xs">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-blue-950 border border-blue-800/60 text-amber-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">
                Indian Fiduciary Standard
              </h4>
              <p className="text-slate-400 mt-1 leading-relaxed">
                Objective client-first advisory architecture. Lead Advisor: Tanaisha Udwadia, CFA. Zero hidden commissions.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-blue-950 border border-blue-800/60 text-amber-400 shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">
                Segregated Institutional Custody
              </h4>
              <p className="text-slate-400 mt-1 leading-relaxed">
                Client securities held directly in independent depository accounts (CDSL / NSDL / RBI Retail Direct).
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-blue-950 border border-blue-800/60 text-amber-400 shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">
                Intergenerational Continuity
              </h4>
              <p className="text-slate-400 mt-1 leading-relaxed">
                Family dynasty trusts, Hindu Undivided Family (HUF) mandates, and multi-generational business succession.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-blue-950 border border-blue-800/60 text-amber-400 shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">
                Excel Sync & Audited Reports
              </h4>
              <p className="text-slate-400 mt-1 leading-relaxed">
                Bi-directional Excel (.xlsx) integration, automated insurance gap audits, and instant INR PDF statement downloads.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links & Branding */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-slate-800">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-950 border border-amber-500/50 flex items-center justify-center text-amber-400 font-serif-brand font-bold">
                CV
              </div>
              <span className="font-serif-brand text-lg font-bold tracking-widest text-white">
                CAPITAL<span className="text-amber-400">VEST</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-md">
              CAPITALVEST: Building Wealth. Securing Generations. Enterprise wealth advisory & portfolio intelligence platform for Indian HNI and Ultra HNI families.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs font-medium">
            <button
              onClick={() => onNavigateTab('dashboard')}
              className="text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              Executive Overview
            </button>
            <button
              onClick={() => onNavigateTab('clients')}
              className="text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              Client Accounts
            </button>
            <button
              onClick={() => onNavigateTab('portfolios')}
              className="text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              Asset Allocation (NSE/BSE)
            </button>
            <button
              onClick={() => onNavigateTab('goals')}
              className="text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              Financial Goals & SIPs
            </button>
            <button
              onClick={() => onNavigateTab('risk')}
              className="text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              Risk & Benchmarks
            </button>
            <button
              onClick={() => onNavigateTab('insurance')}
              className="text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              Protection & Gaps
            </button>
            <button
              onClick={() => onNavigateTab('reviews')}
              className="text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              Reviews (FY 2026-27)
            </button>
            <button
              onClick={() => onNavigateTab('advisory-ai')}
              className="text-amber-300 hover:text-amber-200 font-semibold transition-colors cursor-pointer"
            >
              Advisory AI (Gemini)
            </button>
            <button
              onClick={onDownloadFirmReport}
              className="text-amber-400 hover:text-amber-300 font-semibold transition-colors cursor-pointer"
            >
              Export Firm Dossier (₹)
            </button>
          </div>
        </div>

        {/* Regulatory Disclaimers (India) */}
        <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p className="max-w-3xl leading-relaxed">
            CapitalVest Wealth Advisory • Lead Advisor: Tanaisha Udwadia, CFA. Illustrative portfolio analytics and financial planning simulation platform for private wealth stakeholders. Investments in securities, mutual funds, and market-linked instruments are subject to market risks. Please read all scheme and product-related disclosure documents carefully before investing. Tax treatments are indicative; please consult a qualified chartered accountant for personalized tax advice.
          </p>
          <div className="flex items-center gap-4 text-slate-400 shrink-0">
            <span>© {new Date().getFullYear()} CapitalVest Group (India)</span>
            <span>•</span>
            <span>Financial Year 2026-27</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
