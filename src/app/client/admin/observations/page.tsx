'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { usePersona } from '@/context/PersonaContext';
import {
  getOrgObservationsOversight,
  adminWithdrawOrgObservation,
} from '@/server/dal/client/admin';
import {
  FileText,
  ShieldCheck,
  Building2,
  Trash2,
  AlertCircle,
  ExternalLink,
  Lock,
  Globe2,
  CheckCircle2,
  X,
  Send,
  Info,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { Contribution } from '@/types';

export default function ClientAdminObservationsPage() {
  const { actor, activeTenant } = usePersona();

  const isClientAdmin = actor.memberships.some(
    (m) => m.orgId === actor.activeTenantId && m.role === 'client_admin'
  );

  const [refreshKey, setRefreshKey] = useState(0);
  const [withdrawingObs, setWithdrawingObs] = useState<Contribution | null>(null);
  const [withdrawReason, setWithdrawReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [withdrawSuccess, setWithdrawSuccess] = useState<string | null>(null);

  if (!actor.activeTenantId || !activeTenant || !isClientAdmin) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <ShieldCheck className="w-12 h-12 text-destructive mx-auto" />
        <h1 className="text-2xl font-bold text-foreground">Client Admin Access Required</h1>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Only Client Administrators of {activeTenant ? activeTenant.name : 'this organisation'} can oversee organisation-level contributions.
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
    observations = getOrgObservationsOversight(actor);
  } catch (err: any) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-destructive mx-auto" />
        <h2 className="text-xl font-bold text-foreground">Access Denied</h2>
        <p className="text-xs text-muted-foreground">{err.message}</p>
      </div>
    );
  }

  const handleConfirmWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    if (!withdrawingObs || !withdrawReason.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      try {
        adminWithdrawOrgObservation(actor, withdrawingObs.id, withdrawReason.trim());
        setWithdrawSuccess(
          `Observation "${withdrawingObs.currentRevision.title}" withdrawn from sharing. Author has been notified.`
        );
        setWithdrawingObs(null);
        setWithdrawReason('');
        setIsSubmitting(false);
        setRefreshKey((k) => k + 1);
        setTimeout(() => setWithdrawSuccess(null), 5000);
      } catch (err: any) {
        alert(err.message || 'Withdrawal failed');
        setIsSubmitting(false);
      }
    }, 400);
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
            <span className="text-xs text-muted-foreground">Organisation Oversight</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Shared Contributions Oversight
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
            Monitor observations that team members have contributed with organisational visibility. If corporate compliance requires, administrators may withdraw items from collective review.
          </p>
        </div>

        <Link
          href="/client/admin"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-card border border-border text-foreground text-xs font-semibold hover:bg-muted transition-all self-start sm:self-auto"
        >
          <span>Admin Overview</span>
        </Link>
      </div>

      {/* Mandatory Privacy Boundary Notice */}
      <div className="p-4 rounded-2xl bg-muted/40 border border-border/80 flex items-center gap-3 text-xs text-muted-foreground">
        <Info className="w-4 h-4 text-primary shrink-0" />
        <span className="leading-relaxed">
          <strong>Privacy Boundary Invariant:</strong> This oversight console shows only items submitted with organizational visibility or published to collective learning. Unsubmitted drafts and notes marked <span className="font-semibold text-foreground">private to author</span> are strictly confidential and never displayed here.
        </span>
      </div>

      {withdrawSuccess && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{withdrawSuccess}</span>
        </div>
      )}

      {/* Oversight List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" />
            <span>Organisation Shared Items ({observations.length})</span>
          </h2>
        </div>

        {observations.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-card border border-dashed border-border max-w-md mx-auto space-y-3">
            <Globe2 className="w-10 h-10 text-muted-foreground mx-auto" />
            <h3 className="text-sm font-bold text-foreground">No Shared Items Found</h3>
            <p className="text-xs text-muted-foreground">
              No team members have shared observations across the organization yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {observations.map((obs) => (
              <div
                key={obs.id}
                className="p-6 rounded-3xl bg-card border border-border flex flex-col justify-between shadow-sm space-y-4 hover:border-primary/40 transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                      {obs.currentRevision.offeringId}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-muted text-muted-foreground uppercase">
                      {obs.currentState}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-foreground leading-snug">
                    {obs.currentRevision.title}
                  </h3>

                  <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                    {obs.currentRevision.body}
                  </p>

                  <div className="pt-2 text-xs text-muted-foreground border-t border-border/50 flex flex-wrap items-center justify-between gap-2">
                    <span>
                      Author: <strong className="text-foreground">{obs.authorName}</strong>
                    </span>
                    <span className="font-mono text-[11px]">
                      {formatDate(obs.updatedAt || obs.createdAt)}
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-border flex items-center justify-between text-xs">
                  <Link
                    href={`/client/observations/${obs.id}`}
                    className="text-primary hover:underline font-semibold inline-flex items-center gap-1"
                  >
                    <span>Inspect Details</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>

                  {obs.currentState !== 'Withdrawn' && (
                    <button
                      onClick={() => {
                        setWithdrawingObs(obs);
                        setWithdrawReason('');
                      }}
                      className="px-3 py-1.5 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 font-semibold transition-all inline-flex items-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Admin Withdraw</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Admin Withdraw Modal */}
      {withdrawingObs && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 rounded-3xl bg-card border border-border shadow-2xl space-y-4">
            <div className="flex items-start gap-3 text-destructive">
              <Trash2 className="w-6 h-6 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-base font-bold text-foreground">
                  Withdraw from Organisation Sharing
                </h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Withdrawing will immediately remove "{withdrawingObs.currentRevision.title}" from organizational visibility and purge any shared indexing. The author ({withdrawingObs.authorName}) will be notified.
                </p>
              </div>
            </div>

            <form onSubmit={handleConfirmWithdraw} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Compliance / Policy Reason (Mandatory for Author Audit)
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g., Confidential transaction volume figures included; requires review under corporate disclosure policy..."
                  value={withdrawReason}
                  onChange={(e) => setWithdrawReason(e.target.value)}
                  className="w-full p-3 text-xs rounded-xl bg-muted/60 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 leading-relaxed"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setWithdrawingObs(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-destructive text-destructive-foreground text-xs font-semibold hover:bg-destructive/90 transition-all inline-flex items-center gap-1.5"
                >
                  <span>{isSubmitting ? 'Withdrawing...' : 'Confirm Admin Withdrawal'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
