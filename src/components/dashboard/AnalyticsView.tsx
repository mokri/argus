"use client";

import React from 'react';
import { 
  BarChart3, 
  Zap, 
  ShieldCheck, 
  DollarSign, 
  TrendingDown,
  Calendar,
  ChevronDown
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function AnalyticsView() {
  const metrics = [
    { label: 'API Calls', value: '12,450', trend: '+18% vs last month', icon: Zap, color: 'text-primary' },
    { label: 'Avg Cost/Agent Run', value: '$0.032', trend: '-24% (saving)', icon: DollarSign, color: 'text-green-500' },
    { label: 'Safety Issues Caught', value: '47', trend: 'before production', icon: ShieldCheck, color: 'text-primary' },
    { label: 'Avg Compile Time', value: '1.8s', trend: 'p95 latency', icon: BarChart3, color: 'text-primary' },
  ];

  const scanActivity = [
    { day: 'Mon', val: 45 },
    { day: 'Tue', val: 65 },
    { day: 'Wed', val: 30 },
    { day: 'Thu', val: 85 },
    { day: 'Fri', val: 55 },
    { day: 'Sat', val: 20 },
    { day: 'Sun', val: 15 },
  ];

  const issuesByType = [
    { label: 'Prompt Injection', val: 18, max: 20 },
    { label: 'Loop Risks', val: 12, max: 20 },
    { label: 'Cost Issues', val: 10, max: 20 },
    { label: 'PII Leaks', val: 7, max: 20 },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Analytics & Cost Insights</h1>
        <Button variant="outline" className="h-9 gap-2 text-xs font-bold border-white/5 bg-[#111118]">
          <Calendar className="w-4 h-4" /> Last 30 days <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m, i) => (
          <Card key={i} className="bg-[#111118] border-white/5">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">{m.label}</p>
                <m.icon className={`w-4 h-4 ${m.color}`} />
              </div>
              <h3 className="text-2xl font-bold">{m.value}</h3>
              <p className={`text-[10px] font-bold ${m.trend.includes('-') ? 'text-green-500' : 'text-primary'}`}>{m.trend}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
        <Card className="lg:col-span-6 bg-[#111118] border-white/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Scan Activity</CardTitle>
          </CardHeader>
          <CardContent className="h-[240px] flex items-end justify-between px-8 pb-8 pt-4">
            {scanActivity.map((day, i) => (
              <div key={i} className="flex flex-col items-center gap-2 group flex-1">
                <div 
                  className="w-full max-w-[40px] bg-primary/20 hover:bg-primary transition-all rounded-t-sm relative cursor-pointer"
                  style={{ height: `${day.val}%` }}
                >
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-white text-black text-[10px] font-bold px-1 rounded transition-opacity">
                    {day.val}
                  </div>
                </div>
                <span className="text-[10px] text-muted-foreground font-bold">{day.day}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="lg:col-span-4 bg-[#111118] border-white/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Issues by Type</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-4">
            {issuesByType.map((issue, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between text-[11px] font-bold">
                  <span className="text-foreground">{issue.label}</span>
                  <span className="text-muted-foreground">{issue.val}</span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-1000 ease-out"
                    style={{ width: `${(issue.val / issue.max) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <TrendingDown className="w-5 h-5 text-green-500" />
          <h2 className="text-lg font-bold">Cost Optimization Suggestions</h2>
        </div>
        <div className="bg-[#111118] border border-white/5 rounded-xl overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="px-6 py-4 font-semibold text-muted-foreground text-xs uppercase">Project</th>
                <th className="px-6 py-4 font-semibold text-muted-foreground text-xs uppercase">Current Model</th>
                <th className="px-6 py-4 font-semibold text-muted-foreground text-xs uppercase">Suggested</th>
                <th className="px-6 py-4 font-semibold text-muted-foreground text-xs uppercase text-green-500">Est. Saving</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {[
                { p: "Financial Analyzer", cur: "GPT-4o", sug: "GPT-4o-mini", save: "$340/mo" },
                { p: "Support Bot", cur: "GPT-4o", sug: "Claude Haiku", save: "$210/mo" },
                { p: "Sales Agent", cur: "GPT-4o", sug: "GPT-4o-mini", save: "$180/mo" },
              ].map((row, i) => (
                <tr key={i} className="hover:bg-white/[0.01] transition-colors group">
                  <td className="px-6 py-4 font-bold">{row.p}</td>
                  <td className="px-6 py-4 text-muted-foreground">{row.cur}</td>
                  <td className="px-6 py-4 font-bold text-primary">{row.sug}</td>
                  <td className="px-6 py-4 font-bold text-green-500">{row.save}</td>
                  <td className="px-6 py-4 text-right">
                    <Button size="sm" className="h-8 text-[11px] font-bold px-4">Apply</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}