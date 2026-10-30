'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { usePersona } from '@/context/PersonaContext';
import { getThemes } from '@/server/dal/store';
import {
  TrendingUp,
  ShieldCheck,
  Building2,
  AlertTriangle,
  FileText,
  Clock,
  ArrowRight,
  Sparkles,
  Info,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function ClientThemesPage() {
  const { actor } = usePersona();

  let themes: any[] = [];
  try {
    themes = getThemes(actor);
  } catch (err: any) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <ShieldCheck className="w-12 h-12 text-destructive mx-auto" />
        <h1 className="text-2xl font-bold text-foreground">Access Restricted</h1>
        <p className="text-sm text-muted-foreground">{err.message}</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="max-w-3xl mb-10">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs uppercase tracking-widest font-bold text-primary">
            Aggregated Themes & Synthesis
          </span>
          <span className="badge-synthetic text-xs">Synthetic Data</span>
        </div>
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
          Safe Market Trend Themes
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
          Synthesized consensus topics derived from approved collective observations. Aggregation safeguards strictly suppress small cohorts to protect participant anonymity.
        </p>
      </div>

      {/* Safeguard Alert Callout */}
      <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-xs text-cyan-800 dark:text-cyan-300 mb-8 flex items-start gap-3">
        <Info className="w-4 h-4 text-cyan-500 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Aggregation Safeguard Policy (§10.4): </span>
          <span>
            Shared statistics are displayed only when supported by &ge; 3 distinct contributing client organisations (Alder Finance, Birchway Bank, Cedar Microlending). Multiple contributions from one organisation count as a single voice.
          </span>
        </div>
      </div>

      <div className="space-y-6">
        {themes.map((theme) => (
          <motion.div
            key={theme.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-8 rounded-3xl glass-panel border border-border glow-card space-y-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-primary/10 text-primary border border-primary/20">
                    {theme.offeringNames.join(', ')}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Observation Period: <span className="font-semibold text-foreground">{theme.observationPeriod}</span>
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-foreground">{theme.title}</h2>
              </div>

              {/* Distinct Organisation Count or Suppressed State */}
              <div className="shrink-0">
                {theme.isSuppressed ? (
                  <div className="px-3.5 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                    <span className="font-semibold">
                      Insufficient evidence (&lt; 3 orgs) — Stats Hidden
                    </span>
                  </div>
                ) : (
                  <div className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2 font-bold">
                    <Building2 className="w-4 h-4 text-emerald-500" />
                    <span>{theme.distinctOrgCount} Distinct Contributing Institutions</span>
                  </div>
                )}
              </div>
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed">
              {theme.description}
            </p>

            {/* Confidence & Limitations */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-muted/40 border border-border/80 space-y-1">
                <span className="font-bold text-foreground">Assessed Confidence:</span>
                <p className="text-muted-foreground">{theme.confidence}</p>
              </div>

              <div className="p-4 rounded-2xl bg-muted/40 border border-border/80 space-y-1">
                <span className="font-bold text-foreground flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                  <span>Limitations & Uncertainty:</span>
                </span>
                <p className="text-muted-foreground">{theme.limitations}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-border flex flex-wrap items-center justify-between gap-4 text-xs">
              <span className="text-muted-foreground">
                Last updated {formatDate(theme.lastUpdated)} &bull; Backed by {theme.supportingObservationIds.length} approved evidence items
              </span>

              <Link
                href="/client/ideas"
                className="inline-flex items-center gap-1 text-primary font-semibold hover:underline"
              >
                <span>View Linked Product Improvement Idea &rarr;</span>
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

