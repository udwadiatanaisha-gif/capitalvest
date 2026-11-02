import React, { useState, useRef, useEffect } from 'react';
import { Client } from '../types';
import { formatINR } from '../utils/pdfGenerator';
import {
  Sparkles,
  Send,
  User,
  Bot,
  Copy,
  Check,
  AlertTriangle,
  ShieldCheck,
  ChevronDown,
  Trash2,
  Download,
  Minus,
  X,
  Maximize2,
  Minimize2,
  RefreshCw,
  MessageSquare,
  Lock,
  ArrowRight,
  Calculator,
} from 'lucide-react';

export interface AdvisoryAiPopupProps {
  isOpen: boolean;
  isMinimized: boolean;
  onOpen: () => void;
  onClose: () => void;
  onMinimize: () => void;
  clients: Client[];
  activeClient?: Client | null;
  onSelectClient?: (client: Client) => void;
  isMasked: boolean;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
  clientContextName?: string;
  source?: string;
}

export const AdvisoryAiPopup: React.FC<AdvisoryAiPopupProps> = ({
  isOpen,
  isMinimized,
  onOpen,
  onClose,
  onMinimize,
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
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [showClientSelector, setShowClientSelector] = useState<boolean>(false);

  const activeClient = clients.find((c) => c.id === selectedClientId) || clients[0] || null;

  // Initial welcome message (persists within session)
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      role: 'model',
      text: `### CapitalVest Advisory AI
Welcome to your personal Indian wealth advisory assistant, powered by **Gemini 3.8 Flash**.

I am connected to CapitalVest's live client records and portfolio telemetry.

**Quick Prompts to get started:**
- **“Analyse my portfolio”** or **“Review client financial health”**
- **“Identify the biggest portfolio risks”**
- **“Review this client's insurance coverage”**
- **“Estimate the retirement corpus required”**

How can I assist you with **${activeClient?.name || 'this portfolio'}** today?`,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      source: 'gemini-3.8-flash',
      clientContextName: activeClient?.name || 'CapitalVest Client',
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom();
    }
  }, [messages, isLoading, isOpen, isMinimized]);

  // Focus textarea when popup opens
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 150);
    }
  }, [isOpen, isMinimized]);

  // Suggested quick prompts requested by user
  const quickPrompts = [
    { label: 'Analyse my portfolio', query: "Analyse this client's portfolio in detail." },
    { label: 'Review client financial health', query: "Review this client's overall financial health, emergency buffer, and net worth." },
    { label: 'Identify biggest risks', query: "Identify the biggest portfolio risks and asset concentration." },
    { label: 'Review insurance coverage', query: "Review this client's insurance coverage and identify protection gaps." },
    { label: 'Estimate retirement corpus', query: "Estimate the retirement corpus required for this client." },
    { label: 'Explain asset allocation', query: "Explain this portfolio's asset allocation and drift vs mandate." },
    { label: 'Prepare review summary', query: "Prepare a client review summary and executive meeting agenda." },
  ];

  // Send message to server Gemini endpoint
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

    const updatedHistory = [...messages, userMessage];
    setMessages(updatedHistory);
    setIsLoading(true);

    try {
      // Build conversation history for multi-turn context (last 8 turns)
      const historyPayload = updatedHistory.slice(-8).map((m) => ({
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
      console.error('Advisory AI popup query error:', err);
      setErrorMsg(
        'Unable to complete request. Please verify server connectivity or retry your query.'
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
    if (window.confirm('Reset this Advisory AI conversation?')) {
      setMessages([
        {
          id: `welcome-${Date.now()}`,
          role: 'model',
          text: `### Conversation Reset\n\nAdvisory AI is ready. Currently focused on **${activeClient?.name || 'All Clients'}**. Ask me about portfolio diagnostics, market insights, or financial health.`,
          timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
          source: 'gemini-3.8-flash',
          clientContextName: activeClient?.name || 'Consolidated Firm',
        },
      ]);
    }
  };

  const handleExportChat = () => {
    const formatted = messages
      .map(
        (m) =>
          `[${m.timestamp}] ${m.role === 'user' ? 'USER' : 'CAPITALVEST ADVISORY AI'} (${m.clientContextName || 'General'}):\n${m.text}\n`
      )
      .join('\n---\n\n');

    const blob = new Blob([formatted], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `CapitalVest_Advisory_AI_${new Date().toISOString().slice(0, 10)}.txt`;
    link.click();
    URL.revokeObjectURL(url);
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
        if (!trimmed.includes('---')) {
          const cells = trimmed
            .split('|')
            .slice(1, -1)
            .map((c) => c.trim());
          tableRows.push(cells);
        }
        return;
      } else if (inTable) {
        if (tableRows.length > 0) {
          const headers = tableRows[0];
          const rows = tableRows.slice(1);
          elements.push(
            <div key={`table-${index}`} className="my-2.5 overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full text-[11px] text-left">
                <thead className="bg-slate-100 text-slate-700 font-semibold uppercase text-[9px] border-b border-slate-200">
                  <tr>
                    {headers.map((h, hi) => (
                      <th key={hi} className="py-1.5 px-2.5">
                        {h.replace(/\*\*/g, '')}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {rows.map((row, ri) => (
                    <tr key={ri} className="hover:bg-slate-50/80">
                      {row.map((cell, ci) => (
                        <td key={ci} className="py-1.5 px-2.5 text-slate-800">
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
          <h4 key={index} className="text-xs font-bold text-slate-900 font-serif-brand mt-3 mb-1.5 first:mt-0 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            {trimmed.replace('### ', '')}
          </h4>
        );
      } else if (trimmed.startsWith('#### ')) {
        elements.push(
          <h5 key={index} className="text-[11px] font-bold text-blue-950 mt-2.5 mb-1 flex items-center gap-1">
            <span className="w-1 h-1 rounded-full bg-blue-700"></span>
            {trimmed.replace('#### ', '')}
          </h5>
        );
      } else if (trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
        const itemText = trimmed.replace(/^[-•]\s*/, '');
        elements.push(
          <div key={index} className="flex items-start gap-1.5 text-[11px] text-slate-700 my-0.5 pl-0.5">
            <span className="text-amber-600 font-bold mt-0.5">•</span>
            <div className="flex-1 leading-relaxed">{formatInlineMarkdown(itemText)}</div>
          </div>
        );
      } else if (/^\d+\.\s/.test(trimmed)) {
        const match = trimmed.match(/^(\d+)\.\s(.*)$/);
        if (match) {
          elements.push(
            <div key={index} className="flex items-start gap-1.5 text-[11px] text-slate-700 my-0.5 pl-0.5">
              <span className="font-bold text-blue-900 bg-blue-50 px-1 py-0.2 rounded text-[10px] border border-blue-200">
                {match[1]}
              </span>
              <div className="flex-1 leading-relaxed">{formatInlineMarkdown(match[2])}</div>
            </div>
          );
        }
      } else if (trimmed === '') {
        elements.push(<div key={index} className="h-1" />);
      } else {
        elements.push(
          <p key={index} className="text-[11px] text-slate-700 leading-relaxed my-0.5">
            {formatInlineMarkdown(trimmed)}
          </p>
        );
      }
    });

    if (tableRows.length > 0) {
      const headers = tableRows[0];
      const rows = tableRows.slice(1);
      elements.push(
        <div key="table-end" className="my-2.5 overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full text-[11px] text-left">
            <thead className="bg-slate-100 text-slate-700 font-semibold uppercase text-[9px] border-b border-slate-200">
              <tr>
                {headers.map((h, hi) => (
                  <th key={hi} className="py-1.5 px-2.5">
                    {h.replace(/\*\*/g, '')}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {rows.map((row, ri) => (
                <tr key={ri} className="hover:bg-slate-50/80">
                  {row.map((cell, ci) => (
                    <td key={ci} className="py-1.5 px-2.5 text-slate-800">
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

  const formatInlineMarkdown = (text: string) => {
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
    <>
      {/* 1. Floating Launch Button (Fixed at Bottom-Right of Every Page) */}
      {(!isOpen || isMinimized) && (
        <div className="fixed bottom-6 right-6 z-40 flex items-center gap-2">
          {/* Subtle helper pill on desktop if minimized */}
          {isMinimized && (
            <button
              onClick={onOpen}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/95 backdrop-blur-md border border-slate-200 text-slate-700 text-xs font-semibold shadow-lg hover:border-amber-400 transition-all cursor-pointer animate-fade-in"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Advisory AI Minimized</span>
            </button>
          )}

          <button
            onClick={onOpen}
            aria-label="Open CapitalVest Advisory AI"
            className="group relative flex items-center gap-3 px-4 py-3 sm:px-4.5 sm:py-3.5 rounded-full bg-gradient-to-r from-blue-950 via-slate-900 to-blue-950 text-white border border-amber-400/50 shadow-2xl hover:shadow-amber-500/10 hover:border-amber-300 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer"
          >
            {/* Pulsating ambient ring */}
            <span className="absolute -inset-1 rounded-full bg-amber-400/20 blur-xs group-hover:bg-amber-400/30 transition-all pointer-events-none" />

            <div className="relative flex items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
                <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
              </div>
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-slate-950"></span>
            </div>

            <div className="text-left hidden xs:block sm:block">
              <div className="text-xs font-bold font-serif-brand text-white flex items-center gap-1.5">
                <span>Advisory AI</span>
                <span className="text-[9px] uppercase px-1.5 py-0.2 rounded font-sans font-bold bg-amber-400 text-blue-950">
                  Gemini
                </span>
              </div>
              <p className="text-[10px] text-slate-300 font-medium">Wealth Intelligence</p>
            </div>
          </button>
        </div>
      )}

      {/* 2. Floating Chatbot Popup Window */}
      {isOpen && !isMinimized && (
        <div
          role="dialog"
          aria-label="CapitalVest Advisory AI Chatbot"
          className={`fixed z-50 transition-all duration-300 ease-out flex flex-col bg-white border border-slate-200/90 shadow-2xl rounded-2xl overflow-hidden ${
            isExpanded
              ? 'inset-3 sm:inset-auto sm:bottom-6 sm:right-6 sm:w-[620px] sm:h-[760px] sm:max-h-[calc(100vh-3rem)]'
              : 'inset-x-3 bottom-3 top-16 sm:inset-x-auto sm:top-auto sm:bottom-6 sm:right-6 sm:w-[460px] sm:h-[640px] sm:max-h-[calc(100vh-4rem)]'
          }`}
          style={{
            boxShadow: '0 20px 45px -10px rgba(15, 23, 42, 0.3), 0 0 0 1px rgba(217, 119, 6, 0.2)',
          }}
        >
          {/* Header Bar */}
          <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-blue-950 text-white px-4 py-3 sm:px-4.5 sm:py-3.5 border-b border-blue-900 flex items-center justify-between shrink-0 select-none">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 text-blue-950 flex items-center justify-center font-bold text-xs shadow-xs font-serif-brand">
                  CV
                </div>
                {/* Online indicator */}
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-slate-900"></span>
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-xs sm:text-sm font-serif-brand text-white tracking-tight">
                    CapitalVest Advisory AI
                  </h3>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                    3.8 Flash
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Online</span>
                  <span>•</span>
                  <span>Lead Advisor: Tanaisha Udwadia, CFA</span>
                </div>
              </div>
            </div>

            {/* Header Window Controls */}
            <div className="flex items-center gap-1 text-slate-300">
              {/* Expand / Shrink */}
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="hidden sm:flex p-1.5 rounded-lg hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                title={isExpanded ? 'Restore default size' : 'Expand window'}
              >
                {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>

              {/* Minimise button */}
              <button
                onClick={onMinimize}
                className="p-1.5 rounded-lg hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                title="Minimise chatbot"
              >
                <Minus className="w-4 h-4" />
              </button>

              {/* Close button */}
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-rose-500/20 hover:text-rose-300 transition-colors cursor-pointer ml-0.5"
                title="Close chat popup"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Sub-Header: Live Client Context Ribbon */}
          <div className="bg-slate-100/90 border-b border-slate-200 px-3.5 py-2 text-xs flex items-center justify-between shrink-0">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-700 min-w-0">
              <User className="w-3.5 h-3.5 text-blue-900 shrink-0" />
              <span className="text-slate-500 shrink-0">Analyzing:</span>
              <button
                onClick={() => setShowClientSelector(!showClientSelector)}
                className="font-bold text-slate-900 hover:text-blue-950 flex items-center gap-1 underline decoration-amber-500/50 underline-offset-2 truncate cursor-pointer"
                title="Switch client context"
              >
                <span className="truncate">{activeClient ? activeClient.name : 'All Clients (Consolidated)'}</span>
                <ChevronDown className="w-3 h-3 text-slate-500 shrink-0" />
              </button>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {activeClient && (
                <span className="text-[10px] font-bold text-blue-900 font-serif-brand">
                  {formatINR(activeClient.investableAssets, { masked: isMasked })}
                </span>
              )}
              <button
                onClick={handleExportChat}
                className="p-1 rounded text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition-colors cursor-pointer"
                title="Export conversation notes"
              >
                <Download className="w-3 h-3" />
              </button>
              <button
                onClick={handleClearChat}
                className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                title="Reset conversation"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Expandable Client Switcher Dropdown */}
          {showClientSelector && (
            <div className="p-2.5 bg-white border-b border-slate-200 shadow-md animate-fade-in shrink-0">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                Select Client for Dedicated Telemetry:
              </label>
              <select
                value={selectedClientId}
                onChange={(e) => {
                  setSelectedClientId(e.target.value);
                  const chosen = clients.find((c) => c.id === e.target.value);
                  if (chosen && onSelectClient) {
                    onSelectClient(chosen);
                  }
                  setShowClientSelector(false);
                }}
                className="w-full p-2 text-xs font-semibold bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-900 cursor-pointer"
              >
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} — ₹{(c.investableAssets / 10000000).toFixed(2)} Cr ({c.city} • {c.occupation})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Chat Messages Body */}
          <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-3.5 bg-slate-50/50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 text-xs leading-relaxed ${
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.role === 'model' && (
                  <div className="w-6 h-6 rounded-lg bg-blue-950 text-amber-400 flex items-center justify-center font-bold text-[9px] shrink-0 shadow-xs mt-0.5">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}

                <div
                  className={`max-w-[88%] rounded-2xl p-3 shadow-xs relative group ${
                    msg.role === 'user'
                      ? 'bg-blue-900 text-white rounded-tr-xs'
                      : 'bg-white text-slate-800 border border-slate-200/90 rounded-tl-xs'
                  }`}
                >
                  {/* Context Header */}
                  <div className="flex items-center justify-between gap-2 mb-1.5 text-[9px] opacity-75 border-b border-black/10 dark:border-white/10 pb-1">
                    <span className="font-semibold">
                      {msg.role === 'user' ? 'You' : `CapitalVest AI • ${msg.clientContextName || 'Telemetry'}`}
                    </span>
                    <span>{msg.timestamp}</span>
                  </div>

                  {/* Message Content */}
                  <div className="space-y-1">
                    {msg.role === 'user' ? (
                      <p className="text-white text-xs leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                    ) : (
                      renderFormattedMarkdown(msg.text)
                    )}
                  </div>

                  {/* Action Bar for AI replies */}
                  {msg.role === 'model' && (
                    <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[9px] text-slate-400">
                      <span className="flex items-center gap-1 font-mono">
                        <Lock className="w-2.5 h-2.5" /> Fiduciary Record
                      </span>

                      <button
                        onClick={() => handleCopyMessage(msg.id, msg.text)}
                        className="hover:text-blue-900 flex items-center gap-1 transition-colors cursor-pointer px-1 py-0.5 rounded hover:bg-slate-100"
                        title="Copy to clipboard"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check className="w-2.5 h-2.5 text-emerald-600" />
                            <span className="text-emerald-700 font-semibold">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-2.5 h-2.5" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {msg.role === 'user' && (
                  <div className="w-6 h-6 rounded-lg bg-amber-600 text-white flex items-center justify-center font-bold text-[9px] shrink-0 shadow-xs mt-0.5">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            ))}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex gap-2.5 text-xs leading-relaxed justify-start">
                <div className="w-6 h-6 rounded-lg bg-blue-950 text-amber-400 flex items-center justify-center font-bold text-[9px] shrink-0 shadow-xs mt-0.5">
                  <Bot className="w-3.5 h-3.5 animate-spin" />
                </div>
                <div className="rounded-2xl p-3 bg-white text-slate-800 border border-slate-200 rounded-tl-xs shadow-xs space-y-1.5">
                  <div className="flex items-center gap-2">
                    <div className="flex space-x-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-900 animate-bounce [animation-delay:-0.3s]"></span>
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce [animation-delay:-0.15s]"></span>
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-900 animate-bounce"></span>
                    </div>
                    <span className="text-[11px] font-semibold text-slate-700">
                      Analyzing with Gemini 3.8 Flash...
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    Evaluating portfolio holdings, Indian tax rules, and risk metrics.
                  </p>
                </div>
              </div>
            )}

            {/* Error display */}
            {errorMsg && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-[11px] flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                  {errorMsg}
                </span>
                <button
                  onClick={() => handleSendMessage()}
                  className="px-2 py-0.5 bg-rose-600 hover:bg-rose-700 text-white rounded text-[10px] font-bold cursor-pointer"
                >
                  Retry
                </button>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Prompts Quick Strip */}
          <div className="px-3 py-2 bg-slate-50 border-t border-slate-200/80 overflow-x-auto no-scrollbar shrink-0">
            <div className="flex items-center gap-1.5 whitespace-nowrap">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 mr-1">
                <Sparkles className="w-3 h-3 text-amber-500" /> Suggested:
              </span>
              {quickPrompts.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(p.query)}
                  disabled={isLoading}
                  className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-white hover:bg-amber-50 hover:border-amber-300 text-slate-700 hover:text-blue-950 border border-slate-200 transition-all cursor-pointer shadow-2xs"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Message Input & Send Console */}
          <div className="p-3 bg-white border-t border-slate-200 shrink-0 space-y-1.5">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
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
                rows={1}
                placeholder={`Ask about ${activeClient?.name || 'client'} (e.g. "Analyse my portfolio")...`}
                className="w-full resize-none py-2 px-3 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-900 transition-all font-medium leading-relaxed max-h-24"
              />

              <button
                type="submit"
                disabled={isLoading || !inputMessage.trim()}
                className="h-[38px] px-3.5 rounded-xl bg-blue-950 hover:bg-blue-900 disabled:opacity-40 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer shrink-0"
                title="Send inquiry"
              >
                <span>Send</span>
                <Send className="w-3 h-3 text-amber-400" />
              </button>
            </form>

            <div className="flex items-center justify-between text-[9px] text-slate-400 px-1">
              <span>Press Enter to send</span>
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-2.5 h-2.5 text-blue-800" /> Educational & Fiduciary Advisory
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
