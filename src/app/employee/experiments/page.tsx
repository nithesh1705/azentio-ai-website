'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePersona } from '@/context/PersonaContext';
import {
  FlaskConical,
  PlusCircle,
  CheckCircle2,
  ChevronLeft,
  ShieldCheck,
  Send,
} from 'lucide-react';

export default function EmployeeExperimentsPage() {
  const { actor } = usePersona();

  const [experiments, setExperiments] = useState([
    {
      id: 'exp-01',
      title: 'Graph Convolutional Networks for Fuzzy Sanction Structuring',
      submittedBy: 'Maya Lin',
      status: 'In Validation',
      hypothesis:
        'Graph convolutions increase smurfing cluster recall by 18% over standard heuristic threshold checks.',
    },
    {
      id: 'exp-02',
      title: 'Contextual Multi-Year Cyclical Cash Flow Normalizer',
      submittedBy: 'Tariq Al-Mansoor',
      status: 'Promoted to Candidate',
      hypothesis:
        'Industry-specific harmonic baselines prevent spurious default alerts on seasonal retail businesses.',
    },
  ]);

  const [title, setTitle] = useState('');
  const [hypothesis, setHypothesis] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!actor.isVerifiedEmployee) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <ShieldCheck className="w-12 h-12 text-destructive mx-auto" />
        <h1 className="text-2xl font-bold text-foreground">Employee Access Restricted</h1>
        <p className="text-sm text-muted-foreground">
          Experiments submission is restricted to verified employees.
        </p>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !hypothesis) return;

    setExperiments((prev) => [
      {
        id: `exp-${Date.now()}`,
        title,
        submittedBy: actor.name,
        status: 'Submitted for Lab Review',
        hypothesis,
      },
      ...prev,
    ]);

    setSubmitted(true);
    setTitle('');
    setHypothesis('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-6">
        <Link
          href="/employee"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Employee Portal</span>
        </Link>
      </div>

      <div className="max-w-3xl mb-10">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs uppercase tracking-widest font-bold text-cyan-400">
            Internal R&D Lab
          </span>
          <span className="badge-synthetic text-xs">Sandbox Prototyping</span>
        </div>
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
          Algorithmic Experiments Lab
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
          Propose and review experimental machine learning hypotheses before promoting models to entitled client sandboxes.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-4">
          <h2 className="font-bold text-base text-foreground mb-4">
            Active Experiments ({experiments.length})
          </h2>

          {experiments.map((exp) => (
            <div
              key={exp.id}
              className="p-6 rounded-3xl glass-panel border border-border space-y-2 glow-card"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-base text-foreground">{exp.title}</h3>
                <span className="text-[10px] font-semibold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                  {exp.status}
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{exp.hypothesis}</p>
              <div className="pt-2 text-[10px] text-muted-foreground">
                Submitted by <span className="text-foreground font-medium">{exp.submittedBy}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-5">
          <div className="p-6 rounded-3xl glass-panel border border-border space-y-4">
            <h2 className="font-bold text-base text-foreground flex items-center gap-2">
              <FlaskConical className="w-4 h-4 text-cyan-400" />
              <span>Submit New Experiment</span>
            </h2>

            {submitted && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-500 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Experiment logged successfully.</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Experiment Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Adaptive Kalman filter for cash velocity"
                  className="w-full bg-muted/60 border border-border rounded-xl px-3.5 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Hypothesis & Metric Target
                </label>
                <textarea
                  rows={3}
                  required
                  value={hypothesis}
                  onChange={(e) => setHypothesis(e.target.value)}
                  placeholder="Expected reduction in false alarms, dataset requirements, and fallback constraints..."
                  className="w-full bg-muted/60 border border-border rounded-xl px-3.5 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-xs hover:bg-indigo-500 transition-all shadow-md shadow-indigo-500/20"
              >
                Submit Experiment
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
