/**
 * Acuity Brands Lighting - Leadership Intelligence View
 * Executive C-suite decision support monitoring forecast reliability, cohort retention,
 * concentration risk, and Base / Upside / Downside scenario modeling.
 */

import React, { useState } from 'react';
import {
  Briefcase,
  Sparkles,
  Sliders,
  TrendingUp,
  ShieldCheck,
  ShieldAlert,
  Percent,
  Layers,
  ArrowRight
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { KpiCard } from '../components/KpiCard';
import { TrendLineChart } from '../components/charts/TrendLineChart';
import { DonutChart } from '../components/charts/DonutChart';
import { SortableTable, ColumnDef } from '../components/tables/SortableTable';
import { VisualTooltip } from '../components/common/VisualTooltip';
import { Recommendation } from '../data/types';
import { buildMonthlySalesTrend, KPI_METRIC_DEFINITIONS } from '../data/metricsEngine';

export const LeadershipIntelligenceView: React.FC = () => {
  const {
    dataset,
    filteredData,
    executiveKPIs,
    selectCustomer,
    openAiWithPrompt,
  } = useData();

  const [selectedScenario, setSelectedScenario] = useState<'Base' | 'Upside' | 'Downside'>('Base');

  const monthlyTrendData = buildMonthlySalesTrend(filteredData.filteredSnapshots, dataset.monthlySnapshots);

  // Forecast accuracy calculation (WAPE = 1 - (sum(|Actual - Forecast|) / sum(Actual)))
  let sumDiff = 0;
  let sumActual = 0;
  filteredData.filteredSnapshots.forEach((s) => {
    sumDiff += Math.abs(s.netSales - s.savedForecastBase);
    sumActual += s.netSales;
  });
  const forecastAccuracyWape = sumActual > 0 ? (1 - sumDiff / sumActual) * 100 : 91.2;

  // Forecast Bias = ((sum(Forecast) - sum(Actual)) / sum(Actual)) * 100
  const sumForecast = filteredData.filteredSnapshots.reduce((sum, s) => sum + s.savedForecastBase, 0);
  const forecastBiasPct = sumActual > 0 ? ((sumForecast - sumActual) / sumActual) * 100 : 1.4;

  // Revenue Concentration (Top 10 accounts share)
  const accSalesMap: Record<string, number> = {};
  filteredData.filteredOrders.forEach((ol) => {
    accSalesMap[ol.accountId] = (accSalesMap[ol.accountId] || 0) + ol.lineTotal;
  });
  const sortedAccSales = Object.values(accSalesMap).sort((a, b) => b - a);
  const top10Sales = sortedAccSales.slice(0, 10).reduce((sum, v) => sum + v, 0);
  const totalSales = sortedAccSales.reduce((sum, v) => sum + v, 0);
  const concentrationTop10Pct = totalSales > 0 ? (top10Sales / totalSales) * 100 : 42.8;

  // Customer Health Distribution Donut
  const healthBands = { Healthy: 0, Stable: 0, 'At Risk': 0, Critical: 0 };
  filteredData.filteredHealth.forEach((h) => {
    healthBands[h.band]++;
  });

  const healthDonut = [
    { label: 'Healthy (Score > 85)', value: healthBands.Healthy, color: '#04BC6F' },
    { label: 'Stable (Score 70-84)', value: healthBands.Stable, color: '#4379A3' },
    { label: 'At Risk (Score 50-69)', value: healthBands['At Risk'], color: '#F59E0B' },
    { label: 'Critical (Score < 50)', value: healthBands.Critical, color: '#DC2626' },
  ];

  // At-Risk Revenue
  const atRiskAccounts = filteredData.filteredHealth.filter(
    (h) => h.band === 'At Risk' || h.band === 'Critical'
  );
  const atRiskRevenue = atRiskAccounts.reduce((sum, h) => {
    return sum + (accSalesMap[h.accountId] || 0);
  }, 0);

  // Scenario Multipliers
  const scenarioMultiplier = selectedScenario === 'Upside' ? 1.08 : selectedScenario === 'Downside' ? 0.92 : 1.0;
  const projectedRevenue = Math.round(sumForecast * scenarioMultiplier);
  const projectedMargin = selectedScenario === 'Upside' ? 42.4 : selectedScenario === 'Downside' ? 39.8 : 41.2;

  // Recommendation Table Columns (Executive Action Register)
  const recColumns: ColumnDef<Recommendation>[] = [
    {
      key: 'signal',
      header: 'Detected Signal & Opportunity',
      render: (r) => (
        <div>
          <div className="font-bold text-slate-900 hover:text-[#007041] transition-colors">{r.signal}</div>
          <div className="text-[11px] text-slate-500">{r.evidence}</div>
        </div>
      ),
      sortValue: (r) => r.signal,
      width: '30%',
    },
    {
      key: 'accountName',
      header: 'Account / Entity',
      render: (r) => (
        <span className="font-semibold text-slate-800 text-xs">{r.accountName}</span>
      ),
      sortValue: (r) => r.accountName,
      width: '18%',
    },
    {
      key: 'persona',
      header: 'Domain',
      render: (r) => (
        <span className="px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-slate-100 text-slate-700">
          {r.persona}
        </span>
      ),
      sortValue: (r) => r.persona,
      width: '12%',
    },
    {
      key: 'priority',
      header: 'Priority',
      render: (r) => {
        let badge = 'bg-slate-100 text-slate-700';
        if (r.priority === 'Urgent') badge = 'bg-red-100 text-red-800 font-bold';
        else if (r.priority === 'High') badge = 'bg-amber-100 text-amber-800 font-semibold';
        return <span className={`px-2 py-0.5 rounded text-[11px] ${badge}`}>{r.priority}</span>;
      },
      sortValue: (r) => (r.priority === 'Urgent' ? 3 : r.priority === 'High' ? 2 : 1),
      width: '10%',
    },
    {
      key: 'potentialImpactUsd',
      header: 'Est. Financial Impact',
      render: (r) => (
        <div className="text-right font-mono font-bold text-slate-900">
          ${(r.potentialImpactUsd / 1000).toFixed(0)}k
        </div>
      ),
      sortValue: (r) => r.potentialImpactUsd,
      align: 'right',
      width: '14%',
    },
    {
      key: 'recommendedAction',
      header: 'Executive Prescriptive Mandate',
      render: (r) => (
        <div className="text-[11px] text-slate-600 leading-tight">
          {r.recommendedAction}
        </div>
      ),
      width: '26%',
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs">
        <div>
          <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-[#5B6770]" />
            Enterprise Leadership & Strategic Forecasting Intelligence
          </h1>
          <p className="text-xs text-slate-500">
            Portfolio retention cohorts, forecast reliability (WAPE), revenue concentration, and scenario planning.
          </p>
        </div>

        <button
          onClick={() =>
            openAiWithPrompt(
              'Evaluate our commercial forecast accuracy and summarize the downside scenario risks if major pending nLight projects slip into next quarter.'
            )
          }
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-bold shadow-xs hover:bg-slate-800 transition-all shrink-0"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#04BC6F]" />
          <span>Executive Scenario Briefing</span>
        </button>
      </div>

      {/* Leadership KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <KpiCard
          label={KPI_METRIC_DEFINITIONS.netSales.label}
          value={executiveKPIs.netSales.formatted}
          period={executiveKPIs.netSales.period}
          benchmarkLabel="Approved Target"
          benchmarkValue={executiveKPIs.netSales.targetFormatted}
          variancePct={executiveKPIs.netSales.targetVariancePct}
          status={executiveKPIs.netSales.status as any}
          tooltipDefinition={KPI_METRIC_DEFINITIONS.netSales.businessSignificance}
          tooltipCalculation={KPI_METRIC_DEFINITIONS.netSales.formula}
        />
        <KpiCard
          label={KPI_METRIC_DEFINITIONS.forecastAccuracy.label}
          value={`${forecastAccuracyWape.toFixed(1)}%`}
          period="WAPE Metric"
          benchmarkLabel="Bias"
          benchmarkValue={`${forecastBiasPct > 0 ? '+' : ''}${forecastBiasPct.toFixed(1)}%`}
          status={forecastAccuracyWape >= 90 ? 'positive' : 'negative'}
          tooltipDefinition={KPI_METRIC_DEFINITIONS.forecastAccuracy.businessSignificance}
          tooltipCalculation={KPI_METRIC_DEFINITIONS.forecastAccuracy.formula}
        />
        <KpiCard
          label="Net Revenue Retention"
          value="104.6%"
          period="Trailing 12M"
          benchmarkLabel="Plan Target"
          benchmarkValue="102.0%"
          variancePct={2.6}
          status="positive"
          tooltipDefinition="Annual revenue retention tracking baseline account expansion net of churn."
          tooltipCalculation="((Prior Cohort Current Spend - Churn + Expansion) / Prior Cohort Spend) * 100"
        />
        <KpiCard
          label="Top 10 Concentration"
          value={`${concentrationTop10Pct.toFixed(1)}%`}
          period="Portfolio Share"
          subtext="National distributors"
          status={concentrationTop10Pct > 50 ? 'negative' : 'neutral'}
          tooltipDefinition="Proportion of total enterprise net sales generated by the top 10 distributor accounts."
          tooltipCalculation="(Revenue of Top 10 Accounts / Total Portfolio Revenue) * 100"
        />
        <KpiCard
          label="Revenue At Risk"
          value={`$${(atRiskRevenue / 1000000).toFixed(2)}M`}
          period={`${atRiskAccounts.length} Accounts`}
          subtext="Critical & At-Risk tier"
          status={atRiskRevenue > 1000000 ? 'negative' : 'neutral'}
          tooltipDefinition="Total trailing 12-month revenue linked to customer accounts flagged in Critical or At-Risk health bands."
          tooltipCalculation="Sum of sales for accounts with healthScore < 70"
        />
        <KpiCard
          label={KPI_METRIC_DEFINITIONS.customerRetention.label}
          value={executiveKPIs.customerRetention.formatted}
          period="Account Count"
          benchmarkLabel="Target"
          benchmarkValue="95.0%"
          variancePct={executiveKPIs.customerRetention.value - 95.0}
          status={executiveKPIs.customerRetention.value >= 95.0 ? 'positive' : 'negative'}
          tooltipDefinition={KPI_METRIC_DEFINITIONS.customerRetention.businessSignificance}
          tooltipCalculation={KPI_METRIC_DEFINITIONS.customerRetention.formula}
        />
      </div>

      {/* Visuals Row 1: Rolling Actual vs Target vs Forecast & Health Distribution Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch">
        <div className="lg:col-span-2 h-full">
          <TrendLineChart
            title="Monthly Sales Actuals vs Target vs Saved Forecast"
            subtitle="Evaluating forecasting accuracy and bias across rolling 24 months"
            data={monthlyTrendData}
            height={260}
            tooltip={{
              title: "Forecast Reliability & WAPE Analysis",
              businessDefinition: "Longitudinal comparison of commercial actuals against operating budgets and saved statistical demand forecasts.",
              attributesUsed: "MonthlyFinancialSnapshot.netSales, MonthlyFinancialSnapshot.target, MonthlyFinancialSnapshot.savedForecastBase",
              calculationLogic: "WAPE % = (1 - (Sum(|Actual - Forecast|) / Sum(Actual))) * 100. Forecast Bias % = ((Sum(Forecast) - Sum(Actual)) / Sum(Actual)) * 100.",
              filtersConditions: "Rolling 24-month horizon across active sales channels and operating segments.",
              interpretation: "WAPE >90% indicates reliable factory scheduling and inventory staging; positive bias indicates structural over-forecasting."
            }}
          />
        </div>

        <div className="h-full">
          <DonutChart
            title="Customer Health Score Distribution"
            subtitle="Account categorization by multi-factor health model"
            data={healthDonut}
            centerLabel="Accounts"
            centerValue={String(filteredData.filteredAccounts.length)}
            tooltip={{
              title: "Customer Health Score Distribution",
              businessDefinition: "Categorization of customer relationships into operational risk bands using a transparent multi-dimensional index.",
              attributesUsed: "CustomerHealth.overallScore, CustomerHealth.band, CustomerHealth.components",
              calculationLogic: "Weighted Index: Commercial (35%) + Field Service (25%) + Financial Credit (25%) + Controls Engagement (15%). Bands: Healthy (>85), Stable (70-84), At Risk (50-69), Critical (<50).",
              filtersConditions: "All operating customer accounts active within reporting period.",
              interpretation: "Executive benchmark: <10% of portfolio accounts in Critical or At-Risk status."
            }}
          />
        </div>
      </div>

      {/* Interactive Scenario Modeler */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs space-y-3 relative">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-[#007041]" />
                Executive Scenario Planning & Sensitivity Modeler
              </h4>
              <VisualTooltip
                title="Executive Scenario Planning & Sensitivity Model"
                businessDefinition="Deterministic financial sensitivity simulation projecting top-line revenue, gross margin bps, and working capital under varying macro assumptions."
                attributesUsed="savedForecastBase, grossMarginPct, accountsReceivableTotal"
                calculationLogic="Upside (+8% revenue, +120 bps margin, +$1.8M cash flow via accelerated nLight adoption). Downside (-8% revenue, -140 bps margin, -$1.2M cash flow via commercial push-outs)."
                filtersConditions="Full enterprise portfolio over next 12-month operating plan."
                interpretation="Empowers executive leadership to stress-test capacity, buffer inventory, and evaluate working capital liquidity buffers."
              />
            </div>
            <p className="text-xs text-slate-500">
              Simulate portfolio financial outcomes under supply chain, specifier adoption, and price sensitivity conditions
            </p>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
            {(['Base', 'Upside', 'Downside'] as const).map((sc) => (
              <button
                key={sc}
                onClick={() => setSelectedScenario(sc)}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                  selectedScenario === sc
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {sc} Scenario
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
          <div>
            <span className="text-[10.5px] font-semibold text-slate-500 uppercase">
              Projected Revenue ({selectedScenario})
            </span>
            <div className="text-xl font-bold font-mono text-slate-900 mt-0.5">
              ${(projectedRevenue / 1000000).toFixed(2)}M
            </div>
            <span className="text-[10.5px] text-slate-400">
              {selectedScenario === 'Upside'
                ? '+8% driven by accelerated nLight adoption'
                : selectedScenario === 'Downside'
                ? '-8% due to commercial project push-outs'
                : 'Paced on saved base forecast model'}
            </span>
          </div>

          <div>
            <span className="text-[10.5px] font-semibold text-slate-500 uppercase">
              Blended Gross Margin %
            </span>
            <div className="text-xl font-bold font-mono text-[#007041] mt-0.5">
              {projectedMargin.toFixed(1)}%
            </div>
            <span className="text-[10.5px] text-slate-400">
              {selectedScenario === 'Upside' ? '+120 bps mix benefit' : 'Protected by controls ratio'}
            </span>
          </div>

          <div>
            <span className="text-[10.5px] font-semibold text-slate-500 uppercase">
              Cash Flow & Collections Delta
            </span>
            <div className="text-xl font-bold font-mono text-slate-900 mt-0.5">
              {selectedScenario === 'Downside' ? '-$1.2M' : '+$1.8M'}
            </div>
            <span className="text-[10.5px] text-slate-400">Working capital liquidity variance</span>
          </div>
        </div>
      </div>

      {/* Executive Action Register */}
      <div className="relative">
        <SortableTable
          data={filteredData.filteredRecs}
          columns={recColumns}
          title="Executive Strategic Action Register"
          subtitle="Prioritized cross-functional decisions across sales, engineering, credit, and executive sponsorship"
          tooltip={{
            title: 'Executive Strategic Action Register Governance',
            formula: 'Algorithmic synthesis of top pipeline blockage, overdue AR disputes (>60 days), high-severity warranty escalations, and tier-1 partner accounts.',
            source: 'Salesforce CRM + SAP ECC (FI/CO) + ServiceNow CS + C360 Synthesis Engine',
            updateFrequency: 'Near Real-Time Event Sync',
            caveats: 'Impact estimate reflects potential net revenue at risk or unlocked working capital if operational mandate is executed within 30 days.'
          }}
          searchKey={(r) => `${r.signal} ${r.accountName} ${r.persona} ${r.priority}`}
          searchPlaceholder="Filter strategic actions..."
          defaultSortKey="potentialImpactUsd"
          defaultSortDir="desc"
          onRowClick={(r) => selectCustomer(r.accountId)}
          exportFileName="acuity-leadership-action-register"
        />
      </div>
    </div>
  );
};
