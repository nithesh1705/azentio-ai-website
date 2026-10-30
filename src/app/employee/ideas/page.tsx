'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { usePersona } from '@/context/PersonaContext';
import { getEmployeeIdeas, transitionIdeaStatus } from '@/server/dal/employee/ideas';
import { getPlaygroundOfferings } from '@/server/dal/employee/playground';
import { ImprovementIdea, IdeaStatus, Offering } from '@/types';
import {
  Lightbulb,
  ShieldAlert,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ChevronRight,
  ExternalLink,
  Layers,
  Sparkles,
  Lock,
  X,
  ArrowRight,
  Calendar,
} from 'lucide-react';

const COLUMNS: IdeaStatus[] = [
  'Proposed',
  'Under review',
  'Planned',
  'In progress',
  'Released',
];

export default function EmployeeIdeasPage() {
  const { actor } = usePersona();
  const [ideas, setIdeas] = useState<ImprovementIdea[]>([]);
  const [offerings, setOfferings] = useState<Offering[]>([]);
  const [selectedOffering, setSelectedOffering] = useState<string>('all');
  const [selectedIdea, setSelectedIdea] = useState<ImprovementIdea | null>(null);

  const isProductOwner =
    actor?.platformGrants?.includes('product_owner') ||
    actor?.platformGrants?.includes('portal_admin');

  const loadData = () => {
    if (!actor?.isVerifiedEmployee) return;
    try {
      const allIdeas = getEmployeeIdeas(actor, selectedOffering);
      setIdeas(allIdeas);
      const offs = getPlaygroundOfferings(actor);
      setOfferings(offs);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, [actor, selectedOffering]);

  const handleTransition = (ideaId: string, newStatus: IdeaStatus) => {
    if (!actor || !isProductOwner) return;
    try {
      const updated = transitionIdeaStatus(actor, ideaId, newStatus, 'Transitioned by Product Owner');
      setIdeas(ideas.map((i) => (i.id === ideaId ? updated : i)));
      if (selectedIdea?.id === ideaId) {
        setSelectedIdea(updated);
      }
    } catch (err: any) {
      alert(err.message || 'Unauthorized');
    }
  };

  if (!actor?.isVerifiedEmployee) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold">Employee Access Required</h2>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
              Product Roadmapping & Innovation
            </span>
            <span className="text-xs text-muted-foreground font-mono">Governed Backlog</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Product Owner Ideas Backlog
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Synthesizing anonymized collective-learning themes into governed enterprise software enhancements.
          </p>
        </div>

        {/* Offering filter */}
        <div className="flex items-center gap-2">
          <select
            value={selectedOffering}
            onChange={(e) => setSelectedOffering(e.target.value)}
            className="px-3 py-2 rounded-xl border border-input bg-card text-xs text-foreground outline-none shadow-xs"
          >
            <option value="all">All Offerings</option>
            {offerings.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Mandatory Read-Only Banner for Ordinary Employees */}
      {!isProductOwner && (
        <div className="p-4 rounded-2xl bg-muted/60 border border-border flex items-center gap-3 text-xs sm:text-sm text-muted-foreground">
          <Lock className="w-5 h-5 text-muted-foreground shrink-0" />
          <span>
            You are viewing the ideas backlog as an employee. Editing and status transitions require the{' '}
            <strong className="text-foreground">product_owner</strong> grant.
          </span>
        </div>
      )}

      {/* Kanban Board Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 overflow-x-auto pb-4">
        {COLUMNS.map((col) => {
          const colIdeas = ideas.filter((i) => i.status === col);
          return (
            <div
              key={col}
              className="bg-muted/20 border border-border/80 rounded-3xl p-4 flex flex-col justify-between min-h-[460px] space-y-3"
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-border/60">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                    {col}
                  </h3>
                  <span className="w-5 h-5 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center text-[10px] font-bold">
                    {colIdeas.length}
                  </span>
                </div>

                <div className="space-y-3 pt-3">
                  {colIdeas.map((idea) => {
                    const priorityColor =
                      idea.priority === 'Critical'
                        ? 'text-rose-600 bg-rose-500/10'
                        : idea.priority === 'High'
                        ? 'text-amber-600 bg-amber-500/10'
                        : 'text-blue-600 bg-blue-500/10';

                    return (
                      <div
                        key={idea.id}
                        onClick={() => setSelectedIdea(idea)}
                        className="cursor-pointer p-4 rounded-2xl bg-card border border-border hover:border-primary/40 shadow-xs hover:shadow-sm transition-all space-y-2 group"
                      >
                        <div className="flex items-center justify-between">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${priorityColor}`}>
                            {idea.priority}
                          </span>
                          <span className="text-[10px] font-mono text-muted-foreground">
                            {idea.supportingContributionRefs.length} Themes
                          </span>
                        </div>

                        <h4 className="text-xs font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                          {idea.title}
                        </h4>

                        <p className="text-[11px] text-muted-foreground line-clamp-2">
                          {idea.problemStatement}
                        </p>

                        <div className="text-[10px] text-muted-foreground pt-1 flex items-center justify-between border-t border-border/40">
                          <span className="truncate">{idea.ownerTeam}</span>
                          <span>{new Date(idea.lastUpdate).toLocaleDateString()}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail Modal / Sheet */}
      {selectedIdea && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-2xl bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-amber-500" />
                <span className="text-xs font-mono font-bold text-primary">{selectedIdea.id}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                  {selectedIdea.status}
                </span>
              </div>
              <button
                onClick={() => setSelectedIdea(null)}
                className="p-1 rounded-xl text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <h2 className="text-xl font-bold text-foreground">{selectedIdea.title}</h2>
              <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                <span>Owner: <strong>{selectedIdea.ownerTeam}</strong></span>
                <span>•</span>
                <span>Priority: <strong>{selectedIdea.priority}</strong></span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Problem Statement
              </h4>
              <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed">
                {selectedIdea.problemStatement}
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Proposed Product Outcome
              </h4>
              <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed">
                {selectedIdea.proposedOutcome}
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Client Visible Summary
              </h4>
              <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/60 text-xs text-foreground/90">
                {selectedIdea.clientVisibleSummary}
              </div>
            </div>

            {/* Status History */}
            <div className="space-y-2 pt-2 border-t border-border">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Audited Transition History
              </h4>
              <div className="space-y-2">
                {selectedIdea.statusHistory.map((h, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-muted/20 text-xs flex items-center justify-between">
                    <div>
                      <strong className="text-foreground">{h.status}: </strong>
                      <span className="text-muted-foreground">{h.note} ({h.changedBy})</span>
                    </div>
                    <span className="text-[10px] font-mono text-muted-foreground">
                      {new Date(h.changedAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Product Owner Transition Buttons */}
            {isProductOwner && (
              <div className="pt-4 border-t border-border space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Product Owner Actions:
                </span>
                <div className="flex flex-wrap gap-2">
                  {COLUMNS.filter((c) => c !== selectedIdea.status).map((st) => (
                    <button
                      key={st}
                      onClick={() => handleTransition(selectedIdea.id, st)}
                      className="px-3 py-1.5 rounded-xl bg-muted hover:bg-primary hover:text-primary-foreground text-xs font-semibold transition-all"
                    >
                      Move to {st}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}
