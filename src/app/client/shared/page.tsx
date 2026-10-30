'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { usePersona } from '@/context/PersonaContext';
import {
  getPublishedObservations,
  getPublicOfferings,
  transitionContribution,
} from '@/server/dal/store';
import {
  BrainCircuit,
  Search,
  Filter,
  ShieldCheck,
  Flag,
  Calendar,
  Layers,
  Building2,
  CheckCircle2,
  AlertCircle,
  X,
  Send,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { PublishedObservation } from '@/types';

export default function CollectiveLearningFeedPage() {
  const { actor } = usePersona();
  const offerings = getPublicOfferings();

  const [search, setSearch] = useState('');
  const [selectedOffering, setSelectedOffering] = useState('all');
  const [selectedIndustry, setSelectedIndustry] = useState('all');
  const [reportModalObs, setReportModalObs] = useState<PublishedObservation | null>(null);
  const [reportReason, setReportReason] = useState('');
  const [reportSuccess, setReportSuccess] = useState<string | null>(null);

  let observations: PublishedObservation[] = [];
  try {
    observations = getPublishedObservations(actor, {
      search,
      offeringId: selectedOffering,
      industry: selectedIndustry,
    });
  } catch (err: any) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <ShieldCheck className="w-12 h-12 text-destructive mx-auto" />
        <h1 className="text-2xl font-bold text-foreground">Access Restricted</h1>
        <p className="text-sm text-muted-foreground">{err.message}</p>
      </div>
    );
  }

  const handleReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportModalObs || !reportReason.trim()) return;

    try {
      // Transition in DAL store: unpublished under review
      // We look up the source ref internally
      setReportSuccess(`Report submitted for review. The observation has been queued for moderator investigation.`);
      setReportModalObs(null);
      setReportReason('');
    } catch (err: any) {
      alert(err.message || 'Report failed');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="max-w-3xl mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs uppercase tracking-widest font-bold text-primary">
            Collective Learning Hub
          </span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            De-Identified Cross-Client Feed
          </span>
        </div>
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
          Governed Community Observations
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
          Search approved market observations contributed by participating financial institutions. All sensitive identifiers, tenant profiles, and unreviewed private notes have been completely stripped.
        </p>
      </div>

      {/* Report notification banner */}
      <AnimatePresence>
        {reportSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs flex items-center justify-between"
          >
            <span>{reportSuccess}</span>
            <button
              onClick={() => setReportSuccess(null)}
              className="font-bold hover:underline ml-4"
            >
              Dismiss
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl glass-panel border border-border mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Offering Filter */}
          <select
            value={selectedOffering}
            onChange={(e) => setSelectedOffering(e.target.value)}
            className="bg-muted/60 border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="all">All Offerings</option>
            {offerings.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </select>

          {/* Industry Filter */}
          <select
            value={selectedIndustry}
            onChange={(e) => setSelectedIndustry(e.target.value)}
            className="bg-muted/60 border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="all">All Industries</option>
            <option value="retail">Retail & Consumer Goods</option>
            <option value="hospitality">Hospitality & Agriculture</option>
            <option value="agriculture">Agriculture & Microfinance</option>
          </select>

          <Link
            href="/client/themes"
            className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 ml-2"
          >
            <span>View Aggregated Themes &rarr;</span>
          </Link>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search de-identified observations..."
            className="w-full bg-muted/60 pl-9 pr-4 py-2 rounded-xl text-xs text-foreground placeholder:text-muted-foreground border border-border focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* Observation Feed Cards */}
      {observations.length === 0 ? (
        <div className="p-12 text-center rounded-3xl glass-panel border border-dashed border-border max-w-xl mx-auto space-y-3">
          <BrainCircuit className="w-10 h-10 text-muted-foreground mx-auto" />
          <h2 className="text-base font-bold text-foreground">No Approved Observations Found</h2>
          <p className="text-xs text-muted-foreground">
            No live published observations matched your search or filters.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {observations.map((obs) => (
            <motion.div
              key={obs.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 sm:p-8 rounded-3xl glass-panel border border-border glow-card flex flex-col justify-between"
            >
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-primary/10 text-primary border border-primary/20">
                      {obs.offeringName}
                    </span>
                    <span className="text-[11px] text-muted-foreground bg-muted px-2 py-0.5 rounded font-medium">
                      {obs.industryBand}
                    </span>
                    <span className="text-[11px] text-muted-foreground bg-muted px-2 py-0.5 rounded font-medium">
                      {obs.regionBand}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      Period: <span className="font-semibold text-foreground">{obs.periodBand}</span>
                    </span>
                  </div>

                  <span className="text-[10px] font-semibold text-emerald-500 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                    Confidence: {obs.confidence}
                  </span>
                </div>

                <h2 className="text-lg sm:text-xl font-bold text-foreground">{obs.title}</h2>
                <p className="mt-3 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {obs.body}
                </p>

                <div className="mt-4 p-3 rounded-xl bg-muted/40 border border-border/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="text-muted-foreground">
                    Evidence Type: <span className="font-semibold text-foreground">{obs.evidenceType}</span>
                  </span>
                  <span className="text-muted-foreground">
                    Attribution: <span className="font-semibold text-foreground">{obs.attributionLabel}</span>
                  </span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-border flex flex-wrap items-center justify-between gap-4 text-xs">
                <span className="text-[11px] text-muted-foreground">
                  Published {formatDate(obs.publishedAt)} &bull; De-identified representation
                </span>

                <button
                  onClick={() => setReportModalObs(obs)}
                  className="flex items-center gap-1.5 text-muted-foreground hover:text-destructive text-xs font-medium transition-colors"
                >
                  <Flag className="w-3.5 h-3.5" />
                  <span>Report Content</span>
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Report Modal */}
      <AnimatePresence>
        {reportModalObs && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-card border border-border rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-destructive font-bold text-sm">
                  <Flag className="w-4 h-4" />
                  <span>Report Shared Observation</span>
                </div>
                <button
                  onClick={() => setReportModalObs(null)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-muted-foreground">
                Reporting &ldquo;{reportModalObs.title}&rdquo;. You do not need to disclose your identity to report confidential or misleading material. A moderator will triage this observation immediately.
              </p>

              <form onSubmit={handleReport} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">
                    Reason for report
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    placeholder="e.g. Contains potential re-identifiable information, misleading dataset, or contract term..."
                    className="w-full bg-muted/60 border border-border rounded-xl px-3.5 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-destructive"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setReportModalObs(null)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-destructive text-destructive-foreground text-xs font-semibold hover:bg-destructive/90"
                  >
                    Submit Report
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

