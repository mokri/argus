
"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ChevronDown,
  ShieldCheck,
  MoreHorizontal,
  Shapes,
  Play,
  Maximize2,
  ZoomIn,
  ZoomOut,
  Maximize,
  Download,
  Code,
  ShieldAlert,
  FileText,
  Share2,
  Paperclip,
  Mic,
  Send,
  CheckCircle2,
  Lock,
  Database,
  History,
  Zap,
  X,
  AlertTriangle,
  Info,
  ArrowRight,
  TrendingUp,
  Settings,
  ChevronRight
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
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  addEdge,
  Handle,
  Position,
  Connection as RFConnection,
  Edge,
  Node as RFNode,
  applyNodeChanges,
  applyEdgeChanges,
  NodeChange,
  EdgeChange
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import VSCodePanel from './VSCodePanel';

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
  type?: 'text' | 'alert' | 'suggestion' | 'upload' | 'diagram-choice';
  text: string;
  options?: string[];
  diagramOptions?: DiagramOption[];
  typing?: boolean;
}

interface DiagramOption {
  id: string;
  name: string;
  description: string;
  type: 'sequential' | 'supervisor';
}

interface Step {
  id: number;
  chatMessage: string;
  chatType?: 'text' | 'alert' | 'suggestion' | 'upload' | 'diagram-choice';
  userMessage?: string;
  options?: string[];
  diagramOptions?: DiagramOption[];
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
  isManual?: boolean;
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
          { id: 'llm_node', type: 'agent', name: 'Llama 3 (Ollama)', subtitle: 'On-Premise', x: 650, y: 280, status: 'healthy' }
        ],
        connectionsToAdd: [{ from: 'pinecone', to: 'retriever', animated: true }, { from: 'retriever', to: 'llm_node', animated: true }]
      },
      {
        id: 5,
        chatMessage: "Next, let's choose the agent orchestration framework. Which platform would you like to use?",
        options: ["LangGraph", "CrewAI", "Google ADK", "AutoGen", "Argus Native"],
        nodesToUpdate: [{ id: 'llm_node', name: 'Llama 3 (LangGraph)', status: 'healthy' }]
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
        connectionsToAdd: [{ from: 'llm_node', to: 'rbac', animated: true }]
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
  },
  'D': {
    id: 'D',
    title: 'Financial Data Pipeline',
    framework: 'LangGraph',
    blueprint: 'Supervisor Pattern',
    isManual: true,
    steps: [
      {
        id: 1,
        chatMessage: "How can I help you architect your next agent?",
        userMessage: "Create a multi-agent system that analyzes financial reports and updates our internal SQL database.",
        nodesToAdd: [{ id: 'start', type: 'io', name: 'Start', x: 50, y: 150, status: 'none' }]
      },
      {
        id: 2,
        chatType: 'diagram-choice',
        chatMessage: "For high-volume financial data pipelines, I recommend one of these two patterns. A Sequential Pattern is simpler, while a Supervisor Pattern provides better error recovery and feedback loops.",
        diagramOptions: [
          { 
            id: 'seq', 
            name: "Sequential Pattern", 
            type: 'sequential', 
            description: "A linear pipeline where output of one agent flows directly into the next. Best for predictable, structured inputs."
          },
          { 
            id: 'sup', 
            name: "Supervisor Pattern", 
            type: 'supervisor', 
            description: "A manager agent orchestrates tasks and delegates to specialists. Best for complex logic requiring verification."
          }
        ]
      },
      {
        id: 3,
        chatMessage: "Excellent. Let's build out the Supervisor architecture. It's more robust for financial reporting errors. Which SQL database are we connecting to?",
        options: ["PostgreSQL", "MySQL", "Snowflake", "BigQuery"],
        nodesToAdd: [
          { id: 'supervisor', type: 'agent', name: 'Financial Supervisor', subtitle: 'Manager', x: 300, y: 150, status: 'healthy' },
          { id: 'extractor', type: 'agent', name: 'Extractor', subtitle: 'Tabular Data', x: 500, y: 50, status: 'healthy' },
          { id: 'analyst', type: 'agent', name: 'Analyst', subtitle: 'Metric Logic', x: 500, y: 150, status: 'healthy' },
          { id: 'sql_writer', type: 'agent', name: 'SQL Writer', subtitle: 'DB Operations', x: 500, y: 250, status: 'healthy' }
        ],
        connectionsToAdd: [
          { from: 'start', to: 'supervisor', animated: true },
          { from: 'supervisor', to: 'extractor', animated: true },
          { from: 'supervisor', to: 'analyst', animated: true },
          { from: 'supervisor', to: 'sql_writer', animated: true }
        ]
      },
      {
        id: 4,
        chatType: 'alert',
        chatMessage: "⚠ Safety Alert — SQL Injection Risk. The SQL Writer agent requires a parameterized query guard. I'm injecting a Safe Query Builder tool.",
        nodesToAdd: [{ id: 'safe_sql', type: 'safety', name: 'Safe SQL Builder', subtitle: 'Parameterized Only', x: 650, y: 250, status: 'healthy', locked: true }],
        connectionsToAdd: [{ from: 'sql_writer', to: 'safe_sql', animated: true }]
      },
      {
        id: 5,
        chatMessage: "Pipeline architected. Running full validation scan...",
        safetyScore: 92,
        code: `from langgraph.graph import StateGraph\n\n# Financial Pipeline\nbuilder = StateGraph(FinancialState)\nbuilder.add_node("supervisor", supervisor_node)\nbuilder.add_node("extractor", extraction_node)\nbuilder.add_node("analyst", analysis_node)\nbuilder.add_node("writer", sql_writer_node)\n\n# ... Safe SQL Builder middleware included`
      }
    ]
  }
};

