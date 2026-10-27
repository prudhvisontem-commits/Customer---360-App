/**
 * Acuity Brands Lighting - Executive Landing Page
 * Concise, decision-oriented portfolio health view with compact persona navigation,
 * governed headline KPI cards, balanced chart sizing, and standardized (ⓘ) visual tooltips.
 */

import React from 'react';
import {
  TrendingUp,
  Headphones,
  DollarSign,
  Briefcase,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Zap,
  ArrowRight
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { KpiCard } from '../components/KpiCard';
import { TrendLineChart } from '../components/charts/TrendLineChart';
import { FunnelChart } from '../components/charts/FunnelChart';
import { AgingBucketBar } from '../components/charts/AgingBucketBar';
import { DonutChart } from '../components/charts/DonutChart';
import { VisualTooltip } from '../components/common/VisualTooltip';
import {
  buildMonthlySalesTrend,
  calculateFunnelStages,
  calculateARAgingBuckets,
  calculateServiceMetrics,
  KPI_METRIC_DEFINITIONS
} from '../data/metricsEngine';

export const ExecutiveLandingView: React.FC = () => {
  const {
    dataset,
    filteredData,
    executiveKPIs,
    setActiveView,
    selectCustomer,
  } = useData();

  const monthlyTrendData = buildMonthlySalesTrend(filteredData.filteredSnapshots, dataset.monthlySnapshots);
  const funnelStages = calculateFunnelStages(filteredData.filteredOpps);
  const arBuckets = calculateARAgingBuckets(filteredData.filteredInvoices);
  const serviceMetrics = calculateServiceMetrics(filteredData.filteredCases);

  // Revenue by Sales Channel Name (formerly GTM Channel)
  const channelRevenueMap: Record<string, number> = {};
  filteredData.filteredOrders.forEach((ol) => {
    const acc = filteredData.filteredAccounts.find((a) => a.id === ol.accountId);
    const ch = acc ? acc.channel : 'C&I Electrical Distribution';
    channelRevenueMap[ch] = (channelRevenueMap[ch] || 0) + ol.lineTotal;
  });

  const channelPalette = ['#04BC6F', '#007041', '#4379A3', '#5B6770', '#F59E0B', '#9333EA'];
  const channelSegments = Object.entries(channelRevenueMap).map(([ch, val], idx) => ({
    label: ch,
    value: val,
    color: channelPalette[idx % channelPalette.length],
  }));

  // Top Accounts by Revenue
  const accountRevenueMap: Record<string, { account: any; revenue: number }> = {};
  filteredData.filteredOrders.forEach((ol) => {
    if (!accountRevenueMap[ol.accountId]) {
      const acc = filteredData.filteredAccounts.find((a) => a.id === ol.accountId);
      accountRevenueMap[ol.accountId] = { account: acc, revenue: 0 };
    }
    accountRevenueMap[ol.accountId].revenue += ol.lineTotal;
  });

  const topAccounts = Object.values(accountRevenueMap)
    .filter((a) => a.account)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // At-Risk accounts
  const atRiskAccounts = filteredData.filteredHealth
    .filter((h) => h.band === 'Critical' || h.band === 'At Risk')
    .slice(0, 4);

  return (
    <div className="space-y-6 pb-12">
      {/* 4 Compact Persona Navigation Cards (No verbose descriptions) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Sales */}
        <div
          onClick={() => setActiveView('sales')}
          className="group bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs hover:border-[#04BC6F] hover:shadow-md transition-all duration-150 cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#04BC6F]/15 flex items-center justify-center text-[#007041]">
                <TrendingUp className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#007041] transition-colors">
                Sales Intelligence
              </h3>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#007041] group-hover:translate-x-0.5 transition-all" />
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Weighted Pipeline:</span>
            <span className="font-mono font-bold text-slate-900">{executiveKPIs.weightedPipeline.formatted}</span>
          </div>
        </div>

        {/* Service */}
        <div
          onClick={() => setActiveView('service')}
          className="group bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs hover:border-[#04BC6F] hover:shadow-md transition-all duration-150 cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#4379A3]/15 flex items-center justify-center text-[#4379A3]">
                <Headphones className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#4379A3] transition-colors">
                Service Intelligence
              </h3>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#4379A3] group-hover:translate-x-0.5 transition-all" />
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">SLA Attainment:</span>
            <span className="font-mono font-bold text-slate-900">{serviceMetrics.slaAttainmentPct.toFixed(1)}%</span>
          </div>
        </div>

        {/* Finance */}
        <div
          onClick={() => setActiveView('finance')}
          className="group bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs hover:border-[#04BC6F] hover:shadow-md transition-all duration-150 cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/15 flex items-center justify-center text-amber-700">
                <DollarSign className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-amber-700 transition-colors">
                Finance & Credit
              </h3>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-700 group-hover:translate-x-0.5 transition-all" />
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Overdue AR:</span>
            <span className="font-mono font-bold text-[#DC2626]">{executiveKPIs.overdueAR.formatted}</span>
          </div>
        </div>

        {/* Leadership */}
        <div
          onClick={() => setActiveView('leadership')}
          className="group bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs hover:border-[#04BC6F] hover:shadow-md transition-all duration-150 cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#5B6770]/15 flex items-center justify-center text-[#5B6770]">
                <Briefcase className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#5B6770] transition-colors">
                Leadership Intelligence
              </h3>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#5B6770] group-hover:translate-x-0.5 transition-all" />
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Account Retention:</span>
            <span className="font-mono font-bold text-[#007041]">{executiveKPIs.customerRetention.formatted}</span>
          </div>
        </div>
      </div>

      {/* Governed Headline KPI Cards (8 aligned with Metric Governance & Definitions) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {/* 1. Net Sales Revenue */}
        <KpiCard
          label={KPI_METRIC_DEFINITIONS.netSales.label}
          value={executiveKPIs.netSales.formatted}
          period={executiveKPIs.netSales.period}
          benchmarkLabel="Plan Target"
          benchmarkValue={executiveKPIs.netSales.targetFormatted}
          variancePct={executiveKPIs.netSales.targetVariancePct}
          status={executiveKPIs.netSales.status as any}
          tooltipDefinition={KPI_METRIC_DEFINITIONS.netSales.businessSignificance}
          tooltipCalculation={KPI_METRIC_DEFINITIONS.netSales.formula}
          onClick={() => setActiveView('sales')}
        />

        {/* 2. Order Bookings */}
        <KpiCard
          label={KPI_METRIC_DEFINITIONS.orderBookings.label}
          value={executiveKPIs.orderBookings.formatted}
          period="Authorized POs"
          subtext="Factory scheduled"
          status="positive"
          tooltipDefinition={KPI_METRIC_DEFINITIONS.orderBookings.businessSignificance}
          tooltipCalculation={KPI_METRIC_DEFINITIONS.orderBookings.formula}
          onClick={() => setActiveView('sales')}
        />

        {/* 3. Open Backlog */}
        <KpiCard
          label={KPI_METRIC_DEFINITIONS.openBacklog.label}
          value={executiveKPIs.openBacklog.formatted}
          period="Unshipped"
          subtext="Production buffer"
          status="neutral"
          tooltipDefinition={KPI_METRIC_DEFINITIONS.openBacklog.businessSignificance}
          tooltipCalculation={KPI_METRIC_DEFINITIONS.openBacklog.formula}
          onClick={() => setActiveView('sales')}
        />

        {/* 4. Gross Margin % */}
        <KpiCard
          label={KPI_METRIC_DEFINITIONS.grossMarginPct.label}
          value={executiveKPIs.grossMarginPct.formatted}
          period="Realized"
          benchmarkLabel="Target"
          benchmarkValue={executiveKPIs.grossMarginPct.targetFormatted}
          variancePct={executiveKPIs.grossMarginPct.varianceBps / 100}
          status={executiveKPIs.grossMarginPct.status as any}
          tooltipDefinition={KPI_METRIC_DEFINITIONS.grossMarginPct.businessSignificance}
          tooltipCalculation={KPI_METRIC_DEFINITIONS.grossMarginPct.formula}
          onClick={() => setActiveView('finance')}
        />

        {/* 5. Weighted Pipeline */}
        <KpiCard
          label={KPI_METRIC_DEFINITIONS.weightedPipeline.label}
          value={executiveKPIs.weightedPipeline.formatted}
          period="90d Horizon"
          benchmarkLabel="Open Quotes"
          benchmarkValue={executiveKPIs.weightedPipeline.openQuotesFormatted}
          status="positive"
          tooltipDefinition={KPI_METRIC_DEFINITIONS.weightedPipeline.businessSignificance}
          tooltipCalculation={KPI_METRIC_DEFINITIONS.weightedPipeline.formula}
          onClick={() => setActiveView('sales')}
        />

        {/* 6. Overdue AR */}
        <KpiCard
          label={KPI_METRIC_DEFINITIONS.overdueAR.label}
          value={executiveKPIs.overdueAR.formatted}
          period="Past Due"
          benchmarkLabel="% of Total AR"
          benchmarkValue={executiveKPIs.overdueAR.overduePct}
          status={executiveKPIs.overdueAR.status as any}
          tooltipDefinition={KPI_METRIC_DEFINITIONS.overdueAR.businessSignificance}
          tooltipCalculation={KPI_METRIC_DEFINITIONS.overdueAR.formula}
          onClick={() => setActiveView('finance')}
        />

        {/* 7. Service SLA Attainment */}
        <KpiCard
          label={KPI_METRIC_DEFINITIONS.slaAttainment.label}
          value={`${serviceMetrics.slaAttainmentPct.toFixed(1)}%`}
          period="Field Tickets"
          benchmarkLabel="SLA Target"
          benchmarkValue="95.0%"
          variancePct={serviceMetrics.slaAttainmentPct - 95.0}
          status={serviceMetrics.slaAttainmentPct >= 95.0 ? 'positive' : 'negative'}
          tooltipDefinition={KPI_METRIC_DEFINITIONS.slaAttainment.businessSignificance}
          tooltipCalculation={KPI_METRIC_DEFINITIONS.slaAttainment.formula}
          onClick={() => setActiveView('service')}
        />

        {/* 8. Customer Retention Rate */}
        <KpiCard
          label={KPI_METRIC_DEFINITIONS.customerRetention.label}
          value={executiveKPIs.customerRetention.formatted}
          period="Annual Cohort"
          benchmarkLabel="Target"
          benchmarkValue={executiveKPIs.customerRetention.targetFormatted}
          variancePct={executiveKPIs.customerRetention.value - 95.0}
          status={executiveKPIs.customerRetention.value >= 95.0 ? 'positive' : 'negative'}
          tooltipDefinition={KPI_METRIC_DEFINITIONS.customerRetention.businessSignificance}
          tooltipCalculation={KPI_METRIC_DEFINITIONS.customerRetention.formula}
          onClick={() => setActiveView('leadership')}
        />
      </div>

      {/* 5 Analytical Sections */}

      {/* SECTION A: Portfolio & Growth Dynamics */}
      <div className="space-y-3">
        <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-md bg-[#007041] text-white flex items-center justify-center text-xs font-bold">
              A
            </span>
            <h2 className="text-sm font-bold text-slate-900">Portfolio & Growth Dynamics</h2>
          </div>
          <VisualTooltip
            title="Portfolio & Growth Dynamics"
            description="Evaluates 24-month revenue pacing against seasonal approved targets and Sales Channel mix."
            calculation="Monthly Sales = Invoiced revenue | Target = Approved commercial baseline"
          />
        </div>

        {/* Resized, uniformly spread out chart layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          <div className="lg:col-span-8 flex flex-col h-full">
            <TrendLineChart
              title="Net Sales Actuals vs Illustrative Approved Target"
              subtitle="24-month revenue run-rate across luminaires and networked controls"
              data={monthlyTrendData}
              height={260}
              tooltip={{
                title: "Net Sales vs Approved Target",
                description: "Evaluates monthly revenue pacing against approved operational targets across all luminaire and networked controls product families.",
                calculation: "Monthly Net Sales = Sum of invoiced line totals | Target = Seasonally phased budget",
                benchmark: "Approved Annual Operating Plan"
              }}
              actionButton={{
                label: "Explore Sales Intelligence",
                onClick: () => setActiveView('sales')
              }}
            />
          </div>

          <div className="lg:col-span-4 flex flex-col h-full">
            <DonutChart
              title="Revenue by Sales Channel Name"
              subtitle="Channel volume distribution"
              data={channelSegments}
              centerLabel="Net Sales"
              centerValue={executiveKPIs.netSales.formatted}
              tooltip={{
                title: "Revenue by Sales Channel Name",
                description: "Proportional share of net sales across go-to-market channels including Electrical Distribution, Contractor Direct, OEM, and Specifier.",
                calculation: "(Channel Sales / Total Net Sales) * 100",
                benchmark: "GTM Channel Mix Target"
              }}
              actionButton={{
                label: "Channel Breakdown",
                onClick: () => setActiveView('sales')
              }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
          <span className="text-slate-400 font-medium">Monthly revenue actuals reconciled across SAP ERP and subledgers</span>
          <button
            onClick={() => setActiveView('sales')}
            className="text-xs sm:text-sm font-bold text-[#007041] hover:underline flex items-center gap-1 cursor-pointer"
          >
            Explore Detailed Sales Intelligence &rarr;
          </button>
        </div>
      </div>

      {/* SECTION B: Commercial Funnel */}
      <div className="space-y-3">
        <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-md bg-[#007041] text-white flex items-center justify-center text-xs font-bold">
              B
            </span>
            <h2 className="text-base font-bold text-slate-900">Commercial Funnel & Conversion Velocity</h2>
          </div>
          <VisualTooltip
            title="Commercial Funnel Realization"
            businessDefinition="Progression of active commercial lighting and controls opportunities across milestone stage gates."
            attributesUsed="Opportunity.stage, Opportunity.value, Opportunity.probability, Opportunity.expectedCloseDate"
            calculationLogic="Stage Win Probability % = (Stage Weighted Value / Total Stage Value) * 100. Overall Pipeline Realization % = (Total Weighted Value / Total Pipeline Value) * 100."
            filtersConditions="Open commercial bids and specifications within active reporting period."
            interpretation="Reflects the probability-discounted revenue conversion expected from open projects as specifications lock in."
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">
          <div className="h-full">
            <FunnelChart
              stages={funnelStages}
              title="Opportunity Stage Progression & Lock-in"
              subtitle="Pipeline values and conversion from Lead to Won"
              onStageClick={() => setActiveView('sales')}
              tooltip={{
                title: "Opportunity Funnel Realization",
                businessDefinition: "Active commercial pipeline tracked across stage gates from initial Prospecting through Specification Lock to Closed Won.",
                attributesUsed: "Opportunity.stage, Opportunity.value, Opportunity.probability, Opportunity.expectedCloseDate",
                calculationLogic: "Stage Win Probability % = (Stage Weighted Value / Total Stage Value) * 100. Overall Pipeline Realization % = (Total Weighted / Total Pipeline) * 100.",
                filtersConditions: "Open, unclosed opportunities within active filters.",
                interpretation: "Win probability increases from 15% (early discovery) to 100% (contract signed) as engineering specifications lock."
              }}
              actionButton={{
                label: "Opportunity Table",
                onClick: () => setActiveView('sales')
              }}
            />
          </div>

          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between h-full">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight pr-6">
                    Commercial Insights & Stalled Pipeline
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                    Key conversion friction points across sales channels
                  </p>
                </div>
                <VisualTooltip
                  title="Stalled Pipeline Signal"
                  description="Identifies opportunities exceeding 45 days in stage without milestone advance."
                  calculation="Age = Current Date - Date Stage Entered (Threshold > 45d)"
                />
              </div>

              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200/70 flex items-start gap-3 text-xs sm:text-sm">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-amber-900">Specifier Value Engineering Bottleneck</div>
                  <p className="text-amber-800 text-xs sm:text-[13px] mt-0.5 leading-relaxed">
                    $1.4M in Spec Lock deals have exceeded 45 days in stage. Competitor substitutions (Cooper/Signify) threaten project margins if BAFO packages are not finalized this week.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200/70 flex items-start gap-3 text-xs sm:text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-emerald-900">nLight® Networked Controls Win Rate Surge</div>
                  <p className="text-emerald-800 text-xs sm:text-[13px] mt-0.5 leading-relaxed">
                    Projects bundled with nLight wired/wireless controls achieve 68% close conversion versus 42% for standalone luminaires, driving +320 bps higher blended margin.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">Pipeline velocity diagnostic updated</span>
              <button
                onClick={() => setActiveView('sales')}
                className="text-xs sm:text-sm font-bold text-[#007041] hover:underline flex items-center gap-1 cursor-pointer"
              >
                Explore Detailed Opportunity Table &rarr;
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION C: Fulfillment & CX */}
      <div className="space-y-3">
        <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-md bg-[#007041] text-white flex items-center justify-center text-xs font-bold">
              C
            </span>
            <h2 className="text-base font-bold text-slate-900">Fulfillment & Service Quality Stability</h2>
          </div>
          <VisualTooltip
            title="Fulfillment & Service Health"
            description="Operational support metrics tracking field engineering, driver reliability, and ticket resolution speed."
            calculation="Attainment = (Resolved Within SLA / Total Closed) * 100"
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div
            onClick={() => setActiveView('service')}
            className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs hover:border-[#04BC6F] hover:shadow-md transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Open Service Backlog</span>
              <VisualTooltip description="Total unresolved support cases currently assigned to field engineering." calculation="Count of tickets where status != Closed" />
            </div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-slate-900 mt-1">{serviceMetrics.openCount} Cases</div>
            <span className="text-xs text-slate-400 font-medium">{serviceMetrics.slaBreachedCount} SLA breaches</span>
          </div>

          <div
            onClick={() => setActiveView('service')}
            className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs hover:border-[#04BC6F] hover:shadow-md transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">SLA Attainment Rate</span>
              <VisualTooltip description="Contractual turnaround compliance for critical, high, and medium tickets." calculation="(Tickets closed within SLA / Total closed) * 100" />
            </div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-600 mt-1">
              {serviceMetrics.slaAttainmentPct.toFixed(1)}%
            </div>
            <span className="text-xs text-slate-400 font-medium">Target: 95.0%</span>
          </div>

          <div
            onClick={() => setActiveView('service')}
            className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs hover:border-[#04BC6F] hover:shadow-md transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Median Resolution</span>
              <VisualTooltip description="Median elapsed hours from ticket opening to verified resolution." calculation="Median(Actual Resolution Hours for Closed Cases)" />
            </div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-slate-900 mt-1">
              {serviceMetrics.medianResolutionHours}h
            </div>
            <span className="text-xs text-slate-400 font-medium">Calendar hours basis</span>
          </div>

          <div
            onClick={() => setActiveView('service')}
            className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs hover:border-[#04BC6F] hover:shadow-md transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Repeat Issue Ratio</span>
              <VisualTooltip description="Percentage of service tickets involving repeat driver or commissioning failures." calculation="(Repeat Issue Cases / Total Cases) * 100" />
            </div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-amber-600 mt-1">
              {serviceMetrics.repeatRatePct.toFixed(1)}%
            </div>
            <span className="text-xs text-slate-400 font-medium">Target: &lt; 8.0%</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
          <span className="text-slate-400 font-medium">Field service SLA telemetry updated hourly</span>
          <button
            onClick={() => setActiveView('service')}
            className="text-xs sm:text-sm font-bold text-[#007041] hover:underline flex items-center gap-1 cursor-pointer"
          >
            Explore Service Intelligence & Tickets &rarr;
          </button>
        </div>
      </div>

      {/* SECTION D: Financial Health */}
      <div className="space-y-3">
        <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-md bg-[#007041] text-white flex items-center justify-center text-xs font-bold">
              D
            </span>
            <h2 className="text-base font-bold text-slate-900">Financial Health & AR Aging Schedule</h2>
          </div>
          <VisualTooltip
            title="Financial Health"
            description="Accounts receivable aging schedule and distributor concentration."
            calculation="Aging buckets based on invoice due date delta."
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">
          <div className="h-full">
            <AgingBucketBar
              title="Accounts Receivable Aging Breakdown"
              subtitle="Current vs past due balances across all operating accounts"
              buckets={arBuckets}
              totalLabel="Total AR Ledger"
              tooltip={{
                title: "Accounts Receivable Aging Schedule",
                businessDefinition: "Classification of open distributor invoice balances into aging tiers based on elapsed days past payment due dates.",
                attributesUsed: "Invoices.outstandingBalance, Invoices.dueDate, Invoices.status",
                calculationLogic: "Aging Days = Current Date - Invoices.dueDate. Buckets: Current (0-30d), 31-60d, 61-90d, 91-120d, 120+ days, and Disputed.",
                filtersConditions: "Open, unpaid invoice balances across all customer accounts.",
                interpretation: "Overdue balances >60 days trigger automated credit hold reviews; disputed balances are isolated to prevent false dunning escalations."
              }}
              actionButton={{
                label: "Credit Ledger",
                onClick: () => setActiveView('finance')
              }}
            />
          </div>

          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight pr-6">
                  Top Revenue Contributing Accounts
                </h4>
                <VisualTooltip
                  title="Top Revenue Contributing Accounts"
                  businessDefinition="Enterprise distributor accounts ranked descending by invoiced commercial purchase volume in reporting period."
                  attributesUsed="OrderLines.lineTotal, Accounts.id, Accounts.name, Accounts.tier, Accounts.segment"
                  calculationLogic="Sum of delivered order line totals per customer account ID."
                  filtersConditions="Invoiced orders within active reporting timeline."
                  interpretation="Demonstrates key account concentration and highlights tier-1 electrical distributors driving portfolio revenue."
                />
              </div>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mb-3">
                Key distributor hubs and national electrical contractors
              </p>

              <div className="divide-y divide-slate-100 text-xs sm:text-sm">
                {topAccounts.map((item) => (
                  <div
                    key={item.account.id}
                    onClick={() => selectCustomer(item.account.id)}
                    className="py-2.5 flex items-center justify-between hover:bg-slate-50 cursor-pointer rounded-lg px-2 transition-colors"
                  >
                    <div className="truncate pr-2">
                      <div className="font-bold text-slate-900 truncate text-xs sm:text-sm">
                        {item.account.name}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {item.account.id} • {item.account.segment} • {item.account.region}
                      </div>
                    </div>
                    <div className="text-right font-mono shrink-0">
                      <div className="font-bold text-slate-900 text-xs sm:text-sm">
                        ${(item.revenue / 1000).toFixed(0)}k
                      </div>
                      <div className="text-[11px] text-emerald-600 font-semibold">
                        {item.account.tier}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">Reconciled with ERP Subledger</span>
              <button
                onClick={() => setActiveView('finance')}
                className="text-xs sm:text-sm font-bold text-[#007041] hover:underline"
              >
                Go to Finance Intelligence &rarr;
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION E: Growth, Risk & Prescriptive Actions */}
      <div className="space-y-3">
        <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-md bg-[#007041] text-white flex items-center justify-center text-xs font-bold">
              E
            </span>
            <h2 className="text-base font-bold text-slate-900">Growth Signals, Risk Exposure & Prescriptive Actions</h2>
          </div>
          <VisualTooltip
            title="Prescriptive Actions"
            description="Deterministic interventions triggered by revenue pace, service tickets, and credit utilization."
            calculation="Rules-based scoring model across 4 operational dimensions"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">
          {/* At-Risk Accounts */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight pr-6">
                  At-Risk Accounts Requiring Intervention
                </h4>
                <div className="flex items-center gap-1.5 shrink-0">
                  <VisualTooltip
                    title="At-Risk Accounts Model"
                    businessDefinition="Customer accounts triggering automated risk flags due to purchasing deceleration, unresolved field service escalations, or credit limit strain."
                    attributesUsed="CustomerHealth.overallScore, CustomerHealth.band, CustomerHealth.keyDrivers"
                    calculationLogic="Composite 0-100 score across Commercial Momentum (35%), Field Quality (25%), Financial Risk (25%), and Controls Engagement (15%). Bands: Critical (<50), At Risk (50-69)."
                    filtersConditions="Operating distributor accounts in active reporting filters with health score < 70."
                    interpretation="Pinpoints distributor relationships needing urgent executive sponsor intervention or credit restructuring."
                  />
                  <ShieldAlert className="w-5 h-5 text-red-500 shrink-0" />
                </div>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mb-3">
                Triggered by volume decline, service breach, or credit aging
              </p>

              <div className="space-y-2.5">
                {atRiskAccounts.map((h) => {
                  const acc = filteredData.filteredAccounts.find((a) => a.id === h.accountId);
                  if (!acc) return null;
                  return (
                    <div
                      key={h.accountId}
                      onClick={() => selectCustomer(h.accountId)}
                      className="p-3 rounded-xl border border-red-100 bg-red-50/50 hover:bg-red-50 transition-colors cursor-pointer text-xs sm:text-sm"
                    >
                      <div className="flex items-center justify-between font-bold text-slate-900 mb-0.5">
                        <span className="truncate pr-2">{acc.name}</span>
                        <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-red-100 text-red-700 shrink-0">
                          Score: {h.overallScore}/100 ({h.band})
                        </span>
                      </div>
                      <p className="text-slate-600 text-xs mb-1">{h.keyDrivers[0]}</p>
                      <div className="text-[11px] text-slate-400 font-mono">
                        Owner: {acc.accountOwner} • Territory: {acc.territory}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">Scoring model evaluated hourly</span>
              <button
                onClick={() => setActiveView('leadership')}
                className="text-xs sm:text-sm font-bold text-[#007041] hover:underline"
              >
                View Risk Diagnostic &rarr;
              </button>
            </div>
          </div>

          {/* Prescriptive Actions */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight pr-6">
                  Prioritized Recommended Actions
                </h4>
                <div className="flex items-center gap-1.5 shrink-0">
                  <VisualTooltip
                    title="Prescriptive Interventions Governance"
                    businessDefinition="Actionable, prioritized interventions synthesized from real-time operational telemetry across sales, service, and credit subledgers."
                    attributesUsed="Recommendation.signal, Recommendation.priority, Recommendation.potentialImpactUsd, Recommendation.recommendedAction"
                    calculationLogic="Heuristic cross-matching of pipeline stage stall >45d, RMA warranty cases with repeat issue flags, and overdue AR aging >60d."
                    filtersConditions="Prioritized strategic actions with High or Urgent classification."
                    interpretation="Displays estimated dollar impact and suggested operational owner for immediate remediation."
                  />
                  <Zap className="w-5 h-5 text-[#007041] shrink-0" />
                </div>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mb-3">
                Prescriptive interventions generated from telemetry
              </p>

              <div className="space-y-2.5">
                {filteredData.filteredRecs.slice(0, 3).map((rec) => (
                  <div
                    key={rec.id}
                    onClick={() => selectCustomer(rec.accountId)}
                    className="p-3 rounded-xl border border-slate-200 hover:border-[#04BC6F] bg-white hover:bg-emerald-50/20 transition-all cursor-pointer text-xs sm:text-sm space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{rec.signal}</span>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 shrink-0">
                        {rec.priority}
                      </span>
                    </div>
                    <div className="text-slate-600 text-xs sm:text-[13px] leading-relaxed">
                      {rec.recommendedAction}
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5 font-mono">
                      <span>Account: {rec.accountName}</span>
                      <span className="text-[#007041] font-bold">
                        Impact: ~${(rec.potentialImpactUsd / 1000).toFixed(0)}k
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">3 Pending Executive Approvals</span>
              <button
                onClick={() => setActiveView('leadership')}
                className="text-xs sm:text-sm font-bold text-[#007041] hover:underline flex items-center gap-1"
              >
                Executive Action Register &rarr;
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
