'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { usePersona } from '@/context/PersonaContext';
import { getExperiments } from '@/server/dal/employee/experiments';
import { getPlaygroundOfferings } from '@/server/dal/employee/playground';
import { Experiment, Offering } from '@/types';
import {
  FlaskConical,
  PlusCircle,
  Search,
  Filter,
  ArrowUpDown,
  ChevronRight,
  Clock,
  Users,
  CheckCircle2,
  Tag,
  Sparkles,
} from 'lucide-react';

export default function EmployeeExperimentsListPage() {
  const { actor } = usePersona();
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [offerings, setOfferings] = useState<Offering[]>([]);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [offeringFilter, setOfferingFilter] = useState<string>('all');
  const [ownerOnly, setOwnerOnly] = useState<boolean>(false);
  const [search, setSearch] = useState<string>('');
  const [sort, setSort] = useState<'updated' | 'created' | 'title'>('updated');

  const loadData = () => {
    if (!actor?.isVerifiedEmployee) return;
    try {
      const exps = getExperiments(actor, {
        status: statusFilter,
        offeringId: offeringFilter,
        ownerOnly,
        search,
        sort,
      });
      setExperiments(exps);

      const offs = getPlaygroundOfferings(actor);
      setOfferings(offs);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, [actor, statusFilter, offeringFilter, ownerOnly, search, sort]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              Innovation & Research Spikes
            </span>
            <span className="text-xs text-muted-foreground font-mono">Employee Quarantined</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Innovation Experiments
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Track algorithmic hypotheses, benchmark prototypes, and collaborate on product breakthroughs.
          </p>
        </div>

        <Link
          href="/employee/experiments/new"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all shadow-md shadow-primary/20 shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Experiment</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-card border border-border rounded-3xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search experiments by title, hypothesis, tag..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-input bg-background text-xs text-foreground outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-input bg-background text-xs text-foreground outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="Draft">Draft</option>
              <option value="Submitted">Submitted</option>
              <option value="In_Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Archived">Archived</option>
            </select>

            {/* Offering Filter */}
            <select
              value={offeringFilter}
              onChange={(e) => setOfferingFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-input bg-background text-xs text-foreground outline-none"
            >
              <option value="all">All Offerings</option>
              {offerings.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </select>

            {/* Sort Selector */}
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as any)}
              className="px-3 py-1.5 rounded-xl border border-input bg-background text-xs text-foreground outline-none"
            >
              <option value="updated">Recently Updated</option>
              <option value="created">Recently Created</option>
              <option value="title">Alphabetical (A-Z)</option>
            </select>

            {/* Owner Toggle */}
            <button
              onClick={() => setOwnerOnly(!ownerOnly)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                ownerOnly
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card border-border hover:bg-muted text-muted-foreground'
              }`}
            >
              {ownerOnly ? 'My Experiments Only' : 'All Experiments'}
            </button>
          </div>
        </div>
      </div>

      {/* Experiments Grid */}
      {experiments.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-border rounded-3xl bg-card">
          <FlaskConical className="w-12 h-12 text-muted-foreground mx-auto mb-2 opacity-40" />
          <h3 className="text-base font-bold text-foreground">No experiments match criteria</h3>
          <p className="text-xs text-muted-foreground mt-1">Adjust filters or propose a new hypothesis.</p>
          <Link
            href="/employee/experiments/new"
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Create Experiment</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {experiments.map((exp) => (
            <Link
              key={exp.id}
              href={`/employee/experiments/${exp.id}`}
              className="rounded-3xl border border-border bg-card p-5 hover:border-primary/40 transition-all flex flex-col justify-between group shadow-xs"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full ${
                      exp.status === 'Completed'
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                        : exp.status === 'In_Progress'
                        ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                        : exp.status === 'Submitted'
                        ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {exp.status.replace('_', ' ')}
                  </span>
                  <span className="text-[10px] font-mono text-muted-foreground">
                    {exp.offeringName}
                  </span>
                </div>

                <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                  {exp.title}
                </h3>

                <p className="text-xs text-muted-foreground line-clamp-3">
                  <strong className="text-foreground font-semibold">Hypothesis: </strong>
                  {exp.hypothesis}
                </p>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {exp.tags.map((t) => (
                    <span
                      key={t}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5 font-medium text-foreground">
                  <Users className="w-3.5 h-3.5 text-primary" />
                  {exp.ownerName}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {new Date(exp.updatedAt).toLocaleDateString()}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
