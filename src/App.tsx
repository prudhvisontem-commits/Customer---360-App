/**
 * Acuity Brands Lighting - Customer 360 Intelligence
 * Main Application Component with Vertical Sidebar Navigation,
 * Default Filter Showcase, and Integrated Glossary.
 */

import React from 'react';
import { DataProvider, useData } from './context/DataContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { FilterDrawer } from './components/FilterDrawer';
import { MetricGovernanceModal } from './components/MetricGovernanceModal';
import { AiAssistantDrawer } from './components/ai/AiAssistantDrawer';
import { ExecutiveLandingView } from './views/ExecutiveLandingView';
import { SalesIntelligenceView } from './views/SalesIntelligenceView';
import { ServiceIntelligenceView } from './views/ServiceIntelligenceView';
import { FinanceIntelligenceView } from './views/FinanceIntelligenceView';
import { LeadershipIntelligenceView } from './views/LeadershipIntelligenceView';
import { CustomerProfileView } from './views/CustomerProfileView';
import { AgentOrderFacilityDistributorView } from './views/AgentOrderFacilityDistributorView';
import { GlossaryView } from './views/GlossaryView';

const MainContent: React.FC = () => {
  const { activeView } = useData();

  return (
    <div className="min-h-screen flex bg-[#F8F9FA] text-[#1E293B]">
      {/* Vertical Navigation Side Panel */}
      <Sidebar />

      {/* Main Content Workspace */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Minimal Header */}
        <Header />

        {/* Filters Showcased by Default (Hidden on Glossary page) */}
        {activeView !== 'glossary' && <FilterDrawer />}

        {/* Primary View Workspace */}
        <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-5">
          {activeView === 'landing' && <ExecutiveLandingView />}
          {activeView === 'sales' && <SalesIntelligenceView />}
          {activeView === 'service' && <ServiceIntelligenceView />}
          {activeView === 'finance' && <FinanceIntelligenceView />}
          {activeView === 'leadership' && <LeadershipIntelligenceView />}
          {activeView === 'customer-profile' && <CustomerProfileView />}
          {activeView === 'agent-order-facility-distributor' && <AgentOrderFacilityDistributorView />}
          {activeView === 'glossary' && <GlossaryView />}
        </main>

        {/* Enterprise Metric Governance Dictionary Modal */}
        <MetricGovernanceModal />

        {/* Floating Persona-Aware Gemini AI Assistant */}
        <AiAssistantDrawer />

        {/* Corporate BI Footer */}
        <footer className="bg-white border-t border-slate-200 mt-auto py-6 text-xs text-slate-500">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400">
            <div>
              <strong className="text-slate-700">ACUITY BRANDS LIGHTING</strong> • Customer Intelligence Hub POC • All data synthetic
            </div>
            <div>
              Lithonia Lighting® • Holophane® • Gotham® • Mark™ • Juno® • Peerless® • nLight® • Atrius®
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <DataProvider>
      <MainContent />
    </DataProvider>
  );
}
