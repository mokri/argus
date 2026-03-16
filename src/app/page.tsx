
"use client";

import React, { useState, useEffect } from 'react';
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

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

    return () => {
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#F7F7F4] text-[#242422] font-sans selection:bg-[#FF7612]/20 relative">

      {/* Top Banner */}
      {isBannerVisible && (
        <div className="bg-[#242422] text-white py-2.5 px-4 text-center text-sm font-medium relative z-[110]">
          <p>🚀 Project Argus AI is now in private beta — <Link href="#waitlist" className="underline underline-offset-4 hover:opacity-80 transition-opacity">Join the waitlist →</Link></p>
          <button onClick={() => setIsBannerVisible(false)} className="absolute right-4 top-1/2 -translate-y-1/2 hover:scale-110 transition-transform">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-[105] transition-all duration-300 ${isScrolled ? 'bg-[#F7F7F4]/90 backdrop-blur-md py-3 shadow-sm' : 'bg-transparent py-5'}`}>
        <div className="max-w-[1200px] mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 bg-[#FF7612] rounded-lg flex items-center justify-center transition-transform group-hover:scale-105">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-[#242422] uppercase" style={{ fontFamily: "'Libre Caslon Condensed', serif" }}>Argus AI</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link href="#product" className="text-sm font-medium text-[#242422]/60 hover:text-[#242422] transition-colors">Product</Link>
            <Link href="#pricing" className="text-sm font-medium text-[#242422]/60 hover:text-[#242422] transition-colors">Pricing</Link>
            <Link href="#" className="text-sm font-medium text-[#242422]/60 hover:text-[#242422] transition-colors">Docs</Link>
            <Link href="#" className="text-sm font-medium text-[#242422]/60 hover:text-[#242422] transition-colors">Blog</Link>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-sm font-medium text-[#242422]/60 hover:text-[#242422] transition-colors hidden sm:block">Sign In</Link>
            <Button className="bg-[#FF7612] hover:bg-[#FF9E57] text-white rounded-lg px-6 h-10 font-semibold transition-all hover:scale-[1.02] active:scale-95 shadow-none">
              Get Early Access
            </Button>
            <Menu className="w-6 h-6 md:hidden text-[#242422] cursor-pointer" />
          </div>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="pt-36 pb-20 px-6 overflow-hidden">
          <div className="max-w-[1200px] mx-auto text-center space-y-7">
            <div className="reveal opacity-0 flex justify-center">
              <span className="inline-flex items-center px-4 py-1.5 rounded-full border border-[#FF7612]/20 bg-[#FF7612]/5 text-[#FF7612] text-xs font-semibold uppercase tracking-widest">
                The Production Gap is Over
              </span>
            </div>

            <h1 className="reveal opacity-0 text-5xl md:text-7xl font-bold tracking-tight text-[#242422] max-w-4xl mx-auto leading-[1.08]" style={{ fontFamily: "'Libre Caslon Condensed', serif" }}>
              The Civil Infrastructure <br />
              for <span className="text-[#FF7612]">AI Agents</span>
            </h1>

            <p className="reveal opacity-0 text-[#242422]/50 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
              Argus AI is the first Architectural Intelligence &amp; Safety Platform for autonomous agents. We turn Wild West scripts into production-grade software.
            </p>

            <div className="reveal opacity-0 flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Button className="h-14 px-10 rounded-lg bg-[#FF7612] hover:bg-[#FF9E57] text-white font-bold text-base transition-all hover:scale-[1.02] active:scale-95 group shadow-none">
                Get Early Access <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button variant="ghost" className="h-14 px-10 rounded-lg text-[#242422] font-bold text-base border border-[#242422]/10 hover:bg-[#242422]/5 gap-2">
                <Play className="w-4 h-4 fill-current" /> See a Live Demo
              </Button>
            </div>

            <p className="reveal opacity-0 text-[#242422]/40 text-sm">
              No credit card required · Used by 200+ engineers
            </p>

            {/* Video Placeholder */}
            <div className="reveal opacity-0 mt-16 relative max-w-4xl mx-auto">
              <div className="rounded-2xl overflow-hidden bg-[#242422] aspect-video relative group cursor-pointer shadow-xl shadow-[#242422]/10">
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#242422]/60 via-transparent to-transparent z-10" />

                {/* Play button */}
                <div className="absolute inset-0 flex items-center justify-center z-20">
                  <div className="w-20 h-20 rounded-full bg-[#FF7612] flex items-center justify-center transition-all group-hover:scale-110 group-hover:bg-[#FF9E57] shadow-lg shadow-[#FF7612]/30">
                    <Play className="w-8 h-8 text-white fill-white ml-1" />
                  </div>
                </div>

                {/* Placeholder pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="w-full h-full" style={{
                    backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)',
                    backgroundSize: '24px 24px'
                  }} />
                </div>

                {/* Label */}
                <div className="absolute bottom-6 left-6 z-20">
                  <p className="text-white/60 text-sm font-medium">Watch the 2-minute overview</p>
                </div>

                {/* Badges */}
                <div className="absolute top-5 right-5 z-20 flex gap-2">
                  <span className="bg-white/10 backdrop-blur-sm text-white text-[10px] font-semibold px-3 py-1 rounded-full border border-white/10">
                    2:14
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Social Proof Bar */}
        <section className="py-10 border-y border-[#242422]/5">
          <div className="max-w-[1200px] mx-auto px-6 flex flex-col md:flex-row items-center gap-8">
            <span className="text-xs font-semibold text-[#242422]/40 uppercase tracking-[0.2em] whitespace-nowrap">Trusted by engineers at</span>
            <div className="flex-1 overflow-hidden relative">
              <div className="flex animate-marquee gap-14 items-center">
                {['FinCorp', 'NexaHealth', 'BuildAI', 'DataCore', 'Synapse', 'CloudScale', 'FinCorp', 'NexaHealth', 'BuildAI', 'DataCore', 'Synapse', 'CloudScale'].map((logo, i) => (
                  <span key={i} className="text-lg font-bold text-[#242422] opacity-20 hover:opacity-50 transition-opacity cursor-default tracking-tight">
                    {logo}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Problem Section */}
        <section id="product" className="py-28 px-6">
          <div className="max-w-[1200px] mx-auto space-y-14">
            <div className="reveal opacity-0 text-center space-y-4">
              <span className="text-[#FF7612] font-semibold text-xs uppercase tracking-widest">The Problem</span>
              <h2 className="text-3xl md:text-4xl font-bold text-[#242422] tracking-tight" style={{ fontFamily: "'Libre Caslon Condensed', serif" }}>Enterprises are shipping agents. <br /> They&apos;re terrified doing it.</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  title: "Architecture Chaos",
                  body: "No standard exists for building agents. Developers guess. They build infinite loops that crash servers and memory leaks that cost thousands in API fees.",
                  icon: <Shapes className="w-6 h-6 text-[#FF7612]" />,
                },
                {
                  title: "Security Nightmare",
                  body: "A junior developer accidentally codes a prompt injection vulnerability into a SQL agent. There is no linter to stop it from reaching production.",
                  icon: <Lock className="w-6 h-6 text-[#FF7612]" />,
                },
                {
                  title: "Vendor Lock-in Trap",
                  body: "Teams spend months on LangChain, only to realize it doesn't scale. Rewriting from scratch costs more than living with broken software.",
                  icon: <LinkIcon className="w-6 h-6 text-[#FF7612]" />,
                }
              ].map((card, i) => (
                <div key={i} className="reveal opacity-0 p-7 rounded-xl bg-[#F2F1ED] border border-[#242422]/5 group hover:bg-[#EBEAE5] transition-all duration-300 hover:-translate-y-1">
                  <div className="mb-5 p-3 bg-[#FF7612]/5 w-fit rounded-lg transition-transform group-hover:scale-105">{card.icon}</div>
                  <h3 className="text-lg font-bold text-[#242422] mb-3">{card.title}</h3>
                  <p className="text-[#242422]/50 leading-relaxed text-sm">{card.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pillars Section */}
        <section className="py-28 px-6 bg-[#EBEAE5]">
          <div className="max-w-[1200px] mx-auto space-y-28">
            <div className="reveal opacity-0 text-center space-y-4">
              <span className="text-[#FF7612] font-semibold text-xs uppercase tracking-widest">The Solution</span>
              <h2 className="text-3xl md:text-4xl font-bold text-[#242422] tracking-tight" style={{ fontFamily: "'Libre Caslon Condensed', serif" }}>Four pillars. One platform. Zero compromises.</h2>
              <p className="text-[#242422]/50">Argus AI is not a code generator. It&apos;s a governance layer.</p>
            </div>

            {/* Pillar 1 */}
            <div className="reveal opacity-0 flex flex-col md:flex-row items-center gap-12">
              <div className="flex-1 space-y-5">
                <span className="px-3 py-1 rounded-full bg-[#FF7612]/10 text-[#FF7612] text-[10px] font-semibold uppercase tracking-widest border border-[#FF7612]/15">Pillar 01 — Safety</span>
                <h3 className="text-2xl md:text-3xl font-bold text-[#242422]" style={{ fontFamily: "'Libre Caslon Condensed', serif" }}>Catch vulnerabilities before they reach production.</h3>
                <p className="text-[#242422]/50 leading-relaxed">Our static analysis engine parses agent logic, prompts, and tool definitions — simulating thousands of adversarial attacks before a single line is committed.</p>
                <ul className="space-y-3 pt-1">
                  {['Prompt injection detection', 'PII leak prevention', 'Permission creep alerts', 'CI/CD GitHub integration'].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm text-[#242422]">
                      <CheckCircle2 className="w-4 h-4 text-[#FF7612]" /> {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex-1 w-full bg-[#242422] rounded-xl p-6 font-mono text-[13px] overflow-hidden relative">
                <div className="flex items-center gap-2 mb-5 text-white/40">
                  <span className="text-[#FF7612]">$</span> argus scan ./refund_agent.py
                </div>
                <div className="space-y-4">
                  <div className="text-white/10">──────────────────────────────────────</div>
                  <div className="flex gap-4">
                    <span className="text-red-400 font-bold text-sm">🔴 CRITICAL</span>
                    <div className="space-y-1">
                      <p className="text-white">Prompt Injection Risk</p>
                      <p className="text-white/30 text-xs">Line 47: System prompt overrideable by user emotional state.</p>
                      <p className="text-[#FF7612] text-xs">Fix: Add hard-coded policy guard.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <span className="text-amber-400 font-bold text-sm">🟡 WARNING</span>
                    <div className="space-y-1">
                      <p className="text-white">Cost Inefficiency</p>
                      <p className="text-white/30 text-xs">GPT-4o used for classification. Switch to GPT-4o-mini → Save 90%.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <span className="text-emerald-400 font-bold text-sm">✅ PASSED</span>
                    <p className="text-white">Permission Audit</p>
                  </div>
                  <div className="flex gap-4">
                    <span className="text-emerald-400 font-bold text-sm">✅ PASSED</span>
                    <p className="text-white">Loop Termination</p>
                  </div>
                  <div className="text-white/10">──────────────────────────────────────</div>
                  <div className="flex items-center gap-2 text-white text-sm">
                    2 issues found. Deployment blocked. <span className="w-2 h-4 bg-[#FF7612] animate-pulse" />
                  </div>
                </div>
              </div>
            </div>

            {/* Pillar 2 */}
            <div className="reveal opacity-0 flex flex-col md:flex-row-reverse items-center gap-12">
              <div className="flex-1 space-y-5">
                <span className="px-3 py-1 rounded-full bg-[#FF7612]/10 text-[#FF7612] text-[10px] font-semibold uppercase tracking-widest border border-[#FF7612]/15">Pillar 02 — Architecture</span>
                <h3 className="text-2xl md:text-3xl font-bold text-[#242422]" style={{ fontFamily: "'Libre Caslon Condensed', serif" }}>Enforce proven patterns. Stop reinventing the wheel poorly.</h3>
                <p className="text-[#242422]/50 leading-relaxed">Select a Blueprint (Supervisor, Router, Sequential, Map-Reduce). Argus AI enforces the structure — so your team builds on solid ground, not guesswork.</p>
              </div>
              <div className="flex-1 w-full flex items-center justify-center p-8 bg-[#F2F1ED] border border-[#242422]/5 rounded-xl">
                <svg className="w-full h-auto max-w-sm" viewBox="0 0 300 200">
                  <g transform="translate(150, 40)">
                    <rect x="-45" y="-16" width="90" height="32" rx="8" fill="#FF7612" />
                    <text y="5" textAnchor="middle" fill="white" className="text-[11px] font-bold">Supervisor</text>
                  </g>
                  <line x1="150" y1="56" x2="80" y2="115" stroke="#242422" strokeWidth="1" strokeOpacity="0.12" />
                  <line x1="150" y1="56" x2="220" y2="115" stroke="#242422" strokeWidth="1" strokeOpacity="0.12" />
                  <g transform="translate(80, 135)">
                    <rect x="-40" y="-16" width="80" height="32" rx="8" fill="#F2F1ED" stroke="#242422" strokeWidth="1" strokeOpacity="0.1" />
                    <text y="5" textAnchor="middle" fill="#242422" fillOpacity="0.5" className="text-[11px] font-bold">Researcher</text>
                  </g>
                  <g transform="translate(220, 135)">
                    <rect x="-40" y="-16" width="80" height="32" rx="8" fill="#F2F1ED" stroke="#FF7612" strokeWidth="1" strokeOpacity="0.4" />
                    <text y="5" textAnchor="middle" fill="#242422" fillOpacity="0.5" className="text-[11px] font-bold">Writer</text>
                  </g>
                  <rect x="240" y="128" width="50" height="14" rx="4" fill="#FF7612" fillOpacity="0.08" />
                  <text x="265" y="138" textAnchor="middle" fill="#FF7612" className="text-[7px] font-bold">RESTRICTED</text>
                </svg>
              </div>
            </div>

            {/* Pillar 3 */}
            <div className="reveal opacity-0 flex flex-col md:flex-row items-center gap-12">
              <div className="flex-1 space-y-5">
                <span className="px-3 py-1 rounded-full bg-[#FF7612]/10 text-[#FF7612] text-[10px] font-semibold uppercase tracking-widest border border-[#FF7612]/15">Pillar 03 — Portability</span>
                <h3 className="text-2xl md:text-3xl font-bold text-[#242422]" style={{ fontFamily: "'Libre Caslon Condensed', serif" }}>Write once. Deploy anywhere.</h3>
                <p className="text-[#242422]/50 leading-relaxed">Define your agent logic in Argus AI Abstract Logic Layer. We compile it into LangChain, CrewAI, LangGraph, or AutoGen — your choice, any time.</p>
                <div className="flex flex-wrap gap-4 text-[11px] font-bold text-[#242422]/30 pt-2">
                  <span>LANGCHAIN</span> · <span>CREWAI</span> · <span>LANGGRAPH</span> · <span>AUTOGEN</span>
                </div>
              </div>
              <div className="flex-1 w-full bg-[#F2F1ED] border border-[#242422]/5 rounded-xl p-7 space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-semibold text-[#242422]/40 uppercase tracking-widest">Logic Definition</label>
                  <div className="h-20 w-full bg-[#EBEAE5] rounded-lg border border-[#242422]/5" />
                </div>
                <div className="flex gap-4">
                  <div className="flex-1 space-y-2">
                    <label className="text-[10px] font-semibold text-[#242422]/40 uppercase tracking-widest">Target Framework</label>
                    <div className="h-10 bg-[#EBEAE5] rounded-lg border border-[#242422]/5 flex items-center px-4 text-xs text-[#242422]/60">LangGraph ▼</div>
                  </div>
                  <Button className="h-10 mt-6 bg-[#FF7612] hover:bg-[#FF9E57] text-white px-6 rounded-lg shadow-none">Compile →</Button>
                </div>
                <div className="p-4 bg-[#FF7612]/5 border border-[#FF7612]/10 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-[#FF7612]" />
                    <span className="text-xs text-[#FF7612] font-semibold">✓ Compiled in 1.2s</span>
                  </div>
                  <span className="text-[10px] text-[#FF7612]/60 font-medium tracking-tight">847 lines generated</span>
                </div>
              </div>
            </div>

            {/* Pillar 4 */}
            <div className="reveal opacity-0 flex flex-col md:flex-row-reverse items-center gap-12">
              <div className="flex-1 space-y-5">
                <span className="px-3 py-1 rounded-full bg-[#FF7612]/10 text-[#FF7612] text-[10px] font-semibold uppercase tracking-widest border border-[#FF7612]/15">Pillar 04 — Education</span>
                <h3 className="text-2xl md:text-3xl font-bold text-[#242422]" style={{ fontFamily: "'Libre Caslon Condensed', serif" }}>A senior engineer, always over your shoulder.</h3>
                <p className="text-[#242422]/50 leading-relaxed">Argus AI prevents cargo-cult programming. It doesn&apos;t just fix your code — it explains why, turning every junior dev into a better architect.</p>
              </div>
              <div className="flex-1 w-full bg-[#F2F1ED] p-7 rounded-xl border border-[#242422]/5 flex flex-col gap-4">
                <div className="bg-[#FF7612]/5 border border-[#FF7612]/10 p-5 rounded-xl space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#FF7612] flex items-center justify-center text-white text-sm">🤖</div>
                    <p className="text-xs font-bold text-[#FF7612]">Argus AI Suggestion</p>
                  </div>
                  <p className="text-xs text-[#242422]/60 leading-relaxed">
                    <span className="text-amber-600 font-bold">⚠ Infinite Loop Risk</span> — This recursive agent has no max_iterations limit. A hallucination could cost $500 and hang your server. I&apos;ve added a default of 5 iterations. Here&apos;s why this matters...
                  </p>
                  <div className="flex gap-2">
                    <Button variant="ghost" className="h-7 text-[10px] font-bold border border-[#242422]/10 px-4 rounded-lg text-[#242422] hover:bg-[#242422]/5">Learn More</Button>
                    <Button className="h-7 text-[10px] font-bold bg-[#FF7612] hover:bg-[#FF9E57] text-white px-4 rounded-lg shadow-none">Accept Fix</Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Metrics Bar */}
        <section className="py-24 border-y border-[#242422]/5 bg-[#F7F7F4]">
          <div className="max-w-[1200px] mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-12">
            {[
              { val: "3", label: "Critical Issues", sub: "caught per agent" },
              { val: "90%", label: "Cost Reduction", sub: "average saving" },
              { val: "~3m", label: "Months Saved", sub: "switching frameworks" },
              { val: "200+", label: "Engineers", sub: "in private beta" }
            ].map((stat, i) => (
              <div key={i} className="reveal opacity-0 text-center space-y-2">
                <h4 className="text-5xl font-bold text-[#FF7612] tracking-tighter" style={{ fontFamily: "'Libre Caslon Condensed', serif" }}>{stat.val}</h4>
                <p className="text-sm font-bold text-[#242422]">{stat.label}</p>
                <p className="text-[11px] text-[#242422]/40 uppercase tracking-wider font-medium">{stat.sub}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-28 px-6 bg-[#F7F7F4]">
          <div className="max-w-[1200px] mx-auto space-y-14">
            <div className="reveal opacity-0 text-center space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold text-[#242422] tracking-tight" style={{ fontFamily: "'Libre Caslon Condensed', serif" }}>Built for every stage of growth.</h2>

              {/* Toggle */}
              <div className="flex items-center justify-center gap-4">
                <span className={`text-sm font-medium ${!isAnnual ? 'text-[#242422]' : 'text-[#242422]/40'}`}>Monthly</span>
                <button
                  onClick={() => setIsAnnual(!isAnnual)}
                  className="w-12 h-6 rounded-full bg-[#242422]/5 border border-[#242422]/10 relative p-1 transition-all"
                >
                  <div className={`w-4 h-4 rounded-full bg-[#FF7612] transition-all duration-300 ${isAnnual ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-medium ${isAnnual ? 'text-[#242422]' : 'text-[#242422]/40'}`}>Annual</span>
                  <span className="bg-[#FF7612]/10 text-[#FF7612] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#FF7612]/15">20% OFF</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Free */}
              <div className="reveal opacity-0 p-7 rounded-xl bg-[#F2F1ED] border border-[#242422]/5 flex flex-col h-full hover:bg-[#EBEAE5] transition-all duration-300">
                <div className="space-y-3 mb-7">
                  <span className="text-[10px] font-semibold text-[#242422]/40 uppercase tracking-widest">Open Source</span>
                  <h3 className="text-xl font-bold text-[#242422]">Free</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-[#242422]" style={{ fontFamily: "'Libre Caslon Condensed', serif" }}>$0</span>
                    <span className="text-[#242422]/40 text-sm">/ forever</span>
                  </div>
                  <p className="text-sm text-[#242422]/50 leading-relaxed">Perfect for individual developers and tinkerers.</p>
                </div>
                <div className="flex-1 space-y-3 mb-8">
                  {['CLI safety scanner', 'Local file analysis', 'Community support', 'Basic injection detection'].map((f, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm text-[#242422]/70">
                      <CheckCircle2 className="w-4 h-4 text-[#242422]/30" /> {f}
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full h-11 rounded-lg border-[#242422]/10 hover:bg-[#242422]/5 font-semibold text-[#242422]">Download CLI</Button>
              </div>

              {/* Team */}
              <div className="reveal opacity-0 p-7 rounded-xl bg-[#242422] border-2 border-[#FF7612]/50 flex flex-col h-full relative scale-[1.02] z-10 shadow-xl shadow-[#242422]/10">
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#FF7612] text-white text-[10px] font-bold px-4 py-1 rounded-full">MOST POPULAR</div>
                <div className="space-y-3 mb-7">
                  <span className="text-[10px] font-semibold text-[#FF7612] uppercase tracking-widest">Production Ready</span>
                  <h3 className="text-xl font-bold text-white">Team</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-white" style={{ fontFamily: "'Libre Caslon Condensed', serif" }}>${isAnnual ? '79' : '99'}</span>
                    <span className="text-white/40 text-sm">/ seat / mo</span>
                  </div>
                  <p className="text-sm text-white/50 leading-relaxed">Complete governance for high-growth engineering teams.</p>
                </div>
                <div className="flex-1 space-y-3 mb-8">
                  {['Everything in Free', 'Cloud blueprinting', 'Architecture visualization', 'Junior Mentor mode', 'Cost & latency profiling', 'GitHub App integration'].map((f, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm text-white/70">
                      <CheckCircle2 className="w-4 h-4 text-[#FF7612]" /> {f}
                    </div>
                  ))}
                </div>
                <Button className="w-full h-11 rounded-lg bg-[#FF7612] hover:bg-[#FF9E57] font-semibold shadow-none text-white">Start Free Trial</Button>
              </div>

              {/* Enterprise */}
              <div className="reveal opacity-0 p-7 rounded-xl bg-[#F2F1ED] border border-[#242422]/5 flex flex-col h-full hover:bg-[#EBEAE5] transition-all duration-300">
                <div className="space-y-3 mb-7">
                  <span className="text-[10px] font-semibold text-[#242422]/40 uppercase tracking-widest">For Fortune 500</span>
                  <h3 className="text-xl font-bold text-[#242422]">Enterprise</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-[#242422]" style={{ fontFamily: "'Libre Caslon Condensed', serif" }}>Custom</span>
                  </div>
                  <p className="text-sm text-[#242422]/50 leading-relaxed">Dedicated infrastructure for the world&apos;s largest swarms.</p>
                </div>
                <div className="flex-1 space-y-3 mb-8">
                  {['Everything in Team', 'Full framework compiler', 'SSO/SAML + self-hosted', 'Custom patterns', 'GDPR/HIPAA mode', 'Solution engineer'].map((f, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm text-[#242422]/70">
                      <CheckCircle2 className="w-4 h-4 text-[#242422]/30" /> {f}
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full h-11 rounded-lg border-[#242422]/10 hover:bg-[#242422]/5 font-semibold text-[#242422]">Talk to Sales</Button>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section id="waitlist" className="py-28 px-6 bg-[#F7F7F4]">
          <div className="max-w-[900px] mx-auto p-12 md:p-20 rounded-2xl bg-[#242422] text-center space-y-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#FF7612]/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />

            <div className="relative z-10 space-y-4">
              <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight" style={{ fontFamily: "'Libre Caslon Condensed', serif" }}>The Wild West ends here.</h2>
              <p className="text-white/40 text-lg max-w-xl mx-auto">Join 200+ engineering teams building production-grade agents.</p>
            </div>

            <form className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your work email"
                className="w-full h-12 bg-white/5 border border-white/10 rounded-lg px-5 text-sm focus:outline-none focus:border-[#FF7612] transition-colors text-white placeholder:text-white/30"
              />
              <Button className="w-full sm:w-auto h-12 px-8 rounded-lg bg-[#FF7612] hover:bg-[#FF9E57] text-white font-bold transition-all hover:scale-[1.02] shadow-none">
                Join Waitlist
              </Button>
            </form>

            <p className="relative z-10 text-[10px] font-semibold text-white/30 uppercase tracking-widest">🔒 No spam. Unsubscribe anytime.</p>
          </div>
        </section>
      </main>

      <footer className="pt-20 pb-10 px-6 border-t border-[#242422]/5 bg-[#F7F7F4]">
        <div className="max-w-[1200px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-2 md:col-span-1 space-y-5">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-6 h-6 bg-[#FF7612] rounded-md flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg tracking-tight text-[#242422] uppercase" style={{ fontFamily: "'Libre Caslon Condensed', serif" }}>Argus AI</span>
            </Link>
            <p className="text-sm text-[#242422]/40 max-w-xs leading-relaxed">
              The civil infrastructure for autonomous AI agents. Architect, Secure, Govern.
            </p>
            <div className="flex items-center gap-4 text-[#242422]/30">
              <Twitter className="w-5 h-5 cursor-pointer hover:text-[#242422] transition-colors" />
              <Linkedin className="w-5 h-5 cursor-pointer hover:text-[#242422] transition-colors" />
              <Github className="w-5 h-5 cursor-pointer hover:text-[#242422] transition-colors" />
            </div>
          </div>

          <div className="space-y-5">
            <h5 className="text-xs font-bold text-[#242422] uppercase tracking-widest">Product</h5>
            <ul className="space-y-3 text-sm text-[#242422]/40">
              <li className="hover:text-[#242422] transition-colors cursor-pointer">Features</li>
              <li className="hover:text-[#242422] transition-colors cursor-pointer">Pricing</li>
              <li className="hover:text-[#242422] transition-colors cursor-pointer">Changelog</li>
              <li className="hover:text-[#242422] transition-colors cursor-pointer">Roadmap</li>
            </ul>
          </div>

          <div className="space-y-5">
            <h5 className="text-xs font-bold text-[#242422] uppercase tracking-widest">Resources</h5>
            <ul className="space-y-3 text-sm text-[#242422]/40">
              <li className="hover:text-[#242422] transition-colors cursor-pointer">Documentation</li>
              <li className="hover:text-[#242422] transition-colors cursor-pointer">Blog</li>
              <li className="hover:text-[#242422] transition-colors cursor-pointer">GitHub</li>
              <li className="hover:text-[#242422] transition-colors cursor-pointer">Discord</li>
            </ul>
          </div>

          <div className="space-y-5">
            <h5 className="text-xs font-bold text-[#242422] uppercase tracking-widest">Company</h5>
            <ul className="space-y-3 text-sm text-[#242422]/40">
              <li className="hover:text-[#242422] transition-colors cursor-pointer">About</li>
              <li className="hover:text-[#242422] transition-colors cursor-pointer">Careers</li>
              <li className="hover:text-[#242422] transition-colors cursor-pointer">Privacy</li>
              <li className="hover:text-[#242422] transition-colors cursor-pointer">Terms</li>
            </ul>
          </div>
        </div>

        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row items-center justify-between pt-8 border-t border-[#242422]/5 gap-4">
          <p className="text-[10px] font-semibold text-[#242422]/30 uppercase tracking-[0.2em]">© 2025 Project Argus AI. All rights reserved.</p>
          <p className="text-[10px] font-semibold text-[#FF7612] uppercase tracking-[0.2em]">Made for the builders of intelligence.</p>
        </div>
      </footer>

      <style jsx global>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .revealed {
          animation: fadeUp 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 25s linear infinite;
          width: max-content;
        }
      `}</style>
    </div>
  );
}
