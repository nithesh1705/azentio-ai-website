'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { usePersona } from '@/context/PersonaContext';
import { getInternalReleaseById } from '@/server/dal/employee/releases';
import { getKnowledgeItems } from '@/server/dal/employee/knowledge';
import { getExperiments } from '@/server/dal/employee/experiments';
import { InternalReleaseNote, KnowledgeItem, Experiment } from '@/types';
import {
  Newspaper,
  ArrowLeft,
  Calendar,
  AlertTriangle,
  BookOpen,
  FlaskConical,
  MessageSquare,
  Send,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

export default function ReleaseDetailPage() {
  const { actor } = usePersona();
  const params = useParams();
  const releaseId = params?.id as string;

  const [release, setRelease] = useState<InternalReleaseNote | null>(null);
  const [relatedKnowledge, setRelatedKnowledge] = useState<KnowledgeItem[]>([]);
  const [relatedExperiments, setRelatedExperiments] = useState<Experiment[]>([]);
  const [comments, setComments] = useState<{ id: string; user: string; text: string; date: string }[]>([
    {
      id: 'rc-1',
      user: 'Priya Sharma',
      text: 'Verified the Fourier seasonality smoothing in testbed — works as advertised for cyclical SME cash flows.',
      date: new Date(Date.now() - 1000 * 60 * 60 * 12).toLocaleDateString(),
    },
  ]);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    if (!actor?.isVerifiedEmployee || !releaseId) return;
    try {
      const rel = getInternalReleaseById(actor, releaseId);
      if (rel) {
        setRelease(rel);

        // Fetch related knowledge articles
        try {
          const kbs = getKnowledgeItems(actor);
          setRelatedKnowledge(kbs.slice(0, 2));
        } catch {}

        // Fetch related experiments
        try {
          const exps = getExperiments(actor);
          setRelatedExperiments(exps.slice(0, 2));
        } catch {}
      }
    } catch (e) {
      console.error(e);
    }
  }, [actor, releaseId]);

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !actor) return;
    setComments([
      ...comments,
      {
        id: `rc-${Date.now()}`,
        user: actor.name,
        text: newComment,
        date: new Date().toLocaleDateString(),
      },
    ]);
    setNewComment('');
  };

  if (!actor?.isVerifiedEmployee) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold">Employee Access Required</h2>
      </div>
    );
  }

  if (!release) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <Newspaper className="w-12 h-12 text-muted-foreground mx-auto" />
        <h2 className="text-xl font-bold">Release Note Not Found</h2>
        <Link
          href="/employee/releases"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Releases</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Bar Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/employee/releases"
            className="p-2 rounded-xl border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground text-xs"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-primary">{release.version}</span>
              <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                {release.type}
              </span>
              <span className="text-xs text-muted-foreground">{release.offeringName}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground mt-0.5">{release.title}</h1>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span>Published on {new Date(release.date).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Main Grid: Release Notes (Left 2 cols) & Sidebar (Right col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Executive Summary */}
          <div className="rounded-3xl border border-border bg-card p-6 space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Executive Summary
            </h3>
            <p className="text-sm sm:text-base font-semibold text-foreground/90 leading-relaxed">
              {release.summary}
            </p>
          </div>

          {/* Full Notes Body */}
          <div className="rounded-3xl border border-border bg-card p-6 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Detailed Changelog & Technical Specifications
            </h3>
            <div className="prose prose-sm dark:prose-invert max-w-none text-xs sm:text-sm whitespace-pre-line font-mono bg-muted/20 p-5 rounded-2xl border border-border/60">
              {release.fullNotes}
            </div>
          </div>

          {/* Known Issues & Workarounds */}
          {release.knownIssues && release.knownIssues.length > 0 && (
            <div className="rounded-3xl border border-amber-500/20 bg-amber-500/5 p-6 space-y-3">
              <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                <AlertTriangle className="w-4 h-4" />
                <h4 className="text-xs font-bold uppercase tracking-wider">
                  Known Limitations & Operational Workarounds
                </h4>
              </div>
              <ul className="space-y-1.5 text-xs text-foreground/90">
                {release.knownIssues.map((issue, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-amber-500 font-bold">•</span>
                    <span>{issue}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Discussion Thread */}
          <div className="rounded-3xl border border-border bg-card p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-bold text-foreground">Rollout Discussion ({comments.length})</h3>
              </div>
            </div>

            <div className="space-y-3">
              {comments.map((comm) => (
                <div key={comm.id} className="p-3.5 rounded-2xl bg-muted/30 border border-border/60 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground">{comm.user}</span>
                    <span className="text-[10px] text-muted-foreground">{comm.date}</span>
                  </div>
                  <p className="text-foreground/90">{comm.text}</p>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddComment} className="pt-2 border-t border-border flex items-center gap-2">
              <input
                type="text"
                required
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Ask a rollout or deployment question..."
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

        {/* Right Sidebar: Related Knowledge & Experiments */}
        <div className="space-y-6">
          {/* Related Knowledge Articles */}
          <div className="rounded-3xl border border-border bg-card p-6 space-y-3 shadow-xs">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-amber-500" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                Related Knowledge Articles
              </h4>
            </div>

            <div className="space-y-2">
              {relatedKnowledge.map((kb) => (
                <Link
                  key={kb.id}
                  href={`/employee/knowledge/${kb.id}`}
                  className="block p-3 rounded-2xl bg-muted/30 hover:bg-muted/60 border border-border/60 transition-all text-xs group"
                >
                  <div className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                    {kb.title}
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">{kb.category}</div>
                </Link>
              ))}
            </div>
          </div>

          {/* Related Innovation Experiments */}
          <div className="rounded-3xl border border-border bg-card p-6 space-y-3 shadow-xs">
            <div className="flex items-center gap-2">
              <FlaskConical className="w-4 h-4 text-emerald-500" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                Underlying Experiments
              </h4>
            </div>

            <div className="space-y-2">
              {relatedExperiments.map((exp) => (
                <Link
                  key={exp.id}
                  href={`/employee/experiments/${exp.id}`}
                  className="block p-3 rounded-2xl bg-muted/30 hover:bg-muted/60 border border-border/60 transition-all text-xs group"
                >
                  <div className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                    {exp.title}
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">{exp.status.replace('_', ' ')}</div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
