'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Mail,
  Phone,
  MapPin,
  Send,
  CheckCircle2,
  Building,
  Globe,
  ShieldCheck,
  Clock,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

const OFFICES = [
  {
    city: 'Singapore',
    region: 'Global HQ',
    address: '8 Marina Boulevard, #05-02 Marina Bay Financial Centre, Singapore 018981',
    phone: '+65 6818 6000',
    email: 'singapore@azentio.com',
  },
  {
    city: 'Dubai',
    region: 'Middle East & Africa HQ',
    address: 'Level 14, Al Saada Tower, Dubai International Financial Centre, UAE',
    phone: '+971 4 362 7000',
    email: 'dubai@azentio.com',
  },
  {
    city: 'Mumbai',
    region: 'India & South Asia Tech Hub',
    address: 'B-Wing, 9th Floor, Nesco IT Park, Western Express Highway, Goregaon, Mumbai 400063',
    phone: '+91 22 6700 8000',
    email: 'india@azentio.com',
  },
  {
    city: 'London',
    region: 'European Operations',
    address: '1 Canada Square, 37th Floor, Canary Wharf, London E14 5AA, United Kingdom',
    phone: '+44 20 7947 1000',
    email: 'london@azentio.com',
  },
];

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    topic: 'Enterprise AI Solutions',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
          <Mail className="w-3.5 h-3.5" />
          <span>Global Enterprise Inquiries</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-foreground tracking-tight">
          Connect with <span className="text-emerald-500">azentio.ai</span>
        </h1>
        <p className="text-base text-muted-foreground">
          Whether you are evaluating governed collective intelligence for your institution, seeking sandbox access, or requesting compliance documentation, our specialists are ready to assist.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Contact Form */}
        <div className="lg:col-span-7 glass-panel p-8 sm:p-10 rounded-3xl border border-border shadow-xl">
          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12 space-y-4"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto border border-emerald-500/20">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-foreground">Message Received</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Thank you for reaching out, <span className="font-semibold text-foreground">{formData.name}</span>. An Azentio enterprise AI director will review your enquiry and respond within 24 hours.
              </p>
              <div className="pt-4">
                <button
                  onClick={() => setSubmitted(false)}
                  className="px-6 py-2.5 rounded-xl text-xs font-semibold border border-border hover:bg-accent text-foreground transition-all"
                >
                  Send Another Message
                </button>
              </div>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-foreground">Send Us a Direct Message</h2>
                <p className="text-xs text-muted-foreground">
                  All communications are encrypted and processed under strict enterprise NDA boundaries.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Eleanor Vance"
                    className="w-full px-4 py-2.5 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">Work Email Address *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="e.g. eleanor@globalbank.com"
                    className="w-full px-4 py-2.5 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">Financial Institution / Company *</label>
                  <input
                    type="text"
                    required
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="e.g. Apex Continental Bank"
                    className="w-full px-4 py-2.5 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">Phone Number</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="e.g. +1 (555) 019-2834"
                    className="w-full px-4 py-2.5 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Topic of Inquiry</label>
                <select
                  value={formData.topic}
                  onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                >
                  <option value="Enterprise AI Solutions">Enterprise AI Solutions Evaluation</option>
                  <option value="Governed Collective Intelligence">Governed Collective Intelligence & Federated Sandbox</option>
                  <option value="Compliance & Regulatory Auditing">Compliance & Regulatory Auditing (AML / CBE / FAI)</option>
                  <option value="Hackathon & Academic Partnerships">Hackathon & Academic Partnerships</option>
                  <option value="Careers & Talent">Careers & Talent Opportunities</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Message Details *</label>
                <textarea
                  rows={4}
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Please describe your institution's objectives, portfolio focus, or specific questions..."
                  className="w-full px-4 py-2.5 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all resize-none"
                />
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>ISO 27001 & SOC 2 Type II Certified Data Protocols</span>
                </div>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-3 rounded-xl font-semibold text-xs bg-primary text-primary-foreground hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:scale-105 active:scale-95"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Inquiry</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Right Info: Global Offices & Fast Links */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-border shadow-lg space-y-6">
            <div className="space-y-2 pb-4 border-b border-border">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Building className="w-5 h-5 text-emerald-500" />
                Global Corporate Hubs
              </h2>
              <p className="text-xs text-muted-foreground">
                Operating across key financial capitals with 24/7 mission-critical support.
              </p>
            </div>

            <div className="space-y-4">
              {OFFICES.map((office) => (
                <div
                  key={office.city}
                  className="p-4 rounded-2xl bg-card/60 border border-border/80 hover:border-emerald-500/40 transition-all space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground text-sm">{office.city}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold">
                      {office.region}
                    </span>
                  </div>
                  <p className="text-muted-foreground flex items-start gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
                    <span>{office.address}</span>
                  </p>
                  <div className="flex items-center gap-4 text-[11px] text-muted-foreground pt-1">
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3 text-emerald-500" />
                      {office.phone}
                    </span>
                    <span className="flex items-center gap-1">
                      <Mail className="w-3 h-3 text-cyan-500" />
                      {office.email}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs space-y-2">
              <div className="font-bold text-foreground flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-emerald-500" />
                <span>Prefer an Instant Demo?</span>
              </div>
              <p className="text-muted-foreground">
                Schedule a guided walkthrough of our Financial Analysis Intelligence or Core Banking Engine.
              </p>
              <Link
                href="/demo-request"
                className="inline-flex items-center gap-1.5 font-semibold text-emerald-600 dark:text-emerald-400 hover:underline pt-1"
              >
                <span>Request live demonstration</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

