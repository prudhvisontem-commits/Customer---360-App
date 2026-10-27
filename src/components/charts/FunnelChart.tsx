/**
 * Acuity Brands Lighting - Commercial Opportunity Funnel
 * Shows progression through specification lock, quotation, and contract closure
 * with stage conversion rates, drop-off indicators, and bottom summary strip.
 */

import React, { useState } from 'react';
import { VisualTooltip, VisualTooltipProps } from '../common/VisualTooltip';

export interface FunnelStageData {
  stage: string;
  step: number;
  count: number;
  value: number;
  weighted: number;
}

interface FunnelChartProps {
  stages: FunnelStageData[];
  title?: string;
  subtitle?: string;
  onStageClick?: (stage: string) => void;
  tooltip?: VisualTooltipProps;
  actionButton?: {
    label: string;
    onClick: () => void;
  };
}

export const FunnelChart: React.FC<FunnelChartProps> = ({
  stages,
  title = 'Commercial Opportunity Funnel & Stage Progression',
  subtitle = 'Opportunity conversion through specification lock, BAFO (Best and Final Offer) proposal, and contract win',
  onStageClick,
  tooltip,
  actionButton,
}) => {
  const [hoverStage, setHoverStage] = useState<string | null>(null);

  const maxValue = Math.max(...stages.map((s) => s.value), 1);
  const totalPipeline = stages.reduce((sum, s) => sum + s.value, 0);
  const totalWeighted = stages.reduce((sum, s) => sum + s.weighted, 0);
  const weightedRealizationPct = totalPipeline > 0 ? (totalWeighted / totalPipeline) * 100 : 0;

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs h-full flex flex-col justify-between">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              {title}
            </h4>
            {tooltip && (
              <VisualTooltip
                {...tooltip}
                title={tooltip.title || title}
              />
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
            {subtitle}
          </p>
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <div className="text-xs sm:text-sm text-slate-600 font-semibold flex items-center gap-3.5">
            <span className="flex items-center gap-1.5" title="Gross unweighted opportunity pipeline value">
              <span className="w-2.5 h-2.5 rounded-full bg-[#04BC6F]" /> Pipeline
            </span>
            <span className="flex items-center gap-1.5" title="Risk-adjusted pipeline value based on stage win probability">
              <span className="w-2.5 h-2.5 rounded-full bg-[#4379A3]" /> Weighted
            </span>
          </div>

          {actionButton && (
            <button
              type="button"
              onClick={actionButton.onClick}
              className="text-xs font-bold text-[#007041] hover:underline flex items-center gap-1 cursor-pointer transition-colors shrink-0"
            >
              <span>{actionButton.label}</span>
              <span aria-hidden="true">&rarr;</span>
            </button>
          )}
        </div>
      </div>

      {/* Stage Bars evenly spread */}
      <div className="space-y-2.5 flex-1 flex flex-col justify-around py-1">
        {stages.map((s) => {
          const winProbPct = s.value > 0 ? Math.round((s.weighted / s.value) * 100) : 0;
          const pipelineSharePct = totalPipeline > 0 ? Math.round((s.value / totalPipeline) * 100) : 0;
          const widthPct = Math.max(14, Math.round((s.value / maxValue) * 100));
          const weightedPct = Math.max(8, Math.round((s.weighted / maxValue) * 100));

          const isHovered = hoverStage === s.stage;

          return (
            <div
              key={s.stage}
              className={`p-2.5 rounded-xl border transition-all duration-150 cursor-pointer ${
                isHovered
                  ? 'border-[#04BC6F] bg-[#04BC6F]/5 shadow-2xs'
                  : 'border-slate-100 hover:border-slate-300 bg-slate-50/70'
              }`}
              onMouseEnter={() => setHoverStage(s.stage)}
              onMouseLeave={() => setHoverStage(null)}
              onClick={() => onStageClick?.(s.stage)}
            >
              <div className="flex items-center justify-between text-xs sm:text-sm mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-[10.5px]">
                    {s.step}
                  </span>
                  <span className="font-bold text-slate-800 text-xs sm:text-sm">
                    {s.stage}
                  </span>
                  <span className="text-slate-400 text-xs font-normal">
                    ({s.count} deals • {pipelineSharePct}% of pipe)
                  </span>
                </div>

                <div className="flex items-center gap-3 font-mono text-xs sm:text-sm">
                  <span className="text-slate-900 font-bold">
                    ${(s.value / 1000).toFixed(0)}k
                  </span>
                  <span className="text-[#4379A3] font-semibold hidden sm:inline text-xs">
                    Wt: ${(s.weighted / 1000).toFixed(0)}k
                  </span>
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded font-bold ${
                      winProbPct >= 70
                        ? 'bg-emerald-100 text-emerald-800'
                        : winProbPct >= 35
                        ? 'bg-sky-100 text-sky-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                    title="Risk-adjusted win probability assigned to this sales stage"
                  >
                    {winProbPct}% Prob.
                  </span>
                </div>
              </div>

              {/* Dual Progress Visual */}
              <div className="relative w-full h-3 bg-slate-200/80 rounded-full overflow-hidden">
                <div
                  className="absolute left-0 top-0 h-full bg-[#04BC6F] rounded-full transition-all duration-300"
                  style={{ width: `${widthPct}%` }}
                />
                <div
                  className="absolute left-0 top-0 h-full bg-[#4379A3]/75 rounded-full"
                  style={{ width: `${weightedPct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Summary Strip */}
      <div className="pt-3 mt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500">
        <div className="truncate pr-2">
          <span className="text-slate-400 font-medium">Risk-Adjusted Realization: </span>
          <strong className="text-slate-800 font-mono">{weightedRealizationPct.toFixed(1)}%</strong>
          <span className="text-slate-400 ml-1">(Weighted ÷ Total Unweighted Pipeline)</span>
        </div>
        <div className="flex items-center gap-2 font-mono font-semibold text-slate-700 shrink-0">
          <span className="text-[11px] text-slate-400">Total Pipeline:</span>
          <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
            ${(totalPipeline / 1000000).toFixed(1)}M
          </span>
          <span className="font-bold text-[#4379A3] bg-sky-50 px-2 py-0.5 rounded border border-sky-100">
            Wt: ${(totalWeighted / 1000000).toFixed(1)}M
          </span>
        </div>
      </div>
    </div>
  );
};
