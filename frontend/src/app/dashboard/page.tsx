'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileText,
  Upload,
  Sparkles,
  GitCompare,
  Compass,
  Clock,
  ArrowRight,
  Plus
} from 'lucide-react';
import { getDocuments, DocumentMetadata } from '@/lib/api';
import Navbar from '@/components/Navbar';
import DisclaimerBanner from '@/components/DisclaimerBanner';
import UploadModal from '@/components/UploadModal';

export default function DashboardPage() {
  const [documents, setDocuments] = useState<DocumentMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function fetchDocs() {
      try {
        const docs = await getDocuments();
        if (isMounted) {
          setDocuments(docs);
        }
      } catch (err: unknown) {
        console.error('Failed to load documents', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }
    fetchDocs();
    return () => {
      isMounted = false;
    };
  }, []);

  const deadlinesSummary = [
    {
      title: 'Consumer Notice Response Deadline',
      doc: 'Sample_Consumer_Legal_Notice.txt',
      days: 15,
      urgency: 'Urgent',
      docId: 'sample_notice_1',
    },
    {
      title: 'Monthly Rent Payment Due',
      doc: 'Sample_Residential_Rental_Agreement.txt',
      days: 5,
      urgency: 'Moderate',
      docId: 'sample_rental_1',
    },
    {
      title: 'Probation Confirmation Evaluation',
      doc: 'Sample_Employment_Agreement.txt',
      days: 45,
      urgency: 'Informational',
      docId: 'sample_employment_1',
    },
  ];

  const recentQuestions = [
    { q: 'Can I terminate the rental agreement during the lock-in period?', doc: 'Rental Agreement', docId: 'sample_rental_1' },
    { q: 'Is the post-employment non-compete clause enforceable in India?', doc: 'Employment Agreement', docId: 'sample_employment_1' },
    { q: 'What is the statutory cure deadline under Section 35 Consumer Act?', doc: 'Consumer Notice', docId: 'sample_notice_1' },
    { q: 'How long do trade secret confidentiality obligations survive?', doc: 'Mutual NDA', docId: 'sample_nda_1' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <DisclaimerBanner />

      <main id="main-content" tabIndex={-1} className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Welcome & Stats Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <span className="rounded bg-teal-100 text-teal-800 text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider">
              Legal Intelligence Portal
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif text-slate-900 mt-1">
              Welcome to JurisPath Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Manage your legal documents, track contractual deadlines, and explore evidence-grounded AI insights.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowUploadModal(true)}
              aria-label="Upload a new legal document"
              className="inline-flex items-center space-x-2 rounded-lg bg-teal-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-teal-500 focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 focus-visible:outline-none transition-colors"
            >
              <Upload className="h-4 w-4" aria-hidden="true" />
              <span>Upload Document</span>
            </button>
          </div>
        </div>

        {/* Quick Action Shortcuts */}
        <section aria-labelledby="quick-actions-title" className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <h2 id="quick-actions-title" className="sr-only">Quick Action Shortcuts</h2>
          <button
            onClick={() => setShowUploadModal(true)}
            aria-label="Upload document modal trigger"
            className="flex items-center space-x-3 rounded-xl bg-white p-4 border border-slate-200 shadow-xs hover:border-teal-500 hover:shadow-md transition-all text-left group focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:outline-none"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-700 group-hover:bg-teal-600 group-hover:text-white transition-colors">
              <Upload className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">Upload Doc</div>
              <div className="text-[11px] text-slate-500">PDF, DOCX, TXT</div>
            </div>
          </button>

          <Link
            href="/workspace/sample_rental_1"
            className="flex items-center space-x-3 rounded-xl bg-white p-4 border border-slate-200 shadow-xs hover:border-teal-500 hover:shadow-md transition-all group focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:outline-none"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-700 group-hover:bg-teal-600 group-hover:text-white transition-colors">
              <Sparkles className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">Ask AI Hub</div>
              <div className="text-[11px] text-slate-500">Grounded Q&A</div>
            </div>
          </Link>

          <Link
            href="/compare"
            className="flex items-center space-x-3 rounded-xl bg-white p-4 border border-slate-200 shadow-xs hover:border-teal-500 hover:shadow-md transition-all group focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:outline-none"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-700 group-hover:bg-teal-600 group-hover:text-white transition-colors">
              <GitCompare className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">Compare</div>
              <div className="text-[11px] text-slate-500">10 Legal Dimensions</div>
            </div>
          </Link>

          <Link
            href="/navigator"
            className="flex items-center space-x-3 rounded-xl bg-white p-4 border border-slate-200 shadow-xs hover:border-teal-500 hover:shadow-md transition-all group focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:outline-none"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-700 group-hover:bg-teal-600 group-hover:text-white transition-colors">
              <Compass className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">Navigator</div>
              <div className="text-[11px] text-slate-500">Guided Action Plans</div>
            </div>
          </Link>
        </section>

        {/* Main Grid: Recent Documents & Upcoming Deadlines */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left 2 Cols: Recent Documents */}
          <section aria-labelledby="active-docs-heading" className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 id="active-docs-heading" className="text-base font-bold font-serif text-slate-900 flex items-center space-x-2">
                <FileText className="h-4 w-4 text-teal-600" aria-hidden="true" />
                <span>Active Documents ({documents.length})</span>
              </h2>
              <button
                onClick={() => setShowUploadModal(true)}
                aria-label="Add new document"
                className="text-xs font-medium text-teal-700 hover:text-teal-900 flex items-center space-x-1 focus-visible:underline"
              >
                <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Add Document</span>
              </button>
            </div>

            {isLoading ? (
              <div className="p-8 text-center text-slate-400 text-xs" role="status">Loading documents...</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {documents.map((doc) => (
                  <article
                    key={doc.id}
                    className="flex flex-col justify-between rounded-xl bg-white p-4 border border-slate-200 shadow-xs hover:border-teal-400 hover:shadow-md transition-all group"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="rounded bg-teal-100 text-teal-800 px-2 py-0.5 text-[10px] font-bold">
                          {doc.doc_type}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {doc.page_count} {doc.page_count === 1 ? 'Page' : 'Pages'}
                        </span>
                      </div>

                      <h3 className="font-bold text-sm text-slate-900 group-hover:text-teal-700 line-clamp-1">
                        {doc.filename.replace('.txt', '').replace(/_/g, ' ')}
                      </h3>

                      <div className="mt-2 space-y-1 text-xs text-slate-500">
                        <p className="truncate">
                          <span className="font-medium text-slate-700">Parties: </span>
                          {doc.parties.join(' vs ') || 'Standard Covenants'}
                        </p>
                        <p className="truncate">
                          <span className="font-medium text-slate-700">Jurisdiction: </span>
                          {doc.jurisdiction}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <Link
                        href={`/workspace/${doc.id}`}
                        className="font-semibold text-teal-700 hover:text-teal-900 flex items-center space-x-1 group-hover:translate-x-0.5 transition-transform"
                      >
                        <span>Open Workspace</span>
                        <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                      </Link>
                      <Link
                        href={`/compare?docA=${doc.id}`}
                        className="text-slate-400 hover:text-slate-700 text-[11px]"
                      >
                        Compare
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          {/* Right Col: Pending Deadlines & Recent Q&A */}
          <aside aria-label="Deadlines and Suggested Inquiries" className="space-y-6">
            {/* Upcoming Deadlines Widget */}
            <div className="rounded-xl bg-white p-5 border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
                  <Clock className="h-3.5 w-3.5 text-teal-600" aria-hidden="true" />
                  <span>Pending Deadlines</span>
                </h3>
                <span className="rounded bg-teal-50 px-2 py-0.5 text-[10px] font-bold text-teal-800">
                  Automated
                </span>
              </div>

              <div className="space-y-3">
                {deadlinesSummary.map((item, idx) => (
                  <Link
                    key={idx}
                    href={`/workspace/${item.docId}`}
                    className="block p-2.5 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-teal-300 hover:shadow-xs transition-all"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-slate-900 line-clamp-1">
                        {item.title}
                      </span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                          item.urgency === 'Urgent'
                            ? 'bg-red-100 text-red-800'
                            : item.urgency === 'Moderate'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-teal-100 text-teal-800'
                        }`}
                      >
                        {item.days}d left
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 truncate">{item.doc}</div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Recent Questions Knowledge Pills */}
            <div className="rounded-xl bg-white p-5 border border-slate-200 shadow-xs space-y-3">
              <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
                <Sparkles className="h-3.5 w-3.5 text-teal-600" aria-hidden="true" />
                <span>Common Document Queries</span>
              </h3>

              <div className="space-y-2">
                {recentQuestions.map((rq, idx) => (
                  <Link
                    key={idx}
                    href={`/workspace/${rq.docId}`}
                    className="block p-2 text-xs text-slate-700 hover:text-teal-900 hover:bg-slate-50 rounded transition-colors group"
                  >
                    <div className="font-medium group-hover:underline leading-snug">
                      &ldquo;{rq.q}&rdquo;
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5 flex items-center space-x-1">
                      <span>Grounded in {rq.doc}</span>
                      <ArrowRight className="h-2.5 w-2.5" aria-hidden="true" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* Upload Modal */}
      <UploadModal isOpen={showUploadModal} onClose={() => setShowUploadModal(false)} />
    </div>
  );
}
