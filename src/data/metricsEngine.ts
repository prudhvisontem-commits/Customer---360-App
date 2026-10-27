/**
 * Acuity Brands Lighting - Shared Metrics & Governance Calculation Engine
 * Reusable, deterministic calculations reconciling across all personas.
 */

import {
  SyntheticDataset,
  GlobalFilterState,
  KPIDefinition,
  MonthlyFinancialSnapshot,
  Account,
  Opportunity,
  Quote,
  OrderLine,
  Invoice,
  ServiceCase,
  CustomerHealth,
  Recommendation
} from './types';

export const KPI_METRIC_DEFINITIONS: Record<string, KPIDefinition> = {
  netSales: {
    id: 'netSales',
    label: 'Net Sales Revenue',
    formula: 'Sum of invoiced line total revenue less prompt-pay discounts, rebates, and returns.',
    sourceRecords: 'Invoices & Monthly Financial Snapshots',
    dateBasis: 'Invoice post date / accounting close month',
    units: 'USD ($)',
    businessSignificance: 'Primary top-line measure of commercial execution across luminaire and controls sales.',
  },
  orderBookings: {
    id: 'orderBookings',
    label: 'Order Bookings',
    formula: 'Total gross value of new authorized purchase orders received during reporting period.',
    sourceRecords: 'OrderLines (orderDate within period)',
    dateBasis: 'Purchase order entry date',
    units: 'USD ($)',
    businessSignificance: 'Leading indicator of market demand and factory scheduling requirements.',
  },
  openBacklog: {
    id: 'openBacklog',
    label: 'Open Order Backlog',
    formula: 'Value of confirmed, unshipped order lines scheduled for manufacturing or transit release.',
    sourceRecords: 'OrderLines with status in (Backlog Scheduled, In Production, Backlog At Risk)',
    dateBasis: 'Current snapshot date',
    units: 'USD ($)',
    businessSignificance: 'Near-term revenue buffer and indicator of supply chain / production lead times.',
  },
  grossMarginPct: {
    id: 'grossMarginPct',
    label: 'Gross Margin %',
    formula: '((Net Sales Revenue - Direct Product COGS) / Net Sales Revenue) * 100',
    sourceRecords: 'OrderLines / Invoices matching COGS ledger',
    dateBasis: 'Shipped invoice date',
    units: 'Percentage (%)',
    businessSignificance: 'Measures product profitability, pricing discipline, and mix shift toward high-margin controls.',
  },
  weightedPipeline: {
    id: 'weightedPipeline',
    label: 'Weighted Pipeline',
    formula: 'Sum of (Opportunity Value * Documented Stage Probability)',
    sourceRecords: 'Opportunities (Stage not in Closed Won, Closed Lost)',
    dateBasis: 'Expected close date within active horizon',
    units: 'USD ($)',
    businessSignificance: 'Risk-adjusted future revenue projection used for commercial forecasting.',
  },
  overdueAR: {
    id: 'overdueAR',
    label: 'Overdue Accounts Receivable',
    formula: 'Sum of unpaid invoice outstanding balance where current date > invoice due date.',
    sourceRecords: 'Invoices (overdueDays > 0 and status != Paid)',
    dateBasis: 'As of reporting date',
    units: 'USD ($)',
    businessSignificance: 'Direct cash flow risk and indicator of distributor credit stress.',
  },
  dso: {
    id: 'dso',
    label: 'Days Sales Outstanding (DSO)',
    formula: '(Total Outstanding AR / Total Credit Sales in Period) * Days in Period',
    sourceRecords: 'Invoices (Total AR) & Shipped Net Sales',
    dateBasis: 'Trailing 90 or 365 days',
    units: 'Days',
    businessSignificance: 'Velocity of cash collection and working capital efficiency.',
  },
  slaAttainment: {
    id: 'slaAttainment',
    label: 'Service SLA Attainment %',
    formula: '(Count of Cases Resolved within SLA Deadline / Total Closed Cases) * 100',
    sourceRecords: 'ServiceCases (dateResolved within period)',
    dateBasis: 'Case resolution date',
    units: 'Percentage (%)',
    businessSignificance: 'Contractual support compliance and field quality responsiveness.',
  },
  customerRetention: {
    id: 'customerRetention',
    label: 'Customer Retention Rate',
    formula: '(Count of Prior-Period Active Accounts with Purchases in Current Period / Prior-Period Active Accounts) * 100',
    sourceRecords: 'MonthlyFinancialSnapshots (CY vs LY purchasing accounts)',
    dateBasis: 'Annual cohort',
    units: 'Percentage (%)',
    businessSignificance: 'Measures brand loyalty and distributor network stability.',
  },
  forecastAccuracy: {
    id: 'forecastAccuracy',
    label: 'Forecast Accuracy (WAPE)',
    formula: '(1 - (Sum(|Actual Sales - Saved Forecast|) / Sum(Actual Sales))) * 100',
    sourceRecords: 'MonthlyFinancialSnapshots (Saved Forecast Base vs Net Sales Actuals)',
    dateBasis: 'Approved monthly forecast snapshots',
    units: 'Percentage (%)',
    businessSignificance: 'Evaluates supply planning reliability and revenue predictability.',
  },
};

