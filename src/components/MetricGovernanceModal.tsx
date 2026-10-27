/**
 * Acuity Brands Lighting - Metric Governance & Definitions Modal
 * Detailed registry defining every KPI, formula, source record, grain, and business meaning.
 */

import React from 'react';
import { X, ShieldCheck, Database, Calendar, FileText, CheckCircle2 } from 'lucide-react';
import { useData } from '../context/DataContext';
import { KPI_METRIC_DEFINITIONS } from '../data/metricsEngine';

export const MetricGovernanceModal: React.FC = () => {
  const { isGovernanceModalOpen, setIsGovernanceModalOpen } = useData();

  if (!isGovernanceModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#04BC6F]/10 border border-[#04BC6F]/30 flex items-center justify-center text-[#007041]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Enterprise Metric Governance & Definitions
              </h2>
              <p className="text-xs text-slate-500">
                Acuity Brands Lighting — Governed Business Intelligence Catalog & Calculation Standards
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsGovernanceModalOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 divide-y divide-slate-100">
          <div className="bg-[#04BC6F]/5 border border-[#04BC6F]/20 rounded-xl p-4 text-xs text-slate-700 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-[#007041] shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-[#007041]">Single Version of Analytical Truth: </span>
              All displayed KPIs are computed deterministically from the unified ledger and relational tables.
              Double-counting between parent holding corporations (e.g., Sonepar, Graybar, WESCO) and child branch locations is strictly protected via ledger rollup rules.
            </div>
          </div>

          <div className="space-y-4 pt-2">
            {Object.values(KPI_METRIC_DEFINITIONS).map((kpi) => (
              <div key={kpi.id} className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <h3 className="text-base font-bold text-slate-900">{kpi.label}</h3>
                  <span className="px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-slate-100 text-slate-700 border border-slate-200">
                    Units: {kpi.units}
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-baseline gap-2">
                    <span className="font-semibold text-slate-600 shrink-0 w-28">Formula:</span>
                    <span className="font-mono text-slate-800 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                      {kpi.formula}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-600">
                    <Database className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-medium text-slate-500">Source:</span>
                    <span className="text-slate-800">{kpi.sourceRecords}</span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-600">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-medium text-slate-500">Date Grain:</span>
                    <span className="text-slate-800">{kpi.dateBasis}</span>
                  </div>

                  <div className="flex items-start gap-2 pt-1 border-t border-slate-100 text-slate-600">
                    <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-medium text-slate-500">Business Significance: </span>
                      <span className="text-slate-700">{kpi.businessSignificance}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500">
          <span>Acuity Brands Lighting • Enterprise Data Architecture</span>
          <button
            onClick={() => setIsGovernanceModalOpen(false)}
            className="px-4 py-1.5 rounded-lg bg-slate-800 text-white font-medium hover:bg-slate-700 transition-colors"
          >
            Close Dictionary
          </button>
        </div>
      </div>
    </div>
  );
};
