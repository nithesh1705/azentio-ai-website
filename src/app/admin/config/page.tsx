'use client';

import React, { useState, useEffect } from 'react';
import {
  Sliders,
  ShieldCheck,
  FlaskConical,
  FileCheck2,
  Lock,
  Save,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';

export default function AdminConfigPage() {
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form state
  const [minDistinctOrgs, setMinDistinctOrgs] = useState(3);
  const [featureFlags, setFeatureFlags] = useState({
    enableEmailDispatch: false,
    showSampleContentInDev: true,
    requireDualControlAllBroadcasts: true,
    enableSupportViewerWatermark: true,
  });

  // Regex Testing Lab state
  const [testText, setTestText] = useState(
    'Please send the trade confirmation to sarah.jenkins@sc.com with settlement card 4111-2222-3333-4444 under Project-Titan confidentiality.'
  );
  const [regexResults, setRegexResults] = useState<any[]>([]);
  const [testingRegex, setTestingRegex] = useState(false);

  const loadConfig = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/config');
      const data = await res.json();
      if (res.ok && data.config) {
        setConfig(data.config);
        setMinDistinctOrgs(data.config.minDistinctOrgs);
        setFeatureFlags(data.config.featureFlags);
      }
    } catch {
      setFeedback({ type: 'error', message: 'Failed to load system configuration.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfig();
    handleRunRegexTest();
  }, []);

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    // Invariant check in UI before submitting
    if (minDistinctOrgs < 3) {
      setFeedback({
        type: 'error',
        message: 'Invariant Violation: MIN_DISTINCT_ORGS cannot be less than 3 per SOURCE_OF_TRUTH.md §11.',
      });
      return;
    }

    try {
      const res = await fetch('/api/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          updates: {
            minDistinctOrgs,
            featureFlags,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update system configuration.');
      }
      setFeedback({ type: 'success', message: 'System configuration updated and logged in immutable audit ledger.' });
      loadConfig();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    }
  };

  const handleRunRegexTest = async () => {
    try {
      setTestingRegex(true);
      const res = await fetch('/api/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'testRegex', text: testText }),
      });
      const data = await res.json();
      if (res.ok) {
        setRegexResults(data.results || []);
      }
    } catch {
      // silent test fallback
    } finally {
      setTestingRegex(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
          <Sliders className="h-6 w-6 text-brand-teal" />
          System Configuration & Governance Rules
        </h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
          Manage platform aggregation thresholds, feature toggles, policy versioning, and test data sensitivity sanitization regex patterns.
        </p>
      </div>

      {/* Feedback Alert */}
      {feedback && (
        <div
          className={`p-4 rounded-lg flex items-center justify-between text-sm ${
            feedback.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
              : 'bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800'
          }`}
        >
          <span>{feedback.message}</span>
          <button onClick={() => setFeedback(null)} className="text-xs font-semibold hover:underline ml-4">
            Dismiss
          </button>
        </div>
      )}

      {/* Main Settings Form */}
      <form onSubmit={handleSaveConfig} className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 space-y-6 shadow-sm">
        <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2 border-b border-neutral-100 dark:border-neutral-800 pb-3">
          <Lock className="h-4 w-4 text-brand-teal" />
          Cross-Tenant Aggregation & Privacy Guard
        </h2>

        {/* MIN_DISTINCT_ORGS */}
        <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-700 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="font-semibold text-sm text-neutral-900 dark:text-neutral-100">
                Minimum Distinct Organisations Threshold (MIN_DISTINCT_ORGS)
              </div>
              <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                De-identified cross-tenant shared learning strictly requires aggregated data from at least this many distinct client organisations before becoming visible in the shared feed.
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={3}
                max={20}
                required
                value={minDistinctOrgs}
                onChange={(e) => setMinDistinctOrgs(Number(e.target.value))}
                className="w-20 px-3 py-1.5 text-sm font-bold font-mono text-center rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:ring-2 focus:ring-brand-teal"
              />
              <span className="text-xs text-neutral-500 font-medium">orgs (min 3)</span>
            </div>
          </div>
          <div className="text-[11px] text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-3 py-1.5 rounded-lg border border-amber-200 dark:border-amber-800 flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 shrink-0" />
            <span>Hard Invariant Guard: This value can never be lowered below 3 (§11 SOURCE_OF_TRUTH.md).</span>
          </div>
        </div>

        {/* Feature Flags */}
        <div className="space-y-3 pt-2">
          <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
            Platform Feature Flags
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <label className="flex items-start gap-3 p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={featureFlags.enableEmailDispatch}
                onChange={(e) =>
                  setFeatureFlags({ ...featureFlags, enableEmailDispatch: e.target.checked })
                }
                className="mt-1 rounded border-neutral-300 text-brand-teal focus:ring-brand-teal"
              />
              <div>
                <div className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                  External Email Dispatch
                </div>
                <div className="text-[11px] text-neutral-500">
                  Queues email notifications to external provider with strict webhook confirmation.
                </div>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={featureFlags.showSampleContentInDev}
                onChange={(e) =>
                  setFeatureFlags({ ...featureFlags, showSampleContentInDev: e.target.checked })
                }
                className="mt-1 rounded border-neutral-300 text-brand-teal focus:ring-brand-teal"
              />
              <div>
                <div className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                  Show Synthetic Sample Content in Dev
                </div>
                <div className="text-[11px] text-neutral-500">
                  Renders synthetic seed testimonials and observations in non-production environments.
                </div>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={featureFlags.requireDualControlAllBroadcasts}
                onChange={(e) =>
                  setFeatureFlags({
                    ...featureFlags,
                    requireDualControlAllBroadcasts: e.target.checked,
                  })
                }
                className="mt-1 rounded border-neutral-300 text-brand-teal focus:ring-brand-teal"
              />
              <div>
                <div className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                  Enforce Dual Control on Client Broadcasts
                </div>
                <div className="text-[11px] text-neutral-500">
                  Requires second administrator sign-off for any broadcast to all client organisations.
                </div>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={featureFlags.enableSupportViewerWatermark}
                onChange={(e) =>
                  setFeatureFlags({
                    ...featureFlags,
                    enableSupportViewerWatermark: e.target.checked,
                  })
                }
                className="mt-1 rounded border-neutral-300 text-brand-teal focus:ring-brand-teal"
              />
              <div>
                <div className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                  Mandatory Support Watermarking
                </div>
                <div className="text-[11px] text-neutral-500">
                  Overlays viewer identity, IP hash, and timestamp on private client support sessions.
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Policy Text Versions (Read-only summary) */}
        {config?.policyVersions && (
          <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-2">
              Active Legal & Governance Policy Versions
            </h3>
            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-800">
                <span className="text-neutral-400 block text-[10px] uppercase">Master Terms</span>
                <span className="font-mono font-bold text-neutral-800 dark:text-neutral-200">
                  v{config.policyVersions.termsVersion}
                </span>
              </div>
              <div className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-800">
                <span className="text-neutral-400 block text-[10px] uppercase">Privacy Policy</span>
                <span className="font-mono font-bold text-neutral-800 dark:text-neutral-200">
                  v{config.policyVersions.privacyVersion}
                </span>
              </div>
              <div className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-800">
                <span className="text-neutral-400 block text-[10px] uppercase">DPA & Data Retention</span>
                <span className="font-mono font-bold text-neutral-800 dark:text-neutral-200">
                  v{config.policyVersions.dpaVersion}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800 flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-lg text-sm font-semibold bg-brand-teal text-white hover:bg-brand-teal/90 shadow-sm flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            Save Configuration Changes
          </button>
        </div>
      </form>

      {/* Regex Sensitivity Testing Lab */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
          <div>
            <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <FlaskConical className="h-5 w-5 text-brand-teal" />
              Regex Sensitivity & PII Testing Lab
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Verify how ingestion filters evaluate PII, payment card numbers, secret tokens, and confidential project codenames.
            </p>
          </div>
          <button
            type="button"
            onClick={handleRunRegexTest}
            disabled={testingRegex}
            className="px-3 py-1.5 text-xs font-semibold text-white bg-brand-teal hover:bg-brand-teal/90 rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <Sparkles className="h-3.5 w-3.5" />
            {testingRegex ? 'Evaluating...' : 'Evaluate Patterns'}
          </button>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase text-neutral-500">
            Sample Ingestion Text
          </label>
          <textarea
            rows={3}
            value={testText}
            onChange={(e) => setTestText(e.target.value)}
            className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent focus:ring-2 focus:ring-brand-teal"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {regexResults.map((r, i) => (
            <div
              key={i}
              className={`p-3 rounded-lg border text-xs space-y-1 ${
                r.matched
                  ? 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800 text-red-900 dark:text-red-200'
                  : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold">{r.patternName}</span>
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                    r.matched ? 'bg-red-200 dark:bg-red-900 text-red-800 dark:text-red-100' : 'bg-emerald-200 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-100'
                  }`}
                >
                  {r.matched ? 'MATCH DETECTED' : 'CLEAN'}
                </span>
              </div>
              {r.matched && (
                <div className="text-[11px] font-mono mt-1 space-y-0.5">
                  {r.matches.map((m: any, mIdx: number) => (
                    <div key={mIdx}>
                      &bull; Matched: <span className="bg-red-200/60 dark:bg-red-900/60 px-1 rounded">{m.value}</span> (index {m.index})
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

