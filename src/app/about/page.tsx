'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  Sparkles,
  Building2,
  Users,
  Globe2,
  Lock,
  Award,
  ArrowRight,
  CheckCircle2,
  HeartHandshake,
  Layers,
  MapPin,
  TrendingUp,
  Landmark,
  ShieldAlert,
  ChevronRight,
  Cpu,
  Milestone,
  Quote,
  Star,
} from 'lucide-react';
import { getPresenceOffices, getLeaders, getCustomerStories } from '@/server/dal/store';
import { DraggableMarquee } from '@/components/ui/DraggableMarquee';

const STATS = [
  { value: '650+', label: 'Enterprise BFSI Clients', sub: 'Across Tier-1 & Regional Banks' },
  { value: '60+', label: 'Countries Supported', sub: 'Compliant with Regional Regulators' },
  { value: '17', label: 'Global Operating Hubs', sub: 'Spanning 5 Continents' },
  { value: '1,900+', label: 'Domain Specialists', sub: 'FinTech, Shari’ah & AI Engineers' },
  { value: '$500B+', label: 'Assets Managed', sub: 'On Azentio Core Platforms' },
];

const JOURNEY_STEPS = [
  {
    year: '2020',
    title: 'Apax Partners Carve-out',
    desc: 'Azentio Software is established as an independent specialized software enterprise through Apax Partners acquiring 3i Infotech’s enterprise software business.',
    tag: 'Foundational Scale',
  },
  {
    year: '2021',
    title: 'Unifying iMAL & Beyontec',
    desc: 'Strategic integration of Path Solutions (iMAL — world-leading AAOIFI Islamic core banking) and Beyontec (premier digital insurance suite).',
    tag: 'Market Leadership',
  },
  {
    year: '2023 - 2025',
    title: 'Cloud Modernization & Scale',
    desc: 'Migration of 650+ institutional clients to modular API architectures, automated financial crime surveillance (AMLOCK), and unified asset management.',
    tag: 'Digital Evolution',
  },
  {
    year: '2026+',
    title: 'Governed Collective AI',
    desc: 'Pioneering governed collective intelligence (azentio.ai) for regulated banking, risk, insurance, and ERP with zero cross-tenant data leakage.',
    tag: 'Next-Gen Intelligence',
  },
];

const WHY_AZENTIO = [
  {
    icon: Landmark,
    color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    title: 'Statutory & Shari’ah Native',
    desc: 'Native AAOIFI Shari’ah certified Islamic core banking, GCC tax e-invoicing, IFRS 9 modeling, and pre-configured central bank compliance templates.',
  },
  {
    icon: Layers,
    color: 'text-cyan-500 bg-cyan-500/10 border-cyan-500/20',
    title: 'Front-to-Back Flow',
    desc: 'Seamless unification eliminating data silos — from algorithmic order matching and AML surveillance to automated multi-entity general ledgers.',
  },
  {
    icon: ShieldCheck,
    color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20',
    title: 'Zero-Compromise Security',
    desc: 'SOC 2 Type II, ISO 27001, strict cryptographic tenant separation, and continuous automated regulatory audit trails.',
  },
  {
    icon: Globe2,
    color: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    title: 'Global Footprint, Local Precision',
    desc: '17 operational hubs with on-the-ground regulatory experts across Singapore, Dubai, Riyadh, Mumbai, London, Nairobi, and Cairo.',
  },
];

