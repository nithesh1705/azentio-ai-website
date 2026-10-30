'use client';

import React from 'react';
import Link from 'next/link';
import { usePersona } from '@/context/PersonaContext';
import {
  FileCode,
  Tag,
  CheckCircle2,
  Calendar,
  ShieldCheck,
  ChevronLeft,
} from 'lucide-react';

export default function EmployeeReleasesPage() {
  const { actor } = usePersona();

  if (!actor.isVerifiedEmployee) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <ShieldCheck className="w-12 h-12 text-destructive mx-auto" />
        <h1 className="text-2xl font-bold text-foreground">Employee Access Restricted</h1>
        <p className="text-sm text-muted-foreground">
          Internal release notes are restricted strictly to employees.
        </p>
      </div>
    );
  }

  const releases = [
    {
      version: 'v2.4.0',
      date: 'October 28, 2026',
      badge: 'Current Release',
      highlights: [
        'Postgres FTS GIN indexing deployed for published observations with instant transactional withdrawal.',
        'AIRA retrieval citation validator strictly limits summaries to live approved items.',
        'Interactive persona switching console enabled for hackathon judging walkthroughs.',
        'Four-part independent consent recording (process, publish, attribution, training) with policy tracking.',
      ],
    },
    {
      version: 'v2.3.2',
      date: 'October 15, 2026',
      badge: 'Patch',
      highlights: [
        'Refactored single policy engine in src/server/policy/authorize.ts with deny-by-default logic.',
        'Sensitivity scanner heuristic expanded to flag IBAN, payment card runs, and confidential keywords.',
        'Tenant isolation enforcement validated across all client data access routes.',
      ],
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
          <span className="text-xs uppercase tracking-widest font-bold text-teal-400">
            Engineering Logs
          </span>
          <span className="badge-synthetic text-xs">Internal Platform</span>
        </div>
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
          Platform Release Notes & Change Log
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
          Technical release history, deprecation schedules, and security gate achievements.
        </p>
      </div>

      <div className="space-y-6">
        {releases.map((rel) => (
          <div
            key={rel.version}
            className="p-8 rounded-3xl glass-panel border border-border glow-card space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Tag className="w-5 h-5 text-teal-400" />
                <h2 className="text-2xl font-black text-foreground">{rel.version}</h2>
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400 bg-teal-500/10 px-2.5 py-0.5 rounded-full border border-teal-500/20">
                  {rel.badge}
                </span>
              </div>
              <span className="text-xs text-muted-foreground">{rel.date}</span>
            </div>

            <ul className="space-y-2 text-xs text-muted-foreground">
              {rel.highlights.map((h, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
