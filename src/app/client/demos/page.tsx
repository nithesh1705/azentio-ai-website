'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { usePersona } from '@/context/PersonaContext';
import { getClientDemos } from '@/server/dal/client/demos';
import {
  Building2,
  PlayCircle,
  Clock,
  History,
  ShieldAlert,
  Search,
  Sparkles,
  Info,
  CheckCircle2,
  ArrowRight,
  Database,
  Sliders,
} from 'lucide-react';

export default function ClientDemosPage() {
  const { actor, activeTenant } = usePersona();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  if (!actor.activeTenantId || !activeTenant) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <Building2 className="w-12 h-12 text-muted-foreground mx-auto" />
        <h1 className="text-2xl font-bold text-foreground">Select Active Workspace</h1>
        <p className="text-sm text-muted-foreground">
          Please select a client workspace to access organisation-entitled sandboxes.
        </p>
        <Link
          href="/choose-workspace"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 mt-2"
        >
          Select Workspace
        </Link>
      </div>
    );
  }

  let demos: any[] = [];
  try {
    demos = getClientDemos(actor);
  } catch (e) {
    demos = [];
  }

  const categories = ['all', 'Intelligence', 'Compliance', 'Banking', 'Lending'];

  const filteredDemos = demos.filter((demo) => {
    const matchesCategory =
      selectedCategory === 'all' || demo.category === selectedCategory;
    const matchesSearch =
      demo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      demo.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      demo.offeringName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
              {activeTenant.name}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground flex items-center gap-1.5 border border-border">
              <Database className="w-3 h-3 text-emerald-500" />
              <span>Synthetic Sandboxes</span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Entitled Product Sandboxes
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground max-w-2xl">
            Interactive, deterministic and AI-powered simulation engines provisioned strictly under your organisation's enterprise license.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/client/demos/runs"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card border border-border text-foreground text-xs font-semibold hover:bg-muted transition-all shadow-sm"
          >
            <History className="w-4 h-4 text-primary" />
            <span>View Previous Runs</span>
          </Link>
        </div>
      </div>

      {/* Mandatory Honesty Banner */}
      <div className="p-4 rounded-2xl bg-muted/40 border border-border/80 flex items-center gap-3 text-xs text-muted-foreground">
        <Info className="w-4 h-4 text-primary shrink-0" />
        <div className="flex-1 font-mono text-[11px] sm:text-xs">
          <span className="font-semibold text-foreground">HONESTY INVARIANT:</span> Sample data &bull; Simulated output &bull; Not an approved credit, compliance, or business decision.
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                selectedCategory === cat
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-card text-muted-foreground hover:text-foreground border border-border'
              }`}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search sandboxes or capabilities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      {/* Empty State */}
      {filteredDemos.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-card border border-dashed border-border max-w-xl mx-auto space-y-4">
          <ShieldAlert className="w-12 h-12 text-muted-foreground mx-auto" />
          <h2 className="text-lg font-bold text-foreground">No Sandboxes Found</h2>
          <p className="text-xs text-muted-foreground">
            {searchQuery
              ? `No sandboxes match "${searchQuery}". Try clearing search.`
              : `Your organisation (${activeTenant.name}) has no active entitlements matching this filter. Other tenants' environments are never shown.`}
          </p>
        </div>
      ) : (
        /* Demos Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredDemos.map((demo) => (
            <motion.div
              key={demo.id}
              whileHover={{ y: -3 }}
              transition={{ duration: 0.2 }}
              className="p-6 rounded-3xl bg-card border border-border flex flex-col justify-between hover:border-primary/40 transition-all shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                    {demo.category}
                  </span>
                  <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Entitled Module</span>
                  </span>
                </div>

                <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  {demo.offeringName}
                </div>
                <h2 className="text-xl font-bold text-foreground">{demo.name}</h2>
                <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                  {demo.description}
                </p>

                {/* Pre-configured Scenarios List */}
                <div className="mt-6 pt-5 border-t border-border/60">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Included Scenarios ({demo.scenarios.length})
                  </span>
                  <div className="mt-2.5 space-y-2">
                    {demo.scenarios.map((scen: any) => (
                      <div
                        key={scen.id}
                        className="p-2.5 rounded-xl bg-muted/40 border border-border/40 text-xs flex items-center justify-between gap-2"
                      >
                        <div className="truncate">
                          <span className="font-semibold text-foreground">{scen.title}</span>
                          <span className="text-[11px] text-muted-foreground block truncate">
                            {scen.description}
                          </span>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-muted text-muted-foreground shrink-0">
                          {scen.difficulty}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-6 mt-4 border-t border-border flex items-center justify-between">
                <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-primary" />
                  <span>Customizable Parameters</span>
                </div>

                <Link
                  href={`/client/demos/${demo.id}`}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all shadow-md shadow-primary/20"
                >
                  <PlayCircle className="w-4 h-4" />
                  <span>Launch Sandbox</span>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
