'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ShieldAlert,
  ArrowLeft,
  Clock,
  Eye,
  Lock,
  Ban,
  FileCode,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { SupportAuthorisation } from '@/types';

export default function SupportAccessViewerPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authorisation, setAuthorisation] = useState<SupportAuthorisation | null>(null);
  const [resourceData, setResourceData] = useState<any>(null);
  const [watermark, setWatermark] = useState<{
    viewer: string;
    timestamp: string;
    ipHash: string;
    authId: string;
  } | null>(null);

  useEffect(() => {
    const fetchScopedResource = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/admin/support?view=true&authId=${id}`);
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Failed to load scoped support resource.');
        }
        setAuthorisation(data.authorisation);
        setResourceData(data.resourceData);
        setWatermark(data.watermark);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchScopedResource();
  }, [id]);

  const handleRevoke = async () => {
    if (!confirm('Are you sure you want to terminate this support session now?')) return;
    try {
      const res = await fetch('/api/admin/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'revoke', id }),
      });
      if (res.ok) {
        router.push('/admin/support-access');
      }
    } catch {
      alert('Failed to revoke authorization.');
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-sm text-neutral-500">
        Authenticating scoped support authorization and generating watermarked view...
      </div>
    );
  }

  if (error || !authorisation) {
    return (
      <div className="space-y-4">
        <Link
          href="/admin/support-access"
          className="text-xs font-semibold text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 inline-flex items-center gap-1"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Support Access List
        </Link>
        <div className="p-6 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 space-y-2">
          <div className="font-bold flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-red-600" />
            Support Access Denied
          </div>
          <p className="text-sm">{error || 'Support authorization is invalid or expired.'}</p>
        </div>
      </div>
    );
  }

  const watermarkString = watermark
    ? `AZENTIO SECURE VIEWER · ${watermark.viewer} · ${watermark.ipHash} · ${new Date(watermark.timestamp).toISOString()} · AUTH: ${watermark.authId}`
    : 'AZENTIO SECURE VIEWER';

  return (
    <div className="space-y-6">
      {/* Back and Breadcrumbs */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/support-access"
          className="text-xs font-semibold text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 inline-flex items-center gap-1"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Support Access List
        </Link>
        <button
          onClick={handleRevoke}
          className="px-3 py-1.5 text-xs font-semibold text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/50 hover:bg-red-100 rounded-lg border border-red-200 dark:border-red-800 flex items-center gap-1.5 transition-colors"
        >
          <Ban className="h-3.5 w-3.5" />
          Revoke Session Immediately
        </button>
      </div>

      {/* Session Metadata Banner */}
      <div className="bg-neutral-900 text-white rounded-xl p-5 space-y-3 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-800 pb-3">
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-brand-teal" />
            <h1 className="text-base font-bold tracking-tight">
              Scoped Support Inspection: {authorisation.orgName}
            </h1>
          </div>
          <div className="flex items-center gap-2 text-xs text-neutral-400 font-mono">
            <span>Authorisation: {authorisation.id}</span>
            <span>•</span>
            <span className="text-amber-400 flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 inline" />
              Expires {new Date(authorisation.expiresAt).toLocaleTimeString()}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-neutral-300">
          <div>
            <span className="text-neutral-500 block uppercase text-[10px]">Resource Kind & ID</span>
            <span className="font-mono text-neutral-100">
              {authorisation.resourceKind} / {authorisation.resourceId}
            </span>
          </div>
          <div>
            <span className="text-neutral-500 block uppercase text-[10px]">Approved Dual Control</span>
            <span>
              Req: {authorisation.requestedByName} &bull; Appr: {authorisation.approvedByName}
            </span>
          </div>
          <div>
            <span className="text-neutral-500 block uppercase text-[10px]">Justification</span>
            <span className="line-clamp-2">{authorisation.reason}</span>
          </div>
        </div>
      </div>

      {/* Watermarked Viewport */}
      <div className="relative border border-neutral-300 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-950 overflow-hidden shadow-inner p-6 select-none min-h-[400px]">
        {/* Diagonal Watermark Overlay */}
        <div
          className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-around overflow-hidden opacity-[0.08] dark:opacity-[0.14] font-mono text-xs leading-loose"
          style={{ transform: 'rotate(-25deg) scale(1.4)' }}
        >
          {Array.from({ length: 14 }).map((_, i) => (
            <div key={i} className="whitespace-nowrap font-bold tracking-wider text-neutral-900 dark:text-neutral-100">
              {watermarkString} &nbsp; &bull; &nbsp; {watermarkString}
            </div>
          ))}
        </div>

        {/* Content Inside Viewport */}
        <div className="relative z-0 space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-2">
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider flex items-center gap-1.5">
              <FileCode className="h-4 w-4 text-brand-teal" />
              Resource Raw Payload & Execution Inspection
            </span>
            <span className="text-[11px] font-mono text-neutral-400">Read-Only Scoped Sandbox</span>
          </div>

          <pre className="bg-neutral-50 dark:bg-neutral-900/80 p-4 rounded-lg font-mono text-xs text-neutral-800 dark:text-neutral-200 overflow-x-auto border border-neutral-200/80 dark:border-neutral-800 leading-relaxed">
            {JSON.stringify(resourceData, null, 2)}
          </pre>

          <div className="pt-3 text-[11px] text-neutral-500 dark:text-neutral-400 flex items-center justify-between border-t border-neutral-200 dark:border-neutral-800">
            <span>
              Viewing Administrator: <span className="font-semibold text-neutral-700 dark:text-neutral-300">{watermark?.viewer}</span>
            </span>
            <span className="font-mono text-[10px] text-neutral-400">
              Security Hash: {watermark?.ipHash}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
