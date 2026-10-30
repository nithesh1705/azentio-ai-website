'use client';

import React from 'react';
import Link from 'next/link';
import { usePersona } from '@/context/PersonaContext';
import { getAuditEvents } from '@/server/dal/store';
import {
  Clock,
  ShieldCheck,
  ChevronLeft,
  FileText,
  User,
  Key,
} from 'lucide-react';
import { formatDate, formatTime } from '@/lib/utils';

export default function AdminAuditPage() {
  const { actor } = usePersona();

  const isAdmin = actor.platformGrants.includes('portal_admin');

  if (!isAdmin) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <ShieldCheck className="w-12 h-12 text-destructive mx-auto" />
        <h1 className="text-2xl font-bold text-foreground">Access Restricted</h1>
        <p className="text-sm text-muted-foreground">
          Audit logs are accessible strictly to Portal Administrators.
        </p>
      </div>
    );
  }

  const logs = getAuditEvents(actor);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-6">
        <Link
          href="/admin/orgs"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to IAM Administration</span>
        </Link>
      </div>

      <div className="max-w-3xl mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs uppercase tracking-widest font-bold text-rose-500">
            Immutable Audit Trail
          </span>
          <span className="badge-synthetic text-xs">Append-Only Logs</span>
        </div>
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
          System Audit & Security Logs
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
          Comprehensive, append-only chronological log of all privileged transitions, moderation actions, and policy enforcement events.
        </p>
      </div>

      <div className="p-6 rounded-3xl glass-panel border border-border">
        <div className="space-y-4">
          {logs.map((log) => (
            <div
              key={log.id}
              className="p-4 rounded-2xl bg-muted/30 border border-border/80 text-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-foreground font-mono">{log.action}</span>
                  <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-muted text-muted-foreground">
                    {log.resourceKind}: {log.resourceId}
                  </span>
                </div>
                <p className="text-muted-foreground">{log.details}</p>
                <div className="text-[10px] text-muted-foreground">
                  Actor: <span className="font-semibold text-foreground">{log.actorEmail}</span> ({log.actorId})
                </div>
              </div>

              <div className="shrink-0 text-right text-[11px] text-muted-foreground font-mono">
                <div>{formatDate(log.timestamp)}</div>
                <div>{formatTime(log.timestamp)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
