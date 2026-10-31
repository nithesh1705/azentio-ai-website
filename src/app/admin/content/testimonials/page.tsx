'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ContentItem } from '@/types';
import {
  MessageSquareQuote,
  Plus,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Star,
  ShieldCheck,
  Building2,
  Check,
} from 'lucide-react';

export default function AdminTestimonialsPage() {
  const [testimonials, setTestimonials] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // New Testimonial Modal State
  const [showNewModal, setShowNewModal] = useState(false);
  const [quote, setQuote] = useState('');
  const [speakerName, setSpeakerName] = useState('');
  const [speakerTitle, setSpeakerTitle] = useState('');
  const [orgName, setOrgName] = useState('');
  const [displayMode, setDisplayMode] = useState<'named' | 'anonymised'>('named');
  const [rating, setRating] = useState(5);
  const [isSynthetic, setIsSynthetic] = useState(false);

  // Consent fields
  const [sourceType, setSourceType] = useState<any>('written_approval');
  const [evidenceRef, setEvidenceRef] = useState('');
  const [consentDate, setConsentDate] = useState(new Date().toISOString().split('T')[0]);
  const [approvedByPerson, setApprovedByPerson] = useState('');
  const [verifiedGenuine, setVerifiedGenuine] = useState(false);

  const fetchTestimonials = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/content?type=testimonial');
      if (res.ok) {
        const data = await res.json();
        setTestimonials(data.items || []);
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!quote.trim() || !speakerName.trim() || !orgName.trim()) {
      setFeedback({ type: 'error', message: 'Quote, speaker name, and organisation are required.' });
      return;
    }

    if (!evidenceRef.trim() || !verifiedGenuine) {
      setFeedback({
        type: 'error',
        message: 'Compliance Violation: Testimonials require recorded consent evidence and the verified genuine confirmation checkbox.',
      });
      return;
    }

    try {
      const title = `${orgName} - ${speakerName}`;
      const res = await fetch('/api/admin/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'testimonial',
          title,
          body: quote,
          status: 'draft',
          testimonialDetails: {
            quote,
            speakerName,
            speakerTitle,
            organisationName: orgName,
            displayMode,
            rating,
            isSyntheticSample: isSynthetic,
            consent: {
              sourceType,
              evidenceRef,
              consentDate,
              approvedByPerson: approvedByPerson || speakerName,
              verifiedGenuine,
            },
          },
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setFeedback({ type: 'error', message: data.error || 'Failed to create testimonial' });
        return;
      }

      setFeedback({ type: 'success', message: 'Testimonial recorded successfully with verified consent.' });
      setShowNewModal(false);
      setQuote('');
      setSpeakerName('');
      setSpeakerTitle('');
      setOrgName('');
      setEvidenceRef('');
      setVerifiedGenuine(false);
      fetchTestimonials();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    }
  };

  const handlePublish = async (id: string) => {
    try {
      const res = await fetch('/api/admin/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'publish', id }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setFeedback({ type: 'error', message: data.error || 'Failed to publish testimonial' });
        return;
      }
      setFeedback({ type: 'success', message: 'Testimonial published live.' });
      fetchTestimonials();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    }
  };

  const handleUnpublish = async (id: string) => {
    try {
      const res = await fetch('/api/admin/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'unpublish', id }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedback({ type: 'success', message: 'Testimonial unpublished.' });
        fetchTestimonials();
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    }
  };

  const filtered = testimonials.filter((t) => {
    return statusFilter === 'all' || t.status === statusFilter;
  });

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
              <MessageSquareQuote className="w-6 h-6 text-primary" />
              <span>Customer Testimonials Governance</span>
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Enforce authenticity: Every testimonial requires recorded consent evidence and internal executive verification.
            </p>
          </div>

          <button
            onClick={() => setShowNewModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>New Testimonial</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-card border border-border rounded-xl p-4 space-y-4 shadow-sm">
        <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg text-xs overflow-x-auto w-fit">
          {['all', 'published', 'draft'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-md font-medium capitalize transition-colors ${
                statusFilter === status
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Testimonials Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((t) => {
            const details = t.testimonialDetails;
            const isSynthetic = details?.isSyntheticSample;
            const isVerified = details?.consent?.verifiedGenuine;
            return (
              <div
                key={t.id}
                className="p-5 rounded-xl border border-border bg-card/60 hover:bg-muted/20 transition-colors flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-amber-500">
                      {Array.from({ length: details?.rating || 5 }).map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-current" />
                      ))}
                    </div>
                    <div className="flex items-center gap-1.5">
                      {isSynthetic && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-600">
                          Sample / Synthetic
                        </span>
                      )}
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize ${
                          t.status === 'published'
                            ? 'bg-emerald-500/10 text-emerald-600'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {t.status}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-foreground italic leading-relaxed">
                    "{details?.quote}"
                  </p>

                  <div className="text-xs space-y-0.5">
                    <p className="font-semibold text-foreground">{details?.speakerName}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {details?.speakerTitle} • <strong>{details?.organisationName}</strong>
                    </p>
                  </div>

                  {/* Consent Badge */}
                  <div className="p-2.5 rounded-lg border border-border/60 bg-muted/30 text-[11px] flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                      <span>Ref: <strong>{details?.consent?.evidenceRef}</strong></span>
                    </div>
                    {isVerified ? (
                      <span className="text-emerald-600 font-semibold flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        <span>Verified Genuine</span>
                      </span>
                    ) : (
                      <span className="text-destructive font-semibold">Unverified</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-border/50">
                  {t.status !== 'published' ? (
                    <button
                      onClick={() => handlePublish(t.id)}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm"
                    >
                      Publish
                    </button>
                  ) : (
                    <button
                      onClick={() => handleUnpublish(t.id)}
                      className="px-3 py-1.5 text-xs font-medium rounded-lg text-amber-600 hover:bg-amber-500/10"
                    >
                      Unpublish
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* New Testimonial Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-card border border-border rounded-xl shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="font-semibold text-foreground text-sm">Add Customer Testimonial</h3>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">
                  Customer Quote <span className="text-destructive">*</span>
                </label>
                <textarea
                  value={quote}
                  onChange={(e) => setQuote(e.target.value)}
                  placeholder="Direct authentic quotation from the client..."
                  rows={3}
                  required
                  className="w-full p-2.5 text-xs rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">Speaker Name</label>
                  <input
                    type="text"
                    value={speakerName}
                    onChange={(e) => setSpeakerName(e.target.value)}
                    placeholder="e.g. MS Dhoni"
                    required
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-input bg-background"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">Speaker Title</label>
                  <input
                    type="text"
                    value={speakerTitle}
                    onChange={(e) => setSpeakerTitle(e.target.value)}
                    placeholder="e.g. Chief Operating Officer"
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-input bg-background"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">Organisation</label>
                  <input
                    type="text"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    placeholder="e.g. XYZ Global"
                    required
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-input bg-background"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">Star Rating</label>
                  <select
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-input bg-background"
                  >
                    <option value={5}>5 Stars</option>
                    <option value={4}>4 Stars</option>
                  </select>
                </div>
              </div>

              {/* Mandatory Consent Box */}
              <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/5 space-y-3">
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-semibold text-xs">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Mandatory Recorded Consent Evidence</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-muted-foreground mb-1">
                      Evidence Ref Document <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="text"
                      value={evidenceRef}
                      onChange={(e) => setEvidenceRef(e.target.value)}
                      placeholder="e.g. doc-consent-2026-91"
                      required
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-input bg-background font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-muted-foreground mb-1">Consent Date</label>
                    <input
                      type="date"
                      value={consentDate}
                      onChange={(e) => setConsentDate(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-input bg-background"
                    />
                  </div>
                </div>

                <label className="flex items-start gap-2 cursor-pointer text-xs pt-1">
                  <input
                    type="checkbox"
                    checked={verifiedGenuine}
                    onChange={(e) => setVerifiedGenuine(e.target.checked)}
                    className="rounded text-primary focus:ring-primary mt-0.5"
                  />
                  <span className="font-semibold text-foreground">
                    I confirm this review is genuine and documented by authentic client permission on file.
                  </span>
                </label>
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
                  disabled={!verifiedGenuine || !evidenceRef}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  Save Testimonial
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

