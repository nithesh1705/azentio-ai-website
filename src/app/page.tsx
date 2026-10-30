'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Sparkles,
  ShieldCheck,
  Building2,
  TrendingUp,
  BrainCircuit,
  ArrowRight,
  Database,
  Lock,
  Layers,
  ChevronRight,
  CheckCircle2,
  Radio,
  BarChart3,
  Users,
} from 'lucide-react';
import { getPublicOfferings } from '@/server/dal/store';

export default function HomePage() {
  const offerings = getPublicOfferings();

  return (
    <div className="relative overflow-hidden">
      {/* Background glow & grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:36px_36px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 md:pt-32 md:pb-36 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Animated Badge */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold mb-6 backdrop-blur-sm"
        >
          <Sparkles className="w-4 h-4 text-emerald-500" />
          <span>Enterprise AI + Governed Collective Learning</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
        </motion.div>

        {/* Hero Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground max-w-5xl mx-auto leading-[1.1]"
        >
          Build Intelligence.{' '}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 dark:from-emerald-400 dark:via-teal-300 dark:to-cyan-400">
            Create Shared Value.
          </span>
        </motion.h1>

        {/* Subhead */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"
        >
          Empower financial institutions with high-precision AI products and a secure, server-enforced portal. Turn client market observations into de-identified shared learning and product improvements without compromising private data.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-4"
        >
          <Link
            href="/offerings"
            className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 shadow-lg shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all"
          >
            <span>Explore Offerings</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/client/shared"
            className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-card border border-border text-foreground font-semibold text-sm hover:bg-muted/80 hover:border-emerald-500/40 hover:scale-105 active:scale-95 transition-all"
          >
            <BrainCircuit className="w-4 h-4 text-emerald-500" />
            <span>Collective Learning Hub</span>
          </Link>

          <Link
            href="/demo-request"
            className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground text-sm font-medium transition-all"
          >
            <span>Request Demo</span>
          </Link>
        </motion.div>

        {/* Architecture stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto"
        >
          <StatBox value="Deny by Default" label="Server Policy" icon={<Lock className="w-4 h-4 text-emerald-500" />} />
          <StatBox value="4 Independent" label="Granular Consents" icon={<CheckCircle2 className="w-4 h-4 text-cyan-500" />} />
          <StatBox value="≤ 60 Seconds" label="Sync Withdrawal SLA" icon={<TrendingUp className="w-4 h-4 text-amber-500" />} />
          <StatBox value="≥ 3 Institutions" label="Aggregation Threshold" icon={<Building2 className="w-4 h-4 text-indigo-500" />} />
        </motion.div>
      </section>

      {/* Flagship Offering Showcase */}
      <section className="py-20 bg-muted/30 border-y border-border/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs uppercase tracking-widest font-bold text-primary">Azentio AI Offerings</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground mt-2">
              Financial Intelligence Built for Real-World Risk
            </h2>
            <p className="mt-4 text-sm text-muted-foreground">
              Discover modular, AI-native financial architectures engineered for modern core banking, automated risk surveillance, and SME liquidity forecasting.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {offerings.map((offering, idx) => (
              <motion.div
                key={offering.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="group relative p-6 rounded-2xl glass-panel border border-border/80 glow-card flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                      {offering.category}
                    </span>
                    {offering.badge && (
                      <span className="text-[10px] font-semibold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                        {offering.badge}
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">
                    {offering.name}
                  </h3>
                  <p className="mt-2 text-xs text-muted-foreground leading-relaxed line-clamp-3">
                    {offering.tagline}
                  </p>

                  <ul className="mt-4 space-y-2 text-xs text-muted-foreground">
                    {offering.features.slice(0, 2).map((feat, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                        <span className="line-clamp-1">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
                  <Link
                    href={`/offerings/${offering.slug}`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary group-hover:underline"
                  >
                    <span>Inspect Offering</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>

                  <span className="text-[10px] text-muted-foreground font-mono">Sandbox Active</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* The 3 Pillars Section */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <PillarCard
            icon={<Building2 className="w-6 h-6 text-emerald-500" />}
            title="Exclusive Client Workspaces"
            badge="Tenant Isolation"
            description="Clients operate in strictly isolated tenant environments with entitled interactive sandboxes, draft observation tracking, and private organisation administration."
            link="/client"
            linkText="Enter Client Portal"
          />

          <PillarCard
            icon={<BrainCircuit className="w-6 h-6 text-teal-500" />}
            title="Governed Collective Learning"
            badge="De-Identified Knowledge"
            description="Observations pass strict moderation and redaction. Approved insights become searchable market knowledge without revealing client identity or confidential numbers."
            link="/client/shared"
            linkText="Explore Shared Hub"
          />

          <PillarCard
            icon={<TrendingUp className="w-6 h-6 text-indigo-500" />}
            title="Closed-Loop Product Ideas"
            badge="Continuous Evolution"
            description="Product Owners link recurrent shared themes to verified engineering improvements, closing the loop with transparent, plain-language status updates."
            link="/client/ideas"
            linkText="View Improvement Loop"
          />
        </div>
      </section>
    </div>
  );
}

function StatBox({ value, label, icon }: { value: string; label: string; icon: React.ReactNode }) {
  return (
    <div className="p-4 rounded-2xl bg-card/60 border border-border/80 backdrop-blur-sm shadow-sm flex flex-col items-center justify-center text-center">
      <div className="mb-2 p-2 rounded-xl bg-muted/60">{icon}</div>
      <div className="font-extrabold text-sm sm:text-base text-foreground tracking-tight">{value}</div>
      <div className="text-[11px] text-muted-foreground mt-0.5">{label}</div>
    </div>
  );
}

function PillarCard({
  icon,
  title,
  badge,
  description,
  link,
  linkText,
}: {
  icon: React.ReactNode;
  title: string;
  badge: string;
  description: string;
  link: string;
  linkText: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="p-8 rounded-3xl glass-panel border border-border/80 flex flex-col justify-between"
    >
      <div>
        <div className="flex items-center justify-between mb-6">
          <div className="p-3 rounded-2xl bg-muted/80 border border-border">{icon}</div>
          <span className="text-[11px] font-semibold text-muted-foreground bg-muted px-2.5 py-1 rounded-full border border-border">
            {badge}
          </span>
        </div>
        <h3 className="text-xl font-bold text-foreground">{title}</h3>
        <p className="mt-3 text-xs sm:text-sm text-muted-foreground leading-relaxed">{description}</p>
      </div>

      <div className="mt-8 pt-4 border-t border-border">
        <Link
          href={link}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
        >
          <span>{linkText}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </motion.div>
  );
}
