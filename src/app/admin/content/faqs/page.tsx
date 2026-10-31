'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ContentItem } from '@/types';
import {
  HelpCircle,
  Plus,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  AlertTriangle,
  FolderOpen,
} from 'lucide-react';

export default function AdminFaqsPage() {
  const [faqs, setFaqs] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewModal, setShowNewModal] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // New FAQ form state
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [category, setCategory] = useState('Security & Privacy');

  const fetchFaqs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/content?type=faq');
      if (res.ok) {
        const data = await res.json();
        const sorted = (data.items || []).sort(
          (a: ContentItem, b: ContentItem) =>
            (a.faqDetails?.order || 99) - (b.faqDetails?.order || 99)
        );
        setFaqs(sorted);
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || !answer.trim()) return;

    try {
      const res = await fetch('/api/admin/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'faq',
          title: question,
          body: answer,
          category,
          status: 'published',
          faqDetails: {
            order: faqs.length + 1,
            category,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setFeedback({ type: 'error', message: data.error || 'Failed to create FAQ' });
        return;
      }

      setFeedback({ type: 'success', message: 'FAQ created successfully.' });
      setShowNewModal(false);
      setQuestion('');
      setAnswer('');
      fetchFaqs();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    }
  };

  const handleMoveOrder = async (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === faqs.length - 1)
    ) {
      return;
    }

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const reordered = [...faqs];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);

    // Update locally
    setFaqs(reordered);

    // Persist updated order
    try {
      await Promise.all(
        reordered.map((item, idx) =>
          fetch(`/api/admin/content/${item.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              faqDetails: {
                order: idx + 1,
                category: item.category || 'General',
              },
            }),
          })
        )
      );
      setFeedback({ type: 'success', message: 'FAQ order updated successfully.' });
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    }
  };

  return (
    <div className="space-y-6">
      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-xl text-sm flex items-center justify-between border ${
            feedback.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
              : 'bg-destructive/10 border-destructive/30 text-destructive'
          }`}
        >
          <span>{feedback.message}</span>
          <button
            onClick={() => setFeedback(null)}
            className="text-xs underline hover:opacity-80 ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Header */}
      <div>
        <Link
          href="/admin/content"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Content Hub</span>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
              <HelpCircle className="w-6 h-6 text-primary" />
              <span>Knowledge Base & FAQs Reordering</span>
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Curate frequently asked questions with accessible, keyboard-friendly ordering controls.
            </p>
          </div>

          <button
            onClick={() => setShowNewModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>New FAQ Item</span>
          </button>
        </div>
      </div>

      {/* FAQs List */}
      <div className="bg-card border border-border rounded-xl p-4 shadow-sm space-y-3">
        {faqs.map((faq, index) => (
          <div
            key={faq.id}
            className="p-4 rounded-xl border border-border bg-card/60 hover:bg-muted/20 transition-colors flex items-start justify-between gap-4"
          >
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                  #{index + 1}
                </span>
                <h3 className="font-semibold text-sm text-foreground">{faq.title}</h3>
                <span className="px-2 py-0.2 rounded text-[10px] font-semibold bg-primary/10 text-primary">
                  {faq.category}
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed pl-7">{faq.body}</p>
            </div>

            {/* Reorder Buttons */}
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={() => handleMoveOrder(index, 'up')}
                disabled={index === 0}
                className="p-1.5 rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
                aria-label={`Move ${faq.title} up`}
              >
                <ArrowUp className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleMoveOrder(index, 'down')}
                disabled={index === faqs.length - 1}
                className="p-1.5 rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
                aria-label={`Move ${faq.title} down`}
              >
                <ArrowDown className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* New FAQ Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-card border border-border rounded-xl shadow-2xl p-6 space-y-4">
            <h3 className="font-semibold text-foreground text-sm">Add New FAQ</h3>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Question</label>
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="e.g. How does Azentio enforce tenant isolation?"
                  required
                  className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-input bg-background"
                >
                  <option value="Security & Privacy">Security & Privacy</option>
                  <option value="Collective Learning">Collective Learning</option>
                  <option value="Architecture">Architecture</option>
                  <option value="Licensing & Tiers">Licensing & Tiers</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Answer</label>
                <textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Comprehensive self-service response..."
                  rows={4}
                  required
                  className="w-full p-2.5 text-xs rounded-lg border border-input bg-background"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-3.5 py-2 text-xs font-medium rounded-lg border border-border"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Save & Publish FAQ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
