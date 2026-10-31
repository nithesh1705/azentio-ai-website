'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Search,
  Download,
  Filter,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  RefreshCw,
  Lock,
  Layers,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { AuditEvent } from '@/types';
import { StepupModal } from '@/components/admin/StepupModal';

export default function AdminAuditPage() {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterAction, setFilterAction] = useState('');
  const [filterResource, setFilterResource] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Chain verification state
  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    valid: boolean;
    totalEvents: number;
    message: string;
  } | null>(null);

  // Step-up export modal state
  const [pendingExportFormat, setPendingExportFormat] = useState<'csv' | 'json' | null>(null);

  const loadAuditEvents = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterAction) params.set('action', filterAction);
      if (filterResource) params.set('resourceKind', filterResource);
      if (searchTerm) params.set('search', searchTerm);

      const res = await fetch(`/api/admin/audit?${params.toString()}`);
      const data = await res.json();
      if (res.ok) {
        setEvents(data.events || []);
      }
    } catch {
      setFeedback({ type: 'error', message: 'Failed to load audit ledger events.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAuditEvents();
  }, [filterAction, filterResource, searchTerm]);

  const handleVerifyChain = async () => {
    try {
      setVerifying(true);
      const res = await fetch('/api/admin/audit?verify=true');
      const data = await res.json();
      setVerificationResult(data);
    } catch {
      setFeedback({ type: 'error', message: 'Failed to verify cryptographic chain integrity.' });
    } finally {
      setVerifying(false);
    }
  };

  const handleTriggerExport = (format: 'csv' | 'json') => {
    setPendingExportFormat(format);
  };

  const executeExport = async () => {
    if (!pendingExportFormat) return;
    try {
      const params = new URLSearchParams();
      params.set('export', pendingExportFormat);
      if (filterAction) params.set('action', filterAction);
      if (filterResource) params.set('resourceKind', filterResource);
      if (searchTerm) params.set('search', searchTerm);

      window.open(`/api/admin/audit?${params.toString()}`, '_blank');
      setFeedback({
        type: 'success',
        message: `Audit records export (${pendingExportFormat.toUpperCase()}) initiated with step-up verification.`,
      });
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setPendingExportFormat(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-brand-teal" />
            Immutable Audit Trail & Cryptographic Ledger
          </h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
            Every administrative, dual-control, and configuration event is cryptographically sealed in an append-only SHA-256 hash chain.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleVerifyChain}
            disabled={verifying}
            className="px-3.5 py-2 text-xs font-semibold text-neutral-700 dark:text-neutral-200 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700 rounded-lg flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${verifying ? 'animate-spin' : ''}`} />
            {verifying ? 'Verifying Chain...' : 'Verify Cryptographic Integrity'}
          </button>
          <button
            onClick={() => handleTriggerExport('csv')}
            className="px-3.5 py-2 text-xs font-semibold text-neutral-700 dark:text-neutral-200 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700 rounded-lg flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </button>
          <button
            onClick={() => handleTriggerExport('json')}
            className="px-3.5 py-2 text-xs font-semibold text-white bg-brand-teal hover:bg-brand-teal/90 rounded-lg flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            Export JSON
          </button>
        </div>
      </div>

      {/* Chain Verification Result Card */}
      {verificationResult && (
        <div
          className={`p-4 rounded-xl border flex items-start gap-3 shadow-sm ${
            verificationResult.valid
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
              : 'bg-red-50 dark:bg-red-950/40 border-red-300 dark:border-red-800 text-red-900 dark:text-red-200'
          }`}
        >
          {verificationResult.valid ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
          )}
          <div className="flex-1 space-y-1">
            <div className="font-bold text-sm">
              {verificationResult.valid
                ? 'Cryptographic Hash-Chain Verification: PASS (Zero Tampering Detected)'
                : 'SECURITY ALERT: Hash-Chain Verification Failed'}
            </div>
            <div className="text-xs">{verificationResult.message}</div>
          </div>
          <button
            onClick={() => setVerificationResult(null)}
            className="text-xs font-semibold hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

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

      {/* Filters */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 flex flex-col sm:flex-row gap-3 items-center justify-between shadow-sm">
        <div className="relative flex-1 w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search action, actor, or details..."
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="px-3 py-2 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent"
          >
            <option value="">All Actions</option>
            <option value="admin.org.create">admin.org.create</option>
            <option value="admin.org.suspend">admin.org.suspend</option>
            <option value="admin.user.invite">admin.user.invite</option>
            <option value="admin.grant.assign">admin.grant.assign</option>
            <option value="admin.content.publish">admin.content.publish</option>
            <option value="admin.support.requested">admin.support.requested</option>
            <option value="admin.support.approved">admin.support.approved</option>
            <option value="admin.notification.broadcast_sent">admin.notification.broadcast_sent</option>
          </select>

          <select
            value={filterResource}
            onChange={(e) => setFilterResource(e.target.value)}
            className="px-3 py-2 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent"
          >
            <option value="">All Resource Types</option>
            <option value="org">Organisation</option>
            <option value="user">User</option>
            <option value="membership">Membership</option>
            <option value="content_item">Content Item</option>
            <option value="approval_request">Approval Request</option>
            <option value="support_authorisation">Support Session</option>
          </select>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-neutral-50 dark:bg-neutral-800/60 border-b border-neutral-200 dark:border-neutral-800 text-xs uppercase tracking-wider text-neutral-500">
              <tr>
                <th className="px-4 py-3">Timestamp (UTC)</th>
                <th className="px-4 py-3">Action & Outcome</th>
                <th className="px-4 py-3">Actor & IP</th>
                <th className="px-4 py-3">Resource & Event Details</th>
                <th className="px-4 py-3">Cryptographic Block Hash</th>
                <th className="px-4 py-3 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800 font-mono text-xs">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-neutral-500 font-sans">
                    Loading ledger blocks...
                  </td>
                </tr>
              ) : events.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-neutral-500 font-sans">
                    No audit records found matching your filters.
                  </td>
                </tr>
              ) : (
                events.map((e) => (
                  <tr key={e.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/40">
                    <td className="px-4 py-3 whitespace-nowrap text-neutral-500">
                      {new Date(e.timestamp).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="font-semibold text-neutral-900 dark:text-neutral-100">
                        {e.action}
                      </div>
                      <span
                        className={`inline-block mt-0.5 px-1.5 py-0.5 rounded text-[10px] uppercase font-bold ${
                          e.outcome === 'denied'
                            ? 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300'
                            : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                        }`}
                      >
                        {e.outcome || 'success'}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-neutral-700 dark:text-neutral-300">
                      <div>{e.actorEmail || e.actorId}</div>
                      <div className="text-[10px] text-neutral-400">{e.ip}</div>
                    </td>
                    <td className="px-4 py-3 max-w-sm font-sans">
                      <div className="text-xs text-neutral-800 dark:text-neutral-200 line-clamp-2">
                        {e.details}
                      </div>
                      <div className="text-[10px] text-neutral-500 font-mono mt-0.5">
                        {e.resourceKind}: {e.resourceId}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-[11px] text-brand-teal font-mono" title={e.hash}>
                        {e.hash ? `${e.hash.slice(0, 10)}...${e.hash.slice(-6)}` : 'GENESIS'}
                      </div>
                      <div className="text-[9px] text-neutral-400 font-mono">
                        prev: {e.prevHash ? `${e.prevHash.slice(0, 8)}...` : '00000000...'}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right font-sans">
                      <Link
                        href={`/admin/audit/${e.id}`}
                        className="px-2.5 py-1 text-xs font-semibold text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded transition-colors inline-flex items-center gap-1"
                      >
                        View Block
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* STEP-UP EXPORT MODAL */}
      {pendingExportFormat && (
        <StepupModal
          purpose={`export full cryptographic audit ledger (${pendingExportFormat.toUpperCase()})`}
          isOpen={!!pendingExportFormat}
          onSuccess={executeExport}
          onCancel={() => setPendingExportFormat(null)}
        />
      )}
    </div>
  );
}
