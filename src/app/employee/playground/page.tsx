'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { usePersona } from '@/context/PersonaContext';
import {
  getPlaygroundOfferings,
  getPlaygroundScenarios,
  executePlaygroundRun,
  submitPlaygroundFeedback,
  getPlaygroundFeedback,
} from '@/server/dal/employee/playground';
import {
  Offering,
  PlaygroundScenario,
  PlaygroundRun,
  PlaygroundFeedback,
} from '@/types';
import {
  Terminal,
  ShieldAlert,
  ChevronRight,
  CheckCircle2,
  FileCode,
  Table as TableIcon,
  Download,
  Play,
  RotateCcw,
  Sparkles,
  Cpu,
  Star,
  ExternalLink,
  Layers,
  Info,
  Check,
  AlertCircle,
  HelpCircle,
  Clock,
  Send,
  History,
} from 'lucide-react';

const STEPS = [
  { id: 1, title: 'Choose Offering' },
  { id: 2, title: 'Inspect Scenario' },
  { id: 3, title: 'Configure & Run' },
  { id: 4, title: 'Evidence & Feedback' },
];

export default function GuidedPlaygroundPage() {
  const { actor } = usePersona();

  // State
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [offerings, setOfferings] = useState<Offering[]>([]);
  const [scenarios, setScenarios] = useState<PlaygroundScenario[]>([]);

  // Selections
  const [selectedOfferingId, setSelectedOfferingId] = useState<string>('');
  const [selectedScenario, setSelectedScenario] = useState<PlaygroundScenario | null>(null);

  // Inspector
  const [inputViewMode, setInputViewMode] = useState<'table' | 'json'>('table');

  // Run Config
  const [mode, setMode] = useState<'deterministic' | 'ai_assisted'>('deterministic');
  const [params, setParams] = useState<Record<string, any>>({});
  const [isRunning, setIsRunning] = useState<boolean>(false);

  // Result & Evidence
  const [currentRun, setCurrentRun] = useState<PlaygroundRun | null>(null);

  // Feedback form
  const [feedbackRating, setFeedbackRating] = useState<number>(5);
  const [feedbackCorrectness, setFeedbackCorrectness] = useState<'yes' | 'partly' | 'no'>('yes');
  const [feedbackWorkedWell, setFeedbackWorkedWell] = useState<string>('');
  const [feedbackIssues, setFeedbackIssues] = useState<string>('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState<boolean>(false);
  const [feedbackSuccessMsg, setFeedbackSuccessMsg] = useState<string | null>(null);

  // Initial load
  useEffect(() => {
    if (!actor.isVerifiedEmployee) return;
    try {
      const allOfferings = getPlaygroundOfferings(actor);
      setOfferings(allOfferings);
      if (allOfferings.length > 0) {
        setSelectedOfferingId(allOfferings[0].id);
      }
    } catch (e) {
      console.error(e);
    }
  }, [actor]);

  // Load scenarios when offering changes
  useEffect(() => {
    if (!actor.isVerifiedEmployee || !selectedOfferingId) return;
    try {
      const scens = getPlaygroundScenarios(actor, selectedOfferingId);
      setScenarios(scens);
      if (scens.length > 0) {
        handleSelectScenario(scens[0]);
      } else {
        setSelectedScenario(null);
      }
    } catch (e) {
      console.error(e);
    }
  }, [actor, selectedOfferingId]);

  const handleSelectScenario = (scen: PlaygroundScenario) => {
    setSelectedScenario(scen);
    // Initialize default params
    const initialParams: Record<string, any> = {};
    scen.parameters.forEach((p) => {
      initialParams[p.key] = p.default;
    });
    setParams(initialParams);
  };

  const handleRunSimulation = () => {
    if (!selectedScenario || !actor) return;
    setIsRunning(true);

    setTimeout(() => {
      try {
        const run = executePlaygroundRun(actor, {
          scenarioId: selectedScenario.id,
          mode,
          params,
        });
        setCurrentRun(run);
        setFeedbackSubmitted(false);
        setFeedbackSuccessMsg(null);
        setCurrentStep(4);
      } catch (e: any) {
        alert(e.message || 'Run failed');
      } finally {
        setIsRunning(false);
      }
    }, 600);
  };

  const handleSubmitFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentRun || !actor) return;

    try {
      submitPlaygroundFeedback(actor, {
        runId: currentRun.id,
        rating: feedbackRating,
        correctness: feedbackCorrectness,
        workedWell: feedbackWorkedWell,
        issuesFound: feedbackIssues,
        tags: ['Sandbox Feedback', selectedScenario?.title || 'Scenario'],
      });
      setFeedbackSubmitted(true);
      setFeedbackSuccessMsg('Feedback submitted. Stored in employee evaluation log.');
    } catch (err: any) {
      alert(err.message || 'Failed to submit feedback');
    }
  };

  const downloadJson = () => {
    if (!selectedScenario) return;
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(selectedScenario.inputData, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute('href', dataStr);
    dlAnchor.setAttribute('download', `${selectedScenario.id}-inputs.json`);
    dlAnchor.click();
  };

  const downloadCsv = () => {
    if (!selectedScenario) return;
    const entries = Object.entries(selectedScenario.inputData).map(([k, v]) => `"${k}","${typeof v === 'object' ? JSON.stringify(v).replace(/"/g, '""') : v}"`);
    const csvContent = 'data:text/csv;charset=utf-8,Key,Value\n' + entries.join('\n');
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute('href', encodeURI(csvContent));
    dlAnchor.setAttribute('download', `${selectedScenario.id}-inputs.csv`);
    dlAnchor.click();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* 1. Mandatory Persistent Honesty Banner */}
      <div className="flex items-center gap-3 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs sm:text-sm font-semibold">
        <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
        <div className="flex-1">
          <span>Sample data • Simulated output • Not an approved credit or business decision.</span>
          {mode === 'ai_assisted' && (
            <span className="block sm:inline sm:ml-2 text-[11px] font-normal text-amber-700/80 dark:text-amber-400/80">
              AI-assisted — may be wrong. Review the evidence.
            </span>
          )}
        </div>
        <Link
          href="/employee/playground/runs"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-background/80 hover:bg-background text-foreground text-xs font-semibold border border-border shadow-xs shrink-0"
        >
          <History className="w-3.5 h-3.5" />
          <span>Runs History</span>
        </Link>
      </div>

      {/* 2. Stepper Header */}
      <div className="bg-card border border-border rounded-3xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="w-full">
            <div className="flex items-center justify-between md:justify-start md:gap-8 overflow-x-auto pb-2 md:pb-0">
              {STEPS.map((step) => {
                const isActive = currentStep === step.id;
                const isPassed = currentStep > step.id;
                return (
                  <button
                    key={step.id}
                    onClick={() => {
                      if (step.id <= 3 || currentRun) setCurrentStep(step.id);
                    }}
                    disabled={step.id === 4 && !currentRun}
                    className={`flex items-center gap-2.5 text-xs font-semibold whitespace-nowrap transition-all ${
                      isActive
                        ? 'text-primary'
                        : isPassed
                        ? 'text-foreground hover:text-primary cursor-pointer'
                        : 'text-muted-foreground opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold transition-all ${
                        isActive
                          ? 'bg-primary text-primary-foreground shadow-xs'
                          : isPassed
                          ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {isPassed ? <Check className="w-3.5 h-3.5" /> : step.id}
                    </div>
                    <span>{step.title}</span>
                    {step.id < 4 && <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40 hidden md:inline ml-2" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Step Content Panes */}
      <div className="min-h-[460px]">
        {/* STEP 1: CHOOSE OFFERING */}
        {currentStep === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-xl font-bold text-foreground">Select an Offering</h2>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Choose an Azentio banking or enterprise offering to simulate within the sandbox.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {offerings.map((offering) => {
                const isSelected = selectedOfferingId === offering.id;
                return (
                  <div
                    key={offering.id}
                    onClick={() => setSelectedOfferingId(offering.id)}
                    className={`cursor-pointer rounded-3xl p-5 border transition-all ${
                      isSelected
                        ? 'border-primary bg-primary/5 shadow-md shadow-primary/5 ring-2 ring-primary/20'
                        : 'border-border bg-card hover:border-primary/40'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                        <Terminal className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground uppercase">
                        {offering.category}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-foreground mb-1">{offering.name}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-4">
                      {offering.description}
                    </p>

                    <div className="flex flex-wrap gap-1.5">
                      {offering.features?.slice(0, 3).map((f) => (
                        <span key={f} className="text-[10px] px-2 py-0.5 rounded-md bg-muted/60 text-muted-foreground">
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={() => setCurrentStep(2)}
                disabled={!selectedOfferingId}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all shadow-md shadow-primary/20 disabled:opacity-50"
              >
                <span>Continue to Scenarios</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 2: CHOOSE SCENARIO & INSPECT INPUTS */}
        {currentStep === 2 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-xl font-bold text-foreground">Choose Scenario & Inspect Inputs</h2>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Synthetic borrower files, bills of lading, and ledger transactions quarantined for demonstration.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Col: Scenarios List */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Available Scenarios ({scenarios.length})
                </div>

                {scenarios.map((scen) => {
                  const isSelected = selectedScenario?.id === scen.id;
                  return (
                    <div
                      key={scen.id}
                      onClick={() => handleSelectScenario(scen)}
                      className={`cursor-pointer p-4 rounded-2xl border transition-all ${
                        isSelected
                          ? 'border-primary bg-primary/5 ring-1 ring-primary/30'
                          : 'border-border bg-card hover:border-primary/40'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          Synthetic Data
                        </span>
                        <span className="text-[10px] font-semibold text-muted-foreground">
                          {scen.difficulty}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-foreground">{scen.title}</h4>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                        {scen.description}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Right 2 Cols: Synthetic Inputs Inspector */}
              <div className="lg:col-span-2 rounded-3xl border border-border bg-card p-6 space-y-4">
                {selectedScenario ? (
                  <>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border">
                      <div>
                        <h3 className="text-base font-bold text-foreground">{selectedScenario.title}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">{selectedScenario.description}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Table / JSON toggle */}
                        <div className="flex items-center bg-muted/60 p-1 rounded-xl text-xs">
                          <button
                            onClick={() => setInputViewMode('table')}
                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                              inputViewMode === 'table' ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground'
                            }`}
                          >
                            <TableIcon className="w-3.5 h-3.5" />
                            <span>Table</span>
                          </button>
                          <button
                            onClick={() => setInputViewMode('json')}
                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                              inputViewMode === 'json' ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground'
                            }`}
                          >
                            <FileCode className="w-3.5 h-3.5" />
                            <span>JSON</span>
                          </button>
                        </div>

                        {/* Download buttons */}
                        <button
                          onClick={downloadCsv}
                          title="Download CSV"
                          className="p-2 rounded-xl border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground text-xs"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={downloadJson}
                          title="Download JSON"
                          className="p-2 rounded-xl border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground text-xs"
                        >
                          <FileCode className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Inspector content */}
                    {inputViewMode === 'table' ? (
                      <div className="overflow-x-auto rounded-2xl border border-border/80">
                        <table className="w-full text-xs text-left">
                          <thead className="bg-muted/50 text-muted-foreground border-b border-border/80">
                            <tr>
                              <th className="px-4 py-2.5 font-semibold">Parameter / Field</th>
                              <th className="px-4 py-2.5 font-semibold">Value</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border/60">
                            {Object.entries(selectedScenario.inputData).map(([key, val]) => (
                              <tr key={key} className="hover:bg-muted/20">
                                <td className="px-4 py-2.5 font-mono text-[11px] text-foreground font-medium">
                                  {key}
                                </td>
                                <td className="px-4 py-2.5 text-foreground/80 font-mono text-[11px]">
                                  {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <pre className="p-4 rounded-2xl bg-zinc-950 text-zinc-100 font-mono text-xs overflow-x-auto max-h-96">
                        {JSON.stringify(selectedScenario.inputData, null, 2)}
                      </pre>
                    )}

                    <div className="flex items-center justify-between pt-4">
                      <button
                        onClick={() => setCurrentStep(1)}
                        className="px-4 py-2 rounded-xl border border-border text-xs font-semibold text-foreground hover:bg-muted"
                      >
                        Back
                      </button>
                      <button
                        onClick={() => setCurrentStep(3)}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all shadow-md shadow-primary/20"
                      >
                        <span>Configure Parameters</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-muted-foreground py-8 text-center">
                    Select a scenario from the list to view its inputs.
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* STEP 3: CONFIGURE & RUN */}
        {currentStep === 3 && selectedScenario && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 max-w-3xl mx-auto"
          >
            <div>
              <h2 className="text-xl font-bold text-foreground">Configure Simulation Run</h2>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Choose the execution engine mode and adjust scenario parameters.
              </p>
            </div>

            <div className="rounded-3xl border border-border bg-card p-6 space-y-6">
              {/* Engine Mode Selection */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Simulation Engine Mode
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    onClick={() => setMode('deterministic')}
                    className={`cursor-pointer p-4 rounded-2xl border transition-all ${
                      mode === 'deterministic'
                        ? 'border-primary bg-primary/5 ring-1 ring-primary/30'
                        : 'border-border bg-muted/20 hover:border-border/80'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Cpu className="w-4 h-4 text-primary" />
                        <span className="text-xs font-bold text-foreground">Deterministic Rule Engine</span>
                      </div>
                      {mode === 'deterministic' && <CheckCircle2 className="w-4 h-4 text-primary" />}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Guaranteed reproducible output based on fixed regulatory formulas and credit thresholds.
                    </p>
                  </div>

                  <div
                    onClick={() => setMode('ai_assisted')}
                    className={`cursor-pointer p-4 rounded-2xl border transition-all ${
                      mode === 'ai_assisted'
                        ? 'border-primary bg-primary/5 ring-1 ring-primary/30'
                        : 'border-border bg-muted/20 hover:border-border/80'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-primary" />
                        <span className="text-xs font-bold text-foreground">AI-Assisted Engine</span>
                      </div>
                      {mode === 'ai_assisted' && <CheckCircle2 className="w-4 h-4 text-primary" />}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Evaluates scenarios through generative credit reasoning with explainable evidence attribution.
                    </p>
                  </div>
                </div>
              </div>

              {/* Dynamic Parameter Form */}
              <div className="space-y-4 pt-2 border-t border-border">
                <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Scenario Parameters
                </label>

                {selectedScenario.parameters.map((p) => (
                  <div key={p.key} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-foreground">{p.label}</label>
                      <span className="text-[10px] font-mono text-muted-foreground">{p.key}</span>
                    </div>

                    {p.type === 'number' && (
                      <input
                        type="number"
                        value={params[p.key] ?? p.default}
                        onChange={(e) => setParams({ ...params, [p.key]: Number(e.target.value) })}
                        className="w-full px-3.5 py-2 rounded-xl border border-input bg-background text-xs text-foreground focus:ring-2 focus:ring-primary/20 outline-none"
                      />
                    )}

                    {p.type === 'select' && p.options && (
                      <select
                        value={params[p.key] ?? p.default}
                        onChange={(e) => setParams({ ...params, [p.key]: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl border border-input bg-background text-xs text-foreground focus:ring-2 focus:ring-primary/20 outline-none"
                      >
                        {p.options.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    )}

                    {p.type === 'boolean' && (
                      <label className="flex items-center gap-2.5 cursor-pointer pt-1">
                        <input
                          type="checkbox"
                          checked={params[p.key] ?? p.default}
                          onChange={(e) => setParams({ ...params, [p.key]: e.target.checked })}
                          className="w-4 h-4 rounded border-input text-primary focus:ring-primary/20"
                        />
                        <span className="text-xs text-foreground font-medium">Enabled</span>
                      </label>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-border">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="px-4 py-2 rounded-xl border border-border text-xs font-semibold text-foreground hover:bg-muted"
                >
                  Back
                </button>
                <button
                  onClick={handleRunSimulation}
                  disabled={isRunning}
                  className="flex items-center gap-2 px-8 py-3 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-all shadow-md shadow-primary/20 disabled:opacity-50"
                >
                  <Play className={`w-4 h-4 fill-primary-foreground ${isRunning ? 'animate-spin' : ''}`} />
                  <span>{isRunning ? 'Simulating...' : 'Run Scenario'}</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* STEP 4: REVIEW EVIDENCE & FEEDBACK */}
        {currentStep === 4 && currentRun && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Run Header & Metrics */}
            <div className="rounded-3xl border border-border bg-card p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono font-bold text-primary">{currentRun.id}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                      {currentRun.mode === 'ai_assisted' ? 'AI-Assisted Engine' : 'Deterministic Rule Engine'}
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                      Completed
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-foreground">{currentRun.scenarioTitle}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{currentRun.outputSummary}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentStep(3)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border bg-muted/30 hover:bg-muted text-xs font-semibold"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Re-run</span>
                  </button>
                  <Link
                    href={`/employee/playground/${currentRun.id}`}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 shadow-xs"
                  >
                    <span>Full Trace View</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Key Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {currentRun.metrics.map((m) => (
                  <div key={m.label} className="p-4 rounded-2xl bg-muted/30 border border-border/80">
                    <div className="text-[11px] font-medium text-muted-foreground">{m.label}</div>
                    <div className="text-base sm:text-lg font-bold text-foreground mt-1">{m.value}</div>
                    {m.delta && (
                      <div className="text-[10px] font-mono text-rose-500 font-semibold mt-0.5">
                        {m.delta}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Trace & Evidence Split */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Step-by-Step Execution Trace */}
              <div className="rounded-3xl border border-border bg-card p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-primary" />
                    <h4 className="text-sm font-bold text-foreground">Step-by-Step Algorithmic Trace</h4>
                  </div>
                  <span className="text-[11px] font-mono text-muted-foreground">
                    {currentRun.trace.length} Steps
                  </span>
                </div>

                <div className="space-y-3">
                  {currentRun.trace.map((t) => (
                    <div
                      key={t.step}
                      className={`p-3.5 rounded-2xl border transition-all ${
                        t.status === 'flagged'
                          ? 'border-amber-500/30 bg-amber-500/5'
                          : 'border-border/60 bg-muted/20'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-foreground">
                          {t.step}. {t.title}
                        </span>
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                            t.status === 'flagged'
                              ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold'
                              : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          }`}
                        >
                          {t.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">{t.detail}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Explainable Evidence Panel */}
              <div className="rounded-3xl border border-border bg-card p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-primary" />
                    <h4 className="text-sm font-bold text-foreground">Explainability & Limitations</h4>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="text-xs font-bold text-foreground uppercase tracking-wider">
                    Matched Rules & Fields
                  </div>
                  {currentRun.evidence.map((ev) => (
                    <div key={ev.rule} className="p-3.5 rounded-2xl bg-muted/30 border border-border/60 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-foreground">{ev.rule}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                          Confidence: {(ev.confidence * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div className="text-[11px] font-mono text-muted-foreground">Field: {ev.matchedField}</div>
                      <p className="text-xs text-muted-foreground pt-1">{ev.note}</p>
                    </div>
                  ))}

                  <div className="text-xs font-bold text-foreground uppercase tracking-wider pt-2">
                    Known Model Limitations
                  </div>
                  <ul className="space-y-1.5 text-xs text-muted-foreground">
                    {currentRun.limitations.map((lim, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                        <span>{lim}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* 1-5 Star Feedback Module */}
            <div className="rounded-3xl border border-border bg-card p-6 space-y-4">
              <div>
                <h4 className="text-base font-bold text-foreground">Model Output Feedback</h4>
                <p className="text-xs text-muted-foreground">
                  Your feedback calibrates our financial intelligence models. Feedback is editable for 24 hours.
                </p>
              </div>

              {feedbackSuccessMsg && (
                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{feedbackSuccessMsg}</span>
                </div>
              )}

              <form onSubmit={handleSubmitFeedback} className="space-y-4">
                {/* Rating Stars */}
                <div className="flex items-center gap-4">
                  <label className="text-xs font-semibold text-foreground">Rating:</label>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setFeedbackRating(star)}
                        className="p-1 hover:scale-110 transition-transform"
                      >
                        <Star
                          className={`w-5 h-5 ${
                            star <= feedbackRating
                              ? 'text-amber-500 fill-amber-500'
                              : 'text-muted-foreground/30'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Correctness */}
                <div className="flex items-center gap-4">
                  <label className="text-xs font-semibold text-foreground">Was the output correct?</label>
                  <div className="flex items-center gap-2">
                    {(['yes', 'partly', 'no'] as const).map((opt) => (
                      <button
                        type="button"
                        key={opt}
                        onClick={() => setFeedbackCorrectness(opt)}
                        className={`px-3 py-1 rounded-xl text-xs font-semibold capitalize border transition-all ${
                          feedbackCorrectness === opt
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'border-border bg-muted/30 text-muted-foreground'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Text feedback */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-foreground">What worked well?</label>
                    <textarea
                      rows={2}
                      value={feedbackWorkedWell}
                      onChange={(e) => setFeedbackWorkedWell(e.target.value)}
                      placeholder="e.g. Ratio calculations matched our regulatory guidelines..."
                      className="w-full px-3 py-2 rounded-xl border border-input bg-background text-xs text-foreground focus:ring-2 focus:ring-primary/20 outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-foreground">What was wrong / needs work?</label>
                    <textarea
                      rows={2}
                      value={feedbackIssues}
                      onChange={(e) => setFeedbackIssues(e.target.value)}
                      placeholder="e.g. Expected interest coverage ratio to also be computed..."
                      className="w-full px-3 py-2 rounded-xl border border-input bg-background text-xs text-foreground focus:ring-2 focus:ring-primary/20 outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all shadow-md shadow-primary/20"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{feedbackSubmitted ? 'Update Feedback' : 'Submit Feedback'}</span>
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