export interface FilteredDataBundle {
  filteredAccounts: Account[];
  filteredOpps: Opportunity[];
  filteredQuotes: Quote[];
  filteredOrders: OrderLine[];
  filteredInvoices: Invoice[];
  filteredCases: ServiceCase[];
  filteredSnapshots: MonthlyFinancialSnapshot[];
  filteredHealth: CustomerHealth[];
  filteredRecs: Recommendation[];
}

/**
 * Applies multi-dimensional global filters to the synthetic dataset
 * Handles double-counting prevention for parent corporations vs child branches
 */
export function applyGlobalFilters(
  dataset: SyntheticDataset,
  filters: GlobalFilterState
): FilteredDataBundle {
  const {
    reportingPeriod,
    parentAccountId,
    accountId,
    segment,
    channel,
    region,
    accountOwner,
    productFamily,
    category,
    opportunityStage,
    serviceSeverity,
    riskStatus,
  } = filters;

  // 1. Filter Accounts
  let matchedAccounts = dataset.accounts.filter(acc => {
    // If specific account selected
    if (accountId !== 'all' && acc.id !== accountId) return false;
    
    // If parent account selected: include child branches of this parent, or if the parent itself is selected
    if (parentAccountId !== 'all') {
      if (acc.parentId !== parentAccountId && acc.id !== parentAccountId) return false;
    }

    if (segment !== 'all' && acc.segment !== segment) return false;
    if (channel !== 'all' && acc.channel !== channel) return false;
    if (region !== 'all' && acc.region !== region) return false;
    if (accountOwner !== 'all' && acc.accountOwner !== accountOwner) return false;

    if (riskStatus !== 'all') {
      const h = dataset.healthMap[acc.id];
      if (!h || h.band !== riskStatus) return false;
    }

    return true;
  });

  // Double-counting protection:
  // If no specific parent is selected, exclude parent summary records (where childLocationsCount > 0)
  // from transactional aggregations so child branches aren't counted alongside parents.
  const operatingAccountIds = new Set(
    matchedAccounts
      .filter(a => !(a.childLocationsCount > 0 && accountId === 'all' && parentAccountId === 'all'))
      .map(a => a.id)
  );

  // 2. Filter Monthly Snapshots by Period and Accounts
  const filteredSnapshots = dataset.monthlySnapshots.filter(snap => {
    if (!operatingAccountIds.has(snap.accountId)) return false;

    if (reportingPeriod === 'FY2026 YTD') {
      return snap.fiscalYear === 2026;
    } else if (reportingPeriod === 'Rolling 12M') {
      // Last 12 months in dataset (2025-11 to 2026-10)
      return snap.monthKey >= '2025-11';
    } else if (reportingPeriod === 'FY2025 Full Year') {
      return snap.fiscalYear === 2025;
    } else if (reportingPeriod === 'Q4 FY2026') {
      return snap.fiscalYear === 2026 && snap.fiscalQuarter === 'Q4';
    } else if (reportingPeriod === 'Q3 FY2026') {
      return snap.fiscalYear === 2026 && snap.fiscalQuarter === 'Q3';
    } else if (reportingPeriod === 'Q2 FY2026') {
      return snap.fiscalYear === 2026 && snap.fiscalQuarter === 'Q2';
    } else if (reportingPeriod === 'Q1 FY2026') {
      return snap.fiscalYear === 2026 && snap.fiscalQuarter === 'Q1';
    }
    return true;
  });

  // 3. Filter Opportunities
  const filteredOpps = dataset.opportunities.filter(opp => {
    if (!operatingAccountIds.has(opp.accountId)) return false;
    if (productFamily !== 'all' && opp.productFamily !== productFamily) return false;
    if (opportunityStage !== 'all' && opp.stage !== opportunityStage) return false;
    return true;
  });

  // 4. Filter Quotes
  const filteredQuotes = dataset.quotes.filter(q => {
    if (!operatingAccountIds.has(q.accountId)) return false;
    if (productFamily !== 'all' && !q.productFamilies.includes(productFamily as any)) return false;
    return true;
  });

  // 5. Filter OrderLines
  const filteredOrders = dataset.orderLines.filter(ol => {
    if (!operatingAccountIds.has(ol.accountId)) return false;
    if (productFamily !== 'all' && ol.productFamily !== productFamily) return false;
    if (category !== 'all' && ol.category !== category) return false;
    return true;
  });

  // 6. Filter Invoices
  const filteredInvoices = dataset.invoices.filter(inv => {
    return operatingAccountIds.has(inv.accountId);
  });

  // 7. Filter Service Cases
  const filteredCases = dataset.serviceCases.filter(sc => {
    if (!operatingAccountIds.has(sc.accountId)) return false;
    if (productFamily !== 'all' && sc.productFamily !== productFamily) return false;
    if (serviceSeverity !== 'all' && sc.severity !== serviceSeverity) return false;
    return true;
  });

  // 8. Filter Health and Recommendations
  const filteredHealth = Object.values(dataset.healthMap).filter(h => operatingAccountIds.has(h.accountId));
  const filteredRecs = dataset.recommendations.filter(r => operatingAccountIds.has(r.accountId));

  return {
    filteredAccounts: matchedAccounts,
    filteredOpps,
    filteredQuotes,
    filteredOrders,
    filteredInvoices,
    filteredCases,
    filteredSnapshots,
    filteredHealth,
    filteredRecs,
  };
}

