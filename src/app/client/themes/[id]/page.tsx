'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { usePersona } from '@/context/PersonaContext';
import { getClientThemeById } from '@/server/dal/client/themes';
import {
  ArrowLeft,
  ShieldCheck,
  AlertTriangle,
  Sparkles,
  Lock,
  Building2,
  Calendar,
  Layers,
  Info,
  ExternalLink,
  BookOpen,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function ClientThemeDetailPage() {
  const params = useParams();
  const themeId = params?.id as string;
  const { actor } = usePersona();

  let theme;
  try {
    theme = getClientThemeById(actor, themeId);
  } catch (err: any) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-destructive mx-auto" />
        <h2 className="text-xl font-bold text-foreground">Theme Inaccessible</h2>
        <p className="text-xs text-muted-foreground">{err.message}</p>
        <Link
          href="/client/themes"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
        >
          Back to Themes
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Navigation */}
      <div>
        <Link
          href="/client/themes"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Aggregated Themes</span>
        </Link>
      </div>

      {/* Mandatory Honesty Notice */}
      <div className="p-3.5 rounded-2xl bg-amber-500/10 dark:bg-amber-950/20 border border-amber-500/30 flex items-center gap-3 text-xs text-amber-900 dark:text-amber-200">
        <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
        <span className="font-mono text-[11px] sm:text-xs">
          <strong>Notice:</strong> Popularity is not market prevalence. Findings represent contributed empirical observations across participating BFSI cohorts.
        </span>
      </div>

      {/* Main Theme Header Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-card border border-border space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-border/60 pb-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              {theme.isSuppressed ? (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  <span>Statistics Suppressed (&lt;3 Orgs)</span>
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>{theme.distinctOrgCount} Distinct Contributing Institutions</span>
                </span>
              )}

              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-primary/10 text-primary">
                Confidence: {theme.confidence}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              {theme.title}
            </h1>

            <div className="text-xs text-muted-foreground">
              Observation Horizon: <span className="font-semibold text-foreground">{theme.observationPeriod}</span> &bull; Last updated {formatDate(theme.lastUpdated)}
            </div>
          </div>

          <div className="text-right">
            <span className="text-2xl sm:text-3xl font-black text-foreground block">
              {theme.supportingObservationIds.length}
            </span>
            <span className="text-[11px] text-muted-foreground uppercase font-semibold">
              Supporting Findings
            </span>
          </div>
        </div>

        {/* Narrative Description */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Synthesized Collective Finding
          </h3>
          <p className="text-xs sm:text-sm text-foreground leading-relaxed p-4 rounded-2xl bg-muted/40 border border-border/40">
            {theme.description}
          </p>
        </div>

        {/* Limitations & Caveats */}
        {theme.limitations && (
          <div className="p-4 rounded-2xl bg-muted/30 border border-border/60 space-y-1.5">
            <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              <span>Statistical Caveats & Scope Limitations</span>
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {theme.limitations}
            </p>
          </div>
        )}

        {/* Linked Solution Offerings */}
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Applicable Software Modules
          </span>
          <div className="flex flex-wrap gap-2">
            {theme.offeringNames.map((name, i) => (
              <span
                key={i}
                className="px-3 py-1 rounded-xl text-xs font-medium bg-muted text-foreground border border-border"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Supporting De-Identified Observations Section */}
      <div className="p-6 sm:p-8 rounded-3xl bg-card border border-border space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-foreground flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-primary" />
            <span>Supporting Empirical Observations ({theme.supportingObservations?.length || 0})</span>
          </h3>

          <Link
            href="/client/shared"
            className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1"
          >
            <span>View All in Feed</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>

        <p className="text-xs text-muted-foreground">
          De-identified operational excerpts from participating financial institutions contributing to this aggregated pattern.
        </p>

        {(!theme.supportingObservations || theme.supportingObservations.length === 0) ? (
          <div className="p-6 text-center text-xs text-muted-foreground border border-dashed rounded-2xl">
            No live supporting observations are currently published for this theme.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 pt-2">
            {theme.supportingObservations.map((obs) => (
              <div
                key={obs.id}
                className="p-4 rounded-2xl bg-muted/40 border border-border/50 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                    {obs.offeringName}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {obs.attributionOptIn && obs.attributionLabel
                      ? obs.attributionLabel
                      : 'Anonymous BFSI Contributor'}
                  </span>
                </div>

                <h4 className="text-xs sm:text-sm font-bold text-foreground">{obs.title}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                  {obs.body}
                </p>

                <div className="pt-2 flex flex-wrap items-center gap-2 text-[10px] text-muted-foreground border-t border-border/40">
                  <span>{obs.industryBand}</span>
                  <span>&bull;</span>
                  <span>{obs.regionBand}</span>
                  <span>&bull;</span>
                  <span>{obs.evidenceType}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
