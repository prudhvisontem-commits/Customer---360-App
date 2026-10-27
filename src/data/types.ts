/**
 * Acuity Brands Lighting - Customer 360 Intelligence
 * Canonical Data Types and Entity Schemas
 */

export type CustomerSegment =
  | 'Electrical Distributor'
  | 'Electrical Contractor'
  | 'OEM Fixture Manufacturer'
  | 'Specifier & Lighting Designer'
  | 'Direct Enterprise Account'
  | 'ESCO & Energy Solutions';

export type Channel =
  | 'C&I Electrical Distribution'
  | 'Contractor Direct'
  | 'OEM Sales'
  | 'Specifier Influenced'
  | 'Retail & Renovation'
  | 'Government & Institutional';

export type SalesRegion = 'East' | 'South' | 'Midwest' | 'West' | 'Canada';

export type RelationshipTier = 'Strategic Platinum' | 'Premier Gold' | 'Core Silver' | 'Emerging Bronze';

export type ProductFamily =
  | 'Lithonia Lighting®'
  | 'Holophane®'
  | 'Gotham®'
  | 'Mark Architectural Lighting™'
  | 'Juno®'
  | 'Peerless®'
  | 'nLight® Controls'
  | 'Atrius® IoT & Buildings'
  | 'SensorSwitch™'
  | 'Aculux®';

export type ProductCategory =
  | 'Indoor Ambient & Troffers'
  | 'Industrial & High-Bay'
  | 'Architectural Downlighting'
  | 'Outdoor & Infrastructure'
  | 'Distributed Lighting Controls'
  | 'Building IoT & Software';

export type OpportunityStage =
  | 'Prospecting & Lead Gen'
  | 'Technical Qualification'
  | 'Spec Lock & Value Engineering'
  | 'Proposal & BAFO'
  | 'Negotiation & Contract'
  | 'Closed Won'
  | 'Closed Lost';

export type ServiceSeverity = 'Critical' | 'High' | 'Medium' | 'Low';
export type ServiceStatus = 'New' | 'In Progress' | 'Waiting Customer' | 'Escalated' | 'Resolved' | 'Closed';

export type ServiceCategory =
  | 'LED Driver Failure (eldoLED)'
  | 'nLight Network Commissioning'
  | 'Firmware Incompatibility'
  | 'Optics / Lens Blemish'
  | 'Transit / Packaging Damage'
  | 'Incorrect Specification / BOM';

export interface Account {
  id: string; // Canonical ID: e.g. ABL-CUST-1001
  name: string;
  parentId?: string;
  parentName?: string;
  segment: CustomerSegment;
  channel: Channel;
  region: SalesRegion;
  territory: string;
  accountOwner: string;
  tier: RelationshipTier;
  address: string;
  city: string;
  state: string;
  zip: string;
  activeSince: number;
  creditLimit: number;
  creditHold: boolean;
  paymentTerms: string;
  annualTargetSales: number;
  installedControlsFlag: boolean; // Uses nLight/Atrius
  childLocationsCount: number;
  website: string;
  latitude?: number;
  longitude?: number;
}

export interface Agent {
  id: string;
  name: string;
  role: string;
  agencyName: string;
  region: SalesRegion;
  territory: string;
  email: string;
  phone: string;
  status: 'Active' | 'Assigned';
}

export interface Facility {
  id: string;
  name: string;
  facilityType: 'Global Manufacturing HQ' | 'High-Bay Assembly Plant' | 'Infrastructure Optical Foundry' | 'Architectural Downlighting Center' | 'Linear & Custom Facility' | 'IoT Technology Hub';
  location: string;
  city: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
  productFamilies: ProductFamily[];
  annualCapacityUnits: number;
  operatingStatus: 'Operational' | 'Active';
  certifications: string[];
}

export interface Contact {
  id: string;
  accountId: string;
  accountName: string;
  name: string;
  title: string;
  role: 'Economic Buyer' | 'Technical Specifier' | 'Purchasing Agent' | 'Project PM' | 'Master Electrician' | 'CFO / Controller';
  email: string;
  phone: string;
  decisionPower: 'High' | 'Medium' | 'Low';
  nLightCertified: boolean;
  lastContactDate: string;
}

