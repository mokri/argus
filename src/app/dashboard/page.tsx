
"use client";

import React, { useState } from 'react';
import { Sidebar, ViewType } from '@/components/dashboard/Sidebar';
import { TopBar } from '@/components/dashboard/TopBar';
import { DashboardView } from '@/components/dashboard/DashboardView';
import { ProjectsView } from '@/components/dashboard/ProjectsView';
import { BlueprintsView } from '@/components/dashboard/BlueprintsView';
import { SafetyScansView } from '@/components/dashboard/SafetyScansView';
import { CompilerView } from '@/components/dashboard/CompilerView';
import { IntegrationsView } from '@/components/dashboard/IntegrationsView';
import { AnalyticsView } from '@/components/dashboard/AnalyticsView';
import { SettingsView } from '@/components/dashboard/SettingsView';
import { CommandPalette } from '@/components/dashboard/CommandPalette';
import { NotificationsPanel } from '@/components/dashboard/NotificationsPanel';
import { NewProjectModal } from '@/components/dashboard/NewProjectModal';

export default function DashboardPage() {
  const [activeView, setActiveView] = useState<ViewType>('dashboard');
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);

  const getBreadcrumb = () => {
    switch (activeView) {
      case 'dashboard': return 'My Dashboard';
      case 'projects': return 'My Projects';
      case 'blueprints': return 'Blueprint Library';
      case 'safety': return 'Safety Scans';
      case 'compiler': return 'Framework Compiler';
      case 'integrations': return 'Integrations';
      case 'analytics': return 'Analytics';
      case 'settings': return 'Settings';
      default: return 'AegisCore';
    }
  };

  const renderView = () => {
    switch (activeView) {
      case 'dashboard': return <DashboardView />;
      case 'projects': return <ProjectsView />;
      case 'blueprints': return <BlueprintsView />;
      case 'safety': return <SafetyScansView />;
      case 'compiler': return <CompilerView />;
      case 'integrations': return <IntegrationsView />;
      case 'analytics': return <AnalyticsView />;
      case 'settings': return <SettingsView />;
      default: return <DashboardView />;
    }
  };

  return (
    <div className="flex h-screen bg-[#F7F7F4] text-foreground font-sans overflow-hidden">
      <Sidebar activeView={activeView} setActiveView={setActiveView} />

      <div className="flex-1 flex flex-col min-w-0">
        <TopBar
          breadcrumb={getBreadcrumb()}
          onSearchClick={() => setIsCommandPaletteOpen(true)}
          onNewProject={() => setIsNewProjectModalOpen(true)}
          onToggleNotifications={() => setIsNotificationsOpen(true)}
        />

        <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="max-w-[1400px] mx-auto">
            {renderView()}
          </div>
        </main>
      </div>

      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
      />

      <NotificationsPanel
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />

      <NewProjectModal
        isOpen={isNewProjectModalOpen}
        onClose={() => setIsNewProjectModalOpen(false)}
      />
    </div>
  );
}
