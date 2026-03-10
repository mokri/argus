"use client";

import React from 'react';
import { 
  Plug, 
  CheckCircle2, 
  XCircle, 
  Key, 
  RefreshCw, 
  Trash2, 
  Copy,
  Plus
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export function IntegrationsView() {
  const integrations = [
    { name: "OpenAI API", status: "Connected", icon: "🤖", type: "LLM" },
    { name: "Anthropic Claude", status: "Connected", icon: "✨", type: "LLM" },
    { name: "GitHub", status: "Connected", icon: "🐙", type: "Source" },
    { name: "Pinecone", status: "Connected", icon: "🌲", type: "Vector DB" },
    { name: "Gmail API", status: "Not Connected", icon: "📧", type: "Action" },
    { name: "Slack", status: "Not Connected", icon: "💬", type: "Action" },
    { name: "Crunchbase MCP", status: "Connected", icon: "🔍", type: "Data" },
    { name: "Ollama (Local)", status: "Connected", icon: "📦", type: "LLM" },
    { name: "Redis", status: "Not Connected", icon: "🚀", type: "Memory" },
  ];

  return (
    <div className="space-y-12 animate-in fade-in duration-300">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-foreground">Integrations</h1>
            <p className="text-sm text-muted-foreground">Connect your stack and manage external credentials.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {integrations.map((item, i) => (
            <Card key={i} className="bg-[#111118] border-white/5 hover:border-primary/20 transition-all group">
              <CardContent className="p-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded bg-white/5 flex items-center justify-center text-xl">
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">{item.name}</h3>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">{item.type}</p>
                  </div>
                </div>
                <div className="text-right">
                  {item.status === 'Connected' ? (
                    <Badge variant="secondary" className="bg-green-500/10 text-green-500 border-none text-[9px] font-bold h-5">
                      ACTIVE
                    </Badge>
                  ) : (
                    <Button size="sm" variant="ghost" className="h-7 text-[10px] font-bold text-primary px-2 hover:bg-primary/10">
                      CONNECT
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-foreground">API Keys Vault</h2>
            <p className="text-sm text-muted-foreground">Manage service accounts and Aegis system tokens.</p>
          </div>
          <Button size="sm" className="h-8 gap-2 font-bold text-xs">
            <Plus className="w-3.5 h-3.5" /> Add New Key
          </Button>
        </div>

        <div className="bg-[#111118] border border-white/5 rounded-xl overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="px-6 py-4 font-semibold text-muted-foreground uppercase text-[10px]">Name</th>
                <th className="px-6 py-4 font-semibold text-muted-foreground uppercase text-[10px]">Key</th>
                <th className="px-6 py-4 font-semibold text-muted-foreground uppercase text-[10px]">Created</th>
                <th className="px-6 py-4 font-semibold text-muted-foreground uppercase text-[10px]">Last Used</th>
                <th className="px-6 py-4 font-semibold text-muted-foreground uppercase text-[10px]">Status</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {[
                { name: "Production Key", key: "sk-••••4f2a", created: "Jan 12, 2025", last: "2m ago", status: "Active" },
                { name: "Staging CI/CD", key: "sk-••••9v1z", created: "Feb 05, 2025", last: "1h ago", status: "Active" },
                { name: "Testing Token", key: "sk-••••3x7b", created: "Mar 01, 2025", last: "Never", status: "Inactive" },
              ].map((row, i) => (
                <tr key={i} className="hover:bg-white/[0.01] transition-colors group">
                  <td className="px-6 py-4 font-bold">{row.name}</td>
                  <td className="px-6 py-4 font-mono text-[11px] text-muted-foreground tracking-tighter">{row.key}</td>
                  <td className="px-6 py-4 text-muted-foreground text-xs">{row.created}</td>
                  <td className="px-6 py-4 text-muted-foreground text-xs">{row.last}</td>
                  <td className="px-6 py-4">
                    <Badge variant="outline" className={`text-[9px] font-bold ${row.status === 'Active' ? 'text-green-500 border-green-500/30' : 'text-muted-foreground border-white/10'}`}>
                      {row.status.toUpperCase()}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-white"><Copy className="w-3.5 h-3.5" /></Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-white"><RefreshCw className="w-3.5 h-3.5" /></Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:bg-destructive/10"><Trash2 className="w-3.5 h-3.5" /></Button>
                    </div>
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