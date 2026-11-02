import { jsPDF } from 'jspdf';
import { Client, ReviewSession, RiskAlert } from '../types';

/**
 * Format amounts in Indian Rupee format (en-IN)
 * e.g. ₹1,25,00,000 or ₹1.25 Cr
 */
export function formatINR(
  val: number,
  options?: { compact?: boolean; masked?: boolean }
): string {
  if (options?.masked) return '₹ ••••••••';
  if (isNaN(val)) return '₹0';

  if (options?.compact) {
    const abs = Math.abs(val);
    const sign = val < 0 ? '-' : '';
    if (abs >= 10000000) {
      return `${sign}₹${(abs / 10000000).toFixed(2)} Cr`;
    }
    if (abs >= 100000) {
      return `${sign}₹${(abs / 100000).toFixed(2)} L`;
    }
    if (abs >= 1000) {
      return `${sign}₹${(abs / 1000).toFixed(1)} k`;
    }
  }

  return (
    '₹' +
    new Intl.NumberFormat('en-IN', {
      maximumFractionDigits: 0,
    }).format(val)
  );
}

// Backward compatibility alias for formatCurrency
export const formatCurrency = (val: number, masked: boolean = false) =>
  formatINR(val, { masked });

export function formatPercent(val: number): string {
  if (isNaN(val)) return '0.0%';
  return `${val >= 0 ? '+' : ''}${val.toFixed(1)}%`;
}

export function formatIndianDate(dateStr?: string): string {
  if (!dateStr) return '02 Nov 2026';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    const day = String(d.getDate()).padStart(2, '0');
    return `${day} ${months[d.getMonth()]} ${d.getFullYear()}`;
  } catch {
    return dateStr;
  }
}

