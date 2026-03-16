
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
    <header className="h-14 w-full bg-white border-b border-[#242422]/8 flex items-center justify-between px-6 sticky top-0 z-[50]">
      <div className="flex items-center gap-4">
        <Link href="/" className="flex items-center gap-2 mr-2 group">
          <svg className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          <span className="font-bold text-lg tracking-tight text-[#242422] uppercase italic">Argus</span>
        </Link>
        <Separator orientation="vertical" className="h-4 bg-[#242422]/10" />
        <div className="text-sm font-medium text-[#242422]/50">
          Workspace <span className="mx-1 text-[#242422]/20">/</span> <span className="text-[#242422]">{breadcrumb}</span>
        </div>
      </div>

      <div className="flex-1 max-w-sm px-8">
        <button
          onClick={onSearchClick}
          className="w-full h-9 bg-[#F7F7F4] border border-[#242422]/8 rounded-md px-3 flex items-center justify-between group transition-all hover:bg-[#EBEAE5] hover:border-[#242422]/15"
        >
          <div className="flex items-center gap-2 text-muted-foreground group-hover:text-foreground">
            <Search className="w-4 h-4" />
            <span className="text-sm">Search projects, agents...</span>
          </div>
          <div className="flex items-center gap-1 bg-[#EBEAE5] px-1.5 py-0.5 rounded border border-[#242422]/8 text-[10px] text-[#242422]/40">
            <span className="text-[12px]">⌘</span>K
          </div>
        </button>
      </div>

      <div className="flex items-center gap-4">
        <Link href="/architect">
          <Button
            size="sm"
            className="rounded-full h-8 px-4 gap-2 text-xs font-bold bg-[#FF7612] hover:bg-[#FF9E57] text-white shadow-none"
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
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full border-2 border-white" />
        </button>

        <Separator orientation="vertical" className="h-4 bg-[#242422]/10" />

        <button className="flex items-center gap-2 group p-1 rounded-md hover:bg-[#242422]/5 transition-colors">
          <Avatar className="w-8 h-8 rounded-full border border-[#FF7612]/20 bg-[#FF7612]/10">
            <AvatarFallback className="text-[11px] font-bold text-[#FF7612]">JD</AvatarFallback>
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
