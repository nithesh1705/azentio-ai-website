'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { usePersona } from '@/context/PersonaContext';
import {
  getClientObservations,
  transitionContribution,
} from '@/server/dal/store';
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
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { Contribution } from '@/types';

export default function ClientObservationsPage() {
  const { actor, activeTenant } = usePersona();
  const [tab, setTab] = useState<'mine' | 'org'>('mine');
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null);
  const [withdrawalSuccess, setWithdrawalSuccess] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  if (!actor.activeTenantId || !activeTenant) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <Building2 className="w-12 h-12 text-muted-foreground mx-auto" />
        <h1 className="text-2xl font-bold text-foreground">Select Active Workspace</h1>
        <p className="text-sm text-muted-foreground">
          Please select a client persona to view organisation observations.
        </p>
      </div>
    );
  }

  let observations: Contribution[] = [];
  try {
    observations = getClientObservations(actor, tab);
  } catch (err) {
    observations = [];
  }

  const handleWithdraw = (obsId: string) => {
    setWithdrawingId(obsId);
    setTimeout(() => {
      try {
        transitionContribution(actor, obsId, { type: 'withdraw' });
        setWithdrawalSuccess(
          `Contribution withdrawn synchronously at ${new Date().toLocaleTimeString()} (≤ 60s hard ceiling). Purged from search, themes, and AIRA retrieval.`
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
      transitionContribution(actor, obsId, { type: 'submit' });
      setRefreshKey((k) => k + 1);
    } catch (err: any) {
      alert(err.message || 'Submission failed');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10" key={refreshKey}>
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs uppercase tracking-widest font-bold text-primary">
              {activeTenant.name} &bull; Private Workspace
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
            Market Observations & Proposals
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Manage your institution&apos;s observations. Private drafts and unsubmitted observations remain strictly confidential.
          </p>
        </div>

        <Link
          href="/client/observations/new"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all shadow-sm shadow-emerald-500/20 hover:scale-105 active:scale-95 shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Observation</span>
        </Link>
      </div>

      {/* Withdrawal Success Confirmation Banner */}
      <AnimatePresence>
        {withdrawalSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>{withdrawalSuccess}</span>
            </div>
            <button
              onClick={() => setWithdrawalSuccess(null)}
              className="font-bold hover:underline ml-4"
            >
              Dismiss
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-4 mb-6">
        <button
          onClick={() => setTab('mine')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            tab === 'mine'
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
          }`}
        >
          My Observations ({observations.filter((o) => o.authorId === actor.userId).length})
        </button>

        <button
          onClick={() => setTab('org')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            tab === 'org'
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
          }`}
        >
          Our Organisation&apos;s Observations ({observations.length})
        </button>
      </div>

      {/* Observation Cards */}
      {observations.length === 0 ? (
        <div className="p-12 text-center rounded-3xl glass-panel border border-dashed border-border max-w-xl mx-auto space-y-4">
          <FileText className="w-10 h-10 text-muted-foreground mx-auto" />
          <h2 className="text-base font-bold text-foreground">No Observations Found</h2>
          <p className="text-xs text-muted-foreground">
            {tab === 'mine'
              ? "You haven't created any observations yet. Start with a private draft."
              : 'No observations recorded across your organisation.'}
          </p>
          <Link
            href="/client/observations/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Observation</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {observations.map((obs) => (
            <motion.div
              key={obs.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 rounded-2xl glass-panel border border-border flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <StateBadge state={obs.currentState} />
                  <span className="text-[11px] text-muted-foreground">
                    Created {formatDate(obs.createdAt)} by <span className="font-medium text-foreground">{obs.authorName}</span>
                  </span>
                  <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded font-mono">
                    Revision v{obs.currentRevision.version}
                  </span>
                  <span className="text-[10px] text-primary bg-primary/10 px-2 py-0.5 rounded font-medium">
                    {obs.currentRevision.industry}
                  </span>
                </div>

                <h3 className="text-base font-bold text-foreground">
                  {obs.currentRevision.title}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                  {obs.currentRevision.body}
                </p>

                {obs.clarificationRequest && (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-300">
                    <span className="font-semibold">Moderator Clarification Request: </span>
                    {obs.clarificationRequest}
                  </div>
                )}

                {obs.rejectionReason && (
                  <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-xs text-destructive">
                    <span className="font-semibold">Rejection Note: </span>
                    {obs.rejectionReason}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                {obs.currentState === 'Draft' && obs.authorId === actor.userId && (
                  <button
                    onClick={() => handleSubmitDraft(obs.id)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit for Review</span>
                  </button>
                )}

                {obs.currentState === 'Published' && (
                  <button
                    onClick={() => handleWithdraw(obs.id)}
                    disabled={withdrawingId === obs.id}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-destructive/10 text-destructive border border-destructive/30 text-xs font-semibold hover:bg-destructive/20 transition-all"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{withdrawingId === obs.id ? 'Purging...' : 'Withdraw (≤60s)'}</span>
                  </button>
                )}

                <span className="text-[10px] font-mono text-muted-foreground bg-muted px-2 py-1 rounded">
                  {obs.visibilityChoice.replace(/_/g, ' ')}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

function StateBadge({ state }: { state: Contribution['currentState'] }) {
  const styles: Record<Contribution['currentState'], string> = {
    Draft: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    Submitted: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    In_Review: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    Returned: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    Rejected: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    Published: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-bold',
    Unpublished_Under_Review: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    Withdrawn: 'bg-slate-700/20 text-slate-500 border-slate-700/30 line-through',
  };

  return (
    <span
      className={`text-[11px] px-2.5 py-0.5 rounded-full border font-medium ${
        styles[state] || styles.Draft
      }`}
    >
      {state.replace(/_/g, ' ')}
    </span>
  );
}
