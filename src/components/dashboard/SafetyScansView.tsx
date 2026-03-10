"use client";

import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle,
  FileText,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  ExternalLink
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function SafetyScansView() {
  const [selectedReport, setSelectedReport] = useState<any>(null);

  const stats = [
    { label: 'Total Scans Run', value: '247', icon: ShieldCheck, color: 'text-primary' },
    { label: 'Issues Detected', value: '18', icon: AlertTriangle, color: 'text-amber-500' },
    { label: 'Critical Blocked', value: '5', icon: ShieldAlert, color: 'text-destructive' },
  ];

  const scans = [
    { project: "Financial Report Analyzer", date: "Today, 09:14", issues: "3 critical", status: "Blocked", severity: "critical" },
    { project: "Sales Lead Automation", date: "Today, 08:50", issues: "2 warnings", status: "Passed", severity: "warning" },
    { project: "HR Policy RAG Bot", date: "Yesterday", issues: "Clean", status: "Passed", severity: "clean" },
    { project: "Customer Support Agent", date: "2 days ago", issues: "1 warning", status: "Passed", severity: "warning" },
    { project: "Invoice Processing", date: "3 days ago", issues: "2 critical", status: "Blocked", severity: "critical" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300 relative">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-foreground">Safety Scans</h1>
          <p className="text-sm text-muted-foreground">Automated audit logs and vulnerability detection.</p>
        </div>
        <Button className="h-9 gap-2 font-bold">
          <ShieldCheck className="w-4 h-4" /> Run New Scan
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className="bg-[#111118] border-white/5">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <h3 className="text-3xl font-bold">{stat.value}</h3>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="bg-[#111118] border border-white/5 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input className="pl-9 h-9 bg-transparent border-white/5 text-sm" placeholder="Filter by project..." />
          </div>
          <Button variant="outline" size="sm" className="h-8 gap-2 border-white/5">
            <Filter className="w-3.5 h-3.5" /> Filter
          </Button>
        </div>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/5 bg-white/[0.01]">
              <th className="px-6 py-4 font-semibold text-muted-foreground uppercase text-[10px] tracking-wider">Project</th>
              <th className="px-6 py-4 font-semibold text-muted-foreground uppercase text-[10px] tracking-wider">Scan Date</th>
              <th className="px-6 py-4 font-semibold text-muted-foreground uppercase text-[10px] tracking-wider">Issues</th>
              <th className="px-6 py-4 font-semibold text-muted-foreground uppercase text-[10px] tracking-wider">Status</th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {scans.map((scan, i) => (
              <tr key={i} className="hover:bg-white/[0.02] transition-colors group">
                <td className="px-6 py-4">
                  <span className="font-bold text-foreground">{scan.project}</span>
                </td>
                <td className="px-6 py-4 text-muted-foreground">{scan.date}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {scan.severity === 'critical' && <span className="text-destructive font-bold">🔴 {scan.issues}</span>}
                    {scan.severity === 'warning' && <span className="text-amber-500 font-bold">🟡 {scan.issues}</span>}
                    {scan.severity === 'clean' && <span className="text-green-500 font-bold">✅ Clean</span>}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <Badge variant="secondary" className={`${
                    scan.status === 'Passed' ? 'bg-green-500/10 text-green-500' : 'bg-destructive/10 text-destructive'
                  } border-none text-[10px] font-bold px-2.5`}>
                    {scan.status}
                  </Badge>
                </td>
                <td className="px-6 py-4 text-right">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 text-xs font-bold text-primary hover:bg-primary/10 transition-colors"
                    onClick={() => setSelectedReport(scan)}
                  >
                    {scan.severity === 'critical' ? 'Review' : 'View'}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Slide-in Report Detail Panel */}
      {selectedReport && (
        <>
          <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[100]" onClick={() => setSelectedReport(null)} />
          <div className="fixed right-0 top-0 h-full w-[420px] bg-[#111118] border-l border-primary/50 z-[101] shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col">
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-foreground">Scan Report</h3>
                <p className="text-xs text-muted-foreground">{selectedReport.project}</p>
              </div>
              <button onClick={() => setSelectedReport(null)} className="p-2 text-muted-foreground hover:text-white">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="flex items-center justify-between bg-white/[0.02] p-3 rounded-lg border border-white/5">
                <div className="text-center flex-1">
                  <p className="text-[10px] uppercase text-muted-foreground font-bold mb-1">Time</p>
                  <p className="text-sm font-bold">{selectedReport.date}</p>
                </div>
                <div className="w-[1px] h-8 bg-white/10" />
                <div className="text-center flex-1">
                  <p className="text-[10px] uppercase text-muted-foreground font-bold mb-1">Duration</p>
                  <p className="text-sm font-bold">1.4s</p>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Detected Issues</h4>
                
                <div className="space-y-3">
                  <div className="p-4 rounded-lg bg-destructive/5 border border-destructive/20 space-y-3">
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-destructive" />
                      <span className="text-xs font-bold text-destructive">CRITICAL — SQL Injection Risk</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      "Tool `db_query` concatenates raw user input. This allows arbitrary database execution."
                    </p>
                    <div className="flex items-center gap-2 text-[10px] font-mono bg-black/30 p-2 rounded">
                      <FileText className="w-3 h-3 text-muted-foreground" />
                      <span className="text-muted-foreground">agent_db.py:47</span>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="h-7 text-[10px] font-bold border-white/5 bg-transparent hover:bg-white/5">View Code</Button>
                      <Button size="sm" className="h-7 text-[10px] font-bold bg-destructive hover:bg-destructive/80">Apply Fix</Button>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-destructive/5 border border-destructive/20 space-y-3">
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-destructive" />
                      <span className="text-xs font-bold text-destructive">CRITICAL — Unbounded Loop</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      "No max_iterations set on analyst loop. Risk of infinite execution and cost spike."
                    </p>
                    <Button size="sm" className="h-7 text-[10px] font-bold bg-destructive hover:bg-destructive/80">Apply Fix</Button>
                  </div>

                  <div className="p-4 rounded-lg bg-amber-500/5 border border-amber-500/20 space-y-3">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                      <span className="text-xs font-bold text-amber-500">WARNING — Cost Inefficiency</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      "GPT-4o used for simple classification tasks. Suggest swapping to mini for 90% savings."
                    </p>
                    <Button size="sm" variant="outline" className="h-7 text-[10px] font-bold border-amber-500/30 text-amber-500 bg-transparent hover:bg-amber-500/10">Apply Fix</Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-white/5 bg-white/[0.01] grid grid-cols-2 gap-3">
              <Button variant="outline" className="h-9 text-xs font-bold border-white/10 hover:bg-white/5">Export PDF Report</Button>
              <Button variant="destructive" className="h-9 text-xs font-bold">Block Deployment</Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}