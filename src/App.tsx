import React, { useState, useEffect } from 'react';
import { Client, ReviewSession, RiskAlert, FinancialGoal, InsurancePolicy, Holding } from './types';
import { INITIAL_CLIENTS, INITIAL_REVIEWS, INITIAL_RISK_ALERTS } from './data/mockData';
import { Header, NavTab } from './components/Header';
import { DashboardOverview } from './components/DashboardOverview';
import { ClientsManager } from './components/ClientsManager';
import { PortfoliosManager } from './components/PortfoliosManager';
import { GoalsManager } from './components/GoalsManager';
import { RiskCenter } from './components/RiskCenter';
import { InsuranceCenter } from './components/InsuranceCenter';
import { ReviewsManager } from './components/ReviewsManager';
import { AdvisoryAi } from './components/AdvisoryAi';
import { ClientDetailModal } from './components/ClientDetailModal';
import { ClientFormModal } from './components/ClientFormModal';
import { ExcelManagerModal } from './components/ExcelManagerModal';
import { Footer } from './components/Footer';
import { generateClientPdf, generateFirmExecutivePdf } from './utils/pdfGenerator';
import { Sparkles } from 'lucide-react';

export default function App() {
  // State with LocalStorage persistence (versioned for Indian wealth dataset)
  const [clients, setClients] = useState<Client[]>(() => {
    const saved = localStorage.getItem('capitalvest_in_clients_v2');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].panNumber) {
          return parsed;
        }
      } catch (e) {
        console.error('Failed to parse cached Indian clients:', e);
      }
    }
    return INITIAL_CLIENTS;
  });

  const [reviews, setReviews] = useState<ReviewSession[]>(() => {
    const saved = localStorage.getItem('capitalvest_in_reviews_v2');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse cached Indian reviews:', e);
      }
    }
    return INITIAL_REVIEWS;
  });

  const [riskAlerts, setRiskAlerts] = useState<RiskAlert[]>(() => {
    const saved = localStorage.getItem('capitalvest_in_alerts_v2');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse cached Indian alerts:', e);
      }
    }
    return INITIAL_RISK_ALERTS;
  });

  // UI state
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [isMasked, setIsMasked] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedClientForDossier, setSelectedClientForDossier] = useState<Client | null>(null);
  const [clientToEdit, setClientToEdit] = useState<Client | null>(null);
  const [isAddClientOpen, setIsAddClientOpen] = useState<boolean>(false);
  const [isExcelHubOpen, setIsExcelHubOpen] = useState<boolean>(false);

  // Sync state to LocalStorage
  useEffect(() => {
    localStorage.setItem('capitalvest_in_clients_v2', JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem('capitalvest_in_reviews_v2', JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    localStorage.setItem('capitalvest_in_alerts_v2', JSON.stringify(riskAlerts));
  }, [riskAlerts]);

  // Handler: Add or Update client
  const handleSaveClient = (clientData: Partial<Client>) => {
    if (clientToEdit) {
      // Update existing
      setClients((prev) =>
        prev.map((c) => (c.id === clientToEdit.id ? ({ ...c, ...clientData } as Client) : c))
      );
      if (selectedClientForDossier?.id === clientToEdit.id) {
        setSelectedClientForDossier({ ...selectedClientForDossier, ...clientData } as Client);
      }
    } else {
      // Add new Indian Client
      const investable = clientData.investableAssets || 50000000;
      const netWorth = clientData.totalNetWorth || investable * 1.3;
      const liabilities = clientData.liabilities || 5000000;

      const newClient: Client = {
        id: `cv-in-${100 + clients.length + 1}`,
        name: clientData.name || 'New Client',
        panNumber: clientData.panNumber || 'ABCDE1234F',
        email: clientData.email || '',
        phone: clientData.phone || '+91 98000 00000',
        city: clientData.city || 'Mumbai',
        occupation: clientData.occupation || 'Business Executive',
        residentStatus: clientData.residentStatus || 'Resident Indian',
        tier: clientData.tier || 'High Net Worth (HNI)',
        investableAssets: investable,
        liabilities: liabilities,
        totalNetWorth: netWorth,
        unrealizedGain: clientData.unrealizedGain || Math.round(investable * 0.14),
        realizedGainYtd: clientData.realizedGainYtd || Math.round(investable * 0.02),
        ytdReturnPercent: clientData.ytdReturnPercent || 15.6,
        riskProfile: clientData.riskProfile || 'Growth',
        benchmark: clientData.benchmark || 'NIFTY 50 (TRI)',
        advisor: 'Tanaisha Udwadia, CFA',
        taxBracket: clientData.taxBracket || '30% + 15% Surcharge',
        financialYear: 'FY 2026-27',
        onboardingDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        emergencyFundMonths: 6,
        emergencyFundStatus: 'Well Funded',
        notes: clientData.notes || '',
        kycStatus: clientData.kycStatus || 'Verified (CKYC/KRA)',
        allocation: clientData.allocation || {
          equities: 50,
          mutualFunds: 25,
          fixedIncome: 15,
          goldSilver: 5,
          realEstate: 3,
          cash: 2,
        },
        targetAllocation: clientData.targetAllocation || {
          equities: 50,
          mutualFunds: 25,
          fixedIncome: 15,
          goldSilver: 5,
          realEstate: 3,
          cash: 2,
        },
        holdings: clientData.holdings || [],
        sipCommitments: clientData.sipCommitments || [],
        goals: clientData.goals || [],
        insurancePolicies: clientData.insurancePolicies || [],
        insuranceGaps: clientData.insuranceGaps || [],
        lastReviewDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        nextReviewDate: '20 Dec 2026',
      };

      setClients((prev) => [newClient, ...prev]);

      // Automatically schedule introductory review
      const newReview: ReviewSession = {
        id: `rev-in-${Date.now()}`,
        clientId: newClient.id,
        clientName: newClient.name,
        date: '28 Nov 2026',
        time: '11:00 AM IST',
        type: 'Quarterly Portfolio Review',
        status: 'Upcoming',
        agenda: 'Initial onboarding portfolio alignment, CKYC verification, and risk mandate signing.',
        actionItems: [
          'Verify CKYC / KRA status on CVL/Karvy portal',
          'Deploy initial cash tranche into 7.18% G-Sec ladder',
          'Coordinate pure term insurance gap audit',
        ],
      };
      setReviews((prev) => [newReview, ...prev]);
    }

    setClientToEdit(null);
    setIsAddClientOpen(false);
  };

  // Handler: Import clients via Excel Hub
  const handleImportClients = (newClients: Client[], mode: 'merge' | 'append') => {
    if (mode === 'append') {
      setClients((prev) => [...newClients, ...prev]);
    } else {
      // Smart Merge: update if PAN or Email matches, otherwise append
      setClients((prev) => {
        const merged = [...prev];
        newClients.forEach((imported) => {
          const existingIdx = merged.findIndex(
            (c) =>
              (c.panNumber && c.panNumber === imported.panNumber) ||
              (c.email && c.email.toLowerCase() === imported.email.toLowerCase())
          );
          if (existingIdx >= 0) {
            merged[existingIdx] = {
              ...merged[existingIdx],
              ...imported,
              id: merged[existingIdx].id, // preserve existing ID
              holdings: imported.holdings.length > 0 ? imported.holdings : merged[existingIdx].holdings,
            };
          } else {
            merged.unshift(imported);
          }
        });
        return merged;
      });
    }
  };

  // Handler: Import holdings for specific client via Excel Hub
  const handleImportHoldings = (clientId: string, newHoldings: Holding[]) => {
    setClients((prev) =>
      prev.map((c) => {
        if (c.id !== clientId) return c;
        const totalNewVal = newHoldings.reduce((sum, h) => sum + h.currentValue, 0);
        return {
          ...c,
          holdings: newHoldings,
          investableAssets: totalNewVal > 0 ? totalNewVal : c.investableAssets,
        };
      })
    );
  };

  // Handler: Add Insurance Policy to client
  const handleAddPolicy = (clientId: string, policy: InsurancePolicy) => {
    setClients((prev) =>
      prev.map((c) => {
        if (c.id !== clientId) return c;
        const updatedPolicies = [...c.insurancePolicies, policy];
        // If term cover was added with >= ₹10 Cr, remove term gap
        const updatedGaps =
          policy.type === 'Term Life Cover' && policy.sumInsured >= 100000000
            ? c.insuranceGaps.filter((g) => !g.category.toLowerCase().includes('term'))
            : c.insuranceGaps;

        return {
          ...c,
          insurancePolicies: updatedPolicies,
          insuranceGaps: updatedGaps,
        };
      })
    );
  };

  // Handler: Add Goal to client
  const handleUpdateClientGoals = (clientId: string, newGoal: FinancialGoal) => {
    setClients((prev) =>
      prev.map((c) => (c.id === clientId ? { ...c, goals: [...c.goals, newGoal] } : c))
    );
  };

  // Handler: Resolve Risk Alert
  const handleResolveAlert = (alertId: string) => {
    setRiskAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, resolved: true } : a))
    );
  };

  // Handler: Add Review
  const handleAddReview = (newReview: ReviewSession) => {
    setReviews((prev) => [newReview, ...prev]);
  };

  // Handler: Complete Review
  const handleCompleteReview = (reviewId: string) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === reviewId ? { ...r, status: 'Completed' } : r))
    );
  };

  // Handler: PDF Exports (in INR)
  const handleDownloadClientPdf = (client: Client) => {
    generateClientPdf(client, isMasked);
  };

  const handleDownloadFirmReport = () => {
    generateFirmExecutivePdf(clients, reviews, riskAlerts, isMasked);
  };

  const activeAlertsCount = riskAlerts.filter((a) => !a.resolved).length;
  const totalInsuranceGapsCount = clients.reduce((acc, c) => acc + c.insuranceGaps.length, 0);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      {/* Header */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isMasked={isMasked}
        onToggleMask={() => setIsMasked(!isMasked)}
        onOpenNewClient={() => {
          setClientToEdit(null);
          setIsAddClientOpen(true);
        }}
        onOpenExcelHub={() => setIsExcelHubOpen(true)}
        onDownloadFirmReport={handleDownloadFirmReport}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        riskAlertsCount={activeAlertsCount}
        insuranceGapsCount={totalInsuranceGapsCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <DashboardOverview
            clients={clients}
            reviews={reviews}
            riskAlerts={riskAlerts}
            isMasked={isMasked}
            onSelectClient={(c) => setSelectedClientForDossier(c)}
            onNavigateTab={setActiveTab}
            onResolveAlert={handleResolveAlert}
            onDownloadClientPdf={handleDownloadClientPdf}
            onDownloadFirmReport={handleDownloadFirmReport}
            onOpenExcelHub={() => setIsExcelHubOpen(true)}
          />
        )}

        {activeTab === 'clients' && (
          <ClientsManager
            clients={clients}
            isMasked={isMasked}
            onSelectClient={(c) => setSelectedClientForDossier(c)}
            onOpenAddClient={() => {
              setClientToEdit(null);
              setIsAddClientOpen(true);
            }}
            onOpenEditClient={(c) => {
              setClientToEdit(c);
              setIsAddClientOpen(true);
            }}
            onDownloadClientPdf={handleDownloadClientPdf}
            onOpenExcelHub={() => setIsExcelHubOpen(true)}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        )}

        {activeTab === 'portfolios' && (
          <PortfoliosManager
            clients={clients}
            isMasked={isMasked}
            onSelectClient={(c) => setSelectedClientForDossier(c)}
          />
        )}

        {activeTab === 'goals' && (
          <GoalsManager
            clients={clients}
            isMasked={isMasked}
            onUpdateClientGoals={handleUpdateClientGoals}
          />
        )}

        {activeTab === 'risk' && (
          <RiskCenter
            clients={clients}
            riskAlerts={riskAlerts}
            isMasked={isMasked}
            onResolveAlert={handleResolveAlert}
            onSelectClient={(c) => setSelectedClientForDossier(c)}
          />
        )}

        {activeTab === 'insurance' && (
          <InsuranceCenter
            clients={clients}
            isMasked={isMasked}
            onAddPolicy={handleAddPolicy}
            onSelectClient={(c) => setSelectedClientForDossier(c)}
            onDownloadClientPdf={handleDownloadClientPdf}
          />
        )}

        {activeTab === 'reviews' && (
          <ReviewsManager
            clients={clients}
            reviews={reviews}
            onAddReview={handleAddReview}
            onCompleteReview={handleCompleteReview}
            onDownloadClientPdf={handleDownloadClientPdf}
            onSelectClient={(c) => setSelectedClientForDossier(c)}
          />
        )}

        {activeTab === 'advisory-ai' && (
          <AdvisoryAi
            clients={clients}
            activeClient={selectedClientForDossier}
            onSelectClient={(c) => setSelectedClientForDossier(c)}
            isMasked={isMasked}
          />
        )}
      </main>

      {/* Client 360-Degree Dossier Modal */}
      {selectedClientForDossier && (
        <ClientDetailModal
          client={selectedClientForDossier}
          isMasked={isMasked}
          onClose={() => setSelectedClientForDossier(null)}
          onEditClient={(c) => {
            setSelectedClientForDossier(null);
            setClientToEdit(c);
            setIsAddClientOpen(true);
          }}
          onDownloadPdf={handleDownloadClientPdf}
        />
      )}

      {/* Add / Edit Client Record Modal */}
      <ClientFormModal
        isOpen={isAddClientOpen}
        initialClient={clientToEdit}
        onClose={() => {
          setIsAddClientOpen(false);
          setClientToEdit(null);
        }}
        onSave={handleSaveClient}
      />

      {/* Excel / CSV Integration Hub Modal */}
      <ExcelManagerModal
        isOpen={isExcelHubOpen}
        onClose={() => setIsExcelHubOpen(false)}
        clients={clients}
        onImportClients={handleImportClients}
        onImportHoldings={handleImportHoldings}
      />

      {/* Ambient Floating Advisory AI Quick Trigger */}
      {activeTab !== 'advisory-ai' && (
        <button
          onClick={() => setActiveTab('advisory-ai')}
          className="fixed bottom-6 right-6 z-30 px-4 py-3 rounded-full bg-gradient-to-r from-blue-950 via-slate-900 to-blue-950 text-amber-300 border border-amber-400/60 shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2.5 cursor-pointer group"
          title="Open CapitalVest Advisory AI (Gemini 3.8 Flash)"
        >
          <div className="relative">
            <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400"></span>
          </div>
          <span className="text-xs font-bold text-white group-hover:text-amber-200">
            Advisory AI
          </span>
          <span className="text-[10px] font-bold bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/40">
            Gemini
          </span>
        </button>
      )}

      {/* Footer */}
      <Footer
        onNavigateTab={setActiveTab}
        onDownloadFirmReport={handleDownloadFirmReport}
      />
    </div>
  );
}
