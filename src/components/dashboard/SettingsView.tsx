"use client";

import React, { useState } from 'react';
import { 
  User, 
  Users, 
  Lock, 
  CreditCard, 
  Bell, 
  Key,
  Globe,
  Plus,
  MoreHorizontal
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';

export function SettingsView() {
  const [activeTab, setActiveTab] = useState('general');

  const tabs = [
    { id: 'general', label: 'General', icon: Globe },
    { id: 'members', label: 'Team & Members', icon: Users },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'api', label: 'API Access', icon: Key },
  ];

  return (
    <div className="flex gap-10 animate-in fade-in duration-300">
      <aside className="w-48 shrink-0 flex flex-col gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-all ${
              activeTab === tab.id ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </aside>

      <main className="flex-1 max-w-2xl space-y-10">
        {activeTab === 'general' && (
          <div className="space-y-8">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-foreground">General Settings</h2>
              <p className="text-sm text-muted-foreground">Manage your workspace identity and defaults.</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="ws-name">Workspace Name</Label>
                <Input id="ws-name" defaultValue="Acme Corp" className="bg-[#111118] border-white/5" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ws-slug">Workspace Slug</Label>
                <div className="flex gap-2">
                  <Input id="ws-slug" defaultValue="acme-corp" className="bg-[#111118] border-white/5" readOnly />
                  <Button variant="outline" className="border-white/5 hover:bg-white/5">Copy</Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Default Framework</Label>
                  <Select defaultValue="langgraph">
                    <SelectTrigger className="bg-[#111118] border-white/5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#111118] border-white/10">
                      <SelectItem value="langgraph">LangGraph</SelectItem>
                      <SelectItem value="crewai">CrewAI</SelectItem>
                      <SelectItem value="langchain">LangChain</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Default LLM</Label>
                  <Select defaultValue="gpt-4o-mini">
                    <SelectTrigger className="bg-[#111118] border-white/5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#111118] border-white/10">
                      <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                      <SelectItem value="gpt-4o-mini">GPT-4o-mini</SelectItem>
                      <SelectItem value="claude-3-5">Claude 3.5 Sonnet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-white/5">
                <h3 className="text-sm font-bold text-foreground">Safety Scan Mode</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
                    <div className="w-4 h-4 rounded-full border-4 border-primary mt-1" />
                    <div>
                      <p className="text-sm font-bold text-foreground">Block deployment on critical issues</p>
                      <p className="text-[11px] text-muted-foreground">Stops agents from being pushed if critical vulnerabilities are detected (Recommended).</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
                    <div className="w-4 h-4 rounded-full border border-white/20 mt-1" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Warn only</p>
                      <p className="text-[11px] text-muted-foreground">Alerts admins but allows deployment to proceed.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Theme</Label>
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
                  <span className="text-sm font-medium">Dark Mode</span>
                  <Badge variant="outline" className="text-[10px] text-primary border-primary/30">LOCKED</Badge>
                </div>
                <p className="text-[10px] text-muted-foreground italic">Light mode coming soon.</p>
              </div>

              <div className="pt-6">
                <Button className="font-bold px-8">Save Changes</Button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'members' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-foreground">Team & Members</h2>
                <p className="text-sm text-muted-foreground">Invite collaborators and manage permissions.</p>
              </div>
              <Button size="sm" className="h-8 gap-2 font-bold text-xs">
                <Plus className="w-3.5 h-3.5" /> Invite Member
              </Button>
            </div>

            <div className="bg-[#111118] border border-white/5 rounded-xl overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-white/5 bg-white/[0.01]">
                    <th className="px-4 py-3 font-semibold text-muted-foreground uppercase text-[10px]">Member</th>
                    <th className="px-4 py-3 font-semibold text-muted-foreground uppercase text-[10px]">Role</th>
                    <th className="px-4 py-3 font-semibold text-muted-foreground uppercase text-[10px]">Joined</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {[
                    { initials: "JD", name: "John Doe", email: "john@acme.com", role: "Admin", date: "Jan 2025" },
                    { initials: "SC", name: "Sarah Chen", email: "sarah@acme.com", role: "Editor", date: "Feb 2025" },
                    { initials: "MK", name: "Mike K.", email: "mike@acme.com", role: "Viewer", date: "Mar 2025" },
                  ].map((m, i) => (
                    <tr key={i} className="hover:bg-white/[0.01] transition-colors group">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20">
                            <AvatarFallback className="text-[10px] font-bold text-primary">{m.initials}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-bold text-foreground">{m.name}</p>
                            <p className="text-[10px] text-muted-foreground">{m.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3"><Badge variant="secondary" className="bg-white/5 text-[10px]">{m.role}</Badge></td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">{m.date}</td>
                      <td className="px-4 py-3 text-right">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-white">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'billing' && (
          <div className="space-y-8">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-foreground">Billing</h2>
              <p className="text-sm text-muted-foreground">Manage your subscription and billing details.</p>
            </div>

            <div className="p-6 bg-primary/5 border border-primary/20 rounded-xl space-y-4 relative overflow-hidden">
               <div className="relative z-10">
                 <div className="flex justify-between items-start mb-4">
                   <div>
                     <Badge variant="default" className="mb-2 bg-primary text-white border-none text-[10px] font-bold">CURRENT PLAN</Badge>
                     <h3 className="text-2xl font-bold text-white">Team Plan — $99/seat/mo</h3>
                   </div>
                   <div className="text-right">
                     <p className="text-xs text-primary-foreground/70 mb-1">Next billing: Apr 1, 2025</p>
                     <p className="text-xl font-bold text-white">$297.00</p>
                   </div>
                 </div>
                 <div className="flex gap-2">
                   <Button size="sm" className="h-8 text-xs font-bold bg-white text-black hover:bg-white/90">Manage Billing</Button>
                   <Button size="sm" variant="outline" className="h-8 text-xs font-bold border-white/20 text-white hover:bg-white/5">Upgrade to Enterprise</Button>
                 </div>
               </div>
               <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground font-medium">Scans used this period</span>
                <span className="text-foreground font-bold">670 / 1,000</span>
              </div>
              <Progress value={67} className="h-2" />
              <p className="text-[10px] text-muted-foreground text-center">Your plan resets in 22 days.</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}