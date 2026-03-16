"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  X,
  AlertTriangle,
  Info,
  PanelRightClose,
  PanelRightOpen,
  GitMerge
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  EdgeChange,
  MarkerType,
  reconnectEdge
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import VSCodePanel from './VSCodePanel';

// ─── Geometry helpers ─────────────────────────────────────────────────────────

function distToSegment(
  p: { x: number; y: number },
  v: { x: number; y: number },
  w: { x: number; y: number }
): number {
  const l2 = (v.x - w.x) ** 2 + (v.y - w.y) ** 2;
  if (l2 === 0) return Math.sqrt((p.x - v.x) ** 2 + (p.y - v.y) ** 2);
  let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
  t = Math.max(0, Math.min(1, t));
  return Math.sqrt((p.x - (v.x + t * (w.x - v.x))) ** 2 + (p.y - (v.y + t * (w.y - v.y))) ** 2);
}

/** Approximate centre of a node (node width ~180px, height ~76px) */
function nodeCenter(n: RFNode): { x: number; y: number } {
  return { x: n.position.x + 90, y: n.position.y + 38 };
}

/** How close the dragged node must be to an edge to trigger insertion (px) */
const INSERT_THRESHOLD = 28;

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
  thinking?: boolean;
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

const sequentialNodes = [
  { id: 'seq-1', data: { label: 'Financial Report\n(Input)' }, position: { x: 50, y: 150 }, style: { background: '#fff', border: '1px solid #ccc', fontSize: 10, textAlign: 'center', padding: 10, fontWeight: 'bold' } },
  { id: 'seq-2', data: { label: 'Agent A\nIngestor' }, position: { x: 250, y: 150 }, style: { background: '#e1f5fe', border: '2px solid #01579b', fontSize: 10, textAlign: 'center', padding: 10, borderRadius: 8, fontWeight: 'bold' } },
  { id: 'seq-3', data: { label: 'Agent B\nAnalyst' }, position: { x: 450, y: 150 }, style: { background: '#fff9c4', border: '2px solid #fbc02d', fontSize: 10, textAlign: 'center', padding: 10, borderRadius: 8, fontWeight: 'bold' } },
  { id: 'seq-4', data: { label: 'Agent C\nDB Updater' }, position: { x: 650, y: 150 }, style: { background: '#e8f5e9', border: '2px solid #2e7d32', fontSize: 10, textAlign: 'center', padding: 10, borderRadius: 8, fontWeight: 'bold' } },
  { id: 'seq-5', data: { label: '🗄️ SQL Database\n(Output)' }, position: { x: 850, y: 150 }, style: { background: '#fff', border: '1px solid #ccc', fontSize: 10, textAlign: 'center', padding: 10, fontWeight: 'bold' } },
];
const sequentialEdges = [
  { id: 'e1', source: 'seq-1', target: 'seq-2', markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'e2', source: 'seq-2', target: 'seq-3', label: 'Raw Text/Tables', labelStyle: { fontSize: 9, fontWeight: 'bold' }, markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'e3', source: 'seq-3', target: 'seq-4', label: 'Structured JSON', labelStyle: { fontSize: 9, fontWeight: 'bold' }, markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'e4', source: 'seq-4', target: 'seq-5', label: 'SQL Query', labelStyle: { fontSize: 9, fontWeight: 'bold' }, markerEnd: { type: MarkerType.ArrowClosed } },
];

const supervisorNodes = [
  { id: 'sup-1', data: { label: '🤖 Supervisor Agent' }, position: { x: 250, y: 50 }, style: { background: '#f3e5f5', border: '4px solid #7b1fa2', fontSize: 10, textAlign: 'center', padding: 10, borderRadius: 8, fontWeight: 'bold' } },
  { id: 'sup-2', data: { label: 'Agent: Extractor' }, position: { x: 50, y: 180 }, style: { background: '#e1f5fe', border: '2px solid #01579b', fontSize: 10, textAlign: 'center', padding: 10, borderRadius: 8, fontWeight: 'bold' } },
  { id: 'sup-3', data: { label: 'Agent: Analyst' }, position: { x: 250, y: 250 }, style: { background: '#fff9c4', border: '2px solid #fbc02d', fontSize: 10, textAlign: 'center', padding: 10, borderRadius: 8, fontWeight: 'bold' } },
  { id: 'sup-4', data: { label: 'Agent: SQL Writer' }, position: { x: 450, y: 180 }, style: { background: '#e8f5e9', border: '2px solid #2e7d32', fontSize: 10, textAlign: 'center', padding: 10, borderRadius: 8, fontWeight: 'bold' } },
  { id: 'sup-5', data: { label: '🏁 Completed' }, position: { x: 250, y: -50 }, style: { background: '#fff', border: '1px solid #ccc', fontSize: 10, textAlign: 'center', padding: 10, borderRadius: 8, fontWeight: 'bold' } },
];
const supervisorEdges = [
  { id: 'es1', source: 'sup-1', target: 'sup-2', label: 'Delegate:\nExtract Data', labelStyle: { fontSize: 8, fontWeight: 'bold' }, markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'es2', source: 'sup-2', target: 'sup-1', label: 'Raw Text', labelStyle: { fontSize: 8, fontWeight: 'bold' }, animated: true },
  { id: 'es3', source: 'sup-1', target: 'sup-3', label: 'Delegate:\nAnalyze Metrics', labelStyle: { fontSize: 8, fontWeight: 'bold' }, markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'es4', source: 'sup-3', target: 'sup-1', label: 'Metrics JSON', labelStyle: { fontSize: 8, fontWeight: 'bold' }, animated: true },
  { id: 'es5', source: 'sup-1', target: 'sup-4', label: 'Delegate:\nWrite to DB', labelStyle: { fontSize: 8, fontWeight: 'bold' }, markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'es6', source: 'sup-4', target: 'sup-1', label: 'Status', labelStyle: { fontSize: 8, fontWeight: 'bold' }, animated: true },
  { id: 'es7', source: 'sup-1', target: 'sup-5', label: 'Done', labelStyle: { fontSize: 8, fontWeight: 'bold' }, markerEnd: { type: MarkerType.ArrowClosed } },
];

