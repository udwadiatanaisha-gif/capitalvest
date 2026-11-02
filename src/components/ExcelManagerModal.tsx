import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { Client, Holding, IndianAssetClassType } from '../types';
import { formatINR } from '../utils/pdfGenerator';
import {
  FileSpreadsheet,
  Upload,
  Download,
  CheckCircle2,
  AlertTriangle,
  X,
  FileText,
  RefreshCw,
  Layers,
} from 'lucide-react';

interface ExcelManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  clients: Client[];
  onImportClients: (newClients: Client[], mode: 'merge' | 'append') => void;
  onImportHoldings: (clientId: string, newHoldings: Holding[]) => void;
}

export const ExcelManagerModal: React.FC<ExcelManagerModalProps> = ({
  isOpen,
  onClose,
  clients,
  onImportClients,
  onImportHoldings,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'import' | 'export' | 'templates'>('import');
  const [importMode, setImportMode] = useState<'clients' | 'holdings'>('clients');
  const [selectedClientIdForHoldings, setSelectedClientIdForHoldings] = useState<string>(
    clients[0]?.id || ''
  );
  const [duplicateResolution, setDuplicateResolution] = useState<'merge' | 'append'>('merge');

  // Parsing & validation states
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [validationSuccesses, setValidationSuccesses] = useState<string[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Download Sample Templates
  const handleDownloadTemplate = (type: 'clients' | 'holdings') => {
    if (type === 'clients') {
      const sampleData = [
        {
          'Client Name': 'Aarav Mehta',
          'PAN Number': 'AARM7842M',
          'Email': 'aarav.mehta@zenithtek.in',
          'Phone': '+91 98201 44819',
          'City': 'Mumbai',
          'Occupation': 'Tech Entrepreneur',
          'Tier': 'Ultra HNI',
          'Investable Assets (INR)': 185000000,
          'Total Net Worth (INR)': 240000000,
          'Liabilities (INR)': 12000000,
          'Risk Profile': 'Growth',
          'Benchmark': 'NIFTY 50 (TRI)',
          'Tax Bracket': '30% + 15% Surcharge',
          'Advisor': 'Tanaisha Udwadia, CFA',
        },
        {
          'Client Name': 'Ananya Shah',
          'PAN Number': 'ANSH4819P',
          'Email': 'ananya.shah@chemicals.in',
          'Phone': '+91 97240 88291',
          'City': 'Ahmedabad',
          'Occupation': 'Managing Director',
          'Tier': 'Ultra HNI',
          'Investable Assets (INR)': 320000000,
          'Total Net Worth (INR)': 450000000,
          'Liabilities (INR)': 45000000,
          'Risk Profile': 'Balanced',
          'Benchmark': 'NIFTY 500 (Broad Market)',
          'Tax Bracket': '30% + 25% Surcharge',
          'Advisor': 'Tanaisha Udwadia, CFA',
        },
      ];
      const ws = XLSX.utils.json_to_sheet(sampleData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Client Master');
      XLSX.writeFile(wb, 'CapitalVest_Client_Master_Template.xlsx');
    } else {
      const sampleHoldings = [
        {
          'Security Symbol': 'RELIANCE',
          'Security Name': 'Reliance Industries Ltd.',
          'Asset Class': 'Indian Equities (Direct)',
          'Sub Category': 'Large Cap (NSE)',
          'Quantity': 1000,
          'Average Purchase Cost (INR)': 2680.0,
          'Current Price (INR)': 3040.5,
          'Dividend or Coupon Yield (%)': 0.38,
        },
        {
          'Security Symbol': 'HDFCBANK',
          'Security Name': 'HDFC Bank Ltd.',
          'Asset Class': 'Indian Equities (Direct)',
          'Sub Category': 'Large Cap Banking',
          'Quantity': 2500,
          'Average Purchase Cost (INR)': 1540.0,
          'Current Price (INR)': 1785.0,
          'Dividend or Coupon Yield (%)': 1.15,
        },
        {
          'Security Symbol': 'PPFAS-FC',
          'Security Name': 'Parag Parikh Flexi Cap Fund (Direct-Growth)',
          'Asset Class': 'Mutual Funds (Equity & Hybrid)',
          'Sub Category': 'Flexi Cap MF',
          'Quantity': 50000,
          'Average Purchase Cost (INR)': 68.4,
          'Current Price (INR)': 87.6,
          'Dividend or Coupon Yield (%)': 0.0,
        },
        {
          'Security Symbol': 'GSEC-718',
          'Security Name': 'Government of India 7.18% 2033 (G-Sec)',
          'Asset Class': 'Fixed Income & Small Savings',
          'Sub Category': 'Central Govt Sovereign Debt',
          'Quantity': 10000,
          'Average Purchase Cost (INR)': 99.8,
          'Current Price (INR)': 101.4,
          'Dividend or Coupon Yield (%)': 7.18,
        },
      ];
      const ws = XLSX.utils.json_to_sheet(sampleHoldings);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Holdings Master');
      XLSX.writeFile(wb, 'CapitalVest_Portfolio_Holdings_Template.xlsx');
    }
  };

  // Export live clients to Excel
  const handleExportClients = () => {
    const exportData = clients.map((c) => ({
      'Client ID': c.id,
      'Client Name': c.name,
      'PAN': c.panNumber,
      'City': c.city,
      'Email': c.email,
      'Phone': c.phone,
      'Occupation': c.occupation,
      'Tier': c.tier,
      'Investable Assets (INR)': c.investableAssets,
      'Total Net Worth (INR)': c.totalNetWorth,
      'Liabilities (INR)': c.liabilities,
      'YTD Return (%)': c.ytdReturnPercent,
      'Risk Profile': c.riskProfile,
      'Benchmark': c.benchmark,
      'Lead Advisor': c.advisor,
      'Financial Year': c.financialYear,
      'KYC Status': c.kycStatus,
      'Holdings Count': c.holdings.length,
      'Protection Gaps Count': c.insuranceGaps.length,
      'Next Review Date': c.nextReviewDate,
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Active Clients Roster');
    XLSX.writeFile(
      wb,
      `CapitalVest_Clients_Export_${new Date().toISOString().slice(0, 10)}.xlsx`
    );
  };

  // Export live holdings to Excel
  const handleExportHoldings = () => {
    const exportHoldings = clients.flatMap((c) =>
      c.holdings.map((h) => ({
        'Client ID': c.id,
        'Client Name': c.name,
        'Symbol': h.symbol,
        'Security Name': h.name,
        'Asset Class': h.assetClass,
        'Sub Category': h.subCategory || 'Standard',
        'Quantity': h.quantity,
        'Average Cost (INR)': h.avgCost,
        'Current Price (INR)': h.currentPrice,
        'Invested Value (INR)': h.investedValue,
        'Current Market Value (INR)': h.currentValue,
        'Unrealized Gain (INR)': h.unrealizedGain,
        'YTD Gain (%)': h.ytdReturnPercent,
        'Yield (%)': h.annualYieldOrDividend,
      }))
    );

    const ws = XLSX.utils.json_to_sheet(exportHoldings);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'All Client Holdings');
    XLSX.writeFile(
      wb,
      `CapitalVest_Holdings_Export_${new Date().toISOString().slice(0, 10)}.xlsx`
    );
  };

  // Handle file drop/upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsProcessing(true);
    setValidationErrors([]);
    setValidationSuccesses([]);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws, { defval: '' });

        if (!data || data.length === 0) {
          setValidationErrors(['The uploaded spreadsheet is empty or has no data rows.']);
          setParsedRows([]);
          setIsProcessing(false);
          return;
        }

        // Validate structure based on import mode
        const errors: string[] = [];
        const successes: string[] = [];

        if (importMode === 'clients') {
          data.forEach((row: any, idx) => {
            const rowNum = idx + 2;
            const name = row['Client Name'] || row['Name'];
            const email = row['Email'];
            const investable = row['Investable Assets (INR)'] || row['Investable Assets'] || row['AUM'];

            if (!name) {
              errors.push(`Row ${rowNum}: Missing mandatory 'Client Name'`);
            }
            if (!email || !email.includes('@')) {
              errors.push(`Row ${rowNum}: Invalid or missing email address`);
            }
            if (investable && isNaN(Number(investable))) {
              errors.push(`Row ${rowNum}: 'Investable Assets' must be a valid numeric amount`);
            }
          });
        } else {
          data.forEach((row: any, idx) => {
            const rowNum = idx + 2;
            const symbol = row['Security Symbol'] || row['Symbol'];
            const name = row['Security Name'] || row['Name'];
            const qty = row['Quantity'] || row['Shares'];
            const price = row['Current Price (INR)'] || row['Current Price'] || row['Price'];

            if (!symbol) errors.push(`Row ${rowNum}: Missing 'Security Symbol'`);
            if (!name) errors.push(`Row ${rowNum}: Missing 'Security Name'`);
            if (qty === '' || isNaN(Number(qty)) || Number(qty) <= 0) {
              errors.push(`Row ${rowNum}: 'Quantity' must be a positive number`);
            }
            if (price === '' || isNaN(Number(price))) {
              errors.push(`Row ${rowNum}: 'Current Price' must be a valid number`);
            }
          });
        }

        if (errors.length === 0) {
          successes.push(`File parsed successfully: ${data.length} valid rows ready for import.`);
        }

        setValidationErrors(errors);
        setValidationSuccesses(successes);
        setParsedRows(data);
      } catch (err: any) {
        setValidationErrors([`Error reading spreadsheet: ${err.message || 'Corrupt format'}`]);
      } finally {
        setIsProcessing(false);
      }
    };

    reader.readAsBinaryString(file);
  };

  // Commit Import
  const handleCommitImport = () => {
    if (parsedRows.length === 0 || validationErrors.length > 0) return;

    if (importMode === 'clients') {
      const newClients: Client[] = parsedRows.map((row, idx) => {
        const investable = Number(row['Investable Assets (INR)'] || row['Investable Assets'] || 50000000);
        const netWorth = Number(row['Total Net Worth (INR)'] || row['Net Worth'] || investable * 1.3);
        const liabilities = Number(row['Liabilities (INR)'] || row['Liabilities'] || 0);

        return {
          id: `cv-imp-${Date.now()}-${idx}`,
          name: String(row['Client Name'] || row['Name'] || 'Imported Client'),
          panNumber: String(row['PAN Number'] || row['PAN'] || 'PANNOTPROVIDED'),
          email: String(row['Email'] || `client${idx}@domain.in`),
          phone: String(row['Phone'] || '+91 98000 00000'),
          city: String(row['City'] || 'Mumbai'),
          occupation: String(row['Occupation'] || 'Professional / Investor'),
          residentStatus: 'Resident Indian',
          tier: (row['Tier'] as any) || (investable >= 100000000 ? 'Ultra HNI' : 'High Net Worth (HNI)'),
          investableAssets: investable,
          liabilities: liabilities,
          totalNetWorth: netWorth,
          unrealizedGain: Math.round(investable * 0.14),
          realizedGainYtd: Math.round(investable * 0.02),
          ytdReturnPercent: 15.4,
          riskProfile: (row['Risk Profile'] as any) || 'Growth',
          benchmark: String(row['Benchmark'] || 'NIFTY 50 (TRI)'),
          advisor: String(row['Advisor'] || 'Tanaisha Udwadia, CFA'),
          taxBracket: String(row['Tax Bracket'] || '30% + 15% Surcharge'),
          financialYear: 'FY 2026-27',
          onboardingDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          emergencyFundMonths: 6,
          emergencyFundStatus: 'Well Funded',
          notes: 'Imported via CapitalVest Excel Data Synchronizer.',
          kycStatus: 'Verified (CKYC/KRA)',
          allocation: {
            equities: 50,
            mutualFunds: 25,
            fixedIncome: 15,
            goldSilver: 5,
            realEstate: 3,
            cash: 2,
          },
          targetAllocation: {
            equities: 50,
            mutualFunds: 25,
            fixedIncome: 15,
            goldSilver: 5,
            realEstate: 3,
            cash: 2,
          },
          holdings: [
            {
              id: `h-imp-${Date.now()}-1`,
              symbol: 'RELIANCE',
              name: 'Reliance Industries Ltd.',
              assetClass: 'Indian Equities (Direct)',
              subCategory: 'Large Cap (NSE)',
              quantity: Math.max(10, Math.round(investable * 0.3 / 3040)),
              avgCost: 2750.0,
              currentPrice: 3040.5,
              investedValue: Math.round(investable * 0.3),
              currentValue: Math.round(investable * 0.33),
              unrealizedGain: Math.round(investable * 0.03),
              ytdReturnPercent: 18.2,
              annualYieldOrDividend: 0.38,
              asOfDate: '31 Oct 2026',
            },
            {
              id: `h-imp-${Date.now()}-2`,
              symbol: 'PPFAS-FC',
              name: 'Parag Parikh Flexi Cap Fund (Direct)',
              assetClass: 'Mutual Funds (Equity & Hybrid)',
              subCategory: 'Flexi Cap MF',
              quantity: Math.max(100, Math.round(investable * 0.25 / 87.6)),
              avgCost: 72.0,
              currentPrice: 87.6,
              investedValue: Math.round(investable * 0.25),
              currentValue: Math.round(investable * 0.3),
              unrealizedGain: Math.round(investable * 0.05),
              ytdReturnPercent: 22.4,
              annualYieldOrDividend: 0.0,
              asOfDate: '31 Oct 2026',
            },
            {
              id: `h-imp-${Date.now()}-3`,
              symbol: 'GSEC-718',
              name: 'Government of India 7.18% 2033 (G-Sec)',
              assetClass: 'Fixed Income & Small Savings',
              subCategory: 'Sovereign Debt (RBI)',
              quantity: Math.max(100, Math.round(investable * 0.45 / 101.4)),
              avgCost: 99.8,
              currentPrice: 101.4,
              investedValue: Math.round(investable * 0.44),
              currentValue: Math.round(investable * 0.45),
              unrealizedGain: Math.round(investable * 0.01),
              ytdReturnPercent: 7.25,
              annualYieldOrDividend: 7.18,
              asOfDate: '31 Oct 2026',
            },
          ],
          sipCommitments: [],
          goals: [
            {
              id: `g-imp-${Date.now()}`,
              title: 'Family Intergenerational Wealth Endowment',
              targetAmount: investable * 2,
              currentAmount: investable,
              targetYear: 2038,
              category: 'Intergenerational Trust',
              probabilityOfSuccess: 94,
              status: 'on_track',
              monthlySipRequired: 250000,
              inflationRateAssumption: 6.0,
            },
          ],
          insurancePolicies: [
            {
              id: `ins-imp-${Date.now()}`,
              type: 'Term Life Cover',
              provider: 'HDFC Life Click 2 Protect',
              policyNumber: `HD-${Math.floor(100000 + Math.random() * 900000)}`,
              sumInsured: Math.max(50000000, investable * 0.5),
              annualPremium: 65000,
              renewalDate: '15 Sep 2027',
              nominee: 'Family Legal Heirs',
              status: 'Active',
            },
          ],
          insuranceGaps: [],
          lastReviewDate: '01 Oct 2026',
          nextReviewDate: '15 Jan 2027',
        };
      });

      onImportClients(newClients, duplicateResolution);
    } else {
      // Import holdings for specific client
      const newHoldings: Holding[] = parsedRows.map((row, idx) => {
        const qty = Number(row['Quantity'] || row['Shares'] || 100);
        const avgCost = Number(row['Average Purchase Cost (INR)'] || row['Average Cost'] || 100);
        const curPrice = Number(row['Current Price (INR)'] || row['Current Price'] || avgCost * 1.1);
        const invVal = qty * avgCost;
        const curVal = qty * curPrice;
        const gain = curVal - invVal;
        const gainPct = invVal > 0 ? (gain / invVal) * 100 : 0;

        return {
          id: `h-imp-rec-${Date.now()}-${idx}`,
          symbol: String(row['Security Symbol'] || row['Symbol'] || 'SECURITY'),
          name: String(row['Security Name'] || row['Name'] || 'Holding Name'),
          assetClass: (row['Asset Class'] as IndianAssetClassType) || 'Indian Equities (Direct)',
          subCategory: String(row['Sub Category'] || 'Standard'),
          quantity: qty,
          avgCost: avgCost,
          currentPrice: curPrice,
          investedValue: invVal,
          currentValue: curVal,
          unrealizedGain: gain,
          ytdReturnPercent: Number((gainPct).toFixed(1)),
          annualYieldOrDividend: Number(row['Dividend or Coupon Yield (%)'] || row['Yield'] || 1.2),
          asOfDate: '31 Oct 2026',
        };
      });

      onImportHoldings(selectedClientIdForHoldings, newHoldings);
    }

    setParsedRows([]);
    setFileName('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 my-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-serif-brand">
                Excel & CSV Integration Hub (Indian Wealth)
              </h3>
              <p className="text-xs text-slate-500">
                Import, validate, and synchronize client records & custody holdings via Excel (.xlsx)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-lg px-2 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-2 mt-4 border-b border-slate-200 pb-2 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('import')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'import' ? 'bg-blue-950 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import & Synchronize</span>
          </button>
          <button
            onClick={() => setActiveTab('export')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'export' ? 'bg-blue-950 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Live Data</span>
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'templates' ? 'bg-blue-950 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Pre-formatted Templates</span>
          </button>
        </div>

        {/* Tab 1: Import */}
        {activeTab === 'import' && (
          <div className="mt-4 space-y-4 text-xs">
            {/* Import Target & Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">What are you importing?</label>
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="importMode"
                      checked={importMode === 'clients'}
                      onChange={() => setImportMode('clients')}
                      className="accent-blue-900"
                    />
                    <span>Client Master Records</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer ml-3">
                    <input
                      type="radio"
                      name="importMode"
                      checked={importMode === 'holdings'}
                      onChange={() => setImportMode('holdings')}
                      className="accent-blue-900"
                    />
                    <span>Portfolio Holdings</span>
                  </label>
                </div>
              </div>

              {importMode === 'holdings' ? (
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Target Client Account</label>
                  <select
                    value={selectedClientIdForHoldings}
                    onChange={(e) => setSelectedClientIdForHoldings(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900 font-medium"
                  >
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.city}) - {formatINR(c.investableAssets, { compact: true })}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Duplicate Handling Mode</label>
                  <select
                    value={duplicateResolution}
                    onChange={(e) => setDuplicateResolution(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900 font-medium"
                  >
                    <option value="merge">Smart Merge (Update Existing PAN/Email, Avoid Duplicates)</option>
                    <option value="append">Append as New Records (Zero Overwrite)</option>
                  </select>
                </div>
              )}
            </div>

            {/* Drag & Drop Upload Zone */}
            <div className="border-2 border-dashed border-slate-300 hover:border-blue-900 rounded-xl p-6 text-center bg-slate-50/50 hover:bg-slate-50 transition-colors">
              <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="font-bold text-slate-800 text-sm">Select Excel (.xlsx, .xls) or CSV File</p>
              <p className="text-slate-500 text-[11px] mt-0.5">
                Ensure column headers match our standard Indian wealth schema
              </p>
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileUpload}
                className="mt-3 text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-950 file:text-white hover:file:bg-blue-900 cursor-pointer"
              />
              {fileName && <p className="mt-2 text-xs font-semibold text-blue-900">Loaded: {fileName}</p>}
            </div>

            {/* Validation Feedback */}
            {validationErrors.length > 0 && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-1">
                <span className="font-bold text-rose-900 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  Validation Issues Found ({validationErrors.length})
                </span>
                <ul className="text-rose-800 text-[11px] list-disc list-inside max-h-24 overflow-y-auto">
                  {validationErrors.slice(0, 5).map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                  {validationErrors.length > 5 && <li>...and {validationErrors.length - 5} more issues.</li>}
                </ul>
              </div>
            )}

            {validationSuccesses.length > 0 && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  {validationSuccesses[0]}
                </span>
              </div>
            )}

            {/* Preview of Parsed Rows */}
            {parsedRows.length > 0 && validationErrors.length === 0 && (
              <div>
                <span className="font-bold text-slate-800 block mb-1">
                  Preview ({parsedRows.length} Rows Ready for Synchronization)
                </span>
                <div className="max-h-36 overflow-y-auto border border-slate-200 rounded-lg text-[11px]">
                  <table className="w-full text-left">
                    <thead className="bg-slate-100 text-slate-700 sticky top-0">
                      <tr>
                        {Object.keys(parsedRows[0])
                          .slice(0, 5)
                          .map((col, i) => (
                            <th key={i} className="py-1.5 px-2 font-semibold">
                              {col}
                            </th>
                          ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {parsedRows.slice(0, 4).map((row, rIdx) => (
                        <tr key={rIdx} className="hover:bg-slate-50">
                          {Object.values(row)
                            .slice(0, 5)
                            .map((val: any, cIdx) => (
                              <td key={cIdx} className="py-1 px-2 text-slate-700">
                                {String(val)}
                              </td>
                            ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Action Bar */}
            <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                Data is validated locally prior to state synchronization.
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3 py-1.5 text-slate-600 hover:text-slate-900 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={parsedRows.length === 0 || validationErrors.length > 0}
                  onClick={handleCommitImport}
                  className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 text-white font-bold rounded-lg shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Synchronize {parsedRows.length} Records</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Export */}
        {activeTab === 'export' && (
          <div className="mt-4 space-y-4 text-xs">
            <p className="text-slate-600">
              Download complete, unmasked spreadsheets formatted in Indian Rupees (₹) for internal accounting, tax compliance audits, and partner presentations.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm font-serif-brand">
                    Client Master Roster (.xlsx)
                  </h4>
                  <p className="text-slate-500 mt-1">
                    Export all {clients.length} Indian client profiles, PAN numbers, cities, investable assets, net worth, risk mandates, and review dates.
                  </p>
                </div>
                <button
                  onClick={handleExportClients}
                  className="mt-4 px-3.5 py-2 bg-blue-950 hover:bg-blue-900 text-white font-bold rounded-lg flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export Clients Spreadsheet</span>
                </button>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm font-serif-brand">
                    Custody Holdings Matrix (.xlsx)
                  </h4>
                  <p className="text-slate-500 mt-1">
                    Export granular individual holdings across equities (NSE/BSE), mutual funds, G-Secs, SGBs, REITs, and bank deposits.
                  </p>
                </div>
                <button
                  onClick={handleExportHoldings}
                  className="mt-4 px-3.5 py-2 bg-blue-950 hover:bg-blue-900 text-white font-bold rounded-lg flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export All Holdings</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Pre-formatted Templates */}
        {activeTab === 'templates' && (
          <div className="mt-4 space-y-4 text-xs">
            <p className="text-slate-600">
              Download pre-formatted Excel template files with sample Indian records and pre-configured column headers. Use these templates to prepare your client and holdings data before importing.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase text-amber-700">Pre-Formatted</span>
                  <h4 className="font-bold text-slate-900 text-sm font-serif-brand mt-1">
                    Client Master Template
                  </h4>
                  <p className="text-slate-500 mt-1">
                    Includes columns for Client Name, PAN, City, Occupation, Tier, Investable Assets (INR), Net Worth, Risk Profile, and Benchmark.
                  </p>
                </div>
                <button
                  onClick={() => handleDownloadTemplate('clients')}
                  className="mt-4 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Clients Template</span>
                </button>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase text-amber-700">Pre-Formatted</span>
                  <h4 className="font-bold text-slate-900 text-sm font-serif-brand mt-1">
                    Portfolio Holdings Template
                  </h4>
                  <p className="text-slate-500 mt-1">
                    Includes columns for Security Symbol, Name, Asset Class (Equities, Mutual Funds, Fixed Income, Gold), Quantity, Cost, and Current Price.
                  </p>
                </div>
                <button
                  onClick={() => handleDownloadTemplate('holdings')}
                  className="mt-4 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Holdings Template</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
