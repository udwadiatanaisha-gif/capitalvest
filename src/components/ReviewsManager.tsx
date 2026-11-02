import React, { useState } from 'react';
import { Client, ReviewSession } from '../types';
import {
  Calendar,
  Clock,
  Plus,
  CheckCircle2,
  FileDown,
  UserCheck,
  ChevronRight,
  BookOpen,
} from 'lucide-react';

interface ReviewsManagerProps {
  clients: Client[];
  reviews: ReviewSession[];
  onAddReview: (review: ReviewSession) => void;
  onCompleteReview: (reviewId: string, notes?: string) => void;
  onDownloadClientPdf: (client: Client) => void;
  onSelectClient: (client: Client) => void;
}

export const ReviewsManager: React.FC<ReviewsManagerProps> = ({
  clients,
  reviews,
  onAddReview,
  onCompleteReview,
  onDownloadClientPdf,
  onSelectClient,
}) => {
  const [filterStatus, setFilterStatus] = useState<'all' | 'Upcoming' | 'Completed'>('all');
  const [showScheduleModal, setShowScheduleModal] = useState<boolean>(false);

  // New review form state
  const [selectedClientId, setSelectedClientId] = useState<string>(clients[0]?.id || '');
  const [date, setDate] = useState('24 Nov 2026');
  const [time, setTime] = useState('11:30 AM IST');
  const [type, setType] = useState<ReviewSession['type']>('Quarterly Portfolio Review');
  const [agenda, setAgenda] = useState('');
  const [actionItemText, setActionItemText] = useState('');

  const filteredReviews = reviews.filter(
    (r) => filterStatus === 'all' || r.status === filterStatus
  );

  const upcomingCount = reviews.filter((r) => r.status === 'Upcoming').length;
  const completedCount = reviews.filter((r) => r.status === 'Completed').length;

  const handleCreateReview = (e: React.FormEvent) => {
    e.preventDefault();
    const client = clients.find((c) => c.id === selectedClientId);
    if (!client || !agenda) return;

    const actionItems = actionItemText
      ? actionItemText.split('\n').filter((x) => x.trim().length > 0)
      : ['Review asset allocation targets', 'Verify CKYC / nominee details'];

    const newSession: ReviewSession = {
      id: `rev-in-${Date.now()}`,
      clientId: client.id,
      clientName: client.name,
      date,
      time,
      type,
      status: 'Upcoming',
      agenda,
      actionItems,
    };

    onAddReview(newSession);
    setShowScheduleModal(false);
    setAgenda('');
    setActionItemText('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-xl bg-white p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold font-serif-brand text-slate-900">
            Fiduciary Reviews & Financial Year Calendar (India)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Quarterly client portfolio governance, annual tax-loss harvesting (Section 112A), advance tax coordination, and family trust reviews
          </p>
        </div>

        <button
          onClick={() => setShowScheduleModal(true)}
          className="px-3.5 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 self-start md:self-auto cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Schedule Client Review</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl bg-white p-5 border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold uppercase text-slate-400">Scheduled Reviews (FY 2026-27)</span>
          <div className="text-2xl font-bold font-serif-brand text-blue-900 mt-2">
            {upcomingCount} Sessions
          </div>
          <div className="text-xs text-slate-500 mt-1">Lead Advisor: Tanaisha Udwadia, CFA</div>
        </div>

        <div className="rounded-xl bg-white p-5 border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold uppercase text-slate-400">Completed Fiduciary Audits</span>
          <div className="text-2xl font-bold font-serif-brand text-emerald-700 mt-2">
            {completedCount} Audits
          </div>
          <div className="text-xs text-emerald-800 font-semibold mt-1">100% Attested & Documented</div>
        </div>

        <div className="rounded-xl bg-white p-5 border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold uppercase text-slate-400">Governance Compliance</span>
          <div className="text-2xl font-bold font-serif-brand text-slate-900 mt-2">100% On-Track</div>
          <div className="text-xs text-slate-500 mt-1">Zero overdue client review mandates</div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="rounded-xl bg-white p-4 border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Session Status:</span>
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1 rounded font-medium transition-colors cursor-pointer ${
                filterStatus === 'all' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600'
              }`}
            >
              All ({reviews.length})
            </button>
            <button
              onClick={() => setFilterStatus('Upcoming')}
              className={`px-3 py-1 rounded font-medium transition-colors cursor-pointer ${
                filterStatus === 'Upcoming' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600'
              }`}
            >
              Upcoming ({upcomingCount})
            </button>
            <button
              onClick={() => setFilterStatus('Completed')}
              className={`px-3 py-1 rounded font-medium transition-colors cursor-pointer ${
                filterStatus === 'Completed' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600'
              }`}
            >
              Completed ({completedCount})
            </button>
          </div>
        </div>

        <span className="text-xs text-slate-500 hidden sm:inline">
          Indian Wealth Fiduciary Code • Timezone: IST (UTC+05:30)
        </span>
      </div>

      {/* Reviews Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredReviews.map((rev) => {
          const client = clients.find((c) => c.id === rev.clientId);
          const isCompleted = rev.status === 'Completed';

          return (
            <div
              key={rev.id}
              className={`rounded-xl border p-5 shadow-xs transition-all flex flex-col justify-between ${
                isCompleted
                  ? 'bg-slate-50/70 border-slate-200'
                  : 'bg-white border-slate-200 hover:border-blue-300'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        rev.type.includes('Tax')
                          ? 'bg-indigo-50 text-indigo-900 border border-indigo-200'
                          : rev.type.includes('Insurance')
                          ? 'bg-rose-50 text-rose-900 border border-rose-200'
                          : 'bg-blue-50 text-blue-900 border border-blue-200'
                      }`}
                    >
                      {rev.type}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-2 font-serif-brand">
                      {rev.clientName}
                    </h3>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      isCompleted
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-amber-50 text-amber-900 border-amber-300'
                    }`}
                  >
                    {rev.status}
                  </span>
                </div>

                {/* Date & Time in IST */}
                <div className="mt-3 flex items-center gap-3 text-xs text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
                  <span className="flex items-center gap-1 font-semibold text-slate-900">
                    <Calendar className="w-3.5 h-3.5 text-blue-900" />
                    {rev.date}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="flex items-center gap-1 font-medium text-slate-700">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    {rev.time}
                  </span>
                </div>

                <div className="mt-3">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Session Agenda
                  </span>
                  <p className="text-xs text-slate-700 mt-0.5 leading-relaxed">{rev.agenda}</p>
                </div>

                {rev.actionItems && rev.actionItems.length > 0 && (
                  <div className="mt-3">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      Fiduciary Action Items
                    </span>
                    <ul className="mt-1 space-y-1 text-xs text-slate-600">
                      {rev.actionItems.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-amber-700 font-bold">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {client && (
                    <button
                      onClick={() => onDownloadClientPdf(client)}
                      className="px-2.5 py-1 text-xs font-semibold rounded bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center gap-1 cursor-pointer"
                      title="Download Client Report PDF (INR)"
                    >
                      <FileDown className="w-3.5 h-3.5" />
                      <span>Report PDF (₹)</span>
                    </button>
                  )}
                  {client && (
                    <button
                      onClick={() => onSelectClient(client)}
                      className="px-2.5 py-1 text-xs font-semibold rounded text-blue-900 hover:underline cursor-pointer"
                    >
                      View Dossier
                    </button>
                  )}
                </div>

                {!isCompleted && (
                  <button
                    onClick={() => onCompleteReview(rev.id)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Mark Attested</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Schedule Review Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900 font-serif-brand flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-700" />
                Schedule Fiduciary Review (IST)
              </h3>
              <button
                onClick={() => setShowScheduleModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg px-2 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateReview} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Select Client Family Account</label>
                <select
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
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
                <label className="font-semibold text-slate-700 block mb-1">Review Mandate Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium"
                >
                  <option value="Quarterly Portfolio Review">Quarterly Portfolio Performance Review</option>
                  <option value="Annual Tax-Loss Planning (FY)">Annual Tax-Loss Planning & Section 112A Audit</option>
                  <option value="Asset Rebalancing">Tactical Asset Rebalancing Session</option>
                  <option value="Insurance & Protection Audit">Insurance & Family Protection Audit</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Date</label>
                  <input
                    type="text"
                    value={date}
                    placeholder="e.g. 24 Nov 2026"
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Time (IST)</label>
                  <input
                    type="text"
                    value={time}
                    placeholder="e.g. 11:30 AM IST"
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Meeting Agenda</label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Evaluate NIFTY 50 outperformance, deploy quarterly SIP inflows, and check health super top-up coverage."
                  value={agenda}
                  onChange={(e) => setAgenda(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Action Items (One per line)
                </label>
                <textarea
                  rows={2}
                  placeholder="Review Section 112A capital gains harvesting&#10;Bind Care Supreme super top-up policy"
                  value={actionItemText}
                  onChange={(e) => setActionItemText(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="px-3.5 py-2 text-slate-600 hover:text-slate-900 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg shadow-xs cursor-pointer"
                >
                  Confirm & Schedule Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
