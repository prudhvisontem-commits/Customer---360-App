/**
 * Acuity Brands Lighting - Governed Filter Bar
 * Showcased by default with Acuity naming conventions:
 * Timeframe, Distributor, Sales Channel Group, Sales Channel Name, Sales Region, Product Family, and Risk Tier.
 *
 * For the standalone Order Traceability tab, the top filter bar serves as the
 * single source of truth across Ontology View, Table View, and Order Exceptions, featuring:
 * Timeframe, Distributor, Agent / Agency, Sales Order, Order Status, Sales Region, Product Family, and Risk Tier.
 */

import React, { useMemo } from 'react';
import { X, RotateCcw, SlidersHorizontal, UserCheck, Package, Clock } from 'lucide-react';
import { useData } from '../context/DataContext';

export const FilterDrawer: React.FC = () => {
  const { dataset, filters, setFilter, resetFilters, activeFiltersCount, activeView } = useData();

  if (activeView === 'glossary') {
    return null;
  }

  const isOntologyView = activeView === 'agent-order-facility-distributor';

  const periods = [
    { id: 'FY2026 YTD', label: 'FY2026 YTD' },
    { id: 'Rolling 12M', label: 'Rolling 12M' },
    { id: 'Q4 FY2026', label: 'Q4 FY2026' },
    { id: 'Q3 FY2026', label: 'Q3 FY2026' },
    { id: 'Q2 FY2026', label: 'Q2 FY2026' },
    { id: 'Q1 FY2026', label: 'Q1 FY2026' },
    { id: 'FY2025 Full Year', label: 'FY2025 Full Year' },
  ];

  const regions = ['East', 'South', 'Midwest', 'West', 'Canada'];
  const channelGroups = [
    'Electrical Distributor',
    'Electrical Contractor',
    'OEM Fixture Manufacturer',
    'Specifier & Lighting Designer',
    'Direct Enterprise Account',
    'ESCO & Energy Solutions'
  ];
  const channelNames = [
    'C&I Electrical Distribution',
    'Contractor Direct',
    'OEM Sales',
    'Specifier Influenced',
    'Retail & Renovation',
    'Government & Institutional'
  ];
  const productFamilies = [
    'Lithonia Lighting®',
    'Holophane®',
    'Gotham®',
    'Mark Architectural Lighting™',
    'Juno®',
    'Peerless®',
    'nLight® Controls',
    'Atrius® IoT & Buildings',
    'SensorSwitch™',
    'Aculux®',
  ];
  const riskStatuses = ['Healthy', 'Stable', 'At Risk', 'Critical'];

  // Dynamic Distributor Options (sensitive to region)
  const distributorOptions = useMemo(() => {
    let list = dataset.accounts.filter(a => a.childLocationsCount > 0);
    if (filters.region !== 'all') {
      list = list.filter(a => a.region === filters.region);
    }
    return list;
  }, [dataset.accounts, filters.region]);

  // Dynamic Agent / Agency Options (sensitive to region and distributor)
  const agentOptions = useMemo(() => {
    let list = dataset.agents || [];
    if (filters.region !== 'all') {
      list = list.filter(a => a.region === filters.region);
    }
    if (filters.parentAccountId !== 'all') {
      const distOrders = dataset.orderLines.filter(
        ol => ol.accountId === filters.parentAccountId || dataset.accounts.find(acc => acc.id === ol.accountId)?.parentId === filters.parentAccountId
      );
      const agentIdsWithDist = new Set(distOrders.map(ol => ol.agentId));
      list = list.filter(a => agentIdsWithDist.has(a.id));
    }
    return list;
  }, [dataset.agents, dataset.orderLines, dataset.accounts, filters.region, filters.parentAccountId]);

  // Dynamic Order Status Options directly derived from order lines
  const orderStatuses = useMemo(() => {
    const statuses = new Set<string>();
    dataset.orderLines.forEach((ol) => {
      if (ol.status) statuses.add(ol.status);
    });
    // Standard ordered list matching Acuity commercial fulfillment flow
    const orderedSequence = ['Delivered', 'Shipped', 'In Production', 'Backlog Scheduled', 'Backlog At Risk'];
    return orderedSequence.filter(s => statuses.has(s));
  }, [dataset.orderLines]);

  // Dynamic Sales Order Options (sensitive to region, distributor, agent, status, product family)
  const orderOptions = useMemo(() => {
    const ordersMap = new Map<string, { orderNumber: string; totalValue: number; productFamily: string; agentId: string; accountId: string; region: string; status: string }>();
    dataset.orderLines.forEach(line => {
      if (!ordersMap.has(line.orderNumber)) {
        const acc = dataset.accounts.find(a => a.id === line.accountId);
        ordersMap.set(line.orderNumber, {
          orderNumber: line.orderNumber,
          totalValue: 0,
          productFamily: line.productFamily,
          agentId: line.agentId || '',
          accountId: line.accountId,
          region: acc ? acc.region : 'East',
          status: line.status,
        });
      }
      const entry = ordersMap.get(line.orderNumber)!;
      entry.totalValue += line.lineTotal;
    });

    let list = Array.from(ordersMap.values());
    if (filters.region !== 'all') {
      list = list.filter(o => o.region === filters.region);
    }
    if (filters.parentAccountId !== 'all') {
      list = list.filter(o => {
        if (o.accountId === filters.parentAccountId) return true;
        const acc = dataset.accounts.find(a => a.id === o.accountId);
        return acc?.parentId === filters.parentAccountId;
      });
    }
    if (filters.agentId && filters.agentId !== 'all') {
      list = list.filter(o => o.agentId === filters.agentId);
    }
    if (filters.orderStatus && filters.orderStatus !== 'all') {
      list = list.filter(o => o.status === filters.orderStatus);
    }
    if (filters.productFamily !== 'all') {
      list = list.filter(o => o.productFamily === filters.productFamily);
    }
    return list;
  }, [dataset.orderLines, dataset.accounts, filters.region, filters.parentAccountId, filters.agentId, filters.orderStatus, filters.productFamily]);

  // Handle Distributor Change with Dependent Cascading
  const handleDistributorChange = (newDistId: string) => {
    setFilter('parentAccountId', newDistId);
    if (newDistId !== 'all') {
      // If current agent is not valid for this distributor, reset to 'all'
      if (filters.agentId && filters.agentId !== 'all') {
        const distOrders = dataset.orderLines.filter(
          ol => ol.accountId === newDistId || dataset.accounts.find(acc => acc.id === ol.accountId)?.parentId === newDistId
        );
        const agentIdsWithDist = new Set(distOrders.map(ol => ol.agentId));
        if (!agentIdsWithDist.has(filters.agentId)) {
          setFilter('agentId', 'all');
        }
      }
      // If current order does not belong to this distributor, reset to 'all'
      if (filters.salesOrderNumber && filters.salesOrderNumber !== 'all') {
        const orderLine = dataset.orderLines.find(ol => ol.orderNumber === filters.salesOrderNumber);
        if (orderLine) {
          const acc = dataset.accounts.find(a => a.id === orderLine.accountId);
          if (orderLine.accountId !== newDistId && acc?.parentId !== newDistId) {
            setFilter('salesOrderNumber', 'all');
          }
        }
      }
    }
  };

  // Handle Agent Change with Dependent Cascading
  const handleAgentChange = (newAgentId: string) => {
    setFilter('agentId', newAgentId);
    if (newAgentId !== 'all') {
      // If current sales order does not belong to this agent, reset to 'all'
      if (filters.salesOrderNumber && filters.salesOrderNumber !== 'all') {
        const orderLine = dataset.orderLines.find(ol => ol.orderNumber === filters.salesOrderNumber);
        if (orderLine && orderLine.agentId !== newAgentId) {
          setFilter('salesOrderNumber', 'all');
        }
      }
    }
  };

  // Handle Order Status Change with Dependent Cascading
  const handleOrderStatusChange = (newStatus: string) => {
    setFilter('orderStatus', newStatus);
    if (newStatus !== 'all' && filters.salesOrderNumber && filters.salesOrderNumber !== 'all') {
      const orderLine = dataset.orderLines.find(ol => ol.orderNumber === filters.salesOrderNumber);
      if (orderLine && orderLine.status !== newStatus) {
        setFilter('salesOrderNumber', 'all');
      }
    }
  };

  // Handle Region Change with Dependent Cascading
  const handleRegionChange = (newRegion: string) => {
    setFilter('region', newRegion);
    if (newRegion !== 'all') {
      if (filters.parentAccountId !== 'all') {
        const dist = dataset.accounts.find(a => a.id === filters.parentAccountId);
        if (dist && dist.region !== newRegion) {
          setFilter('parentAccountId', 'all');
        }
      }
      if (filters.agentId && filters.agentId !== 'all') {
        const ag = dataset.agents?.find(a => a.id === filters.agentId);
        if (ag && ag.region !== newRegion) {
          setFilter('agentId', 'all');
        }
      }
    }
  };

  return (
    <div className="bg-white border-b border-slate-200/90 px-6 py-3 shadow-2xs">
      <div className="max-w-[1600px] mx-auto space-y-2.5">
        {/* Header line: Title "FILTERS" and Reset action */}
        <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#007041]" />
            <span className="tracking-wider">FILTERS</span>
            {isOntologyView && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#007041]/10 text-[#007041] font-semibold ml-1">
                Order Traceability & Exceptions Synced
              </span>
            )}
          </div>

          {activeFiltersCount > 0 && (
            <button
              onClick={resetFilters}
              className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-800 font-medium transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset All</span>
            </button>
          )}
        </div>

        {/* Filters Slicers Grid */}
        <div className={`grid grid-cols-2 sm:grid-cols-4 ${isOntologyView ? 'xl:grid-cols-8' : 'xl:grid-cols-7'} gap-2.5 text-xs`}>
          {/* 1. Timeframe */}
          <div>
            <label className="block text-[10.5px] font-semibold text-slate-500 mb-0.5">
              Timeframe
            </label>
            <select
              value={filters.reportingPeriod}
              onChange={(e) => setFilter('reportingPeriod', e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-slate-800 text-xs focus:outline-hidden focus:ring-1 focus:ring-[#04BC6F] cursor-pointer"
            >
              {periods.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Distributor */}
          <div>
            <label className="block text-[10.5px] font-semibold text-slate-500 mb-0.5">
              Distributor
            </label>
            <select
              value={filters.parentAccountId}
              onChange={(e) => handleDistributorChange(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-slate-800 text-xs focus:outline-hidden focus:ring-1 focus:ring-[#04BC6F] cursor-pointer"
            >
              <option value="all">All Distributors</option>
              {distributorOptions.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Dynamic Columns 3, 4, 5: Agent/Agency, Sales Order & Order Status for Order Traceability Tab */}
          {isOntologyView ? (
            <>
              {/* 3. Agent / Agency Filter */}
              <div>
                <label className="block text-[10.5px] font-semibold text-purple-700 mb-0.5 flex items-center gap-1 truncate">
                  <UserCheck className="w-3 h-3 text-purple-600 inline shrink-0" />
                  Agent / Agency
                </label>
                <select
                  value={filters.agentId || 'all'}
                  onChange={(e) => handleAgentChange(e.target.value)}
                  className="w-full bg-purple-50/50 border border-purple-200 rounded-lg px-2 py-1 text-slate-800 text-xs font-medium focus:outline-hidden focus:ring-1 focus:ring-purple-600 cursor-pointer truncate"
                >
                  <option value="all">All Agents ({agentOptions.length})</option>
                  {agentOptions.map((agent) => (
                    <option key={agent.id} value={agent.id}>
                      {agent.name.split(' (')[0]} ({agent.agencyName})
                    </option>
                  ))}
                </select>
              </div>

              {/* 4. Sales Order Filter */}
              <div>
                <label className="block text-[10.5px] font-semibold text-amber-700 mb-0.5 flex items-center gap-1 truncate">
                  <Package className="w-3 h-3 text-amber-600 inline shrink-0" />
                  Sales Order
                </label>
                <select
                  value={filters.salesOrderNumber || 'all'}
                  onChange={(e) => setFilter('salesOrderNumber', e.target.value)}
                  className="w-full bg-amber-50/50 border border-amber-200 rounded-lg px-2 py-1 text-slate-800 text-xs font-mono font-medium focus:outline-hidden focus:ring-1 focus:ring-amber-600 cursor-pointer truncate"
                >
                  <option value="all">All Orders ({orderOptions.length})</option>
                  {orderOptions.slice(0, 100).map((o) => (
                    <option key={o.orderNumber} value={o.orderNumber}>
                      {o.orderNumber} — ${(o.totalValue / 1000).toFixed(0)}k
                    </option>
                  ))}
                </select>
              </div>

              {/* 5. Order Status Filter (NEW) */}
              <div>
                <label className="block text-[10.5px] font-semibold text-blue-700 mb-0.5 flex items-center gap-1 truncate">
                  <Clock className="w-3 h-3 text-blue-600 inline shrink-0" />
                  Order Status
                </label>
                <select
                  value={filters.orderStatus || 'all'}
                  onChange={(e) => handleOrderStatusChange(e.target.value)}
                  className="w-full bg-blue-50/50 border border-blue-200 rounded-lg px-2 py-1 text-slate-800 text-xs font-medium focus:outline-hidden focus:ring-1 focus:ring-blue-600 cursor-pointer truncate"
                >
                  <option value="all">All Statuses ({orderStatuses.length})</option>
                  {orderStatuses.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>
            </>
          ) : (
            <>
              {/* 3. Sales Channel Group */}
              <div>
                <label className="block text-[10.5px] font-semibold text-slate-500 mb-0.5">
                  Sales Channel Group
                </label>
                <select
                  value={filters.segment}
                  onChange={(e) => setFilter('segment', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-slate-800 text-xs focus:outline-hidden focus:ring-1 focus:ring-[#04BC6F] cursor-pointer"
                >
                  <option value="all">All Groups</option>
                  {channelGroups.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              {/* 4. Sales Channel Name */}
              <div>
                <label className="block text-[10.5px] font-semibold text-slate-500 mb-0.5">
                  Sales Channel Name
                </label>
                <select
                  value={filters.channel}
                  onChange={(e) => setFilter('channel', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-slate-800 text-xs focus:outline-hidden focus:ring-1 focus:ring-[#04BC6F] cursor-pointer"
                >
                  <option value="all">All Channels</option>
                  {channelNames.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {/* 6. Sales Region */}
          <div>
            <label className="block text-[10.5px] font-semibold text-slate-500 mb-0.5">
              Sales Region
            </label>
            <select
              value={filters.region}
              onChange={(e) => handleRegionChange(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-slate-800 text-xs focus:outline-hidden focus:ring-1 focus:ring-[#04BC6F] cursor-pointer"
            >
              <option value="all">All Regions</option>
              {regions.map((r) => (
                <option key={r} value={r}>
                  {r} Region
                </option>
              ))}
            </select>
          </div>

          {/* 7. Product Family */}
          <div>
            <label className="block text-[10.5px] font-semibold text-slate-500 mb-0.5">
              Product Family
            </label>
            <select
              value={filters.productFamily}
              onChange={(e) => setFilter('productFamily', e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-slate-800 text-xs focus:outline-hidden focus:ring-1 focus:ring-[#04BC6F] cursor-pointer"
            >
              <option value="all">All Families</option>
              {productFamilies.map((pf) => (
                <option key={pf} value={pf}>
                  {pf}
                </option>
              ))}
            </select>
          </div>

          {/* 8. Risk Tier */}
          <div>
            <label className="block text-[10.5px] font-semibold text-slate-500 mb-0.5">
              Risk Tier
            </label>
            <select
              value={filters.riskStatus}
              onChange={(e) => setFilter('riskStatus', e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-slate-800 text-xs focus:outline-hidden focus:ring-1 focus:ring-[#04BC6F] cursor-pointer"
            >
              <option value="all">All Risk Tiers</option>
              {riskStatuses.map((rs) => (
                <option key={rs} value={rs}>
                  {rs}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Active Filter Tags (if any are non-default) */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1.5 border-t border-slate-100 text-[10.5px]">
            <span className="text-slate-400 font-semibold mr-1">Active:</span>

            {filters.reportingPeriod !== 'FY2026 YTD' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.2 rounded-md bg-slate-100 text-slate-700 border border-slate-200 font-medium">
                Period: {filters.reportingPeriod}
                <X className="w-3 h-3 cursor-pointer hover:text-black" onClick={() => setFilter('reportingPeriod', 'FY2026 YTD')} />
              </span>
            )}

            {filters.parentAccountId !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.2 rounded-md bg-[#04BC6F]/10 text-[#007041] border border-[#04BC6F]/30 font-medium">
                Distributor: {dataset.accounts.find((a) => a.id === filters.parentAccountId)?.name}
                <X className="w-3 h-3 cursor-pointer hover:text-black" onClick={() => setFilter('parentAccountId', 'all')} />
              </span>
            )}

            {filters.agentId && filters.agentId !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.2 rounded-md bg-purple-100 text-purple-800 border border-purple-200 font-medium">
                Agent: {dataset.agents?.find((a) => a.id === filters.agentId)?.name.split(' (')[0] || filters.agentId}
                <X className="w-3 h-3 cursor-pointer hover:text-black" onClick={() => setFilter('agentId', 'all')} />
              </span>
            )}

            {filters.salesOrderNumber && filters.salesOrderNumber !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.2 rounded-md bg-amber-100 text-amber-800 border border-amber-200 font-mono font-medium">
                Sales Order: {filters.salesOrderNumber}
                <X className="w-3 h-3 cursor-pointer hover:text-black" onClick={() => setFilter('salesOrderNumber', 'all')} />
              </span>
            )}

            {filters.orderStatus && filters.orderStatus !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.2 rounded-md bg-blue-100 text-blue-800 border border-blue-200 font-medium">
                Status: {filters.orderStatus}
                <X className="w-3 h-3 cursor-pointer hover:text-black" onClick={() => setFilter('orderStatus', 'all')} />
              </span>
            )}

            {filters.segment !== 'all' && !isOntologyView && (
              <span className="inline-flex items-center gap-1 px-2 py-0.2 rounded-md bg-slate-100 text-slate-700 border border-slate-200 font-medium">
                Group: {filters.segment}
                <X className="w-3 h-3 cursor-pointer hover:text-black" onClick={() => setFilter('segment', 'all')} />
              </span>
            )}

            {filters.channel !== 'all' && !isOntologyView && (
              <span className="inline-flex items-center gap-1 px-2 py-0.2 rounded-md bg-slate-100 text-slate-700 border border-slate-200 font-medium">
                Channel: {filters.channel}
                <X className="w-3 h-3 cursor-pointer hover:text-black" onClick={() => setFilter('channel', 'all')} />
              </span>
            )}

            {filters.region !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.2 rounded-md bg-slate-100 text-slate-700 border border-slate-200 font-medium">
                Region: {filters.region}
                <X className="w-3 h-3 cursor-pointer hover:text-black" onClick={() => setFilter('region', 'all')} />
              </span>
            )}

            {filters.productFamily !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.2 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200 font-medium">
                Product: {filters.productFamily}
                <X className="w-3 h-3 cursor-pointer hover:text-black" onClick={() => setFilter('productFamily', 'all')} />
              </span>
            )}

            {filters.riskStatus !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.2 rounded-md bg-amber-100 text-amber-800 border border-amber-200 font-medium">
                Risk: {filters.riskStatus}
                <X className="w-3 h-3 cursor-pointer hover:text-black" onClick={() => setFilter('riskStatus', 'all')} />
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
