"use client";

import React, { useState } from 'react';
import { 
  Grid2X2, 
  List, 
  Search, 
  Filter, 
  Plus, 
  MoreVertical,
  Cpu
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export function ProjectsView() {
  const [view, setView] = useState<'grid' | 'list'>('grid');
  
  const projects = [
    { name: "Sales Lead Automation", framework: "CrewAI", agents: 3, lastEdited: "2h ago", score: 82, status: "warning" },
    { name: "HR Policy RAG Bot", framework: "LangGraph", agents: 2, lastEdited: "5h ago", score: 98, status: "healthy" },
    { name: "Financial Report Analyzer", framework: "LangChain", agents: 5, lastEdited: "1h ago", score: 61, status: "critical" },
    { name: "Customer Support Agent", framework: "AutoGen", agents: 4, lastEdited: "1d ago", score: 95, status: "healthy" },
    { name: "Code Review Assistant", framework: "LangGraph", agents: 2, lastEdited: "3d ago", score: 88, status: "healthy" },
    { name: "Invoice Processing", framework: "CrewAI", agents: 3, lastEdited: "1w ago", score: 74, status: "warning" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-foreground">My Projects</h1>
          <Badge variant="secondary" className="bg-white/5 text-muted-foreground hover:bg-white/10">12</Badge>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input className="pl-9 h-9 bg-[#111118] border-white/5 text-sm" placeholder="Search projects..." />
          </div>
          <Button variant="outline" size="icon" className="h-9 w-9 bg-[#111118] border-white/5">
            <Filter className="w-4 h-4" />
          </Button>
          <div className="bg-white/5 rounded-md p-1 flex">
            <button 
              onClick={() => setView('grid')}
              className={`p-1 rounded ${view === 'grid' ? 'bg-primary shadow text-white' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <Grid2X2 className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setView('list')}
              className={`p-1 rounded ${view === 'list' ? 'bg-primary shadow text-white' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
          <Button size="sm" className="h-9 font-semibold gap-2">
            <Plus className="w-4 h-4" /> New Project
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {['All', 'Active', 'Needs Review', 'Archived'].map((f) => (
          <Badge key={f} variant={f === 'All' ? 'default' : 'outline'} className="cursor-pointer px-4 py-1.5 rounded-full border-white/5 hover:border-primary/50 transition-colors">
            {f}
          </Badge>
        ))}
        <div className="h-4 w-[1px] bg-white/10 mx-2" />
        {['All', 'LangChain', 'CrewAI', 'LangGraph', 'AutoGen'].map((f) => (
          <Badge key={f} variant="outline" className="cursor-pointer px-4 py-1.5 rounded-full border-white/5 bg-white/[0.02] hover:bg-white/10 transition-colors text-muted-foreground">
            {f}
          </Badge>
        ))}
      </div>

      {view === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((p, i) => (
            <div key={i} className="bg-[#111118] border border-white/5 rounded-xl p-6 space-y-4 hover:border-primary/20 transition-all group relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div className={`w-3 h-3 rounded-full ${
                  p.status === 'healthy' ? 'bg-green-500' : 
                  p.status === 'warning' ? 'bg-amber-500' : 'bg-destructive'
                } shadow-[0_0_8px_rgba(34,197,94,0.3)]`} />
                <Badge variant="secondary" className="bg-white/5 text-[10px] uppercase tracking-wider font-bold h-5">
                  {p.framework}
                </Badge>
              </div>

              <div>
                <h3 className="text-xl font-bold text-foreground mb-1 group-hover:text-primary transition-colors">{p.name}</h3>
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Cpu className="w-3.5 h-3.5" /> {p.agents} agents · Last edited {p.lastEdited}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center text-[11px] mb-1">
                  <span className="text-muted-foreground font-medium">Safety Score</span>
                  <span className={`font-bold ${
                    p.score > 90 ? 'text-green-500' : 
                    p.score > 75 ? 'text-amber-500' : 'text-destructive'
                  }`}>{p.score}/100</span>
                </div>
                <Progress value={p.score} className={`h-1.5 ${
                  p.score > 90 ? '[&>div]:bg-green-500' : 
                  p.score > 75 ? '[&>div]:bg-amber-500' : '[&>div]:bg-destructive'
                }`} />
              </div>

              <div className="pt-4 flex items-center gap-2">
                <Button size="sm" variant="secondary" className="h-8 text-xs font-bold flex-1 bg-white/5 hover:bg-primary/10 hover:text-primary border-white/5">
                  Open
                </Button>
                <Button size="sm" variant="secondary" className="h-8 text-xs font-bold flex-1 bg-white/5 hover:bg-primary/10 hover:text-primary border-white/5">
                  Scan
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-[#111118] border-white/5 text-foreground">
                    <DropdownMenuItem>Rename</DropdownMenuItem>
                    <DropdownMenuItem>Duplicate</DropdownMenuItem>
                    <DropdownMenuItem>Export</DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-[#111118] border border-white/5 rounded-xl overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="px-6 py-4 font-semibold text-muted-foreground">Name</th>
                <th className="px-6 py-4 font-semibold text-muted-foreground">Framework</th>
                <th className="px-6 py-4 font-semibold text-muted-foreground">Agents</th>
                <th className="px-6 py-4 font-semibold text-muted-foreground">Safety Score</th>
                <th className="px-6 py-4 font-semibold text-muted-foreground">Last Scan</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {projects.map((p, i) => (
                <tr key={i} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${
                        p.status === 'healthy' ? 'bg-green-500' : 
                        p.status === 'warning' ? 'bg-amber-500' : 'bg-destructive'
                      }`} />
                      <span className="font-bold">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4"><Badge variant="secondary" className="bg-white/5">{p.framework}</Badge></td>
                  <td className="px-6 py-4 text-muted-foreground">{p.agents} agents</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3 min-w-[120px]">
                      <Progress value={p.score} className="h-1 flex-1" />
                      <span className="text-[11px] font-bold text-muted-foreground">{p.score}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{p.lastEdited}</td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-primary font-bold text-xs opacity-0 group-hover:opacity-100 transition-opacity">Open →</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}