const SCENARIOS: Record<string, Scenario> = {
  'A': {
    id: 'A',
    title: 'Enterprise HR Knowledge Bot',
    framework: 'LangGraph',
    blueprint: 'RAG Pipeline',
    steps: [
      { id: 1, chatMessage: "Welcome to Argus AI. Let's architect your agent together. What are you trying to build?", userMessage: "I need an internal support bot that answers employee questions from our company HR PDFs.", nodesToAdd: [{ id: 'start', type: 'io', name: 'Start', x: 50, y: 150, status: 'none' }] },
      { id: 2, chatMessage: "Got it — a RAG pipeline. What document types are we ingesting?", options: ["PDFs", "Word Docs", "Notion Pages", "Google Drive"], nodesToAdd: [{ id: 'ingest', type: 'io', name: 'HR Ingestion', subtitle: 'PDF + DOCX', x: 200, y: 150, status: 'healthy' }, { id: 'chunker', type: 'tool', name: 'Chunker', subtitle: 'RecursiveCharacter', x: 350, y: 150, status: 'healthy' }], connectionsToAdd: [{ from: 'start', to: 'ingest', animated: true }, { from: 'ingest', to: 'chunker', animated: true }] },
      { id: 3, chatMessage: "Which vector database do you prefer?", options: ["Pinecone", "Weaviate", "ChromaDB", "pgvector"], nodesToAdd: [{ id: 'embed', type: 'tool', name: 'Embedder', subtitle: 'OpenAI Text-Ada-002', x: 500, y: 150, status: 'healthy' }, { id: 'pinecone', type: 'data', name: 'Pinecone DB', subtitle: 'Namespace: hr-docs', x: 650, y: 150, status: 'healthy' }], connectionsToAdd: [{ from: 'chunker', to: 'embed', animated: true }, { from: 'embed', to: 'pinecone', animated: true }] },
      { id: 4, chatMessage: "HR documents likely contain sensitive data. Use a hosted model or local model for full data privacy?", options: ["OpenAI GPT-4o", "Llama 3 (Ollama)", "Claude 3.5 Haiku"], nodesToAdd: [{ id: 'retriever', type: 'tool', name: 'RAG Retriever', x: 500, y: 280, status: 'healthy' }, { id: 'llm_node', type: 'agent', name: 'Llama 3 (Ollama)', subtitle: 'On-Premise', x: 650, y: 280, status: 'healthy' }], connectionsToAdd: [{ from: 'pinecone', to: 'retriever', animated: true }, { from: 'retriever', to: 'llm_node', animated: true }] },
      { id: 5, chatMessage: "Which orchestration framework?", options: ["LangGraph", "CrewAI", "Google ADK", "AutoGen", "Argus Native"], nodesToUpdate: [{ id: 'llm_node', name: 'Llama 3 (LangGraph)', status: 'healthy' }] },
      { id: 6, chatType: 'alert', chatMessage: "⚠ Safety Alert — PII Detected. These files likely contain SSNs and salaries. Inserting a PII Redaction Filter automatically.", nodesToAdd: [{ id: 'pii', type: 'safety', name: 'PII Filter', subtitle: 'Redaction Engine', x: 425, y: 50, status: 'healthy', locked: true }], connectionsToAdd: [{ from: 'chunker', to: 'pii', animated: true }, { from: 'pii', to: 'embed', animated: true }] },
      { id: 7, chatMessage: "Should all employees have access to all documents, or role-based filtering?", options: ["Open Access", "Role-Based Access"], nodesToAdd: [{ id: 'rbac', type: 'safety', name: 'RBAC Middleware', x: 800, y: 280, status: 'healthy' }], connectionsToAdd: [{ from: 'llm_node', to: 'rbac', animated: true }] },
      { id: 8, chatMessage: "Architecture complete. Pattern: RAG Pipeline. Runtime: LangGraph. Safety pre-check running...", safetyScore: 97, code: `import langgraph\nfrom argus_safety import pii_filter\n\nworkflow = StateGraph(HRBotState)\nworkflow.add_node("pii", pii_filter)\nworkflow.add_node("retriever", pinecone_retriever)\nworkflow.add_node("llm", llama3_local)\n\nworkflow.set_entry_point("pii")\n# ... Scoped for HIPAA compliance` }
    ]
  },
  'B': {
    id: 'B',
    title: 'Sales Lead Automation',
    framework: 'CrewAI',
    blueprint: 'Supervisor Pattern',
    steps: [
      { id: 1, chatMessage: "What would you like to build today?", userMessage: "I want an agent that finds startups on Crunchbase and writes personalized outreach emails.", nodesToAdd: [{ id: 'start', type: 'io', name: 'Start', x: 50, y: 150, status: 'none' }] },
      { id: 2, chatMessage: "This requires distinct responsibilities — research and writing. I recommend the Supervisor Pattern.", options: ["Yes, use Supervisor Pattern", "Show alternatives"], nodesToAdd: [{ id: 'supervisor', type: 'agent', name: 'Sales Manager', subtitle: 'Supervisor', x: 300, y: 150, status: 'healthy' }, { id: 'researcher', type: 'agent', name: 'Researcher', x: 500, y: 80, status: 'healthy' }, { id: 'writer', type: 'agent', name: 'Writer', x: 500, y: 220, status: 'healthy' }], connectionsToAdd: [{ from: 'start', to: 'supervisor', animated: true }, { from: 'supervisor', to: 'researcher', animated: true }, { from: 'supervisor', to: 'writer', animated: true }] },
      { id: 3, chatMessage: "Which orchestration framework?", options: ["LangGraph", "CrewAI", "Google ADK", "AutoGen", "Argus Native"], nodesToUpdate: [{ id: 'supervisor', subtitle: 'CrewAI Orchestrator', status: 'healthy' }] },
      { id: 4, chatMessage: "The Researcher Agent needs company data. Attach the crunchbase-mcp tool?", options: ["Attach crunchbase-mcp", "Use REST API"], nodesToAdd: [{ id: 'crunchbase', type: 'tool', name: 'Crunchbase MCP', x: 650, y: 80, status: 'healthy' }], connectionsToAdd: [{ from: 'researcher', to: 'crunchbase', animated: true }] },
      { id: 5, chatMessage: "The Writer Agent needs Gmail access. Send automatically, or draft only?", options: ["Send Automatically", "Draft Only (Recommended)"], nodesToAdd: [{ id: 'gmail', type: 'tool', name: 'Gmail API', subtitle: 'Draft Scope', x: 650, y: 220, status: 'healthy', locked: true }], connectionsToAdd: [{ from: 'writer', to: 'gmail', animated: true }], safetyIssues: [{ type: 'check', title: 'Gmail API: Permission scoped to Draft Only' }] },
      { id: 6, chatType: 'suggestion', chatMessage: "💡 Memory Gap Detected. The agent may lose context over 100+ companies. Adding Redis short-term memory.", options: ["Add Redis Memory", "Skip"], nodesToAdd: [{ id: 'redis', type: 'memory', name: 'Redis', subtitle: 'Short-term', x: 400, y: 30, status: 'healthy' }], connectionsToAdd: [{ from: 'researcher', to: 'redis', animated: true }] },
      { id: 7, chatType: 'alert', chatMessage: "⚠ Safety Alert — Unbounded Loop Risk. Setting max_iterations: 25. Override?", options: ["Keep 25 (Recommended)", "Custom Limit"], nodesToUpdate: [{ id: 'supervisor', subtitle: 'CrewAI (max: 25)', status: 'healthy', locked: true }], safetyScore: 88 },
      { id: 8, chatMessage: "Architecture review complete. Safety Score: 88/100. Switch Supervisor LLM to GPT-4o-mini to save ~$180/month?", options: ["Apply Suggestion", "Dismiss"], safetyScore: 88 },
      { id: 9, chatMessage: "Applied cost fix. Safety score optimized to 94/100. Generating CrewAI scaffold...", safetyScore: 94, code: `from crewai import Agent, Crew\n\nsupervisor = Agent(\n  role="Manager",\n  llm="gpt-4o-mini",\n  max_iter=25\n)\n\nresearcher = Agent(\n  role="Researcher",\n  tools=[crunchbase_mcp],\n  memory=True\n)\n\n# ... Writer restricted to Draft Only` }
    ]
  },
  'C': {
    id: 'C',
    title: 'Financial DB Updater',
    framework: 'Argus Native',
    blueprint: 'Pending Choice',
    steps: []
  }
};

// --- Custom React Flow Node ---
const CustomNodeComponent = ({ data, selected }: any) => {
  return (
    <div className={cn("w-[180px] bg-white border border-[#242422]/10 rounded-xl overflow-hidden shadow-md transition-all group", selected && "border-[#FF7612] ring-1 ring-[#FF7612]/30")}>
      <Handle type="target" position={Position.Top} id="top-t" className="w-2.5 h-2.5 bg-white border-2 border-[#242422]/20 rounded-full transition-opacity opacity-0 group-hover:opacity-100 hover:!border-[#FF7612] z-50" />
      <Handle type="source" position={Position.Top} id="top-s" className="w-2.5 h-2.5 bg-white border-2 border-[#242422]/20 rounded-full transition-opacity opacity-0 group-hover:opacity-100 hover:!border-[#FF7612] z-50" />
      <Handle type="target" position={Position.Left} id="left-t" className="w-2.5 h-2.5 bg-white border-2 border-[#242422]/20 rounded-full transition-opacity opacity-0 group-hover:opacity-100 hover:!border-[#FF7612] z-50" />
      <Handle type="source" position={Position.Left} id="left-s" className="w-2.5 h-2.5 bg-white border-2 border-[#242422]/20 rounded-full transition-opacity opacity-0 group-hover:opacity-100 hover:!border-[#FF7612] z-50" />
      <Handle type="target" position={Position.Right} id="right-t" className="w-2.5 h-2.5 bg-white border-2 border-[#242422]/20 rounded-full transition-opacity opacity-0 group-hover:opacity-100 hover:!border-[#FF7612] z-50" />
      <Handle type="source" position={Position.Right} id="right-s" className="w-2.5 h-2.5 bg-white border-2 border-[#242422]/20 rounded-full transition-opacity opacity-0 group-hover:opacity-100 hover:!border-[#FF7612] z-50" />
      <Handle type="target" position={Position.Bottom} id="bottom-t" className="w-2.5 h-2.5 bg-white border-2 border-[#242422]/20 rounded-full transition-opacity opacity-0 group-hover:opacity-100 hover:!border-[#FF7612] z-50" />
      <Handle type="source" position={Position.Bottom} id="bottom-s" className="w-2.5 h-2.5 bg-white border-2 border-[#242422]/20 rounded-full transition-opacity opacity-0 group-hover:opacity-100 hover:!border-[#FF7612] z-50" />
      {data.handles?.map((h: any, i: number) => (
        <Handle key={i} type={h.type} position={h.position} id={h.id} style={h.x !== undefined || h.y !== undefined ? { left: h.x, top: h.y } : undefined} className="opacity-0 w-0 h-0 border-0" />
      ))}
      <div className={cn("h-1.5 w-full", data.type === 'agent' ? "bg-[#FF7612]" : data.type === 'tool' ? "bg-slate-400" : data.type === 'data' ? "bg-purple-400" : data.type === 'safety' ? "bg-amber-500" : data.type === 'memory' ? "bg-teal-400" : data.type === 'io' ? "bg-green-500" : "bg-[#242422]")} />
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
    </div>
  );
};

