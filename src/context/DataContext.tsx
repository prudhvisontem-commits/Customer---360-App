/**
 * Acuity Brands Lighting - Customer 360 Intelligence
 * Central Data & Navigation Context
 */

import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import {
  SyntheticDataset,
  GlobalFilterState,
  Account
} from '../data/types';
import { getSyntheticDataset } from '../data/generator';
import {
  applyGlobalFilters,
  calculateExecutiveKPIs,
  FilteredDataBundle
} from '../data/metricsEngine';

export type ActivePersonaView = 'landing' | 'sales' | 'service' | 'finance' | 'leadership' | 'customer-profile' | 'agent-order-facility-distributor' | 'glossary';

interface DataContextType {
  dataset: SyntheticDataset;
  filters: GlobalFilterState;
  setFilter: <K extends keyof GlobalFilterState>(key: K, value: GlobalFilterState[K]) => void;
  resetFilters: () => void;
  activeFiltersCount: number;
  filteredData: FilteredDataBundle;
  executiveKPIs: ReturnType<typeof calculateExecutiveKPIs>;
  activeView: ActivePersonaView;
  setActiveView: (view: ActivePersonaView) => void;
  selectedAccountId: string;
  selectedAccount: Account | null;
  selectCustomer: (accountId: string) => void;
  isAiDrawerOpen: boolean;
  setIsAiDrawerOpen: (open: boolean) => void;
  aiSuggestedPrompt: string | null;
  setAiSuggestedPrompt: (prompt: string | null) => void;
  openAiWithPrompt: (prompt: string) => void;
  isGovernanceModalOpen: boolean;
  setIsGovernanceModalOpen: (open: boolean) => void;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
}

const defaultFilters: GlobalFilterState = {
  reportingPeriod: 'FY2026 YTD',
  parentAccountId: 'all',
  accountId: 'all',
  segment: 'all',
  channel: 'all',
  region: 'all',
  accountOwner: 'all',
  productFamily: 'all',
  category: 'all',
  opportunityStage: 'all',
  serviceSeverity: 'all',
  riskStatus: 'all',
  agentId: 'all',
  salesOrderNumber: 'all',
  orderStatus: 'all',
};

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dataset = useMemo(() => getSyntheticDataset(), []);
  const [filters, setFilters] = useState<GlobalFilterState>(defaultFilters);
  const [activeView, setActiveView] = useState<ActivePersonaView>('landing');
  const [selectedAccountId, setSelectedAccountId] = useState<string>('ABL-CUST-1008'); // Default to notable account
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState<boolean>(false);
  const [aiSuggestedPrompt, setAiSuggestedPrompt] = useState<string | null>(null);
  const [isGovernanceModalOpen, setIsGovernanceModalOpen] = useState<boolean>(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(prev => !prev);
  };

  const setFilter = <K extends keyof GlobalFilterState>(key: K, value: GlobalFilterState[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters(defaultFilters);
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.reportingPeriod !== 'FY2026 YTD') count++;
    if (filters.parentAccountId !== 'all') count++;
    if (filters.accountId !== 'all') count++;
    if (filters.segment !== 'all') count++;
    if (filters.channel !== 'all') count++;
    if (filters.region !== 'all') count++;
    if (filters.accountOwner !== 'all') count++;
    if (filters.productFamily !== 'all') count++;
    if (filters.category !== 'all') count++;
    if (filters.opportunityStage !== 'all') count++;
    if (filters.serviceSeverity !== 'all') count++;
    if (filters.riskStatus !== 'all') count++;
    if (filters.agentId && filters.agentId !== 'all') count++;
    if (filters.salesOrderNumber && filters.salesOrderNumber !== 'all') count++;
    if (filters.orderStatus && filters.orderStatus !== 'all') count++;
    return count;
  }, [filters]);

  const filteredData = useMemo(() => {
    return applyGlobalFilters(dataset, filters);
  }, [dataset, filters]);

  const executiveKPIs = useMemo(() => {
    return calculateExecutiveKPIs(filteredData, dataset, filters);
  }, [filteredData, dataset, filters]);

  const selectedAccount = useMemo(() => {
    return dataset.accounts.find(a => a.id === selectedAccountId) || dataset.accounts[0] || null;
  }, [dataset.accounts, selectedAccountId]);

  const selectCustomer = (accId: string) => {
    setSelectedAccountId(accId);
    setActiveView('customer-profile');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openAiWithPrompt = (prompt: string) => {
    setAiSuggestedPrompt(prompt);
    setIsAiDrawerOpen(true);
  };

  return (
    <DataContext.Provider
      value={{
        dataset,
        filters,
        setFilter,
        resetFilters,
        activeFiltersCount,
        filteredData,
        executiveKPIs,
        activeView,
        setActiveView,
        selectedAccountId,
        selectedAccount,
        selectCustomer,
        isAiDrawerOpen,
        setIsAiDrawerOpen,
        aiSuggestedPrompt,
        setAiSuggestedPrompt,
        openAiWithPrompt,
        isGovernanceModalOpen,
        setIsGovernanceModalOpen,
        isSidebarCollapsed,
        setIsSidebarCollapsed,
        toggleSidebar,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export function useData(): DataContextType {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
