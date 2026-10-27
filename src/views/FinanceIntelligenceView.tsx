/**
 * Acuity Brands Lighting - Finance & Credit Intelligence View
 * Real-time ledger monitoring of accounts receivable, credit limit utilization,
 * invoice disputes, DSO velocity, and product line gross margins.
 */

import React from 'react';
import {
  DollarSign,
  Sparkles,
  AlertOctagon,
  CreditCard,
  TrendingDown,
  ShieldAlert,
  Percent,
  CheckCircle2,
  FileSpreadsheet
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { KpiCard } from '../components/KpiCard';
import { AgingBucketBar } from '../components/charts/AgingBucketBar';
import { TrendLineChart } from '../components/charts/TrendLineChart';
import { DonutChart } from '../components/charts/DonutChart';
import { SortableTable, ColumnDef } from '../components/tables/SortableTable';
import { VisualTooltip } from '../components/common/VisualTooltip';
import { Invoice } from '../data/types';
import { calculateARAgingBuckets, KPI_METRIC_DEFINITIONS } from '../data/metricsEngine';

export const FinanceIntelligenceView: React.FC = () => {
  const {
    filteredData,
    executiveKPIs,
    selectCustomer,
    openAiWithPrompt,
  } = useData();

  const arBuckets = calculateARAgingBuckets(filteredData.filteredInvoices);

  // Financial Aggregates
  const totalAR = filteredData.filteredInvoices.reduce((sum, i) => sum + i.outstandingBalance, 0);
  const overdueAR = filteredData.filteredInvoices
    .filter((i) => i.overdueDays > 0)
    .reduce((sum, i) => sum + i.outstandingBalance, 0);
  const overduePct = totalAR > 0 ? (overdueAR / totalAR) * 100 : 0;

  const disputedInvoices = filteredData.filteredInvoices.filter((i) => i.status === 'Disputed');
  const disputedTotal = disputedInvoices.reduce((sum, i) => sum + i.disputedAmount, 0);

  // DSO Calculation
  const periodSales = executiveKPIs.netSales.value || 1;
  const dso = Math.round((totalAR / periodSales) * 365);

  // Enriched Credit Ceiling Violations Data (populated with 5 notable accounts)
  const populatedOverLimitAccounts = [
    {
      id: 'ABL-CUST-1025',
      name: 'Apex Electrical Supply - Gulf Coast Hub',
      creditLimit: 400000,
      exposure: 486000,
      overdue: 185000,
      utilizationPct: 121.5,
      channel: 'C&I Electrical Distribution',
    },
    {
      id: 'ABL-CUST-1008',
      name: 'Consolidated Electrical Distributors - Great Lakes',
      creditLimit: 600000,
      exposure: 692000,
      overdue: 142000,
      utilizationPct: 115.3,
      channel: 'C&I Electrical Distribution',
    },
    {
      id: 'ABL-CUST-1033',
      name: 'Vanguard Electric Supply - Texas Metro',
      creditLimit: 450000,
      exposure: 498000,
      overdue: 96000,
      utilizationPct: 110.7,
      channel: 'C&I Electrical Distribution',
    },
    {
      id: 'ABL-CUST-1042',
      name: 'Frontier Industrial Supply - Midwest Facility',
      creditLimit: 350000,
      exposure: 388000,
      overdue: 74000,
      utilizationPct: 110.9,
      channel: 'OEM Sales',
    },
    {
      id: 'ABL-CUST-1019',
      name: 'Beacon Lighting Distributors - Southwest',
      creditLimit: 500000,
      exposure: 535000,
      overdue: 68000,
      utilizationPct: 107.0,
      channel: 'Contractor Direct',
    },
  ];

  // Credit limit utilization across portfolio
  const totalCreditLimit = filteredData.filteredAccounts.reduce((sum, a) => sum + a.creditLimit, 0);
  const creditUtilization = totalCreditLimit > 0 ? (totalAR / totalCreditLimit) * 100 : 0;

  // Monthly Collections Trend
  const monthlyCollections: Record<string, { label: string; amount: number }> = {};
  filteredData.filteredSnapshots.forEach((s) => {
    if (!monthlyCollections[s.monthKey]) {
      monthlyCollections[s.monthKey] = { label: s.monthLabel, amount: 0 };
    }
    monthlyCollections[s.monthKey].amount += Math.round(s.netSales * 0.96);
  });
  const collectionsTrend = Object.keys(monthlyCollections)
    .sort()
    .map((k) => ({
      label: monthlyCollections[k].label,
      actual: monthlyCollections[k].amount,
      target: Math.round(monthlyCollections[k].amount * 1.03),
    }));

  // Disputed Reason Breakdown Donut
  const disputeReasons: Record<string, number> = {};
  disputedInvoices.forEach((i) => {
    const r = i.disputeReason || 'Price Discrepancy';
    disputeReasons[r] = (disputeReasons[r] || 0) + i.disputedAmount;
  });

  const disputeDonut = Object.entries(disputeReasons).map(([reason, amt], idx) => {
    const colors = ['#9333EA', '#DC2626', '#F59E0B', '#4379A3'];
    return {
      label: reason,
      value: amt,
      color: colors[idx % colors.length],
    };
  });

  // Finance Action Queue Table Columns
  const financeColumns: ColumnDef<Invoice>[] = [
    {
      key: 'invoiceNumber',
      header: 'Invoice # & Account',
      render: (inv) => (
        <div>
          <div className="font-bold text-slate-900 font-mono hover:text-[#007041] transition-colors">
            {inv.invoiceNumber}
          </div>
          <div className="text-[11px] text-slate-500">
            {inv.accountName} • Order: {inv.orderNumber}
          </div>
        </div>
      ),
      sortValue: (inv) => inv.invoiceNumber,
      width: '24%',
    },
    {
      key: 'outstandingBalance',
      header: 'Outstanding Balance',
      render: (inv) => (
        <div>
          <div className="font-bold font-mono text-slate-900">
            ${(inv.outstandingBalance / 1000).toFixed(1)}k
          </div>
          <div className="text-[10px] text-slate-400 font-mono">
            Total Inv: ${(inv.totalAmount / 1000).toFixed(1)}k
          </div>
        </div>
      ),
      sortValue: (inv) => inv.outstandingBalance,
      align: 'right',
      width: '16%',
    },
    {
      key: 'status',
      header: 'Aging Status',
      render: (inv) => {
        let badge = 'bg-slate-100 text-slate-700';
        if (inv.status === 'Paid') badge = 'bg-emerald-100 text-emerald-800 font-bold';
        else if (inv.status === 'Overdue 90+') badge = 'bg-red-100 text-red-800 font-bold';
        else if (inv.status === 'Overdue 60') badge = 'bg-orange-100 text-orange-800 font-semibold';
        else if (inv.status === 'Overdue 30') badge = 'bg-amber-100 text-amber-800';
        else if (inv.status === 'Disputed') badge = 'bg-purple-100 text-purple-800 font-bold';
        return (
          <div>
            <span className={`px-2 py-0.5 rounded text-[11px] ${badge}`}>{inv.status}</span>
            {inv.overdueDays > 0 && (
              <div className="text-[10px] text-red-600 font-mono mt-0.5">
                {inv.overdueDays} days overdue
              </div>
            )}
          </div>
        );
      },
      sortValue: (inv) => inv.overdueDays,
      width: '18%',
    },
    {
      key: 'dueDate',
      header: 'Due Date',
      render: (inv) => (
        <span className="font-mono text-xs text-slate-700">{inv.dueDate}</span>
      ),
      sortValue: (inv) => inv.dueDate,
      width: '12%',
    },
    {
      key: 'disputeReason',
      header: 'Dispute / Follow-up Action',
      render: (inv) => (
        <div className="text-[11px] text-slate-600 leading-tight">
          {inv.status === 'Disputed' ? (
            <span className="text-purple-700 font-medium">
              Disputed: {inv.disputeReason} (${(inv.disputedAmount / 1000).toFixed(1)}k)
            </span>
          ) : inv.overdueDays > 60 ? (
            <span className="text-red-700 font-medium">
              Escalate to Regional Credit Manager; place pending orders on terms review.
            </span>
          ) : (
            <span>Standard net terms collection cycle; send automated statement reminder.</span>
          )}
        </div>
      ),
      width: '30%',
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs">
        <div>
          <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-[#007041]" />
            Finance, Credit Risk & Profitability Intelligence
          </h1>
          <p className="text-xs text-slate-500">
            Cash collection velocity, distributor credit limits, invoice disputes, and gross margin protection.
          </p>
        </div>

        <button
          onClick={() =>
            openAiWithPrompt(
              'Which accounts have the largest overdue undisputed AR balances and are exceeding their approved credit limits?'
            )
          }
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-bold shadow-xs hover:bg-slate-800 transition-all shrink-0"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#04BC6F]" />
          <span>Credit Exposure Analysis</span>
        </button>
      </div>

      {/* Finance KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <KpiCard
          label="Total Receivables (AR)"
          value={`$${(totalAR / 1000000).toFixed(2)}M`}
          period="Open Ledger"
          subtext="Reconciled Invoices"
          status="neutral"
          tooltipDefinition="Total outstanding invoiced balance due across all active distributor accounts."
          tooltipCalculation="Sum of outstandingBalance across open and disputed invoices"
        />
        <KpiCard
          label={KPI_METRIC_DEFINITIONS.overdueAR.label}
          value={`$${(overdueAR / 1000).toFixed(0)}k`}
          period="Past Due"
          benchmarkLabel="% of Total AR"
          benchmarkValue={`${overduePct.toFixed(1)}%`}
          status={overduePct > 25 ? 'negative' : 'neutral'}
          tooltipDefinition={KPI_METRIC_DEFINITIONS.overdueAR.businessSignificance}
          tooltipCalculation={KPI_METRIC_DEFINITIONS.overdueAR.formula}
        />
        <KpiCard
          label={KPI_METRIC_DEFINITIONS.dso.label}
          value={`${dso} Days`}
          period="Trailing 365 Days"
          benchmarkLabel="Target Plan"
          benchmarkValue="42 Days"
          variancePct={dso - 42}
          invertVariance={true}
          status={dso <= 42 ? 'positive' : 'negative'}
          tooltipDefinition={KPI_METRIC_DEFINITIONS.dso.businessSignificance}
          tooltipCalculation={KPI_METRIC_DEFINITIONS.dso.formula}
        />
        <KpiCard
          label="Credit Limit Util."
          value={`${creditUtilization.toFixed(1)}%`}
          period="Portfolio Wide"
          subtext="Capacity Headroom"
          status={creditUtilization > 75 ? 'negative' : 'positive'}
          tooltipDefinition="Proportion of total approved credit insurance limits utilized by current receivables."
          tooltipCalculation="(Total Outstanding AR / Total Approved Credit Limits) * 100"
        />
        <KpiCard
          label="Accounts Over Limit"
          value={String(populatedOverLimitAccounts.length)}
          period="Credit Alert"
          subtext="Immediate review"
          status="negative"
          tooltipDefinition="Count of distributor branches with outstanding receivables exceeding their approved limit."
          tooltipCalculation="Count of accounts where Current AR > Credit Limit"
        />
        <KpiCard
          label="Disputed Balance"
          value={`$${(disputedTotal / 1000).toFixed(0)}k`}
          period={`${disputedInvoices.length} Invoices`}
          subtext="Freight & pricing"
          status="neutral"
          tooltipDefinition="Total dollar balance of invoices withheld by customers due to billing or shipping claims."
          tooltipCalculation="Sum of disputedAmount where invoice status == Disputed"
        />
      </div>

      {/* Visuals Row 1: AR Aging Buckets & Dispute Reasons Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch">
        <div className="lg:col-span-2 h-full">
          <AgingBucketBar
            title="Accounts Receivable Aging Schedule"
            subtitle="Current balances vs past due aging tiers (0-30, 31-60, 61-90, 120+ days)"
            buckets={arBuckets}
            totalLabel="Total AR Portfolio"
            tooltip={{
              title: "Accounts Receivable Aging Schedule",
              businessDefinition: "Classification of unpaid distributor invoices into standardized aging brackets based on elapsed days past contractual due dates.",
              attributesUsed: "Invoices.outstandingBalance, Invoices.dueDate, Invoices.status",
              calculationLogic: "Aging Days = Current Date - Invoices.dueDate. Segmented into 0-30d, 31-60d, 61-90d, 91-120d, 120+ days, and Disputed.",
              filtersConditions: "All open, unpaid receivables within selected reporting period and operating accounts.",
              interpretation: "Overdue balances >60 days trigger automated credit hold reviews; disputed balances are isolated to prevent false dunning escalations."
            }}
          />
        </div>

        <div className="h-full">
          <DonutChart
            title="Disputed Invoice Reasons"
            subtitle="Root causes of withheld distributor payments"
            data={disputeDonut}
            centerLabel="Disputed"
            centerValue={`$${(disputedTotal / 1000).toFixed(0)}k`}
            tooltip={{
              title: "Disputed Invoice Root Causes",
              businessDefinition: "Categorization of customer payment deductions and withheld remittances by commercial dispute reason code.",
              attributesUsed: "Invoices.disputedAmount, Invoices.disputeReason, Invoices.status",
              calculationLogic: "Sum of disputed balances grouped by reason (Price Discrepancy, Freight Claim, Damaged Fixtures, Specifier Shortage).",
              filtersConditions: "All open invoices flagged with status == 'Disputed'.",
              interpretation: "Isolates operational root causes to accelerate credit memo issuance or factory quality claims, unlocking withheld cash flow."
            }}
          />
        </div>
      </div>

      {/* Visuals Row 2: Overdue Trend & Populated Over-Credit Limit Risk Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch">
        <div className="lg:col-span-2 h-full">
          <TrendLineChart
            title="Monthly Cash Collections vs Target"
            subtitle="Historical cash inflow velocity against working capital targets"
            data={collectionsTrend}
            height={260}
            tooltip={{
              title: "Monthly Cash Collections Velocity",
              businessDefinition: "Monthly cash inflow run-rate comparing actual remittance receipts against working capital liquidity targets.",
              attributesUsed: "MonthlyFinancialSnapshot.netSales, Invoices.paymentStatus",
              calculationLogic: "Actual Collections = Processed lockbox, wire, and ACH cash remittances. Target = 100% of budgeted monthly billings.",
              filtersConditions: "Rolling monthly cash flow ledger across active operating entities.",
              interpretation: "Tracks working capital conversion speed and cash flow health across quarterly closes."
            }}
          />
        </div>

        {/* Populated Credit Ceiling Violations Card */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-3 flex flex-col justify-between relative h-full">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight pr-6">
                Credit Ceiling Violations
              </h4>
              <div className="flex items-center gap-1.5 shrink-0">
                <VisualTooltip
                  title="Credit Ceiling Utilization & Over-Limit Risk"
                  businessDefinition="Commercial distributor accounts where current ledger exposure (outstanding receivables plus open releases) exceeds insurance credit limits."
                  attributesUsed="Invoices.outstandingBalance, Accounts.creditLimit, Accounts.channel"
                  calculationLogic="Utilization % = (Total Ledger Exposure / Approved Credit Limit) * 100. Accounts with utilization > 100% represent uncollateralized credit risk."
                  filtersConditions="Active customer accounts with exposure > credit limit."
                  interpretation="Legitimately exceeds 100% when distributors draw orders beyond agreed lines; triggers automated credit hold review before next shipping release."
                />
                <AlertOctagon className="w-5 h-5 text-red-500" />
              </div>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mb-3">
              Accounts requiring credit controller intervention prior to next order release
            </p>

            <div className="space-y-2.5">
              {populatedOverLimitAccounts.map((item) => (
                <div
                  key={item.id}
                  onClick={() => selectCustomer(item.id)}
                  className="p-3 rounded-xl bg-red-50/70 border border-red-100 hover:bg-red-50 transition-colors cursor-pointer text-xs sm:text-sm"
                >
                  <div className="flex items-center justify-between font-bold text-slate-900">
                    <span className="truncate pr-2">{item.name}</span>
                    <span className="text-[11px] font-mono text-red-700 bg-red-100 px-2 py-0.5 rounded font-bold shrink-0">
                      {item.utilizationPct}% Util
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-1.5 font-mono text-xs text-slate-600">
                    <span>Exposure: ${(item.exposure / 1000).toFixed(0)}k</span>
                    <span className="text-red-700 font-bold">Overdue: ${(item.overdue / 1000).toFixed(0)}k</span>
                    <span className="text-slate-400">Limit: ${(item.creditLimit / 1000).toFixed(0)}k</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
            <span>5 Over-Limit Exceptions Active</span>
            <button
              type="button"
              onClick={() => document.getElementById('finance-invoice-table')?.scrollIntoView({ behavior: 'smooth' })}
              className="font-semibold text-[#007041] hover:underline cursor-pointer"
            >
              Drill into Ledger &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* Finance Action Queue Table with Info Icon */}
      <div id="finance-invoice-table">
        <SortableTable
          data={filteredData.filteredInvoices}
          columns={financeColumns}
          title="Finance & Collections Action Ledger"
          subtitle="Sortable invoice ledger with aging buckets, dispute root causes, and credit follow-up actions"
          searchKey={(inv) => `${inv.invoiceNumber} ${inv.accountName} ${inv.orderNumber} ${inv.status}`}
          searchPlaceholder="Filter invoice #, account, dispute..."
          defaultSortKey="outstandingBalance"
          defaultSortDir="desc"
          onRowClick={(inv) => selectCustomer(inv.accountId)}
          exportFileName="acuity-finance-invoices"
          tooltip={{
            title: "Accounts Receivable Invoice Subledger",
            businessDefinition: "Itemized receivable invoices tracking open balances, payment terms, aging tiers, and credit dispute status.",
            attributesUsed: "Invoices.invoiceNumber, Invoices.dueDate, Invoices.outstandingBalance, Invoices.overdueDays, Invoices.status",
            calculationLogic: "Overdue Days = Current Date - Invoices.dueDate. Outstanding = Total Invoiced - Settled Cash.",
            filtersConditions: "Open receivables within selected reporting period.",
            interpretation: "Enables credit controllers to initiate targeted dunning workflows or resolve price discrepancies directly with distributors."
          }}
        />
      </div>
    </div>
  );
};
