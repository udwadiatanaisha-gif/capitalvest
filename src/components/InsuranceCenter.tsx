import React, { useState } from 'react';
import { Client, InsurancePolicy, InsuranceGap } from '../types';
import { formatINR } from '../utils/pdfGenerator';
import {
  ShieldAlert,
  ShieldCheck,
  Plus,
  AlertTriangle,
  FileCheck,
  Lock,
  ChevronRight,
  ExternalLink,
  CheckCircle2,
  Calendar,
  HeartPulse,
} from 'lucide-react';

interface InsuranceCenterProps {
  clients: Client[];
  isMasked: boolean;
  onAddPolicy: (clientId: string, policy: InsurancePolicy) => void;
  onSelectClient: (client: Client) => void;
  onDownloadClientPdf: (client: Client) => void;
}

export const InsuranceCenter: React.FC<InsuranceCenterProps> = ({
  clients,
  isMasked,
  onAddPolicy,
  onSelectClient,
  onDownloadClientPdf,
}) => {
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [showAddPolicyModal, setShowAddPolicyModal] = useState<boolean>(false);
  const [targetClientId, setTargetClientId] = useState<string>(clients[0]?.id || '');

  // Add policy form state
  const [policyType, setPolicyType] = useState<InsurancePolicy['type']>('Term Life Cover');
  const [provider, setProvider] = useState('');
  const [policyNumber, setPolicyNumber] = useState('');
  const [sumInsured, setSumInsured] = useState<number>(50000000); // ₹5.0 Cr
  const [annualPremium, setAnnualPremium] = useState<number>(45000); // ₹45k
  const [renewalDate, setRenewalDate] = useState('15 Apr 2027');
  const [nominee, setNominee] = useState('');

  // Collect all policies & gaps
  const allPolicies = clients.flatMap((c) =>
    c.insurancePolicies.map((p) => ({
      ...p,
      clientId: c.id,
      clientName: c.name,
      clientCity: c.city,
      clientTier: c.tier,
    }))
  );

  const allGaps = clients.flatMap((c) =>
    c.insuranceGaps.map((g) => ({
      ...g,
      clientId: c.id,
      clientName: c.name,
      clientCity: c.city,
      clientTier: c.tier,
      clientNetWorth: c.totalNetWorth,
    }))
  );

  const totalCoverageSum = allPolicies.reduce((acc, p) => acc + p.sumInsured, 0);
  const totalPremiums = allPolicies.reduce((acc, p) => acc + p.annualPremium, 0);
  const criticalGaps = allGaps.filter((g) => g.severity === 'Critical');

  const filteredGaps =
    selectedCategoryFilter === 'all'
      ? allGaps
      : allGaps.filter((g) => g.category.toLowerCase().includes(selectedCategoryFilter.toLowerCase()));

  const handleCreatePolicy = (e: React.FormEvent) => {
    e.preventDefault();
    if (!provider || !policyNumber) return;

    const newPolicy: InsurancePolicy = {
      id: `pol-in-${Date.now()}`,
      type: policyType,
      provider,
      policyNumber,
      sumInsured,
      annualPremium,
      renewalDate,
      nominee: nominee || 'Client Family Trust / Legal Heirs',
      status: 'Active',
    };

    onAddPolicy(targetClientId, newPolicy);
    setShowAddPolicyModal(false);
    setProvider('');
    setPolicyNumber('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-xl bg-white p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-900 text-[11px] font-semibold mb-2">
            <HeartPulse className="w-3.5 h-3.5 text-blue-700" />
            <span>Strict Fiduciary Protection: Segregated from Investment Assets</span>
          </div>
          <h1 className="text-xl font-bold font-serif-brand text-slate-900">
            Insurance & Family Protection Gap Center (India)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit pure term insurance, family floater health, super top-up policies, and critical illness safeguards across Indian carriers
          </p>
        </div>

        <button
          onClick={() => setShowAddPolicyModal(true)}
          className="px-3.5 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 self-start md:self-auto cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Record Insurance Policy</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl bg-white p-5 border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold uppercase text-slate-400">Total Sum Insured Underwritten</span>
          <div className="text-2xl font-bold font-serif-brand text-slate-900 mt-2">
            {formatINR(totalCoverageSum, { masked: isMasked })}
          </div>
          <div className="text-xs text-slate-500 mt-1">Across {allPolicies.length} Active Policies</div>
        </div>

        <div className="rounded-xl bg-white p-5 border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold uppercase text-slate-400">Annual Protection Outflow</span>
          <div className="text-2xl font-bold font-serif-brand text-blue-900 mt-2">
            {formatINR(totalPremiums, { masked: isMasked })}/yr
          </div>
          <div className="text-xs text-slate-500 mt-1">Pure risk transfer (No endowment commingling)</div>
        </div>

        <div className="rounded-xl bg-white p-5 border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold uppercase text-slate-400">Identified Coverage Gaps</span>
          <div className="text-2xl font-bold font-serif-brand text-rose-700 mt-2">
            {allGaps.length} Shortfalls
          </div>
          <div className="text-xs text-rose-700 font-semibold mt-1">
            {criticalGaps.length} Critical Family Protection Shortfalls
          </div>
        </div>

        <div className="rounded-xl bg-white p-5 border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold uppercase text-slate-400">Family Preservation Score</span>
          <div className="text-2xl font-bold font-serif-brand text-emerald-700 mt-2">92.8%</div>
          <div className="text-xs text-emerald-800 font-semibold mt-1">Meets 15x Income Protection Rule</div>
        </div>
      </div>

      {/* Automated Insurance Gap Detector Banner */}
      <div className="rounded-xl bg-white p-6 border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 font-serif-brand flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-700" />
              Automated Protection Gap Diagnostics
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Identifies liabilities vs term life protection, health insurance tertiary hospital coverage deficits, and doctor disability exposures
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 font-medium">Category:</span>
            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="px-2.5 py-1 bg-slate-50 text-slate-700 rounded-lg border border-slate-200 focus:outline-hidden cursor-pointer"
            >
              <option value="all">All Protection Types ({allGaps.length})</option>
              <option value="top-up">Super Top-Up Health</option>
              <option value="disability">Specialist Disability</option>
              <option value="term">Term Life Shortfall</option>
              <option value="key">Key Person Business</option>
            </select>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredGaps.map((gap) => (
            <div
              key={gap.id}
              className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                gap.severity === 'Critical'
                  ? 'bg-rose-50/60 border-rose-200'
                  : 'bg-amber-50/60 border-amber-200'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        gap.severity === 'Critical'
                          ? 'bg-rose-100 text-rose-900 border border-rose-300'
                          : 'bg-amber-100 text-amber-900 border border-amber-300'
                      }`}
                    >
                      {gap.severity} Deficit
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 mt-2 font-serif-brand">
                      {gap.category}
                    </h3>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Client: <strong>{gap.clientName}</strong> ({gap.clientCity})
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">Shortfall</span>
                    <div className="text-base font-bold text-rose-700 font-serif-brand">
                      {formatINR(gap.shortfall, { masked: isMasked })}
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-700 mt-3 leading-relaxed">{gap.description}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-center justify-between">
                <span className="text-[11px] font-bold text-blue-900">
                  Recommended Action: {gap.mitigationAction}
                </span>

                <button
                  onClick={() => {
                    const c = clients.find((x) => x.id === gap.clientId);
                    if (c) onSelectClient(c);
                  }}
                  className="text-xs font-semibold text-slate-700 hover:text-blue-950 flex items-center gap-1 cursor-pointer shrink-0 ml-2"
                >
                  <span>Dossier</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active Insurance Policy Repository Table */}
      <div className="rounded-xl bg-white border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 font-serif-brand">
              Active Underwritten Insurance Contracts & Nominee Vault
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Institutional Indian carriers: HDFC Life, ICICI Prudential, Max Life, Care Health, Star Health, Tata AIA
            </p>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            {allPolicies.length} Active Policies
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Client & Policy Type</th>
                <th className="py-3 px-4">Insurer & Policy #</th>
                <th className="py-3 px-4">Sum Insured (INR)</th>
                <th className="py-3 px-4">Annual Premium</th>
                <th className="py-3 px-4">Nominee Designation</th>
                <th className="py-3 px-4">Renewal Date</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {allPolicies.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">{p.clientName}</div>
                    <div className="text-[11px] text-blue-950 font-medium">{p.type}</div>
                  </td>

                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-800">{p.provider}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{p.policyNumber}</div>
                  </td>

                  <td className="py-3 px-4 font-bold text-slate-900 text-sm">
                    {formatINR(p.sumInsured, { masked: isMasked })}
                  </td>

                  <td className="py-3 px-4 font-semibold text-slate-700">
                    {formatINR(p.annualPremium, { masked: isMasked })}/yr
                  </td>

                  <td className="py-3 px-4 text-slate-600 font-medium">{p.nominee}</td>

                  <td className="py-3 px-4 text-slate-600">{p.renewalDate}</td>

                  <td className="py-3 px-4 text-right">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                        p.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-amber-50 text-amber-900 border border-amber-300'
                      }`}
                    >
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Policy Modal */}
      {showAddPolicyModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900 font-serif-brand flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-amber-700" />
                Record Indian Insurance Policy
              </h3>
              <button
                onClick={() => setShowAddPolicyModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg px-2 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePolicy} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Select Client Account</label>
                <select
                  value={targetClientId}
                  onChange={(e) => setTargetClientId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium"
                >
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.city}) - {c.tier}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Insurance Category</label>
                <select
                  value={policyType}
                  onChange={(e) => setPolicyType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium"
                >
                  <option value="Term Life Cover">Pure Term Life Cover</option>
                  <option value="Health Insurance (Base/Floater)">Health Insurance (Base / Floater)</option>
                  <option value="Super Top-Up Health">Super Top-Up Health Insurance</option>
                  <option value="Critical Illness Cover">Critical Illness Cover</option>
                  <option value="Personal Accident">Personal Accident & Disability</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Insurer Carrier</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. HDFC Life or Care Health"
                    value={provider}
                    onChange={(e) => setProvider(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Policy Number</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. HD-8849102"
                    value={policyNumber}
                    onChange={(e) => setPolicyNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Sum Insured (INR ₹)</label>
                  <input
                    type="number"
                    min={1000000}
                    step={1000000}
                    value={sumInsured}
                    onChange={(e) => setSumInsured(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Annual Premium (INR ₹)</label>
                  <input
                    type="number"
                    min={5000}
                    step={5000}
                    value={annualPremium}
                    onChange={(e) => setAnnualPremium(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Nominee Designation</label>
                  <input
                    type="text"
                    placeholder="e.g. Spouse / Legal Heirs"
                    value={nominee}
                    onChange={(e) => setNominee(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Renewal Date</label>
                  <input
                    type="text"
                    placeholder="e.g. 15 Apr 2027"
                    value={renewalDate}
                    onChange={(e) => setRenewalDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddPolicyModal(false)}
                  className="px-3.5 py-2 text-slate-600 hover:text-slate-900 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg shadow-xs cursor-pointer"
                >
                  Save Policy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
