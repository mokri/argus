"use client";

import React from 'react';
import { 
  Home, 
  Folder, 
  Shapes, 
  ShieldCheck, 
  Cpu, 
  Plug, 
  BarChart3, 
  Users, 
  Bell, 
  Settings, 
  ChevronDown,
  BookOpen
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

export type ViewType = 'dashboard' | 'projects' | 'blueprints' | 'safety' | 'compiler' | 'integrations' | 'analytics' | 'settings';

interface SidebarProps {
  activeView: ViewType;
  setActiveView: (view: ViewType) => void;
}

export function Sidebar({ activeView, setActiveView }: SidebarProps) {
  const navGroups = [
    {
      label: 'MAIN',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: Home },
        { id: 'projects', label: 'Projects', icon: Folder },
        { id: 'blueprints', label: 'Blueprints', icon: Shapes },
        { id: 'safety', label: 'Safety Scans', icon: ShieldCheck, badge: '2 issues' },
      ]
    },
    {
      label: 'TOOLS',
      items: [
        { id: 'compiler', label: 'Framework Compiler', icon: Cpu },
        { id: 'integrations', label: 'Integrations', icon: Plug },
        { id: 'analytics', label: 'Analytics', icon: BarChart3 },
      ]
    },
    {
      label: 'TEAM',
      items: [
        { id: 'members', label: 'Members', icon: Users, disabled: true },
        { id: 'notifications', label: 'Notifications', icon: Bell, badge: '3', disabled: true },
        { id: 'settings', label: 'Settings', icon: Settings },
      ]
    }
  ];

  return (
    <aside className="w-[240px] bg-[#0D0D14] border-r border-white/5 flex flex-col h-screen sticky top-0">
      {/* Workspace Switcher */}
      <div className="p-4">
        <button className="w-full flex items-center justify-between px-3 py-2 rounded-md hover:bg-white/5 transition-colors group">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">
              AC
            </div>
            <span className="text-sm font-medium text-foreground">Acme Corp</span>
          </div>
          <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-foreground" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-6">
        {navGroups.map((group) => (
          <div key={group.label} className="space-y-1">
            <h3 className="px-3 text-[10px] font-bold text-muted-foreground tracking-wider mb-2">
              {group.label}
            </h3>
            {group.items.map((item) => (
              <button
                key={item.id}
                onClick={() => !item.disabled && setActiveView(item.id as ViewType)}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2 text-sm rounded-md transition-all duration-150 group",
                  activeView === item.id 
                    ? "bg-primary/10 text-white border-l-[3px] border-primary" 
                    : "text-muted-foreground hover:bg-primary/5 hover:text-foreground",
                  item.disabled && "opacity-50 cursor-not-allowed"
                )}
              >
                <div className="flex items-center gap-3">
                  <item.icon className={cn(
                    "w-4 h-4",
                    activeView === item.id ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                  )} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <Badge variant={item.id === 'safety' ? 'destructive' : 'secondary'} className="text-[10px] h-4 px-1.5 min-w-[18px] flex items-center justify-center">
                    {item.badge}
                  </Badge>
                )}
              </button>
            ))}
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-white/5 space-y-4">
        <div className="p-3 bg-white/5 rounded-lg space-y-3">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-muted-foreground">API Scans this month</span>
            <span className="text-foreground font-medium">67%</span>
          </div>
          <Progress value={67} className="h-1.5" />
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-muted-foreground">670 / 1,000 scans</span>
            <button className="text-primary hover:underline">Upgrade Plan →</button>
          </div>
        </div>

        <div className="space-y-2">
          <button className="w-full flex items-center gap-3 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Documentation</span>
          </button>
          <div className="px-3 text-[10px] text-muted-foreground">
            Version v0.4.2-beta
          </div>
        </div>
      </div>
    </aside>
  );
}