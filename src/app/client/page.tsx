'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { usePersona } from '@/context/PersonaContext';
import { getClientDashboardData } from '@/server/dal/client/dashboard';
import {
  Building2,
  Sparkles,
  ArrowRight,
  PlusCircle,
  PlayCircle,
  BookOpen,
  Calendar,
  AlertCircle,
  Lightbulb,
  Bell,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ExternalLink,
  ChevronRight,
  Layers,
  Database,
  Info,
} from 'lucide-react';

export default function ClientDashboardPage() {
  const { actor, activeTenant } = usePersona();
  const [registeredWebinars, setRegisteredWebinars] = useState<string[]>([]);
  const [registerSuccessMsg, setRegisterSuccessMsg] = useState<string | null>(null);

  if (!actor.activeTenantId || !activeTenant) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-muted/60 border border-border flex items-center justify-center mx-auto shadow-inner">
          <Building2 className="w-8 h-8 text-muted-foreground" />
        </div>
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight">No Active Client Workspace</h1>
        <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
          You are signed in as <span className="font-semibold text-foreground">{actor.name}</span>, but no active client organisation is currently selected. Choose a workspace or sign in with your enterprise credentials.
        </p>
        <div className="flex justify-center gap-3 pt-2">
          <Link
            href="/choose-workspace"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-md shadow-primary/20"
          >
            <span>Switch Workspace</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/signin"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-all"
          >
            <span>Sign In</span>
          </Link>
        </div>
      </div>
    );
  }

  // Fetch dashboard data through DAL
  let data;
  try {
    data = getClientDashboardData(actor);
  } catch (err: any) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-destructive mx-auto" />
        <h2 className="text-xl font-bold text-foreground">Access Denied</h2>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">{err.message}</p>
        <Link
          href="/choose-workspace"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
        >
          Select Authorized Workspace
        </Link>
      </div>
    );
  }

  const {
    tenant,
    entitledOfferings,
    demos,
    contributionsSummary,
    actionNeededContributions,
    upcomingWebinars,
    visibleIdeas,
    recentNotifications,
  } = data;

  const isClientAdmin = actor.memberships.some(
    (m) => m.orgId === actor.activeTenantId && m.role === 'client_admin'
  );

  const handleRegisterWebinar = (id: string, title: string) => {
    if (!registeredWebinars.includes(id)) {
      setRegisteredWebinars((prev) => [...prev, id]);
      setRegisterSuccessMsg(`Registered for "${title}". Added to in-app calendar.`);
      setTimeout(() => setRegisterSuccessMsg(null), 4000);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Workspace Header Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="p-6 sm:p-8 rounded-3xl bg-card border border-border relative overflow-hidden shadow-sm"
      >
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex flex-wrap items-center gap-2.5 mb-2.5">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                {tenant.tier} Member Portal
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground border border-border flex items-center gap-1.5">
                <Database className="w-3 h-3 text-emerald-500" />
                <span>Synthetic Datasets Active</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono text-muted-foreground bg-muted/60">
                org_id: {tenant.id}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              {tenant.name}
            </h1>
            <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground">
              Connected workspace for <span className="font-semibold text-foreground">{actor.name}</span> ({actor.email}) &bull; Verified via domain <span className="font-mono text-foreground">{tenant.domain}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/client/observations/new"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all shadow-md shadow-primary/20 hover:scale-[1.02] active:scale-[0.98]"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Contribute Observation</span>
            </Link>

            <Link
              href="/client/demos"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-secondary text-secondary-foreground text-xs font-semibold hover:bg-secondary/80 border border-border transition-all"
            >
              <PlayCircle className="w-4 h-4 text-primary" />
              <span>Explore Demos ({demos.length})</span>
            </Link>

            {isClientAdmin && (
              <Link
                href="/client/admin/members"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-muted/80 text-foreground text-xs font-semibold hover:bg-muted transition-all border border-border"
              >
                <span>Org Admin</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        </div>
      </motion.div>

      {/* Action Needed Banner: Clarification Requested */}
      <AnimatePresence>
        {actionNeededContributions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-5 rounded-2xl bg-amber-500/10 dark:bg-amber-950/30 border border-amber-500/30 text-amber-900 dark:text-amber-200"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-bold tracking-tight">
                    Returned — Action Needed ({actionNeededContributions.length}{' '}
                    {actionNeededContributions.length === 1 ? 'observation' : 'observations'})
                  </h3>
                  <p className="text-xs text-amber-800/90 dark:text-amber-300/90 mt-0.5">
                    Our collective learning moderation team has returned feedback or requested clarification before publishing.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href={`/client/observations/${actionNeededContributions[0].id}`}
                  className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold transition-all inline-flex items-center gap-1.5 shadow-sm"
                >
                  <span>Review & Respond</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Banner if webinar registered */}
      {registerSuccessMsg && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{registerSuccessMsg}</span>
        </motion.div>
      )}

      {/* Contributions Pipeline Status Overview */}
      <div className="p-6 rounded-3xl bg-card border border-border space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-foreground">Contribution Lifecycle</h2>
            <p className="text-xs text-muted-foreground">
              Real-time status of your organisation's field observations and collective submissions
            </p>
          </div>
          <Link
            href="/client/observations"
            className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
          <Link
            href="/client/observations?tab=mine&status=draft"
            className="p-3.5 rounded-2xl bg-muted/50 hover:bg-muted border border-border/60 transition-all text-center group"
          >
            <div className="text-2xl font-black text-foreground group-hover:text-primary transition-colors">
              {contributionsSummary.drafts}
            </div>
            <div className="text-xs font-medium text-muted-foreground mt-1">Drafts (Mine)</div>
          </Link>

          <Link
            href="/client/observations?tab=org&status=submitted"
            className="p-3.5 rounded-2xl bg-muted/50 hover:bg-muted border border-border/60 transition-all text-center group"
          >
            <div className="text-2xl font-black text-foreground group-hover:text-primary transition-colors">
              {contributionsSummary.submitted}
            </div>
            <div className="text-xs font-medium text-muted-foreground mt-1">Submitted</div>
          </Link>

          <Link
            href="/client/observations?tab=org&status=in_review"
            className="p-3.5 rounded-2xl bg-muted/50 hover:bg-muted border border-border/60 transition-all text-center group"
          >
            <div className="text-2xl font-black text-amber-500 transition-colors">
              {contributionsSummary.inReview}
            </div>
            <div className="text-xs font-medium text-muted-foreground mt-1">In Review</div>
          </Link>

          <Link
            href="/client/observations?tab=mine&status=clarification_requested"
            className="p-3.5 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-all text-center group"
          >
            <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
              {contributionsSummary.clarificationRequested}
            </div>
            <div className="text-xs font-semibold text-amber-700 dark:text-amber-300 mt-1">
              Action Needed
            </div>
          </Link>

          <Link
            href="/client/observations?tab=org&status=published"
            className="p-3.5 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 transition-all text-center group"
          >
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {contributionsSummary.published}
            </div>
            <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 mt-1">
              Published
            </div>
          </Link>

          <Link
            href="/client/observations?tab=org&status=withdrawn"
            className="p-3.5 rounded-2xl bg-muted/30 hover:bg-muted/50 border border-border/40 transition-all text-center group"
          >
            <div className="text-2xl font-bold text-muted-foreground">
              {contributionsSummary.withdrawn}
            </div>
            <div className="text-xs font-medium text-muted-foreground mt-1">Withdrawn</div>
          </Link>
        </div>
      </div>

      {/* Main Grid: Entitled Offerings & Quick Demos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Entitled Offerings & Sandbox Demos */}
        <div className="lg:col-span-2 space-y-8">
          {/* Entitled Offerings */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-foreground">Entitled Solutions</h2>
                <p className="text-xs text-muted-foreground">
                  AI engines and software packages active under your organization's enterprise agreement
                </p>
              </div>
              <span className="text-xs font-medium text-muted-foreground">
                {entitledOfferings.length} Active Entitlements
              </span>
            </div>

            {entitledOfferings.length === 0 ? (
              <div className="p-8 rounded-2xl border border-dashed border-border bg-card/50 text-center space-y-3">
                <Layers className="w-8 h-8 text-muted-foreground mx-auto" />
                <h3 className="text-sm font-semibold text-foreground">No Active Entitlements Found</h3>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  Your organisation currently has no entitled product modules configured. Contact your client administrator or Azentio account director.
                </p>
                {isClientAdmin && (
                  <Link
                    href="/client/admin"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    <span>Request Solution Entitlement</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {entitledOfferings.map((offering) => (
                  <motion.div
                    key={offering.id}
                    whileHover={{ y: -2 }}
                    className="p-5 rounded-2xl bg-card border border-border flex flex-col justify-between hover:border-primary/40 transition-all shadow-sm"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                          {offering.badge || offering.category}
                        </span>
                        <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Entitled</span>
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-foreground">{offering.name}</h3>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                        {offering.tagline || offering.description}
                      </p>
                    </div>

                    <div className="pt-4 mt-3 border-t border-border/50 flex items-center justify-between text-xs">
                      <Link
                        href={`/client/demos?offering=${offering.id}`}
                        className="font-semibold text-primary hover:underline inline-flex items-center gap-1"
                      >
                        <PlayCircle className="w-3.5 h-3.5" />
                        <span>Launch Sandbox</span>
                      </Link>
                      <Link
                        href={`/client/observations/new?offeringId=${offering.id}`}
                        className="font-medium text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        <span>Record Note</span>
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Launch Demos */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-foreground">Interactive Sandboxes & Demos</h2>
                <p className="text-xs text-muted-foreground">
                  Pre-configured deterministic & AI simulation runs with synthetic enterprise datasets
                </p>
              </div>
              <Link
                href="/client/demos"
                className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1"
              >
                <span>All Scenarios</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {demos.map((demo) => (
                <div
                  key={demo.id}
                  className="p-5 rounded-2xl bg-card border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-primary/30 transition-all shadow-sm"
                >
                  <div className="space-y-1 max-w-xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                        {demo.offeringName}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-muted text-foreground">
                        <Clock className="w-3 h-3 text-muted-foreground" />
                        <span>~{demo.estimatedMinutes} min run</span>
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-foreground">{demo.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {demo.description}
                    </p>
                    <div className="pt-1 flex items-center gap-1.5 text-[11px] text-muted-foreground font-mono">
                      <Info className="w-3 h-3 text-primary/70 shrink-0" />
                      <span>{demo.honestyNotice}</span>
                    </div>
                  </div>

                  <div className="sm:shrink-0 flex items-center">
                    <Link
                      href={`/client/demos/${demo.id}`}
                      className="w-full sm:w-auto px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all inline-flex items-center justify-center gap-2 shadow-sm"
                    >
                      <PlayCircle className="w-4 h-4" />
                      <span>Start Demo</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Community Learning, Webinars & Roadmaps */}
        <div className="space-y-8">
          {/* Shared Learning CTA */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-primary/10 via-card to-card border border-primary/20 space-y-4">
            <div className="w-10 h-10 rounded-2xl bg-primary/20 text-primary flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">De-Identified Shared Feed</h3>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Discover verified cross-organisational benchmarks and operational themes without leaking identity or tenant IP.
              </p>
            </div>
            <div className="pt-1">
              <Link
                href="/client/shared"
                className="w-full px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all inline-flex items-center justify-center gap-2 shadow-sm"
              >
                <BookOpen className="w-4 h-4" />
                <span>Explore Shared Learning</span>
              </Link>
            </div>
          </div>

          {/* Upcoming Masterclasses / Webinars */}
          <div className="p-6 rounded-3xl bg-card border border-border space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                <span>Sector Masterclasses</span>
              </h3>
              <Link
                href="/client/resources"
                className="text-xs font-semibold text-primary hover:underline"
              >
                Resources
              </Link>
            </div>

            <div className="space-y-3">
              {upcomingWebinars.map((webinar) => (
                <div
                  key={webinar.id}
                  className="p-3.5 rounded-2xl bg-muted/40 border border-border/60 space-y-2"
                >
                  <div className="text-[10px] font-bold uppercase tracking-wider text-primary">
                    {webinar.date} &bull; {webinar.time}
                  </div>
                  <h4 className="text-xs font-bold text-foreground leading-snug">
                    {webinar.title}
                  </h4>
                  <div className="text-[11px] text-muted-foreground">
                    Speaker: {webinar.speaker}
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    {registeredWebinars.includes(webinar.id) ? (
                      <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Registered</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => handleRegisterWebinar(webinar.id, webinar.title)}
                        className="px-3 py-1.5 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground text-xs font-medium transition-all"
                      >
                        Register Free
                      </button>
                    )}
                    <a
                      href={webinar.calendarUrl}
                      download
                      className="text-[11px] text-muted-foreground hover:text-foreground inline-flex items-center gap-1 font-medium"
                    >
                      <span>.ics</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Improvement Ideas Backlog Preview */}
          <div className="p-6 rounded-3xl bg-card border border-border space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                <span>Feature Roadmaps</span>
              </h3>
              <Link
                href="/client/ideas"
                className="text-xs font-semibold text-primary hover:underline"
              >
                View Backlog
              </Link>
            </div>

            <div className="space-y-2.5">
              {visibleIdeas.map((idea) => (
                <div
                  key={idea.id}
                  className="p-3 rounded-xl bg-muted/30 border border-border/50 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground">{idea.title}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-primary/10 text-primary capitalize">
                      {idea.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground line-clamp-2">
                    {idea.clientVisibleSummary || idea.problemStatement}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Recent In-App Notifications */}
          <div className="p-6 rounded-3xl bg-card border border-border space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Bell className="w-4 h-4 text-primary" />
                <span>Notifications</span>
              </h3>
              <span className="text-[11px] text-muted-foreground">
                {recentNotifications.length} recent
              </span>
            </div>

            {recentNotifications.length === 0 ? (
              <p className="text-xs text-muted-foreground">No unread notifications.</p>
            ) : (
              <div className="space-y-2.5">
                {recentNotifications.map((notif) => (
                  <div
                    key={notif.id}
                    className="p-3 rounded-xl bg-muted/40 border border-border/50 text-xs space-y-1"
                  >
                    <div className="font-semibold text-foreground">{notif.title}</div>
                    <p className="text-[11px] text-muted-foreground">{notif.message}</p>
                    <div className="text-[10px] text-muted-foreground/80 pt-0.5">
                      {new Date(notif.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