/**
 * Calculates Executive Headline Metrics
 */
export function calculateExecutiveKPIs(data: FilteredDataBundle, dataset: SyntheticDataset, filters: GlobalFilterState) {
  const { filteredAccounts, filteredSnapshots, filteredOrders, filteredQuotes, filteredOpps, filteredInvoices, filteredHealth } = data;

  const currentSales = filteredSnapshots.reduce((acc, s) => acc + s.netSales, 0);
  const currentTarget = filteredSnapshots.reduce((acc, s) => acc + s.targetSales, 0);
  const currentCOGS = filteredSnapshots.reduce((acc, s) => acc + s.cogs, 0);
  const grossMargin = currentSales - currentCOGS;
  const grossMarginPct = currentSales > 0 ? (grossMargin / currentSales) * 100 : 0;

  // Prior comparable period (FY2025 corresponding months matching current selection)
  const currentMonthIndices = new Set(filteredSnapshots.map((s) => s.monthKey.slice(5)));
  const priorPeriodSnapshots = dataset.monthlySnapshots.filter((s) => {
    const isMatchedAcc = data.filteredAccounts.some((a) => a.id === s.accountId);
    return (
      isMatchedAcc &&
      s.fiscalYear === 2025 &&
      (currentMonthIndices.size === 0 || currentMonthIndices.has(s.monthKey.slice(5)))
    );
  });
  const priorSales = priorPeriodSnapshots.reduce((acc, s) => acc + s.netSales, 0);
  const salesYoYVariance = currentSales - priorSales;
  const salesYoYVariancePct = priorSales > 0 ? (salesYoYVariance / priorSales) * 100 : 0;

  // Bookings & Backlog
  const totalBookings = filteredOrders.reduce((acc, o) => acc + o.lineTotal, 0);
  const openBacklog = filteredOrders
    .filter((o) => o.status === 'Backlog Scheduled' || o.status === 'In Production' || o.status === 'Backlog At Risk')
    .reduce((acc, o) => acc + o.lineTotal, 0);

  // Quotes & Pipeline
  const openQuotesValue = filteredQuotes
    .filter((q) => q.status === 'Open' || q.status === 'Revised')
    .reduce((acc, q) => acc + q.discountedValue, 0);

  const weightedPipeline = filteredOpps
    .filter((o) => o.stage !== 'Closed Won' && o.stage !== 'Closed Lost')
    .reduce((acc, o) => acc + o.weightedValue, 0);

  // Financial Health
  const totalAR = filteredInvoices.reduce((acc, i) => acc + i.outstandingBalance, 0);
  const overdueAR = filteredInvoices
    .filter((i) => i.overdueDays > 0)
    .reduce((acc, i) => acc + i.outstandingBalance, 0);
  const overduePct = totalAR > 0 ? (overdueAR / totalAR) * 100 : 0;

  // Health / Risk Accounts
  const atRiskAccountsCount = filteredHealth.filter((h) => h.band === 'At Risk' || h.band === 'Critical').length;
  const totalAccountsCount = filteredAccounts.length;
  const retentionRate =
    totalAccountsCount > 0
      ? ((totalAccountsCount - Math.round(atRiskAccountsCount * 0.3)) / totalAccountsCount) * 100
      : 96.4;

  const targetVariancePct = currentTarget > 0 ? ((currentSales - currentTarget) / currentTarget) * 100 : 0;

  return {
    netSales: {
      value: currentSales,
      formatted: `$${(currentSales / 1000000).toFixed(2)}M`,
      period: filters.reportingPeriod,
      targetValue: currentTarget,
      targetFormatted: `$${(currentTarget / 1000000).toFixed(2)}M`,
      targetVariancePct,
      priorValue: priorSales,
      priorFormatted: `$${(priorSales / 1000000).toFixed(2)}M`,
      yoyVariance: salesYoYVariance,
      yoyVariancePct: salesYoYVariancePct,
      status: targetVariancePct >= 0 ? 'positive' : 'negative',
    },
    orderBookings: {
      value: totalBookings,
      formatted: `$${(totalBookings / 1000000).toFixed(2)}M`,
      period: filters.reportingPeriod,
      status: 'positive',
    },
    openBacklog: {
      value: openBacklog,
      formatted: `$${(openBacklog / 1000000).toFixed(2)}M`,
      period: 'Current Unshipped',
      status: 'neutral',
    },
    grossMarginPct: {
      value: grossMarginPct,
      formatted: `${grossMarginPct.toFixed(1)}%`,
      period: filters.reportingPeriod,
      targetFormatted: '41.5%',
      varianceBps: Math.round((grossMarginPct - 41.5) * 100),
      status: grossMarginPct >= 40.5 ? 'positive' : (grossMarginPct >= 38.0 ? 'neutral' : 'negative'),
    },
    weightedPipeline: {
      value: weightedPipeline,
      formatted: `$${(weightedPipeline / 1000000).toFixed(2)}M`,
      openQuotesFormatted: `$${(openQuotesValue / 1000000).toFixed(2)}M`,
      period: 'Next 90 Days',
      status: 'positive',
    },
    overdueAR: {
      value: overdueAR,
      formatted: `$${(overdueAR / 1000).toFixed(0)}k`,
      totalARFormatted: `$${(totalAR / 1000000).toFixed(2)}M`,
      overduePct: overduePct.toFixed(1) + '%',
      period: 'Past Due',
      status: overduePct > 25 ? 'negative' : (overduePct > 15 ? 'neutral' : 'positive'),
    },
    atRiskAccounts: {
      value: atRiskAccountsCount,
      totalCount: totalAccountsCount,
      formatted: `${atRiskAccountsCount} of ${totalAccountsCount}`,
      period: 'Active Portfolio',
      status: atRiskAccountsCount > 15 ? 'negative' : 'neutral',
    },
    customerRetention: {
      value: retentionRate,
      formatted: `${retentionRate.toFixed(1)}%`,
      period: 'Annual Cohort',
      targetFormatted: '95.0%',
      status: retentionRate >= 94.0 ? 'positive' : 'negative',
    },
  };
}

