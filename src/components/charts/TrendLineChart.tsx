/**
 * Acuity Brands Lighting - Responsive Trend Line Chart
 * Renders multiple series (e.g. Net Sales Actuals vs Target vs Prior Year/Forecast)
 * with interactive hover crosshairs, readable headers, and zero blank space.
 */

import React, { useState } from 'react';
import { VisualTooltip, VisualTooltipProps } from '../common/VisualTooltip';

export interface TrendPoint {
  label: string;
  actual?: number;
  target?: number;
  prior?: number;
  forecast?: number;
}

interface TrendLineChartProps {
  data: TrendPoint[];
  title?: string;
  subtitle?: string;
  height?: number;
  formatValue?: (val: number) => string;
  tooltip?: VisualTooltipProps;
  actionButton?: {
    label: string;
    onClick: () => void;
  };
}

export const TrendLineChart: React.FC<TrendLineChartProps> = ({
  data,
  title,
  subtitle,
  height = 260,
  formatValue = (val) => `$${(val / 1000).toFixed(0)}k`,
  tooltip,
  actionButton,
}) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs h-full flex items-center justify-center text-xs text-slate-400">
        No trend data available for current selection.
      </div>
    );
  }

  // Calculate scales
  const allValues: number[] = [];
  let sumActual = 0;
  let sumTarget = 0;
  let actualCount = 0;

  data.forEach((d) => {
    if (d.actual !== undefined) {
      allValues.push(d.actual);
      sumActual += d.actual;
      actualCount++;
    }
    if (d.target !== undefined) {
      allValues.push(d.target);
      sumTarget += d.target;
    }
    if (d.prior !== undefined) allValues.push(d.prior);
    if (d.forecast !== undefined) allValues.push(d.forecast);
  });

  const maxVal = Math.max(...allValues, 100) * 1.1;
  const minVal = 0;

  const padding = { top: 20, right: 30, bottom: 35, left: 60 };
  const width = 640;
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;

  const getX = (index: number) => {
    if (data.length <= 1) return padding.left + plotWidth / 2;
    return padding.left + (index / (data.length - 1)) * plotWidth;
  };

  const getY = (val: number) => {
    const ratio = (val - minVal) / (maxVal - minVal);
    return padding.top + plotHeight - ratio * plotHeight;
  };

  const createPath = (key: keyof TrendPoint) => {
    return data
      .map((d, i) => {
        const val = d[key];
        if (val === undefined || typeof val !== 'number') return '';
        const x = getX(i);
        const y = getY(val);
        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
      })
      .filter(Boolean)
      .join(' ');
  };

  const actualPath = createPath('actual');
  const targetPath = createPath('target');
  const priorPath = createPath('prior');
  const forecastPath = createPath('forecast');

  // Area under actuals
  let actualArea = '';
  if (actualPath) {
    const firstX = getX(0);
    const lastX = getX(data.length - 1);
    const bottomY = getY(0);
    actualArea = `${actualPath} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
  }

  const yTicks = [0, maxVal * 0.33, maxVal * 0.66, maxVal];

  // Performance calculations for bottom summary strip
  const attainmentPct = sumTarget > 0 ? (sumActual / sumTarget) * 100 : 100;
  const lastActual = data.filter((d) => d.actual !== undefined).slice(-1)[0]?.actual || 0;
  const prevActual = data.filter((d) => d.actual !== undefined).slice(-2)[0]?.actual || lastActual;
  const momPct = prevActual > 0 ? ((lastActual - prevActual) / prevActual) * 100 : 0;

  // Clean label formatter for X-axis without corruption
  const formatXLabel = (raw: string) => {
    if (!raw) return '';
    if (/^\d{4}-\d{2}$/.test(raw)) {
      const [year, month] = raw.split('-');
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const mIdx = parseInt(month, 10) - 1;
      return `${monthNames[mIdx] || month} '${year.slice(2)}`;
    }
    if (/^[A-Za-z]{3}\s+\d{4}$/.test(raw)) {
      const [m, y] = raw.split(' ');
      return `${m} '${y.slice(2)}`;
    }
    return raw;
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs h-full flex flex-col justify-between">
      {(title || subtitle) && (
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
            {/* Legend with readable font */}
            <div className="flex items-center gap-3.5 text-xs sm:text-sm font-semibold text-slate-600">
              {actualPath && (
                <div className="flex items-center gap-1.5" title="Actual invoiced net sales revenue">
                  <span className="w-3.5 h-1.5 bg-[#04BC6F] rounded-full" />
                  <span className="text-slate-800">Actuals</span>
                </div>
              )}
              {targetPath && (
                <div className="flex items-center gap-1.5" title="Approved commercial budget plan">
                  <span className="w-3.5 h-1.5 border-t-2 border-dashed border-[#5B6770]" />
                  <span className="text-slate-600">Target</span>
                </div>
              )}
              {priorPath && (
                <div className="flex items-center gap-1.5" title="Comparable sales in the same month of prior fiscal year">
                  <span className="w-3.5 h-1.5 border-t-2 border-dotted border-[#A3A3A3]" />
                  <span className="text-slate-500">Prior Year</span>
                </div>
              )}
              {forecastPath && (
                <div className="flex items-center gap-1.5" title="Saved commercial demand forecast baseline">
                  <span className="w-3.5 h-1.5 border-t-2 border-dashed border-[#4379A3]" />
                  <span className="text-[#4379A3]">Forecast</span>
                </div>
              )}
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
      )}

      <div className="relative w-full flex-1 flex items-center justify-center py-1">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-visible select-none"
        >
          <defs>
            <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#04BC6F" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#04BC6F" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines & Y-axis labels */}
          {yTicks.map((tick, idx) => {
            const y = getY(tick);
            return (
              <g key={idx}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke="#E2E8F0"
                  strokeDasharray="3 3"
                />
                <text
                  x={padding.left - 8}
                  y={y + 3}
                  textAnchor="end"
                  className="text-[11px] fill-slate-400 font-mono font-medium"
                >
                  {formatValue(tick)}
                </text>
              </g>
            );
          })}

          {/* Area fill for actuals */}
          {actualArea && <path d={actualArea} fill="url(#actualGradient)" />}

          {/* Target line */}
          {targetPath && (
            <path
              d={targetPath}
              fill="none"
              stroke="#5B6770"
              strokeWidth="2"
              strokeDasharray="4 4"
            />
          )}

          {/* Prior Year line */}
          {priorPath && (
            <path
              d={priorPath}
              fill="none"
              stroke="#A3A3A3"
              strokeWidth="1.75"
              strokeDasharray="3 3"
            />
          )}

          {/* Forecast line */}
          {forecastPath && (
            <path
              d={forecastPath}
              fill="none"
              stroke="#4379A3"
              strokeWidth="2"
              strokeDasharray="4 4"
            />
          )}

          {/* Actuals line */}
          {actualPath && (
            <path
              d={actualPath}
              fill="none"
              stroke="#04BC6F"
              strokeWidth="2.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Data points & X-axis labels */}
          {data.map((d, i) => {
            const x = getX(i);
            const isHovered = hoverIndex === i;

            // Show label at reasonable intervals so text never collides
            const step = data.length > 18 ? 2 : data.length > 12 ? 2 : 1;
            const showLabel = i % step === 0 || i === data.length - 1;

            return (
              <g key={i}>
                {/* Vertical hover guide line */}
                {isHovered && (
                  <line
                    x1={x}
                    y1={padding.top}
                    x2={x}
                    y2={padding.top + plotHeight}
                    stroke="#007041"
                    strokeWidth="1.5"
                    strokeDasharray="2 2"
                  />
                )}

                {/* Actual point marker */}
                {d.actual !== undefined && (
                  <circle
                    cx={x}
                    cy={getY(d.actual)}
                    r={isHovered ? 6 : 3.5}
                    fill="#04BC6F"
                    stroke="#FFFFFF"
                    strokeWidth="2"
                    className="transition-all duration-150 cursor-pointer"
                    onMouseEnter={() => setHoverIndex(i)}
                    onMouseLeave={() => setHoverIndex(null)}
                  />
                )}

                {/* X-axis tick & label */}
                {showLabel && (
                  <>
                    <line
                      x1={x}
                      y1={padding.top + plotHeight}
                      x2={x}
                      y2={padding.top + plotHeight + 4}
                      stroke="#CBD5E1"
                    />
                    <text
                      x={x}
                      y={height - 10}
                      textAnchor="middle"
                      className="text-[10.5px] fill-slate-500 font-mono font-medium"
                    >
                      {formatXLabel(d.label)}
                    </text>
                  </>
                )}
              </g>
            );
          })}
        </svg>

        {hoverIndex !== null && data[hoverIndex] && (
          <div
            className="absolute z-20 pointer-events-none bg-slate-900 text-white rounded-lg px-3 py-2 text-xs shadow-xl border border-slate-700 font-sans"
            style={{
              left: `${(getX(hoverIndex) / width) * 100}%`,
              top: '10px',
              transform: 'translateX(-50%)',
            }}
          >
            <div className="font-semibold border-b border-slate-700 pb-1 mb-1 text-slate-200">
              {formatXLabel(data[hoverIndex].label)} ({data[hoverIndex].label})
            </div>
            {data[hoverIndex].actual !== undefined && (
              <div className="flex items-center justify-between gap-4 text-[#04BC6F]">
                <span>Actual Sales:</span>
                <span className="font-mono font-bold">{formatValue(data[hoverIndex].actual!)}</span>
              </div>
            )}
            {data[hoverIndex].target !== undefined && (
              <div className="flex items-center justify-between gap-4 text-slate-300">
                <span>Plan Target:</span>
                <span className="font-mono">{formatValue(data[hoverIndex].target!)}</span>
              </div>
            )}
            {data[hoverIndex].prior !== undefined && (
              <div className="flex items-center justify-between gap-4 text-slate-400">
                <span>Prior Year:</span>
                <span className="font-mono">{formatValue(data[hoverIndex].prior!)}</span>
              </div>
            )}
            {data[hoverIndex].forecast !== undefined && (
              <div className="flex items-center justify-between gap-4 text-[#4379A3]">
                <span>Forecast:</span>
                <span className="font-mono">{formatValue(data[hoverIndex].forecast!)}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Summary Strip - Explaining MoM and Plan Attainment clearly */}
      <div className="pt-3 mt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500">
        <div className="flex items-center gap-2" title="Plan Attainment = (Cumulative Actual Net Sales / Cumulative Target Sales) * 100">
          <span className="text-slate-500 font-medium">Plan Attainment:</span>
          <span
            className={`font-mono font-bold px-2 py-0.5 rounded border ${
              attainmentPct >= 100
                ? 'text-[#007041] bg-emerald-50 border-emerald-100'
                : 'text-amber-800 bg-amber-50 border-amber-100'
            }`}
          >
            {attainmentPct.toFixed(1)}% of Budget Target (Actual ÷ Target)
          </span>
        </div>
        <div
          className="flex items-center gap-2 font-mono text-xs"
          title="Month-over-Month (MoM): Percentage growth compared to previous month's actual sales"
        >
          <span className="text-slate-500">Latest Month Actual:</span>
          <span className="font-bold text-slate-900">{formatValue(lastActual)}</span>
          <span
            className={`font-semibold inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] ${
              momPct >= 0 ? 'text-[#007041] bg-emerald-50' : 'text-red-600 bg-red-50'
            }`}
          >
            {momPct >= 0 ? '▲ +' : '▼ '}{momPct.toFixed(1)}% MoM (Month-over-Month change)
          </span>
        </div>
      </div>
    </div>
  );
};
