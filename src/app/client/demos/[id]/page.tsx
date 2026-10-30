'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { usePersona } from '@/context/PersonaContext';
import {
  getClientDemoById,
  runDemo,
  saveScenario,
  getSavedScenarios,
  submitDemoFeedback,
} from '@/server/dal/client/demos';
import { DemoRun, SavedScenario } from '@/types';
import {
  PlayCircle,
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  Sliders,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Save,
  Star,
  ThumbsUp,
  ThumbsDown,
  Info,
  Layers,
  Activity,
  History,
  Lock,
  Globe2,
} from 'lucide-react';

export default function ClientDemoRunnerPage() {
  const params = useParams();
  const router = useRouter();
  const demoId = params?.id as string;
  const { actor, activeTenant } = usePersona();

  // Wizard Step: 1 = Scenario Select, 2 = Parameters, 3 = Simulating, 4 = Results
  const [step, setStep] = useState<number>(1);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('');
  const [executionMode, setExecutionMode] = useState<'deterministic' | 'ai_assisted'>('deterministic');
  const [paramValues, setParamValues] = useState<Record<string, any>>({});
  const [activeRun, setActiveRun] = useState<DemoRun | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [progressStep, setProgressStep] = useState(0);

  // Save Scenario Modal
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [savedName, setSavedName] = useState('');
  const [shareScope, setShareScope] = useState<'private' | 'org'>('private');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Feedback State
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackCorrectness, setFeedbackCorrectness] = useState<'yes' | 'partly' | 'no'>('yes');
  const [feedbackComments, setFeedbackComments] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  if (!actor.activeTenantId || !activeTenant) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h1 className="text-xl font-bold text-foreground">Workspace Required</h1>
        <p className="text-xs text-muted-foreground">Select an active client workspace to run demos.</p>
        <Link href="/choose-workspace" className="text-xs text-primary underline">
          Switch Workspace
        </Link>
      </div>
    );
  }

  let demo;
  try {
    demo = getClientDemoById(actor, demoId);
  } catch (err: any) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-destructive mx-auto" />
        <h2 className="text-xl font-bold text-foreground">Demo Inaccessible</h2>
        <p className="text-xs text-muted-foreground">{err.message}</p>
        <Link
          href="/client/demos"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
        >
          Back to Entitled Demos
        </Link>
      </div>
    );
  }

  // Initialize selected scenario
  useEffect(() => {
    if (demo && demo.scenarios.length > 0 && !selectedScenarioId) {
      const initialScen = demo.scenarios[0];
      setSelectedScenarioId(initialScen.id);
      const defaults: Record<string, any> = {};
      initialScen.parameters.forEach((p) => {
        defaults[p.key] = p.default;
      });
      setParamValues(defaults);
    }
  }, [demo, selectedScenarioId]);

  const activeScenario = demo.scenarios.find((s) => s.id === selectedScenarioId) || demo.scenarios[0];
  const savedScenarios = getSavedScenarios(actor, selectedScenarioId);

  const handleSelectScenario = (scen: any) => {
    setSelectedScenarioId(scen.id);
    const defaults: Record<string, any> = {};
    scen.parameters.forEach((p: any) => {
      defaults[p.key] = p.default;
    });
    setParamValues(defaults);
  };

  const handleApplySavedScenario = (saved: SavedScenario) => {
    setParamValues(saved.params);
    setSaveSuccessMsg(`Applied saved preset: "${saved.name}"`);
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  const handleExecute = async () => {
    setIsRunning(true);
    setStep(3);
    setProgressStep(1);

    // Simulate progressive telemetry steps
    setTimeout(() => setProgressStep(2), 400);
    setTimeout(() => setProgressStep(3), 800);
    setTimeout(async () => {
      setProgressStep(4);
      try {
        const result = await runDemo(actor, {
          demoId: demo.id,
          scenarioId: activeScenario.id,
          mode: executionMode,
          params: paramValues,
        });
        setActiveRun(result);
        setIsRunning(false);
        setStep(4);
      } catch (err) {
        setIsRunning(false);
        alert('Simulation failed: ' + (err as any).message);
      }
    }, 1200);
  };

  const handleSaveScenario = (e: React.FormEvent) => {
    e.preventDefault();
    if (!savedName.trim()) return;

    try {
      saveScenario(actor, {
        name: savedName.trim(),
        scenarioId: activeScenario.id,
        scenarioTitle: activeScenario.title,
        params: paramValues,
        shareScope,
      });
      setShowSaveModal(false);
      setSavedName('');
      setSaveSuccessMsg('Scenario preset saved successfully.');
      setTimeout(() => setSaveSuccessMsg(null), 4000);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSubmitFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRun) return;

    try {
      submitDemoFeedback(actor, {
        runId: activeRun.id,
        rating: feedbackRating,
        isCorrect: feedbackCorrectness,
        comments: feedbackComments,
      });
      setFeedbackSubmitted(true);
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/client/demos"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Demos</span>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href="/client/demos/runs"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-muted hover:bg-muted/80 text-foreground transition-all"
          >
            <History className="w-3.5 h-3.5 text-primary" />
            <span>Past Runs</span>
          </Link>
        </div>
      </div>

      {/* Mandatory Honesty Banner */}
      <div className="p-3.5 rounded-2xl bg-amber-500/10 dark:bg-amber-950/20 border border-amber-500/30 flex items-center gap-3 text-xs text-amber-900 dark:text-amber-200">
        <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
        <span className="font-mono text-[11px] sm:text-xs">
          <strong>Mandatory Notice:</strong> Sample data &bull; Simulated output &bull; Not an approved credit, compliance, or business decision.
        </span>
      </div>

      {/* Header Info */}
      <div className="p-6 rounded-3xl bg-card border border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
              {demo.offeringName}
            </span>
            <span className="text-xs text-muted-foreground">org: {activeTenant.name}</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">{demo.name}</h1>
          <p className="text-xs text-muted-foreground mt-1 max-w-2xl">{demo.description}</p>
        </div>

        {/* Wizard Steps Indicator */}
        <div className="flex items-center gap-2 bg-muted/40 p-2 rounded-2xl border border-border self-start md:self-center">
          {[
            { s: 1, label: 'Scenario' },
            { s: 2, label: 'Parameters' },
            { s: 3, label: 'Simulate' },
            { s: 4, label: 'Evidence' },
          ].map(({ s, label }) => (
            <div
              key={s}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                step === s
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : step > s
                  ? 'text-foreground'
                  : 'text-muted-foreground'
              }`}
            >
              <span>{s}</span>
              <span className="hidden sm:inline text-[11px]">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {saveSuccessMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* STEP 1: Scenario Selection */}
      {step === 1 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {demo.scenarios.map((scen) => {
              const isSelected = scen.id === selectedScenarioId;
              return (
                <div
                  key={scen.id}
                  onClick={() => handleSelectScenario(scen)}
                  className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-primary/5 border-primary shadow-sm ring-1 ring-primary/30'
                      : 'bg-card border-border hover:border-primary/40'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-muted text-foreground">
                      {scen.difficulty}
                    </span>
                    {isSelected && (
                      <span className="text-xs font-semibold text-primary flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Selected</span>
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-foreground">{scen.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                    {scen.description}
                  </p>

                  <div className="mt-4 pt-3 border-t border-border/50 text-[11px] text-muted-foreground">
                    <span className="font-semibold text-foreground">Synthetic Baseline:</span>{' '}
                    {JSON.stringify(scen.inputData).replace(/["{}]/g, ' ').trim()}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Saved Presets for this scenario */}
          {savedScenarios.length > 0 && (
            <div className="p-4 rounded-2xl bg-muted/30 border border-border/60 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Saved Presets for this Scenario
              </span>
              <div className="flex flex-wrap gap-2">
                {savedScenarios.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => handleApplySavedScenario(preset)}
                    className="px-3 py-1.5 rounded-xl bg-card border border-border hover:border-primary/50 text-xs font-medium text-foreground inline-flex items-center gap-1.5 transition-all shadow-sm"
                  >
                    <span>{preset.name}</span>
                    <span className="text-[10px] text-muted-foreground">
                      ({preset.shareScope === 'org' ? 'Org' : 'Private'})
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              onClick={() => setStep(2)}
              className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all inline-flex items-center gap-2 shadow-md shadow-primary/20"
            >
              <span>Configure Parameters</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}

      {/* STEP 2: Parameters & Input Inspection */}
      {step === 2 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="p-6 rounded-3xl bg-card border border-border space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
              <div>
                <h2 className="text-lg font-bold text-foreground">{activeScenario.title}</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Adjust synthetic simulation bounds or switch reasoning engines
                </p>
              </div>

              {/* Mode Switch: Deterministic vs AI Assisted */}
              <div className="flex items-center gap-1 p-1 bg-muted rounded-xl border border-border">
                <button
                  type="button"
                  onClick={() => setExecutionMode('deterministic')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    executionMode === 'deterministic'
                      ? 'bg-card text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Deterministic Rules
                </button>
                <button
                  type="button"
                  onClick={() => setExecutionMode('ai_assisted')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    executionMode === 'ai_assisted'
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Agentic Copilot</span>
                </button>
              </div>
            </div>

            {/* Parameter Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {activeScenario.parameters.map((param) => (
                <div key={param.key} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-foreground">{param.label}</label>
                    <span className="text-xs font-mono text-primary font-semibold">
                      {String(paramValues[param.key])}
                    </span>
                  </div>

                  {param.type === 'number' && (
                    <div className="space-y-1">
                      <input
                        type="range"
                        min={0}
                        max={param.key.includes('Bps') ? 500 : 100}
                        step={param.key.includes('Bps') ? 25 : 1}
                        value={paramValues[param.key] ?? param.default}
                        onChange={(e) =>
                          setParamValues({
                            ...paramValues,
                            [param.key]: Number(e.target.value),
                          })
                        }
                        className="w-full accent-primary h-2 bg-muted rounded-lg cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-muted-foreground">
                        <span>Min (0)</span>
                        <span>Max ({param.key.includes('Bps') ? '500' : '100'})</span>
                      </div>
                    </div>
                  )}

                  {param.type === 'select' && (
                    <select
                      value={paramValues[param.key] ?? param.default}
                      onChange={(e) =>
                        setParamValues({
                          ...paramValues,
                          [param.key]: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 text-xs rounded-xl bg-muted/60 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      {param.options?.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  )}

                  {param.type === 'boolean' && (
                    <div className="flex items-center gap-3 pt-1">
                      <button
                        type="button"
                        onClick={() =>
                          setParamValues({
                            ...paramValues,
                            [param.key]: !paramValues[param.key],
                          })
                        }
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          paramValues[param.key]
                            ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {paramValues[param.key] ? 'Enabled' : 'Disabled'}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border/60">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground"
                >
                  Change Scenario
                </button>
                <button
                  type="button"
                  onClick={() => setShowSaveModal(true)}
                  className="px-3.5 py-2 rounded-xl bg-card border border-border hover:bg-muted text-foreground text-xs font-medium inline-flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5 text-primary" />
                  <span>Save Preset</span>
                </button>
              </div>

              <button
                type="button"
                onClick={handleExecute}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all inline-flex items-center justify-center gap-2 shadow-md shadow-primary/20 hover:scale-[1.02] active:scale-[0.98]"
              >
                <PlayCircle className="w-4 h-4" />
                <span>Execute Simulation</span>
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* STEP 3: Execution Telemetry (Simulating) */}
      {step === 3 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-10 rounded-3xl bg-card border border-border text-center space-y-6"
        >
          <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
              className="absolute inset-0 rounded-full border-2 border-primary/20 border-t-primary"
            />
            <Activity className="w-7 h-7 text-primary" />
          </div>

          <div>
            <h3 className="text-lg font-bold text-foreground">Executing Simulation Pipeline</h3>
            <p className="text-xs text-muted-foreground mt-1 font-mono">
              Mode: {executionMode} &bull; Tenant Isolation: Strict
            </p>
          </div>

          <div className="max-w-md mx-auto space-y-2.5 text-left text-xs">
            <div
              className={`p-3 rounded-xl border flex items-center gap-3 transition-colors ${
                progressStep >= 1
                  ? 'bg-primary/10 border-primary/30 text-foreground'
                  : 'bg-muted/40 border-border text-muted-foreground'
              }`}
            >
              <CheckCircle2
                className={`w-4 h-4 ${progressStep >= 1 ? 'text-primary' : 'text-muted-foreground'}`}
              />
              <span>1. Validating tenant perimeter & loading synthetic inputs</span>
            </div>

            <div
              className={`p-3 rounded-xl border flex items-center gap-3 transition-colors ${
                progressStep >= 2
                  ? 'bg-primary/10 border-primary/30 text-foreground'
                  : 'bg-muted/40 border-border text-muted-foreground'
              }`}
            >
              <CheckCircle2
                className={`w-4 h-4 ${progressStep >= 2 ? 'text-primary' : 'text-muted-foreground'}`}
              />
              <span>2. Interpolating macro shocks & stress parameters</span>
            </div>

            <div
              className={`p-3 rounded-xl border flex items-center gap-3 transition-colors ${
                progressStep >= 3
                  ? 'bg-primary/10 border-primary/30 text-foreground'
                  : 'bg-muted/40 border-border text-muted-foreground'
              }`}
            >
              <CheckCircle2
                className={`w-4 h-4 ${progressStep >= 3 ? 'text-primary' : 'text-muted-foreground'}`}
              />
              <span>3. Running explainability rules and evidence checks</span>
            </div>

            <div
              className={`p-3 rounded-xl border flex items-center gap-3 transition-colors ${
                progressStep >= 4
                  ? 'bg-primary/10 border-primary/30 text-foreground'
                  : 'bg-muted/40 border-border text-muted-foreground'
              }`}
            >
              <CheckCircle2
                className={`w-4 h-4 ${progressStep >= 4 ? 'text-primary' : 'text-muted-foreground'}`}
              />
              <span>4. Finalizing verifiable output artifact</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* STEP 4: Results & Evidence */}
      {step === 4 && activeRun && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Output Summary Card */}
          <div className="p-6 rounded-3xl bg-card border border-border space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                  Run ID: {activeRun.id}
                </span>
                <h2 className="text-xl font-bold text-foreground mt-0.5">
                  {activeRun.scenarioTitle}
                </h2>
                <div className="text-xs text-muted-foreground mt-1">
                  Mode: <span className="font-semibold text-foreground">{activeRun.mode}</span> &bull; Executed at {new Date(activeRun.createdAt).toLocaleTimeString()}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-4 py-2 rounded-xl bg-secondary text-secondary-foreground text-xs font-semibold hover:bg-secondary/80 inline-flex items-center gap-1.5 transition-all"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Adjust & Re-Run</span>
                </button>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-muted/40 border border-border/50 text-xs sm:text-sm text-foreground leading-relaxed">
              {activeRun.outputSummary}
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              {activeRun.metrics.map((metric, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-muted/30 border border-border/60">
                  <div className="text-xs font-medium text-muted-foreground">{metric.label}</div>
                  <div className="text-2xl font-black text-foreground mt-1">{metric.value}</div>
                  {metric.delta && (
                    <div className="text-[11px] font-semibold text-primary mt-1">
                      {metric.delta}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Trace & Evidence Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Execution Trace */}
            <div className="p-6 rounded-3xl bg-card border border-border space-y-4">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" />
                <span>Execution Trace & Telemetry</span>
              </h3>

              <div className="space-y-3">
                {activeRun.trace.map((t) => (
                  <div
                    key={t.step}
                    className="p-3 rounded-xl bg-muted/40 border border-border/40 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-foreground">
                        Step {t.step}: {t.title}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          t.status === 'ok'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                        }`}
                      >
                        {t.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">{t.detail}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Explainability Evidence */}
            <div className="p-6 rounded-3xl bg-card border border-border space-y-4">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Explainability & Evidence Rules</span>
              </h3>

              <div className="space-y-3">
                {activeRun.evidence.map((ev, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-muted/40 border border-border/40 text-xs space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-foreground">{ev.rule}</span>
                      <span className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                        {(ev.confidence * 100).toFixed(0)}% confidence
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full"
                        style={{ width: `${ev.confidence * 100}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-muted-foreground">{ev.note}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* User Feedback Widget */}
          <div className="p-6 rounded-3xl bg-card border border-border space-y-4">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-500" />
              <span>Evaluate This Run (Synthetic Feedback)</span>
            </h3>

            {feedbackSubmitted ? (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Thank you! Your feedback has been recorded for model evaluation.</span>
              </div>
            ) : (
              <form onSubmit={handleSubmitFeedback} className="space-y-4">
                <div className="flex flex-wrap items-center gap-6">
                  {/* Rating Stars */}
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground block mb-1">
                      Quality Rating
                    </label>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setFeedbackRating(star)}
                          className="p-1 hover:scale-110 transition-transform"
                        >
                          <Star
                            className={`w-4 h-4 ${
                              star <= feedbackRating
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-muted-foreground/40'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Correctness Pill */}
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground block mb-1">
                      Output Accuracy
                    </label>
                    <div className="flex items-center gap-1.5">
                      {(['yes', 'partly', 'no'] as const).map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setFeedbackCorrectness(c)}
                          className={`px-3 py-1 rounded-lg text-xs font-medium capitalize transition-all ${
                            feedbackCorrectness === c
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <textarea
                    rows={2}
                    placeholder="Optional reviewer notes or comments..."
                    value={feedbackComments}
                    onChange={(e) => setFeedbackComments(e.target.value)}
                    className="w-full p-3 text-xs rounded-xl bg-muted/40 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-secondary text-secondary-foreground text-xs font-semibold hover:bg-secondary/80 transition-all"
                >
                  Submit Review
                </button>
              </form>
            )}
          </div>
        </motion.div>
      )}

      {/* Save Preset Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 rounded-3xl bg-card border border-border shadow-xl space-y-4">
            <h3 className="text-base font-bold text-foreground">Save Scenario Preset</h3>
            <p className="text-xs text-muted-foreground">
              Save current parameters for fast re-execution.
            </p>

            <form onSubmit={handleSaveScenario} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Preset Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Extreme Inflation Stress Q3"
                  value={savedName}
                  onChange={(e) => setSavedName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-muted/60 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Sharing Scope
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setShareScope('private')}
                    className={`p-2.5 rounded-xl border text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                      shareScope === 'private'
                        ? 'bg-primary/10 border-primary text-primary'
                        : 'bg-muted/40 border-border text-muted-foreground'
                    }`}
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Private (Only Me)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShareScope('org')}
                    className={`p-2.5 rounded-xl border text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                      shareScope === 'org'
                        ? 'bg-primary/10 border-primary text-primary'
                        : 'bg-muted/40 border-border text-muted-foreground'
                    }`}
                  >
                    <Globe2 className="w-3.5 h-3.5" />
                    <span>Our Organisation</span>
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSaveModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90"
                >
                  Save Preset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
