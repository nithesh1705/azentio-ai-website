'use client';

import React, { useState, useEffect } from 'react';
import { ShieldAlert, X, CheckCircle2, AlertTriangle, KeyRound } from 'lucide-react';

interface StepupModalProps {
  isOpen: boolean;
  purpose: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function StepupModal({ isOpen, purpose, onSuccess, onCancel }: StepupModalProps) {
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCode('');
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length < 6) {
      setError('Please enter the complete 6-digit verification code.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/stepup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || 'Verification failed. Please check the code and try again.');
        setLoading(false);
        return;
      }

      setLoading(false);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Network error verifying security code');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-card border border-border rounded-xl shadow-2xl p-6 text-card-foreground relative"
        role="dialog"
        aria-modal="true"
        aria-labelledby="stepup-title"
      >
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center flex-shrink-0">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h3 id="stepup-title" className="text-lg font-semibold tracking-tight">
              Elevated Security Clearance
            </h3>
            <p className="text-xs text-muted-foreground">Step-Up Verification Required (10 min TTL)</p>
          </div>
        </div>

        <p className="text-sm text-foreground/80 mb-4 bg-muted/40 p-3 rounded-lg border border-border/50">
          <span className="font-medium text-foreground">Action:</span> {purpose}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="otp-code" className="block text-xs font-medium text-muted-foreground mb-1.5">
              Enter 6-Digit Email Verification Code
            </label>
            <input
              id="otp-code"
              type="text"
              maxLength={6}
              value={code}
              onChange={(e) => {
                setCode(e.target.value.replace(/\D/g, ''));
                setError(null);
              }}
              placeholder="123456"
              autoFocus
              className="w-full text-center text-2xl font-mono tracking-widest px-4 py-2.5 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
            />
            <p className="text-[11px] text-muted-foreground mt-1.5 flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary" />
              Demo environment verification code: <code className="bg-muted px-1 rounded font-semibold text-primary">123456</code>
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium rounded-lg border border-border hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || code.length < 6}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              {loading ? 'Verifying...' : 'Authorize Action'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