// --- Custom React Flow Node ---
const CustomNodeComponent = ({ data, selected }: any) => {
  return (
    <div
      className={cn(
        "w-[180px] bg-white border border-[#242422]/10 rounded-xl overflow-hidden shadow-md transition-all",
        selected && "border-[#FF7612] ring-1 ring-[#FF7612]/30"
      )}
    >
      <Handle type="target" position={Position.Top} className="opacity-0" />
      <div className={cn(
        "h-1.5 w-full",
        data.type === 'agent' ? "bg-[#6366F1]" :
          data.type === 'tool' ? "bg-slate-400" :
            data.type === 'data' ? "bg-purple-400" :
              data.type === 'safety' ? "bg-amber-500" :
                data.type === 'memory' ? "bg-teal-400" :
                  data.type === 'io' ? "bg-green-500" : "bg-[#242422]"
      )} />
      <div className="p-3 space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-bold text-[#242422]/40 uppercase tracking-widest">{data.type}</span>
          <div className="flex gap-1">
            {data.locked && <Lock className="w-2.5 h-2.5 text-amber-500" />}
            {data.status === 'healthy' && <CheckCircle2 className="w-2.5 h-2.5 text-green-500" />}
            {data.status === 'critical' && <X className="w-2.5 h-2.5 text-destructive" />}
          </div>
        </div>
        <h4 className="text-xs font-bold text-[#242422] truncate">{data.name}</h4>
        {data.subtitle && <p className="text-[10px] text-[#242422]/50 truncate">{data.subtitle}</p>}
      </div>
      <Handle type="source" position={Position.Bottom} className="opacity-0" />
    </div>
  );
};

const nodeTypes = { custom: CustomNodeComponent };

// --- Sequential Diagram Component ---
const SequentialDiagram = () => (
  <div className="w-full py-4 px-2 space-y-4 bg-slate-50/50 rounded-lg border border-slate-200/50">
    <div className="flex items-center justify-center gap-3">
      <div className="px-2 py-1 rounded border border-slate-300 bg-white text-[10px] font-bold shadow-sm">Report</div>
      <ArrowRight className="w-3 h-3 text-slate-400" />
      <div className="px-2 py-1 rounded border-2 border-sky-600 bg-sky-50 text-sky-700 text-[10px] font-bold shadow-sm">Ingestor</div>
      <ArrowRight className="w-3 h-3 text-slate-400" />
      <div className="px-2 py-1 rounded border-2 border-yellow-500 bg-yellow-50 text-yellow-700 text-[10px] font-bold shadow-sm">Analyst</div>
      <ArrowRight className="w-3 h-3 text-slate-400" />
      <div className="px-2 py-1 rounded border-2 border-green-600 bg-green-50 text-green-700 text-[10px] font-bold shadow-sm">Updater</div>
      <ArrowRight className="w-3 h-3 text-slate-400" />
      <div className="px-2 py-1 rounded border border-slate-300 bg-white text-[10px] font-bold shadow-sm">SQL DB</div>
    </div>
  </div>
);

