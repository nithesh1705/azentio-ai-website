'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Building2,
  TrendingUp,
  ShieldCheck,
  Cpu,
  ArrowRight,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

export default function SolutionsPage() {
  const solutions = [
    {
      title: 'Commercial Banking & Corporate Credit',
      badge: 'Tier 1 & Regional',
      description:
        'Deliver real-time liquidity analysis, autonomous covenant tracking, and multi-entity credit syndication with zero reconciliation delay.',
      benefits: [
        'Multi-currency ledger settlement',
        'Seasonal cash-flow anomaly suppression',
        'Automated borrower financial statement parsing',
      ],
      offeringLink: '/offerings/financial-analysis-intelligence',
    },
    {
      title: 'Digital Lending & SME Microfinance',
      badge: 'Inclusive Lending',
      description:
        'Scale responsible microloan origination and working capital credit with harvest-adjusted repayments and community learning priors.',
      benefits: [
        'Customizable cash inflow repayment cadences',
        'Real-time automated credit policy execution',
        'Minimal friction self-service borrower onboarding',
      ],
      offeringLink: '/offerings/digital-lending-suite',
    },
    {
      title: 'Regulatory Compliance & AML Intelligence',
      badge: 'Autonomous Surveillance',
      description:
        'Detect sophisticated transaction structuring, smurfing, and cross-border layering using autonomous graph analytics and fuzzy sanction streaming.',
      benefits: [
        'Graph-based entity resolution across banking networks',
        'Automated SAR narrative generation',
        'Audit-ready regulatory proof packets',
      ],
      offeringLink: '/offerings/aml-compliance-monitor',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="max-w-3xl mb-14">
        <span className="text-xs uppercase tracking-widest font-bold text-primary">Targeted Solutions</span>
        <h1 className="text-4xl font-extrabold text-foreground mt-2 tracking-tight">
          Financial Solutions Engineered for Modern Institutions
        </h1>
        <p className="mt-4 text-sm sm:text-base text-muted-foreground leading-relaxed">
          Whether you are modernizing high-frequency corporate banking or expanding microfinance to emerging entrepreneurs, Azentio provides battle-tested architectures.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {solutions.map((sol, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
            className="p-8 rounded-3xl glass-panel border border-border glow-card flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
                  {sol.badge}
                </span>
                <Sparkles className="w-4 h-4 text-emerald-500" />
              </div>

              <h2 className="text-xl font-bold text-foreground">{sol.title}</h2>
              <p className="mt-3 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {sol.description}
              </p>

              <div className="mt-6 pt-6 border-t border-border">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Key Capabilities
                </span>
                <ul className="mt-3 space-y-2 text-xs text-muted-foreground">
                  {sol.benefits.map((b, bIdx) => (
                    <li key={bIdx} className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-border">
              <Link
                href={sol.offeringLink}
                className="inline-flex items-center gap-2 text-xs font-semibold text-primary hover:underline"
              >
                <span>View Underlying Offering</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
