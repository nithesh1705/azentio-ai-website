'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { usePersona } from '@/context/PersonaContext';
import {
  getPlaygroundRunById,
  getPlaygroundRuns,
  deletePlaygroundRun,
} from '@/server/dal/employee/playground';
import { PlaygroundRun } from '@/types';
import {
  Terminal,
  ShieldAlert,
  ArrowLeft,
  CheckCircle2,
  Trash2,
  ExternalLink,
  RotateCcw,
  Layers,
  Info,
  Clock,
  Sparkles,
  Cpu,
  Columns,
  Share2,
} from 'lucide-react';

export default function PlaygroundRunDetailPage() {
  const { actor } = usePersona();
  const params = useParams();
  const runId = params?.runId as string;

  const [run, setRun] = useState<PlaygroundRun | null>(null);
  const [allRuns, setAllRuns] = useState<PlaygroundRun[]>([]);
  const [compareRunId, setCompareRunId] = useState<string>('');
  const [compareRun, setCompareRun] = useState<PlaygroundRun | null>(null);

  useEffect(() => {
    if (!actor.isVerifiedEmployee || !runId) return;
    try {
      const found = getPlaygroundRunById(actor, runId);
      if (found) setRun(found);
      const others = getPlaygroundRuns(actor);
      setAllRuns(others.filter((r) => r.id !== runId));
    } catch (e) {
      console.error(e);
    }
  }, [actor, runId]);

  useEffect(() => {
    if (!compareRunId || !actor) {
      setCompareRun(null);
      return;
    }
    const found = getPlaygroundRunById(actor, compareRunId);
    setCompareRun(found || null);
  }, [compareRunId, actor]);

  const handleDelete = () => {
    if (!run || !actor) return;
    if (confirm(`Are you sure you want to delete simulation run ${run.id}?`)) {
      try {
        deletePlaygroundRun(actor, run.id);
        window.location.href = '/employee/playground/runs';
      } catch (err: any) {
        alert(err.message || 'Failed to delete run');
      }
    }
  };

  if (!actor.isVerifiedEmployee) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold">Employee Access Required</h2>
      </div>
    );
  }

  if (!run) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <Terminal className="w-12 h-12 text-muted-foreground mx-auto" />
        <h2 className="text-xl font-bold text-foreground">Run Not Found</h2>
        <p className="text-xs text-muted-foreground">The specified simulation run does not exist or has expired.</p>
        <Link
          href="/employee/playground"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Playground</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Honesty Banner */}
      <div className="flex items-center gap-3 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs sm:text-sm font-semibold">
        <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
        <span>Sample data • Simulated output • Not an approved credit or business decision.</span>
      </div>

      {/* Top Bar Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/employee/playground"
            className="p-2 rounded-xl border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground text-xs"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-primary">{run.id}</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground uppercase">
                {run.mode}
              </span>
            </div>
            <h1 className="text-xl font-bold text-foreground">{run.scenarioTitle}</h1>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Compare Selector */}
          <div className="flex items-center gap-2 bg-card border border-border px-3 py-1.5 rounded-xl text-xs">
            <Columns className="w-3.5 h-3.5 text-muted-foreground" />
            <select
              value={compareRunId}
              onChange={(e) => setCompareRunId(e.target.value)}
              className="bg-transparent text-xs text-foreground outline-none"
            >
              <option value="">Compare with another run...</option>
              {allRuns.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.id} ({r.mode}) — {r.scenarioTitle.slice(0, 30)}
                </option>
              ))}
            </select>
          </div>

          {run.userId === actor.userId && (
            <button
              onClick={handleDelete}
              className="p-2 rounded-xl border border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/20 text-xs"
              title="Delete Run"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Comparison View or Single View */}
      {compareRun ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RunCard run={run} title="Current Run (A)" />
          <RunCard run={compareRun} title="Comparison Run (B)" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Summary & Metrics */}
          <div className="rounded-3xl border border-border bg-card p-6 space-y-6">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                Executive Output Summary
              </h3>
              <p className="text-sm sm:text-base font-semibold text-foreground">{run.outputSummary}</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {run.metrics.map((m) => (
                <div key={m.label} className="p-4 rounded-2xl bg-muted/30 border border-border/80">
                  <div className="text-[11px] font-medium text-muted-foreground">{m.label}</div>
                  <div className="text-lg font-bold text-foreground mt-1">{m.value}</div>
                  {m.delta && (
                    <div className="text-[10px] font-mono text-rose-500 font-semibold mt-0.5">
                      {m.delta}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Trace and Evidence Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-3xl border border-border bg-card p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-primary" />
                <h4 className="text-sm font-bold text-foreground">Algorithmic Execution Trace</h4>
              </div>
              <div className="space-y-2.5">
                {run.trace.map((t) => (
                  <div
                    key={t.step}
                    className={`p-3.5 rounded-2xl border ${
                      t.status === 'flagged'
                        ? 'border-amber-500/30 bg-amber-500/5'
                        : 'border-border/60 bg-muted/20'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-foreground">
                        {t.step}. {t.title}
                      </span>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                          t.status === 'flagged'
                            ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold'
                            : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        }`}
                      >
                        {t.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{t.detail}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-border bg-card p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-primary" />
                <h4 className="text-sm font-bold text-foreground">Evidence & Assumptions</h4>
              </div>
              <div className="space-y-3">
                {run.evidence.map((ev) => (
                  <div key={ev.rule} className="p-3.5 rounded-2xl bg-muted/30 border border-border/60">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-foreground">{ev.rule}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                        {(ev.confidence * 100).toFixed(0)}%
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{ev.note}</p>
                  </div>
                ))}

                <div className="text-xs font-bold text-foreground uppercase tracking-wider pt-2">
                  Parameters Used
                </div>
                <pre className="p-3.5 rounded-2xl bg-zinc-950 text-zinc-200 text-xs font-mono overflow-x-auto">
                  {JSON.stringify(run.params, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function RunCard({ run, title }: { run: PlaygroundRun; title: string }) {
  return (
    <div className="rounded-3xl border border-border bg-card p-6 space-y-4 shadow-xs">
      <div className="flex items-center justify-between pb-3 border-b border-border">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            {title}
          </span>
          <h3 className="text-base font-bold text-foreground">{run.id}</h3>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
          {run.mode}
        </span>
      </div>

      <div>
        <div className="text-xs font-semibold text-muted-foreground">Summary:</div>
        <p className="text-xs text-foreground mt-0.5">{run.outputSummary}</p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {run.metrics.map((m) => (
          <div key={m.label} className="p-2.5 rounded-xl bg-muted/30 border border-border/60">
            <div className="text-[10px] text-muted-foreground">{m.label}</div>
            <div className="text-xs font-bold text-foreground mt-0.5">{m.value}</div>
          </div>
        ))}
      </div>

      <div>
        <div className="text-xs font-semibold text-muted-foreground mb-1">Parameters:</div>
        <pre className="p-2.5 rounded-xl bg-zinc-950 text-zinc-200 text-[11px] font-mono overflow-x-auto">
          {JSON.stringify(run.params, null, 2)}
        </pre>
      </div>
    </div>
  );
}