export interface Opportunity {
  id: string;
  accountId: string;
  accountName: string;
  projectName: string;
  projectType: 'Commercial Office' | 'High-Bay Logistics' | 'Healthcare Facility' | 'Higher Education' | 'Municipal Infrastructure' | 'Retail & Hospitality';
  stage: OpportunityStage;
  value: number;
  winProbability: number; // 0 - 1
  weightedValue: number;
  expectedCloseDate: string;
  productFamily: ProductFamily;
  stageAgeDays: number;
  lastActivityDate: string;
  winProbabilitySource: 'Historical Win Rate + Stage Multiplier' | 'Sales Rep Estimate' | 'Specifier Lock Score';
  riskFactor: 'Stalled in Proposal' | 'Competitor Price Concession' | 'Spec Substituted' | 'Project Schedule Slip' | 'None - On Track';
  recommendedAction: string;
}

export interface Quote {
  id: string;
  quoteNumber: string;
  accountId: string;
  accountName: string;
  opportunityId?: string;
  dateIssued: string;
  expirationDate: string;
  status: 'Won' | 'Lost' | 'Open' | 'Expired' | 'Revised';
  grossValue: number;
  discountedValue: number;
  marginPct: number;
  productFamilies: ProductFamily[];
  revisionNumber: number;
  competitorPressure: 'High' | 'Medium' | 'Low';
}

export interface OrderLine {
  id: string;
  orderNumber: string;
  accountId: string;
  accountName: string;
  orderDate: string;
  requiredShipDate: string;
  actualShipDate?: string;
  productSku: string;
  productFamily: ProductFamily;
  category: ProductCategory;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  cogs: number;
  grossMarginPct: number;
  status: 'Delivered' | 'Shipped' | 'In Production' | 'Backlog Scheduled' | 'Backlog At Risk';
  onTimeStatus: 'On-Time' | 'Supplier Delay' | 'Logistics Delay' | 'Pending';
  agentId?: string;
  facilityId?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  accountId: string;
  accountName: string;
  orderNumber: string;
  invoiceDate: string;
  dueDate: string;
  totalAmount: number;
  paidAmount: number;
  outstandingBalance: number;
  overdueDays: number;
  status: 'Paid' | 'Open Current' | 'Overdue 30' | 'Overdue 60' | 'Overdue 90+' | 'Disputed';
  disputedAmount: number;
  disputeReason?: 'Price Discrepancy' | 'Damaged Shipment' | 'Freight Charge Dispute' | 'Tax Exemption Certificate Missing';
}

export interface Payment {
  id: string;
  paymentNumber: string;
  accountId: string;
  invoiceId: string;
  paymentDate: string;
  amount: number;
  method: 'ACH Transfer' | 'Wire Settlement' | 'Lockbox Check' | 'Card';
}

export interface ServiceCase {
  id: string;
  caseNumber: string;
  accountId: string;
  accountName: string;
  dateOpened: string;
  dateResolved?: string;
  status: ServiceStatus;
  severity: ServiceSeverity;
  category: ServiceCategory;
  productFamily: ProductFamily;
  subject: string;
  slaDeadlineHours: number;
  actualResolutionHours?: number;
  slaBreached: boolean;
  repeatIssue: boolean;
  reopened: boolean;
  csatScore?: number; // 1 to 5
  warrantyEligible: boolean;
  warrantyApproved: boolean;
  assignedEngineer: string;
  recommendedAction: string;
}

export interface EngagementEvent {
  id: string;
  accountId: string;
  eventDate: string;
  type: 'Acuity Academy Course' | 'nLight Hands-On Lab' | 'Factory Tour (Conyers/Monterrey)' | 'AIA Specifier Seminar' | 'Annual Distributor Business Review';
  title: string;
  attendeeCount: number;
  ratingScore: number; // 1 to 5
}

