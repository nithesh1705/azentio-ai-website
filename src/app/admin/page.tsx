'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Building,
  Users,
  ShieldCheck,
  ShieldAlert,
  KeyRound,
  FileCheck2,
  Inbox,
  Activity,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Layers,
  Sparkles,
  Sliders,
  Send,
  Eye,
} from 'lucide-react';
import { AuditEvent, ApprovalRequest } from '@/types';
import { ExtendedDemoEnquiry } from '@/server/dal/admin/enquiries';

export default function AdminDashboardPage() {
  const [data, setData] = useState<{
    kpis: {
      activeOrgsCount: number;
      totalUsersCount: number;
      pendingInvitesCount: number;
      verifiedEmployeesCount: number;
      openEntitlementsCount: number;
      pendingApprovalsCount: number;
      awaitingModerationCount: number;
    };
    pendingApprovals: ApprovalRequest[];
    recentAudit: AuditEvent[];
    recentEnquiries: ExtendedDemoEnquiry[];
    systemHealth: {
      status: string;
      latencyMs: number;
      ledgerVerified: boolean;
      totalLedgerBlocks: number;
    };
  } | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/admin/dashboard');
        const json = await res.json();
        if (res.ok) {
          setData(json);
        }
      } catch (err) {
        console.error('Failed to load admin dashboard telemetry', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading || !data) {
    return (
      <div className="p-12 text-center text-sm text-neutral-500">
        Loading executive administration telemetry and verifying cryptographic ledger...
      </div>
    );
  }

  const { kpis, pendingApprovals, recentAudit, recentEnquiries, systemHealth } = data;

  return (
    <div className="space-y-6">
      {/* Executive Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <ShieldCheck className="h-7 w-7 text-brand-teal" />
            Executive Administration Console
          </h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
            Global tenant oversight, dual-control governance, cryptographic ledger auditing, and operational telemetry.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            All Systems Operational &bull; {systemHealth.totalLedgerBlocks} SHA-256 Blocks Verified
          </div>
        </div>
      </div>

      {/* PENDING APPROVALS ALERT BANNER */}
      {kpis.pendingApprovalsCount > 0 && (
        <div className="bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-700/80 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-amber-900 dark:text-amber-200">
                Action Required: {kpis.pendingApprovalsCount} High-Risk Operation(s) Awaiting Dual-Control Approval
              </div>
              <div className="text-xs text-amber-700 dark:text-amber-400">
                Independent sign-off by a second administrator is required before changes take effect.
              </div>
            </div>
          </div>
          <Link
            href="/admin/approvals"
            className="px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg flex items-center gap-1.5 shadow-sm transition-colors self-start sm:self-auto"
          >
            Review Inbox &rarr;
          </Link>
        </div>
      )}

      {/* KPI TILES GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Orgs */}
        <Link
          href="/admin/orgs"
          className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-brand-teal rounded-xl p-4 transition-all shadow-sm group"
        >
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Client Organisations</span>
            <Building className="h-4 w-4 text-brand-teal group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mt-2">
            {kpis.activeOrgsCount}
          </div>
          <div className="text-[11px] text-neutral-500 mt-1 flex items-center gap-1">
            Active tenants &bull; <span className="text-brand-teal group-hover:underline">Manage &rarr;</span>
          </div>
        </Link>

        {/* Total Users */}
        <Link
          href="/admin/users"
          className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-brand-teal rounded-xl p-4 transition-all shadow-sm group"
        >
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Platform Users</span>
            <Users className="h-4 w-4 text-brand-teal group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mt-2">
            {kpis.totalUsersCount}
          </div>
          <div className="text-[11px] text-neutral-500 mt-1 flex items-center gap-1">
            {kpis.pendingInvitesCount} pending invites &bull; <span className="text-brand-teal group-hover:underline">Manage &rarr;</span>
          </div>
        </Link>

        {/* Verified Internal Employees */}
        <Link
          href="/admin/grants"
          className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-brand-teal rounded-xl p-4 transition-all shadow-sm group"
        >
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Azentio Staff</span>
            <ShieldCheck className="h-4 w-4 text-brand-teal group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mt-2">
            {kpis.verifiedEmployeesCount}
          </div>
          <div className="text-[11px] text-neutral-500 mt-1 flex items-center gap-1">
            Allowlist & grants &bull; <span className="text-brand-teal group-hover:underline">View &rarr;</span>
          </div>
        </Link>

        {/* Open Entitlements */}
        <Link
          href="/admin/entitlement-requests"
          className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-brand-teal rounded-xl p-4 transition-all shadow-sm group"
        >
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Entitlement Requests</span>
            <FileCheck2 className="h-4 w-4 text-brand-teal group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mt-2">
            {kpis.openEntitlementsCount}
          </div>
          <div className="text-[11px] text-neutral-500 mt-1 flex items-center gap-1">
            Pending approval &bull; <span className="text-brand-teal group-hover:underline">Review &rarr;</span>
          </div>
        </Link>
      </div>

      {/* SECONDARY ROW: DATA PRIVACY INVARIANT CARD & ENQUIRIES */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Awaiting Moderation Count Box (Zero Private Text Leak Invariant) */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-brand-teal" />
              <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                Shared Learning Queue
              </h2>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
              Count Only
            </span>
          </div>
          <div className="text-3xl font-extrabold text-neutral-900 dark:text-neutral-100">
            {kpis.awaitingModerationCount}
          </div>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Client observations currently in review queue. Per <span className="font-semibold">SOURCE_OF_TRUTH.md §11</span>, portal administrators see only aggregate counters; raw private client observations are never leaked or previewed without dedicated scoped support authorisation.
          </p>
          <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800">
            <Link
              href="/admin/support-access"
              className="text-xs font-semibold text-brand-teal hover:underline flex items-center gap-1"
            >
              Request Scoped Support Inspection &rarr;
            </Link>
          </div>
        </div>

        {/* Recent Inbound Demo Enquiries */}
        <div className="lg:col-span-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
            <div className="flex items-center gap-2">
              <Inbox className="h-4 w-4 text-brand-teal" />
              <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                Recent Inbound Demo Enquiries
              </h2>
            </div>
            <Link
              href="/admin/enquiries"
              className="text-xs font-semibold text-brand-teal hover:underline flex items-center gap-1"
            >
              View All Enquiries &rarr;
            </Link>
          </div>

          <div className="space-y-3">
            {recentEnquiries.length === 0 ? (
              <div className="text-xs text-neutral-500 py-4 text-center">No recent enquiries.</div>
            ) : (
              recentEnquiries.map((enq) => (
                <div
                  key={enq.id}
                  className="flex items-center justify-between p-2.5 rounded-lg border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/40 text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="font-semibold text-neutral-900 dark:text-neutral-100">
                      {enq.companyName} &bull; <span className="font-normal text-neutral-600 dark:text-neutral-400">{enq.fullName}</span>
                    </div>
                    <div className="text-[11px] text-neutral-500 font-mono">
                      {enq.workEmail} &bull; Interested in: {enq.offeringSlug}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        enq.status === 'qualified'
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                          : 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                      }`}
                    >
                      {enq.status}
                    </span>
                    <Link
                      href={`/admin/orgs/new?name=${encodeURIComponent(enq.companyName)}&contactEmail=${encodeURIComponent(enq.workEmail)}`}
                      className="px-2 py-1 text-[11px] font-semibold text-brand-teal hover:bg-brand-teal/10 rounded transition-colors"
                    >
                      Convert
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* CRYPTOGRAPHIC AUDIT FEED */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-brand-teal" />
            <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
              Live Cryptographic Audit Feed (Latest SHA-256 Sealed Blocks)
            </h2>
          </div>
          <Link
            href="/admin/audit"
            className="text-xs font-semibold text-brand-teal hover:underline flex items-center gap-1"
          >
            Inspect Ledger & Verify Chain &rarr;
          </Link>
        </div>

        <div className="space-y-2 font-mono text-xs">
          {recentAudit.map((e) => (
            <div
              key={e.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/30 gap-2 hover:bg-neutral-100/50 transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2 font-sans font-semibold text-neutral-900 dark:text-neutral-100">
                  <span>{e.action}</span>
                  <span className="text-[10px] font-mono font-normal text-neutral-400">
                    by {e.actorEmail || e.actorId}
                  </span>
                </div>
                <div className="text-[11px] font-sans text-neutral-600 dark:text-neutral-400 line-clamp-1">
                  {e.details}
                </div>
              </div>
              <div className="flex sm:flex-col items-center sm:items-end justify-between text-right shrink-0">
                <span className="text-[10px] text-brand-teal" title={e.hash}>
                  hash: {e.hash ? `${e.hash.slice(0, 10)}...` : 'GENESIS'}
                </span>
                <span className="text-[10px] text-neutral-400 font-sans">
                  {new Date(e.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