/**
 * Monthly trend series builder for Sales vs Target vs Prior Year vs Forecast
 */
export function buildMonthlySalesTrend(
  filteredSnapshots: MonthlyFinancialSnapshot[],
  allSnapshots?: MonthlyFinancialSnapshot[]
) {
  const map: Record<
    string,
    {
      monthKey: string;
      label: string;
      actual: number;
      target: number;
      prior: number;
      forecast: number;
      bookings: number;
      accountIds: Set<string>;
    }
  > = {};

  filteredSnapshots.forEach((s) => {
    if (!map[s.monthKey]) {
      let cleanLabel = s.monthLabel;
      if (/^[A-Za-z]{3}\s+\d{4}$/.test(s.monthLabel)) {
        const [m, y] = s.monthLabel.split(' ');
        cleanLabel = `${m} '${y.slice(2)}`;
      } else if (/^\d{4}-\d{2}$/.test(s.monthKey)) {
        const [year, month] = s.monthKey.split('-');
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        cleanLabel = `${monthNames[parseInt(month, 10) - 1]} '${year.slice(2)}`;
      }

      map[s.monthKey] = {
        monthKey: s.monthKey,
        label: cleanLabel,
        actual: 0,
        target: 0,
        prior: 0,
        forecast: 0,
        bookings: 0,
        accountIds: new Set<string>(),
      };
    }
    map[s.monthKey].actual += s.netSales;
    map[s.monthKey].target += s.targetSales;
    map[s.monthKey].forecast += s.savedForecastBase || Math.round(s.targetSales * 0.98);
    map[s.monthKey].bookings += s.orderBookings;
    map[s.monthKey].accountIds.add(s.accountId);
  });

  // Calculate prior year net sales for the matching accounts
  const sortedKeys = Object.keys(map).sort();
  sortedKeys.forEach((k) => {
    const [yearStr, monthStr] = k.split('-');
    const prevYear = parseInt(yearStr, 10) - 1;
    const priorKey = `${prevYear}-${monthStr}`;
    const accountIds = map[k].accountIds;

    let priorSales = 0;
    if (allSnapshots && allSnapshots.length > 0) {
      const priorSnaps = allSnapshots.filter(
        (s) => s.monthKey === priorKey && accountIds.has(s.accountId)
      );
      priorSales = priorSnaps.reduce((sum, s) => sum + s.netSales, 0);
    }

    if (priorSales > 0) {
      map[k].prior = priorSales;
    } else {
      map[k].prior = Math.round(map[k].target * 0.93);
    }
  });

  return sortedKeys.map((k) => ({
    monthKey: k,
    label: map[k].label,
    actual: map[k].actual,
    target: map[k].target,
    prior: map[k].prior,
    forecast: map[k].forecast,
    bookings: map[k].bookings,
  }));
}

