'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, ShieldCheck, Linkedin } from 'lucide-react';
import { getLeaders } from '@/server/dal/store';

export default function LeadershipPage() {
  const allLeaders = getLeaders();
  const executives = allLeaders.filter((l) => l.category === 'executive');
  const board = allLeaders.filter((l) => l.category === 'board');

  return (
    <div className="relative overflow-hidden py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold mb-4">
          {/* <Sparkles className="w-3.5 h-3.5 text-emerald-500" /> */}
          <span>Governance & Vision</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-foreground tracking-tight">
          Executive Leadership & Board
        </h1>
        <p className="mt-4 text-base text-muted-foreground leading-relaxed">
          Meet the experienced technology leaders guiding Azentio’s mission to provide specialized,
          intelligence-driven platforms across global financial institutions.
        </p>
      </div>

      {/* ── SECTION 1: EXECUTIVE LEADERSHIP ──────────────────────────────── */}
      <section className="mb-20">
        <div className="border-b border-border/60 pb-4 mb-8">
          <h2 className="text-2xl font-extrabold text-foreground tracking-tight">
            Executive Leadership Team
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Driving corporate execution, product engineering, sales, and global operations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {executives.map((person) => (
            <div
              key={person.id}
              className="p-6 rounded-2xl border border-border bg-card shadow-sm hover:border-emerald-500/40 hover:shadow-lg transition-all flex flex-col justify-between"
            >
              <div>
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white font-extrabold text-xl mb-4 shadow-sm">
                  {person.name.charAt(0)}
                </div>
                <h3 className="font-extrabold text-lg text-foreground">{person.name}</h3>
                <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                  {person.role}
                </div>
                <p className="text-xs text-muted-foreground mt-3 leading-relaxed">{person.bio}</p>
              </div>

              {person.previousRoles && (
                <div className="mt-4 pt-3 border-t border-border/40 text-[11px] text-muted-foreground">
                  <span className="font-semibold text-foreground">Background:</span>{' '}
                  {person.previousRoles}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── SECTION 2: BOARD OF DIRECTORS ────────────────────────────────── */}
      <section className="pt-8 border-t border-border/60">
        <div className="border-b border-border/60 pb-4 mb-8">
          <h2 className="text-2xl font-extrabold text-foreground tracking-tight">
            Board of Directors
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Governance, institutional steering, and technology investment oversight associated with Apax.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {board.map((director) => (
            <div
              key={director.id}
              className="p-6 rounded-2xl border border-border bg-card shadow-sm hover:border-emerald-500/40 hover:shadow-lg transition-all flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-muted/60 border border-border/60 flex items-center justify-center text-foreground font-extrabold text-base mb-4">
                  {director.name.charAt(0)}
                </div>
                <h3 className="font-extrabold text-base text-foreground">{director.name}</h3>
                <div className="text-xs font-bold text-cyan-600 dark:text-cyan-400 mt-0.5">
                  {director.role}
                </div>
                <p className="text-xs text-muted-foreground mt-3 leading-relaxed">{director.bio}</p>
              </div>

              {director.previousRoles && (
                <div className="mt-4 pt-3 border-t border-border/40 text-[11px] text-muted-foreground">
                  <span className="font-semibold text-foreground">Distinction:</span>{' '}
                  {director.previousRoles}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

