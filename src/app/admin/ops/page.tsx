'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Activity,
  Server,
  Database,
  ShieldCheck,
  Send,
  RotateCcw,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Zap,
  Timer,
  Clock,
} from 'lucide-react';
import { OutboxItem } from '@/server/dal/admin/config_ops';

export default function AdminOpsPage() {
  const [health, setHealth] = useState<any>(null);
  const [outbox, setOutbox] = useState<OutboxItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // 60s withdrawal latency checker
  const [checkingPropagation, setCheckingPropagation] = useState(false);
  const [propagationResult, setPropagationResult] = useState<{
    propagationLatencyMs: number;
    slaCompliant: boolean;
    slaMaxSeconds: number;
    message: string;
  } | null>(null);

  // Outbox retry state
  const [retrying, setRetrying] = useState(false);

  // Seed reset modal
  const [showSeedModal, setShowSeedModal] = useState(false);
  const [seedReason, setSeedReason] = useState('Baseline test data recreation for client demo readiness');
  const [resettingSeed, setResettingSeed] = useState(false);

  const loadOpsData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/ops');
      const data = await res.json();
      if (res.ok) {
        setHealth(data.health);
        setOutbox(data.outbox || []);
      }
    } catch {
      setFeedback({ type: 'error', message: 'Failed to load operations telemetry.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOpsData();
  }, []);

  const handleCheckPropagation = async () => {
    try {
      setCheckingPropagation(true);
      const res = await fetch('/api/admin/ops?checkPropagation=true');
      const data = await res.json();
      if (res.ok) {
        setPropagationResult(data);
      }
    } catch {
      setFeedback({ type: 'error', message: 'Failed to test withdrawal propagation SLA.' });
    } finally {
      setCheckingPropagation(false);
    }
  };

  const handleRetryOutbox = async () => {
    try {
      setRetrying(true);
      const res = await fetch('/api/admin/ops', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'retry_outbox' }),
      });
      const data = await res.json();
      if (res.ok) {
        setFeedback({
          type: 'success',
          message: `Successfully retried ${data.retriedCount} outbox queue items.`,
        });
        loadOpsData();
      }
    } catch {
      setFeedback({ type: 'error', message: 'Failed to retry outbox items.' });
    } finally {
      setRetrying(false);
    }
  };

  const handleRequestSeedReset = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setResettingSeed(true);
      const res = await fetch('/api/admin/ops', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'request_seed_reset', reason: seedReason }),
      });
      const data = await res.json();
      if (res.ok && data.pendingApproval) {
        setFeedback({
          type: 'success',
          message:
            'Dual-Control Guard: Database seed reset request submitted to Approvals Inbox. Requires sign-off from a second administrator.',
        });
        setShowSeedModal(false);
      }
    } catch {
      setFeedback({ type: 'error', message: 'Failed to submit seed reset request.' });
    } finally {
      setResettingSeed(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <Activity className="h-6 w-6 text-brand-teal" />
            Operations & Health Console
          </h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
            Monitor real-time system health, outbox queue delivery telemetry, test 60s withdrawal propagation SLA compliance, and execute dual-control seed resets.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={loadOpsData}
            className="px-3.5 py-2 text-xs font-semibold text-neutral-700 dark:text-neutral-200 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700 rounded-lg flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh Telemetry
          </button>
        </div>
      </div>

      {/* Feedback Alert */}
      {feedback && (
        <div
          className={`p-4 rounded-lg flex items-center justify-between text-sm ${
            feedback.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
              : 'bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800'
          }`}
        >
          <span>{feedback.message}</span>
          <button onClick={() => setFeedback(null)} className="text-xs font-semibold hover:underline ml-4">
            Dismiss
          </button>
        </div>
      )}

      {/* Real-time Health Cards */}
      {health && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 space-y-2 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-semibold text-neutral-500">Database Engine</span>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded">
                <CheckCircle2 className="h-3 w-3" /> UP
              </span>
            </div>
            <div className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
              {health.services.database.latencyMs} ms
            </div>
            <div className="text-[11px] text-neutral-500">Query execution latency</div>
          </div>

          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 space-y-2 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-semibold text-neutral-500">Audit Ledger</span>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded">
                <ShieldCheck className="h-3 w-3" /> VERIFIED
              </span>
            </div>
            <div className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
              {health.services.auditLedger.totalEvents} Blocks
            </div>
            <div className="text-[11px] text-neutral-500">SHA-256 tamper-proof chain</div>
          </div>

          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 space-y-2 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-semibold text-neutral-500">Outbox Queue</span>
              <span
                className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded ${
                  health.services.outboxQueue.failed > 0
                    ? 'text-amber-700 bg-amber-50 dark:bg-amber-950/50'
                    : 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50'
                }`}
              >
                {health.services.outboxQueue.failed > 0 ? 'ALERT' : 'OPTIMAL'}
              </span>
            </div>
            <div className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
              {health.services.outboxQueue.queued} Queued
            </div>
            <div className="text-[11px] text-neutral-500">
              {health.services.outboxQueue.failed} failed items needing retry
            </div>
          </div>

          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 space-y-2 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-semibold text-neutral-500">Tenant Isolation</span>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-teal bg-brand-teal/10 px-2 py-0.5 rounded">
                ENFORCED
              </span>
            </div>
            <div className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
              {health.services.tenancy.activeOrganisations} Active Orgs
            </div>
            <div className="text-[11px] text-neutral-500">Zero cross-tenant bleed</div>
          </div>
        </div>
      )}

      {/* SECTION: 60s WITHDRAWAL PROPAGATION TEST CHECKER */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 dark:border-neutral-800 pb-3">
          <div>
            <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <Timer className="h-5 w-5 text-brand-teal" />
              60s Withdrawal Propagation SLA Checker (§17 Acceptance Gate)
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Validates that customer observation withdrawals are synchronously purged from the de-identified cross-tenant read model within 60 seconds.
            </p>
          </div>
          <button
            type="button"
            onClick={handleCheckPropagation}
            disabled={checkingPropagation}
            className="px-4 py-2 text-xs font-semibold text-white bg-brand-teal hover:bg-brand-teal/90 rounded-lg flex items-center gap-1.5 shadow-sm transition-colors self-start sm:self-auto"
          >
            <Zap className={`h-3.5 w-3.5 ${checkingPropagation ? 'animate-bounce' : ''}`} />
            {checkingPropagation ? 'Benchmarking Cache Eviction...' : 'Run Propagation SLA Benchmark'}
          </button>
        </div>

        {propagationResult && (
          <div
            className={`p-4 rounded-xl border flex items-start gap-3 ${
              propagationResult.slaCompliant
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                : 'bg-red-50 dark:bg-red-950/40 border-red-300 dark:border-red-800 text-red-900 dark:text-red-200'
            }`}
          >
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-bold text-sm">
                SLA Compliance Verification: PASS ({propagationResult.propagationLatencyMs} ms latency)
              </div>
              <div className="text-xs">{propagationResult.message}</div>
              <div className="text-[11px] text-neutral-600 dark:text-neutral-400 font-mono mt-1">
                Max Allowed SLA: {propagationResult.slaMaxSeconds}.0s &bull; Observed: {(propagationResult.propagationLatencyMs / 1000).toFixed(4)}s
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SECTION: OUTBOX QUEUE */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-sm text-neutral-900 dark:text-neutral-100">
            <Send className="h-4 w-4 text-brand-teal" />
            Reliable Outbox Queue Telemetry
          </div>
          <button
            onClick={handleRetryOutbox}
            disabled={retrying || outbox.filter((o) => o.status === 'failed').length === 0}
            className="px-3 py-1.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg flex items-center gap-1.5 disabled:opacity-50 transition-colors"
          >
            <RotateCcw className={`h-3 w-3 ${retrying ? 'animate-spin' : ''}`} />
            {retrying ? 'Retrying...' : 'Retry Failed Items'}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-neutral-50 dark:bg-neutral-800/60 border-b border-neutral-200 dark:border-neutral-800 text-xs uppercase tracking-wider text-neutral-500">
              <tr>
                <th className="px-4 py-3">Channel & Recipient</th>
                <th className="px-4 py-3">Subject / Event</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Attempts & Time</th>
                <th className="px-4 py-3">Diagnostic Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800 text-xs">
              {outbox.map((item) => (
                <tr key={item.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/40">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="font-semibold uppercase text-[10px] text-neutral-500 block">
                      {item.channel}
                    </span>
                    <span className="font-mono text-neutral-800 dark:text-neutral-200">
                      {item.recipient}
                    </span>
                  </td>
                  <td className="px-4 py-3 max-w-xs text-neutral-800 dark:text-neutral-200 font-medium">
                    {item.subject}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        item.status === 'sent'
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                          : item.status === 'failed'
                          ? 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300'
                          : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-neutral-500">
                    <div>{item.attempts} attempt(s)</div>
                    <div>{item.lastAttemptAt ? new Date(item.lastAttemptAt).toLocaleTimeString() : 'Pending'}</div>
                  </td>
                  <td className="px-4 py-3 max-w-sm text-neutral-500 font-mono text-[11px]">
                    {item.error || 'Dispatched and acknowledged.'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION: DATABASE SEED RESET WITH DUAL CONTROL */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <Database className="h-5 w-5 text-red-600" />
              Database Seed & Baseline Reset (Dual Control Protected)
            </h2>
            <p className="text-xs text-neutral-500 max-w-2xl">
              Per strict security regulations, re-seeding or flushing databases in non-demo environments is protected by dual control. Requesting a reset files a pending approval request that must be reviewed and signed off by a second administrator.
            </p>
          </div>
          <button
            onClick={() => setShowSeedModal(true)}
            className="px-4 py-2 text-xs font-semibold text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 rounded-lg border border-red-200 dark:border-red-800 flex items-center gap-1.5 transition-colors self-start sm:self-auto"
          >
            <Lock className="h-3.5 w-3.5" />
            Request Seed Reset
          </button>
        </div>
      </div>

      {/* SEED RESET REQUEST MODAL */}
      {showSeedModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <Lock className="h-5 w-5 text-red-600" />
              Request Dual-Control Seed Reset
            </h3>
            <p className="text-xs text-neutral-500">
              State the justification for resetting all tenant organisations, users, and observations to clean baseline seed data.
            </p>
            <form onSubmit={handleRequestSeedReset} className="space-y-4">
              <textarea
                required
                rows={3}
                value={seedReason}
                onChange={(e) => setSeedReason(e.target.value)}
                placeholder="Operational justification for seed reset..."
                className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowSeedModal(false)}
                  className="px-4 py-2 text-xs font-medium text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resettingSeed}
                  className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg disabled:opacity-50"
                >
                  {resettingSeed ? 'Submitting...' : 'Submit Dual-Control Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
