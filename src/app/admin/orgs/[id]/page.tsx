'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Organisation, UserRecord, AuditEvent } from '@/types';
import { StepupModal } from '@/components/admin/StepupModal';
import {
  Building2,
  ArrowLeft,
  Users,
  ShieldCheck,
  FileCheck,
  History,
  Bell,
  CheckCircle2,
  AlertTriangle,
  Archive,
  Check,
  Save,
  Send,
  ExternalLink,
} from 'lucide-react';

const AVAILABLE_OFFERINGS = [
  { id: 'offering-fai', name: 'Financial Analysis Intelligence', code: 'FAI' },
  { id: 'offering-cbe', name: 'Core Banking Modernization Engine', code: 'CBE' },
  { id: 'offering-aml', name: 'AML & Fraud Surveillance Suite', code: 'AML' },
  { id: 'offering-dls', name: 'Digital Lending & Credit Scoring', code: 'DLS' },
];

export default function AdminOrgDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [activeTab, setActiveTab] = useState<
    'overview' | 'users' | 'entitlements' | 'policies' | 'activity' | 'notifications'
  >('overview');

  const [org, setOrg] = useState<Organisation | null>(null);
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [entitlements, setEntitlements] = useState<string[]>([]);
  const [activity, setActivity] = useState<AuditEvent[]>([]);
  const [policies, setPolicies] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Editable fields
  const [name, setName] = useState('');
  const [tier, setTier] = useState<'Enterprise' | 'Core' | 'Standard'>('Enterprise');

  // Modals
  const [showStepup, setShowStepup] = useState(false);
  const [suspendReason, setSuspendReason] = useState('');
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [archiveReason, setArchiveReason] = useState('');

  // Org Notification compose
  const [notifTitle, setNotifTitle] = useState('');
  const [notifMessage, setNotifMessage] = useState('');
  const [notifSending, setNotifSending] = useState(false);

  const fetchDetails = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/orgs/${id}`);
      if (res.ok) {
        const data = await res.json();
        if (data.org) {
          setOrg(data.org);
          setName(data.org.name);
          setTier(data.org.tier);
          setUsers(data.users || []);
          setEntitlements(data.entitlements || []);
          setActivity(data.activity || []);
          setPolicies(data.org.policiesAccepted || null);
        }
      } else {
        setFeedback({ type: 'error', message: 'Failed to load organisation details.' });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchDetails();
  }, [id]);

  const handleSaveOverview = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/admin/orgs/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, tier }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setFeedback({ type: 'error', message: data.error || 'Failed to update organisation' });
        return;
      }
      setFeedback({ type: 'success', message: 'Organisation properties updated successfully.' });
      fetchDetails();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    }
  };

  const handleToggleEntitlement = async (offeringId: string) => {
    const updated = entitlements.includes(offeringId)
      ? entitlements.filter((e) => e !== offeringId)
      : [...entitlements, offeringId];

    try {
      const res = await fetch(`/api/admin/orgs/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entitledOfferings: updated }),
      });
      const data = await res.json();
      if (data.success) {
        setEntitlements(updated);
        setFeedback({ type: 'success', message: 'Solution entitlements updated.' });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    }
  };

  const handleSuspendSubmit = async () => {
    try {
      const res = await fetch('/api/admin/orgs', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          action: 'suspend',
          reason: suspendReason,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedback({ type: 'success', message: 'Organisation has been suspended.' });
        setShowSuspendModal(false);
        setShowStepup(false);
        fetchDetails();
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    }
  };

  const handleReactivate = async () => {
    try {
      const res = await fetch('/api/admin/orgs', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action: 'reactivate' }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedback({ type: 'success', message: 'Organisation reactivated.' });
        fetchDetails();
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    }
  };

  const handleArchiveSubmit = async () => {
    try {
      const res = await fetch('/api/admin/orgs', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          action: 'request_archive',
          reason: archiveReason,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedback({
          type: 'success',
          message: 'Dual-control request created for archiving. A second administrator must approve.',
        });
        setShowArchiveModal(false);
        fetchDetails();
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    }
  };

  const handleSendOrgNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifTitle || !notifMessage) return;
    setNotifSending(true);

    try {
      // In-app targeted notification
      const res = await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: notifTitle,
          message: notifMessage,
          type: 'announcement',
          targetAudience: {
            scope: 'specific_orgs',
            orgIds: [id],
          },
        }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedback({ type: 'success', message: 'Notification dispatched to all members of this organisation.' });
        setNotifTitle('');
        setNotifMessage('');
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setNotifSending(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-xs text-muted-foreground">Loading workspace details...</div>;
  }

  if (!org) {
    return (
      <div className="p-8 text-center space-y-3">
        <p className="text-sm font-semibold text-foreground">Organisation not found.</p>
        <Link href="/admin/orgs" className="text-xs text-primary underline">
          Return to directory
        </Link>
      </div>
    );
  }

  const status = org.status || 'active';
  const isPlatformRoot = org.type === 'platform';

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

      {/* Breadcrumb & Header */}
      <div>
        <Link
          href="/admin/orgs"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Organisations</span>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-foreground">{org.name}</h1>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize ${
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
                  <span>{status}</span>
                </span>
                {isPlatformRoot && (
                  <span className="text-[10px] bg-primary/10 text-primary border border-primary/20 px-1.5 py-0.2 rounded font-semibold">
                    Root Platform
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground font-mono mt-0.5">
                {org.domain} • slug: {org.slug} • tier: {org.tier}
              </p>
            </div>
          </div>

          {/* Quick Lifecycle Actions */}
          {!isPlatformRoot && (
            <div className="flex items-center gap-2">
              {status === 'active' ? (
                <button
                  onClick={() => setShowSuspendModal(true)}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg text-amber-600 bg-amber-500/10 hover:bg-amber-500/20 transition-colors"
                >
                  Suspend Workspace
                </button>
              ) : (
                <button
                  onClick={handleReactivate}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg text-emerald-600 bg-emerald-500/10 hover:bg-emerald-500/20 transition-colors"
                >
                  Reactivate Workspace
                </button>
              )}

              {status !== 'archived' && (
                <button
                  onClick={() => setShowArchiveModal(true)}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg border border-border hover:bg-muted text-muted-foreground transition-colors"
                >
                  Request Archiving
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Multi-Tab Navigation */}
      <div className="border-b border-border flex items-center gap-1 overflow-x-auto text-xs">
        {[
          { id: 'overview', label: 'Overview', icon: Building2 },
          { id: 'users', label: `Users (${users.length})`, icon: Users },
          { id: 'entitlements', label: `Entitlements (${entitlements.length})`, icon: ShieldCheck },
          { id: 'policies', label: 'Policies & Legal', icon: FileCheck },
          { id: 'activity', label: `Activity (${activity.length})`, icon: History },
          { id: 'notifications', label: 'Broadcast', icon: Bell },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 font-medium border-b-2 transition-colors whitespace-nowrap ${
                isActive
                  ? 'border-primary text-primary font-semibold'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <form onSubmit={handleSaveOverview} className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">
                Legal Entity Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isPlatformRoot}
                className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Email Domain Binding (Strict)
              </label>
              <input
                type="text"
                value={org.domain}
                disabled
                className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-muted/40 text-muted-foreground font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Workspace URL Slug (Immutable)
              </label>
              <input
                type="text"
                value={org.slug}
                disabled
                className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-muted/40 text-muted-foreground font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground mb-1">
                Subscription Tier
              </label>
              <select
                value={tier}
                onChange={(e) => setTier(e.target.value as any)}
                disabled={isPlatformRoot}
                className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
              >
                <option value="Enterprise">Enterprise</option>
                <option value="Core">Core</option>
                <option value="Standard">Standard</option>
              </select>
            </div>
          </div>

          {!isPlatformRoot && (
            <div className="flex justify-end pt-4 border-t border-border">
              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Properties</span>
              </button>
            </div>
          )}
        </form>
      )}

      {/* Tab 2: Users */}
      {activeTab === 'users' && (
        <div className="bg-card border border-border rounded-xl p-4 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Enrolled Members & Administrators
            </h3>
            <Link
              href={`/admin/users?org=${id}`}
              className="text-xs text-primary hover:underline font-medium"
            >
              Open in Users Directory →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="py-2.5 px-3">Name</th>
                  <th className="py-2.5 px-3">Email</th>
                  <th className="py-2.5 px-3">Role</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-muted-foreground">
                      No users enrolled yet.
                    </td>
                  </tr>
                ) : (
                  users.map((user) => {
                    const membership = user.memberships.find((m) => m.orgId === id);
                    const role = membership?.role || user.role;
                    return (
                      <tr key={user.id} className="hover:bg-muted/40 transition-colors">
                        <td className="py-2.5 px-3 font-medium text-foreground">{user.name}</td>
                        <td className="py-2.5 px-3 font-mono text-muted-foreground">{user.email}</td>
                        <td className="py-2.5 px-3">
                          <span className="font-semibold text-primary capitalize">{role.replace('_', ' ')}</span>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 capitalize">
                            {user.status || 'active'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <Link
                            href={`/admin/users/${user.id}`}
                            className="px-2.5 py-1 text-[11px] rounded hover:bg-muted font-medium transition-colors"
                          >
                            Manage
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Entitlements */}
      {activeTab === 'entitlements' && (
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Solution Engine Entitlements</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Toggle access to high-impact platform solutions. Modifying entitlements immediately adjusts client navigation and sandbox APIs.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {AVAILABLE_OFFERINGS.map((offering) => {
              const entitled = entitlements.includes(offering.id);
              return (
                <div
                  key={offering.id}
                  className={`p-4 rounded-xl border transition-colors flex items-center justify-between ${
                    entitled
                      ? 'border-primary/40 bg-primary/5 text-foreground'
                      : 'border-border bg-card/60 text-muted-foreground'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold ${
                        entitled ? 'bg-primary text-primary-foreground' : 'border border-border'
                      }`}
                    >
                      {entitled && <Check className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-foreground">{offering.name}</p>
                      <p className="text-[10px] text-muted-foreground font-mono">{offering.code}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleToggleEntitlement(offering.id)}
                    className={`px-3 py-1 text-xs rounded-lg font-medium transition-colors ${
                      entitled
                        ? 'border border-destructive/30 text-destructive hover:bg-destructive/10'
                        : 'bg-primary text-primary-foreground hover:bg-primary/90'
                    }`}
                  >
                    {entitled ? 'Revoke Access' : 'Grant Access'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 4: Policies & Legal */}
      {activeTab === 'policies' && (
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-semibold text-foreground">Legal Governance & Policy Consents</h3>
          <p className="text-xs text-muted-foreground">
            Immutable tracking of terms of service and collective learning privacy consent.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-xl border border-border bg-muted/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-xs text-foreground">Master SaaS Agreement</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-600">
                  Signed & Active
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Policy Version: <strong>{policies?.version || 'v2026.1'}</strong>
              </p>
              <p className="text-xs text-muted-foreground">
                Accepted: <strong>{policies?.acceptedAt || '2026-01-15T09:00:00Z'}</strong>
              </p>
            </div>

            <div className="p-4 rounded-xl border border-border bg-muted/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-xs text-foreground">Collective Learning Attribution</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-primary/10 text-primary">
                  De-Identified Shared Read
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Attribution Preference: <strong>Anonymous Financial Institution</strong>
              </p>
              <p className="text-xs text-muted-foreground">
                MIN_DISTINCT_ORGS Guard: <strong>Enforced (≥ 3)</strong>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Activity Audit */}
      {activeTab === 'activity' && (
        <div className="bg-card border border-border rounded-xl p-4 shadow-sm space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Organisation Activity & Security Audit Events
          </h3>

          <div className="space-y-2">
            {activity.length === 0 ? (
              <p className="text-xs text-muted-foreground py-4 text-center">No audit logs recorded for this tenant.</p>
            ) : (
              activity.map((event) => (
                <div
                  key={event.id}
                  className="p-3 rounded-lg border border-border/60 bg-muted/20 text-xs flex items-start justify-between gap-4"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground font-mono">{event.action}</span>
                      <span className="text-[10px] text-muted-foreground">by {event.actorEmail}</span>
                    </div>
                    <p className="text-muted-foreground">{event.details}</p>
                  </div>
                  <span className="text-[10px] text-muted-foreground whitespace-nowrap font-mono">
                    {new Date(event.timestamp).toLocaleString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 6: Notifications */}
      {activeTab === 'notifications' && (
        <form onSubmit={handleSendOrgNotification} className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-4 max-w-xl">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Targeted Workspace Advisory</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Deliver an in-app notice exclusively to active users of <strong>{org.name}</strong>.
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground mb-1">Notice Title</label>
            <input
              type="text"
              value={notifTitle}
              onChange={(e) => setNotifTitle(e.target.value)}
              placeholder="e.g. Scheduled Tenant Maintenance or New Entitlement"
              required
              className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground mb-1">Message Content</label>
            <textarea
              value={notifMessage}
              onChange={(e) => setNotifMessage(e.target.value)}
              placeholder="Enter message text..."
              rows={4}
              required
              className="w-full p-2.5 text-xs rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <button
            type="submit"
            disabled={notifSending || !notifTitle || !notifMessage}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors shadow-sm"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{notifSending ? 'Dispatching...' : 'Dispatch In-App Notice'}</span>
          </button>
        </form>
      )}

      {/* Suspend Modal */}
      {showSuspendModal && !showStepup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-card border border-border rounded-xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3 text-amber-500">
              <AlertTriangle className="w-6 h-6 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-foreground">Suspend Workspace</h3>
                <p className="text-xs text-muted-foreground">{org.name}</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground mb-1">
                Reason for Suspension (minimum 10 chars)
              </label>
              <textarea
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                placeholder="Reason required..."
                rows={3}
                className="w-full p-2.5 text-xs rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="flex justify-end gap-2.5">
              <button
                onClick={() => setShowSuspendModal(false)}
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

      {/* Stepup Modal for Suspension */}
      <StepupModal
        isOpen={showStepup}
        purpose={`Suspend organisation ${org.name}`}
        onSuccess={handleSuspendSubmit}
        onCancel={() => setShowStepup(false)}
      />

      {/* Archive Modal */}
      {showArchiveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-card border border-border rounded-xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3 text-primary">
              <Archive className="w-6 h-6 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-foreground">Request Archiving</h3>
                <p className="text-xs text-muted-foreground">Dual Control Governance</p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              Archiving {org.name} requires approval by a second administrator.
            </p>

            <div>
              <label className="block text-xs font-medium text-foreground mb-1">
                Archival Justification
              </label>
              <textarea
                value={archiveReason}
                onChange={(e) => setArchiveReason(e.target.value)}
                placeholder="Provide contract end or migration rationale..."
                rows={3}
                className="w-full p-2.5 text-xs rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="flex justify-end gap-2.5">
              <button
                onClick={() => setShowArchiveModal(false)}
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
