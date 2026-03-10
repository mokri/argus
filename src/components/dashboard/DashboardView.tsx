
"use client";

import React from 'react';
import { 
  FileText, 
  ShieldAlert, 
  Cpu, 
  TrendingUp,
  ArrowUpRight,
  MoreHorizontal,
  Shapes
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export function DashboardView() {
  const stats = [
    { label: 'Total Projects', value: '12', trend: '+2 this month', icon: FileText, color: 'text-primary' },
    { label: 'Safety Issues', value: '5', trend: '3 critical, 2 warnings', icon: ShieldAlert, color: 'text-amber-500' },
    { label: 'Agents Deployed', value: '28', trend: 'across 4 frameworks', icon: Cpu, color: 'text-primary' },
    { label: 'Cost Saved', value: '$4,200', trend: 'this month via optimizations', icon: TrendingUp, color: 'text-green-500' },
  ];

  const recentProjects = [
    { name: 'Sales Lead Automation', framework: 'CrewAI', agents: 3, lastScan: '2h ago', score: 82, status: 'warning' },
    { name: 'HR Policy RAG Bot', framework: 'LangGraph', agents: 2, lastScan: '5h ago', score: 98, status: 'healthy' },
    { name: 'Financial Report Analyzer', framework: 'LangChain', agents: 5, lastScan: '1h ago', score: 61, status: 'critical' },
    { name: 'Customer Support Agent', framework: 'AutoGen', agents: 4, lastScan: '1d ago', score: 95, status: 'healthy' },
  ];

  const alerts = [
    { type: 'critical', title: 'Prompt Injection Risk', project: 'Refund Agent · sales-bot-v2', time: '34 min ago' },
    { type: 'warning', title: 'Unbounded Loop Detected', project: 'Data Scraper · dev', time: '1h ago' },
    { type: 'warning', title: 'PII Leakage Risk', project: 'Customer Support · v3', time: '2h ago' },
    { type: 'critical', title: 'SQL Injection Vulnerability', project: 'Financial Analyzer · prod', time: '4h ago' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <Card key={i} className="bg-[#111118] border-white/5 relative overflow-hidden group hover:border-primary/20 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                <stat.icon className={`w-5 h-5 ${stat.color} opacity-80`} />
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="text-3xl font-bold text-foreground">{stat.value}</h3>
                <p className={`text-[11px] font-medium ${stat.trend.includes('critical') ? 'text-amber-500' : stat.trend.includes('Saved') ? 'text-green-500' : 'text-primary'}`}>
                  {stat.trend}
                </p>
              </div>
              <div className="absolute -right-2 -bottom-2 w-12 h-12 bg-primary/5 rounded-full blur-xl group-hover:bg-primary/10 transition-all" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground">Recent Projects</h2>
            <button className="text-xs font-medium text-primary hover:underline flex items-center gap-1">
              View All <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
          <div className="bg-[#111118] border border-white/5 rounded-lg overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02]">
                  <th className="px-6 py-3 font-semibold text-muted-foreground">Project</th>
                  <th className="px-6 py-3 font-semibold text-muted-foreground">Agents</th>
                  <th className="px-6 py-3 font-semibold text-muted-foreground">Last Scan</th>
                  <th className="px-6 py-3 font-semibold text-muted-foreground">Score</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recentProjects.map((project, i) => (
                  <tr key={i} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${
                          project.status === 'healthy' ? 'bg-green-500' : 
                          project.status === 'warning' ? 'bg-amber-500' : 'bg-destructive'
                        }`} />
                        <div>
                          <p className="font-bold text-foreground">{project.name}</p>
                          <p className="text-[11px] text-muted-foreground">{project.framework}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{project.agents} agents</td>
                    <td className="px-6 py-4 text-muted-foreground">{project.lastScan}</td>
                    <td className="px-6 py-4">
                      <Badge variant="outline" className={`${
                        project.score > 90 ? 'border-green-500/50 text-green-500' :
                        project.score > 75 ? 'border-amber-500/50 text-amber-500' : 'border-destructive/50 text-destructive'
                      } bg-transparent font-bold`}>
                        {project.score}/100
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-primary opacity-0 group-hover:opacity-100 transition-opacity text-xs font-medium">Open →</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-foreground">Recent Safety Alerts</h2>
            <div className="bg-[#111118] border border-white/5 rounded-lg p-2 space-y-1 max-h-[300px] overflow-y-auto">
              {alerts.map((alert, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-md hover:bg-white/5 transition-all group">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    alert.type === 'critical' ? 'bg-destructive/10 text-destructive' : 'bg-amber-500/10 text-amber-500'
                  }`}>
                    {alert.type === 'critical' ? '🔴' : '🟡'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-foreground truncate">{alert.title}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{alert.project}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[10px] text-muted-foreground mb-1">{alert.time}</p>
                    <button className="text-[10px] font-bold text-primary hover:underline">Review →</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 space-y-4 relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-lg font-bold text-white mb-2">Start something new</h3>
              <p className="text-sm text-primary-foreground/70 mb-6">Create a project, use a pattern, or import code directly.</p>
              <div className="grid grid-cols-1 gap-2">
                <Button variant="default" className="w-full justify-start gap-2 h-9 text-xs font-semibold shadow-xl">
                  <PlusIcon className="w-3.5 h-3.5" /> New Project
                </Button>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="secondary" className="w-full justify-start gap-2 h-9 text-xs font-semibold bg-white/5 border-white/10 hover:bg-white/10">
                    <Shapes className="w-3.5 h-3.5" /> Use Blueprint
                  </Button>
                  <Button variant="secondary" className="w-full justify-start gap-2 h-9 text-xs font-semibold bg-white/5 border-white/10 hover:bg-white/10">
                    <ArrowUpRight className="w-3.5 h-3.5" /> Import Code
                  </Button>
                </div>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
          </div>
        </div>
      </div>
    </div>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
    </svg>
  );
}
