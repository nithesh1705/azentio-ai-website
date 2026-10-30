'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { usePersona } from '@/context/PersonaContext';
import {
  getClientObservations,
  withdrawObservation,
  submitObservation,
} from '@/server/dal/client/observations';
import { Contribution, ContributionState } from '@/types';
import {
  FileText,
  PlusCircle,
  Clock,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  Trash2,
  ExternalLink,
  Send,
  Building2,
  Filter,
  Eye,
  AlertCircle,
  HelpCircle,
  Lock,
  Globe2,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function ClientObservationsPage() {
  const { actor, activeTenant } = usePersona();
  const [tab, setTab] = useState<'mine' | 'org'>('mine');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null);
  const [withdrawalSuccess, setWithdrawalSuccess] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  if (!actor.activeTenantId || !activeTenant) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <Building2 className="w-12 h-12 text-muted-foreground mx-auto" />
        <h1 className="text-2xl font-bold text-foreground">Select Active Workspace</h1>
        <p className="text-sm text-muted-foreground">
          Please select a client workspace to view organisation observations.
        </p>
        <Link
          href="/choose-workspace"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 mt-2"
        >
          Select Workspace
        </Link>
      </div>
    );
  }

  let observations: Contribution[] = [];
  try {
    observations = getClientObservations(
      actor,
      tab,
      statusFilter !== 'all' ? { status: statusFilter as ContributionState } : undefined
    );
  } catch (err) {
    observations = [];
  }

  const handleWithdraw = (obsId: string) => {
    setWithdrawingId(obsId);
    setTimeout(() => {
      try {
        withdrawObservation(actor, obsId);
        setWithdrawalSuccess(
          `Observation withdrawn synchronously at ${new Date().toLocaleTimeString()} (≤ 60s hard ceiling). Purged from search, themes, and AIRA retrieval.`
        );
        setRefreshKey((k) => k + 1);
      } catch (err: any) {
        alert(err.message || 'Withdrawal failed');
      } finally {
        setWithdrawingId(null);
      }
    }, 400);
  };

  const handleSubmitDraft = (obsId: string) => {
    try {
      submitObservation(actor, obsId);
      setRefreshKey((k) => k + 1);
    } catch (err: any) {
      alert(err.message || 'Submission failed');
    }
  };

  const getStatusBadge = (state: ContributionState) => {
    switch (state) {
      case 'Draft':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-muted text-muted-foreground border border-border">
            Draft
          </span>
        );
      case 'Submitted':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            Submitted
          </span>
        );
      case 'In_Review':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            In Review
          </span>
        );
      case 'Returned':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            <span>Action Needed</span>
          </span>
        );
      case 'Published':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>Published</span>
          </span>
        );
      case 'Withdrawn':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-muted/60 text-muted-foreground line-through">
            Withdrawn
          </span>
        );
      case 'Rejected':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-destructive/10 text-destructive border border-destructive/20">
            Not Proceeding
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-muted text-muted-foreground">
            {state}
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8" key={refreshKey}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
              {activeTenant.name}
            </span>
            <span className="text-xs text-muted-foreground">Tenant Perimeter</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Field Observations & Insights
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground max-w-2xl">
            Record edge cases, seasonal behavior patterns, and operational feedback. Choose whether items remain private to your team or undergo de-identified collective synthesis.
          </p>
        </div>

        <Link
          href="/client/observations/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all shadow-md shadow-primary/20 self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Observation</span>
        </Link>
      </div>

      {/* Synchronous Withdrawal Notice */}
      <AnimatePresence>
        {withdrawalSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{withdrawalSuccess}</span>
            </div>
            <button
              onClick={() => setWithdrawalSuccess(null)}
              className="text-emerald-700 dark:text-emerald-400 hover:underline font-semibold"
            >
              Dismiss
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabs & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-4">
        {/* Tab Switcher */}
        <div className="flex items-center gap-1 p-1 bg-muted rounded-2xl border border-border">
          <button
            onClick={() => setTab('mine')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              tab === 'mine'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            My Observations
          </button>
          <button
            onClick={() => setTab('org')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              tab === 'org'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Our Organisation
          </button>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-muted-foreground" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl bg-card border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="all">All States</option>
            <option value="Draft">Drafts</option>
            <option value="Submitted">Submitted</option>
            <option value="In_Review">In Review</option>
            <option value="Returned">Returned (Action Needed)</option>
            <option value="Published">Published</option>
            <option value="Withdrawn">Withdrawn</option>
          </select>
        </div>
      </div>

      {/* Observations Grid */}
      {observations.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-card border border-dashed border-border max-w-md mx-auto space-y-3">
          <FileText className="w-10 h-10 text-muted-foreground mx-auto" />
          <h3 className="text-sm font-bold text-foreground">No Observations Found</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {tab === 'mine'
              ? 'You have not drafted or submitted any observations under this filter.'
              : 'No shared organisation observations found. Private drafts are kept confidential to their respective authors.'}
          </p>
          <Link
            href="/client/observations/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 mt-2"
          >
            Create Observation
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {observations.map((obs) => {
            const isAuthor = obs.authorId === actor.userId;
            const isReturned = obs.currentState === 'Returned';

            return (
              <motion.div
                key={obs.id}
                whileHover={{ y: -2 }}
                transition={{ duration: 0.2 }}
                className={`p-6 rounded-3xl bg-card border flex flex-col justify-between shadow-sm transition-all ${
                  isReturned
                    ? 'border-rose-500/40 ring-1 ring-rose-500/20'
                    : 'border-border hover:border-primary/40'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-1.5">
                      {getStatusBadge(obs.currentState)}
                      <span className="text-[10px] font-mono text-muted-foreground">
                        v{obs.currentRevision.version}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      {obs.visibilityChoice === 'within_organisation' ? (
                        <span className="flex items-center gap-1" title="Shared within organisation">
                          <Globe2 className="w-3.5 h-3.5 text-muted-foreground" />
                          <span className="hidden sm:inline">Org</span>
                        </span>
                      ) : (
                        <span className="flex items-center gap-1" title="Private to author">
                          <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                          <span className="hidden sm:inline">Private</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                    {obs.currentRevision.offeringId}
                  </div>

                  <h3 className="text-base font-bold text-foreground line-clamp-1">
                    {obs.currentRevision.title}
                  </h3>

                  <p className="mt-2 text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                    {obs.currentRevision.body}
                  </p>

                  {/* Clarification Callout if Returned */}
                  {isReturned && (
                    <div className="mt-4 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-900 dark:text-rose-200 text-xs space-y-1">
                      <div className="font-bold flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>Moderator Requested Clarification:</span>
                      </div>
                      <p className="text-[11px] leading-relaxed">
                        {obs.clarificationRequest || 'Please review and clarify specific operational evidence.'}
                      </p>
                    </div>
                  )}

                  {/* Metadata tags */}
                  <div className="mt-4 pt-3 border-t border-border/50 flex flex-wrap items-center gap-2 text-[10px] text-muted-foreground">
                    <span className="bg-muted px-2 py-0.5 rounded">
                      {obs.currentRevision.industry}
                    </span>
                    <span className="bg-muted px-2 py-0.5 rounded">
                      {obs.currentRevision.region}
                    </span>
                    <span className="bg-muted px-2 py-0.5 rounded">
                      Confidence: {obs.currentRevision.confidence}
                    </span>
                    <span className="ml-auto font-mono">
                      {formatDate(obs.updatedAt || obs.createdAt)}
                    </span>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-5 mt-4 border-t border-border flex items-center justify-between gap-3">
                  <Link
                    href={`/client/observations/${obs.id}`}
                    className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1"
                  >
                    <span>View Revisions & Details</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>

                  <div className="flex items-center gap-2">
                    {obs.currentState === 'Draft' && isAuthor && (
                      <button
                        onClick={() => handleSubmitDraft(obs.id)}
                        className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 inline-flex items-center gap-1 shadow-sm"
                      >
                        <Send className="w-3 h-3" />
                        <span>Submit</span>
                      </button>
                    )}

                    {obs.currentState !== 'Withdrawn' && isAuthor && (
                      <button
                        onClick={() => handleWithdraw(obs.id)}
                        disabled={withdrawingId === obs.id}
                        className="px-3 py-1.5 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 text-xs font-semibold transition-all inline-flex items-center gap-1"
                        title="Withdraw immediately from shared indexing (< 60s hard ceiling)"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>{withdrawingId === obs.id ? 'Withdrawing...' : 'Withdraw'}</span>
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
