/**
 * Acuity Brands Lighting - Customer Intelligence Hub
 * Order Traceability (formerly Agent-Order-Facility-Distributor Ontology View)
 *
 * Interactive, data-driven node-and-link visualization, structured tabular pipeline view,
 * and dedicated Order Exceptions investigation section modeling the end-to-end commercial
 * and operational lifecycle:
 * Agent/Agency → Sales Order → Facility → Distributor
 */

import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Network,
  Table as TableIcon,
  Search,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  SlidersHorizontal,
  Layers,
  ArrowRight,
  ArrowLeft,
  Building2,
  Package,
  Factory,
  UserCheck,
  Briefcase,
  CheckCircle2,
  AlertTriangle,
  Clock,
  MapPin,
  DollarSign,
  Tag,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  ShieldCheck,
  Info,
  Maximize2,
  Filter,
  X,
  ArrowUpDown,
  FileText,
  AlertCircle
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { Agent, Facility, Account, OrderExceptionItem, OrderExceptionCategory, OrderExceptionSeverity } from '../data/types';

// Distinct Entity Types
type EntityType = 'Agent' | 'Order' | 'Facility' | 'Distributor';

// Node Interface for Graph Visualization
interface GraphNode {
  id: string;
  type: EntityType;
  label: string;
  sublabel: string;
  category: string;
  raw: any;
  x: number;
  y: number;
  vx?: number;
  vy?: number;
  val?: number;
}

// Edge Interface for Graph Visualization
interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label: string;
  cardinality: string;
  sourceType: EntityType;
  targetType: EntityType;
}

// Aggregated Sales Order Representation
interface SalesOrderAggregate {
  orderNumber: string;
  accountId: string;
  accountName: string;
  distributorRegion: string;
  distributorTier: string;
  distributorCity: string;
  distributorState: string;
  agentId: string;
  agentName: string;
  agencyName: string;
  facilityId: string;
  facilityName: string;
  facilityLocation: string;
  totalValue: number;
  linesCount: number;
  orderDate: string;
  requiredShipDate: string;
  actualShipDate?: string;
  status: string;
  onTimeStatus: string;
  productFamily: string;
  skus: string[];
}

