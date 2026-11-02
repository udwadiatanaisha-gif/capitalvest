import React, { useState } from 'react';
import { Client, ClientTier, RiskProfileType, AssetAllocation } from '../types';
import { X, UserPlus, Edit3, ShieldCheck } from 'lucide-react';

interface ClientFormModalProps {
  initialClient?: Client | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (clientData: Partial<Client>) => void;
}

export const ClientFormModal: React.FC<ClientFormModalProps> = ({
  initialClient,
  isOpen,
  onClose,
  onSave,
}) => {
  if (!isOpen) return null;

  const isEditing = Boolean(initialClient);

  const [name, setName] = useState(initialClient?.name || '');
  const [panNumber, setPanNumber] = useState(initialClient?.panNumber || '');
  const [email, setEmail] = useState(initialClient?.email || '');
  const [phone, setPhone] = useState(initialClient?.phone || '');
  const [city, setCity] = useState(initialClient?.city || 'Mumbai');
  const [occupation, setOccupation] = useState(initialClient?.occupation || 'Senior Executive / Business Owner');
  const [residentStatus, setResidentStatus] = useState<Client['residentStatus']>(
    initialClient?.residentStatus || 'Resident Indian'
  );
  const [tier, setTier] = useState<ClientTier>(initialClient?.tier || 'High Net Worth (HNI)');
  const [investableAssets, setInvestableAssets] = useState<number>(
    initialClient?.investableAssets || 50000000
  );
  const [totalNetWorth, setTotalNetWorth] = useState<number>(
    initialClient?.totalNetWorth || 75000000
  );
  const [liabilities, setLiabilities] = useState<number>(initialClient?.liabilities || 5000000);
  const [riskProfile, setRiskProfile] = useState<RiskProfileType>(initialClient?.riskProfile || 'Growth');
  const [benchmark, setBenchmark] = useState(initialClient?.benchmark || 'NIFTY 50 (TRI)');
  const [advisor, setAdvisor] = useState(initialClient?.advisor || 'Tanaisha Udwadia, CFA');
  const [taxBracket, setTaxBracket] = useState(
    initialClient?.taxBracket || '30% + 15% Surcharge (New Regime)'
  );
  const [notes, setNotes] = useState(initialClient?.notes || '');
  const [kycStatus, setKycStatus] = useState<Client['kycStatus']>(
    initialClient?.kycStatus || 'Verified (CKYC/KRA)'
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    // Default asset allocation if new client
    const defaultAlloc: AssetAllocation =
      riskProfile === 'Conservative'
        ? { equities: 25, mutualFunds: 15, fixedIncome: 48, goldSilver: 6, realEstate: 3, cash: 3 }
        : riskProfile === 'Growth'
        ? { equities: 55, mutualFunds: 22, fixedIncome: 14, goldSilver: 4, realEstate: 3, cash: 2 }
        : riskProfile === 'Aggressive Growth'
        ? { equities: 64, mutualFunds: 20, fixedIncome: 8, goldSilver: 4, realEstate: 2, cash: 2 }
        : { equities: 42, mutualFunds: 24, fixedIncome: 24, goldSilver: 5, realEstate: 3, cash: 2 };

    const clientPayload: Partial<Client> = {
      ...(initialClient || {}),
      name,
      panNumber: panNumber.toUpperCase() || 'ABCDE1234F',
      email,
      phone,
      city,
      occupation,
      residentStatus,
      tier,
      investableAssets: Number(investableAssets),
      totalNetWorth: Number(totalNetWorth),
      liabilities: Number(liabilities),
      unrealizedGain: initialClient ? initialClient.unrealizedGain : Math.round(Number(investableAssets) * 0.14),
      realizedGainYtd: initialClient ? initialClient.realizedGainYtd : Math.round(Number(investableAssets) * 0.02),
      ytdReturnPercent: initialClient ? initialClient.ytdReturnPercent : 15.6,
      riskProfile,
      benchmark,
      advisor,
      taxBracket,
      financialYear: 'FY 2026-27',
      emergencyFundMonths: 6,
      emergencyFundStatus: 'Well Funded',
      notes,
      kycStatus,
      allocation: initialClient?.allocation || defaultAlloc,
      targetAllocation: initialClient?.targetAllocation || defaultAlloc,
      holdings: initialClient?.holdings || [
        {
          id: `h-in-${Date.now()}-1`,
          symbol: 'RELIANCE',
          name: 'Reliance Industries Ltd.',
          assetClass: 'Indian Equities (Direct)',
          subCategory: 'Large Cap (NSE)',
          quantity: Math.max(10, Math.round((Number(investableAssets) * 0.35) / 3040.5)),
          avgCost: 2750.0,
          currentPrice: 3040.5,
          investedValue: Math.round(Number(investableAssets) * 0.35),
          currentValue: Math.round(Number(investableAssets) * 0.38),
          unrealizedGain: Math.round(Number(investableAssets) * 0.03),
          ytdReturnPercent: 18.2,
          annualYieldOrDividend: 0.38,
          asOfDate: '31 Oct 2026',
        },
        {
          id: `h-in-${Date.now()}-2`,
          symbol: 'HDFCBANK',
          name: 'HDFC Bank Ltd.',
          assetClass: 'Indian Equities (Direct)',
          subCategory: 'Large Cap Banking (NSE)',
          quantity: Math.max(10, Math.round((Number(investableAssets) * 0.3) / 1785.0)),
          avgCost: 1550.0,
          currentPrice: 1785.0,
          investedValue: Math.round(Number(investableAssets) * 0.3),
          currentValue: Math.round(Number(investableAssets) * 0.34),
          unrealizedGain: Math.round(Number(investableAssets) * 0.04),
          ytdReturnPercent: 19.8,
          annualYieldOrDividend: 1.15,
          asOfDate: '31 Oct 2026',
        },
        {
          id: `h-in-${Date.now()}-3`,
          symbol: 'GSEC-718',
          name: 'Government of India 7.18% 2033 (G-Sec)',
          assetClass: 'Fixed Income & Small Savings',
          subCategory: 'Sovereign Debt (RBI)',
          quantity: Math.max(10, Math.round((Number(investableAssets) * 0.35) / 101.4)),
          avgCost: 99.8,
          currentPrice: 101.4,
          investedValue: Math.round(Number(investableAssets) * 0.34),
          currentValue: Math.round(Number(investableAssets) * 0.35),
          unrealizedGain: Math.round(Number(investableAssets) * 0.01),
          ytdReturnPercent: 7.25,
          annualYieldOrDividend: 7.18,
          asOfDate: '31 Oct 2026',
        },
      ],
      sipCommitments: initialClient?.sipCommitments || [],
      goals: initialClient?.goals || [
        {
          id: `g-in-${Date.now()}`,
          title: 'Family Intergenerational Wealth Trust',
          targetAmount: Number(totalNetWorth) * 1.5,
          currentAmount: Number(investableAssets),
          targetYear: 2038,
          category: 'Intergenerational Trust',
          probabilityOfSuccess: 93,
          status: 'on_track',
          monthlySipRequired: 250000,
          inflationRateAssumption: 6.0,
        },
      ],
      insurancePolicies: initialClient?.insurancePolicies || [
        {
          id: `ins-in-${Date.now()}`,
          type: 'Term Life Cover',
          provider: 'HDFC Life Click 2 Protect',
          policyNumber: `HD-${Math.floor(100000 + Math.random() * 900000)}`,
          sumInsured: 100000000, // ₹10 Cr
          annualPremium: 85000,
          renewalDate: '15 Apr 2027',
          nominee: 'Family Legal Heirs',
          status: 'Active',
        },
      ],
      insuranceGaps: initialClient?.insuranceGaps || [],
      lastReviewDate: initialClient?.lastReviewDate || new Date().toISOString().slice(0, 10),
      nextReviewDate:
        initialClient?.nextReviewDate || '18 Dec 2026',
    };

    onSave(clientPayload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 my-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2">
            {isEditing ? (
              <Edit3 className="w-5 h-5 text-blue-900" />
            ) : (
              <UserPlus className="w-5 h-5 text-amber-700" />
            )}
            <h3 className="text-lg font-bold font-serif-brand text-slate-900">
              {isEditing ? `Update Client Dossier: ${initialClient?.name}` : 'Onboard Indian Wealth Client'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-lg px-2 cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          {/* Personal Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Full Client / Entity Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Aarav Mehta or Mehta Family Trust"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">PAN Number (Permanent Account Number)</label>
              <input
                type="text"
                required
                maxLength={10}
                placeholder="e.g. AARM7842M"
                value={panNumber}
                onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Email Address</label>
              <input
                type="email"
                required
                placeholder="client@domain.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Mobile (+91)</label>
              <input
                type="text"
                placeholder="+91 98200 00000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">City</label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium"
              >
                <option value="Mumbai">Mumbai</option>
                <option value="Ahmedabad">Ahmedabad</option>
                <option value="Bengaluru">Bengaluru</option>
                <option value="Vadodara">Vadodara</option>
                <option value="Pune">Pune</option>
                <option value="Delhi / NCR">Delhi / NCR</option>
                <option value="Hyderabad">Hyderabad</option>
                <option value="Chennai">Chennai</option>
                <option value="Kolkata">Kolkata</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Occupation / Business Profile</label>
              <input
                type="text"
                placeholder="e.g. Technology Founder, Surgeon, Industrialist"
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Residential Status</label>
              <select
                value={residentStatus}
                onChange={(e) => setResidentStatus(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium"
              >
                <option value="Resident Indian">Resident Indian</option>
                <option value="Non-Resident Indian (NRI)">Non-Resident Indian (NRI)</option>
                <option value="Overseas Citizen (OCI)">Overseas Citizen (OCI)</option>
              </select>
            </div>
          </div>

          {/* Financial Figures in INR */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Investable Assets (INR ₹)
              </label>
              <input
                type="number"
                min={2500000}
                step={1000000}
                required
                value={investableAssets}
                onChange={(e) => setInvestableAssets(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Total Net Worth (INR ₹)
              </label>
              <input
                type="number"
                min={2500000}
                step={1000000}
                required
                value={totalNetWorth}
                onChange={(e) => setTotalNetWorth(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Liabilities / Loans (INR ₹)
              </label>
              <input
                type="number"
                min={0}
                step={500000}
                value={liabilities}
                onChange={(e) => setLiabilities(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
              />
            </div>
          </div>

          {/* Risk Profile, Benchmark, Tier */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Investor Tier</label>
              <select
                value={tier}
                onChange={(e) => setTier(e.target.value as ClientTier)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium"
              >
                <option value="Ultra HNI">Ultra HNI (₹10 Cr+)</option>
                <option value="High Net Worth (HNI)">High Net Worth (₹1 Cr - ₹10 Cr)</option>
                <option value="Affluent">Affluent (₹25L - ₹1 Cr)</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Risk Profile</label>
              <select
                value={riskProfile}
                onChange={(e) => setRiskProfile(e.target.value as RiskProfileType)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium"
              >
                <option value="Conservative">Conservative</option>
                <option value="Moderately Conservative">Moderately Conservative</option>
                <option value="Balanced">Balanced</option>
                <option value="Growth">Growth</option>
                <option value="Aggressive Growth">Aggressive Growth</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Indian Benchmark</label>
              <select
                value={benchmark}
                onChange={(e) => setBenchmark(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium"
              >
                <option value="NIFTY 50 (TRI)">NIFTY 50 (TRI)</option>
                <option value="S&P BSE SENSEX">S&P BSE SENSEX</option>
                <option value="NIFTY 500 (Broad Market)">NIFTY 500 (Broad Market)</option>
                <option value="CRISIL Composite Bond Fund Index">CRISIL Composite Bond Fund Index</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Tax Bracket / Regime</label>
              <input
                type="text"
                placeholder="30% + 15% Surcharge (New Regime)"
                value={taxBracket}
                onChange={(e) => setTaxBracket(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Lead Wealth Advisor</label>
              <input
                type="text"
                disabled
                value={advisor}
                className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-600 font-semibold cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Fiduciary Notes & Mandate</label>
            <textarea
              rows={3}
              placeholder="Investment horizons, liquidity triggers, Section 112A capital gains preferences, family trust structures..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
            />
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Governed under Indian Fiduciary Standard
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 text-slate-600 hover:text-slate-900 font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg shadow-xs cursor-pointer"
              >
                {isEditing ? 'Save Changes' : 'Complete Onboarding'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
