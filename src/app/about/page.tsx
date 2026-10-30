'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  Lock,
  EyeOff,
  Clock,
  Sparkles,
  Server,
  FileCheck2,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';

export default function AboutPage() {
  const principles = [
    {
      num: '01',
      title: 'Deny by Default',
      desc: 'Access strictly requires valid identity, required permission, audience match, and tenant membership. Missing metadata resolves to Denied, never public.',
      icon: <Lock className="w-5 h-5 text-emerald-500" />,
    },
    {
      num: '02',
      title: 'Server is the Only Authority',
      desc: 'Authority is never derived from client nav state, localStorage flags, email suffix alone, or user-supplied tenant IDs. The active tenant is verified server-side.',
      icon: <Server className="w-5 h-5 text-indigo-500" />,
    },
    {
      num: '03',
      title: 'Private Source ≠ Shared Representation',
      desc: 'The original client draft is never exposed cross-tenant. A published copy is a separate, de-identified row containing only reviewed, redacted fields.',
      icon: <EyeOff className="w-5 h-5 text-cyan-500" />,
    },
    {
      num: '04',
      title: 'Granular Four-Part Consent',
      desc: 'Membership, processing, publishing, attribution, and model training are completely independent consents. Saving a draft never implies consent to share.',
      icon: <FileCheck2 className="w-5 h-5 text-teal-500" />,
    },
    {
      num: '05',
      title: 'Synchronous Withdrawal (≤ 60s)',
      desc: 'Withdrawal executes in a single database transaction, purging the item from search, theme counts, caches, and AIRA retrieval synchronously.',
      icon: <Clock className="w-5 h-5 text-amber-500" />,
    },
    {
      num: '06',
      title: 'Radical Honesty in the UI',
      desc: 'Synthetic data is clearly labelled. Simulated outputs are labelled. Queued emails are never falsely shown as "delivered". We never claim withdrawal un-trains a model.',
      icon: <Sparkles className="w-5 h-5 text-rose-500" />,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="max-w-3xl mb-14">
        <span className="text-xs uppercase tracking-widest font-bold text-primary">About azentio.ai</span>
        <h1 className="text-4xl font-extrabold text-foreground mt-2 tracking-tight">
          Enterprise AI Rooted in Rigorous Governance
        </h1>
        <p className="mt-4 text-sm sm:text-base text-muted-foreground leading-relaxed">
          azentio.ai represents the next evolution of financial technology: bringing high-performance intelligence into core banking while establishing an ironclad, auditable perimeter for collective market learning.
        </p>
      </div>

      <div className="p-8 rounded-3xl glass-panel border border-border mb-16">
        <h2 className="text-xl font-bold text-foreground mb-2">The Collaboration Thesis</h2>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
          Financial institutions face shared structural headwinds—from seasonal cash flow spikes to novel regulatory compliance evasion. By enabling clients to contribute observations into a de-identified, governed collective-learning hub, Azentio continually enhances its core product models without any single participant revealing sensitive competitive secrets or customer PII.
        </p>
      </div>

      <div className="mb-12">
        <h2 className="text-2xl font-bold text-foreground">Non-Negotiable Architectural Principles</h2>
        <p className="text-xs text-muted-foreground mt-1">
          From SOURCE_OF_TRUTH.md §2 — Enforced across all routes, DAL functions, and policy checks
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {principles.map((p) => (
          <motion.div
            key={p.num}
            whileHover={{ y: -4 }}
            className="p-6 rounded-2xl glass-panel border border-border glow-card flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono text-xs font-black text-primary">{p.num}</span>
                <div className="p-2 rounded-xl bg-muted/60">{p.icon}</div>
              </div>
              <h3 className="font-bold text-base text-foreground">{p.title}</h3>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{p.desc}</p>
            </div>
            <div className="mt-6 pt-4 border-t border-border flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Architecturally Enforced</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
