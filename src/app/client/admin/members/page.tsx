'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { usePersona } from '@/context/PersonaContext';
import {
  getOrgMembers,
  getOrgInvitations,
  createMemberInvitation,
  resendMemberInvitation,
  cancelMemberInvitation,
  changeMemberRole,
  revokeMember,
  restoreMember,
  OrgMemberView,
} from '@/server/dal/client/admin';
import {
  Users,
  UserPlus,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Clock,
  Building2,
  AlertCircle,
  ChevronLeft,
  X,
  Mail,
  ShieldAlert,
  RotateCcw,
  Trash2,
  ArrowRight,
  Info,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { ClientInvitation } from '@/types';

export default function ClientAdminMembersPage() {
  const { actor, activeTenant } = usePersona();

  const isClientAdmin = actor.memberships.some(
    (m) => m.orgId === actor.activeTenantId && m.role === 'client_admin'
  );

  const [refreshKey, setRefreshKey] = useState(0);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'client_member' | 'client_admin'>('client_member');
  const [generatedInvitation, setGeneratedInvitation] = useState<{
    token: string;
    inviteLink: string;
    honestNotice: string;
  } | null>(null);

  const [copied, setCopied] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  if (!actor.activeTenantId || !activeTenant || !isClientAdmin) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <ShieldCheck className="w-12 h-12 text-destructive mx-auto" />
        <h1 className="text-2xl font-bold text-foreground">Client Admin Access Required</h1>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Only Client Administrators of {activeTenant ? activeTenant.name : 'this organisation'} can manage workspace memberships and invitations.
        </p>
        <Link
          href="/choose-workspace"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 mt-2"
        >
          Switch Persona / Workspace
        </Link>
      </div>
    );
  }

  let members: OrgMemberView[] = [];
  let pendingInvitations: ClientInvitation[] = [];
  try {
    members = getOrgMembers(actor);
    pendingInvitations = getOrgInvitations(actor);
  } catch (err: any) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-destructive mx-auto" />
        <h2 className="text-xl font-bold text-foreground">Failed to Load Members</h2>
        <p className="text-xs text-muted-foreground">{err.message}</p>
      </div>
    );
  }

  const handleCreateInvite = (e: React.FormEvent) => {
    e.preventDefault();
    setActionError(null);
    try {
      const res = createMemberInvitation(actor, {
        email: inviteEmail,
        role: inviteRole,
      });
      setGeneratedInvitation(res);
      setInviteEmail('');
      setRefreshKey((k) => k + 1);
    } catch (err: any) {
      setActionError(err.message);
    }
  };

  const handleCopyLink = () => {
    if (!generatedInvitation) return;
    const fullUrl = `${window.location.origin}${generatedInvitation.inviteLink}`;
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleResend = (id: string) => {
    setActionError(null);
    try {
      const res = resendMemberInvitation(actor, id);
      setGeneratedInvitation(res);
      setActionSuccess('Invitation renewed with a fresh single-use token.');
      setRefreshKey((k) => k + 1);
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err: any) {
      setActionError(err.message);
    }
  };

  const handleCancelInvite = (id: string) => {
    setActionError(null);
    try {
      cancelMemberInvitation(actor, id);
      setActionSuccess('Invitation cancelled.');
      setRefreshKey((k) => k + 1);
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err: any) {
      setActionError(err.message);
    }
  };

  const handleChangeRole = (userId: string, newRole: 'client_member' | 'client_admin') => {
    setActionError(null);
    try {
      changeMemberRole(actor, userId, newRole);
      setActionSuccess(`Role updated to ${newRole}.`);
      setRefreshKey((k) => k + 1);
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err: any) {
      setActionError(err.message);
    }
  };

  const handleToggleRevoke = (userId: string, currentStatus: 'active' | 'suspended') => {
    setActionError(null);
    try {
      if (currentStatus === 'active') {
        revokeMember(actor, userId);
        setActionSuccess('Member access revoked.');
      } else {
        restoreMember(actor, userId);
        setActionSuccess('Member access restored.');
      }
      setRefreshKey((k) => k + 1);
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err: any) {
      setActionError(err.message);
    }
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
            <span className="text-xs text-muted-foreground">Organisation Administration</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Members & Access Governance
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
            Invite colleagues, manage role privileges, and revoke credentials. Invitations generate single-use security tokens for manual delivery.
          </p>
        </div>

        <button
          onClick={() => {
            setGeneratedInvitation(null);
            setActionError(null);
            setShowInviteModal(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all shadow-md shadow-primary/20 self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Invite New Member</span>
        </button>
      </div>

      {actionError && (
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {actionSuccess && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Active Members Table & Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            <span>Active Organisation Members ({members.length})</span>
          </h2>
        </div>

        {/* Desktop Table (≥768px) */}
        <div className="hidden md:block overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/50 border-b border-border text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-6 py-3.5">User</th>
                <th className="px-6 py-3.5">Assigned Role</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Joined</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {members.map((m) => {
                const isCurrentActor = m.userId === actor.userId;

                return (
                  <tr key={m.userId} className="hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-foreground flex items-center gap-2">
                        <span>{m.name}</span>
                        {isCurrentActor && (
                          <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                            You
                          </span>
                        )}
                      </div>
                      <div className="font-mono text-muted-foreground text-[11px]">{m.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={m.role}
                        disabled={m.status === 'suspended'}
                        onChange={(e) =>
                          handleChangeRole(m.userId, e.target.value as 'client_member' | 'client_admin')
                        }
                        className="px-2.5 py-1 text-xs rounded-lg bg-muted/60 border border-border text-foreground font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
                      >
                        <option value="client_member">Client Member</option>
                        <option value="client_admin">Client Admin</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      {m.status === 'active' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Active</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-destructive">
                          <ShieldAlert className="w-3.5 h-3.5" />
                          <span>Revoked</span>
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground font-mono text-[11px]">
                      {formatDate(m.joinedAt)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleToggleRevoke(m.userId, m.status)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          m.status === 'active'
                            ? 'bg-destructive/10 text-destructive hover:bg-destructive/20'
                            : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20'
                        }`}
                      >
                        {m.status === 'active' ? 'Revoke Access' : 'Restore Access'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards (<768px) */}
        <div className="grid grid-cols-1 gap-3 md:hidden">
          {members.map((m) => (
            <div key={m.userId} className="p-4 rounded-2xl bg-card border border-border space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-foreground text-sm flex items-center gap-1.5">
                    <span>{m.name}</span>
                    {m.userId === actor.userId && (
                      <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                        You
                      </span>
                    )}
                  </div>
                  <div className="font-mono text-xs text-muted-foreground">{m.email}</div>
                </div>

                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    m.status === 'active'
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      : 'bg-destructive/10 text-destructive'
                  }`}
                >
                  {m.status}
                </span>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border/50 text-xs">
                <select
                  value={m.role}
                  disabled={m.status === 'suspended'}
                  onChange={(e) =>
                    handleChangeRole(m.userId, e.target.value as 'client_member' | 'client_admin')
                  }
                  className="px-2 py-1 rounded bg-muted text-xs text-foreground font-medium border border-border"
                >
                  <option value="client_member">Member</option>
                  <option value="client_admin">Admin</option>
                </select>

                <button
                  onClick={() => handleToggleRevoke(m.userId, m.status)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                    m.status === 'active'
                      ? 'bg-destructive/10 text-destructive'
                      : 'bg-emerald-500/10 text-emerald-600'
                  }`}
                >
                  {m.status === 'active' ? 'Revoke' : 'Restore'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pending Invitations Section */}
      <div className="space-y-4 pt-4">
        <h2 className="text-base font-bold text-foreground flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary" />
          <span>Pending Invitations ({pendingInvitations.length})</span>
        </h2>

        {pendingInvitations.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-card border border-dashed border-border text-xs text-muted-foreground">
            No pending unaccepted invitations for this workspace.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingInvitations.map((inv) => (
              <div
                key={inv.id}
                className="p-5 rounded-2xl bg-card border border-border flex flex-col justify-between shadow-sm space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-xs font-bold text-foreground">
                      {inv.email}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-primary/10 text-primary">
                      {inv.role}
                    </span>
                  </div>

                  <div className="text-[11px] text-muted-foreground">
                    Invited by {inv.invitedByName} &bull; Expires {formatDate(inv.expiresAt)}
                  </div>
                </div>

                <div className="pt-3 border-t border-border flex items-center justify-between text-xs">
                  <button
                    onClick={() => handleCancelInvite(inv.id)}
                    className="text-muted-foreground hover:text-destructive flex items-center gap-1 font-medium"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Cancel</span>
                  </button>

                  <button
                    onClick={() => handleResend(inv.id)}
                    className="text-primary hover:underline font-semibold flex items-center gap-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Refresh Link</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Invite Member Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 rounded-3xl bg-card border border-border shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-primary" />
                <span>Invite Colleague to {activeTenant.name}</span>
              </h3>
              <button
                onClick={() => setShowInviteModal(false)}
                className="text-muted-foreground hover:text-foreground text-xs"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {!generatedInvitation ? (
              <form onSubmit={handleCreateInvite} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    Corporate Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder={`colleague@${activeTenant.domain}`}
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-muted/60 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <span className="text-[10px] text-muted-foreground mt-1 block">
                    Invitee must sign in with this exact email to accept.
                  </span>
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    Workspace Role
                  </label>
                  <select
                    value={inviteRole}
                    onChange={(e) =>
                      setInviteRole(e.target.value as 'client_member' | 'client_admin')
                    }
                    className="w-full px-3 py-2 text-xs rounded-xl bg-muted/60 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="client_member">Client Member (Standard Access)</option>
                    <option value="client_admin">Client Administrator (Can Manage Members)</option>
                  </select>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowInviteModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all"
                  >
                    Generate Single-Use Link
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 text-xs font-mono">
                  <span className="font-bold">Honest Delivery Notice:</span> {generatedInvitation.honestNotice}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground block">
                    Single-Use Invitation Link
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      readOnly
                      value={`${window.location.origin}${generatedInvitation.inviteLink}`}
                      className="flex-1 px-3 py-2 text-xs font-mono rounded-xl bg-muted/60 border border-border text-foreground select-all"
                    />
                    <button
                      onClick={handleCopyLink}
                      className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 flex items-center gap-1.5 shrink-0"
                    >
                      {copied ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Link</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => setShowInviteModal(false)}
                    className="px-4 py-2 rounded-xl bg-secondary text-secondary-foreground text-xs font-semibold hover:bg-secondary/80"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
