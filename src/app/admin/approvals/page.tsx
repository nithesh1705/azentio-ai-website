'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Clock,
  UserCheck,
  AlertTriangle,
  ArrowRight,
  Filter,
  Check,
  X,
  Lock,
} from 'lucide-react';
import { ApprovalRequest } from '@/types';
import { StepupModal } from '@/components/admin/StepupModal';

export default function ApprovalsInboxPage() {
  const [requests, setRequests] = useState<ApprovalRequest[]>([]);
  const [statusFilter, setStatusFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Rejection modal
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);

  // Step-up modal
  const [stepupTarget, setStepupTarget] = useState<ApprovalRequest | null>(null);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const url = statusFilter === 'all' ? '/api/admin/approvals' : `/api/admin/approvals?status=${statusFilter}`;
      const res = await fetch(url);
      const data = await res.json();
      if (res.ok) {
        setRequests(data.requests || []);
      }
    } catch {
      setFeedback({ type: 'error', message: 'Failed to load approvals inbox.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, [statusFilter]);

  const handleApprove = async (req: ApprovalRequest) => {
    // Requires step-up for sensitive actions per policy
    const sensitiveActions = ['grant_portal_admin', 'archive_organisation', 'anonymise_user', 'seed_reset', 'support_access'];
    if (sensitiveActions.includes(req.actionType)) {
      setStepupTarget(req);
      return;
    }

    await executeApproval(req.id);
  };

  const executeApproval = async (id: string) => {
    setProcessing(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/admin/approvals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve', id }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to approve request.');
      }
      setFeedback({ type: 'success', message: 'Dual-control action approved and applied successfully.' });
      loadRequests();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setProcessing(false);
      setStepupTarget(null);
    }
  };

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingId) return;

    setProcessing(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/admin/approvals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject', id: rejectingId, reason: rejectionReason }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to reject request.');
      }
      setFeedback({ type: 'success', message: 'Dual-control request rejected.' });
      setRejectingId(null);
      setRejectionReason('');
      loadRequests();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setProcessing(false);
    }
  };

  const currentAdminId = 'usr-admin-max'; // Mock active session admin

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <ShieldAlert className="h-6 w-6 text-brand-teal" />
            Dual-Control Approvals Inbox
          </h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
            Governance inbox for high-risk operations: platform grants, client broadcasts, org archive, data anonymisation, and support sessions.
          </p>
        </div>
      </div>

      {/* Invariant Policy Notice */}
      <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-start gap-3">
        <Lock className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-800 dark:text-amber-300">
          <span className="font-semibold">Dual Control Invariant (§11 SOURCE_OF_TRUTH.md):</span> An administrator cannot approve their own request. High-risk operations (including portal admin grants, platform-wide broadcasts, user anonymisation, and support sessions) require independent approval by a second verified administrator.
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

      {/* Status Filter Tabs */}
      <div className="flex border-b border-neutral-200 dark:border-neutral-800">
        {(['pending', 'approved', 'rejected', 'all'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setStatusFilter(tab)}
            className={`py-3 px-5 text-sm font-medium border-b-2 capitalize transition-colors ${
              statusFilter === tab
                ? 'border-brand-teal text-brand-teal font-semibold'
                : 'border-transparent text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200'
            }`}
          >
            {tab === 'pending' ? 'Pending Actions' : tab}
          </button>
        ))}
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-12 text-center text-sm text-neutral-500">Loading requests...</div>
        ) : requests.length === 0 ? (
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-12 text-center space-y-2">
            <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto" />
            <div className="font-semibold text-neutral-800 dark:text-neutral-200">
              No approval requests in this category.
            </div>
            <div className="text-xs text-neutral-500">
              All high-risk operations are compliant and up to date.
            </div>
          </div>
        ) : (
          requests.map((req) => {
            const isRequester = req.requestedBy === currentAdminId;
            return (
              <div
                key={req.id}
                className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 space-y-4 shadow-sm"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 dark:border-neutral-800/80 pb-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 text-[11px] font-semibold uppercase rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                        {req.actionType.replace(/_/g, ' ')}
                      </span>
                      <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                        {req.title}
                      </h3>
                    </div>
                    <div className="text-xs text-neutral-500 dark:text-neutral-400 font-mono">
                      Request ID: {req.id} &bull; Requested by {req.requestedByName} on{' '}
                      {new Date(req.requestedAt).toLocaleString()}
                    </div>
                  </div>

                  <div>
                    <span
                      className={`px-2.5 py-1 text-xs font-semibold uppercase rounded-full ${
                        req.status === 'pending'
                          ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700'
                          : req.status === 'approved'
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                          : 'bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300'
                      }`}
                    >
                      {req.status}
                    </span>
                  </div>
                </div>

                <div className="text-xs text-neutral-600 dark:text-neutral-300">
                  {req.description}
                </div>

                {/* Diff Summary View */}
                {req.diffSummary && req.diffSummary.length > 0 && (
                  <div className="rounded-lg bg-neutral-50 dark:bg-neutral-800/50 p-3 border border-neutral-200/80 dark:border-neutral-800 space-y-2">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                      Impacted Parameter Diff Preview
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                      {req.diffSummary.map((diff, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 rounded bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700">
                          <span className="font-medium text-neutral-700 dark:text-neutral-300">{diff.field}:</span>
                          <span className="flex items-center gap-1.5 font-mono">
                            <span className="text-red-600 line-through text-[11px]">{diff.before}</span>
                            <ArrowRight className="h-3 w-3 text-neutral-400" />
                            <span className="text-emerald-600 font-semibold">{diff.after}</span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Status details if already approved or rejected */}
                {req.status === 'approved' && req.approvedByName && (
                  <div className="text-xs text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4" />
                    Approved by {req.approvedByName} on {req.approvedAt ? new Date(req.approvedAt).toLocaleString() : ''}
                  </div>
                )}
                {req.status === 'rejected' && (
                  <div className="text-xs text-red-700 dark:text-red-400 flex items-center gap-1.5">
                    <XCircle className="h-4 w-4" />
                    Rejected by {req.approvedByName || 'Admin'}. Reason: {req.rejectionReason}
                  </div>
                )}

                {/* Action Controls for Pending */}
                {req.status === 'pending' && (
                  <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="text-xs text-neutral-500 flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      Expires: {new Date(req.expiresAt).toLocaleString()}
                    </div>

                    <div className="flex items-center gap-2">
                      {isRequester ? (
                        <div className="text-xs font-medium text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-3 py-1.5 rounded-lg border border-amber-200 dark:border-amber-800">
                          Dual Control: You requested this action. A second admin must sign off.
                        </div>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              setRejectingId(req.id);
                              setRejectionReason('');
                            }}
                            disabled={processing}
                            className="px-3.5 py-1.5 text-xs font-semibold text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-lg flex items-center gap-1.5 transition-colors"
                          >
                            <X className="h-3.5 w-3.5" />
                            Reject
                          </button>
                          <button
                            type="button"
                            onClick={() => handleApprove(req)}
                            disabled={processing}
                            className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg flex items-center gap-1.5 shadow-sm transition-colors"
                          >
                            <Check className="h-3.5 w-3.5" />
                            Approve Action
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* REJECTION MODAL */}
      {rejectingId && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-600" />
              Reject Dual-Control Request
            </h3>
            <p className="text-xs text-neutral-500">
              Please state why this action cannot be approved. This reason will be recorded in the immutable audit trail.
            </p>
            <form onSubmit={handleReject} className="space-y-4">
              <textarea
                required
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Reason for rejection (min 5 characters)..."
                className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRejectingId(null)}
                  className="px-4 py-2 text-xs font-medium text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={processing || rejectionReason.trim().length < 5}
                  className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg disabled:opacity-50"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* STEP-UP MODAL */}
      {stepupTarget && (
        <StepupModal
          purpose={`approve dual-control action (${stepupTarget.actionType})`}
          isOpen={!!stepupTarget}
          onSuccess={() => executeApproval(stepupTarget.id)}
          onCancel={() => setStepupTarget(null)}
        />
      )}
    </div>
  );
}
