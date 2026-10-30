'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { submitDemoEnquiry, getPublicOfferings } from '@/server/dal/store';
import {
  Sparkles,
  Send,
  CheckCircle2,
  Building2,
  Mail,
  User,
  MessageSquare,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';

export default function DemoRequestPage() {
  const offerings = getPublicOfferings();
  const [formData, setFormData] = useState({
    fullName: '',
    workEmail: '',
    companyName: '',
    offeringSlug: 'financial-analysis-intelligence',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.workEmail || !formData.companyName) {
      setError('Please fill in all required fields.');
      return;
    }

    setSubmitting(true);
    setError(null);

    setTimeout(() => {
      try {
        submitDemoEnquiry(formData);
        setSubmitted(true);
      } catch (err: any) {
        setError(err.message || 'Failed to submit enquiry');
      } finally {
        setSubmitting(false);
      }
    }, 600);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <span className="text-xs uppercase tracking-widest font-bold text-primary">Live Demonstration</span>
        <h1 className="text-4xl font-extrabold text-foreground mt-2 tracking-tight">
          Request an Enterprise Product Demo
        </h1>
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
          Experience our AI architectures in a dedicated synthetic sandbox. Discuss tailored deployment models with our technical specialists.
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
            <h2 className="text-2xl font-bold text-foreground">Enquiry Received!</h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
              Thank you, <span className="font-semibold text-foreground">{formData.fullName}</span>. An Azentio Solutions Architect will reach out to <span className="font-semibold text-foreground">{formData.workEmail}</span> with an invitation token to your dedicated sandbox.
            </p>
            <div className="pt-4">
              <button
                onClick={() => {
                  setSubmitted(false);
                  setFormData({
                    fullName: '',
                    workEmail: '',
                    companyName: '',
                    offeringSlug: 'financial-analysis-intelligence',
                    message: '',
                  });
                }}
                className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all"
              >
                Submit Another Request
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
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="e.g. Rachel Adams"
                    className="w-full bg-muted/60 pl-9 pr-4 py-2.5 rounded-xl text-xs text-foreground placeholder:text-muted-foreground border border-border focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Work Email <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="email"
                    required
                    value={formData.workEmail}
                    onChange={(e) => setFormData({ ...formData, workEmail: e.target.value })}
                    placeholder="rachel@enterprise-bank.com"
                    className="w-full bg-muted/60 pl-9 pr-4 py-2.5 rounded-xl text-xs text-foreground placeholder:text-muted-foreground border border-border focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Financial Institution / Company <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    required
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    placeholder="e.g. Apex Global Bank"
                    className="w-full bg-muted/60 pl-9 pr-4 py-2.5 rounded-xl text-xs text-foreground placeholder:text-muted-foreground border border-border focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Primary Offering of Interest
                </label>
                <select
                  value={formData.offeringSlug}
                  onChange={(e) => setFormData({ ...formData, offeringSlug: e.target.value })}
                  className="w-full bg-muted/60 px-3.5 py-2.5 rounded-xl text-xs text-foreground border border-border focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  {offerings.map((o) => (
                    <option key={o.id} value={o.slug}>
                      {o.name} ({o.category})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Evaluation Goals & Specific Requirements (Optional)
              </label>
              <textarea
                rows={3}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Mention specific portfolio sizes, regulatory jurisdictions, or stress testing scenarios..."
                className="w-full bg-muted/60 px-3.5 py-2.5 rounded-xl text-xs text-foreground placeholder:text-muted-foreground border border-border focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-xs hover:bg-primary/90 transition-all shadow-md shadow-emerald-500/20 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
            >
              {submitting ? (
                <span>Submitting Request...</span>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Request Dedicated Sandbox Session</span>
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-muted-foreground pt-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>We never share contact details. Sandbox demonstrations use synthetic data.</span>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

