'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { usePersona } from '@/context/PersonaContext';
import { createExperiment } from '@/server/dal/employee/experiments';
import { getPlaygroundOfferings } from '@/server/dal/employee/playground';
import { Offering } from '@/types';
import {
  FlaskConical,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  Send,
  Plus,
  Trash2,
  AlertCircle,
} from 'lucide-react';

export default function NewExperimentPage() {
  const { actor } = usePersona();
  const router = useRouter();

  const [offerings, setOfferings] = useState<Offering[]>([]);
  const [selectedOfferingId, setSelectedOfferingId] = useState<string>('');
  const [title, setTitle] = useState('');
  const [hypothesis, setHypothesis] = useState('');
  const [description, setDescription] = useState('');
  const [approach, setApproach] = useState('');
  const [expectedOutcome, setExpectedOutcome] = useState('');
  const [successMetric, setSuccessMetric] = useState('');
  const [tagInput, setTagInput] = useState('Credit Risk, Anomaly Detection');
  const [links, setLinks] = useState<{ title: string; url: string }[]>([]);
  const [newLinkTitle, setNewLinkTitle] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!actor?.isVerifiedEmployee) return;
    try {
      const offs = getPlaygroundOfferings(actor);
      setOfferings(offs);
      if (offs.length > 0) {
        setSelectedOfferingId(offs[0].id);
      }
    } catch (e) {
      console.error(e);
    }
  }, [actor]);

  const handleAddLink = () => {
    if (newLinkTitle && newLinkUrl) {
      setLinks([...links, { title: newLinkTitle, url: newLinkUrl }]);
      setNewLinkTitle('');
      setNewLinkUrl('');
    }
  };

  const handleRemoveLink = (idx: number) => {
    setLinks(links.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (title.length < 5) {
      setErrorMessage('Title must be at least 5 characters');
      return;
    }
    if (hypothesis.length < 20) {
      setErrorMessage('Hypothesis must be at least 20 characters');
      return;
    }

    const selectedOffering = offerings.find((o) => o.id === selectedOfferingId);
    if (!selectedOffering) {
      setErrorMessage('Please select an offering');
      return;
    }

    setIsSubmitting(true);
    try {
      const newExp = createExperiment(actor, {
        title,
        offeringId: selectedOffering.id,
        offeringName: selectedOffering.name,
        hypothesis,
        description,
        approach,
        expectedOutcome,
        successMetric,
        tags: tagInput.split(',').map((t) => t.trim()).filter(Boolean),
        links,
      });

      router.push(`/employee/experiments/${newExp.id}`);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to create experiment');
      setIsSubmitting(false);
    }
  };

  if (!actor?.isVerifiedEmployee) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold">Employee Access Required</h2>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/employee/experiments"
          className="p-2 rounded-xl border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground text-xs"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Register New Experiment</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Define an empirical FinTech research hypothesis and test criteria.
          </p>
        </div>
      </div>

      {/* Quarantined Visibility Banner */}
      <div className="flex items-center gap-3 p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-900 dark:text-indigo-300 text-xs font-semibold">
        <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
        <div>
          <span className="font-bold">Audience: Employee Restricted. </span>
          <span>
            This experiment will be quarantined to verified Azentio employees and never exposed in client search or external AIRA retrieval.
          </span>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6 bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs font-bold text-foreground uppercase tracking-wider">
              Experiment Title *
            </label>
            <input
              required
              type="text"
              minLength={5}
              maxLength={150}
              placeholder="e.g. Non-linear Fourier Seasonality Smoothing for SME Working Capital"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-xs outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-wider">
              Target Offering *
            </label>
            <select
              value={selectedOfferingId}
              onChange={(e) => setSelectedOfferingId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-xs outline-none focus:ring-2 focus:ring-primary/20"
            >
              {offerings.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name} ({o.category})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-wider">
              Tags (Comma separated)
            </label>
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              placeholder="e.g. SME, Cash Flow, Kalman Filter"
              className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-xs outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-foreground uppercase tracking-wider">
            Hypothesis Statement * (Min 20 chars)
          </label>
          <textarea
            required
            rows={3}
            minLength={20}
            maxLength={500}
            placeholder="State what you predict will occur when the technique is applied..."
            value={hypothesis}
            onChange={(e) => setHypothesis(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-xs outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-foreground uppercase tracking-wider">
            Problem Background & Description
          </label>
          <textarea
            rows={3}
            maxLength={1000}
            placeholder="Context regarding why existing models fail or why this spike is valuable..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-xs outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-wider">
              Proposed Method & Approach
            </label>
            <textarea
              rows={3}
              placeholder="Algorithmic steps, architecture, and data pipelines..."
              value={approach}
              onChange={(e) => setApproach(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-xs outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-wider">
              Measurable Success Metric
            </label>
            <textarea
              rows={3}
              placeholder="e.g. >= 30% reduction in false-alarm alerts on synthetic benchmark..."
              value={successMetric}
              onChange={(e) => setSuccessMetric(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-xs outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        {/* Supporting Links */}
        <div className="space-y-2 pt-2 border-t border-border">
          <label className="text-xs font-bold text-foreground uppercase tracking-wider">
            Supporting Research & Artifact Links
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              placeholder="Link Title (e.g. Whitepaper)"
              value={newLinkTitle}
              onChange={(e) => setNewLinkTitle(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-input bg-background text-xs flex-1"
            />
            <input
              type="url"
              placeholder="https://..."
              value={newLinkUrl}
              onChange={(e) => setNewLinkUrl(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-input bg-background text-xs flex-1"
            />
            <button
              type="button"
              onClick={handleAddLink}
              className="px-3 py-1.5 rounded-xl bg-secondary text-secondary-foreground text-xs font-semibold"
            >
              Add Link
            </button>
          </div>

          {links.length > 0 && (
            <div className="space-y-1.5 pt-2">
              {links.map((link, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-xl bg-muted/40 text-xs"
                >
                  <span className="font-semibold">{link.title}: <span className="font-normal text-muted-foreground">{link.url}</span></span>
                  <button onClick={() => handleRemoveLink(idx)} className="text-destructive hover:underline">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <Link
            href="/employee/experiments"
            className="px-4 py-2 rounded-xl border border-border text-xs font-semibold hover:bg-muted"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all shadow-md shadow-primary/20 disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isSubmitting ? 'Registering...' : 'Register Experiment'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
