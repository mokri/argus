
"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  ChevronDown, 
  ShieldCheck, 
  Plus, 
  Bell, 
  MoreHorizontal, 
  Cpu, 
  Shapes, 
  Play, 
  Maximize2, 
  Trash2, 
  ZoomIn, 
  ZoomOut, 
  Maximize, 
  Download, 
  Code, 
  ShieldAlert, 
  FileText, 
  Share2, 
  Keyboard,
  Paperclip,
  Mic,
  Send,
  CheckCircle2,
  Lock,
  Database,
  History,
  Zap,
  Info,
  Lightbulb,
  X,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

// --- Types & Scenario Data ---

type NodeType = 'agent' | 'tool' | 'data' | 'io' | 'safety' | 'memory';

interface ArchitectNode {
  id: string;
  type: NodeType;
  name: string;
  subtitle?: string;
  status?: 'healthy' | 'warning' | 'critical' | 'none';
  locked?: boolean;
  x: number;
  y: number;
}

interface Connection {
  from: string;
  to: string;
  label?: string;
  animated?: boolean;
}

interface ChatMessage {
  id: string;
  role: 'ai' | 'user' | 'system';
  type?: 'text' | 'alert' | 'suggestion' | 'upload';
  text: string;
  options?: string[];
  typing?: boolean;
}

interface Step {
  id: number;
  chatMessage: string;
  chatType?: 'text' | 'alert' | 'suggestion' | 'upload';
  userMessage?: string;
  options?: string[];
  nodesToAdd?: ArchitectNode[];
  nodesToUpdate?: Partial<ArchitectNode> & { id: string }[];
  connectionsToAdd?: Connection[];
  code?: string;
  safetyScore?: number;
  safetyIssues?: any[];
  docs?: string;
}

interface Scenario {
  id: string;
  title: string;
  framework: string;
  blueprint: string;
  steps: Step[];
}

