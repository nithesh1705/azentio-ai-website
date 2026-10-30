'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { submitHackathonRegistration } from '@/server/dal/store';
import {
  Sparkles,
  Trophy,
  Users,
  Code,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Send,
  Zap,
} from 'lucide-react';

export default function HackathonRegistrationPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    workEmail: '',
    track: 'Collective Learning Hub & Safe Sharing (Core)',
    teamSize: 3,
    notes: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tracks = [
    'Collective Learning Hub & Safe Sharing (Core)',
    'AI-Assisted Synthesis & Evidence Citation (AIRA)',
    'Optional Federated Model-Learning Track (P2)',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.workEmail) {
      setError('Please provide your name and work email.');
      return;
    }

    setSubmitting(true);
    setError(null);

    setTimeout(() => {
      try {
        submitHackathonRegistration(formData);
        setSubmitted(true);
      } catch (err: any) {
        setError(err.message || 'Failed to submit registration');
      } finally {
        setSubmitting(false);
      }
    }, 600);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 text-xs font-semibold mb-4">
          <Trophy className="w-3.5 h-3.5" />
          <span>Intelligent Collaboration Challenge 2026</span>
        </div>
        <h1 className="text-4xl font-extrabold text-foreground tracking-tight">
          Register Interest for the Hackathon
        </h1>
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
          Join engineers, data scientists, and banking architects in building next-generation governed collective learning portals and federated analytics.
        </p>
      </div>

      <div className="p-8 sm:p-10 rounded-3xl glass-panel border border-border glow-card">
        {submitted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12 space-y-4"
          >
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 mx-auto flex items-center justify-center border border-emerald-500/20">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">Interest Registered!</h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
              We have received your registration for <span className="font-semibold text-foreground">{formData.fullName}</span> ({formData.workEmail}). You will receive an invitation token and workspace access credentials before the sprint commences.
            </p>
            <div className="pt-4">
              <button
                onClick={() => setSubmitted(false)}
                className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all"
              >
                Register Another Participant
              </button>
            </div>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Full Name <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="e.g. Liam Zhang"
                  className="w-full bg-muted/60 px-3.5 py-2.5 rounded-xl text-xs text-foreground placeholder:text-muted-foreground border border-border focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Work Email <span className="text-destructive">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={formData.workEmail}
                  onChange={(e) => setFormData({ ...formData, workEmail: e.target.value })}
                  placeholder="liam.zhang@partner-bank.com"
                  className="w-full bg-muted/60 px-3.5 py-2.5 rounded-xl text-xs text-foreground placeholder:text-muted-foreground border border-border focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Target Challenge Track
                </label>
                <select
                  value={formData.track}
                  onChange={(e) => setFormData({ ...formData, track: e.target.value })}
                  className="w-full bg-muted/60 px-3.5 py-2.5 rounded-xl text-xs text-foreground border border-border focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  {tracks.map((t, idx) => (
                    <option key={idx} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Estimated Team Size
                </label>
                <input
                  type="number"
                  min="1"
                  max="6"
                  value={formData.teamSize}
                  onChange={(e) => setFormData({ ...formData, teamSize: Number(e.target.value) })}
                  className="w-full bg-muted/60 px-3.5 py-2.5 rounded-xl text-xs text-foreground border border-border focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Technical Stack or Focus Interests
              </label>
              <textarea
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="e.g. Next.js, Postgres FTS, differential privacy simulation, Drizzle ORM..."
                className="w-full bg-muted/60 px-3.5 py-2.5 rounded-xl text-xs text-foreground placeholder:text-muted-foreground border border-border focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-xs hover:bg-primary/90 transition-all shadow-md shadow-emerald-500/20 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
            >
              {submitting ? (
                <span>Registering Interest...</span>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Register for Challenge</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