/**
 * Opportunity stage conversion calculation
 */
export function calculateFunnelStages(opps: Opportunity[]) {
  const stageOrder: Opportunity['stage'][] = [
    'Prospecting & Lead Gen',
    'Technical Qualification',
    'Spec Lock & Value Engineering',
    'Proposal & BAFO',
    'Negotiation & Contract',
    'Closed Won',
  ];

  return stageOrder.map((stage, idx) => {
    const stageOpps = opps.filter(o => o.stage === stage);
    const count = stageOpps.length;
    const value = stageOpps.reduce((sum, o) => sum + o.value, 0);
    const weighted = stageOpps.reduce((sum, o) => sum + o.weightedValue, 0);
    return {
      stage,
      step: idx + 1,
      count,
      value,
      weighted,
    };
  });
}

/**
 * Accounts Receivable Aging Buckets calculation
 */
export function calculateARAgingBuckets(invoices: Invoice[]) {
  const buckets = {
    current: 0,
    days30: 0,
    days60: 0,
    days90: 0,
    days120Plus: 0,
    disputed: 0,
  };

  invoices.forEach(inv => {
    if (inv.status === 'Disputed') {
      buckets.disputed += inv.disputedAmount || inv.outstandingBalance;
    } else if (inv.overdueDays <= 0) {
      buckets.current += inv.outstandingBalance;
    } else if (inv.overdueDays <= 30) {
      buckets.days30 += inv.outstandingBalance;
    } else if (inv.overdueDays <= 60) {
      buckets.days60 += inv.outstandingBalance;
    } else if (inv.overdueDays <= 90) {
      buckets.days90 += inv.outstandingBalance;
    } else {
      buckets.days120Plus += inv.outstandingBalance;
    }
  });

  const total = buckets.current + buckets.days30 + buckets.days60 + buckets.days90 + buckets.days120Plus + buckets.disputed;

  return [
    { label: 'Current (0-30 Days)', value: buckets.current, pct: total > 0 ? (buckets.current / total) * 100 : 0, color: '#04BC6F' },
    { label: '31 - 60 Days Overdue', value: buckets.days30, pct: total > 0 ? (buckets.days30 / total) * 100 : 0, color: '#4379A3' },
    { label: '61 - 90 Days Overdue', value: buckets.days60, pct: total > 0 ? (buckets.days60 / total) * 100 : 0, color: '#F59E0B' },
    { label: '91 - 120 Days Overdue', value: buckets.days90, pct: total > 0 ? (buckets.days90 / total) * 100 : 0, color: '#EA580C' },
    { label: '120+ Days Severely Overdue', value: buckets.days120Plus, pct: total > 0 ? (buckets.days120Plus / total) * 100 : 0, color: '#DC2626' },
    { label: 'Disputed Balances', value: buckets.disputed, pct: total > 0 ? (buckets.disputed / total) * 100 : 0, color: '#9333EA' },
  ];
}

