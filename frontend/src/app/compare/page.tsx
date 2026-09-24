'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  GitCompare,
  Sparkles,
  AlertCircle,
  Shield,
  Printer
} from 'lucide-react';
import { getDocuments, compareDocuments, DocumentMetadata, ComparisonResponse } from '@/lib/api';
import Navbar from '@/components/Navbar';
import DisclaimerBanner from '@/components/DisclaimerBanner';

function CompareContent() {
  const searchParams = useSearchParams();
  const initialDocA = searchParams.get('docA') || '';

  const [availableDocs, setAvailableDocs] = useState<DocumentMetadata[]>([]);
  const [docAId, setDocAId] = useState(initialDocA);
  const [docBId, setDocBId] = useState('');
  const [comparisonResult, setComparisonResult] = useState<ComparisonResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleRunComparison = useCallback(async (aId?: string, bId?: string) => {
    const targetA = aId || docAId;
    const targetB = bId || docBId;

    if (!targetA || !targetB) {
      setErrorMsg('Please select two distinct documents to compare.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await compareDocuments(targetA, targetB);
      setComparisonResult(res);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Comparison failed. Please try again.';
      setErrorMsg(message);
    } finally {
      setIsLoading(false);
    }
  }, [docAId, docBId]);

  useEffect(() => {
    let isMounted = true;
    async function loadDocs() {
      try {
        const docs = await getDocuments();
        if (!isMounted) return;
        setAvailableDocs(docs);
        if (docs.length >= 2) {
          const firstId = initialDocA || docs[0].id;
          const secondId = docs.find(d => d.id !== firstId)?.id || docs[1].id;
          setDocAId(firstId);
          setDocBId(secondId);
        } else if (docs.length === 1 && !docAId) {
          setDocAId(docs[0].id);
        }
      } catch (err: unknown) {
        console.error('Failed to load documents list', err);
      }
    }
    loadDocs();
    return () => {
      isMounted = false;
    };
  }, [initialDocA, docAId]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <DisclaimerBanner />

      <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6" tabIndex={-1}>
        {/* Header Breadcrumb */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <nav aria-label="Breadcrumb" className="flex items-center space-x-2 text-xs text-slate-500 mb-1">
              <Link href="/dashboard" className="hover:text-slate-800 transition-colors">
                Dashboard
              </Link>
              <span aria-hidden="true">/</span>
              <span className="text-slate-800 font-medium">Document Comparison</span>
            </nav>
            <h1 className="text-2xl font-bold font-serif text-slate-900 flex items-center space-x-2">
              <GitCompare className="h-6 w-6 text-teal-600" aria-hidden="true" />
              <span>Side-by-Side Legal Agreement Comparison</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Objective 10-point legal delta analysis. Evaluates notice periods, deposits, liabilities & penalties.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => window.print()}
              aria-label="Print or export comparison report as PDF"
              className="inline-flex items-center space-x-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:outline-none transition-colors"
            >
              <Printer className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Print / PDF</span>
            </button>
          </div>
        </header>

        {/* Document Selectors Row */}
        <section aria-labelledby="comparison-selector-heading" className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-5 rounded-xl shadow-xs border border-slate-200">
          <h2 id="comparison-selector-heading" className="sr-only">Select Documents to Compare</h2>
          <div>
            <label htmlFor="doc-a-select" className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Document A (Primary)
            </label>
            <select
              id="doc-a-select"
              value={docAId}
              onChange={(e) => setDocAId(e.target.value)}
              className="w-full rounded-lg bg-slate-50 px-3 py-2 text-xs font-medium text-slate-900 border border-slate-300 focus:border-teal-500 focus-visible:ring-2 focus-visible:ring-teal-500 focus:outline-none"
            >
              <option value="">Select Document A...</option>
              {availableDocs.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  {doc.filename} ({doc.doc_type})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="doc-b-select" className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Document B (Comparison Target)
            </label>
            <select
              id="doc-b-select"
              value={docBId}
              onChange={(e) => setDocBId(e.target.value)}
              className="w-full rounded-lg bg-slate-50 px-3 py-2 text-xs font-medium text-slate-900 border border-slate-300 focus:border-teal-500 focus-visible:ring-2 focus-visible:ring-teal-500 focus:outline-none"
            >
              <option value="">Select Document B...</option>
              {availableDocs.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  {doc.filename} ({doc.doc_type})
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2 flex items-center justify-between pt-2">
            <p className="text-[11px] text-slate-500 italic">
              Tip: Compare two lease drafts, employment agreements, or NDA terms to spot critical changes before signing.
            </p>
            <button
              onClick={() => handleRunComparison()}
              disabled={isLoading || !docAId || !docBId}
              className="inline-flex items-center space-x-2 rounded-lg bg-teal-600 px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-teal-500 disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 focus-visible:outline-none transition-colors"
            >
              {isLoading ? (
                <>
                  <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" aria-hidden="true" />
                  <span>Analyzing Clauses...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Generate Comparison</span>
                </>
              )}
            </button>
          </div>
        </section>

        {errorMsg && (
          <div role="alert" className="flex items-center space-x-2 rounded-lg bg-red-50 p-3 text-xs text-red-700 border border-red-200">
            <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Comparison Result Display */}
        {comparisonResult && (
          <div className="space-y-6" aria-live="polite">
            {/* Neutral Overview Card */}
            <article className="rounded-xl bg-white p-5 border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-teal-600" aria-hidden="true" />
                <h2 className="font-bold text-sm text-slate-900">Executive Summary of Differences</h2>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed font-sans">
                {comparisonResult.overall_summary}
              </p>
              <div className="rounded-md bg-slate-50 p-2.5 text-[11px] text-slate-500 border border-slate-100 flex items-center justify-between">
                <span>{comparisonResult.disclaimer}</span>
                <span className="font-semibold text-teal-800">Strictly Neutral</span>
              </div>
            </article>

            {/* 10-Point Comparison Matrix Table */}
            <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs" aria-label="10-Point Legal Comparison Matrix">
                  <thead>
                    <tr className="bg-slate-900 text-white font-medium border-b border-slate-800">
                      <th scope="col" className="p-3.5 w-1/5 font-semibold text-teal-300">Category</th>
                      <th scope="col" className="p-3.5 w-2/5 font-semibold border-l border-slate-800">
                        {comparisonResult.doc_a_title}
                      </th>
                      <th scope="col" className="p-3.5 w-2/5 font-semibold border-l border-slate-800">
                        {comparisonResult.doc_b_title}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {comparisonResult.categories.map((cat, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                        <td className="p-3.5 align-top font-bold text-slate-900 bg-slate-50/50">
                          <div className="text-slate-900 font-serif">{cat.category}</div>
                          <div className="mt-1 text-[10px] font-normal text-slate-500">
                            {cat.impact_analysis}
                          </div>
                        </td>
                        <td className="p-3.5 align-top text-slate-700 border-l border-slate-100 leading-relaxed">
                          <div className="bg-white p-2.5 rounded border border-slate-200/80">
                            {cat.doc_a_value}
                          </div>
                        </td>
                        <td className="p-3.5 align-top text-slate-700 border-l border-slate-100 leading-relaxed">
                          <div className="bg-white p-2.5 rounded border border-slate-200/80">
                            {cat.doc_b_value}
                          </div>
                          <div className="mt-2 text-[11px] text-teal-800 bg-teal-50/70 p-2 rounded border border-teal-100">
                            <span className="font-semibold">Key Difference: </span>
                            {cat.difference_explanation}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center text-xs text-slate-500">Loading Document Comparison Matrix...</div>}>
      <CompareContent />
    </Suspense>
  );
}
