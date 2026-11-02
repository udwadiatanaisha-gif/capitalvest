export type ClientTier = 'Ultra HNI' | 'High Net Worth (HNI)' | 'Affluent';

export type RiskProfileType =
  | 'Conservative'
  | 'Moderately Conservative'
  | 'Balanced'
  | 'Growth'
  | 'Aggressive Growth';

export type IndianAssetClassType =
  | 'Indian Equities (Direct)'
  | 'Mutual Funds (Equity & Hybrid)'
  | 'Fixed Income & Small Savings'
  | 'Gold & Precious Metals'
  | 'Real Estate & REITs'
  | 'Cash & Bank Balances'
  | 'International Equities';

export interface Holding {
  id: string;
  symbol: string;
  name: string;
  assetClass: IndianAssetClassType;
  subCategory?: string; // e.g. Large Cap, Flexi Cap, G-Sec, FD, SGB, REIT
  quantity: number;
  avgCost: number; // in INR
  currentPrice: number; // in INR
  investedValue: number;
  currentValue: number;
  unrealizedGain: number;
  ytdReturnPercent: number;
  annualYieldOrDividend: number;
  asOfDate?: string;
}

export interface AssetAllocation {
  equities: number; // percentage (0-100)
  mutualFunds: number;
  fixedIncome: number;
  goldSilver: number;
  realEstate: number;
  cash: number;
  international?: number;
}

export interface SipCommitment {
  id: string;
  schemeName: string;
  amount: number;
  sipDate: number; // day of month (e.g. 5, 10, 15)
  category: string;
  frequency: 'Monthly' | 'Quarterly';
  status: 'Active' | 'Paused';
}

export interface FinancialGoal {
  id: string;
  title: string;
  targetAmount: number; // in INR
  currentAmount: number; // in INR
  targetYear: number;
  category:
    | 'Retirement'
    | 'Children Education'
    | 'Children Wedding'
    | 'Home Purchase'
    | 'Business Expansion'
    | 'Emergency Fund'
    | 'Intergenerational Trust';
  probabilityOfSuccess: number; // 0-100%
  status: 'on_track' | 'needs_attention' | 'ahead';
  monthlySipRequired: number; // in INR
  inflationRateAssumption: number; // percentage e.g. 6% or 10%
}

export interface InsurancePolicy {
  id: string;
  type: 'Term Life Cover' | 'Health Insurance (Base/Floater)' | 'Super Top-Up Health' | 'Critical Illness Cover' | 'Personal Accident';
  provider: string; // e.g. HDFC Life, ICICI Lombard, Star Health, Max Life
  policyNumber: string;
  sumInsured: number; // in INR
  annualPremium: number; // in INR
  renewalDate: string; // Indian date format
  nominee: string;
  status: 'Active' | 'Pending Review' | 'Renewal Due';
}

export interface InsuranceGap {
  id: string;
  category: string;
  severity: 'Critical' | 'Moderate' | 'Advisory';
  currentCover: number;
  recommendedCover: number;
  shortfall: number;
  description: string;
  mitigationAction: string;
}

export interface ReviewSession {
  id: string;
  clientId: string;
  clientName: string;
  date: string; // e.g. "12 Nov 2026"
  time: string; // e.g. "11:00 AM IST"
  type: 'Quarterly Portfolio Review' | 'Annual Tax-Loss Planning (FY)' | 'Asset Rebalancing' | 'Insurance & Protection Audit';
  status: 'Upcoming' | 'Completed' | 'Requires Follow-up';
  agenda: string;
  advisorNotes?: string;
  actionItems: string[];
}

export interface RiskAlert {
  id: string;
  clientId: string;
  clientName: string;
  type: 'Allocation Drift' | 'Cash Drag' | 'Concentration Risk' | 'Tax Optimization Due' | 'Coverage Shortfall';
  severity: 'high' | 'medium' | 'low';
  message: string;
  suggestedAction: string;
  date: string;
  resolved: boolean;
}

export interface Client {
  id: string;
  name: string;
  panNumber: string; // Indian Tax Identifier e.g. ABCDE1234F
  email: string;
  phone: string;
  city: string; // Mumbai, Ahmedabad, Bengaluru, etc.
  occupation: string; // e.g. Tech Entrepreneur, Doctor, Industrialist, CXO
  residentStatus: 'Resident Indian' | 'Non-Resident Indian (NRI)' | 'Overseas Citizen (OCI)';
  tier: ClientTier;
  investableAssets: number; // Liquid & financial portfolio in INR
  liabilities: number; // Home loans, car loans, business credit in INR
  totalNetWorth: number; // Investable assets + physical real estate/gold - liabilities
  unrealizedGain: number;
  realizedGainYtd: number;
  ytdReturnPercent: number;
  riskProfile: RiskProfileType;
  benchmark: string; // NIFTY 50, S&P BSE SENSEX, NIFTY 500, etc.
  advisor: string; // Tanaisha Udwadia, CFA
  taxBracket: string; // e.g. 30% + 15% Surcharge (New Regime)
  annualIncome?: number;
  age?: number;
  dependents?: number;
  financialYear: string; // FY 2026-27
  onboardingDate: string;
  emergencyFundMonths: number;
  emergencyFundStatus: 'Well Funded' | 'Adequate' | 'Shortfall';
  notes: string;
  kycStatus: 'Verified (CKYC/KRA)' | 'Pending In-Person' | 'Annual Re-KYC Due';
  allocation: AssetAllocation;
  targetAllocation: AssetAllocation;
  holdings: Holding[];
  sipCommitments: SipCommitment[];
  goals: FinancialGoal[];
  insurancePolicies: InsurancePolicy[];
  insuranceGaps: InsuranceGap[];
  lastReviewDate: string;
  nextReviewDate: string;
}

export interface MarketBenchmark {
  id: string;
  name: string;
  category: 'Equity' | 'Debt' | 'Hybrid';
  currentLevel: number;
  ytdReturn: number;
  oneYearReturn: number;
  threeYearCagr: number;
  asOfDate: string;
}
