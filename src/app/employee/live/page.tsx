'use client';

import React from 'react';
import Link from 'next/link';
import { usePersona } from '@/context/PersonaContext';
import {
  Radio,
  Play,
  Calendar,
  Lock,
  Clock,
  ShieldCheck,
  ChevronLeft,
} from 'lucide-react';

export default function EmployeeLivePage() {
  const { actor } = usePersona();

  if (!actor.isVerifiedEmployee) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <ShieldCheck className="w-12 h-12 text-destructive mx-auto" />
        <h1 className="text-2xl font-bold text-foreground">Employee Access Restricted</h1>
        <p className="text-sm text-muted-foreground">
          Internal live broadcasts and recordings are restricted strictly to employees.
        </p>
      </div>
    );
  }

  const sessions = [
    {
      id: 'session-1',
      title: 'Q4 Product Engineering All-Hands: Seasonality Suppression Engine Architecture',
      speaker: 'Tariq Al-Mansoor (Product Owner) & Maya Lin (Lead Architect)',
      date: 'Today &bull; 14:00 GMT',
      status: 'Live Recording Available',
      duration: '48 mins',
      summary:
        'Technical walkthrough of historical seasonality curve matching in Financial Analysis Intelligence and empirical benchmarking against synthetic client datasets.',
    },
    {
      id: 'session-2',
      title: 'Governance Briefing: Deny-by-Default Policy & Postgres FTS Single-Tx Withdrawal',
      speaker: 'Priya Sharma (Security & IAM Team)',
      date: 'October 24, 2026',
      status: 'Archived Recording',
      duration: '35 mins',
      summary:
        'Review of zero-tolerance access boundaries, single policy module integration, and 60-second withdrawal guarantees.',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-6">
        <Link
          href="/employee"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Employee Portal</span>
        </Link>
      </div>

      <div className="max-w-3xl mb-10">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs uppercase tracking-widest font-bold text-rose-500">
            Internal Broadcasts
          </span>
          <span className="badge-synthetic text-xs">Employee Audience Only</span>
        </div>
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
          Live Engineering Sessions & Recordings
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
          Internal video broadcasts and architecture sessions. All recordings are served via authorized proxies and cannot be accessed from public or client URLs.
        </p>
      </div>

      <div className="space-y-6">
        {sessions.map((session) => (
          <div
            key={session.id}
            className="p-8 rounded-3xl glass-panel border border-border glow-card flex flex-col md:flex-row md:items-center justify-between gap-6"
          >
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1 font-semibold text-rose-500">
                  <Radio className="w-3.5 h-3.5 animate-pulse" />
                  {session.status}
                </span>
                <span>&bull;</span>
                <span>{session.duration}</span>
              </div>
              <h2 className="text-xl font-bold text-foreground">{session.title}</h2>
              <p className="text-xs font-medium text-emerald-500">Presented by: {session.speaker}</p>
              <p className="text-xs text-muted-foreground leading-relaxed mt-2">{session.summary}</p>
            </div>

            <div className="shrink-0">
              <button
                onClick={() => alert(`Playing authorized stream for ${session.title}`)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500 transition-all shadow-md shadow-indigo-500/20"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Stream Recording</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

