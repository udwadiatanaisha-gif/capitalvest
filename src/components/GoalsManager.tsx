import React, { useState } from 'react';
import { Client, FinancialGoal } from '../types';
import { formatINR } from '../utils/pdfGenerator';
import {
  Target,
  Plus,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Clock,
  Sparkles,
  Calendar,
  Percent,
} from 'lucide-react';

interface GoalsManagerProps {
  clients: Client[];
  isMasked: boolean;
  onUpdateClientGoals: (clientId: string, newGoal: FinancialGoal) => void;
}

export const GoalsManager: React.FC<GoalsManagerProps> = ({
  clients,
  isMasked,
  onUpdateClientGoals,
}) => {
  const [selectedClientId, setSelectedClientId] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // Form states for adding goal
  const [targetClientId, setTargetClientId] = useState<string>(clients[0]?.id || '');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<FinancialGoal['category']>('Children Education');
  const [targetAmount, setTargetAmount] = useState<number>(35000000); // ₹3.5 Cr
  const [currentAmount, setCurrentAmount] = useState<number>(10000000); // ₹1.0 Cr
  const [targetYear, setTargetYear] = useState<number>(2032);
  const [monthlySipRequired, setMonthlySipRequired] = useState<number>(150000); // ₹1.5L
  const [inflationRateAssumption, setInflationRateAssumption] = useState<number>(8.0);

  // Gather all goals across clients
  const allGoalsWithClient = clients.flatMap((c) =>
    c.goals.map((g) => ({
      ...g,
      clientId: c.id,
      clientName: c.name,
      clientCity: c.city,
      clientTier: c.tier,
    }))
  );

  const filteredGoals =
    selectedClientId === 'all'
      ? allGoalsWithClient
      : allGoalsWithClient.filter((g) => g.clientId === selectedClientId);

  const totalGoalsValue = filteredGoals.reduce((sum, g) => sum + g.targetAmount, 0);
  const totalFundedValue = filteredGoals.reduce((sum, g) => sum + g.currentAmount, 0);
  const totalSipRequired = filteredGoals.reduce((sum, g) => sum + g.monthlySipRequired, 0);
  const avgFundedPct = totalGoalsValue ? Math.round((totalFundedValue / totalGoalsValue) * 100) : 0;

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    const prob = Math.min(99, Math.max(65, Math.round((currentAmount / targetAmount) * 100 + 40)));
    const status: FinancialGoal['status'] =
      prob >= 90 ? 'ahead' : prob >= 75 ? 'on_track' : 'needs_attention';

    const newGoal: FinancialGoal = {
      id: `goal-in-${Date.now()}`,
      title,
      category,
      targetAmount,
      currentAmount,
      targetYear,
      monthlySipRequired,
      probabilityOfSuccess: prob,
      status,
      inflationRateAssumption,
    };

    onUpdateClientGoals(targetClientId, newGoal);
    setShowAddModal(false);
    setTitle('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-xl bg-white p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold font-serif-brand text-slate-900">
            Household Financial Goals & Systematic Investment Plans (SIP)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Inflation-adjusted milestone modeling for children’s education abroad, weddings, luxury real estate, and intergenerational trusts
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedClientId}
            onChange={(e) => setSelectedClientId(e.target.value)}
            className="px-3 py-1.5 text-xs font-semibold bg-slate-50 text-slate-900 rounded-lg border border-slate-200 focus:outline-hidden cursor-pointer"
          >
            <option value="all">All Clients ({allGoalsWithClient.length} Goals)</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.goals.length} Goals)
              </option>
            ))}
          </select>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Financial Goal</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl bg-white p-5 border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold uppercase text-slate-400">Total Target Commitments</span>
          <div className="text-2xl font-bold font-serif-brand text-slate-900 mt-2">
            {formatINR(totalGoalsValue, { masked: isMasked })}
          </div>
          <div className="text-xs text-slate-500 mt-1">Across {filteredGoals.length} Indian household goals</div>
        </div>

        <div className="rounded-xl bg-white p-5 border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold uppercase text-slate-400">Total Corpus Funded</span>
          <div className="text-2xl font-bold font-serif-brand text-emerald-700 mt-2">
            {formatINR(totalFundedValue, { masked: isMasked })}
          </div>
          <div className="text-xs text-emerald-800 font-semibold mt-1">
            {avgFundedPct}% Aggregated Progress
          </div>
        </div>

        <div className="rounded-xl bg-white p-5 border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold uppercase text-slate-400">Monthly SIP Pacing Required</span>
          <div className="text-2xl font-bold font-serif-brand text-blue-900 mt-2 flex items-center gap-2">
            <span>{formatINR(totalSipRequired, { masked: isMasked })}/mo</span>
          </div>
          <div className="text-xs text-slate-500 mt-1">Across active mutual fund mandates</div>
        </div>
      </div>

      {/* Goals Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredGoals.map((g) => {
          const pct = Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100));
          return (
            <div
              key={g.id}
              className="rounded-xl bg-white p-5 border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 px-2 py-0.5 rounded bg-amber-50 border border-amber-200">
                      {g.category}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-2 font-serif-brand">{g.title}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Client: <strong>{g.clientName}</strong> ({g.clientCity})
                    </p>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                      g.status === 'ahead'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : g.status === 'on_track'
                        ? 'bg-blue-50 text-blue-900 border-blue-200'
                        : 'bg-amber-50 text-amber-900 border-amber-300'
                    }`}
                  >
                    {g.status === 'ahead'
                      ? 'Ahead of Schedule'
                      : g.status === 'on_track'
                      ? 'On Track'
                      : 'Needs Allocation Boost'}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="mt-4 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">
                      Accumulated: {formatINR(g.currentAmount, { masked: isMasked })}
                    </span>
                    <span className="font-bold text-slate-900">
                      Target: {formatINR(g.targetAmount, { masked: isMasked })} ({pct}%)
                    </span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${pct}%` }}
                      className={`h-full rounded-full transition-all ${
                        pct >= 85 ? 'bg-emerald-600' : pct >= 50 ? 'bg-blue-800' : 'bg-amber-600'
                      }`}
                    />
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2 py-2.5 px-3 bg-slate-50 rounded-lg text-xs border border-slate-100">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Target Year</span>
                    <span className="font-bold text-slate-800">{g.targetYear}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Monthly SIP</span>
                    <span className="font-bold text-slate-800">
                      {formatINR(g.monthlySipRequired, { compact: true, masked: isMasked })}/mo
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Inflation</span>
                    <span className="font-bold text-blue-900">{g.inflationRateAssumption}% p.a.</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  Estimated Milestone Horizon: {g.targetYear}
                </span>
                <span className="font-bold text-emerald-700">
                  Probability: {g.probabilityOfSuccess}%
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Goal Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900 font-serif-brand flex items-center gap-2">
                <Target className="w-4 h-4 text-amber-700" />
                Create New Household Goal (INR)
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg px-2 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateGoal} className="mt-4 space-y-4 text-xs">
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
                <label className="font-semibold text-slate-700 block mb-1">Goal Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Children Higher Education abroad (Master's) or Whitefield Villa"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Goal Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium"
                  >
                    <option value="Children Education">Children's Education</option>
                    <option value="Children Wedding">Children's Wedding</option>
                    <option value="Home Purchase">Home Purchase / Real Estate</option>
                    <option value="Retirement">Comfort Retirement</option>
                    <option value="Business Expansion">Business Expansion / Seed</option>
                    <option value="Intergenerational Trust">Intergenerational Family Trust</option>
                    <option value="Emergency Fund">Emergency Fund Reserve</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Target Horizon (Year)</label>
                  <input
                    type="number"
                    min={2026}
                    max={2060}
                    value={targetYear}
                    onChange={(e) => setTargetYear(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Target Amount (INR ₹)</label>
                  <input
                    type="number"
                    min={500000}
                    step={500000}
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Accumulated / Initial (INR ₹)</label>
                  <input
                    type="number"
                    min={0}
                    step={250000}
                    value={currentAmount}
                    onChange={(e) => setCurrentAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Planned Monthly SIP (INR ₹)</label>
                  <input
                    type="number"
                    min={5000}
                    step={5000}
                    value={monthlySipRequired}
                    onChange={(e) => setMonthlySipRequired(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Annual Inflation Assumption (%)</label>
                  <input
                    type="number"
                    min={3}
                    max={15}
                    step={0.5}
                    value={inflationRateAssumption}
                    onChange={(e) => setInflationRateAssumption(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-2 text-slate-600 hover:text-slate-900 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg shadow-xs cursor-pointer"
                >
                  Save Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
