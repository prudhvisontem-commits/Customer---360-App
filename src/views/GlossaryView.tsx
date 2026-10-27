/**
 * Acuity Brands Lighting - Business-Friendly Analytics & Metric Glossary
 * Structured reference for executive leadership, commercial teams, finance, and operations.
 * Includes:
 * 1. Dedicated "Definitions" tab covering every attribute and KPI across all components, visuals, and models.
 * 2. Deep-dive governance tabs for executive, commercial sales, customer service, finance, strategy, customer 360, health scoring, and product taxonomy.
 */

import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Building2,
  TrendingUp,
  Headphones,
  DollarSign,
  Briefcase,
  UserCheck,
  ShieldCheck,
  Layers,
  Search,
  Tag,
  FileText,
  Filter,
  Calculator,
  CheckCircle2,
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface GlossaryTerm {
  term: string;
  category: string;
  plainDefinition: string;
  businessSignificance: string;
  relatedKpiOrAttribute: string;
  benchmarkOrTarget?: string;
}

export interface UniversalDefinition {
  id: string;
  name: string;
  type: 'KPI' | 'Attribute' | 'Filter';
  domain:
    | 'Executive & Financials'
    | 'Sales Pipeline & Bidding'
    | 'Operations & Supply Chain'
    | 'AR, Invoicing & Credit'
    | 'Field Service & Quality'
    | 'Strategic Forecasting'
    | 'Customer 360 & Hierarchy'
    | 'Customer Health Model'
    | 'Global Dashboard Filters'
    | 'Ontology Entities & Relationships'
    | 'Geographic Mapping & Coordinates'
    | 'Order Traceability & Exceptions';
  plainDefinition: string;
  interpretationOrRelevance: string;
  formulaOrLogic?: string;
  benchmarkOrTarget?: string;
}

