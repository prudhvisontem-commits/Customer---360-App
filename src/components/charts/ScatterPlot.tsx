/**
 * Acuity Brands Lighting - Revenue vs Gross Margin % Scatter Plot
 * Displays customer portfolio distribution across commercial quadrants:
 * Stars (High Rev / High Margin), Volume Drivers, Margin Protectors, Underperformers.
 */

import React, { useState } from 'react';
import { VisualTooltip, VisualTooltipProps } from '../common/VisualTooltip';

export interface ScatterPoint {
  id: string;
  name: string;
  revenue: number; // X axis ($)
  marginPct: number; // Y axis (%)
  tier: string;
  segment: string;
}

interface ScatterPlotProps {
  data: ScatterPoint[];
  title?: string;
  subtitle?: string;
  height?: number;
  onPointClick?: (id: string) => void;
  tooltip?: VisualTooltipProps;
  actionButton?: {
    label: string;
    onClick: () => void;
  };
}

export const ScatterPlot: React.FC<ScatterPlotProps> = ({
  data,
  title = 'Customer Revenue vs Gross Margin % Positioning',
  subtitle = 'Portfolio quadrant analysis: Stars, Volume Drivers, Margin Protectors, and At-Risk Accounts',
  height = 260,
  onPointClick,
  tooltip,
  actionButton,
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<ScatterPoint | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs h-full flex items-center justify-center text-xs text-slate-400">
        No data points available.
      </div>
    );
  }

  const maxRev = Math.max(...data.map((d) => d.revenue), 1000000) * 1.1;
  const minMargin = 20;
  const maxMargin = 55;

  const width = 640;
  const padding = { top: 30, right: 30, bottom: 40, left: 55 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;

  const getX = (rev: number) => {
    return padding.left + (rev / maxRev) * plotWidth;
  };

  const getY = (margin: number) => {
    const clamped = Math.max(minMargin, Math.min(maxMargin, margin));
    const ratio = (clamped - minMargin) / (maxMargin - minMargin);
    return padding.top + plotHeight - ratio * plotHeight;
  };

  // Quadrant dividing thresholds
  const midRev = maxRev * 0.45;
  const targetMargin = 40.0;

  // Star Quadrant Accounts
  const starAccounts = data.filter((d) => d.revenue >= midRev && d.marginPct >= targetMargin);
  const totalRev = data.reduce((sum, d) => sum + d.revenue, 0);
  const starRev = starAccounts.reduce((sum, d) => sum + d.revenue, 0);
  const starRevPct = totalRev > 0 ? (starRev / totalRev) * 100 : 0;

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
            <span className="flex items-center gap-1.5" title="Strategic Platinum Tier">
              <span className="w-2.5 h-2.5 rounded-full bg-[#04BC6F]" /> Strategic
            </span>
            <span className="flex items-center gap-1.5" title="Premier Gold Tier">
              <span className="w-2.5 h-2.5 rounded-full bg-[#4379A3]" /> Premier
            </span>
            <span className="flex items-center gap-1.5" title="Core Silver / Regional Tier">
              <span className="w-2.5 h-2.5 rounded-full bg-[#5B6770]" /> Core
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
          {/* Top Right: High Rev / High Margin (Stars) */}
          <rect
            x={getX(midRev)}
            y={padding.top}
            width={width - padding.right - getX(midRev)}
            height={getY(targetMargin) - padding.top}
            fill="#04BC6F"
            fillOpacity="0.05"
          />
          <text
            x={width - padding.right - 10}
            y={padding.top + 16}
            textAnchor="end"
            className="text-[10px] font-bold fill-[#007041]/70 uppercase tracking-wider"
          >
            ★ Stars (Growth & Margin)
          </text>

          {/* Bottom Right: High Rev / Lower Margin (Volume Drivers) */}
          <text
            x={width - padding.right - 10}
            y={padding.top + plotHeight - 10}
            textAnchor="end"
            className="text-[10px] font-bold fill-slate-400 uppercase tracking-wider"
          >
            Volume Drivers
          </text>

          {/* Top Left: Lower Rev / High Margin (Niche Specialists) */}
          <text
            x={padding.left + 10}
            y={padding.top + 16}
            textAnchor="start"
            className="text-[10px] font-bold fill-[#4379A3]/70 uppercase tracking-wider"
          >
            Margin Protectors (Controls/Spec)
          </text>

          {/* Quadrant divider lines */}
          <line
            x1={getX(midRev)}
            y1={padding.top}
            x2={getX(midRev)}
            y2={padding.top + plotHeight}
            stroke="#CBD5E1"
            strokeDasharray="3 3"
          />
          <line
            x1={padding.left}
            y1={getY(targetMargin)}
            x2={width - padding.right}
            y2={getY(targetMargin)}
            stroke="#CBD5E1"
            strokeDasharray="3 3"
          />

          {/* X and Y axes */}
          <line
            x1={padding.left}
            y1={padding.top + plotHeight}
            x2={width - padding.right}
            y2={padding.top + plotHeight}
            stroke="#94A3B8"
            strokeWidth="1.5"
          />
          <line
            x1={padding.left}
            y1={padding.top}
            x2={padding.left}
            y2={padding.top + plotHeight}
            stroke="#94A3B8"
            strokeWidth="1.5"
          />

          {/* Y ticks (Margin %) */}
          {[25, 30, 35, 40, 45, 50].map((tick) => {
            const y = getY(tick);
            return (
              <g key={tick}>
                <line x1={padding.left - 4} y1={y} x2={padding.left} y2={y} stroke="#64748B" />
                <text
                  x={padding.left - 8}
                  y={y + 3}
                  textAnchor="end"
                  className="text-[10.5px] font-mono fill-slate-500 font-medium"
                >
                  {tick}%
                </text>
              </g>
            );
          })}

          {/* X ticks (Revenue $) */}
          {[0, maxRev * 0.25, maxRev * 0.5, maxRev * 0.75, maxRev].map((tick, idx) => {
            const x = getX(tick);
            return (
              <g key={idx}>
                <line
                  x1={x}
                  y1={padding.top + plotHeight}
                  x2={x}
                  y2={padding.top + plotHeight + 4}
                  stroke="#64748B"
                />
                <text
                  x={x}
                  y={height - 10}
                  textAnchor="middle"
                  className="text-[10.5px] font-mono fill-slate-500 font-medium"
                >
                  ${(tick / 1000000).toFixed(1)}M
                </text>
              </g>
            );
          })}

          {/* Scatter Data Points */}
          {data.map((p) => {
            const x = getX(p.revenue);
            const y = getY(p.marginPct);
            const isHovered = hoveredPoint?.id === p.id;

            let color = '#5B6770';
            if (p.tier === 'Strategic Platinum') color = '#04BC6F';
            else if (p.tier === 'Premier Gold') color = '#4379A3';
            else if (p.marginPct < 32) color = '#DC2626';

            return (
              <circle
                key={p.id}
                cx={x}
                cy={y}
                r={isHovered ? 7.5 : p.tier === 'Strategic Platinum' ? 5.5 : 4}
                fill={color}
                stroke="#FFFFFF"
                strokeWidth="1.5"
                opacity={isHovered ? 1 : 0.85}
                className="cursor-pointer transition-all duration-150"
                onMouseEnter={() => setHoveredPoint(p)}
                onMouseLeave={() => setHoveredPoint(null)}
                onClick={() => onPointClick?.(p.id)}
              />
            );
          })}
        </svg>

        {/* Hover Tooltip */}
        {hoveredPoint && (
          <div
            className="absolute z-30 pointer-events-none bg-slate-900 text-white rounded-lg p-2.5 text-xs shadow-xl border border-slate-700 font-sans"
            style={{
              left: `${(getX(hoveredPoint.revenue) / width) * 100}%`,
              top: `${(getY(hoveredPoint.marginPct) / height) * 100}%`,
              transform: 'translate(-50%, -125%)',
            }}
          >
            <div className="font-bold text-slate-100">{hoveredPoint.name}</div>
            <div className="text-[10.5px] text-slate-400">
              {hoveredPoint.segment} • {hoveredPoint.tier}
            </div>
            <div className="flex items-center justify-between gap-4 mt-1 font-mono">
              <span className="text-slate-300">Revenue:</span>
              <span className="font-bold text-emerald-400">
                ${(hoveredPoint.revenue / 1000).toFixed(0)}k
              </span>
            </div>
            <div className="flex items-center justify-between gap-4 font-mono">
              <span className="text-slate-300">Gross Margin:</span>
              <span className="font-bold text-sky-400">{hoveredPoint.marginPct.toFixed(1)}%</span>
            </div>
            <div className="mt-1 text-[10.5px] text-[#04BC6F] font-semibold italic">
              Click to view customer 360 profile
            </div>
          </div>
        )}
      </div>

      {/* Bottom Summary Strip */}
      <div className="pt-3 mt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500">
        <div className="truncate pr-2">
          <span className="text-slate-400 font-medium">Quadrant Concentration: </span>
          <strong className="text-slate-800">{starAccounts.length} Star Accounts</strong>
          <span className="text-slate-400 ml-1">(High Volume & Margin &gt;40%)</span>
        </div>
        <div className="flex items-center gap-2 font-mono font-semibold text-slate-700 shrink-0">
          <span className="text-[11px] text-slate-400">Stars Revenue Share:</span>
          <span className="font-bold text-[#007041] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
            {starRevPct.toFixed(0)}% of Portfolio
          </span>
        </div>
      </div>
    </div>
  );
};
