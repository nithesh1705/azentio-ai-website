'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { usePersona } from '@/context/PersonaContext';
import { recordTermsAcceptance } from '@/server/dal/client/invitations';
import {
  ShieldCheck,
  CheckCircle2,
  Lock,
  Sparkles,
  ArrowRight,
  BookOpen,
  AlertTriangle,
  Building2,
} from 'lucide-react';

export default function OnboardingTermsPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-muted-foreground">Loading Terms...</div>}>
      <OnboardingTermsContent />
    </Suspense>
  );
}

function OnboardingTermsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orgId = searchParams.get('orgId') || 'org-abcd';
  const { actor, availableOrganisations, setActiveTenantId } = usePersona();

  const [hasAgreed, setHasAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const org = availableOrganisations.find((o) => o.id === orgId);
  const orgName = org?.name || 'Your Client Organisation';

  const handleAcceptTerms = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasAgreed || !actor) return;
    setIsSubmitting(true);

    try {
      recordTermsAcceptance(actor, orgId, '2026.1-v1');
      setActiveTenantId(orgId);
      router.push('/client');
    } catch (err: any) {
      alert(err.message || 'Failed to record terms acceptance');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl bg-card border border-border rounded-3xl p-6 sm:p-10 shadow-xl space-y-8"
      >
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Workspace Governance & Terms
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
            Welcome to the <strong className="text-foreground">{orgName}</strong> collaboration hub on azentio.ai.
          </p>
        </div>

        {/* Clear Plain-Language Explainer (Mandatory Invariant) */}
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5 space-y-3">
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>Essential Privacy & Sharing Principles</span>
          </div>

          <ul className="space-y-2 text-xs text-foreground/90 leading-relaxed">
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">•</span>
              <span>
                <strong>Joining is not consent to share or train: </strong>
                Entering this workspace grants zero automatic rights for Azentio or other institutions to view your data or train models on your activity.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">•</span>
              <span>
                <strong>Granular per-observation consent: </strong>
                Every observation you create defaults to <em>"Private to me"</em>. Sharing within your organization or proposing to the learning community requires deliberate, independent action.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">•</span>
              <span>
                <strong>Zero AI Training by default: </strong>
                Model training consents are strictly decoupled and default to OFF. No training consent is collected on this screen.
              </span>
            </li>
          </ul>
        </div>

        {/* Workspace Terms Details */}
        <div className="rounded-2xl border border-border bg-muted/20 p-5 space-y-3 text-xs max-h-56 overflow-y-auto font-mono text-muted-foreground leading-relaxed">
          <p className="font-bold text-foreground">Azentio Enterprise Collaboration Terms (v2026.1)</p>
          <p>
            1. <strong>Authorized Use</strong>: You agree to use the workspace solely for authorized financial intelligence evaluation, collective learning, and prototype simulation.
          </p>
          <p>
            2. <strong>Restricted Data</strong>: You must NOT upload live production account numbers, client PII, confidential contract terms, or security credentials.
          </p>
          <p>
            3. <strong>Tenant Isolation</strong>: Access is strictly scoped to your authorized organization tier and active entitlements. Attempts to tamper with tenant identifiers are audited and blocked.
          </p>
          <p>
            4. <strong>Audit Logging</strong>: All administrative actions, invitations, and contribution transitions are recorded in an append-only audit trail.
          </p>
        </div>

        <form onSubmit={handleAcceptTerms} className="space-y-6">
          <label className="flex items-start gap-3 cursor-pointer p-4 rounded-2xl border border-border bg-muted/30 hover:bg-muted/50 transition-colors">
            <input
              type="checkbox"
              required
              checked={hasAgreed}
              onChange={(e) => setHasAgreed(e.target.checked)}
              className="w-4 h-4 rounded border-input text-primary focus:ring-primary/20 mt-0.5"
            />
            <span className="text-xs text-foreground">
              I have read and agree to the <strong>Workspace Terms</strong> for <strong>{orgName}</strong>. I understand that sharing market observations or consenting to model training remains entirely optional and requires separate affirmative action.
            </span>
          </label>

          <div className="flex items-center justify-between pt-2 border-t border-border">
            <Link
              href="/choose-workspace"
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Cancel / Switch Workspace
            </Link>

            <button
              type="submit"
              disabled={!hasAgreed || isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all shadow-md shadow-primary/20 disabled:opacity-50"
            >
              <span>{isSubmitting ? 'Entering...' : 'Accept & Proceed to Dashboard'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