const SCENARIOS: Record<string, Scenario> = {
  'A': {
    id: 'A',
    title: 'Enterprise HR Knowledge Bot',
    framework: 'LangGraph',
    blueprint: 'RAG Pipeline',
    steps: [
      {
        id: 1,
        chatMessage: "Welcome to Argus AI. Let's architect your agent together. What are you trying to build? Describe the goal in plain English.",
        userMessage: "I need an internal support bot that answers employee questions from our company HR PDFs.",
        nodesToAdd: [{ id: 'start', type: 'io', name: 'Start', x: 50, y: 150, status: 'none' }],
      },
      {
        id: 2,
        chatMessage: "Got it — a RAG (Retrieval-Augmented Generation) pipeline. First question: what document types are we ingesting? Select all that apply:",
        options: ["PDFs", "Word Docs", "Notion Pages", "Google Drive"],
        nodesToAdd: [
          { id: 'ingest', type: 'io', name: 'HR Ingestion', subtitle: 'PDF + DOCX', x: 200, y: 150, status: 'healthy' },
          { id: 'chunker', type: 'tool', name: 'Chunker', subtitle: 'RecursiveCharacter', x: 350, y: 150, status: 'healthy' }
        ],
        connectionsToAdd: [{ from: 'start', to: 'ingest', animated: true }, { from: 'ingest', to: 'chunker', animated: true }]
      },
      {
        id: 3,
        chatMessage: "For semantic search over your documents, we need a vector database. Which do you prefer?",
        options: ["Pinecone", "Weaviate", "ChromaDB", "pgvector"],
        nodesToAdd: [
          { id: 'embed', type: 'tool', name: 'Embedder', subtitle: 'OpenAI Text-Ada-002', x: 500, y: 150, status: 'healthy' },
          { id: 'pinecone', type: 'data', name: 'Pinecone DB', subtitle: 'Namespace: hr-docs', x: 650, y: 150, status: 'healthy' }
        ],
        connectionsToAdd: [{ from: 'chunker', to: 'embed', animated: true }, { from: 'embed', to: 'pinecone', animated: true }]
      },
      {
        id: 4,
        chatMessage: "For the LLM, since you mentioned HR documents — these likely contain sensitive employee data. Do you want to use a hosted model (OpenAI) or a local model for full data privacy?",
        options: ["OpenAI GPT-4o", "Llama 3 (Ollama)", "Claude 3.5 Haiku"],
        nodesToAdd: [
          { id: 'retriever', type: 'tool', name: 'RAG Retriever', x: 500, y: 280, status: 'healthy' },
          { id: 'llm', type: 'agent', name: 'Llama 3 (Ollama)', subtitle: 'On-Premise', x: 650, y: 280, status: 'healthy' }
        ],
        connectionsToAdd: [{ from: 'pinecone', to: 'retriever', animated: true }, { from: 'retriever', to: 'llm', animated: true }]
      },
      {
        id: 5,
        chatMessage: "Next, let's choose the agent orchestration framework. Which platform would you like to use?",
        options: ["LangGraph", "CrewAI", "Google ADK", "AutoGen", "Argus Native"],
        nodesToUpdate: [{ id: 'llm', name: 'Llama 3 (LangGraph)', status: 'healthy' }]
      },
      {
        id: 6,
        chatType: 'alert',
        chatMessage: "⚠ Safety Alert — PII Detected in Scope. I've analyzed your document type (HR PDFs). These files likely contain employee salaries and SSNs. I'm automatically inserting a PII Redaction Filter before the embedding step.",
        nodesToAdd: [{ id: 'pii', type: 'safety', name: 'PII Filter', subtitle: 'Redaction Engine', x: 425, y: 50, status: 'healthy', locked: true }],
        connectionsToAdd: [{ from: 'chunker', to: 'pii', animated: true }, { from: 'pii', to: 'embed', animated: true }]
      },
      {
        id: 7,
        chatMessage: "One more question: should all employees have access to all documents, or role-based filtering?",
        options: ["Open Access", "Role-Based Access"],
        nodesToAdd: [{ id: 'rbac', type: 'safety', name: 'RBAC Middleware', x: 800, y: 280, status: 'healthy' }],
        connectionsToAdd: [{ from: 'llm', to: 'rbac', animated: true }]
      },
      {
        id: 8,
        chatMessage: "Here is your complete architecture. Pattern: RAG Pipeline. Runtime: LangGraph. Running safety pre-check...",
        safetyScore: 97,
        code: `import langgraph\nfrom argus_safety import pii_filter\n\n# LangGraph Workflow\nworkflow = StateGraph(HRBotState)\nworkflow.add_node("pii", pii_filter)\nworkflow.add_node("retriever", pinecone_retriever)\nworkflow.add_node("llm", llama3_local)\n\nworkflow.set_entry_point("pii")\n# ... Scoped for HIPAA compliance`
      }
    ]
  },
  'B': {
    id: 'B',
    title: 'Sales Lead Automation',
    framework: 'CrewAI',
    blueprint: 'Supervisor Pattern',
    steps: [
      {
        id: 1,
        chatMessage: "What would you like to build today?",
        userMessage: "I want an agent that finds startups on Crunchbase and writes personalized outreach emails.",
        nodesToAdd: [{ id: 'start', type: 'io', name: 'Start', x: 50, y: 150, status: 'none' }]
      },
      {
        id: 2,
        chatMessage: "This requires distinct responsibilities — research and writing. I recommend the Supervisor Pattern: a Manager Agent that delegates to two specialists. Shall I scaffold it?",
        options: ["Yes, use Supervisor Pattern", "Show alternatives"],
        nodesToAdd: [
          { id: 'supervisor', type: 'agent', name: 'Sales Manager', subtitle: 'Supervisor', x: 300, y: 150, status: 'healthy' },
          { id: 'researcher', type: 'agent', name: 'Researcher', x: 500, y: 80, status: 'healthy' },
          { id: 'writer', type: 'agent', name: 'Writer', x: 500, y: 220, status: 'healthy' }
        ],
        connectionsToAdd: [
          { from: 'start', to: 'supervisor', animated: true },
          { from: 'supervisor', to: 'researcher', animated: true },
          { from: 'supervisor', to: 'writer', animated: true }
        ]
      },
      {
        id: 3,
        chatMessage: "Which orchestration framework should we use for multi-agent coordination?",
        options: ["LangGraph", "CrewAI", "Google ADK", "AutoGen", "Argus Native"],
        nodesToUpdate: [{ id: 'supervisor', subtitle: 'CrewAI Orchestrator', status: 'healthy' }]
      },
      {
        id: 4,
        chatMessage: "The Researcher Agent needs access to company data. Shall I attach the crunchbase-mcp tool?",
        options: ["Attach crunchbase-mcp", "Use REST API"],
        nodesToAdd: [{ id: 'crunchbase', type: 'tool', name: 'Crunchbase MCP', x: 650, y: 80, status: 'healthy' }],
        connectionsToAdd: [{ from: 'researcher', to: 'crunchbase', animated: true }]
      },
      {
        id: 5,
        chatMessage: "The Writer Agent needs Gmail access. Should it send emails automatically, or only draft them?",
        options: ["Send Automatically", "Draft Only (Recommended)"],
        nodesToAdd: [{ id: 'gmail', type: 'tool', name: 'Gmail API', subtitle: 'Draft Scope', x: 650, y: 220, status: 'healthy', locked: true }],
        connectionsToAdd: [{ from: 'writer', to: 'gmail', animated: true }],
        safetyIssues: [{ type: 'check', title: 'Gmail API: Permission scoped to Draft Only' }]
      },
      {
        id: 6,
        chatType: 'suggestion',
        chatMessage: "💡 Memory Gap Detected. If the agent researches 100 companies, it might lose context. I recommend adding Redis short-term memory to the Researcher.",
        options: ["Add Redis Memory", "Skip"],
        nodesToAdd: [{ id: 'redis', type: 'memory', name: 'Redis', subtitle: 'Short-term', x: 400, y: 30, status: 'healthy' }],
        connectionsToAdd: [{ from: 'researcher', to: 'redis', animated: true }]
      },
      {
        id: 7,
        chatType: 'alert',
        chatMessage: "⚠ Safety Alert — Unbounded Loop Risk. The Supervisor's research loop has no limit. It could run indefinitely. I am setting max_iterations: 25. Override?",
        options: ["Keep 25 (Recommended)", "Custom Limit"],
        nodesToUpdate: [{ id: 'supervisor', subtitle: 'CrewAI (max: 25)', status: 'healthy', locked: true }],
        safetyScore: 88
      },
      {
        id: 8,
        chatMessage: "Architecture review complete. Safety Score: 88/100. Suggested improvement: Switch Supervisor LLM to GPT-4o-mini to save ~$180/month.",
        options: ["Apply Suggestion", "Dismiss"],
        safetyScore: 88
      },
      {
        id: 9,
        chatMessage: "Applied cost fix. Safety score optimized to 94/100. Generating CrewAI project scaffold...",
        safetyScore: 94,
        code: `from crewai import Agent, Crew\n\nsupervisor = Agent(\n  role="Manager",\n  llm="gpt-4o-mini",\n  max_iter=25\n)\n\nresearcher = Agent(\n  role="Researcher",\n  tools=[crunchbase_mcp],\n  memory=True\n)\n\n# ... Writer restricted to Draft Only`
      }
    ]
  },
  'C': {
    id: 'C',
    title: 'Legacy Agent Refactor',
    framework: 'LangGraph',
    blueprint: 'Router Pattern',
    steps: [
      {
        id: 1,
        chatType: 'upload',
        chatMessage: "Drop your existing agent code here, or paste it below. I'll analyze it and tell you exactly what's wrong.",
        nodesToAdd: [
          { id: 'old_agent', type: 'agent', name: 'Legacy Agent', x: 100, y: 150, status: 'critical' },
          { id: 'sql_tool', type: 'tool', name: 'SQL Query', x: 250, y: 80, status: 'critical' },
          { id: 'email_tool', type: 'tool', name: 'Email Send', x: 250, y: 220, status: 'critical' }
        ],
        connectionsToAdd: [
          { from: 'old_agent', to: 'sql_tool', animated: false },
          { from: 'old_agent', to: 'email_tool', animated: false }
        ]
      },
      {
        id: 2,
        chatMessage: "Analysis complete. Detected 3 critical issues: SQL Injection (Line 47), Infinite Loop Risk, and Unrestricted Email Sending.",
        safetyScore: 31,
        safetyIssues: [
          { type: 'critical', title: 'SQL Injection Vulnerability' },
          { type: 'critical', title: 'Infinite Loop Risk' },
          { type: 'critical', title: 'Unrestricted Email Sending' }
        ]
      },
      {
        id: 3,
        chatMessage: "I recommend refactoring into a Router Pattern using LangGraph for explicit guardrails. Which runtime?",
        options: ["LangGraph (Recommended)", "LangChain", "CrewAI"],
        nodesToUpdate: [{ id: 'old_agent', name: 'Router (Refactoring...)', status: 'warning' }]
      },
      {
        id: 4,
        chatMessage: "Remediation plan: Parameterized SQL queries, Human-in-the-loop email confirmations, and loop step limits. Apply all fixes?",
        options: ["Apply All Fixes", "Review Each"],
        nodesToUpdate: [
          { id: 'old_agent', name: 'LangGraph Router', status: 'healthy' },
          { id: 'sql_tool', name: 'Safe SQL Builder', status: 'healthy' },
          { id: 'email_tool', name: 'Draft + Confirm', status: 'healthy' }
        ],
        safetyScore: 96
      },
      {
        id: 5,
        chatMessage: "Refactor complete. Safety score: 31 → 96. Code converted to LangGraph state machine.",
        code: `# Legacy: query = f"SELECT * FROM users WHERE id={input}"\n# Refactored: query = "SELECT * FROM users WHERE id=?"\n\ngraph.add_node("agent", safe_query_node)\ngraph.add_conditional_edges("agent", should_continue, {"end": END, "tools": "tools"})`
      }
    ]
  }
};

