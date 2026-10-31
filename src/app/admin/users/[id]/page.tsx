'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { UserRecord, AuditEvent } from '@/types';
import {
  Users,
  ArrowLeft,
  Building2,
  Shield,
  KeyRound,
  LogOut,
  Laptop,
  History,
  CheckCircle2,
  AlertCircle,
  UserX,
} from 'lucide-react';

export default function AdminUserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [user, setUser] = useState<UserRecord | null>(null);
  const [activeSessions, setActiveSessions] = useState<any[]>([]);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchUser = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${id}`);
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setActiveSessions(data.activeSessions || []);
        setAuditEvents(data.auditEvents || []);
      } else {
        setFeedback({ type: 'error', message: 'Failed to load user profile.' });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchUser();
  }, [id]);

  const handleRevokeMembership = async (orgId: string) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'revoke_membership', userId: id, orgId }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setFeedback({ type: 'error', message: data.error || 'Failed to revoke membership' });
        return;
      }
      setFeedback({ type: 'success', message: 'Membership revoked successfully.' });
      fetchUser();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    }
  };

  const handleTerminateSession = async () => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'force_signout', userId: id }),
      });
      const data = await res.json();
      if (data.success) {
        setActiveSessions([]);
        setFeedback({ type: 'success', message: 'Session terminated immediately.' });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-xs text-muted-foreground">Loading user profile...</div>;
  }

  if (!user) {
    return (
      <div className="p-8 text-center space-y-3">
        <p className="text-sm font-semibold text-foreground">User not found.</p>
        <Link href="/admin/users" className="text-xs text-primary underline">
          Return to users list
        </Link>
      </div>
    );
  }

  const status = user.status || 'active';

  return (
    <div className="space-y-6">
      {/* Feedback Alert */}
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

      {/* Header and Back Link */}
      <div>
        <Link
          href="/admin/users"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Users & Invitations</span>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-bold text-base">
              {user.name[0]}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-foreground">{user.name}</h1>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize ${
                    status === 'active'
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      : status === 'suspended'
                      ? 'bg-amber-500/10 text-amber-600'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      status === 'active' ? 'bg-emerald-500' : 'bg-amber-500'
                    }`}
                  />
                  <span>{status}</span>
                </span>
                {user.isVerifiedEmployee && (
                  <span className="text-[10px] bg-blue-500/10 text-blue-600 border border-blue-500/20 px-1.5 py-0.2 rounded font-semibold">
                    Verified Employee
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground font-mono mt-0.5">
                {user.email} • ID: {user.id}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Memberships & Grants */}
        <div className="lg:col-span-2 space-y-6">
          {/* Memberships Card */}
          <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <Building2 className="w-4 h-4 text-primary" />
                <span>Organisation Memberships</span>
              </h3>
              <span className="text-xs text-muted-foreground">
                {user.memberships.length} organisation(s)
              </span>
            </div>

            <div className="space-y-3">
              {user.memberships.length === 0 ? (
                <p className="text-xs text-muted-foreground py-3">No client organisation memberships (Platform user).</p>
              ) : (
                user.memberships.map((m) => (
                  <div
                    key={m.orgId}
                    className="p-3.5 rounded-xl border border-border/80 bg-muted/20 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-xs font-semibold text-foreground">{m.orgId}</p>
                      <p className="text-[11px] text-muted-foreground capitalize">
                        Role: <strong>{m.role.replace('_', ' ')}</strong> • Status: {m.status}
                      </p>
                    </div>

                    <button
                      onClick={() => handleRevokeMembership(m.orgId)}
                      className="px-2.5 py-1 text-xs text-destructive hover:bg-destructive/10 rounded font-medium transition-colors"
                      title="Anti-lockout check applied: Cannot revoke last client administrator"
                    >
                      Revoke Membership
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Platform Grants Card */}
          <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-primary" />
                <span>Platform Governance Grants</span>
              </h3>
              <Link href="/admin/grants" className="text-xs text-primary hover:underline font-medium">
                Manage Grants in Platform Grants Hub →
              </Link>
            </div>

            <div className="flex flex-wrap gap-2">
              {user.platformGrants.length === 0 ? (
                <p className="text-xs text-muted-foreground">No elevated platform grants assigned to this user.</p>
              ) : (
                user.platformGrants.map((grant) => (
                  <span
                    key={grant}
                    className="px-2.5 py-1 rounded-lg text-xs font-mono font-semibold bg-primary/10 text-primary border border-primary/20"
                  >
                    {grant}
                  </span>
                ))
              )}
            </div>
          </div>

          {/* Activity Audit */}
          <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <History className="w-4 h-4 text-primary" />
              <span>User Security Audit Trail</span>
            </h3>

            <div className="space-y-2">
              {auditEvents.length === 0 ? (
                <p className="text-xs text-muted-foreground py-2">No security events recorded for this user.</p>
              ) : (
                auditEvents.map((e) => (
                  <div
                    key={e.id}
                    className="p-2.5 rounded-lg border border-border/50 text-xs flex items-center justify-between"
                  >
                    <div>
                      <span className="font-semibold text-foreground font-mono">{e.action}</span>
                      <p className="text-[11px] text-muted-foreground">{e.details}</p>
                    </div>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {new Date(e.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Sessions & Security */}
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <Laptop className="w-4 h-4 text-primary" />
                <span>Active Sessions</span>
              </h3>
              {activeSessions.length > 0 && (
                <button
                  onClick={handleTerminateSession}
                  className="text-xs text-destructive hover:underline font-medium flex items-center gap-1"
                >
                  <LogOut className="w-3 h-3" />
                  <span>Terminate All</span>
                </button>
              )}
            </div>

            <div className="space-y-3">
              {activeSessions.length === 0 ? (
                <p className="text-xs text-muted-foreground py-2">No active authenticated sessions.</p>
              ) : (
                activeSessions.map((sess) => (
                  <div key={sess.id} className="p-3 rounded-lg border border-border bg-muted/20 space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-foreground">{sess.userAgent}</span>
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    </div>
                    <p className="text-[11px] text-muted-foreground font-mono">IP: {sess.ip}</p>
                    <p className="text-[10px] text-muted-foreground">
                      Last Active: {new Date(sess.lastActive).toLocaleTimeString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
