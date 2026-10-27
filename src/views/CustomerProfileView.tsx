/**
 * Acuity Brands Lighting - Unified Customer 360 Profile View
 * Comprehensive 360-degree view uniting Commercial, Orders & Fulfillment,
 * Finance, Service & Quality, Contacts & Hierarchy, Engagement, and Explainable Health.
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  UserCheck,
  Building2,
  TrendingUp,
  Package,
  DollarSign,
  Headphones,
  Users,
  Award,
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Mail,
  Phone,
  Layers,
  ChevronRight,
  ExternalLink,
  Zap,
  Network,
  MapPin,
  Globe,
  Briefcase,
  ChevronDown,
  Search,
  ArrowRight,
  Building,
  Check,
  Info,
  GitBranch
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { KpiCard } from '../components/KpiCard';
import { VisualTooltip } from '../components/common/VisualTooltip';
import { SortableTable, ColumnDef } from '../components/tables/SortableTable';
import { DistributorGeoMap } from '../components/maps/DistributorGeoMap';
import {
  Opportunity,
  Quote,
  OrderLine,
  Invoice,
  ServiceCase,
  Contact,
  EngagementEvent
} from '../data/types';

export const CustomerProfileView: React.FC = () => {
  const {
    dataset,
    selectedAccount,
    selectCustomer,
    openAiWithPrompt,
    filters,
    setFilter,
  } = useData();

  const [activeTab, setActiveTab] = useState<
    | 'overview'
    | 'distributor-info'
    | 'commercial'
    | 'orders'
    | 'finance'
    | 'service'
    | 'contacts'
    | 'engagement'
    | 'intelligence'
  >('overview');

  const [isTreeExpanded, setIsTreeExpanded] = useState<boolean>(true);
  const [branchSearch, setBranchSearch] = useState<string>('');

  // Verified branches for the selected distributor in global filters
  const isDistributorSelectedInFilter = filters.parentAccountId !== 'all';

  const verifiedDistributorBranches = useMemo(() => {
    if (!isDistributorSelectedInFilter) return [];
    return dataset.accounts.filter(
      (a) => a.id === filters.parentAccountId || a.parentId === filters.parentAccountId
    );
  }, [dataset.accounts, filters.parentAccountId, isDistributorSelectedInFilter]);

  // Synchronize selectedAccount if a distributor is chosen in the global filter bar
  useEffect(() => {
    if (isDistributorSelectedInFilter && verifiedDistributorBranches.length > 0) {
      const isAlreadyInDistributor = verifiedDistributorBranches.some(
        (b) => b.id === selectedAccount?.id
      );
      if (!isAlreadyInDistributor) {
        selectCustomer(filters.parentAccountId);
      }
    }
  }, [filters.parentAccountId, isDistributorSelectedInFilter, verifiedDistributorBranches]);

  // Available options for the dropdown:
  // If Distributor selected: ONLY verified branches of this distributor!
  // If no Distributor selected: all accounts matching region/segment/channel filters
  const selectableAccounts = useMemo(() => {
    if (isDistributorSelectedInFilter) {
      return verifiedDistributorBranches;
    }
    return dataset.accounts.filter((a) => {
      if (filters.region !== 'all' && a.region !== filters.region) return false;
      if (filters.segment !== 'all' && a.segment !== filters.segment) return false;
      if (filters.channel !== 'all' && a.channel !== filters.channel) return false;
      return true;
    });
  }, [isDistributorSelectedInFilter, verifiedDistributorBranches, dataset.accounts, filters.region, filters.segment, filters.channel]);

  if (!selectedAccount) {
    return (
      <div className="p-12 text-center text-slate-500 bg-white rounded-xl border border-slate-200">
        No account selected. Please select an account from the search bar or landing page.
      </div>
    );
  }

  const accId = selectedAccount.id;

  // Account specific entities
  const accContacts = dataset.contacts.filter((c) => c.accountId === accId);
  const accOpps = dataset.opportunities.filter((o) => o.accountId === accId);
  const accQuotes = dataset.quotes.filter((q) => q.accountId === accId);
  const accOrders = dataset.orderLines.filter((ol) => ol.accountId === accId);
  const accInvoices = dataset.invoices.filter((i) => i.accountId === accId);
  const accCases = dataset.serviceCases.filter((c) => c.accountId === accId);
  const accEngagements = dataset.engagementEvents.filter((e) => e.accountId === accId);
  const accHealth = dataset.healthMap[accId];
  const accRecs = dataset.recommendations.filter((r) => r.accountId === accId);

  // Financial aggregates for this customer
  const totalSales = accOrders.reduce((sum, ol) => sum + ol.lineTotal, 0);
  const totalCOGS = accOrders.reduce((sum, ol) => sum + ol.cogs, 0);
  const grossMarginPct = totalSales > 0 ? ((totalSales - totalCOGS) / totalSales) * 100 : 40.5;

  const openBacklog = accOrders
    .filter((ol) => ol.status === 'Backlog Scheduled' || ol.status === 'In Production' || ol.status === 'Backlog At Risk')
    .reduce((sum, ol) => sum + ol.lineTotal, 0);

  const totalAR = accInvoices.reduce((sum, i) => sum + i.outstandingBalance, 0);
  const overdueAR = accInvoices
    .filter((i) => i.overdueDays > 0)
    .reduce((sum, i) => sum + i.outstandingBalance, 0);
  const overduePct = totalAR > 0 ? (overdueAR / totalAR) * 100 : 0;

  const openCasesCount = accCases.filter((c) => c.status !== 'Closed').length;

  const siblingAccounts = selectedAccount.parentId
    ? dataset.accounts.filter(
        (a) => a.parentId === selectedAccount.parentId && a.id !== selectedAccount.id
      )
    : [];

  // Distributor hierarchy and branch relationships
  const parentAccount = selectedAccount.parentId
    ? dataset.accounts.find((a) => a.id === selectedAccount.parentId)
    : null;

  const directChildren = dataset.accounts.filter((a) => a.parentId === selectedAccount.id);
  const siblingBranches = selectedAccount.parentId
    ? dataset.accounts.filter((a) => a.parentId === selectedAccount.parentId)
    : [];

  const associatedBranches = directChildren.length > 0
    ? directChildren
    : siblingBranches.length > 0
    ? siblingBranches
    : [];

  const isParentDistributor = !selectedAccount.parentId && directChildren.length > 0;
  const isBranchRecord = !!selectedAccount.parentId;

  const tabs = [
    { id: 'overview', label: '360 Overview', icon: Building2 },
    { id: 'distributor-info', label: 'Distributor Info', icon: Network },
    { id: 'commercial', label: `Commercial (${accOpps.length})`, icon: TrendingUp },
    { id: 'orders', label: `Orders & Backlog (${accOrders.length})`, icon: Package },
    { id: 'finance', label: `Finance & AR (${accInvoices.length})`, icon: DollarSign },
    { id: 'service', label: `Service & Quality (${accCases.length})`, icon: Headphones },
    { id: 'contacts', label: `Contacts & Tree (${accContacts.length})`, icon: Users },
    { id: 'engagement', label: `Engagement (${accEngagements.length})`, icon: Award },
    { id: 'intelligence', label: 'AI Health & Actions', icon: Sparkles },
  ] as const;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Customer Account Selector & Context Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#007041]/10 border border-[#007041]/20 flex items-center justify-center text-[#007041] font-bold">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                {selectedAccount.name}
              </h1>
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold border border-slate-200">
                {selectedAccount.id}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              {selectedAccount.segment} • {selectedAccount.channel} • {selectedAccount.territory} ({selectedAccount.region})
            </p>
          </div>
        </div>

        {/* Quick Switch Account / Branch dropdown */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-500 font-medium">
            {isDistributorSelectedInFilter ? 'Branch:' : 'Switch Account:'}
          </label>
          <select
            value={selectedAccount.id}
            onChange={(e) => selectCustomer(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 font-semibold focus:outline-hidden focus:ring-1 focus:ring-[#04BC6F] cursor-pointer max-w-[240px] truncate"
          >
            {selectableAccounts.map((a) => {
              const isHQ = !a.parentId;
              return (
                <option key={a.id} value={a.id}>
                  {isDistributorSelectedInFilter
                    ? (isHQ ? `Corporate HQ (${a.city}, ${a.state})` : `${a.name.split(' - ')[1] || a.name} (${a.city})`)
                    : `${a.name} (${a.id})`}
                </option>
              );
            })}
          </select>

          <button
            onClick={() =>
              openAiWithPrompt(
                `Provide a complete 360-degree briefing for ${selectedAccount.name} (${selectedAccount.id}), analyzing revenue pacing, open service cases, credit exposure, and next best actions.`
              )
            }
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-all shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#04BC6F]" />
            <span>AI Briefing</span>
          </button>
        </div>
      </div>

      {/* Account Profile Header Hero Banner */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
            {selectedAccount.segment}
          </span>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
            {selectedAccount.channel}
          </span>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-900 text-white">
            {selectedAccount.tier}
          </span>

          {accHealth && (
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-bold font-mono ${
                accHealth.band === 'Healthy'
                  ? 'bg-emerald-100 text-emerald-800'
                  : accHealth.band === 'Critical'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              Health Score: {accHealth.overallScore}/100 ({accHealth.band})
            </span>
          )}
        </div>

        {/* Quick KPI Strip for Account */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-3 border-t border-slate-100">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10.5px] font-semibold text-slate-500 uppercase">YTD Net Sales</span>
              <VisualTooltip
                title="Customer YTD Net Sales"
                businessDefinition="Total invoiced net sales revenue booked for this specific customer account during the current fiscal year."
                attributesUsed="OrderLines.lineTotal, OrderLines.accountId, OrderLines.orderDate"
                calculationLogic="Sum of order line totals less prompt-pay discounts for this account."
                filtersConditions="Delivered or billed orders in current reporting fiscal year."
                interpretation="Demonstrates the account's historical revenue pacing and tier contribution."
              />
            </div>
            <div className="text-lg font-bold font-mono text-slate-900 mt-0.5">
              ${(totalSales / 1000).toFixed(0)}k
            </div>
            <span className="text-[10px] text-slate-400">Invoiced purchases</span>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10.5px] font-semibold text-slate-500 uppercase">Gross Margin %</span>
              <VisualTooltip
                title="Customer Gross Margin %"
                businessDefinition="Realized gross profit margin across all delivered product lines for this account."
                attributesUsed="OrderLines.lineTotal, OrderLines.cogs"
                calculationLogic="((Sum(lineTotal) - Sum(cogs)) / Sum(lineTotal)) * 100."
                filtersConditions="Delivered orders with matched standard manufacturing cost."
                interpretation="Values above 41.5% reflect healthy mix of controls (nLight) and premium architectural luminaires."
              />
            </div>
            <div className="text-lg font-bold font-mono text-[#007041] mt-0.5">
              {grossMarginPct.toFixed(1)}%
            </div>
            <span className="text-[10px] text-slate-400">Realized</span>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10.5px] font-semibold text-slate-500 uppercase">Open Backlog</span>
              <VisualTooltip
                title="Customer Open Backlog"
                businessDefinition="Confirmed, unshipped purchase orders scheduled for factory production, transit, or staging."
                attributesUsed="OrderLines.lineTotal, OrderLines.status"
                calculationLogic="Sum of line totals where status in ('Backlog Scheduled', 'In Production', 'Backlog At Risk')."
                filtersConditions="Active unreleased purchase orders for this account."
                interpretation="Represents committed near-term demand to be fulfilled over the coming 30-60 days."
              />
            </div>
            <div className="text-lg font-bold font-mono text-slate-900 mt-0.5">
              ${(openBacklog / 1000).toFixed(0)}k
            </div>
            <span className="text-[10px] text-slate-400">Unshipped orders</span>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10.5px] font-semibold text-slate-500 uppercase">Outstanding AR</span>
              <VisualTooltip
                title="Customer Outstanding Receivables"
                businessDefinition="Total unpaid balance across all issued invoices currently open on the distributor's ledger."
                attributesUsed="Invoices.outstandingBalance, Invoices.accountId, Accounts.creditLimit"
                calculationLogic="Sum of open invoice outstanding balances."
                filtersConditions="Unsettled customer invoices in active ledger."
                interpretation="Evaluated against approved credit limit to detect liquidity and default exposure."
              />
            </div>
            <div className="text-lg font-bold font-mono text-slate-900 mt-0.5">
              ${(totalAR / 1000).toFixed(0)}k
            </div>
            <span className="text-[10px] text-slate-400">
              Limit: ${(selectedAccount.creditLimit / 1000).toFixed(0)}k
            </span>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10.5px] font-semibold text-slate-500 uppercase">Overdue AR</span>
              <VisualTooltip
                title="Customer Overdue Receivables"
                businessDefinition="Invoice balances that have exceeded agreed contractual credit terms without payment."
                attributesUsed="Invoices.outstandingBalance, Invoices.overdueDays"
                calculationLogic="Sum of outstandingBalance where overdueDays > 0."
                filtersConditions="Overdue invoices for this account."
                interpretation="Overdue balances >60 days trigger automated credit hold warnings."
              />
            </div>
            <div
              className={`text-lg font-bold font-mono mt-0.5 ${
                overdueAR > 0 ? 'text-red-600' : 'text-slate-900'
              }`}
            >
              ${(overdueAR / 1000).toFixed(0)}k
            </div>
            <span className="text-[10px] text-slate-400">{overduePct.toFixed(0)}% of balance</span>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10.5px] font-semibold text-slate-500 uppercase">Open Cases</span>
              <VisualTooltip
                title="Customer Open Service Cases"
                businessDefinition="Active customer service inquiries, field engineer dispatches, or warranty RMA tickets."
                attributesUsed="ServiceCases.status, ServiceCases.slaBreached, ServiceCases.repeatIssue"
                calculationLogic="Count of ServiceCases where status != 'Closed'."
                filtersConditions="Active tickets tied to this customer account."
                interpretation="Elevated open cases indicate project commissioning or driver replacement friction on jobsites."
              />
            </div>
            <div
              className={`text-lg font-bold font-mono mt-0.5 ${
                openCasesCount > 0 ? 'text-amber-600' : 'text-emerald-600'
              }`}
            >
              {openCasesCount} Tickets
            </div>
            <span className="text-[10px] text-slate-400">Field engineering</span>
          </div>
        </div>
      </div>

      {/* Tabs Navigation Strip */}
      <div className="border-b border-slate-200">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {tabs.map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={`inline-flex items-center gap-2 px-3.5 py-2 border-b-2 font-semibold text-xs whitespace-nowrap transition-all ${
                  isActive
                    ? 'border-[#007041] text-[#007041]'
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB CONTENT */}

      {/* 1. Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-5">
            {/* Account Description & Tech Profile */}
            <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs space-y-2.5">
              <h3 className="text-sm font-bold text-slate-900">Relationship Profile & Capabilities</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Operating branch within {selectedAccount.parentName || selectedAccount.name}, serving commercial contractors and enterprise accounts across {selectedAccount.city}, {selectedAccount.state}. Key channel partner for Lithonia Lighting® specification troffers and commercial industrial LED installations.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1.5 text-xs">
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block text-[10.5px]">Controls Maturity:</span>
                  <span className="font-semibold text-slate-800">
                    {selectedAccount.installedControlsFlag ? 'nLight® AIR Enabled' : 'Traditional 0-10V'}
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block text-[10.5px]">Payment Terms:</span>
                  <span className="font-semibold text-slate-800">{selectedAccount.paymentTerms}</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block text-[10.5px]">Credit Status:</span>
                  <span
                    className={`font-semibold ${
                      selectedAccount.creditHold ? 'text-red-600' : 'text-emerald-700'
                    }`}
                  >
                    {selectedAccount.creditHold ? 'On Credit Hold' : 'In Good Standing'}
                  </span>
                </div>
              </div>
            </div>

            {/* Recent Sales Orders Overview */}
            <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">Recent Sales Orders</h3>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="text-xs font-semibold text-[#007041] hover:underline"
                >
                  View All Sales Orders &rarr;
                </button>
              </div>

              <div className="divide-y divide-slate-100 text-xs">
                {accOrders.slice(0, 4).map((ol) => (
                  <div key={ol.id} className="py-2 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900">{ol.orderNumber} • {ol.productSku}</div>
                      <div className="text-[10.5px] text-slate-500">
                        {ol.productFamily} • Qty: {ol.quantity} • Date: {ol.orderDate}
                      </div>
                    </div>
                    <div className="text-right font-mono">
                      <div className="font-bold text-slate-900">${(ol.lineTotal / 1000).toFixed(1)}k</div>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-700">
                        {ol.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Health Components */}
          <div className="space-y-5">
            {accHealth && (
              <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs space-y-3 relative">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900">Health Score Breakdown</h3>
                  <VisualTooltip
                    title="Health Score Model"
                    description="Composite score based on Commercial Momentum (35%), Service Quality (25%), Financial Risk (25%), and Controls Engagement (15%)."
                    calculation="Weighted average of 4 normalized 0-100 indices"
                  />
                </div>

                <div className="space-y-2.5 text-xs">
                  <div>
                    <div className="flex justify-between text-slate-700 mb-1">
                      <span>Commercial Momentum (35%):</span>
                      <span className="font-mono font-bold">{accHealth.components.commercialMomentum}/100</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#04BC6F] rounded-full"
                        style={{ width: `${accHealth.components.commercialMomentum}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-700 mb-1">
                      <span>Service & Quality (25%):</span>
                      <span className="font-mono font-bold">{accHealth.components.serviceQuality}/100</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#4379A3] rounded-full"
                        style={{ width: `${accHealth.components.serviceQuality}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-700 mb-1">
                      <span>Financial & Credit Risk (25%):</span>
                      <span className="font-mono font-bold">{accHealth.components.financialRisk}/100</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full"
                        style={{ width: `${accHealth.components.financialRisk}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-700 mb-1">
                      <span>Controls Engagement (15%):</span>
                      <span className="font-mono font-bold">{accHealth.components.strategicEngagement}/100</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#007041] rounded-full"
                        style={{ width: `${accHealth.components.strategicEngagement}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <span className="text-[10.5px] font-semibold text-slate-700 block mb-1">Detected Signals:</span>
                  <ul className="text-[10.5px] text-slate-500 space-y-1 list-disc pl-4">
                    {accHealth.keyDrivers.map((d, i) => (
                      <li key={i}>{d}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. Distributor Info Tab (Consolidated Demographic, Reporting, Hierarchy, and Profile) */}
      {activeTab === 'distributor-info' && (
        <div className="space-y-6">
          {/* SECTION A: DISTRIBUTOR DEMOGRAPHIC INFORMATION */}
          <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#007041]/10 border border-[#007041]/20 flex items-center justify-center text-[#007041] shrink-0">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                    <span>Distributor Demographic Information</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold border border-slate-200">
                      SECTION A
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Official business classifications and verified master data attributes from SAP KNA1 enterprise ledger.
                  </p>
                </div>
              </div>

              {/* Status Badges */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-slate-900 text-white">
                  {isParentDistributor
                    ? 'Corporate Enterprise Master'
                    : isBranchRecord
                    ? 'Regional Operating Branch'
                    : 'Single-Location Distributor'}
                </span>
                <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-[#007041]/15 text-[#007041] border border-[#007041]/30">
                  {selectedAccount.tier}
                </span>
                <span className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700">
                  {selectedAccount.segment}
                </span>
              </div>
            </div>

            {/* Demographic Attribute Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {/* 1. Legal Name */}
              <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/70 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                  Distributor Legal Name
                </span>
                <div className="text-sm font-bold text-slate-900 truncate" title={selectedAccount.name}>
                  {selectedAccount.name}
                </div>
                <span className="text-[11px] text-slate-500 block truncate">
                  DBA / Registered Business Name
                </span>
              </div>

              {/* 2. Canonical Customer ID */}
              <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/70 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                  Canonical Customer Identifier
                </span>
                <div className="text-sm font-mono font-bold text-[#007041] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/80 inline-block">
                  {selectedAccount.id}
                </div>
                <span className="text-[11px] text-slate-500 block">
                  Master ERP Customer Code
                </span>
              </div>

              {/* 3. Industry Segment */}
              <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/70 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                  Distributor Classification / Type
                </span>
                <div className="text-sm font-bold text-slate-900 truncate">
                  {selectedAccount.segment}
                </div>
                <span className="text-[11px] text-slate-500 block">
                  Core Industry Classification
                </span>
              </div>

              {/* 4. Sales Channel */}
              <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/70 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                  Commercial Route-to-Market
                </span>
                <div className="text-sm font-bold text-slate-900 truncate">
                  {selectedAccount.channel}
                </div>
                <span className="text-[11px] text-slate-500 block">
                  Distribution & Sales Channel
                </span>
              </div>

              {/* 5. Geographic Region & Territory */}
              <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/70 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                  Region & Sales Agency Territory
                </span>
                <div className="text-sm font-bold text-slate-900 truncate">
                  {selectedAccount.region} Region
                </div>
                <span className="text-[11px] text-slate-500 block truncate" title={selectedAccount.territory}>
                  {selectedAccount.territory}
                </span>
              </div>

              {/* 6. Physical Operating Address */}
              <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/70 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                  Operating Hub Location
                </span>
                <div className="text-sm font-bold text-slate-900 truncate" title={`${selectedAccount.city}, ${selectedAccount.state}`}>
                  {selectedAccount.city}, {selectedAccount.state} {selectedAccount.zip}
                </div>
                <span className="text-[11px] text-slate-500 block truncate" title={selectedAccount.address}>
                  {selectedAccount.address}
                </span>
              </div>

              {/* 7. Commercial Tenure */}
              <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/70 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                  Customer Tenure / Established
                </span>
                <div className="text-sm font-bold text-slate-900">
                  Since {selectedAccount.activeSince}
                </div>
                <span className="text-[11px] text-slate-500 block">
                  {Math.max(1, new Date().getFullYear() - selectedAccount.activeSince)} Years Active Relationship
                </span>
              </div>

              {/* 8. Web Presence */}
              <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/70 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                  Corporate Digital Presence
                </span>
                <div className="text-sm font-medium text-slate-900 truncate">
                  {selectedAccount.website ? (
                    <a
                      href={selectedAccount.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#007041] hover:underline flex items-center gap-1"
                    >
                      <Globe className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{selectedAccount.website.replace('https://', '')}</span>
                    </a>
                  ) : (
                    <span className="text-slate-400 italic">Data not available</span>
                  )}
                </div>
                <span className="text-[11px] text-slate-500 block">
                  Verified Commercial Portal
                </span>
              </div>
            </div>
          </div>

          {/* SECTION B: DISTRIBUTOR REPORTING STRUCTURE */}
          <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-200/60 flex items-center justify-center text-blue-700 shrink-0">
                  <GitBranch className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                    <span>Distributor Reporting Structure</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold border border-slate-200">
                      SECTION B
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Structured chain of organizational accountability from executive commercial oversight down to the local operating unit.
                  </p>
                </div>
              </div>
              <span className="text-xs font-mono text-slate-500">
                Governance Hierarchy Level: {isBranchRecord ? 'Branch Node (L3)' : 'Enterprise Master (L1)'}
              </span>
            </div>

            {/* Hierarchical Pipeline Flow */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 relative">
              {/* Level 1: Corporate Executive Governance */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between space-y-3 relative group hover:border-slate-300 transition-colors">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                      Level 1: Executive Sales
                    </span>
                    <span className="w-2 h-2 rounded-full bg-slate-900" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-slate-700 shrink-0" />
                    <h4 className="text-xs font-bold text-slate-900">
                      Acuity Brands Leadership
                    </h4>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-snug">
                    VP of North American Commercial Sales
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-200/60 text-[10.5px] text-slate-500">
                  <strong>Role:</strong> Annual Quota, Trade Terms & National Rebate Governance
                </div>
              </div>

              {/* Level 2: Regional Territory Management */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between space-y-3 relative group hover:border-slate-300 transition-colors">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600">
                      Level 2: Commercial Manager
                    </span>
                    <span className="w-2 h-2 rounded-full bg-blue-600" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-blue-700 shrink-0" />
                    <h4 className="text-xs font-bold text-slate-900 truncate" title={selectedAccount.accountOwner}>
                      {selectedAccount.accountOwner || 'Data not available'}
                    </h4>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-snug">
                    Regional Commercial Director ({selectedAccount.region} Region)
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-200/60 text-[10.5px] text-slate-500 truncate" title={selectedAccount.territory}>
                  <strong>Territory:</strong> {selectedAccount.territory}
                </div>
              </div>

              {/* Level 3: Parent Corporate Distributor */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between space-y-3 relative group hover:border-slate-300 transition-colors">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-600">
                      Level 3: Parent Organization
                    </span>
                    <span className="w-2 h-2 rounded-full bg-amber-600" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-amber-700 shrink-0" />
                    <h4
                      className="text-xs font-bold text-slate-900 truncate"
                      title={parentAccount ? parentAccount.name : isParentDistributor ? selectedAccount.name : 'Independent Account'}
                    >
                      {parentAccount
                        ? parentAccount.name
                        : isParentDistributor
                        ? selectedAccount.name
                        : 'Single-Location Independent'}
                    </h4>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-snug">
                    {parentAccount
                      ? `Enterprise Parent (${parentAccount.id})`
                      : isParentDistributor
                      ? `Enterprise Parent (${selectedAccount.id})`
                      : 'Direct Account (No Corporate Parent)'}
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-200/60 text-[10.5px] text-slate-500">
                  <strong>Network:</strong>{' '}
                  {parentAccount
                    ? `${parentAccount.childLocationsCount || associatedBranches.length} Operating Branches`
                    : isParentDistributor
                    ? `${selectedAccount.childLocationsCount || associatedBranches.length} Operating Branches`
                    : '1 Single Operating Facility'}
                </div>
              </div>

              {/* Level 4: Local Operating Branch & Primary Contact */}
              <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 flex flex-col justify-between space-y-3 relative group">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#007041]">
                      Level 4: Operating Unit
                    </span>
                    <span className="w-2 h-2 rounded-full bg-[#007041]" />
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#007041] shrink-0" />
                    <h4 className="text-xs font-bold text-slate-900 truncate" title={selectedAccount.name}>
                      {selectedAccount.name}
                    </h4>
                  </div>
                  <p className="text-[11px] text-slate-700 font-mono">
                    {selectedAccount.id} • {selectedAccount.city}, {selectedAccount.state}
                  </p>
                </div>
                <div className="pt-2 border-t border-emerald-200/60 text-[10.5px] text-slate-700 truncate">
                  <strong>Lead Contact:</strong>{' '}
                  {accContacts[0]
                    ? `${accContacts[0].name} (${accContacts[0].role})`
                    : 'Data not available'}
                </div>
              </div>
            </div>
          </div>

          {/* GEOGRAPHICAL MAP ENHANCEMENT: DISTRIBUTOR DEMOGRAPHICS, LOCATIONS, BRANCHES & HIERARCHY */}
          <DistributorGeoMap
            currentAccount={selectedAccount}
            parentAccount={parentAccount ?? null}
            associatedBranches={associatedBranches}
            allAccounts={dataset.accounts}
            onSelectAccount={(accId) => selectCustomer(accId)}
          />

          {/* SECTION C: BRANCHES AND DISTRIBUTOR HIERARCHY */}
          <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#04BC6F]/15 border border-[#04BC6F]/30 flex items-center justify-center text-[#007041] shrink-0">
                  <Network className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                    <span>Branches and Distributor Hierarchy</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold border border-slate-200">
                      SECTION C
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Parent-child relationship tree distinguishing distributor-level enterprise records from regional operating branches.
                  </p>
                </div>
              </div>

              {/* Hierarchy Tree Action Controls */}
              <div className="flex items-center gap-2">
                {/* Search in Branches */}
                {associatedBranches.length > 0 && (
                  <div className="relative w-44 sm:w-56">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Filter branch locations..."
                      value={branchSearch}
                      onChange={(e) => setBranchSearch(e.target.value)}
                      className="w-full pl-8 pr-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-[#04BC6F]"
                    />
                  </div>
                )}

                <button
                  onClick={() => setIsTreeExpanded(!isTreeExpanded)}
                  className="px-3 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      isTreeExpanded ? 'rotate-180' : ''
                    }`}
                  />
                  <span>{isTreeExpanded ? 'Collapse Tree' : 'Expand Tree'}</span>
                </button>
              </div>
            </div>

            {/* Record Distinction Context Banner */}
            <div
              className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
                isBranchRecord
                  ? 'bg-blue-50/70 border-blue-200/80 text-blue-950'
                  : isParentDistributor
                  ? 'bg-emerald-50/70 border-emerald-200/80 text-emerald-950'
                  : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}
            >
              <div className="flex items-start gap-2.5">
                <Info className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
                <div>
                  {isBranchRecord ? (
                    <div>
                      <strong className="font-bold">Operating Branch View:</strong> You are currently inspecting branch record{' '}
                      <span className="font-mono font-bold bg-white px-1.5 py-0.5 rounded border border-blue-200">
                        {selectedAccount.name} ({selectedAccount.id})
                      </span>
                      , which operates under parent corporate distributor{' '}
                      <strong>{parentAccount?.name || selectedAccount.parentName}</strong> ({selectedAccount.parentId}).
                    </div>
                  ) : isParentDistributor ? (
                    <div>
                      <strong className="font-bold">Corporate Parent View:</strong> You are currently inspecting the master enterprise record{' '}
                      <span className="font-mono font-bold bg-white px-1.5 py-0.5 rounded border border-emerald-200">
                        {selectedAccount.name} ({selectedAccount.id})
                      </span>
                      . This entity holds national corporate agreements for{' '}
                      <strong>{associatedBranches.length} registered operating branches</strong>.
                    </div>
                  ) : (
                    <div>
                      <strong className="font-bold">Independent Commercial Account:</strong> This distributor operates as a single-location entity with no registered subsidiary branches.
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Jump to Parent if on Branch */}
              {isBranchRecord && parentAccount && (
                <button
                  onClick={() => selectCustomer(parentAccount.id)}
                  className="px-3 py-1.5 rounded-lg bg-blue-900 text-white font-bold hover:bg-blue-800 transition-colors shrink-0 cursor-pointer inline-flex items-center gap-1.5 shadow-2xs"
                >
                  <span>Select Parent Distributor</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Expandable Hierarchy Tree Visualization */}
            <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50/40">
              {/* Root Parent Node */}
              <div className="p-4 bg-white border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
                    HQ
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-slate-900">
                        {parentAccount ? parentAccount.name : selectedAccount.name}
                      </span>
                      <span className="font-mono text-xs px-2 py-0.2 rounded bg-slate-100 text-slate-700 font-bold border border-slate-200">
                        {parentAccount ? parentAccount.id : selectedAccount.id}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-900 text-white">
                        PARENT DISTRIBUTOR
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {parentAccount
                        ? `${parentAccount.address}, ${parentAccount.city}, ${parentAccount.state} • ${parentAccount.region} Region`
                        : `${selectedAccount.address}, ${selectedAccount.city}, ${selectedAccount.state} • ${selectedAccount.region} Region`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-500 font-medium">Network Footprint:</span>
                  <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                    {parentAccount
                      ? `${parentAccount.childLocationsCount || associatedBranches.length} Branches`
                      : isParentDistributor
                      ? `${selectedAccount.childLocationsCount || associatedBranches.length} Branches`
                      : 'Single Branch'}
                  </span>
                </div>
              </div>

              {/* Children Branches Tree Container */}
              {isTreeExpanded && (
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                    <span className="font-bold uppercase tracking-wider text-[10px]">
                      Registered Subsidiary Operating Branches ({associatedBranches.filter((b) => {
                        if (!branchSearch.trim()) return true;
                        const q = branchSearch.toLowerCase();
                        return (
                          b.name.toLowerCase().includes(q) ||
                          b.id.toLowerCase().includes(q) ||
                          b.city.toLowerCase().includes(q) ||
                          b.state.toLowerCase().includes(q) ||
                          b.territory.toLowerCase().includes(q) ||
                          b.tier.toLowerCase().includes(q)
                        );
                      }).length})
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Click any branch to inspect its active Customer 360 profile
                    </span>
                  </div>

                  {associatedBranches.filter((b) => {
                    if (!branchSearch.trim()) return true;
                    const q = branchSearch.toLowerCase();
                    return (
                      b.name.toLowerCase().includes(q) ||
                      b.id.toLowerCase().includes(q) ||
                      b.city.toLowerCase().includes(q) ||
                      b.state.toLowerCase().includes(q) ||
                      b.territory.toLowerCase().includes(q) ||
                      b.tier.toLowerCase().includes(q)
                    );
                  }).length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400 bg-white rounded-lg border border-slate-200">
                      {associatedBranches.length === 0
                        ? 'No child branch records exist for this distributor account in the source dataset.'
                        : `No branches found matching "${branchSearch}". Try clearing the search filter.`}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-2 sm:pl-4 border-l-2 border-slate-200">
                      {associatedBranches
                        .filter((b) => {
                          if (!branchSearch.trim()) return true;
                          const q = branchSearch.toLowerCase();
                          return (
                            b.name.toLowerCase().includes(q) ||
                            b.id.toLowerCase().includes(q) ||
                            b.city.toLowerCase().includes(q) ||
                            b.state.toLowerCase().includes(q) ||
                            b.territory.toLowerCase().includes(q) ||
                            b.tier.toLowerCase().includes(q)
                          );
                        })
                        .map((branch) => {
                          const isCurrent = branch.id === selectedAccount.id;
                          return (
                            <div
                              key={branch.id}
                              className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between space-y-2.5 ${
                                isCurrent
                                  ? 'bg-white border-[#007041] ring-2 ring-[#007041]/20 shadow-xs'
                                  : 'bg-white border-slate-200/90 hover:border-slate-300 hover:shadow-2xs'
                              }`}
                            >
                              <div>
                                {/* Branch Name, ID and Badges */}
                                <div className="flex items-start justify-between gap-2 mb-1.5">
                                  <div className="space-y-0.5">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <h4 className="text-xs font-bold text-slate-900">
                                        {branch.name}
                                      </h4>
                                      {isCurrent && (
                                        <span className="text-[9.5px] font-extrabold px-1.5 py-0.2 rounded bg-emerald-100 text-[#007041] border border-emerald-300">
                                          ACTIVE ACCOUNT
                                        </span>
                                      )}
                                    </div>
                                    <span className="font-mono text-[10.5px] text-slate-500">
                                      Branch ID: {branch.id}
                                    </span>
                                  </div>

                                  <span
                                    className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                                      branch.tier === 'Strategic Platinum'
                                        ? 'bg-slate-900 text-white'
                                        : branch.tier === 'Premier Gold'
                                        ? 'bg-amber-100 text-amber-900'
                                        : 'bg-slate-100 text-slate-700'
                                    }`}
                                  >
                                    {branch.tier}
                                  </span>
                                </div>

                                {/* Location & Territory */}
                                <p className="text-[11px] text-slate-600 flex items-center gap-1">
                                  <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                                  <span>
                                    {branch.city}, {branch.state} ({branch.region}) • {branch.territory}
                                  </span>
                                </p>
                              </div>

                              {/* Branch Metrics & Quick Switch Button */}
                              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                                <div className="space-y-0.5 font-mono text-[10.5px]">
                                  <div className="text-slate-600">
                                    Target: <strong>${(branch.annualTargetSales / 1000).toFixed(0)}k</strong>
                                    <span className="mx-1">•</span>
                                    Limit: <strong>${(branch.creditLimit / 1000).toFixed(0)}k</strong>
                                  </div>
                                  <div className="text-[10px] text-slate-500">
                                    Status:{' '}
                                    <span
                                      className={
                                        branch.creditHold ? 'text-red-600 font-bold' : 'text-emerald-700 font-medium'
                                      }
                                    >
                                      {branch.creditHold ? 'Credit Hold' : 'Good Standing'}
                                    </span>
                                    <span className="mx-1">•</span>
                                    {branch.installedControlsFlag ? 'nLight AIR' : '0-10V Standard'}
                                  </div>
                                </div>

                                {!isCurrent ? (
                                  <button
                                    onClick={() => selectCustomer(branch.id)}
                                    className="px-2.5 py-1 rounded-md text-[10.5px] font-bold bg-slate-100 hover:bg-[#007041] hover:text-white text-slate-700 transition-colors inline-flex items-center gap-1 cursor-pointer shrink-0"
                                  >
                                    <span>Inspect</span>
                                    <ArrowRight className="w-3 h-3" />
                                  </button>
                                ) : (
                                  <span className="text-[10.5px] font-semibold text-[#007041]">
                                    Viewing Now
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* SECTION D: GENERAL DISTRIBUTOR PROFILE INFORMATION */}
          <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-purple-50 border border-purple-200/60 flex items-center justify-center text-purple-700 shrink-0">
                  <Building className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                    <span>General Distributor Profile Information</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold border border-slate-200">
                      SECTION D
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Consolidated operational profile across contractual terms, controls capabilities, buying committee governance, and channel execution.
                  </p>
                </div>
              </div>
            </div>

            {/* 4 Logical Business Categories Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Category 1: Commercial & Financial Terms */}
              <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-200/60 pb-2">
                  <DollarSign className="w-4 h-4 text-emerald-700 shrink-0" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                    Commercial & Financial Terms
                  </h4>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Contractual Payment Terms:</span>
                    <span className="font-semibold text-slate-900">
                      {selectedAccount.paymentTerms || 'Data not available'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Annual Sales Operating Target:</span>
                    <span className="font-mono font-bold text-slate-900">
                      ${selectedAccount.annualTargetSales.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Authorized Credit Exposure Ceiling:</span>
                    <span className="font-mono font-bold text-slate-900">
                      ${selectedAccount.creditLimit.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Credit Administrative Status:</span>
                    <span
                      className={`font-semibold ${
                        selectedAccount.creditHold ? 'text-red-600' : 'text-emerald-700'
                      }`}
                    >
                      {selectedAccount.creditHold
                        ? 'Administrative Hold (Factory Releases Paused)'
                        : 'Active / Good Standing (No Holds)'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Rebate Tier Program:</span>
                    <span className="font-semibold text-slate-800">
                      {selectedAccount.tier} Annual Growth Incentive
                    </span>
                  </div>
                </div>
              </div>

              {/* Category 2: Technology & Controls Platform Adoption */}
              <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-200/60 pb-2">
                  <Zap className="w-4 h-4 text-[#007041] shrink-0" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                    Technology & Controls Adoption
                  </h4>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Networked Controls Status:</span>
                    <span
                      className={`font-semibold ${
                        selectedAccount.installedControlsFlag ? 'text-[#007041]' : 'text-slate-700'
                      }`}
                    >
                      {selectedAccount.installedControlsFlag
                        ? 'Active Partner (nLight® Wired & AIR)'
                        : 'Standard 0-10V Fixtures Only'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Controls Specification Maturity:</span>
                    <span className="font-semibold text-slate-900">
                      {selectedAccount.installedControlsFlag
                        ? 'Title 24 & ASHRAE 90.1 Compliant'
                        : 'Standard Ambient Troffers & High-Bay Stock'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Gross Margin Lift:</span>
                    <span className="font-semibold text-[#007041]">
                      {selectedAccount.installedControlsFlag
                        ? '+320 bps Realized Margin Uplift'
                        : 'Standard Fixture Commodity Margin'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Digital Building Solutions:</span>
                    <span className="font-semibold text-slate-900">
                      {selectedAccount.installedControlsFlag
                        ? 'Atrius® IoT Software Enabled'
                        : 'Hardware Only (Non-SaaS)'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Commissioning Lab Status:</span>
                    <span className="font-semibold text-slate-800">
                      {selectedAccount.installedControlsFlag
                        ? 'Certified Technical Distributor'
                        : 'Training Recommended'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Category 3: Buying Committee & Stakeholder Governance */}
              <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-200/60 pb-2">
                  <Users className="w-4 h-4 text-blue-700 shrink-0" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                    Buying Committee & Governance
                  </h4>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Total Registered Contacts:</span>
                    <span className="font-bold text-slate-900">
                      {accContacts.length > 0 ? `${accContacts.length} Contacts on File` : 'Data not available'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">High-Influence Decision Makers:</span>
                    <span className="font-semibold text-slate-900">
                      {accContacts.filter((c) => c.decisionPower === 'High').length} High-Authority Stakeholders
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Acuity Academy Certifications:</span>
                    <span className="font-semibold text-[#007041]">
                      {accContacts.filter((c) => c.nLightCertified).length} Certified Controls Technicians
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Primary Economic Buyer:</span>
                    <span className="font-semibold text-slate-900 truncate max-w-[200px]" title={accContacts.find((c) => c.role === 'Economic Buyer' || c.role === 'CFO / Controller')?.name || accContacts[0]?.name}>
                      {accContacts.find((c) => c.role === 'Economic Buyer' || c.role === 'CFO / Controller')?.name ||
                        accContacts[0]?.name ||
                        'Data not available'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Account Governance Cadence:</span>
                    <span className="font-semibold text-slate-800">
                      {selectedAccount.tier === 'Strategic Platinum'
                        ? 'Executive Quarterly Business Review'
                        : 'Bi-Annual Commercial Review'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Category 4: Operational Footprint & Execution */}
              <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-200/60 pb-2">
                  <Package className="w-4 h-4 text-amber-700 shrink-0" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                    Operational Footprint & Execution
                  </h4>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Facility Classification:</span>
                    <span className="font-semibold text-slate-900">
                      {isBranchRecord
                        ? 'Regional Stocking Branch & Trade Counter'
                        : isParentDistributor
                        ? 'Enterprise Corporate Headquarters'
                        : 'Independent Commercial Facility'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Associated Network Locations:</span>
                    <span className="font-mono font-bold text-slate-900">
                      {selectedAccount.childLocationsCount ||
                        (associatedBranches.length > 0 ? associatedBranches.length : 1)}{' '}
                      Facilities
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Fulfillment Model:</span>
                    <span className="font-semibold text-slate-900">
                      Direct Factory Shipment & Stock-and-Flow
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Commercial Sales Channel:</span>
                    <span className="font-semibold text-slate-900">
                      {selectedAccount.channel}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Assigned Sales Agency:</span>
                    <span className="font-semibold text-slate-800 truncate max-w-[200px]" title={selectedAccount.territory}>
                      {selectedAccount.territory} Agency Network
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Commercial Tab (Quotes & Opportunities) */}
      {activeTab === 'commercial' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">Commercial Opportunities</h3>
                <VisualTooltip
                  title="Commercial Opportunities Governance"
                  formula="Active pipeline projects in Salesforce Lightning CRM tagged to this Account ID."
                  source="Salesforce Lightning CRM (Opportunity Object)"
                  updateFrequency="Real-Time Sync"
                  caveats="Unweighted total estimated value; probabilities dynamically mapped to sales stage."
                />
              </div>
            </div>
            {accOpps.length === 0 ? (
              <div className="text-xs text-slate-400 py-6 text-center">No open opportunities found.</div>
            ) : (
              <div className="space-y-2.5 text-xs">
                {accOpps.map((opp) => (
                  <div key={opp.id} className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{opp.projectName}</span>
                      <span className="font-mono font-bold text-slate-900">${(opp.value / 1000).toFixed(0)}k</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-500 text-[11px]">
                      <span>Stage: <strong>{opp.stage}</strong></span>
                      <span>Product: {opp.productFamily}</span>
                    </div>
                    <div className="text-[11px] text-slate-600 bg-white p-2 rounded border border-slate-100 mt-1">
                      {opp.recommendedAction}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">Recent Quotations</h3>
                <VisualTooltip
                  title="Acuity Quotations & Pricing Governance"
                  formula="Approved quotes generated via Agile / CPQ pricing configurator."
                  source="Salesforce CPQ / Oracle Agile Pricing"
                  updateFrequency="Real-Time"
                  caveats="Discounted value reflects authorized distributor multiplier."
                />
              </div>
            </div>
            {accQuotes.length === 0 ? (
              <div className="text-xs text-slate-400 py-6 text-center">No quotes on file.</div>
            ) : (
              <div className="space-y-2.5 text-xs">
                {accQuotes.map((q) => (
                  <div key={q.id} className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1">
                    <div className="flex items-center justify-between font-mono font-bold">
                      <span className="text-slate-900">{q.quoteNumber}</span>
                      <span className="text-slate-900">${(q.discountedValue / 1000).toFixed(0)}k</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-500 text-[11px]">
                      <span>Status: <strong className="text-slate-700">{q.status}</strong></span>
                      <span>Margin: {q.marginPct.toFixed(1)}%</span>
                      <span>Expires: {q.expirationDate}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. Orders & Fulfillment Tab */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900">Sales Order Lines & Backlog Delivery Status</h3>
              <VisualTooltip
                title="Customer Sales Order Lines & Fulfillment Governance"
                formula="SAP Sales & Distribution (SD) sales order line items, confirmed factory promise dates, and delivery logs."
                source="SAP ECC (SD Module) + WMS Logistics Feed"
                updateFrequency="Hourly Sync"
                caveats="Backlog At Risk indicates missing raw materials or driver component shortages at manufacturing plants."
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold">
                  <th className="py-2.5 px-3">Sales Order #</th>
                  <th className="py-2.5 px-3">SKU & Product Family</th>
                  <th className="py-2.5 px-3 text-center">Qty</th>
                  <th className="py-2.5 px-3 text-right">Line Total</th>
                  <th className="py-2.5 px-3 text-right">Margin %</th>
                  <th className="py-2.5 px-3">Ship Status</th>
                  <th className="py-2.5 px-3">On-Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {accOrders.map((ol) => (
                  <tr key={ol.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-mono font-semibold text-slate-900">{ol.orderNumber}</td>
                    <td className="py-2.5 px-3">
                      <div className="font-medium text-slate-800">{ol.productSku}</div>
                      <div className="text-[10px] text-slate-400">{ol.productFamily}</div>
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono">{ol.quantity}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold">${(ol.lineTotal / 1000).toFixed(1)}k</td>
                    <td className="py-2.5 px-3 text-right font-mono text-emerald-700">{ol.grossMarginPct.toFixed(1)}%</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded text-[10.5px] bg-slate-100 text-slate-700 font-medium">
                        {ol.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10.5px] font-medium ${
                          ol.onTimeStatus === 'On-Time'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {ol.onTimeStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. Finance Tab */}
      {activeTab === 'finance' && (
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900">Invoices, Receivables & Credit Ledger</h3>
              <VisualTooltip
                title="Customer Invoices & Aging Governance"
                formula="SAP FI-AR open invoices, aging buckets calculation, and invoice dispute resolution flags."
                source="SAP ECC (FI Module) + HighRadius Receivables Cloud"
                updateFrequency="Nightly EOD Sync"
                caveats="Overdue balance triggers automated credit block if >60 days past agreed terms."
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold">
                  <th className="py-2.5 px-3">Invoice #</th>
                  <th className="py-2.5 px-3">Invoice Date</th>
                  <th className="py-2.5 px-3">Due Date</th>
                  <th className="py-2.5 px-3 text-right">Total Amount</th>
                  <th className="py-2.5 px-3 text-right">Outstanding</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Dispute Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {accInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-mono font-semibold text-slate-900">{inv.invoiceNumber}</td>
                    <td className="py-2.5 px-3 text-slate-600 font-mono">{inv.invoiceDate}</td>
                    <td className="py-2.5 px-3 text-slate-600 font-mono">{inv.dueDate}</td>
                    <td className="py-2.5 px-3 text-right font-mono">${(inv.totalAmount / 1000).toFixed(1)}k</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                      ${(inv.outstandingBalance / 1000).toFixed(1)}k
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10.5px] font-medium ${
                          inv.status === 'Paid'
                            ? 'bg-emerald-100 text-emerald-800'
                            : inv.status.includes('Overdue')
                            ? 'bg-red-100 text-red-800 font-bold'
                            : inv.status === 'Disputed'
                            ? 'bg-purple-100 text-purple-800 font-bold'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-500">{inv.disputeReason || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. Service Tab */}
      {activeTab === 'service' && (
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900">Field Service Support Cases</h3>
              <VisualTooltip
                title="ServiceNow Case & RMA Governance"
                formula="Customer service incident records, field engineering RMA requests, and SLA breaches."
                source="ServiceNow CSM + Quality Incident Log"
                updateFrequency="Real-Time Webhook"
                caveats="Critical severity cases require regional engineering dispatch within 4 hours."
              />
            </div>
          </div>
          <div className="space-y-2.5 text-xs">
            {accCases.map((sc) => (
              <div key={sc.id} className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900">{sc.caseNumber}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        sc.severity === 'Critical'
                          ? 'bg-red-100 text-red-800'
                          : sc.severity === 'High'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {sc.severity}
                    </span>
                    {sc.slaBreached && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-600 text-white">
                        SLA Breached
                      </span>
                    )}
                  </div>
                  <span className="font-medium text-slate-500">Status: {sc.status}</span>
                </div>

                <div className="font-semibold text-slate-800">{sc.subject}</div>
                <div className="text-[10.5px] text-slate-500">
                  Category: <strong>{sc.category}</strong> • Product: {sc.productFamily} • Engineer: {sc.assignedEngineer}
                </div>
                <div className="text-[10.5px] text-slate-700 bg-white p-2 rounded border border-slate-100">
                  <span className="font-semibold text-slate-900">Action: </span>
                  {sc.recommendedAction}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. Contacts Tab */}
      {activeTab === 'contacts' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">Buying Committee Contacts</h3>
                <VisualTooltip
                  title="Stakeholder & Buyer Committee Tree"
                  formula="Mapped contact roles, decision influence rating, and verified communication channels."
                  source="Salesforce CRM (Contacts) + ZoomInfo Enrichment"
                  updateFrequency="Daily Sync"
                />
              </div>
            </div>
            <div className="space-y-2.5 text-xs">
              {accContacts.map((c) => (
                <div key={c.id} className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{c.name}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-700">
                      {c.decisionPower} Power
                    </span>
                  </div>
                  <div className="text-slate-600 font-medium">{c.title} • {c.role}</div>
                  <div className="text-[10.5px] text-slate-500 flex items-center gap-3 pt-0.5">
                    <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {c.email}</span>
                    <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {c.phone}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">Hierarchy & Sibling Branches</h3>
                <VisualTooltip
                  title="Parent Corporate Entity & Channel Rollup"
                  formula="Dun & Bradstreet corporate linkage with SAP ECC sales organization assignment."
                  source="SAP ECC (KNA1 Customer Master) + D&B Hoovers"
                  updateFrequency="Weekly Sync"
                />
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-0.5">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Distributor Enterprise</span>
              <div className="font-bold text-slate-900 text-sm">
                {selectedAccount.parentName || selectedAccount.name}
              </div>
              <div className="text-slate-500 text-[10.5px]">
                ID: {selectedAccount.parentId || selectedAccount.id}
              </div>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-700 block mb-1.5">
                Sibling Locations ({siblingAccounts.length})
              </span>
              <div className="space-y-1.5 max-h-60 overflow-y-auto text-xs">
                {siblingAccounts.map((sib) => (
                  <div
                    key={sib.id}
                    onClick={() => selectCustomer(sib.id)}
                    className="p-2 rounded-lg border border-slate-100 hover:border-[#04BC6F] bg-white cursor-pointer transition-all flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold text-slate-800">{sib.name}</div>
                      <div className="text-[10px] text-slate-400">{sib.id} • {sib.city}, {sib.state}</div>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-700">&rarr;</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. Engagement Tab */}
      {activeTab === 'engagement' && (
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900">Acuity Academy Certifications & Labs</h3>
              <VisualTooltip
                title="Acuity Academy & Technical Training Governance"
                formula="Authorized partner curriculum completions for nLight AIR, Holophane High Mast, and Atrius IoT."
                source="Cornerstone OnDemand LMS + Training Registration DB"
                updateFrequency="Weekly Sync"
              />
            </div>
          </div>
          <div className="space-y-2.5 text-xs">
            {accEngagements.map((e) => (
              <div key={e.id} className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1">
                <div className="flex items-center justify-between font-bold text-slate-900">
                  <span>{e.title}</span>
                  <span className="font-mono text-emerald-700">Rating: {e.ratingScore} / 5.0</span>
                </div>
                <div className="text-slate-500 text-[10.5px]">
                  Type: <strong>{e.type}</strong> • Date: {e.eventDate} • Attendees: {e.attendeeCount}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 8. Intelligence & Actions Tab */}
      {activeTab === 'intelligence' && (
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900">Prescriptive Actions for {selectedAccount.name}</h3>
              <VisualTooltip
                title="Prescriptive Action Synthesis Governance"
                formula="Heuristic cross-referencing pipeline conversion, open warranty RMA risk, and overdue AR aging."
                source="C360 Persona Synthesizer + AI Assistant Synthesis"
                updateFrequency="Continuous"
                caveats="Recommended actions auto-expire or update whenever corresponding order or invoice status changes."
              />
            </div>
            <Sparkles className="w-4 h-4 text-[#007041]" />
          </div>

          <div className="space-y-2.5 text-xs">
            {accRecs.length === 0 ? (
              <div className="p-6 text-center text-slate-400">
                No active risk flags or urgent interventions on record for this account.
              </div>
            ) : (
              accRecs.map((rec) => (
                <div key={rec.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-xs">{rec.signal}</span>
                    <span className="px-2 py-0.2 rounded text-[10px] font-bold font-mono bg-red-100 text-red-800">
                      {rec.priority} Priority
                    </span>
                  </div>
                  <div className="text-slate-600 text-[11px]">
                    <strong>Evidence:</strong> {rec.evidence}
                  </div>
                  <div className="text-slate-800 font-medium text-xs bg-white p-2.5 rounded-lg border border-slate-200">
                    <strong>Recommended Action:</strong> {rec.recommendedAction}
                  </div>
                  <div className="flex items-center justify-between text-[10.5px] text-slate-500 font-mono pt-0.5">
                    <span>Owner: {rec.suggestedOwner}</span>
                    <span className="text-[#007041] font-bold">Est. Impact: ~${(rec.potentialImpactUsd / 1000).toFixed(0)}k</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
