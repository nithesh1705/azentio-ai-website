'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShieldAlert,
  Eye,
  KeyRound,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Ban,
  Search,
  ExternalLink,
  Plus,
  Lock,
} from 'lucide-react';
import { SupportAuthorisation } from '@/types';

export default function SupportAccessPage() {
  const [authorisations, setAuthorisations] = useState<SupportAuthorisation[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // New request modal
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [orgId, setOrgId] = useState('org-apex');
  const [resourceKind, setResourceKind] = useState<'contribution' | 'demo_run'>('contribution');
  const [resourceId, setResourceId] = useState('');
  const [reason, setReason] = useState('');
  const [durationHours, setDurationHours] = useState(4);
  const [submitting, setSubmitting] = useState(false);

  const [filter, setFilter] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/support');
      const data = await res.json();
      if (res.ok) {
        setAuthorisations(data.authorisations || []);
      }
    } catch {
      setFeedback({ type: 'error', message: 'Failed to load support authorisations.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback(null);

    try {
      const res = await fetch('/api/admin/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'request',
          orgId,
          resourceKind,
          resourceId,
          reason,
          durationHours,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to request support access.');
      }

      setFeedback({
        type: 'success',
        message: 'Support access request submitted for dual-control approval by a second administrator.',
      });
      setShowRequestModal(false);
      setResourceId('');
      setReason('');
      loadData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRevoke = async (id: string) => {
    if (!confirm('Are you sure you want to revoke this support authorization immediately?')) return;
    try {
      const res = await fetch('/api/admin/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'revoke', id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to revoke authorization.');
      setFeedback({ type: 'success', message: 'Support authorization revoked successfully.' });
      loadData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    }
  };

  const filteredAuths = authorisations.filter(
    (a) =>
      a.orgName.toLowerCase().includes(filter.toLowerCase()) ||
      a.resourceId.toLowerCase().includes(filter.toLowerCase()) ||
      a.reason.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <Lock className="h-6 w-6 text-brand-teal" />
            Support Access Governance
          </h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
            Zero default access to client data. Temporary, scoped, read-only inspection requires reason and dual-control sign-off.
          </p>
        </div>
        <button
          onClick={() => setShowRequestModal(true)}
          className="px-4 py-2 text-sm font-semibold text-white bg-brand-teal hover:bg-brand-teal/90 rounded-lg flex items-center gap-2 shadow-sm self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          Request Scoped Access
        </button>
      </div>

      {/* Security Invariant Alert Box */}
      <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-start gap-3">
        <ShieldAlert className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-800 dark:text-amber-300 space-y-1">
          <div className="font-semibold">Enterprise Data Isolation Standard:</div>
          <div>
            Administrators never have carte-blanche access to client tenants. Every session is strictly time-boxed (≤24h), scoped to a single resource ID, dual-control approved, watermarked with administrator identity and IP, and cryptographically hashed in the audit ledger.
          </div>
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

      {/* Filter and Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input
              type="text"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Search authorisations..."
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent"
            />
          </div>
          <Link
            href="/admin/approvals"
            className="text-xs font-medium text-brand-teal hover:underline flex items-center gap-1"
          >
            View Pending Approvals Inbox &rarr;
          </Link>
        </div>

        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-neutral-50 dark:bg-neutral-800/60 border-b border-neutral-200 dark:border-neutral-800 text-xs uppercase tracking-wider text-neutral-500">
                <tr>
                  <th className="px-4 py-3">Client & Resource</th>
                  <th className="px-4 py-3">Reason & Duration</th>
                  <th className="px-4 py-3">Governance (Requester & Approver)</th>
                  <th className="px-4 py-3">Status & Expiry</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                {filteredAuths.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-neutral-500">
                      No support access authorisations found.
                    </td>
                  </tr>
                ) : (
                  filteredAuths.map((auth) => (
                    <tr key={auth.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/40">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-neutral-900 dark:text-neutral-100">
                          {auth.orgName}
                        </div>
                        <div className="text-xs font-mono text-neutral-500">
                          {auth.resourceKind}: {auth.resourceId}
                        </div>
                        <div className="text-[10px] text-neutral-400 font-mono mt-0.5">ID: {auth.id}</div>
                      </td>
                      <td className="px-4 py-3 max-w-xs">
                        <div className="text-xs text-neutral-700 dark:text-neutral-300 line-clamp-2">
                          {auth.reason}
                        </div>
                        <div className="text-[11px] text-neutral-500 mt-1">
                          Max Window: <span className="font-medium">{auth.durationHours} hours</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-neutral-600 dark:text-neutral-400 whitespace-nowrap">
                        <div>
                          Requested by: <span className="font-medium text-neutral-800 dark:text-neutral-200">{auth.requestedByName}</span>
                        </div>
                        <div>
                          Approved by: <span className="font-medium text-emerald-600 dark:text-emerald-400">{auth.approvedByName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold uppercase ${
                            auth.status === 'active'
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                              : auth.status === 'revoked'
                              ? 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300'
                              : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                          }`}
                        >
                          {auth.status}
                        </span>
                        <div className="text-[11px] text-neutral-500 mt-1">
                          Expires: {new Date(auth.expiresAt).toLocaleString()}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right space-x-2">
                        {auth.status === 'active' && (
                          <>
                            <Link
                              href={`/admin/support-access/${auth.id}`}
                              className="px-2.5 py-1 text-xs font-semibold text-white bg-brand-teal hover:bg-brand-teal/90 rounded inline-flex items-center gap-1 transition-colors"
                            >
                              <Eye className="h-3 w-3" />
                              View (Watermarked)
                            </Link>
                            <button
                              onClick={() => handleRevoke(auth.id)}
                              className="px-2.5 py-1 text-xs font-semibold text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 rounded inline-flex items-center gap-1 transition-colors"
                            >
                              <Ban className="h-3 w-3" />
                              Revoke
                            </button>
                          </>
                        )}
                        {auth.status !== 'active' && (
                          <span className="text-xs text-neutral-400 italic">No access</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* REQUEST MODAL */}
      {showRequestModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3 border-neutral-200 dark:border-neutral-800">
              <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                <KeyRound className="h-5 w-5 text-brand-teal" />
                Request Scoped Support Access
              </h2>
              <button
                onClick={() => setShowRequestModal(false)}
                className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateRequest} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase text-neutral-500">Target Organisation</label>
                <select
                  value={orgId}
                  onChange={(e) => setOrgId(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent"
                >
                  <option value="org-apex">Apex Global Financial Technologies (org-apex)</option>
                  <option value="org-cedar">Cedar Capital Holdings (org-cedar)</option>
                  <option value="org-beacon">Beacon Bank Corporation (org-beacon)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase text-neutral-500">Resource Kind</label>
                  <select
                    value={resourceKind}
                    onChange={(e) => setResourceKind(e.target.value as any)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent"
                  >
                    <option value="contribution">Private Contribution / Observation</option>
                    <option value="demo_run">Sandbox Demo Run Logs</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase text-neutral-500">Duration (Hours)</label>
                  <input
                    type="number"
                    min={1}
                    max={24}
                    value={durationHours}
                    onChange={(e) => setDurationHours(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase text-neutral-500">Specific Resource ID *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. contrib-seed-001 or run-seed-002"
                  value={resourceId}
                  onChange={(e) => setResourceId(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase text-neutral-500">
                  Justification & Ticket Reference (min 20 chars) *
                </label>
                <textarea
                  required
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Explain why this private resource must be viewed. Include customer escalation / ticket number."
                  className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent"
                />
                <div className="text-[11px] text-neutral-400">
                  Character count: {reason.trim().length} / 20 required
                </div>
              </div>

              <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowRequestModal(false)}
                  className="px-4 py-2 text-sm text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || reason.trim().length < 20 || !resourceId.trim()}
                  className="px-5 py-2 text-sm font-semibold text-white bg-brand-teal hover:bg-brand-teal/90 rounded-lg disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit Request for Approval'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
