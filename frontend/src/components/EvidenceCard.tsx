'use client';

import React from 'react';
import { FileCheck2, ExternalLink, Sparkles } from 'lucide-react';
import { Evidence } from '@/lib/api';

interface EvidenceCardProps {
  evidence: Evidence;
  onNavigate?: (pageNumber: number, sectionNumber: string, snippet: string) => void;
}

export default function EvidenceCard({ evidence, onNavigate }: EvidenceCardProps) {
  const handleClick = () => {
    if (onNavigate) {
      onNavigate(evidence.page_number, evidence.section_number, evidence.text);
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Evidence from ${evidence.doc_name}, Page ${evidence.page_number}, ${evidence.section_number}: ${evidence.section_title}`}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      className="group relative my-2.5 rounded-lg border border-teal-200 bg-teal-50/60 p-3 text-left transition-all hover:border-teal-400 hover:bg-teal-50/90 hover:shadow-md cursor-pointer focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:outline-none"
    >
      {/* Evidence Tag Header */}
      <div className="flex items-center justify-between border-b border-teal-100 pb-2">
        <div className="flex items-center space-x-1.5">
          <div className="flex h-5 w-5 items-center justify-center rounded bg-teal-600 text-white shadow-xs">
            <FileCheck2 className="h-3.5 w-3.5" aria-hidden="true" />
          </div>
          <span className="font-semibold text-xs text-teal-900 tracking-wide uppercase">
            Verified Evidence
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <span className="rounded bg-teal-200/70 px-2 py-0.5 text-[11px] font-medium text-teal-800">
            Page {evidence.page_number}
          </span>
          <span className="rounded bg-slate-200 px-2 py-0.5 text-[11px] font-medium text-slate-800">
            {evidence.section_number}
          </span>
        </div>
      </div>

      {/* Document and Section Title */}
      <div className="mt-2 text-xs font-semibold text-slate-800">
        {evidence.section_title}
      </div>

      {/* Quoted Original Text */}
      <blockquote className="mt-1 border-l-2 border-teal-500 pl-2 text-xs italic text-slate-700 leading-relaxed bg-white/70 py-1 px-1.5 rounded-r">
        &ldquo;{evidence.text}&rdquo;
      </blockquote>

      {/* Interactive Action Prompt */}
      <div className="mt-2.5 flex items-center justify-between text-[11px] text-teal-700 font-medium group-hover:text-teal-900">
        <span className="flex items-center space-x-1">
          <Sparkles className="h-3 w-3 text-teal-500" aria-hidden="true" />
          <span>Click to navigate and highlight source</span>
        </span>
        <ExternalLink className="h-3.5 w-3.5 opacity-60 group-hover:opacity-100" aria-hidden="true" />
      </div>
    </div>
  );
}