export const AgentOrderFacilityDistributorView: React.FC = () => {
  const { dataset, selectCustomer, setActiveView, filters, resetFilters } = useData();

  // View Mode: Ontology (Node-Link) vs Table View vs Order Exceptions
  const [viewMode, setViewMode] = useState<'ontology' | 'table' | 'exceptions'>('ontology');

  // Table View Specific States
  const [tableSortField, setTableSortField] = useState<'orderNumber' | 'totalValue' | 'orderDate' | 'status'>('orderNumber');
  const [tableSortDirection, setTableSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 12;

  // Order Exceptions Section States
  const [exceptionCategoryFilter, setExceptionCategoryFilter] = useState<string>('all');
  const [exceptionSeverityFilter, setExceptionSeverityFilter] = useState<string>('all');
  const [exceptionSearchQuery, setExceptionSearchQuery] = useState<string>('');
  const [exceptionSortField, setExceptionSortField] = useState<'orderNumber' | 'daysDelayed' | 'totalValue' | 'orderDate' | 'severity'>('daysDelayed');
  const [exceptionSortDirection, setExceptionSortDirection] = useState<'asc' | 'desc'>('desc');
  const [exceptionCurrentPage, setExceptionCurrentPage] = useState<number>(1);
  const exceptionPageSize = 10;

  // Zoom & Pan Canvas States
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);

  // Selection & Navigation History
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [navigationHistory, setNavigationHistory] = useState<string[]>([]);

  // Node position manual overrides (when user drags nodes)
  const [nodePositions, setNodePositions] = useState<Record<string, { x: number; y: number }>>({});

  const svgRef = useRef<SVGSVGElement | null>(null);

  // 1. Process & Aggregate Sales Orders from OrderLines
  const aggregatedOrders: SalesOrderAggregate[] = useMemo(() => {
    const ordersMap = new Map<string, SalesOrderAggregate>();

    dataset.orderLines.forEach((line) => {
      if (!ordersMap.has(line.orderNumber)) {
        const facility = dataset.facilities?.find((f) => f.id === line.facilityId);
        const agent = dataset.agents?.find((a) => a.id === line.agentId);
        const dist = dataset.accounts.find((a) => a.id === line.accountId);

        ordersMap.set(line.orderNumber, {
          orderNumber: line.orderNumber,
          accountId: line.accountId,
          accountName: line.accountName,
          distributorRegion: dist ? dist.region : 'East',
          distributorTier: dist ? dist.tier : 'Core Silver',
          distributorCity: dist ? dist.city : '',
          distributorState: dist ? dist.state : '',
          agentId: line.agentId || 'AGT-101',
          agentName: agent ? agent.name : 'Acuity Commercial Agent',
          agencyName: agent ? agent.agencyName : 'Acuity Agency Network',
          facilityId: line.facilityId || 'FAC-01',
          facilityName: facility ? facility.name : 'Conyers Operations Hub',
          facilityLocation: facility ? `${facility.city}, ${facility.state}` : 'Conyers, GA',
          totalValue: 0,
          linesCount: 0,
          orderDate: line.orderDate,
          requiredShipDate: line.requiredShipDate,
          actualShipDate: line.actualShipDate,
          status: line.status,
          onTimeStatus: line.onTimeStatus,
          productFamily: line.productFamily,
          skus: [],
        });
      }

      const order = ordersMap.get(line.orderNumber)!;
      order.totalValue += line.lineTotal;
      order.linesCount += 1;
      if (!order.skus.includes(line.productSku)) {
        order.skus.push(line.productSku);
      }
    });

    return Array.from(ordersMap.values());
  }, [dataset.orderLines, dataset.facilities, dataset.agents, dataset.accounts]);

  // 2. Filter Aggregated Sales Orders using the top filter section as the single source of truth
  const filteredOrders = useMemo(() => {
    return aggregatedOrders.filter((order) => {
      // Distributor Filter (parentAccountId)
      if (filters.parentAccountId !== 'all') {
        if (order.accountId !== filters.parentAccountId) {
          const acc = dataset.accounts.find((a) => a.id === order.accountId);
          if (acc?.parentId !== filters.parentAccountId) {
            return false;
          }
        }
      }
      // Agent / Agency Filter
      if (filters.agentId && filters.agentId !== 'all' && order.agentId !== filters.agentId) {
        return false;
      }
      // Sales Order Filter
      if (filters.salesOrderNumber && filters.salesOrderNumber !== 'all' && order.orderNumber !== filters.salesOrderNumber) {
        return false;
      }
      // Order Status Filter (NEW)
      if (filters.orderStatus && filters.orderStatus !== 'all' && order.status !== filters.orderStatus) {
        return false;
      }
      // Sales Region Filter
      if (filters.region !== 'all' && order.distributorRegion !== filters.region) {
        return false;
      }
      // Product Family Filter
      if (filters.productFamily !== 'all' && order.productFamily !== filters.productFamily) {
        return false;
      }
      // Risk Tier Filter
      if (filters.riskStatus !== 'all') {
        const h = dataset.healthMap[order.accountId];
        if (!h || h.band !== filters.riskStatus) return false;
      }
      return true;
    });
  }, [aggregatedOrders, dataset.accounts, dataset.healthMap, filters]);

  // 3. Derived Order Exceptions Engine grounded in source fields and validated business rules
  const orderExceptions: OrderExceptionItem[] = useMemo(() => {
    const list: OrderExceptionItem[] = [];
    const today = new Date('2026-10-26');

    filteredOrders.forEach((order) => {
      const orderDateObj = new Date(order.orderDate);
      const reqDateObj = new Date(order.requiredShipDate);
      const actualDateObj = order.actualShipDate ? new Date(order.actualShipDate) : null;
      const dist = dataset.accounts.find((a) => a.id === order.accountId);
      const creditHold = dist?.creditHold || false;

      // Rule A: Delayed Order Identification
      let isDelayed = false;
      let delayReason = '';
      let daysDelayed = 0;

      if (actualDateObj && actualDateObj > reqDateObj) {
        isDelayed = true;
        daysDelayed = Math.max(1, Math.round((actualDateObj.getTime() - reqDateObj.getTime()) / (1000 * 3600 * 24)));
        delayReason = order.onTimeStatus === 'Logistics Delay'
          ? 'Carrier Logistics Delay: Carrier delivery exceeded confirmed CPD promise date'
          : 'Plant Fulfillment Slip: Plant final assembly concluded after customer promised delivery date';
      } else if (!actualDateObj && today > reqDateObj) {
        isDelayed = true;
        daysDelayed = Math.max(1, Math.round((today.getTime() - reqDateObj.getTime()) / (1000 * 3600 * 24)));
        delayReason = order.onTimeStatus === 'Supplier Delay'
          ? 'Supplier Material Bottleneck: Upstream components delayed factory assembly line'
          : 'Overdue Factory Dispatch: Confirmed required ship date exceeded without carrier pickup';
      } else if (order.onTimeStatus === 'Logistics Delay') {
        isDelayed = true;
        daysDelayed = 4;
        delayReason = 'Carrier Logistics Alert: Freight transit exception reported by linehaul carrier';
      } else if (order.onTimeStatus === 'Supplier Delay') {
        isDelayed = true;
        daysDelayed = 7;
        delayReason = 'Sub-tier Component Delay: Optical glass/driver lead time breach at manufacturing facility';
      }

      // Rule B: Backlog Exception Identification
      const backlogAgeingDays = Math.max(1, Math.round((today.getTime() - orderDateObj.getTime()) / (1000 * 3600 * 24)));
      let isBacklogException = false;
      let backlogReason = '';

      if (order.status === 'Backlog At Risk') {
        isBacklogException = true;
        backlogReason = 'Critical Backlog Risk: Manufacturing capacity constraint flagged SLA production breach';
      } else if (order.status === 'Backlog Scheduled' && backlogAgeingDays > 40) {
        isBacklogException = true;
        backlogReason = `Aged Unreleased Backlog: Confirmed order pending manufacturing release for ${backlogAgeingDays} days`;
      }

      // Rule C: Processing Exception Identification
      let isProcessingException = false;
      let processingReason = '';
      if (creditHold && order.status !== 'Delivered') {
        isProcessingException = true;
        processingReason = 'Credit Hold Enforcement: Distributor credit limit breach; automated shipment lock in SAP SD';
      }

      // Rule D: Prioritize Primary Exception for unique order accounting
      if (isProcessingException) {
        list.push({
          orderNumber: order.orderNumber,
          accountId: order.accountId,
          accountName: order.accountName,
          distributorRegion: order.distributorRegion,
          agentId: order.agentId,
          agentName: order.agentName,
          agencyName: order.agencyName,
          facilityId: order.facilityId,
          facilityName: order.facilityName,
          productFamily: order.productFamily,
          totalValue: order.totalValue,
          status: order.status as any,
          onTimeStatus: order.onTimeStatus as any,
          orderDate: order.orderDate,
          requiredShipDate: order.requiredShipDate,
          actualShipDate: order.actualShipDate,
          category: 'Processing Exception',
          severity: 'Critical',
          reason: processingReason,
          businessRule: 'Acuity Trade Credit Policy / AR Ceiling Check',
          daysDelayed: daysDelayed > 0 ? daysDelayed : undefined,
          backlogAgeingDays,
          creditHold: true,
          latestUpdate: '2026-10-26 08:30 EDT',
        });
      } else if (isBacklogException) {
        list.push({
          orderNumber: order.orderNumber,
          accountId: order.accountId,
          accountName: order.accountName,
          distributorRegion: order.distributorRegion,
          agentId: order.agentId,
          agentName: order.agentName,
          agencyName: order.agencyName,
          facilityId: order.facilityId,
          facilityName: order.facilityName,
          productFamily: order.productFamily,
          totalValue: order.totalValue,
          status: order.status as any,
          onTimeStatus: order.onTimeStatus as any,
          orderDate: order.orderDate,
          requiredShipDate: order.requiredShipDate,
          actualShipDate: order.actualShipDate,
          category: 'Backlog Exception',
          severity: order.status === 'Backlog At Risk' ? 'Critical' : 'Medium',
          reason: backlogReason,
          businessRule: order.status === 'Backlog At Risk' ? 'ERP Backlog Health = At Risk' : 'Backlog Age > 40 Days Threshold',
          daysDelayed: daysDelayed > 0 ? daysDelayed : undefined,
          backlogAgeingDays,
          creditHold,
          latestUpdate: '2026-10-25 17:15 EDT',
        });
      } else if (isDelayed) {
        list.push({
          orderNumber: order.orderNumber,
          accountId: order.accountId,
          accountName: order.accountName,
          distributorRegion: order.distributorRegion,
          agentId: order.agentId,
          agentName: order.agentName,
          agencyName: order.agencyName,
          facilityId: order.facilityId,
          facilityName: order.facilityName,
          productFamily: order.productFamily,
          totalValue: order.totalValue,
          status: order.status as any,
          onTimeStatus: order.onTimeStatus as any,
          orderDate: order.orderDate,
          requiredShipDate: order.requiredShipDate,
          actualShipDate: order.actualShipDate,
          category: 'Delayed Order',
          severity: daysDelayed > 10 ? 'Critical' : daysDelayed > 4 ? 'High' : 'Medium',
          reason: delayReason || 'Reason unavailable',
          businessRule: 'Committed Promise Date (CPD) SLA Exceeded',
          daysDelayed,
          backlogAgeingDays,
          creditHold,
          latestUpdate: '2026-10-26 06:45 EDT',
        });
      }
    });

    return list;
  }, [filteredOrders, dataset.accounts]);

  // Synchronize selected node when user picks a Sales Order from the top filter
  useEffect(() => {
    if (filters.salesOrderNumber && filters.salesOrderNumber !== 'all') {
      setSelectedNodeId(filters.salesOrderNumber);
    }
  }, [filters.salesOrderNumber]);

  // Reset pagination when top filters change
  useEffect(() => {
    setCurrentPage(1);
    setExceptionCurrentPage(1);
  }, [filters]);

  // 4. Assemble Graph Nodes and Verified Edges
  const { nodes, edges } = useMemo(() => {
    const graphNodes: GraphNode[] = [];
    const graphEdges: GraphEdge[] = [];
    const addedNodeIds = new Set<string>();

    const isFiltered =
      (filters.agentId && filters.agentId !== 'all') ||
      (filters.salesOrderNumber && filters.salesOrderNumber !== 'all') ||
      (filters.orderStatus && filters.orderStatus !== 'all');

    const displayedOrders = isFiltered
      ? filteredOrders.slice(0, 32)
      : filteredOrders.slice(0, 24);

    // Identify connected entities
    const involvedAgentIds = new Set<string>();
    const involvedFacilityIds = new Set<string>();
    const involvedDistributorIds = new Set<string>();

    displayedOrders.forEach((o) => {
      involvedAgentIds.add(o.agentId);
      involvedFacilityIds.add(o.facilityId);
      involvedDistributorIds.add(o.accountId);
    });

    // A. Add Agent Nodes
    const activeAgents = (dataset.agents || []).filter(
      (a) => involvedAgentIds.has(a.id) || (filters.agentId === a.id)
    );
    activeAgents.forEach((agent) => {
      if (!addedNodeIds.has(agent.id)) {
        addedNodeIds.add(agent.id);
        graphNodes.push({
          id: agent.id,
          type: 'Agent',
          label: agent.name.split(' (')[0],
          sublabel: agent.agencyName,
          category: agent.region,
          raw: agent,
          x: 0,
          y: 0,
        });
      }
    });

    // B. Add Sales Order Nodes
    displayedOrders.forEach((order) => {
      if (!addedNodeIds.has(order.orderNumber)) {
        addedNodeIds.add(order.orderNumber);
        graphNodes.push({
          id: order.orderNumber,
          type: 'Order',
          label: `SO: ${order.orderNumber}`,
          sublabel: `$${(order.totalValue / 1000).toFixed(1)}k • ${order.productFamily}`,
          category: order.status,
          raw: order,
          val: order.totalValue,
          x: 0,
          y: 0,
        });
      }
    });

    // C. Add Facility Nodes
    const activeFacilities = (dataset.facilities || []).filter(
      (f) => involvedFacilityIds.has(f.id)
    );
    activeFacilities.forEach((facility) => {
      if (!addedNodeIds.has(facility.id)) {
        addedNodeIds.add(facility.id);
        graphNodes.push({
          id: facility.id,
          type: 'Facility',
          label: facility.name.split(' ')[0] + ' Center',
          sublabel: `${facility.city}, ${facility.state}`,
          category: facility.facilityType,
          raw: facility,
          x: 0,
          y: 0,
        });
      }
    });

    // D. Add Distributor Nodes
    const activeDistributors = dataset.accounts.filter(
      (a) => involvedDistributorIds.has(a.id)
    );
    activeDistributors.forEach((dist) => {
      if (!addedNodeIds.has(dist.id)) {
        addedNodeIds.add(dist.id);
        graphNodes.push({
          id: dist.id,
          type: 'Distributor',
          label: dist.name.length > 22 ? dist.name.slice(0, 20) + '…' : dist.name,
          sublabel: `${dist.city}, ${dist.state} • ${dist.tier}`,
          category: dist.segment,
          raw: dist,
          x: 0,
          y: 0,
        });
      }
    });

    // E. Assemble Verified Edges
    // 1. Agent → Sales Order (1:N)
    displayedOrders.forEach((o) => {
      if (addedNodeIds.has(o.agentId) && addedNodeIds.has(o.orderNumber)) {
        graphEdges.push({
          id: `edge-${o.agentId}-${o.orderNumber}`,
          source: o.agentId,
          target: o.orderNumber,
          label: 'Originates & Manages Sales Order',
          cardinality: '1:N',
          sourceType: 'Agent',
          targetType: 'Order',
        });
      }
    });

    // 2. Sales Order → Facility (N:1)
    displayedOrders.forEach((o) => {
      if (addedNodeIds.has(o.orderNumber) && addedNodeIds.has(o.facilityId)) {
        graphEdges.push({
          id: `edge-${o.orderNumber}-${o.facilityId}`,
          source: o.orderNumber,
          target: o.facilityId,
          label: 'Manufactured & Fulfilled At',
          cardinality: 'N:1',
          sourceType: 'Order',
          targetType: 'Facility',
        });
      }
    });

    // 3. Facility → Distributor (M:N)
    displayedOrders.forEach((o) => {
      if (addedNodeIds.has(o.facilityId) && addedNodeIds.has(o.accountId)) {
        const edgeId = `edge-${o.facilityId}-${o.accountId}`;
        if (!graphEdges.some((e) => e.id === edgeId)) {
          graphEdges.push({
            id: edgeId,
            source: o.facilityId,
            target: o.accountId,
            label: 'Supplies & Delivers To',
            cardinality: 'M:N',
            sourceType: 'Facility',
            targetType: 'Distributor',
          });
        }
      }
    });

    return { nodes: graphNodes, edges: graphEdges };
  }, [filteredOrders, filters.agentId, filters.salesOrderNumber, filters.orderStatus, dataset.agents, dataset.facilities, dataset.accounts]);

  // 5. Calculate Coordinates in Clean Sequence: Agent (Col 1) → Sales Order (Col 2) → Facility (Col 3) → Distributor (Col 4)
  const positionedNodes = useMemo(() => {
    const width = 1200;
    const height = 750;
    const paddingX = 90;
    const paddingY = 80;

    const agents = nodes.filter((n) => n.type === 'Agent');
    const orders = nodes.filter((n) => n.type === 'Order');
    const facilities = nodes.filter((n) => n.type === 'Facility');
    const distributors = nodes.filter((n) => n.type === 'Distributor');

    const colX = {
      Agent: paddingX + 50,
      Order: paddingX + (width - paddingX * 2) * 0.33,
      Facility: paddingX + (width - paddingX * 2) * 0.66,
      Distributor: width - paddingX - 50,
    };

    const positionColumn = (items: GraphNode[], x: number) => {
      const count = items.length;
      if (count === 0) return;
      const stepY = (height - paddingY * 2) / Math.max(count, 1);
      items.forEach((node, idx) => {
        const manual = nodePositions[node.id];
        if (manual) {
          node.x = manual.x;
          node.y = manual.y;
        } else {
          node.x = x;
          node.y = paddingY + stepY * (idx + 0.5);
        }
      });
    };

    positionColumn(agents, colX.Agent);
    positionColumn(orders, colX.Order);
    positionColumn(facilities, colX.Facility);
    positionColumn(distributors, colX.Distributor);

    return nodes;
  }, [nodes, nodePositions]);

  const nodeMap = useMemo(() => {
    const map = new Map<string, GraphNode>();
    positionedNodes.forEach((n) => map.set(n.id, n));
    return map;
  }, [positionedNodes]);

  // 6. Connected Entities helper for Selected Node
  const connectedNodeIds = useMemo(() => {
    const set = new Set<string>();
    const targetId = selectedNodeId || hoveredNodeId;
    if (!targetId) return set;

    set.add(targetId);
    edges.forEach((edge) => {
      if (edge.source === targetId) set.add(edge.target);
      if (edge.target === targetId) set.add(edge.source);
    });
    return set;
  }, [selectedNodeId, hoveredNodeId, edges]);

  const directlyConnectedEntities = useMemo(() => {
    if (!selectedNodeId) return [];
    const direct: { node: GraphNode; edge: GraphEdge }[] = [];

    edges.forEach((edge) => {
      if (edge.source === selectedNodeId) {
        const targetNode = nodeMap.get(edge.target);
        if (targetNode) direct.push({ node: targetNode, edge });
      } else if (edge.target === selectedNodeId) {
        const sourceNode = nodeMap.get(edge.source);
        if (sourceNode) direct.push({ node: sourceNode, edge });
      }
    });

    return direct;
  }, [selectedNodeId, edges, nodeMap]);

  const selectedNode = selectedNodeId ? nodeMap.get(selectedNodeId) || null : null;

  // Selected Order Exception Details (if selected node is an order with an exception)
  const selectedOrderException = useMemo(() => {
    if (!selectedNodeId) return null;
    return orderExceptions.find((e) => e.orderNumber === selectedNodeId) || null;
  }, [selectedNodeId, orderExceptions]);

  // Handle node selection with breadcrumb path history
  const handleSelectNode = (id: string) => {
    if (selectedNodeId === id) return;
    setSelectedNodeId(id);
    setNavigationHistory((prev) => {
      if (!prev.includes(id)) {
        return [...prev, id];
      }
      return prev;
    });
  };

  const handleBackNavigation = () => {
    if (navigationHistory.length <= 1) {
      setSelectedNodeId(null);
      setNavigationHistory([]);
      return;
    }
    const newHist = [...navigationHistory];
    newHist.pop();
    const prevId = newHist[newHist.length - 1];
    setSelectedNodeId(prevId);
    setNavigationHistory(newHist);
  };

  // Zoom & Pan Handlers
  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.15, 2.2));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.15, 0.5));
  const handleResetCanvas = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setSelectedNodeId(null);
    setNodePositions({});
    setNavigationHistory([]);
  };

  const handleResetCanvasAndFilters = () => {
    resetFilters();
    handleResetCanvas();
  };

  // Canvas Mouse Pan/Drag handlers
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (draggedNodeId) {
      const svg = svgRef.current;
      if (!svg) return;
      const rect = svg.getBoundingClientRect();
      const clientX = (e.clientX - rect.left - pan.x) / zoom;
      const clientY = (e.clientY - rect.top - pan.y) / zoom;
      setNodePositions((prev) => ({
        ...prev,
        [draggedNodeId]: { x: clientX, y: clientY },
      }));
    } else if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleCanvasMouseUp = () => {
    setIsDragging(false);
    setDraggedNodeId(null);
  };

  // Node Styling Helper
  const getNodeColor = (type: EntityType) => {
    switch (type) {
      case 'Agent':
        return {
          fill: '#7C3AED',
          border: '#6D28D9',
          lightBg: '#F5F3FF',
          badgeText: '#7C3AED',
          icon: UserCheck,
        };
      case 'Order':
        return {
          fill: '#D97706',
          border: '#B45309',
          lightBg: '#FFFBEB',
          badgeText: '#D97706',
          icon: Package,
        };
      case 'Facility':
        return {
          fill: '#2563EB',
          border: '#1D4ED8',
          lightBg: '#EFF6FF',
          badgeText: '#2563EB',
          icon: Factory,
        };
      case 'Distributor':
        return {
          fill: '#007041',
          border: '#005a34',
          lightBg: '#ECFDF5',
          badgeText: '#007041',
          icon: Building2,
        };
    }
  };

  // Sorted & Paginated Sales Orders for Table View
  const sortedOrders = useMemo(() => {
    return [...filteredOrders].sort((a, b) => {
      let cmp = 0;
      if (tableSortField === 'orderNumber') {
        cmp = a.orderNumber.localeCompare(b.orderNumber);
      } else if (tableSortField === 'totalValue') {
        cmp = a.totalValue - b.totalValue;
      } else if (tableSortField === 'orderDate') {
        cmp = a.orderDate.localeCompare(b.orderDate);
      } else if (tableSortField === 'status') {
        cmp = a.status.localeCompare(b.status);
      }
      return tableSortDirection === 'asc' ? cmp : -cmp;
    });
  }, [filteredOrders, tableSortField, tableSortDirection]);

  const totalPages = Math.ceil(sortedOrders.length / pageSize) || 1;
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedOrders.slice(start, start + pageSize);
  }, [sortedOrders, currentPage, pageSize]);

  const handleSort = (field: 'orderNumber' | 'totalValue' | 'orderDate' | 'status') => {
    if (tableSortField === field) {
      setTableSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setTableSortField(field);
      setTableSortDirection('desc');
    }
  };

  // Order Exceptions Filtering & Summaries
  const filteredExceptions = useMemo(() => {
    return orderExceptions.filter((item) => {
      if (exceptionCategoryFilter !== 'all' && item.category !== exceptionCategoryFilter) {
        return false;
      }
      if (exceptionSeverityFilter !== 'all' && item.severity !== exceptionSeverityFilter) {
        return false;
      }
      if (exceptionSearchQuery.trim()) {
        const q = exceptionSearchQuery.toLowerCase();
        const matches =
          item.orderNumber.toLowerCase().includes(q) ||
          item.accountName.toLowerCase().includes(q) ||
          item.agentName.toLowerCase().includes(q) ||
          item.agencyName.toLowerCase().includes(q) ||
          item.facilityName.toLowerCase().includes(q) ||
          item.reason.toLowerCase().includes(q) ||
          item.productFamily.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [orderExceptions, exceptionCategoryFilter, exceptionSeverityFilter, exceptionSearchQuery]);

  const sortedExceptions = useMemo(() => {
    return [...filteredExceptions].sort((a, b) => {
      let cmp = 0;
      if (exceptionSortField === 'orderNumber') {
        cmp = a.orderNumber.localeCompare(b.orderNumber);
      } else if (exceptionSortField === 'daysDelayed') {
        cmp = (a.daysDelayed || a.backlogAgeingDays || 0) - (b.daysDelayed || b.backlogAgeingDays || 0);
      } else if (exceptionSortField === 'totalValue') {
        cmp = a.totalValue - b.totalValue;
      } else if (exceptionSortField === 'orderDate') {
        cmp = a.orderDate.localeCompare(b.orderDate);
      } else if (exceptionSortField === 'severity') {
        const weight = { Critical: 3, High: 2, Medium: 1 };
        cmp = weight[a.severity] - weight[b.severity];
      }
      return exceptionSortDirection === 'asc' ? cmp : -cmp;
    });
  }, [filteredExceptions, exceptionSortField, exceptionSortDirection]);

  const exceptionTotalPages = Math.ceil(sortedExceptions.length / exceptionPageSize) || 1;
  const paginatedExceptions = useMemo(() => {
    const start = (exceptionCurrentPage - 1) * exceptionPageSize;
    return sortedExceptions.slice(start, start + exceptionPageSize);
  }, [sortedExceptions, exceptionCurrentPage, exceptionPageSize]);

  const handleExceptionSort = (field: 'orderNumber' | 'daysDelayed' | 'totalValue' | 'orderDate' | 'severity') => {
    if (exceptionSortField === field) {
      setExceptionSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setExceptionSortField(field);
      setExceptionSortDirection('desc');
    }
  };

  // Exception Summary KPIs
  const exceptionSummary = useMemo(() => {
    const totalExceptions = orderExceptions.length;
    const delayedOrders = orderExceptions.filter((e) => e.category === 'Delayed Order');
    const backlogExceptions = orderExceptions.filter((e) => e.category === 'Backlog Exception');
    const processingExceptions = orderExceptions.filter((e) => e.category === 'Processing Exception');
    const criticalExceptions = orderExceptions.filter((e) => e.severity === 'Critical');

    const totalDelayedValue = delayedOrders.reduce((acc, curr) => acc + curr.totalValue, 0);
    const totalBacklogValue = backlogExceptions.reduce((acc, curr) => acc + curr.totalValue, 0);

    const avgDelayDays = delayedOrders.length > 0
      ? Math.round(delayedOrders.reduce((sum, e) => sum + (e.daysDelayed || 0), 0) / delayedOrders.length)
      : 0;

    const avgBacklogAgeing = backlogExceptions.length > 0
      ? Math.round(backlogExceptions.reduce((sum, e) => sum + (e.backlogAgeingDays || 0), 0) / backlogExceptions.length)
      : 0;

    return {
      totalExceptions,
      delayedCount: delayedOrders.length,
      delayedValue: totalDelayedValue,
      avgDelayDays,
      backlogCount: backlogExceptions.length,
      backlogValue: totalBacklogValue,
      avgBacklogAgeing,
      processingCount: processingExceptions.length,
      criticalCount: criticalExceptions.length,
    };
  }, [orderExceptions]);

  // Aggregate Metrics for Header
  const totalFilteredValue = useMemo(() => {
    return filteredOrders.reduce((sum, o) => sum + o.totalValue, 0);
  }, [filteredOrders]);

  const uniqueDistributorCount = useMemo(() => {
    return new Set(filteredOrders.map((o) => o.accountId)).size;
  }, [filteredOrders]);

  // Action: Trace in Ontology from Exception Table
  const handleTraceInOntology = (orderNumber: string) => {
    setSelectedNodeId(orderNumber);
    setViewMode('ontology');
    window.scrollTo({ top: 180, behavior: 'smooth' });
  };

  return (
    <div className="space-y-5 pb-12">
      {/* 1. Header & Navigation Context Banner */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#007041]/10 border border-[#007041]/20 flex items-center justify-center text-[#007041] shrink-0">
              <Network className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                  Order Traceability
                </h1>
                <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-[#007041]/10 text-[#007041] font-bold border border-[#007041]/20">
                  VERIFIED DATA MODEL
                </span>
                {orderExceptions.length > 0 && (
                  <button
                    onClick={() => setViewMode('exceptions')}
                    className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-800 border border-amber-500/30 font-semibold text-xs hover:bg-amber-500/20 transition-colors cursor-pointer"
                  >
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    <span>{orderExceptions.length} Exceptions Detected</span>
                  </button>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Trace end-to-end commercial relationships connecting Sales Agents, Sales Orders, Manufacturing Facilities, and Distributors, and resolve operational exceptions.
              </p>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="px-3 py-1.5 rounded-lg bg-purple-50 border border-purple-200 text-purple-900">
              <span className="text-[10px] uppercase font-bold text-purple-600 block">Active Agencies</span>
              <strong className="font-mono text-sm">{new Set(filteredOrders.map((o) => o.agentId)).size} Agencies</strong>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900">
              <span className="text-[10px] uppercase font-bold text-amber-600 block">Sales Orders</span>
              <strong className="font-mono text-sm">{filteredOrders.length} Tracked Orders</strong>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-900">
              <span className="text-[10px] uppercase font-bold text-blue-600 block">Mfg Facilities</span>
              <strong className="font-mono text-sm">{new Set(filteredOrders.map((o) => o.facilityId)).size} Centers</strong>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-[#007041]">
              <span className="text-[10px] uppercase font-bold text-emerald-600 block">Commercial Value</span>
              <strong className="font-mono text-sm">${(totalFilteredValue / 1000000).toFixed(2)}M</strong>
            </div>
          </div>
        </div>

        {/* View Toggle (Ontology vs Table vs Order Exceptions) & Canvas Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
          {/* View Representation Toggle */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Representation:
            </span>
            <div className="inline-flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
              <button
                onClick={() => setViewMode('ontology')}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'ontology'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Network className="w-3.5 h-3.5 text-[#007041]" />
                <span>Ontology View</span>
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <TableIcon className="w-3.5 h-3.5 text-blue-600" />
                <span>Table View ({filteredOrders.length})</span>
              </button>
              <button
                onClick={() => setViewMode('exceptions')}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'exceptions'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <span>Order Exceptions</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  orderExceptions.length > 0 ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-600'
                }`}>
                  {orderExceptions.length}
                </span>
              </button>
            </div>
          </div>

          {/* Canvas Actions (in Ontology View) */}
          {viewMode === 'ontology' && (
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                <button
                  onClick={handleZoomIn}
                  className="p-1 hover:bg-white rounded-md text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleZoomOut}
                  className="p-1 hover:bg-white rounded-md text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleResetCanvas}
                  className="p-1 hover:bg-white rounded-md text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                  title="Reset Zoom & Pan"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="text-[11px] font-mono text-slate-500 font-semibold px-2 py-1 bg-slate-50 rounded-lg border border-slate-200">
                Zoom: {Math.round(zoom * 100)}%
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Actionable Exceptions Prompt Banner (when in ontology or table mode and exceptions are detected) */}
      {viewMode !== 'exceptions' && orderExceptions.length > 0 && (
        <div className="bg-amber-50/90 border border-amber-200 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-900 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-700 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold">
                {orderExceptions.length} Actionable Order Exceptions
              </span>{' '}
              <span className="text-amber-800">
                detected across active filter selection ({exceptionSummary.delayedCount} delayed shipments, {exceptionSummary.backlogCount} critical/aged backlogs, {exceptionSummary.processingCount} credit holds).
              </span>
            </div>
          </div>
          <button
            onClick={() => setViewMode('exceptions')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer shrink-0"
          >
            <span>Investigate Exceptions</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 2. Exploration Breadcrumb Bar (when navigating through connected records) */}
      {navigationHistory.length > 0 && (
        <div className="flex items-center justify-between gap-3 bg-white px-4 py-2.5 rounded-xl border border-slate-200/80 text-xs shadow-2xs">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Exploration Path:
            </span>
            <button
              onClick={handleBackNavigation}
              className="text-slate-500 hover:text-slate-900 inline-flex items-center gap-1 font-semibold cursor-pointer px-1.5 py-0.5 rounded bg-slate-100 mr-1"
            >
              <ArrowLeft className="w-3 h-3" />
              <span>Back</span>
            </button>
            {navigationHistory.map((id, index) => {
              const node = nodeMap.get(id);
              const isLast = index === navigationHistory.length - 1;
              return (
                <React.Fragment key={`${id}-${index}`}>
                  {index > 0 && <ChevronRight className="w-3 h-3 text-slate-400" />}
                  <button
                    onClick={() => handleSelectNode(id)}
                    className={`font-semibold px-2 py-0.5 rounded transition-colors cursor-pointer ${
                      isLast
                        ? 'bg-[#007041] text-white font-bold'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {node ? `${node.type === 'Order' ? 'Sales Order' : node.type}: ${node.label}` : id}
                  </button>
                </React.Fragment>
              );
            })}
          </div>
          <button
            onClick={() => {
              setSelectedNodeId(null);
              setNavigationHistory([]);
            }}
            className="text-slate-400 hover:text-slate-600 text-[11px] font-medium cursor-pointer"
          >
            Clear Path
          </button>
        </div>
      )}

      {/* 3. Primary Workspace: Ontology View vs Table View vs Order Exceptions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        <div className={selectedNode ? 'lg:col-span-8' : 'lg:col-span-12'}>
          {viewMode === 'ontology' ? (
            /* ======================================================== */
            /* A. INTERACTIVE ONTOLOGY DIAGRAM CANVAS                   */
            /* ======================================================== */
            <div className="bg-slate-950 rounded-xl border border-slate-800 shadow-xl overflow-hidden relative min-h-[720px] h-[720px] select-none">
              {/* Canvas Watermark / Subtitle */}
              <div className="absolute top-3 left-4 z-10 pointer-events-none flex items-center gap-2">
                <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase font-semibold">
                  Acuity Supply Chain Graph
                </span>
                <span className="text-slate-600">•</span>
                <span className="text-[10px] text-slate-400 font-mono">
                  Agent → Sales Order → Facility → Distributor
                </span>
              </div>

              {/* Status / Node Count HUD */}
              <div className="absolute top-3 right-4 z-10 pointer-events-none flex items-center gap-2 text-[10.5px] font-mono text-slate-400 bg-slate-900/80 px-2.5 py-1 rounded-md border border-slate-800">
                <span>Nodes: <strong className="text-white">{positionedNodes.length}</strong></span>
                <span className="text-slate-600">|</span>
                <span>Links: <strong className="text-white">{edges.length}</strong></span>
                <span className="text-slate-600">|</span>
                <span>Exceptions: <strong className="text-amber-400">{orderExceptions.length}</strong></span>
              </div>

              {/* Empty State */}
              {positionedNodes.length === 0 && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 p-6 text-center space-y-2 z-20">
                  <Info className="w-8 h-8 text-slate-500" />
                  <p className="text-sm font-semibold text-slate-300">
                    No verified ontology relationships match the selected filter combination.
                  </p>
                  <p className="text-xs text-slate-500 max-w-sm">
                    Try clearing or relaxing your Order Status, Agent, Sales Order, or Region filters to view connected entities.
                  </p>
                  <button
                    onClick={handleResetCanvasAndFilters}
                    className="mt-2 px-3 py-1.5 rounded-lg bg-[#007041] text-white text-xs font-bold hover:bg-[#005a34] cursor-pointer"
                  >
                    Reset All Filters
                  </button>
                </div>
              )}

              {/* SVG Canvas */}
              <svg
                ref={svgRef}
                className={`w-full h-full ${
                  draggedNodeId ? 'cursor-grabbing' : isDragging ? 'cursor-grabbing' : 'cursor-grab'
                }`}
                viewBox="0 0 1200 750"
                onMouseDown={handleCanvasMouseDown}
                onMouseMove={handleCanvasMouseMove}
                onMouseUp={handleCanvasMouseUp}
                onMouseLeave={handleCanvasMouseUp}
              >
                <defs>
                  {/* Directed Arrow Markers */}
                  <marker
                    id="arrow-default"
                    viewBox="0 0 10 10"
                    refX="22"
                    refY="5"
                    markerWidth="6"
                    markerHeight="6"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 1 L 10 5 L 0 9 z" fill="#64748B" />
                  </marker>
                  <marker
                    id="arrow-active"
                    viewBox="0 0 10 10"
                    refX="22"
                    refY="5"
                    markerWidth="7"
                    markerHeight="7"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 1 L 10 5 L 0 9 z" fill="#04BC6F" />
                  </marker>

                  {/* Column Background Bands */}
                  <linearGradient id="col-gradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1E293B" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#0F172A" stopOpacity="0.4" />
                  </linearGradient>
                </defs>

                {/* Grid Background */}
                <g className="grid-background pointer-events-none" opacity="0.15">
                  {Array.from({ length: 25 }).map((_, i) => (
                    <line
                      key={`h-${i}`}
                      x1="0"
                      y1={i * 30}
                      x2="1200"
                      y2={i * 30}
                      stroke="#475569"
                      strokeWidth="0.5"
                    />
                  ))}
                  {Array.from({ length: 40 }).map((_, i) => (
                    <line
                      key={`v-${i}`}
                      x1={i * 30}
                      y1="0"
                      x2={i * 30}
                      y2="750"
                      stroke="#475569"
                      strokeWidth="0.5"
                    />
                  ))}
                </g>

                {/* Transform Layer for Zoom & Pan */}
                <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
                  {/* Entity Column Header Guides */}
                  <g className="column-headers pointer-events-none">
                    <rect x="70" y="32" width="170" height="26" rx="6" fill="url(#col-gradient)" stroke="#334155" strokeWidth="1" />
                    <text x="155" y="49" textAnchor="middle" fill="#A78BFA" fontSize="11" fontWeight="bold" fontFamily="system-ui, sans-serif">
                      1. AGENT / AGENCY
                    </text>

                    <rect x="365" y="32" width="170" height="26" rx="6" fill="url(#col-gradient)" stroke="#334155" strokeWidth="1" />
                    <text x="450" y="49" textAnchor="middle" fill="#FBBF24" fontSize="11" fontWeight="bold" fontFamily="system-ui, sans-serif">
                      2. SALES ORDER
                    </text>

                    <rect x="660" y="32" width="170" height="26" rx="6" fill="url(#col-gradient)" stroke="#334155" strokeWidth="1" />
                    <text x="745" y="49" textAnchor="middle" fill="#60A5FA" fontSize="11" fontWeight="bold" fontFamily="system-ui, sans-serif">
                      3. FACILITY CENTER
                    </text>

                    <rect x="955" y="32" width="170" height="26" rx="6" fill="url(#col-gradient)" stroke="#334155" strokeWidth="1" />
                    <text x="1040" y="49" textAnchor="middle" fill="#34D399" fontSize="11" fontWeight="bold" fontFamily="system-ui, sans-serif">
                      4. DISTRIBUTOR
                    </text>
                  </g>

                  {/* Edges */}
                  <g className="edges">
                    {edges.map((edge) => {
                      const sourceNode = nodeMap.get(edge.source);
                      const targetNode = nodeMap.get(edge.target);
                      if (!sourceNode || !targetNode) return null;

                      const isHighlighted =
                        (selectedNodeId && (edge.source === selectedNodeId || edge.target === selectedNodeId)) ||
                        (hoveredNodeId && (edge.source === hoveredNodeId || edge.target === hoveredNodeId));

                      const isEdgeActive =
                        connectedNodeIds.has(edge.source) && connectedNodeIds.has(edge.target);

                      const deltaX = targetNode.x - sourceNode.x;
                      const cX1 = sourceNode.x + deltaX * 0.45;
                      const cX2 = targetNode.x - deltaX * 0.45;
                      const pathD = `M ${sourceNode.x} ${sourceNode.y} C ${cX1} ${sourceNode.y}, ${cX2} ${targetNode.y}, ${targetNode.x} ${targetNode.y}`;

                      const strokeColor = isHighlighted ? '#04BC6F' : isEdgeActive ? '#64748B' : '#334155';
                      const strokeWidth = isHighlighted ? 2.8 : 1.2;
                      const opacity = isHighlighted ? 1 : isEdgeActive ? 0.6 : 0.15;

                      return (
                        <g key={edge.id} className="transition-all duration-200">
                          <path
                            d={pathD}
                            fill="none"
                            stroke={strokeColor}
                            strokeWidth={strokeWidth}
                            strokeOpacity={opacity}
                            markerEnd={isHighlighted ? 'url(#arrow-active)' : 'url(#arrow-default)'}
                          />
                          {isHighlighted && (
                            <g transform={`translate(${(sourceNode.x + targetNode.x) / 2}, ${(sourceNode.y + targetNode.y) / 2 - 8})`}>
                              <rect
                                x="-65"
                                y="-10"
                                width="130"
                                height="18"
                                rx="4"
                                fill="#0F172A"
                                stroke="#04BC6F"
                                strokeWidth="1"
                                fillOpacity="0.95"
                              />
                              <text
                                textAnchor="middle"
                                y="2.5"
                                fill="#34D399"
                                fontSize="8.5"
                                fontWeight="bold"
                                fontFamily="system-ui, sans-serif"
                              >
                                {edge.label}
                              </text>
                            </g>
                          )}
                        </g>
                      );
                    })}
                  </g>

                  {/* Nodes */}
                  <g className="nodes">
                    {positionedNodes.map((node) => {
                      const isSelected = selectedNodeId === node.id;
                      const isHovered = hoveredNodeId === node.id;
                      const isConnected = connectedNodeIds.has(node.id);
                      const hasSelection = selectedNodeId !== null || hoveredNodeId !== null;
                      const opacity = hasSelection && !isConnected ? 0.22 : 1;

                      const colorInfo = getNodeColor(node.type);
                      const isOrderWithException = node.type === 'Order' && orderExceptions.some((e) => e.orderNumber === node.id);

                      return (
                        <g
                          key={node.id}
                          transform={`translate(${node.x}, ${node.y})`}
                          className="cursor-pointer group select-none"
                          style={{ opacity, transition: 'opacity 0.2s' }}
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            setDraggedNodeId(node.id);
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectNode(node.id);
                          }}
                          onMouseEnter={() => setHoveredNodeId(node.id)}
                          onMouseLeave={() => setHoveredNodeId(null)}
                        >
                          {(isSelected || isHovered) && (
                            <circle
                              r="32"
                              fill="none"
                              stroke={colorInfo.fill}
                              strokeWidth="2"
                              className="animate-ping opacity-60"
                            />
                          )}

                          <rect
                            x="-72"
                            y="-22"
                            width="144"
                            height="44"
                            rx="10"
                            fill="#0F172A"
                            stroke={isSelected ? '#04BC6F' : isHovered ? colorInfo.fill : isOrderWithException ? '#F59E0B' : '#334155'}
                            strokeWidth={isSelected ? 2.5 : isHovered ? 2 : isOrderWithException ? 1.8 : 1.2}
                          />

                          <circle
                            cx="-50"
                            cy="0"
                            r="10"
                            fill={colorInfo.fill}
                          />
                          <circle
                            cx="-50"
                            cy="0"
                            r="5"
                            fill="#FFFFFF"
                          />

                          <text
                            x="-32"
                            y="-4"
                            fill="#F8FAFC"
                            fontSize="10"
                            fontWeight="bold"
                            fontFamily="system-ui, sans-serif"
                            className="select-none pointer-events-none"
                          >
                            {node.label}
                          </text>
                          <text
                            x="-32"
                            y="10"
                            fill="#94A3B8"
                            fontSize="8.5"
                            fontWeight="500"
                            fontFamily="system-ui, sans-serif"
                            className="select-none pointer-events-none"
                          >
                            {node.sublabel.length > 20 ? node.sublabel.slice(0, 18) + '…' : node.sublabel}
                          </text>

                          {/* Exception Indicator Badge on Node */}
                          {isOrderWithException && (
                            <g transform="translate(62, -18)">
                              <circle r="7" fill="#EF4444" stroke="#0F172A" strokeWidth="1.5" />
                              <text textAnchor="middle" y="2.5" fill="#FFFFFF" fontSize="8" fontWeight="extrabold">!</text>
                            </g>
                          )}
                        </g>
                      );
                    })}
                  </g>
                </g>
              </svg>

              {/* Bottom Canvas Legend */}
              <div className="absolute bottom-3 left-3 bg-slate-900/90 backdrop-blur-xs border border-slate-700/80 rounded-lg p-2.5 text-white text-[10.5px] space-y-1.5 pointer-events-none flex flex-wrap items-center gap-4">
                <span className="font-bold text-[9px] uppercase tracking-wider text-slate-400 block w-full sm:w-auto">
                  Traceability Legend:
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block" />
                  <span>Agent / Agency</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                  <span>Sales Order</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
                  <span>Facility Center</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#04BC6F] inline-block" />
                  <span>Distributor</span>
                </div>
                <div className="flex items-center gap-1.5 text-amber-400">
                  <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
                  <span>Order Exception Flag</span>
                </div>
              </div>

              <div className="absolute bottom-3 right-3 text-[10px] text-slate-400 bg-slate-900/80 px-2 py-1 rounded border border-slate-700/60 pointer-events-none">
                Click node to inspect • Drag node to reposition • Scroll to zoom
              </div>
            </div>
          ) : viewMode === 'table' ? (
            /* ======================================================== */
            /* B. STRUCTURED DATA TABLE VIEW                            */
            /* ======================================================== */
            <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <span>Verified Sales Order Pipeline Records</span>
                    <span className="font-mono text-xs px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold border border-blue-200">
                      {filteredOrders.length} Records
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Tabular view reflecting the identical filtered dataset across Agent, Sales Order, Manufacturing Facility, and Distributor relationships.
                  </p>
                </div>
              </div>

              {/* Table Records */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 font-semibold">
                      <th
                        className="py-3 px-3 cursor-pointer hover:text-slate-900 select-none"
                        onClick={() => handleSort('orderNumber')}
                      >
                        <div className="flex items-center gap-1">
                          <span>Sales Order #</span>
                          <ArrowUpDown className="w-3 h-3" />
                        </div>
                      </th>
                      <th className="py-3 px-3">Agent / Sales Agency</th>
                      <th
                        className="py-3 px-3 cursor-pointer hover:text-slate-900 select-none"
                        onClick={() => handleSort('orderDate')}
                      >
                        <div className="flex items-center gap-1">
                          <span>Order Date</span>
                          <ArrowUpDown className="w-3 h-3" />
                        </div>
                      </th>
                      <th className="py-3 px-3">Manufacturing Plant</th>
                      <th className="py-3 px-3">Distributor Account</th>
                      <th className="py-3 px-3">Product Family</th>
                      <th
                        className="py-3 px-3 cursor-pointer hover:text-slate-900 select-none"
                        onClick={() => handleSort('status')}
                      >
                        <div className="flex items-center gap-1">
                          <span>Status</span>
                          <ArrowUpDown className="w-3 h-3" />
                        </div>
                      </th>
                      <th
                        className="py-3 px-3 text-right cursor-pointer hover:text-slate-900 select-none"
                        onClick={() => handleSort('totalValue')}
                      >
                        <div className="flex items-center justify-end gap-1">
                          <span>Total Value</span>
                          <ArrowUpDown className="w-3 h-3" />
                        </div>
                      </th>
                      <th className="py-3 px-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paginatedOrders.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="py-8 text-center text-slate-400">
                          No sales orders match the active filter criteria.
                        </td>
                      </tr>
                    ) : (
                      paginatedOrders.map((order) => {
                        const hasException = orderExceptions.some((e) => e.orderNumber === order.orderNumber);
                        const isSelected = selectedNodeId === order.orderNumber;
                        return (
                          <tr
                            key={order.orderNumber}
                            className={`hover:bg-slate-50/90 transition-colors ${
                              isSelected ? 'bg-[#007041]/5 font-medium' : ''
                            }`}
                          >
                            <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                              <div className="flex items-center gap-1.5">
                                <span>{order.orderNumber}</span>
                                {hasException && (
                                  <span className="w-2 h-2 rounded-full bg-amber-500" title="Has Order Exception" />
                                )}
                              </div>
                            </td>
                            <td className="py-2.5 px-3">
                              <div className="font-semibold text-slate-800">{order.agentName}</div>
                              <div className="text-[10px] text-purple-700">{order.agencyName}</div>
                            </td>
                            <td className="py-2.5 px-3 font-mono text-slate-600">{order.orderDate}</td>
                            <td className="py-2.5 px-3">
                              <span className="font-medium text-blue-700">{order.facilityName}</span>
                            </td>
                            <td className="py-2.5 px-3">
                              <div className="font-semibold text-slate-900">{order.accountName}</div>
                              <div className="text-[10px] text-slate-400">
                                {order.distributorCity ? `${order.distributorCity}, ${order.distributorState} • ` : ''}
                                {order.distributorRegion}
                              </div>
                            </td>
                            <td className="py-2.5 px-3 text-slate-700">{order.productFamily}</td>
                            <td className="py-2.5 px-3">
                              <span
                                className={`inline-block px-2 py-0.5 rounded text-[10.5px] font-bold ${
                                  order.status === 'Delivered'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : order.status === 'Shipped'
                                    ? 'bg-blue-100 text-blue-800'
                                    : order.status === 'In Production'
                                    ? 'bg-amber-100 text-amber-800'
                                    : order.status === 'Backlog Scheduled'
                                    ? 'bg-purple-100 text-purple-800'
                                    : 'bg-red-100 text-red-800'
                                }`}
                              >
                                {order.status}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold text-[#007041]">
                              ${order.totalValue.toLocaleString()}
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <button
                                onClick={() => handleSelectNode(order.orderNumber)}
                                className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold cursor-pointer"
                              >
                                Inspect
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Table Pagination */}
              {totalPages > 1 && (
                <div className="p-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 bg-slate-50/40">
                  <div>
                    Showing <strong>{(currentPage - 1) * pageSize + 1}</strong> to{' '}
                    <strong>{Math.min(currentPage * pageSize, sortedOrders.length)}</strong> of{' '}
                    <strong>{sortedOrders.length}</strong> Sales Orders
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-2.5 py-1 rounded border border-slate-200 bg-white disabled:opacity-40 hover:bg-slate-50 cursor-pointer font-medium"
                    >
                      Previous
                    </button>
                    <span className="font-mono text-xs px-2">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="px-2.5 py-1 rounded border border-slate-200 bg-white disabled:opacity-40 hover:bg-slate-50 cursor-pointer font-medium"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* ======================================================== */
            /* C. DEDICATED ORDER EXCEPTIONS INVESTIGATION SECTION      */
            /* ======================================================== */
            <div className="space-y-4">
              {/* Exceptions KPI Summary Dashboard */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-xs">
                {/* 1. Total Exceptions */}
                <div className="bg-white rounded-xl border border-slate-200/90 p-3.5 shadow-2xs">
                  <div className="flex items-center justify-between text-slate-500 mb-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider">Total Exceptions</span>
                    <AlertCircle className="w-4 h-4 text-amber-500" />
                  </div>
                  <div className="text-xl font-extrabold text-slate-900 font-mono">
                    {exceptionSummary.totalExceptions}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Unique affected sales orders
                  </div>
                </div>

                {/* 2. Delayed Orders */}
                <div className="bg-white rounded-xl border border-slate-200/90 p-3.5 shadow-2xs">
                  <div className="flex items-center justify-between text-slate-500 mb-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider">Delayed Orders</span>
                    <Clock className="w-4 h-4 text-red-500" />
                  </div>
                  <div className="text-xl font-extrabold text-red-600 font-mono">
                    {exceptionSummary.delayedCount}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5 font-medium">
                    Avg delay: <strong>{exceptionSummary.avgDelayDays} days</strong>
                  </div>
                </div>

                {/* 3. Backlog Exceptions */}
                <div className="bg-white rounded-xl border border-slate-200/90 p-3.5 shadow-2xs">
                  <div className="flex items-center justify-between text-slate-500 mb-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider">Backlog Exceptions</span>
                    <Layers className="w-4 h-4 text-amber-600" />
                  </div>
                  <div className="text-xl font-extrabold text-amber-700 font-mono">
                    {exceptionSummary.backlogCount}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5 font-medium">
                    Avg age: <strong>{exceptionSummary.avgBacklogAgeing} days</strong>
                  </div>
                </div>

                {/* 4. Processing & Credit Holds */}
                <div className="bg-white rounded-xl border border-slate-200/90 p-3.5 shadow-2xs">
                  <div className="flex items-center justify-between text-slate-500 mb-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider">Processing Holds</span>
                    <ShieldCheck className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="text-xl font-extrabold text-purple-800 font-mono">
                    {exceptionSummary.processingCount}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Credit ceiling / plant holds
                  </div>
                </div>

                {/* 5. Critical Severity */}
                <div className="bg-white rounded-xl border border-slate-200/90 p-3.5 shadow-2xs">
                  <div className="flex items-center justify-between text-slate-500 mb-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider">Critical Priority</span>
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                  </div>
                  <div className="text-xl font-extrabold text-red-700 font-mono">
                    {exceptionSummary.criticalCount}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Escalation required
                  </div>
                </div>
              </div>

              {/* Exception Table Container */}
              <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
                {/* Filter and Search Bar for Exceptions */}
                <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400 mr-1">
                      Filter:
                    </span>
                    <button
                      onClick={() => setExceptionCategoryFilter('all')}
                      className={`px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer transition-colors ${
                        exceptionCategoryFilter === 'all'
                          ? 'bg-slate-900 text-white'
                          : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      All ({orderExceptions.length})
                    </button>
                    <button
                      onClick={() => setExceptionCategoryFilter('Delayed Order')}
                      className={`px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer transition-colors ${
                        exceptionCategoryFilter === 'Delayed Order'
                          ? 'bg-red-600 text-white'
                          : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      Delayed ({exceptionSummary.delayedCount})
                    </button>
                    <button
                      onClick={() => setExceptionCategoryFilter('Backlog Exception')}
                      className={`px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer transition-colors ${
                        exceptionCategoryFilter === 'Backlog Exception'
                          ? 'bg-amber-600 text-white'
                          : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      Backlog ({exceptionSummary.backlogCount})
                    </button>
                    <button
                      onClick={() => setExceptionCategoryFilter('Processing Exception')}
                      className={`px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer transition-colors ${
                        exceptionCategoryFilter === 'Processing Exception'
                          ? 'bg-purple-700 text-white'
                          : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      Processing Holds ({exceptionSummary.processingCount})
                    </button>
                    <button
                      onClick={() => setExceptionSeverityFilter(exceptionSeverityFilter === 'Critical' ? 'all' : 'Critical')}
                      className={`px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer transition-colors ${
                        exceptionSeverityFilter === 'Critical'
                          ? 'bg-rose-700 text-white'
                          : 'bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100'
                      }`}
                    >
                      Critical Only ({exceptionSummary.criticalCount})
                    </button>
                  </div>

                  {/* Real-time Search Input */}
                  <div className="relative min-w-[240px]">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search order #, distributor, reason..."
                      value={exceptionSearchQuery}
                      onChange={(e) => setExceptionSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-7 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-[#007041]"
                    />
                    {exceptionSearchQuery && (
                      <button
                        onClick={() => setExceptionSearchQuery('')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Exceptions Details Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 font-semibold">
                        <th
                          className="py-3 px-3 cursor-pointer hover:text-slate-900 select-none"
                          onClick={() => handleExceptionSort('orderNumber')}
                        >
                          <div className="flex items-center gap-1">
                            <span>Sales Order #</span>
                            <ArrowUpDown className="w-3 h-3" />
                          </div>
                        </th>
                        <th className="py-3 px-3">Order Status</th>
                        <th className="py-3 px-3">Category & Severity</th>
                        <th className="py-3 px-3">Exception Reason & Rule</th>
                        <th className="py-3 px-3">Distributor / Branch</th>
                        <th className="py-3 px-3">Agent / Plant</th>
                        <th
                          className="py-3 px-3 cursor-pointer hover:text-slate-900 select-none"
                          onClick={() => handleExceptionSort('orderDate')}
                        >
                          <div className="flex items-center gap-1">
                            <span>Order Date</span>
                            <ArrowUpDown className="w-3 h-3" />
                          </div>
                        </th>
                        <th className="py-3 px-3">Promised Date (CPD)</th>
                        <th
                          className="py-3 px-3 text-right cursor-pointer hover:text-slate-900 select-none"
                          onClick={() => handleExceptionSort('daysDelayed')}
                        >
                          <div className="flex items-center justify-end gap-1">
                            <span>Delay / Ageing</span>
                            <ArrowUpDown className="w-3 h-3" />
                          </div>
                        </th>
                        <th className="py-3 px-3 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {paginatedExceptions.length === 0 ? (
                        <tr>
                          <td colSpan={10} className="py-10 text-center">
                            <div className="flex flex-col items-center justify-center space-y-2 text-slate-400">
                              <CheckCircle2 className="w-8 h-8 text-[#007041]" />
                              <p className="text-sm font-bold text-slate-800">
                                No Order Exceptions Detected
                              </p>
                              <p className="text-xs text-slate-500 max-w-md">
                                All orders in the current filter scope comply with committed promise dates (CPD) and standard operational thresholds.
                              </p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        paginatedExceptions.map((item) => {
                          const isSelected = selectedNodeId === item.orderNumber;
                          return (
                            <tr
                              key={item.orderNumber}
                              className={`hover:bg-slate-50/90 transition-colors ${
                                isSelected ? 'bg-amber-50/50 font-medium' : ''
                              }`}
                            >
                              {/* Order Number */}
                              <td className="py-3 px-3 font-mono font-bold text-slate-900">
                                {item.orderNumber}
                              </td>

                              {/* Order Status */}
                              <td className="py-3 px-3">
                                <span
                                  className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                                    item.status === 'Delivered'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : item.status === 'Shipped'
                                      ? 'bg-blue-100 text-blue-800'
                                      : item.status === 'In Production'
                                      ? 'bg-amber-100 text-amber-800'
                                      : item.status === 'Backlog Scheduled'
                                      ? 'bg-purple-100 text-purple-800'
                                      : 'bg-red-100 text-red-800'
                                  }`}
                                >
                                  {item.status}
                                </span>
                              </td>

                              {/* Category & Severity */}
                              <td className="py-3 px-3">
                                <div className="flex flex-col gap-1 items-start">
                                  <span
                                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                      item.category === 'Delayed Order'
                                        ? 'bg-red-100 text-red-800'
                                        : item.category === 'Backlog Exception'
                                        ? 'bg-amber-100 text-amber-800'
                                        : 'bg-purple-100 text-purple-800'
                                    }`}
                                  >
                                    {item.category}
                                  </span>
                                  <span
                                    className={`text-[9.5px] font-semibold px-1.5 py-0.2 rounded border ${
                                      item.severity === 'Critical'
                                        ? 'bg-rose-50 text-rose-700 border-rose-200 font-bold'
                                        : item.severity === 'High'
                                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                                        : 'bg-slate-100 text-slate-600 border-slate-200'
                                    }`}
                                  >
                                    {item.severity} Priority
                                  </span>
                                </div>
                              </td>

                              {/* Exception Reason & Business Rule */}
                              <td className="py-3 px-3 max-w-[280px]">
                                <div className="font-semibold text-slate-800 text-[11px] leading-tight">
                                  {item.reason}
                                </div>
                                <div className="text-[10px] text-slate-400 mt-0.5">
                                  Rule: {item.businessRule}
                                </div>
                              </td>

                              {/* Distributor */}
                              <td className="py-3 px-3">
                                <div className="font-semibold text-slate-900">{item.accountName}</div>
                                <div className="text-[10px] text-slate-400">{item.distributorRegion} Region</div>
                              </td>

                              {/* Agent / Plant */}
                              <td className="py-3 px-3">
                                <div className="text-slate-800 font-medium">{item.agentName}</div>
                                <div className="text-[10px] text-blue-700">{item.facilityName}</div>
                              </td>

                              {/* Dates */}
                              <td className="py-3 px-3 font-mono text-slate-600">
                                {item.orderDate}
                              </td>
                              <td className="py-3 px-3 font-mono text-slate-600">
                                {item.requiredShipDate}
                              </td>

                              {/* Delay or Backlog Ageing */}
                              <td className="py-3 px-3 text-right">
                                {item.daysDelayed !== undefined ? (
                                  <span className="font-mono font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded border border-red-200">
                                    +{item.daysDelayed}d Delayed
                                  </span>
                                ) : item.backlogAgeingDays !== undefined ? (
                                  <span className="font-mono font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                                    {item.backlogAgeingDays}d Aged
                                  </span>
                                ) : (
                                  <span className="text-slate-400 font-mono">—</span>
                                )}
                              </td>

                              {/* Actions */}
                              <td className="py-3 px-3 text-center">
                                <div className="flex items-center justify-center gap-1.5">
                                  <button
                                    onClick={() => handleTraceInOntology(item.orderNumber)}
                                    className="px-2 py-1 rounded bg-[#007041]/10 text-[#007041] hover:bg-[#007041] hover:text-white font-bold text-[10.5px] transition-colors cursor-pointer"
                                    title="Trace in Ontology Diagram"
                                  >
                                    Trace Path
                                  </button>
                                  <button
                                    onClick={() => handleSelectNode(item.orderNumber)}
                                    className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[10.5px] transition-colors cursor-pointer"
                                    title="Inspect Order Details"
                                  >
                                    Details
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Exception Pagination */}
                {exceptionTotalPages > 1 && (
                  <div className="p-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 bg-slate-50/40">
                    <div>
                      Showing <strong>{(exceptionCurrentPage - 1) * exceptionPageSize + 1}</strong> to{' '}
                      <strong>{Math.min(exceptionCurrentPage * exceptionPageSize, sortedExceptions.length)}</strong> of{' '}
                      <strong>{sortedExceptions.length}</strong> Exception Records
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setExceptionCurrentPage((p) => Math.max(p - 1, 1))}
                        disabled={exceptionCurrentPage === 1}
                        className="px-2.5 py-1 rounded border border-slate-200 bg-white disabled:opacity-40 hover:bg-slate-50 cursor-pointer font-medium"
                      >
                        Previous
                      </button>
                      <span className="font-mono text-xs px-2">
                        Page {exceptionCurrentPage} of {exceptionTotalPages}
                      </span>
                      <button
                        onClick={() => setExceptionCurrentPage((p) => Math.min(p + 1, exceptionTotalPages))}
                        disabled={exceptionCurrentPage === exceptionTotalPages}
                        className="px-2.5 py-1 rounded border border-slate-200 bg-white disabled:opacity-40 hover:bg-slate-50 cursor-pointer font-medium"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Entity Detail Inspection Drawer (when a node or order exception is selected) */}
        {selectedNode && (
          <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200/90 shadow-xl p-5 space-y-4 animate-slideIn text-xs">
            {/* Header with Type & ID */}
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-white shrink-0 font-bold"
                  style={{ backgroundColor: getNodeColor(selectedNode.type).fill }}
                >
                  {selectedNode.type === 'Agent' && <UserCheck className="w-4 h-4" />}
                  {selectedNode.type === 'Order' && <Package className="w-4 h-4" />}
                  {selectedNode.type === 'Facility' && <Factory className="w-4 h-4" />}
                  {selectedNode.type === 'Distributor' && <Building2 className="w-4 h-4" />}
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                    {selectedNode.type === 'Order' ? 'Sales Order' : selectedNode.type} Entity
                  </span>
                  <h3 className="font-extrabold text-sm text-slate-900 leading-tight">
                    {selectedNode.label}
                  </h3>
                  <span className="font-mono text-[10px] text-slate-500">{selectedNode.id}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedNodeId(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-md text-xs font-bold cursor-pointer"
                title="Close Drawer"
              >
                ✕
              </button>
            </div>

            {/* Exception Callout Banner (if selected entity is an order with active exception) */}
            {selectedOrderException && (
              <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-3 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-amber-900 font-bold">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    <span>Active {selectedOrderException.category}</span>
                  </div>
                  <span className="px-1.5 py-0.2 rounded text-[9.5px] font-extrabold bg-rose-100 text-rose-800">
                    {selectedOrderException.severity} Priority
                  </span>
                </div>
                <p className="text-[11px] text-amber-800 leading-snug">
                  {selectedOrderException.reason}
                </p>
                <div className="flex items-center justify-between text-[10px] text-amber-700 pt-1 border-t border-amber-200/60 font-mono">
                  <span>Rule: {selectedOrderException.businessRule}</span>
                  {selectedOrderException.daysDelayed !== undefined && (
                    <span className="font-bold text-red-600">+{selectedOrderException.daysDelayed}d Delayed</span>
                  )}
                </div>
              </div>
            )}

            {/* Entity Attributes Grid (Verified Data) */}
            <div className="space-y-3">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Entity Attributes
              </h4>

              {/* Agent Entity Details */}
              {selectedNode.type === 'Agent' && (
                <div className="space-y-2 bg-slate-50/80 p-3 rounded-xl border border-slate-200/70 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Representative Name:</span>
                    <strong className="text-slate-900">{selectedNode.raw.name}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Commercial Role:</span>
                    <span className="font-semibold text-slate-800">{selectedNode.raw.role}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Agency Network:</span>
                    <span className="font-semibold text-purple-700">{selectedNode.raw.agencyName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Region & Territory:</span>
                    <span className="font-medium text-slate-700">
                      {selectedNode.raw.region} • {selectedNode.raw.territory}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Commercial Status:</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      {selectedNode.raw.status}
                    </span>
                  </div>
                </div>
              )}

              {/* Sales Order Entity Details */}
              {selectedNode.type === 'Order' && (
                <div className="space-y-2 bg-slate-50/80 p-3 rounded-xl border border-slate-200/70 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Sales Order Number:</span>
                    <strong className="font-mono text-slate-900">{selectedNode.raw.orderNumber}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Total Commercial Value:</span>
                    <span className="font-mono font-bold text-[#007041]">
                      ${selectedNode.raw.totalValue.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Line Items Count:</span>
                    <span className="font-bold text-slate-800">{selectedNode.raw.linesCount} Order Lines</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Product Family:</span>
                    <span className="font-semibold text-slate-800">{selectedNode.raw.productFamily}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Order Date:</span>
                    <span className="font-mono text-slate-700">{selectedNode.raw.orderDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Promised Date (CPD):</span>
                    <span className="font-mono text-slate-700">{selectedNode.raw.requiredShipDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Actual Fulfillment Date:</span>
                    <span className="font-mono text-slate-700">{selectedNode.raw.actualShipDate || 'Pending Shipment'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Order Status:</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        selectedNode.raw.status === 'Delivered'
                          ? 'bg-emerald-100 text-emerald-800'
                          : selectedNode.raw.status === 'Shipped'
                          ? 'bg-blue-100 text-blue-800'
                          : selectedNode.raw.status === 'In Production'
                          ? 'bg-amber-100 text-amber-800'
                          : selectedNode.raw.status === 'Backlog Scheduled'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {selectedNode.raw.status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">On-Time Status:</span>
                    <span className="font-semibold text-slate-800">{selectedNode.raw.onTimeStatus}</span>
                  </div>
                </div>
              )}

              {/* Facility Entity Details */}
              {selectedNode.type === 'Facility' && (
                <div className="space-y-2 bg-slate-50/80 p-3 rounded-xl border border-slate-200/70 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Facility Center:</span>
                    <strong className="text-slate-900">{selectedNode.raw.name}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Manufacturing Type:</span>
                    <span className="font-semibold text-blue-700">{selectedNode.raw.facilityType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Operating Location:</span>
                    <span className="text-slate-800">
                      {selectedNode.raw.city}, {selectedNode.raw.state} ({selectedNode.raw.country})
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Annual Capacity:</span>
                    <span className="font-mono font-bold text-slate-900">
                      {selectedNode.raw.annualCapacityUnits.toLocaleString()} Units
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Operating Status:</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      {selectedNode.raw.operatingStatus}
                    </span>
                  </div>
                  <div className="pt-1.5 border-t border-slate-200/60">
                    <span className="text-[10px] text-slate-500 block mb-1">Supported Product Families:</span>
                    <div className="flex flex-wrap gap-1">
                      {selectedNode.raw.productFamilies.map((pf: string) => (
                        <span key={pf} className="px-1.5 py-0.5 rounded bg-blue-100/70 text-blue-800 text-[9.5px] font-bold">
                          {pf}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Distributor Entity Details */}
              {selectedNode.type === 'Distributor' && (
                <div className="space-y-2 bg-slate-50/80 p-3 rounded-xl border border-slate-200/70 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Distributor Name:</span>
                    <strong className="text-slate-900">{selectedNode.raw.name}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Customer Identifier:</span>
                    <span className="font-mono font-bold text-[#007041]">{selectedNode.raw.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Relationship Tier:</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900 text-white">
                      {selectedNode.raw.tier}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Operating Headquarters:</span>
                    <span className="text-slate-800">
                      {selectedNode.raw.city}, {selectedNode.raw.state}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Credit Standing:</span>
                    <span
                      className={`font-semibold ${
                        selectedNode.raw.creditHold ? 'text-red-600' : 'text-emerald-700'
                      }`}
                    >
                      {selectedNode.raw.creditHold ? 'On Credit Hold' : 'Good Standing'}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-slate-200/60">
                    <button
                      onClick={() => {
                        selectCustomer(selectedNode.raw.id);
                        setActiveView('customer-profile');
                      }}
                      className="w-full py-1.5 px-3 rounded-lg bg-[#007041] hover:bg-[#005a34] text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <span>Jump to Distributor 360 Profile</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Directly Connected Records (Pivot Navigation) */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Directly Connected Records ({directlyConnectedEntities.length})
                </h4>
                <span className="text-[10px] text-slate-400">Click to pivot</span>
              </div>

              <div className="space-y-1.5 max-h-56 overflow-y-auto divide-y divide-slate-100 pr-1">
                {directlyConnectedEntities.map(({ node: connNode, edge }) => (
                  <button
                    key={`${edge.id}-${connNode.id}`}
                    onClick={() => handleSelectNode(connNode.id)}
                    className="w-full py-2 px-2.5 rounded-lg hover:bg-slate-50 flex items-center justify-between text-left transition-colors cursor-pointer group"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: getNodeColor(connNode.type).fill }}
                        />
                        <span className="font-bold text-slate-900 group-hover:text-[#007041] transition-colors">
                          {connNode.label}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500 block pl-3.5">
                        {edge.label} ({edge.cardinality})
                      </span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#007041] transition-transform group-hover:translate-x-0.5" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
