'use client';

import React, { useState, use } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { getOfferingBySlug } from '@/server/dal/store';
import {
  Sparkles,
  CheckCircle2,
  ChevronLeft,
  Play,
  RefreshCw,
  Cpu,
  ShieldCheck,
  TrendingUp,
  AlertCircle,
  FileText,
  BarChart2,
  Sliders,
} from 'lucide-react';

export default function OfferingDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = use(params);
  const offering = getOfferingBySlug(resolvedParams.slug);

  if (!offering) {
    notFound();
  }

  // Interactive Sandbox State
  const [selectedSector, setSelectedSector] = useState('Retail & Wholesale');
  const [cashFlowTurnover, setCashFlowTurnover] = useState(1200000);
  const [q1SeasonalityShock, setQ1SeasonalityShock] = useState(25);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState<{
    riskScore: number;
    delinquencyProbability: number;
    adjustedRiskScore: number;
    seasonalitySuppressionActive: boolean;
    recommendation: string;
    evidenceLineage: string[];
  } | null>({
    riskScore: 78,
    delinquencyProbability: 4.2,
    adjustedRiskScore: 38,
    seasonalitySuppressionActive: true,
    recommendation:
      'Seasonality Normalization Engaged: Q1 inventory draw-down detected. Spurious default alarm suppressed.',
    evidenceLineage: [
      'Source: Aggregated Retail SME Cycle Prior (Theme #theme-seasonality-sme)',
      'Deterministic Formula: Cash Velocity Ratio = 1.48 (Healthy baseline for sector)',
      'Collective Learning Citations: Alder Finance (pub-obs-01), Birchway Bank (pub-obs-02)',
    ],
  });

  const handleRunSimulation = () => {
    setIsSimulating(true);
    setTimeout(() => {
      const rawScore = Math.min(95, Math.round(50 + q1SeasonalityShock * 1.2));
      const adjustedScore = Math.round(rawScore * 0.52);
      setSimulationResult({
        riskScore: rawScore,
        delinquencyProbability: Number((rawScore * 0.12).toFixed(1)),
        adjustedRiskScore: adjustedScore,
        seasonalitySuppressionActive: true,
        recommendation: `Simulated for ${selectedSector}: Raw stress triggered Score ${rawScore}, but seasonality engine filtered post-holiday working capital friction to Normalized Score ${adjustedScore}.`,
        evidenceLineage: [
          `Sector Benchmark: ${selectedSector} cyclical variance baseline`,
          `Simulated Liquidity Shock: -${q1SeasonalityShock}% off-peak cash variance`,
          'Governed Prior: Cross-client shared learning theme Seasonality Context applied',
        ],
      });
      setIsSimulating(false);
    }, 600);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Link
          href="/offerings"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Solution Catalogue</span>
        </Link>
      </div>

      {/* Hero Header */}
      <div className="p-8 sm:p-12 rounded-3xl glass-panel border border-border relative overflow-hidden mb-12">
        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center gap-2 mb-4">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
              {offering.category}
            </span>
            {offering.badge && (
              <span className="text-xs font-semibold text-amber-500 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                {offering.badge}
              </span>
            )}
            <span className="badge-synthetic text-xs">Synthetic Sandbox</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-foreground tracking-tight">
            {offering.name}
          </h1>
          <p className="mt-3 text-base sm:text-lg font-medium text-emerald-600 dark:text-emerald-400">
            {offering.tagline}
          </p>
          <p className="mt-4 text-xs sm:text-sm text-muted-foreground leading-relaxed">
            {offering.description}
          </p>
        </div>
      </div>

      {/* Two Column Layout: Architecture Modules & Interactive Synthetic Demo */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Architecture & Capabilities */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-2xl glass-panel border border-border">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <Cpu className="w-4 h-4 text-primary" />
              <span>Core Architecture Specifications</span>
            </h2>

            <div className="mt-4 space-y-4">
              {offering.capabilities.map((cap, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-muted/40 border border-border/80 space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-foreground">{cap.title}</span>
                    {cap.badge && (
                      <span className="text-[10px] text-primary bg-primary/10 px-2 py-0.5 rounded-md font-medium">
                        {cap.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {cap.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 rounded-2xl glass-panel border border-border">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-500" />
              <span>Verifiable Lineage & Security</span>
            </h2>
            <ul className="mt-4 space-y-2.5 text-xs text-muted-foreground">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Deterministic mathematical audit trails for all ratio outputs</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Server-enforced audience boundary on training and inference</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Client data retention strictly isolated per tenant workspace</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Right: Interactive Sandbox Runner */}
        <div className="lg:col-span-7">
          <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-border shadow-md">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-emerald-500" />
                <div>
                  <h2 className="font-bold text-base text-foreground">
                    Interactive Demonstration Sandbox
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Simulate real-world SME liquidity stress and seasonality suppression
                  </p>
                </div>
              </div>
              <span className="badge-synthetic text-xs">Sample Data Only</span>
            </div>

            {/* Parameter controls */}
            <div className="mt-6 space-y-5">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Borrower Industry Sector
                </label>
                <select
                  value={selectedSector}
                  onChange={(e) => setSelectedSector(e.target.value)}
                  className="w-full bg-muted/60 border border-border rounded-xl px-3.5 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="Retail & Wholesale">Retail & Wholesale (Post-Holiday Surge)</option>
                  <option value="Agro-Processing & Farming">Agro-Processing (Harvest Cycle Variance)</option>
                  <option value="Hospitality & Tourism">Hospitality & Tourism (Off-Peak Offsets)</option>
                  <option value="Manufacturing & Export">Manufacturing & Export (Working Capital Lag)</option>
                </select>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-foreground mb-1">
                  <span>Q1 Cyclical Turnover Shock</span>
                  <span className="text-primary font-mono">-{q1SeasonalityShock}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="50"
                  step="5"
                  value={q1SeasonalityShock}
                  onChange={(e) => setQ1SeasonalityShock(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>Mild (-5%)</span>
                  <span>Severe Off-Peak (-50%)</span>
                </div>
              </div>

              <button
                onClick={handleRunSimulation}
                disabled={isSimulating}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-xs hover:bg-primary/90 transition-all shadow-md shadow-emerald-500/20 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
              >
                {isSimulating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Executing Sensitivity Engine...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>Run Financial Simulation</span>
                  </>
                )}
              </button>
            </div>

            {/* Simulation Results Output */}
            {simulationResult && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 pt-6 border-t border-border space-y-4"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                    Simulation Outcome
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-semibold">
                    Simulated Output
                  </span>
                </div>

                {/* Score comparison cards */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-center">
                    <span className="text-[10px] uppercase font-bold text-destructive">
                      Unadjusted Raw Distress
                    </span>
                    <div className="text-2xl font-black text-destructive mt-1">
                      {simulationResult.riskScore}
                      <span className="text-xs font-normal"> / 100</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      Spurious default alert triggered
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20 text-center">
                    <span className="text-[10px] uppercase font-bold text-primary">
                      Azentio Normalized Score
                    </span>
                    <div className="text-2xl font-black text-primary mt-1">
                      {simulationResult.adjustedRiskScore}
                      <span className="text-xs font-normal"> / 100</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      Healthy baseline maintained
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-muted/60 border border-border text-xs leading-relaxed space-y-2">
                  <p className="font-medium text-foreground">
                    {simulationResult.recommendation}
                  </p>

                  <div className="pt-2 border-t border-border/80 text-[11px] text-muted-foreground space-y-1">
                    <div className="font-semibold text-foreground flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5 text-primary" />
                      <span>Verifiable Lineage:</span>
                    </div>
                    {simulationResult.evidenceLineage.map((line, idx) => (
                      <p key={idx} className="font-mono text-[10px]">
                        &bull; {line}
                      </p>
                    ))}
                  </div>
                </div>

                <p className="text-[10px] text-muted-foreground italic flex items-center gap-1.5">
                  <AlertCircle className="w-3 h-3 text-amber-500 shrink-0" />
                  <span>
                    Honesty disclaimer: Simulated output for demonstrator evaluation. Not an approved credit or business decision.
                  </span>
                </p>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
