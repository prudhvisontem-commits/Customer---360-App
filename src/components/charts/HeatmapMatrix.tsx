/**
 * Acuity Brands Lighting - Product Family Penetration Heatmap
 * Visualizes customer accounts or segments across Acuity luminaire and controls families.
 */

import React from 'react';
import { ProductFamily } from '../../data/types';
import { VisualTooltip, VisualTooltipProps } from '../common/VisualTooltip';

export interface HeatmapRow {
  rowLabel: string;
  rowId: string;
  sublabel?: string;
  values: Record<ProductFamily, number>; // penetration amount in $
}

interface HeatmapMatrixProps {
  rows: HeatmapRow[];
  columns: ProductFamily[];
  title?: string;
  subtitle?: string;
  onRowClick?: (rowId: string) => void;
  tooltip?: VisualTooltipProps;
  actionButton?: {
    label: string;
    onClick: () => void;
  };
}

export const HeatmapMatrix: React.FC<HeatmapMatrixProps> = ({
  rows,
  columns,
  title = 'Product Family Penetration Heatmap',
  subtitle = 'Spend concentration across lighting luminaires, architectural brands, and nLight® controls',
  onRowClick,
  tooltip,
  actionButton,
}) => {
  // Find global max value for color intensity scaling
  let maxVal = 1000;
  rows.forEach((r) => {
    columns.forEach((col) => {
      const v = r.values[col] || 0;
      if (v > maxVal) maxVal = v;
    });
  });

  const getCellColor = (val: number) => {
    if (val === 0) return 'bg-slate-50 text-slate-300';
    const ratio = Math.min(1, val / maxVal);
    if (ratio < 0.2) return 'bg-emerald-50 text-emerald-900 border border-emerald-100 font-medium';
    if (ratio < 0.45) return 'bg-emerald-100 text-emerald-950 font-semibold';
    if (ratio < 0.75) return 'bg-emerald-300 text-emerald-950 font-bold';
    return 'bg-[#007041] text-white font-bold';
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs overflow-hidden">
      <div className="mb-3 flex items-start justify-between gap-2">
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

      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] text-slate-600 font-semibold">
              <th className="py-2.5 px-3 sticky left-0 bg-slate-50 z-10 w-48">Account / Segment</th>
              {columns.map((col) => (
                <th key={col} className="py-2 px-2 text-center truncate max-w-[90px]" title={col}>
                  {col.replace(' Lighting®', '').replace('® Controls', '').replace('™', '').replace('®', '')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row) => (
              <tr
                key={row.rowId}
                className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                onClick={() => onRowClick?.(row.rowId)}
              >
                <td className="py-2.5 px-3 sticky left-0 bg-white group-hover:bg-slate-50/80 font-medium text-slate-800 z-10 truncate max-w-[200px]">
                  <div className="truncate font-bold text-xs sm:text-[13px] text-slate-900">{row.rowLabel}</div>
                  {row.sublabel && <div className="text-[11px] text-slate-400 truncate">{row.sublabel}</div>}
                </td>

                {columns.map((col) => {
                  const val = row.values[col] || 0;
                  return (
                    <td key={col} className="py-2 px-1 text-center">
                      <div
                        className={`py-1.5 px-1 rounded-md text-[11px] font-mono transition-transform duration-100 group-hover:scale-102 ${getCellColor(
                          val
                        )}`}
                        title={`${row.rowLabel} • ${col}: $${(val / 1000).toFixed(0)}k`}
                      >
                        {val === 0 ? '—' : `$${(val / 1000).toFixed(0)}k`}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
        <span className="font-medium">Click any row to drill into customer 360 profile</span>
        <div className="flex items-center gap-1.5 font-medium">
          <span>Low</span>
          <span className="w-4 h-3.5 bg-emerald-50 rounded-xs border border-emerald-100" />
          <span className="w-4 h-3.5 bg-emerald-100 rounded-xs" />
          <span className="w-4 h-3.5 bg-emerald-300 rounded-xs" />
          <span className="w-4 h-3.5 bg-[#007041] rounded-xs" />
          <span>High Penetration</span>
        </div>
      </div>
    </div>
  );
};
