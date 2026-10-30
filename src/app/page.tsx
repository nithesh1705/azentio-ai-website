'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Building2,
  TrendingUp,
  BrainCircuit,
  Award,
  Globe2,
  Users,
  CheckCircle2,
  Layers,
  ArrowUpRight,
  Landmark,
  ShieldAlert,
  HeartPulse,
  Boxes,
} from 'lucide-react';
import {
  getProductDomains,
  getTrustedPartners,
  getIndustryAwards,
  getAllProducts,
} from '@/server/dal/store';

export default function HomePage() {
  const domains = getProductDomains();
  const partners = getTrustedPartners();
  const awards = getIndustryAwards();
  const allProducts = getAllProducts();

  // Active domain state for auto + manual scroller
  const [activeDomainIndex, setActiveDomainIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-advance domain scroller every 4 seconds unless explicitly paused by user
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setActiveDomainIndex((prev) => (prev + 1) % domains.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [isPaused, domains.length]);

  const activeDomain = domains[activeDomainIndex];
  const activeDomainProducts = allProducts.filter((p) => p.domainId === activeDomain.id);

  const getDomainIcon = (iconName: string) => {
    switch (iconName) {
      case 'Landmark':
        return <Landmark className="w-6 h-6 text-emerald-500" />;
      case 'TrendingUp':
        return <TrendingUp className="w-6 h-6 text-cyan-500" />;
      case 'ShieldAlert':
        return <ShieldAlert className="w-6 h-6 text-indigo-500" />;
      case 'HeartPulse':
        return <HeartPulse className="w-6 h-6 text-rose-500" />;
      case 'Boxes':
        return <Boxes className="w-6 h-6 text-amber-500" />;
      default:
        return <Sparkles className="w-6 h-6 text-emerald-500" />;
    }
  };

  return (
    <div className="relative overflow-hidden">
      {/* Background Subtle Tech Mesh */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808010_1px,transparent_1px),linear-gradient(to_bottom,#80808010_1px,transparent_1px)] bg-[size:36px_36px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* ── 1. HERO SECTION ──────────────────────────────────────────────── */}
      <section className="relative pt-16 pb-20 md:pt-24 md:pb-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Animated Badge */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold mb-6 backdrop-blur-sm shadow-sm"
        >
          <Sparkles className="w-4 h-4 text-emerald-500" />
          <span>Purpose-Built Enterprise Technology for BFSI & ERP</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        </motion.div>

        {/* Hero Title */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground max-w-5xl mx-auto leading-[1.1]"
        >
          Intelligence-Driven Software for{' '}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 dark:from-emerald-400 dark:via-teal-300 dark:to-cyan-400">
            Regulated Enterprise Markets
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"
        >
          Empowering Tier-1 Banks, Islamic Financial Institutions, Insurers, Asset Managers, and
          Process Enterprises with AAOIFI-certified core platforms, AI surveillance, and unified cloud ERP.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-4"
        >
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 hover:scale-105 active:scale-95 text-sm"
          >
            <span>Explore 5 Domains</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/demo-request"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-border bg-card/80 hover:bg-accent text-foreground font-semibold transition-all hover:scale-105 active:scale-95 text-sm shadow-sm"
          >
            <span>Request Solution Demo</span>
          </Link>
        </motion.div>
      </section>

      {/* ── 2. TRUSTED BY INDUSTRY LEADERS (Continuous Auto-Scroll Ticker) ── */}
      <section className="border-y border-border/70 bg-card/40 backdrop-blur-md py-6 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-3 text-center">
          <p className="text-xs uppercase tracking-widest font-semibold text-muted-foreground">
            Trusted by Industry Leaders Across 60+ Countries
          </p>
        </div>

        {/* Infinite CSS marquee animation */}
        <div className="relative w-full overflow-hidden flex [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
          <div className="flex shrink-0 items-center gap-8 py-2 animate-marquee hover:[animation-play-state:paused]">
            {partners.concat(partners).concat(partners).map((partner, idx) => (
              <div
                key={`partner-${idx}`}
                className="flex items-center gap-2.5 px-4 py-2 rounded-xl border border-border/50 bg-background/60 text-xs font-semibold text-muted-foreground hover:text-foreground hover:border-emerald-500/40 transition-colors whitespace-nowrap shadow-xs"
              >
                <div className="w-2 h-2 rounded-full bg-emerald-500/70" />
                <span>{partner.name}</span>
                <span className="text-[10px] text-muted-foreground/60 font-mono">({partner.country})</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. FIVE DOMAINS: AUTO + MANUAL SCROLLER ──────────────────────── */}
      <section
        className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-xs uppercase tracking-widest font-bold text-emerald-600 dark:text-emerald-400 mb-2">
            Enterprise Product Portfolio
          </h2>
          <p className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            Specialist Platforms Engineered for Regulated Excellence
          </p>
          <p className="mt-3 text-muted-foreground text-sm">
            Auto-advancing showcase. Select any domain below or use manual controls to inspect capabilities.
          </p>
        </div>

        {/* 5 Domain Navigation Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 p-1.5 rounded-2xl bg-muted/40 border border-border/80 mb-8 max-w-4xl mx-auto">
          {domains.map((dom, idx) => {
            const isActive = idx === activeDomainIndex;
            return (
              <button
                key={dom.id}
                onClick={() => setActiveDomainIndex(idx)}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-card text-foreground shadow-md border border-emerald-500/40 text-emerald-600 dark:text-emerald-400'
                    : 'text-muted-foreground hover:text-foreground hover:bg-card/40'
                }`}
              >
                <span>{dom.name}</span>
                {isActive && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
              </button>
            );
          })}
        </div>

        {/* Active Domain Showcase Card with Manual Controls */}
        <div className="relative rounded-3xl border border-border bg-gradient-to-b from-card to-card/60 p-6 sm:p-10 shadow-2xl backdrop-blur-xl">
          {/* Top Row: Icon + Title + Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border/60">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                {getDomainIcon(activeDomain.iconName)}
              </div>
              <div>
                <div className="text-xs font-mono uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-bold">
                  Domain Vertical {activeDomainIndex + 1} of {domains.length}
                </div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-foreground">
                  {activeDomain.name}
                </h3>
              </div>
            </div>

            {/* Manual Scroll Buttons */}
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                onClick={() =>
                  setActiveDomainIndex((prev) => (prev === 0 ? domains.length - 1 : prev - 1))
                }
                className="p-2 rounded-xl border border-border bg-card hover:bg-accent text-foreground transition-all shadow-xs"
                aria-label="Previous Domain"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setActiveDomainIndex((prev) => (prev + 1) % domains.length)}
                className="p-2 rounded-xl border border-border bg-card hover:bg-accent text-foreground transition-all shadow-xs"
                aria-label="Next Domain"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <Link
                href={`/products/${activeDomain.slug}`}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-all shadow-sm"
              >
                <span>View {activeDomain.name} Suite</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Description & Proof Points */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-8">
            <div className="lg:col-span-2 space-y-6">
              <h4 className="text-xl font-bold text-foreground leading-snug">
                {activeDomain.tagline}
              </h4>
              <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                {activeDomain.description}
              </p>

              {/* Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {activeDomain.highlights.map((h, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs text-foreground">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{h}</span>
                  </div>
                ))}
              </div>

              {/* Associated Products Preview */}
              <div className="pt-4 border-t border-border/40">
                <div className="text-xs uppercase font-bold text-muted-foreground tracking-wider mb-3">
                  Products in this vertical:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {activeDomainProducts.map((prod) => (
                    <Link
                      key={prod.id}
                      href={`/${activeDomain.slug}/${prod.slug}`}
                      className="p-3 rounded-xl border border-border/70 bg-card/60 hover:bg-accent/80 hover:border-emerald-500/40 transition-all text-xs group flex flex-col justify-between"
                    >
                      <div>
                        <div className="font-bold text-foreground group-hover:text-primary transition-colors flex items-center justify-between">
                          <span className="truncate">{prod.name}</span>
                          <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary shrink-0" />
                        </div>
                        <p className="text-[11px] text-muted-foreground line-clamp-2 mt-1">
                          {prod.tagline}
                        </p>
                      </div>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-2">
                        Inspect Product →
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Metrics column */}
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-4 p-5 rounded-2xl bg-muted/30 border border-border/50 self-start">
              {activeDomain.stats.map((s, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-card border border-border/40">
                  <div className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                    {s.value}
                  </div>
                  <div className="text-xs text-muted-foreground font-medium mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. KEY STATS (Indexed Corporate Figures) ──────────────────────── */}
      <section className="py-16 bg-muted/20 border-y border-border/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 text-center">
            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-extrabold text-foreground">650+</div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                Financial & ERP Clients
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-extrabold text-foreground">30+</div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                Years Deep Domain Expertise
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-extrabold text-foreground">1,900+</div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                Technology Professionals
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-extrabold text-foreground">60+</div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                Countries Served Globally
              </div>
            </div>
            <div className="space-y-1 col-span-2 md:col-span-1">
              <div className="text-3xl sm:text-4xl font-extrabold text-foreground">19</div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                Global Location Hubs
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. INDUSTRY AWARDS & ANALYST ACCREDITATION ────────────────────── */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <h2 className="text-xs uppercase tracking-widest font-bold text-emerald-600 dark:text-emerald-400 mb-1">
              Independent Recognition
            </h2>
            <h3 className="text-3xl font-extrabold text-foreground tracking-tight">
              Awards & Analyst Accolades
            </h3>
          </div>
          <Link
            href="/insights/blogs"
            className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
          >
            <span>Read research insights</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {awards.slice(0, 6).map((award) => (
            <div
              key={award.id}
              className="p-5 rounded-2xl border border-border/80 bg-card hover:border-emerald-500/40 hover:shadow-lg transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    {award.badgeText}
                  </span>
                  <span className="text-xs font-mono text-muted-foreground font-semibold">
                    {award.year}
                  </span>
                </div>
                <h4 className="font-bold text-sm text-foreground leading-snug">{award.title}</h4>
                <p className="text-xs text-muted-foreground mt-1.5">{award.organization}</p>
              </div>
              <div className="mt-4 pt-3 border-t border-border/40 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <span>Product: {award.productRef}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 6. CALL TO ACTION BANNER ─────────────────────────────────────── */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-cyan-600 text-white p-8 sm:p-14 text-center shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.2),transparent_50%)] pointer-events-none" />
          <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight relative z-10">
            Ready to Modernize Your Regulated Enterprise Architecture?
          </h3>
          <p className="mt-4 text-white/90 max-w-2xl mx-auto text-sm sm:text-base relative z-10 leading-relaxed">
            Connect with our solution architects to schedule a personalized demonstration of iMAL,
            AMLOCK, Premia, MFund, or Orion Cloud ERP.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4 relative z-10">
            <Link
              href="/demo-request"
              className="px-6 py-3 rounded-xl bg-white text-emerald-950 font-bold hover:bg-white/90 transition-all shadow-md text-sm hover:scale-105 active:scale-95"
            >
              Request Live Demo
            </Link>
            <Link
              href="/contact"
              className="px-6 py-3 rounded-xl border border-white/40 bg-white/10 hover:bg-white/20 text-white font-bold transition-all text-sm hover:scale-105 active:scale-95"
            >
              Contact Global Offices
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
