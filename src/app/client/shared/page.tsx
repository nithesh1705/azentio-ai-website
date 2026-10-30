'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { usePersona } from '@/context/PersonaContext';
import {
  getSharedObservations,
  reportSharedObservation,
  exportSharedFeedCsv,
} from '@/server/dal/client/shared';
import { getPublicOfferings } from '@/server/dal/store';
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
  Download,
  Sparkles,
  Tag,
  Globe2,
  X,
  Send,
  Info,
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
    observations = getSharedObservations(actor, {
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
      reportSharedObservation(actor, reportModalObs.id, reportReason.trim());
      setReportSuccess(`Report submitted for review. The observation has been queued for moderator investigation.`);
      setReportModalObs(null);
      setReportReason('');
      setTimeout(() => setReportSuccess(null), 5000);
    } catch (err: any) {
      alert(err.message || 'Report failed');
    }
  };

  const handleExportCsv = () => {
    try {
      const csv = exportSharedFeedCsv(actor, observations);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `azentio-shared-learning-${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err: any) {
      alert('CSV Export failed: ' + err.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
              Collective Intelligence Hub
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>De-Identified Federated Read Model</span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Shared Learning Feed
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground max-w-2xl">
            Cross-tenant operational benchmarks, edge cases, and algorithmic behaviors. Strict de-identification invariants ensure no tenant identifiers or PII ever cross perimeter boundaries.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCsv}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card border border-border text-foreground text-xs font-semibold hover:bg-muted transition-all shadow-sm"
          >
            <Download className="w-4 h-4 text-primary" />
            <span>Export Feed (CSV)</span>
          </button>

          <Link
            href="/client/themes"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all shadow-md shadow-primary/20"
          >
            <Sparkles className="w-4 h-4" />
            <span>View Aggregated Themes</span>
          </Link>
        </div>
      </div>

      {reportSuccess && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{reportSuccess}</span>
        </div>
      )}

      {/* Filters & Search */}
      <div className="p-5 rounded-3xl bg-card border border-border flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center shadow-sm">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search verified cross-tenant patterns or findings..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-muted/50 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-muted-foreground" />
            <select
              value={selectedOffering}
              onChange={(e) => setSelectedOffering(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-xl bg-muted/60 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="all">All Solutions</option>
              {offerings.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </select>
          </div>

          <select
            value={selectedIndustry}
            onChange={(e) => setSelectedIndustry(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl bg-muted/60 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="all">All Industries</option>
            <option value="Banking">Banking & Markets</option>
            <option value="Trade">Trade Finance</option>
            <option value="Lending">Lending & Mortgages</option>
            <option value="Compliance">Compliance & AML</option>
          </select>
        </div>
      </div>

      {/* Observations Grid */}
      {observations.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-card border border-dashed border-border max-w-md mx-auto space-y-3">
          <BrainCircuit className="w-10 h-10 text-muted-foreground mx-auto" />
          <h3 className="text-sm font-bold text-foreground">No Published Patterns Match Filter</h3>
          <p className="text-xs text-muted-foreground">
            Try adjusting your search query or selecting "All Solutions".
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {observations.map((obs) => (
            <motion.div
              key={obs.id}
              whileHover={{ y: -2 }}
              transition={{ duration: 0.2 }}
              className="p-6 rounded-3xl bg-card border border-border flex flex-col justify-between hover:border-primary/40 transition-all shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                    {obs.offeringName}
                  </span>

                  <span className="text-[10px] font-mono text-muted-foreground">
                    Confidence: {obs.confidence}
                  </span>
                </div>

                <h3 className="text-base font-bold text-foreground leading-snug">
                  {obs.title}
                </h3>

                <p className="mt-2 text-xs text-muted-foreground line-clamp-4 leading-relaxed">
                  {obs.body}
                </p>

                {/* Metadata Pills */}
                <div className="mt-4 pt-3 border-t border-border/50 flex flex-wrap items-center gap-2 text-[10px] text-muted-foreground">
                  <span className="bg-muted px-2 py-0.5 rounded">{obs.industryBand}</span>
                  <span className="bg-muted px-2 py-0.5 rounded">{obs.regionBand}</span>
                  <span className="bg-muted px-2 py-0.5 rounded">{obs.periodBand}</span>
                  <span className="bg-muted px-2 py-0.5 rounded">{obs.evidenceType}</span>
                </div>
              </div>

              {/* Attribution & Actions Footer */}
              <div className="pt-5 mt-4 border-t border-border flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-1.5 text-muted-foreground text-[11px]">
                  <Globe2 className="w-3.5 h-3.5 text-primary/70" />
                  <span>
                    Contributed by:{' '}
                    <strong className="text-foreground">
                      {obs.attributionOptIn && obs.attributionLabel
                        ? obs.attributionLabel
                        : 'Anonymous BFSI Contributor'}
                    </strong>
                  </span>
                </div>

                <button
                  onClick={() => setReportModalObs(obs)}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all inline-flex items-center gap-1"
                >
                  <Flag className="w-3 h-3" />
                  <span>Flag</span>
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Flag / Report Modal */}
      {reportModalObs && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 rounded-3xl bg-card border border-border shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                <Flag className="w-4 h-4 text-destructive" />
                <span>Report Shared Observation</span>
              </h3>
              <button
                onClick={() => setReportModalObs(null)}
                className="text-muted-foreground hover:text-foreground text-xs"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-muted-foreground">
              Observation: <strong className="text-foreground">{reportModalObs.title}</strong>
            </div>

            <form onSubmit={handleReport} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Reason for Reporting
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g., Potential re-identification concern, misleading operational assertion, or inappropriate phrasing..."
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full p-3 text-xs rounded-xl bg-muted/60 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 leading-relaxed"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReportModalObs(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-destructive text-destructive-foreground text-xs font-semibold hover:bg-destructive/90 transition-all inline-flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Report</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
