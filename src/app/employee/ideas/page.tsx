'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { usePersona } from '@/context/PersonaContext';
import { getImprovementIdeas, updateIdeaStatus } from '@/server/dal/store';
import {
  Lightbulb,
  CheckCircle2,
  Clock,
  History,
  TrendingUp,
  Cpu,
  ChevronLeft,
  ShieldCheck,
  Building2,
  ArrowRight,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { ImprovementIdea, IdeaStatus } from '@/types';

export default function EmployeeIdeasManagementPage() {
  const { actor } = usePersona();
  const [ideas, setIdeas] = useState<ImprovementIdea[]>(getImprovementIdeas(actor));
  const [selectedIdea, setSelectedIdea] = useState<ImprovementIdea | null>(ideas[0] || null);
  const [newStatus, setNewStatus] = useState<IdeaStatus>('Planned');
  const [transitionNote, setTransitionNote] = useState('');
  const [updateSuccess, setUpdateSuccess] = useState<string | null>(null);

  const canManage =
    actor.platformGrants.includes('product_owner') ||
    actor.platformGrants.includes('portal_admin');

  if (!actor.isVerifiedEmployee) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <ShieldCheck className="w-12 h-12 text-destructive mx-auto" />
        <h1 className="text-2xl font-bold text-foreground">Employee Access Restricted</h1>
        <p className="text-sm text-muted-foreground">
          Ideas management is restricted to verified employees.
        </p>
      </div>
    );
  }

  const handleUpdateStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIdea || !transitionNote.trim()) return;

    try {
      const updated = updateIdeaStatus(actor, selectedIdea.id, newStatus, transitionNote);
      setIdeas(getImprovementIdeas(actor));
      setSelectedIdea(updated);
      setUpdateSuccess(`Status transitioned to "${newStatus}" and audited.`);
      setTransitionNote('');
    } catch (err: any) {
      alert(err.message || 'Status transition failed');
    }
  };

  const statusOptions: IdeaStatus[] = [
    'Proposed',
    'Under review',
    'Planned',
    'In progress',
    'Released',
    'Not proceeding',
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

      <div className="max-w-3xl mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs uppercase tracking-widest font-bold text-primary">
            Product Owner Dashboard
          </span>
          <span className="badge-synthetic text-xs">Governed Lifecycle</span>
        </div>
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
          Improvement Loop & Evidence Tracking
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
          Product Owners connect recurrent collective-learning themes to governed engineering initiatives. Every status milestone is audited in append-only logs.
        </p>
      </div>

      <AnimatePresence>
        {updateSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>{updateSuccess}</span>
            </div>
            <button
              onClick={() => setUpdateSuccess(null)}
              className="font-bold hover:underline"
            >
              Dismiss
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Ideas List */}
        <div className="lg:col-span-6 space-y-4">
          <h2 className="font-bold text-base text-foreground mb-4">
            Active Improvement Initiatives ({ideas.length})
          </h2>

          {ideas.map((idea) => (
            <div
              key={idea.id}
              onClick={() => setSelectedIdea(idea)}
              className={`p-6 rounded-3xl glass-panel border cursor-pointer transition-all ${
                selectedIdea?.id === idea.id
                  ? 'border-primary ring-1 ring-primary shadow-lg'
                  : 'border-border hover:border-primary/40'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
                  {idea.offeringName}
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-muted text-foreground">
                  {idea.status}
                </span>
              </div>
              <h3 className="font-bold text-base text-foreground">{idea.title}</h3>
              <p className="mt-2 text-xs text-muted-foreground line-clamp-2">
                {idea.problemStatement}
              </p>
              <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
                <span>Owner: {idea.ownerTeam}</span>
                <span>Supported by {idea.supportingContributionRefs.length} shared priors</span>
              </div>
            </div>
          ))}
        </div>

        {/* Right: Idea Status Management & Audit History */}
        {selectedIdea && (
          <div className="lg:col-span-6 space-y-6">
            <div className="p-6 rounded-3xl glass-panel border border-border space-y-6">
              <div>
                <span className="text-[10px] uppercase font-bold text-primary">
                  Status Transition Console
                </span>
                <h3 className="text-xl font-bold text-foreground mt-1">
                  {selectedIdea.title}
                </h3>
              </div>

              {canManage ? (
                <form onSubmit={handleUpdateStatus} className="space-y-4 p-4 rounded-2xl bg-muted/40 border border-border">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-foreground mb-1">
                        Current Status
                      </label>
                      <span className="inline-block px-3 py-1 rounded-xl bg-card border border-border text-xs font-bold text-primary">
                        {selectedIdea.status}
                      </span>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-foreground mb-1">
                        Transition To
                      </label>
                      <select
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value as any)}
                        className="w-full bg-card border border-border rounded-xl px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      >
                        {statusOptions.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      Audit Note & Justification <span className="text-destructive">*</span>
                    </label>
                    <textarea
                      rows={2}
                      required
                      value={transitionNote}
                      onChange={(e) => setTransitionNote(e.target.value)}
                      placeholder="e.g. Risk modeling team completed validation; moving to Planned for Q2 release..."
                      className="w-full bg-card border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs hover:bg-primary/90 transition-all shadow-sm"
                  >
                    Commit Status Transition (Audited)
                  </button>
                </form>
              ) : (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-300">
                  You are viewing as an Employee without the Product Owner assignment grant. Status transitions are disabled. Use the persona switcher to select Product Owner (Tariq Al-Mansoor).
                </div>
              )}

              {/* Status Audit History */}
              <div className="space-y-3 pt-4 border-t border-border">
                <span className="font-bold text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5 text-primary" />
                  <span>Audited Status History:</span>
                </span>

                <div className="space-y-3">
                  {selectedIdea.statusHistory.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-muted/30 border border-border text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-foreground">{item.status}</span>
                        <span className="text-[10px] text-muted-foreground">
                          {formatDate(item.changedAt)}
                        </span>
                      </div>
                      <p className="text-muted-foreground text-[11px]">{item.note}</p>
                      <div className="text-[10px] text-muted-foreground font-mono">
                        By: {item.changedBy}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