export interface MonthlyFinancialSnapshot {
  monthKey: string; // '2024-11' to '2026-10' (24 months)
  monthLabel: string;
  fiscalYear: number;
  fiscalQuarter: string;
  accountId: string;
  netSales: number;
  cogs: number;
  grossMargin: number;
  grossMarginPct: number;
  targetSales: number;
  savedForecastBase: number;
  savedForecastUpside: number;
  savedForecastDownside: number;
  orderBookings: number;
}

export interface Recommendation {
  id: string;
  accountId: string;
  accountName: string;
  persona: 'Sales' | 'Service' | 'Finance' | 'Leadership';
  signal: string;
  evidence: string;
  businessSignificance: string;
  recommendedAction: string;
  potentialImpactUsd: number;
  confidence: 'High' | 'Medium';
  suggestedOwner: string;
  priority: 'Urgent' | 'High' | 'Medium';
  category: string;
}

export interface CustomerHealth {
  accountId: string;
  overallScore: number; // 0 - 100
  band: 'Healthy' | 'Stable' | 'At Risk' | 'Critical';
  components: {
    commercialMomentum: number; // 0-100 (35% weight)
    serviceQuality: number;     // 0-100 (25% weight)
    financialRisk: number;      // 0-100 (25% weight)
    strategicEngagement: number; // 0-100 (15% weight)
  };
  keyDrivers: string[];
  crossSellOpportunities: string[];
}

export interface SyntheticDataset {
  accounts: Account[];
  contacts: Contact[];
  opportunities: Opportunity[];
  quotes: Quote[];
  orderLines: OrderLine[];
  invoices: Invoice[];
  payments: Payment[];
  serviceCases: ServiceCase[];
  engagementEvents: EngagementEvent[];
  monthlySnapshots: MonthlyFinancialSnapshot[];
  healthMap: Record<string, CustomerHealth>;
  recommendations: Recommendation[];
  agents: Agent[];
  facilities: Facility[];
}

export interface GlobalFilterState {
  reportingPeriod: string; // 'FY2026 YTD' | 'Rolling 12M' | 'FY2025 Full Year' | 'Q4 FY2026' | 'Q3 FY2026' | 'Q2 FY2026' | 'Q1 FY2026'
  parentAccountId: string; // 'all' or id
  accountId: string; // 'all' or id
  segment: string; // 'all' or segment
  channel: string; // 'all' or channel
  region: string; // 'all' or region
  accountOwner: string; // 'all' or owner
  productFamily: string; // 'all' or family
  category: string; // 'all' or category
  opportunityStage: string; // 'all' or stage
  serviceSeverity: string; // 'all' or severity
  riskStatus: string; // 'all' | 'Healthy' | 'Stable' | 'At Risk' | 'Critical'
  agentId: string; // 'all' or agent ID
  salesOrderNumber: string; // 'all' or sales order number
  orderStatus: string; // 'all' | 'Delivered' | 'Shipped' | 'In Production' | 'Backlog Scheduled' | 'Backlog At Risk'
}

export type OrderExceptionCategory = 'Delayed Order' | 'Backlog Exception' | 'Processing Exception' | 'Status Exception';
export type OrderExceptionSeverity = 'Critical' | 'High' | 'Medium';

export interface OrderExceptionItem {
  orderNumber: string;
  accountId: string;
  accountName: string;
  distributorRegion: string;
  agentId: string;
  agentName: string;
  agencyName: string;
  facilityId: string;
  facilityName: string;
  productFamily: string;
  totalValue: number;
  status: 'Delivered' | 'Shipped' | 'In Production' | 'Backlog Scheduled' | 'Backlog At Risk';
  onTimeStatus: 'On-Time' | 'Supplier Delay' | 'Logistics Delay' | 'Pending';
  orderDate: string;
  requiredShipDate: string;
  actualShipDate?: string;
  category: OrderExceptionCategory;
  severity: OrderExceptionSeverity;
  reason: string;
  businessRule: string;
  daysDelayed?: number;
  backlogAgeingDays?: number;
  creditHold: boolean;
  latestUpdate: string;
}

export interface KPIDefinition {
  id: string;
  label: string;
  formula: string;
  sourceRecords: string;
  dateBasis: string;
  units: string;
  businessSignificance: string;
}
