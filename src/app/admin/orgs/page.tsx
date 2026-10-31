'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Organisation } from '@/types';
import { StepupModal } from '@/components/admin/StepupModal';
import {
  Building2,
  Plus,
  Search,
  Filter,
  Download,
  MoreVertical,
  CheckCircle2,
  AlertTriangle,
  Archive,
  RefreshCw,
  ExternalLink,
  Shield,
  Layers,
  Users,
  Calendar,
} from 'lucide-react';

export default function AdminOrgsPage() {
  const router = useRouter();
  const [orgs, setOrgs] = useState<Organisation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<'name' | 'tier' | 'memberCount' | 'status'>('name');
  const [sortAsc, setSortAsc] = useState(true);

  // Modal states
  const [suspendTarget, setSuspendTarget] = useState<Organisation | null>(null);
  const [suspendReason, setSuspendReason] = useState('');
  const [showStepup, setShowStepup] = useState(false);
  const [archiveTarget, setArchiveTarget] = useState<Organisation | null>(null);
  const [archiveReason, setArchiveReason] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchOrgs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/orgs');
      if (res.ok) {
        const data = await res.json();
        if (data.organisations) {
          setOrgs(data.organisations);
        }
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: 'Failed to load organisations: ' + err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrgs();
  }, []);

  // Filter & Sort
  const filteredOrgs = orgs
    .filter((o) => {
      const matchesStatus =
        statusFilter === 'all' || (o.status || 'active') === statusFilter;
      const matchesSearch =
        o.name.toLowerCase().includes(search.toLowerCase()) ||
        o.domain.toLowerCase().includes(search.toLowerCase()) ||
        o.slug.toLowerCase().includes(search.toLowerCase());
      return matchesStatus && matchesSearch;
    })
    .sort((a, b) => {
      let valA: any = a[sortField] || '';
      let valB: any = b[sortField] || '';
      if (typeof valA === 'string') {
        valA = valA.toLowerCase();
        valB = valB.toLowerCase();
      }
      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });

  const handleExportCSV = () => {
    window.open('/api/admin/orgs?format=csv', '_blank');
    setFeedback({ type: 'success', message: 'Export initiated. Download will begin shortly.' });
  };

  const handleSuspendSubmit = async () => {
    if (!suspendTarget) return;
    try {
      const res = await fetch('/api/admin/orgs', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: suspendTarget.id,
          action: 'suspend',
          reason: suspendReason,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setFeedback({ type: 'error', message: data.error || 'Failed to suspend organisation' });
        return;
      }

      setFeedback({ type: 'success', message: `Organisation ${suspendTarget.name} has been suspended.` });
      setSuspendTarget(null);
      setSuspendReason('');
      setShowStepup(false);
      fetchOrgs();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    }
  };

  const handleReactivate = async (org: Organisation) => {
    try {
      const res = await fetch('/api/admin/orgs', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: org.id,
          action: 'reactivate',
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setFeedback({ type: 'error', message: data.error || 'Failed to reactivate organisation' });
        return;
      }
      setFeedback({ type: 'success', message: `Organisation ${org.name} has been reactivated.` });
      fetchOrgs();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    }
  };

  const handleArchiveSubmit = async () => {
    if (!archiveTarget) return;
    try {
      const res = await fetch('/api/admin/orgs', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: archiveTarget.id,
          action: 'request_archive',
          reason: archiveReason || 'Sunset per administrator',
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setFeedback({ type: 'error', message: data.error || 'Failed to request archiving' });
        return;
      }
      setFeedback({
        type: 'success',
        message: `Dual-control approval request created: A second administrator must approve archiving ${archiveTarget.name}.`,
      });
      setArchiveTarget(null);
      setArchiveReason('');
      fetchOrgs();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    }
  };

  const totalCount = orgs.length;
  const activeCount = orgs.filter((o) => (o.status || 'active') === 'active').length;
  const suspendedCount = orgs.filter((o) => o.status === 'suspended').length;
  const archivedCount = orgs.filter((o) => o.status === 'archived').length;

  return (
    <div className="space-y-6">
      {/* Top Banner Alert Feedback */}
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

      {/* Header and Quick Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <Building2 className="w-6 h-6 text-primary" />
            <span>Organisations Management</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Govern tenant workspaces, subscription tiers, product entitlement bundles, and lifecycle states.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-border bg-card hover:bg-muted transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-muted-foreground" />
            <span>Export CSV</span>
          </button>
          <Link
            href="/admin/orgs/new"
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>New Organisation</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-card border border-border p-4 rounded-xl shadow-sm">
          <p className="text-xs text-muted-foreground font-medium">Total Workspaces</p>
          <p className="text-2xl font-bold mt-1 text-foreground">{totalCount}</p>
        </div>
        <div className="bg-card border border-border p-4 rounded-xl shadow-sm">
          <p className="text-xs text-muted-foreground font-medium">Active Tenants</p>
          <p className="text-2xl font-bold mt-1 text-emerald-600 dark:text-emerald-400">{activeCount}</p>
        </div>
        <div className="bg-card border border-border p-4 rounded-xl shadow-sm">
          <p className="text-xs text-muted-foreground font-medium">Suspended</p>
          <p className="text-2xl font-bold mt-1 text-amber-600 dark:text-amber-400">{suspendedCount}</p>
        </div>
        <div className="bg-card border border-border p-4 rounded-xl shadow-sm">
          <p className="text-xs text-muted-foreground font-medium">Archived</p>
          <p className="text-2xl font-bold mt-1 text-muted-foreground">{archivedCount}</p>
        </div>
      </div>

      {/* Search, Filter Tabs and Controls */}
      <div className="bg-card border border-border rounded-xl p-4 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg text-xs overflow-x-auto">
            {['all', 'active', 'suspended', 'archived'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-md font-medium capitalize transition-colors whitespace-nowrap ${
                  statusFilter === status
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, domain, slug..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {/* Desktop Table View (>=768px) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-border/80 text-muted-foreground font-medium">
                <th
                  className="py-3 px-3 cursor-pointer hover:text-foreground"
                  onClick={() => {
                    setSortField('name');
                    setSortAsc(!sortAsc);
                  }}
                >
                  Organisation Name
                </th>
                <th className="py-3 px-3">Domain</th>
                <th
                  className="py-3 px-3 cursor-pointer hover:text-foreground"
                  onClick={() => {
                    setSortField('tier');
                    setSortAsc(!sortAsc);
                  }}
                >
                  Tier
                </th>
                <th
                  className="py-3 px-3 cursor-pointer hover:text-foreground"
                  onClick={() => {
                    setSortField('memberCount');
                    setSortAsc(!sortAsc);
                  }}
                >
                  Members
                </th>
                <th className="py-3 px-3">Entitled Offerings</th>
                <th
                  className="py-3 px-3 cursor-pointer hover:text-foreground"
                  onClick={() => {
                    setSortField('status');
                    setSortAsc(!sortAsc);
                  }}
                >
                  Status
                </th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredOrgs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-muted-foreground">
                    No organisations match your search or filter.
                  </td>
                </tr>
              ) : (
                filteredOrgs.map((org) => {
                  const status = org.status || 'active';
                  const isPlatformRoot = org.type === 'platform';
                  return (
                    <tr key={org.id} className="hover:bg-muted/40 transition-colors group">
                      <td className="py-3 px-3">
                        <Link
                          href={`/admin/orgs/${org.id}`}
                          className="font-semibold text-foreground group-hover:text-primary transition-colors flex items-center gap-1.5"
                        >
                          <span>{org.name}</span>
                          {isPlatformRoot && (
                            <span className="text-[10px] bg-primary/10 text-primary border border-primary/20 px-1 rounded">
                              Root
                            </span>
                          )}
                        </Link>
                        <span className="text-[10px] text-muted-foreground font-mono">{org.slug}</span>
                      </td>
                      <td className="py-3 px-3 font-mono text-muted-foreground">{org.domain}</td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            org.tier === 'Enterprise'
                              ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20'
                              : 'bg-muted text-foreground'
                          }`}
                        >
                          {org.tier}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-medium text-foreground">{org.memberCount}</td>
                      <td className="py-3 px-3">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {org.entitledOfferings.slice(0, 3).map((slug) => (
                            <span
                              key={slug}
                              className="px-1.5 py-0.2 rounded text-[9px] bg-muted/60 text-muted-foreground border border-border/50"
                            >
                              {slug.replace('offering-', '')}
                            </span>
                          ))}
                          {org.entitledOfferings.length > 3 && (
                            <span className="text-[9px] text-muted-foreground">
                              +{org.entitledOfferings.length - 3} more
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            status === 'active'
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                              : status === 'suspended'
                              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              status === 'active'
                                ? 'bg-emerald-500'
                                : status === 'suspended'
                                ? 'bg-amber-500'
                                : 'bg-muted-foreground'
                            }`}
                          />
                          <span className="capitalize">{status}</span>
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/admin/orgs/${org.id}`}
                            className="px-2 py-1 text-[11px] rounded hover:bg-muted font-medium transition-colors"
                          >
                            Manage
                          </Link>

                          {!isPlatformRoot && status === 'active' && (
                            <button
                              onClick={() => {
                                setSuspendTarget(org);
                                setSuspendReason('');
                              }}
                              className="px-2 py-1 text-[11px] rounded text-amber-600 hover:bg-amber-500/10 font-medium transition-colors"
                            >
                              Suspend
                            </button>
                          )}

                          {!isPlatformRoot && status === 'suspended' && (
                            <button
                              onClick={() => handleReactivate(org)}
                              className="px-2 py-1 text-[11px] rounded text-emerald-600 hover:bg-emerald-500/10 font-medium transition-colors"
                            >
                              Reactivate
                            </button>
                          )}

                          {!isPlatformRoot && status !== 'archived' && (
                            <button
                              onClick={() => {
                                setArchiveTarget(org);
                                setArchiveReason('');
                              }}
                              className="px-2 py-1 text-[11px] rounded text-muted-foreground hover:bg-muted transition-colors"
                              title="Request Archiving (Dual Control)"
                            >
                              <Archive className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards View (<768px) */}
        <div className="md:hidden space-y-3">
          {filteredOrgs.map((org) => {
            const status = org.status || 'active';
            const isPlatformRoot = org.type === 'platform';
            return (
              <div
                key={org.id}
                className="p-3.5 rounded-xl border border-border bg-card/60 space-y-2.5"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <Link
                      href={`/admin/orgs/${org.id}`}
                      className="font-semibold text-sm text-foreground hover:underline"
                    >
                      {org.name}
                    </Link>
                    <p className="text-[11px] text-muted-foreground font-mono">{org.domain}</p>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold capitalize ${
                      status === 'active'
                        ? 'bg-emerald-500/10 text-emerald-600'
                        : status === 'suspended'
                        ? 'bg-amber-500/10 text-amber-600'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {status}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border/50">
                  <span>Tier: <strong>{org.tier}</strong></span>
                  <span>Members: <strong>{org.memberCount}</strong></span>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/40">
                  <Link
                    href={`/admin/orgs/${org.id}`}
                    className="px-3 py-1.5 text-xs rounded-lg bg-muted text-foreground font-medium"
                  >
                    View Details
                  </Link>
                  {!isPlatformRoot && status === 'active' && (
                    <button
                      onClick={() => setSuspendTarget(org)}
                      className="px-3 py-1.5 text-xs rounded-lg text-amber-600 bg-amber-500/10 font-medium"
                    >
                      Suspend
                    </button>
                  )}
                  {!isPlatformRoot && status === 'suspended' && (
                    <button
                      onClick={() => handleReactivate(org)}
                      className="px-3 py-1.5 text-xs rounded-lg text-emerald-600 bg-emerald-500/10 font-medium"
                    >
                      Reactivate
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Suspend Reason Modal */}
      {suspendTarget && !showStepup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-card border border-border rounded-xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3 text-amber-500">
              <AlertTriangle className="w-6 h-6 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-foreground">Suspend Organisation</h3>
                <p className="text-xs text-muted-foreground">Action targets {suspendTarget.name}</p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              Suspending an organisation immediately halts user access, disables API tokens, and suppresses automated notifications.
            </p>

            <div>
              <label className="block text-xs font-medium text-foreground mb-1">
                Reason for Suspension (minimum 10 characters)
              </label>
              <textarea
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                placeholder="e.g. Contractual non-payment, compliance hold, or client request..."
                rows={3}
                className="w-full p-2.5 text-xs rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="flex justify-end gap-2.5">
              <button
                onClick={() => setSuspendTarget(null)}
                className="px-3.5 py-2 text-xs font-medium rounded-lg border border-border hover:bg-muted"
              >
                Cancel
              </button>
              <button
                disabled={suspendReason.trim().length < 10}
                onClick={() => setShowStepup(true)}
                className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-50"
              >
                Proceed to Step-Up
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step-Up Verification for Suspension */}
      <StepupModal
        isOpen={showStepup}
        purpose={`Suspend organisation ${suspendTarget?.name}`}
        onSuccess={handleSuspendSubmit}
        onCancel={() => setShowStepup(false)}
      />

      {/* Dual Control Archive Confirmation Modal */}
      {archiveTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-card border border-border rounded-xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3 text-primary">
              <Archive className="w-6 h-6 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-foreground">Request Organisation Archiving</h3>
                <p className="text-xs text-muted-foreground">Dual Control Governance Invariant</p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              Per Section 2 of governance policy, <strong>archiving an organisation requires approval by a second administrator</strong>.
              Submitting this form creates a pending approval request.
            </p>

            <div>
              <label className="block text-xs font-medium text-foreground mb-1">
                Archival Justification & Decommission Notes
              </label>
              <textarea
                value={archiveReason}
                onChange={(e) => setArchiveReason(e.target.value)}
                placeholder="Detail reason for decommission (contract end, merger, migration)..."
                rows={3}
                className="w-full p-2.5 text-xs rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="flex justify-end gap-2.5">
              <button
                onClick={() => setArchiveTarget(null)}
                className="px-3.5 py-2 text-xs font-medium rounded-lg border border-border hover:bg-muted"
              >
                Cancel
              </button>
              <button
                onClick={handleArchiveSubmit}
                className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Submit Dual Control Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
