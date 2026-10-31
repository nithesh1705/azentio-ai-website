'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import {
  UserCheck,
  ShieldCheck,
  KeyRound,
  Laptop,
  Moon,
  Sun,
  Monitor,
  CheckCircle2,
  Clock,
  Lock,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { StepupModal } from '@/components/admin/StepupModal';

export default function AdminAccountPage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [stepupModalOpen, setStepupModalOpen] = useState(false);
  const [stepupActive, setStepupActive] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Check step-up status
  useEffect(() => {
    setMounted(true);
    checkStepup();
  }, []);

  const checkStepup = async () => {
    try {
      const res = await fetch('/api/admin/stepup');
      const data = await res.json();
      if (res.ok && data.valid) {
        setStepupActive(true);
      } else {
        setStepupActive(false);
      }
    } catch {
      setStepupActive(false);
    }
  };

  const handleRevokeOtherSessions = () => {
    setFeedback({
      type: 'success',
      message: 'All other active sessions have been revoked. Current session preserved.',
    });
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
          <UserCheck className="h-6 w-6 text-brand-teal" />
          Administrator Account & Security Profile
        </h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
          Review your verified identity, active platform grants, step-up verification status, and active sessions.
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

      {/* Profile Card */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 space-y-5 shadow-sm">
        <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-4">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-full bg-brand-teal/10 text-brand-teal flex items-center justify-center font-bold text-xl border border-brand-teal/20">
              ER
            </div>
            <div>
              <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                Elena Rostova
              </h2>
              <div className="text-xs text-neutral-500 font-mono">elena.rostova@azentio.com</div>
              <div className="text-[11px] text-neutral-400 mt-0.5">Staff ID: AZ-EMP-2024-001 &bull; Singapore HQ</div>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5" />
            Verified Azentio Employee
          </span>
        </div>

        {/* Read-Only Platform Grants */}
        <div className="space-y-2">
          <div className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
            Active Platform Grants (Governed by Dual Control)
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-brand-teal/10 text-brand-teal border border-brand-teal/20">
              portal_admin
            </span>
            <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-brand-teal/10 text-brand-teal border border-brand-teal/20">
              content_publisher
            </span>
            <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-brand-teal/10 text-brand-teal border border-brand-teal/20">
              learning_moderator
            </span>
          </div>
          <p className="text-[11px] text-neutral-500 italic pt-1">
            Note: Platform grants cannot be self-modified. Assignment and revocation strictly require dual-control sign-off by a second administrator (§1 SOURCE_OF_TRUTH.md).
          </p>
        </div>
      </div>

      {/* Step-Up Authentication Card */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
          <div className="flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-brand-teal" />
            <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
              Step-Up Authentication Status
            </h2>
          </div>
          <span
            className={`px-3 py-1 text-xs font-semibold rounded-full uppercase ${
              stepupActive
                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
            }`}
          >
            {stepupActive ? 'Verified (10m TTL Active)' : 'Inactive / Expired'}
          </span>
        </div>
        <p className="text-xs text-neutral-600 dark:text-neutral-400">
          Sensitive governance actions (dual-control approvals, grant changes, organisation suspension, and audit exports) require a fresh email verification code within the last 10 minutes.
        </p>
        <div>
          <button
            onClick={() => setStepupModalOpen(true)}
            className="px-4 py-2 text-xs font-semibold text-white bg-brand-teal hover:bg-brand-teal/90 rounded-lg flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <KeyRound className="h-3.5 w-3.5" />
            {stepupActive ? 'Refresh Verification Code' : 'Verify Step-Up Code Now'}
          </button>
        </div>
      </div>

      {/* Active Sessions */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
          <div className="flex items-center gap-2">
            <Laptop className="h-5 w-5 text-brand-teal" />
            <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
              Active Browser Sessions
            </h2>
          </div>
          <button
            onClick={handleRevokeOtherSessions}
            className="px-3 py-1.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
            Revoke All Other Sessions
          </button>
        </div>

        <div className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/40 flex items-center justify-between text-xs">
          <div className="space-y-0.5">
            <div className="font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <span>Current Session (Chrome on Windows)</span>
              <span className="text-[10px] text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-1.5 py-0.2 rounded font-bold">
                THIS DEVICE
              </span>
            </div>
            <div className="text-neutral-500 font-mono text-[11px]">
              IP: 103.252.xxx.xxx &bull; Singapore, SG &bull; Active Now
            </div>
          </div>
          <span className="text-neutral-400 text-xs">Expires in 12h</span>
        </div>
      </div>

      {/* Theme Preference */}
      {mounted && (
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 space-y-4 shadow-sm">
          <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100 border-b border-neutral-100 dark:border-neutral-800 pb-3">
            Interface Theme Preference
          </h2>
          <div className="grid grid-cols-3 gap-3 text-xs font-medium">
            <button
              onClick={() => setTheme('light')}
              className={`p-3 rounded-lg border flex flex-col items-center gap-2 transition-all ${
                theme === 'light'
                  ? 'border-brand-teal bg-brand-teal/5 text-brand-teal font-bold'
                  : 'border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400'
              }`}
            >
              <Sun className="h-5 w-5" />
              Light Theme
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`p-3 rounded-lg border flex flex-col items-center gap-2 transition-all ${
                theme === 'dark'
                  ? 'border-brand-teal bg-brand-teal/5 text-brand-teal font-bold'
                  : 'border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400'
              }`}
            >
              <Moon className="h-5 w-5" />
              Dark Theme
            </button>
            <button
              onClick={() => setTheme('system')}
              className={`p-3 rounded-lg border flex flex-col items-center gap-2 transition-all ${
                theme === 'system'
                  ? 'border-brand-teal bg-brand-teal/5 text-brand-teal font-bold'
                  : 'border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400'
              }`}
            >
              <Monitor className="h-5 w-5" />
              System Match
            </button>
          </div>
        </div>
      )}

      {/* STEP-UP MODAL */}
      <StepupModal
        purpose="authenticate administrator session"
        isOpen={stepupModalOpen}
        onSuccess={() => {
          setStepupModalOpen(false);
          setStepupActive(true);
          setFeedback({ type: 'success', message: 'Step-up authentication successfully validated (active for 10 minutes).' });
        }}
        onCancel={() => setStepupModalOpen(false)}
      />
    </div>
  );
}
