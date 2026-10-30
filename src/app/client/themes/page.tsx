'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { usePersona } from '@/context/PersonaContext';
import { getClientThemes, EnrichedTheme } from '@/server/dal/client/themes';
import {
  Sparkles,
  Search,
  Filter,
  ShieldCheck,
  AlertTriangle,
  Layers,
  ArrowRight,
  Info,
  Calendar,
  Building2,
  Lock,
} from 'lucide-react';

export default function ClientThemesPage() {
  const { actor } = usePersona();
  const [search, setSearch] = useState('');
  const [filterOffering, setFilterOffering] = useState('all');

  let themes: EnrichedTheme[] = [];
  try {
    themes = getClientThemes(actor);
  } catch (err: any) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <ShieldCheck className="w-12 h-12 text-destructive mx-auto" />
        <h1 className="text-2xl font-bold text-foreground">Access Restricted</h1>
        <p className="text-sm text-muted-foreground">{err.message}</p>
      </div>
    );
  }

  const filteredThemes = themes.filter((theme) => {
    const matchesSearch =
      theme.title.toLowerCase().includes(search.toLowerCase()) ||
      theme.description.toLowerCase().includes(search.toLowerCase());
    const matchesOffering =
      filterOffering === 'all' || theme.offeringIds.includes(filterOffering);
    return matchesSearch && matchesOffering;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
              Collective Intelligence
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>k-Anonymity &ge; 3 Orgs Guard</span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Aggregated Learning Themes
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground max-w-2xl">
            Synthesized operational patterns and cross-organisational benchmarks. To prevent re-identification, themes supported by fewer than 3 distinct institutions have statistical metrics suppressed.
          </p>
        </div>

        <Link
          href="/client/shared"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card border border-border text-foreground text-xs font-semibold hover:bg-muted transition-all shadow-sm self-start md:self-auto"
        >
          <span>Raw De-Identified Feed</span>
          <ArrowRight className="w-3.5 h-3.5 text-primary" />
        </Link>
      </div>

      {/* Mandatory Honesty Notice */}
      <div className="p-4 rounded-2xl bg-amber-500/10 dark:bg-amber-950/20 border border-amber-500/30 flex items-center gap-3 text-xs text-amber-900 dark:text-amber-200">
        <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
        <span className="font-mono text-[11px] sm:text-xs">
          <strong>Honesty Invariant:</strong> Popularity is not market prevalence. Contributed observations reflect edge cases and submitted telemetry, not generalized industry market shares.
        </span>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search synthesized themes or patterns..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-sm"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-muted-foreground" />
          <select
            value={filterOffering}
            onChange={(e) => setFilterOffering(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl bg-card border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="all">All Solutions</option>
            <option value="offering-fai">Financial Analysis Intelligence</option>
            <option value="offering-aml">AML & Compliance Copilot</option>
            <option value="offering-cbe">Core Banking Engine</option>
            <option value="offering-dls">Digital Lending Suite</option>
          </select>
        </div>
      </div>

      {/* Themes Grid */}
      {filteredThemes.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-card border border-dashed border-border max-w-md mx-auto space-y-3">
          <Sparkles className="w-10 h-10 text-muted-foreground mx-auto" />
          <h3 className="text-sm font-bold text-foreground">No Themes Match Criteria</h3>
          <p className="text-xs text-muted-foreground">
            Try adjusting your search query or selecting "All Solutions".
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredThemes.map((theme) => (
            <motion.div
              key={theme.id}
              whileHover={{ y: -3 }}
              transition={{ duration: 0.2 }}
              className={`p-6 sm:p-7 rounded-3xl bg-card border flex flex-col justify-between shadow-sm transition-all ${
                theme.isSuppressed
                  ? 'border-amber-500/30 ring-1 ring-amber-500/10'
                  : 'border-border hover:border-primary/40'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  {theme.isSuppressed ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      <span>Sample Suppressed (&lt;3 Orgs)</span>
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      <span>{theme.distinctOrgCount} Contributing Institutions</span>
                    </span>
                  )}

                  <span className="text-[10px] font-semibold text-muted-foreground uppercase">
                    Confidence: {theme.confidence}
                  </span>
                </div>

                <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  {theme.offeringNames.join(' &bull; ')}
                </div>

                <h2 className="text-lg font-bold text-foreground leading-snug">
                  {theme.title}
                </h2>

                <p className="mt-2 text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                  {theme.description}
                </p>

                {theme.isSuppressed && (
                  <div className="mt-3 p-2.5 rounded-xl bg-amber-500/10 text-amber-900 dark:text-amber-200 text-[11px] flex items-center gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>{theme.suppressionReason}</span>
                  </div>
                )}

                {/* Evidence Metrics */}
                <div className="mt-5 pt-4 border-t border-border/50 flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-primary" />
                    <span>Period: {theme.observationPeriod}</span>
                  </span>

                  <span className="font-semibold text-foreground">
                    {theme.supportingObservationIds.length} Supporting Findings
                  </span>
                </div>
              </div>

              <div className="pt-5 mt-4 border-t border-border flex items-center justify-end">
                <Link
                  href={`/client/themes/${theme.id}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all shadow-sm"
                >
                  <span>Explore Theme Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