// --- Supervisor Diagram Component ---
const SupervisorDiagram = () => (
  <div className="w-full py-4 px-2 bg-purple-50/30 rounded-lg border border-purple-100 relative min-h-[140px]">
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
      <div className="px-3 py-2 rounded-lg border-4 border-purple-700 bg-purple-100 text-purple-900 text-[10px] font-bold shadow-md flex items-center gap-1">
        <Zap className="w-3 h-3" /> Supervisor
      </div>
    </div>
    <div className="absolute top-2 left-4 px-2 py-1 rounded border-2 border-sky-600 bg-sky-50 text-sky-700 text-[10px] font-bold">Extractor</div>
    <div className="absolute bottom-2 left-4 px-2 py-1 rounded border-2 border-yellow-500 bg-yellow-50 text-yellow-700 text-[10px] font-bold">Analyst</div>
    <div className="absolute top-1/2 -translate-y-1/2 right-4 px-2 py-1 rounded border-2 border-green-600 bg-green-50 text-green-700 text-[10px] font-bold">SQL Writer</div>
    
    <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 300 140">
      <path d="M80 30 L130 60" stroke="#7b1fa2" strokeWidth="1" strokeDasharray="4 2" />
      <path d="M80 110 L130 80" stroke="#7b1fa2" strokeWidth="1" strokeDasharray="4 2" />
      <path d="M220 70 L170 70" stroke="#7b1fa2" strokeWidth="1" strokeDasharray="4 2" />
    </svg>
  </div>
);

