'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, AlertCircle, Sparkles, X, ArrowRight } from 'lucide-react';
import { uploadDocumentFile } from '@/lib/api';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UploadModal({ isOpen, onClose }: UploadModalProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleFileUpload = async (file: File) => {
    // Client-side quick size validation (15MB)
    if (file.size > 15 * 1024 * 1024) {
      setErrorMessage('File exceeds maximum size of 15MB. Please choose a smaller document.');
      return;
    }

    setIsUploading(true);
    setErrorMessage(null);
    try {
      const doc = await uploadDocumentFile(file);
      setIsUploading(false);
      onClose();
      router.push(`/workspace/${doc.metadata.id}`);
    } catch (err: unknown) {
      setIsUploading(false);
      const msg = err instanceof Error ? err.message : 'Upload failed. Please try again.';
      setErrorMessage(msg);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleDemoSelect = (demoId: string) => {
    onClose();
    router.push(`/workspace/${demoId}`);
  };

  const sampleDocs = [
    {
      id: 'sample_rental_1',
      title: 'Residential Rental Agreement',
      subtitle: 'Visakhapatnam, AP (11-month tenancy with 2-month notice, lock-in & deposit)',
      tag: 'Tenancy',
      color: 'border-teal-500 text-teal-700 bg-teal-50',
    },
    {
      id: 'sample_employment_1',
      title: 'Tech Employment Agreement',
      subtitle: 'Senior Frontend Architect (90-day notice, IP assignment & non-solicitation)',
      tag: 'Employment',
      color: 'border-blue-500 text-blue-700 bg-blue-50',
    },
    {
      id: 'sample_nda_1',
      title: 'Mutual Non-Disclosure Agreement',
      subtitle: 'Genomic AI Collaboration (2-year term with perpetual trade secret rules)',
      tag: 'Commercial',
      color: 'border-indigo-500 text-indigo-700 bg-indigo-50',
    },
    {
      id: 'sample_notice_1',
      title: 'Consumer Legal Notice',
      subtitle: 'Under Section 35 Consumer Protection Act 2019 (15-day strict cure deadline)',
      tag: 'Notice',
      color: 'border-amber-500 text-amber-700 bg-amber-50',
    },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="upload-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-900 px-6 py-4 text-white">
          <div className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-600 text-white">
              <Upload className="h-4 w-4" aria-hidden="true" />
            </div>
            <div>
              <h2 id="upload-modal-title" className="font-semibold text-base text-white">Upload Legal Document</h2>
              <p className="text-xs text-slate-400">PDF, DOCX, TXT or Scanned Documents (Max 15MB)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close upload dialog"
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:outline-none transition-colors"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Drag & Drop Area */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            role="button"
            tabIndex={0}
            aria-label="Upload document dropzone"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                fileInputRef.current?.click();
              }
            }}
            className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center cursor-pointer transition-all focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:outline-none ${
              dragOver
                ? 'border-teal-500 bg-teal-50/50 scale-[1.01]'
                : 'border-slate-300 hover:border-teal-400 hover:bg-slate-50'
            }`}
          >
            <label htmlFor="file-upload-input" className="sr-only">Choose a legal document file</label>
            <input
              id="file-upload-input"
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.doc,.txt"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileUpload(e.target.files[0]);
                }
              }}
            />
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-100 text-teal-700 mb-3">
              <Upload className="h-6 w-6" aria-hidden="true" />
            </div>
            <p className="font-semibold text-slate-800 text-sm">
              Click to choose a file or drag & drop here
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Supports PDF, DOCX, and TXT legal agreements, notices, and leases
            </p>
          </div>

          <div aria-live="polite">
            {isUploading && (
              <div className="flex items-center space-x-3 rounded-lg bg-teal-50 p-3 text-teal-800 text-xs font-medium border border-teal-200 animate-pulse">
                <Sparkles className="h-4 w-4 animate-spin text-teal-600" aria-hidden="true" />
                <span>Analyzing document, extracting clauses, and indexing RAG vectors...</span>
              </div>
            )}

            {errorMessage && (
              <div role="alert" className="flex items-center space-x-2 rounded-lg bg-red-50 p-3 text-red-700 text-xs font-medium border border-red-200">
                <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{errorMessage}</span>
              </div>
            )}
          </div>

          {/* Quick Demo Preloaded Documents */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Or Test Instantly with Sample Documents
              </span>
              <span className="rounded bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
                DEMO READY
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {sampleDocs.map((s) => (
                <button
                  key={s.id}
                  onClick={() => handleDemoSelect(s.id)}
                  aria-label={`Load demo document: ${s.title}`}
                  className="flex flex-col items-start rounded-lg border border-slate-200 p-3 text-left hover:border-teal-500 hover:shadow-sm focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:outline-none transition-all group bg-slate-50/50 hover:bg-white"
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="font-semibold text-xs text-slate-900 group-hover:text-teal-700">
                      {s.title}
                    </span>
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${s.color}`}>
                      {s.tag}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                    {s.subtitle}
                  </p>
                  <div className="mt-2 flex items-center space-x-1 text-[11px] font-semibold text-teal-700 group-hover:translate-x-1 transition-transform">
                    <span>Load Agreement</span>
                    <ArrowRight className="h-3 w-3" aria-hidden="true" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
