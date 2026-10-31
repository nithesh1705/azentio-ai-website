'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Award, ArrowLeft, ShieldCheck, Save, Send, AlertTriangle } from 'lucide-react';

export default function AdminNewCaseStudyPage() {
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [body, setBody] = useState('');
  const [orgName, setOrgName] = useState('');
  const [displayMode, setDisplayMode] = useState<'named' | 'name_and_org' | 'anonymised'>('named');
  const [speakerName, setSpeakerName] = useState('');
  const [speakerTitle, setSpeakerTitle] = useState('');
  const [quote, setQuote] = useState('');

  // Consent Evidence
  const [sourceType, setSourceType] = useState<'written_approval' | 'signed_form' | 'email'>('written_approval');
  const [evidenceRef, setEvidenceRef] = useState('');
  const [consentDate, setConsentDate] = useState(new Date().toISOString().split('T')[0]);
  const [approvedByPerson, setApprovedByPerson] = useState('');
  const [verifiedGenuine, setVerifiedGenuine] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  const handleSave = async (publishImmediately: boolean) => {
    if (!title.trim() || !body.trim() || !orgName.trim()) {
      setError('Title, body, and customer organisation name are required.');
      return;
    }

    if (displayMode === 'named' && (!evidenceRef.trim() || !verifiedGenuine)) {
      setError('Compliance Invariant: A named case study requires recorded consent evidence and the verified genuine confirmation checkbox.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'case_study',
          title,
          slug,
          excerpt,
          body,
          status: publishImmediately ? 'published' : 'draft',
          testimonialDetails: {
            quote,
            speakerName,
            speakerTitle,
            organisationName: orgName,
            displayMode,
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
        setError(data.error || 'Failed to create case study');
        setLoading(false);
        return;
      }

      router.push('/admin/content/case-studies');
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <Link
          href="/admin/content/case-studies"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Case Studies</span>
        </Link>

        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
          <Award className="w-6 h-6 text-primary" />
          <span>Create Customer Case Study</span>
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Publish documented enterprise transformations with strict consent tracking.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-xs">
          {error}
        </div>
      )}

      <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-6">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-foreground mb-1">
              Case Study Title <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Apex Global Bank Replaces Legacy Lending Core with Azentio"
              required
              className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary font-semibold"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">
                Client Organisation Name <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                placeholder="e.g. Apex Global Bank"
                required
                className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground mb-1">
                Display Attribution Mode
              </label>
              <select
                value={displayMode}
                onChange={(e) => setDisplayMode(e.target.value as any)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="named">Named Public Case Study (Requires Recorded Consent)</option>
                <option value="anonymised">Anonymised Peer Descriptor (e.g. Tier-1 Middle Eastern Bank)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground mb-1">
              Executive Summary / Excerpt
            </label>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              rows={2}
              placeholder="Brief summary of measurable ROI impact..."
              className="w-full p-2.5 text-xs rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground mb-1">
              Case Study Narrative (Markdown) <span className="text-destructive">*</span>
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={10}
              placeholder="Write case study structure: Challenge, Solution Architecture, Quantified Results..."
              className="w-full p-3 text-xs font-mono rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Customer Quote Section */}
          <div className="p-4 rounded-xl border border-border/80 bg-muted/20 space-y-3">
            <h3 className="text-xs font-semibold text-foreground">Featured Customer Quote & Stakeholder</h3>
            <div>
              <label className="block text-[11px] text-muted-foreground mb-1">Customer Quote</label>
              <textarea
                value={quote}
                onChange={(e) => setQuote(e.target.value)}
                rows={2}
                placeholder="Direct quotation from the executive sponsor..."
                className="w-full p-2 text-xs rounded-lg border border-input bg-background"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-muted-foreground mb-1">Speaker Name</label>
                <input
                  type="text"
                  value={speakerName}
                  onChange={(e) => setSpeakerName(e.target.value)}
                  placeholder="e.g. Elena Rostova"
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-input bg-background"
                />
              </div>
              <div>
                <label className="block text-[11px] text-muted-foreground mb-1">Speaker Title</label>
                <input
                  type="text"
                  value={speakerTitle}
                  onChange={(e) => setSpeakerTitle(e.target.value)}
                  placeholder="e.g. Chief Operating Officer"
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-input bg-background"
                />
              </div>
            </div>
          </div>

          {/* Mandatory Consent Evidence Section */}
          <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/5 space-y-4">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
              <ShieldCheck className="w-5 h-5 flex-shrink-0" />
              <h3 className="text-xs font-semibold uppercase tracking-wider">
                Recorded Consent Evidence & Audit Binding
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] text-muted-foreground mb-1">Consent Source</label>
                <select
                  value={sourceType}
                  onChange={(e) => setSourceType(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-input bg-background"
                >
                  <option value="written_approval">Written Approval</option>
                  <option value="signed_form">Signed Legal Release Form</option>
                  <option value="email">Formal Authorization Email</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-muted-foreground mb-1">
                  Evidence Document / Ref Code <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={evidenceRef}
                  onChange={(e) => setEvidenceRef(e.target.value)}
                  placeholder="e.g. legal-doc-c2026-819"
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-input bg-background font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] text-muted-foreground mb-1">Consent Execution Date</label>
                <input
                  type="date"
                  value={consentDate}
                  onChange={(e) => setConsentDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-input bg-background"
                />
              </div>
            </div>

            <label className="flex items-start gap-2.5 cursor-pointer text-xs pt-1">
              <input
                type="checkbox"
                checked={verifiedGenuine}
                onChange={(e) => setVerifiedGenuine(e.target.checked)}
                className="rounded text-primary focus:ring-primary mt-0.5"
              />
              <span className="font-semibold text-foreground leading-snug">
                I confirm this case study and associated customer statements are genuine, backed by authentic client consent documentation stored on file.
              </span>
            </label>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
          <Link
            href="/admin/content/case-studies"
            className="px-4 py-2 text-xs font-medium rounded-lg border border-border hover:bg-muted"
          >
            Cancel
          </Link>
          <button
            type="button"
            disabled={loading}
            onClick={() => handleSave(false)}
            className="px-4 py-2 text-xs font-medium rounded-lg border border-border bg-card hover:bg-muted"
          >
            Save Draft
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => handleSave(true)}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm"
          >
            Publish Case Study
          </button>
        </div>
      </div>
    </div>
  );
}
