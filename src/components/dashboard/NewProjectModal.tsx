"use client";

import React, { useState } from 'react';
import { 
  XCircle, 
  ChevronRight, 
  ChevronLeft, 
  Sparkles, 
  Rocket,
  Shapes,
  Cpu,
  Database,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NewProjectModal({ isOpen, onClose }: NewProjectModalProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);
  const handleCreate = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onClose();
      setStep(1);
    }, 1500);
  };

  const blueprints = [
    { id: 'sup', name: "Supervisor Pattern", desc: "A manager agent delegates to specialized sub-agents.", icon: "🔷", recommended: true },
    { id: 'router', name: "Router Pattern", desc: "Classifies input and routes to the right agent.", icon: "🔶" },
    { id: 'seq', name: "Sequential Pattern", desc: "Agents execute one after another in a pipeline.", icon: "➡️" },
    { id: 'mr', name: "Map-Reduce Pattern", desc: "Parallel agents process chunks, then merge results.", icon: "🔀" },
  ];

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />
      
      <div className="w-full max-w-[640px] bg-[#111118] border border-white/10 rounded-2xl shadow-2xl overflow-hidden relative z-[201] animate-in zoom-in-95 duration-300">
        <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Create New Project</h2>
            <div className="flex gap-2 mt-3">
              {[1, 2, 3].map((s) => (
                <div key={s} className={`h-1.5 flex-1 min-w-[60px] rounded-full transition-all duration-300 ${s <= step ? 'bg-primary' : 'bg-white/10'}`} />
              ))}
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-muted-foreground hover:text-white">
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        <div className="p-8 min-h-[380px]">
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="space-y-2">
                <Label htmlFor="p-name" className="text-sm font-bold">Project Name</Label>
                <Input id="p-name" placeholder="e.g. Sales Research Assistant" className="bg-white/5 border-white/10 h-11" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="p-desc" className="text-sm font-bold">Project Goal</Label>
                  <button className="text-[10px] font-bold text-primary flex items-center gap-1 hover:underline">
                    <Sparkles className="w-3 h-3" /> SUGGEST WITH AI
                  </button>
                </div>
                <Textarea id="p-desc" placeholder="Describe your agent's goal in plain English..." className="bg-white/5 border-white/10 min-h-[100px]" />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-bold">Tags</Label>
                <Input placeholder="Add tags (e.g. finance, internal, customer-facing)" className="bg-white/5 border-white/10 h-11" />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="space-y-1">
                <h3 className="text-lg font-bold">Choose a Blueprint</h3>
                <p className="text-xs text-muted-foreground">Select an architectural pattern for your agent swarm.</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {blueprints.map((bp) => (
                  <button key={bp.id} className="p-4 text-left rounded-xl bg-white/5 border border-white/10 hover:border-primary/50 transition-all group relative">
                    <div className="text-2xl mb-3 group-hover:scale-110 transition-transform">{bp.icon}</div>
                    <p className="text-sm font-bold mb-1">{bp.name}</p>
                    <p className="text-[10px] text-muted-foreground leading-snug">{bp.desc}</p>
                    {bp.recommended && (
                      <Badge className="absolute top-2 right-2 bg-primary/20 text-primary border-none text-[8px] px-1.5 h-4">RECOMMENDED</Badge>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-muted-foreground uppercase">Primary LLM</Label>
                  <Select defaultValue="gpt-4o">
                    <SelectTrigger className="bg-white/5 border-white/10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#111118] border-white/10">
                      <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                      <SelectItem value="gpt-4o-mini">GPT-4o-mini</SelectItem>
                      <SelectItem value="claude">Claude 3.5</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-muted-foreground uppercase">Framework</Label>
                  <Select defaultValue="crewai">
                    <SelectTrigger className="bg-white/5 border-white/10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#111118] border-white/10">
                      <SelectItem value="crewai">CrewAI</SelectItem>
                      <SelectItem value="langchain">LangChain</SelectItem>
                      <SelectItem value="langgraph">LangGraph</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-white/5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded bg-primary/10 text-primary"><Database className="w-4 h-4" /></div>
                    <div>
                      <p className="text-sm font-bold">Vector Database</p>
                      <p className="text-[10px] text-muted-foreground">Enabled for RAG knowledge storage</p>
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="space-y-3 pt-2">
                  <div className="flex items-start gap-3">
                    <Checkbox id="check-safety" defaultChecked className="mt-1" />
                    <label htmlFor="check-safety" className="text-xs text-foreground cursor-pointer">
                      <span className="font-bold">Enable Safety Scan on every commit</span>
                      <p className="text-muted-foreground mt-0.5">Automated vulnerability auditing during dev cycles.</p>
                    </label>
                  </div>
                  <div className="flex items-start gap-3">
                    <Checkbox id="check-pii" defaultChecked className="mt-1" />
                    <label htmlFor="check-pii" className="text-xs text-foreground cursor-pointer">
                      <span className="font-bold">Add PII Filter to ingestion pipeline</span>
                      <p className="text-muted-foreground mt-0.5">Scrub sensitive data before it reaches the LLM.</p>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-8 border-t border-white/5 bg-white/[0.01] flex items-center justify-between">
          {step > 1 ? (
            <Button variant="outline" onClick={handleBack} className="h-10 px-6 font-bold gap-2 border-white/10">
              <ChevronLeft className="w-4 h-4" /> Back
            </Button>
          ) : (
            <Button variant="ghost" onClick={onClose} className="h-10 px-6 font-bold text-muted-foreground">Cancel</Button>
          )}

          {step < 3 ? (
            <Button onClick={handleNext} className="h-10 px-8 font-bold gap-2 shadow-xl shadow-primary/20">
              Next <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button onClick={handleCreate} disabled={loading} className="h-10 px-10 font-bold gap-2 shadow-xl shadow-primary/20">
              {loading ? 'Creating...' : (
                <>Create Project <Rocket className="w-4 h-4" /></>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}