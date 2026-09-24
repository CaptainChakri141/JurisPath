import React from 'react';
import { ShieldAlert, Info } from 'lucide-react';

export default function DisclaimerBanner() {
  return (
    <div
      role="region"
      aria-label="Legal Compliance Notice"
      className="w-full bg-slate-100 border-b border-slate-200 px-4 py-2 text-xs text-slate-700"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <ShieldAlert className="h-4 w-4 text-teal-700 shrink-0" aria-hidden="true" />
          <span className="font-medium text-slate-900">LEGAL INFORMATION NOTICE:</span>
          <span className="hidden md:inline text-slate-600">
            JurisPath provides AI-powered document understanding and legal information assistance.
            It does NOT provide legal advice and does NOT act as a lawyer or law firm.
          </span>
          <span className="md:hidden text-slate-600">
            Informational assistance only. Not legal advice.
          </span>
        </div>
        <div className="hidden sm:flex items-center space-x-1 text-slate-500 font-mono text-[11px]">
          <Info className="h-3 w-3" aria-hidden="true" />
          <span>Indian Law & AP Jurisdiction</span>
        </div>
      </div>
    </div>
  );
}
