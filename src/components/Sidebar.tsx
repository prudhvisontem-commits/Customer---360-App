/**
 * Acuity Brands Lighting - Collapsible Vertical Navigation Sidebar
 * Houses enterprise brand identity and primary persona navigation panels.
 * Supports smooth expanded (w-64) and collapsed (w-16) modes with clear toggle controls.
 */

import React from 'react';
import {
  Building2,
  TrendingUp,
  Headphones,
  DollarSign,
  Briefcase,
  UserCheck,
  Network,
  ShieldCheck,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';
import { useData, ActivePersonaView } from '../context/DataContext';

export const Sidebar: React.FC = () => {
  const { activeView, setActiveView, isSidebarCollapsed, toggleSidebar } = useData();

  const navItems: { id: ActivePersonaView; label: string; icon: React.ElementType }[] = [
    { id: 'landing', label: 'Business Overview', icon: Building2 },
    { id: 'sales', label: 'Sales Intelligence', icon: TrendingUp },
    { id: 'service', label: 'Service Intelligence', icon: Headphones },
    { id: 'finance', label: 'Finance & Credit', icon: DollarSign },
    { id: 'leadership', label: 'Leadership', icon: Briefcase },
    { id: 'customer-profile', label: 'Distributor Profile', icon: UserCheck },
    { id: 'agent-order-facility-distributor', label: 'Order Traceability', icon: Network },
  ];

  return (
    <aside
      className={`bg-slate-900 text-slate-300 flex flex-col shrink-0 border-r border-slate-800 min-h-screen select-none transition-all duration-300 ease-in-out ${
        isSidebarCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Brand & Wordmark + Toggle */}
      <div className={`border-b border-slate-800 flex items-center transition-all ${
        isSidebarCollapsed ? 'p-3 flex-col gap-2 justify-center' : 'p-4 justify-between gap-2'
      }`}>
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-[#007041] flex items-center justify-center text-white font-extrabold text-sm shadow-md shrink-0">
            ABL
          </div>
          {!isSidebarCollapsed && (
            <div className="min-w-0 flex-1">
              <div className="text-sm font-extrabold text-white tracking-tight leading-none truncate">
                ACUITY BRANDS
              </div>
              <div className="text-[9px] font-semibold text-[#04BC6F] tracking-tight leading-none mt-1 whitespace-nowrap">
                Customer Intelligence Hub
              </div>
            </div>
          )}
        </div>

        {/* Toggle Button */}
        <button
          type="button"
          onClick={toggleSidebar}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors focus:outline-hidden cursor-pointer shrink-0"
          title={isSidebarCollapsed ? 'Expand sidebar navigation' : 'Collapse sidebar navigation'}
          aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isSidebarCollapsed ? (
            <PanelLeftOpen className="w-4 h-4 text-[#04BC6F]" />
          ) : (
            <PanelLeftClose className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Nav Section Label (expanded only) */}
      {!isSidebarCollapsed ? (
        <div className="px-5 pt-4 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Navigation
        </div>
      ) : (
        <div className="py-2" />
      )}

      {/* Vertical Navigation Items */}
      <nav className="flex-1 px-2 space-y-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              title={isSidebarCollapsed ? item.label : undefined}
              className={`w-full flex items-center rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer ${
                isSidebarCollapsed
                  ? 'justify-center p-2.5'
                  : 'justify-between px-3 py-2.5'
              } ${
                isActive
                  ? 'bg-[#007041] text-white shadow-xs font-bold'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className={`flex items-center gap-3 truncate ${isSidebarCollapsed ? 'justify-center' : ''}`}>
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? 'text-white' : 'text-slate-400'
                  }`}
                />
                {!isSidebarCollapsed && <span className="truncate">{item.label}</span>}
              </div>
            </button>
          );
        })}
      </nav>

      {/* Bottom Footer Details */}
      <div className={`border-t border-slate-800 text-[10.5px] text-slate-500 transition-all ${
        isSidebarCollapsed ? 'p-3 flex justify-center' : 'p-4 flex items-center justify-between'
      }`}>
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-[#04BC6F] shrink-0" />
          {!isSidebarCollapsed && <span>Governed BI POC</span>}
        </div>
        {!isSidebarCollapsed && <span className="font-mono text-[10px]">v2.6</span>}
      </div>
    </aside>
  );
};