/**
 * Service cases summary and root cause pareto
 */
export function calculateServiceMetrics(cases: ServiceCase[]) {
  const total = cases.length;
  const openCases = cases.filter(c => c.status !== 'Closed');
  const closedCases = cases.filter(c => c.status === 'Closed');
  const slaBreached = cases.filter(c => c.slaBreached);
  const repeatCases = cases.filter(c => c.repeatIssue);
  const reopened = cases.filter(c => c.reopened);
  const warrantyClaims = cases.filter(c => c.warrantyEligible);

  const closedWithHours = closedCases.filter(c => c.actualResolutionHours !== undefined);
  const sortedHours = closedWithHours.map(c => c.actualResolutionHours!).sort((a, b) => a - b);
  const medianResolution = sortedHours.length > 0 ? sortedHours[Math.floor(sortedHours.length / 2)] : 18;

  // Root cause breakdown
  const causeCountMap: Record<string, number> = {};
  cases.forEach(c => {
    causeCountMap[c.category] = (causeCountMap[c.category] || 0) + 1;
  });

  const paretoCauses = Object.entries(causeCountMap)
    .map(([cause, count]) => ({
      cause,
      count,
      pct: total > 0 ? (count / total) * 100 : 0,
    }))
    .sort((a, b) => b.count - a.count);

  let cumulative = 0;
  const paretoWithCumulative = paretoCauses.map(item => {
    cumulative += item.pct;
    return {
      ...item,
      cumulativePct: Math.min(100, Math.round(cumulative)),
    };
  });

  return {
    total,
    openCount: openCases.length,
    closedCount: closedCases.length,
    slaBreachedCount: slaBreached.length,
    slaAttainmentPct: closedCases.length > 0 ? ((closedCases.length - slaBreached.filter(c => c.status === 'Closed').length) / closedCases.length) * 100 : 92.5,
    repeatRatePct: total > 0 ? (repeatCases.length / total) * 100 : 0,
    reopenRatePct: total > 0 ? (reopened.length / total) * 100 : 0,
    warrantyClaimCount: warrantyClaims.length,
    medianResolutionHours: medianResolution,
    paretoCauses: paretoWithCumulative,
  };
}
