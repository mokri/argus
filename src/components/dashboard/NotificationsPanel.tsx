"use client";

import React from 'react';
import { 
  XCircle, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  Lightbulb,
  Check
} from 'lucide-react';

interface NotificationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationsPanel({ isOpen, onClose }: NotificationsPanelProps) {
  if (!isOpen) return null;

  const notifications = [
    { 
      id: 1, 
      type: 'critical', 
      title: 'SQL Injection detected in Financial Analyzer', 
      time: '1h ago', 
      icon: ShieldAlert, 
      color: 'text-destructive', 
      bg: 'bg-destructive/10' 
    },
    { 
      id: 2, 
      type: 'warning', 
      title: 'Sales Agent loop limit approaching', 
      time: '3h ago', 
      icon: AlertTriangle, 
      color: 'text-amber-500', 
      bg: 'bg-amber-500/10' 
    },
    { 
      id: 3, 
      type: 'success', 
      title: 'HR Bot deployed successfully', 
      time: '5h ago', 
      icon: CheckCircle2, 
      color: 'text-green-500', 
      bg: 'bg-green-500/10' 
    },
    { 
      id: 4, 
      type: 'info', 
      title: 'New Blueprint available: Healthcare RAG', 
      time: '1d ago', 
      icon: Info, 
      color: 'text-primary', 
      bg: 'bg-primary/10' 
    },
    { 
      id: 5, 
      type: 'tip', 
      title: 'You could save $340/mo on Financial Analyzer', 
      time: '2d ago', 
      icon: Lightbulb, 
      color: 'text-green-500', 
      bg: 'bg-green-500/10' 
    },
  ];

  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[150]" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-[360px] bg-[#0D0D14] border-l border-white/5 z-[151] shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col">
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
          <h2 className="text-lg font-bold text-foreground">Notifications</h2>
          <button className="text-xs font-bold text-primary hover:underline">Mark all read</button>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          <div className="space-y-1">
            {notifications.map((n) => (
              <button key={n.id} className="w-full text-left p-4 rounded-lg hover:bg-white/5 transition-all group flex gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${n.bg} ${n.color}`}>
                  <n.icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{n.type}</span>
                    <span className="text-[10px] text-muted-foreground">{n.time}</span>
                  </div>
                  <p className="text-sm font-bold text-foreground leading-tight">{n.title}</p>
                  <div className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-[10px] font-bold text-primary flex items-center gap-1">
                      VIEW DETAILS <Check className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="p-6 border-t border-white/5 bg-white/[0.01]">
          <p className="text-center text-xs text-muted-foreground">Showing 5 of 18 notifications</p>
        </div>
      </div>
    </>
  );
}