// --- Main Page Component ---

export default function ArchitectPage() {
  const [activeScenarioId, setActiveScenarioId] = useState('B');
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [nodes, setNodes] = useState<ArchitectNode[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [safetyScore, setSafetyScore] = useState(82);
  const [code, setCode] = useState('');
  const [safetyIssues, setSafetyIssues] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('code');
  const [nodeDetailId, setNodeDetailId] = useState<string | null>(null);

  const scenario = SCENARIOS[activeScenarioId];
  const currentStep = scenario.steps[currentStepIndex];

  // Typing animation effect
  const typewriter = (text: string, callback: () => void) => {
    setIsTyping(true);
    let i = 0;
    const interval = setInterval(() => {
      if (i < text.length) {
        setMessages(prev => {
          const last = prev[prev.length - 1];
          if (last && last.role === 'ai' && last.typing) {
            return [...prev.slice(0, -1), { ...last, text: text.substring(0, i + 1) }];
          }
          return [...prev, { id: Math.random().toString(), role: 'ai', text: text[0], typing: true }];
        });
        i++;
      } else {
        setMessages(prev => {
          const last = prev[prev.length - 1];
          return [...prev.slice(0, -1), { ...last, typing: false }];
        });
        setIsTyping(false);
        clearInterval(interval);
        callback();
      }
    }, 12);
  };

  const resetWorkspace = (scenarioId: string) => {
    setActiveScenarioId(scenarioId);
    setCurrentStepIndex(0);
    setMessages([]);
    setNodes([]);
    setConnections([]);
    setSafetyScore(82);
    setCode('');
    setSafetyIssues([]);
    setNodeDetailId(null);
  };

  const advanceStep = () => {
    if (currentStepIndex >= scenario.steps.length - 1) return;

    const nextStep = scenario.steps[currentStepIndex];
    
    // Add User message if exists
    if (nextStep.userMessage) {
      setMessages(prev => [...prev, { id: Math.random().toString(), role: 'user', text: nextStep.userMessage! }]);
    }

    // Process step updates
    if (nextStep.nodesToAdd) setNodes(prev => [...prev, ...nextStep.nodesToAdd!]);
    if (nextStep.nodesToUpdate) {
      setNodes(prev => prev.map(n => {
        const update = nextStep.nodesToUpdate?.find(u => u.id === n.id);
        return update ? { ...n, ...update } : n;
      }));
    }
    if (nextStep.connectionsToAdd) setConnections(prev => [...prev, ...nextStep.connectionsToAdd!]);
    if (nextStep.safetyScore) setSafetyScore(nextStep.safetyScore);
    if (nextStep.code) setCode(nextStep.code);
    if (nextStep.safetyIssues) setSafetyIssues(nextStep.safetyIssues);

    // Typewriter AI message
    typewriter(nextStep.chatMessage, () => {
      if (autoPlay && nextStep.userMessage) {
        setTimeout(advanceStep, 1500);
      }
    });

    setCurrentStepIndex(prev => prev + 1);
  };

  useEffect(() => {
    resetWorkspace('B');
    // Start first step
    setTimeout(() => advanceStep(), 500);
  }, [activeScenarioId]);

  return (
    <div className="flex flex-col h-screen bg-[#0A0A0F] text-[#F1F5F9] font-body overflow-hidden">
      {/* --- Top Bar --- */}
      <header className="h-[56px] min-h-[56px] bg-[#0D0D14] border-b border-white/5 flex items-center justify-between px-6 z-50">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="p-2 hover:bg-white/5 rounded-md transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2 text-sm font-medium">
            <span className="text-muted-foreground">Projects</span>
            <span className="text-white/20">/</span>
            <span className="text-foreground">Sales Lead Automation</span>
          </div>
          <Badge variant="outline" className="h-5 text-[10px] font-bold border-white/10 bg-white/5 text-muted-foreground">
            ● DRAFT
          </Badge>
        </div>

        <div className="flex items-center gap-3">
          <h1 className="text-sm font-bold tracking-tight px-3 py-1 bg-white/5 rounded-md border border-white/5">
            {scenario.title}
          </h1>
          <Badge variant="secondary" className="bg-primary/10 text-primary border-none text-[10px] font-bold h-5 uppercase">
            {scenario.framework}
          </Badge>
          <Badge variant="outline" className="border-primary/30 text-primary text-[10px] font-bold h-5 uppercase">
            {scenario.blueprint}
          </Badge>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 group cursor-help">
            <div className={cn(
              "w-9 h-9 rounded-full flex items-center justify-center border-2 font-bold text-xs transition-colors",
              safetyScore >= 90 ? "border-green-500 text-green-500" : safetyScore >= 70 ? "border-amber-500 text-amber-500" : "border-destructive text-destructive"
            )}>
              {safetyScore}
            </div>
          </div>
          <div className="h-4 w-[1px] bg-white/10 mx-1" />
          <Button variant="outline" size="sm" className="h-8 border-white/10 bg-transparent hover:bg-white/5 gap-2 text-xs font-bold">
            <ShieldCheck className="w-3.5 h-3.5" /> Safety Scan
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" className="h-8 bg-primary hover:bg-primary/90 text-white gap-2 text-xs font-bold shadow-lg shadow-primary/20">
                Compile & Export <ChevronDown className="w-3.5 h-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-[#111118] border-white/10 text-foreground w-48">
              <DropdownMenuItem>Export to LangChain</DropdownMenuItem>
              <DropdownMenuItem className="font-bold text-primary">Export to CrewAI ✓</DropdownMenuItem>
              <DropdownMenuItem>Export to LangGraph</DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/5" />
              <DropdownMenuItem>Download .zip</DropdownMenuItem>
              <DropdownMenuItem>Push to GitHub</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-white">
            <MoreHorizontal className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* --- Scenario Selector --- */}
      <div className="h-[44px] bg-primary/[0.03] border-b border-white/5 flex items-center justify-between px-6 z-40">
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Live Demo:</span>
          {Object.values(SCENARIOS).map(s => (
            <button
              key={s.id}
              onClick={() => resetWorkspace(s.id)}
              className={cn(
                "px-3 py-1 rounded-full text-[11px] font-bold border transition-all",
                activeScenarioId === s.id ? "bg-primary border-primary text-white shadow-lg shadow-primary/20" : "bg-transparent border-white/10 text-muted-foreground hover:text-foreground"
              )}
            >
              Scenario {s.id}: {s.title}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-muted-foreground uppercase">Auto-play Demo</span>
            <div 
              onClick={() => setAutoPlay(!autoPlay)}
              className={cn(
                "w-8 h-4 rounded-full relative transition-colors cursor-pointer",
                autoPlay ? "bg-primary" : "bg-white/10"
              )}
            >
              <div className={cn(
                "w-3 h-3 bg-white rounded-full absolute top-0.5 transition-all",
                autoPlay ? "left-4.5" : "left-0.5"
              )} />
            </div>
          </div>
          {!autoPlay && !isTyping && currentStepIndex < scenario.steps.length - 1 && (
            <Button 
              onClick={advanceStep}
              size="sm" 
              className="h-7 text-[10px] font-bold bg-white text-black hover:bg-white/90 gap-1"
            >
              Next Step <Play className="w-2.5 h-2.5 fill-current" />
            </Button>
          )}
        </div>
      </div>

      {/* --- Main Workspace Grid --- */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* --- Left Panel: Chat --- */}
        <aside className="w-[340px] border-r border-white/5 bg-[#0D0D14] flex flex-col relative">
          <div className="h-[44px] px-4 flex items-center justify-between border-b border-white/5 bg-white/[0.01]">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
              <Shapes className="w-3.5 h-3.5 text-primary" /> Argus Architect
            </span>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="w-7 h-7 text-muted-foreground hover:text-white"><History className="w-3.5 h-3.5" /></Button>
              <Button variant="ghost" size="icon" className="w-7 h-7 text-muted-foreground hover:text-white"><Maximize2 className="w-3.5 h-3.5" /></Button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {/* Step Progress */}
            <div className="space-y-1.5 mb-6">
              <div className="flex justify-between text-[10px] font-bold text-muted-foreground">
                <span>PROGRESS</span>
                <span>STEP {currentStepIndex} OF {scenario.steps.length}</span>
              </div>
              <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden flex gap-0.5">
                {scenario.steps.map((s, i) => (
                  <div key={i} className={cn("h-full flex-1 transition-colors", i < currentStepIndex ? "bg-primary" : "bg-white/10")} />
                ))}
              </div>
            </div>

            {messages.map((m) => (
              <div key={m.id} className={cn(
                "flex flex-col gap-1 max-w-[90%]",
                m.role === 'user' ? "ml-auto items-end" : "items-start"
              )}>
                {m.role === 'ai' && (
                  <div className={cn(
                    "p-3 rounded-lg text-sm leading-relaxed border-l-2",
                    m.type === 'alert' ? "bg-destructive/10 border-destructive text-foreground" :
                    m.type === 'suggestion' ? "bg-amber-500/10 border-amber-500 text-foreground" :
                    "bg-primary/5 border-primary text-foreground"
                  )}>
                    {m.type === 'alert' && <div className="text-[10px] font-bold text-destructive mb-1 uppercase tracking-widest">⚠ Safety Alert</div>}
                    {m.type === 'suggestion' && <div className="text-[10px] font-bold text-amber-500 mb-1 uppercase tracking-widest">💡 Suggestion</div>}
                    {m.text}
                    {m.typing && <span className="inline-block w-1.5 h-4 bg-primary animate-pulse ml-1 align-middle" />}
                  </div>
                )}
                {m.role === 'user' && (
                  <div className="p-3 rounded-lg bg-white/5 border border-white/5 text-sm text-foreground">
                    {m.text}
                  </div>
                )}
              </div>
            ))}
            
            {/* AI Options */}
            {currentStep.options && !isTyping && (
              <div className="grid grid-cols-1 gap-2 pt-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                {currentStep.options.map(opt => (
                  <Button 
                    key={opt}
                    variant="outline"
                    className="justify-start text-left h-auto py-3 px-4 border-white/10 bg-white/[0.02] hover:bg-primary/10 hover:border-primary/50 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full border border-white/20 group-hover:border-primary transition-colors flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <span className="text-xs font-medium">{opt}</span>
                    </div>
                  </Button>
                ))}
              </div>
            )}

            <div id="chat-bottom" />
          </div>

          <div className="p-4 border-t border-white/5 space-y-3 bg-[#0D0D14]">
            <div className="relative">
              <textarea 
                placeholder="Ask Argus Architect anything..."
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 pr-10 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50 resize-none min-h-[60px]"
              />
              <Button size="icon" className="absolute right-2 bottom-2 h-7 w-7 bg-primary rounded-lg text-white">
                <Send className="w-3.5 h-3.5" />
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-white"><Paperclip className="w-3.5 h-3.5" /></Button>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-white"><Mic className="w-3.5 h-3.5" /></Button>
              </div>
              <span className="text-[10px] text-muted-foreground italic">⌘ Enter to send</span>
            </div>
          </div>
        </aside>

        {/* --- Center Panel: Blueprint --- */}
        <main className="flex-1 bg-[#0A0A0F] relative flex flex-col overflow-hidden">
          <div className="h-[44px] px-6 flex items-center justify-between border-b border-white/5 bg-white/[0.01] z-10">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
              <Database className="w-3.5 h-3.5" /> Architecture Blueprint
            </span>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="h-7 text-[10px] font-bold border border-white/5 hover:bg-white/5 gap-1.5 uppercase tracking-wider">
                <Download className="w-3 h-3" /> Export SVG
              </Button>
              <div className="flex gap-1 border border-white/5 rounded-md p-0.5">
                <Button variant="ghost" size="icon" className="h-6 w-6"><ZoomIn className="w-3.5 h-3.5" /></Button>
                <Button variant="ghost" size="icon" className="h-6 w-6"><ZoomOut className="w-3.5 h-3.5" /></Button>
                <Button variant="ghost" size="icon" className="h-6 w-6"><Maximize className="w-3.5 h-3.5" /></Button>
              </div>
            </div>
          </div>

          <div className="flex-1 relative overflow-hidden bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.03)_1px,_transparent_1px)] bg-[length:24px_24px]">
            {/* Connections SVG Overlay */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              <defs>
                <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orientation="auto">
                  <polygon points="0 0, 10 3.5, 0 7" fill="#6366F1" opacity="0.4" />
                </marker>
              </defs>
              {connections.map((conn, i) => {
                const fromNode = nodes.find(n => n.id === conn.from);
                const toNode = nodes.find(n => n.id === conn.to);
                if (!fromNode || !toNode) return null;
                
                const startX = fromNode.x + 120; // Assuming node width approx 120
                const startY = fromNode.y + 40;  // Assuming node height approx 80
                const endX = toNode.x;
                const endY = toNode.y + 40;

                return (
                  <path 
                    key={i}
                    d={`M ${startX} ${startY} C ${startX + 50} ${startY}, ${endX - 50} ${endY}, ${endX} ${endY}`}
                    stroke="#6366F1"
                    strokeWidth="1.5"
                    fill="none"
                    opacity="0.4"
                    markerEnd="url(#arrowhead)"
                    className={conn.animated ? "animate-pulse" : ""}
                    strokeDasharray={conn.animated ? "4 4" : "none"}
                  />
                );
              })}
            </svg>

            {/* Nodes */}
            {nodes.map((node) => (
              <div 
                key={node.id}
                onClick={() => setNodeDetailId(node.id)}
                className={cn(
                  "absolute w-[180px] bg-[#111118] border border-white/10 rounded-xl overflow-hidden shadow-2xl transition-all hover:-translate-y-1 hover:border-primary/50 cursor-pointer animate-in zoom-in-95 duration-300",
                  nodeDetailId === node.id && "border-primary ring-1 ring-primary/50"
                )}
                style={{ left: node.x, top: node.y }}
              >
                <div className={cn(
                  "h-1.5 w-full",
                  node.type === 'agent' ? "bg-primary" :
                  node.type === 'tool' ? "bg-slate-500" :
                  node.type === 'data' ? "bg-purple-500" :
                  node.type === 'safety' ? "bg-amber-500" :
                  node.type === 'memory' ? "bg-teal-500" : "bg-green-600"
                )} />
                <div className="p-3 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">{node.type}</span>
                    <div className="flex gap-1">
                      {node.locked && <Lock className="w-2.5 h-2.5 text-amber-500" />}
                      {node.status === 'healthy' && <CheckCircle2 className="w-2.5 h-2.5 text-green-500" />}
                      {node.status === 'critical' && <X className="w-2.5 h-2.5 text-destructive" />}
                    </div>
                  </div>
                  <h4 className="text-xs font-bold text-foreground truncate">{node.name}</h4>
                  {node.subtitle && <p className="text-[10px] text-muted-foreground truncate">{node.subtitle}</p>}
                </div>
              </div>
            ))}

            {/* Node Detail Sidebar (Overlay) */}
            {nodeDetailId && (
              <div className="absolute top-0 right-0 h-full w-[280px] bg-[#111118] border-l border-primary/50 shadow-[-10px_0_30px_rgba(0,0,0,0.5)] z-20 animate-in slide-in-from-right duration-300 p-6 space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-bold">{nodes.find(n => n.id === nodeDetailId)?.name}</h3>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{nodes.find(n => n.id === nodeDetailId)?.type}</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setNodeDetailId(null)} className="h-6 w-6 text-muted-foreground hover:text-white">
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Configuration</label>
                    <div className="p-3 bg-white/5 rounded-lg border border-white/5 text-xs">
                      <div className="flex justify-between mb-2">
                        <span>Model</span>
                        <span className="text-primary font-bold italic">GPT-4o-mini</span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px]">
                          <span>Temperature</span>
                          <span>0.3</span>
                        </div>
                        <div className="h-1 w-full bg-white/10 rounded-full">
                          <div className="h-full w-1/3 bg-primary rounded-full" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Security Guardrails</label>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2 bg-white/5 rounded-lg border border-white/5">
                        <span className="text-[11px]">PII Filtering</span>
                        <Badge className="bg-green-500/20 text-green-500 border-none text-[8px]">ACTIVE</Badge>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-white/5 rounded-lg border border-white/5">
                        <span className="text-[11px]">Injection Scan</span>
                        <Badge className="bg-green-500/20 text-green-500 border-none text-[8px]">ACTIVE</Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5">
                  <Button className="w-full bg-primary text-white font-bold h-9">Save Node Changes</Button>
                  <Button variant="ghost" className="w-full text-destructive hover:bg-destructive/10 mt-2 text-[11px] font-bold">Delete Node</Button>
                </div>
              </div>
            )}

            {/* Canvas Legend */}
            <div className="absolute bottom-6 left-6 p-3 bg-[#111118]/80 backdrop-blur-md border border-white/5 rounded-lg flex gap-4 text-[10px] font-bold">
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 bg-primary rounded-sm" /> AGENT</div>
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 bg-slate-500 rounded-sm" /> TOOL</div>
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 bg-purple-500 rounded-sm" /> DATA</div>
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 bg-amber-500 rounded-sm" /> SAFETY</div>
            </div>
          </div>
        </main>

        {/* --- Right Panel: Output --- */}
        <aside className="w-[380px] border-l border-white/5 bg-[#0D0D14] flex flex-col">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full h-full flex flex-col">
            <TabsList className="h-[44px] w-full bg-white/[0.01] border-b border-white/5 rounded-none p-0 flex">
              <TabsTrigger value="code" className="flex-1 h-full rounded-none data-[state=active]:bg-primary/5 data-[state=active]:border-b-2 data-[state=active]:border-primary transition-all text-[10px] font-bold uppercase tracking-widest gap-2">
                <Code className="w-3.5 h-3.5" /> Code
              </TabsTrigger>
              <TabsTrigger value="safety" className="flex-1 h-full rounded-none data-[state=active]:bg-primary/5 data-[state=active]:border-b-2 data-[state=active]:border-primary transition-all text-[10px] font-bold uppercase tracking-widest gap-2 relative">
                <ShieldAlert className="w-3.5 h-3.5" /> Safety 
                {safetyIssues.length > 0 && <span className="absolute top-2 right-4 w-1.5 h-1.5 bg-destructive rounded-full" />}
              </TabsTrigger>
              <TabsTrigger value="docs" className="flex-1 h-full rounded-none data-[state=active]:bg-primary/5 data-[state=active]:border-b-2 data-[state=active]:border-primary transition-all text-[10px] font-bold uppercase tracking-widest gap-2">
                <FileText className="w-3.5 h-3.5" /> Docs
              </TabsTrigger>
              <TabsTrigger value="diagram" className="flex-1 h-full rounded-none data-[state=active]:bg-primary/5 data-[state=active]:border-b-2 data-[state=active]:border-primary transition-all text-[10px] font-bold uppercase tracking-widest gap-2">
                <Share2 className="w-3.5 h-3.5" /> Diagram
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-hidden">
              <TabsContent value="code" className="m-0 h-full flex flex-col">
                <div className="h-10 px-4 flex items-center justify-between border-b border-white/5 bg-white/[0.02]">
                  <div className="flex gap-2">
                    <Badge variant="outline" className="text-[9px] border-primary/30 text-primary font-bold">PYTHON</Badge>
                    <Badge variant="ghost" className="text-[9px] text-muted-foreground font-bold hover:text-white transition-colors cursor-pointer">YAML</Badge>
                  </div>
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground"><Copy className="w-3 h-3" /></Button>
                </div>
                <div className="flex-1 overflow-auto p-4 font-mono text-[11px] leading-relaxed bg-[#080810] custom-scrollbar relative">
                  <pre className="text-white/80">
                    {code || "# Awaiting architecture lock...\n# No implementation generated yet."}
                  </pre>
                  {isTyping && <div className="absolute top-4 right-4 animate-pulse"><Zap className="w-4 h-4 text-primary" /></div>}
                </div>
                <div className="p-4 bg-white/[0.02] border-t border-white/5 grid grid-cols-2 gap-2">
                  <Button variant="outline" className="h-8 text-[10px] font-bold gap-2 border-white/10">Download .zip</Button>
                  <Button className="h-8 text-[10px] font-bold gap-2 bg-primary text-white">Push to GitHub</Button>
                </div>
              </TabsContent>

              <TabsContent value="safety" className="m-0 h-full p-6 space-y-6 overflow-y-auto custom-scrollbar">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold">Safety Report</h3>
                  <div className="flex gap-2">
                    <Badge className="bg-destructive/10 text-destructive border-none text-[9px] font-bold">{safetyIssues.filter(i => i.type === 'critical').length} CRITICAL</Badge>
                    <Badge className="bg-amber-500/10 text-amber-500 border-none text-[9px] font-bold">{safetyIssues.filter(i => i.type === 'warning').length} WARNING</Badge>
                  </div>
                </div>

                <div className={cn(
                  "p-4 rounded-xl border flex flex-col gap-2 items-center text-center",
                  safetyIssues.some(i => i.type === 'critical') ? "bg-destructive/5 border-destructive/20" : "bg-green-500/5 border-green-500/20"
                )}>
                  <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", safetyIssues.some(i => i.type === 'critical') ? "bg-destructive/20 text-destructive" : "bg-green-500/20 text-green-500")}>
                    {safetyIssues.some(i => i.type === 'critical') ? <XCircle className="w-6 h-6" /> : <CheckCircle2 className="w-6 h-6" />}
                  </div>
                  <h4 className="font-bold text-sm">
                    {safetyIssues.some(i => i.type === 'critical') ? "🚫 DEPLOYMENT BLOCKED" : "✅ CLEARED FOR DEPLOYMENT"}
                  </h4>
                  <p className="text-[10px] text-muted-foreground">
                    {safetyIssues.some(i => i.type === 'critical') ? "Critical vulnerabilities must be resolved before production export." : "Architecture meets all enterprise safety requirements."}
                  </p>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Detected Issues</label>
                  {safetyIssues.length === 0 ? (
                    <div className="p-8 text-center border border-dashed border-white/10 rounded-xl">
                      <ShieldCheck className="w-8 h-8 text-white/10 mx-auto mb-2" />
                      <p className="text-[10px] text-muted-foreground">No issues detected in current state.</p>
                    </div>
                  ) : (
                    safetyIssues.map((issue, idx) => (
                      <div key={idx} className={cn(
                        "p-3 rounded-lg border space-y-2 group transition-all hover:bg-white/[0.02]",
                        issue.type === 'critical' ? "bg-destructive/5 border-destructive/10" : 
                        issue.type === 'warning' ? "bg-amber-500/5 border-amber-500/10" : "bg-green-500/5 border-green-500/10"
                      )}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {issue.type === 'critical' ? <AlertTriangle className="w-3.5 h-3.5 text-destructive" /> : 
                             issue.type === 'warning' ? <Info className="w-3.5 h-3.5 text-amber-500" /> : <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />}
                            <span className={cn("text-[11px] font-bold uppercase", 
                              issue.type === 'critical' ? "text-destructive" : 
                              issue.type === 'warning' ? "text-amber-500" : "text-green-500"
                            )}>{issue.title}</span>
                          </div>
                          <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100"><ChevronDown className="w-3.5 h-3.5" /></Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {safetyIssues.some(i => i.type === 'critical') && (
                  <Button className="w-full bg-primary hover:bg-primary/90 text-white font-bold h-10 shadow-lg shadow-primary/20">
                    Fix All Critical Issues
                  </Button>
                )}
              </TabsContent>

              <TabsContent value="docs" className="m-0 h-full p-6 space-y-6 overflow-y-auto custom-scrollbar prose prose-invert">
                <div className="space-y-1">
                  <h3 className="text-lg font-bold">Architecture Documentation</h3>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">AUTO-GENERATED BY ARGUS AI · UPDATED LIVE</p>
                </div>
                
                <div className="space-y-4">
                  <section>
                    <h4 className="text-sm font-bold border-b border-white/5 pb-2">{scenario.title}</h4>
                    <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed">
                      This agent implements the <strong>{scenario.blueprint}</strong> pattern on top of the <strong>{scenario.framework}</strong> runtime.
                      Designed for production-grade scale with a focus on {activeScenarioId === 'A' ? 'data privacy and RAG efficiency' : activeScenarioId === 'B' ? 'multi-agent task orchestration' : 'security remediation'}.
                    </p>
                  </section>

                  <section className="space-y-3">
                    <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Active Components</h4>
                    <div className="space-y-2">
                      {nodes.map(n => (
                        <div key={n.id} className="p-3 bg-white/[0.02] border border-white/5 rounded-lg flex items-center justify-between">
                          <div>
                            <p className="text-[11px] font-bold">{n.name}</p>
                            <p className="text-[9px] text-muted-foreground">{n.subtitle || n.type}</p>
                          </div>
                          <Badge variant="ghost" className="text-[8px] opacity-50 uppercase tracking-tighter">CONFIGURED</Badge>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              </TabsContent>

              <TabsContent value="diagram" className="m-0 h-full flex flex-col p-6 items-center justify-center text-center space-y-4">
                <div className="w-full aspect-square max-w-[280px] border border-white/10 rounded-2xl bg-white/[0.01] flex items-center justify-center relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-50" />
                  <Shapes className="w-24 h-24 text-primary/20 group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Button variant="outline" className="h-9 font-bold text-xs bg-white/5 border-white/10 backdrop-blur-md">Export High-Res SVG</Button>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold">Production Blueprint</p>
                  <p className="text-[10px] text-muted-foreground">Vetted architectural diagram for stakeholder review.</p>
                </div>
                <div className="grid grid-cols-2 gap-2 w-full pt-4">
                  <Button variant="secondary" className="h-8 text-[10px] font-bold border-white/5 bg-white/5 hover:bg-white/10">Copy Link</Button>
                  <Button variant="secondary" className="h-8 text-[10px] font-bold border-white/5 bg-white/5 hover:bg-white/10">Export PNG</Button>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </aside>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.1);
        }
      `}</style>
    </div>
  );
}

function Copy({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  );
}

function XCircle({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
