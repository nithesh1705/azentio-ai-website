'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { usePersona } from '@/context/PersonaContext';
import {
  Terminal,
  Radio,
  Lightbulb,
  BookOpen,
  FlaskConical,
  FileCode,
  ShieldCheck,
  TrendingUp,
  ArrowRight,
  Sparkles,
  Users,
} from 'lucide-react';

export default function EmployeeDashboardPage() {
  const { actor } = usePersona();

  if (!actor.isVerifiedEmployee) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <ShieldCheck className="w-12 h-12 text-destructive mx-auto" />
        <h1 className="text-2xl font-bold text-foreground">Employee Access Restricted</h1>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          The Employee Innovation Lab requires a verified @azentio.com identity plus approved employee membership. Use the persona switcher above to select an Employee persona (e.g. Maya Lin, Tariq Al-Mansoor, or Liam Gallagher).
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="p-8 sm:p-10 rounded-3xl glass-panel border border-border relative overflow-hidden mb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                Azentio Internal Platform
              </span>
              <span className="badge-synthetic text-xs">Employee Audience</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
              Employee Innovation Lab & Tools
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-muted-foreground">
              Welcome back, <span className="font-semibold text-foreground">{actor.name}</span> ({actor.email}). Employee-only content is strictly quarantined from public and client search indexes.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/employee/playground"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500 transition-all shadow-md shadow-indigo-500/20 hover:scale-105 active:scale-95"
            >
              <Terminal className="w-4 h-4" />
              <span>Launch Playground</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Navigation Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        <ModuleCard
          title="Guided Playground"
          badge="Synthetic Simulation"
          desc="Inspect synthetic scenarios, trigger deterministic or AI-assisted algorithmic runs, and review explainable evidence."
          icon={<Terminal className="w-5 h-5 text-indigo-400" />}
          link="/employee/playground"
          linkText="Run Scenario Runner"
        />

        <ModuleCard
          title="Live Broadcasts & Sessions"
          badge="Employee Restricted"
          desc="Watch internal engineering brown-bags, release walkthroughs, and town hall recordings restricted to employee audience."
          icon={<Radio className="w-5 h-5 text-rose-400" />}
          link="/employee/live"
          linkText="Watch Sessions"
        />

        <ModuleCard
          title="Product Owner Ideas"
          badge="Continuous Loop"
          desc="Synthesize collective-learning themes into governed improvement ideas with audited status transitions."
          icon={<Lightbulb className="w-5 h-5 text-amber-400" />}
          link="/employee/ideas"
          linkText="Manage Ideas"
        />

        <ModuleCard
          title="Internal Knowledge Library"
          badge="Governed Library"
          desc="Access internal technical whitepapers, architectural decision logs, and prompt guidelines with review dates."
          icon={<BookOpen className="w-5 h-5 text-emerald-400" />}
          link="/employee/knowledge"
          linkText="Browse Library"
        />

        <ModuleCard
          title="Lab Experiments"
          badge="R&D Sandbox"
          desc="Submit internal model experiments and prototype ideas before client sandbox evaluation."
          icon={<FlaskConical className="w-5 h-5 text-cyan-400" />}
          link="/employee/experiments"
          linkText="Submit Experiment"
        />

        <ModuleCard
          title="Release Engineering"
          badge="v2.4.0 Live"
          desc="Review internal technical release notes, deprecation timelines, and database migration checklists."
          icon={<FileCode className="w-5 h-5 text-teal-400" />}
          link="/employee/releases"
          linkText="View Release Notes"
        />
      </div>
    </div>
  );
}

function ModuleCard({
  title,
  badge,
  desc,
  icon,
  link,
  linkText,
}: {
  title: string;
  badge: string;
  desc: string;
  icon: React.ReactNode;
  link: string;
  linkText: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      className="p-6 rounded-3xl glass-panel border border-border glow-card flex flex-col justify-between"
    >
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="p-2.5 rounded-xl bg-muted/80">{icon}</div>
          <span className="text-[10px] font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-full border border-border">
            {badge}
          </span>
        </div>
        <h3 className="text-lg font-bold text-foreground">{title}</h3>
        <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{desc}</p>
      </div>

      <div className="mt-6 pt-4 border-t border-border">
        <Link
          href={link}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-500 hover:underline"
        >
          <span>{linkText}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </motion.div>
  );
}

