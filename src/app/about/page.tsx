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
  ExternalLink,
} from 'lucide-react';
import { getPresenceOffices, getLeaders } from '@/server/dal/store';

export default function AboutPage() {
  const offices = getPresenceOffices();
  const leaders = getLeaders().filter((l) => l.category === 'executive');

  // Pause hover state for the automatic horizontal presence marquee
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(16,185,129,0.08),transparent)] pointer-events-none" />

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold mb-4"
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
          <span>Singapore HQ • Established 2020 • Apax-Backed</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-4xl sm:text-6xl font-extrabold tracking-tight text-foreground max-w-4xl mx-auto"
        >
          Purpose-Built Technology for Complex,{' '}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 dark:from-emerald-400 dark:to-cyan-400">
            Regulated Industries
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-6 text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed"
        >
          Azentio is a leading enterprise software provider delivering specialized core platforms for
          Banking, Financial Services, Insurance (BFSI), Capital Markets, and mid-market ERP operations.
        </motion.p>
      </section>

      {/* ── SECTION: WHY CHOOSE AZENTIO? ─────────────────────────────────── */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-border/60">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-xs uppercase tracking-widest font-bold text-emerald-600 dark:text-emerald-400 mb-2">
            Why Choose Azentio?
          </h2>
          <h3 className="text-3xl font-extrabold text-foreground tracking-tight">
            Built on 30+ Years of Specialization
          </h3>
          <p className="mt-3 text-muted-foreground text-sm">
            We don’t build generic tools. Every module reflects deep statutory compliance, regional tax rules,
            and religious accounting certifications.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl border border-border/80 bg-card hover:border-emerald-500/40 transition-all shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-lg text-foreground mb-2">Domain-First Engineering</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Purpose-built applications for regulated sectors. We maintain native AAOIFI Shari’ah certification,
              IFRS 9 modeling, and pre-approved GCC tax e-invoicing.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-border/80 bg-card hover:border-emerald-500/40 transition-all shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-500 mb-4">
              <Layers className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-lg text-foreground mb-2">Integrated Platform Workflows</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Eliminating information silos by connecting front-to-back office operations, from order matching
              and algorithmic surveillance to multi-branch general ledgers.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-border/80 bg-card hover:border-emerald-500/40 transition-all shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 mb-4">
              <Globe2 className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-lg text-foreground mb-2">Regional & Global Agility</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Global delivery centers combined with on-the-ground presence in 19 financial capitals across
              the Middle East, Africa, South Asia, and Southeast Asia.
            </p>
          </div>
        </div>
      </section>

      {/* ── SECTION: INNOVATION MEETS INTEGRITY ───────────────────────────── */}
      <section className="py-16 bg-muted/20 border-y border-border/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold mb-3">
                <HeartHandshake className="w-3.5 h-3.5" />
                <span>Our Corporate Code</span>
              </div>
              <h3 className="text-3xl font-extrabold text-foreground tracking-tight leading-tight">
                Innovation Meets Integrity
              </h3>
              <p className="mt-4 text-muted-foreground text-sm leading-relaxed">
                Formed in 2020 through the acquisition of the enterprise software portfolio of 3i Infotech by
                funds advised by Apax, Azentio combines agile private software innovation with decades of
                mission-critical operational pedigree.
              </p>
              <div className="mt-6 space-y-3">
                <div className="flex items-start gap-3 text-xs text-foreground">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Excellence:</strong> Zero compromise on audit trails, accounting accuracy, and latency.</span>
                </div>
                <div className="flex items-start gap-3 text-xs text-foreground">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Customer Value:</strong> Long-term partnerships with leading institutions across emerging markets.</span>
                </div>
                <div className="flex items-start gap-3 text-xs text-foreground">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Employee Growth:</strong> Cultivating 1,900+ technology leaders and domain specialists globally.</span>
                </div>
              </div>
            </div>

            <div className="p-8 rounded-3xl border border-border bg-card/80 shadow-xl backdrop-blur-md space-y-4">
              <h4 className="font-extrabold text-lg text-foreground">Azentio At A Glance</h4>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-4 rounded-2xl bg-muted/40 border border-border/40">
                  <div className="text-2xl font-black text-foreground">Singapore</div>
                  <div className="text-[11px] text-muted-foreground uppercase font-semibold mt-1">Headquarters</div>
                </div>
                <div className="p-4 rounded-2xl bg-muted/40 border border-border/40">
                  <div className="text-2xl font-black text-foreground">Apax</div>
                  <div className="text-[11px] text-muted-foreground uppercase font-semibold mt-1">Ownership / Investor</div>
                </div>
                <div className="p-4 rounded-2xl bg-muted/40 border border-border/40">
                  <div className="text-2xl font-black text-foreground">650+</div>
                  <div className="text-[11px] text-muted-foreground uppercase font-semibold mt-1">Clients Served</div>
                </div>
                <div className="p-4 rounded-2xl bg-muted/40 border border-border/40">
                  <div className="text-2xl font-black text-foreground">1,900+</div>
                  <div className="text-[11px] text-muted-foreground uppercase font-semibold mt-1">Professionals</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION: GLOBAL PRESENCE TICKER (PAUSE ON HOVER) ─────────────── */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-xs uppercase tracking-widest font-bold text-emerald-600 dark:text-emerald-400 mb-1">
              Global Operating Footprint
            </h2>
            <h3 className="text-3xl font-extrabold text-foreground tracking-tight">
              19 Locations Worldwide
            </h3>
            <p className="text-muted-foreground text-xs mt-1">
              Hover anywhere below to pause scrolling and view location details.
            </p>
          </div>
          <Link
            href="/our-presence"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all shadow-sm"
          >
            <span>Explore All 19 Presence Hubs</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Continuous auto-scroller with hover-pause */}
        <div
          className="relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)] py-4"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div
            className={`flex shrink-0 items-center gap-4 py-2 ${
              isHovered ? '' : 'animate-marquee'
            }`}
          >
            {offices.concat(offices).map((office, idx) => (
              <div
                key={`office-${idx}`}
                className="w-64 p-4 rounded-2xl border border-border bg-card shadow-sm hover:border-emerald-500/50 hover:shadow-md transition-all shrink-0"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{office.city}</span>
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-muted font-mono uppercase text-muted-foreground">
                    {office.region}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground font-medium">{office.country}</div>
                <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-2">
                  {office.type}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION: EXECUTIVE LEADERSHIP OVERVIEW ────────────────────────── */}
      <section className="py-16 bg-muted/20 border-t border-border/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <h2 className="text-xs uppercase tracking-widest font-bold text-emerald-600 dark:text-emerald-400 mb-1">
                Executive Leadership
              </h2>
              <h3 className="text-3xl font-extrabold text-foreground tracking-tight">
                Guided by Seasoned Enterprise Pioneers
              </h3>
            </div>
            <Link
              href="/our-leadership"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-border bg-card hover:bg-accent text-foreground text-xs font-semibold transition-all shadow-xs"
            >
              <span>View Full Leadership & Board</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {leaders.slice(0, 4).map((leader) => (
              <div
                key={leader.id}
                className="p-5 rounded-2xl border border-border bg-card hover:border-emerald-500/40 hover:shadow-lg transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white font-extrabold text-lg mb-4 shadow-sm">
                    {leader.name.charAt(0)}
                  </div>
                  <h4 className="font-bold text-base text-foreground">{leader.name}</h4>
                  <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">
                    {leader.role}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2.5 line-clamp-3 leading-relaxed">
                    {leader.bio}
                  </p>
                </div>
                <Link
                  href="/our-leadership"
                  className="mt-4 pt-3 border-t border-border/40 text-[11px] font-semibold text-primary hover:underline flex items-center gap-1"
                >
                  <span>Read Profile</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
