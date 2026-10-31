'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { UserRecord, Organisation } from '@/types';
import { StepupModal } from '@/components/admin/StepupModal';
import {
  Users,
  UserPlus,
  FileSpreadsheet,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Shield,
  Copy,
  Check,
  LogOut,
  UserX,
  RefreshCw,
  Mail,
  Building2,
  ExternalLink,
} from 'lucide-react';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [orgs, setOrgs] = useState<Organisation[]>([]);
  const [invitations, setInvitations] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<'users' | 'invitations'>('users');
  const [loading, setLoading] = useState(true);

  // Filters
  const [roleFilter, setRoleFilter] = useState('all');
  const [orgFilter, setOrgFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');

  // Single Invite Modal State
  const [showSingleInvite, setShowSingleInvite] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteOrgId, setInviteOrgId] = useState('');
  const [inviteRole, setInviteRole] = useState<'client_member' | 'client_admin'>('client_member');
  const [generatedInviteLink, setGeneratedInviteLink] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Bulk CSV Invite Modal State
  const [showBulkInvite, setShowBulkInvite] = useState(false);
  const [bulkCsvText, setBulkCsvText] = useState('');
  const [bulkDryRun, setBulkDryRun] = useState<{
    totalRows: number;
    validRows: any[];
    errors: any[];
  } | null>(null);
  const [bulkExecuting, setBulkExecuting] = useState(false);
  const [bulkResults, setBulkResults] = useState<any[] | null>(null);

  // User Actions State
  const [actionUser, setActionUser] = useState<UserRecord | null>(null);
  const [showStepup, setShowStepup] = useState(false);
  const [anonymiseReason, setAnonymiseReason] = useState('');
  const [showAnonymiseModal, setShowAnonymiseModal] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchUsersAndOrgs = async () => {
    setLoading(true);
    try {
      const [usersRes, orgsRes, invRes] = await Promise.all([
        fetch('/api/admin/users'),
        fetch('/api/admin/orgs'),
        fetch('/api/admin/users?view=invitations'),
      ]);

      if (usersRes.ok) {
        const data = await usersRes.json();
        setUsers(data.users || []);
      }
      if (orgsRes.ok) {
        const data = await orgsRes.json();
        setOrgs(data.organisations || []);
        if (data.organisations?.length > 0 && !inviteOrgId) {
          setInviteOrgId(data.organisations[1]?.id || data.organisations[0]?.id);
        }
      }
      if (invRes.ok) {
        const data = await invRes.json();
        setInvitations(data.invitations || []);
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsersAndOrgs();
  }, []);

  // Filtered Users List
  const filteredUsers = users.filter((u) => {
    const matchesOrg =
      orgFilter === 'all' || u.orgId === orgFilter || u.memberships.some((m) => m.orgId === orgFilter);
    const matchesRole =
      roleFilter === 'all' || u.role === roleFilter || u.memberships.some((m) => m.role === roleFilter);
    const matchesStatus = statusFilter === 'all' || (u.status || 'active') === statusFilter;
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.id.toLowerCase().includes(search.toLowerCase());

    return matchesOrg && matchesRole && matchesStatus && matchesSearch;
  });

  const handleSingleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'single_invite',
          name: inviteName,
          email: inviteEmail,
          orgId: inviteOrgId,
          role: inviteRole,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setFeedback({ type: 'error', message: data.error || 'Failed to generate invitation' });
        return;
      }

      setGeneratedInviteLink(data.invitation.inviteLink);
      setFeedback({ type: 'success', message: 'Invitation link generated successfully.' });
      fetchUsersAndOrgs();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    }
  };

  const handleRunBulkDryRun = async () => {
    if (!bulkCsvText.trim()) return;
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'validate_bulk',
          csvText: bulkCsvText,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setBulkDryRun(data.dryRun);
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    }
  };

  const handleExecuteBulkInvite = async () => {
    if (!bulkDryRun || bulkDryRun.validRows.length === 0) return;
    setBulkExecuting(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'execute_bulk',
          validRows: bulkDryRun.validRows,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setBulkResults(data.results);
        setFeedback({
          type: 'success',
          message: `Successfully provisioned ${data.invitedCount} invitations.`,
        });
        fetchUsersAndOrgs();
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setBulkExecuting(false);
    }
  };

  const handleSuspendUser = async (userId: string) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'suspend', userId, reason: 'Administrative suspension' }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedback({ type: 'success', message: 'User access suspended.' });
        fetchUsersAndOrgs();
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    }
  };

  const handleReactivateUser = async (userId: string) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reactivate', userId }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedback({ type: 'success', message: 'User reactivated.' });
        fetchUsersAndOrgs();
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    }
  };

  const handleForceSignOut = async (userId: string) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'force_signout', userId }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedback({ type: 'success', message: 'All active sessions invalidated for user.' });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    }
  };

  const handleAnonymiseSubmit = async () => {
    if (!actionUser) return;
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'request_anonymise',
          userId: actionUser.id,
          reason: anonymiseReason || 'GDPR Request',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedback({
          type: 'success',
          message: 'Dual-control request created for anonymisation. A second administrator must approve.',
        });
        setShowAnonymiseModal(false);
        setShowStepup(false);
        setActionUser(null);
        fetchUsersAndOrgs();
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Feedback */}
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

      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <Users className="w-6 h-6 text-primary" />
            <span>Users & Access Governance</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Manage memberships across client organisations, issue single-use invitations, and perform validated bulk onboarding.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              setShowBulkInvite(true);
              setBulkDryRun(null);
              setBulkResults(null);
            }}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-border bg-card hover:bg-muted transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-muted-foreground" />
            <span>Bulk CSV Invite</span>
          </button>
          <button
            onClick={() => {
              setShowSingleInvite(true);
              setGeneratedInviteLink(null);
              setInviteName('');
              setInviteEmail('');
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
          >
            <UserPlus className="w-4 h-4" />
            <span>Invite Member</span>
          </button>
        </div>
      </div>

      {/* View Switcher: Enrolled Users vs Pending Invitations */}
      <div className="flex items-center gap-2 border-b border-border text-xs">
        <button
          onClick={() => setViewMode('users')}
          className={`px-4 py-2.5 font-medium border-b-2 transition-colors ${
            viewMode === 'users'
              ? 'border-primary text-primary font-semibold'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Enrolled Users ({users.length})
        </button>
        <button
          onClick={() => setViewMode('invitations')}
          className={`px-4 py-2.5 font-medium border-b-2 transition-colors ${
            viewMode === 'invitations'
              ? 'border-primary text-primary font-semibold'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Pending Invitations ({invitations.length})
        </button>
      </div>

      {/* Enrolled Users View */}
      {viewMode === 'users' && (
        <div className="bg-card border border-border rounded-xl p-4 space-y-4 shadow-sm">
          {/* Filters Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, email, ID..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <select
              value={orgFilter}
              onChange={(e) => setOrgFilter(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Organisations</option>
              {orgs.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </select>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Roles</option>
              <option value="client_member">Client Member</option>
              <option value="client_admin">Client Admin</option>
              <option value="portal_admin">Portal Admin</option>
              <option value="content_publisher">Content Publisher</option>
              <option value="product_owner">Product Owner</option>
              <option value="learning_moderator">Learning Moderator</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="anonymised">Anonymised</option>
            </select>
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-border text-muted-foreground font-medium">
                  <th className="py-3 px-3">User Profile</th>
                  <th className="py-3 px-3">Email Address</th>
                  <th className="py-3 px-3">Organisation</th>
                  <th className="py-3 px-3">Role</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-muted-foreground">
                      No users match the current criteria.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => {
                    const status = user.status || 'active';
                    const userOrg = orgs.find((o) => o.id === user.orgId);
                    return (
                      <tr key={user.id} className="hover:bg-muted/40 transition-colors">
                        <td className="py-3 px-3">
                          <Link
                            href={`/admin/users/${user.id}`}
                            className="font-semibold text-foreground hover:text-primary transition-colors block"
                          >
                            {user.name}
                          </Link>
                          <span className="text-[10px] text-muted-foreground font-mono">{user.id}</span>
                        </td>
                        <td className="py-3 px-3 font-mono text-muted-foreground">{user.email}</td>
                        <td className="py-3 px-3">
                          <span className="font-medium text-foreground">
                            {userOrg ? userOrg.name : user.orgId}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-primary/10 text-primary capitalize">
                            {user.role.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize ${
                              status === 'active'
                                ? 'bg-emerald-500/10 text-emerald-600'
                                : status === 'suspended'
                                ? 'bg-amber-500/10 text-amber-600'
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
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Link
                              href={`/admin/users/${user.id}`}
                              className="px-2 py-1 text-[11px] rounded hover:bg-muted font-medium transition-colors"
                            >
                              Profile
                            </Link>
                            {status === 'active' ? (
                              <button
                                onClick={() => handleSuspendUser(user.id)}
                                className="px-2 py-1 text-[11px] rounded text-amber-600 hover:bg-amber-500/10 font-medium transition-colors"
                              >
                                Suspend
                              </button>
                            ) : status === 'suspended' ? (
                              <button
                                onClick={() => handleReactivateUser(user.id)}
                                className="px-2 py-1 text-[11px] rounded text-emerald-600 hover:bg-emerald-500/10 font-medium transition-colors"
                              >
                                Reactivate
                              </button>
                            ) : null}

                            <button
                              onClick={() => handleForceSignOut(user.id)}
                              className="p-1 rounded text-muted-foreground hover:bg-muted transition-colors"
                              title="Force sign out all active sessions"
                            >
                              <LogOut className="w-3.5 h-3.5" />
                            </button>

                            {status !== 'anonymised' && (
                              <button
                                onClick={() => {
                                  setActionUser(user);
                                  setShowAnonymiseModal(true);
                                }}
                                className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                                title="Anonymise User (Dual Control)"
                              >
                                <UserX className="w-3.5 h-3.5" />
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

          {/* Mobile Cards View */}
          <div className="md:hidden space-y-3">
            {filteredUsers.map((user) => {
              const status = user.status || 'active';
              return (
                <div key={user.id} className="p-3.5 rounded-xl border border-border bg-card/60 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <Link
                        href={`/admin/users/${user.id}`}
                        className="font-semibold text-sm text-foreground hover:underline"
                      >
                        {user.name}
                      </Link>
                      <p className="text-xs text-muted-foreground font-mono">{user.email}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-primary/10 text-primary capitalize">
                      {user.role.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/40">
                    <Link
                      href={`/admin/users/${user.id}`}
                      className="px-2.5 py-1 text-xs rounded bg-muted text-foreground"
                    >
                      View
                    </Link>
                    {status === 'active' && (
                      <button
                        onClick={() => handleSuspendUser(user.id)}
                        className="px-2.5 py-1 text-xs rounded text-amber-600 bg-amber-500/10"
                      >
                        Suspend
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Pending Invitations View */}
      {viewMode === 'invitations' && (
        <div className="bg-card border border-border rounded-xl p-4 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Single-Use Pending Tenant Invitations
            </h3>
            <span className="text-xs text-muted-foreground">Expires after 72 hours</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-border text-muted-foreground font-medium">
                  <th className="py-2.5 px-3">Invited Person</th>
                  <th className="py-2.5 px-3">Target Email</th>
                  <th className="py-2.5 px-3">Organisation</th>
                  <th className="py-2.5 px-3">Role</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Invite Link</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {invitations.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-6 text-muted-foreground">
                      No pending invitations at this time.
                    </td>
                  </tr>
                ) : (
                  invitations.map((inv) => (
                    <tr key={inv.id} className="hover:bg-muted/40 transition-colors">
                      <td className="py-2.5 px-3 font-medium text-foreground">{inv.name}</td>
                      <td className="py-2.5 px-3 font-mono text-muted-foreground">{inv.email}</td>
                      <td className="py-2.5 px-3 font-medium">{inv.orgId}</td>
                      <td className="py-2.5 px-3 capitalize">{inv.role.replace('_', ' ')}</td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-600 capitalize">
                          {inv.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(inv.inviteLink);
                            setFeedback({ type: 'success', message: 'Invite link copied to clipboard.' });
                          }}
                          className="px-2 py-1 text-[11px] rounded border border-border hover:bg-muted font-sans transition-colors inline-flex items-center gap-1"
                        >
                          <Copy className="w-3 h-3" />
                          <span>Copy Link</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Single Invite Modal */}
      {showSingleInvite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-card border border-border rounded-xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2.5">
                <UserPlus className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-foreground">Invite Client Member</h3>
              </div>
              <button
                onClick={() => setShowSingleInvite(false)}
                className="text-muted-foreground hover:text-foreground text-xs"
              >
                Close
              </button>
            </div>

            {!generatedInviteLink ? (
              <form onSubmit={handleSingleInvite} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">
                    Full Legal Name
                  </label>
                  <input
                    type="text"
                    value={inviteName}
                    onChange={(e) => setInviteName(e.target.value)}
                    placeholder="e.g. Jasprit Bumrah"
                    required
                    className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">
                    Corporate Email Address
                  </label>
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="e.g. jasprit_bumrah@abcd.in"
                    required
                    className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Must strictly match the registered domain of the selected organisation.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">
                      Target Organisation
                    </label>
                    <select
                      value={inviteOrgId}
                      onChange={(e) => setInviteOrgId(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      {orgs
                        .filter((o) => o.type !== 'platform')
                        .map((o) => (
                          <option key={o.id} value={o.id}>
                            {o.name} ({o.domain})
                          </option>
                        ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">
                      Organisation Role
                    </label>
                    <select
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="client_member">Client Member</option>
                      <option value="client_admin">Client Admin</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-2.5 pt-3 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setShowSingleInvite(false)}
                    className="px-3.5 py-2 text-xs font-medium rounded-lg border border-border hover:bg-muted"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    Generate Single-Use Link
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span>Invitation created for {inviteName} ({inviteEmail})</span>
                </div>

                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">
                    Single-Use Invitation Link (72-hour validity)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={generatedInviteLink}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-muted font-mono"
                    />
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(generatedInviteLink);
                        setCopiedLink(true);
                        setTimeout(() => setCopiedLink(false), 2000);
                      }}
                      className="px-3 py-2 text-xs font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center gap-1.5 flex-shrink-0"
                    >
                      {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedLink ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-muted/40 text-[11px] text-muted-foreground border border-border/60">
                  <p className="font-semibold text-foreground mb-0.5">Delivery Notice:</p>
                  Deliver via sanctioned customer communications channels. This link is single-use and is not dispatched automatically via unsolicited email.
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => {
                      setShowSingleInvite(false);
                      setGeneratedInviteLink(null);
                    }}
                    className="px-4 py-2 text-xs font-medium rounded-lg bg-muted hover:bg-muted/80 text-foreground"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bulk CSV Invite Modal with Dry-Run Validation Preview */}
      {showBulkInvite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-card border border-border rounded-xl shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-foreground">Bulk CSV Member Onboarding (Dry-Run Preview)</h3>
              </div>
              <button
                onClick={() => setShowBulkInvite(false)}
                className="text-muted-foreground hover:text-foreground text-xs"
              >
                Close
              </button>
            </div>

            {!bulkResults ? (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-medium text-foreground">
                      Paste CSV Content (Format: <code>name,email,orgId,role</code>)
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        setBulkCsvText(
                          `name,email,orgId,role\nRahul Dravid,rahul_dravid@abcd.in,org-abcd,client_member\nAnil Kumble,anil_kumble@abcd.in,org-abcd,client_member\nInvalid Example,invalid_domain@gmail.com,org-abcd,client_member`
                        )
                      }
                      className="text-[11px] text-primary hover:underline"
                    >
                      Insert Sample CSV
                    </button>
                  </div>
                  <textarea
                    value={bulkCsvText}
                    onChange={(e) => {
                      setBulkCsvText(e.target.value);
                      setBulkDryRun(null);
                    }}
                    rows={6}
                    placeholder="name,email,orgId,role..."
                    className="w-full p-2.5 text-xs font-mono rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="flex justify-between items-center">
                  <button
                    type="button"
                    onClick={handleRunBulkDryRun}
                    disabled={!bulkCsvText.trim()}
                    className="px-4 py-2 text-xs font-semibold rounded-lg bg-muted hover:bg-muted/80 text-foreground transition-colors disabled:opacity-50"
                  >
                    Run Dry-Run Validation
                  </button>

                  {bulkDryRun && (
                    <button
                      type="button"
                      onClick={handleExecuteBulkInvite}
                      disabled={bulkExecuting || bulkDryRun.validRows.length === 0}
                      className="px-4 py-2 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50"
                    >
                      {bulkExecuting ? 'Provisioning...' : `Confirm & Issue ${bulkDryRun.validRows.length} Invites`}
                    </button>
                  )}
                </div>

                {/* Dry-Run Validation Results Preview */}
                {bulkDryRun && (
                  <div className="space-y-3 pt-3 border-t border-border">
                    <div className="flex items-center gap-4 text-xs">
                      <span>Total Rows: <strong>{bulkDryRun.totalRows}</strong></span>
                      <span className="text-emerald-600 dark:text-emerald-400">
                        Valid Rows: <strong>{bulkDryRun.validRows.length}</strong>
                      </span>
                      <span className="text-destructive">
                        Invalid Rows: <strong>{bulkDryRun.errors.length}</strong>
                      </span>
                    </div>

                    {/* Breakdown Table */}
                    <div className="max-h-56 overflow-y-auto border border-border rounded-lg">
                      <table className="w-full text-[11px] text-left border-collapse">
                        <thead className="bg-muted/50 border-b border-border text-muted-foreground sticky top-0">
                          <tr>
                            <th className="py-2 px-3">Row</th>
                            <th className="py-2 px-3">Email</th>
                            <th className="py-2 px-3">Status</th>
                            <th className="py-2 px-3">Details / Validation Note</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/60">
                          {bulkDryRun.validRows.map((row, idx) => (
                            <tr key={idx} className="bg-emerald-500/5">
                              <td className="py-1.5 px-3 font-mono text-muted-foreground">#{idx + 1}</td>
                              <td className="py-1.5 px-3 font-mono text-foreground">{row.email}</td>
                              <td className="py-1.5 px-3">
                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600">
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span>Valid</span>
                                </span>
                              </td>
                              <td className="py-1.5 px-3 text-muted-foreground">
                                Ready to invite to {row.orgName} as {row.role}
                              </td>
                            </tr>
                          ))}

                          {bulkDryRun.errors.map((err, idx) => (
                            <tr key={idx} className="bg-destructive/5">
                              <td className="py-1.5 px-3 font-mono text-muted-foreground">#{err.row}</td>
                              <td className="py-1.5 px-3 font-mono text-foreground">{err.email}</td>
                              <td className="py-1.5 px-3">
                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-destructive">
                                  <XCircle className="w-3 h-3" />
                                  <span>Invalid</span>
                                </span>
                              </td>
                              <td className="py-1.5 px-3 text-destructive font-medium">{err.reason}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span>Batch complete: {bulkResults.length} invitation links generated.</span>
                </div>

                <div className="max-h-60 overflow-y-auto space-y-2">
                  {bulkResults.map((res, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-lg border border-border text-xs flex items-center justify-between"
                    >
                      <span className="font-mono text-foreground">{res.email}</span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(res.inviteLink);
                          setFeedback({ type: 'success', message: `Copied invite link for ${res.email}` });
                        }}
                        className="px-2 py-1 text-[10px] rounded border border-border hover:bg-muted font-sans"
                      >
                        Copy Link
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => {
                      setShowBulkInvite(false);
                      setBulkResults(null);
                    }}
                    className="px-4 py-2 text-xs font-semibold rounded-lg bg-primary text-primary-foreground"
                  >
                    Finish
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Anonymise User Modal */}
      {showAnonymiseModal && actionUser && !showStepup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-card border border-border rounded-xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3 text-destructive">
              <UserX className="w-6 h-6 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-foreground">Anonymise User (Right to be Forgotten)</h3>
                <p className="text-xs text-muted-foreground">{actionUser.name} ({actionUser.email})</p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Per Section 2, <strong>anonymising a user is a dual-control operation</strong>.
              It irreversibly substitutes personal identification with a pseudonym while retaining historical contributions and audit events for compliance.
            </p>

            <div>
              <label className="block text-xs font-medium text-foreground mb-1">
                Compliance / Justification Note
              </label>
              <textarea
                value={anonymiseReason}
                onChange={(e) => setAnonymiseReason(e.target.value)}
                placeholder="e.g. GDPR Article 17 erasure request #8491..."
                rows={3}
                className="w-full p-2.5 text-xs rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-destructive"
              />
            </div>

            <div className="flex justify-end gap-2.5">
              <button
                onClick={() => {
                  setShowAnonymiseModal(false);
                  setActionUser(null);
                }}
                className="px-3.5 py-2 text-xs font-medium rounded-lg border border-border hover:bg-muted"
              >
                Cancel
              </button>
              <button
                disabled={anonymiseReason.trim().length < 5}
                onClick={() => setShowStepup(true)}
                className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50"
              >
                Proceed to Step-Up
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stepup Modal for Anonymisation */}
      <StepupModal
        isOpen={showStepup}
        purpose={`Anonymise user account ${actionUser?.email}`}
        onSuccess={handleAnonymiseSubmit}
        onCancel={() => setShowStepup(false)}
      />
    </div>
  );
}
