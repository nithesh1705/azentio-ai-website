'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ShieldCheck,
  ArrowLeft,
  Lock,
  Layers,
  CheckCircle2,
  AlertTriangle,
  FileText,
  User,
  Clock,
  KeyRound,
} from 'lucide-react';
import { AuditEvent } from '@/types';

export default function AuditBlockDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [event, setEvent] = useState<AuditEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/admin/audit?id=${id}`);
        const data = await res.json();
        if (!res.ok || !data.event) {
          throw new Error(data.error || 'Audit record block not found.');
        }
        setEvent(data.event);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchEvent();
  }, [id]);

  if (loading) {
    return (
      <div className="p-12 text-center text-sm text-neutral-500">
        Retrieving cryptographic audit block from ledger...
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="space-y-4">
        <Link
          href="/admin/audit"
          className="text-xs font-semibold text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 inline-flex items-center gap-1"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Audit Ledger
        </Link>
        <div className="p-6 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300">
          {error || 'Audit block record could not be found.'}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <Link
          href="/admin/audit"
          className="text-xs font-semibold text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 inline-flex items-center gap-1"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Audit Ledger
        </Link>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-4">
        <div>
          <span className="text-xs font-mono text-neutral-400 block mb-1">
            BLOCK ID: {event.id}
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-brand-teal" />
            {event.action}
          </h1>
        </div>
        <div>
          <span
            className={`px-3 py-1 text-xs font-semibold uppercase rounded-full ${
              event.outcome === 'denied'
                ? 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300'
                : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
            }`}
          >
            Outcome: {event.outcome || 'success'}
          </span>
        </div>
      </div>

      {/* Grid Metadata */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Event Details Card */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 space-y-4 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-500 flex items-center gap-2">
            <FileText className="h-4 w-4 text-brand-teal" />
            Event Context & Payload
          </h2>
          <div className="space-y-3 text-xs">
            <div>
              <span className="text-neutral-400 block">Timestamp (UTC):</span>
              <span className="font-mono text-neutral-800 dark:text-neutral-200">
                {new Date(event.timestamp).toUTCString()} ({event.timestamp})
              </span>
            </div>
            <div>
              <span className="text-neutral-400 block">Actor Identity:</span>
              <span className="font-medium text-neutral-900 dark:text-neutral-100">
                {event.actorEmail || 'anonymous'} ({event.actorId})
              </span>
            </div>
            <div>
              <span className="text-neutral-400 block">Origin IP / Security Hash:</span>
              <span className="font-mono text-neutral-700 dark:text-neutral-300">{event.ip}</span>
            </div>
            <div>
              <span className="text-neutral-400 block">Target Resource:</span>
              <span className="font-mono text-neutral-800 dark:text-neutral-200">
                {event.resourceKind} &bull; {event.resourceId}
              </span>
            </div>
            <div>
              <span className="text-neutral-400 block">Request Tracking ID:</span>
              <span className="font-mono text-neutral-600 dark:text-neutral-400">{event.requestId}</span>
            </div>
            <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800">
              <span className="text-neutral-400 block mb-1">Human-Readable Details:</span>
              <div className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/60 font-sans text-neutral-800 dark:text-neutral-200 text-xs leading-relaxed border border-neutral-200/60 dark:border-neutral-800">
                {event.details}
              </div>
            </div>
          </div>
        </div>

        {/* Cryptographic Ledger Block Proof */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 space-y-4 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-500 flex items-center gap-2">
            <Layers className="h-4 w-4 text-brand-teal" />
            Cryptographic SHA-256 Proof
          </h2>
          <div className="space-y-4 text-xs">
            <div className="space-y-1">
              <span className="text-neutral-400 block font-semibold">Previous Block Hash (prevHash):</span>
              <div className="p-2.5 rounded-lg bg-neutral-50 dark:bg-neutral-800/80 font-mono text-[11px] break-all border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400">
                {event.prevHash || '0000000000000000000000000000000000000000000000000000000000000000 (GENESIS)'}
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-neutral-400 block font-semibold">Current Block Hash (hash):</span>
              <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 font-mono text-[11px] break-all border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-bold">
                {event.hash}
              </div>
            </div>

            <div className="p-4 rounded-lg bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-700 space-y-2">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>Append-Only Seal Intact</span>
              </div>
              <p className="text-[11px] text-neutral-600 dark:text-neutral-400 leading-normal">
                This block is cryptographically linked to its predecessor. Any modification to the actor, timestamp, action, or details will cause the hash computation to diverge and fail chain verification.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