export function generateClientPdf(client: Client, masked: boolean = false): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Premium Indian Wealth Palette (strictly NO pure black)
  const navyDark = [15, 39, 68]; // #0F2744
  const navyMedium = [30, 58, 138]; // #1E3A8A
  const slateText = [51, 65, 85]; // #334155
  const slateMuted = [100, 116, 139]; // #64748B
  const goldAccent = [217, 119, 6]; // #D97706 (Champagne Gold)
  const bgLight = [248, 250, 252]; // #F8FAFC
  const cardBorder = [226, 232, 240]; // #E2E8F0
  const emeraldGreen = [4, 120, 87]; // #047857

  // --- TOP HEADER ---
  doc.setFillColor(navyDark[0], navyDark[1], navyDark[2]);
  doc.rect(0, 0, pageWidth, 38, 'F');

  // Champagne gold divider
  doc.setFillColor(goldAccent[0], goldAccent[1], goldAccent[2]);
  doc.rect(0, 38, pageWidth, 2.5, 'F');

  // Brand Header
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('CAPITALVEST', 14, 16);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(252, 211, 77); // Soft gold
  doc.text('BUILDING WEALTH. SECURING GENERATIONS.', 14, 22);

  // Document Title & Lead Advisor
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10.5);
  doc.setFont('helvetica', 'bold');
  doc.text('PRIVATE WEALTH MANAGEMENT DOSSIER', pageWidth - 14, 16, { align: 'right' });

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225);
  doc.text(`Lead Advisor: Tanaisha Udwadia, CFA`, pageWidth - 14, 22, { align: 'right' });
  doc.text(`Financial Year: ${client.financialYear} | Date: ${formatIndianDate(new Date().toISOString())}`, pageWidth - 14, 28, { align: 'right' });

  let y = 48;

  // --- CLIENT OVERVIEW CARD ---
  doc.setFillColor(bgLight[0], bgLight[1], bgLight[2]);
  doc.setDrawColor(cardBorder[0], cardBorder[1], cardBorder[2]);
  doc.roundedRect(14, y, pageWidth - 28, 42, 3, 3, 'FD');

  doc.setTextColor(navyDark[0], navyDark[1], navyDark[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(client.name, 20, y + 9);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(slateMuted[0], slateMuted[1], slateMuted[2]);
  doc.text(`City: ${client.city}  |  PAN: ${client.panNumber}  |  Status: ${client.residentStatus}`, 20, y + 16);
  doc.text(`Occupation: ${client.occupation}  |  Tier: ${client.tier}`, 20, y + 22);
  doc.text(`Risk Mandate: ${client.riskProfile}  |  Benchmark: ${client.benchmark}`, 20, y + 28);
  doc.text(`Emergency Reserve: ${client.emergencyFundStatus} (${client.emergencyFundMonths} Months)`, 20, y + 34);

  // Financial figures on the right
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(navyDark[0], navyDark[1], navyDark[2]);
  doc.text(`Estimated Net Worth: ${formatINR(client.totalNetWorth, { masked })}`, pageWidth - 20, y + 9, { align: 'right' });

  doc.setFontSize(11);
  doc.setTextColor(navyMedium[0], navyMedium[1], navyMedium[2]);
  doc.text(`Investable Assets: ${formatINR(client.investableAssets, { masked })}`, pageWidth - 20, y + 16, { align: 'right' });

  doc.setFontSize(8.5);
  doc.setTextColor(emeraldGreen[0], emeraldGreen[1], emeraldGreen[2]);
  doc.text(`Portfolio YTD Gain: ${formatPercent(client.ytdReturnPercent)}`, pageWidth - 20, y + 23, { align: 'right' });

  doc.setTextColor(slateMuted[0], slateMuted[1], slateMuted[2]);
  doc.setFont('helvetica', 'normal');
  doc.text(`Unrealized Gain: ${formatINR(client.unrealizedGain, { masked })}`, pageWidth - 20, y + 29, { align: 'right' });
  doc.text(`Liabilities: ${formatINR(client.liabilities, { masked })}`, pageWidth - 20, y + 35, { align: 'right' });

  y += 48;

  // --- SECTION I: ASSET ALLOCATION (INDIAN RUPEES) ---
  doc.setTextColor(navyDark[0], navyDark[1], navyDark[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('I. Strategic Asset Allocation (Indian Markets)', 14, y);

  y += 4;
  doc.setDrawColor(goldAccent[0], goldAccent[1], goldAccent[2]);
  doc.line(14, y, pageWidth - 14, y);
  y += 5;

  // Table header
  doc.setFillColor(navyDark[0], navyDark[1], navyDark[2]);
  doc.rect(14, y, pageWidth - 28, 6.5, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.text('Asset Class', 18, y + 4.5);
  doc.text('Current %', 68, y + 4.5);
  doc.text('Target %', 95, y + 4.5);
  doc.text('Variance', 122, y + 4.5);
  doc.text('Allocation Value (INR)', 150, y + 4.5);
  doc.text('Mandate Status', pageWidth - 20, y + 4.5, { align: 'right' });

  y += 6.5;

  const assetRows = [
    { name: 'Indian Equities (Direct NSE/BSE)', curr: client.allocation.equities, targ: client.targetAllocation.equities },
    { name: 'Mutual Funds (Equity, Hybrid & ELSS)', curr: client.allocation.mutualFunds, targ: client.targetAllocation.mutualFunds },
    { name: 'Fixed Income, G-Secs, PPF & NPS', curr: client.allocation.fixedIncome, targ: client.targetAllocation.fixedIncome },
    { name: 'Gold, Sovereign Gold Bonds & Silver', curr: client.allocation.goldSilver, targ: client.targetAllocation.goldSilver },
    { name: 'Real Estate & Indian REITs', curr: client.allocation.realEstate, targ: client.targetAllocation.realEstate },
    { name: 'Liquid Mutual Funds & Bank Balances', curr: client.allocation.cash, targ: client.targetAllocation.cash },
  ];

  doc.setFont('helvetica', 'normal');
  assetRows.forEach((row, idx) => {
    const rowBg = idx % 2 === 0 ? [255, 255, 255] : [248, 250, 252];
    doc.setFillColor(rowBg[0], rowBg[1], rowBg[2]);
    doc.rect(14, y, pageWidth - 28, 6, 'F');

    doc.setTextColor(slateText[0], slateText[1], slateText[2]);
    doc.text(row.name, 18, y + 4.2);
    doc.text(`${row.curr}%`, 68, y + 4.2);
    doc.text(`${row.targ}%`, 95, y + 4.2);

    const variance = row.curr - row.targ;
    const varText = `${variance >= 0 ? '+' : ''}${variance}%`;
    doc.setTextColor(Math.abs(variance) >= 5 ? 180 : 51, Math.abs(variance) >= 5 ? 50 : 65, Math.abs(variance) >= 5 ? 50 : 85);
    doc.text(varText, 122, y + 4.2);

    doc.setTextColor(slateText[0], slateText[1], slateText[2]);
    const val = (client.investableAssets * row.curr) / 100;
    doc.text(formatINR(val, { masked }), 150, y + 4.2);

    const statusText = Math.abs(variance) >= 5 ? 'Rebalance Alert' : 'Aligned';
    doc.setTextColor(Math.abs(variance) >= 5 ? 180 : 4, Math.abs(variance) >= 5 ? 50 : 120, Math.abs(variance) >= 5 ? 50 : 87);
    doc.text(statusText, pageWidth - 20, y + 4.2, { align: 'right' });

    y += 6;
  });

  y += 6;

  // --- SECTION II: CORE PORTFOLIO HOLDINGS ---
  doc.setTextColor(navyDark[0], navyDark[1], navyDark[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('II. Core Portfolio Holdings (Sample Valuations)', 14, y);

  y += 4;
  doc.setDrawColor(goldAccent[0], goldAccent[1], goldAccent[2]);
  doc.line(14, y, pageWidth - 14, y);
  y += 5;

  doc.setFillColor(navyDark[0], navyDark[1], navyDark[2]);
  doc.rect(14, y, pageWidth - 28, 6.5, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.text('Symbol / Scheme', 18, y + 4.5);
  doc.text('Instrument Name', 46, y + 4.5);
  doc.text('Asset Class', 105, y + 4.5);
  doc.text('Holding Value (INR)', 145, y + 4.5);
  doc.text('YTD Return', 178, y + 4.5);
  doc.text('Yield', pageWidth - 20, y + 4.5, { align: 'right' });

  y += 6.5;

  doc.setFont('helvetica', 'normal');
  client.holdings.slice(0, 6).forEach((h, idx) => {
    const rowBg = idx % 2 === 0 ? [255, 255, 255] : [248, 250, 252];
    doc.setFillColor(rowBg[0], rowBg[1], rowBg[2]);
    doc.rect(14, y, pageWidth - 28, 5.8, 'F');

    doc.setTextColor(navyMedium[0], navyMedium[1], navyMedium[2]);
    doc.setFont('helvetica', 'bold');
    doc.text(h.symbol, 18, y + 4);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(slateText[0], slateText[1], slateText[2]);
    doc.text(h.name.length > 28 ? h.name.slice(0, 26) + '...' : h.name, 46, y + 4);
    doc.text(h.assetClass.slice(0, 18), 105, y + 4);
    doc.text(formatINR(h.currentValue, { masked }), 145, y + 4);

    doc.setTextColor(emeraldGreen[0], emeraldGreen[1], emeraldGreen[2]);
    doc.text(formatPercent(h.ytdReturnPercent), 178, y + 4);

    doc.setTextColor(slateMuted[0], slateMuted[1], slateMuted[2]);
    doc.text(`${h.annualYieldOrDividend.toFixed(1)}%`, pageWidth - 20, y + 4, { align: 'right' });

    y += 5.8;
  });

  y += 6;

  // --- SECTION III: INSURANCE & PROTECTION (STRICTLY SEPARATE) ---
  doc.setTextColor(navyDark[0], navyDark[1], navyDark[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('III. Insurance Coverage & Protection Gap Audit', 14, y);

  y += 4;
  doc.setDrawColor(goldAccent[0], goldAccent[1], goldAccent[2]);
  doc.line(14, y, pageWidth - 14, y);
  y += 5;

  if (client.insuranceGaps.length === 0) {
    doc.setFillColor(240, 253, 244);
    doc.setDrawColor(187, 247, 208);
    doc.roundedRect(14, y, pageWidth - 28, 10, 2, 2, 'FD');
    doc.setTextColor(emeraldGreen[0], emeraldGreen[1], emeraldGreen[2]);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('✓ All family protection thresholds, term life coverage, and health insurance meet CapitalVest standards.', 18, y + 6);
    y += 14;
  } else {
    client.insuranceGaps.forEach((gap) => {
      doc.setFillColor(254, 242, 242);
      doc.setDrawColor(254, 202, 202);
      doc.roundedRect(14, y, pageWidth - 28, 13, 2, 2, 'FD');

      doc.setTextColor(185, 28, 28);
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'bold');
      doc.text(`[${gap.severity.toUpperCase()}] ${gap.category}: Shortfall ${formatINR(gap.shortfall, { masked })}`, 18, y + 5);

      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(slateText[0], slateText[1], slateText[2]);
      const recText = `Action: ${gap.mitigationAction}`;
      doc.text(recText.length > 105 ? recText.slice(0, 102) + '...' : recText, 18, y + 9.5);

      y += 15;
    });
  }

  // Check page overflow for Goals and Disclosures
  if (y > pageHeight - 50) {
    doc.addPage();
    y = 20;
  }

  // --- SECTION IV: FINANCIAL GOALS ---
  doc.setTextColor(navyDark[0], navyDark[1], navyDark[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('IV. Household Financial Goals & SIP Schedule', 14, y);

  y += 4;
  doc.setDrawColor(goldAccent[0], goldAccent[1], goldAccent[2]);
  doc.line(14, y, pageWidth - 14, y);
  y += 5;

  client.goals.forEach((g) => {
    doc.setFillColor(bgLight[0], bgLight[1], bgLight[2]);
    doc.setDrawColor(cardBorder[0], cardBorder[1], cardBorder[2]);
    doc.roundedRect(14, y, pageWidth - 28, 12, 2, 2, 'FD');

    doc.setTextColor(navyDark[0], navyDark[1], navyDark[2]);
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.text(g.title, 18, y + 4.5);

    const pct = Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100));
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(slateMuted[0], slateMuted[1], slateMuted[2]);
    doc.text(`Target: ${formatINR(g.targetAmount, { masked })} (${g.targetYear}) | Current: ${formatINR(g.currentAmount, { masked })} (${pct}%) | SIP: ${formatINR(g.monthlySipRequired, { masked })}/mo`, 18, y + 9);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(emeraldGreen[0], emeraldGreen[1], emeraldGreen[2]);
    doc.text(`Estimated Success: ${g.probabilityOfSuccess}% (${g.status.replace('_', ' ').toUpperCase()})`, pageWidth - 20, y + 7, { align: 'right' });

    y += 14;
  });

  // --- FIDUCIARY ATTESTATION & REGULATORY NOTICE ---
  y = Math.max(y + 4, pageHeight - 32);

  doc.setFillColor(bgLight[0], bgLight[1], bgLight[2]);
  doc.setDrawColor(cardBorder[0], cardBorder[1], cardBorder[2]);
  doc.roundedRect(14, y, pageWidth - 28, 22, 2, 2, 'FD');

  doc.setFontSize(7);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(slateMuted[0], slateMuted[1], slateMuted[2]);
  doc.text('CapitalVest Wealth Management • Fiduciary Advisory Services • Primary Market: India (NSE/BSE)', 18, y + 5);
  doc.text(`Lead Advisor: Tanaisha Udwadia, CFA  |  Client PAN: ${client.panNumber}  |  Next Review Scheduled: ${client.nextReviewDate}`, 18, y + 9.5);
  doc.text('Disclaimer: Mutual fund investments and securities are subject to market risks. Please read all scheme-related documents carefully.', 18, y + 14);
  doc.text('Calculations and tax regimes are indicative; please consult a qualified chartered accountant for personalized tax advice.', 18, y + 18);

  const cleanName = client.name.replace(/[^a-zA-Z0-9]/g, '_');
  doc.save(`CapitalVest_Report_${cleanName}_${new Date().toISOString().slice(0, 10)}.pdf`);
}

export function generateFirmExecutivePdf(
  clients: Client[],
  reviews: ReviewSession[],
  alerts: RiskAlert[],
  masked: boolean = false
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const navyDark = [15, 39, 68];
  const goldAccent = [217, 119, 6];
  const slateText = [51, 65, 85];
  const slateMuted = [100, 116, 139];
  const bgLight = [248, 250, 252];
  const cardBorder = [226, 232, 240];
  const emeraldGreen = [4, 120, 87];

  // Header
  doc.setFillColor(navyDark[0], navyDark[1], navyDark[2]);
  doc.rect(0, 0, pageWidth, 40, 'F');
  doc.setFillColor(goldAccent[0], goldAccent[1], goldAccent[2]);
  doc.rect(0, 40, pageWidth, 2.5, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('CAPITALVEST', 14, 16);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(252, 211, 77);
  doc.text('BUILDING WEALTH. SECURING GENERATIONS.', 14, 22);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10.5);
  doc.setFont('helvetica', 'bold');
  doc.text('EXECUTIVE WEALTH & RISK DOSSIER (INDIA)', pageWidth - 14, 16, { align: 'right' });

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225);
  doc.text(`Lead Advisor: Tanaisha Udwadia, CFA`, pageWidth - 14, 22, { align: 'right' });
  doc.text(`Financial Year 2026-27 | Currency: INR (₹)`, pageWidth - 14, 28, { align: 'right' });

  let y = 50;

  // Key KPI Cards
  const totalInvestable = clients.reduce((acc, c) => acc + c.investableAssets, 0);
  const totalNetWorth = clients.reduce((acc, c) => acc + c.totalNetWorth, 0);
  const avgYtd = clients.length ? clients.reduce((acc, c) => acc + c.ytdReturnPercent, 0) / clients.length : 0;
  const activeGapsCount = clients.reduce((acc, c) => acc + c.insuranceGaps.length, 0);

  doc.setFillColor(bgLight[0], bgLight[1], bgLight[2]);
  doc.setDrawColor(cardBorder[0], cardBorder[1], cardBorder[2]);
  doc.roundedRect(14, y, pageWidth - 28, 28, 3, 3, 'FD');

  doc.setTextColor(slateMuted[0], slateMuted[1], slateMuted[2]);
  doc.setFontSize(7.5);
  doc.text('TOTAL INVESTABLE ASSETS (INR)', 20, y + 8);
  doc.text('AGGREGATE CLIENT NET WORTH', 70, y + 8);
  doc.text('WEIGHTED YTD RETURN', 130, y + 8);
  doc.text('PROTECTION GAPS FLAGGED', pageWidth - 20, y + 8, { align: 'right' });

  doc.setTextColor(navyDark[0], navyDark[1], navyDark[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(formatINR(totalInvestable, { masked }), 20, y + 17);
  doc.text(formatINR(totalNetWorth, { masked }), 70, y + 17);

  doc.setTextColor(emeraldGreen[0], emeraldGreen[1], emeraldGreen[2]);
  doc.text(formatPercent(avgYtd), 130, y + 17);

  doc.setTextColor(185, 28, 28);
  doc.text(`${activeGapsCount} Active`, pageWidth - 20, y + 17, { align: 'right' });

  y += 36;

  // Client Master Table
  doc.setTextColor(navyDark[0], navyDark[1], navyDark[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Active Client Wealth Roster (Indian Families)', 14, y);
  y += 4;

  doc.setFillColor(navyDark[0], navyDark[1], navyDark[2]);
  doc.rect(14, y, pageWidth - 28, 6.5, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7.5);
  doc.text('Client Name & City', 18, y + 4.5);
  doc.text('Tier', 62, y + 4.5);
  doc.text('Risk Mandate', 88, y + 4.5);
  doc.text('Investable Assets', 122, y + 4.5);
  doc.text('Net Worth', 156, y + 4.5);
  doc.text('YTD Return', pageWidth - 20, y + 4.5, { align: 'right' });

  y += 6.5;

  doc.setFont('helvetica', 'normal');
  clients.forEach((c, i) => {
    const rowBg = i % 2 === 0 ? [255, 255, 255] : [248, 250, 252];
    doc.setFillColor(rowBg[0], rowBg[1], rowBg[2]);
    doc.rect(14, y, pageWidth - 28, 6, 'F');

    doc.setTextColor(slateText[0], slateText[1], slateText[2]);
    doc.text(`${c.name} (${c.city})`, 18, y + 4.2);
    doc.text(c.tier.replace(' (HNI)', ''), 62, y + 4.2);
    doc.text(c.riskProfile, 88, y + 4.2);
    doc.text(formatINR(c.investableAssets, { masked }), 122, y + 4.2);
    doc.text(formatINR(c.totalNetWorth, { masked }), 156, y + 4.2);

    doc.setTextColor(emeraldGreen[0], emeraldGreen[1], emeraldGreen[2]);
    doc.text(formatPercent(c.ytdReturnPercent), pageWidth - 20, y + 4.2, { align: 'right' });

    y += 6;
  });

  y += 10;

  // Upcoming Fiduciary Reviews
  doc.setTextColor(navyDark[0], navyDark[1], navyDark[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Upcoming Review Calendar (FY 2026-27)', 14, y);
  y += 4;

  reviews.slice(0, 4).forEach((r) => {
    doc.setFillColor(bgLight[0], bgLight[1], bgLight[2]);
    doc.setDrawColor(cardBorder[0], cardBorder[1], cardBorder[2]);
    doc.roundedRect(14, y, pageWidth - 28, 11, 2, 2, 'FD');

    doc.setTextColor(navyDark[0], navyDark[1], navyDark[2]);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text(`${r.clientName} — ${r.type}`, 18, y + 4.5);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(slateMuted[0], slateMuted[1], slateMuted[2]);
    doc.setFontSize(7.5);
    doc.text(`Scheduled: ${r.date} at ${r.time}  |  Agenda: ${r.agenda.slice(0, 80)}...`, 18, y + 8.5);

    y += 13;
  });

  // Footer
  y = pageHeight - 18;
  doc.setFontSize(7);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(slateMuted[0], slateMuted[1], slateMuted[2]);
  doc.text(
    'CapitalVest Wealth Management • Lead Advisor: Tanaisha Udwadia, CFA • Fiduciary Standard of Care • Mumbai, India',
    pageWidth / 2,
    y,
    { align: 'center' }
  );

  doc.save(`CapitalVest_Firm_Executive_Dossier_INR_${new Date().toISOString().slice(0, 10)}.pdf`);
}
