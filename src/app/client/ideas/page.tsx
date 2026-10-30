'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { usePersona } from '@/context/PersonaContext';
import { getClientIdeas, ClientSafeIdea } from '@/server/dal/client/ideas';
import { getPublicOfferings } from '@/server/dal/store';
import {
  Lightbulb,
  CheckCircle2,
  Clock,
  ArrowRight,
  Filter,
  ShieldCheck,
  Building2,
  Sparkles,
  PlusCircle,
  HelpCircle,
  Activity,
  Layers,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { IdeaStatus } from '@/types';

export default function ClientIdeasPage() {
  const { actor, activeTenant } = usePersona();
  const offerings = getPublicOfferings();

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [offeringFilter, setOfferingFilter] = useState<string>('all');

  const ideas = getClientIdeas(actor, {
    status: statusFilter,
    offeringId: offeringFilter,
  });

  const getStatusBadge = (status: IdeaStatus) => {
    switch (status) {
      case 'Proposed':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-muted text-muted-foreground border border-border">
            Proposed
          </span>
        );
      case 'Under review':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            Under Review
          </span>
        );
      case 'Planned':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            Planned On Roadmap
          </span>
        );
      case 'In progress':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20 flex items-center gap-1">
            <Activity className="w-3 h-3 animate-pulse" />
            <span>In Engineering</span>
          </span>
        );
      case 'Released':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>Shipped to Production</span>
          </span>
        );
      case 'Not proceeding':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-muted text-muted-foreground line-through">
            Not Proceeding
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-muted text-muted-foreground">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
              Product Evolution Loop
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground flex items-center gap-1.5 border border-border">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Client-Safe Roadmap Projections</span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Improvement Ideas & Roadmap
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
            Transparent milestones demonstrating how market observations directly shape Azentio product development. Non-public engineering tickets and vendor costs are strictly sanitized.
          </p>
        </div>

        <Link
          href="/client/observations/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all shadow-md shadow-primary/20 self-start md:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Contribute Field Evidence</span>
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-3xl bg-card border border-border flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground ml-1 hidden sm:inline" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl bg-muted/60 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="all">All Roadmap Stages</option>
            <option value="Proposed">Proposed</option>
            <option value="Under review">Under Review</option>
            <option value="Planned">Planned</option>
            <option value="In progress">In Progress</option>
            <option value="Released">Released (Shipped)</option>
          </select>

          <select
            value={offeringFilter}
            onChange={(e) => setOfferingFilter(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl bg-muted/60 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="all">All Software Modules</option>
            {offerings.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </select>
        </div>

        <span className="text-xs font-mono text-muted-foreground px-2">
          {ideas.length} Roadmap Items
        </span>
      </div>

      {/* Ideas List */}
      {ideas.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-card border border-dashed border-border max-w-md mx-auto space-y-3">
          <Lightbulb className="w-10 h-10 text-muted-foreground mx-auto" />
          <h3 className="text-sm font-bold text-foreground">No Roadmap Items Found</h3>
          <p className="text-xs text-muted-foreground">
            No product initiatives currently match the selected filter.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {ideas.map((idea) => (
            <motion.div
              key={idea.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 sm:p-7 rounded-3xl bg-card border border-border hover:border-primary/30 transition-all shadow-sm space-y-5"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                      {idea.offeringName}
                    </span>
                    {getStatusBadge(idea.status)}
                    <span className="text-xs text-muted-foreground">
                      Owner: <strong className="text-foreground">{idea.ownerTeam}</strong>
                    </span>
                  </div>

                  <h2 className="text-lg sm:text-xl font-bold text-foreground">
                    {idea.title}
                  </h2>
                </div>

                <div className="text-xs font-mono text-muted-foreground shrink-0">
                  Updated: {formatDate(idea.lastUpdate)}
                </div>
              </div>

              {/* Problem & Proposed Outcome */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-muted/40 border border-border/40 space-y-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Originating Observation & Problem Statement
                  </span>
                  <p className="text-muted-foreground leading-relaxed">
                    {idea.problemStatement}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-muted/40 border border-border/40 space-y-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                    Target Solution & Outcome
                  </span>
                  <p className="text-foreground leading-relaxed font-medium">
                    {idea.proposedOutcome}
                  </p>
                </div>
              </div>

              {/* Status Milestones Stepper */}
              {idea.statusHistory && idea.statusHistory.length > 0 && (
                <div className="pt-2 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Milestone Progress
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {idea.statusHistory.map((h, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-xl bg-muted/30 border border-border/40 text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-foreground capitalize">
                            {h.status}
                          </span>
                          <span className="font-mono text-muted-foreground text-[10px]">
                            {formatDate(h.changedAt)}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-relaxed">
                          {h.note}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
