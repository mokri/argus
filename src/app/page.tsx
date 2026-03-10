
"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  ChevronRight, 
  Shield, 
  Lock, 
  Link as LinkIcon, 
  CheckCircle2, 
  Play, 
  ArrowRight,
  Github,
  Twitter,
  Linkedin,
  X,
  Menu,
  Shapes
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isBannerVisible, setIsBannerVisible] = useState(true);
  const [isAnnual, setIsAnnual] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 80);
    };
    window.addEventListener('scroll', handleScroll);
    
    const observerOptions = {
      threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-fade-up');
          entry.target.classList.remove('opacity-0');
        }
      });
    }, observerOptions);

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

    return () => {
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-[#F1F5F9] font-body selection:bg-primary/30 relative">
      {/* Noise Texture Overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-[100] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

      {/* Top Banner */}
      {isBannerVisible && (
        <div className="bg-[#6366F1] text-white py-2 px-4 text-center text-sm font-medium relative z-[110]">
          <p>🚀 Project Argus AI is now in private beta — <Link href="#waitlist" className="underline underline-offset-4 hover:opacity-80 transition-opacity">Join the waitlist →</Link></p>
          <button onClick={() => setIsBannerVisible(false)} className="absolute right-4 top-1/2 -translate-y-1/2 hover:scale-110 transition-transform">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-[105] transition-all duration-300 border-b border-transparent ${isScrolled ? 'bg-[#0A0A0F]/80 backdrop-blur-md py-3 border-white/5' : 'bg-transparent py-6'}`}>
        <div className="max-w-[1200px] mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-white uppercase italic">Argus AI</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link href="#product" className="text-sm font-medium text-[#64748B] hover:text-white transition-colors">Product</Link>
            <Link href="#pricing" className="text-sm font-medium text-[#64748B] hover:text-white transition-colors">Pricing</Link>
            <Link href="#" className="text-sm font-medium text-[#64748B] hover:text-white transition-colors">Docs</Link>
            <Link href="#" className="text-sm font-medium text-[#64748B] hover:text-white transition-colors">Blog</Link>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-sm font-medium text-[#64748B] hover:text-white transition-colors hidden sm:block">Sign In</Link>
            <Button className="bg-[#6366F1] hover:bg-[#818CF8] text-white rounded-full px-6 h-10 font-semibold shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95">
              Get Early Access
            </Button>
            <Menu className="w-6 h-6 md:hidden text-white cursor-pointer" />
          </div>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="pt-40 pb-24 px-6 overflow-hidden">
          <div className="max-w-[1200px] mx-auto text-center space-y-8">
            <div className="reveal opacity-0 transition-all duration-700 delay-100 flex justify-center">
              <span className="inline-flex items-center px-4 py-1 rounded-full border border-primary/30 bg-primary/5 text-primary text-xs font-bold uppercase tracking-widest">
                The Production Gap is Over
              </span>
            </div>
            
            <h1 className="reveal opacity-0 transition-all duration-700 delay-200 text-5xl md:text-7xl font-bold tracking-tight text-white max-w-4xl mx-auto leading-[1.1]">
              The Civil Infrastructure <br />
              for <span className="bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-transparent bg-clip-text">AI Agents</span>
            </h1>

            <p className="reveal opacity-0 transition-all duration-700 delay-300 text-[#64748B] text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
              Argus AI is the first Architectural Intelligence & Safety Platform for autonomous agents. We turn Wild West scripts into production-grade software.
            </p>

            <div className="reveal opacity-0 transition-all duration-700 delay-400 flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Button className="h-14 px-10 rounded-full bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white font-bold text-base shadow-xl shadow-primary/30 hover:shadow-primary/50 transition-all hover:scale-105 active:scale-95 group">
                Get Early Access <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button variant="ghost" className="h-14 px-10 rounded-full text-white font-bold text-base border border-white/5 hover:bg-white/5 gap-2">
                <Play className="w-4 h-4 fill-current" /> See a Live Demo
              </Button>
            </div>
            
            <p className="reveal opacity-0 transition-all duration-700 delay-500 text-[#64748B] text-sm">
              No credit card required · Used by 200+ engineers
            </p>

            {/* Mock UI Visual */}
            <div className="reveal opacity-0 transition-all duration-1000 delay-600 mt-20 relative">
              <div className="p-[1px] rounded-2xl bg-gradient-to-b from-white/10 to-transparent shadow-2xl">
                <div className="bg-[#111118] rounded-2xl border border-white/5 overflow-hidden flex flex-col md:flex-row h-[500px] shadow-inner">
                  {/* Left Panel: Chat */}
                  <div className="w-full md:w-1/3 border-r border-white/5 p-6 flex flex-col gap-4 bg-black/20">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-3 h-3 rounded-full bg-destructive/50" />
                      <div className="w-3 h-3 rounded-full bg-amber-500/50" />
                      <div className="w-3 h-3 rounded-full bg-green-500/50" />
                    </div>
                    <div className="space-y-4">
                      <div className="bg-white/5 p-3 rounded-lg rounded-tl-none self-start max-w-[80%]">
                        <p className="text-xs text-muted-foreground mb-1 font-bold">USER</p>
                        <p className="text-sm">Can you research our competitors and draft a summary email?</p>
                      </div>
                      <div className="bg-primary/10 p-3 rounded-lg rounded-tr-none self-end max-w-[80%] border border-primary/20">
                        <p className="text-xs text-primary mb-1 font-bold">ARGUS AGENT</p>
                        <p className="text-sm animate-typing overflow-hidden whitespace-nowrap border-r-2 border-primary">Analyzing request... Starting swarm.</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Right Panel: Graph */}
                  <div className="flex-1 p-6 relative bg-[radial-gradient(circle_at_center,_rgba(99,102,241,0.03)_0%,_transparent_70%)]">
                    <div className="absolute top-6 right-6 flex flex-col gap-2">
                      <div className="bg-green-500/10 border border-green-500/20 px-3 py-1 rounded-full flex items-center gap-2 text-[10px] font-bold text-green-500">
                        <CheckCircle2 className="w-3 h-3" /> SAFETY CHECK ✓
                      </div>
                      <div className="bg-primary/10 border border-primary/20 px-3 py-1 rounded-full flex items-center gap-2 text-[10px] font-bold text-primary">
                        VENDOR AGNOSTIC
                      </div>
                      <div className="bg-white/5 border border-white/10 px-3 py-1 rounded-full flex items-center gap-2 text-[10px] font-bold text-muted-foreground">
                        HIPAA READY
                      </div>
                    </div>

                    <div className="h-full flex items-center justify-center">
                      <svg className="w-full h-full max-w-lg" viewBox="0 0 400 300">
                        {/* Lines */}
                        <line x1="200" y1="50" x2="100" y2="150" stroke="rgba(255,255,255,0.1)" strokeWidth="2" strokeDasharray="4 4" />
                        <line x1="200" y1="50" x2="300" y2="150" stroke="rgba(255,255,255,0.1)" strokeWidth="2" strokeDasharray="4 4" />
                        <line x1="300" y1="150" x2="300" y2="250" stroke="rgba(255,255,255,0.1)" strokeWidth="2" strokeDasharray="4 4" />
                        
                        {/* Nodes */}
                        <g transform="translate(200, 50)">
                          <rect x="-60" y="-20" width="120" height="40" rx="8" fill="#1A1A24" stroke="#6366F1" strokeWidth="1" />
                          <text y="5" textAnchor="middle" fill="white" className="text-[12px] font-bold">Supervisor Agent</text>
                        </g>

                        <g transform="translate(100, 150)">
                          <rect x="-50" y="-20" width="100" height="40" rx="8" fill="#1A1A24" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                          <text y="5" textAnchor="middle" fill="#64748B" className="text-[12px] font-bold">Researcher</text>
                          <rect x="10" y="25" width="40" height="12" rx="2" fill="rgba(255,255,255,0.05)" />
                          <text x="30" y="34" textAnchor="middle" fill="#64748B" className="text-[8px]">MCP</text>
                        </g>

                        <g transform="translate(300, 150)">
                          <rect x="-50" y="-20" width="100" height="40" rx="8" fill="#1A1A24" stroke="#F59E0B" strokeWidth="1" />
                          <text y="5" textAnchor="middle" fill="white" className="text-[12px] font-bold">Writer</text>
                          <circle cx="55" cy="-15" r="8" fill="#EF4444" className="animate-pulse" />
                          <text x="55" y="-12" textAnchor="middle" fill="white" className="text-[10px] font-bold">!</text>
                          <rect x="-70" y="-60" width="140" height="30" rx="4" fill="#EF4444" />
                          <text x="0" y="-40" textAnchor="middle" fill="white" className="text-[10px] font-bold">⚠ Injection Risk Detected</text>
                        </g>

                        <g transform="translate(300, 250)">
                          <rect x="-60" y="-20" width="120" height="40" rx="8" fill="rgba(34,197,94,0.1)" stroke="#22C55E" strokeWidth="1" />
                          <text y="5" textAnchor="middle" fill="#22C55E" className="text-[12px] font-bold">Gmail (Draft Only 🔒)</text>
                        </g>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Social Proof Bar */}
        <section className="py-12 border-y border-white/5 bg-white/[0.01]">
          <div className="max-w-[1200px] mx-auto px-6 flex flex-col md:flex-row items-center gap-8">
            <span className="text-xs font-bold text-[#64748B] uppercase tracking-[0.2em] whitespace-nowrap">Trusted by engineers at</span>
            <div className="flex-1 overflow-hidden relative">
              <div className="flex animate-marquee gap-12 items-center">
                {['FinCorp', 'NexaHealth', 'BuildAI', 'DataCore', 'Synapse', 'CloudScale', 'FinCorp', 'NexaHealth', 'BuildAI', 'DataCore', 'Synapse', 'CloudScale'].map((logo, i) => (
                  <span key={i} className="text-lg font-bold text-[#64748B] opacity-50 hover:opacity-100 transition-opacity cursor-default tracking-tight">
                    {logo}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Problem Section */}
        <section id="product" className="py-32 px-6">
          <div className="max-w-[1200px] mx-auto space-y-16">
            <div className="reveal opacity-0 text-center space-y-4">
              <span className="text-primary font-bold text-xs uppercase tracking-widest">The Problem</span>
              <h2 className="text-4xl font-bold text-white tracking-tight">Enterprises are shipping agents. <br /> They're terrified doing it.</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  title: "Architecture Chaos",
                  body: "No standard exists for building agents. Developers guess. They build infinite loops that crash servers and memory leaks that cost thousands in API fees.",
                  icon: <Shapes className="w-8 h-8 text-amber-500" />,
                  accent: "border-t-amber-500"
                },
                {
                  title: "Security Nightmare",
                  body: "A junior developer accidentally codes a prompt injection vulnerability into a SQL agent. There is no linter to stop it from reaching production.",
                  icon: <Lock className="w-8 h-8 text-amber-500" />,
                  accent: "border-t-amber-500"
                },
                {
                  title: "Vendor Lock-in Trap",
                  body: "Teams spend months on LangChain, only to realize it doesn't scale. Rewriting from scratch costs more than living with broken software.",
                  icon: <LinkIcon className="w-8 h-8 text-amber-500" />,
                  accent: "border-t-amber-500"
                }
              ].map((card, i) => (
                <div key={i} className={`reveal opacity-0 delay-${i * 100} p-8 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/5 border-t-2 ${card.accent} group hover:bg-white/[0.05] transition-all duration-300 hover:-translate-y-2`}>
                  <div className="mb-6 p-4 bg-white/5 w-fit rounded-xl group-hover:scale-110 transition-transform">{card.icon}</div>
                  <h3 className="text-xl font-bold text-white mb-4">{card.title}</h3>
                  <p className="text-[#64748B] leading-relaxed text-sm">{card.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pillars Section */}
        <section className="py-32 px-6 bg-[#0F0F16]">
          <div className="max-w-[1200px] mx-auto space-y-32">
            <div className="reveal opacity-0 text-center space-y-4">
              <span className="text-primary font-bold text-xs uppercase tracking-widest">The Solution</span>
              <h2 className="text-4xl font-bold text-white tracking-tight">Four pillars. One platform. Zero compromises.</h2>
              <p className="text-[#64748B]">Argus AI is not a code generator. It's a governance layer.</p>
            </div>

            {/* Pillar 1 */}
            <div className="reveal opacity-0 flex flex-col md:flex-row items-center gap-16">
              <div className="flex-1 space-y-6">
                <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest border border-primary/20">Pillar 01 — Safety</span>
                <h3 className="text-3xl font-bold text-white">Catch vulnerabilities before they reach production.</h3>
                <p className="text-[#64748B] leading-relaxed">Our static analysis engine parses agent logic, prompts, and tool definitions — simulating thousands of adversarial attacks before a single line is committed.</p>
                <ul className="space-y-3 pt-2">
                  {['Prompt injection detection', 'PII leak prevention', 'Permission creep alerts', 'CI/CD GitHub integration'].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm text-[#F1F5F9]">
                      <CheckCircle2 className="w-4 h-4 text-green-500" /> {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex-1 w-full bg-[#111118] border border-white/5 rounded-2xl p-6 font-mono text-[13px] shadow-2xl overflow-hidden relative group">
                <div className="flex items-center gap-2 mb-6 text-muted-foreground">
                  <span className="text-primary">$</span> argus scan ./refund_agent.py
                </div>
                <div className="space-y-4">
                  <div className="reveal-stagger delay-100 opacity-0 text-white/20">──────────────────────────────────────</div>
                  <div className="reveal-stagger delay-200 opacity-0 flex gap-4">
                    <span className="text-destructive font-bold">🔴 CRITICAL</span>
                    <div className="space-y-1">
                      <p className="text-white">Prompt Injection Risk</p>
                      <p className="text-white/40">Line 47: System prompt overrideable by user emotional state.</p>
                      <p className="text-primary">Fix: Add hard-coded policy guard.</p>
                    </div>
                  </div>
                  <div className="reveal-stagger delay-300 opacity-0 flex gap-4">
                    <span className="text-amber-500 font-bold">🟡 WARNING</span>
                    <div className="space-y-1">
                      <p className="text-white">Cost Inefficiency</p>
                      <p className="text-white/40">GPT-4o used for classification. Switch to GPT-4o-mini → Save 90%.</p>
                    </div>
                  </div>
                  <div className="reveal-stagger delay-400 opacity-0 flex gap-4">
                    <span className="text-green-500 font-bold">✅ PASSED</span>
                    <p className="text-white">Permission Audit</p>
                  </div>
                  <div className="reveal-stagger delay-500 opacity-0 flex gap-4">
                    <span className="text-green-500 font-bold">✅ PASSED</span>
                    <p className="text-white">Loop Termination</p>
                  </div>
                  <div className="reveal-stagger delay-600 opacity-0 text-white/20">──────────────────────────────────────</div>
                  <div className="reveal-stagger delay-700 opacity-0 flex items-center gap-2 text-white">
                    2 issues found. Deployment blocked. <span className="w-2 h-4 bg-primary animate-pulse" />
                  </div>
                </div>
              </div>
            </div>

            {/* Pillar 2 */}
            <div className="reveal opacity-0 flex flex-col md:flex-row-reverse items-center gap-16">
              <div className="flex-1 space-y-6">
                <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest border border-primary/20">Pillar 02 — Architecture</span>
                <h3 className="text-3xl font-bold text-white">Enforce proven patterns. Stop reinventing the wheel poorly.</h3>
                <p className="text-[#64748B] leading-relaxed">Select a Blueprint (Supervisor, Router, Sequential, Map-Reduce). Argus AI enforces the structure — so your team builds on solid ground, not guesswork.</p>
              </div>
              <div className="flex-1 w-full flex items-center justify-center p-8 bg-[#111118] border border-white/5 rounded-2xl shadow-2xl">
                <svg className="w-full h-auto max-w-sm" viewBox="0 0 300 200">
                   <g transform="translate(150, 40)">
                     <rect x="-40" y="-15" width="80" height="30" rx="4" fill="#6366F1" />
                     <text y="5" textAnchor="middle" fill="white" className="text-[10px] font-bold">Supervisor</text>
                   </g>
                   <line x1="150" y1="55" x2="80" y2="120" stroke="rgba(255,255,255,0.1)" />
                   <line x1="150" y1="55" x2="220" y2="120" stroke="rgba(255,255,255,0.1)" />
                   <g transform="translate(80, 135)">
                     <rect x="-35" y="-15" width="70" height="30" rx="4" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.1)" />
                     <text y="5" textAnchor="middle" fill="#64748B" className="text-[10px] font-bold">Researcher</text>
                   </g>
                   <g transform="translate(220, 135)">
                     <rect x="-35" y="-15" width="70" height="30" rx="4" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.1)" />
                     <text y="5" textAnchor="middle" fill="#64748B" className="text-[10px] font-bold">Writer</text>
                   </g>
                   <rect x="235" y="130" width="50" height="12" rx="2" fill="#F59E0B/20" />
                   <text x="260" y="139" textAnchor="middle" fill="#F59E0B" className="text-[7px] font-bold">RESTRICTED</text>
                </svg>
              </div>
            </div>

            {/* Pillar 3 */}
            <div className="reveal opacity-0 flex flex-col md:flex-row items-center gap-16">
              <div className="flex-1 space-y-6">
                <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest border border-primary/20">Pillar 03 — Portability</span>
                <h3 className="text-3xl font-bold text-white">Write once. Deploy anywhere.</h3>
                <p className="text-[#64748B] leading-relaxed">Define your agent logic in Argus AI Abstract Logic Layer. We compile it into LangChain, CrewAI, LangGraph, or AutoGen — your choice, any time.</p>
                <div className="flex flex-wrap gap-4 text-[11px] font-bold text-[#64748B] pt-4">
                  <span>LANGCHAIN</span> · <span>CREWAI</span> · <span>LANGGRAPH</span> · <span>AUTOGEN</span>
                </div>
              </div>
              <div className="flex-1 w-full bg-[#111118] border border-white/5 rounded-2xl p-8 shadow-2xl space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Logic Definition</label>
                  <div className="h-20 w-full bg-black/20 rounded border border-white/5" />
                </div>
                <div className="flex gap-4">
                  <div className="flex-1 space-y-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Target Framework</label>
                    <div className="h-10 bg-black/20 rounded border border-white/5 flex items-center px-4 text-xs">LangGraph ▼</div>
                  </div>
                  <Button className="h-10 mt-6 bg-primary px-6">Compile →</Button>
                </div>
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center justify-between">
                   <div className="flex items-center gap-3">
                     <CheckCircle2 className="w-4 h-4 text-green-500" />
                     <span className="text-xs text-green-500 font-bold">✓ Compiled in 1.2s</span>
                   </div>
                   <span className="text-[10px] text-green-500/60 font-medium tracking-tight">847 lines generated</span>
                </div>
              </div>
            </div>

            {/* Pillar 4 */}
            <div className="reveal opacity-0 flex flex-col md:flex-row-reverse items-center gap-16">
              <div className="flex-1 space-y-6">
                <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest border border-primary/20">Pillar 04 — Education</span>
                <h3 className="text-3xl font-bold text-white">A senior engineer, always over your shoulder.</h3>
                <p className="text-[#64748B] leading-relaxed">Argus AI prevents cargo-cult programming. It doesn't just fix your code — it explains why, turning every junior dev into a better architect.</p>
              </div>
              <div className="flex-1 w-full bg-black/20 p-8 rounded-2xl border border-white/5 shadow-2xl flex flex-col gap-4">
                <div className="bg-primary/5 border border-primary/20 p-5 rounded-xl space-y-4">
                   <div className="flex items-center gap-3">
                     <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-white">🤖</div>
                     <p className="text-xs font-bold text-primary">Argus AI Suggestion</p>
                   </div>
                   <p className="text-xs text-white/80 leading-relaxed">
                     <span className="text-amber-500 font-bold">⚠ Infinite Loop Risk</span> — This recursive agent has no max_iterations limit. A hallucination could cost $500 and hang your server. I've added a default of 5 iterations. Here's why this matters...
                   </p>
                   <div className="flex gap-2">
                     <Button variant="ghost" className="h-7 text-[10px] font-bold border border-white/10 px-4">Learn More</Button>
                     <Button className="h-7 text-[10px] font-bold bg-primary px-4 shadow-lg shadow-primary/20">Accept Fix</Button>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Metrics Bar */}
        <section className="py-24 border-y border-white/5">
          <div className="max-w-[1200px] mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-12">
            {[
              { val: "3", label: "Critical Issues", sub: "caught per agent" },
              { val: "90%", label: "Cost Reduction", sub: "average saving" },
              { val: "~3m", label: "Months Saved", sub: "switching frameworks" },
              { val: "200+", label: "Engineers", sub: "in private beta" }
            ].map((stat, i) => (
              <div key={i} className="reveal opacity-0 text-center space-y-2">
                <h4 className="text-5xl font-bold text-primary tracking-tighter">{stat.val}</h4>
                <p className="text-sm font-bold text-white">{stat.label}</p>
                <p className="text-[11px] text-[#64748B] uppercase tracking-wider font-medium">{stat.sub}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-32 px-6">
          <div className="max-w-[1200px] mx-auto space-y-16">
            <div className="reveal opacity-0 text-center space-y-6">
              <h2 className="text-4xl font-bold text-white tracking-tight">Built for every stage of growth.</h2>
              
              {/* Toggle */}
              <div className="flex items-center justify-center gap-4">
                <span className={`text-sm font-medium ${!isAnnual ? 'text-white' : 'text-muted-foreground'}`}>Monthly</span>
                <button 
                  onClick={() => setIsAnnual(!isAnnual)}
                  className="w-12 h-6 rounded-full bg-white/5 border border-white/10 relative p-1 transition-all"
                >
                  <div className={`w-4 h-4 rounded-full bg-primary transition-all duration-300 ${isAnnual ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-medium ${isAnnual ? 'text-white' : 'text-muted-foreground'}`}>Annual</span>
                  <span className="bg-green-500/10 text-green-500 text-[10px] font-bold px-2 py-0.5 rounded-full border border-green-500/20">20% OFF</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Free */}
              <div className="reveal opacity-0 p-8 rounded-3xl bg-white/[0.02] border border-white/5 flex flex-col h-full hover:bg-white/[0.04] transition-all">
                <div className="space-y-4 mb-8">
                  <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest">Open Source</span>
                  <h3 className="text-2xl font-bold text-white">Free</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-white">$0</span>
                    <span className="text-[#64748B] text-sm">/ forever</span>
                  </div>
                  <p className="text-sm text-[#64748B] leading-relaxed">Perfect for individual developers and tinkerers.</p>
                </div>
                <div className="flex-1 space-y-4 mb-10">
                  {['CLI safety scanner', 'Local file analysis', 'Community support', 'Basic injection detection'].map((f, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm text-white/80">
                      <CheckCircle2 className="w-4 h-4 text-[#64748B]" /> {f}
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full h-12 rounded-xl border-white/10 hover:bg-white/5 font-bold">Download CLI</Button>
              </div>

              {/* Team */}
              <div className="reveal opacity-0 p-8 rounded-3xl bg-white/[0.03] border-2 border-primary/50 flex flex-col h-full shadow-[0_0_40px_rgba(99,102,241,0.15)] relative scale-105 z-10">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-bold px-4 py-1 rounded-full shadow-lg">MOST POPULAR</div>
                <div className="space-y-4 mb-8">
                  <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Production Ready</span>
                  <h3 className="text-2xl font-bold text-white">Team</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-white">${isAnnual ? '79' : '99'}</span>
                    <span className="text-[#64748B] text-sm">/ seat / mo</span>
                  </div>
                  <p className="text-sm text-[#64748B] leading-relaxed">Complete governance for high-growth engineering teams.</p>
                </div>
                <div className="flex-1 space-y-4 mb-10">
                  {['Everything in Free', 'Cloud blueprinting', 'Architecture visualization', 'Junior Mentor mode', 'Cost & latency profiling', 'GitHub App integration'].map((f, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm text-white/80">
                      <CheckCircle2 className="w-4 h-4 text-primary" /> {f}
                    </div>
                  ))}
                </div>
                <Button className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 font-bold shadow-xl shadow-primary/20">Start Free Trial</Button>
              </div>

              {/* Enterprise */}
              <div className="reveal opacity-0 p-8 rounded-3xl bg-white/[0.02] border border-white/5 flex flex-col h-full hover:bg-white/[0.04] transition-all">
                <div className="space-y-4 mb-8">
                  <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest">For Fortune 500</span>
                  <h3 className="text-2xl font-bold text-white">Enterprise</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-white">Custom</span>
                  </div>
                  <p className="text-sm text-[#64748B] leading-relaxed">Dedicated infrastructure for the world's largest swarms.</p>
                </div>
                <div className="flex-1 space-y-4 mb-10">
                  {['Everything in Team', 'Full framework compiler', 'SSO/SAML + self-hosted', 'Custom patterns', 'GDPR/HIPAA mode', 'Solution engineer'].map((f, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm text-white/80">
                      <CheckCircle2 className="w-4 h-4 text-[#64748B]" /> {f}
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full h-12 rounded-xl border-white/10 hover:bg-white/5 font-bold">Talk to Sales</Button>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section id="waitlist" className="py-32 px-6">
          <div className="max-w-[1000px] mx-auto p-12 md:p-24 rounded-[3rem] bg-gradient-to-br from-primary/40 via-[#111118] to-[#0A0A0F] border border-white/10 text-center space-y-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
            
            <div className="relative z-10 space-y-4">
              <h2 className="text-4xl md:text-6xl font-bold text-white tracking-tight">The Wild West ends here.</h2>
              <p className="text-[#64748B] text-lg max-w-xl mx-auto">Join 200+ engineering teams building production-grade agents.</p>
            </div>

            <form className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
              <input 
                type="email" 
                placeholder="Enter your work email" 
                className="w-full h-14 bg-white/5 border border-white/10 rounded-full px-8 text-sm focus:outline-none focus:border-primary transition-colors text-white"
              />
              <Button className="w-full sm:w-auto h-14 px-10 rounded-full bg-white text-[#0A0A0F] font-bold hover:bg-white/90 shadow-2xl transition-all hover:scale-105">
                Join Waitlist
              </Button>
            </form>

            <p className="relative z-10 text-[10px] font-bold text-[#64748B] uppercase tracking-widest">🔒 No spam. Unsubscribe anytime.</p>
          </div>
        </section>
      </main>

      <footer className="pt-24 pb-12 px-6 border-t border-white/5">
        <div className="max-w-[1200px] mx-auto grid grid-cols-2 md:col-span-12 gap-12 mb-20">
          <div className="col-span-2 md:col-span-4 space-y-6">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-6 h-6 bg-primary rounded-md flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg tracking-tight text-white uppercase italic">Argus AI</span>
            </Link>
            <p className="text-sm text-[#64748B] max-w-xs leading-relaxed">
              The civil infrastructure for autonomous AI agents. Architect, Secure, Govern.
            </p>
            <div className="flex items-center gap-4 text-[#64748B]">
              <Twitter className="w-5 h-5 cursor-pointer hover:text-white transition-colors" />
              <Linkedin className="w-5 h-5 cursor-pointer hover:text-white transition-colors" />
              <Github className="w-5 h-5 cursor-pointer hover:text-white transition-colors" />
            </div>
          </div>
          
          <div className="col-span-1 md:col-span-2 space-y-6">
            <h5 className="text-xs font-bold text-white uppercase tracking-widest">Product</h5>
            <ul className="space-y-4 text-sm text-[#64748B]">
              <li className="hover:text-white transition-colors cursor-pointer">Features</li>
              <li className="hover:text-white transition-colors cursor-pointer">Pricing</li>
              <li className="hover:text-white transition-colors cursor-pointer">Changelog</li>
              <li className="hover:text-white transition-colors cursor-pointer">Roadmap</li>
            </ul>
          </div>

          <div className="col-span-1 md:col-span-2 space-y-6">
            <h5 className="text-xs font-bold text-white uppercase tracking-widest">Resources</h5>
            <ul className="space-y-4 text-sm text-[#64748B]">
              <li className="hover:text-white transition-colors cursor-pointer">Documentation</li>
              <li className="hover:text-white transition-colors cursor-pointer">Blog</li>
              <li className="hover:text-white transition-colors cursor-pointer">GitHub</li>
              <li className="hover:text-white transition-colors cursor-pointer">Discord</li>
            </ul>
          </div>

          <div className="col-span-2 md:col-span-2 space-y-6">
            <h5 className="text-xs font-bold text-white uppercase tracking-widest">Company</h5>
            <ul className="space-y-4 text-sm text-[#64748B]">
              <li className="hover:text-white transition-colors cursor-pointer">About</li>
              <li className="hover:text-white transition-colors cursor-pointer">Careers</li>
              <li className="hover:text-white transition-colors cursor-pointer">Privacy</li>
              <li className="hover:text-white transition-colors cursor-pointer">Terms</li>
            </ul>
          </div>
        </div>

        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row items-center justify-between pt-8 border-t border-white/5 gap-4">
          <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-[0.2em]">© 2025 Project Argus AI. All rights reserved.</p>
          <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">Made for the builders of intelligence.</p>
        </div>
      </footer>

      <style jsx global>{`
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-up {
          animation: fade-up 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 20s linear infinite;
          width: max-content;
        }
        @keyframes typing {
          from { width: 0 }
          to { width: 100% }
        }
        .animate-typing {
          animation: typing 2s steps(40, end);
        }
        .reveal-stagger {
          transition: all 0.5s ease-out;
        }
        .group:hover .reveal-stagger {
          opacity: 1 !important;
        }
      `}</style>
    </div>
  );
}
