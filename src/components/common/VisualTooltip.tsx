/**
 * Acuity Brands Lighting - Standardized Visual Info Tooltip (ⓘ)
 * Provides concise business definitions and high-level calculation logic (numerator/denominator)
 * tailored to Acuity Brands Lighting B2B manufacturing context.
 */

import React, { useState, useRef, useEffect } from 'react';
import { Info, X } from 'lucide-react';

export interface VisualTooltipProps {
  title?: string;
  description?: string;
  businessDefinition?: string;
  attributesUsed?: string;
  calculationLogic?: string;
  calculation?: string;
  formula?: string;
  filtersConditions?: string;
  interpretation?: string;
  benchmark?: string;
  source?: string;
  updateFrequency?: string;
  caveats?: string;
  className?: string;
  align?: 'left' | 'right' | 'center';
}

export const VisualTooltip: React.FC<VisualTooltipProps> = ({
  title,
  description,
  businessDefinition,
  attributesUsed,
  calculationLogic,
  calculation,
  formula,
  filtersConditions,
  interpretation,
  benchmark,
  source,
  updateFrequency,
  caveats,
  className = '',
  align = 'right',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getPositionClasses = () => {
    switch (align) {
      case 'left':
        return 'left-0';
      case 'center':
        return 'left-1/2 -translate-x-1/2';
      case 'right':
      default:
        return 'right-0';
    }
  };

  const defText = businessDefinition || description || formula || '';
  const calcText = calculationLogic || calculation || (description && formula ? formula : undefined);
  const attrText = attributesUsed || source;
  const interpText = interpretation || benchmark;

  return (
    <div ref={containerRef} className={`relative inline-flex items-center ${className}`}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        className="text-slate-400 hover:text-[#007041] p-0.5 rounded-full transition-colors focus:outline-hidden inline-flex items-center justify-center cursor-pointer shrink-0"
        title="View metric definition, source attributes, and calculation logic"
        aria-label="Visual Information"
      >
        <Info className="w-4 h-4 text-slate-400 hover:text-[#007041] transition-colors" />
      </button>

      {isOpen && (
        <div
          onClick={(e) => e.stopPropagation()}
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => setIsOpen(false)}
          className={`absolute top-full mt-1.5 z-50 w-72 sm:w-84 max-w-[90vw] max-h-[80vh] overflow-y-auto p-3.5 bg-slate-900 text-white text-xs rounded-xl shadow-2xl border border-slate-700/80 transition-all font-sans ${getPositionClasses()}`}
        >
          {title && (
            <div className="font-bold text-slate-100 pb-1.5 mb-2 border-b border-slate-800 flex items-center justify-between text-[11.5px]">
              <span className="flex items-center gap-1.5 text-[#04BC6F]">
                <Info className="w-3.5 h-3.5 shrink-0" />
                <span>{title}</span>
              </span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white sm:hidden"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          <div className="space-y-2.5 text-[11px] leading-relaxed">
            {/* 1. Business Definition */}
            {defText && (
              <div>
                <span className="text-slate-400 font-semibold block text-[10px] uppercase tracking-wider">
                  Business Definition:
                </span>
                <p className="text-slate-200 mt-0.5">{defText}</p>
              </div>
            )}

            {/* 2. Attributes Used */}
            {attrText && (
              <div className="pt-1.5 border-t border-slate-800/80">
                <span className="text-slate-400 font-semibold block text-[10px] uppercase tracking-wider">
                  Attributes Used:
                </span>
                <p className="font-mono text-[10px] text-slate-300 mt-0.5 bg-slate-800/60 px-2 py-1 rounded">
                  {attrText}
                </p>
              </div>
            )}

            {/* 3. Calculation Logic */}
            {calcText && (
              <div className="pt-1.5 border-t border-slate-800/80">
                <span className="text-slate-400 font-semibold block text-[10px] uppercase tracking-wider">
                  Calculation Logic:
                </span>
                <p className="font-mono text-[10px] text-emerald-400 mt-0.5 bg-slate-800/90 px-2 py-1 rounded">
                  {calcText}
                </p>
              </div>
            )}

            {/* 4. Filters & Conditions */}
            {filtersConditions && (
              <div className="pt-1.5 border-t border-slate-800/80">
                <span className="text-slate-400 font-semibold block text-[10px] uppercase tracking-wider">
                  Filters & Conditions:
                </span>
                <p className="text-slate-300 mt-0.5 text-[10.5px]">{filtersConditions}</p>
              </div>
            )}

            {/* 5. Business Interpretation */}
            {interpText && (
              <div className="pt-1.5 border-t border-slate-800/80">
                <span className="text-slate-400 font-semibold block text-[10px] uppercase tracking-wider">
                  Interpretation & Target:
                </span>
                <p className="text-slate-300 mt-0.5 text-[10.5px]">{interpText}</p>
              </div>
            )}

            {updateFrequency && (
              <div className="text-[10px] text-slate-400 flex items-center gap-1 pt-1">
                <span className="font-semibold text-slate-400">Sync Cadence:</span>
                <span>{updateFrequency}</span>
              </div>
            )}

            {caveats && (
              <div className="pt-1 text-[10px] text-amber-300/85 border-t border-slate-800/80 mt-1 italic">
                * {caveats}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
