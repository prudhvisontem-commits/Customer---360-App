/**
 * Acuity Brands Lighting - Executive KPI Card
 * Features precise metric reporting, period context, variance benchmarking,
 * correct semantic coloring (increases in green, decreases in red),
 * and standard Lucide Info visual definition tooltip.
 */

import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { VisualTooltip } from './common/VisualTooltip';

interface KpiCardProps {
  label: string;
  value: string;
  period: string;
  benchmarkLabel?: string;
  benchmarkValue?: string;
  variance?: string;
  variancePct?: number;
  invertVariance?: boolean;
  status?: 'positive' | 'neutral' | 'negative';
  metricKey?: string;
  onClick?: () => void;
  subtext?: string;
  tooltipDefinition?: string;
  tooltipCalculation?: string;
  businessDefinition?: string;
  attributesUsed?: string;
  calculationLogic?: string;
  filtersConditions?: string;
  interpretation?: string;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  label,
  value,
  period,
  benchmarkLabel,
  benchmarkValue,
  variance,
  variancePct,
  invertVariance = false,
  status = 'neutral',
  metricKey,
  onClick,
  subtext,
  tooltipDefinition,
  tooltipCalculation,
  businessDefinition,
  attributesUsed,
  calculationLogic,
  filtersConditions,
  interpretation,
}) => {
  // Correctly highlight increases in green and decreases in red
  const getVarianceColor = () => {
    if (variancePct !== undefined) {
      if (invertVariance) {
        if (variancePct > 0) return 'text-[#DC2626] bg-[#DC2626]/10 border-[#DC2626]/30'; // Cost/AR increase is bad (red)
        if (variancePct < 0) return 'text-[#007041] bg-[#04BC6F]/10 border-[#04BC6F]/30'; // Cost/AR reduction is good (green)
        return 'text-[#5B6770] bg-[#5B6770]/10 border-[#5B6770]/30';
      }
      if (variancePct > 0) return 'text-[#007041] bg-[#04BC6F]/10 border-[#04BC6F]/30'; // Increase is green
      if (variancePct < 0) return 'text-[#DC2626] bg-[#DC2626]/10 border-[#DC2626]/30'; // Decrease is red
      return 'text-[#5B6770] bg-[#5B6770]/10 border-[#5B6770]/30';
    }
    switch (status) {
      case 'positive':
        return 'text-[#007041] bg-[#04BC6F]/10 border-[#04BC6F]/30';
      case 'negative':
        return 'text-[#DC2626] bg-[#DC2626]/10 border-[#DC2626]/30';
      case 'neutral':
      default:
        return 'text-[#5B6770] bg-[#5B6770]/10 border-[#5B6770]/30';
    }
  };

  const getVarianceIcon = () => {
    if (variancePct !== undefined) {
      if (invertVariance) {
        if (variancePct > 0) return <ArrowUpRight className="w-3.5 h-3.5 text-[#DC2626]" />;
        if (variancePct < 0) return <ArrowDownRight className="w-3.5 h-3.5 text-[#007041]" />;
      } else {
        if (variancePct > 0) return <ArrowUpRight className="w-3.5 h-3.5 text-[#007041]" />;
        if (variancePct < 0) return <ArrowDownRight className="w-3.5 h-3.5 text-[#DC2626]" />;
      }
      return <Minus className="w-3.5 h-3.5 text-slate-500" />;
    }
    return null;
  };

  return (
    <div
      onClick={onClick}
      className={`relative bg-white rounded-xl border border-slate-200/80 p-3.5 shadow-xs transition-all duration-200 flex flex-col justify-between ${
        onClick ? 'cursor-pointer hover:border-[#04BC6F] hover:shadow-md' : ''
      }`}
    >
      <div>
        <div className="flex items-start justify-between gap-1.5 mb-1.5">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 truncate" title={label}>
            {label}
          </span>
          <VisualTooltip
            title={label}
            businessDefinition={businessDefinition}
            attributesUsed={attributesUsed}
            calculationLogic={calculationLogic}
            filtersConditions={filtersConditions}
            interpretation={interpretation}
            description={tooltipDefinition || `Governed enterprise measure for ${label} across Acuity Brands Lighting channels.`}
            calculation={tooltipCalculation || `Numerator: Direct ledger actuals | Denominator: Reporting period basis`}
            benchmark={benchmarkValue ? `${benchmarkLabel || 'Benchmark'}: ${benchmarkValue}` : undefined}
          />
        </div>

        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-mono">
            {value}
          </span>
        </div>
      </div>

      <div>
        <div className="flex flex-wrap items-center justify-between gap-1.5 pt-2 border-t border-slate-100 text-[10.5px]">
          <div className="text-slate-500 font-medium truncate">
            {period}
          </div>

          {variancePct !== undefined && (
            <div className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded font-bold text-[11px] border ${getVarianceColor()}`}>
              {getVarianceIcon()}
              <span>
                {variancePct > 0 ? `+${variancePct.toFixed(1)}%` : `${variancePct.toFixed(1)}%`}
              </span>
            </div>
          )}
        </div>

        {(benchmarkLabel || subtext) && (
          <div className="mt-1 text-[10.5px] text-slate-500 flex items-center justify-between truncate">
            <span className="truncate">{benchmarkLabel || 'Context'}</span>
            <span className="font-semibold text-slate-700 font-mono ml-1 shrink-0">{benchmarkValue || subtext}</span>
          </div>
        )}
      </div>
    </div>
  );
};
