'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { usePersona } from '@/context/PersonaContext';
import { getImprovementIdeas } from '@/server/dal/store';
import {
  TrendingUp,
  Cpu,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Users,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { ImprovementIdea } from '@/types';

export default function ClientIdeasPage() {
  const { actor } = usePersona();
  const ideas = getImprovementIdeas(actor);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="max-w-3xl mb-10">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs uppercase tracking-widest font-bold text-primary">
            Continuous Improvement Loop
          </span>
          <span className="badge-synthetic text-xs">Azentio Engineering</span>
        </div>
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
          Product Evolution & Status
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
          How your market observations directly influence Azentio product development. We close the loop with transparent, plain-language milestones without disclosing private client tickets or confidential roadmaps.
        </p>
      </div>

      <div className="space-y-6">
        {ideas.map((idea) => (
          <motion.div
            key={idea.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-8 rounded-3xl glass-panel border border-border glow-card space-y-5"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-primary/10 text-primary border border-primary/20">
                    {idea.offeringName}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Owner: <span className="font-semibold text-foreground">{idea.ownerTeam}</span>
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-foreground">{idea.title}</h2>
              </div>

              {/* Status Badge */}
              <IdeaStatusBadge status={idea.status} />
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Client-Visible Progress Update
              </span>
              <p className="mt-1.5 text-sm text-foreground leading-relaxed">
                {idea.clientVisibleSummary}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-muted/40 border border-border/80 text-xs space-y-2">
              <span className="font-bold text-foreground">Target Problem Statement:</span>
              <p className="text-muted-foreground leading-relaxed">{idea.problemStatement}</p>
            </div>

            <div className="pt-4 border-t border-border flex flex-wrap items-center justify-between gap-4 text-xs">
              <span className="text-muted-foreground">
                Last updated {formatDate(idea.lastUpdate)} &bull; Supported by {idea.supportingContributionRefs.length} approved collective observations
              </span>

              <p className="text-[11px] text-muted-foreground italic flex items-center gap-1">
                <AlertCircle className="w-3 h-3 text-amber-500 shrink-0" />
                <span>&ldquo;Under review&rdquo; denotes exploratory quantitative analysis, not an approved delivery commitment.</span>
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function IdeaStatusBadge({ status }: { status: ImprovementIdea['status'] }) {
  const styles: Record<ImprovementIdea['status'], string> = {
    Proposed: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    'Under review': 'bg-amber-500/10 text-amber-500 border-amber-500/30 font-bold',
    Planned: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    'In progress': 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    Released: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-bold',
    'Not proceeding': 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold border ${
        styles[status] || styles.Proposed
      }`}
    >
      Status: {status}
    </span>
  );
}

