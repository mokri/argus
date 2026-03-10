
"use client";

import React from 'react';
import { Search, Plus, Bell, ChevronDown, Zap } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';

interface TopBarProps {
  breadcrumb: string;
  onSearchClick: () => void;
  onNewProject: () => void;
  onToggleNotifications: () => void;
}

export function TopBar({ breadcrumb, onSearchClick, onNewProject, onToggleNotifications }: TopBarProps) {
  return (
    <header className="h-14 w-full bg-[#0D0D14] border-b border-white/5 flex items-center justify-between px-6 sticky top-0 z-[50]">
      <div className="flex items-center gap-4">
        <Link href="/" className="flex items-center gap-2 mr-2 group">
          <svg className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          <span className="font-bold text-lg tracking-tight text-white uppercase italic">Argus</span>
        </Link>
        <Separator orientation="vertical" className="h-4 bg-white/10" />
        <div className="text-sm font-medium text-muted-foreground">
          Workspace <span className="mx-1 text-white/20">/</span> <span className="text-foreground">{breadcrumb}</span>
        </div>
      </div>

      <div className="flex-1 max-w-sm px-8">
        <button 
          onClick={onSearchClick}
          className="w-full h-9 bg-white/5 border border-white/5 rounded-md px-3 flex items-center justify-between group transition-all hover:bg-white/10 hover:border-white/10"
        >
          <div className="flex items-center gap-2 text-muted-foreground group-hover:text-foreground">
            <Search className="w-4 h-4" />
            <span className="text-sm">Search projects, agents...</span>
          </div>
          <div className="flex items-center gap-1 bg-white/5 px-1.5 py-0.5 rounded border border-white/10 text-[10px] text-muted-foreground">
            <span className="text-[12px]">⌘</span>K
          </div>
        </button>
      </div>

      <div className="flex items-center gap-4">
        <Link href="/architect">
          <Button 
            size="sm" 
            className="rounded-full h-8 px-4 gap-2 text-xs font-bold bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            Architect desk
          </Button>
        </Link>
        
        <button 
          onClick={onToggleNotifications}
          className="relative p-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full border-2 border-[#0D0D14]" />
        </button>

        <Separator orientation="vertical" className="h-4 bg-white/10" />

        <button className="flex items-center gap-2 group p-1 rounded-md hover:bg-white/5 transition-colors">
          <Avatar className="w-8 h-8 rounded-full border border-primary/20 bg-primary/10">
            <AvatarFallback className="text-[11px] font-bold text-primary">JD</AvatarFallback>
          </Avatar>
          <div className="flex items-center gap-1">
            <span className="text-sm font-medium text-foreground">John Doe</span>
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground" />
          </div>
        </button>
      </div>
    </header>
  );
}
