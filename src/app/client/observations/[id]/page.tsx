'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { usePersona } from '@/context/PersonaContext';
import {
  getClientObservationById,
  withdrawObservation,
  computeWhoCanSee,
} from '@/server/dal/client/observations';
import { transition } from '@/server/dal/client/state_machine';
import { store } from '@/server/dal/store';
import { Contribution, ContributionState } from '@/types';
import {
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Clock,
  ExternalLink,
  Trash2,
  Send,
  History,
  ShieldCheck,
  Building2,
  Lock,
  Globe2,
  FileText,
  RotateCcw,
  Sparkles,
  MessageSquare,
  Info,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function ClientObservationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const obsId = params?.id as string;
  const { actor, activeTenant } = usePersona();

  // Amend & Resubmit State (when Returned)
  const [isAmending, setIsAmending] = useState(false);
  const [amendedTitle, setAmendedTitle] = useState('');
  const [amendedBody, setAmendedBody] = useState('');
  const [resubmitSuccess, setResubmitSuccess] = useState<string | null>(null);

  // Withdrawal state
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawReason, setWithdrawReason] = useState('');
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Local comments state
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<
    { id: string; authorName: string; text: string; createdAt: string }[]
  >([
    {
      id: 'cmt-1',
      authorName: 'Internal Ops Risk Review',
      text: 'Verified against synthetic ASEAN export stress baseline. Ready for collective synthesis.',
      createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    },
  ]);

  if (!actor.activeTenantId || !activeTenant) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <Building2 className="w-12 h-12 text-muted-foreground mx-auto" />
        <h1 className="text-xl font-bold text-foreground">Workspace Required</h1>
        <p className="text-xs text-muted-foreground">Select an active client workspace to view observation details.</p>
        <Link href="/choose-workspace" className="text-xs text-primary underline">
          Switch Workspace
        </Link>
      </div>
    );
  }

  let obs: Contribution;
  try {
    obs = getClientObservationById(actor, obsId);
  } catch (err: any) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-destructive mx-auto" />
        <h2 className="text-xl font-bold text-foreground">Observation Inaccessible</h2>
        <p className="text-xs text-muted-foreground">{err.message}</p>
        <Link
          href="/client/observations"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
        >
          Back to Observations
        </Link>
      </div>
    );
  }

  const isAuthor = obs.authorId === actor.userId;
  const whoCanSee = computeWhoCanSee(obs.visibilityChoice, obs.currentState);
  const offering = store.offerings.find((o) => o.id === obs.currentRevision.offeringId);

  const handleStartAmending = () => {
    setAmendedTitle(obs.currentRevision.title);
    setAmendedBody(obs.currentRevision.body);
    setIsAmending(true);
  };

  const handleResubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amendedTitle.trim() || !amendedBody.trim()) return;

    try {
      transition(actor, obs.id, {
        type: 'amend_resubmit',
        title: amendedTitle.trim(),
        body: amendedBody.trim(),
      });
      setIsAmending(false);
      setResubmitSuccess('Amended revision submitted for moderation review.');
      setRefreshKey((k) => k + 1);
    } catch (err: any) {
      alert('Resubmit failed: ' + err.message);
    }
  };

  const handleConfirmWithdraw = () => {
    setIsWithdrawing(true);
    setTimeout(() => {
      try {
        withdrawObservation(actor, obs.id);
        setShowWithdrawModal(false);
        setIsWithdrawing(false);
        setRefreshKey((k) => k + 1);
      } catch (err: any) {
        alert('Withdraw failed: ' + err.message);
        setIsWithdrawing(false);
      }
    }, 400);
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setComments((prev) => [
      ...prev,
      {
        id: `cmt-${Date.now()}`,
        authorName: actor.name,
        text: commentText.trim(),
        createdAt: new Date().toISOString(),
      },
    ]);
    setCommentText('');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8" key={refreshKey}>
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/client/observations"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Observations</span>
        </Link>

        <div className="flex items-center gap-2">
          {obs.currentState !== 'Withdrawn' && isAuthor && (
            <button
              onClick={() => setShowWithdrawModal(true)}
              className="px-3.5 py-1.5 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive/20 text-xs font-semibold transition-all inline-flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Withdraw Observation</span>
            </button>
          )}
        </div>
      </div>

      {resubmitSuccess && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{resubmitSuccess}</span>
        </div>
      )}

      {/* Returned / Clarification Requested Callout */}
      {obs.currentState === 'Returned' && (
        <div className="p-6 rounded-3xl bg-rose-500/10 border border-rose-500/30 text-rose-900 dark:text-rose-200 space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold">Action Needed: Moderator Requested Clarification</h3>
                <p className="text-xs text-rose-800/90 dark:text-rose-300/90 mt-1 leading-relaxed">
                  {obs.clarificationRequest ||
                    'Please elaborate on the baseline criteria and verify synthetic numbers.'}
                </p>
              </div>
            </div>

            {isAuthor && !isAmending && (
              <button
                onClick={handleStartAmending}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-all inline-flex items-center gap-1.5 shadow-sm shrink-0"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Amend & Resubmit</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Amend Form Modal or Inline */}
      {isAmending && (
        <div className="p-6 rounded-3xl bg-card border border-primary/40 shadow-md space-y-4">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <h3 className="text-sm font-bold text-foreground">
              Draft Amended Revision (v{obs.currentRevision.version + 1})
            </h3>
            <button
              onClick={() => setIsAmending(false)}
              className="text-xs font-semibold text-muted-foreground hover:text-foreground"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleResubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                Updated Title
              </label>
              <input
                type="text"
                required
                value={amendedTitle}
                onChange={(e) => setAmendedTitle(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-muted/60 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                Updated Narrative & Clarifications
              </label>
              <textarea
                rows={4}
                required
                value={amendedBody}
                onChange={(e) => setAmendedBody(e.target.value)}
                className="w-full p-3 text-xs rounded-xl bg-muted/60 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 leading-relaxed"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAmending(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground"
              >
                Discard
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 inline-flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Amended v{obs.currentRevision.version + 1}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Observation Summary Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-card border border-border space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-border/60 pb-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                {offering ? offering.name : obs.currentRevision.offeringId}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-muted text-muted-foreground">
                State: {obs.currentState}
              </span>
              <span className="text-xs font-mono text-muted-foreground">
                v{obs.currentRevision.version}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              {obs.currentRevision.title}
            </h1>

            <div className="text-xs text-muted-foreground flex flex-wrap items-center gap-2">
              <span>Authored by {obs.authorName}</span>
              <span>&bull;</span>
              <span>Workspace: {activeTenant.name}</span>
              <span>&bull;</span>
              <span>Last updated: {formatDate(obs.updatedAt || obs.createdAt)}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {obs.visibilityChoice === 'within_organisation' ? (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-muted text-foreground flex items-center gap-1.5 border border-border">
                <Globe2 className="w-3.5 h-3.5 text-primary" />
                <span>Our Organisation</span>
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-muted text-foreground flex items-center gap-1.5 border border-border">
                <Lock className="w-3.5 h-3.5 text-primary" />
                <span>Private to Author</span>
              </span>
            )}
          </div>
        </div>

        {/* Narrative Body */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Empirical Findings & Field Narrative
          </h3>
          <p className="text-xs sm:text-sm text-foreground leading-relaxed whitespace-pre-wrap p-4 rounded-2xl bg-muted/40 border border-border/40">
            {obs.currentRevision.body}
          </p>
        </div>

        {/* Classification & Confidence Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/60">
            <div className="text-[10px] font-semibold text-muted-foreground uppercase">
              Industry
            </div>
            <div className="text-xs font-bold text-foreground mt-0.5">
              {obs.currentRevision.industry}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/60">
            <div className="text-[10px] font-semibold text-muted-foreground uppercase">
              Region
            </div>
            <div className="text-xs font-bold text-foreground mt-0.5">
              {obs.currentRevision.region}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/60">
            <div className="text-[10px] font-semibold text-muted-foreground uppercase">
              Evidence Type
            </div>
            <div className="text-xs font-bold text-foreground mt-0.5">
              {obs.currentRevision.evidenceType}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/60">
            <div className="text-[10px] font-semibold text-muted-foreground uppercase">
              Confidence Level
            </div>
            <div className="text-xs font-bold text-primary mt-0.5">
              {obs.currentRevision.confidence}
            </div>
          </div>
        </div>
      </div>

      {/* Who Can See & Consents Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Who Can See Card */}
        <div className="p-6 rounded-3xl bg-card border border-border space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-primary" />
            <span>Access & Visibility Boundary</span>
          </h3>
          <div className="p-3.5 rounded-2xl bg-muted/40 text-xs text-foreground leading-relaxed">
            <strong className="block text-primary mb-0.5">{whoCanSee.audienceLabel}</strong>
            {whoCanSee.summary}
          </div>
        </div>

        {/* 4 Consents Summary */}
        <div className="p-6 rounded-3xl bg-card border border-border space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Consents Configuration</span>
          </h3>

          <div className="space-y-1.5 text-xs">
            <div className="flex items-center justify-between p-2 rounded-xl bg-muted/40">
              <span>Benchmarking Aggregation</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                {obs.consents.consent_process ? 'Granted' : 'Refused'}
              </span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-xl bg-muted/40">
              <span>De-Identified Publishing</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                {obs.consents.consent_publish ? 'Granted' : 'Refused'}
              </span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-xl bg-muted/40">
              <span>Attribution Label</span>
              <span className="font-semibold text-muted-foreground">
                {obs.consents.consent_attribution ? 'Attributed' : 'Anonymous'}
              </span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-xl bg-muted/40">
              <span>Model Training</span>
              <span className="font-semibold text-muted-foreground">
                {obs.consents.consent_training ? 'Opted-In' : 'Default Off'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Revision History Timeline */}
      <div className="p-6 rounded-3xl bg-card border border-border space-y-4">
        <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
          <History className="w-4 h-4 text-primary" />
          <span>Revision History ({obs.revisions.length})</span>
        </h3>

        <div className="space-y-3">
          {obs.revisions.map((rev) => (
            <div
              key={rev.version}
              className="p-3.5 rounded-2xl bg-muted/30 border border-border/50 text-xs space-y-1"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-foreground">
                  Version {rev.version}: {rev.title}
                </span>
                <span className="text-[10px] font-mono text-muted-foreground">
                  {formatDate(rev.createdAt)}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground line-clamp-2">{rev.body}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Workspace Comments / Discussions */}
      <div className="p-6 rounded-3xl bg-card border border-border space-y-4">
        <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-primary" />
          <span>Organisation Discussion (Inherited Audience: Tenant)</span>
        </h3>

        <div className="space-y-3">
          {comments.map((cmt) => (
            <div
              key={cmt.id}
              className="p-3.5 rounded-2xl bg-muted/40 border border-border/40 text-xs space-y-1"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-foreground">{cmt.authorName}</span>
                <span className="text-[10px] text-muted-foreground font-mono">
                  {new Date(cmt.createdAt).toLocaleTimeString()}
                </span>
              </div>
              <p className="text-muted-foreground">{cmt.text}</p>
            </div>
          ))}
        </div>

        <form onSubmit={handleAddComment} className="flex gap-2 pt-2">
          <input
            type="text"
            placeholder="Add an internal note or review comment for colleagues..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            className="flex-1 px-3.5 py-2 text-xs rounded-xl bg-muted/60 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all shrink-0"
          >
            Comment
          </button>
        </form>
      </div>

      {/* Withdrawal Confirmation Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 rounded-3xl bg-card border border-border shadow-2xl space-y-4">
            <div className="flex items-start gap-3 text-destructive">
              <Trash2 className="w-6 h-6 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-base font-bold text-foreground">
                  Withdraw Observation
                </h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Withdrawing immediately purges this observation from all shared learning feeds, search indexes, and AIRA semantic retrieval within ≤60 seconds.
                </p>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                Withdrawal Reason (Optional Audit Note)
              </label>
              <textarea
                rows={2}
                placeholder="e.g., Sensitive supplier terms included by mistake, or superseded by newer telemetry..."
                value={withdrawReason}
                onChange={(e) => setWithdrawReason(e.target.value)}
                className="w-full p-2.5 text-xs rounded-xl bg-muted/60 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowWithdrawModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isWithdrawing}
                onClick={handleConfirmWithdraw}
                className="px-4 py-2 rounded-xl bg-destructive text-destructive-foreground text-xs font-semibold hover:bg-destructive/90 transition-all"
              >
                {isWithdrawing ? 'Withdrawing...' : 'Confirm Withdrawal (<60s)'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