// --- Main Page Component ---
export default function ArchitectPage() {
  const [activeScenarioId, setActiveScenarioId] = useState('B');
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [nodes, setNodes] = useNodesState<RFNode>([]);
  const [edges, setEdges] = useEdgesState<Edge>([]);
  const [chatInputValue, setChatInput] = useState('');

  const onNodesChangeHandler = React.useCallback((changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)), [setNodes]);
  const onEdgesChangeHandler = React.useCallback((changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)), [setEdges]);
  const onConnectHandler = React.useCallback((params: RFConnection) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  const handleAddNode = (type: NodeType) => {
    const newNode: RFNode = {
      id: `node-${Date.now()}`,
      type: 'custom',
      position: { x: Math.random() * 200 + 100, y: Math.random() * 200 + 100 },
      data: { type, name: `New ${type}`, status: 'none', label: `New ${type}` }
    };
    setNodes((prev: any) => [...prev, newNode]);
  };
  const [safetyScore, setSafetyScore] = useState(82);
  const [code, setCode] = useState('');
  const [safetyIssues, setSafetyIssues] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('code');
  const [nodeDetailId, setNodeDetailId] = useState<string | null>(null);

  // --- Resizable Panels ---
  const [leftWidth, setLeftWidth] = useState(340);
  const [rightWidth, setRightWidth] = useState(380);
  const dragging = useRef<'left' | 'right' | null>(null);
  const dragStartX = useRef(0);
  const dragStartWidth = useRef(0);

  const handleMouseDown = (panel: 'left' | 'right', e: React.MouseEvent) => {
    e.preventDefault();
    dragging.current = panel;
    dragStartX.current = e.clientX;
    dragStartWidth.current = panel === 'left' ? leftWidth : rightWidth;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragging.current) return;
      const delta = e.clientX - dragStartX.current;
      if (dragging.current === 'left') {
        setLeftWidth(Math.max(240, Math.min(600, dragStartWidth.current + delta)));
      } else {
        setRightWidth(Math.max(280, Math.min(700, dragStartWidth.current - delta)));
      }
    };
    const handleMouseUp = () => {
      dragging.current = null;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);
  
  const scenario = SCENARIOS[activeScenarioId];

  // Typing animation effect
  const typewriter = (text: string, callback: () => void, type?: any, options?: any, diagramOptions?: any) => {
    setIsTyping(true);
    let i = 0;
    const interval = setInterval(() => {
      if (i < text.length) {
        setMessages(prev => {
          const last = prev[prev.length - 1];
          if (last && last.role === 'ai' && last.typing) {
            return [...prev.slice(0, -1), { ...last, text: text.substring(0, i + 1) }];
          }
          return [...prev, { id: Math.random().toString(), role: 'ai', text: text[0], typing: true, type, options, diagramOptions }];
        });
        i++;
      } else {
        setMessages(prev => {
          const last = prev[prev.length - 1];
          if (last) return [...prev.slice(0, -1), { ...last, typing: false, options, diagramOptions }];
          return prev;
        });
        setIsTyping(false);
        clearInterval(interval);
        callback();
      }
    }, 12);
  };

  const resetWorkspace = (scenarioId: string) => {
    setActiveScenarioId(scenarioId);
    setCurrentStepIndex(-1);
    setMessages([]);
    setNodes([]);
    setEdges([]);
    setSafetyScore(82);
    setCode('');
    setSafetyIssues([]);
    setNodeDetailId(null);
  };

  // Process and present a specific step by index
  const advanceToStep = (stepIdx: number) => {
    const scenario = SCENARIOS[activeScenarioId];
    if (stepIdx >= scenario.steps.length) return;

    const step = scenario.steps[stepIdx];
    setCurrentStepIndex(stepIdx);

    // Process step updates (nodes, edges, scores) immediately
    if (step.nodesToAdd) {
      const newNodes: RFNode[] = step.nodesToAdd.map(n => ({
        id: n.id,
        type: 'custom',
        position: { x: n.y * 1.8, y: n.x * 1.1 },
        data: { type: n.type, name: n.name, subtitle: n.subtitle, status: n.status, locked: n.locked }
      }));
      setNodes((prev: any) => {
        const idsToAdd = new Set(newNodes.map(n => n.id));
        const filteredPrev = prev.filter((n: any) => !idsToAdd.has(n.id));
        return [...filteredPrev, ...newNodes];
      });
    }
    if (step.nodesToUpdate) {
      setNodes((prev: any) => prev.map((n: any) => {
        const update = step.nodesToUpdate?.find(u => u.id === n.id);
        if (update) {
          return { ...n, data: { ...n.data, ...update } };
        }
        return n;
      }));
    }
    if (step.connectionsToAdd) {
      const edgeTimestamp = Date.now();
      const newEdges: Edge[] = step.connectionsToAdd.map((conn, i) => ({
        id: `${conn.from}-${conn.to}-${edgeTimestamp}-${i}`,
        source: conn.from,
        target: conn.to,
        animated: conn.animated,
        style: { stroke: '#6366F1', strokeWidth: 1.5, opacity: 0.6 },
      }));
      setEdges((prev: any) => [...prev, ...newEdges]);
    }
    if (step.safetyScore !== undefined) setSafetyScore(step.safetyScore);
    if (step.code) setCode(step.code);
    if (step.safetyIssues) setSafetyIssues(step.safetyIssues);

    // Typewriter AI message first, THEN show scripted user answer after it finishes
    typewriter(step.chatMessage, () => {
      if (step.userMessage) {
        setMessages(prev => [...prev, { id: Math.random().toString(), role: 'user', text: step.userMessage! }]);
        // If it's the first step, auto-advance after showing user message
        if (stepIdx === 0) {
          setTimeout(() => advanceToStep(1), 1000);
        }
      }
    }, step.chatType, step.options, step.diagramOptions);
  };

  // Handle option selection: post choice as user message, then advance to next step
  const handleOptionSelect = (option: string) => {
    if (isTyping) return;
    setMessages(prev => [...prev, { id: Math.random().toString(), role: 'user', text: option }]);
    const nextIdx = currentStepIndex + 1;
    setTimeout(() => advanceToStep(nextIdx), 400);
  };

  // Handle continue (steps without options)
  const handleContinue = () => {
    if (isTyping) return;
    const nextIdx = currentStepIndex + 1;
    advanceToStep(nextIdx);
  };

  const handleSendMessage = () => {
    if (!chatInputValue.trim() || isTyping) return;
    
    const text = chatInputValue.trim();
    setMessages(prev => [...prev, { id: Math.random().toString(), role: 'user', text }]);
    setChatInput('');

    // Trigger Scenario D if message matches
    if (text === "Create a multi-agent system that analyzes financial reports and updates our internal SQL database.") {
      setActiveScenarioId('D');
      // Jump to step 1 (skip initial state)
      setCurrentStepIndex(-1);
      setTimeout(() => advanceToStep(1), 500);
    } else {
      // Generic response for other inputs
      setTimeout(() => {
        typewriter("I'm specialized in architectural patterns. Try asking me to build a financial data pipeline or research agent.", () => {});
      }, 500);
    }
  };

  useEffect(() => {
    // On mount or scenario change, reset and start first step (if not manual)
    const currentScenario = SCENARIOS[activeScenarioId];
    resetWorkspace(activeScenarioId);
    if (!currentScenario.isManual) {
      const t = setTimeout(() => advanceToStep(0), 500);
      return () => clearTimeout(t);
    } else {
      // For manual scenarios, show a welcome message
      typewriter("Welcome. How can I help you architect your next agent today?", () => {});
    }
  }, [activeScenarioId]);

  return (
    <div className="flex flex-col h-screen bg-[#0A0A0F] text-[#F1F5F9] font-sans overflow-hidden">
      {/* --- Top Bar --- */}
      <header className="h-[56px] min-h-[56px] bg-[#0D0D14] border-b border-white/10 flex items-center justify-between px-6 z-50">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="p-2 hover:bg-white/5 rounded-md transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2 text-sm font-medium">
            <span className="text-muted-foreground">Projects</span>
            <span className="text-white/20">/</span>
            <span className="text-white">{scenario.title}</span>
          </div>
          <Badge variant="outline" className="h-5 text-[10px] font-bold border-white/10 bg-white/5 text-muted-foreground">
            ● DRAFT
          </Badge>
        </div>

        <div className="flex items-center gap-3">
          <h1 className="text-sm font-bold tracking-tight px-3 py-1 bg-white/5 rounded-md border border-white/5">
            {scenario.title}
          </h1>
          <Badge variant="secondary" className="bg-[#6366F1]/10 text-[#6366F1] border-none text-[10px] font-bold h-5 uppercase">
            {scenario.framework}
          </Badge>
          <Badge variant="outline" className="border-[#6366F1]/30 text-[#6366F1] text-[10px] font-bold h-5 uppercase">
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
              <Button size="sm" className="h-8 bg-[#6366F1] hover:bg-[#818CF8] text-white gap-2 text-xs font-bold shadow-none">
                Compile & Export <ChevronDown className="w-3.5 h-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-[#111118] border-white/10 text-white w-48">
              <DropdownMenuItem>Export to LangChain</DropdownMenuItem>
              <DropdownMenuItem className="font-bold text-[#6366F1]">Export to CrewAI ✓</DropdownMenuItem>
              <DropdownMenuItem>Export to LangGraph</DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/5" />
              <DropdownMenuItem>Download .zip</DropdownMenuItem>
              <DropdownMenuItem>Push to GitHub</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-white/40 hover:text-white">
            <MoreHorizontal className="w-5 h-5" />
          </Button>
        </div>
      </header>



      {/* --- Main Workspace Grid --- */}
      <div className="flex-1 flex overflow-hidden">

        {/* --- Left Panel: Chat --- */}
        <aside style={{ width: leftWidth, minWidth: 240, maxWidth: 600 }} className="border-r border-white/10 bg-[#0D0D14] flex flex-col relative shrink-0">
          <div className="h-[44px] px-4 flex items-center justify-between border-b border-white/10 bg-[#0A0A0F]">
            <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest flex items-center gap-1.5">
              <Shapes className="w-3.5 h-3.5 text-[#6366F1]" /> Argus Architect
            </span>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="w-7 h-7 text-white/40 hover:text-white"><History className="w-3.5 h-3.5" /></Button>
              <Button variant="ghost" size="icon" className="w-7 h-7 text-white/40 hover:text-white"><Maximize2 className="w-3.5 h-3.5" /></Button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {/* Step Progress */}
            <div className="space-y-1.5 mb-6">
              <div className="flex justify-between text-[10px] font-bold text-white/40">
                <span>PROGRESS</span>
                <span>STEP {Math.max(currentStepIndex + 1, 0)} OF {scenario.steps.length}</span>
              </div>
              <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden flex gap-0.5">
                {scenario.steps.map((s, i) => (
                  <div key={i} className={cn("h-full flex-1 transition-colors", i <= currentStepIndex ? "bg-[#6366F1]" : "bg-white/10")} />
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
                    m.type === 'alert' ? "bg-red-500/5 border-destructive text-[#F1F5F9]" :
                      m.type === 'suggestion' ? "bg-amber-500/5 border-amber-500 text-[#F1F5F9]" :
                        "bg-[#6366F1]/5 border-[#6366F1] text-[#F1F5F9]"
                  )}>
                    {m.type === 'alert' && <div className="text-[10px] font-bold text-destructive mb-1 uppercase tracking-widest">⚠ Safety Alert</div>}
                    {m.type === 'suggestion' && <div className="text-[10px] font-bold text-amber-500 mb-1 uppercase tracking-widest">💡 Suggestion</div>}
                    <div className="flex gap-2 items-start">
                      <div className="w-5 h-5 rounded bg-[#6366F1] flex items-center justify-center shrink-0 text-[10px] font-bold text-white">A</div>
                      <div className="whitespace-pre-wrap">{m.text}</div>
                    </div>
                    
                    {/* Diagram Choices Rendering */}
                    {m.type === 'diagram-choice' && m.diagramOptions && !m.typing && (
                      <div className="mt-4 space-y-3 animate-in fade-in slide-in-from-bottom-2">
                        {m.diagramOptions.map((opt) => (
                          <div 
                            key={opt.id}
                            onClick={() => handleOptionSelect(opt.name)}
                            className="p-4 rounded-xl bg-white/[0.03] border border-white/10 hover:border-[#6366F1]/50 transition-all group cursor-pointer"
                          >
                            <h4 className="font-bold text-xs mb-1 group-hover:text-[#6366F1] transition-colors">{opt.name}</h4>
                            <p className="text-[10px] text-muted-foreground mb-3 leading-tight">{opt.description}</p>
                            {opt.type === 'sequential' ? <SequentialDiagram /> : <SupervisorDiagram />}
                          </div>
                        ))}
                      </div>
                    )}

                    {m.typing && <span className="inline-block w-1.5 h-4 bg-[#6366F1] animate-pulse ml-1 align-middle" />}
                  </div>
                )}
                {m.role === 'user' && (
                  <div className="p-3 rounded-lg bg-white/5 border border-white/5 text-sm text-[#F1F5F9]">
                    {m.text}
                  </div>
                )}
              </div>
            ))}

            {/* AI Options — clicking posts user message and advances */}
            {currentStepIndex >= 0 && currentStepIndex < scenario.steps.length && scenario.steps[currentStepIndex]?.options && !isTyping && (
              <div className="grid grid-cols-1 gap-2 pt-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                {scenario.steps[currentStepIndex].options?.map(opt => (
                  <Button
                    key={opt}
                    variant="outline"
                    onClick={() => handleOptionSelect(opt)}
                    className="justify-start text-left h-auto py-3 px-4 border-white/10 bg-white/5 hover:bg-[#6366F1]/5 hover:border-[#6366F1]/40 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full border border-white/20 group-hover:border-[#6366F1] transition-colors flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-[#6366F1] opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <span className="text-xs font-medium">{opt}</span>
                    </div>
                  </Button>
                ))}
              </div>
            )}

            {/* Next Step button — shown when no options and not typing */}
            {currentStepIndex >= 0 && currentStepIndex + 1 < scenario.steps.length && !scenario.steps[currentStepIndex]?.options && !scenario.steps[currentStepIndex]?.diagramOptions && !isTyping && (
              <div className="pt-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <Button
                  onClick={handleContinue}
                  className="w-full h-9 text-xs font-bold bg-[#6366F1]/10 border border-[#6366F1]/20 hover:bg-[#6366F1]/15 text-[#6366F1] gap-2"
                >
                  Continue <Play className="w-3 h-3 fill-current" />
                </Button>
              </div>
            )}

            <div id="chat-bottom" />
          </div>

          <div className="p-4 border-t border-white/10 space-y-3 bg-[#0D0D14]">
            <div className="relative">
              <textarea
                value={chatInputValue}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Ask Argus Architect anything..."
                className="w-full bg-[#0A0A0F] border border-white/10 rounded-xl p-3 pr-10 text-xs text-white placeholder:text-white/20 outline-none focus:border-[#6366F1]/50 resize-none min-h-[60px]"
              />
              <Button 
                size="icon" 
                onClick={handleSendMessage}
                className="absolute right-2 bottom-2 h-7 w-7 bg-[#6366F1] rounded-lg text-white"
              >
                <Send className="w-3.5 h-3.5" />
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" className="h-6 w-6 text-white/30 hover:text-white"><Paperclip className="w-3.5 h-3.5" /></Button>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-white/30 hover:text-white"><Mic className="w-3.5 h-3.5" /></Button>
              </div>
              <span className="text-[10px] text-white/20 italic">⌘ Enter to send</span>
            </div>

            {/* Scenario Selector — below chat input */}
            <div className="border-t border-white/10 pt-3">
              <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest mb-2 block">Demos</span>
              <div className="flex flex-wrap gap-1.5">
                {Object.values(SCENARIOS).map(s => (
                  <button
                    key={s.id}
                    onClick={() => resetWorkspace(s.id)}
                    className={cn(
                      "px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all",
                      activeScenarioId === s.id
                        ? "bg-[#6366F1] border-[#6366F1] text-white"
                        : "bg-transparent border-white/10 text-white/50 hover:text-white hover:border-white/20"
                    )}
                  >
                    {s.id}: {s.title}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* --- Resize Handle: Left | Center --- */}
        <div
          onMouseDown={(e) => handleMouseDown('left', e)}
          className="w-1 hover:w-1.5 bg-transparent hover:bg-[#6366F1]/30 cursor-col-resize transition-all shrink-0 relative group z-20"
        >
          <div className="absolute inset-y-0 -left-1 -right-1" />
        </div>

        {/* --- Center Panel: Blueprint --- */}
        <main className="flex-1 bg-[#0A0A0F] relative flex flex-col overflow-hidden">
          <div className="h-[44px] px-6 flex items-center justify-between border-b border-white/10 bg-[#0D0D14] z-10">
            <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest flex items-center gap-2">
              <Database className="w-3.5 h-3.5" /> Architecture Blueprint
            </span>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="h-7 text-[10px] font-bold border border-white/10 hover:bg-white/5 gap-1.5 uppercase tracking-wider">
                <Download className="w-3 h-3" /> Export SVG
              </Button>
              <div className="flex gap-1 border border-white/10 rounded-md p-0.5">
                <Button variant="ghost" size="icon" className="h-6 w-6"><ZoomIn className="w-3.5 h-3.5" /></Button>
                <Button variant="ghost" size="icon" className="h-6 w-6"><ZoomOut className="w-3.5 h-3.5" /></Button>
                <Button variant="ghost" size="icon" className="h-6 w-6"><Maximize className="w-3.5 h-3.5" /></Button>
              </div>
            </div>
          </div>

          <div className="flex-1 relative overflow-hidden w-full h-full">
            <ReactFlow
              nodes={nodes as any}
              edges={edges as any}
              onNodesChange={onNodesChangeHandler}
              onEdgesChange={onEdgesChangeHandler}
              onConnect={onConnectHandler}
              nodeTypes={nodeTypes as any}
              onNodeClick={(_, node) => setNodeDetailId(node.id)}
              fitView
              colorMode="dark"
              className="bg-[#0A0A0F]"
            >
              <Background gap={24} size={1} color="rgba(255,255,255,0.04)" />
              <Controls className="bg-[#111118] border-white/10 fill-white" />
            </ReactFlow>

            {/* Node Detail Sidebar (Overlay) */}
            {nodeDetailId && (
              <div className="absolute top-0 right-0 h-full w-[280px] bg-[#111118] border-l border-[#6366F1]/30 shadow-[-10px_0_30px_rgba(0,0,0,0.5)] z-20 animate-in slide-in-from-right duration-300 p-6 space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-bold">{(nodes.find((n: any) => n.id === nodeDetailId)?.data as any)?.name}</h3>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{(nodes.find((n: any) => n.id === nodeDetailId)?.data as any)?.type}</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setNodeDetailId(null)} className="h-6 w-6 text-white/40 hover:text-white">
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-white/40 uppercase">Configuration</label>
                    <div className="p-3 bg-[#0A0A0F] rounded-lg border border-white/5 text-xs">
                      <div className="flex justify-between mb-2">
                        <span>Model</span>
                        <span className="text-[#6366F1] font-bold italic">GPT-4o-mini</span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px]">
                          <span>Temperature</span>
                          <span>0.3</span>
                        </div>
                        <div className="h-1 w-full bg-white/10 rounded-full">
                          <div className="h-full w-1/3 bg-[#6366F1] rounded-full" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-white/40 uppercase">Security Guardrails</label>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2 bg-[#0A0A0F] rounded-lg border border-white/5">
                        <span className="text-[11px]">Injection Scan</span>
                        <Badge className="bg-green-500/20 text-green-500 border-none text-[8px]">ACTIVE</Badge>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-white/5 rounded-lg border border-white/5">
                        <span className="text-[11px]">Loop Guard</span>
                        <Badge className="bg-green-500/20 text-green-500 border-none text-[8px]">ACTIVE</Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5">
                  <Button className="w-full bg-[#6366F1] hover:bg-[#818CF8] text-white font-bold h-9 shadow-none">Save Changes</Button>
                  <Button variant="ghost" className="w-full text-destructive hover:bg-destructive/10 mt-2 text-[11px] font-bold">Delete Node</Button>
                </div>
              </div>
            )}

            {/* Canvas Legend */}
            <div className="absolute bottom-6 left-6 p-3 bg-[#0D0D14]/90 backdrop-blur-md border border-white/10 rounded-lg flex gap-4 text-[10px] font-bold text-white/50 z-10 shadow-sm">
              <div onClick={() => handleAddNode('agent')} className="flex items-center gap-1.5 cursor-pointer hover:text-white transition-colors"><div className="w-2 h-2 bg-[#6366F1] rounded-sm" /> AGENT</div>
              <div onClick={() => handleAddNode('tool')} className="flex items-center gap-1.5 cursor-pointer hover:text-white transition-colors"><div className="w-2 h-2 bg-slate-400 rounded-sm" /> TOOL</div>
              <div onClick={() => handleAddNode('data')} className="flex items-center gap-1.5 cursor-pointer hover:text-white transition-colors"><div className="w-2 h-2 bg-purple-400 rounded-sm" /> DATA</div>
              <div onClick={() => handleAddNode('safety')} className="flex items-center gap-1.5 cursor-pointer hover:text-white transition-colors"><div className="w-2 h-2 bg-amber-500 rounded-sm" /> SAFETY</div>
              <div onClick={() => handleAddNode('io')} className="flex items-center gap-1.5 cursor-pointer hover:text-white transition-colors"><div className="w-2 h-2 bg-green-500 rounded-sm" /> I/O</div>
            </div>
          </div>
        </main>

        {/* --- Resize Handle: Center | Right --- */}
        <div
          onMouseDown={(e) => handleMouseDown('right', e)}
          className="w-1 hover:w-1.5 bg-transparent hover:bg-primary/40 cursor-col-resize transition-all shrink-0 relative group z-20"
        >
          <div className="absolute inset-y-0 -left-1 -right-1" />
        </div>

        {/* --- Right Panel: Output --- */}
        <aside style={{ width: rightWidth, minWidth: 280, maxWidth: 700 }} className="border-l border-white/10 bg-[#0D0D14] flex flex-col shrink-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full h-full flex flex-col">
            <TabsList className="h-[44px] w-full bg-[#0A0A0F] border-b border-white/10 rounded-none p-0 flex">
              <TabsTrigger value="code" className="flex-1 h-full rounded-none data-[state=active]:bg-[#6366F1]/5 data-[state=active]:border-b-2 data-[state=active]:border-[#6366F1] transition-all text-[10px] font-bold uppercase tracking-widest gap-2">
                <Code className="w-3.5 h-3.5" /> Code
              </TabsTrigger>
              <TabsTrigger value="safety" className="flex-1 h-full rounded-none data-[state=active]:bg-[#6366F1]/5 data-[state=active]:border-b-2 data-[state=active]:border-[#6366F1] transition-all text-[10px] font-bold uppercase tracking-widest gap-2 relative">
                <ShieldAlert className="w-3.5 h-3.5" /> Safety
                {safetyIssues.length > 0 && <span className="absolute top-2 right-4 w-1.5 h-1.5 bg-destructive rounded-full" />}
              </TabsTrigger>
              <TabsTrigger value="docs" className="flex-1 h-full rounded-none data-[state=active]:bg-[#6366F1]/5 data-[state=active]:border-b-2 data-[state=active]:border-[#6366F1] transition-all text-[10px] font-bold uppercase tracking-widest gap-2">
                <FileText className="w-3.5 h-3.5" /> Docs
              </TabsTrigger>
              <TabsTrigger value="diagram" className="flex-1 h-full rounded-none data-[state=active]:bg-[#6366F1]/5 data-[state=active]:border-b-2 data-[state=active]:border-[#6366F1] transition-all text-[10px] font-bold uppercase tracking-widest gap-2">
                <Share2 className="w-3.5 h-3.5" /> Diagram
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-hidden">
              <TabsContent value="code" className="m-0 h-full">
                <VSCodePanel code={code} isTyping={isTyping} />
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
                  <Button className="w-full bg-[#6366F1] hover:bg-[#818CF8] text-white font-bold h-10 shadow-none">
                    Fix All Critical Issues
                  </Button>
                )}
              </TabsContent>

              <TabsContent value="docs" className="m-0 h-full p-6 space-y-6 overflow-y-auto custom-scrollbar prose prose-invert max-w-none">
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
                      {nodes.map((n: any) => (
                        <div key={n.id} className="p-3 bg-white/5 border border-white/5 rounded-lg flex items-center justify-between">
                          <div>
                            <p className="text-[11px] font-bold">{n.data?.name}</p>
                            <p className="text-[9px] text-muted-foreground">{n.data?.subtitle || n.data?.type}</p>
                          </div>
                          <Badge variant="ghost" className="text-[8px] opacity-50 uppercase tracking-tighter">CONFIGURED</Badge>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              </TabsContent>

              <TabsContent value="diagram" className="m-0 h-full flex flex-col p-6 items-center justify-center text-center space-y-4">
                <div className="w-full aspect-square max-w-[280px] border border-white/10 rounded-2xl bg-[#0A0A0F] flex items-center justify-center relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#6366F1]/5 to-transparent opacity-50" />
                  <Shapes className="w-24 h-24 text-[#6366F1]/15 group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Button variant="outline" className="h-9 font-bold text-xs bg-white/10 border-white/10 backdrop-blur-md">Export High-Res SVG</Button>
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
          background: rgba(255, 255, 255, 0.08);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.15);
        }
      `}</style>
    </div>
  );
}

function XCircle({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
