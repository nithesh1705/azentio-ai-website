'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { usePersona } from '@/context/PersonaContext';
import {
  getExperimentById,
  updateExperiment,
  transitionExperimentStatus,
  requestJoinExperiment,
  getExperimentComments,
  postExperimentComment,
  deleteExperimentComment,
} from '@/server/dal/employee/experiments';
import { getPlaygroundRuns } from '@/server/dal/employee/playground';
import { Experiment, ExperimentComment, PlaygroundRun } from '@/types';
import {
  FlaskConical,
  ArrowLeft,
  Users,
  Clock,
  Sparkles,
  ExternalLink,
  Plus,
  Trash2,
  CheckCircle2,
  MessageSquare,
  Send,
  UserPlus,
  Terminal,
  FileText,
  AlertCircle,
  Edit3,
  Check,
  ChevronRight,
} from 'lucide-react';

const STATUS_TRANSITIONS: Record<Experiment['status'], Experiment['status'][]> = {
  Draft: ['Submitted', 'Archived'],
  Submitted: ['In_Progress', 'Draft', 'Archived'],
  In_Progress: ['Completed', 'Archived'],
  Completed: ['In_Progress', 'Archived'],
  Archived: ['Draft'],
};

export default function ExperimentDetailPage() {
  const { actor } = usePersona();
  const params = useParams();
  const expId = params?.id as string;

  const [experiment, setExperiment] = useState<Experiment | null>(null);
  const [comments, setComments] = useState<ExperimentComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [allRuns, setAllRuns] = useState<PlaygroundRun[]>([]);

  // Join request modal state
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinReason, setJoinReason] = useState('');
  const [joinSuccess, setJoinSuccess] = useState(false);

  // Results editor state
  const [isEditingResults, setIsEditingResults] = useState(false);
  const [outcome, setOutcome] = useState('');
  const [metrics, setMetrics] = useState('');
  const [learnings, setLearnings] = useState('');

  const isOwner = actor?.userId === experiment?.ownerId || actor?.platformGrants?.includes('portal_admin');
  const isCollaborator = isOwner || (experiment?.collaboratorIds.includes(actor?.userId || '') ?? false);

  const loadData = () => {
    if (!actor?.isVerifiedEmployee || !expId) return;
    try {
      const exp = getExperimentById(actor, expId);
      if (exp) {
        setExperiment(exp);
        setOutcome(exp.results?.outcome || '');
        setMetrics(exp.results?.metrics || '');
        setLearnings(exp.results?.learnings || '');
      }
      const comms = getExperimentComments(actor, expId);
      setComments(comms);

      const runs = getPlaygroundRuns(actor);
      setAllRuns(runs);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, [actor, expId]);

  const handleStatusTransition = (newStatus: Experiment['status']) => {
    if (!actor || !experiment) return;
    try {
      const updated = transitionExperimentStatus(actor, experiment.id, newStatus);
      setExperiment(updated);
    } catch (err: any) {
      alert(err.message || 'Failed to update status');
    }
  };

  const handleSaveResults = (e: React.FormEvent) => {
    e.preventDefault();
    if (!actor || !experiment) return;
    try {
      const updated = updateExperiment(actor, experiment.id, {
        results: { outcome, metrics, learnings },
      });
      setExperiment(updated);
      setIsEditingResults(false);
    } catch (err: any) {
      alert(err.message || 'Failed to save results');
    }
  };

  const handleRequestJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!actor || !experiment || !joinReason.trim()) return;
    try {
      requestJoinExperiment(actor, experiment.id, joinReason);
      setJoinSuccess(true);
      setTimeout(() => {
        setShowJoinModal(false);
        setJoinSuccess(false);
        setJoinReason('');
      }, 1500);
    } catch (err: any) {
      alert(err.message || 'Failed to submit request');
    }
  };

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!actor || !experiment || !newComment.trim()) return;
    try {
      postExperimentComment(actor, experiment.id, newComment);
      setNewComment('');
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to post comment');
    }
  };

  const handleDeleteComment = (commentId: string) => {
    if (!actor) return;
    if (confirm('Delete this comment?')) {
      try {
        deleteExperimentComment(actor, commentId);
        loadData();
      } catch (err: any) {
        alert(err.message || 'Failed to delete');
      }
    }
  };

  if (!actor?.isVerifiedEmployee) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold">Employee Access Required</h2>
      </div>
    );
  }

  if (!experiment) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <FlaskConical className="w-12 h-12 text-muted-foreground mx-auto" />
        <h2 className="text-xl font-bold">Experiment Not Found</h2>
        <Link
          href="/employee/experiments"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Experiments</span>
        </Link>
      </div>
    );
  }

  const validTransitions = STATUS_TRANSITIONS[experiment.status] || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Bar Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/employee/experiments"
            className="p-2 rounded-xl border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground text-xs"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-primary">{experiment.id}</span>
              <span
                className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full ${
                  experiment.status === 'Completed'
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                    : experiment.status === 'In_Progress'
                    ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                    : experiment.status === 'Submitted'
                    ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {experiment.status.replace('_', ' ')}
              </span>
              <span className="text-[10px] font-mono text-muted-foreground">
                {experiment.offeringName}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground mt-0.5">{experiment.title}</h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Status Transitions (Owner Only) */}
          {isOwner && validTransitions.length > 0 && (
            <div className="flex items-center gap-1.5 bg-card border border-border p-1 rounded-xl">
              <span className="text-[11px] text-muted-foreground px-2">Transition:</span>
              {validTransitions.map((st) => (
                <button
                  key={st}
                  onClick={() => handleStatusTransition(st)}
                  className="px-2.5 py-1 rounded-lg bg-muted hover:bg-primary hover:text-primary-foreground text-[11px] font-semibold transition-all"
                >
                  {st.replace('_', ' ')}
                </button>
              ))}
            </div>
          )}

          {/* Join Request Button for non-collaborators */}
          {!isCollaborator && (
            <button
              onClick={() => setShowJoinModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 shadow-xs"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Request to Join</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Details (Left 2 cols) & Sidebar (Right col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Hypothesis Hero Card */}
          <div className="rounded-3xl border border-primary/20 bg-primary/5 p-6 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              Core Hypothesis
            </span>
            <p className="text-sm sm:text-base font-semibold text-foreground leading-relaxed">
              "{experiment.hypothesis}"
            </p>
          </div>

          {/* Background & Approach */}
          <div className="rounded-3xl border border-border bg-card p-6 space-y-6">
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Problem Background & Motivation
              </h3>
              <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed">
                {experiment.description || 'No background description specified.'}
              </p>
            </div>

            <div className="space-y-2 pt-4 border-t border-border">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Proposed Method & Experimental Approach
              </h3>
              <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed">
                {experiment.approach || 'No explicit approach steps listed.'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-border">
              <div className="space-y-1">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Expected Outcome
                </h4>
                <p className="text-xs text-foreground/90">{experiment.expectedOutcome || '—'}</p>
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Measurable Success Metric
                </h4>
                <p className="text-xs text-foreground/90">{experiment.successMetric || '—'}</p>
              </div>
            </div>
          </div>

          {/* Results Section */}
          <div className="rounded-3xl border border-border bg-card p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-500" />
                <h3 className="text-sm font-bold text-foreground">Experimental Results & Learnings</h3>
              </div>
              {isOwner && (
                <button
                  onClick={() => setIsEditingResults(!isEditingResults)}
                  className="flex items-center gap-1 text-xs text-primary font-semibold hover:underline"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>{isEditingResults ? 'Cancel' : 'Edit Results'}</span>
                </button>
              )}
            </div>

            {isEditingResults ? (
              <form onSubmit={handleSaveResults} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Observed Outcome</label>
                  <textarea
                    rows={2}
                    value={outcome}
                    onChange={(e) => setOutcome(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-input bg-background text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Recorded Metrics</label>
                  <textarea
                    rows={2}
                    value={metrics}
                    onChange={(e) => setMetrics(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-input bg-background text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Learnings & Recommendations</label>
                  <textarea
                    rows={2}
                    value={learnings}
                    onChange={(e) => setLearnings(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-input bg-background text-xs"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold"
                  >
                    Save Results
                  </button>
                </div>
              </form>
            ) : experiment.results ? (
              <div className="space-y-3">
                <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/60">
                  <span className="text-[11px] font-bold text-foreground">Outcome: </span>
                  <span className="text-xs text-muted-foreground">{experiment.results.outcome}</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/60">
                  <span className="text-[11px] font-bold text-foreground">Metrics: </span>
                  <span className="text-xs text-muted-foreground">{experiment.results.metrics}</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/60">
                  <span className="text-[11px] font-bold text-foreground">Learnings: </span>
                  <span className="text-xs text-muted-foreground">{experiment.results.learnings}</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground py-4 text-center">
                No results logged yet. Results can be added when the experiment is In Progress or Completed.
              </p>
            )}
          </div>

          {/* Linked Playground Runs */}
          <div className="rounded-3xl border border-border bg-card p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-bold text-foreground">Linked Playground Runs</h3>
              </div>
            </div>

            {experiment.linkedPlaygroundRunIds && experiment.linkedPlaygroundRunIds.length > 0 ? (
              <div className="space-y-2">
                {experiment.linkedPlaygroundRunIds.map((runId) => {
                  const runObj = allRuns.find((r) => r.id === runId);
                  return (
                    <Link
                      key={runId}
                      href={`/employee/playground/${runId}`}
                      className="flex items-center justify-between p-3 rounded-2xl bg-muted/30 hover:bg-muted/60 border border-border/60 transition-all text-xs group"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-primary">{runId}</span>
                        <span className="text-muted-foreground">
                          {runObj?.scenarioTitle || 'Simulation Run'}
                        </span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground py-4 text-center">
                No playground simulation runs linked to this experiment yet.
              </p>
            )}
          </div>
        </div>

        {/* Right Sidebar: Metadata, Collaborators & Comments */}
        <div className="space-y-6">
          {/* Metadata Card */}
          <div className="rounded-3xl border border-border bg-card p-6 space-y-4 shadow-xs">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Experiment Info
            </h4>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Principal Owner:</span>
                <span className="font-semibold text-foreground">{experiment.ownerName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Registered:</span>
                <span className="font-mono">{new Date(experiment.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Last Updated:</span>
                <span className="font-mono">{new Date(experiment.updatedAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Visibility:</span>
                <span className="text-emerald-600 font-semibold">Employee Only</span>
              </div>
            </div>

            <div className="pt-3 border-t border-border">
              <div className="text-xs font-semibold text-muted-foreground mb-1.5">Tags:</div>
              <div className="flex flex-wrap gap-1.5">
                {experiment.tags.map((t) => (
                  <span
                    key={t}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            </div>

            {experiment.links && experiment.links.length > 0 && (
              <div className="pt-3 border-t border-border">
                <div className="text-xs font-semibold text-muted-foreground mb-1.5">External Links:</div>
                <div className="space-y-1">
                  {experiment.links.map((link, idx) => (
                    <a
                      key={idx}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs text-primary hover:underline"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>{link.title}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Collaborators List */}
          <div className="rounded-3xl border border-border bg-card p-6 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Collaborators ({experiment.collaboratorIds.length + 1})
              </h4>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 p-2 rounded-xl bg-primary/5 border border-primary/20">
                <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-[10px]">
                  {experiment.ownerName[0]}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-foreground">{experiment.ownerName}</div>
                  <div className="text-[10px] text-muted-foreground">Lead Researcher</div>
                </div>
              </div>

              {experiment.collaboratorIds.map((cid) => (
                <div key={cid} className="flex items-center gap-2 p-2 rounded-xl bg-muted/30">
                  <div className="w-6 h-6 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center font-bold text-[10px]">
                    C
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-foreground">{cid}</div>
                    <div className="text-[10px] text-muted-foreground">Collaborator</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Comments Thread */}
          <div className="rounded-3xl border border-border bg-card p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-primary" />
                <h4 className="text-sm font-bold text-foreground">Discussion ({comments.length})</h4>
              </div>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {comments.length === 0 ? (
                <p className="text-xs text-muted-foreground py-6 text-center">No comments yet.</p>
              ) : (
                comments.map((comm) => (
                  <div key={comm.id} className="p-3 rounded-2xl bg-muted/30 border border-border/60 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-foreground">{comm.userName}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(comm.createdAt).toLocaleDateString()}
                        </span>
                        {comm.userId === actor.userId && (
                          <button
                            onClick={() => handleDeleteComment(comm.id)}
                            className="text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-foreground/90">{comm.body}</p>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handlePostComment} className="pt-2 border-t border-border flex items-center gap-2">
              <input
                type="text"
                required
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add research note..."
                className="flex-1 px-3 py-2 rounded-xl border border-input bg-background text-xs outline-none"
              />
              <button
                type="submit"
                className="p-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Join Request Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-card border border-border rounded-3xl p-6 shadow-xl space-y-4"
          >
            <h3 className="text-base font-bold text-foreground">Request to Collaborate</h3>
            <p className="text-xs text-muted-foreground">
              Send a request to {experiment.ownerName} explaining your domain expertise or how you'd like to contribute.
            </p>

            {joinSuccess ? (
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Request sent successfully!</span>
              </div>
            ) : (
              <form onSubmit={handleRequestJoin} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Reason / Contribution Area</label>
                  <textarea
                    required
                    rows={3}
                    value={joinReason}
                    onChange={(e) => setJoinReason(e.target.value)}
                    placeholder="e.g. I have experience backtesting SME cash flow models on Malaysian banking datasets..."
                    className="w-full px-3 py-2 rounded-xl border border-input bg-background text-xs"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowJoinModal(false)}
                    className="px-4 py-2 rounded-xl border border-border text-xs font-semibold hover:bg-muted"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold"
                  >
                    Submit Request
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}