export default function AboutPage() {
  const offices = getPresenceOffices();
  const leaders = getLeaders().filter((l) => l.category === 'executive');
  const customerStories = getCustomerStories();
  const [activeTab, setActiveTab] = useState<'mission' | 'values' | 'standards'>('mission');

  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-hidden">
      {/* ── AMBIENT BACKGROUND GLOW MESHES ──────────────────────────────── */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] pointer-events-none overflow-hidden">
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.15, 0.25, 0.15] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-40 left-1/4 w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-emerald-500/30 to-teal-400/20 blur-[120px]"
        />
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute -top-20 right-1/4 w-[450px] h-[450px] rounded-full bg-gradient-to-bl from-cyan-500/30 to-indigo-500/20 blur-[130px]"
        />
      </div>

      {/* ── 1. HERO SECTION: PURPOSE & STATS ──────────────────────────────── */}
      <section className="relative pt-20 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto space-y-6">
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-6xl font-black tracking-tight text-foreground leading-[1.1]"
          >
            Purpose-Built Technology for Complex,{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 dark:from-emerald-400 dark:via-teal-300 dark:to-cyan-400">
              Regulated Markets
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-3xl mx-auto"
          >
            Azentio is the premier enterprise software partner delivering mission-critical core platforms
            for Islamic & Conventional Banking, Capital Markets, Insurance, Financial Crime Surveillance,
            and Mid-Market ERP operations.
          </motion.p>
        </div>

        {/* Live Key Metrics Banner */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mt-14 grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4 p-3 rounded-3xl glass-panel border border-border shadow-xl backdrop-blur-xl"
        >
          {STATS.map((stat, idx) => (
            <div
              key={idx}
              className={`p-4 sm:p-5 rounded-2xl bg-card/60 hover:bg-card transition-all text-center border border-border/40 group hover:border-emerald-500/30 ${idx === 4 ? 'col-span-2 md:col-span-1' : ''
                }`}
            >
              <div className="text-2xl sm:text-3xl font-black text-foreground group-hover:text-emerald-500 transition-colors">
                {stat.value}
              </div>
              <div className="text-xs font-bold text-foreground mt-1">{stat.label}</div>
              <div className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">{stat.sub}</div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* ── 2. STORYLINE STREAM: OUR JOURNEY & EVOLUTION ──────────────────── */}
      <section className="relative py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold mb-2">
            <Milestone className="w-3.5 h-3.5" />
            <span>Pedigree & Trajectory</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            A Heritage of Mission-Critical Excellence
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            From 30+ years of core software lineage to governed AI collective learning.
          </p>
        </div>

        {/* Continuous Flowing Timeline */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
          {JOURNEY_STEPS.map((step, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.12 }}
              className="relative p-6 rounded-3xl border border-border/80 bg-card/70 hover:bg-card hover:border-emerald-500/40 transition-all shadow-sm group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                    {step.year}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider">
                    {step.tag}
                  </span>
                </div>
                <h3 className="font-bold text-base text-foreground mb-2 group-hover:text-emerald-500 transition-colors">
                  {step.title}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── 3. WHY CHOOSE AZENTIO: INTEGRATED ARCHITECTURE PILLARS ───────── */}
      <section className="relative py-20 bg-muted/20 border-y border-border/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="text-xs uppercase tracking-widest font-bold text-emerald-600 dark:text-emerald-400 mb-2">
              Why Choose Azentio?
            </h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
              Engineered for Regulated Precision
            </h3>
            <p className="mt-3 text-muted-foreground text-sm">
              We do not build generic software. Every module reflects deep statutory compliance, regional tax rules,
              and religious accounting certifications.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {WHY_AZENTIO.map((item, idx) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="p-6 rounded-3xl border border-border/80 bg-card/90 shadow-sm hover:shadow-xl hover:border-emerald-500/50 transition-all group flex flex-col justify-between"
                >
                  <div>
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border mb-5 ${item.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <h4 className="font-bold text-lg text-foreground mb-2 group-hover:text-emerald-500 transition-colors">
                      {item.title}
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                  <div className="mt-5 pt-3 border-t border-border/40 flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 group-hover:translate-x-1 transition-transform">
                    <span>Explore Capabilities</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 4. INNOVATION MEETS INTEGRITY: INTERACTIVE CORE VALUES ────────── */}
      <section className="relative py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Narrative */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
              <HeartHandshake className="w-3.5 h-3.5" />
              <span>Our Operating DNA</span>
            </div>

            <h3 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight leading-tight">
              Where Relentless Innovation{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-500 dark:from-emerald-400 dark:to-cyan-400">
                Meets Absolute Integrity
              </span>
            </h3>

            <p className="text-sm text-muted-foreground leading-relaxed">
              In financial services, speed without governance is a liability. Azentio operates at the exact
              intersection of agile software innovation and strict statutory transparency, ensuring our
              clients expand with total regulatory confidence.
            </p>

            {/* Interactive Tab Switcher */}
            <div className="flex gap-2 p-1.5 rounded-2xl bg-muted/60 border border-border w-fit">
              <button
                onClick={() => setActiveTab('mission')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'mission'
                    ? 'bg-card text-foreground shadow-sm border border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                    : 'text-muted-foreground hover:text-foreground'
                  }`}
              >
                Our Mission
              </button>
              <button
                onClick={() => setActiveTab('values')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'values'
                    ? 'bg-card text-foreground shadow-sm border border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                    : 'text-muted-foreground hover:text-foreground'
                  }`}
              >
                Core Values
              </button>
              <button
                onClick={() => setActiveTab('standards')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'standards'
                    ? 'bg-card text-foreground shadow-sm border border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                    : 'text-muted-foreground hover:text-foreground'
                  }`}
              >
                Governance
              </button>
            </div>

            {/* Tab Contents */}
            <div className="p-6 rounded-2xl border border-border/80 bg-card/60 space-y-3">
              {activeTab === 'mission' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
                  <h4 className="font-bold text-sm text-foreground">Empowering Regulated Transformation</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    To deliver purpose-built, secure, and compliant financial technology that accelerates institutional
                    growth, streamlines compliance, and unlocks collective intelligence for emerging and global markets.
                  </p>
                </motion.div>
              )}
              {activeTab === 'values' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>Customer Obsession & Decades of Trust</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>Integrity, Audit Lineage & Shari’ah Adherence</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>Continuous Innovation with Enterprise Stability</span>
                  </div>
                </motion.div>
              )}
              {activeTab === 'standards' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
                  <h4 className="font-bold text-sm text-foreground">Institutional Certifications</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Fully audited under SOC 2 Type II, ISO/IEC 27001, AAOIFI Shari’ah accounting standards,
                    and verified by tier-1 global assurance firms.
                  </p>
                </motion.div>
              )}
            </div>
          </div>

          {/* Right Spotlight: Governance Matrix */}
          <div className="lg:col-span-6">
            <div className="relative p-8 rounded-3xl glass-panel border border-border shadow-2xl space-y-6 overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="flex items-center justify-between pb-4 border-b border-border">
                <span className="font-bold text-sm text-foreground flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-emerald-500" />
                  Governance & Compliance Matrix
                </span>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold font-mono">
                  ACTIVE 2026
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-muted/30 border border-border/60">
                  <div className="text-xs font-bold text-foreground">Shari’ah Compliance</div>
                  <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
                    AAOIFI Certified
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-1">Native profit-pool sharing & Islamic treasury</div>
                </div>
                <div className="p-4 rounded-2xl bg-muted/30 border border-border/60">
                  <div className="text-xs font-bold text-foreground">Regulatory Audits</div>
                  <div className="text-[11px] text-cyan-600 dark:text-cyan-400 font-semibold mt-1">
                    SOC 2 Type II & ISO 27001
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-1">Continuous pen-testing & encryption</div>
                </div>
                <div className="p-4 rounded-2xl bg-muted/30 border border-border/60">
                  <div className="text-xs font-bold text-foreground">AML & Fraud</div>
                  <div className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold mt-1">
                    Chartis Category Leader
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-1">Real-time trade-based AML surveillance</div>
                </div>
                <div className="p-4 rounded-2xl bg-muted/30 border border-border/60">
                  <div className="text-xs font-bold text-foreground">Corporate Backing</div>
                  <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
                    Apax Partners
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-1">Global tier-1 tech private equity</div>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between text-xs">
                <span className="text-muted-foreground text-[11px]">Looking for full compliance documentation?</span>
                <Link
                  href="/contact"
                  className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 text-xs"
                >
                  Contact Compliance <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. WHAT OUR CUSTOMERS SAY: DRAGGABLE MARQUEE STREAM ───────────── */}
      <section className="relative py-20 bg-muted/20 border-t border-border/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold mb-2">
                <Quote className="w-3.5 h-3.5" />
                <span>Client Proof & Testimonials</span>
              </div>
              <h3 className="text-3xl font-extrabold text-foreground tracking-tight">
                What Our Customers Say
              </h3>
              <p className="text-muted-foreground text-xs mt-1">
                Feedback from banking, compliance, and wealth leaders across our 650+ institutional partners • Drag or swipe • Pauses on hover
              </p>
            </div>
            <Link
              href="/insights/case-studies"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-border bg-card hover:bg-accent text-foreground text-xs font-semibold transition-all shadow-xs"
            >
              <span>View In-Depth Case Studies</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Live Draggable & Touch-enabled Customer Testimonials Marquee */}
        <DraggableMarquee speed={20} className="py-2">
          {customerStories.map((story, idx) => (
            <div
              key={`story-${idx}`}
              className="w-80 sm:w-96 p-6 rounded-3xl border border-border bg-card shadow-sm hover:border-emerald-500/50 hover:shadow-xl transition-all shrink-0 cursor-pointer select-none flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider">
                    {story.domain}
                  </span>
                </div>

                <p className="text-xs text-foreground/90 font-medium leading-relaxed italic line-clamp-4">
                  "{story.quote || story.challenge}"
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-border/50 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-foreground">{story.clientName}</div>
                  <div className="text-[11px] text-muted-foreground">
                    {story.quoteAuthor && story.quoteRole
                      ? `${story.quoteAuthor} • ${story.quoteRole}`
                      : `${story.country} • Enterprise Client`}
                  </div>
                </div>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-muted text-muted-foreground">
                  {story.country}
                </span>
              </div>
            </div>
          ))}
        </DraggableMarquee>
      </section>

      {/* ── 6. GLOBAL FOOTPRINT: DRAGGABLE MARQUEE STREAM ─────────────────── */}
      <section className="relative py-20 bg-muted/10 border-t border-border/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold mb-2">
                <Globe2 className="w-3.5 h-3.5" />
                <span>Global Presence</span>
              </div>
              <h3 className="text-3xl font-extrabold text-foreground tracking-tight">
                {offices.length} Operating Hubs Worldwide
              </h3>
              <p className="text-muted-foreground text-xs mt-1">
                Drag or swipe to explore our presence across 5 continents • Hover to pause
              </p>
            </div>
            <Link
              href="/our-presence"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all shadow-md hover:scale-105 active:scale-95"
            >
              <span>Explore All {offices.length} Locations</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Live Draggable Marquee */}
        <DraggableMarquee speed={24} className="py-2">
          {offices.map((office, idx) => (
            <div
              key={`office-${idx}`}
              className="w-72 p-5 rounded-2xl border border-border bg-card shadow-sm hover:border-emerald-500/50 hover:shadow-lg transition-all shrink-0 cursor-pointer select-none"
            >
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-sm font-bold text-foreground flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-emerald-500" />
                  <span>{office.city}</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted font-mono uppercase text-muted-foreground">
                  {office.region}
                </span>
              </div>
              <div className="text-xs text-muted-foreground font-medium">{office.country}</div>
              <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-2.5 flex items-center justify-between">
                <span>{office.type}</span>
                <ChevronRight className="w-3 h-3 text-muted-foreground" />
              </div>
            </div>
          ))}
        </DraggableMarquee>
      </section>

      {/* ── 6. LEADERSHIP SPOTLIGHT ───────────────────────────────────────── */}
      <section className="relative py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold mb-2">
              <Users className="w-3.5 h-3.5" />
              <span>Leadership Team</span>
            </div>
            <h3 className="text-3xl font-extrabold text-foreground tracking-tight">
              Guided by Seasoned Enterprise Pioneers
            </h3>
            <p className="text-muted-foreground text-xs mt-1">
              Decades of institutional software leadership driving global BFSI modernization.
            </p>
          </div>
          <Link
            href="/our-leadership"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-border bg-card hover:bg-accent text-foreground text-xs font-semibold transition-all shadow-xs"
          >
            <span>View Full Leadership & Board</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {leaders.slice(0, 4).map((leader, idx) => (
            <motion.div
              key={leader.id}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              whileHover={{ y: -4 }}
              className="p-6 rounded-3xl border border-border bg-card hover:border-emerald-500/50 hover:shadow-xl transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white font-extrabold text-xl mb-4 shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                  {leader.name.charAt(0)}
                </div>
                <h4 className="font-bold text-base text-foreground group-hover:text-emerald-500 transition-colors">
                  {leader.name}
                </h4>
                <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
                  {leader.role}
                </div>
                <p className="text-xs text-muted-foreground mt-3 line-clamp-3 leading-relaxed">
                  {leader.bio}
                </p>
              </div>

              <Link
                href="/our-leadership"
                className="mt-5 pt-3.5 border-t border-border/40 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
              >
                <span>Read Biography</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── 7. SEAMLESS CALL TO ACTION STREAM ──────────────────────────────── */}
      <section className="relative py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="rounded-3xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-cyan-600 text-white p-8 sm:p-14 text-center shadow-2xl relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.2),transparent_50%)] pointer-events-none" />
          <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight relative z-10">
            Partner with Azentio to Modernize Your Regulated Core
          </h3>
          <p className="mt-4 text-white/90 max-w-2xl mx-auto text-sm sm:text-base relative z-10 leading-relaxed">
            Schedule a dedicated walkthrough of iMAL Islamic Core Banking, AMLOCK, Beyontec Insurance,
            or Orion ERP with our senior solution architects.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4 relative z-10">
            <Link
              href="/demo-request"
              className="px-6 py-3 rounded-xl bg-white text-emerald-950 font-bold hover:bg-white/90 transition-all shadow-md text-sm hover:scale-105 active:scale-95"
            >
              Request Enterprise Demo
            </Link>
            <Link
              href="/contact"
              className="px-6 py-3 rounded-xl border border-white/40 bg-white/10 hover:bg-white/20 text-white font-bold transition-all text-sm hover:scale-105 active:scale-95"
            >
              Contact Global Offices
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
