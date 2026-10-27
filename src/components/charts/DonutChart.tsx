/**
 * Acuity Brands Lighting - Responsive Pie / Donut Chart
 * Prominently sized pie chart fitting the allocated space with zero horizontal bars,
 * rich center readout, and clean inline dot legend.
 */

import React, { useState } from 'react';
import { VisualTooltip, VisualTooltipProps } from '../common/VisualTooltip';

export interface DonutSegment {
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  data: DonutSegment[];
  title?: string;
  subtitle?: string;
  centerLabel?: string;
  centerValue?: string;
  size?: number;
  tooltip?: VisualTooltipProps;
  actionButton?: {
    label: string;
    onClick: () => void;
  };
}

export const DonutChart: React.FC<DonutChartProps> = ({
  data,
  title,
  subtitle,
  centerLabel,
  centerValue,
  size = 260,
  tooltip,
  actionButton,
}) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const total = data.reduce((acc, d) => acc + d.value, 0);
  if (total === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs h-full flex items-center justify-center text-xs text-slate-400">
        No distribution data.
      </div>
    );
  }

  const radius = size / 2;
  const strokeWidth = 38;
  const innerRadius = radius - strokeWidth;
  const circumference = 2 * Math.PI * innerRadius;

  let accumulatedAngle = 0;

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs h-full flex flex-col justify-between">
      {/* Header with prominent readable font sizes */}
      {(title || subtitle) && (
        <div className="mb-2 flex items-start justify-between gap-2">
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

          {actionButton && (
            <button
              type="button"
              onClick={actionButton.onClick}
              className="text-xs font-bold text-[#007041] hover:underline flex items-center gap-1 cursor-pointer transition-colors shrink-0 pt-0.5"
            >
              <span>{actionButton.label}</span>
              <span aria-hidden="true">&rarr;</span>
            </button>
          )}
        </div>
      )}

      {/* Main Chart Body: Prominent enlarged Pie Chart centered in allocated space with NO horizontal bars */}
      <div className="flex-1 flex flex-col items-center justify-center py-2">
        {/* Enlarged Pie/Donut graphic */}
        <div className="relative shrink-0 mx-auto" style={{ width: size, height: size }}>
          <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            className="rotate-[-90deg] drop-shadow-sm select-none"
          >
            {data.map((seg, idx) => {
              const pct = seg.value / total;
              const dashLength = pct * circumference;
              const dashOffset = -accumulatedAngle * circumference;
              accumulatedAngle += pct;
              const isHovered = hoverIndex === idx;

              return (
                <circle
                  key={idx}
                  cx={radius}
                  cy={radius}
                  r={innerRadius}
                  fill="transparent"
                  stroke={seg.color}
                  strokeWidth={isHovered ? strokeWidth + 6 : strokeWidth}
                  strokeDasharray={`${dashLength} ${circumference - dashLength}`}
                  strokeDashoffset={dashOffset}
                  className="transition-all duration-200 cursor-pointer"
                  onMouseEnter={() => setHoverIndex(idx)}
                  onMouseLeave={() => setHoverIndex(null)}
                />
              );
            })}
          </svg>

          {/* Center Readout */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
            {hoverIndex !== null ? (
              <>
                <span className="text-xs text-slate-500 font-bold truncate max-w-[140px]">
                  {data[hoverIndex].label}
                </span>
                <span className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900">
                  {((data[hoverIndex].value / total) * 100).toFixed(0)}%
                </span>
                <span className="text-xs text-slate-500 font-mono font-medium">
                  ${(data[hoverIndex].value / 1000).toFixed(0)}k
                </span>
              </>
            ) : (
              <>
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                  {centerLabel || 'Total'}
                </span>
                <span className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900">
                  {centerValue || `$${(total / 1000000).toFixed(1)}M`}
                </span>
                <span className="text-xs text-slate-400 font-medium">100% Total</span>
              </>
            )}
          </div>
        </div>

        {/* Minimal inline dot legend (no horizontal bars) */}
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 mt-4 text-xs">
          {data.map((seg, idx) => {
            const pct = ((seg.value / total) * 100).toFixed(0);
            const isHovered = hoverIndex === idx;
            return (
              <div
                key={idx}
                className={`flex items-center gap-1.5 cursor-pointer px-1 py-0.5 rounded transition-colors ${
                  isHovered ? 'bg-slate-100 font-bold text-slate-900' : 'text-slate-600 hover:text-slate-900'
                }`}
                onMouseEnter={() => setHoverIndex(idx)}
                onMouseLeave={() => setHoverIndex(null)}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0 shadow-2xs"
                  style={{ backgroundColor: seg.color }}
                />
                <span className="text-xs">{seg.label}</span>
                <span className="font-mono text-slate-400 text-[11px]">({pct}%)</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