export const GlossaryView: React.FC = () => {
  const [activeSection, setActiveSection] = useState<
    'definitions' | 'executive' | 'sales' | 'service' | 'finance' | 'leadership' | 'profile' | 'health' | 'taxonomy'
  >('definitions');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDomain, setSelectedDomain] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<'all' | 'KPI' | 'Attribute' | 'Filter'>('all');

  const sections = [
    { id: 'definitions', label: 'Definitions (All Attributes & KPIs)', icon: FileText },
    { id: 'executive', label: 'Executive Leadership', icon: Building2 },
    { id: 'sales', label: 'Commercial Sales', icon: TrendingUp },
    { id: 'service', label: 'Customer Service & Quality', icon: Headphones },
    { id: 'finance', label: 'Finance & Working Capital', icon: DollarSign },
    { id: 'leadership', label: 'Strategic Planning', icon: Briefcase },
    { id: 'profile', label: 'Customer 360 Architecture', icon: UserCheck },
    { id: 'health', label: 'Health Scoring Model', icon: ShieldCheck },
    { id: 'taxonomy', label: 'Product & Controls Catalog', icon: Layers },
  ] as const;

  // Complete, authoritative dictionary of every attribute and KPI in the Acuity application
  const comprehensiveDefinitions: UniversalDefinition[] = [
    // ----------------------------------------------------
    // 1. EXECUTIVE & FINANCIALS
    // ----------------------------------------------------
    {
      id: 'netSales',
      name: 'Net Invoiced Sales (netSales)',
      type: 'KPI',
      domain: 'Executive & Financials',
      plainDefinition: 'The total dollar amount billed to distributors and contractors for shipped luminaires and controls, after deducting returns, rebates, and cash discounts.',
      interpretationOrRelevance: 'Primary top-line metric measuring commercial execution and demand; evaluated against budget targets to steer corporate resource deployment.',
      formulaOrLogic: 'Sum of OrderLine.lineTotal for shipped/delivered orders less authorized discounts and rebates',
      benchmarkOrTarget: 'Board-Approved Annual Operating Plan (AOP)',
    },
    {
      id: 'targetSales',
      name: 'Sales Budget Target (targetSales / annualTargetSales)',
      type: 'KPI',
      domain: 'Executive & Financials',
      plainDefinition: 'The approved revenue target allocated to a fiscal period, geographic territory, or specific distributor account.',
      interpretationOrRelevance: 'Establishes the performance standard for commercial agency quota attainment and executive incentive compensation.',
      formulaOrLogic: 'Seasonally phased budget model reflecting construction seasonality (Q2-Q3 peak)',
      benchmarkOrTarget: 'Fiscal year approved plan baseline',
    },
    {
      id: 'targetVariancePct',
      name: 'Budget Target Attainment (targetVariancePct)',
      type: 'KPI',
      domain: 'Executive & Financials',
      plainDefinition: 'The percentage of the approved sales budget achieved within the current reporting cycle.',
      interpretationOrRelevance: 'Values above 100% indicate performance ahead of plan; values below 100% flag regional pacing deficits requiring commercial intervention.',
      formulaOrLogic: '(Actual Invoiced Net Sales ÷ Budget Target Sales) × 100',
      benchmarkOrTarget: 'Target: ≥ 100.0% of phased budget',
    },
    {
      id: 'grossMargin',
      name: 'Gross Margin Dollars (grossMargin)',
      type: 'KPI',
      domain: 'Executive & Financials',
      plainDefinition: 'Total net invoiced revenue remaining after subtracting standard direct manufacturing product costs (COGS).',
      interpretationOrRelevance: 'Quantifies raw operating profit available to fund corporate R&D, commercial sales commissions, and SG&A expenses.',
      formulaOrLogic: 'Net Invoiced Sales - Cost of Goods Sold (COGS)',
      benchmarkOrTarget: 'Maintained above corporate operating hurdles across product lines',
    },
    {
      id: 'grossMarginPct',
      name: 'Gross Margin Percentage (grossMarginPct)',
      type: 'KPI',
      domain: 'Executive & Financials',
      plainDefinition: 'Gross margin profit dollars expressed as a percentage of total net invoiced sales.',
      interpretationOrRelevance: 'Higher percentages indicate strong pricing discipline and high-margin product mix, such as nLight controls attached to architectural fixtures.',
      formulaOrLogic: '((Net Sales - Cost of Goods Sold) ÷ Net Sales) × 100',
      benchmarkOrTarget: 'Corporate benchmark: ≥ 40.0% consolidated gross margin',
    },
    {
      id: 'cogs',
      name: 'Cost of Goods Sold (cogs)',
      type: 'Attribute',
      domain: 'Executive & Financials',
      plainDefinition: 'Standard direct costs incurred to manufacture luminaires, including sheet metal, LED boards, eldoLED drivers, direct plant labor, and factory overhead.',
      interpretationOrRelevance: 'Reflects manufacturing efficiency and raw material cost discipline across Acuity assembly facilities in Georgia and Mexico.',
      formulaOrLogic: 'Standard Bill of Materials (BOM) cost roll-up per luminaire SKU',
      benchmarkOrTarget: 'Tracked against plant absorption and standard cost variance thresholds',
    },
    {
      id: 'openBacklog',
      name: 'Open Order Backlog (openBacklog)',
      type: 'KPI',
      domain: 'Executive & Financials',
      plainDefinition: 'The total dollar value of confirmed customer purchase orders scheduled for production or awaiting factory shipment.',
      interpretationOrRelevance: 'Provides critical forward-looking visibility into factory line utilization and near-term revenue conversion.',
      formulaOrLogic: 'Sum of OrderLine.lineTotal where status is "In Production", "Backlog Scheduled", or "Backlog At Risk"',
      benchmarkOrTarget: 'Healthy backlog maintains 4-6 weeks of manufacturing run-rate',
    },
    {
      id: 'momPct',
      name: 'Month-over-Month Growth (momPct)',
      type: 'KPI',
      domain: 'Executive & Financials',
      plainDefinition: 'The rate of revenue change comparing the most recent closed month directly against the immediately preceding calendar month.',
      interpretationOrRelevance: 'Detects short-term commercial velocity, seasonal inflection points, or sudden channel pauses before quarterly financials close.',
      formulaOrLogic: '((Sales in Month N - Sales in Month N-1) ÷ Sales in Month N-1) × 100',
      benchmarkOrTarget: 'Positive trajectory during active spring/summer commercial construction cycles',
    },
    {
      id: 'yoyVariancePct',
      name: 'Year-over-Year Growth (yoyVariancePct)',
      type: 'KPI',
      domain: 'Executive & Financials',
      plainDefinition: 'The percentage difference in invoiced revenue compared to the exact same calendar period in the previous fiscal year.',
      interpretationOrRelevance: 'Eliminates weather and seasonal construction distortions to assess true organic annual business expansion.',
      formulaOrLogic: '((Current Period Sales - Prior Year Period Sales) ÷ Prior Year Period Sales) × 100',
      benchmarkOrTarget: 'Long-term corporate organic growth target: +3% to +6% YoY',
    },
    {
      id: 'otifRate',
      name: 'On-Time In-Full Delivery (otifRate)',
      type: 'KPI',
      domain: 'Executive & Financials',
      plainDefinition: 'The percentage of customer orders manufactured and delivered complete on or before the committed factory promise date.',
      interpretationOrRelevance: 'Core supply chain reliability KPI; late shipments risk contractor jobsite delay penalties and distributor order cancellations.',
      formulaOrLogic: '(Count of On-Time Delivered Order Lines ÷ Total Delivered Order Lines) × 100',
      benchmarkOrTarget: 'Corporate operational hurdle: ≥ 95.0% on-time delivery',
    },
    {
      id: 'dso',
      name: 'Days Sales Outstanding (dso)',
      type: 'KPI',
      domain: 'Executive & Financials',
      plainDefinition: 'The average number of calendar days it takes Acuity to collect cash payments from distributors following the issuance of an invoice.',
      interpretationOrRelevance: 'Directly influences working capital liquidity; faster collection cycles release cash for operational reinvestment.',
      formulaOrLogic: '(Total Outstanding Receivables ÷ Net Sales) × 365 days',
      benchmarkOrTarget: 'Credit department operational hurdle: ≤ 42 Days under standard 2/10 Net 30 terms',
    },

    // ----------------------------------------------------
    // 2. SALES PIPELINE & BIDDING
    // ----------------------------------------------------
    {
      id: 'pipelineValue',
      name: 'Total Pipeline Value (pipelineValue)',
      type: 'KPI',
      domain: 'Sales Pipeline & Bidding',
      plainDefinition: 'The aggregate unweighted face value of all active project bids and commercial opportunities currently in the sales funnel.',
      interpretationOrRelevance: 'Represents maximum potential market demand across all specification and bidding stages.',
      formulaOrLogic: 'Sum of Opportunity.value across all open opportunity stages',
      benchmarkOrTarget: 'Target pipeline coverage: ≥ 3.0× quarterly revenue target',
    },
    {
      id: 'weightedPipeline',
      name: 'Risk-Adjusted Weighted Pipeline (weightedPipeline / weightedValue)',
      type: 'KPI',
      domain: 'Sales Pipeline & Bidding',
      plainDefinition: 'The estimated future project revenue discounted by the historical probability of winning at each respective qualification gate.',
      interpretationOrRelevance: 'Provides realistic demand forecasts for plant capacity planning by removing speculative bidding optimism.',
      formulaOrLogic: 'Sum of (Opportunity.value × Opportunity.winProbability)',
      benchmarkOrTarget: 'Expected realization baseline for rolling 90-day shipments',
    },
    {
      id: 'winRate',
      name: 'Quotation Win Rate (winRate)',
      type: 'KPI',
      domain: 'Sales Pipeline & Bidding',
      plainDefinition: 'The percentage of closed project quotations and competitive bids won against third-party fixture manufacturers.',
      interpretationOrRelevance: 'Measures sales agency competitiveness, contractor relationships, and specification durability.',
      formulaOrLogic: '(Total Won Deal Value or Count ÷ Total Closed [Won + Lost] Deal Value or Count) × 100',
      benchmarkOrTarget: 'Commercial target: ≥ 48.0% across commercial & industrial bids',
    },
    {
      id: 'avgDealCycleDays',
      name: 'Average Deal Cycle Time (avgDealCycleDays)',
      type: 'KPI',
      domain: 'Sales Pipeline & Bidding',
      plainDefinition: 'The average number of elapsed calendar days from initial project quotation creation to final contract award.',
      interpretationOrRelevance: 'Tracks commercial bid velocity; lengthening cycles indicate scope re-engineering or contractor project delays.',
      formulaOrLogic: 'Average(Opportunity Close Date - Opportunity Creation Date in days)',
      benchmarkOrTarget: 'Target: ≤ 45 days for standard commercial office specifications',
    },
    {
      id: 'oppStage',
      name: 'Opportunity Stage (Opportunity.stage)',
      type: 'Attribute',
      domain: 'Sales Pipeline & Bidding',
      plainDefinition: 'The formal milestone in Acuity\'s commercial sales process (Prospecting, Qualification, Spec Lock, Proposal & BAFO, Negotiation, Closed Won, Closed Lost).',
      interpretationOrRelevance: 'Determines the calibrated probability of winning and drives commercial sales resource allocation.',
      formulaOrLogic: 'Prospecting (10%), Qualification (25%), Spec Lock (50%), Proposal/BAFO (75%), Negotiation (90%), Won (100%)',
      benchmarkOrTarget: 'Must advance through structured qualification gates',
    },
    {
      id: 'winProbability',
      name: 'Win Probability (Opportunity.winProbability)',
      type: 'Attribute',
      domain: 'Sales Pipeline & Bidding',
      plainDefinition: 'The mathematical likelihood (0.00 to 1.00) that an open project bid will culminate in a confirmed purchase order.',
      interpretationOrRelevance: 'Calibrated using historical stage conversion rates combined with specification lock tier verification.',
      formulaOrLogic: 'Historical Stage Multiplier adjusted for specifier tier lock',
      benchmarkOrTarget: 'Standardized by stage to prevent sales rep optimism bias',
    },
    {
      id: 'stageAgeDays',
      name: 'Stage Age (Opportunity.stageAgeDays)',
      type: 'Attribute',
      domain: 'Sales Pipeline & Bidding',
      plainDefinition: 'The consecutive number of calendar days an opportunity has remained in its current sales stage without progressing.',
      interpretationOrRelevance: 'Highlights stalled project bids at risk of competitor substitution or contractor value engineering.',
      formulaOrLogic: 'Current Date - Date of last stage transition',
      benchmarkOrTarget: 'Review triggered when stage age exceeds 30 days',
    },
    {
      id: 'riskFactor',
      name: 'Opportunity Risk Factor (Opportunity.riskFactor)',
      type: 'Attribute',
      domain: 'Sales Pipeline & Bidding',
      plainDefinition: 'Specific commercial vulnerability flagged against a project bid (e.g., Stalled in Proposal, Competitor Price Concession, Spec Substituted).',
      interpretationOrRelevance: 'Directs sales managers to take targeted actions, such as offering contractor terms or arranging factory engineering reviews.',
      formulaOrLogic: 'Automated CRM logic based on stage age, quote revisions, and competitor signals',
      benchmarkOrTarget: 'Active mitigation plan required for all high-value flagged deals',
    },
    {
      id: 'projectType',
      name: 'Project Construction Type (Opportunity.projectType)',
      type: 'Attribute',
      domain: 'Sales Pipeline & Bidding',
      plainDefinition: 'The architectural building classification of the project (Commercial Office, High-Bay Logistics, Healthcare, Education, Infrastructure, Retail).',
      interpretationOrRelevance: 'Identifies end-market demand trends and aligns specification packaging with sector-specific energy codes.',
      benchmarkOrTarget: 'Segment-specific luminaire bundles (e.g. Healthcare requires sealed cleanroom fixtures)',
    },
    {
      id: 'quoteDiscountedValue',
      name: 'Quoted Price Realization (Quote.discountedValue)',
      type: 'Attribute',
      domain: 'Sales Pipeline & Bidding',
      plainDefinition: 'The net pricing submitted to electrical distributors after applying approved volume rebate tiers and project price concessions.',
      interpretationOrRelevance: 'Balances competitive pricing necessary to secure major job contracts against corporate gross margin requirements.',
      formulaOrLogic: 'Gross Catalog Value × (1 - Approved Trade Discount Percentage)',
      benchmarkOrTarget: 'Minimum gross margin floor enforced by automated approval thresholds',
    },
    {
      id: 'competitorPressure',
      name: 'Competitor Pressure Level (Quote.competitorPressure)',
      type: 'Attribute',
      domain: 'Sales Pipeline & Bidding',
      plainDefinition: 'Assessment of competitive fixture bidding intensity (High, Medium, Low) based on distributor and agency market intelligence.',
      interpretationOrRelevance: 'Alerts sales directors to aggressive competitor price-cutting that may require value engineering or bundled controls incentives.',
      benchmarkOrTarget: 'High pressure triggers executive review of margin trade-offs',
    },

    // ----------------------------------------------------
    // 3. OPERATIONS & SUPPLY CHAIN
    // ----------------------------------------------------
    {
      id: 'orderStatus',
      name: 'Order Fulfillment Status (OrderLine.status)',
      type: 'Attribute',
      domain: 'Operations & Supply Chain',
      plainDefinition: 'The current factory operational state of an order line item (Delivered, Shipped, In Production, Backlog Scheduled, Backlog At Risk).',
      interpretationOrRelevance: 'Provides end-to-end visibility into factory progress and alerts logistics teams to potential shipment delays.',
      benchmarkOrTarget: 'Orders scheduled for release within committed factory lead times',
    },
    {
      id: 'onTimeStatus',
      name: 'Delivery Delay Classification (OrderLine.onTimeStatus)',
      type: 'Attribute',
      domain: 'Operations & Supply Chain',
      plainDefinition: 'Timeliness classification indicating whether an order shipped on time or was delayed by supplier parts or freight bottlenecks.',
      interpretationOrRelevance: 'Isolates the root causes of delivery delays between raw material vendor stockouts and freight carrier logistics.',
      formulaOrLogic: 'Comparison between committed promise ship date and actual factory shipping stamp',
      benchmarkOrTarget: 'Target: On-Time for ≥ 95% of customer shipments',
    },
    {
      id: 'requiredShipDate',
      name: 'Required Promise Ship Date (OrderLine.requiredShipDate)',
      type: 'Attribute',
      domain: 'Operations & Supply Chain',
      plainDefinition: 'The agreed customer delivery date acknowledged on the official purchase order confirmation.',
      interpretationOrRelevance: 'The foundational benchmark against which plant manufacturing schedules and OTIF fulfillment compliance are audited.',
      benchmarkOrTarget: 'Lockstep alignment with contractor construction project milestone schedules',
    },
    {
      id: 'unitPrice',
      name: 'Delivered Unit Price (OrderLine.unitPrice)',
      type: 'Attribute',
      domain: 'Operations & Supply Chain',
      plainDefinition: 'The net billing price per unit charged to the distributor for an individual luminaire SKU or controls device.',
      interpretationOrRelevance: 'Measures realized pricing power and verifies that negotiated quote discounts match billing invoices.',
      benchmarkOrTarget: 'Maintains parity with approved project quote agreements',
    },
    {
      id: 'lineTotal',
      name: 'Order Line Dollar Total (OrderLine.lineTotal)',
      type: 'Attribute',
      domain: 'Operations & Supply Chain',
      plainDefinition: 'The total monetary value of an individual purchase order line, calculated by multiplying order quantity by the net unit price.',
      interpretationOrRelevance: 'The core transactional revenue unit that aggregates into gross invoiced sales and account purchase histories.',
      formulaOrLogic: 'Delivered Quantity × Unit Price',
      benchmarkOrTarget: 'Source transaction logged in SAP ERP Sales & Distribution module',
    },
    {
      id: 'orderBookings',
      name: 'Commercial Order Bookings (orderBookings)',
      type: 'KPI',
      domain: 'Operations & Supply Chain',
      plainDefinition: 'The total dollar value of newly confirmed customer purchase orders booked during a given calendar period.',
      interpretationOrRelevance: 'When bookings exceed invoiced sales (Book-to-Bill ratio > 1.0), the company is building backlog and entering a growth phase.',
      formulaOrLogic: 'Sum of all purchase orders booked within the designated fiscal month',
      benchmarkOrTarget: 'Target Book-to-Bill ratio: ≥ 1.05 during active construction quarters',
    },

    // ----------------------------------------------------
    // 4. AR, INVOICING & CREDIT
    // ----------------------------------------------------
    {
      id: 'totalAR',
      name: 'Total Accounts Receivable (totalAR)',
      type: 'KPI',
      domain: 'AR, Invoicing & Credit',
      plainDefinition: 'The aggregate dollar balance owed to Acuity across all issued, unpaid distributor invoices.',
      interpretationOrRelevance: 'Measures total trade credit capital extended across the commercial distribution channel.',
      formulaOrLogic: 'Sum of Invoice.outstandingBalance across all open customer accounts',
      benchmarkOrTarget: 'Managed within approved working capital liquidity covenants',
    },
    {
      id: 'currentAR',
      name: 'Current Accounts Receivable (currentAR)',
      type: 'KPI',
      domain: 'AR, Invoicing & Credit',
      plainDefinition: 'Outstanding invoice amounts that remain within contractual payment terms (e.g., within 30 days of issue).',
      interpretationOrRelevance: 'Represents healthy, predictable receivables expected to convert into operating cash flow on schedule.',
      formulaOrLogic: 'Sum of Invoice.outstandingBalance where overdueDays == 0',
      benchmarkOrTarget: 'Target: ≥ 80.0% of total receivables ledger in Current status',
    },
    {
      id: 'overdueAR',
      name: 'Overdue Accounts Receivable (overdueAR)',
      type: 'KPI',
      domain: 'AR, Invoicing & Credit',
      plainDefinition: 'The dollar amount of unpaid invoices that have exceeded their agreed contractual payment due date.',
      interpretationOrRelevance: 'Presents working capital liquidity risk and triggers automated collections workflows to avoid bad debt write-offs.',
      formulaOrLogic: 'Sum of Invoice.outstandingBalance where overdueDays > 0',
      benchmarkOrTarget: 'Credit goal: Overdue receivables kept under 15% of total portfolio',
    },
    {
      id: 'overduePct',
      name: 'Overdue AR Percentage (overduePct)',
      type: 'KPI',
      domain: 'AR, Invoicing & Credit',
      plainDefinition: 'Overdue accounts receivable expressed as a percentage of total outstanding receivables balance.',
      interpretationOrRelevance: 'Primary metric for assessing portfolio credit risk; values exceeding 20% indicate broad distributor liquidity strain.',
      formulaOrLogic: '(Overdue AR Dollars ÷ Total Outstanding AR Dollars) × 100',
      benchmarkOrTarget: 'Healthy credit threshold: < 15.0% overdue ratio',
    },
    {
      id: 'disputedAmount',
      name: 'Disputed Invoice Deductions (disputedAmount)',
      type: 'KPI',
      domain: 'AR, Invoicing & Credit',
      plainDefinition: 'The dollar balance of customer payments withheld due to billing discrepancies, freight claims, or missing tax exemption certificates.',
      interpretationOrRelevance: 'Highlights operational billing friction; high dispute volumes delay cash collections even from creditworthy distributor partners.',
      formulaOrLogic: 'Sum of disputed amounts on invoices flagged with an open dispute status',
      benchmarkOrTarget: 'Operational target: Disputed balance < 3.5% of total receivables',
    },
    {
      id: 'overdueDays',
      name: 'Overdue Aging Days (Invoice.overdueDays)',
      type: 'Attribute',
      domain: 'AR, Invoicing & Credit',
      plainDefinition: 'The number of calendar days an unpaid invoice has remained outstanding past its contractual due date.',
      interpretationOrRelevance: 'Determines which aging bracket (1-30, 31-60, 61-90, 90+) an invoice falls into, triggering escalating dunning protocols.',
      formulaOrLogic: 'Max(0, Current Date - Invoice Due Date in days)',
      benchmarkOrTarget: 'Zero accounts allowed to cross into the 90+ days past-due tier',
    },
    {
      id: 'invoiceStatus',
      name: 'Invoice Payment Status (Invoice.status)',
      type: 'Attribute',
      domain: 'AR, Invoicing & Credit',
      plainDefinition: 'The current accounting lifecycle status of an invoice (Paid, Open Current, Overdue 30, Overdue 60, Overdue 90+, Disputed).',
      interpretationOrRelevance: 'Enables credit analysts to separate routine payment pacing from serious delinquencies or administrative disputes.',
      benchmarkOrTarget: 'Tracks progression through high-radius dunning schedules',
    },
    {
      id: 'disputeReason',
      name: 'Invoice Dispute Root Cause (Invoice.disputeReason)',
      type: 'Attribute',
      domain: 'AR, Invoicing & Credit',
      plainDefinition: 'The specific operational justification provided for withholding payment (Price Discrepancy, Damaged Shipment, Freight Dispute, Tax Exemption Missing).',
      interpretationOrRelevance: 'Directs the deduction claim to the appropriate department (Pricing, Shipping, or Credit) for rapid resolution.',
      benchmarkOrTarget: 'Target dispute resolution: ≤ 14 business days from notification',
    },
    {
      id: 'paymentMethod',
      name: 'Payment Settlement Method (Payment.method)',
      type: 'Attribute',
      domain: 'AR, Invoicing & Credit',
      plainDefinition: 'The banking mechanism used to settle customer invoices (ACH Transfer, Wire Settlement, Lockbox Check, Credit Card).',
      interpretationOrRelevance: 'Automated electronic settlements (ACH/Wire) accelerate cash availability and reduce payment processing overhead.',
      benchmarkOrTarget: 'Corporate treasury preference: ≥ 85% electronic ACH/Wire adoption',
    },
    {
      id: 'creditLimit',
      name: 'Authorized Credit Limit (Account.creditLimit)',
      type: 'Attribute',
      domain: 'AR, Invoicing & Credit',
      plainDefinition: 'The maximum total credit exposure (unpaid invoices plus open scheduled orders) permitted for an account without executive override.',
      interpretationOrRelevance: 'Approved by treasury and credit committees to protect Acuity from customer insolvency and write-offs.',
      benchmarkOrTarget: 'Reassessed annually using commercial credit scoring and historical payment pacing',
    },
    {
      id: 'creditUtilization',
      name: 'Credit Line Utilization (creditUtilizationPct)',
      type: 'KPI',
      domain: 'AR, Invoicing & Credit',
      plainDefinition: 'The percentage of an account\'s authorized commercial credit limit currently absorbed by open receivables and unshipped orders.',
      interpretationOrRelevance: 'Utilization > 85% triggers automated early warnings; utilization > 100% places an automatic shipping block on the account.',
      formulaOrLogic: '((Outstanding Receivables + Open Scheduled Backlog) ÷ Approved Credit Limit) × 100',
      benchmarkOrTarget: 'Warning threshold: > 85%; Hard stop: > 100%',
    },
    {
      id: 'creditHold',
      name: 'Credit Hold Administrative Flag (Account.creditHold)',
      type: 'Attribute',
      domain: 'AR, Invoicing & Credit',
      plainDefinition: 'An administrative block placed on a customer account due to severe payment delinquency or exceeding authorized credit limits.',
      interpretationOrRelevance: 'Immediately stops factory releases and halts new order entries until payment is verified by the credit department.',
      benchmarkOrTarget: 'Requires verified payment or credit committee override to release',
    },

    // ----------------------------------------------------
    // 5. FIELD SERVICE & QUALITY
    // ----------------------------------------------------
    {
      id: 'slaAttainmentPct',
      name: 'Service SLA Resolution Compliance (slaAttainmentPct)',
      type: 'KPI',
      domain: 'Field Service & Quality',
      plainDefinition: 'The percentage of customer support cases and warranty claims resolved within contractual turnaround deadlines.',
      interpretationOrRelevance: 'Key measure of field responsiveness; swift resolution prevents contractor jobsite delays and preserves distributor trust.',
      formulaOrLogic: '(Count of Cases Resolved within SLA Target ÷ Total Resolved Cases) × 100',
      benchmarkOrTarget: 'Customer service operational hurdle: ≥ 95.0% adherence',
    },
    {
      id: 'actualResolutionHours',
      name: 'Mean Time to Resolution - MTTR (actualResolutionHours)',
      type: 'KPI',
      domain: 'Field Service & Quality',
      plainDefinition: 'The average number of elapsed hours from the initial logging of a support ticket to its final resolution and closure.',
      interpretationOrRelevance: 'Measures field engineering efficiency; shorter MTTR reduces contractor jobsite downtime during critical commissioning phases.',
      formulaOrLogic: 'Average(Case Resolution Date/Time - Case Opened Date/Time in hours)',
      benchmarkOrTarget: 'Target: ≤ 24 hours for standard tickets; ≤ 4 hours for Critical P1 issues',
    },
    {
      id: 'repeatRatePct',
      name: 'Repeat Technical Incident Rate (repeatRatePct)',
      type: 'KPI',
      domain: 'Field Service & Quality',
      plainDefinition: 'The percentage of customer cases originating from accounts or jobsites that have logged recurring component failures within a 90-day window.',
      interpretationOrRelevance: 'Identifies chronic jobsite installation issues, generator power surges, or batch-level component vulnerabilities.',
      formulaOrLogic: '(Count of Repeat Failure Cases ÷ Total Registered Cases) × 100',
      benchmarkOrTarget: 'Quality ceiling: < 8.0% repeat ticket rate across all product families',
    },
    {
      id: 'csatScore',
      name: 'Customer Satisfaction Score (csatScore)',
      type: 'KPI',
      domain: 'Field Service & Quality',
      plainDefinition: 'Post-resolution customer feedback rating submitted by contractors or distributors on a 1.0 to 5.0 scale.',
      interpretationOrRelevance: 'Evaluates customer experience and technical service quality; scores below 3.5 trigger an automated managerial review.',
      formulaOrLogic: 'Arithmetic mean of returned post-case survey scores',
      benchmarkOrTarget: 'Quality goal: ≥ 4.5 / 5.0 customer satisfaction rating',
    },
    {
      id: 'caseSeverity',
      name: 'Service Case Severity Tier (ServiceCase.severity)',
      type: 'Attribute',
      domain: 'Field Service & Quality',
      plainDefinition: 'Standardized urgency ranking (Critical, High, Medium, Low) that sets contractual resolution response windows.',
      interpretationOrRelevance: 'Ensures urgent life safety or emergency lighting failures receive immediate field application engineering deployment.',
      formulaOrLogic: 'Critical (4-hr SLA), High (24-hr SLA), Medium (48-hr SLA), Low (96-hr SLA)',
      benchmarkOrTarget: 'Zero unaddressed Critical P1 tickets exceeding 4 hours',
    },
    {
      id: 'serviceCategory',
      name: 'Root Cause Failure Category (ServiceCase.category)',
      type: 'Attribute',
      domain: 'Field Service & Quality',
      plainDefinition: 'The primary technical root cause assigned to a warranty claim (e.g., eldoLED Driver Failure, nLight Network Commissioning, Firmware Incompatibility, Lens Blemish).',
      interpretationOrRelevance: 'Feeds quality engineering Pareto analyses to drive corrective manufacturing improvements in Acuity assembly plants.',
      benchmarkOrTarget: 'Used to prioritize design and firmware updates with factory engineering',
    },
    {
      id: 'slaBreached',
      name: 'SLA Breached Indicator (ServiceCase.slaBreached)',
      type: 'Attribute',
      domain: 'Field Service & Quality',
      plainDefinition: 'A boolean flag marking whether a service case exceeded its contractual turnaround deadline without being resolved.',
      interpretationOrRelevance: 'Highlights operational bottlenecks in technical support and pinpoints accounts at risk of customer dissatisfaction.',
      formulaOrLogic: 'True if actual resolution hours exceed the contractual slaDeadlineHours',
      benchmarkOrTarget: 'Escalated immediately to regional customer care director',
    },
    {
      id: 'warrantyApproved',
      name: 'Warranty Coverage Authorization (ServiceCase.warrantyApproved)',
      type: 'Attribute',
      domain: 'Field Service & Quality',
      plainDefinition: 'Verification flag confirming that component replacement or contractor labor reimbursement is covered under Acuity\'s 5-year commercial warranty.',
      interpretationOrRelevance: 'Protects warranty reserve funds while ensuring authorized claims are expedited without distributor friction.',
      benchmarkOrTarget: 'Governed by published Acuity Brands commercial warranty terms',
    },
    {
      id: 'assignedEngineer',
      name: 'Assigned Field Application Engineer (ServiceCase.assignedEngineer)',
      type: 'Attribute',
      domain: 'Field Service & Quality',
      plainDefinition: 'The specialized factory or regional application engineer assigned to troubleshoot and resolve a technical support ticket.',
      interpretationOrRelevance: 'Enables support workload balancing and tracks individual engineering resolution performance.',
      benchmarkOrTarget: 'Assigned within 30 minutes of Critical P1 case registration',
    },

    // ----------------------------------------------------
    // 6. STRATEGIC FORECASTING
    // ----------------------------------------------------
    {
      id: 'forecastAccuracyWape',
      name: 'Forecast Accuracy - WAPE (forecastAccuracyWape)',
      type: 'KPI',
      domain: 'Strategic Forecasting',
      plainDefinition: 'Weighted Absolute Percentage Error measuring how closely commercial demand forecasts matched actual delivered product sales.',
      interpretationOrRelevance: 'High forecast accuracy prevents costly factory component shortages and minimizes excess warehouse buffer inventory.',
      formulaOrLogic: '(1 - (Sum(|Actual Sales - Forecasted Sales|) ÷ Sum(Actual Sales))) × 100',
      benchmarkOrTarget: 'Executive performance standard: ≥ 90.0% WAPE across a 12-month horizon',
    },
    {
      id: 'forecastBiasPct',
      name: 'Commercial Forecast Bias (forecastBiasPct)',
      type: 'KPI',
      domain: 'Strategic Forecasting',
      plainDefinition: 'A mathematical measure indicating whether commercial teams systematically over-forecast (optimism bias) or under-forecast (conservatism bias) future sales.',
      interpretationOrRelevance: 'Identifies behavioral forecasting tendencies so that manufacturing capacity plans can be calibrated accurately.',
      formulaOrLogic: '((Total Forecasted Sales - Total Actual Sales) ÷ Total Actual Sales) × 100',
      benchmarkOrTarget: 'Balanced governance target: Maintained within ±3.0% of actual sales',
    },
    {
      id: 'netRevenueRetention',
      name: 'Net Revenue Retention - NRR (netRevenueRetention)',
      type: 'KPI',
      domain: 'Strategic Forecasting',
      plainDefinition: 'Measures organic annual revenue expansion from established customer accounts, accounting for cross-selling gains minus customer contraction or churn.',
      interpretationOrRelevance: 'An NRR above 100% demonstrates that existing distributor relationships are expanding without relying solely on opening new branch territories.',
      formulaOrLogic: '((Prior Cohort Current Spend - Churn + Cross-Sell Expansion) ÷ Prior Cohort Baseline Spend) × 100',
      benchmarkOrTarget: 'Healthy enterprise benchmark: 102.0% to 106.0%',
    },
    {
      id: 'concentrationTop10Pct',
      name: 'Top 10 Account Concentration (concentrationTop10Pct)',
      type: 'KPI',
      domain: 'Strategic Forecasting',
      plainDefinition: 'The percentage of total commercial invoiced revenue generated by Acuity\'s 10 largest national distributor networks (e.g., Sonepar, Graybar, WESCO, Rexel, CED).',
      interpretationOrRelevance: 'Provides executive oversight into customer dependency risk and informs multi-year partner contract governance.',
      formulaOrLogic: '(Combined Net Sales of Top 10 Customer Accounts ÷ Total Portfolio Net Sales) × 100',
      benchmarkOrTarget: 'Risk management threshold: Concentration between 40.0% and 48.0%',
    },
    {
      id: 'savedForecastBase',
      name: 'Forecast Demand Baseline (savedForecastBase)',
      type: 'Attribute',
      domain: 'Strategic Forecasting',
      plainDefinition: 'The core consensus demand forecast generated by blending statistical sales run-rates with regional sales agency project pipelines.',
      interpretationOrRelevance: 'Serves as the foundation for manufacturing procurement, plant staffing, and annual financial planning.',
      benchmarkOrTarget: 'Updated monthly as part of the formal Sales & Operations Planning (S&OP) cycle',
    },
    {
      id: 'scenarioModeler',
      name: 'Scenario Sensitivity Vectors (savedForecastUpside / Downside)',
      type: 'Attribute',
      domain: 'Strategic Forecasting',
      plainDefinition: 'Parametric simulation models reflecting commercial upside (+8% volume, +120 bps margin) and downside (-8% volume) market conditions.',
      interpretationOrRelevance: 'Equips executive leadership to stress-test plant capacity and financial liquidity against economic shifts and commodity volatility.',
      formulaOrLogic: 'Upside: Base × 1.08; Downside: Base × 0.92',
      benchmarkOrTarget: 'Stress-tested quarterly against commodity raw material price swings',
    },

    // ----------------------------------------------------
    // 7. CUSTOMER 360 & HIERARCHY
    // ----------------------------------------------------
    {
      id: 'accountId',
      name: 'Canonical Account ID (Account.id)',
      type: 'Attribute',
      domain: 'Customer 360 & Hierarchy',
      plainDefinition: 'The unique master data identification code (e.g., ABL-CUST-1001) indexing each customer account across corporate systems.',
      interpretationOrRelevance: 'The primary key linking SAP ERP billing records, Salesforce CRM opportunities, and ServiceNow CSM cases into a unified 360 view.',
      benchmarkOrTarget: 'Must be populated on every transactional record across all data sources',
    },
    {
      id: 'accountTier',
      name: 'Commercial Relationship Tier (Account.tier)',
      type: 'Attribute',
      domain: 'Customer 360 & Hierarchy',
      plainDefinition: 'Strategic partnership classification (Strategic Platinum, Premier Gold, Core Silver, Emerging Bronze) based on annual revenue and growth commitments.',
      interpretationOrRelevance: 'Determines commercial rebate percentages, dedicated customer care teams, and executive sponsorship access.',
      benchmarkOrTarget: 'Platinum accounts receive executive committee quarterly reviews',
    },
    {
      id: 'customerSegment',
      name: 'Customer Industry Segment (Account.segment)',
      type: 'Attribute',
      domain: 'Customer 360 & Hierarchy',
      plainDefinition: 'The primary commercial business model of the customer (Electrical Distributor, Electrical Contractor, OEM Manufacturer, Specifier, Direct Enterprise, ESCO).',
      interpretationOrRelevance: 'Defines standard go-to-market strategies, contract pricing tiers, and channel conflict rules.',
      benchmarkOrTarget: 'Governs specialized commercial product catalog access',
    },
    {
      id: 'commercialChannel',
      name: 'Commercial Sales Channel (Account.channel)',
      type: 'Attribute',
      domain: 'Customer 360 & Hierarchy',
      plainDefinition: 'The commercial route-to-market path (C&I Electrical Distribution, Contractor Direct, OEM Sales, Specifier Influenced, Retail & Renovation, Government).',
      interpretationOrRelevance: 'Governs independent sales agency commission structures and territorial exclusivity agreements.',
      benchmarkOrTarget: 'Aligns commercial agency representation across regional markets',
    },
    {
      id: 'salesRegion',
      name: 'Sales Region & Territory (Account.region / territory)',
      type: 'Attribute',
      domain: 'Customer 360 & Hierarchy',
      plainDefinition: 'The geographic management division (East, South, Midwest, West, Canada) and local commercial agency sales territory.',
      interpretationOrRelevance: 'Drives regional quota allocation, local sales leadership accountability, and field engineering support deployment.',
      benchmarkOrTarget: 'Balanced to ensure comprehensive market coverage across North America',
    },
    {
      id: 'parentEnterprise',
      name: 'Parent Enterprise Hierarchy (Account.parentName / parentId)',
      type: 'Attribute',
      domain: 'Customer 360 & Hierarchy',
      plainDefinition: 'The national corporate parent linking multiple regional operating branches and distribution centers into a unified enterprise hierarchy.',
      interpretationOrRelevance: 'Provides executive visibility into total enterprise buying power while supporting local branch order execution.',
      benchmarkOrTarget: 'Complete corporate linkage across major national distributor chains',
    },
    {
      id: 'childLocationsCount',
      name: 'Operating Branch Locations Count (Account.childLocationsCount)',
      type: 'Attribute',
      domain: 'Customer 360 & Hierarchy',
      plainDefinition: 'The number of active branch locations, local supply counters, and warehouses operated under a parent distributor account.',
      interpretationOrRelevance: 'Measures physical distribution reach and local market penetration across North American trade areas.',
      benchmarkOrTarget: 'Updated through annual distributor relationship audits',
    },
    {
      id: 'contactDecisionPower',
      name: 'Stakeholder Decision Authority (Contact.decisionPower)',
      type: 'Attribute',
      domain: 'Customer 360 & Hierarchy',
      plainDefinition: 'Assessment of a customer contact\'s decision-making influence (High, Medium, Low) on luminaire specifications and purchasing awards.',
      interpretationOrRelevance: 'Prioritizes commercial sales engagement with economic buyers and chief specifiers to protect project bids.',
      benchmarkOrTarget: 'Target: At least 3 High-influence decision-makers mapped per Platinum partner',
    },
    {
      id: 'nLightCertified',
      name: 'Acuity Academy Technical Certification (Contact.nLightCertified)',
      type: 'Attribute',
      domain: 'Customer 360 & Hierarchy',
      plainDefinition: 'Verification that distributor or contractor staff have completed authorized technical training on nLight networked controls commissioning.',
      interpretationOrRelevance: 'Certified partners achieve 2.4× higher controls attach rates and resolve 40% of commissioning issues without factory engineering dispatches.',
      benchmarkOrTarget: 'Annual target: ≥ 2 certified technicians per Gold/Platinum partner branch',
    },

    // ----------------------------------------------------
    // 8. CUSTOMER HEALTH MODEL
    // ----------------------------------------------------
    {
      id: 'overallHealthScore',
      name: 'Composite Customer Health Index (healthMap.overallScore)',
      type: 'KPI',
      domain: 'Customer Health Model',
      plainDefinition: 'A 0-100 composite index evaluating customer relationship vitality across four weighted pillars: Commercial, Service, Financial, and Controls.',
      interpretationOrRelevance: 'Provides an objective early-warning metric to prevent customer churn before revenue drops appear in quarterly financials.',
      formulaOrLogic: '(Commercial × 0.35) + (Service × 0.25) + (Financial × 0.25) + (Strategic Controls × 0.15)',
      benchmarkOrTarget: 'Portfolio target: ≥ 85% of accounts maintained in Healthy (≥85) or Stable (70-84) bands',
    },
    {
      id: 'healthBand',
      name: 'Customer Health Band Classification (healthMap.band)',
      type: 'Attribute',
      domain: 'Customer Health Model',
      plainDefinition: 'The categorical operational health status: Healthy (≥85), Stable (70-84), At Risk (50-69), or Critical (<50).',
      interpretationOrRelevance: 'Drives automated executive escalations, credit reviews, and field engineering priority assignments.',
      formulaOrLogic: 'Banded automatically from Composite Customer Health Index score',
      benchmarkOrTarget: 'Zero Strategic Platinum accounts permitted in Critical band',
    },
    {
      id: 'commercialMomentumPillar',
      name: 'Commercial Momentum Health Pillar (components.commercialMomentum)',
      type: 'KPI',
      domain: 'Customer Health Model',
      plainDefinition: 'Evaluates recent sales run-rate against annual budget targets, quotation win rates, and order recency (weighted at 35%).',
      interpretationOrRelevance: 'Detects whether an account is expanding business with Acuity or shifting volume to competitor brands.',
      formulaOrLogic: 'Min(100, (Actual Sales ÷ Target Sales) × 85 + Order Recency Points)',
      benchmarkOrTarget: 'Pillar Target: ≥ 80 / 100 points',
    },
    {
      id: 'serviceQualityPillar',
      name: 'Service & Field Quality Health Pillar (components.serviceQuality)',
      type: 'KPI',
      domain: 'Customer Health Model',
      plainDefinition: 'Monitors the volume of open service tickets, contractual SLA turnaround breaches, and repeat component quality claims (weighted at 25%).',
      interpretationOrRelevance: 'Quantifies technical friction on active construction jobsites that could jeopardize future luminaire specifications.',
      formulaOrLogic: '95 - (Critical Tickets × 25) - (Repeat Failures × 15)',
      benchmarkOrTarget: 'Pillar Target: ≥ 85 / 100 points (Zero unaddressed Critical tickets)',
    },
    {
      id: 'financialRiskPillar',
      name: 'Financial & Credit Risk Health Pillar (components.financialRisk)',
      type: 'KPI',
      domain: 'Customer Health Model',
      plainDefinition: 'Evaluates distributor overdue accounts receivable ratios, credit line utilization (>85%), and disputed balances older than 60 days (weighted at 25%).',
      interpretationOrRelevance: 'Protects Acuity from bad debt exposure and identifies distributors experiencing cash flow strain.',
      formulaOrLogic: '95 - (Overdue AR Ratio × 50) - Credit Hold Penalty (if active: -30)',
      benchmarkOrTarget: 'Pillar Target: ≥ 85 / 100 points (Overdue ratio < 15%)',
    },
    {
      id: 'strategicEngagementPillar',
      name: 'Strategic Controls Stickiness Pillar (components.strategicEngagement)',
      type: 'KPI',
      domain: 'Customer Health Model',
      plainDefinition: 'Measures account adoption of proprietary nLight networked lighting controls, Atrius IoT software, and certified contractor credentials (weighted at 15%).',
      interpretationOrRelevance: 'Accounts with deep controls integration exhibit 98% annual retention and significantly higher lifetime commercial margin.',
      formulaOrLogic: 'Calculated from nLight hardware attach status, Atrius SaaS subscriptions, and certified personnel count',
      benchmarkOrTarget: 'Pillar Target: ≥ 70 / 100 points for core commercial partners',
    },
    {
      id: 'healthDrivers',
      name: 'Health Score Key Drivers & Risk Factors (healthMap.keyDrivers)',
      type: 'Attribute',
      domain: 'Customer Health Model',
      plainDefinition: 'Automated diagnostic explanations detailing the primary positive or negative drivers influencing an account\'s overall health score.',
      interpretationOrRelevance: 'Provides commercial sales and credit managers with transparent, actionable context behind every composite score rating.',
      benchmarkOrTarget: 'Reviewed during monthly account governance check-ins',
    },

    // ----------------------------------------------------
    // 9. GLOBAL DASHBOARD FILTERS
    // ----------------------------------------------------
    {
      id: 'filterReportingPeriod',
      name: 'Reporting Period Global Filter (GlobalFilterState.reportingPeriod)',
      type: 'Filter',
      domain: 'Global Dashboard Filters',
      plainDefinition: 'The active time horizon applied across all analytics views (e.g., FY2026 YTD, Rolling 12M, FY2025 Full Year, or individual fiscal quarters).',
      interpretationOrRelevance: 'Synchronizes all KPI cards, waterfall bridges, trend charts, and tables to a consistent time basis for executive analysis.',
      benchmarkOrTarget: 'Standard default: FY2026 YTD (Current fiscal year operating pacing)',
    },
    {
      id: 'filterAccountTier',
      name: 'Account Relationship Tier Filter (GlobalFilterState.riskStatus / selectedTier)',
      type: 'Filter',
      domain: 'Global Dashboard Filters',
      plainDefinition: 'Filter allowing users to segment dashboard views by account partnership level (Platinum, Gold, Silver, Bronze) or health status (Healthy, Stable, At Risk, Critical).',
      interpretationOrRelevance: 'Enables leadership to isolate top strategic distributor partners or focus immediately on accounts requiring urgent intervention.',
      benchmarkOrTarget: 'Provides rapid segmentation across portfolio health bands',
    },
    {
      id: 'filterProductFamily',
      name: 'Product Family Global Filter (GlobalFilterState.productFamily)',
      type: 'Filter',
      domain: 'Global Dashboard Filters',
      plainDefinition: 'Filter restricting dashboard views to a specific luminaire brand or technology category (e.g., Lithonia Lighting®, Holophane®, nLight® Controls).',
      interpretationOrRelevance: 'Isolates brand-specific market share, gross margins, and supply chain fulfillment performance.',
      benchmarkOrTarget: 'Covers all 10 Acuity brand families and controls platforms',
    },
    {
      id: 'filterCommercialChannel',
      name: 'Commercial Channel Global Filter (GlobalFilterState.channel)',
      type: 'Filter',
      domain: 'Global Dashboard Filters',
      plainDefinition: 'Filter restricting dashboard views to a specific route-to-market (e.g., C&I Distribution, OEM Sales, Specifier Influenced).',
      interpretationOrRelevance: 'Enables channel directors to evaluate profitability, rebate alignment, and distributor efficiency in their specific area.',
      benchmarkOrTarget: 'Ensures clear channel performance visibility across regional agencies',
    },
    {
      id: 'filterDistributor',
      name: 'Distributor Global Filter (GlobalFilterState.parentAccountId)',
      type: 'Filter',
      domain: 'Global Dashboard Filters',
      plainDefinition: 'Master enterprise filter restricting dashboard views, reports, and profiles to a specific corporate distributor holding national trade agreements.',
      interpretationOrRelevance: 'Enables strategic account executives to isolate performance, rebates, and operations for a specific distributor enterprise.',
      benchmarkOrTarget: 'Populated dynamically from verified distributor enterprise accounts'
    },
    {
      id: 'filterBranch',
      name: 'Branch Filter (Contextual Location Filter)',
      type: 'Filter',
      domain: 'Global Dashboard Filters',
      plainDefinition: 'Subordinate location filter populated strictly with the verified operating branches belonging to the selected corporate distributor.',
      interpretationOrRelevance: 'Appears when a distributor is selected, dynamically restricting demographic, financial, and map views to that branch without displaying unrelated accounts.',
      formulaOrLogic: 'Filtered where Account.parentId === SelectedDistributor.id or Account.id === SelectedDistributor.id',
      benchmarkOrTarget: 'Automatically synchronizes with geographical map and hierarchy tree'
    },
    {
      id: 'filterAgentAgency',
      name: 'Agent / Agency Filter (Order Traceability Top Filter)',
      type: 'Filter',
      domain: 'Global Dashboard Filters',
      plainDefinition: 'Filter within the Order Traceability top filter bar that isolates commercial transactions, sales orders, and fulfillment paths originated by a designated commercial lighting agency.',
      interpretationOrRelevance: 'Allows sales directors to evaluate individual agency order volume, manufacturing plant routing, and distributor relationships across ontology and table views.',
      benchmarkOrTarget: 'Populated dynamically from Acuity Certified Agency master records'
    },
    {
      id: 'filterSalesOrder',
      name: 'Sales Order Filter (Order Traceability Top Filter)',
      type: 'Filter',
      domain: 'Global Dashboard Filters',
      plainDefinition: 'Filter within the Order Traceability top filter bar focusing ontology graph, table rows, and exception alerts on a specific sales order to trace its exact verified supply chain path.',
      interpretationOrRelevance: 'Enables operations and customer service leaders to investigate order fulfillment status, line items, and delivery commitments.',
      benchmarkOrTarget: 'Directly bound to active SAP SD sales order numbers'
    },
    {
      id: 'filterOrderStatus',
      name: 'Order Status Filter (Order Traceability Top Filter)',
      type: 'Filter',
      domain: 'Global Dashboard Filters',
      plainDefinition: 'Top filter within Order Traceability restricting views by commercial sales order fulfillment state (Delivered, Shipped, In Production, Backlog Scheduled, Backlog At Risk).',
      interpretationOrRelevance: 'Enables supply chain operations and customer service teams to immediately isolate delayed shipments, backlogs at risk, or active plant production runs without creating duplicate filter sections.',
      formulaOrLogic: 'Filtered dynamically where OrderLine.status matches selected status string',
      benchmarkOrTarget: 'Dynamically populated from verified Acuity SAP SD sales order status values'
    },
    {
      id: 'aiAssistant',
      name: 'AI Assistant (Enterprise Copilot)',
      type: 'Attribute',
      domain: 'Global Dashboard Filters',
      plainDefinition: 'Governed conversational intelligence assistant grounded in Acuity synthetic ERP, CRM, and logistics data, providing persona-aware briefings and prescriptive recommendations.',
      interpretationOrRelevance: 'Delivers explainable business insights and diagnostic answers to commercial questions without exposing underlying LLM models.',
      benchmarkOrTarget: 'Strictly deterministic analytical calculations matching dashboard KPIs'
    },

    // ----------------------------------------------------
    // 10. ONTOLOGY ENTITIES & RELATIONSHIPS
    // ----------------------------------------------------
    {
      id: 'entityAgent',
      name: 'Sales Agent Entity (Agent / Agency)',
      type: 'Attribute',
      domain: 'Ontology Entities & Relationships',
      plainDefinition: 'The independent commercial lighting sales agency principal or Acuity sales executive responsible for commercial relationships, project design-in, and sales order origination within a designated territory.',
      interpretationOrRelevance: 'Connects specifiers and contractors with Acuity brands, driving regional commercial volume and quotation conversions.',
      benchmarkOrTarget: 'Acuity Certified Agency Network'
    },
    {
      id: 'entitySalesOrder',
      name: 'Sales Order Entity (Sales Order / OrderLine)',
      type: 'Attribute',
      domain: 'Ontology Entities & Relationships',
      plainDefinition: 'A commercial sales order placed by an independent Sales Agent on behalf of an electrical distributor, detailing required luminaire fixtures, controls, quantities, and committed delivery dates.',
      interpretationOrRelevance: 'In Customer Intelligence Hub, Sales Orders represent downstream customer transactions placed by Agents for Distributors. In contrast, Purchase Orders represent upstream procurement orders Acuity places with component and raw material suppliers.',
      formulaOrLogic: 'Aggregated by unique orderNumber from SAP SD sales order ledger',
      benchmarkOrTarget: 'Factory committed promise date (CPD)'
    },
    {
      id: 'entityPurchaseOrder',
      name: 'Purchase Order Entity (Vendor Procurement)',
      type: 'Attribute',
      domain: 'Ontology Entities & Relationships',
      plainDefinition: 'A procurement order issued by Acuity Brands to upstream supply chain vendors and raw material suppliers for fixture components (e.g. drivers, sheet metal, optical lenses).',
      interpretationOrRelevance: 'Procurement transactions are distinct from customer Sales Orders; POs govern factory component supply rather than distributor demand.',
      benchmarkOrTarget: 'Governed by SAP MM purchasing ledger and vendor lead times'
    },
    {
      id: 'entityFacility',
      name: 'Manufacturing Facility Entity (Facility)',
      type: 'Attribute',
      domain: 'Ontology Entities & Relationships',
      plainDefinition: 'An Acuity Brands assembly plant, center of excellence, or regional distribution hub where luminaires and controls are fabricated, tested, and shipped.',
      interpretationOrRelevance: 'Identifies production centers capable of fulfilling specific product families (e.g., Conyers for Lithonia/nLight, Crawfordsville for Holophane, Des Plaines for Gotham/Juno).',
      benchmarkOrTarget: 'Governed by ISO 9001 quality and UL certified testing standards'
    },
    {
      id: 'entityDistributor',
      name: 'Commercial Distributor Entity (Distributor / Account)',
      type: 'Attribute',
      domain: 'Ontology Entities & Relationships',
      plainDefinition: 'The wholesale electrical distributor or operating branch holding trade agreements with Acuity Brands that purchases, stocks, and distributes luminaires to electrical contractors.',
      interpretationOrRelevance: 'The primary commercial partner and counterparty for invoicing, trade credit, rebate programs, and delivery logistics.',
      benchmarkOrTarget: 'Classified under Strategic Platinum, Premier Gold, Core Silver, or Emerging Bronze'
    },
    {
      id: 'relAgentOrder',
      name: 'Agent → Sales Order Relationship ("Originates & Manages Sales Order")',
      type: 'KPI',
      domain: 'Ontology Entities & Relationships',
      plainDefinition: 'The directional business link between a sales agent and a sales order, indicating that the agent secured project specifications and originated the commercial transaction on behalf of a distributor.',
      interpretationOrRelevance: 'Demonstrates agency commission entitlement and tracks quota attainment by sales territory.',
      formulaOrLogic: '1:N Cardinality — One Agent originates and oversees many discrete Sales Orders',
      benchmarkOrTarget: 'Verified by Agent.id === Order.agentId and Agent.name === Account.accountOwner'
    },
    {
      id: 'relOrderFacility',
      name: 'Sales Order → Facility Relationship ("Manufactured & Fulfilled At")',
      type: 'KPI',
      domain: 'Ontology Entities & Relationships',
      plainDefinition: 'The operational link routing a sales order to the specialized manufacturing plant equipped to build and assemble that specific product family.',
      interpretationOrRelevance: 'Governs factory loading, production scheduling, inventory availability, and lead-time commitments.',
      formulaOrLogic: 'N:1 Cardinality — Many Sales Orders route to the specific Facility specializing in that ProductFamily',
      benchmarkOrTarget: 'Product family capability alignment (e.g., Lithonia/nLight -> Conyers; Holophane -> Crawfordsville)'
    },
    {
      id: 'relFacilityDistributor',
      name: 'Facility → Distributor Relationship ("Supplies & Delivers To")',
      type: 'KPI',
      domain: 'Ontology Entities & Relationships',
      plainDefinition: 'The supply chain fulfillment link between an Acuity manufacturing facility and the recipient distributor branch receiving finished lighting goods.',
      interpretationOrRelevance: 'Determines freight lane efficiency, logistics transit days, freight costs, and regional OTIF performance.',
      formulaOrLogic: 'M:N Cardinality — Manufacturing Facilities ship fulfilled orders across multi-branch distributor networks',
      benchmarkOrTarget: 'Logistics SLA: Committed transit timeline based on destination postal zone'
    },
    {
      id: 'relDistributorAgent',
      name: 'Distributor → Agent Relationship ("Assigned Commercial Rep")',
      type: 'Attribute',
      domain: 'Ontology Entities & Relationships',
      plainDefinition: 'The organizational governance link establishing which regional sales agent represents Acuity to a specific distributor account.',
      interpretationOrRelevance: 'Ensures dedicated commercial relationship coverage, joint business planning, and local distributor counter support.',
      formulaOrLogic: 'N:1 Cardinality — Multiple distributor branches in a territory report to one assigned commercial agent',
      benchmarkOrTarget: 'Assigned via territorial sales agency contracts'
    },
    {
      id: 'relDistributorBranch',
      name: 'Distributor-to-Branch Relationship (Enterprise Hierarchy)',
      type: 'Attribute',
      domain: 'Ontology Entities & Relationships',
      plainDefinition: 'The parent-child organizational hierarchy linking a corporate enterprise distributor holding master trade terms to its subordinate regional operating branches.',
      interpretationOrRelevance: 'Maintains governance alignment between corporate volume rebate agreements and branch-level invoice settlements.',
      formulaOrLogic: 'ParentAccount.id === BranchAccount.parentId',
      benchmarkOrTarget: 'Master customer relationship verified in SAP KNA1 ledger'
    },
    {
      id: 'attrFacilityCapacity',
      name: 'Facility Annual Operating Capacity (Facility.annualCapacityUnits)',
      type: 'KPI',
      domain: 'Ontology Entities & Relationships',
      plainDefinition: 'The maximum rated annual assembly volume in physical luminaire units supported by a manufacturing plant under standard operational staffing.',
      interpretationOrRelevance: 'Used by supply chain executives to balance factory production orders and identify capacity bottlenecks.',
      benchmarkOrTarget: 'Target utilization rate: 82% to 88% of rated annual capacity'
    },
    {
      id: 'kpiOntologyPipelineValue',
      name: 'Ontology Managed Pipeline Value',
      type: 'KPI',
      domain: 'Ontology Entities & Relationships',
      plainDefinition: 'The cumulative dollar total of active commercial sales orders currently tracked in the ontology and table views.',
      interpretationOrRelevance: 'Quantifies the commercial magnitude of transactions in flight across agents, plants, and distributors.',
      formulaOrLogic: 'Sum of SalesOrder.totalValue across all active orders satisfying current filters',
      benchmarkOrTarget: 'Real-time synchronization with SAP SD ledger'
    },

    // ----------------------------------------------------
    // 11. GEOGRAPHIC MAPPING & COORDINATES
    // ----------------------------------------------------
    {
      id: 'attrDistributorCoordinates',
      name: 'Distributor Geographic Coordinates (latitude, longitude)',
      type: 'Attribute',
      domain: 'Geographic Mapping & Coordinates',
      plainDefinition: 'The verified latitude and longitude spatial coordinates representing the physical operating city and state of a distributor headquarters or branch.',
      interpretationOrRelevance: 'Powers accurate geographical mapping, freight distance calculations, and territorial boundary analysis.',
      formulaOrLogic: 'Deterministic spatial lookup from master postal and municipal database',
      benchmarkOrTarget: 'WGS 84 spatial reference standard'
    },
    {
      id: 'attrFacilityCoordinates',
      name: 'Facility Centroid Coordinates (Facility.latitude, Facility.longitude)',
      type: 'Attribute',
      domain: 'Geographic Mapping & Coordinates',
      plainDefinition: 'The exact spatial coordinates for Acuity manufacturing facilities, assembly plants, and master distribution centers across North America.',
      interpretationOrRelevance: 'Enables spatial routing visualization from production centers to customer delivery destinations.',
      benchmarkOrTarget: 'Verified plant site locations (Conyers, GA; Crawfordsville, IN; Des Plaines, IL; Winona, MN; Monterrey, NL)'
    },
    {
      id: 'relHierarchyArc',
      name: 'Geographic Parent-Child Hierarchy Arc',
      type: 'KPI',
      domain: 'Geographic Mapping & Coordinates',
      plainDefinition: 'An interactive curved Bézier line connecting a corporate distributor headquarters to each of its regional operating branch locations on the geographic map.',
      interpretationOrRelevance: 'Visually conveys the geographic span of enterprise customer ownership and multi-branch network coordination.',
      formulaOrLogic: 'Bézier spline computed between Parent HQ (lat, lng) and Branch Location (lat, lng)',
      benchmarkOrTarget: 'Dynamically filtered by relationship tier and parent corporate code'
    },
    {
      id: 'kpiGeoStateCoverage',
      name: 'Geographic State & Provincial Coverage',
      type: 'KPI',
      domain: 'Geographic Mapping & Coordinates',
      plainDefinition: 'The count of distinct US states and Canadian provinces where an enterprise distributor operates active commercial branches.',
      interpretationOrRelevance: 'Measures distributor geographical reach; higher coverage qualifies distributors for national strategic enterprise rebate schedules.',
      formulaOrLogic: 'Count of unique state/province codes across Parent HQ and associated operating branches',
      benchmarkOrTarget: 'Strategic Platinum enterprise baseline: ≥ 12 states/provinces'
    },
    {
      id: 'kpiTotalEnterpriseQuota',
      name: 'Total Enterprise Network Target Quota',
      type: 'KPI',
      domain: 'Geographic Mapping & Coordinates',
      plainDefinition: 'The consolidated annual sales quota target summed across a parent distributor and all of its subordinate operating branch locations.',
      interpretationOrRelevance: 'Provides enterprise account managers with a unified view of total commercial commitment under corporate trade agreements.',
      formulaOrLogic: 'ParentAccount.annualTargetSales + Sum(BranchAccount.annualTargetSales)',
      benchmarkOrTarget: 'Tracked during Quarterly Executive Business Reviews'
    },
    {
      id: 'kpiNetworkBranchCount',
      name: 'Total Operating Branch Footprint Count',
      type: 'KPI',
      domain: 'Geographic Mapping & Coordinates',
      plainDefinition: 'The total number of verified stocking branches, trade counters, and distribution centers operating under a single parent corporate distributor.',
      interpretationOrRelevance: 'Establishes distributor footprint scale for supply chain logistics, stocking minimums, and local agency coverage.',
      formulaOrLogic: 'Count of child Account records where parentId === ParentAccount.id',
      benchmarkOrTarget: 'Reconciled against SAP KNA1 corporate customer hierarchy'
    },

    // ----------------------------------------------------
    // 12. ORDER TRACEABILITY & EXCEPTIONS
    // ----------------------------------------------------
    {
      id: 'orderTraceability',
      name: 'Order Traceability (4-Tier Supply Chain Lineage)',
      type: 'Attribute',
      domain: 'Order Traceability & Exceptions',
      plainDefinition: 'The end-to-end commercial supply chain lineage tracing commercial transactions across four verified enterprise tiers: originating commercial lighting Agent/Agency, customer Sales Order, manufacturing Facility, and recipient wholesale Distributor.',
      interpretationOrRelevance: 'Provides complete multi-echelon supply chain visibility, connecting commercial specification demand to factory manufacturing capacity and final distributor delivery.',
      formulaOrLogic: 'Four-tier directional graph: Agent (Originates) → Sales Order (Manufactured At) → Facility (Supplies) → Distributor',
      benchmarkOrTarget: 'Acuity Enterprise Canonical Lineage Standard'
    },
    {
      id: 'orderStatusLifecycle',
      name: 'Sales Order Status (OrderLine.status)',
      type: 'Attribute',
      domain: 'Order Traceability & Exceptions',
      plainDefinition: 'The discrete operational fulfillment milestone of a commercial sales order line item: Delivered, Shipped, In Production, Backlog Scheduled, or Backlog At Risk.',
      interpretationOrRelevance: 'Tracks progression through the Acuity manufacturing and distribution pipeline, driving factory scheduling, revenue recognition, and OTIF service level monitoring.',
      formulaOrLogic: 'Status classification: Delivered (at destination), Shipped (carrier transit), In Production (assembly floor), Backlog Scheduled (confirmed build date), Backlog At Risk (component shortage or operational delay)',
      benchmarkOrTarget: 'Milestone tracking synchronized with SAP SD & plant MES'
    },
    {
      id: 'orderExceptionFramework',
      name: 'Order Exception Framework',
      type: 'Attribute',
      domain: 'Order Traceability & Exceptions',
      plainDefinition: 'A diagnostic governance engine that scans active customer orders against factory promise dates (CPD), distributor credit lines, component availability, and transit milestones to proactively identify fulfillment risks.',
      interpretationOrRelevance: 'Transforms reactive order expediting into automated operational triage, allowing commercial teams, customer service, and plant managers to intervene before contractor jobsite delays occur.',
      benchmarkOrTarget: 'Real-time automated evaluation across 100% of open and active sales orders'
    },
    {
      id: 'delayedOrder',
      name: 'Delayed Order (Delivery Milestone Exception)',
      type: 'KPI',
      domain: 'Order Traceability & Exceptions',
      plainDefinition: 'A sales order whose actual shipping date (or projected completion date for pending orders) extends beyond Acuity\'s committed promise date (CPD) agreed with the customer.',
      interpretationOrRelevance: 'Directly impacts contractor installation schedules and distributor customer satisfaction; late shipments reduce OTIF score and trigger jobsite penalty reviews.',
      formulaOrLogic: 'actualShipDate > requiredShipDate (or pending orders where current snapshot date > requiredShipDate)',
      benchmarkOrTarget: 'Corporate target: 0 delayed orders; OTIF operational hurdle ≥ 95.0%'
    },
    {
      id: 'backlogException',
      name: 'Backlog Exception (Schedule Risk & Aged Queue)',
      type: 'KPI',
      domain: 'Order Traceability & Exceptions',
      plainDefinition: 'An unfulfilled customer sales order held in factory backlog that is either officially designated as "Backlog At Risk" due to supplier component shortages or has exceeded 40 calendar days in queue without advancing to production.',
      interpretationOrRelevance: 'Highlights orders at imminent risk of distributor cancellation or specification re-engineering; informs critical component expediting and line rebalancing.',
      formulaOrLogic: 'OrderLine.status === "Backlog At Risk" OR (status in ["Backlog Scheduled", "In Production"] AND orderAgeingDays > 40)',
      benchmarkOrTarget: 'Operational maximum: ≤ 30 days backlog queue time'
    },
    {
      id: 'processingException',
      name: 'Processing Exception (Credit & Capacity Holds)',
      type: 'Attribute',
      domain: 'Order Traceability & Exceptions',
      plainDefinition: 'An operational, financial, or administrative hold preventing an order from being released to the assembly line or loading dock, primarily caused by distributor credit line locks (creditHold = true) or severe plant capacity constraints.',
      interpretationOrRelevance: 'Prevents unauthorized inventory commitments and bad-debt exposure while alerting credit analysts to review overdue invoices with distributor finance teams.',
      formulaOrLogic: 'Account.creditHold === true (SAP credit freeze) OR plant capacity allocation freeze',
      benchmarkOrTarget: 'Credit hold review turnaround: ≤ 24 hours'
    },
    {
      id: 'statusException',
      name: 'Status Exception (Milestone & Routing Anomaly)',
      type: 'Attribute',
      domain: 'Order Traceability & Exceptions',
      plainDefinition: 'An order exhibiting an irregular milestone state, such as missing shipping carrier tracking, stalled production milestones, or plant routing mismatches.',
      interpretationOrRelevance: 'Identifies technical or operational data gaps between plant MES systems, carrier EDI feeds, and corporate SAP SD.',
      benchmarkOrTarget: 'Daily customer service automated reconciliation'
    },
    {
      id: 'exceptionCategory',
      name: 'Exception Category Taxonomy',
      type: 'Attribute',
      domain: 'Order Traceability & Exceptions',
      plainDefinition: 'The four-part taxonomy grouping order exceptions: Delayed Orders, Backlog Exceptions, Processing Holds, and Status Exceptions.',
      interpretationOrRelevance: 'Enables specialized routing of delivery blockers: carrier issues to logistics dispatchers, raw material shortages to plant buyers, and credit freezes to working capital analysts.',
      benchmarkOrTarget: 'Four standard enterprise exception classifications'
    },
    {
      id: 'exceptionReason',
      name: 'Exception Reason Code & Narrative',
      type: 'Attribute',
      domain: 'Order Traceability & Exceptions',
      plainDefinition: 'The transparent, auditable root-cause narrative assigned to an exception, grounded directly in source milestone timestamps, supplier delay notices, carrier transit events, or credit lock records.',
      interpretationOrRelevance: 'Provides complete visibility to commercial sales agents and distributors regarding the precise reason an order is delayed or blocked, eliminating communication friction.',
      benchmarkOrTarget: 'Auditable root-cause documentation on 100% of flagged orders'
    },
    {
      id: 'exceptionSeverity',
      name: 'Exception Severity & Priority Rating',
      type: 'Attribute',
      domain: 'Order Traceability & Exceptions',
      plainDefinition: 'The business risk classification assigned to an order exception: Critical (immediate escalation: credit hold or delay > 10 days), High (significant delivery risk: delay 5-10 days or backlog at risk), or Medium (moderate delay 1-4 days or aged backlog queue).',
      interpretationOrRelevance: 'Guides daily triage prioritization for customer service expeditors and factory schedulers, ensuring high-value and high-risk orders receive immediate remediation.',
      formulaOrLogic: 'Critical: creditHold OR delay > 10 days; High: delay 5-10 days OR Backlog At Risk; Medium: delay 1-4 days OR aged backlog',
      benchmarkOrTarget: 'Critical priority exceptions addressed within 4 operational hours'
    },
    {
      id: 'orderAgeingDays',
      name: 'Order & Backlog Ageing (orderAgeingDays)',
      type: 'KPI',
      domain: 'Order Traceability & Exceptions',
      plainDefinition: 'The total elapsed calendar days from initial customer sales order placement in SAP SD to the current operating snapshot date.',
      interpretationOrRelevance: 'Measures overall order fulfillment velocity; excessive ageing indicates stagnant backlogs, supplier delivery bottlenecks, or delayed jobsite releases.',
      formulaOrLogic: 'Current Snapshot Date - Order Placement Date (requiredShipDate - standardLeadTimeDays)',
      benchmarkOrTarget: 'Standard commercial cycle hurdle: ≤ 28 calendar days for configured luminaires'
    },
    {
      id: 'daysDelayed',
      name: 'Days Delayed Metric (daysDelayed)',
      type: 'KPI',
      domain: 'Order Traceability & Exceptions',
      plainDefinition: 'The number of calendar days by which actual shipment (or current date for overdue pending orders) exceeded the Acuity Committed Promise Date (CPD).',
      interpretationOrRelevance: 'Primary quantitative penalty metric for delivery SLA compliance; orders delayed > 5 days trigger automatic executive customer service escalation.',
      formulaOrLogic: 'Max(0, Actual Ship Date - Committed Required Ship Date [CPD])',
      benchmarkOrTarget: 'Target: 0 days delayed; corporate OTIF SLA ≤ 0 days variance'
    },
    {
      id: 'kpiTotalOrdersWithExceptions',
      name: 'Total Orders with Exceptions KPI',
      type: 'KPI',
      domain: 'Order Traceability & Exceptions',
      plainDefinition: 'The total count and percentage of commercial sales orders within the active filter scope currently flagged with one or more operational exceptions.',
      interpretationOrRelevance: 'Provides executive leadership with a consolidated operational health metric across commercial lighting agencies, plants, and distributor accounts.',
      formulaOrLogic: '(Count of Unique Orders with Active Exceptions ÷ Total Filtered Orders) × 100',
      benchmarkOrTarget: 'Target exception rate: ≤ 10.0% of total active sales orders'
    },
    {
      id: 'kpiDelayedOrdersSummary',
      name: 'Delayed Orders KPI & Average Delay Duration',
      type: 'KPI',
      domain: 'Order Traceability & Exceptions',
      plainDefinition: 'The total count of orders that missed their Committed Promise Date paired with the average delay duration in calendar days across all late shipments.',
      interpretationOrRelevance: 'Quantifies carrier transit bottlenecks and factory assembly slippage, informing logistics carrier negotiations and warehouse staffing.',
      formulaOrLogic: 'Count(Delayed Orders) and Sum(daysDelayed) ÷ Count(Delayed Orders)',
      benchmarkOrTarget: 'Average delay duration target: ≤ 3.0 calendar days when delays occur'
    },
    {
      id: 'kpiBacklogExceptionsSummary',
      name: 'Backlog Exceptions KPI & Average Backlog Age',
      type: 'KPI',
      domain: 'Order Traceability & Exceptions',
      plainDefinition: 'The count of open factory backlog orders flagged as At Risk or exceeding 40 days in queue, paired with the average calendar age of these stalled orders.',
      interpretationOrRelevance: 'Directs factory line rebalancing and procurement expediting for critical LED boards, eldoLED drivers, and optical lenses.',
      formulaOrLogic: 'Count(Backlog Exceptions) and Sum(orderAgeingDays) ÷ Count(Backlog Exceptions)',
      benchmarkOrTarget: 'Average backlog queue target: ≤ 25 calendar days across all assembly plants'
    },
    {
      id: 'kpiProcessingHoldsSummary',
      name: 'Processing Holds KPI (Credit & Production Locks)',
      type: 'KPI',
      domain: 'Order Traceability & Exceptions',
      plainDefinition: 'The number of commercial orders currently stopped from factory release due to customer credit limits (SAP creditHold) or plant capacity allocation freezes.',
      interpretationOrRelevance: 'Isolates working capital constraints requiring immediate credit analyst intervention or distributor payment collection.',
      formulaOrLogic: 'Count of active orders where Account.creditHold === true',
      benchmarkOrTarget: 'Operational target: Zero credit-held orders pending > 48 hours without resolution'
    },
    {
      id: 'kpiCriticalPriorityExceptions',
      name: 'Critical Priority Exceptions KPI',
      type: 'KPI',
      domain: 'Order Traceability & Exceptions',
      plainDefinition: 'The number of active order exceptions evaluated at Critical severity—orders facing severe delivery failure, extensive SLA breach (> 10 days), or hard credit holds.',
      interpretationOrRelevance: 'The primary triage metric for operational leads; each critical exception represents immediate customer relationship and contractual penalty risk.',
      formulaOrLogic: 'Count of OrderExceptionItem where severity === "Critical"',
      benchmarkOrTarget: 'Hurdle: Zero unaddressed Critical exceptions within 24 hours'
    },
    {
      id: 'actionTracePath',
      name: 'Trace Path Lineage Action',
      type: 'Attribute',
      domain: 'Order Traceability & Exceptions',
      plainDefinition: 'Interactive cross-representation workflow action allowing users to pivot directly from any exception row in the Order Exceptions table into the visual Ontology View.',
      interpretationOrRelevance: 'Instantly focuses the four-tier graph to highlight the exact Agent → Sales Order → Facility → Distributor lineage connected to the troubled transaction.',
      benchmarkOrTarget: 'Single-click cross-view state transition with highlighted relational path'
    },
  ];

  // Governed deep-dive glossary dataset structured for executive stakeholders
  const glossaryData: Record<string, GlossaryTerm[]> = {
    executive: [
      {
        term: 'Net Invoiced Sales Revenue',
        category: 'Core Financials',
        plainDefinition: 'The actual dollar amount billed to distributors and contractors for shipped luminaires and controls, after deducting customer rebates, prompt-pay cash discounts, and authorized product returns.',
        businessSignificance: 'Serves as Acuity\'s primary top-line measure of commercial execution, market demand, and business unit performance.',
        relatedKpiOrAttribute: 'KPI: netSales | Source: Invoices.lineTotal (SAP VBRK/VBRP Billing Ledger)',
        benchmarkOrTarget: 'Board-Approved Annual Operating Plan (AOP)',
      },
      {
        term: 'Budget Target Attainment',
        category: 'Performance Tracking',
        plainDefinition: 'The percentage of approved annual sales target achieved in the current operating period. An attainment above 100% indicates that the business is ahead of budgeted commercial expectations.',
        businessSignificance: 'Guides quarterly executive resource allocation, agency sales incentive bonuses, and plant capacity investments.',
        relatedKpiOrAttribute: 'KPI: targetVariancePct | Formula: (Actual Invoiced Sales ÷ Seasonally Phased Target) × 100',
        benchmarkOrTarget: 'Target: ≥ 100.0% of phased budget',
      },
      {
        term: 'Month-over-Month (MoM) Growth',
        category: 'Pacing Metrics',
        plainDefinition: 'The rate of revenue expansion or contraction when comparing the most recent closed month directly against the immediately preceding calendar month.',
        businessSignificance: 'Reveals short-term momentum, seasonal inflection points, and early warnings of channel slowdowns before quarterly results close.',
        relatedKpiOrAttribute: 'KPI: monthlySalesTrend.momPct | Formula: ((Month N - Month N-1) ÷ Month N-1) × 100',
        benchmarkOrTarget: 'Historical baseline: Positive pacing in Q2-Q3 construction cycles',
      },
      {
        term: 'Year-over-Year (YoY) Variance',
        category: 'Growth Analysis',
        plainDefinition: 'The dollar and percentage difference in revenue achieved in the current period compared to the exact same calendar period in the previous fiscal year.',
        businessSignificance: 'Eliminates seasonal distortions (such as construction slowdowns in mid-winter) to evaluate genuine organic annual growth.',
        relatedKpiOrAttribute: 'KPI: yoyVariancePct | Source: MonthlyFinancialSnapshots (FY2026 vs FY2025 comparable months)',
        benchmarkOrTarget: 'Long-term corporate growth goal: +3% to +6% organic annual growth',
      },
      {
        term: 'On-Time In-Full (OTIF) Delivery',
        category: 'Supply Chain & Fulfillment',
        plainDefinition: 'The percentage of customer orders manufactured and delivered complete on or before the committed factory promise date.',
        businessSignificance: 'Essential for maintaining contractor trust and electrical distributor loyalty; late shipments directly risk project jobsite penalties.',
        relatedKpiOrAttribute: 'KPI: otifRate | Source: OrderLines.onTimeStatus (SAP SD & WMS Shipping Confirmations)',
        benchmarkOrTarget: 'Corporate operational hurdle: ≥ 95.0% on-time completion',
      },
      {
        term: 'Days Sales Outstanding (DSO)',
        category: 'Liquidity & Cash Flow',
        plainDefinition: 'The average number of calendar days it takes Acuity to collect cash payments from distributors following the issuance of an invoice.',
        businessSignificance: 'Directly dictates working capital health, cash conversion speed, and distributor credit health.',
        relatedKpiOrAttribute: 'KPI: dso | Formula: (Total Outstanding Receivables ÷ Trailing Sales) × 365 Days',
        benchmarkOrTarget: 'Credit department threshold: ≤ 42 Days under standard 2/10 Net 30 terms',
      },
    ],
    sales: [
      {
        term: 'Risk-Adjusted Weighted Pipeline',
        category: 'Pipeline Management',
        plainDefinition: 'The estimated dollar value of future project opportunities, discounted by the historical probability of winning at each respective sales stage.',
        businessSignificance: 'Enables sales directors and plant managers to accurately forecast factory production requirements and commercial cash inflows.',
        relatedKpiOrAttribute: 'KPI: weightedPipeline | Formula: Sum of (Opportunity Estimated Value × Stage Win Probability %)',
        benchmarkOrTarget: 'Pipeline Coverage: ≥ 3.0× quarterly net revenue target',
      },
      {
        term: 'BAFO (Best and Final Offer)',
        category: 'Sales Process Gates',
        plainDefinition: 'The late-stage milestone in commercial bidding where architectural specifications are finalized and contractor pricing packages are submitted against competitive alternatives.',
        businessSignificance: 'Represents the pivotal qualification gate where project win probability increases to 75% upon pricing lock.',
        relatedKpiOrAttribute: 'Attribute: Opportunities.stage = "Proposal & BAFO" | Win Probability: 75%',
        benchmarkOrTarget: 'Stage Duration Target: ≤ 21 days from quote generation',
      },
      {
        term: 'Revenue Variance Waterfall Bridge',
        category: 'Revenue Attribution',
        plainDefinition: 'A management visual that breaks down total year-over-year revenue change into four distinct drivers: Volume Growth, Controls Cross-Sell, Pricing Realization, and Account Contraction.',
        businessSignificance: 'Informs executive leadership whether revenue gains were driven by market expansion, premium controls adoption, or price increases.',
        relatedKpiOrAttribute: 'Visual: WaterfallChart | Components: Base + Volume + Cross-Sell + Price - Churn = Current Sales',
        benchmarkOrTarget: 'Target: Net positive contribution across all three growth levers',
      },
      {
        term: 'nLight® Controls Attachment Rate',
        category: 'Cross-Sell Strategy',
        plainDefinition: 'The proportion of luminaire commercial project orders that include attached nLight wired or wireless networked lighting control packs, wallstations, or gateways.',
        businessSignificance: 'Strategic margin accelerator: bundled projects command +320 basis points higher gross margin and create long-term software stickiness.',
        relatedKpiOrAttribute: 'Attribute: Accounts.installedControlsFlag & OrderLines.productFamily = "nLight® Controls"',
        benchmarkOrTarget: 'Commercial target: ≥ 30% controls attachment across major spec troffer projects',
      },
      {
        term: 'Portfolio Margin Quadrants',
        category: 'Customer Segmentation',
        plainDefinition: 'A 4-quadrant strategic framework plotting accounts by Invoiced Volume against Realized Gross Margin percentage to identify Stars, Volume Builders, and Underperformers.',
        businessSignificance: 'Guides differentiated pricing multipliers, executive sponsorship, and distributor rebate renegotiations.',
        relatedKpiOrAttribute: 'Visual: ScatterPlot (X: Net Sales $, Y: Gross Margin %) | Corporate Benchmark: 40.0% Gross Margin',
        benchmarkOrTarget: 'Stars: Revenue > $500k & Gross Margin > 40%',
      },
    ],
    service: [
      {
        term: 'Service SLA Resolution Compliance',
        category: 'Customer Support',
        plainDefinition: 'The percentage of contractor support requests, driver replacements, and warranty claims resolved within contractual turnaround time commitments.',
        businessSignificance: 'Prevents contractor jobsite delays and preserves distributor loyalty on specification-grade commercial lighting projects.',
        relatedKpiOrAttribute: 'KPI: slaAttainmentPct | Formula: (Tickets Resolved within SLA Target ÷ Total Resolved Tickets) × 100',
        benchmarkOrTarget: 'Customer service target: ≥ 95.0% adherence across all priority tiers',
      },
      {
        term: 'Severity Priority Tiers (P1 - P4)',
        category: 'Incident Management',
        plainDefinition: 'Standardized issue urgency rankings defining contractual response deadlines: Critical (4-hour response for hospital/egress blackouts), High (24 hours), Medium (48 hours), and Low (96 hours).',
        businessSignificance: 'Ensures urgent field safety and commissioning emergencies receive immediate regional application engineer deployment.',
        relatedKpiOrAttribute: 'Attribute: ServiceCases.severity in (Critical, High, Medium, Low) | ServiceCases.slaDeadlineHours',
        benchmarkOrTarget: 'Zero unaddressed P1 critical incidents exceeding 4 hours',
      },
      {
        term: 'Root-Cause Pareto Ranking',
        category: 'Quality Engineering',
        plainDefinition: 'A structured breakdown identifying the primary technical causes responsible for 80% of warranty incidents (e.g., temporary generator power surges, firmware revisions, polarity inversion).',
        businessSignificance: 'Feeds real-time field reliability intelligence back into Acuity manufacturing plants and driver development teams (such as eldoLED).',
        relatedKpiOrAttribute: 'Visual: ParetoCauses | Source: ServiceCases.category (ServiceNow CSM Incident Classification)',
        benchmarkOrTarget: 'Continuous quality improvement: < 2% warranty claim rate on delivered fixtures',
      },
      {
        term: 'Repeat Incident Ratio',
        category: 'Reliability Tracking',
        plainDefinition: 'The percentage of job sites or distributor accounts that experience recurring driver trips or control communication failures within a 90-day window.',
        businessSignificance: 'Identifies chronic jobsite installation flaws, miswired circuits, or batch-level component vulnerabilities requiring field engineering intervention.',
        relatedKpiOrAttribute: 'KPI: repeatRatePct | Formula: (Cases flagged as Repeat Issue ÷ Total Registered Cases) × 100',
        benchmarkOrTarget: 'Quality ceiling: < 8.0% repeat ticket rate',
      },
    ],
    finance: [
      {
        term: 'Accounts Receivable (AR) Aging Brackets',
        category: 'Credit Management',
        plainDefinition: 'Classification of unpaid distributor invoices into standard time windows (Current, 1-30 days overdue, 31-60 days, 61-90 days, and 90+ days past due).',
        businessSignificance: 'Enables credit controllers to identify liquidity risks, escalate collections, and prevent bad debt write-offs.',
        relatedKpiOrAttribute: 'KPI: arBuckets | Source: Invoices.outstandingBalance grouped by Invoices.overdueDays',
        benchmarkOrTarget: 'Healthy portfolio standard: ≥ 80% of total receivables in "Current" status',
      },
      {
        term: 'Credit Line Utilization & Ceilings',
        category: 'Credit Risk',
        plainDefinition: 'The ratio of a distributor\'s active exposure (unpaid invoices plus scheduled backlog) to their approved commercial credit insurance limit.',
        businessSignificance: 'Accounts exceeding 100% of their limit represent credit ceiling violations and trigger an automatic hold in SAP, pausing new factory releases until payments clear.',
        relatedKpiOrAttribute: 'KPI: creditUtilization | Formula: ((Outstanding AR + Unbilled Backlog) ÷ Approved Credit Limit) × 100',
        benchmarkOrTarget: 'Operational warning: Utilization > 85%; Credit Block: Utilization > 100%',
      },
      {
        term: 'Invoice Dispute Deduction Management',
        category: 'Collections Velocity',
        plainDefinition: 'The dollar volume of billing items where a distributor has temporarily withheld payment due to freight terms, price authorization discrepancies, or tax exemption documentation.',
        businessSignificance: 'Isolates legitimate billing claims from credit defaults so that operational disputes can be resolved without damaging distributor relationships.',
        relatedKpiOrAttribute: 'Attribute: Invoices.status = "Disputed" | Invoices.disputeReason (HighRadius Deduction Module)',
        benchmarkOrTarget: 'Deduction target: Disputed balance < 3.5% of gross receivables ledger',
      },
      {
        term: 'Cash Collections Pacing',
        category: 'Working Capital',
        plainDefinition: 'Monthly tracking of total cash receipts collected via lockbox, wire, and ACH electronic transfers against corporate working capital commitments.',
        businessSignificance: 'Ensures the business converts booked revenue into operational cash flow to fund manufacturing inventory and vendor payments.',
        relatedKpiOrAttribute: 'Chart: monthlyCollections | Reconciled across monthly financial snapshots and bank lockbox logs',
        benchmarkOrTarget: 'Collections Efficiency Index (CEI): ≥ 90.0%',
      },
    ],
    leadership: [
      {
        term: 'Forecast Accuracy (WAPE)',
        category: 'Planning Reliability',
        plainDefinition: 'Weighted Absolute Percentage Error measuring how closely commercial demand forecasts matched actual delivered product sales across regional sales teams.',
        businessSignificance: 'High forecast accuracy minimizes costly factory component shortages, prevents excess warehouse inventory, and improves operating margins.',
        relatedKpiOrAttribute: 'KPI: forecastAccuracyWape | Formula: (1 - (Sum(|Actual - Forecast|) ÷ Sum(Actual))) × 100',
        benchmarkOrTarget: 'Executive hurdle: ≥ 90.0% WAPE accuracy across 12-month rolling horizon',
      },
      {
        term: 'Forecast Bias',
        category: 'Forecasting Discipline',
        plainDefinition: 'A mathematical measure indicating whether commercial sales teams systematically over-forecast (optimism bias) or under-forecast (conservatism bias) future project revenue.',
        businessSignificance: 'Identifies regional behavioral biases to calibrate manufacturing supply commitments.',
        relatedKpiOrAttribute: 'KPI: forecastBiasPct | Formula: ((Total Forecasted $ - Total Actual $) ÷ Total Actual $) × 100',
        benchmarkOrTarget: 'Balanced target: Within ±3.0% of actual delivery',
      },
      {
        term: 'Net Revenue Retention (NRR)',
        category: 'Cohort Analysis',
        plainDefinition: 'Measures organic annual revenue expansion from the established customer account base, accounting for cross-selling gains minus customer contraction or churn.',
        businessSignificance: 'An NRR above 100% demonstrates that existing distributor relationships are growing without relying exclusively on opening new branch territories.',
        relatedKpiOrAttribute: 'KPI: netRevenueRetention | Formula: ((Prior Cohort CY Spend - Churn + Expansion) ÷ Prior Cohort Spend) × 100',
        benchmarkOrTarget: 'Healthy enterprise benchmark: 102.0% to 106.0%',
      },
      {
        term: 'Top 10 Account Concentration',
        category: 'Strategic Risk',
        plainDefinition: 'The percentage of total commercial net sales accounted for by Acuity\'s 10 largest national distributor networks (e.g., Sonepar, Graybar, WESCO, Rexel, CED).',
        businessSignificance: 'Provides strategic oversight into customer dependency risk and guides executive multi-year partnership governance.',
        relatedKpiOrAttribute: 'KPI: concentrationTop10Pct | Formula: (Combined Revenue of Top 10 Accounts ÷ Total Portfolio Revenue) × 100',
        benchmarkOrTarget: 'Risk management threshold: Concentration between 40% and 48%',
      },
      {
        term: 'Sensitivity Scenario Modeler',
        category: 'Executive Decision Support',
        plainDefinition: 'Interactive financial simulation tool modeling business outcomes across Base (AOP budget), Upside (+8% demand, +120 bps margin), and Downside (-8% demand) market conditions.',
        businessSignificance: 'Prepares the executive committee for supply chain volatility, infrastructure stimulus timing, and commercial construction cycles.',
        relatedKpiOrAttribute: 'Interactive Modeler: selectedScenario (Base, Upside, Downside multipliers applied to forecast base)',
        benchmarkOrTarget: 'Stress-tested quarterly against commodity raw material price swings',
      },
    ],
    profile: [
      {
        term: 'Unified 360 Account Hierarchy',
        category: 'Master Data Structure',
        plainDefinition: 'The corporate organizational tree linking parent distributor enterprises to individual operating branch locations and regional warehouses.',
        businessSignificance: 'Ensures executive visibility into total enterprise buying power while enabling local branch sales reps to execute project-level orders.',
        relatedKpiOrAttribute: 'Attributes: Accounts.parentId, Accounts.parentName, Accounts.childLocationsCount (SAP KNA1 Master Data)',
        benchmarkOrTarget: 'Zero orphan branch records; complete corporate linkage across national chains',
      },
      {
        term: 'Buying Committee Stakeholder Mapping',
        category: 'Account Intelligence',
        plainDefinition: 'Organized roster of verified customer contacts classified by commercial role (Economic Buyer, Specifier, Purchasing Agent, Field Foreman) and decision influence level.',
        businessSignificance: 'Ensures sales teams engage all decision-makers across engineering, purchasing, and jobsite execution to prevent deal slippage.',
        relatedKpiOrAttribute: 'Entity: Contact (decisionPower: High/Medium/Low, role, verified phone & email)',
        benchmarkOrTarget: 'Target: At least 3 mapped decision-makers per Strategic Platinum partner',
      },
      {
        term: 'Acuity Academy Technical Certifications',
        category: 'Partner Capability',
        plainDefinition: 'Record of contractor and distributor staff completions of authorized training courses covering nLight AIR wireless controls, Holophane optics, and Title 24 compliance.',
        businessSignificance: 'Certified distributor personnel achieve 2.4× higher controls attach rates and resolve 40% of commissioning tickets without dispatching factory engineers.',
        relatedKpiOrAttribute: 'Entity: EngagementEvent (type: Certification / Lab, ratingScore, attendeeCount)',
        benchmarkOrTarget: 'Annual target: ≥ 2 certified controls technicians per Gold/Platinum partner branch',
      },
      {
        term: 'Prescriptive Next-Best-Action Engine',
        category: 'Actionable Intelligence',
        plainDefinition: 'Synthesized, rule-based recommendations that correlate open pipeline blockages, aging receivables, and service tickets to generate prioritized mandates with estimated financial impact.',
        businessSignificance: 'Transforms retrospective reporting into forward-looking action, directing sales directors and credit controllers to high-impact accounts.',
        relatedKpiOrAttribute: 'Entity: Recommendation (signal, priority, potentialImpactUsd, recommendedAction, suggestedOwner)',
        benchmarkOrTarget: 'Target: Clear owner and resolution status within 14 days of signal generation',
      },
    ],
    health: [
      {
        term: 'Composite Customer Health Index',
        category: 'Health Model',
        plainDefinition: 'A 0-100 composite score that evaluates customer relationship vitality across four weighted pillars: Commercial Momentum (35%), Field Quality (25%), Financial Risk (25%), and Controls Stickiness (15%).',
        businessSignificance: 'Provides executive leadership with an objective, early-warning metric to prevent customer attrition before revenue drops appear in quarterly financials.',
        relatedKpiOrAttribute: 'KPI: healthScore.overallScore | Classification Bands: Healthy (≥85), Stable (70-84), At Risk (50-69), Critical (<50)',
        benchmarkOrTarget: 'Portfolio objective: ≥ 85% of accounts maintained in Healthy or Stable bands',
      },
      {
        term: 'Commercial Momentum Pillar (35% Weight)',
        category: 'Health Pillar',
        plainDefinition: 'Measures recent sales run-rate against annual budget targets, quotation win rates, and the frequency of new purchase orders.',
        businessSignificance: 'Evaluates whether an account is actively expanding its business with Acuity or shifting volume to competitor brands.',
        relatedKpiOrAttribute: 'Attribute: healthComponents.commercialMomentum | Formula: Min(100, (Actual ÷ Target) × 85 + OrderRecencyScore)',
        benchmarkOrTarget: 'Pillar Target: ≥ 80 / 100',
      },
      {
        term: 'Service & Field Quality Pillar (25% Weight)',
        category: 'Health Pillar',
        plainDefinition: 'Monitors the volume of unresolved service cases, contractual SLA turnaround breaches, and repeat driver or fixture quality claims.',
        businessSignificance: 'Detects technical dissatisfaction on active construction jobsites that could jeopardize future luminaire specifications.',
        relatedKpiOrAttribute: 'Attribute: healthComponents.serviceQuality | Formula: 95 - (CriticalTickets × 25) - (RepeatFailures × 15)',
        benchmarkOrTarget: 'Pillar Target: ≥ 85 / 100 (Zero unaddressed Critical tickets)',
      },
      {
        term: 'Financial & Credit Risk Pillar (25% Weight)',
        category: 'Health Pillar',
        plainDefinition: 'Evaluates distributor overdue accounts receivable ratios, credit insurance ceiling utilization (>85%), and disputed balances older than 60 days.',
        businessSignificance: 'Protects Acuity from bad debt exposure and identifies distributors experiencing cash flow strain.',
        relatedKpiOrAttribute: 'Attribute: healthComponents.financialRisk | Formula: 95 - (OverdueRatio × 50) - CreditHoldPenalty',
        benchmarkOrTarget: 'Pillar Target: ≥ 85 / 100 (Overdue ratio < 15%)',
      },
      {
        term: 'Strategic Controls Stickiness (15% Weight)',
        category: 'Health Pillar',
        plainDefinition: 'Measures account adoption of proprietary nLight networked lighting controls, Atrius building IoT software, and certified contractor staff.',
        businessSignificance: 'Accounts with deep controls integration exhibit 98% annual retention and significantly higher lifetime commercial value.',
        relatedKpiOrAttribute: 'Attribute: healthComponents.strategicEngagement | Evaluates nLight penetration and Academy training credentials',
        benchmarkOrTarget: 'Pillar Target: ≥ 70 / 100 for core commercial distributors',
      },
    ],
    taxonomy: [
      {
        term: 'Lithonia Lighting® Family',
        category: 'Commercial Ambient & High-Bay',
        plainDefinition: 'North America\'s volume-leading luminaire brand for commercial office, educational, industrial, and retail environments. Flagship lines include BLT troffers, CPX flat panels, and IBG industrial high bays.',
        businessSignificance: 'Foundational volume revenue engine providing factory absorption across Acuity\'s North American assembly plants.',
        relatedKpiOrAttribute: 'ProductFamily: "Lithonia Lighting®" | Brand Code: LIT (SAP Material Master)',
        benchmarkOrTarget: 'Core stock-and-flow volume driver across all electrical distributor channels',
      },
      {
        term: 'Holophane® Outdoor & Infrastructure',
        category: 'High-Performance Prismatic Glass',
        plainDefinition: 'Precision engineered luminaires for municipal roadways, high-mast highway interchanges, utilities, and hazardous industrial environments requiring durable prismatic glass optics.',
        businessSignificance: 'High-margin infrastructure product family benefiting from municipal roadway funding and federal infrastructure modernization programs.',
        relatedKpiOrAttribute: 'ProductFamily: "Holophane®" | Brand Code: HOL',
        benchmarkOrTarget: 'Target gross margin: ≥ 45.0% on specification municipal contracts',
      },
      {
        term: 'Gotham® & Aculux® Architectural Downlights',
        category: 'Architectural Lighting',
        plainDefinition: 'Architectural specification downlights, cylinders, and adjustable accent fixtures featuring precision optical cut-off, EVO/Incito platforms, and warm-dimming technology.',
        businessSignificance: 'Prescribed by lighting designers and architects for corporate headquarters, hospitality, and civic cultural landmarks.',
        relatedKpiOrAttribute: 'ProductFamilies: "Gotham®", "Aculux®" | High specifier influence channel',
        benchmarkOrTarget: 'Premium margin tier: ≥ 46.0% realized gross margin',
      },
      {
        term: 'Mark Architectural™ & Peerless® Linear',
        category: 'Linear & Suspended Luminaires',
        plainDefinition: 'Continuous recessed slot linear lighting, architectural wall-wash systems, and acoustic integrated sound-absorbing pendant luminaires.',
        businessSignificance: 'High-visibility visual focal points in modern open-ceiling architectural environments.',
        relatedKpiOrAttribute: 'ProductFamilies: "Mark Architectural Lighting™", "Peerless®"',
        benchmarkOrTarget: 'Specified alongside corporate office tenant improvement packages',
      },
      {
        term: 'nLight® Wired & nLight® AIR Wireless Controls',
        category: 'Networked Lighting Controls (NLC)',
        plainDefinition: 'Distributed intelligent digital lighting controls platform connecting smart power packs, photocells, occupancy sensors, and wallstations via Cat5e cable or 900MHz wireless mesh.',
        businessSignificance: 'Strategic technology platform enabling energy code compliance (Title 24 / ASHRAE 90.1) and driving hardware attachment across all luminaire brands.',
        relatedKpiOrAttribute: 'ProductFamily: "nLight® Controls" | Platform: nLight Wired & nLight AIR',
        benchmarkOrTarget: 'Target attach rate: ≥ 30% of commercial luminaire project specifications',
      },
      {
        term: 'Atrius® IoT Software & Building Solutions',
        category: 'Digital Buildings & Spatial Analytics',
        plainDefinition: 'Cloud-based software suite utilizing sensory luminaire networks for indoor asset tracking, foot-traffic analytics, and enterprise carbon energy reporting.',
        businessSignificance: 'High-margin annual recurring software revenue (SaaS) expanding Acuity\'s footprint from physical hardware into digital building intelligence.',
        relatedKpiOrAttribute: 'ProductFamily: "Atrius® IoT & Buildings" | Subscription SaaS Model',
        benchmarkOrTarget: 'High-retention enterprise accounts (NRR > 115%)',
      },
      {
        term: 'eldoLED® High-Performance LED Drivers',
        category: 'Power Electronics & Dimming Quality',
        plainDefinition: 'Proprietary LED driver technology delivering flicker-free, continuous smooth dimming down to 0.1% for human-centric architectural and circadian lighting.',
        businessSignificance: 'Eliminates optical flicker and audible hum, establishing Acuity luminaires as the standard for specification-grade architectural projects.',
        relatedKpiOrAttribute: 'Driver Families: ECOdrive, SOLOdrive, DUALdrive, POWERdrive | Protocols: 0-10V, DALI-2',
        benchmarkOrTarget: 'Quality benchmark: 50,000-hour operational MTBF rating',
      },
    ],
  };

  // Distinct domains available in the comprehensive definitions dataset
  const domains = useMemo(() => {
    const list = Array.from(new Set(comprehensiveDefinitions.map((d) => d.domain)));
    return ['all', ...list];
  }, []);

  // Filtered definitions for the "Definitions" tab
  const filteredDefinitions = useMemo(() => {
    return comprehensiveDefinitions.filter((item) => {
      const matchesSearch =
        !searchTerm.trim() ||
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.plainDefinition.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.interpretationOrRelevance.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.formulaOrLogic && item.formulaOrLogic.toLowerCase().includes(searchTerm.toLowerCase())) ||
        item.domain.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesDomain = selectedDomain === 'all' || item.domain === selectedDomain;
      const matchesType = selectedType === 'all' || item.type === selectedType;

      return matchesSearch && matchesDomain && matchesType;
    });
  }, [searchTerm, selectedDomain, selectedType]);

  // Filtered terms for the deep-dive tabs
  const currentTerms = glossaryData[activeSection] || [];
  const filteredTerms = searchTerm.trim()
    ? currentTerms.filter(
        (t) =>
          t.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.plainDefinition.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.businessSignificance.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.relatedKpiOrAttribute.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : currentTerms;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#007041]/10 border border-[#007041]/20 flex items-center justify-center text-[#007041] shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Acuity Brands Analytical & Metric Glossary
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Executive business reference guide explaining core KPIs, calculations, and domain taxonomy in clear, business-friendly language.
              </p>
            </div>
          </div>

          {/* Quick Search */}
          <div className="relative w-full sm:w-80 shrink-0">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search definitions, attributes, formulas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-[#04BC6F] focus:border-[#04BC6F]"
            />
          </div>
        </div>
      </div>

      {/* Glossary Navigation Tabs */}
      <div className="border-b border-slate-200">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {sections.map((sec) => {
            const Icon = sec.icon;
            const isActive = activeSection === sec.id;
            return (
              <button
                key={sec.id}
                onClick={() => {
                  setActiveSection(sec.id as any);
                  setSearchTerm('');
                }}
                className={`inline-flex items-center gap-2 px-3.5 py-2 border-b-2 font-semibold text-xs whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'border-[#007041] text-[#007041] font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{sec.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ACTIVE VIEW CONTENT */}
      {activeSection === 'definitions' ? (
        /* ============================================================ */
        /* 1. DEDICATED DEFINITIONS TAB (ALL ATTRIBUTES & KPIS)         */
        /* ============================================================ */
        <div className="space-y-4">
          {/* Domain & Type Filter Bar */}
          <div className="bg-white rounded-xl border border-slate-200/90 p-3.5 shadow-2xs space-y-3">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              {/* Type Switcher */}
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mr-1">
                  Filter by Type:
                </span>
                {(['all', 'KPI', 'Attribute', 'Filter'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors cursor-pointer ${
                      selectedType === type
                        ? 'bg-[#007041] text-white font-semibold shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {type === 'all' ? 'All Types' : type === 'KPI' ? 'KPIs Only' : type === 'Attribute' ? 'Attributes Only' : 'Filters'}
                  </button>
                ))}
              </div>

              {/* Domain Dropdown Filter */}
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider shrink-0">
                  Business Domain:
                </span>
                <select
                  value={selectedDomain}
                  onChange={(e) => setSelectedDomain(e.target.value)}
                  className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 font-medium focus:outline-hidden focus:ring-1 focus:ring-[#04BC6F] cursor-pointer"
                >
                  <option value="all">All Domains ({comprehensiveDefinitions.length} entries)</option>
                  {domains
                    .filter((d) => d !== 'all')
                    .map((d) => {
                      const count = comprehensiveDefinitions.filter((item) => item.domain === d).length;
                      return (
                        <option key={d} value={d}>
                          {d} ({count})
                        </option>
                      );
                    })}
                </select>
              </div>
            </div>

            {/* Quick Status Sub-Bar */}
            <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
              <span className="flex items-center gap-2">
                <span>
                  Showing <strong>{filteredDefinitions.length}</strong> of{' '}
                  <strong>{comprehensiveDefinitions.length}</strong> business-friendly definitions
                </span>
                {selectedDomain !== 'all' && (
                  <span className="text-slate-400">
                    in <strong className="text-slate-700">{selectedDomain}</strong>
                  </span>
                )}
              </span>
              <span className="text-[11px] font-mono text-[#007041] font-semibold hidden sm:inline-block">
                Acuity Enterprise Canonical Schema
              </span>
            </div>
          </div>

          {/* Definitions Grid */}
          {filteredDefinitions.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-400 text-xs">
              No definitions found matching your search and filter criteria. Try clearing search filters.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredDefinitions.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-xl border border-slate-200/90 p-4 sm:p-5 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between space-y-3.5"
                >
                  <div>
                    {/* Header: Name, Type Badge & Domain */}
                    <div className="flex items-start justify-between gap-2.5 mb-2.5">
                      <div className="space-y-1">
                        <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight leading-snug">
                          {item.name}
                        </h3>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider shrink-0 ${
                              item.type === 'KPI'
                                ? 'bg-emerald-50 text-[#007041] border border-emerald-200/60'
                                : item.type === 'Filter'
                                ? 'bg-amber-50 text-amber-800 border border-amber-200/60'
                                : 'bg-blue-50 text-blue-800 border border-blue-200/60'
                            }`}
                          >
                            {item.type}
                          </span>
                          <span className="text-[11px] text-slate-500 font-medium">
                            • {item.domain}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* 1. Plain-Language Definition (1-2 lines) */}
                    <div className="space-y-1 mt-2">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                        Business Definition:
                      </span>
                      <p className="text-xs sm:text-[13px] text-slate-800 leading-relaxed font-normal">
                        {item.plainDefinition}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2.5 pt-2.5 border-t border-slate-100 text-xs">
                    {/* 2. Interpretation (KPI) or Business Relevance (Attribute) */}
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#007041] tracking-wider block">
                        {item.type === 'KPI'
                          ? 'What It Measures & How to Interpret:'
                          : item.type === 'Filter'
                          ? 'Dashboard Scope & Purpose:'
                          : 'Business Relevance & Representation:'}
                      </span>
                      <p className="text-slate-600 mt-0.5 leading-relaxed text-xs">
                        {item.interpretationOrRelevance}
                      </p>
                    </div>

                    {/* 3. Calculation Logic or Formula (where applicable) */}
                    {item.formulaOrLogic && (
                      <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 text-[11px] font-mono text-slate-700 flex items-start gap-1.5">
                        <Calculator className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <div className="overflow-x-auto">
                          <span className="font-sans font-semibold text-slate-600 mr-1">Formula / Logic:</span>
                          <span>{item.formulaOrLogic}</span>
                        </div>
                      </div>
                    )}

                    {/* 4. Target or Standard (where applicable) */}
                    {item.benchmarkOrTarget && (
                      <div className="text-[11px] text-slate-600 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#04BC6F] shrink-0" />
                        <span>
                          <strong className="text-slate-700">Governance Hurdle: </strong>
                          {item.benchmarkOrTarget}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* ============================================================ */
        /* 2. DEEP-DIVE GOVERNANCE TABS                                 */
        /* ============================================================ */
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span>
              Showing <strong>{filteredTerms.length}</strong> terms in{' '}
              <strong className="text-slate-700">
                {sections.find((s) => s.id === activeSection)?.label}
              </strong>
            </span>
            <span className="text-[11px] font-mono text-[#007041]">
              Executive Governance Standard
            </span>
          </div>

          {filteredTerms.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-400 text-xs">
              No terms found matching "{searchTerm}". Try clearing your search.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTerms.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between space-y-3.5"
                >
                  <div>
                    {/* Title & Category Badge */}
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                        {item.term}
                      </h3>
                      <span className="px-2 py-0.5 rounded text-[10.5px] font-semibold bg-slate-100 text-slate-700 shrink-0">
                        {item.category}
                      </span>
                    </div>

                    {/* 1. Plain-Language Definition */}
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                        Plain-Language Definition:
                      </span>
                      <p className="text-xs sm:text-[13px] text-slate-700 leading-relaxed font-normal">
                        {item.plainDefinition}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2.5 pt-2 border-t border-slate-100">
                    {/* 2. Business Significance or Use Case */}
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#007041] tracking-wider block">
                        Business Significance & Use Case:
                      </span>
                      <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                        {item.businessSignificance}
                      </p>
                    </div>

                    {/* 3. Related KPI or Attribute */}
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-[11px] space-y-1 font-mono">
                      <div className="text-slate-700 font-semibold flex items-center gap-1.5">
                        <Tag className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{item.relatedKpiOrAttribute}</span>
                      </div>
                      {item.benchmarkOrTarget && (
                        <div className="text-[10.5px] text-[#007041] font-sans">
                          <strong>Standard / Target: </strong>
                          <span>{item.benchmarkOrTarget}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
