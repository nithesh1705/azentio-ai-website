'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { usePersona } from '@/context/PersonaContext';
import { getPlaygroundRuns, deletePlaygroundRun } from '@/server/dal/employee/playground';
import { PlaygroundRun } from '@/types';
import {
  Terminal,
  ShieldAlert,
  Search,
  Filter,
  Trash2,
  ChevronRight,
  ExternalLink,
  ArrowLeft,
  CheckCircle2,
  Cpu,
  Sparkles,
  Calendar,
} from 'lucide-react';

export default function PlaygroundRunsListPage() {
  const { actor } = usePersona();
  const [runs, setRuns] = useState<PlaygroundRun[]>([]);
  const [search, setSearch] = useState('');
  const [modeFilter, setModeFilter] = useState<'all' | 'deterministic' | 'ai_assisted'>('all');
  const [offeringFilter, setOfferingFilter] = useState<string>('all');

  const loadRuns = () => {
    if (!actor.isVerifiedEmployee) return;
    try {
      const all = getPlaygroundRuns(actor);
      setRuns(all);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadRuns();
  }, [actor]);

  const handleDelete = (run: PlaygroundRun) => {
    if (confirm(`Delete run ${run.id}?`)) {
      try {
        deletePlaygroundRun(actor, run.id);
        loadRuns();
      } catch (err: any) {
        alert(err.message || 'Failed to delete');
      }
    }
  };

  const filteredRuns = runs.filter((r) => {
    const matchesSearch =
      r.id.toLowerCase().includes(search.toLowerCase()) ||
      r.scenarioTitle.toLowerCase().includes(search.toLowerCase()) ||
      r.offeringName.toLowerCase().includes(search.toLowerCase());

    const matchesMode = modeFilter === 'all' || r.mode === modeFilter;
    const matchesOffering = offeringFilter === 'all' || r.offeringId === offeringFilter;

    return matchesSearch && matchesMode && matchesOffering;
  });

  const uniqueOfferings = Array.from(new Set(runs.map((r) => r.offeringId))).map((id) => {
    const match = runs.find((r) => r.offeringId === id);
    return { id, name: match?.offeringName || id };
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Honesty Banner */}
      <div className="flex items-center gap-3 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs sm:text-sm font-semibold">
        <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
        <span>Sample data • Simulated output • Not an approved credit or business decision.</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/employee/playground"
            className="p-2 rounded-xl border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground text-xs"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Playground Simulation History</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Review, compare, and audit past synthetic simulation traces.
            </p>
          </div>
        </div>

        <Link
          href="/employee/playground"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 shadow-md shadow-primary/20"
        >
          <Terminal className="w-4 h-4" />
          <span>New Simulation</span>
        </Link>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row items-center gap-3 bg-card border border-border p-3.5 rounded-2xl shadow-xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by ID, scenario, offering..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-input bg-background text-xs text-foreground outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Mode Filter */}
          <select
            value={modeFilter}
            onChange={(e) => setModeFilter(e.target.value as any)}
            className="px-3 py-1.5 rounded-xl border border-input bg-background text-xs text-foreground outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="all">All Modes</option>
            <option value="deterministic">Deterministic</option>
            <option value="ai_assisted">AI Assisted</option>
          </select>

          {/* Offering Filter */}
          <select
            value={offeringFilter}
            onChange={(e) => setOfferingFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-input bg-background text-xs text-foreground outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="all">All Offerings</option>
            {uniqueOfferings.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results */}
      {filteredRuns.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-border rounded-3xl bg-card">
          <Terminal className="w-12 h-12 text-muted-foreground mx-auto mb-2 opacity-50" />
          <h3 className="text-base font-bold text-foreground">No simulation runs match filters</h3>
          <p className="text-xs text-muted-foreground mt-1">Adjust search parameters or launch a new run.</p>
        </div>
      ) : (
        <>
          {/* Desktop Table (>=768px) */}
          <div className="hidden md:block rounded-3xl border border-border bg-card overflow-hidden shadow-xs">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/40 text-muted-foreground border-b border-border">
                <tr>
                  <th className="px-5 py-3 font-semibold">Run ID / Scenario</th>
                  <th className="px-4 py-3 font-semibold">Offering</th>
                  <th className="px-4 py-3 font-semibold">Mode</th>
                  <th className="px-4 py-3 font-semibold">Executed By</th>
                  <th className="px-4 py-3 font-semibold">Date</th>
                  <th className="px-5 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredRuns.map((r) => (
                  <tr key={r.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="font-mono font-bold text-primary text-[11px]">{r.id}</div>
                      <div className="font-semibold text-foreground mt-0.5 line-clamp-1">{r.scenarioTitle}</div>
                    </td>
                    <td className="px-4 py-3.5 text-muted-foreground">{r.offeringName}</td>
                    <td className="px-4 py-3.5">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                        {r.mode}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-muted-foreground">{r.userName}</td>
                    <td className="px-4 py-3.5 text-muted-foreground">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/employee/playground/${r.id}`}
                          className="px-2.5 py-1 rounded-lg border border-border bg-card hover:bg-muted text-[11px] font-semibold text-foreground flex items-center gap-1"
                        >
                          <span>View Trace</span>
                          <ChevronRight className="w-3 h-3" />
                        </Link>
                        {r.userId === actor.userId && (
                          <button
                            onClick={() => handleDelete(r)}
                            className="p-1 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Stacked Cards (<768px) */}
          <div className="md:hidden space-y-3">
            {filteredRuns.map((r) => (
              <div key={r.id} className="p-4 rounded-2xl border border-border bg-card space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-primary">{r.id}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                    {r.mode}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-foreground">{r.scenarioTitle}</h4>
                <div className="text-[11px] text-muted-foreground">{r.offeringName}</div>

                <div className="flex items-center justify-between pt-2 border-t border-border/60 text-xs">
                  <span className="text-[11px] text-muted-foreground">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </span>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/employee/playground/${r.id}`}
                      className="px-3 py-1 rounded-lg bg-primary text-primary-foreground text-xs font-semibold"
                    >
                      View
                    </Link>
                    {r.userId === actor.userId && (
                      <button
                        onClick={() => handleDelete(r)}
                        className="p-1.5 rounded-lg border border-destructive/30 text-destructive"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
