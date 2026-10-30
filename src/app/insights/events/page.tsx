'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Calendar,
  MapPin,
  Clock,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Users,
  Video,
  Globe,
  Tag,
} from 'lucide-react';

const UPCOMING_EVENTS = [
  {
    id: 'evt-01',
    title: 'Azentio Global Collective AI Summit 2026',
    category: 'Flagship Summit',
    date: 'November 18-20, 2026',
    time: '09:00 - 17:30 SGT',
    location: 'Marina Bay Sands Expo, Singapore & Global Virtual',
    format: 'Hybrid',
    description:
      'The premier gathering for chief risk officers, enterprise architects, and central bank regulators exploring governed collective intelligence, federated privacy, and autonomous credit appraisal.',
    speakers: [
      { name: 'Dr. Alistair Chen', role: 'Head of Collective AI, Azentio' },
      { name: 'Elena Rostova', role: 'Chief Risk Officer, Nordic Credit Group' },
      { name: 'Vikram Sethi', role: 'Executive Director, Monetary Tech Advisory' },
    ],
    status: 'Open for Registration',
    badge: 'Flagship',
  },
  {
    id: 'evt-02',
    title: 'Roundtable: Overcoming Dark Data in SME Balance Sheets',
    category: 'Executive Roundtable',
    date: 'December 4, 2026',
    time: '14:00 - 16:00 GMT',
    location: 'Canary Wharf Executive Suite, London & Private Stream',
    format: 'Invitation & Application',
    description:
      'An intimate technical briefing on synthetic data generation, automated cross-tenant pattern discovery, and regulatory compliance under stringent privacy safeguards.',
    speakers: [
      { name: 'Sarah Jenkins', role: 'Director of Quantitative Research' },
      { name: 'Marcus Sterling', role: 'Partner, Banking Innovation Guild' },
    ],
    status: 'Limited Seats',
    badge: 'Exclusive',
  },
  {
    id: 'evt-03',
    title: 'Webinar: Next-Gen Core Banking with Embedded Agentic Workflows',
    category: 'Live Technical Webinar',
    date: 'December 12, 2026',
    time: '11:00 - 12:30 EST',
    location: 'Live Interactive Broadcast',
    format: 'Virtual Live Stream',
    description:
      'Demonstration of sub-second settlement pipelines, autonomous AML anomaly flagging, and zero-downtime event sourcing built on Azentio CBE.',
    speakers: [
      { name: 'Nithesh M', role: 'Principal Systems Architect, Azentio' },
      { name: 'Pranika K', role: 'Moderation & Safety Lead' },
    ],
    status: 'Free Access',
    badge: 'Webinar',
  },
];

export default function EventsPage() {
  const [registered, setRegistered] = useState<string | null>(null);

  const handleRegister = (eventId: string) => {
    setRegistered(eventId);
    setTimeout(() => {
      setRegistered(null);
    }, 4000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
          <Calendar className="w-3.5 h-3.5" />
          <span>Industry Summits & Technical Sessions</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-foreground tracking-tight">
          Azentio <span className="text-emerald-500">Events & Summits</span>
        </h1>
        <p className="text-base text-muted-foreground">
          Join leading financial executives, AI researchers, and compliance officers as we pioneer the frontier of governed collective intelligence for banking.
        </p>
      </div>

      {/* Events List */}
      <div className="space-y-8">
        {UPCOMING_EVENTS.map((evt, idx) => (
          <motion.div
            key={evt.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="p-8 rounded-3xl glass-panel border border-border/80 hover:border-emerald-500/40 shadow-xl transition-all"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Event Info */}
              <div className="lg:col-span-8 space-y-4">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    {evt.category}
                  </span>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-card border border-border text-foreground">
                    {evt.format}
                  </span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1 font-medium">
                    <Clock className="w-3.5 h-3.5" />
                    {evt.time}
                  </span>
                </div>

                <h2 className="text-2xl font-bold text-foreground hover:text-emerald-500 transition-colors">
                  {evt.title}
                </h2>

                <p className="text-sm text-muted-foreground leading-relaxed">
                  {evt.description}
                </p>

                {/* Speakers */}
                <div className="pt-2">
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Keynote & Discussion Leads
                  </div>
                  <div className="flex flex-wrap gap-4">
                    {evt.speakers.map((spk) => (
                      <div key={spk.name} className="flex items-center gap-2 text-xs">
                        <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center font-bold text-[10px]">
                          {spk.name.charAt(0)}
                        </div>
                        <div>
                          <span className="font-semibold text-foreground">{spk.name}</span>
                          <span className="text-muted-foreground text-[11px] block">{spk.role}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Event Logistics & RSVP */}
              <div className="lg:col-span-4 p-6 rounded-2xl bg-card/60 border border-border/80 space-y-4">
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-foreground font-semibold">
                    <Calendar className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{evt.date}</span>
                  </div>
                  <div className="flex items-start gap-2 text-muted-foreground">
                    <MapPin className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                    <span>{evt.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="w-4 h-4 text-cyan-500 shrink-0" />
                    <span>{evt.status}</span>
                  </div>
                </div>

                <div className="pt-2">
                  {registered === evt.id ? (
                    <div className="w-full py-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center justify-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>RSVP Confirmed & Pass Issued</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleRegister(evt.id)}
                      className="w-full py-2.5 rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-md shadow-primary/20 hover:scale-105 active:scale-95"
                    >
                      <span>Register for Session</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

