'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase,
  MapPin,
  Clock,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Heart,
  TrendingUp,
  Cpu,
  ShieldCheck,
  Send,
  X,
  Building,
} from 'lucide-react';

const OPEN_POSITIONS = [
  {
    id: 'pos-01',
    title: 'Principal AI Research Scientist — Federated & Privacy-Preserving ML',
    department: 'Applied AI & Cryptographic Learning',
    location: 'Singapore / Remote Optional',
    type: 'Full-time',
    experience: '8+ Years',
    description:
      'Architect novel federated learning aggregation algorithms and differential privacy budgets across multi-institution banking consortiums.',
    requirements: [
      'PhD or equivalent in Computer Science, Machine Learning, or Applied Mathematics',
      'Demonstrated track record in federated learning frameworks and differential privacy guarantees',
      'Proficiency in PyTorch, Rust, and secure enclave execution (TEE/SGX)',
    ],
  },
  {
    id: 'pos-02',
    title: 'Lead Full-Stack Agentic Systems Engineer',
    department: 'Platform Engineering',
    location: 'Mumbai / Hybrid',
    type: 'Full-time',
    experience: '6+ Years',
    description:
      'Build ultra-low latency, mission-critical microfrontends and agentic human-in-the-loop workflows across Next.js, TypeScript, PostgreSQL, and streaming LLM architectures.',
    requirements: [
      'Expertise in TypeScript, Next.js App Router, React 19, and Tailwind CSS',
      'Strong distributed systems background with transactional DAL and outbox patterns',
      'Experience building animative, highly accessible enterprise design systems',
    ],
  },
  {
    id: 'pos-03',
    title: 'Senior Banking Domain Ontologist & Semantic Architect',
    department: 'Financial Intelligence',
    location: 'Dubai / Singapore',
    type: 'Full-time',
    experience: '5+ Years',
    description:
      'Formulate knowledge graphs, credit taxonomies, and multi-currency regulatory heuristics that power AIRA retrieval and de-identified theme synthesis.',
    requirements: [
      'Deep background in commercial credit analysis, Basel III/IV, or AML compliance',
      'Knowledge graph engineering (RDF, OWL, Cypher/Neo4j)',
      'Experience interfacing domain experts with generative AI pipelines',
    ],
  },
  {
    id: 'pos-04',
    title: 'Enterprise AI Governance & Model Auditor',
    department: 'Risk, Safety & Compliance',
    location: 'London / Hybrid',
    type: 'Full-time',
    experience: '5+ Years',
    description:
      'Lead automated hallucination benchmarking, synthetic data audit routines, and regulatory compliance verification for Tier-1 financial deployments.',
    requirements: [
      'Proven experience in model risk management (SR 11-7) or EU AI Act conformance',
      'Strong auditing background with automated testing harnesses',
      'Clear technical communication with central banking regulatory bodies',
    ],
  },
];

const BENEFITS = [
  {
    title: 'Global High-Impact Mission',
    description: 'Transform how global financial institutions collaborate on credit risk and fraud prevention.',
    icon: GlobeIcon,
  },
  {
    title: 'Autonomous Innovation Culture',
    description: 'Direct budget for AI experiments, open-source contributions, and research publication.',
    icon: Sparkles,
  },
  {
    title: 'Comprehensive Health & Wellness',
    description: 'Premium international health coverage, mental wellness support, and flexible sabbatical options.',
    icon: Heart,
  },
  {
    title: 'Equity & Competitive Compensation',
    description: 'Top-of-market base salary, performance rewards, and substantial equity ownership grants.',
    icon: TrendingUp,
  },
];

function GlobeIcon(props: any) {
  return <Building {...props} />;
}

