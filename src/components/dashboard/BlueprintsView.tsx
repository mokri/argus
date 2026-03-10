"use client";

import React from 'react';
import { 
  Shapes, 
  Search, 
  Users,
  Eye,
  Rocket
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export function BlueprintsView() {
  const blueprints = [
    { 
      name: "Supervisor Pattern", 
      desc: "Orchestrate specialized agents with a central manager.", 
      tags: ["Multi-Agent", "Enterprise", "LangGraph"],
      users: "340 teams",
      icon: "🔷",
      color: "text-blue-500"
    },
    { 
      name: "RAG Knowledge Base", 
      desc: "End-to-end PDF and document Q&A pipeline with hybrid search.", 
      tags: ["Retrieval", "Automation", "LangChain"],
      users: "890 teams",
      icon: "🔶",
      color: "text-amber-500"
    },
    { 
      name: "Autonomous Sales Agent", 
      desc: "Lead research and personalized email drafting system.", 
      tags: ["Sales", "Automation", "CrewAI"],
      users: "215 teams",
      icon: "➡️",
      color: "text-primary"
    },
    { 
      name: "Financial Analyst", 
      desc: "Multi-tool agent for PDF parsing and SQL database querying.", 
      tags: ["Finance", "High-Security", "LangGraph"],
      users: "156 teams",
      icon: "🔀",
      color: "text-green-500"
    },
    { 
      name: "Code Refactor Agent", 
      desc: "Analyze legacy codebases and suggest modern improvements.", 
      tags: ["Dev Tools", "Self-Correcting", "AutoGen"],
      users: "420 teams",
      icon: "🚀",
      color: "text-purple-500"
    },
    { 
      name: "Customer Support Bot", 
      desc: "Intelligent triage and automated ticket routing with escalation.", 
      tags: ["Support", "Production", "LangChain"],
      users: "1.2k teams",
      icon: "💬",
      color: "text-cyan-500"
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-foreground">Blueprint Library</h1>
          <p className="text-sm text-muted-foreground">Vetted architectural patterns for enterprise AI agents.</p>
        </div>
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input className="pl-9 h-10 bg-[#111118] border-white/5" placeholder="Search blueprints..." />
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-white/5">
        {['All', 'Recommended', 'RAG', 'Multi-Agent', 'Automation', 'Finance', 'Healthcare'].map((tab) => (
          <button 
            key={tab} 
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
              tab === 'All' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {blueprints.map((bp, i) => (
          <Card key={i} className="bg-[#111118] border-white/5 hover:border-primary/20 transition-all group">
            <CardContent className="p-6 space-y-4">
              <div className="flex justify-between items-start">
                <div className={`w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform ${bp.color}`}>
                  {bp.icon}
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                  <Users className="w-3 h-3" /> {bp.users}
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">{bp.name}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{bp.desc}</p>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-2">
                {bp.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="bg-white/5 text-[10px] font-medium text-muted-foreground px-2">
                    {tag}
                  </Badge>
                ))}
              </div>

              <div className="flex items-center gap-2 pt-4">
                <Button size="sm" variant="outline" className="flex-1 h-8 text-xs font-bold gap-1.5 border-white/5 hover:bg-white/5">
                  <Eye className="w-3.5 h-3.5" /> Preview
                </Button>
                <Button size="sm" className="flex-1 h-8 text-xs font-bold gap-1.5">
                  <Rocket className="w-3.5 h-3.5" /> Use Template
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}