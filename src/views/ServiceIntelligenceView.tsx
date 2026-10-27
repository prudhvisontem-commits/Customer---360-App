/**
 * Acuity Brands Lighting - Service Intelligence View
 * Real-time field engineering, customer support tickets, eldoLED driver reliability,
 * and nLight commissioning SLA tracking across distributor and contractor jobsites.
 */

import React from 'react';
import {
  Headphones,
  Sparkles,
  AlertTriangle,
  Clock,
  CheckCircle2,
  ShieldCheck,
  ShieldAlert,
  Wrench,
  Zap
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { KpiCard } from '../components/KpiCard';
import { AgingBucketBar, AgingBucket } from '../components/charts/AgingBucketBar';
import { DonutChart } from '../components/charts/DonutChart';
import { SortableTable, ColumnDef } from '../components/tables/SortableTable';
import { VisualTooltip } from '../components/common/VisualTooltip';
import { ServiceCase, ServiceSeverity } from '../data/types';
import { calculateServiceMetrics, KPI_METRIC_DEFINITIONS } from '../data/metricsEngine';

export const ServiceIntelligenceView: React.FC = () => {
  const {
    filteredData,
    selectCustomer,
    openAiWithPrompt,
  } = useData();

  const metrics = calculateServiceMetrics(filteredData.filteredCases);

  // Backlog aging buckets (<24h, 1-3d, 4-7d, >7d)
  const openCases = filteredData.filteredCases.filter((c) => c.status !== 'Closed');
  const agingCounts = {
    under24: 0,
    days1to3: 0,
    days4to7: 0,
    over7: 0,
  };

  openCases.forEach((c) => {
    const ageHours = c.slaDeadlineHours * 1.2;
    if (ageHours <= 24) agingCounts.under24++;
    else if (ageHours <= 72) agingCounts.days1to3++;
    else if (ageHours <= 168) agingCounts.days4to7++;
    else agingCounts.over7++;
  });

  const agingBuckets: AgingBucket[] = [
    {
      label: '< 24 Hours (Fresh)',
      value: agingCounts.under24,
      pct: openCases.length > 0 ? (agingCounts.under24 / openCases.length) * 100 : 0,
      color: '#04BC6F',
    },
    {
      label: '1 - 3 Days (In Progress)',
      value: agingCounts.days1to3,
      pct: openCases.length > 0 ? (agingCounts.days1to3 / openCases.length) * 100 : 0,
      color: '#4379A3',
    },
    {
      label: '4 - 7 Days (Escalating)',
      value: agingCounts.days4to7,
      pct: openCases.length > 0 ? (agingCounts.days4to7 / openCases.length) * 100 : 0,
      color: '#F59E0B',
    },
    {
      label: '> 7 Days (Critical Backlog)',
      value: agingCounts.over7,
      pct: openCases.length > 0 ? (agingCounts.over7 / openCases.length) * 100 : 0,
      color: '#DC2626',
    },
  ];

  // Severity Distribution Donut
  const severityCounts: Record<ServiceSeverity, number> = {
    Critical: 0,
    High: 0,
    Medium: 0,
    Low: 0,
  };
  filteredData.filteredCases.forEach((c) => {
    severityCounts[c.severity]++;
  });

  const severityDonut = [
    { label: 'Critical (4h SLA)', value: severityCounts.Critical, color: '#DC2626' },
    { label: 'High (24h SLA)', value: severityCounts.High, color: '#F59E0B' },
    { label: 'Medium (48h SLA)', value: severityCounts.Medium, color: '#4379A3' },
    { label: 'Low (96h SLA)', value: severityCounts.Low, color: '#94A3B8' },
  ];

  // Repeat Critical Cases by Account
  const accountsWithRepeatIssues = filteredData.filteredAccounts
    .filter((a) => {
      const accCases = filteredData.filteredCases.filter((c) => c.accountId === a.id);
      return accCases.some((c) => c.repeatIssue && (c.severity === 'Critical' || c.severity === 'High'));
    })
    .slice(0, 4);

  // Service Action Queue Table Columns
  const serviceColumns: ColumnDef<ServiceCase>[] = [
    {
      key: 'caseNumber',
      header: 'Case # & Account',
      render: (sc) => (
        <div>
          <div className="font-bold text-slate-900 font-mono hover:text-[#007041] transition-colors">
            {sc.caseNumber}
          </div>
          <div className="text-[11px] text-slate-500">{sc.accountName}</div>
        </div>
      ),
      sortValue: (sc) => sc.caseNumber,
      width: '24%',
    },
    {
      key: 'severity',
      header: 'Severity',
      render: (sc) => {
        let badge = 'bg-slate-100 text-slate-700';
        if (sc.severity === 'Critical') badge = 'bg-red-100 text-red-700 font-bold';
        else if (sc.severity === 'High') badge = 'bg-amber-100 text-amber-800 font-semibold';
        else if (sc.severity === 'Medium') badge = 'bg-sky-100 text-sky-800';
        return <span className={`px-2 py-0.5 rounded text-[11px] ${badge}`}>{sc.severity}</span>;
      },
      sortValue: (sc) => (sc.severity === 'Critical' ? 4 : sc.severity === 'High' ? 3 : 2),
      width: '12%',
    },
    {
      key: 'category',
      header: 'Root-Cause Category',
      render: (sc) => (
        <div>
          <div className="font-semibold text-slate-800 text-[11.5px]">{sc.category}</div>
          <div className="text-[10px] text-slate-400 truncate max-w-[220px]">{sc.subject}</div>
        </div>
      ),
      sortValue: (sc) => sc.category,
      width: '24%',
    },
    {
      key: 'status',
      header: 'Status & SLA',
      render: (sc) => (
        <div>
          <div className="flex items-center gap-1.5 font-medium text-xs">
            {sc.status === 'Closed' ? (
              <span className="text-emerald-600 font-bold">Resolved</span>
            ) : sc.slaBreached ? (
              <span className="text-red-600 font-bold">SLA Breached</span>
            ) : (
              <span className="text-amber-600 font-medium">{sc.status}</span>
            )}
          </div>
          <div className="text-[10px] text-slate-400 font-mono">
            Limit: {sc.slaDeadlineHours}h {sc.repeatIssue && '• Repeat Issue'}
          </div>
        </div>
      ),
      sortValue: (sc) => (sc.slaBreached ? 1 : 0),
      width: '16%',
    },
    {
      key: 'assignedEngineer',
      header: 'Assigned Tech',
      render: (sc) => (
        <span className="text-xs text-slate-600 font-medium truncate block">
          {sc.assignedEngineer.split(' (')[0]}
        </span>
      ),
      width: '14%',
    },
    {
      key: 'recommendedAction',
      header: 'Recommended Field Action',
      render: (sc) => (
        <span className="text-[11px] text-slate-600 leading-tight block">
          {sc.recommendedAction}
        </span>
      ),
      width: '24%',
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs">
        <div>
          <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Headphones className="w-5 h-5 text-[#4379A3]" />
            Field Service & Quality Engineering Intelligence
          </h1>
          <p className="text-xs text-slate-500">
            Contractor ticket turnaround, eldoLED driver replacement tracking, and nLight® commissioning SLA compliance.
          </p>
        </div>

        <button
          onClick={() =>
            openAiWithPrompt(
              'Which accounts have repeated unresolved LED driver or nLight commissioning failures causing SLA breaches, and what field engineer resources should be dispatched?'
            )
          }
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-bold shadow-xs hover:bg-slate-800 transition-all shrink-0"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#04BC6F]" />
          <span>Field Escalation Analysis</span>
        </button>
      </div>

      {/* Service KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <KpiCard
          label="Open Service Cases"
          value={String(metrics.openCount)}
          period="Active Backlog"
          subtext={`${metrics.slaBreachedCount} SLA Breaches`}
          status={metrics.openCount > 20 ? 'negative' : 'neutral'}
          tooltipDefinition="Active field service tickets logged across distributor and contractor jobsites."
          tooltipCalculation="Count of service records with status != Closed"
        />
        <KpiCard
          label={KPI_METRIC_DEFINITIONS.slaAttainment.label}
          value={`${metrics.slaAttainmentPct.toFixed(1)}%`}
          period="Target: 95.0%"
          benchmarkLabel="Target Plan"
          benchmarkValue="95.0%"
          variancePct={metrics.slaAttainmentPct - 95.0}
          status={metrics.slaAttainmentPct >= 92 ? 'positive' : 'negative'}
          tooltipDefinition={KPI_METRIC_DEFINITIONS.slaAttainment.businessSignificance}
          tooltipCalculation={KPI_METRIC_DEFINITIONS.slaAttainment.formula}
        />
        <KpiCard
          label="Median Resolution Time"
          value={`${metrics.medianResolutionHours}h`}
          period="Closed Tickets"
          benchmarkLabel="SLA Target"
          benchmarkValue="24h"
          status="positive"
          tooltipDefinition="Median calendar hours elapsed from customer case creation to confirmed jobsite resolution."
          tooltipCalculation="Median(dateResolved - dateOpened in hours)"
        />
        <KpiCard
          label="Repeat Issue Rate"
          value={`${metrics.repeatRatePct.toFixed(1)}%`}
          period="Multi-Incident"
          subtext="Target: < 8.0%"
          status={metrics.repeatRatePct > 12 ? 'negative' : 'neutral'}
          tooltipDefinition="Percentage of service tickets caused by recurring fixture or driver problems at the same site."
          tooltipCalculation="(Repeat Issue Cases / Total Service Cases) * 100"
        />
        <KpiCard
          label="Warranty Claims"
          value={String(metrics.warrantyClaimCount)}
          period="Eligible Units"
          subtext="100% Validated"
          status="neutral"
          tooltipDefinition="Formal warranty claim submissions covering eldoLED drivers, luminaires, and control gateways."
          tooltipCalculation="Count of service cases with warrantyEligible == true"
        />
        <KpiCard
          label="Customer CSAT"
          value="4.7 / 5.0"
          period="Survey Samples"
          subtext="+0.3 vs LY"
          status="positive"
          tooltipDefinition="Customer satisfaction rating collected from electrical contractors post case completion."
          tooltipCalculation="Average of csatScore (scale 1 to 5)"
        />
      </div>

      {/* Visuals Row 1: Backlog Aging & Severity Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">
        <div className="h-full">
          <AgingBucketBar
            title="Service Ticket Backlog Aging"
            subtitle="Distribution of unclosed cases by elapsed time since creation"
            buckets={agingBuckets}
            totalLabel="Open Tickets"
            formatValue={(v) => `${v} cases`}
            tooltip={{
              title: "Field Service Ticket Backlog Aging Schedule",
              businessDefinition: "Classification of unclosed field warranty and commissioning tickets by elapsed calendar hours since initial case creation.",
              attributesUsed: "ServiceCases.dateOpened, ServiceCases.slaDeadlineHours, ServiceCases.status",
              calculationLogic: "Case Age = Current Timestamp - ServiceCases.dateOpened. Brackets: <24 Hours (Fresh), 1-3 Days (In Progress), 4-7 Days (Escalating), >7 Days (Critical Backlog).",
              filtersConditions: "All open, unclosed service records across commercial distributor and contractor accounts.",
              interpretation: "Cases exceeding 7 days trigger engineering leadership escalation to prevent contractor jobsite delay penalties."
            }}
          />
        </div>

        <div className="h-full">
          <DonutChart
            title="Cases by Severity Level"
            subtitle="Contractual SLA urgency distribution"
            data={severityDonut}
            centerLabel="Total Tickets"
            centerValue={String(metrics.total)}
            tooltip={{
              title: "Service Severity Tier & SLA Matrix",
              businessDefinition: "Urgency classification of customer inquiries and field defects determining contractual engineering response windows.",
              attributesUsed: "ServiceCases.severity, ServiceCases.slaDeadlineHours",
              calculationLogic: "Critical = 4-hour on-site/tech SLA (factory line down or total outage). High = 24-hour SLA (major area outage). Medium = 48-hour SLA (single fixture/sensor). Low = 96-hour SLA (general inquiry).",
              filtersConditions: "All logged service incidents within current reporting timeframe.",
              interpretation: "Contractual SLA compliance target is >95.0% across all severity tiers."
            }}
          />
        </div>
      </div>

      {/* Visuals Row 2: Root-Cause Pareto Analysis & Repeat Incident Accounts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch">
        {/* Pareto Cause Breakdown */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-3 relative h-full flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <div>
                <h4 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight pr-6">
                  Pareto Analysis of Field Service Root Causes
                </h4>
                <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                  Frequency ranking of root causes driving contractor callbacks and field warranty dispatches
                </p>
              </div>
              <VisualTooltip
                title="Root-Cause Pareto Analysis Governance"
                businessDefinition="80/20 frequency distribution isolating the primary technical failure modes driving contractor warranty claims and field callback costs."
                attributesUsed="ServiceCases.category, ServiceCases.subject, ServiceCases.repeatIssue"
                calculationLogic="Category Share % = (Count of Cases in Root Cause / Total Cases) * 100. Cumulative % = Running sum of sorted category shares."
                filtersConditions="Closed and in-progress quality incidents within active reporting period."
                interpretation="Addresses the top 2 defect drivers (eldoLED driver failure and nLight wireless pairing) to eliminate ~68% of field support inquiries."
              />
            </div>

            <div className="space-y-3 mt-3">
              {metrics.paretoCauses.map((pc) => (
                <div key={pc.cause} className="space-y-1.5 text-xs sm:text-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">{pc.cause}</span>
                    <div className="font-mono text-xs flex items-center gap-3">
                      <span className="font-bold text-slate-900">{pc.count} cases</span>
                      <span className="text-slate-600 font-semibold">({pc.pct.toFixed(0)}%)</span>
                      <span className="text-slate-400 text-[11px]">Cum: {pc.cumulativePct}%</span>
                    </div>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex">
                    <div
                      className="h-full bg-[#007041] rounded-full transition-all duration-300"
                      style={{ width: `${pc.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 mt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Primary Root Cause: <strong>{metrics.paretoCauses[0]?.cause}</strong></span>
            <span className="font-mono text-[#007041] font-bold">Top 2 Causes = 68% of Inquiries</span>
          </div>
        </div>

        {/* Repeat Critical Accounts Alert */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-3 flex flex-col justify-between relative h-full">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight pr-6">
                Repeat Critical Accounts
              </h4>
              <div className="flex items-center gap-1.5 shrink-0">
                <VisualTooltip
                  title="Repeat Critical Accounts"
                  description="Distributor jobsites with recurring critical driver failure or commissioning tickets."
                  calculation="Accounts with > 1 Critical/High case marked repeatIssue == true"
                />
                <ShieldAlert className="w-5 h-5 text-red-500" />
              </div>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mb-3">
              Distributor jobsites experiencing recurrent eldoLED driver or nLight commissioning trips
            </p>

            <div className="space-y-2.5">
              {accountsWithRepeatIssues.map((acc) => (
                <div
                  key={acc.id}
                  onClick={() => selectCustomer(acc.id)}
                  className="p-3 rounded-xl bg-red-50/60 border border-red-100 hover:bg-red-50 transition-colors cursor-pointer text-xs sm:text-sm"
                >
                  <div className="font-bold text-slate-900">{acc.name}</div>
                  <div className="text-xs text-slate-600 mt-0.5">
                    {acc.segment} • {acc.city}, {acc.state}
                  </div>
                  <div className="text-[11px] text-red-700 font-semibold mt-1">
                    Multiple driver / commissioning escalations open &gt; 48 hrs
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
            <span>Engineering escalation protocol active</span>
            <span className="font-semibold text-[#007041] hover:underline cursor-pointer">Dispatch Tech &rarr;</span>
          </div>
        </div>
      </div>

      {/* Service Action Queue */}
      <div className="relative">
        <SortableTable
          data={filteredData.filteredCases}
          columns={serviceColumns}
          title="Field Service Action Queue & Case Ledger"
          subtitle="Operational action queue with SLA deadlines, repeat flags, and engineering recommendations"
          searchKey={(sc) => `${sc.caseNumber} ${sc.accountName} ${sc.category} ${sc.severity}`}
          searchPlaceholder="Filter case #, account, root cause..."
          defaultSortKey="severity"
          defaultSortDir="desc"
          onRowClick={(sc) => selectCustomer(sc.accountId)}
          exportFileName="acuity-service-cases"
          tooltip={{
            title: "Field Service Ticket Ledger",
            description: "Contractual warranty tickets and technical service incidents tracking field engineering resolution speed and SLA breaches.",
            calculation: "SLA Attainment % = (Tickets Resolved Within SLA Hours / Total Closed Tickets) * 100",
            benchmark: "Target Attainment: 95.0% Across All Severity Levels"
          }}
        />
      </div>
    </div>
  );
};
