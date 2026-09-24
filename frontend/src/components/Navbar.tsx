'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Scale, FileText, GitCompare, Compass, Key, Sparkles, MapPin } from 'lucide-react';
import { setGeminiApiKey } from '@/lib/api';

export default function Navbar() {
  const pathname = usePathname();
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [keyStatus, setKeyStatus] = useState<string | null>(null);

  const handleSaveKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKeyInput.trim()) return;
    try {
      await setGeminiApiKey(apiKeyInput.trim());
      setKeyStatus('Key configured successfully!');
      setTimeout(() => {
        setShowKeyModal(false);
        setKeyStatus(null);
      }, 1500);
    } catch {
      setKeyStatus('Error saving API key');
    }
  };

  const navLinks = [
    { name: 'Dashboard', href: '/dashboard', icon: FileText },
    { name: 'Workspace', href: '/workspace/sample_rental_1', icon: Sparkles },
    { name: 'Compare', href: '/compare', icon: GitCompare },
    { name: 'Legal Navigator', href: '/navigator', icon: Compass },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-slate-900 text-white shadow-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo & Tagline */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-600 text-white shadow-md transition-transform group-hover:scale-105">
              <Scale className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="sr-only">JurisPath</span>
                <span aria-hidden="true" className="text-xl font-bold tracking-tight text-white font-serif">
                  Juris<span className="text-teal-400">Path</span>
                </span>
                <span className="rounded bg-teal-900/60 px-1.5 py-0.5 text-[10px] font-semibold text-teal-300 border border-teal-700/50">
                  MVP
                </span>
              </div>
              <p className="text-[11px] text-slate-400 -mt-1 hidden sm:block">
                Your Path Through Legal Information
              </p>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav aria-label="Main Navigation" className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname ? pathname.startsWith(link.href) : false;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`flex items-center space-x-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-teal-400 ${
                    isActive
                      ? 'bg-slate-800 text-teal-400 shadow-inner'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Controls: Jurisdiction & Gemini Key */}
          <div className="flex items-center space-x-3">
            <div 
              className="hidden lg:flex items-center space-x-1.5 rounded-full bg-slate-800 px-3 py-1 text-xs font-medium text-slate-300 border border-slate-700"
              aria-label="Target jurisdiction: India (Andhra Pradesh)"
            >
              <MapPin className="h-3.5 w-3.5 text-teal-400" aria-hidden="true" />
              <span>India (AP) &bull; Andhra Pradesh</span>
            </div>

            <button
              onClick={() => setShowKeyModal(true)}
              className="flex items-center space-x-1.5 rounded-md bg-slate-800 px-2.5 py-1.5 text-xs font-medium text-slate-200 border border-slate-700 hover:bg-slate-700 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-teal-400"
              title="Configure Gemini API Key"
              aria-label="Configure Gemini API Key"
            >
              <Key className="h-3.5 w-3.5 text-teal-400" aria-hidden="true" />
              <span className="hidden sm:inline">AI Settings</span>
            </button>

            <Link
              href="/dashboard"
              className="rounded-md bg-teal-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow hover:bg-teal-500 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-400"
            >
              Launch App
            </Link>
          </div>
        </div>
      </header>

      {/* API Key Modal */}
      {showKeyModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="gemini-modal-title"
          onKeyDown={(e) => { if (e.key === 'Escape') setShowKeyModal(false); }}
        >
          <div className="w-full max-w-md rounded-xl bg-slate-900 p-6 text-white shadow-2xl border border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Key className="h-5 w-5 text-teal-400" aria-hidden="true" />
                <h3 id="gemini-modal-title" className="font-semibold text-lg">Gemini AI Configuration</h3>
              </div>
              <button
                onClick={() => setShowKeyModal(false)}
                className="text-slate-400 hover:text-white text-lg font-bold p-1 rounded focus:outline-none focus:ring-2 focus:ring-teal-400"
                aria-label="Close Gemini configuration modal"
              >
                ×
              </button>
            </div>

            <p className="mt-3 text-xs text-slate-400 leading-relaxed">
              JurisPath includes a built-in deterministic offline legal analysis engine that works out of the box. 
              To activate live Google Gemini 2.5 Flash responses, enter your Gemini API key below.
            </p>

            <form onSubmit={handleSaveKey} className="mt-4 space-y-4">
              <div>
                <label htmlFor="gemini-api-key-input" className="block text-xs font-medium text-slate-300 mb-1">
                  Gemini API Key
                </label>
                <input
                  id="gemini-api-key-input"
                  type="password"
                  placeholder="AIzaSy..."
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  className="w-full rounded-md bg-slate-800 px-3 py-2 text-sm text-white border border-slate-700 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>

              {keyStatus && (
                <p className="text-xs font-medium text-teal-400" role="status">{keyStatus}</p>
              )}

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowKeyModal(false)}
                  className="rounded px-3 py-1.5 text-xs text-slate-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded bg-teal-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-400"
                >
                  Save API Key
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
