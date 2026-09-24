'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Compass,
  AlertTriangle,
  Home,
  Briefcase,
  ShoppingBag,
  FileText,
  BookOpen,
  CheckCircle,
  ExternalLink,
  ChevronRight,
  Calendar,
  Sparkles,
  ShieldAlert
} from 'lucide-react';
import {
  getNavigatorScenarios,
  getNavigatorGuidance,
  NavigatorScenario,
  NavigatorGuidanceResponse
} from '@/lib/api';
import Navbar from '@/components/Navbar';
import DisclaimerBanner from '@/components/DisclaimerBanner';

export default function NavigatorPage() {
  const [scenarios, setScenarios] = useState<NavigatorScenario[]>([]);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('legal_notice');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [country] = useState('India');
  const [state, setState] = useState('Andhra Pradesh');
  const [guidance, setGuidance] = useState<NavigatorGuidanceResponse | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const fetchGuidanceFor = useCallback(async (scenarioId: string, currentAnswers: Record<string, string>, targetState: string) => {
    setIsGenerating(true);
    try {
      const res = await getNavigatorGuidance(scenarioId, currentAnswers, country, targetState);
      setGuidance(res);
    } catch (err: unknown) {
      console.error('Error generating guidance', err);
    } finally {
      setIsGenerating(false);
    }
  }, [country]);

  useEffect(() => {
    let isMounted = true;
    async function loadScenarios() {
      try {
        const scList = await getNavigatorScenarios();
        if (!isMounted) return;
        setScenarios(scList);
        if (scList.length > 0) {
          const firstSc = scList[0];
          setSelectedScenarioId(firstSc.id);
          const initialAns: Record<string, string> = {};
          firstSc.questions.forEach((q) => {
            if (q.options && q.options.length > 0) {
              initialAns[q.id] = q.options[0];
            }
          });
          setAnswers(initialAns);
          // Auto-fetch initial guidance safely
          fetchGuidanceFor(firstSc.id, initialAns, state);
        }
      } catch (err: unknown) {
        console.error('Failed to load scenarios', err);
      }
    }
    loadScenarios();
    return () => {
      isMounted = false;
    };
  }, [fetchGuidanceFor, state]);

  const activeScenario = scenarios.find((s) => s.id === selectedScenarioId);

  const handleScenarioChange = (id: string) => {
    setSelectedScenarioId(id);
    const target = scenarios.find((s) => s.id === id);
    if (target) {
      const newAns: Record<string, string> = {};
      target.questions.forEach((q) => {
        if (q.options && q.options.length > 0) {
          newAns[q.id] = q.options[0];
        }
      });
      setAnswers(newAns);
      fetchGuidanceFor(id, newAns, state);
    }
  };

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleManualGenerate = () => {
    if (selectedScenarioId) {
      fetchGuidanceFor(selectedScenarioId, answers, state);
    }
  };

  const getScenarioIcon = (iconName: string) => {
    switch (iconName) {
      case 'AlertTriangle':
        return <AlertTriangle className="h-5 w-5 text-amber-500" aria-hidden="true" />;
      case 'Home':
        return <Home className="h-5 w-5 text-teal-600" aria-hidden="true" />;
      case 'Briefcase':
        return <Briefcase className="h-5 w-5 text-blue-600" aria-hidden="true" />;
      case 'ShoppingBag':
        return <ShoppingBag className="h-5 w-5 text-emerald-600" aria-hidden="true" />;
      case 'FileText':
        return <FileText className="h-5 w-5 text-indigo-600" aria-hidden="true" />;
      default:
        return <BookOpen className="h-5 w-5 text-slate-600" aria-hidden="true" />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <DisclaimerBanner />

      <main id="main-content" tabIndex={-1} className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header Breadcrumb */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <nav aria-label="Breadcrumb" className="flex items-center space-x-2 text-xs text-slate-500 mb-1">
              <Link href="/dashboard" className="hover:text-slate-800 transition-colors">
                Dashboard
              </Link>
              <span aria-hidden="true">/</span>
              <span className="text-slate-800 font-medium">Legal Navigator</span>
            </nav>
            <h1 className="text-2xl font-bold font-serif text-slate-900 flex items-center space-x-2">
              <Compass className="h-6 w-6 text-teal-600" aria-hidden="true" />
              <span>Guided Legal Assistant & Next Steps</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Select your legal situation to receive step-by-step guidance, official statutes, document checklists & advocate criteria.
            </p>
          </div>

          {/* Jurisdiction Config */}
          <div className="flex items-center space-x-2 bg-white p-2 rounded-lg border border-slate-200 shadow-xs">
            <label htmlFor="state-select" className="text-xs font-semibold text-slate-500">Jurisdiction:</label>
            <span className="text-xs font-bold text-slate-700">{country} &bull;</span>
            <select
              id="state-select"
              value={state}
              onChange={(e) => {
                const newState = e.target.value;
                setState(newState);
                if (selectedScenarioId) {
                  fetchGuidanceFor(selectedScenarioId, answers, newState);
                }
              }}
              className="rounded bg-teal-50 px-2 py-0.5 text-xs font-bold text-teal-800 border border-teal-200 focus:outline-none focus:ring-1 focus:ring-teal-500"
            >
              <option value="Andhra Pradesh">Andhra Pradesh</option>
              <option value="Telangana">Telangana</option>
              <option value="Karnataka">Karnataka</option>
              <option value="Tamil Nadu">Tamil Nadu</option>
              <option value="Maharashtra">Maharashtra</option>
              <option value="Delhi NCR">Delhi NCR</option>
            </select>
          </div>
        </header>

        {/* 7 Core Scenarios Grid */}
        <section aria-labelledby="scenarios-title" className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <h2 id="scenarios-title" className="sr-only">Available Legal Scenarios</h2>
          {scenarios.map((sc) => {
            const isSelected = sc.id === selectedScenarioId;
            return (
              <button
                key={sc.id}
                onClick={() => handleScenarioChange(sc.id)}
                aria-pressed={isSelected}
                className={`flex flex-col items-start p-3.5 rounded-xl border text-left transition-all group focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:outline-none ${
                  isSelected
                    ? 'bg-teal-900 text-white border-teal-900 shadow-md scale-[1.02]'
                    : 'bg-white text-slate-800 border-slate-200 hover:border-teal-400 hover:bg-slate-50/80 shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <div className={`p-2 rounded-lg ${isSelected ? 'bg-teal-800' : 'bg-slate-100'}`}>
                    {getScenarioIcon(sc.icon)}
                  </div>
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                      isSelected
                        ? 'bg-teal-700 text-teal-100'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {sc.badge}
                  </span>
                </div>
                <span className="font-bold text-xs leading-tight mb-1">{sc.title}</span>
                <p
                  className={`text-[10px] line-clamp-2 leading-relaxed ${
                    isSelected ? 'text-teal-200' : 'text-slate-400'
                  }`}
                >
                  {sc.description}
                </p>
              </button>
            );
          })}
        </section>

        {/* Active Questionnaire & Action Plan */}
        {activeScenario && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Dynamic Follow-up Questionnaire */}
            <section aria-labelledby="situation-details-title" className="lg:col-span-1 bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700">
                  Step 1: Answer Situation Details
                </span>
                <h2 id="situation-details-title" className="font-bold text-base text-slate-900 mt-0.5">
                  {activeScenario.title}
                </h2>
                <p className="text-xs text-slate-500 mt-1">{activeScenario.description}</p>
              </div>

              <div className="space-y-3.5">
                {activeScenario.questions.map((q) => (
                  <div key={q.id}>
                    <label htmlFor={`q-${q.id}`} className="block text-xs font-medium text-slate-700 mb-1.5">
                      {q.label}
                    </label>
                    <select
                      id={`q-${q.id}`}
                      value={answers[q.id] || ''}
                      onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                      className="w-full rounded-lg bg-slate-50 px-3 py-2 text-xs font-medium text-slate-900 border border-slate-300 focus:border-teal-500 focus-visible:ring-2 focus-visible:ring-teal-500 focus:outline-none"
                    >
                      {q.options.map((opt, optIdx) => (
                        <option key={optIdx} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>

              <button
                onClick={handleManualGenerate}
                disabled={isGenerating}
                className="w-full mt-4 flex items-center justify-center space-x-2 rounded-lg bg-teal-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-teal-500 disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:outline-none transition-colors"
              >
                {isGenerating ? (
                  <>
                    <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" aria-hidden="true" />
                    <span>Updating Plan...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Generate Action Plan</span>
                  </>
                )}
              </button>
            </section>

            {/* Right: Generated Guidance & Official Sources */}
            <section aria-labelledby="action-plan-title" className="lg:col-span-2 space-y-4" aria-live="polite">
              <h2 id="action-plan-title" className="sr-only">Generated Guidance Roadmap</h2>
              {guidance ? (
                <>
                  {/* Situation Summary Card */}
                  <article className="rounded-xl bg-white p-5 border border-slate-200 shadow-xs space-y-2">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <span className="font-bold text-xs text-teal-800 uppercase tracking-wider">
                        Situation Summary
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {guidance.jurisdiction}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed font-sans">
                      {guidance.situation_summary}
                    </p>
                  </article>

                  {/* Two Column Grid: Documents to Gather & Critical Dates */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Documents to Gather */}
                    <div className="rounded-xl bg-white p-5 border border-slate-200 shadow-xs space-y-2.5">
                      <h3 className="font-bold text-xs text-slate-900 flex items-center space-x-1.5">
                        <FileText className="h-4 w-4 text-teal-600" aria-hidden="true" />
                        <span>Documents To Gather</span>
                      </h3>
                      <ul className="space-y-1.5 text-xs text-slate-600">
                        {guidance.documents_to_gather.map((doc, idx) => (
                          <li key={idx} className="flex items-start space-x-1.5">
                            <CheckCircle className="h-3.5 w-3.5 text-teal-600 shrink-0 mt-0.5" aria-hidden="true" />
                            <span>{doc}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Important Dates Checklist */}
                    <div className="rounded-xl bg-white p-5 border border-slate-200 shadow-xs space-y-2.5">
                      <h3 className="font-bold text-xs text-slate-900 flex items-center space-x-1.5">
                        <Calendar className="h-4 w-4 text-teal-600" aria-hidden="true" />
                        <span>Important Dates & Timeline</span>
                      </h3>
                      <ul className="space-y-1.5 text-xs text-slate-600">
                        {guidance.important_dates_checklist.map((dt, idx) => (
                          <li key={idx} className="flex items-start space-x-1.5">
                            <span className="rounded bg-teal-100 text-teal-800 px-1 font-mono text-[10px] shrink-0 mt-0.5 font-bold">
                              {idx + 1}
                            </span>
                            <span>{dt}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Possible Next Steps */}
                  <div className="rounded-xl bg-white p-5 border border-slate-200 shadow-xs space-y-3">
                    <h3 className="font-bold text-xs text-slate-900">
                      Possible Next Steps (Actionable Roadmap)
                    </h3>
                    <div className="space-y-2">
                      {guidance.possible_next_steps.map((step, idx) => (
                        <div
                          key={idx}
                          className="rounded-lg bg-slate-50 p-3 text-xs text-slate-700 border border-slate-100 flex items-start space-x-2"
                        >
                          <ChevronRight className="h-4 w-4 text-teal-600 shrink-0 mt-0.5" aria-hidden="true" />
                          <span>{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Relevant Official Statutes & Legal Sources */}
                  <div className="rounded-xl bg-white p-5 border border-slate-200 shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-xs text-slate-900">
                        Relevant Official Indian Statutes & Regulatory Sources
                      </h3>
                      <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600 font-mono">
                        Official Citations
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      {guidance.relevant_statutes.map((statute, idx) => (
                        <div
                          key={idx}
                          className="rounded-lg border border-slate-200 p-3 text-xs bg-slate-50/50 flex flex-col justify-between"
                        >
                          <div>
                            <span className="font-bold text-teal-800 block">{statute.source_name}</span>
                            <span className="text-[11px] font-semibold text-slate-700 mt-1 block">
                              {statute.section}
                            </span>
                            <p className="text-[10px] text-slate-500 mt-1">{statute.relevance}</p>
                          </div>
                          <a
                            href={statute.official_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`Open official portal for ${statute.source_name}`}
                            className="mt-2.5 inline-flex items-center space-x-1 text-[10px] font-semibold text-teal-700 hover:text-teal-950 focus-visible:underline"
                          >
                            <span>Official Portal</span>
                            <ExternalLink className="h-3 w-3" aria-hidden="true" />
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* When Professional Help (Advocate) is Needed */}
                  <aside aria-label="Legal Advocate Threshold" className="rounded-xl bg-amber-50/80 p-5 border border-amber-200 shadow-xs space-y-2">
                    <h3 className="font-bold text-xs text-amber-900 flex items-center space-x-1.5">
                      <ShieldAlert className="h-4 w-4 text-amber-700" aria-hidden="true" />
                      <span>When Professional Help (Licensed Advocate) May Be Needed</span>
                    </h3>
                    <ul className="space-y-1.5 text-xs text-amber-900/90">
                      {guidance.when_professional_help_needed.map((item, idx) => (
                        <li key={idx} className="flex items-start space-x-1.5">
                          <span className="font-bold text-amber-700" aria-hidden="true">&bull;</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </aside>
                </>
              ) : (
                <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-slate-400" role="status">
                  Select your scenario questions on the left and click Generate Action Plan.
                </div>
              )}
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