const nodeTypes = { custom: CustomNodeComponent };

// --- Main Page Component ---
export default function ArchitectPage() {
  const [activeScenarioId, setActiveScenarioId] = useState('B');
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [showPatternModal, setShowPatternModal] = useState(false);
  const [nodes, setNodes] = useNodesState<RFNode>([]);
  const [edges, setEdges] = useEdgesState<Edge>([]);

  // ── Edge interaction state ─────────────────────────────────────────────────
  const [hoveredEdgeId, setHoveredEdgeId] = useState<string | null>(null);
  const [insertToast, setInsertToast] = useState<string | null>(null);

  const onNodesChangeHandler = useCallback((changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)), [setNodes]);
  const onEdgesChangeHandler = useCallback((changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)), [setEdges]);
  const onConnectHandler = useCallback((params: RFConnection) => setEdges((eds) => addEdge(params, eds)), [setEdges]);
  const onReconnectHandler = useCallback(
    (oldEdge: Edge, newConnection: RFConnection) => setEdges((els) => reconnectEdge(oldEdge, newConnection, els)),
    [setEdges]
  );

  // ── Drag: highlight edge when node hovers near it ─────────────────────────
  const onNodeDrag = useCallback(
    (_: React.MouseEvent, draggedNode: RFNode) => {
      const centre = nodeCenter(draggedNode);
      let closest: string | null = null;
      let closestDist = INSERT_THRESHOLD;

      for (const edge of edges) {
        const src = nodes.find((n) => n.id === edge.source);
        const tgt = nodes.find((n) => n.id === edge.target);
        if (!src || !tgt || src.id === draggedNode.id || tgt.id === draggedNode.id) continue;
        const d = distToSegment(centre, nodeCenter(src), nodeCenter(tgt));
        if (d < closestDist) { closestDist = d; closest = edge.id; }
      }
      setHoveredEdgeId(closest);
    },
    [nodes, edges]
  );

  // ── Drag stop: split the edge and insert the node between its endpoints ───
  const onNodeDragStop = useCallback(
    (_: React.MouseEvent, draggedNode: RFNode) => {
      if (!hoveredEdgeId) return;
      const edgeToSplit = edges.find((e) => e.id === hoveredEdgeId);
      if (!edgeToSplit) { setHoveredEdgeId(null); return; }

      const ts = Date.now();
      const baseStyle = edgeToSplit.style ?? { stroke: '#FF7612', strokeWidth: 1.5 };
      const baseMarker = (edgeToSplit as any).markerEnd ?? { type: MarkerType.ArrowClosed, width: 20, height: 20 };

      const newEdge1: Edge = {
        id: `split-${edgeToSplit.source}-${draggedNode.id}-${ts}`,
        source: edgeToSplit.source,
        target: draggedNode.id,
        animated: edgeToSplit.animated,
        style: baseStyle,
        markerEnd: baseMarker,
        reconnectable: true,
      };
      const newEdge2: Edge = {
        id: `split-${draggedNode.id}-${edgeToSplit.target}-${ts + 1}`,
        source: draggedNode.id,
        target: edgeToSplit.target,
        animated: edgeToSplit.animated,
        style: baseStyle,
        markerEnd: baseMarker,
        reconnectable: true,
      };

      setEdges((prev) => [...prev.filter((e) => e.id !== hoveredEdgeId), newEdge1, newEdge2]);
      setHoveredEdgeId(null);

      const srcName = (nodes.find((n) => n.id === edgeToSplit.source)?.data as any)?.name ?? edgeToSplit.source;
      const tgtName = (nodes.find((n) => n.id === edgeToSplit.target)?.data as any)?.name ?? edgeToSplit.target;
      setInsertToast(`Inserted between "${srcName}" → "${tgtName}"`);
      setTimeout(() => setInsertToast(null), 2800);
    },
    [hoveredEdgeId, edges, nodes, setEdges]
  );

  // ── Derived edges: apply green highlight + reconnectable on all edges ─────
  const displayEdges = React.useMemo(
    () => edges.map((e) => {
      const isHovered = e.id === hoveredEdgeId;
      return {
        ...e,
        reconnectable: true,
        style: {
          ...(e.style ?? {}),
          stroke: isHovered ? '#22c55e' : ((e.style as any)?.stroke ?? '#FF7612'),
          strokeWidth: isHovered ? 3 : ((e.style as any)?.strokeWidth ?? 1.5),
          filter: isHovered ? 'drop-shadow(0 0 6px #22c55e88)' : undefined,
        },
      };
    }),
    [edges, hoveredEdgeId]
  );

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
  // ── Node side panel editing state ──────────────────────────────────────────
  const [nodeDetailId, setNodeDetailId] = useState<string | null>(null);
  const [editingNodeName, setEditingNodeName] = useState("");
  const [editingSafetyMode, setEditingSafetyMode] = useState<"pii" | "injection" | "none">("none");
  const [editingDbUrl, setEditingDbUrl] = useState("");
  const [editingDbPerms, setEditingDbPerms] = useState<"read" | "write">("read");

  useEffect(() => {
    if (nodeDetailId) {
      const node = nodes.find(n => n.id === nodeDetailId);
      if (node) {
        setEditingNodeName((node.data as any)?.name || "");
        setEditingSafetyMode((node.data as any)?.safetyMode || "none");
        setEditingDbUrl((node.data as any)?.dbUrl || "postgresql://user:pass@localhost:5432/db");
        setEditingDbPerms((node.data as any)?.dbPerms || "read");
      }
    }
  }, [nodeDetailId]); // Only trigger when the selected node ID changes

  const saveNodeChanges = () => {
    if (!nodeDetailId) return;
    setNodes(nds => nds.map(n => {
      if (n.id === nodeDetailId) {
        return {
          ...n,
          data: {
            ...n.data,
            name: editingNodeName,
            subtitle: editingSafetyMode === 'pii' ? 'PII Filter' : editingSafetyMode === 'injection' ? 'Injection Scan' : (n.data as any)?.subtitle,
            safetyMode: editingSafetyMode,
            dbUrl: editingDbUrl,
            dbPerms: editingDbPerms
          }
        };
      }
      return n;
    }));
    setNodeDetailId(null);
  };

  const deleteNode = () => {
    if (!nodeDetailId) return;
    setNodes(nds => nds.filter(n => n.id !== nodeDetailId));
    setEdges(eds => eds.filter(e => e.source !== nodeDetailId && e.target !== nodeDetailId));
    setNodeDetailId(null);
  };

  const [leftWidth, setLeftWidth] = useState(340);
  const [rightWidth, setRightWidth] = useState(380);
  const [showRightPanel, setShowRightPanel] = useState(true);
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
      if (dragging.current === 'left') setLeftWidth(Math.max(240, Math.min(600, dragStartWidth.current + delta)));
      else setRightWidth(Math.max(280, Math.min(700, dragStartWidth.current - delta)));
    };
    const handleMouseUp = () => { dragging.current = null; document.body.style.cursor = ''; document.body.style.userSelect = ''; };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => { window.removeEventListener('mousemove', handleMouseMove); window.removeEventListener('mouseup', handleMouseUp); };
  }, []);

  const scenario = SCENARIOS[activeScenarioId];

  const typewriter = (text: string, callback: () => void) => {
    setIsTyping(true);
    const thinkingId = `think-${Date.now()}`;
    setMessages(prev => [...prev, { id: thinkingId, role: 'ai', text: '', thinking: true }]);
    const thinkTime = Math.floor(Math.random() * 2000) + 3000;
    setTimeout(() => {
      setMessages(prev => prev.filter(m => m.id !== thinkingId));
      let i = 0;
      const interval = setInterval(() => {
        if (i < text.length) {
          setMessages(prev => {
            const last = prev[prev.length - 1];
            if (last && last.role === 'ai' && last.typing) return [...prev.slice(0, -1), { ...last, text: text.substring(0, i + 1) }];
            return [...prev, { id: Math.random().toString(), role: 'ai', text: text[0], typing: true }];
          });
          i++;
        } else {
          setMessages(prev => { const last = prev[prev.length - 1]; if (last) return [...prev.slice(0, -1), { ...last, typing: false }]; return prev; });
          setIsTyping(false);
          clearInterval(interval);
          callback();
        }
      }, 12);
    }, thinkTime);
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
    setHoveredEdgeId(null);
  };

  const advanceToStep = (stepIdx: number) => {
    if (stepIdx >= scenario.steps.length) return;
    const step = scenario.steps[stepIdx];
    setCurrentStepIndex(stepIdx);
    if (step.nodesToAdd) {
      const newNodes: RFNode[] = step.nodesToAdd.map(n => ({ id: n.id, type: 'custom', position: { x: n.y * 1.8, y: n.x * 1.1 }, data: { type: n.type, name: n.name, subtitle: n.subtitle, status: n.status, locked: n.locked } }));
      setNodes((prev: any) => { const ids = new Set(newNodes.map(n => n.id)); return [...prev.filter((n: any) => !ids.has(n.id)), ...newNodes]; });
    }
    if (step.nodesToUpdate) setNodes((prev: any) => prev.map((n: any) => { const u = step.nodesToUpdate?.find(u => u.id === n.id); return u ? { ...n, data: { ...n.data, ...u } } : n; }));
    if (step.connectionsToAdd) {
      const ts = Date.now();
      setEdges((prev: any) => [...prev, ...step.connectionsToAdd!.map((c, i) => ({ id: `${c.from}-${c.to}-${ts}-${i}`, source: c.from, target: c.to, animated: c.animated, style: { stroke: '#FF7612', strokeWidth: 1.5 }, reconnectable: true }))]);
    }
    if (step.safetyScore !== undefined) setSafetyScore(step.safetyScore);
    if (step.code) setCode(step.code);
    if (step.safetyIssues) setSafetyIssues(step.safetyIssues);
    typewriter(step.chatMessage, () => { if (step.userMessage) setMessages(prev => [...prev, { id: Math.random().toString(), role: 'user', text: step.userMessage! }]); });
  };

  const handleOptionSelect = (option: string) => {
    if (isTyping) return;
    setMessages(prev => [...prev, { id: Math.random().toString(), role: 'user', text: option }]);
    setTimeout(() => advanceToStep(currentStepIndex + 1), 400);
  };

  const handleContinue = () => { if (!isTyping) advanceToStep(currentStepIndex + 1); };

  const handleChatSubmit = () => {
    if (!inputText.trim()) return;
    const lower = inputText.toLowerCase();
    const isInteractive = lower.includes('financial reports') && lower.includes('sql database');
    if (isInteractive) {
      resetWorkspace('C');
      setTimeout(() => {
        setMessages([{ id: Date.now().toString(), role: 'user', text: inputText }]);
        setIsTyping(true);
        const tid = `think-${Date.now()}`;
        setMessages(prev => [...prev, { id: tid, role: 'ai', text: '', thinking: true }]);
        setTimeout(() => {
          setIsTyping(false);
          setMessages(prev => prev.filter(m => m.id !== tid));
          setMessages(prev => [...prev, { id: Date.now().toString(), role: 'ai', text: 'I can help you build a financial report analysis system. Here are two recommended patterns:' }]);
          setShowPatternModal(true);
        }, Math.floor(Math.random() * 2000) + 3000);
      }, 50);
      setInputText('');
      return;
    }

    const isHighVol = lower.includes('high-volume data processing');
    if (isHighVol) {
      setTimeout(() => {
        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', text: inputText }]);
        setIsTyping(true);
        const tid = `think-${Date.now()}`;
        setMessages(prev => [...prev, { id: tid, role: 'ai', text: '', thinking: true }]);
        setTimeout(() => {
          setIsTyping(false);
          setMessages(prev => prev.filter(m => m.id !== tid));
          setMessages(prev => [...prev, { id: Date.now().toString(), role: 'ai', text: 'Updated architecture for high-volume processing with Supervisor Dispatcher, Auto-Scaling Worker Pool, and Batcher Agent Buffer.' }]);
          const hvNodes: RFNode[] = [
            { id: 'hvn-a', type: 'custom', position: { x: 230, y: 0 }, data: { type: 'io', name: 'High Vol File Stream', status: 'healthy' } },
            { id: 'hvn-b', type: 'custom', position: { x: 230, y: 150 }, data: { type: 'agent', name: 'Supervisor Dispatcher', status: 'healthy', handles: [{ id: 'b-in-top', type: 'target', position: Position.Top, x: 70, y: 0 }, { id: 'b-in-feedback', type: 'target', position: Position.Right, x: 140, y: 35 }, { id: 'b-out-left', type: 'source', position: Position.Bottom, x: 35, y: 0 }, { id: 'b-out-right', type: 'source', position: Position.Bottom, x: 105, y: 0 }] } },
            { id: 'hvn-c1', type: 'custom', position: { x: 60, y: 360 }, data: { type: 'agent', name: 'Worker 1', subtitle: 'Extractor', status: 'healthy' } },
            { id: 'hvn-c2', type: 'custom', position: { x: 400, y: 360 }, data: { type: 'agent', name: 'Worker 2', subtitle: 'Extractor', status: 'healthy' } },
            { id: 'hvn-r1', type: 'custom', position: { x: 60, y: 560 }, data: { type: 'agent', name: 'Researcher Agent', status: 'healthy' } },
            { id: 'hvn-r2', type: 'custom', position: { x: 400, y: 560 }, data: { type: 'agent', name: 'Researcher Agent', status: 'healthy' } },
            { id: 'hvn-d', type: 'custom', position: { x: 230, y: 760 }, data: { type: 'agent', name: 'Database Manager', subtitle: 'Buffer & Batcher', status: 'healthy' } },
            { id: 'hvn-e', type: 'custom', position: { x: 230, y: 960 }, data: { type: 'data', name: 'SQL Database', status: 'healthy' } },
          ];
          const mkE = (id: string, src: string, tgt: string, opts: any = {}) => ({ id, source: src, target: tgt, type: 'smoothstep', animated: true, reconnectable: true, style: { stroke: '#FF7612', strokeWidth: 1.5 }, markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20 }, ...opts });
          const hvEdges: Edge[] = [
            mkE('hve-1', 'hvn-a', 'hvn-b'), mkE('hve-2', 'hvn-b', 'hvn-c1'), mkE('hve-3', 'hvn-b', 'hvn-c2'),
            mkE('hve-4', 'hvn-c1', 'hvn-r1'), mkE('hve-5', 'hvn-c2', 'hvn-r2'),
            mkE('hve-6', 'hvn-r1', 'hvn-d', { label: 'Enriched Data' }), mkE('hve-7', 'hvn-r2', 'hvn-d', { label: 'Enriched Data' }),
            mkE('hve-8', 'hvn-d', 'hvn-e', { label: 'Bulk SQL' }),
            mkE('hve-9', 'hvn-e', 'hvn-b', { label: 'Metrics', style: { stroke: '#0D9488', strokeWidth: 2 } }),
          ];
          setNodes(hvNodes);
          setEdges(hvEdges);
        }, Math.floor(Math.random() * 2000) + 3000);
      }, 50);
      setInputText('');
      return;
    }

    if (isTyping) return;
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', text: inputText }]);
    setInputText('');
  };

  const handleSelectPattern = (pattern: 'sequential' | 'supervisor') => {
    setShowPatternModal(false);
    const choiceText = pattern === 'sequential' ? 'Sequential Pattern' : 'Supervisor Pattern';
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', text: `I choose the ${choiceText}.` }]);
    setIsTyping(true);
    const tid = `think-${Date.now()}`;
    setMessages(prev => [...prev, { id: tid, role: 'ai', text: '', thinking: true }]);
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => prev.filter(m => m.id !== tid));
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'ai', text: `Excellent choice. I've scaffolded the ${choiceText} in the workspace.` }]);
      const mkE = (id: string, src: string, tgt: string, extra: any = {}) => ({ id, source: src, target: tgt, type: 'step', animated: true, reconnectable: true, style: { stroke: '#FF7612', strokeWidth: 1.5 }, markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20 }, ...extra });
      if (pattern === 'sequential') {
        setNodes([
          { id: 'seq-n1', type: 'custom', position: { x: 50, y: 450 }, data: { type: 'io', name: 'Financial Report', subtitle: 'Input File', status: 'healthy' } },
          { id: 'seq-n2', type: 'custom', position: { x: 280, y: 250 }, data: { type: 'agent', name: 'Agent A: Ingestor', status: 'healthy' } },
          { id: 'seq-n3', type: 'custom', position: { x: 510, y: 650 }, data: { type: 'agent', name: 'Agent B: Analyst', status: 'healthy' } },
          { id: 'seq-n4', type: 'custom', position: { x: 740, y: 650 }, data: { type: 'agent', name: 'Agent C: DB Updater', status: 'healthy' } },
          { id: 'seq-n5', type: 'custom', position: { x: 970, y: 650 }, data: { type: 'data', name: 'SQL Database', subtitle: 'PostgreSQL', status: 'healthy' } }
        ]);
        setEdges([mkE('se-1', 'seq-n1', 'seq-n2'), mkE('se-2', 'seq-n2', 'seq-n3'), mkE('se-3', 'seq-n3', 'seq-n4'), mkE('se-4', 'seq-n4', 'seq-n5')]);
      } else {
        setNodes([
          { id: 'sup-a', type: 'custom', position: { x: 300, y: 0 }, data: { type: 'io', name: 'Financial Report', status: 'healthy' } },
          { id: 'sup-b', type: 'custom', position: { x: 300, y: 160 }, data: { type: 'agent', name: 'Supervisor Agent', subtitle: 'Coordinator', status: 'healthy' } },
          { id: 'sup-c', type: 'custom', position: { x: 60, y: 390 }, data: { type: 'agent', name: 'Agent: Extractor', status: 'healthy' } },
          { id: 'sup-d', type: 'custom', position: { x: 540, y: 390 }, data: { type: 'agent', name: 'Data Steward', subtitle: 'Research + DB Mgmt', status: 'healthy' } },
          { id: 'sup-e', type: 'custom', position: { x: 300, y: 620 }, data: { type: 'io', name: 'Completed', status: 'healthy' } },
        ]);
        setEdges([
          mkE('sue-1', 'sup-a', 'sup-b'), mkE('sue-2', 'sup-b', 'sup-c', { label: 'Delegate:\nExtract' }), mkE('sue-4', 'sup-b', 'sup-d', { label: 'Delegate:\nResearch' }), mkE('sue-6', 'sup-b', 'sup-e', { label: 'Done' }),
          mkE('sue-3', 'sup-c', 'sup-b', { label: 'Raw Text', style: { stroke: '#0D9488', strokeWidth: 2 } }), mkE('sue-5', 'sup-d', 'sup-b', { label: 'Status', style: { stroke: '#0D9488', strokeWidth: 2 } }),
        ]);
      }
    }, 500);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleChatSubmit(); } };

  useEffect(() => {
    resetWorkspace(activeScenarioId);
    const t = setTimeout(() => advanceToStep(0), 500);
    return () => clearTimeout(t);
  }, [activeScenarioId]);

  return (
    <div className="flex flex-col h-screen bg-[#F7F7F4] text-[#242422] font-sans overflow-hidden">
      {/* Pattern Modal */}
      {showPatternModal && (
        <div className="fixed inset-0 z-[100] bg-[#242422]/40 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl border border-[#242422]/10 shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-[#242422]/8 flex items-center justify-between bg-[#F7F7F4]">
              <div>
                <h2 className="text-lg font-bold">Select Architecture Pattern</h2>
                <p className="text-xs text-[#242422]/50">Choose between Sequential and Supervisor execution patterns.</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setShowPatternModal(false)}><X className="w-5 h-5" /></Button>
            </div>
            <div className="flex-1 overflow-auto p-6 bg-[#F7F7F4]/50">
              <div className="grid grid-cols-2 gap-6 min-h-[400px]">
                {[{ id: 'sequential' as const, title: 'Sequential Pattern', desc: 'Linear pipeline. Best for predictable step-by-step transformations.', nodes: sequentialNodes, edges: sequentialEdges }, { id: 'supervisor' as const, title: 'Supervisor Pattern', desc: 'Delegated execution with feedback loops. Best for robust extraction.', nodes: supervisorNodes, edges: supervisorEdges }].map(p => (
                  <div key={p.id} className="bg-white rounded-xl border border-[#242422]/10 overflow-hidden flex flex-col group hover:border-[#FF7612]/50 transition-colors shadow-sm cursor-pointer" onClick={() => handleSelectPattern(p.id)}>
                    <div className="p-4 border-b border-[#242422]/5 bg-gradient-to-br from-white to-[#F7F7F4]">
                      <h3 className="font-bold text-sm">{p.title}</h3>
                      <p className="text-[11px] text-[#242422]/50 mt-1">{p.desc}</p>
                    </div>
                    <div className="flex-1 relative bg-slate-50/50 min-h-[250px]">
                      <ReactFlow nodes={p.nodes} edges={p.edges} fitView proOptions={{ hideAttribution: true }} zoomOnScroll={false} panOnDrag={false} className="pointer-events-none" />
                    </div>
                    <div className="p-3 border-t border-[#242422]/5 bg-[#F7F7F4] text-center">
                      <span className="text-xs font-bold text-[#FF7612]">Select {p.title}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top Bar */}
      <header className="h-[56px] min-h-[56px] bg-white border-b border-[#242422]/8 flex items-center justify-between px-6 z-50">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="p-2 hover:bg-[#242422]/5 rounded-md transition-colors"><ArrowLeft className="w-5 h-5" /></Link>
          <div className="flex items-center gap-2 text-sm font-medium">
            <span className="text-[#242422]/50">Projects</span><span className="text-[#242422]/20">/</span>
            <span className="text-[#242422]">Sales Lead Automation</span>
          </div>
          <Badge variant="outline" className="h-5 text-[10px] font-bold border-[#242422]/10 bg-[#242422]/3 text-[#242422]/50">● DRAFT</Badge>
        </div>
        <div className="flex items-center gap-3">
          <h1 className="text-sm font-bold tracking-tight px-3 py-1 bg-[#F2F1ED] rounded-md border border-[#242422]/5">{scenario.title}</h1>
          <Badge variant="secondary" className="bg-[#FF7612]/10 text-[#FF7612] border-none text-[10px] font-bold h-5 uppercase">{scenario.framework}</Badge>
          <Badge variant="outline" className="border-[#FF7612]/30 text-[#FF7612] text-[10px] font-bold h-5 uppercase">{scenario.blueprint}</Badge>
        </div>
        <div className="flex items-center gap-4">
          <div className={cn("w-9 h-9 rounded-full flex items-center justify-center border-2 font-bold text-xs", safetyScore >= 90 ? "border-green-500 text-green-500" : safetyScore >= 70 ? "border-amber-500 text-amber-500" : "border-destructive text-destructive")}>{safetyScore}</div>
          <Button variant="outline" size="sm" className="h-8 border-[#242422]/10 bg-transparent hover:bg-[#242422]/5 gap-2 text-xs font-bold"><ShieldCheck className="w-3.5 h-3.5" /> Safety Scan</Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" className="h-8 bg-[#FF7612] hover:bg-[#FF9E57] text-white gap-2 text-xs font-bold shadow-none">Compile & Export <ChevronDown className="w-3.5 h-3.5" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-white border-[#242422]/10 text-[#242422] w-48">
              <DropdownMenuItem>Export to LangChain</DropdownMenuItem>
              <DropdownMenuItem className="font-bold text-[#FF7612]">Export to CrewAI ✓</DropdownMenuItem>
              <DropdownMenuItem>Export to LangGraph</DropdownMenuItem>
              <DropdownMenuSeparator className="bg-[#242422]/5" />
              <DropdownMenuItem>Download .zip</DropdownMenuItem>
              <DropdownMenuItem>Push to GitHub</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-[#242422]/40 hover:text-[#242422]"><MoreHorizontal className="w-5 h-5" /></Button>
          <div className="h-4 w-[1px] bg-[#242422]/10 mx-1" />
          <Button variant="ghost" size="icon" className={cn("h-8 w-8 transition-colors", showRightPanel ? "text-[#FF7612] bg-[#FF7612]/10" : "text-[#242422]/40 hover:text-[#242422]")} onClick={() => setShowRightPanel(!showRightPanel)}>
            {showRightPanel ? <PanelRightClose className="w-5 h-5" /> : <PanelRightOpen className="w-5 h-5" />}
          </Button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel */}
        <aside style={{ width: leftWidth, minWidth: 240, maxWidth: 600 }} className="border-r border-[#242422]/8 bg-white flex flex-col relative shrink-0">
          <div className="h-[44px] px-4 flex items-center justify-between border-b border-[#242422]/8 bg-[#F7F7F4]">
            <span className="text-[10px] font-bold text-[#242422]/40 uppercase tracking-widest flex items-center gap-1.5"><Shapes className="w-3.5 h-3.5 text-[#FF7612]" /> Argus Architect</span>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="w-7 h-7 text-[#242422]/40 hover:text-[#242422]"><History className="w-3.5 h-3.5" /></Button>
              <Button variant="ghost" size="icon" className="w-7 h-7 text-[#242422]/40 hover:text-[#242422]"><Maximize2 className="w-3.5 h-3.5" /></Button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            <div className="space-y-1.5 mb-6">
              <div className="flex justify-between text-[10px] font-bold text-[#242422]/40">
                <span>PROGRESS</span><span>STEP {Math.max(currentStepIndex + 1, 0)} OF {scenario.steps.length}</span>
              </div>
              <div className="h-1 w-full bg-[#242422]/5 rounded-full overflow-hidden flex gap-0.5">
                {scenario.steps.map((_, i) => (<div key={i} className={cn("h-full flex-1 transition-colors", i <= currentStepIndex ? "bg-[#FF7612]" : "bg-[#242422]/10")} />))}
              </div>
            </div>
            {messages.map((m) => (
              <div key={m.id} className={cn("flex flex-col gap-1 max-w-[90%]", m.role === 'user' ? "ml-auto items-end" : "items-start")}>
                {m.role === 'ai' && (
                  <div className={cn("p-3 rounded-lg text-sm leading-relaxed border-l-2", m.type === 'alert' ? "bg-red-50 border-destructive text-[#242422]" : m.type === 'suggestion' ? "bg-amber-50 border-amber-500 text-[#242422]" : "bg-[#FF7612]/5 border-[#FF7612] text-[#242422]", m.thinking && "flex items-center gap-1.5 h-10 px-4")}>
                    {m.type === 'alert' && !m.thinking && <div className="text-[10px] font-bold text-destructive mb-1 uppercase tracking-widest">⚠ Safety Alert</div>}
                    {m.type === 'suggestion' && !m.thinking && <div className="text-[10px] font-bold text-amber-500 mb-1 uppercase tracking-widest">💡 Suggestion</div>}
                    {m.thinking ? (<><div className="w-1.5 h-1.5 bg-[#FF7612] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} /><div className="w-1.5 h-1.5 bg-[#FF7612] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} /><div className="w-1.5 h-1.5 bg-[#FF7612] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} /></>) : (<>{m.text}{m.typing && <span className="inline-block w-1.5 h-4 bg-[#FF7612] animate-pulse ml-1 align-middle" />}</>)}
                  </div>
                )}
                {m.role === 'user' && <div className="p-3 rounded-lg bg-[#F2F1ED] border border-[#242422]/5 text-sm text-[#242422]">{m.text}</div>}
              </div>
            ))}
            {currentStepIndex < scenario.steps.length && scenario.steps[currentStepIndex]?.options && !isTyping && (
              <div className="grid grid-cols-1 gap-2 pt-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                {scenario.steps[currentStepIndex].options?.map(opt => (
                  <Button key={opt} variant="outline" onClick={() => handleOptionSelect(opt)} className="justify-start text-left h-auto py-3 px-4 border-[#242422]/10 bg-[#F2F1ED] hover:bg-[#FF7612]/5 hover:border-[#FF7612]/40 transition-all group">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full border border-[#242422]/20 group-hover:border-[#FF7612] transition-colors flex items-center justify-center"><div className="w-2 h-2 rounded-full bg-[#FF7612] opacity-0 group-hover:opacity-100 transition-opacity" /></div>
                      <span className="text-xs font-medium">{opt}</span>
                    </div>
                  </Button>
                ))}
              </div>
            )}
            {currentStepIndex >= 0 && currentStepIndex + 1 < scenario.steps.length && !scenario.steps[currentStepIndex]?.options && !isTyping && (
              <div className="pt-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <Button onClick={handleContinue} className="w-full h-9 text-xs font-bold bg-[#FF7612]/10 border border-[#FF7612]/20 hover:bg-[#FF7612]/15 text-[#FF7612] gap-2">Continue <Play className="w-3 h-3 fill-current" /></Button>
              </div>
            )}
            <div id="chat-bottom" />
          </div>
          <div className="p-4 border-t border-[#242422]/8 space-y-3 bg-white">
            <div className="relative">
              <textarea value={inputText} onChange={(e) => setInputText(e.target.value)} onKeyDown={handleKeyDown} placeholder="Ask Argus Architect anything..." className="w-full bg-[#F7F7F4] border border-[#242422]/10 rounded-xl p-3 pr-10 text-xs text-[#242422] placeholder:text-[#242422]/30 outline-none focus:border-[#FF7612]/50 resize-none min-h-[60px]" />
              <Button size="icon" onClick={handleChatSubmit} className="absolute right-2 bottom-2 h-7 w-7 bg-[#FF7612] rounded-lg text-white"><Send className="w-3.5 h-3.5" /></Button>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" className="h-6 w-6 text-[#242422]/30 hover:text-[#242422]"><Paperclip className="w-3.5 h-3.5" /></Button>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-[#242422]/30 hover:text-[#242422]"><Mic className="w-3.5 h-3.5" /></Button>
              </div>
              <span className="text-[10px] text-[#242422]/30 italic">⌘ Enter to send</span>
            </div>
            <div className="border-t border-[#242422]/8 pt-3">
              <span className="text-[9px] font-bold text-[#242422]/40 uppercase tracking-widest mb-2 block">Scenarios</span>
              <div className="flex flex-wrap gap-1.5">
                {Object.values(SCENARIOS).map(s => (
                  <button key={s.id} onClick={() => setActiveScenarioId(s.id)} className={cn("px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all", activeScenarioId === s.id ? "bg-[#FF7612] border-[#FF7612] text-white" : "bg-transparent border-[#242422]/10 text-[#242422]/50 hover:text-[#242422] hover:border-[#242422]/20")}>{s.id}: {s.title}</button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        <div onMouseDown={(e) => handleMouseDown('left', e)} className="w-1 hover:w-1.5 bg-transparent hover:bg-[#FF7612]/30 cursor-col-resize transition-all shrink-0 relative group z-20"><div className="absolute inset-y-0 -left-1 -right-1" /></div>

        {/* Center Panel */}
        <main className="flex-1 bg-[#F7F7F4] relative flex flex-col overflow-hidden">
          <div className="h-[44px] px-6 flex items-center justify-between border-b border-[#242422]/8 bg-white z-10">
            <span className="text-[10px] font-bold text-[#242422]/40 uppercase tracking-widest flex items-center gap-2"><Database className="w-3.5 h-3.5" /> Architecture Blueprint</span>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="h-7 text-[10px] font-bold border border-[#242422]/10 hover:bg-[#242422]/5 gap-1.5 uppercase tracking-wider"><Download className="w-3 h-3" /> Export SVG</Button>
              <div className="flex gap-1 border border-[#242422]/10 rounded-md p-0.5">
                <Button variant="ghost" size="icon" className="h-6 w-6"><ZoomIn className="w-3.5 h-3.5" /></Button>
                <Button variant="ghost" size="icon" className="h-6 w-6"><ZoomOut className="w-3.5 h-3.5" /></Button>
                <Button variant="ghost" size="icon" className="h-6 w-6"><Maximize className="w-3.5 h-3.5" /></Button>
              </div>
            </div>
          </div>

          <div className="flex-1 relative overflow-hidden w-full h-full">
            <ReactFlow
              nodes={nodes as any}
              edges={displayEdges as any}
              onNodesChange={onNodesChangeHandler}
              onEdgesChange={onEdgesChangeHandler}
              onConnect={onConnectHandler}
              onReconnect={onReconnectHandler}
              onNodeDrag={onNodeDrag}
              onNodeDragStop={onNodeDragStop}
              nodeTypes={nodeTypes as any}
              onNodeClick={(_, node) => setNodeDetailId(node.id)}
              defaultEdgeOptions={{ style: { strokeWidth: 1.5 }, reconnectable: true } as any}
              fitView
              colorMode="light"
              className="bg-[radial-gradient(circle_at_center,_rgba(36,36,34,0.04)_1px,_transparent_1px)] bg-[length:24px_24px]"
            >
              <Background gap={24} size={1} color="rgba(36,36,34,0.06)" />
              <Controls className="bg-white border-[#242422]/10 fill-[#242422]" />
            </ReactFlow>

            {/* Insert-node hint banner */}
            {hoveredEdgeId && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 px-4 py-2 bg-green-500 text-white text-[11px] font-bold rounded-full shadow-lg animate-in fade-in slide-in-from-top-2 duration-200 pointer-events-none">
                <GitMerge className="w-3.5 h-3.5" />
                Release to insert this node here
              </div>
            )}

            {/* Success toast */}
            {insertToast && (
              <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 px-4 py-2 bg-[#242422] text-white text-[11px] font-bold rounded-full shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-200 pointer-events-none">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                {insertToast}
              </div>
            )}

            {/* Node Detail Sidebar */}
            {nodeDetailId && (
              <div className="absolute top-0 right-0 h-full w-[280px] bg-white border-l border-[#FF7612]/30 shadow-[-10px_0_30px_rgba(0,0,0,0.05)] z-20 animate-in slide-in-from-right duration-300 p-6 space-y-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1 mr-4">
                    <input
                      value={editingNodeName}
                      onChange={(e) => setEditingNodeName(e.target.value)}
                      className="text-sm font-bold w-full bg-transparent border-b border-transparent focus:border-[#FF7612]/50 outline-none pb-0.5"
                    />
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest leading-none mt-1">{(nodes.find((n: any) => n.id === nodeDetailId)?.data as any)?.type}</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setNodeDetailId(null)} className="h-6 w-6 text-[#242422]/40 hover:text-[#242422] shrink-0"><X className="w-4 h-4" /></Button>
                </div>
                <div className="space-y-4">
                  {(nodes.find((n: any) => n.id === nodeDetailId)?.data as any)?.type === 'safety' ? (
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase">Safety Options</label>
                      <div className="space-y-2">
                        <div
                          onClick={() => setEditingSafetyMode(editingSafetyMode === 'pii' ? 'none' : 'pii')}
                          className={cn("flex items-center justify-between p-2 rounded-lg border cursor-pointer transition-colors", editingSafetyMode === 'pii' ? "bg-[#F7F7F4] border-[#FF7612]/50" : "bg-white border-[#242422]/5")}
                        >
                          <span className="text-[11px] font-medium">PII Filtering</span>
                          <Badge className={cn("border-none text-[8px]", editingSafetyMode === 'pii' ? "bg-green-500/20 text-green-500" : "bg-zinc-100 text-zinc-400")}>{editingSafetyMode === 'pii' ? "ACTIVE" : "INACTIVE"}</Badge>
                        </div>
                        <div
                          onClick={() => setEditingSafetyMode(editingSafetyMode === 'injection' ? 'none' : 'injection')}
                          className={cn("flex items-center justify-between p-2 rounded-lg border cursor-pointer transition-colors", editingSafetyMode === 'injection' ? "bg-[#F7F7F4] border-[#FF7612]/50" : "bg-white border-[#242422]/5")}
                        >
                          <span className="text-[11px] font-medium">Injection Scan</span>
                          <Badge className={cn("border-none text-[8px]", editingSafetyMode === 'injection' ? "bg-green-500/20 text-green-500" : "bg-zinc-100 text-zinc-400")}>{editingSafetyMode === 'injection' ? "ACTIVE" : "INACTIVE"}</Badge>
                        </div>
                      </div>
                    </div>
                  ) : (nodes.find((n: any) => n.id === nodeDetailId)?.data as any)?.type === 'data' ? (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase">Connection Details</label>
                        <div className="space-y-2">
                          <input
                            value={editingDbUrl}
                            onChange={(e) => setEditingDbUrl(e.target.value)}
                            placeholder="postgresql://..."
                            className="w-full bg-[#F7F7F4] border border-[#242422]/10 rounded-lg p-2.5 text-xs text-[#242422] outline-none focus:border-[#FF7612]/50"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase">Permissions</label>
                        <div className="flex gap-2">
                          <div
                            onClick={() => setEditingDbPerms("read")}
                            className={cn("flex-1 text-center p-2 rounded-lg border cursor-pointer transition-colors text-xs font-medium", editingDbPerms === "read" ? "bg-[#FF7612]/10 border-[#FF7612]/50 text-[#FF7612]" : "bg-[#F7F7F4] border-[#242422]/5 text-[#242422]/60 hover:text-[#242422]")}
                          >
                            Read-Only
                          </div>
                          <div
                            onClick={() => setEditingDbPerms("write")}
                            className={cn("flex-1 text-center p-2 rounded-lg border cursor-pointer transition-colors text-xs font-medium", editingDbPerms === "write" ? "bg-red-500/10 border-red-500/50 text-red-600" : "bg-[#F7F7F4] border-[#242422]/5 text-[#242422]/60 hover:text-[#242422]")}
                          >
                            Read / Write
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase">Configuration</label>
                      <div className="p-3 bg-[#F7F7F4] rounded-lg border border-[#242422]/5 text-xs">
                        <div className="flex justify-between mb-2"><span>Model</span><span className="text-[#FF7612] font-bold italic">GPT-4o-mini</span></div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px]"><span>Temperature</span><span>0.3</span></div>
                          <div className="h-1 w-full bg-[#242422]/10 rounded-full"><div className="h-full w-1/3 bg-[#FF7612] rounded-full" /></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="pt-4 border-t border-[#242422]/5">
                  <Button onClick={saveNodeChanges} className="w-full bg-[#FF7612] hover:bg-[#FF9E57] text-white font-bold h-9 shadow-none">Save Node Changes</Button>
                  <Button onClick={deleteNode} variant="ghost" className="w-full text-destructive hover:bg-destructive/10 mt-2 text-[11px] font-bold">Delete Node</Button>
                </div>
              </div>
            )}

            {/* Canvas Legend */}
            <div className="absolute bottom-6 left-6 p-3 bg-white/90 backdrop-blur-md border border-[#242422]/10 rounded-lg flex gap-4 text-[10px] font-bold text-[#242422]/50 z-10 shadow-sm">
              {(['agent', 'tool', 'data', 'safety', 'io'] as NodeType[]).map(t => (
                <div key={t} onClick={() => handleAddNode(t)} className="flex items-center gap-1.5 cursor-pointer hover:text-[#242422] transition-colors">
                  <div className={cn("w-2 h-2 rounded-sm", t === 'agent' ? "bg-[#FF7612]" : t === 'tool' ? "bg-slate-400" : t === 'data' ? "bg-purple-400" : t === 'safety' ? "bg-amber-500" : "bg-green-500")} />
                  {t.toUpperCase()}
                </div>
              ))}
            </div>

            {/* Edge interaction hint */}
            <div className="absolute bottom-6 right-6 p-3 bg-white/90 backdrop-blur-md border border-[#242422]/10 rounded-lg text-[10px] font-bold text-[#242422]/40 z-10 shadow-sm space-y-1.5 max-w-[210px]">
              <p className="flex items-center gap-1.5"><GitMerge className="w-3 h-3 text-[#FF7612] shrink-0" /> Drag a node onto an edge to insert it between two nodes</p>
              <p className="flex items-center gap-1.5"><span className="text-green-500 shrink-0">↔</span> Drag an edge endpoint to reconnect it to a different node</p>
            </div>
          </div>
        </main>

        {showRightPanel && (
          <div onMouseDown={(e) => handleMouseDown('right', e)} className="w-1 hover:w-1.5 bg-transparent hover:bg-primary/40 cursor-col-resize transition-all shrink-0 relative group z-20"><div className="absolute inset-y-0 -left-1 -right-1" /></div>
        )}

        {/* Right Panel */}
        {showRightPanel && (
          <aside style={{ width: rightWidth, minWidth: 280, maxWidth: 700 }} className="border-l border-[#242422]/8 bg-white flex flex-col shrink-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full h-full flex flex-col">
              <TabsList className="h-[44px] w-full bg-[#F7F7F4] border-b border-[#242422]/8 rounded-none p-0 flex">
                {[{ id: 'code', icon: <Code className="w-3.5 h-3.5" />, label: 'Code' }, { id: 'safety', icon: <ShieldAlert className="w-3.5 h-3.5" />, label: 'Safety' }, { id: 'docs', icon: <FileText className="w-3.5 h-3.5" />, label: 'Docs' }, { id: 'diagram', icon: <Share2 className="w-3.5 h-3.5" />, label: 'Diagram' }].map(tab => (
                  <TabsTrigger key={tab.id} value={tab.id} className="flex-1 h-full rounded-none data-[state=active]:bg-[#FF7612]/5 data-[state=active]:border-b-2 data-[state=active]:border-[#FF7612] transition-all text-[10px] font-bold uppercase tracking-widest gap-2 relative">
                    {tab.icon} {tab.label}
                    {tab.id === 'safety' && safetyIssues.length > 0 && <span className="absolute top-2 right-4 w-1.5 h-1.5 bg-destructive rounded-full" />}
                  </TabsTrigger>
                ))}
              </TabsList>
              <div className="flex-1 overflow-hidden">
                <TabsContent value="code" className="m-0 h-full"><VSCodePanel code={code} isTyping={isTyping} /></TabsContent>
                <TabsContent value="safety" className="m-0 h-full p-6 space-y-6 overflow-y-auto custom-scrollbar">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold">Safety Report</h3>
                    <div className="flex gap-2">
                      <Badge className="bg-destructive/10 text-destructive border-none text-[9px] font-bold">{safetyIssues.filter(i => i.type === 'critical').length} CRITICAL</Badge>
                      <Badge className="bg-amber-500/10 text-amber-500 border-none text-[9px] font-bold">{safetyIssues.filter(i => i.type === 'warning').length} WARNING</Badge>
                    </div>
                  </div>
                  <div className={cn("p-4 rounded-xl border flex flex-col gap-2 items-center text-center", safetyIssues.some(i => i.type === 'critical') ? "bg-destructive/5 border-destructive/20" : "bg-green-500/5 border-green-500/20")}>
                    <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", safetyIssues.some(i => i.type === 'critical') ? "bg-destructive/20 text-destructive" : "bg-green-500/20 text-green-500")}>
                      {safetyIssues.some(i => i.type === 'critical') ? <XCircle className="w-6 h-6" /> : <CheckCircle2 className="w-6 h-6" />}
                    </div>
                    <h4 className="font-bold text-sm">{safetyIssues.some(i => i.type === 'critical') ? "🚫 DEPLOYMENT BLOCKED" : "✅ CLEARED FOR DEPLOYMENT"}</h4>
                    <p className="text-[10px] text-muted-foreground">{safetyIssues.some(i => i.type === 'critical') ? "Critical vulnerabilities must be resolved." : "Architecture meets all enterprise safety requirements."}</p>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Detected Issues</label>
                    {safetyIssues.length === 0 ? (
                      <div className="p-8 text-center border border-dashed border-[#242422]/10 rounded-xl"><ShieldCheck className="w-8 h-8 text-[#242422]/10 mx-auto mb-2" /><p className="text-[10px] text-muted-foreground">No issues detected.</p></div>
                    ) : safetyIssues.map((issue, idx) => (
                      <div key={idx} className={cn("p-3 rounded-lg border group", issue.type === 'critical' ? "bg-destructive/5 border-destructive/10" : issue.type === 'warning' ? "bg-amber-500/5 border-amber-500/10" : "bg-green-500/5 border-green-500/10")}>
                        <div className="flex items-center gap-2">
                          {issue.type === 'critical' ? <AlertTriangle className="w-3.5 h-3.5 text-destructive" /> : issue.type === 'warning' ? <Info className="w-3.5 h-3.5 text-amber-500" /> : <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />}
                          <span className={cn("text-[11px] font-bold uppercase", issue.type === 'critical' ? "text-destructive" : issue.type === 'warning' ? "text-amber-500" : "text-green-500")}>{issue.title}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  {safetyIssues.some(i => i.type === 'critical') && <Button className="w-full bg-[#FF7612] hover:bg-[#FF9E57] text-white font-bold h-10 shadow-none">Fix All Critical Issues</Button>}
                </TabsContent>
                <TabsContent value="docs" className="m-0 h-full p-6 space-y-6 overflow-y-auto custom-scrollbar prose">
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold">Architecture Documentation</h3>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">AUTO-GENERATED BY ARGUS AI · UPDATED LIVE</p>
                  </div>
                  <section>
                    <h4 className="text-sm font-bold border-b border-[#242422]/5 pb-2">{scenario.title}</h4>
                    <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed">This agent implements the <strong>{scenario.blueprint}</strong> pattern on top of the <strong>{scenario.framework}</strong> runtime.</p>
                  </section>
                  <section className="space-y-3">
                    <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Active Components</h4>
                    <div className="space-y-2">
                      {nodes.map((n: any) => (
                        <div key={n.id} className="p-3 bg-[#F7F7F4] border border-[#242422]/5 rounded-lg flex items-center justify-between">
                          <div><p className="text-[11px] font-bold">{n.data?.name}</p><p className="text-[9px] text-muted-foreground">{n.data?.subtitle || n.data?.type}</p></div>
                          <Badge variant="ghost" className="text-[8px] opacity-50 uppercase tracking-tighter">CONFIGURED</Badge>
                        </div>
                      ))}
                    </div>
                  </section>
                </TabsContent>
                <TabsContent value="diagram" className="m-0 h-full flex flex-col p-6 items-center justify-center text-center space-y-4">
                  <div className="w-full aspect-square max-w-[280px] border border-[#242422]/10 rounded-2xl bg-[#F7F7F4] flex items-center justify-center relative overflow-hidden group">
                    <Shapes className="w-24 h-24 text-[#FF7612]/15 group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center"><Button variant="outline" className="h-9 font-bold text-xs bg-white border-[#242422]/10">Export High-Res SVG</Button></div>
                  </div>
                  <div className="space-y-1"><p className="text-sm font-bold">Production Blueprint</p><p className="text-[10px] text-muted-foreground">Vetted architectural diagram for stakeholder review.</p></div>
                  <div className="grid grid-cols-2 gap-2 w-full pt-4">
                    <Button variant="secondary" className="h-8 text-[10px] font-bold bg-[#F2F1ED] hover:bg-[#EBEAE5]">Copy Link</Button>
                    <Button variant="secondary" className="h-8 text-[10px] font-bold bg-[#F2F1ED] hover:bg-[#EBEAE5]">Export PNG</Button>
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </aside>
        )}
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(36,36,34,0.08); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(36,36,34,0.15); }
      `}</style>
    </div>
  );
}

function Copy({ className }: { className?: string }) {
  return (<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>);
}

function XCircle({ className }: { className?: string }) {
  return (<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>);
}