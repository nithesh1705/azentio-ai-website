'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  FileCheck2,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Lock,
  ArrowRight,
} from 'lucide-react';

export default function OnboardingTermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="max-w-2xl mb-10">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs uppercase tracking-widest font-bold text-primary">
            Azentio Governance Protocol
          </span>
          <span className="badge-synthetic text-xs">Policy v1.0-2026</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
          Terms of Collaboration & Sharing Disclosure
        </h1>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
          Mandatory first-time client journey onboarding. Please review our architectural commitments regarding data isolation, de-identification, and voluntary sharing.
        </p>
      </div>

      <div className="p-8 sm:p-10 rounded-3xl glass-panel border border-border space-y-8">
        {/* Core Principle 4 Alert */}
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-800 dark:text-emerald-300 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-sm">Fundamental Guarantee: Joining Workspace ≠ Consent to Share or Train</span>
            <p className="leading-relaxed">
              Accepting an invitation to your organisation&apos;s workspace provides access to entitled product sandboxes and private drafting. It does not authorize any cross-tenant sharing, public disclosure, or AI training on your data.
            </p>
          </div>
        </div>

        <div className="space-y-6 text-xs sm:text-sm text-muted-foreground leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-base font-bold text-foreground">1. Granular Four-Part Consent Architecture</h2>
            <p>
              Each observation submitted carries four distinct, non-conflated permissions recorded with cryptographic timestamps:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2 text-xs">
              <li><strong className="text-foreground">Consent to Process:</strong> Enables internal storage and tenant-scoped analysis.</li>
              <li><strong className="text-foreground">Consent to Publish:</strong> Authorizes publication of a reviewed, de-identified shared representation.</li>
              <li><strong className="text-foreground">Consent to Attribution:</strong> Optional disclosure of your institution&apos;s name (defaults to off/anonymous).</li>
              <li><strong className="text-foreground">Consent to Model Training:</strong> Independent permission for future federated model programs (default off).</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-foreground">2. Synchronous Withdrawal SLA (≤ 60 Seconds)</h2>
            <p>
              Authors and Client Administrators retain the perpetual right to withdraw published contributions. Withdrawal executes as a single database transaction, immediately and synchronously purging the contribution from search indexes, theme aggregates, and AIRA retrieval.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-foreground">3. Radical Honesty & Synthetic Labelling</h2>
            <p>
              All demonstrator scenarios, simulation metrics, and sandbox recommendations are derived from synthetic data. Outputs are not approved credit, business, or regulatory decisions.
            </p>
          </section>
        </div>

        <div className="pt-6 border-t border-border flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            Conforms strictly to SOURCE_OF_TRUTH.md §6.3
          </span>

          <Link
            href="/client"
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs hover:bg-primary/90 transition-all shadow-md shadow-emerald-500/20"
          >
            <span>Acknowledge & Enter Workspace</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
