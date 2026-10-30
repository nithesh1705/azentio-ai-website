'use client';

import React from 'react';
import Link from 'next/link';
import { usePersona } from '@/context/PersonaContext';
import {
  BookOpen,
  FileText,
  User,
  Calendar,
  CheckCircle2,
  ShieldCheck,
  ChevronLeft,
} from 'lucide-react';

export default function EmployeeKnowledgePage() {
  const { actor } = usePersona();

  if (!actor.isVerifiedEmployee) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <ShieldCheck className="w-12 h-12 text-destructive mx-auto" />
        <h1 className="text-2xl font-bold text-foreground">Employee Access Restricted</h1>
        <p className="text-sm text-muted-foreground">
          Internal knowledge library is restricted strictly to verified employees.
        </p>
      </div>
    );
  }

  const items = [
    {
      title: 'Prompt Architecture Guidelines for Financial Synthesis (AIRA)',
      owner: 'Maya Lin',
      reviewDate: '2026-11-15',
      category: 'AI Engineering',
      summary:
        'Standardized system prompting templates ensuring strict evidence citation and zero hallucinated quantitative ratios.',
    },
    {
      title: 'Postgres FTS GIN Indexing & Immediate Search Invalidation Manual',
      owner: 'Database Architecture Squad',
      reviewDate: '2026-12-01',
      category: 'Infrastructure',
      summary:
        'How single-transaction synchronous withdrawal guarantees ≤ 60-second purge from search vectors and retrieval caches.',
    },
    {
      title: 'Differential Privacy Simulation & Aggregation Guardrail Standards',
      owner: 'Priya Sharma (IAM & Governance)',
      reviewDate: '2026-11-30',
      category: 'Security & Policy',
      summary:
        'Implementation benchmarks for MIN_DISTINCT_ORGS = 3 suppression, difference attack mitigation, and small-cohort masking.',
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
          <span className="text-xs uppercase tracking-widest font-bold text-emerald-500">
            Internal Library
          </span>
          <span className="badge-synthetic text-xs">Governed Documentation</span>
        </div>
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
          Internal Knowledge & Architecture Library
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
          Technical specifications, policy benchmarks, and algorithmic decision logs. Each asset carries an assigned employee owner and mandatory review date.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {items.map((item, idx) => (
          <div
            key={idx}
            className="p-6 rounded-3xl glass-panel border border-border glow-card flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded">
                  {item.category}
                </span>
                <BookOpen className="w-4 h-4 text-muted-foreground" />
              </div>
              <h2 className="font-bold text-base text-foreground">{item.title}</h2>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{item.summary}</p>
            </div>

            <div className="mt-6 pt-4 border-t border-border space-y-1 text-[11px] text-muted-foreground">
              <div className="flex items-center justify-between">
                <span>Owner: <strong className="text-foreground">{item.owner}</strong></span>
                <span>Review: {item.reviewDate}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

