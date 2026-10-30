'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { usePersona } from '@/context/PersonaContext';
import { createKnowledgeItem } from '@/server/dal/employee/knowledge';
import {
  BookOpen,
  ArrowLeft,
  Send,
  Eye,
  Edit,
  ShieldCheck,
  AlertCircle,
  Clock,
} from 'lucide-react';

export default function NewKnowledgePage() {
  const { actor } = usePersona();
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Architecture & Security');
  const [reviewInterval, setReviewInterval] = useState<30 | 60 | 90 | 180>(90);
  const [tagInput, setTagInput] = useState('Guidelines, Security, Architecture');
  const [body, setBody] = useState(`## Objective & Context
Document the core invariants, anti-bypass principles, and architecture rules.

## Key Rules
1. **Deny by default**: Check authorization before retrieving data.
2. **Zero DB import in UI**: Components only call strictly scoped Data Access Layer routines.
3. **De-identified Shared Reads**: Never expose tenant-private identifiers.

## Implementation Pattern
\`\`\`typescript
const auth = authorize(actor, 'read', { kind: 'knowledge', audience: 'employee' });
if (!auth.allow) throw new Error(auth.reason);
\`\`\`
`);

  const [activeTab, setActiveTab] = useState<'editor' | 'preview' | 'split'>('split');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (title.length < 5) {
      setErrorMsg('Title must be at least 5 characters');
      return;
    }
    if (body.length < 30) {
      setErrorMsg('Markdown body must contain at least 30 characters');
      return;
    }

    setIsSubmitting(true);
    try {
      const item = createKnowledgeItem(actor, {
        title,
        category,
        body,
        reviewIntervalDays: reviewInterval,
        tags: tagInput.split(',').map((t) => t.trim()).filter(Boolean),
        relatedOfferingIds: ['offering-fai', 'offering-aml'],
      });

      router.push(`/employee/knowledge/${item.id}`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create document');
      setIsSubmitting(false);
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/employee/knowledge"
            className="p-2 rounded-xl border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground text-xs"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Create Knowledge Article</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Author internal runbooks, engineering standards, or architectural guidelines.
            </p>
          </div>
        </div>

        {/* View switcher */}
        <div className="hidden sm:flex items-center gap-1 bg-muted/60 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTab('editor')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold ${
              activeTab === 'editor' ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground'
            }`}
          >
            Editor Only
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('split')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold ${
              activeTab === 'split' ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground'
            }`}
          >
            Split View
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold ${
              activeTab === 'preview' ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground'
            }`}
          >
            Live Preview
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-card border border-border rounded-3xl p-6 shadow-xs">
          <div className="sm:col-span-2 space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-wider">
              Document Title *
            </label>
            <input
              required
              type="text"
              minLength={5}
              maxLength={150}
              placeholder="e.g. Zero-Trust Data Access Layer Invariants"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-xs outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-wider">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-xs outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="Architecture & Security">Architecture & Security</option>
              <option value="Data Engineering">Data Engineering</option>
              <option value="Compliance & Regulations">Compliance & Regulations</option>
              <option value="DevOps & Deployments">DevOps & Deployments</option>
              <option value="Product Specifications">Product Specifications</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-wider">
              Mandatory Review Interval
            </label>
            <select
              value={reviewInterval}
              onChange={(e) => setReviewInterval(Number(e.target.value) as any)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-xs outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value={30}>Every 30 Days (Fast Moving)</option>
              <option value={60}>Every 60 Days</option>
              <option value={90}>Every 90 Days (Quarterly Default)</option>
              <option value={180}>Every 180 Days (Semi-Annual)</option>
            </select>
          </div>

          <div className="sm:col-span-2 space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-wider">
              Tags (Comma separated)
            </label>
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-xs outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        {/* Editor & Preview Panes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[440px]">
          {/* Markdown Textarea */}
          {(activeTab === 'editor' || activeTab === 'split') && (
            <div className={`space-y-2 ${activeTab === 'editor' ? 'lg:col-span-2' : ''}`}>
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Markdown Source Content
                </label>
                <span className="text-[11px] font-mono text-muted-foreground">{body.length} chars</span>
              </div>
              <textarea
                required
                rows={18}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Write markdown documentation here..."
                className="w-full p-4 rounded-3xl border border-input bg-background font-mono text-xs text-foreground outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          )}

          {/* Live Preview */}
          {(activeTab === 'preview' || activeTab === 'split') && (
            <div className={`space-y-2 ${activeTab === 'preview' ? 'lg:col-span-2' : ''}`}>
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Live Markdown Preview
                </label>
                <span className="text-[11px] text-emerald-600 font-semibold">Rendered Safe</span>
              </div>
              <div className="p-6 rounded-3xl border border-border bg-card overflow-y-auto max-h-[500px] prose prose-sm dark:prose-invert max-w-none text-xs sm:text-sm whitespace-pre-line">
                {body}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <Link
            href="/employee/knowledge"
            className="px-4 py-2 rounded-xl border border-border text-xs font-semibold hover:bg-muted"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all shadow-md shadow-primary/20 disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isSubmitting ? 'Publishing...' : 'Publish Article'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

