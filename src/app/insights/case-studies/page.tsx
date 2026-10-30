'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, BookOpen, Quote, CheckCircle2 } from 'lucide-react';
import { getCustomerStories } from '@/server/dal/store';

export default function CaseStudiesPage() {
  const stories = getCustomerStories();

  return (
    <div className="relative overflow-hidden py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold mb-4">
          <BookOpen className="w-3.5 h-3.5 text-emerald-500" />
          <span>Customer Success Stories</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-foreground tracking-tight">
          Client Outcomes & Transformations
        </h1>
        <p className="mt-4 text-base text-muted-foreground leading-relaxed">
          Discover how tier-1 financial institutions, leading insurers, and industrial enterprises
          partner with Azentio to drive growth, efficiency, and compliance.
        </p>
      </div>

      {/* Case studies list */}
      <div className="space-y-10">
        {stories.map((story) => (
          <div
            key={story.id}
            className="p-8 sm:p-10 rounded-3xl border border-border bg-card shadow-lg backdrop-blur-sm"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border/60">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono uppercase">
                    {story.domain}
                  </span>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-xs text-muted-foreground font-semibold">
                    {story.country}
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground">
                  {story.title}
                </h2>
                <div className="text-sm font-semibold text-muted-foreground mt-1">
                  Client: {story.clientName}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-6">
              <div className="lg:col-span-2 space-y-6">
                <div>
                  <h3 className="font-bold text-sm text-foreground uppercase tracking-wider mb-2">
                    The Business Challenge
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{story.challenge}</p>
                </div>

                <div>
                  <h3 className="font-bold text-sm text-foreground uppercase tracking-wider mb-2">
                    Azentio Solution Implemented
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{story.solution}</p>
                </div>

                {/* Outcomes */}
                <div>
                  <h3 className="font-bold text-sm text-foreground uppercase tracking-wider mb-3">
                    Measurable Key Outcomes
                  </h3>
                  <div className="space-y-2">
                    {story.outcomes.map((out, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-xs text-foreground">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{out}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Quote / Testimonial */}
              {story.quote && (
                <div className="p-6 rounded-2xl bg-muted/30 border border-border/50 flex flex-col justify-between self-start">
                  <div>
                    <Quote className="w-8 h-8 text-emerald-500/40 mb-3" />
                    <p className="text-xs italic text-foreground leading-relaxed">
                      "{story.quote}"
                    </p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-border/40">
                    <div className="text-xs font-bold text-foreground">{story.quoteAuthor}</div>
                    <div className="text-[11px] text-muted-foreground font-medium mt-0.5">
                      {story.quoteRole}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

