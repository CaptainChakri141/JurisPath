'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Scale,
  FileCheck2,
  GitCompare,
  Compass,
  Clock,
  ArrowRight,
  Sparkles,
  Upload,
  BookOpen,
  CheckCircle2,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import DisclaimerBanner from '@/components/DisclaimerBanner';
import UploadModal from '@/components/UploadModal';
import ParametersBar from '@/components/ParametersBar';

export default function HomePage() {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [activeEvidenceDemo, setActiveEvidenceDemo] = useState<number>(0);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const demoCitations = [
    {
      query: 'Can I terminate this lease agreement early?',
      answer:
        'According to Section 5 on Page 1, both parties are subject to a mandatory 6-month lock-in period. After this lock-in, either party may terminate by providing 2 months prior written notice, or paying 2 months rent in lieu.',
      citation: {
        doc: 'Sample_Residential_Rental_Agreement.txt',
        page: 1,
        section: 'Section 5: Lock-In Period and Termination Notice',
        snippet:
          'Both parties agree to an initial mandatory Lock-in Period of 6 (six) months... After the completion of the 6-month lock-in period: Either party may terminate this tenancy by providing 2 (two) months prior written notice...',
      },
    },
    {
      query: 'Is there a penalty if I delay monthly rent payment?',
      answer:
        'Yes. Based on Section 2 on Page 1, monthly rent is due on or before the 5th of each calendar month. If delayed beyond the 10th of the month, a daily late penalty of INR 200/- per day is levied.',
      citation: {
        doc: 'Sample_Residential_Rental_Agreement.txt',
        page: 1,
        section: 'Section 2: Monthly Rent and Payment Deadline',
        snippet:
          'The Lessee shall remit the rent... on or before the 5th (fifth) day of each English calendar month in advance. If rent is delayed beyond the 10th of the month, a late fee penalty of INR 200/- per day shall be levied...',
      },
    },
    {
      query: 'How long do confidentiality obligations survive under the NDA?',
      answer:
        'Under Section 4 on Page 1, general non-disclosure obligations survive for 3 years following termination. However, trade secrets and patient healthcare data remain confidential in perpetuity.',
      citation: {
        doc: 'Sample_Mutual_NDA.txt',
        page: 1,
        section: 'Section 4: Duration and Survival of Obligations',
        snippet:
          'The non-disclosure and confidentiality obligations set forth herein shall survive termination or expiration of this Agreement for a period of 3 (three) years thereafter; provided, however, that trade secrets... shall be maintained as confidential in perpetuity.',
      },
    },
  ];

  const features = [
    {
      icon: FileCheck2,
      title: 'Document Analyzer',
      description:
        'Upload PDF, DOCX, TXT, or scanned legal files. Automatically extracts parties, monetary values, deadlines, obligations, penalties, and termination conditions into a structured dashboard.',
    },
    {
      icon: Sparkles,
      title: 'Ask JurisPath',
      description:
        'Ask real-time questions about your uploaded document. Answers are strictly grounded in document text with zero hallucination. If text is missing, it explicitly informs you.',
    },
    {
      icon: BookOpen,
      title: 'Simple Language Mode',
      description:
        'Translates dense legal covenants into four crystal-clear layers: Original Legal Text, Plain Language Explanation, Practical Meaning, and Things to Check.',
    },
    {
      icon: GitCompare,
      title: 'Document Comparison',
      description:
        'Compare two agreements across 10 vital dimensions (Duration, Payment, Deposit, Notice, Penalties, Liability, Renewal, IP, Dispute). Strictly neutral delta analysis.',
    },
    {
      icon: Compass,
      title: 'Legal Navigator',
      description:
        'Interactive step-by-step guidance for Legal Notices, Rental Disputes, Employment Bonds, and Consumer Complaints with official Indian & Andhra Pradesh statutes.',
    },
    {
      icon: Clock,
      title: 'Deadline & Timeline Detection',
      description:
        'Visual chronological timeline of notice periods, payment due dates, statutory cure periods, and days remaining with direct 1-click jump to source clauses.',
    },
  ];

  const sampleDocs = [
    {
      id: 'sample_rental_1',
      title: 'Residential Rental Agreement',
      jurisdiction: 'Visakhapatnam, Andhra Pradesh',
      description: '11-month lease agreement detailing 2-month notice, 6-month lock-in, and 3-month security deposit.',
      badge: 'Tenancy',
    },
    {
      id: 'sample_employment_1',
      title: 'Tech Employment Agreement',
      jurisdiction: 'Andhra Pradesh & Telangana',
      description: 'Software Engineer appointment with 90-day notice, IP assignment, and Section 27 non-compete limits.',
      badge: 'Employment',
    },
    {
      id: 'sample_nda_1',
      title: 'Mutual Non-Disclosure Agreement',
      jurisdiction: 'Commercial Courts, Vijayawada, AP',
      description: '2-year NDA governing proprietary AI health technology with perpetual trade secret protection.',
      badge: 'Commercial',
    },
    {
      id: 'sample_notice_1',
      title: 'Consumer Legal Notice',
      jurisdiction: 'Under Consumer Protection Act 2019',
      description: 'Formal advocate notice demanding refund for defective appliance with a strict 15-day deadline.',
      badge: 'Notice',
    },
  ];

  const faqs = [
    {
      q: 'Does JurisPath give me legal advice?',
      a: 'No. JurisPath is an AI-powered legal information and document understanding platform. It helps ordinary citizens, tenants, and employees comprehend the plain meaning of legal texts and prepare for discussions with licensed advocates. It never provides legal representation or advice.',
    },
    {
      q: 'How does Evidence Mode guarantee that answers are not made up?',
      a: 'Every answer generated by JurisPath cites the exact Document Name, Page Number, Section Number, and quoted original text snippet. Clicking the citation in the workspace automatically scrolls to and highlights the source in the document viewer.',
    },
    {
      q: 'Which jurisdiction and legal frameworks are supported?',
      a: 'The initial MVP is focused on India and specifically Andhra Pradesh (including the Consumer Protection Act 2019, Indian Contract Act 1872, Negotiable Instruments Act 1881, and AP Tenancy regulations). The architecture is extensible to other states.',
    },
    {
      q: 'Does JurisPath recommend which contract is "better" in comparisons?',
      a: 'Never. JurisPath maintains strict neutrality in Document Comparison. It explains the factual differences and legal tradeoffs between Document A and Document B without taking sides.',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900">
      <Navbar />
      <DisclaimerBanner />

      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-slate-900 text-white py-16 sm:py-24 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 rounded-full bg-slate-800/80 px-3.5 py-1 text-xs font-medium text-teal-400 border border-slate-700 mb-6">
            <Sparkles className="h-3.5 w-3.5" />
            <span>AI Legal Tech MVP • India & Andhra Pradesh</span>
          </div>

          {/* Hero Title */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold font-serif tracking-tight text-white max-w-4xl mx-auto leading-tight">
            Complex Legal Information.{' '}
            <span className="text-teal-400">A Clearer Path Forward.</span>
          </h1>

          {/* Subtitle */}
          <p className="mt-5 text-sm sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            JurisPath helps you understand legal documents, compare agreements, and navigate legal information with AI-powered evidence-backed explanations.
          </p>

          {/* CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => setShowUploadModal(true)}
              className="w-full sm:w-auto rounded-lg bg-teal-600 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:bg-teal-500 transition-all flex items-center justify-center space-x-2"
            >
              <Upload className="h-4 w-4" />
              <span>Upload Document</span>
            </button>

            <Link
              href="/navigator"
              className="w-full sm:w-auto rounded-lg bg-slate-800 px-6 py-3 text-sm font-semibold text-white border border-slate-700 hover:bg-slate-700 transition-all flex items-center justify-center space-x-2"
            >
              <Compass className="h-4 w-4 text-teal-400" />
              <span>Explore Legal Navigator</span>
            </Link>

            <Link
              href="/workspace/sample_rental_1"
              className="w-full sm:w-auto rounded-lg bg-transparent px-5 py-3 text-sm font-medium text-teal-300 hover:text-white transition-colors flex items-center justify-center space-x-1.5"
            >
              <span>Try Live Demo</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Philosophy Banner */}
          <div className="mt-12 inline-flex items-center space-x-2 sm:space-x-4 rounded-xl bg-slate-800/60 p-2 sm:px-6 sm:py-2 text-[11px] sm:text-xs font-mono text-slate-400 border border-slate-700/60">
            <span>UNDERSTAND</span>
            <span className="text-teal-500">→</span>
            <span>EXPLAIN</span>
            <span className="text-teal-500">→</span>
            <span>ASK</span>
            <span className="text-teal-500">→</span>
            <span>COMPARE</span>
            <span className="text-teal-500">→</span>
            <span>NAVIGATE</span>
            <span className="text-teal-500">→</span>
            <span className="text-teal-400 font-bold">VERIFY</span>
          </div>
        </div>
      </section>

      {/* 2. PLATFORM EVALUATION PARAMETERS (MATCHING IMAGE SPECIFICATION) */}
      <ParametersBar />

      {/* 2. SIGNATURE FEATURE: EVIDENCE MODE SHOWCASE */}
      <section className="py-16 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700">
              Signature Technology
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-serif text-slate-900 mt-1">
              Evidence Mode: Never Hallucinate. Always Verify.
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-2">
              Every answer is linked directly to exact document sections. Click an evidence citation below to preview how JurisPath pinpoints the source clause in real time.
            </p>
          </div>

          {/* Interactive Evidence Simulator */}
          <div className="max-w-4xl mx-auto rounded-2xl bg-white shadow-md border border-slate-200 overflow-hidden">
            {/* Citation Selector Tabs */}
            <div className="flex border-b border-slate-200 bg-slate-100 text-xs font-medium overflow-x-auto">
              {demoCitations.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveEvidenceDemo(idx)}
                  className={`py-3 px-4 shrink-0 transition-colors flex items-center space-x-2 ${
                    activeEvidenceDemo === idx
                      ? 'bg-white text-teal-900 font-bold border-t-2 border-teal-600'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <FileCheck2 className="h-3.5 w-3.5 text-teal-600" />
                  <span className="truncate max-w-[200px] sm:max-w-xs">{item.query}</span>
                </button>
              ))}
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              {/* Left: AI Grounded Answer */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-100 text-teal-800">
                    <Sparkles className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-xs font-bold text-slate-900">JurisPath Grounded Answer</span>
                </div>

                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-sans bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                  {demoCitations[activeEvidenceDemo].answer}
                </p>

                <div className="text-[11px] text-teal-800 font-semibold flex items-center space-x-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-teal-600" />
                  <span>Grounding Confidence: 98% (Exact Section Citation)</span>
                </div>
              </div>

              {/* Right: Live Source Highlight Preview */}
              <div className="rounded-xl border-2 border-teal-500 bg-teal-50/50 p-4 shadow-sm relative animate-in fade-in">
                <div className="flex items-center justify-between mb-2">
                  <span className="rounded bg-teal-700 text-white px-2 py-0.5 text-[10px] font-bold font-mono">
                    Page {demoCitations[activeEvidenceDemo].citation.page}
                  </span>
                  <span className="rounded bg-teal-200/80 px-2 py-0.5 text-[10px] font-semibold text-teal-900">
                    MATCHED SOURCE TEXT
                  </span>
                </div>

                <div className="font-bold text-xs text-slate-900 font-serif mb-1">
                  {demoCitations[activeEvidenceDemo].citation.section}
                </div>

                <blockquote className="border-l-2 border-teal-600 pl-2.5 text-xs italic text-slate-700 leading-relaxed bg-white p-2.5 rounded-r">
                  &ldquo;{demoCitations[activeEvidenceDemo].citation.snippet}&rdquo;
                </blockquote>

                <div className="mt-3 pt-2 border-t border-teal-200/60 flex items-center justify-between text-[10px] text-teal-800 font-medium">
                  <span>Source: {demoCitations[activeEvidenceDemo].citation.doc}</span>
                  <Link
                    href={`/workspace/${
                      demoCitations[activeEvidenceDemo].citation.doc.includes('Rental')
                        ? 'sample_rental_1'
                        : 'sample_nda_1'
                    }`}
                    className="flex items-center space-x-1 hover:underline font-bold"
                  >
                    <span>Inspect in Workspace</span>
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CORE FEATURES GRID */}
      <section className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700">
              Complete Feature Suite
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-serif text-slate-900 mt-1">
              Engineered for Non-Lawyers
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-2">
              Designed for students, tenants, employees, consumers, freelancers, and small business owners signing contracts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, idx) => {
              const Icon = f.icon;
              return (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs hover:border-teal-500 hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-50 text-teal-700 group-hover:bg-teal-600 group-hover:text-white transition-colors mb-4">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-bold text-base text-slate-900 mb-2 font-serif">{f.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{f.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS */}
      <section className="py-16 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700">
              The Pipeline
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-serif text-slate-900 mt-1">
              How JurisPath Works
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                title: 'Upload Document',
                desc: 'Upload PDF, DOCX, or TXT. Automatic parsing breaks text into structured pages, clauses, and sections.',
              },
              {
                step: '02',
                title: 'RAG Vector Indexing',
                desc: 'Text chunks are indexed with exact page, section, and line coordinates for precise spatial citation.',
              },
              {
                step: '03',
                title: 'Grounded Analysis',
                desc: 'Gemini AI evaluates questions with strict legal guardrails, refusing to hallucinate or guess without source text.',
              },
              {
                step: '04',
                title: 'Evidence Verification',
                desc: 'Review plain-language explanations with interactive evidence cards that navigate to the exact source clause.',
              },
            ].map((st, idx) => (
              <div
                key={idx}
                className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs relative flex flex-col justify-between"
              >
                <div>
                  <span className="text-2xl font-bold font-mono text-teal-600 mb-2 block">
                    {st.step}
                  </span>
                  <h3 className="font-bold text-sm text-slate-900 mb-1">{st.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{st.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. SAMPLE DEMO DOCUMENTS (1-CLICK TEST) */}
      <section className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-teal-700">
                Ready-to-Test
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold font-serif text-slate-900 mt-1">
                Explore Demo Documents
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Test the full JurisPath experience with 1-click on preloaded Indian legal agreements.
              </p>
            </div>
            <button
              onClick={() => setShowUploadModal(true)}
              className="inline-flex items-center space-x-2 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800"
            >
              <Upload className="h-3.5 w-3.5" />
              <span>Upload Custom File</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {sampleDocs.map((doc) => (
              <div
                key={doc.id}
                className="rounded-xl border border-slate-200 p-4 bg-slate-50/50 hover:bg-white hover:border-teal-500 hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="rounded bg-teal-100 text-teal-800 px-2 py-0.5 text-[10px] font-bold">
                      {doc.badge}
                    </span>
                    <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 font-semibold">
                      DEMO ONLY
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 group-hover:text-teal-700 line-clamp-1">
                    {doc.title}
                  </h3>
                  <div className="text-[11px] text-slate-500 mt-1">{doc.jurisdiction}</div>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed line-clamp-3">
                    {doc.description}
                  </p>
                </div>

                <Link
                  href={`/workspace/${doc.id}`}
                  className="mt-4 pt-3 border-t border-slate-200/60 font-semibold text-xs text-teal-700 hover:text-teal-900 flex items-center justify-between group-hover:translate-x-0.5 transition-transform"
                >
                  <span>Launch in Workspace</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. FAQ SECTION */}
      <section className="py-16 bg-slate-50 border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700">
              Questions & Answers
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-serif text-slate-900 mt-1">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="rounded-xl bg-white border border-slate-200 p-4 transition-all shadow-xs cursor-pointer"
                onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs sm:text-sm text-slate-900">{faq.q}</span>
                  <ChevronDown
                    className={`h-4 w-4 text-slate-400 transition-transform ${
                      expandedFaq === idx ? 'rotate-180 text-teal-600' : ''
                    }`}
                  />
                </div>
                {expandedFaq === idx && (
                  <p className="mt-3 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-2.5">
                    {faq.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. FOOTER */}
      <footer className="bg-slate-900 text-white py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-slate-800 pb-8">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-600 text-white">
                <Scale className="h-6 w-6" />
              </div>
              <div>
                <span className="text-lg font-bold font-serif text-white">
                  Juris<span className="text-teal-400">Path</span>
                </span>
                <p className="text-xs text-slate-400">Your Path Through Legal Information</p>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-6 text-xs text-slate-400">
              <Link href="/dashboard" className="hover:text-white transition-colors">
                Dashboard
              </Link>
              <Link href="/workspace/sample_rental_1" className="hover:text-white transition-colors">
                Workspace
              </Link>
              <Link href="/compare" className="hover:text-white transition-colors">
                Document Comparison
              </Link>
              <Link href="/navigator" className="hover:text-white transition-colors">
                Legal Navigator
              </Link>
            </div>
          </div>

          <div className="mt-6 flex flex-col md:flex-row items-center justify-between text-xs text-slate-400 gap-4">
            <p>
              © 2025 JurisPath Legal Technologies. Built for hackathon demonstration. Initial Jurisdiction: India (Andhra Pradesh).
            </p>
            <p className="text-[11px] text-slate-400">
              Not a law firm. No attorney-client relationship is formed.
            </p>
          </div>
        </div>
      </footer>

      {/* Upload Modal */}
      <UploadModal isOpen={showUploadModal} onClose={() => setShowUploadModal(false)} />
    </div>
  );
}
