'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  FileText,
  AlertCircle,
  ShieldCheck,
  Building2,
  Calendar,
  ArrowRight,
} from 'lucide-react';

export default function PublicInsightsPage() {
  const publicInsights = [
    {
      id: 'insight-01',
      title: 'Cyclical Seasonality in SME Cash Flows: Analysis of Post-Holiday Liquidity Dips',
      date: 'October 26, 2026',
      readTime: '6 min read',
      category: 'Credit Risk & SME Banking',
      summary:
        'Cross-institutional analysis of retail and agro-processing borrower cohorts reveals that 40% of standard covenant delinquency triggers in Q1 represent predictable seasonal inventory lag rather than structural financial insolvency.',
      keyTakeaways: [
        'Rigid monthly debt service schedules amplify perceived risk during inventory build cycles.',
        'Normalizing cash velocity against multi-year sector seasonality curves eliminates 85% of false alerts.',
        'Field tests across 3 synthetic cohorts showed dramatic default reduction with harvest-aligned payments.',
      ],
      offeringSlug: 'financial-analysis-intelligence',
      offeringName: 'Financial Analysis Intelligence',
      distinctInstitutions: 3,
    },
    {
      id: 'insight-02',
      title: 'Autonomous Graph Analytics for Multi-Account Structuring and Smurfing Detection',
      date: 'October 18, 2026',
      readTime: '8 min read',
      category: 'Regulatory Surveillance & AML',
      summary:
        'How modern fuzzy entity resolution and graph-based network traversals uncover multi-institution structuring patterns that evade isolated threshold rule systems.',
      keyTakeaways: [
        'Isolated account monitoring misses deposits deliberately partitioned under reporting thresholds.',
        'Graph-based community clustering exposes beneficial ownership linkages in sub-seconds.',
        'SAR narrative drafts generated with mathematical proof citations speed compliance reviews by 60%.',
      ],
      offeringSlug: 'aml-compliance-monitor',
      offeringName: 'AML & Fraud Surveillance Suite',
      distinctInstitutions: 3,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs uppercase tracking-widest font-bold text-primary">Public Research & Knowledge Hub</span>
        <h1 className="text-4xl font-extrabold text-foreground mt-2 tracking-tight">
          Governed Market Insights & Syntheses
        </h1>
        <p className="mt-4 text-sm sm:text-base text-muted-foreground leading-relaxed">
          Approved, de-identified research derived from our collective-learning community. Explore our industry events, global hackathons, research blogs, and open career roles below.
        </p>
      </div>

      {/* Sub-section Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          href="/insights/events"
          className="p-5 rounded-2xl glass-panel border border-border/80 hover:border-emerald-500/40 hover:bg-card transition-all group shadow-sm flex flex-col justify-between"
        >
          <div className="space-y-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
              <Calendar className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">
              Industry Events
            </h3>
            <p className="text-xs text-muted-foreground">
              Global AI summits, executive roundtables, and live webinars.
            </p>
          </div>
          <div className="pt-3 text-[11px] font-semibold text-primary flex items-center gap-1 group-hover:translate-x-1 transition-transform">
            <span>Explore events</span>
            <ArrowRight className="w-3 h-3" />
          </div>
        </Link>

        <Link
          href="/insights/hackathons"
          className="p-5 rounded-2xl glass-panel border border-border/80 hover:border-emerald-500/40 hover:bg-card transition-all group shadow-sm flex flex-col justify-between"
        >
          <div className="space-y-2">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center font-bold">
              <FileText className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">
              AI Hackathons
            </h3>
            <p className="text-xs text-muted-foreground">
              Register teams for the 2026 Agentic AI Banking Hackathon.
            </p>
          </div>
          <div className="pt-3 text-[11px] font-semibold text-primary flex items-center gap-1 group-hover:translate-x-1 transition-transform">
            <span>Register team</span>
            <ArrowRight className="w-3 h-3" />
          </div>
        </Link>

        <Link
          href="/insights/blogs"
          className="p-5 rounded-2xl glass-panel border border-border/80 hover:border-emerald-500/40 hover:bg-card transition-all group shadow-sm flex flex-col justify-between"
        >
          <div className="space-y-2">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">
              Research & Blogs
            </h3>
            <p className="text-xs text-muted-foreground">
              Engineering deep-dives into federated learning and zero hallucination.
            </p>
          </div>
          <div className="pt-3 text-[11px] font-semibold text-primary flex items-center gap-1 group-hover:translate-x-1 transition-transform">
            <span>Read blogs</span>
            <ArrowRight className="w-3 h-3" />
          </div>
        </Link>

        <Link
          href="/careers"
          className="p-5 rounded-2xl glass-panel border border-border/80 hover:border-emerald-500/40 hover:bg-card transition-all group shadow-sm flex flex-col justify-between"
        >
          <div className="space-y-2">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-bold">
              <Building2 className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">
              Careers & Roles
            </h3>
            <p className="text-xs text-muted-foreground">
              Open positions across Singapore, Mumbai, Dubai, and London.
            </p>
          </div>
          <div className="pt-3 text-[11px] font-semibold text-primary flex items-center gap-1 group-hover:translate-x-1 transition-transform">
            <span>Join our team</span>
            <ArrowRight className="w-3 h-3" />
          </div>
        </Link>
      </div>

      <div className="space-y-8">
        {publicInsights.map((insight, idx) => (
          <motion.article
            key={insight.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
            className="p-8 rounded-3xl glass-panel border border-border glow-card"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-semibold text-[11px]">
                  {insight.category}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {insight.date}
                </span>
                <span>&bull;</span>
                <span>{insight.readTime}</span>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Aggregated Across {insight.distinctInstitutions} Institutions</span>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-foreground">{insight.title}</h2>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              {insight.summary}
            </p>

            <div className="mt-6 p-4 rounded-2xl bg-muted/50 border border-border">
              <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                Synthesized Key Findings
              </span>
              <ul className="mt-2.5 space-y-1.5 text-xs text-muted-foreground">
                {insight.keyTakeaways.map((takeaway, tIdx) => (
                  <li key={tIdx} className="flex items-start gap-2">
                    <span className="text-primary font-bold">&bull;</span>
                    <span>{takeaway}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-6 pt-4 border-t border-border flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Relevant Offering:</span>
                <Link
                  href={`/offerings/${insight.offeringSlug}`}
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  {insight.offeringName}
                </Link>
              </div>

              <span className="text-[11px] text-muted-foreground italic flex items-center gap-1">
                <AlertCircle className="w-3 h-3 text-amber-500" />
                Popularity ≠ prevalence ≠ proof of causation. Synthetic data study.
              </span>
            </div>
          </motion.article>
        ))}
      </div>
    </div>
  );
}

