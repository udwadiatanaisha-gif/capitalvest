import React, { useState, useRef, useEffect } from 'react';
import { Client } from '../types';
import { formatINR } from '../utils/pdfGenerator';
import {
  Sparkles,
  Send,
  User,
  Bot,
  RefreshCw,
  Copy,
  Check,
  AlertTriangle,
  ShieldCheck,
  PieChart,
  Target,
  ShieldAlert,
  Calculator,
  ArrowRight,
  TrendingUp,
  FileText,
  Lock,
  ChevronDown,
  Info,
  Maximize2,
  Trash2,
  Download,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
  clientContextName?: string;
  source?: string;
}

interface AdvisoryAiProps {
  clients: Client[];
  activeClient?: Client | null;
  onSelectClient: (client: Client) => void;
  isMasked: boolean;
}

export const AdvisoryAi: React.FC<AdvisoryAiProps> = ({
  clients,
  activeClient: initialActiveClient,
  onSelectClient,
  isMasked,
}) => {
  const [selectedClientId, setSelectedClientId] = useState<string>(
    initialActiveClient ? initialActiveClient.id : clients[0]?.id || ''
  );
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [showRetirementTool, setShowRetirementTool] = useState<boolean>(false);

  // Retirement tool state
  const [retireCurrentAge, setRetireCurrentAge] = useState<number>(42);
  const [retireAge, setRetireAge] = useState<number>(60);
  const [lifeExpectancy, setLifeExpectancy] = useState<number>(85);
  const [monthlyExpense, setMonthlyExpense] = useState<number>(200000); // ₹2.0 Lakhs/mo
  const [inflationRate, setInflationRate] = useState<number>(6.5); // 6.5%
  const [preRetireReturn, setPreRetireReturn] = useState<number>(12.0); // 12%
  const [postRetireReturn, setPostRetireReturn] = useState<number>(8.0); // 8%

  const activeClient = clients.find((c) => c.id === selectedClientId) || clients[0] || null;

  // Sync selected client age into retirement tool
  useEffect(() => {
    if (activeClient && activeClient.age) {
      setRetireCurrentAge(activeClient.age);
    }
  }, [activeClient]);

  // Initial welcome message
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      role: 'model',
      text: `### Welcome to CapitalVest Advisory AI

I am your institutional financial intelligence partner, powered by **Gemini 3.8 Flash** and built exclusively for the Indian private wealth market.

I have direct access to CapitalVest's live client telemetry, portfolio allocations, financial goals, and family protection audits.

#### Key Capabilities Available:
- **Portfolio & Risk Analysis**: Analyze direct Indian equity holdings, mutual fund categories, concentration limits, and mandate benchmark drift.
- **Indian Market Instruments**: Deep-dive into NSE/BSE securities, NIFTY 50/SENSEX, RBI G-Secs, Sovereign Gold Bonds (SGB), and REITs.
- **Retirement & Goals Simulation**: Stress-test household retirement corpus requirements under Indian inflation dynamics.
- **Protection & Gap Audits**: Identify life and health insurance shortfalls segregated strictly from investment assets.
- **Client Meeting Assistant**: Draft executive review summaries, formal agendas, and follow-up notes for Lead Advisor **Tanaisha Udwadia, CFA**.

Select a client from the top bar or pick one of the recommended prompts below to begin.`,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      source: 'gemini-3.8-flash',
      clientContextName: activeClient?.name || 'CapitalVest Consolidated',
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Handle client selection change
  const handleClientChange = (clientId: string) => {
    setSelectedClientId(clientId);
    const chosen = clients.find((c) => c.id === clientId);
    if (chosen) {
      onSelectClient(chosen);
    }
  };

  // Predefined prompt categories
  const categories = [
    { id: 'all', label: 'All Recommendations' },
    { id: 'portfolio', label: 'Portfolio & Allocation' },
    { id: 'market', label: 'Indian Stocks & Markets' },
    { id: 'insurance', label: 'Insurance & Protection' },
    { id: 'retirement', label: 'Retirement & Goals' },
    { id: 'meeting', label: 'Client Review & Notes' },
  ];

  const suggestedPrompts = [
    {
      id: 'p1',
      category: 'portfolio',
      text: "Analyse this client's portfolio.",
      sub: 'Breakdown asset allocation, performance vs benchmark, and diversification.',
    },
    {
      id: 'p2',
      category: 'portfolio',
      text: 'Identify the biggest portfolio risks.',
      sub: 'Examine sector concentration, market volatility, and asset drift.',
    },
    {
      id: 'p3',
      category: 'portfolio',
      text: "Explain this portfolio's asset allocation.",
      sub: 'Compare current equity, debt, gold, and cash weights against mandate.',
    },
    {
      id: 'p4',
      category: 'portfolio',
      text: 'Is this portfolio diversified?',
      sub: 'Assess correlations across Indian equities, mutual funds, G-Secs, and gold.',
    },
    {
      id: 'p5',
      category: 'insurance',
      text: "Review this client's insurance coverage.",
      sub: 'Audit term life, family health floaters, and highlight identified protection gaps.',
    },
    {
      id: 'p6',
      category: 'retirement',
      text: 'Estimate the retirement corpus required.',
      sub: 'Calculate inflation-adjusted retirement nest egg and monthly drawdown needs.',
    },
    {
      id: 'p7',
      category: 'meeting',
      text: 'Prepare a client review summary.',
      sub: 'Generate a structured agenda and talking points for Lead Advisor Tanaisha Udwadia.',
    },
    {
      id: 'p8',
      category: 'market',
      text: 'Explain Sovereign Gold Bonds (SGB) vs Gold ETFs.',
      sub: 'Compare sovereign guarantee, 2.5% coupon, tax exemptions, and liquidity.',
    },
    {
      id: 'p9',
      category: 'market',
      text: 'Review Indian equity holdings and FY 2026-27 tax impact.',
      sub: 'Assess LTCG (12.5% over ₹1.25L exemption) and STCG (20%) tax optimization.',
    },
  ];

  const filteredPrompts =
    activeCategory === 'all'
      ? suggestedPrompts
      : suggestedPrompts.filter((p) => p.category === activeCategory);

  // Send message to Gemini server API
  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

    setErrorMsg(null);
    setInputMessage('');

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      clientContextName: activeClient ? activeClient.name : 'Consolidated Firm',
    };

    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setIsLoading(true);

    try {
      // Build conversation history for multi-turn context (last 8 turns)
      const historyPayload = newHistory.slice(-8).map((m) => ({
        role: m.role,
        text: m.text,
      }));

      // Gather consolidated firm summary
      const totalInvestable = clients.reduce((acc, c) => acc + c.investableAssets, 0);
      const totalNetWorth = clients.reduce((acc, c) => acc + c.totalNetWorth, 0);
      const totalGaps = clients.reduce((acc, c) => acc + c.insuranceGaps.length, 0);

      const clientDataSummary = `CapitalVest Firm Telemetry: Managing ${clients.length} HNI/UHNI Indian families. Total Investable AUM: ₹${(totalInvestable / 10000000).toFixed(2)} Cr. Total Net Worth: ₹${(totalNetWorth / 10000000).toFixed(2)} Cr. Total Identified Protection Gaps: ${totalGaps}. Primary Market: India (NSE/BSE). Lead Advisor: Tanaisha Udwadia, CFA.`;

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: text,
          history: historyPayload,
          activeClient: activeClient || undefined,
          clientDataSummary,
          planningAssumptions: showRetirementTool
            ? {
                currentAge: retireCurrentAge,
                retirementAge: retireAge,
                lifeExpectancy,
                monthlyExpenseINR: monthlyExpense,
                inflationRate,
                preRetireReturn,
                postRetireReturn,
              }
            : undefined,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const data = await response.json();
      const botReply: ChatMessage = {
        id: `model-${Date.now()}`,
        role: 'model',
        text: data.reply || 'No response returned from the Advisory AI model.',
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        source: data.source || 'gemini-3.8-flash',
        clientContextName: activeClient ? activeClient.name : 'Consolidated Firm',
      };

      setMessages((prev) => [...prev, botReply]);
    } catch (err: any) {
      console.error('Advisory AI query error:', err);
      setErrorMsg(
        'Unable to complete request. Please verify connection to the server or retry your query.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearChat = () => {
    if (window.confirm('Clear current Advisory AI conversation history?')) {
      setMessages([
        {
          id: `welcome-${Date.now()}`,
          role: 'model',
          text: `### Conversation Reset\n\nAdvisory AI is ready. Currently focused on **${activeClient?.name || 'All Clients'}**. How can I assist you with portfolio diagnostics, asset allocation, or market insights today?`,
          timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
          source: 'gemini-3.8-flash',
          clientContextName: activeClient?.name || 'Consolidated Firm',
        },
      ]);
    }
  };

  const handleExportChat = () => {
    const formatted = messages
      .map((m) => `[${m.timestamp}] ${m.role === 'user' ? 'ADVISOR' : 'CAPITALVEST AI'} (${m.clientContextName || 'General'}):\n${m.text}\n`)
      .join('\n---\n\n');

    const blob = new Blob([formatted], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `CapitalVest_Advisory_AI_Notes_${new Date().toISOString().slice(0, 10)}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Quick retirement calculator simulation for the UI
  const calculateQuickRetirementCorpus = () => {
    const yrsToRetire = Math.max(1, retireAge - retireCurrentAge);
    const yrsInRetire = Math.max(1, lifeExpectancy - retireAge);
    const infDecimal = inflationRate / 100;
    const futureMonthlyExp = Math.round(monthlyExpense * Math.pow(1 + infDecimal, yrsToRetire));
    const futureAnnualExp = futureMonthlyExp * 12;
    const realReturn = 0.015; // 1.5% net real return
    const corpusRequired = Math.round(
      (futureAnnualExp * (1 - Math.pow(1 + realReturn, -yrsInRetire))) / realReturn
    );
    return {
      yrsToRetire,
      yrsInRetire,
      futureMonthlyExp,
      corpusRequired,
      corpusCr: (corpusRequired / 10000000).toFixed(2),
    };
  };

  const retireCalcs = calculateQuickRetirementCorpus();

  const handleRunRetirementSimulationWithGemini = () => {
    const prompt = `Please run an in-depth fiduciary retirement feasibility simulation for ${activeClient ? activeClient.name : 'our client'}.
Parameters:
- Current Age: ${retireCurrentAge} years | Retirement Age: ${retireAge} years | Life Expectancy: ${lifeExpectancy} years
- Current Monthly Living Expense: ₹${monthlyExpense.toLocaleString('en-IN')}
- Indian Inflation Assumption: ${inflationRate}% p.a.
- Expected Pre-Retirement Return: ${preRetireReturn}% p.a. | Post-Retirement Return: ${postRetireReturn}% p.a.
- Calculated Baseline Corpus: ₹${retireCalcs.corpusCr} Cr

Evaluate portfolio readiness against this required corpus, sequence-of-returns risk in the Indian debt/equity market, asset allocation recommendations, and tax-efficient drawdown options (SWP, G-Sec coupons, SCSS, and dividend yield).`;

    handleSendMessage(prompt);
  };

  // Format simple markdown into styled elements
  const renderFormattedMarkdown = (content: string) => {
    const lines = content.split('\n');
    const elements: React.ReactNode[] = [];
    let tableRows: string[][] = [];
    let inTable = false;

    lines.forEach((line, index) => {
      const trimmed = line.trim();

      // Table handling
      if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
        inTable = true;
        // Ignore separator line e.g. | :--- | :--- |
        if (!trimmed.includes('---')) {
          const cells = trimmed
            .split('|')
            .slice(1, -1)
            .map((c) => c.trim());
          tableRows.push(cells);
        }
        return;
      } else if (inTable) {
        // Render accumulated table
        if (tableRows.length > 0) {
          const headers = tableRows[0];
          const rows = tableRows.slice(1);
          elements.push(
            <div key={`table-${index}`} className="my-3 overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-700 font-semibold uppercase text-[10px] border-b border-slate-200">
                  <tr>
                    {headers.map((h, hi) => (
                      <th key={hi} className="py-2 px-3">
                        {h.replace(/\*\*/g, '')}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {rows.map((row, ri) => (
                    <tr key={ri} className="hover:bg-slate-50/80">
                      {row.map((cell, ci) => (
                        <td key={ci} className="py-2 px-3 text-slate-800">
                          {formatInlineMarkdown(cell)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }
        tableRows = [];
        inTable = false;
      }

      // Headers
      if (trimmed.startsWith('### ')) {
        elements.push(
          <h3 key={index} className="text-base font-bold text-slate-900 font-serif-brand mt-4 mb-2 first:mt-0 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            {trimmed.replace('### ', '')}
          </h3>
        );
      } else if (trimmed.startsWith('#### ')) {
        elements.push(
          <h4 key={index} className="text-sm font-bold text-blue-950 mt-3 mb-1.5 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-700"></span>
            {trimmed.replace('#### ', '')}
          </h4>
        );
      } else if (trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
        const itemText = trimmed.replace(/^[-•]\s*/, '');
        elements.push(
          <div key={index} className="flex items-start gap-2 text-xs text-slate-700 my-1 pl-1">
            <span className="text-amber-600 font-bold mt-0.5">•</span>
            <div className="flex-1 leading-relaxed">{formatInlineMarkdown(itemText)}</div>
          </div>
        );
      } else if (/^\d+\.\s/.test(trimmed)) {
        const match = trimmed.match(/^(\d+)\.\s(.*)$/);
        if (match) {
          elements.push(
            <div key={index} className="flex items-start gap-2 text-xs text-slate-700 my-1 pl-1">
              <span className="font-bold text-blue-900 bg-blue-50 px-1.5 py-0.2 rounded text-[11px] border border-blue-200">
                {match[1]}
              </span>
              <div className="flex-1 leading-relaxed">{formatInlineMarkdown(match[2])}</div>
            </div>
          );
        }
      } else if (trimmed === '') {
        elements.push(<div key={index} className="h-1.5" />);
      } else {
        elements.push(
          <p key={index} className="text-xs text-slate-700 leading-relaxed my-1">
            {formatInlineMarkdown(trimmed)}
          </p>
        );
      }
    });

    // In case table was at the very end
    if (tableRows.length > 0) {
      const headers = tableRows[0];
      const rows = tableRows.slice(1);
      elements.push(
        <div key="table-end" className="my-3 overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100 text-slate-700 font-semibold uppercase text-[10px] border-b border-slate-200">
              <tr>
                {headers.map((h, hi) => (
                  <th key={hi} className="py-2 px-3">
                    {h.replace(/\*\*/g, '')}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {rows.map((row, ri) => (
                <tr key={ri} className="hover:bg-slate-50/80">
                  {row.map((cell, ci) => (
                    <td key={ci} className="py-2 px-3 text-slate-800">
                      {formatInlineMarkdown(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    return elements;
  };

  // Helper for bold and currency formatting
  const formatInlineMarkdown = (text: string) => {
    // Replace **text** with bold
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="font-bold text-slate-900">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Advisory AI Intelligence Bar */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-6 sm:p-7 border border-blue-900 shadow-md">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Gemini 3.8 Flash • Fiduciary AI
              </span>
              <span className="text-slate-400 text-xs hidden sm:inline">•</span>
              <span className="text-slate-300 text-xs hidden sm:inline">
                Lead Advisor: <strong>Tanaisha Udwadia, CFA</strong>
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-serif-brand text-white tracking-tight">
              CapitalVest Advisory Intelligence
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Real-time portfolio analytics, Indian equity & mutual fund diagnostics, inflation-adjusted retirement modeling, and protection gap audits with conversational memory.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setShowRetirementTool(!showRetirementTool)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
                showRetirementTool
                  ? 'bg-amber-600 text-white border-amber-500 shadow-xs'
                  : 'bg-white/10 hover:bg-white/20 text-slate-200 border-white/20'
              }`}
            >
              <Calculator className="w-4 h-4 text-amber-400" />
              <span>{showRetirementTool ? 'Hide Retirement Tool' : 'Retirement Modeler'}</span>
            </button>

            <button
              onClick={handleExportChat}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-slate-200 border border-white/20 flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Download conversation notes"
            >
              <Download className="w-4 h-4 text-slate-300" />
              <span>Export Notes</span>
            </button>

            <button
              onClick={handleClearChat}
              className="p-2 rounded-xl bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 border border-white/10 transition-colors cursor-pointer"
              title="Reset conversation"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Ambient subtle glow */}
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Interactive Retirement Planning Modeler Drawer/Accordion */}
      {showRetirementTool && (
        <div className="rounded-2xl bg-white p-5 border border-amber-300/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-50 text-amber-700">
                <Calculator className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 font-serif-brand">
                  Interactive Indian Retirement Corpus Modeler
                </h3>
                <p className="text-[11px] text-slate-500">
                  Simulate inflation, lifespan, and post-retirement cash flows for{' '}
                  <strong>{activeClient?.name || 'Selected Client'}</strong>.
                </p>
              </div>
            </div>

            <button
              onClick={handleRunRetirementSimulationWithGemini}
              disabled={isLoading}
              className="px-3.5 py-1.5 rounded-lg bg-blue-950 hover:bg-blue-900 text-amber-300 font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Stress-Test with Gemini AI</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-xs">
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
              <label className="text-[10px] font-semibold text-slate-500 uppercase block">Current Age</label>
              <input
                type="number"
                min={20}
                max={80}
                value={retireCurrentAge}
                onChange={(e) => setRetireCurrentAge(Number(e.target.value))}
                className="w-full mt-1 font-bold text-slate-900 bg-transparent text-sm focus:outline-none"
              />
            </div>

            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
              <label className="text-[10px] font-semibold text-slate-500 uppercase block">Retire Age</label>
              <input
                type="number"
                min={45}
                max={75}
                value={retireAge}
                onChange={(e) => setRetireAge(Number(e.target.value))}
                className="w-full mt-1 font-bold text-slate-900 bg-transparent text-sm focus:outline-none"
              />
            </div>

            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
              <label className="text-[10px] font-semibold text-slate-500 uppercase block">Life Expectancy</label>
              <input
                type="number"
                min={70}
                max={100}
                value={lifeExpectancy}
                onChange={(e) => setLifeExpectancy(Number(e.target.value))}
                className="w-full mt-1 font-bold text-slate-900 bg-transparent text-sm focus:outline-none"
              />
            </div>

            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
              <label className="text-[10px] font-semibold text-slate-500 uppercase block">Monthly Spend (₹)</label>
              <input
                type="number"
                step={25000}
                min={50000}
                value={monthlyExpense}
                onChange={(e) => setMonthlyExpense(Number(e.target.value))}
                className="w-full mt-1 font-bold text-slate-900 bg-transparent text-sm focus:outline-none"
              />
            </div>

            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
              <label className="text-[10px] font-semibold text-slate-500 uppercase block">Inflation (%)</label>
              <input
                type="number"
                step={0.5}
                min={4}
                max={10}
                value={inflationRate}
                onChange={(e) => setInflationRate(Number(e.target.value))}
                className="w-full mt-1 font-bold text-slate-900 bg-transparent text-sm focus:outline-none"
              />
            </div>

            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
              <label className="text-[10px] font-semibold text-slate-500 uppercase block">Pre-Retire ROI (%)</label>
              <input
                type="number"
                step={0.5}
                value={preRetireReturn}
                onChange={(e) => setPreRetireReturn(Number(e.target.value))}
                className="w-full mt-1 font-bold text-slate-900 bg-transparent text-sm focus:outline-none"
              />
            </div>

            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
              <label className="text-[10px] font-semibold text-slate-500 uppercase block">Post-Retire ROI (%)</label>
              <input
                type="number"
                step={0.5}
                value={postRetireReturn}
                onChange={(e) => setPostRetireReturn(Number(e.target.value))}
                className="w-full mt-1 font-bold text-slate-900 bg-transparent text-sm focus:outline-none"
              />
            </div>
          </div>

          {/* Quick calculation outcome strip */}
          <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-4">
              <div>
                <span className="text-[10px] text-amber-800 uppercase font-semibold">Horizon to Retirement</span>
                <div className="font-bold text-slate-900">{retireCalcs.yrsToRetire} Years</div>
              </div>
              <div className="h-6 w-px bg-amber-200"></div>
              <div>
                <span className="text-[10px] text-amber-800 uppercase font-semibold">Duration in Retirement</span>
                <div className="font-bold text-slate-900">{retireCalcs.yrsInRetire} Years</div>
              </div>
              <div className="h-6 w-px bg-amber-200"></div>
              <div>
                <span className="text-[10px] text-amber-800 uppercase font-semibold">Inflated Monthly Spend</span>
                <div className="font-bold text-slate-900">
                  ₹{(retireCalcs.futureMonthlyExp / 100000).toFixed(2)} Lakhs/mo
                </div>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-amber-800 uppercase font-semibold">Target Nest Egg Required</span>
              <div className="text-base font-bold text-blue-950 font-serif-brand">
                ₹{retireCalcs.corpusCr} Crores
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Advisory Split Layout: Left Telemetry & Prompts, Right Chat Surface */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Client Telemetry Focus & Suggested Prompts (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Active Client Selection Card */}
          <div className="rounded-2xl bg-white p-4 sm:p-5 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-blue-900" />
                <span>Client Telemetry Focus</span>
              </label>
              <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Live Data Connected
              </span>
            </div>

            <div className="relative">
              <select
                value={selectedClientId}
                onChange={(e) => handleClientChange(e.target.value)}
                className="w-full py-2.5 pl-3 pr-8 rounded-xl bg-slate-50 border border-slate-300 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-900 cursor-pointer appearance-none"
              >
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} — ₹{(c.investableAssets / 10000000).toFixed(2)} Cr ({c.city})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Selected Client Vital Telemetry Ribbon */}
            {activeClient && (
              <div className="pt-2 border-t border-slate-100 space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Profile:</span>
                  <span className="font-semibold text-slate-800">
                    {activeClient.occupation} • {activeClient.city}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-semibold">Investable Assets</span>
                    <span className="font-bold text-slate-900 font-serif-brand">
                      {formatINR(activeClient.investableAssets, { masked: isMasked })}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-semibold">Total Net Worth</span>
                    <span className="font-bold text-slate-800 font-serif-brand">
                      {formatINR(activeClient.totalNetWorth, { masked: isMasked })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Risk Profile:</span>
                  <span className="font-bold text-blue-900">{activeClient.riskProfile}</span>
                </div>

                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Emergency Fund:</span>
                  <span className="font-bold text-emerald-800">
                    {activeClient.emergencyFundStatus} ({activeClient.emergencyFundMonths} Months)
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Protection Shortfalls:</span>
                  {activeClient.insuranceGaps.length > 0 ? (
                    <span className="font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                      {activeClient.insuranceGaps.length} Identified Gaps
                    </span>
                  ) : (
                    <span className="font-bold text-emerald-800">Fully Protected</span>
                  )}
                </div>

                <button
                  onClick={() => onSelectClient(activeClient)}
                  className="w-full mt-1 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] flex items-center justify-center gap-1 transition-colors cursor-pointer"
                >
                  <span>Open Complete Client Dossier</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          {/* Quick Prompts Panel */}
          <div className="rounded-2xl bg-white p-4 sm:p-5 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Suggested Advisory Prompts</span>
              </h3>
              <span className="text-[10px] text-slate-400 font-medium">Click to execute</span>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] no-scrollbar">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
                    activeCategory === cat.id
                      ? 'bg-blue-900 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Prompt Buttons */}
            <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
              {filteredPrompts.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleSendMessage(p.text)}
                  disabled={isLoading}
                  className="w-full p-2.5 rounded-xl text-left bg-slate-50 hover:bg-amber-50/60 hover:border-amber-300 border border-slate-200/90 transition-all text-xs group cursor-pointer"
                >
                  <div className="font-bold text-slate-900 group-hover:text-blue-950 flex items-center justify-between">
                    <span>{p.text}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-600 transition-transform group-hover:translate-x-0.5" />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{p.sub}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Fiduciary Transparency Disclosure Card */}
          <div className="rounded-xl bg-blue-50/70 p-3.5 border border-blue-200/80 text-blue-950 text-xs space-y-1.5">
            <span className="font-bold flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-blue-900">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-800" />
              Fiduciary Regulatory Standard
            </span>
            <p className="text-[11px] text-blue-900/90 leading-relaxed">
              CapitalVest Advisory AI operates under institutional confidentiality. All Indian equities, sovereign debt, and client PANs are maintained with 256-bit bank encryption. Insights are educational simulations designed for advisory review.
            </p>
          </div>
        </div>

        {/* Right Column: Chat Surface & Conversation History (8 cols) */}
        <div className="lg:col-span-8 flex flex-col h-[750px] rounded-2xl bg-white border border-slate-200 shadow-xs overflow-hidden">
          {/* Chat Header Bar */}
          <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-950 text-amber-400 flex items-center justify-center font-bold text-xs shadow-xs">
                CV
              </div>
              <div>
                <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <span>CapitalVest Intelligence</span>
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                    Gemini 3.8 Flash
                  </span>
                </div>
                <div className="text-[10px] text-slate-500">
                  Focus: <strong>{activeClient ? activeClient.name : 'Consolidated Portfolio'}</strong> • FY 2026-27
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-800 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                Active Session
              </span>
            </div>
          </div>

          {/* Chat Messages Scroll View */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/30">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 text-xs leading-relaxed ${
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.role === 'model' && (
                  <div className="w-7 h-7 rounded-xl bg-blue-950 text-amber-400 flex items-center justify-center font-bold text-[10px] shrink-0 shadow-xs mt-1">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-4 shadow-xs relative group ${
                    msg.role === 'user'
                      ? 'bg-blue-900 text-white rounded-tr-xs'
                      : 'bg-white text-slate-800 border border-slate-200 rounded-tl-xs'
                  }`}
                >
                  {/* Context Header */}
                  <div className="flex items-center justify-between gap-3 mb-2 text-[10px] opacity-75 border-b border-black/10 dark:border-white/10 pb-1.5">
                    <span className="font-semibold">
                      {msg.role === 'user' ? 'Advisor Inquiry' : `CapitalVest AI • ${msg.clientContextName || 'Telemetry'}`}
                    </span>
                    <span>{msg.timestamp}</span>
                  </div>

                  {/* Message Body */}
                  <div className="space-y-1">
                    {msg.role === 'user' ? (
                      <p className="text-white text-xs leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                    ) : (
                      renderFormattedMarkdown(msg.text)
                    )}
                  </div>

                  {/* Message action bar */}
                  {msg.role === 'model' && (
                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                      <span className="flex items-center gap-1 font-mono">
                        <Lock className="w-2.5 h-2.5" /> Fiduciary Record
                      </span>

                      <button
                        onClick={() => handleCopyMessage(msg.id, msg.text)}
                        className="hover:text-blue-900 flex items-center gap-1 transition-colors cursor-pointer px-1.5 py-0.5 rounded hover:bg-slate-100"
                        title="Copy analysis to clipboard"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span className="text-emerald-700 font-semibold">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {msg.role === 'user' && (
                  <div className="w-7 h-7 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0 shadow-xs mt-1">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex gap-3 text-xs leading-relaxed justify-start">
                <div className="w-7 h-7 rounded-xl bg-blue-950 text-amber-400 flex items-center justify-center font-bold text-[10px] shrink-0 shadow-xs mt-1">
                  <Bot className="w-4 h-4 animate-spin" />
                </div>
                <div className="rounded-2xl p-4 bg-white text-slate-800 border border-slate-200 rounded-tl-xs shadow-xs space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="flex space-x-1">
                      <span className="w-2 h-2 rounded-full bg-blue-900 animate-bounce [animation-delay:-0.3s]"></span>
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-bounce [animation-delay:-0.15s]"></span>
                      <span className="w-2 h-2 rounded-full bg-blue-900 animate-bounce"></span>
                    </div>
                    <span className="text-xs font-semibold text-slate-700">
                      Consulting Gemini 3.8 Flash...
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Evaluating portfolio telemetry, NSE/BSE securities, tax implications, and risk drift for {activeClient?.name || 'Client'}.
                  </p>
                </div>
              </div>
            )}

            {/* Error display */}
            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  {errorMsg}
                </span>
                <button
                  onClick={() => handleSendMessage()}
                  className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded text-[11px] font-bold cursor-pointer"
                >
                  Retry
                </button>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Console */}
          <div className="p-3 sm:p-4 bg-white border-t border-slate-200 space-y-2">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <div className="relative flex-1">
                <textarea
                  ref={textareaRef}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  rows={2}
                  placeholder={`Ask Advisory AI anything about ${activeClient?.name || 'this portfolio'} (e.g., "Analyze asset allocation", "Explain SGB vs Gold ETFs", "Retirement corpus")...`}
                  className="w-full resize-none py-2.5 px-3.5 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-900 transition-all font-medium leading-relaxed"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || !inputMessage.trim()}
                className="h-[58px] px-5 rounded-xl bg-blue-950 hover:bg-blue-900 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer shrink-0"
              >
                <span>Send</span>
                <Send className="w-4 h-4 text-amber-400" />
              </button>
            </form>

            <div className="flex items-center justify-between text-[10px] text-slate-400 px-1">
              <span>
                Tip: Press <kbd className="px-1 py-0.5 rounded bg-slate-100 font-mono text-slate-600">Enter</kbd> to send, <kbd className="px-1 py-0.5 rounded bg-slate-100 font-mono text-slate-600">Shift + Enter</kbd> for newline.
              </span>
              <span className="flex items-center gap-1">
                <Lock className="w-2.5 h-2.5" /> Confidential Fiduciary Session
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
