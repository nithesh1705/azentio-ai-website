'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePersona } from '@/context/PersonaContext';
import { getDemoRuns } from '@/server/dal/client/demos';
import { DemoRun } from '@/types';
import {
  ArrowLeft,
  History,
  PlayCircle,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Database,
  Building2,
  ChevronRight,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';

export default function ClientDemoRunsPage() {
  const { actor, activeTenant } = usePersona();
  const [selectedRun, setSelectedRun] = useState<DemoRun | null>(null);

  if (!actor.activeTenantId || !activeTenant) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <Building2 className="w-12 h-12 text-muted-foreground mx-auto" />
        <h1 className="text-xl font-bold text-foreground">Workspace Required</h1>
        <p className="text-xs text-muted-foreground">Select an active client workspace to view run history.</p>
        <Link href="/choose-workspace" className="text-xs text-primary underline">
          Switch Workspace
        </Link>
      </div>
    );
  }

  const runs = getDemoRuns(actor);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link
              href="/client/demos"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Demos</span>
            </Link>
            <span className="text-xs text-muted-foreground">&bull;</span>
            <span className="text-xs font-medium text-foreground">{activeTenant.name}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Simulation Execution History
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Isolated execution audit logs and telemetry for all sandbox runs within your tenant perimeter.
          </p>
        </div>

        <Link
          href="/client/demos"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all self-start sm:self-auto shadow-sm"
        >
          <PlayCircle className="w-4 h-4" />
          <span>Launch New Simulation</span>
        </Link>
      </div>

      {/* Tenancy & Synthetic Invariant Notice */}
      <div className="p-4 rounded-2xl bg-muted/40 border border-border/80 flex items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Database className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>
            Scoped strictly to tenant <strong className="text-foreground">{activeTenant.name}</strong> ({activeTenant.id}). Zero cross-tenant leakage.
          </span>
        </div>
        <span className="text-[11px] font-mono font-semibold text-muted-foreground hidden sm:inline">
          {runs.length} Runs Recorded
        </span>
      </div>

      {/* Runs List */}
      {runs.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-card border border-dashed border-border max-w-md mx-auto space-y-3">
          <History className="w-10 h-10 text-muted-foreground mx-auto" />
          <h3 className="text-sm font-bold text-foreground">No Simulation Runs Yet</h3>
          <p className="text-xs text-muted-foreground">
            You haven't executed any demo scenarios yet in this workspace. Launch a sandbox to generate synthetic runs.
          </p>
          <Link
            href="/client/demos"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 mt-2"
          >
            Launch Demo
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Desktop Table View (≥768px) */}
          <div className="hidden md:block overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/50 border-b border-border/80 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-6 py-3.5">Scenario / Run</th>
                  <th className="px-6 py-3.5">Mode</th>
                  <th className="px-6 py-3.5">Executed By</th>
                  <th className="px-6 py-3.5">Date & Time</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {runs.map((run) => (
                  <tr
                    key={run.id}
                    className="hover:bg-muted/30 transition-colors cursor-pointer"
                    onClick={() => setSelectedRun(run)}
                  >
                    <td className="px-6 py-4">
                      <div className="font-bold text-foreground">{run.scenarioTitle}</div>
                      <div className="font-mono text-[10px] text-muted-foreground mt-0.5">
                        {run.id}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary">
                        {run.mode === 'ai_assisted' && <Sparkles className="w-2.5 h-2.5" />}
                        <span>{run.mode}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-foreground">{run.userName}</div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground font-mono text-[11px]">
                      {new Date(run.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Completed</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedRun(run);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground text-xs font-medium transition-all"
                      >
                        Inspect Output
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View (<768px) */}
          <div className="grid grid-cols-1 gap-3 md:hidden">
            {runs.map((run) => (
              <div
                key={run.id}
                onClick={() => setSelectedRun(run)}
                className="p-4 rounded-2xl bg-card border border-border space-y-2.5 cursor-pointer active:scale-[0.99] transition-transform"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary">
                    {run.mode}
                  </span>
                  <span className="text-[10px] font-mono text-muted-foreground">
                    {new Date(run.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="font-bold text-foreground text-sm">{run.scenarioTitle}</div>

                <div className="text-xs text-muted-foreground line-clamp-2">
                  {run.outputSummary}
                </div>

                <div className="pt-2 border-t border-border/50 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">By {run.userName}</span>
                  <span className="text-primary font-semibold inline-flex items-center gap-1">
                    <span>Inspect</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Inspect Run Drawer / Modal */}
      {selectedRun && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 rounded-3xl bg-card border border-border shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-border/60 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                  Inspection: {selectedRun.id}
                </span>
                <h3 className="text-lg font-bold text-foreground">{selectedRun.scenarioTitle}</h3>
              </div>
              <button
                onClick={() => setSelectedRun(null)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-muted-foreground hover:text-foreground"
              >
                Close
              </button>
            </div>

            {/* Honesty invariant */}
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 text-xs font-mono">
              Notice: Sample data &bull; Simulated output &bull; Not an approved business decision.
            </div>

            {/* Output Summary */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Output Summary
              </span>
              <p className="p-3.5 rounded-xl bg-muted/40 text-xs sm:text-sm text-foreground leading-relaxed">
                {selectedRun.outputSummary}
              </p>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {selectedRun.metrics.map((m, i) => (
                <div key={i} className="p-3.5 rounded-xl bg-muted/30 border border-border/60">
                  <div className="text-[11px] text-muted-foreground">{m.label}</div>
                  <div className="text-xl font-black text-foreground mt-0.5">{m.value}</div>
                  {m.delta && (
                    <div className="text-[10px] font-semibold text-primary mt-0.5">{m.delta}</div>
                  )}
                </div>
              ))}
            </div>

            {/* Parameters Used */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Simulation Parameters
              </span>
              <pre className="p-3 rounded-xl bg-muted/40 font-mono text-[11px] text-foreground overflow-x-auto">
                {JSON.stringify(selectedRun.params, null, 2)}
              </pre>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border/60">
              <Link
                href={`/client/demos/${selectedRun.demoId}`}
                className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 inline-flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Re-Execute This Scenario</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

