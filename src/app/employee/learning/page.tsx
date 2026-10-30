'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { usePersona } from '@/context/PersonaContext';
import {
  getPermittedLearningThemes,
  getDeidentifiedObservationExcerpts,
} from '@/server/dal/employee/learning';
import { Theme, PublishedObservation } from '@/types';
import {
  GraduationCap,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Calendar,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Info,
  X,
  PlusCircle,
} from 'lucide-react';

export default function EmployeeLearningPage() {
  const { actor } = usePersona();
  const [themes, setThemes] = useState<Theme[]>([]);
  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null);
  const [evidenceExcerpts, setEvidenceExcerpts] = useState<PublishedObservation[]>([]);

  const isProductOwner =
    actor?.platformGrants?.includes('product_owner') ||
    actor?.platformGrants?.includes('portal_admin');

  useEffect(() => {
    if (!actor?.isVerifiedEmployee) return;
    try {
      const permitted = getPermittedLearningThemes(actor);
      setThemes(permitted);
    } catch (e) {
      console.error(e);
    }
  }, [actor]);

  const handleOpenEvidence = (theme: Theme) => {
    if (!actor) return;
    setSelectedTheme(theme);
    const excerpts = getDeidentifiedObservationExcerpts(actor, theme.supportingObservationIds);
    setEvidenceExcerpts(excerpts);
  };

  if (!actor?.isVerifiedEmployee) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold">Employee Access Required</h2>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400 border border-fuchsia-500/20">
              Collective Learning & Research
            </span>
            <span className="text-xs text-muted-foreground font-mono">Quarantined De-Identified Reads</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Approved Collective Learning Themes
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Aggregated industry trends synthesized across minimum 3 distinct financial institutions. All tenant-private details and draft submissions are structurally omitted.
          </p>
        </div>

        {isProductOwner && (
          <Link
            href="/employee/ideas"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all shadow-md shadow-primary/20 shrink-0"
          >
            <Sparkles className="w-4 h-4" />
            <span>Manage Product Ideas</span>
          </Link>
        )}
      </div>

      {/* Strict Privacy Guarantee Banner */}
      <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs sm:text-sm font-semibold flex items-center gap-3">
        <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
        <span>
          Zero-Trust Privacy Invariant: Unsubmitted client drafts and private bank identities are cryptographically quarantined from this portal. Only de-identified multi-tenant benchmarks (≥3 distinct orgs) are displayed.
        </span>
      </div>

      {/* Themes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {themes.map((theme) => (
          <div
            key={theme.id}
            className="rounded-3xl border border-border bg-card p-6 flex flex-col justify-between hover:border-primary/40 transition-all space-y-4 shadow-xs"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground">
                  {theme.offeringNames.join(', ')}
                </span>
                <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  Confidence: {theme.confidence}
                </span>
              </div>

              <h3 className="text-base font-bold text-foreground line-clamp-2">
                {theme.title}
              </h3>

              <p className="text-xs text-muted-foreground line-clamp-3">
                {theme.description}
              </p>

              <div className="space-y-1.5 pt-2 border-t border-border/60 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Building2 className="w-3.5 h-3.5 text-primary" />
                  <span>
                    Aggregated Across <strong className="text-foreground">{theme.distinctOrgCount} Financial Institutions</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Observation Window: {theme.observationPeriod}</span>
                </div>
              </div>

              {theme.limitations && (
                <div className="p-3 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-[11px] text-amber-800 dark:text-amber-300">
                  <span className="font-bold">Model Limitation: </span>
                  <span>{theme.limitations}</span>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-border flex items-center justify-between gap-2">
              <button
                onClick={() => handleOpenEvidence(theme)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-card hover:bg-muted text-xs font-semibold text-foreground"
              >
                <span>View Evidence</span>
                <ChevronRight className="w-3 h-3" />
              </button>

              {isProductOwner && (
                <Link
                  href="/employee/ideas"
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground text-xs font-semibold transition-all"
                >
                  <PlusCircle className="w-3 h-3" />
                  <span>Synthesize into Idea</span>
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* De-identified Evidence Modal */}
      {selectedTheme && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-2xl bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                <h3 className="text-base font-bold text-foreground">
                  De-Identified Evidence Excerpts
                </h3>
              </div>
              <button
                onClick={() => setSelectedTheme(null)}
                className="p-1 rounded-xl text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <h2 className="text-lg font-bold text-foreground">{selectedTheme.title}</h2>
              <p className="text-xs text-muted-foreground mt-1">
                Supporting {evidenceExcerpts.length} verified observations across {selectedTheme.distinctOrgCount} institutions.
              </p>
            </div>

            <div className="space-y-3">
              {evidenceExcerpts.map((obs) => (
                <div key={obs.id} className="p-4 rounded-2xl bg-muted/30 border border-border/60 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-foreground">{obs.title}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                      {obs.attributionLabel || 'Anonymous Financial Institution'}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{obs.body}</p>
                  <div className="text-[10px] text-muted-foreground pt-1 flex items-center gap-3">
                    <span>Region: {obs.regionBand}</span>
                    <span>•</span>
                    <span>Industry: {obs.industryBand}</span>
                    <span>•</span>
                    <span>Confidence: {obs.confidence}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2 border-t border-border">
              <button
                onClick={() => setSelectedTheme(null)}
                className="px-5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

