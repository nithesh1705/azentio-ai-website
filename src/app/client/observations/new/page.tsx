'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePersona } from '@/context/PersonaContext';
import { createContribution, scanSensitivity, getPublicOfferings } from '@/server/dal/store';
import {
  Sparkles,
  ChevronLeft,
  FileText,
  ShieldCheck,
  AlertTriangle,
  Lock,
  Save,
  Send,
  Building2,
  CheckCircle2,
} from 'lucide-react';
import { VisibilityChoice } from '@/types';

export default function NewObservationPage() {
  const router = useRouter();
  const { actor, activeTenant } = usePersona();
  const offerings = getPublicOfferings();

  const [formData, setFormData] = useState({
    title: '',
    body: '',
    offeringId: 'offering-fai',
    industry: 'Retail & Consumer Goods',
    region: 'North America / EMEA',
    observationPeriod: 'Q1 2026',
    evidenceType: 'Aggregated Portfolio Delinquency Patterns',
    confidence: 'High' as 'High' | 'Medium' | 'Preliminary',
    links: ['https://synthetic-data.azentio.ai/evidence-pilot.pdf'],
    visibilityChoice: 'private_to_author' as VisibilityChoice,
  });

  const [consents, setConsents] = useState({
    consent_process: true,
    consent_publish: false,
    consent_attribution: false,
    consent_training: false,
    policyVersion: 'v1.0-2026',
    timestamp: new Date().toISOString(),
  });

  const [linkInput, setLinkInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!actor.activeTenantId || !activeTenant) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <Building2 className="w-12 h-12 text-muted-foreground mx-auto" />
        <h1 className="text-2xl font-bold text-foreground">Select Active Workspace</h1>
        <p className="text-sm text-muted-foreground">
          Please select a client persona to contribute market observations.
        </p>
      </div>
    );
  }

  // Real-time sensitivity scan
  const sensitivityFlags = [
    ...scanSensitivity(formData.title),
    ...scanSensitivity(formData.body),
  ];

  const handleCreate = (isSubmit: boolean) => {
    if (!formData.title.trim() || !formData.body.trim()) {
      setError('Please provide a title and detailed observation description.');
      return;
    }

    if (isSubmit && !consents.consent_publish) {
      setError('Community sharing requires explicit consent to publish a reviewed, de-identified representation.');
      return;
    }

    setSubmitting(true);
    setError(null);

    setTimeout(() => {
      try {
        createContribution(actor, {
          ...formData,
          consents,
          isSubmit,
        });
        router.push('/client/observations');
      } catch (err: any) {
        setError(err.message || 'Failed to save observation');
        setSubmitting(false);
      }
    }, 500);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Link
          href="/client/observations"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Observations</span>
        </Link>
      </div>

      <div className="p-8 sm:p-10 rounded-3xl glass-panel border border-border">
        <div className="flex items-center justify-between pb-6 border-b border-border">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs uppercase tracking-widest font-bold text-primary">
                {activeTenant.name} &bull; Structured Contribution
              </span>
              <span className="badge-synthetic text-xs">Synthetic Observation</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              Record Market Observation
            </h1>
          </div>
          <Lock className="w-6 h-6 text-muted-foreground" />
        </div>

        {error && (
          <div className="mt-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium">
            {error}
          </div>
        )}

        {/* Real-time Sensitivity Scanner Feedback */}
        {sensitivityFlags.length > 0 && (
          <div className="mt-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>Sensitivity Scanner Flagged Potential Identifiers:</span>
            </div>
            <ul className="list-disc list-inside space-y-1">
              {sensitivityFlags.map((flag, idx) => (
                <li key={idx}>{flag}</li>
              ))}
            </ul>
            <p className="text-[11px] text-muted-foreground italic">
              Notice (§2.7): Heuristic scans only flag for review; they are not a privacy guarantee. Moderators will redact all sensitive and identifying material prior to any approved shared publication.
            </p>
          </div>
        )}

        <div className="mt-8 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-foreground mb-2">
              Observation Title <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Post-holiday working capital repayment friction in retail SME cohorts"
              className="w-full bg-muted/60 border border-border rounded-xl px-4 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Body */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-foreground mb-2">
              Detailed Observation Description <span className="text-destructive">*</span>
            </label>
            <textarea
              rows={4}
              value={formData.body}
              onChange={(e) => setFormData({ ...formData, body: e.target.value })}
              placeholder="Describe the operational challenge, model anomaly, or market behavior observed. Exclude specific customer names, real account numbers, and proprietary pricing..."
              className="w-full bg-muted/60 border border-border rounded-xl px-4 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Form Meta Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">
                Relevant Offering
              </label>
              <select
                value={formData.offeringId}
                onChange={(e) => setFormData({ ...formData, offeringId: e.target.value })}
                className="w-full bg-muted/60 border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {offerings.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">
                Industry Sector
              </label>
              <select
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                className="w-full bg-muted/60 border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="Retail & Consumer Goods">Retail & Consumer Goods</option>
                <option value="Hospitality & Agriculture">Hospitality & Agriculture</option>
                <option value="Agriculture & Microfinance">Agriculture & Microfinance</option>
                <option value="Manufacturing & Export">Manufacturing & Export</option>
                <option value="Commercial Real Estate">Commercial Real Estate</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">
                Region Band
              </label>
              <input
                type="text"
                value={formData.region}
                onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                className="w-full bg-muted/60 border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">
                Observation Period
              </label>
              <input
                type="text"
                value={formData.observationPeriod}
                onChange={(e) => setFormData({ ...formData, observationPeriod: e.target.value })}
                placeholder="e.g. Q1 2026"
                className="w-full bg-muted/60 border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">
                Evidence Confidence
              </label>
              <select
                value={formData.confidence}
                onChange={(e) => setFormData({ ...formData, confidence: e.target.value as any })}
                className="w-full bg-muted/60 border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="High">High (Broad Portfolio Backing)</option>
                <option value="Medium">Medium (Cohort Observation)</option>
                <option value="Preliminary">Preliminary (Single Sample)</option>
              </select>
            </div>
          </div>

          {/* Visibility Choices (§10.1) */}
          <div className="p-5 rounded-2xl bg-muted/30 border border-border space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-foreground">
              Intended Visibility Choice
            </label>
            <div className="space-y-2 text-xs">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="radio"
                  name="visibilityChoice"
                  value="private_to_author"
                  checked={formData.visibilityChoice === 'private_to_author'}
                  onChange={() => setFormData({ ...formData, visibilityChoice: 'private_to_author' })}
                  className="mt-1 accent-emerald-500"
                />
                <div>
                  <span className="font-semibold text-foreground">Private to Author (Default)</span>
                  <p className="text-muted-foreground text-[11px]">
                    Only you can view this draft. It is not shared within your organisation or community.
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="radio"
                  name="visibilityChoice"
                  value="within_organisation"
                  checked={formData.visibilityChoice === 'within_organisation'}
                  onChange={() => setFormData({ ...formData, visibilityChoice: 'within_organisation' })}
                  className="mt-1 accent-emerald-500"
                />
                <div>
                  <span className="font-semibold text-foreground">Within Organisation</span>
                  <p className="text-muted-foreground text-[11px]">
                    Accessible to authorised members of {activeTenant.name}. Never exposed cross-tenant.
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="radio"
                  name="visibilityChoice"
                  value="propose_to_learning_community"
                  checked={formData.visibilityChoice === 'propose_to_learning_community'}
                  onChange={() => {
                    setFormData({ ...formData, visibilityChoice: 'propose_to_learning_community' });
                    setConsents((prev) => ({ ...prev, consent_publish: true }));
                  }}
                  className="mt-1 accent-emerald-500"
                />
                <div>
                  <span className="font-semibold text-foreground">
                    Propose to Learning Community (Governed Collective Hub)
                  </span>
                  <p className="text-muted-foreground text-[11px]">
                    Submitted for moderator review. Approved copies are de-identified before entering the cross-client feed.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Four Granular Consents (§10.2) */}
          <div className="p-5 rounded-2xl bg-muted/40 border border-border space-y-3">
            <span className="block text-xs font-bold uppercase tracking-wider text-foreground">
              Granular Consent Record (Policy {consents.policyVersion})
            </span>
            <div className="space-y-2.5 text-xs">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consents.consent_process}
                  onChange={(e) => setConsents({ ...consents, consent_process: e.target.checked })}
                  className="rounded accent-emerald-500"
                />
                <span className="font-medium text-foreground">
                  Consent to Process: Store and process observation internally
                </span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consents.consent_publish}
                  onChange={(e) => setConsents({ ...consents, consent_publish: e.target.checked })}
                  className="rounded accent-emerald-500"
                />
                <span className="font-medium text-foreground">
                  Consent to Publish: Publish reviewed, de-identified shared representation
                </span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consents.consent_attribution}
                  onChange={(e) => setConsents({ ...consents, consent_attribution: e.target.checked })}
                  className="rounded accent-emerald-500"
                />
                <span className="font-medium text-foreground">
                  Consent to Attribution (Opt-In): Disclose organisation name in shared view (Default off)
                </span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consents.consent_training}
                  onChange={(e) => setConsents({ ...consents, consent_training: e.target.checked })}
                  className="rounded accent-emerald-500"
                />
                <span className="font-medium text-foreground">
                  Consent to Model Training: Future federated learning program (Default OFF & strictly separate)
                </span>
              </label>
            </div>
          </div>

          {/* Action Buttons: Save Draft vs Submit */}
          <div className="pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => handleCreate(false)}
              disabled={submitting}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-card border border-border text-foreground text-xs font-semibold hover:bg-muted transition-all"
            >
              <Save className="w-4 h-4 text-muted-foreground" />
              <span>Save as Private Draft (Save ≠ Share)</span>
            </button>

            <button
              type="button"
              onClick={() => handleCreate(true)}
              disabled={submitting}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all shadow-md shadow-emerald-500/20 hover:scale-105 active:scale-95"
            >
              <Send className="w-4 h-4" />
              <span>Submit for Moderation Review</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
