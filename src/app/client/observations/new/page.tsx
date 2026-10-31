'use client';

import React, { useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { usePersona } from '@/context/PersonaContext';
import { createObservationDraft, computeWhoCanSee } from '@/server/dal/client/observations';
import { scanSensitivity, store } from '@/server/dal/store';
import { VisibilityChoice } from '@/types';
import {
  ArrowLeft,
  ShieldCheck,
  AlertTriangle,
  Info,
  Lock,
  Globe2,
  CheckCircle2,
  Sparkles,
  Layers,
  Building2,
  Send,
  Save,
  HelpCircle,
} from 'lucide-react';

function NewObservationInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedOffering = searchParams?.get('offeringId') || '';
  const { actor, activeTenant } = usePersona();

  // Form State
  const [offeringId, setOfferingId] = useState(preselectedOffering);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [industry, setIndustry] = useState('Banking & Capital Markets');
  const [region, setRegion] = useState('Southeast Asia');
  const [observationPeriod, setObservationPeriod] = useState('2026-Q1');
  const [evidenceType, setEvidenceType] = useState('Production Telemetry');
  const [confidence, setConfidence] = useState<'High' | 'Medium' | 'Preliminary'>('High');
  const [visibilityChoice, setVisibilityChoice] = useState<VisibilityChoice>('within_organisation');

  // 4 Independent Consents
  const [consents, setConsents] = useState({
    consent_process: true,
    consent_publish: true,
    consent_attribution: false,
    consent_training: false, // Strictly default off
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!actor.activeTenantId || !activeTenant) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <Building2 className="w-12 h-12 text-muted-foreground mx-auto" />
        <h1 className="text-xl font-bold text-foreground">Workspace Required</h1>
        <p className="text-xs text-muted-foreground">Select an active client workspace to draft observations.</p>
        <Link href="/choose-workspace" className="text-xs text-primary underline">
          Switch Workspace
        </Link>
      </div>
    );
  }

  // Get entitled offerings
  const entitledOfferings = store.offerings.filter((o) =>
    activeTenant.entitledOfferings.includes(o.id)
  );

  // Default offering if not set
  React.useEffect(() => {
    if (!offeringId && entitledOfferings.length > 0) {
      setOfferingId(entitledOfferings[0].id);
    }
  }, [entitledOfferings, offeringId]);

  // Real-time sensitivity scan
  const sensitivityFlags = useMemo(() => {
    return [...scanSensitivity(title), ...scanSensitivity(body)];
  }, [title, body]);

  // Live "Who can see this version" summary
  const whoCanSeeDraft = computeWhoCanSee(visibilityChoice, 'Draft');
  const whoCanSeeSubmitted = computeWhoCanSee(visibilityChoice, 'Submitted');

  const handleSave = (autoSubmit: boolean) => {
    if (!title.trim() || !body.trim() || !offeringId) {
      alert('Please provide a title, detailed observation body, and select an offering.');
      return;
    }

    setIsSubmitting(true);
    try {
      const obs = createObservationDraft(
        actor,
        {
          title: title.trim(),
          body: body.trim(),
          offeringId,
          industry,
          region,
          observationPeriod,
          evidenceType,
          confidence,
          visibilityChoice,
          consents,
        },
        autoSubmit
      );

      router.push(`/client/observations/${obs.id}`);
    } catch (err: any) {
      alert('Failed: ' + err.message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button */}
      <div>
        <Link
          href="/client/observations"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Observations</span>
        </Link>
      </div>

      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
            {activeTenant.name}
          </span>
          <span className="text-xs text-muted-foreground">Authoring Studio</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
          Record Field Observation
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-muted-foreground leading-relaxed">
          Log operational findings, model edge cases, or latency benchmarks. Every contribution undergoes client-side sensitivity scanning before any review.
        </p>
      </div>

      <div className="space-y-6">
        {/* Offering & Classification */}
        <div className="p-6 rounded-3xl bg-card border border-border space-y-4">
          <h2 className="text-sm font-bold text-foreground">1. Context & Entitlement</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                Entitled Solution
              </label>
              <select
                value={offeringId}
                onChange={(e) => setOfferingId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-muted/60 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {entitledOfferings.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name} ({o.category})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                Industry
              </label>
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-muted/60 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="Banking & Capital Markets">Banking & Capital Markets</option>
                <option value="Trade Finance & Cross-Border">Trade Finance & Cross-Border</option>
                <option value="SME Lending & Mortgages">SME Lending & Mortgages</option>
                <option value="Insurance & Wealth">Insurance & Wealth</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                Geographic Region
              </label>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-muted/60 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="Southeast Asia">Southeast Asia</option>
                <option value="South Asia">South Asia</option>
                <option value="Middle East & Africa">Middle East & Africa</option>
                <option value="Cross-Border Global">Cross-Border Global</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                Evidence Methodology
              </label>
              <select
                value={evidenceType}
                onChange={(e) => setEvidenceType(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-muted/60 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="Production Telemetry">Production Telemetry</option>
                <option value="Audited Backtest">Audited Backtest</option>
                <option value="Sandbox Simulation">Sandbox Simulation</option>
                <option value="User Interview & Ops Review">User Interview & Ops Review</option>
              </select>
            </div>
          </div>
        </div>

        {/* Observation Content & Sensitivity Scanner */}
        <div className="p-6 rounded-3xl bg-card border border-border space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-foreground">2. Observation Narrative</h2>
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-muted-foreground">Confidence:</span>
              <span className="font-bold text-primary">{confidence}</span>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                Title / Summary Headline
              </label>
              <input
                type="text"
                required
                placeholder="e.g., Seasonal Q1 Cash-Flow Volatility in SME Exporters"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-muted/60 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-foreground">
                  Detailed Findings & Empirical Pattern
                </label>
                <span className="text-[10px] text-muted-foreground font-mono">
                  No attachments in P0 (link to external evidence docs if needed)
                </span>
              </div>
              <textarea
                rows={5}
                required
                placeholder="Describe the operational pattern, observed model anomaly, or benchmark baseline. Avoid customer names, account numbers, or secret contract terms..."
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="w-full p-3.5 text-xs rounded-xl bg-muted/60 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 leading-relaxed"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                Confidence Level
              </label>
              <div className="flex items-center gap-2">
                {(['High', 'Medium', 'Preliminary'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setConfidence(lvl)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                      confidence === lvl
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'bg-muted text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Real-time Sensitivity Heuristic Warning Banner */}
          {sensitivityFlags.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs space-y-1.5"
            >
              <div className="font-bold flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Sensitivity Scanner Flag ({sensitivityFlags.length})</span>
              </div>
              <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                {sensitivityFlags.map((flag, idx) => (
                  <li key={idx}>{flag}</li>
                ))}
              </ul>
              <p className="text-[10px] text-amber-700/80 dark:text-amber-300/80 pt-1">
                Please sanitize any direct email addresses, bank account numbers, or confidential salary/contract keywords before submitting for collective review.
              </p>
            </motion.div>
          )}
        </div>

        {/* Visibility Choice */}
        <div className="p-6 rounded-3xl bg-card border border-border space-y-4">
          <h2 className="text-sm font-bold text-foreground">3. Visibility & Perimeter Scope</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setVisibilityChoice('within_organisation')}
              className={`p-4 rounded-2xl border text-left transition-all ${
                visibilityChoice === 'within_organisation'
                  ? 'bg-primary/5 border-primary shadow-sm ring-1 ring-primary/30'
                  : 'bg-muted/30 border-border hover:border-primary/40'
              }`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <Globe2 className="w-4 h-4 text-primary" />
                <span className="text-xs font-bold text-foreground">Our Organisation</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Colleagues in your workspace can view this note. If submitted, research moderators review it for de-identified synthesis.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setVisibilityChoice('private_to_author')}
              className={`p-4 rounded-2xl border text-left transition-all ${
                visibilityChoice === 'private_to_author'
                  ? 'bg-primary/5 border-primary shadow-sm ring-1 ring-primary/30'
                  : 'bg-muted/30 border-border hover:border-primary/40'
              }`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <Lock className="w-4 h-4 text-primary" />
                <span className="text-xs font-bold text-foreground">Private to Author</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Kept strictly confidential to your account. Colleagues cannot see this observation even if in the same tenant.
              </p>
            </button>
          </div>
        </div>

        {/* 4 Independent Consents */}
        <div className="p-6 rounded-3xl bg-card border border-border space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-foreground">4. Four Independent Consents</h2>
            <span className="text-[10px] text-muted-foreground font-mono">Explicit & Unbundled</span>
          </div>

          <div className="space-y-3 text-xs">
            {/* Consent 1 */}
            <label className="flex items-start gap-3 p-3.5 rounded-xl bg-muted/40 border border-border/50 cursor-pointer">
              <input
                type="checkbox"
                checked={consents.consent_process}
                onChange={(e) =>
                  setConsents({ ...consents, consent_process: e.target.checked })
                }
                className="mt-0.5 accent-primary w-4 h-4"
              />
              <div>
                <span className="font-bold text-foreground block">
                  1. Process for Anonymised Aggregation & Benchmarking
                </span>
                <span className="text-[11px] text-muted-foreground leading-relaxed">
                  Permit Azentio's federated aggregation engine to index numeric metric distributions alongside other financial institutions.
                </span>
              </div>
            </label>

            {/* Consent 2 */}
            <label className="flex items-start gap-3 p-3.5 rounded-xl bg-muted/40 border border-border/50 cursor-pointer">
              <input
                type="checkbox"
                checked={consents.consent_publish}
                onChange={(e) =>
                  setConsents({ ...consents, consent_publish: e.target.checked })
                }
                className="mt-0.5 accent-primary w-4 h-4"
              />
              <div>
                <span className="font-bold text-foreground block">
                  2. Publish De-Identified Pattern in Shared Learning Feed
                </span>
                <span className="text-[11px] text-muted-foreground leading-relaxed">
                  Allow moderators to publish a de-identified version into the cross-tenant knowledge feed. Zero organization names or author details are ever revealed.
                </span>
              </div>
            </label>

            {/* Consent 3 */}
            <label className="flex items-start gap-3 p-3.5 rounded-xl bg-muted/40 border border-border/50 cursor-pointer">
              <input
                type="checkbox"
                checked={consents.consent_attribution}
                onChange={(e) =>
                  setConsents({ ...consents, consent_attribution: e.target.checked })
                }
                className="mt-0.5 accent-primary w-4 h-4"
              />
              <div>
                <span className="font-bold text-foreground block">
                  3. Organization Attribution (Default Off)
                </span>
                <span className="text-[11px] text-muted-foreground leading-relaxed">
                  Display an enterprise badge ({activeTenant.name}) on published shared findings. If unchecked, the item is labeled "Anonymous Tier-1 Bank".
                </span>
              </div>
            </label>

            {/* Consent 4 */}
            <label className="flex items-start gap-3 p-3.5 rounded-xl bg-muted/40 border border-border/50 cursor-pointer">
              <input
                type="checkbox"
                checked={consents.consent_training}
                onChange={(e) =>
                  setConsents({ ...consents, consent_training: e.target.checked })
                }
                className="mt-0.5 accent-primary w-4 h-4"
              />
              <div>
                <span className="font-bold text-foreground block">
                  4. Allow Foundation Model Fine-Tuning (Default Strictly OFF)
                </span>
                <span className="text-[11px] text-muted-foreground leading-relaxed">
                  Opt-in to allow this observation's mathematical weights to be incorporated during quarterly foundational model fine-tuning. Completely optional.
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* Live "Who Can See This Version" Card */}
        <div className="p-5 rounded-2xl bg-muted/30 border border-border space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-primary" />
            <span>Who Can See This Version</span>
          </span>
          <div className="text-xs text-foreground font-semibold">
            Draft: <span className="font-normal text-muted-foreground">{whoCanSeeDraft.summary}</span>
          </div>
          <div className="text-xs text-foreground font-semibold">
            Upon Submission:{' '}
            <span className="font-normal text-muted-foreground">{whoCanSeeSubmitted.summary}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-border">
          <Link
            href="/client/observations"
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground text-center"
          >
            Cancel
          </Link>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleSave(false)}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-secondary text-secondary-foreground text-xs font-semibold hover:bg-secondary/80 transition-all inline-flex items-center justify-center gap-2"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save as Draft</span>
          </button>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleSave(true)}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all inline-flex items-center justify-center gap-2 shadow-md shadow-primary/20"
          >
            <Send className="w-4 h-4" />
            <span>Submit Observation</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function NewObservationPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]"><span className="text-xs text-muted-foreground animate-pulse">Loading form…</span></div>}>
      <NewObservationInner />
    </Suspense>
  );
}
