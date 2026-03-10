"use client";

import React, { useEffect, useState } from 'react';
import { 
  Search, 
  FileText, 
  Zap, 
  Cpu, 
  Shapes, 
  ShieldCheck, 
  Terminal,
  ArrowRight
} from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [search, setSearch] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sections = [
    {
      label: 'Recent',
      items: [
        { label: 'Sales Lead Automation', type: 'project', icon: FileText },
        { label: 'HR Policy RAG Bot', type: 'project', icon: FileText },
      ]
    },
    {
      label: 'Actions',
      items: [
        { label: 'New Project', type: 'action', icon: Zap, shortcut: '⚡' },
        { label: 'Run Safety Scan', type: 'action', icon: ShieldCheck, shortcut: '⚡' },
        { label: 'Open Framework Compiler', type: 'action', icon: Terminal, shortcut: '⚡' },
      ]
    },
    {
      label: 'Blueprints',
      items: [
        { label: 'Supervisor Pattern', type: 'blueprint', icon: Shapes },
        { label: 'RAG Knowledge Base', type: 'blueprint', icon: Shapes },
      ]
    }
  ];

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[15vh]">
      <div className="fixed inset-0 bg-black/70 backdrop-blur-[4px] animate-in fade-in duration-200" onClick={onClose} />
      
      <div className="w-full max-w-[560px] bg-[#111118] border border-white/10 rounded-xl shadow-2xl overflow-hidden relative z-[201] animate-in zoom-in-95 fade-in duration-200">
        <div className="relative flex items-center p-4 border-b border-white/5">
          <Search className="w-5 h-5 text-muted-foreground mr-3" />
          <input 
            autoFocus
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground text-base"
            placeholder="Search projects, agents, blueprints..."
          />
          <div className="bg-white/5 px-1.5 py-0.5 rounded border border-white/10 text-[10px] text-muted-foreground ml-2">
            ESC
          </div>
        </div>

        <div className="max-h-[400px] overflow-y-auto p-2 scrollbar-hide">
          {sections.map((section) => (
            <div key={section.label} className="mb-4 last:mb-2">
              <h3 className="px-3 py-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{section.label}</h3>
              <div className="space-y-0.5">
                {section.items.map((item, i) => (
                  <button 
                    key={i}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-white/5 group transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-white/5 flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
                        <item.icon className="w-4 h-4" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-bold text-foreground">{item.label}</p>
                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">{item.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.shortcut && <span className="text-xs">{item.shortcut}</span>}
                      <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all translate-x-[-4px] group-hover:translate-x-0" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="p-3 border-t border-white/5 bg-white/[0.01] flex items-center justify-between text-[10px] text-muted-foreground font-medium">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5"><kbd className="bg-white/5 px-1 rounded border border-white/10">↵</kbd> Select</span>
            <span className="flex items-center gap-1.5"><kbd className="bg-white/5 px-1 rounded border border-white/10">↑↓</kbd> Navigate</span>
          </div>
          <div>AegisCore Search</div>
        </div>
      </div>
    </div>
  );
}