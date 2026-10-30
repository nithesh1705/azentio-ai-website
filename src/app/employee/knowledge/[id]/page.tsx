'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { usePersona } from '@/context/PersonaContext';
import {
  getKnowledgeItemById,
  markKnowledgeReviewed,
  reassignKnowledgeOwner,
  submitKnowledgeFeedback,
  getKnowledgeVersions,
} from '@/server/dal/employee/knowledge';
import { KnowledgeItem, KnowledgeVersion } from '@/types';
import {
  BookOpen,
  ArrowLeft,
  Calendar,
  Clock,
  User,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  ThumbsUp,
  ThumbsDown,
  History,
  UserCheck,
  Send,
  ShieldCheck,
  ChevronRight,
  List,
} from 'lucide-react';

export default function KnowledgeDetailPage() {
  const { actor } = usePersona();
  const params = useParams();
  const docId = params?.id as string;

  const [item, setItem] = useState<KnowledgeItem | null>(null);
  const [versions, setVersions] = useState<KnowledgeVersion[]>([]);
  const [feedbackSent, setFeedbackSent] = useState<boolean>(false);
  const [feedbackComment, setFeedbackComment] = useState<string>('');
  const [showTransferModal, setShowTransferModal] = useState<boolean>(false);
  const [newOwnerEmail, setNewOwnerEmail] = useState<string>('priya.sharma@azentio.com');

  const isOwner = actor?.userId === item?.ownerId || actor?.platformGrants?.includes('portal_admin');
  const isPublisher = actor?.platformGrants?.includes('content_publisher') || isOwner;

  const loadData = () => {
    if (!actor?.isVerifiedEmployee || !docId) return;
    try {
      const found = getKnowledgeItemById(actor, docId);
      if (found) setItem(found);

      const pastVersions = getKnowledgeVersions(actor, docId);
      setVersions(pastVersions);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, [actor, docId]);

  const handleMarkReviewed = () => {
    if (!actor || !item) return;
    try {
      const updated = markKnowledgeReviewed(actor, item.id);
      setItem({ ...updated });
      alert('Document marked as reviewed. Next review date updated.');
    } catch (err: any) {
      alert(err.message || 'Failed to mark as reviewed');
    }
  };

  const handleTransferOwnership = (e: React.FormEvent) => {
    e.preventDefault();
    if (!actor || !item) return;
    try {
      const updated = reassignKnowledgeOwner(
        actor,
        item.id,
        'usr-employee-2',
        newOwnerEmail.split('@')[0].replace('.', ' ').toUpperCase()
      );
      setItem({ ...updated });
      setShowTransferModal(false);
      alert('Ownership successfully transferred.');
    } catch (err: any) {
      alert(err.message || 'Failed to transfer ownership');
    }
  };

  const handleFeedback = (type: 'useful' | 'outdated' | 'wrong') => {
    if (!actor || !item) return;
    try {
      submitKnowledgeFeedback(actor, {
        knowledgeId: item.id,
        feedbackType: type,
        comment: feedbackComment || undefined,
      });
      setFeedbackSent(true);
      if (type === 'useful') {
        setItem({ ...item, usefulnessScore: item.usefulnessScore + 1 });
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (!actor?.isVerifiedEmployee) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold">Employee Access Required</h2>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <BookOpen className="w-12 h-12 text-muted-foreground mx-auto" />
        <h2 className="text-xl font-bold">Document Not Found</h2>
        <Link
          href="/employee/knowledge"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Knowledge Library</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Review Warning Banner (if due soon or overdue) */}
      {item.reviewStatus !== 'current' && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs sm:text-sm font-semibold flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
            <div>
              <span>
                {item.reviewStatus === 'overdue'
                  ? 'Mandatory review overdue! Technical guidelines must be verified for operational accuracy.'
                  : 'Mandatory review due within 14 days.'}
              </span>
              <span className="block text-[11px] font-normal text-muted-foreground">
                Next Review Target: {new Date(item.nextReviewDate).toLocaleDateString()}
              </span>
            </div>
          </div>

          {isPublisher && (
            <button
              onClick={handleMarkReviewed}
              className="px-4 py-2 rounded-xl bg-amber-600 text-white hover:bg-amber-500 text-xs font-bold shrink-0 transition-all shadow-xs"
            >
              Mark as Reviewed
            </button>
          )}
        </div>
      )}

      {/* Top Bar Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/employee/knowledge"
            className="p-2 rounded-xl border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground text-xs"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-amber-500">{item.id}</span>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground">
                {item.category}
              </span>
              <span className="text-[10px] font-mono text-muted-foreground">v{item.version}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground mt-0.5">{item.title}</h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {isOwner && (
            <button
              onClick={() => setShowTransferModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border bg-card hover:bg-muted text-xs font-semibold"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Transfer Ownership</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Markdown Document (Left 2 cols) & Metadata/Sidebar (Right col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Rendered Document Body */}
          <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="prose prose-sm dark:prose-invert max-w-none text-xs sm:text-sm whitespace-pre-line leading-relaxed">
              {item.body}
            </div>
          </div>

          {/* Feedback Form: Was this helpful? */}
          <div className="rounded-3xl border border-border bg-card p-6 space-y-4 shadow-xs">
            <h4 className="text-sm font-bold text-foreground">Was this documentation helpful?</h4>

            {feedbackSent ? (
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Thank you for your feedback! Stored for documentation maintainers.</span>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => handleFeedback('useful')}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-border bg-muted/40 hover:bg-emerald-500/10 hover:text-emerald-600 text-xs font-semibold"
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>Yes, Useful</span>
                  </button>
                  <button
                    onClick={() => handleFeedback('outdated')}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-border bg-muted/40 hover:bg-amber-500/10 hover:text-amber-600 text-xs font-semibold"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Needs Updating</span>
                  </button>
                  <button
                    onClick={() => handleFeedback('wrong')}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-border bg-muted/40 hover:bg-rose-500/10 hover:text-rose-600 text-xs font-semibold"
                  >
                    <ThumbsDown className="w-3.5 h-3.5" />
                    <span>Inaccurate</span>
                  </button>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    placeholder="Optional feedback note (e.g. Broken link or missing step)..."
                    value={feedbackComment}
                    onChange={(e) => setFeedbackComment(e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-xl border border-input bg-background text-xs outline-none"
                  />
                  <button
                    onClick={() => handleFeedback('useful')}
                    className="px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold"
                  >
                    Submit
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar: Document Governance & History */}
        <div className="space-y-6">
          {/* Governance Card */}
          <div className="rounded-3xl border border-border bg-card p-6 space-y-4 shadow-xs">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Document Governance
            </h4>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Current Owner:</span>
                <span className="font-semibold text-foreground">{item.ownerName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Last Reviewed:</span>
                <span className="font-mono">{new Date(item.lastReviewedAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Next Review Due:</span>
                <span className="font-mono font-bold text-foreground">
                  {new Date(item.nextReviewDate).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Cadence:</span>
                <span>Every {item.reviewIntervalDays} Days</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Helpfulness:</span>
                <span className="text-emerald-600 font-bold">+{item.usefulnessScore}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-border">
              <div className="text-xs font-semibold text-muted-foreground mb-1.5">Tags:</div>
              <div className="flex flex-wrap gap-1.5">
                {item.tags.map((t) => (
                  <span
                    key={t}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Past Version History */}
          <div className="rounded-3xl border border-border bg-card p-6 space-y-3 shadow-xs">
            <div className="flex items-center gap-2 pb-2 border-b border-border">
              <History className="w-4 h-4 text-primary" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                Revision History
              </h4>
            </div>

            <div className="space-y-2.5 text-xs">
              {versions.map((ver) => (
                <div key={ver.id} className="p-3 rounded-2xl bg-muted/30 border border-border/60 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-primary text-[11px]">v{ver.version}</span>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(ver.changedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="font-medium text-foreground">{ver.changeSummary}</div>
                  <div className="text-[10px] text-muted-foreground">Edited by: {ver.changedBy}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Transfer Ownership Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-card border border-border rounded-3xl p-6 shadow-xl space-y-4"
          >
            <h3 className="text-base font-bold text-foreground">Reassign Document Ownership</h3>
            <p className="text-xs text-muted-foreground">
              Transfer governance and review responsibility for "{item.title}" to another employee.
            </p>

            <form onSubmit={handleTransferOwnership} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">New Owner Work Email</label>
                <input
                  required
                  type="email"
                  value={newOwnerEmail}
                  onChange={(e) => setNewOwnerEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-input bg-background text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowTransferModal(false)}
                  className="px-4 py-2 rounded-xl border border-border text-xs font-semibold hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold"
                >
                  Confirm Transfer
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
