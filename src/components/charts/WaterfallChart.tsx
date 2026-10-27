/**
 * Acuity Brands Lighting - Revenue Variance Waterfall Chart
 * Renders bridge components (e.g. LY Base -> Volume -> Controls Cross-Sell -> Price -> Churn -> CY Net Sales)
 * with readable headers, font sizes, and bottom summary strip.
 */

import React, { useState } from 'react';
import { VisualTooltip, VisualTooltipProps } from '../common/VisualTooltip';

export interface WaterfallStep {
  label: string;
  amount: number; // positive or negative, or absolute for total steps
  isTotal?: boolean;
}

interface WaterfallChartProps {
  steps: WaterfallStep[];
  title?: string;
  subtitle?: string;
  height?: number;
  tooltip?: VisualTooltipProps;
  actionButton?: {
    label: string;
    onClick: () => void;
  };
}

export const WaterfallChart: React.FC<WaterfallChartProps> = ({
  steps,
  title = 'Revenue Variance Waterfall Bridge',
  subtitle = 'Decomposition of year-over-year revenue variance drivers',
  height = 260,
  tooltip,
  actionButton,
}) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  // Compute running totals and bounds
  let running = 0;
  const computed = steps.map((s) => {
    let start = running;
    let end = running;
    if (s.isTotal) {
      start = 0;
      end = s.amount;
      running = s.amount;
    } else {
      end = running + s.amount;
      running = end;
    }
    return {
      ...s,
      start,
      end,
      isPositive: s.amount >= 0,
    };
  });

  const allPoints = computed.flatMap((c) => [c.start, c.end]);
  const maxVal = Math.max(...allPoints, 100) * 1.15;
  const minVal = Math.min(0, ...allPoints);

  const width = 640;
  const padding = { top: 30, right: 25, bottom: 45, left: 60 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;

  const getY = (val: number) => {
    const ratio = (val - minVal) / (maxVal - minVal);
    return padding.top + plotHeight - ratio * plotHeight;
  };

  const colWidth = (plotWidth / steps.length) * 0.65;
  const colSpacing = plotWidth / steps.length;

  // Primary positive driver
  const incrementalSteps = steps.filter((s) => !s.isTotal);
  const topGrowthDriver = [...incrementalSteps].sort((a, b) => b.amount - a.amount)[0];
  const totalBase = steps[0]?.amount || 1;
  const totalEnding = steps.slice(-1)[0]?.amount || totalBase;
  const netDelta = totalEnding - totalBase;

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
          <div className="flex items-center gap-3 text-xs sm:text-sm font-semibold text-slate-600">
            <span className="flex items-center gap-1.5" title="Positive revenue growth driver">
              <span className="w-2.5 h-2.5 rounded-xs bg-[#04BC6F]" /> Expansion
            </span>
            <span className="flex items-center gap-1.5" title="Revenue churn or volume decline">
              <span className="w-2.5 h-2.5 rounded-xs bg-[#DC2626]" /> Contraction
            </span>
            <span className="flex items-center gap-1.5" title="Baseline and ending period totals">
              <span className="w-2.5 h-2.5 rounded-xs bg-[#5B6770]" /> Total
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

      <div className="relative w-full flex-1 flex items-center justify-center py-1">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible select-none">
          {/* Zero baseline */}
          <line
            x1={padding.left}
            y1={getY(0)}
            x2={width - padding.right}
            y2={getY(0)}
            stroke="#CBD5E1"
            strokeWidth="1.5"
          />

          {computed.map((item, idx) => {
            const x = padding.left + idx * colSpacing + (colSpacing - colWidth) / 2;
            const topVal = Math.max(item.start, item.end);
            const botVal = Math.min(item.start, item.end);
            const y = getY(topVal);
            const barHeight = Math.max(2, getY(botVal) - y);

            let barColor = '#04BC6F';
            if (item.isTotal) {
              barColor = '#5B6770'; // Slate for totals
            } else if (item.amount < 0) {
              barColor = '#DC2626'; // Red for contraction
            } else {
              barColor = '#04BC6F'; // Green for growth
            }

            const isHovered = hoverIndex === idx;

            return (
              <g
                key={idx}
                className="cursor-pointer"
                onMouseEnter={() => setHoverIndex(idx)}
                onMouseLeave={() => setHoverIndex(null)}
              >
                {/* Connecting line to next bar */}
                {idx < computed.length - 1 && (
                  <line
                    x1={x + colWidth}
                    y1={getY(item.end)}
                    x2={x + colSpacing}
                    y2={getY(item.end)}
                    stroke="#94A3B8"
                    strokeWidth="1"
                    strokeDasharray="2 2"
                  />
                )}

                {/* Waterfall Bar */}
                <rect
                  x={x}
                  y={y}
                  width={colWidth}
                  height={barHeight}
                  rx="4"
                  fill={barColor}
                  opacity={isHovered ? 0.85 : 1}
                  className="transition-opacity duration-150"
                />

                {/* Amount label above/below bar */}
                <text
                  x={x + colWidth / 2}
                  y={y - 8}
                  textAnchor="middle"
                  className="text-[11px] font-mono font-bold fill-slate-800"
                >
                  {item.isTotal
                    ? `$${(item.amount / 1000000).toFixed(1)}M`
                    : `${item.amount > 0 ? '+' : ''}$${(item.amount / 1000).toFixed(0)}k`}
                </text>

                {/* X axis step label */}
                <text
                  x={x + colWidth / 2}
                  y={height - 12}
                  textAnchor="middle"
                  className="text-[11px] font-medium fill-slate-700"
                >
                  {item.label}
                </text>
              </g>
            );
          })}
        </svg>

        {hoverIndex !== null && (
          <div
            className="absolute z-20 pointer-events-none bg-slate-900 text-white rounded-lg px-3 py-2 text-xs shadow-xl font-sans"
            style={{
              left: `${((padding.left + hoverIndex * colSpacing + colSpacing / 2) / width) * 100}%`,
              top: '5px',
              transform: 'translateX(-50%)',
            }}
          >
            <div className="font-semibold text-slate-200">{computed[hoverIndex].label}</div>
            <div className="font-mono text-emerald-400 font-bold">
              Impact: {computed[hoverIndex].amount >= 0 ? '+' : ''}$
              {(computed[hoverIndex].amount / 1000).toFixed(0)}k
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              Resulting Level: ${(computed[hoverIndex].end / 1000000).toFixed(2)}M
            </div>
          </div>
        )}
      </div>

      {/* Bottom Summary Strip */}
      <div className="pt-3 mt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500">
        <div className="truncate pr-2">
          <span className="text-slate-400 font-medium">Primary Growth Driver: </span>
          <strong className="text-slate-800">{topGrowthDriver?.label}</strong>
          <span className="text-emerald-600 font-semibold ml-1">
            (+${((topGrowthDriver?.amount || 0) / 1000).toFixed(0)}k)
          </span>
        </div>
        <div className="flex items-center gap-2 font-mono text-xs" title="Year-over-Year (YoY) Variance: Net revenue change between Current Year actual and Prior Year baseline">
          <span className="text-[11px] text-slate-500">Net YoY Variance (vs Prior Year Base):</span>
          <span
            className={`font-bold px-2 py-0.5 rounded border ${
              netDelta >= 0
                ? 'text-[#007041] bg-emerald-50 border-emerald-100'
                : 'text-red-700 bg-red-50 border-red-100'
            }`}
          >
            {netDelta >= 0 ? '+' : ''}${(netDelta / 1000).toFixed(0)}k Net YoY
          </span>
        </div>
      </div>
    </div>
  );
};
