'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { EntitlementRequest } from '@/server/dal/admin/entitlements_offerings';
import {
  ShieldCheck,
  Building2,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  MessageSquare,
  Search,
  Filter,
} from 'lucide-react';

export default function AdminEntitlementRequestsPage() {
  const [requests, setRequests] = useState<EntitlementRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'open' | 'approved' | 'declined' | 'all'>('open');
  const [search, setSearch] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Decline Modal
  const [declineTarget, setDeclineTarget] = useState<EntitlementRequest | null>(null);
  const [declineMessage, setDeclineMessage] = useState('');

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/entitlement-requests');
      if (res.ok) {
        const data = await res.json();
        setRequests(data.requests || []);
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      const res = await fetch('/api/admin/entitlement-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve', requestId: id }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setFeedback({ type: 'error', message: data.error || 'Failed to approve request' });
        return;
      }
      setFeedback({
        type: 'success',
        message: `Entitlement request approved. ${data.request.offeringName} is now accessible to ${data.request.orgName}.`,
      });
      fetchRequests();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    }
  };

  const handleDeclineSubmit = async () => {
    if (!declineTarget) return;
    try {
      const res = await fetch('/api/admin/entitlement-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'decline',
          requestId: declineTarget.id,
          message: declineMessage,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setFeedback({ type: 'error', message: data.error || 'Failed to decline request' });
        return;
      }
      setFeedback({
        type: 'success',
        message: `Request for ${declineTarget.offeringName} declined. The client administrator has been notified.`,
      });
      setDeclineTarget(null);
      setDeclineMessage('');
      fetchRequests();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    }
  };

  const filtered = requests.filter((r) => {
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    const matchesSearch =
      r.orgName.toLowerCase().includes(search.toLowerCase()) ||
      r.offeringName.toLowerCase().includes(search.toLowerCase()) ||
      r.requestedByName.toLowerCase().includes(search.toLowerCase()) ||
      r.justification.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const openCount = requests.filter((r) => r.status === 'open').length;
  const approvedCount = requests.filter((r) => r.status === 'approved').length;
  const declinedCount = requests.filter((r) => r.status === 'declined').length;

  return (
    <div className="space-y-6">
      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-xl text-sm flex items-center justify-between border ${
            feedback.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
              : 'bg-destructive/10 border-destructive/30 text-destructive'
          }`}
        >
          <span>{feedback.message}</span>
          <button
            onClick={() => setFeedback(null)}
            className="text-xs underline hover:opacity-80 ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
          <ShieldCheck className="w-6 h-6 text-primary" />
          <span>Tenant Entitlement Requests</span>
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Review subscription expansion requests submitted by verified client administrators for additional solution modules.
        </p>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-card border border-border p-4 rounded-xl shadow-sm">
          <p className="text-xs text-muted-foreground font-medium">Open Requests</p>
          <p className="text-2xl font-bold mt-1 text-amber-600 dark:text-amber-400">{openCount}</p>
        </div>
        <div className="bg-card border border-border p-4 rounded-xl shadow-sm">
          <p className="text-xs text-muted-foreground font-medium">Approved</p>
          <p className="text-2xl font-bold mt-1 text-emerald-600 dark:text-emerald-400">{approvedCount}</p>
        </div>
        <div className="bg-card border border-border p-4 rounded-xl shadow-sm">
          <p className="text-xs text-muted-foreground font-medium">Declined</p>
          <p className="text-2xl font-bold mt-1 text-muted-foreground">{declinedCount}</p>
        </div>
        <div className="bg-card border border-border p-4 rounded-xl shadow-sm">
          <p className="text-xs text-muted-foreground font-medium">Total Requests</p>
          <p className="text-2xl font-bold mt-1 text-foreground">{requests.length}</p>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="bg-card border border-border rounded-xl p-4 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg text-xs overflow-x-auto">
            {[
              { id: 'open', label: `Open (${openCount})` },
              { id: 'approved', label: `Approved (${approvedCount})` },
              { id: 'declined', label: `Declined (${declinedCount})` },
              { id: 'all', label: `All (${requests.length})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id as any)}
                className={`px-3 py-1.5 rounded-md font-medium capitalize transition-colors whitespace-nowrap ${
                  statusFilter === tab.id
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by organisation, offering, user..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {/* Requests List */}
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <p className="text-center py-8 text-xs text-muted-foreground">
              No entitlement requests match the current filter.
            </p>
          ) : (
            filtered.map((req) => (
              <div
                key={req.id}
                className="p-4 rounded-xl border border-border bg-card/60 hover:bg-muted/20 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-foreground">{req.offeringName}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize ${
                        req.status === 'open'
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                          : req.status === 'approved'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {req.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">{req.orgName}</span>
                    <span>•</span>
                    <span>Requested by {req.requestedByName}</span>
                    <span>•</span>
                    <span className="font-mono">{new Date(req.requestedAt).toLocaleDateString()}</span>
                  </div>

                  <p className="text-xs text-muted-foreground bg-muted/30 p-2.5 rounded-lg border border-border/40 mt-1 max-w-2xl">
                    <span className="font-semibold text-foreground">Justification: </span>
                    {req.justification}
                  </p>

                  {req.reviewMessage && (
                    <p className="text-[11px] text-muted-foreground italic">
                      Review Note: {req.reviewMessage} (by {req.reviewedByName})
                    </p>
                  )}
                </div>

                {req.status === 'open' && (
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleApprove(req.id)}
                      className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-sm"
                    >
                      Approve & Grant
                    </button>
                    <button
                      onClick={() => {
                        setDeclineTarget(req);
                        setDeclineMessage('');
                      }}
                      className="px-3 py-1.5 text-xs font-medium rounded-lg border border-border hover:bg-muted text-muted-foreground transition-colors"
                    >
                      Decline
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Decline Explanation Modal */}
      {declineTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-card border border-border rounded-xl shadow-2xl p-6 space-y-4">
            <h3 className="font-semibold text-foreground text-sm">
              Decline Entitlement: {declineTarget.offeringName}
            </h3>
            <p className="text-xs text-muted-foreground">
              Provide an advisory note for the client administrator of {declineTarget.orgName}.
            </p>

            <div>
              <label className="block text-xs font-medium text-foreground mb-1">
                Decline Explanation (minimum 5 characters)
              </label>
              <textarea
                value={declineMessage}
                onChange={(e) => setDeclineMessage(e.target.value)}
                placeholder="e.g. Solution requires Core Banking upgrade; schedule commercial review..."
                rows={3}
                className="w-full p-2.5 text-xs rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                onClick={() => setDeclineTarget(null)}
                className="px-3.5 py-2 text-xs font-medium rounded-lg border border-border hover:bg-muted"
              >
                Cancel
              </button>
              <button
                disabled={declineMessage.trim().length < 5}
                onClick={handleDeclineSubmit}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50"
              >
                Confirm Decline
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

