"use client";

import React, { useState } from 'react';
import { 
  Code, 
  Terminal, 
  Copy, 
  Download, 
  Github, 
  Cpu,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function CompilerView() {
  const [activeFramework, setActiveFramework] = useState('CrewAI');

  const yamlDefinition = `agent_name: sales_supervisor
pattern: supervisor
llm: gpt-4o-mini

agents:
  - id: researcher
    tools: [crunchbase_mcp]
    memory: redis
  - id: writer
    tools: [gmail_draft]
    permissions: draft_only

safety:
  pii_filter: true
  max_iterations: 5
  injection_scan: true`;

  const generatedCode = {
    CrewAI: `from crewai import Agent, Task, Crew, Process

# Safety Guardrails Preserved: pii_filter=True, max_iterations=5
supervisor = Agent(
    role='Sales Manager',
    goal='Coordinate lead research and drafting',
    backstory='Expert in sales orchestration',
    llm='gpt-4o-mini'
)

researcher = Agent(
    role='Research Specialist',
    goal='Deep search via Crunchbase',
    tools=[crunchbase_mcp],
    memory=True
)

# Writer initialized with restricted draft-only access
writer = Agent(
    role='Content Writer',
    goal='Draft high-converting emails',
    tools=[gmail_draft]
)

crew = Crew(
    agents=[researcher, writer],
    manager_agent=supervisor,
    process=Process.hierarchical
)`,
    LangChain: `# LangChain Implementation
from langchain_openai import ChatOpenAI
from langgraph.prebuilt import create_react_agent

llm = ChatOpenAI(model="gpt-4o-mini")
# ... integration logic with Aegis safety layers`,
  };

  return (
    <div className="h-full flex flex-col space-y-6 animate-in fade-in duration-300">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground">Framework Compiler</h1>
        <p className="text-sm text-muted-foreground">Write abstract Aegis logic. Export to any modern AI framework.</p>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-[500px]">
        {/* Source Definition */}
        <div className="bg-[#111118] border border-white/5 rounded-xl flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-primary" />
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Source: Aegis Logic</span>
            </div>
            <Badge variant="outline" className="bg-transparent border-primary/30 text-primary text-[10px]">YAML Definition</Badge>
          </div>
          <div className="flex-1 p-4 font-mono text-sm overflow-hidden flex flex-col">
            <textarea 
              className="flex-1 bg-transparent border-none outline-none resize-none text-foreground leading-relaxed custom-scrollbar"
              spellCheck={false}
              value={yamlDefinition}
              readOnly
            />
          </div>
        </div>

        {/* Compile Output */}
        <div className="bg-[#111118] border border-white/5 rounded-xl flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
            <div className="flex items-center gap-1">
              {['LangChain', 'CrewAI', 'LangGraph', 'AutoGen'].map((fw) => (
                <button 
                  key={fw}
                  onClick={() => setActiveFramework(fw)}
                  className={`px-3 py-1.5 text-[11px] font-bold rounded-md transition-all ${
                    activeFramework === fw ? 'bg-primary text-white' : 'text-muted-foreground hover:bg-white/5'
                  }`}
                >
                  {fw} {activeFramework === fw && '✓'}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-white">
                <Copy className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
          <div className="flex-1 p-4 font-mono text-xs overflow-auto bg-black/40 relative">
            <pre className="text-primary-foreground/90 leading-relaxed">
              {generatedCode[activeFramework as keyof typeof generatedCode] || `# No implementation generated for ${activeFramework} yet.`}
            </pre>
            <div className="absolute bottom-4 right-4">
               <div className="bg-[#0A0A0F] border border-white/10 rounded-full px-3 py-1 flex items-center gap-2 text-[10px] text-green-500 shadow-2xl">
                 <CheckCircle2 className="w-3 h-3" /> Safety guardrails preserved
               </div>
            </div>
          </div>
          <div className="px-4 py-3 border-t border-white/5 bg-white/[0.02] flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">847 lines generated</span>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" className="h-8 text-xs font-bold border-white/5 bg-transparent hover:bg-white/5 gap-2">
                <Download className="w-3.5 h-3.5" /> .zip
              </Button>
              <Button size="sm" variant="outline" className="h-8 text-xs font-bold border-white/5 bg-transparent hover:bg-white/5 gap-2">
                <Github className="w-3.5 h-3.5" /> GitHub
              </Button>
              <Button size="sm" className="h-8 text-xs font-bold gap-2">
                <Copy className="w-3.5 h-3.5" /> Copy Code
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}