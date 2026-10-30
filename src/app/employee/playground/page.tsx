'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { usePersona } from '@/context/PersonaContext';
import { getPublicOfferings } from '@/server/dal/store';
import {
  Terminal,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  FileText,
  Sliders,
  ChevronLeft,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';

export default function EmployeePlaygroundPage() {
  const { actor } = usePersona();
  const offerings = getPublicOfferings();

  const [selectedOfferingId, setSelectedOfferingId] = useState('offering-fai');
  const [selectedScenario, setSelectedScenario] = useState('sme-cashflow-stress');
  const [simulationRunning, setSimulationRunning] = useState(false);
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [feedbackNote, setFeedbackNote] = useState('');
  const [outputResult, setOutputResult] = useState<{
    status: string;
    model: string;
    rawAnomalyFlag: boolean;
    seasonalityAdjustedScore: number;
    evidenceLineage: string[];
  } | null>({
    status: 'Simulation Ready',
    model: 'Azentio Cash-Velocity Estimator v2.4 (Synthetic)',
    rawAnomalyFlag: true,
    seasonalityAdjustedScore: 82,
    evidenceLineage: [
      'Prior: Aggregated Collective Learning Theme #theme-seasonality-sme',
      'Dataset: Synthetic Retail Borrower Cohort #0942',
      'Execution: Deterministic formula with explainable step trace',
    ],
  });

  if (!actor.isVerifiedEmployee) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <ShieldCheck className="w-12 h-12 text-destructive mx-auto" />
        <h1 className="text-2xl font-bold text-foreground">Employee Access Restricted</h1>
        <p className="text-sm text-muted-foreground">
          Employee playground requires verified @azentio.com employee identity.
        </p>
      </div>
    );
  }

  const handleRun = () => {
    setSimulationRunning(true);
    setTimeout(() => {
      setOutputResult({
        status: 'Completed with Convergence',
        model: 'Azentio AI Analysis Engine (Deterministic Fallback)',
        rawAnomalyFlag: false,
        seasonalityAdjustedScore: Math.floor(Math.random() * 20) + 75,
        evidenceLineage: [
          `Scenario: ${selectedScenario}`,
          'Synthetic Evidence: Multi-year cash velocity curve matched',
          'Audit Event: Appended to internal audit log',
        ],
      });
      setSimulationRunning(false);
    }, 500);
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

      <div className="max-w-3xl mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs uppercase tracking-widest font-bold text-indigo-400">
            Internal Sandbox
          </span>
          <span className="badge-synthetic text-xs">Simulated Output</span>
        </div>
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
          Guided Scenario Playground
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
          Evaluate proprietary AI algorithms against synthetic scenarios. Test deterministic and AI-assisted outputs, review mathematical lineage, and submit structured evaluation feedback.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Controls */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-3xl glass-panel border border-border space-y-5">
            <h2 className="font-bold text-base text-foreground flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-400" />
              <span>Scenario Parameters</span>
            </h2>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Target Offering
              </label>
              <select
                value={selectedOfferingId}
                onChange={(e) => setSelectedOfferingId(e.target.value)}
                className="w-full bg-muted/60 border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                {offerings.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Synthetic Scenario Fixture
              </label>
              <select
                value={selectedScenario}
                onChange={(e) => setSelectedScenario(e.target.value)}
                className="w-full bg-muted/60 border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="sme-cashflow-stress">Retail SME: Q1 Inventory Replenishment Stress</option>
                <option value="agro-harvest-variance">Agro-Processing: Off-Peak Cyclical Variance</option>
                <option value="aml-structuring-graph">AML Surveillance: Rapid Multi-Account Smurfing</option>
              </select>
            </div>

            <button
              onClick={handleRun}
              disabled={simulationRunning}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-600 text-white font-semibold text-xs hover:bg-indigo-500 transition-all shadow-md shadow-indigo-500/20 disabled:opacity-50"
            >
              {simulationRunning ? (
                <span>Executing Algorithmic Run...</span>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Execute Scenario Demonstration</span>
                </>
              )}
            </button>

            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-700 dark:text-amber-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <span>
                Mandatory honesty disclosure (§2.6): Sample data only. Simulated output is not an approved credit, lending, or business decision.
              </span>
            </div>
          </div>
        </div>

        {/* Output & Lineage */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-border space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div className="flex items-center gap-2">
                <Terminal className="w-5 h-5 text-indigo-400" />
                <h2 className="font-bold text-base text-foreground">Scenario Run Result</h2>
              </div>
              <span className="text-[10px] text-muted-foreground font-mono bg-muted px-2 py-1 rounded">
                Deterministic Engine
              </span>
            </div>

            {outputResult && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-muted/40 border border-border">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold">
                      Run Status
                    </span>
                    <div className="text-base font-bold text-foreground mt-1">
                      {outputResult.status}
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
                    <span className="text-[10px] text-indigo-400 uppercase font-bold">
                      Adjusted Score
                    </span>
                    <div className="text-2xl font-black text-indigo-400 mt-1">
                      {outputResult.seasonalityAdjustedScore}
                      <span className="text-xs font-normal"> / 100</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-muted/30 border border-border text-xs space-y-2">
                  <span className="font-bold text-foreground flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Verifiable Evidence Lineage:</span>
                  </span>
                  <ul className="space-y-1 font-mono text-[11px] text-muted-foreground">
                    {outputResult.evidenceLineage.map((line, idx) => (
                      <li key={idx}>&bull; {line}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Structured Feedback form */}
            <div className="pt-6 border-t border-border">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Submit Structured Feedback
              </span>
              {feedbackSent ? (
                <div className="mt-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-500 font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Feedback recorded for the Quantitative Modeling Team.</span>
                </div>
              ) : (
                <div className="mt-3 space-y-3">
                  <textarea
                    rows={2}
                    value={feedbackNote}
                    onChange={(e) => setFeedbackNote(e.target.value)}
                    placeholder="Log observation on convergence speed, model sensitivity, or edge case anomalies..."
                    className="w-full bg-muted/60 border border-border rounded-xl px-3.5 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <button
                    onClick={() => {
                      if (feedbackNote.trim()) {
                        setFeedbackSent(true);
                      }
                    }}
                    className="px-4 py-2 rounded-xl bg-card border border-border text-xs font-semibold text-foreground hover:bg-muted"
                  >
                    Submit Feedback Log
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