export default function CareersPage() {
  const [selectedJob, setSelectedJob] = useState<any | null>(null);
  const [applied, setApplied] = useState(false);
  const [applicant, setApplicant] = useState({ name: '', email: '', resumeUrl: '', note: '' });

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    setApplied(true);
    setTimeout(() => {
      setApplied(false);
      setSelectedJob(null);
      setApplicant({ name: '', email: '', resumeUrl: '', note: '' });
    }, 2500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-20">
      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
          <Briefcase className="w-3.5 h-3.5" />
          <span>Shape the Future of Governed Collective AI</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-foreground tracking-tight">
          Build With Us at <span className="text-emerald-500">azentio.ai</span>
        </h1>
        <p className="text-base text-muted-foreground">
          We are assembling a world-class team of machine learning researchers, systems architects, and banking domain experts to pioneer privacy-first collective intelligence for financial services.
        </p>
      </div>

      {/* Culture & Benefits */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {BENEFITS.map((b) => {
          const Icon = b.icon;
          return (
            <div
              key={b.title}
              className="p-6 rounded-3xl glass-panel border border-border/80 space-y-3 hover:border-emerald-500/40 transition-all shadow-sm"
            >
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-foreground">{b.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{b.description}</p>
            </div>
          );
        })}
      </div>

      {/* Open Roles Section */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-foreground">Current Open Positions</h2>
            <p className="text-xs text-muted-foreground mt-1">
              All roles support flexible remote or hybrid work across our corporate hubs in Singapore, Mumbai, Dubai, and London.
            </p>
          </div>
          <span className="text-xs font-mono font-semibold text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full w-fit">
            {OPEN_POSITIONS.length} Active Positions
          </span>
        </div>

        <div className="space-y-4">
          {OPEN_POSITIONS.map((job) => (
            <motion.div
              key={job.id}
              whileHover={{ scale: 1.005 }}
              className="p-6 sm:p-8 rounded-3xl glass-panel border border-border/80 hover:border-emerald-500/40 transition-all shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="space-y-2 max-w-2xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    {job.department}
                  </span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-card border border-border text-foreground">
                    {job.type}
                  </span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {job.location}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-foreground">{job.title}</h3>
                <p className="text-xs text-muted-foreground line-clamp-2">{job.description}</p>
              </div>

              <div className="shrink-0">
                <button
                  onClick={() => setSelectedJob(job)}
                  className="w-full md:w-auto px-5 py-2.5 rounded-xl font-semibold text-xs bg-primary text-primary-foreground hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-md shadow-primary/20 hover:scale-105 active:scale-95"
                >
                  <span>View Details & Apply</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Application Modal */}
      <AnimatePresence>
        {selectedJob && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl rounded-3xl bg-card border border-border p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto space-y-6"
            >
              <button
                onClick={() => setSelectedJob(null)}
                className="absolute top-6 right-6 p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent"
              >
                <X className="w-5 h-5" />
              </button>

              {applied ? (
                <div className="text-center py-12 space-y-3">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto border border-emerald-500/20">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">Application Submitted</h3>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                    Thank you for applying, {applicant.name}. Our talent team will review your profile for {selectedJob.title} shortly.
                  </p>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-emerald-500 uppercase tracking-wider">
                      {selectedJob.department}
                    </span>
                    <h2 className="text-2xl font-black text-foreground">{selectedJob.title}</h2>
                    <p className="text-xs text-muted-foreground">
                      {selectedJob.location} • {selectedJob.type} • Experience: {selectedJob.experience}
                    </p>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="font-semibold text-foreground">Core Requirements:</div>
                    <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                      {selectedJob.requirements.map((req: string, i: number) => (
                        <li key={i}>{req}</li>
                      ))}
                    </ul>
                  </div>

                  <form onSubmit={handleApply} className="space-y-4 pt-4 border-t border-border">
                    <div className="text-xs font-bold text-foreground uppercase tracking-wider">
                      Submit Your Candidacy
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[11px] font-medium text-foreground">Full Name *</label>
                        <input
                          type="text"
                          required
                          value={applicant.name}
                          onChange={(e) => setApplicant({ ...applicant, name: e.target.value })}
                          placeholder="Your full name"
                          className="w-full px-3 py-2 rounded-xl border border-input bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-medium text-foreground">Email Address *</label>
                        <input
                          type="email"
                          required
                          value={applicant.email}
                          onChange={(e) => setApplicant({ ...applicant, email: e.target.value })}
                          placeholder="your.email@domain.com"
                          className="w-full px-3 py-2 rounded-xl border border-input bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-foreground">LinkedIn / Portfolio URL *</label>
                      <input
                        type="url"
                        required
                        value={applicant.resumeUrl}
                        onChange={(e) => setApplicant({ ...applicant, resumeUrl: e.target.value })}
                        placeholder="https://linkedin.com/in/... or GitHub URL"
                        className="w-full px-3 py-2 rounded-xl border border-input bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-foreground">Brief Note / What excites you about azentio.ai?</label>
                      <textarea
                        rows={3}
                        value={applicant.note}
                        onChange={(e) => setApplicant({ ...applicant, note: e.target.value })}
                        placeholder="Tell us about a relevant challenge you tackled..."
                        className="w-full px-3 py-2 rounded-xl border border-input bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
                      />
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setSelectedJob(null)}
                        className="px-4 py-2 rounded-xl text-xs font-semibold hover:bg-accent text-muted-foreground"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2 rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-1.5 shadow-md"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Submit Application</span>
                      </button>
                    </div>
                  </form>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

