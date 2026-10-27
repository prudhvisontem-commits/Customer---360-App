/**
 * Acuity Brands Lighting - Customer Intelligence Hub
 * Interactive Geographic Network & Hierarchy Map
 * 
 * Visualizes distributor corporate headquarters, operating branch networks,
 * and parent-child hierarchy connection arcs across North America.
 */

import React, { useState, useMemo, useRef } from 'react';
import {
  MapPin,
  Building2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Layers,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Eye,
  SlidersHorizontal,
  ChevronRight,
  Navigation
} from 'lucide-react';
import { Account, RelationshipTier } from '../../data/types';
import { useData } from '../../context/DataContext';

interface DistributorGeoMapProps {
  currentAccount: Account;
  parentAccount: Account | null;
  associatedBranches: Account[];
  allAccounts: Account[];
  onSelectAccount?: (accountId: string) => void;
}

export const DistributorGeoMap: React.FC<DistributorGeoMapProps> = ({
  currentAccount,
  parentAccount,
  associatedBranches,
  allAccounts,
  onSelectAccount,
}) => {
  const { selectCustomer } = useData();
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [selectedPin, setSelectedPin] = useState<Account | null>(null);
  const [hoveredPin, setHoveredPin] = useState<Account | null>(null);
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [showNetworkNodes, setShowNetworkNodes] = useState<boolean>(true);
  const [showHierarchyArcs, setShowHierarchyArcs] = useState<boolean>(true);
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Determine root enterprise node (Parent HQ or Current Account if independent/parent)
  const rootNode = parentAccount || (currentAccount.parentId ? null : currentAccount);

  // Filter branches according to selected tier filter
  const displayedBranches = useMemo(() => {
    let list = associatedBranches;
    if (tierFilter !== 'all') {
      list = list.filter((b) => b.tier === tierFilter);
    }
    return list;
  }, [associatedBranches, tierFilter]);

  // Peer/other regional network distributor accounts (for broader geographic context)
  const peerAccounts = useMemo(() => {
    if (!showNetworkNodes) return [];
    const existingIds = new Set([
      currentAccount.id,
      ...(parentAccount ? [parentAccount.id] : []),
      ...associatedBranches.map((b) => b.id),
    ]);
    return allAccounts
      .filter((a) => !existingIds.has(a.id) && a.latitude && a.longitude)
      .slice(0, 35);
  }, [allAccounts, currentAccount, parentAccount, associatedBranches, showNetworkNodes]);

  // Coordinate projection helper: converts (lat, lng) to SVG (x, y)
  // Covers mainland US, southern Canada, and northern Mexico
  const project = (lat: number, lng: number) => {
    const minLng = -128;
    const maxLng = -66;
    const minLat = 24.5;
    const maxLat = 53.0;

    const baseWidth = 860;
    const baseHeight = 480;
    const padX = 50;
    const padY = 40;

    // Normal equirectangular with Mercator latitude correction
    const normX = (lng - minLng) / (maxLng - minLng);
    const normY = 1 - (lat - minLat) / (maxLat - minLat);

    const rawX = padX + normX * baseWidth;
    const rawY = padY + normY * baseHeight;

    const cx = 480;
    const cy = 280;

    const x = cx + (rawX - cx + pan.x) * zoom;
    const y = cy + (rawY - cy + pan.y) * zoom;

    return { x, y };
  };

  // Zoom / Pan handlers
  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.35, 3.5));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.35, 0.75));
  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setSelectedPin(null);
  };

  const handlePresetRegion = (regionName: string) => {
    switch (regionName) {
      case 'East':
        setZoom(1.8);
        setPan({ x: -280, y: 30 });
        break;
      case 'South':
        setZoom(1.8);
        setPan({ x: -120, y: -120 });
        break;
      case 'Midwest':
        setZoom(1.85);
        setPan({ x: -70, y: 80 });
        break;
      case 'West':
        setZoom(1.75);
        setPan({ x: 280, y: 40 });
        break;
      case 'Canada':
        setZoom(1.6);
        setPan({ x: -80, y: 220 });
        break;
      default:
        handleResetView();
        break;
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  // SVG curved arc between parent HQ and branch
  const renderArc = (parentLoc: { lat: number; lng: number }, branchLoc: { lat: number; lng: number }, key: string, isHighlighted: boolean) => {
    const start = project(parentLoc.lat, parentLoc.lng);
    const end = project(branchLoc.lat, branchLoc.lng);

    // Compute midpoint and perpendicular lift for curved flight-line effect
    const midX = (start.x + end.x) / 2;
    const midY = (start.y + end.y) / 2;
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const curveLift = Math.min(dist * 0.18, 55);

    const ctrlX = midX;
    const ctrlY = midY - curveLift;

    const pathD = `M ${start.x} ${start.y} Q ${ctrlX} ${ctrlY} ${end.x} ${end.y}`;

    return (
      <g key={key}>
        <path
          d={pathD}
          fill="none"
          stroke={isHighlighted ? '#04BC6F' : '#007041'}
          strokeWidth={isHighlighted ? 2.8 : 1.4}
          strokeOpacity={isHighlighted ? 0.95 : 0.45}
          strokeDasharray={isHighlighted ? 'none' : '4 3'}
          className="transition-all duration-200"
        />
        {/* Animated flow particle on highlighted connection */}
        {isHighlighted && (
          <circle r="3.5" fill="#04BC6F" className="animate-pulse">
            <animateMotion path={pathD} dur="2.4s" repeatCount="indefinite" />
          </circle>
        )}
      </g>
    );
  };

  // Color mapping by tier
  const getTierBadgeColor = (tier: RelationshipTier) => {
    switch (tier) {
      case 'Strategic Platinum':
        return 'bg-slate-900 text-white border-slate-700';
      case 'Premier Gold':
        return 'bg-amber-50 text-amber-800 border-amber-300';
      case 'Core Silver':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'Emerging Bronze':
        return 'bg-orange-50 text-orange-800 border-orange-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  const getPinColor = (tier: RelationshipTier, isCurrent: boolean) => {
    if (isCurrent) return '#04BC6F';
    switch (tier) {
      case 'Strategic Platinum':
        return '#0F172A';
      case 'Premier Gold':
        return '#D97706';
      case 'Core Silver':
        return '#2563EB';
      case 'Emerging Bronze':
        return '#EA580C';
      default:
        return '#007041';
    }
  };

  // Geographic footprint metrics
  const totalTargetSales = displayedBranches.reduce((sum, b) => sum + b.annualTargetSales, 0) +
    (rootNode ? rootNode.annualTargetSales : currentAccount.annualTargetSales);
  const coveredStates = Array.from(
    new Set([
      currentAccount.state,
      ...(parentAccount ? [parentAccount.state] : []),
      ...displayedBranches.map((b) => b.state),
    ])
  );

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden flex flex-col">
      {/* 1. Header Bar with Controls */}
      <div className="p-4 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-gradient-to-r from-slate-50/70 via-white to-slate-50/40">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#007041]/10 border border-[#007041]/20 flex items-center justify-center text-[#007041] shrink-0">
            <Navigation className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span>Geographic Hierarchy & Branch Network Map</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-[#007041] font-bold border border-emerald-200">
                ACTIVE GEOGRAPHY
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Interactive spatial view of distributor headquarters, regional operating branches, and parent-child reporting links.
            </p>
          </div>
        </div>

        {/* Action Controls & Region Switcher */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Preset Region Shortcuts */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
            {['All', 'East', 'South', 'Midwest', 'West', 'Canada'].map((reg) => (
              <button
                key={reg}
                onClick={() => handlePresetRegion(reg)}
                className="px-2 py-1 rounded-md text-[11px] font-medium text-slate-600 hover:text-slate-900 hover:bg-white transition-all cursor-pointer"
              >
                {reg}
              </button>
            ))}
          </div>

          {/* Zoom controls */}
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
              onClick={handleResetView}
              className="p-1 hover:bg-white rounded-md text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
              title="Reset View"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Toggles Dropdown / Filters */}
          <div className="flex items-center gap-1.5 text-xs">
            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 text-xs font-medium focus:ring-1 focus:ring-[#007041]"
            >
              <option value="all">All Branch Tiers</option>
              <option value="Strategic Platinum">Platinum</option>
              <option value="Premier Gold">Gold</option>
              <option value="Core Silver">Silver</option>
              <option value="Emerging Bronze">Bronze</option>
            </select>

            <button
              onClick={() => setShowHierarchyArcs(!showHierarchyArcs)}
              className={`px-2 py-1 rounded-lg border text-xs font-medium flex items-center gap-1 cursor-pointer transition-colors ${
                showHierarchyArcs
                  ? 'bg-emerald-50 border-emerald-200 text-[#007041]'
                  : 'bg-slate-50 border-slate-200 text-slate-600'
              }`}
              title="Toggle Hierarchy Lines"
            >
              <Layers className="w-3 h-3" />
              <span>Arcs</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Top Summary Metric Cards Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-slate-100 bg-slate-50/50 border-b border-slate-100 text-xs">
        <div className="p-3">
          <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">
            Total Network Branches
          </span>
          <div className="text-base font-extrabold text-slate-900 font-mono mt-0.5">
            {displayedBranches.length + (rootNode ? 1 : 0)}
          </div>
          <span className="text-[10.5px] text-slate-500">
            {rootNode ? '1 Corporate HQ + ' : ''}{displayedBranches.length} Branch Hubs
          </span>
        </div>

        <div className="p-3">
          <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">
            Geographic Coverage
          </span>
          <div className="text-base font-extrabold text-[#007041] font-mono mt-0.5">
            {coveredStates.length} States / Prov.
          </div>
          <span className="text-[10.5px] text-slate-500 truncate block">
            {coveredStates.slice(0, 5).join(', ')}{coveredStates.length > 5 ? ` +${coveredStates.length - 5}` : ''}
          </span>
        </div>

        <div className="p-3">
          <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">
            Total Network Target
          </span>
          <div className="text-base font-extrabold text-slate-900 font-mono mt-0.5">
            ${(totalTargetSales / 1000000).toFixed(1)}M
          </div>
          <span className="text-[10.5px] text-slate-500">
            Enterprise Annual Quota
          </span>
        </div>

        <div className="p-3">
          <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">
            Inspection Mode
          </span>
          <div className="text-xs font-bold text-slate-900 truncate mt-1">
            {currentAccount.name}
          </div>
          <span className="text-[10.5px] text-slate-500 font-mono">
            {currentAccount.id} ({currentAccount.city}, {currentAccount.state})
          </span>
        </div>
      </div>

      {/* 3. Interactive Map Canvas Container */}
      <div className="relative w-full h-[460px] sm:h-[500px] bg-slate-900 overflow-hidden select-none">
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />

        {/* SVG Drawing Canvas */}
        <svg
          ref={svgRef}
          className={`w-full h-full ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
          viewBox="0 0 960 560"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <defs>
            {/* Glow filter for active/selected node */}
            <filter id="emerald-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <filter id="hq-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* North American Continental Landmass Outlines & State Boundaries */}
          <g className="transition-transform duration-75">
            {/* Canada / Northern Landmass Background */}
            <path
              d="M 120 40 L 260 25 L 420 30 L 610 35 L 750 45 L 850 70 L 890 140 L 850 180 L 810 170 L 760 190 L 730 205 L 680 185 L 620 220 L 580 230 L 530 225 L 490 240 L 410 235 L 340 245 L 280 240 L 210 255 L 140 245 Z"
              fill="#1E293B"
              stroke="#334155"
              strokeWidth="1.2"
              opacity="0.8"
            />
            {/* United States Mainland */}
            <path
              d="M 140 245 L 210 255 L 280 240 L 340 245 L 410 235 L 490 240 L 530 225 L 580 230 L 620 220 L 680 185 L 730 205 L 770 215 L 825 240 L 845 285 L 820 330 L 780 375 L 795 440 L 765 470 L 740 460 L 715 410 L 670 415 L 635 445 L 595 450 L 540 455 L 500 480 L 450 435 L 420 425 L 360 425 L 310 435 L 255 410 L 225 390 L 175 395 L 145 355 L 130 290 Z"
              fill="#1E293B"
              stroke="#475569"
              strokeWidth="1.5"
            />
            {/* Regional Coastlines & Great Lakes */}
            {/* Lake Superior */}
            <ellipse cx="585" cy="210" rx="36" ry="16" fill="#0F172A" stroke="#334155" strokeWidth="1" />
            {/* Lake Michigan */}
            <ellipse cx="615" cy="245" rx="14" ry="32" fill="#0F172A" stroke="#334155" strokeWidth="1" />
            {/* Lake Huron */}
            <ellipse cx="650" cy="225" rx="20" ry="22" fill="#0F172A" stroke="#334155" strokeWidth="1" />
            {/* Lake Erie / Ontario */}
            <ellipse cx="690" cy="245" rx="28" ry="12" fill="#0F172A" stroke="#334155" strokeWidth="1" />

            {/* Approximate Regional Dividing Lat/Long Guidelines */}
            <path d="M 370 245 L 370 425" stroke="#334155" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.6" />
            <path d="M 540 230 L 540 455" stroke="#334155" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.6" />
            <path d="M 700 220 L 700 420" stroke="#334155" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.6" />
          </g>

          {/* Hierarchy Curved Arcs (Parent HQ -> Operating Branches) */}
          {showHierarchyArcs && rootNode && rootNode.latitude && rootNode.longitude && (
            <g className="hierarchy-arcs">
              {displayedBranches.map((branch) => {
                if (!branch.latitude || !branch.longitude) return null;
                const isSelected = selectedPin?.id === branch.id || currentAccount.id === branch.id;
                return renderArc(
                  { lat: rootNode.latitude!, lng: rootNode.longitude! },
                  { lat: branch.latitude, lng: branch.longitude },
                  `arc-${rootNode.id}-${branch.id}`,
                  isSelected
                );
              })}
            </g>
          )}

          {/* Background Network Nodes (Peers in the ecosystem) */}
          {showNetworkNodes && (
            <g className="network-nodes opacity-40">
              {peerAccounts.map((peer) => {
                if (!peer.latitude || !peer.longitude) return null;
                const pos = project(peer.latitude, peer.longitude);
                return (
                  <circle
                    key={`peer-${peer.id}`}
                    cx={pos.x}
                    cy={pos.y}
                    r="3.5"
                    fill="#64748B"
                    className="hover:opacity-100 transition-opacity cursor-pointer"
                    onMouseEnter={() => setHoveredPin(peer)}
                    onMouseLeave={() => setHoveredPin(null)}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPin(peer);
                    }}
                  />
                );
              })}
            </g>
          )}

          {/* Branch Pins */}
          <g className="branch-pins">
            {displayedBranches.map((branch) => {
              if (!branch.latitude || !branch.longitude) return null;
              const pos = project(branch.latitude, branch.longitude);
              const isCurrent = currentAccount.id === branch.id;
              const isSelected = selectedPin?.id === branch.id;
              const pinColor = getPinColor(branch.tier, isCurrent);

              return (
                <g
                  key={`branch-${branch.id}`}
                  transform={`translate(${pos.x}, ${pos.y})`}
                  className="cursor-pointer group"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPin(branch);
                  }}
                  onMouseEnter={() => setHoveredPin(branch)}
                  onMouseLeave={() => setHoveredPin(null)}
                >
                  {/* Active Ripple Animation on Current Account */}
                  {isCurrent && (
                    <circle r="14" fill="none" stroke="#04BC6F" strokeWidth="1.5" className="animate-ping opacity-75" />
                  )}

                  {/* Marker Base Halo */}
                  <circle
                    r={isCurrent || isSelected ? 10 : 7}
                    fill={pinColor}
                    fillOpacity={0.25}
                    stroke={pinColor}
                    strokeWidth={isSelected || isCurrent ? 2 : 1}
                  />

                  {/* Inner Pin Core */}
                  <circle
                    r={isCurrent || isSelected ? 6 : 4.5}
                    fill={pinColor}
                    stroke="#FFFFFF"
                    strokeWidth={1.5}
                  />

                  {/* Branch City Label */}
                  {(zoom >= 1.25 || isCurrent || isSelected) && (
                    <text
                      x="10"
                      y="3"
                      fill={isCurrent ? '#34D399' : '#E2E8F0'}
                      fontSize={isCurrent ? '11' : '9.5'}
                      fontWeight={isCurrent ? 'bold' : '600'}
                      fontFamily="system-ui, sans-serif"
                      className="pointer-events-none select-none drop-shadow-md"
                    >
                      {branch.city}
                    </text>
                  )}
                </g>
              );
            })}
          </g>

          {/* Corporate Parent HQ Node (Larger Shield Marker) */}
          {rootNode && rootNode.latitude && rootNode.longitude && (
            (() => {
              const hqPos = project(rootNode.latitude, rootNode.longitude);
              const isCurrent = currentAccount.id === rootNode.id;
              const isSelected = selectedPin?.id === rootNode.id;

              return (
                <g
                  transform={`translate(${hqPos.x}, ${hqPos.y})`}
                  className="cursor-pointer group"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPin(rootNode);
                  }}
                  onMouseEnter={() => setHoveredPin(rootNode)}
                  onMouseLeave={() => setHoveredPin(null)}
                >
                  {/* Outer Pulsing HQ Halo */}
                  <circle r="22" fill="#007041" fillOpacity="0.2" className="animate-pulse" />
                  <circle
                    r="15"
                    fill="#0F172A"
                    stroke="#04BC6F"
                    strokeWidth="2.5"
                    filter="url(#hq-glow)"
                  />
                  {/* HQ Diamond Center */}
                  <polygon
                    points="0,-6 6,0 0,6 -6,0"
                    fill="#04BC6F"
                  />
                  {/* HQ Flag Label */}
                  <g transform="translate(18, -12)" className="pointer-events-none select-none">
                    <rect
                      x="0"
                      y="0"
                      width="105"
                      height="24"
                      rx="4"
                      fill="#0F172A"
                      stroke="#04BC6F"
                      strokeWidth="1.2"
                      fillOpacity="0.95"
                    />
                    <text
                      x="8"
                      y="16"
                      fill="#34D399"
                      fontSize="10"
                      fontWeight="bold"
                      fontFamily="system-ui, sans-serif"
                    >
                      HQ: {rootNode.city}, {rootNode.state}
                    </text>
                  </g>
                </g>
              );
            })()
          )}
        </svg>

        {/* Hover Floating Tooltip */}
        {hoveredPin && !selectedPin && (
          <div
            className="absolute top-4 left-4 z-20 pointer-events-none bg-slate-900/95 backdrop-blur-md border border-slate-700 p-3 rounded-xl shadow-xl text-white text-xs max-w-xs space-y-1.5 animate-fadeIn"
          >
            <div className="flex items-center justify-between gap-2 border-b border-slate-700/80 pb-1.5">
              <span className="font-bold text-sm text-white truncate">{hoveredPin.name}</span>
              <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-[#34D399] font-bold border border-slate-700">
                {hoveredPin.id}
              </span>
            </div>
            <div className="text-[11px] text-slate-300">
              {hoveredPin.city}, {hoveredPin.state} • {hoveredPin.region} Region
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[10.5px]">
              <div>
                <span className="text-slate-400 block text-[9.5px]">Tier:</span>
                <span className="text-amber-300 font-bold">{hoveredPin.tier}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[9.5px]">Sales Target:</span>
                <span className="text-white font-bold">${(hoveredPin.annualTargetSales / 1000).toFixed(0)}k</span>
              </div>
            </div>
            <div className="text-[10px] text-slate-400 pt-1 flex items-center gap-1">
              <span>Controls:</span>
              <span className={hoveredPin.installedControlsFlag ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                {hoveredPin.installedControlsFlag ? 'nLight AIR Enabled' : 'Standard Lighting'}
              </span>
            </div>
          </div>
        )}

        {/* Selected Node Details Floating Overlay Drawer */}
        {selectedPin && (
          <div className="absolute top-4 right-4 z-30 bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-xl shadow-2xl p-4 text-xs w-72 sm:w-80 space-y-3 animate-slideIn">
            <div className="flex items-start justify-between gap-2 pb-2 border-b border-slate-100">
              <div>
                <span className="text-[9.5px] font-extrabold uppercase tracking-wider text-[#007041] block">
                  {selectedPin.parentId ? 'Operating Branch Hub' : 'Corporate Headquarters'}
                </span>
                <h4 className="font-extrabold text-sm text-slate-900 leading-snug">
                  {selectedPin.name}
                </h4>
                <span className="font-mono text-[10px] text-slate-500">
                  {selectedPin.id} • {selectedPin.city}, {selectedPin.state}
                </span>
              </div>
              <button
                onClick={() => setSelectedPin(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-md text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-1.5 text-[11px]">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Relationship Tier:</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getTierBadgeColor(selectedPin.tier)}`}>
                  {selectedPin.tier}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Commercial Territory:</span>
                <span className="font-medium text-slate-800 truncate max-w-[150px]">{selectedPin.territory}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Annual Target Sales:</span>
                <span className="font-mono font-bold text-slate-900">${selectedPin.annualTargetSales.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Credit Limit:</span>
                <span className="font-mono font-bold text-slate-900">${selectedPin.creditLimit.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Credit Administrative Status:</span>
                <span className={`font-semibold ${selectedPin.creditHold ? 'text-red-600' : 'text-emerald-700'}`}>
                  {selectedPin.creditHold ? 'On Credit Hold' : 'Good Standing'}
                </span>
              </div>
            </div>

            {/* Switch Account Action Button */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
              {currentAccount.id !== selectedPin.id ? (
                <button
                  onClick={() => {
                    if (onSelectAccount) {
                      onSelectAccount(selectedPin.id);
                    } else {
                      selectCustomer(selectedPin.id);
                    }
                    setSelectedPin(null);
                  }}
                  className="w-full py-1.5 px-3 rounded-lg bg-[#007041] hover:bg-[#005a34] text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <span>Select & Inspect Profile</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <div className="w-full py-1.5 px-3 rounded-lg bg-emerald-50 text-[#007041] font-bold text-xs flex items-center justify-center gap-1.5 border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Currently Viewing This Record</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Map Legend (Bottom Left) */}
        <div className="absolute bottom-3 left-3 bg-slate-900/85 backdrop-blur-xs border border-slate-700/80 rounded-lg p-2.5 text-white text-[10.5px] space-y-1.5 pointer-events-none">
          <span className="font-bold text-[9px] uppercase tracking-wider text-slate-400 block">
            Map Legend
          </span>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#0F172A] border-2 border-[#04BC6F] inline-block" />
            <span>Corporate Enterprise HQ</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#04BC6F] inline-block" />
            <span>Current Operating Account</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#D97706] inline-block" />
            <span>Operating Branch Hub</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-6 border-b border-[#007041] border-dashed inline-block" />
            <span>Parent-Child Hierarchy Arc</span>
          </div>
        </div>

        {/* Interactive Pan Helper note */}
        <div className="absolute bottom-3 right-3 text-[10px] text-slate-400 bg-slate-900/70 px-2 py-1 rounded border border-slate-700/60 pointer-events-none">
          Click and drag to pan • Scroll / buttons to zoom
        </div>
      </div>
    </div>
  );
};
