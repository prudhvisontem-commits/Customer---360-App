/**
 * Acuity Brands Lighting - Segmented Aging Bucket Bar
 * Used for AR aging buckets (Current, 30, 60, 90, 120+, Disputed)
 * and Service backlog aging (<24h, 1-3d, 4-7d, >7d).
 */

import React from 'react';
import { VisualTooltip, VisualTooltipProps } from '../common/VisualTooltip';

export interface AgingBucket {
  label: string;
  value: number;
  pct: number;
  color: string;
}

interface AgingBucketBarProps {
  buckets: AgingBucket[];
  title?: string;
  subtitle?: string;
  totalLabel?: string;
  formatValue?: (val: number) => string;
  tooltip?: VisualTooltipProps;
  actionButton?: {
    label: string;
    onClick: () => void;
  };
}

export const AgingBucketBar: React.FC<AgingBucketBarProps> = ({
  buckets,
  title,
  subtitle,
  totalLabel = 'Total Outstanding',
  formatValue = (v) => `$${(v / 1000).toFixed(0)}k`,
  tooltip,
  actionButton,
}) => {
  const total = buckets.reduce((acc, b) => acc + b.value, 0);

  // Compute Current vs Overdue
  const currentBucket = buckets[0];
  const currentPct = currentBucket ? currentBucket.pct : 0;
  const overdueVal = buckets.slice(1).reduce((sum, b) => sum + b.value, 0);

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs h-full flex flex-col justify-between">
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div>
            <div className="flex items-center gap-2">
              {title && (
                <h4 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                  {title}
                </h4>
              )}
              {tooltip && (
                <VisualTooltip
                  {...tooltip}
                  title={tooltip.title || title}
                />
              )}
            </div>
            {subtitle && (
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
          <div className="flex items-center gap-4 shrink-0">
            {actionButton && (
              <button
                type="button"
                onClick={actionButton.onClick}
                className="text-xs font-bold text-[#007041] hover:underline flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span>{actionButton.label}</span>
                <span aria-hidden="true">&rarr;</span>
              </button>
            )}
            <div className="text-right">
              <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">
                {totalLabel}
              </span>
              <span className="text-xl font-bold font-mono text-slate-900">
                {formatValue(total)}
              </span>
            </div>
          </div>
        </div>

        {/* Segmented bar */}
        <div className="w-full h-4 bg-slate-100 rounded-full flex overflow-hidden mb-4 shadow-inner">
          {buckets.map((b, idx) => (
            <div
              key={idx}
              className="h-full transition-all duration-300 relative group cursor-pointer"
              style={{ width: `${Math.max(b.pct > 0 ? 1 : 0, b.pct)}%`, backgroundColor: b.color }}
              title={`${b.label}: ${formatValue(b.value)} (${b.pct.toFixed(1)}%)`}
            />
          ))}
        </div>
      </div>

      {/* Legend & Breakdown grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-3 border-t border-slate-100 text-xs">
        {buckets.map((b, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100/90 hover:bg-slate-100/80 transition-colors"
          >
            <div className="flex items-center gap-2 truncate pr-1">
              <span className="w-3 h-3 rounded-xs shrink-0 shadow-2xs" style={{ backgroundColor: b.color }} />
              <span className="truncate text-slate-700 font-semibold text-xs sm:text-[13px]">
                {b.label}
              </span>
            </div>
            <div className="text-right font-mono font-bold text-xs sm:text-[13px] text-slate-900 shrink-0">
              {formatValue(b.value)}
              <span className="text-[11px] text-slate-400 font-normal ml-1">
                ({b.pct.toFixed(0)}%)
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Summary Strip */}
      <div className="pt-3 mt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500">
        <div className="truncate pr-2">
          <span className="text-slate-400 font-medium">Compliance: </span>
          <strong className="text-slate-800">{currentPct.toFixed(1)}% within terms</strong>
        </div>
        <div className="flex items-center gap-2 font-mono font-semibold text-slate-700 shrink-0">
          <span className="text-[11px] text-slate-400">Aging Exposure:</span>
          <span className="font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-100">
            {formatValue(overdueVal)} past due
          </span>
        </div>
      </div>
    </div>
  );
};
