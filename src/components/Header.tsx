/**
 * Acuity Brands Lighting - Top Application Header Bar
 * Minimal, clean executive header with official synthetic POC disclaimer and notifications.
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Bell,
  ShieldAlert,
  BookOpen,
  Share2,
  Check
} from 'lucide-react';
import { useData } from '../context/DataContext';

export const Header: React.FC = () => {
  const { dataset, selectCustomer, setActiveView } = useData();
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const alertsRef = useRef<HTMLDivElement>(null);

  const handleCopyShareLink = () => {
    const shareUrl = 'https://ais-pre-pzdn7ncedqlpso7tdepie2-73025694477.asia-southeast1.run.app';
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (alertsRef.current && !alertsRef.current.contains(event.target as Node)) {
        setIsAlertsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const criticalAlerts = dataset.recommendations.filter(r => r.priority === 'Urgent').slice(0, 5);

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200/90 shadow-2xs">
      {/* Persistent Synthetic Data Banner */}
      <div className="bg-slate-900 text-slate-300 px-4 py-1 text-center text-[11px] font-medium tracking-wide flex items-center justify-center gap-2 border-b border-slate-800 select-none">
        <span className="w-2 h-2 rounded-full bg-[#04BC6F] animate-pulse" />
        <span className="text-white font-semibold">POC DEMONSTRATION</span>
        <span className="text-slate-400">— SYNTHETIC DATA —</span>
        <span className="text-slate-300">NOT ACTUAL ACUITY BRANDS PERFORMANCE</span>
      </div>

      {/* Main Bar */}
      <div className="px-6 py-2.5 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900 tracking-tight">
            Commercial, Operational & Financial Intelligence
          </h2>
          <p className="text-[11px] text-slate-500">
            Acuity Brands Lighting — Unified Customer Intelligence Hub
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Share App Link button */}
          <button
            onClick={handleCopyShareLink}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              copiedLink
                ? 'bg-emerald-100 text-[#007041] border border-emerald-300'
                : 'bg-emerald-50 text-[#007041] hover:bg-emerald-100 border border-emerald-200/80 shadow-2xs'
            }`}
            title="Copy direct shareable web link to clipboard"
          >
            {copiedLink ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#007041]" />
                <span>Link Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-[#007041]" />
                <span>Share App Link</span>
              </>
            )}
          </button>

          {/* Glossary link */}
          <button
            onClick={() => setActiveView('glossary')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            title="Open Acuity Brands Metric & Domain Glossary"
          >
            <BookOpen className="w-3.5 h-3.5 text-slate-500" />
            <span>Glossary</span>
          </button>

          {/* Critical Alerts Bell */}
          <div ref={alertsRef} className="relative">
            <button
              onClick={() => setIsAlertsOpen(!isAlertsOpen)}
              className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              title="Prioritized business alerts"
            >
              <Bell className="w-4 h-4" />
              {criticalAlerts.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#DC2626]" />
              )}
            </button>

            {isAlertsOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-slate-200 p-3 z-50">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-[#DC2626]" />
                    Prioritized Executive Alerts ({criticalAlerts.length})
                  </span>
                  <span className="text-[10px] text-slate-400">Signals</span>
                </div>

                <div className="space-y-2 max-h-72 overflow-y-auto">
                  {criticalAlerts.map((alt) => (
                    <div
                      key={alt.id}
                      onClick={() => {
                        selectCustomer(alt.accountId);
                        setIsAlertsOpen(false);
                      }}
                      className="p-2.5 rounded-lg bg-red-50/60 border border-red-100 hover:bg-red-50 cursor-pointer transition-colors text-xs"
                    >
                      <div className="flex items-center justify-between font-bold text-slate-900 mb-0.5">
                        <span>{alt.accountName}</span>
                        <span className="text-[10px] font-mono text-red-700 bg-red-100 px-1.5 py-0.2 rounded">
                          {alt.persona}
                        </span>
                      </div>
                      <p className="text-slate-700 font-medium text-[11px] mb-1">{alt.signal}</p>
                      <div className="text-[10px] text-slate-500">{alt.recommendedAction}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
