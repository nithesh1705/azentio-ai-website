'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { usePersona } from '@/context/PersonaContext';
import {
  getModerationQueue,
  transitionContribution,
} from '@/server/dal/store';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Eye,
  Edit3,
  Clock,
  AlertTriangle,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { Contribution } from '@/types';

export default function ModerationQueuePage() {
  const { actor } = usePersona();
  const [refreshKey, setRefreshKey] = useState(0);

  const isModerator = actor.platformGrants.includes('learning_moderator');

  const [activeModal, setActiveModal] = useState<{
    type: 'clarify' | 'reject' | 'publish';
    contrib: Contribution;
  } | null>(null);

  const [deidentifiedTitle, setDeidentifiedTitle] = useState('');
  const [deidentifiedBody, setDeidentifiedBody] = useState('');
  const [clarificationNote, setClarificationNote] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  if (!isModerator) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <ShieldCheck className="w-12 h-12 text-destructive mx-auto" />
        <h1 className="text-2xl font-bold text-foreground">Access Restricted</h1>
        <p className="text-sm text-muted-foreground">
          Moderation queue requires explicit &ldquo;learning_moderator&rdquo; platform grant. Please sign in with your moderator credentials (e.g. Pranika K: pranika_k@azentio.com).
        </p>
        <div className="pt-2">
          <Link
            href="/signin"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-md shadow-primary/20"
          >
            <span>Sign In as Moderator</span>
          </Link>
        </div>
      </div>
    );
  }

  let queue: Contribution[] = [];
  try {
    queue = getModerationQueue(actor);
  } catch (err: any) {
    queue = [];
  }

  const handleClaim = (id: string) => {
    try {
      transitionContribution(actor, id, { type: 'claim' });
      setActionSuccess('Claimed for review.');
      setRefreshKey((k) => k + 1);
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleConfirmAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeModal) return;

    try {
      if (activeModal.type === 'clarify') {
        transitionContribution(actor, activeModal.contrib.id, {
          type: 'request_clarification',
          note: clarificationNote,
        });
        setActionSuccess('Clarification requested. Returned to author.');
      } else if (activeModal.type === 'reject') {
        transitionContribution(actor, activeModal.contrib.id, {
          type: 'reject',
          reason: rejectionReason,
        });
        setActionSuccess('Observation rejected with reason.');
      } else if (activeModal.type === 'publish') {
        transitionContribution(actor, activeModal.contrib.id, {
          type: 'publish',
          deidentifiedTitle: deidentifiedTitle || activeModal.contrib.currentRevision.title,
          deidentifiedBody: deidentifiedBody || activeModal.contrib.currentRevision.body,
        });
        setActionSuccess('De-identified observation published to shared learning feed!');
      }

      setActiveModal(null);
      setClarificationNote('');
      setRejectionReason('');
      setDeidentifiedTitle('');
      setDeidentifiedBody('');
      setRefreshKey((k) => k + 1);
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10" key={refreshKey}>
      {/* Header */}
      <div className="max-w-3xl mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs uppercase tracking-widest font-bold text-amber-500">
            Platform Moderation Console
          </span>
          <span className="badge-synthetic text-xs">Governed Triage</span>
        </div>
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
          Learning Moderation & Redaction Queue
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
          Review community-proposed market observations. Ensure sensitive client identifiers, real customer PII, and non-generalizable figures are thoroughly de-identified before publication into the shared read model.
        </p>
      </div>

      <AnimatePresence>
        {actionSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>{actionSuccess}</span>
            </div>
            <button
              onClick={() => setActionSuccess(null)}
              className="font-bold hover:underline"
            >
              Dismiss
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mb-6 flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Pending Submissions ({queue.length})
        </span>

        <span className="text-xs text-muted-foreground font-mono">
          Boundary: Zero draft access enforced
        </span>
      </div>

      {queue.length === 0 ? (
        <div className="p-12 text-center rounded-3xl glass-panel border border-dashed border-border max-w-xl mx-auto space-y-3">
          <ShieldCheck className="w-10 h-10 text-emerald-500 mx-auto" />
          <h2 className="text-base font-bold text-foreground">Queue Is Clear</h2>
          <p className="text-xs text-muted-foreground">
            No submissions currently awaiting moderator claim or review.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {queue.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-8 rounded-3xl glass-panel border border-border glow-card space-y-5"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                      State: {item.currentState}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Author: <span className="font-semibold text-foreground">{item.authorName}</span> ({item.authorEmail})
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Tenant: <span className="font-mono text-foreground">{item.orgId}</span>
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-foreground">
                    {item.currentRevision.title}
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  {item.currentState === 'Submitted' && (
                    <button
                      onClick={() => handleClaim(item.id)}
                      className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all shadow-sm"
                    >
                      Claim for Review
                    </button>
                  )}

                  {item.currentState === 'In_Review' && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setActiveModal({ type: 'publish', contrib: item });
                          setDeidentifiedTitle(item.currentRevision.title);
                          setDeidentifiedBody(item.currentRevision.body);
                        }}
                        className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-500 transition-all shadow-sm"
                      >
                        Redact & Publish
                      </button>

                      <button
                        onClick={() => setActiveModal({ type: 'clarify', contrib: item })}
                        className="px-3.5 py-2 rounded-xl bg-card border border-border text-foreground text-xs font-semibold hover:bg-muted"
                      >
                        Clarify
                      </button>

                      <button
                        onClick={() => setActiveModal({ type: 'reject', contrib: item })}
                        className="px-3.5 py-2 rounded-xl bg-destructive/10 text-destructive border border-destructive/20 text-xs font-semibold hover:bg-destructive/20"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-muted/40 border border-border/80 text-xs space-y-2">
                <span className="font-bold text-foreground">Proposed Body Text:</span>
                <p className="text-muted-foreground leading-relaxed">
                  {item.currentRevision.body}
                </p>
              </div>

              {item.sensitivityFlags.length > 0 && (
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                    <span>Sensitivity Scanner Review Flags:</span>
                  </div>
                  <ul className="list-disc list-inside">
                    {item.sensitivityFlags.map((flag, idx) => (
                      <li key={idx}>{flag}</li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Action Modals */}
      <AnimatePresence>
        {activeModal && (
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
              className="bg-card border border-border rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4"
            >
              <h3 className="font-bold text-base text-foreground">
                {activeModal.type === 'publish'
                  ? 'Redact & De-Identify for Publication'
                  : activeModal.type === 'clarify'
                  ? 'Request Clarification from Author'
                  : 'Reject Contribution'}
              </h3>

              <form onSubmit={handleConfirmAction} className="space-y-4">
                {activeModal.type === 'publish' && (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-foreground mb-1">
                        De-Identified Title
                      </label>
                      <input
                        type="text"
                        required
                        value={deidentifiedTitle}
                        onChange={(e) => setDeidentifiedTitle(e.target.value)}
                        className="w-full bg-muted/60 border border-border rounded-xl px-3.5 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-foreground mb-1">
                        De-Identified Body
                      </label>
                      <textarea
                        rows={4}
                        required
                        value={deidentifiedBody}
                        onChange={(e) => setDeidentifiedBody(e.target.value)}
                        className="w-full bg-muted/60 border border-border rounded-xl px-3.5 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  </>
                )}

                {activeModal.type === 'clarify' && (
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      Clarification Instructions for Contributor
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={clarificationNote}
                      onChange={(e) => setClarificationNote(e.target.value)}
                      placeholder="Specify which figures should be aggregated or generalized..."
                      className="w-full bg-muted/60 border border-border rounded-xl px-3.5 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                )}

                {activeModal.type === 'reject' && (
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      Reason for Rejection
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="e.g. Incompatible with policy, duplicated submission, confidential pricing..."
                      className="w-full bg-muted/60 border border-border rounded-xl px-3.5 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-destructive"
                    />
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-2 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setActiveModal(null)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90"
                  >
                    Confirm Action
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

