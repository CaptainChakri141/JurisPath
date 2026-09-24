'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  FileText,
  Search,
  Sparkles,
  Send,
  Clock,
  CheckCircle,
  AlertTriangle,
  BookOpen,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Copy,
  ArrowLeft,
  Calendar,
  ShieldCheck,
  ExternalLink,
  MessageSquare
} from 'lucide-react';
import {
  getDocument,
  askDocumentQuestion,
  getSimpleLanguageClauses,
  getDeadlines,
  DocumentDetail,
  SimpleLanguageClause,
  DeadlineItem,
  AskResponse
} from '@/lib/api';
import Navbar from '@/components/Navbar';
import DisclaimerBanner from '@/components/DisclaimerBanner';
import EvidenceCard from '@/components/EvidenceCard';

export default function WorkspacePage() {
  const params = useParams();
  const docId = params.id as string;

  // Workspace Data States
  const [documentDetail, setDocumentDetail] = useState<DocumentDetail | null>(null);
  const [simpleClauses, setSimpleClauses] = useState<SimpleLanguageClause[]>([]);
  const [deadlines, setDeadlines] = useState<DeadlineItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Viewer Controls
  const [searchDocQuery, setSearchDocQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'summary' | 'chat' | 'simple' | 'deadlines'>('chat');
  const [fontSize, setFontSize] = useState<number>(14);
  const [copiedText, setCopiedText] = useState(false);

  // Evidence Highlight State
  const [highlightTarget, setHighlightTarget] = useState<{
    sectionNumber?: string;
    textSnippet?: string;
    pageNumber?: number;
  } | null>(null);

  // Chat State
  const [chatMessages, setChatMessages] = useState<
    Array<{ role: 'user' | 'assistant'; content: string; responseData?: AskResponse }>
  >([]);
  const [chatInput, setChatInput] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const viewerScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadWorkspaceData() {
      if (!docId) return;
      setIsLoading(true);
      setLoadError(null);
      try {
        const [doc, simple, dls] = await Promise.all([
          getDocument(docId),
          getSimpleLanguageClauses(docId),
          getDeadlines(docId),
        ]);
        setDocumentDetail(doc);
        setSimpleClauses(simple);
        setDeadlines(dls);

        // Preload initial welcoming AI prompt
        setChatMessages([
          {
            role: 'assistant',
            content: `Hello! I have analyzed **${doc.metadata.filename}** (${doc.metadata.doc_type}). You can ask me any question about obligations, deadlines, penalties, or termination terms. Every answer will be strictly grounded in this document with verified evidence citations.`,
          },
        ]);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to load document workspace.';
        setLoadError(msg);
      } finally {
        setIsLoading(false);
      }
    }
    loadWorkspaceData();
  }, [docId]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isAsking]);

  // Handle Evidence Navigation and Highlighting
  const handleHighlightEvidence = (pageNumber: number, sectionNumber: string, snippet: string) => {
    setHighlightTarget({ pageNumber, sectionNumber, textSnippet: snippet });

    // Find clause element and scroll smoothly
    const normalizedSec = sectionNumber.replace(/\s+/g, '_').toLowerCase();
    const element = document.getElementById(`clause_${normalizedSec}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      // Fallback scroll to page container
      const pageEl = document.getElementById(`doc_page_${pageNumber}`);
      pageEl?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleSendMessage = async (queryText?: string) => {
    const textToSend = queryText || chatInput;
    if (!textToSend.trim() || isAsking) return;

    setChatMessages((prev) => [...prev, { role: 'user', content: textToSend }]);
    setChatInput('');
    setIsAsking(true);

    try {
      const resp = await askDocumentQuestion(docId, textToSend);
      setChatMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: resp.answer,
          responseData: resp,
        },
      ]);
    } catch {
      setChatMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'An error occurred while retrieving grounded information. Please ensure the backend is running.',
        },
      ]);
    } finally {
      setIsAsking(false);
    }
  };

  const handleCopyText = () => {
    if (documentDetail?.full_text) {
      navigator.clipboard.writeText(documentDetail.full_text);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2000);
    }
  };

  const sampleQuestions = [
    'Can I terminate this agreement early?',
    'Is there a penalty clause?',
    'What is the notice period?',
    'What are my key obligations?',
    'What are the payment deadlines?',
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <DisclaimerBanner />
        <div className="flex-1 flex flex-col items-center justify-center space-y-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-teal-600 border-t-transparent"></div>
          <p className="text-sm font-medium text-slate-700">
            Initializing JurisPath Document Workspace...
          </p>
          <p className="text-xs text-slate-500">
            Loading semantic chunks, grounding citations & clause hierarchy
          </p>
        </div>
      </div>
    );
  }

  if (loadError || !documentDetail) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <DisclaimerBanner />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <AlertTriangle className="h-12 w-12 text-amber-500 mb-3" />
          <h2 className="text-lg font-bold text-slate-800">Document Unavailable</h2>
          <p className="text-sm text-slate-600 max-w-md mt-1 mb-4">{loadError}</p>
          <Link
            href="/dashboard"
            className="rounded bg-teal-600 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-500"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const { metadata, summary, clauses } = documentDetail;

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 overflow-hidden">
      <Navbar />
      <DisclaimerBanner />

      {/* Top Workspace Toolbar */}
      <div className="bg-white border-b border-slate-200 px-4 py-2.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center space-x-3">
          <Link
            href="/dashboard"
            className="flex items-center space-x-1 text-xs text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </Link>
          <div className="h-4 w-px bg-slate-200"></div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-sm text-slate-900 truncate max-w-xs md:max-w-md">
                {metadata.filename}
              </span>
              <span className="rounded bg-teal-100 px-2 py-0.5 text-[10px] font-semibold text-teal-800">
                {metadata.doc_type}
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              {metadata.jurisdiction} • {metadata.page_count} Pages • Verified RAG Index
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2">
          <Link
            href={`/compare?docA=${metadata.id}`}
            className="hidden sm:flex items-center space-x-1 rounded border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            <span>Compare Agreement</span>
          </Link>
          <button
            onClick={handleCopyText}
            className="flex items-center space-x-1 rounded border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
            title="Copy Full Document Text"
          >
            <Copy className="h-3.5 w-3.5 text-slate-500" />
            <span className="hidden md:inline">{copiedText ? 'Copied!' : 'Copy Text'}</span>
          </button>
        </div>
      </div>

      {/* Main 3-Panel Grid */}
      <div className="flex-1 flex overflow-hidden">
        {/* PANEL 1: LEFT NAVIGATION & TABLE OF CONTENTS */}
        <aside className="w-72 bg-white border-r border-slate-200 flex flex-col hidden lg:flex">
          {/* Search in Document */}
          <div className="p-3 border-b border-slate-100">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Filter clauses & topics..."
                value={searchDocQuery}
                onChange={(e) => setSearchDocQuery(e.target.value)}
                className="w-full rounded-md bg-slate-50 pl-8 pr-3 py-1.5 text-xs text-slate-800 border border-slate-200 focus:border-teal-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Document Parties & Metadata Summary */}
          <div className="p-3 border-b border-slate-100 bg-slate-50/50">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Identified Parties
            </h4>
            <div className="space-y-1">
              {metadata.parties.map((p, idx) => (
                <div key={idx} className="text-xs text-slate-700 font-medium truncate">
                  • {p}
                </div>
              ))}
            </div>

            {metadata.monetary_values.length > 0 && (
              <div className="mt-2.5 pt-2 border-t border-slate-200/60">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Key Payments
                </h4>
                <div className="flex flex-wrap gap-1">
                  {metadata.monetary_values.slice(0, 3).map((val, idx) => (
                    <span
                      key={idx}
                      className="rounded bg-teal-50 px-1.5 py-0.5 text-[10px] font-semibold text-teal-800 border border-teal-200"
                    >
                      {val}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Clause Table of Contents */}
          <div className="flex-1 overflow-y-auto p-3 space-y-1">
            <div className="flex items-center justify-between pb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Clauses Outline ({clauses.length})
              </span>
            </div>

            {clauses
              .filter(
                (c) =>
                  !searchDocQuery ||
                  c.title.toLowerCase().includes(searchDocQuery.toLowerCase()) ||
                  c.text.toLowerCase().includes(searchDocQuery.toLowerCase())
              )
              .map((clause) => {
                const isHighlighted =
                  highlightTarget?.sectionNumber?.toLowerCase() ===
                  clause.section_number.toLowerCase();

                return (
                  <button
                    key={clause.id}
                    onClick={() => handleHighlightEvidence(clause.page_number, clause.section_number, clause.text)}
                    className={`w-full text-left rounded-md px-2.5 py-2 text-xs transition-all flex flex-col items-start ${
                      isHighlighted
                        ? 'bg-teal-100 text-teal-900 font-semibold border-l-4 border-teal-600'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-semibold text-[11px] text-teal-700">
                        {clause.section_number}
                      </span>
                      <span className="text-[10px] text-slate-400">Page {clause.page_number}</span>
                    </div>
                    <span className="font-medium text-slate-800 truncate w-full mt-0.5">
                      {clause.title}
                    </span>
                    <span className="text-[10px] text-slate-400">{clause.category}</span>
                  </button>
                );
              })}
          </div>

          {/* Quick Deadlines Footer */}
          {deadlines.length > 0 && (
            <div className="p-3 border-t border-slate-200 bg-slate-50">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-800 mb-1">
                <span className="flex items-center space-x-1">
                  <Clock className="h-3.5 w-3.5 text-teal-600" />
                  <span>Next Deadline</span>
                </span>
                <span className="rounded bg-teal-600 text-white px-1.5 py-0.2 text-[10px]">
                  {deadlines[0].days_remaining ? `${deadlines[0].days_remaining}d remaining` : 'Notice'}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 truncate">{deadlines[0].title}</p>
            </div>
          )}
        </aside>

        {/* PANEL 2: CENTER DOCUMENT VIEWER */}
        <main className="flex-1 flex flex-col bg-slate-100 border-r border-slate-200 overflow-hidden">
          {/* Viewer Sub-Header with Controls */}
          <div className="bg-white border-b border-slate-200 px-4 py-2 flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs text-slate-600">
              <BookOpen className="h-4 w-4 text-teal-600" />
              <span className="font-medium">Document Reader</span>
              <span className="text-slate-400">|</span>
              <span className="text-slate-500">Page 1 of {documentDetail?.pages?.length ?? 1}</span>
            </div>

            {/* Evidence Active Banner */}
            {highlightTarget && (
              <div className="flex items-center space-x-2 rounded bg-teal-100/80 px-2.5 py-1 text-xs text-teal-900 border border-teal-300 animate-pulse">
                <Sparkles className="h-3.5 w-3.5 text-teal-700" />
                <span className="font-semibold">
                  Evidence Focus: {highlightTarget.sectionNumber} (Page {highlightTarget.pageNumber})
                </span>
                <button
                  onClick={() => setHighlightTarget(null)}
                  className="ml-1 text-teal-700 hover:text-teal-950 font-bold"
                >
                  ×
                </button>
              </div>
            )}

            {/* Font Zoom Controls */}
            <div className="flex items-center space-x-1 text-xs text-slate-600">
              <button
                onClick={() => setFontSize((prev) => Math.max(12, prev - 1))}
                className="rounded p-1 hover:bg-slate-100 text-slate-600"
                title="Decrease Font Size"
              >
                <ZoomOut className="h-3.5 w-3.5" />
              </button>
              <span className="font-mono text-[11px] px-1">{fontSize}px</span>
              <button
                onClick={() => setFontSize((prev) => Math.min(20, prev + 1))}
                className="rounded p-1 hover:bg-slate-100 text-slate-600"
                title="Increase Font Size"
              >
                <ZoomIn className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Rendered Document Page */}
          <div
            ref={viewerScrollRef}
            className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6"
            style={{ fontSize: `${fontSize}px` }}
          >
            <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-md border border-slate-200 p-6 md:p-10 space-y-6">
              {/* Document Preamble / Header */}
              <div className="border-b border-slate-200 pb-4 text-center">
                <h1 className="text-xl md:text-2xl font-bold font-serif text-slate-900 tracking-tight uppercase">
                  {metadata.filename.replace('.txt', '').replace(/_/g, ' ')}
                </h1>
                <div className="mt-2 inline-flex items-center space-x-2 text-xs text-slate-500 font-mono">
                  <span>JURISDICTION: {metadata.jurisdiction}</span>
                  <span>•</span>
                  <span>RECORD ID: {metadata.id}</span>
                </div>
              </div>

              {/* Render Structured Clauses with Anchors & Highlighting */}
              <div className="space-y-6 leading-relaxed text-slate-800">
                {clauses.map((clause) => {
                  const normalizedSec = clause.section_number.replace(/\s+/g, '_').toLowerCase();
                  const isMatch =
                    highlightTarget?.sectionNumber?.toLowerCase() ===
                    clause.section_number.toLowerCase();

                  return (
                    <div
                      key={clause.id}
                      id={`clause_${normalizedSec}`}
                      className={`relative rounded-lg p-4 transition-all duration-300 ${
                        isMatch
                          ? 'bg-teal-50/90 border-2 border-teal-500 shadow-md ring-4 ring-teal-200/50'
                          : 'hover:bg-slate-50/70 border border-transparent'
                      }`}
                    >
                      {/* Anchor Header */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="rounded bg-teal-700 text-white px-2 py-0.5 text-xs font-bold font-mono">
                            {clause.section_number}
                          </span>
                          <h3 className="font-bold text-slate-900 text-sm md:text-base font-serif">
                            {clause.title}
                          </h3>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-500 font-medium">
                            Page {clause.page_number}
                          </span>
                          {isMatch && (
                            <span className="flex items-center space-x-1 rounded bg-teal-600 text-white px-2 py-0.5 text-[10px] font-bold animate-bounce">
                              <Sparkles className="h-3 w-3" />
                              <span>EVIDENCE CITED</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Clause Text */}
                      <div className="text-slate-700 whitespace-pre-line leading-relaxed">
                        {clause.text}
                      </div>

                      {/* Mini Action Prompt */}
                      <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                        <span>Category: {clause.category}</span>
                        <button
                          onClick={() => {
                            setActiveTab('chat');
                            handleSendMessage(`Explain ${clause.section_number}: ${clause.title} in simple terms.`);
                          }}
                          className="text-teal-700 hover:text-teal-900 font-medium flex items-center space-x-1"
                        >
                          <Sparkles className="h-3 w-3" />
                          <span>Explain this clause</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </main>

        {/* PANEL 3: RIGHT AI ASSISTANT HUB */}
        <aside className="w-96 md:w-[420px] bg-white flex flex-col shadow-lg">
          {/* Tabs Navigation */}
          <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-medium">
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex-1 py-3 px-2 text-center border-b-2 transition-colors flex items-center justify-center space-x-1.5 ${
                activeTab === 'chat'
                  ? 'border-teal-600 text-teal-800 bg-white font-semibold shadow-xs'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <MessageSquare className="h-3.5 w-3.5" />
              <span>Ask AI</span>
            </button>
            <button
              onClick={() => setActiveTab('summary')}
              className={`flex-1 py-3 px-2 text-center border-b-2 transition-colors flex items-center justify-center space-x-1.5 ${
                activeTab === 'summary'
                  ? 'border-teal-600 text-teal-800 bg-white font-semibold shadow-xs'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="h-3.5 w-3.5" />
              <span>Summary</span>
            </button>
            <button
              onClick={() => setActiveTab('simple')}
              className={`flex-1 py-3 px-2 text-center border-b-2 transition-colors flex items-center justify-center space-x-1.5 ${
                activeTab === 'simple'
                  ? 'border-teal-600 text-teal-800 bg-white font-semibold shadow-xs'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookOpen className="h-3.5 w-3.5" />
              <span>Simple Mode</span>
            </button>
            <button
              onClick={() => setActiveTab('deadlines')}
              className={`flex-1 py-3 px-2 text-center border-b-2 transition-colors flex items-center justify-center space-x-1.5 ${
                activeTab === 'deadlines'
                  ? 'border-teal-600 text-teal-800 bg-white font-semibold shadow-xs'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <Clock className="h-3.5 w-3.5" />
              <span>Timeline</span>
            </button>
          </div>

          {/* TAB 1: ASK JURISPATH (CHATBOT) */}
          {activeTab === 'chat' && (
            <div className="flex-1 flex flex-col overflow-hidden bg-slate-50/50">
              {/* Grounding Safety Banner */}
              <div className="bg-teal-50 border-b border-teal-100 px-3 py-1.5 flex items-center justify-between text-[11px] text-teal-800">
                <div className="flex items-center space-x-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-teal-600" />
                  <span className="font-semibold">Strict Grounding Enabled</span>
                </div>
                <span className="text-teal-600">Zero Hallucination Guard</span>
              </div>

              {/* Chat Messages Stream */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {chatMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col ${
                      msg.role === 'user' ? 'items-end' : 'items-start'
                    }`}
                  >
                    <div
                      className={`max-w-[90%] rounded-xl px-3.5 py-2.5 text-xs leading-relaxed shadow-xs ${
                        msg.role === 'user'
                          ? 'bg-teal-700 text-white rounded-br-none'
                          : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none'
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{msg.content}</div>

                      {/* Grounded Evidence Citations */}
                      {msg.responseData?.evidences && msg.responseData.evidences.length > 0 && (
                        <div className="mt-3 pt-2 border-t border-slate-100">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-teal-800 mb-1 flex items-center space-x-1">
                            <Sparkles className="h-3 w-3 text-teal-600" />
                            <span>Source Evidence ({msg.responseData.evidences.length})</span>
                          </div>
                          {msg.responseData.evidences.map((ev, evIdx) => (
                            <EvidenceCard
                              key={evIdx}
                              evidence={ev}
                              onNavigate={handleHighlightEvidence}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {isAsking && (
                  <div className="flex items-center space-x-2 rounded-lg bg-white p-3 text-xs text-slate-500 border border-slate-200 shadow-xs">
                    <div className="h-3 w-3 animate-spin rounded-full border-2 border-teal-600 border-t-transparent"></div>
                    <span>Scanning document & verifying grounding...</span>
                  </div>
                )}
                <div ref={chatBottomRef} />
              </div>

              {/* Quick Prompt Chips */}
              <div className="p-2 border-t border-slate-200 bg-white">
                <div className="flex items-center space-x-1 overflow-x-auto pb-1 no-scrollbar">
                  {sampleQuestions.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(q)}
                      className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] text-slate-700 hover:bg-teal-50 hover:text-teal-800 hover:border-teal-300 border border-slate-200 transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>

                {/* Chat Input */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="mt-1.5 flex items-center space-x-2"
                >
                  <input
                    type="text"
                    placeholder="Ask about notice, penalties, rights..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    disabled={isAsking}
                    className="flex-1 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-900 border border-slate-200 focus:border-teal-500 focus:outline-none disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={!chatInput.trim() || isAsking}
                    className="rounded-lg bg-teal-600 p-2 text-white hover:bg-teal-500 disabled:opacity-40 transition-colors shadow-xs"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 2: STRUCTURED DOCUMENT SUMMARY */}
          {activeTab === 'summary' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs bg-slate-50">
              <div className="rounded-lg bg-white p-3.5 border border-slate-200 shadow-xs space-y-2">
                <span className="rounded bg-teal-100 text-teal-800 px-2 py-0.5 text-[10px] font-bold">
                  {summary.doc_type}
                </span>
                <p className="text-slate-700 leading-relaxed">{summary.overview}</p>
              </div>

              {/* Attention Clauses */}
              {summary.clauses_requiring_attention.length > 0 && (
                <div className="rounded-lg bg-amber-50 p-3.5 border border-amber-200 shadow-xs">
                  <h4 className="font-bold text-amber-900 flex items-center space-x-1.5 mb-2">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    <span>Clauses Requiring Attention</span>
                  </h4>
                  <ul className="space-y-1 text-amber-800">
                    {summary.clauses_requiring_attention.map((c, idx) => (
                      <li key={idx} className="leading-normal">
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Important Obligations */}
              <div className="rounded-lg bg-white p-3.5 border border-slate-200 shadow-xs">
                <h4 className="font-bold text-slate-800 mb-2">Key Obligations</h4>
                <ul className="space-y-1.5 text-slate-600">
                  {summary.important_obligations.map((ob, idx) => (
                    <li key={idx} className="flex items-start space-x-1.5">
                      <span className="text-teal-600 font-bold">•</span>
                      <span>{ob}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Termination & Dispute */}
              <div className="rounded-lg bg-white p-3.5 border border-slate-200 shadow-xs space-y-3">
                <div>
                  <h4 className="font-bold text-slate-800 mb-1">Termination Terms</h4>
                  <p className="text-slate-600 leading-relaxed">{summary.termination_summary}</p>
                </div>
                <div className="pt-2 border-t border-slate-100">
                  <h4 className="font-bold text-slate-800 mb-1">Dispute Resolution</h4>
                  <p className="text-slate-600 leading-relaxed">{summary.dispute_resolution}</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SIMPLE LANGUAGE MODE */}
          {activeTab === 'simple' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs bg-slate-50">
              <div className="rounded-lg bg-teal-50 p-3 border border-teal-200 text-teal-900">
                <p className="font-semibold text-xs mb-1">Plain Language Translation</p>
                <p className="text-[11px] text-teal-800 leading-relaxed">
                  Every clause converted into everyday words, practical consequences, and checklist items.
                </p>
              </div>

              {simpleClauses.map((clause, idx) => (
                <div
                  key={idx}
                  className="rounded-xl bg-white p-4 border border-slate-200 shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="font-bold text-teal-800 font-serif">
                      {clause.section_number}: {clause.title}
                    </span>
                    <button
                      onClick={() => handleHighlightEvidence(clause.page_number, clause.section_number, clause.original_text)}
                      className="text-[10px] text-teal-600 hover:text-teal-900 font-medium flex items-center space-x-1"
                    >
                      <span>Page {clause.page_number}</span>
                      <ExternalLink className="h-3 w-3" />
                    </button>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Plain Language
                    </span>
                    <p className="text-slate-800 font-medium mt-0.5">{clause.plain_language}</p>
                  </div>

                  <div className="rounded-md bg-slate-50 p-2.5 border border-slate-100">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700">
                      Practical Meaning
                    </span>
                    <p className="text-slate-700 mt-0.5">{clause.practical_meaning}</p>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Things To Check
                    </span>
                    <ul className="mt-1 space-y-1 text-slate-600">
                      {clause.things_to_check.map((item, itemIdx) => (
                        <li key={itemIdx} className="flex items-center space-x-1.5">
                          <CheckCircle className="h-3 w-3 text-teal-500 shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 4: DEADLINES & TIMELINE */}
          {activeTab === 'deadlines' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs bg-slate-50">
              <div className="rounded-lg bg-white p-3 border border-slate-200 shadow-xs mb-2">
                <span className="font-bold text-slate-800 text-xs">Visual Timeline & Milestones</span>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Automated detection of notice periods, payment dates, and expiration cut-offs.
                </p>
              </div>

              {deadlines.map((dl) => (
                <div
                  key={dl.id}
                  onClick={() => handleHighlightEvidence(dl.source_page, dl.source_section, dl.source_text)}
                  className="rounded-xl bg-white p-3.5 border border-slate-200 shadow-xs hover:border-teal-400 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-slate-900 group-hover:text-teal-700">
                      {dl.title}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        dl.urgency === 'Urgent'
                          ? 'bg-red-100 text-red-800 border border-red-200'
                          : dl.urgency === 'Moderate'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-teal-50 text-teal-800 border border-teal-200'
                      }`}
                    >
                      {dl.urgency}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2 text-[11px] text-slate-500 mb-2">
                    <Calendar className="h-3.5 w-3.5 text-teal-600" />
                    <span className="font-medium text-slate-800">{dl.date_str}</span>
                    {dl.days_remaining && (
                      <span className="rounded bg-slate-100 px-1.5 py-0.2 font-mono">
                        {dl.days_remaining} days remaining
                      </span>
                    )}
                  </div>

                  <blockquote className="border-l-2 border-slate-300 pl-2 text-[11px] italic text-slate-600 bg-slate-50 py-1 rounded-r">
                    &ldquo;{dl.source_text}&rdquo;
                  </blockquote>

                  <div className="mt-2 text-[10px] font-semibold text-teal-700 flex items-center justify-between">
                    <span>Source: {dl.source_section}</span>
                    <span className="group-hover:translate-x-0.5 transition-transform flex items-center space-x-0.5">
                      <span>Jump to clause</span>
                      <ChevronRight className="h-3 w-3" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
