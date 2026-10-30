'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { usePersona } from '@/context/PersonaContext';
import { getEmployeeDashboardData, DashboardData } from '@/server/dal/employee/dashboard';
import { setNotificationReadState } from '@/server/dal/employee/notifications';
import {
  Terminal,
  Radio,
  FlaskConical,
  Users,
  BookOpen,
  Newspaper,
  Lightbulb,
  GraduationCap,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Play,
  PlusCircle,
  Bell,
  ChevronRight,
  Flame,
  Calendar,
  Layers,
  FileText,
  BadgeCheck,
} from 'lucide-react';

export default function EmployeeDashboardPage() {
  const { actor } = usePersona();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [liveCountdown, setLiveCountdown] = useState<string>('');

  useEffect(() => {
    try {
      if (actor && actor.isVerifiedEmployee) {
        const dashboardData = getEmployeeDashboardData(actor);
        setData(dashboardData);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [actor]);

  // Live countdown timer effect
  useEffect(() => {
    if (!data?.nextLiveSession) return;
    const updateCountdown = () => {
      const now = Date.now();
      const sessionTime = new Date(data.nextLiveSession!.startTime).getTime();
      const diffMs = sessionTime - now;

      if (diffMs <= 0) {
        setLiveCountdown('Live Now');
      } else {
        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
        setLiveCountdown(`${hours > 0 ? `${hours}h ` : ''}${minutes}m ${seconds}s`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [data?.nextLiveSession]);

  const handleMarkNotificationRead = (notifId: string) => {
    if (!actor) return;
    try {
      setNotificationReadState(actor, notifId, true);
      if (data) {
        setData({
          ...data,
          recentNotifications: data.recentNotifications.map((n) =>
            n.id === notifId ? { ...n, state: 'read' } : n
          ),
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (!actor.isVerifiedEmployee) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">Employee Access Restricted</h1>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          The Employee Innovation Lab requires a verified @azentio.com email address and active listing in the employee security directory.
        </p>
        <div className="pt-2">
          <Link
            href="/signin"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-md shadow-primary/20"
          >
            <span>Sign In with Azentio Corporate ID</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-pulse">
        <div className="h-32 rounded-3xl bg-muted/40" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 rounded-2xl bg-muted/30" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 rounded-2xl bg-muted/30" />
          <div className="h-96 rounded-2xl bg-muted/30" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <AlertTriangle className="w-10 h-10 text-destructive mx-auto" />
        <h2 className="text-xl font-bold">Failed to Load Dashboard</h2>
        <p className="text-sm text-muted-foreground">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-semibold"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* 1. Header Greeting & Role Badges */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-br from-card via-card/90 to-primary/5 p-6 sm:p-8 shadow-sm"
      >
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
                <Sparkles className="w-3.5 h-3.5" />
                Employee Innovation Hub
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <BadgeCheck className="w-3 h-3" />
                Verified Azentio Identity
              </span>
              {data.actor.platformGrants.map((grant) => (
                <span
                  key={grant}
                  className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 uppercase"
                >
                  {grant.replace('_', ' ')}
                </span>
              ))}
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                Welcome back, {data.actor.name}
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-2xl">
                Explore synthetic offering sandboxes, internal engineering broadcasts, and cross-team innovation experiments. All content is strictly quarantined from public indexes.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/employee/playground"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all shadow-md shadow-primary/20 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Terminal className="w-4 h-4" />
              <span>New Run</span>
            </Link>
            <Link
              href="/employee/experiments/new"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card hover:bg-muted text-foreground text-xs font-semibold border border-border transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <PlusCircle className="w-4 h-4 text-primary" />
              <span>New Experiment</span>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* 2. Quick Navigation Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5 sm:gap-3">
        {[
          { label: 'Playground', icon: Terminal, href: '/employee/playground', color: 'text-indigo-500' },
          { label: 'Live Sessions', icon: Radio, href: '/employee/live', color: 'text-rose-500' },
          { label: 'Experiments', icon: FlaskConical, href: '/employee/experiments', color: 'text-emerald-500' },
          { label: 'Team Space', icon: Users, href: '/employee/teams', color: 'text-blue-500' },
          { label: 'Knowledge', icon: BookOpen, href: '/employee/knowledge', color: 'text-amber-500' },
          { label: 'Releases', icon: Newspaper, href: '/employee/releases', color: 'text-purple-500' },
          { label: 'My Ideas', icon: Lightbulb, href: '/employee/ideas', color: 'text-cyan-500' },
          { label: 'Learning Work', icon: GraduationCap, href: '/employee/learning', color: 'text-fuchsia-500' },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              href={item.href}
              className="flex flex-col items-center justify-center p-3 rounded-2xl bg-card border border-border hover:border-primary/40 hover:bg-primary/5 transition-all group text-center"
            >
              <Icon className={`w-5 h-5 ${item.color} group-hover:scale-110 transition-transform mb-1.5`} />
              <span className="text-[11px] font-semibold text-foreground group-hover:text-primary transition-colors">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>

      {/* 3. Live Now / Next Session Hero Card */}
      {data.nextLiveSession && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl border border-rose-500/20 bg-gradient-to-r from-rose-500/10 via-card to-card p-6 sm:p-7 shadow-sm"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-rose-500">
                  {data.nextLiveSession.status === 'live' ? 'Live Broadcast Happening Now' : 'Upcoming Internal Broadcast'}
                </span>
                {liveCountdown && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                    {liveCountdown}
                  </span>
                )}
              </div>

              <div>
                <h3 className="text-lg sm:text-xl font-bold text-foreground">
                  {data.nextLiveSession.title}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1 line-clamp-2 max-w-3xl">
                  {data.nextLiveSession.description}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-1">
                <span className="flex items-center gap-1.5 font-medium text-foreground">
                  <Users className="w-3.5 h-3.5 text-primary" />
                  {data.nextLiveSession.hostName} ({data.nextLiveSession.hostRole})
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  {data.nextLiveSession.durationMinutes} Minutes
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(data.nextLiveSession.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href={`/employee/live/${data.nextLiveSession.id}`}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-500 transition-all shadow-lg shadow-rose-600/20 hover:scale-105 active:scale-95"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>{data.nextLiveSession.status === 'live' ? 'Join Stream' : 'View Session & Agenda'}</span>
              </Link>
            </div>
          </div>
        </motion.div>
      )}

      {/* 4. Core Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Runs & My Experiments */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Playground Runs */}
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                  <Terminal className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">My Recent Playground Runs</h3>
                  <p className="text-xs text-muted-foreground">Deterministic & AI-assisted scenario simulations</p>
                </div>
              </div>
              <Link
                href="/employee/playground/runs"
                className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
              >
                <span>All Runs</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {data.recentRuns.length === 0 ? (
              <div className="py-8 text-center border border-dashed border-border rounded-2xl">
                <Terminal className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                <p className="text-xs text-muted-foreground">No recent simulation runs yet.</p>
                <Link
                  href="/employee/playground"
                  className="mt-3 inline-block px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary text-primary-foreground"
                >
                  Start First Simulation
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {data.recentRuns.map((run) => (
                  <Link
                    key={run.id}
                    href={`/employee/playground/${run.id}`}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-2xl bg-muted/30 hover:bg-muted/60 border border-border/60 transition-all gap-3 group"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                          {run.scenarioTitle}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground">
                          {run.mode === 'ai_assisted' ? 'AI Assisted' : 'Deterministic'}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-1">{run.outputSummary}</p>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 text-xs shrink-0">
                      <span className="text-muted-foreground text-[11px]">
                        {new Date(run.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" />
                        Completed
                      </span>
                      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* My Experiments Overview */}
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                  <FlaskConical className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">My Innovation Experiments</h3>
                  <p className="text-xs text-muted-foreground">
                    {data.myExperimentsSummary.total} Total Experiments Registered
                  </p>
                </div>
              </div>
              <Link
                href="/employee/experiments"
                className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
              >
                <span>View All</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Status Chips */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="p-3 rounded-2xl bg-muted/40 border border-border text-center">
                <div className="text-xs font-medium text-muted-foreground">Draft</div>
                <div className="text-xl font-bold text-foreground mt-0.5">
                  {data.myExperimentsSummary.byStatus.Draft}
                </div>
              </div>
              <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-center">
                <div className="text-xs font-medium text-blue-600 dark:text-blue-400">Submitted</div>
                <div className="text-xl font-bold text-blue-700 dark:text-blue-300 mt-0.5">
                  {data.myExperimentsSummary.byStatus.Submitted}
                </div>
              </div>
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center">
                <div className="text-xs font-medium text-amber-600 dark:text-amber-400">In Progress</div>
                <div className="text-xl font-bold text-amber-700 dark:text-amber-300 mt-0.5">
                  {data.myExperimentsSummary.byStatus.In_Progress}
                </div>
              </div>
              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                <div className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Completed</div>
                <div className="text-xl font-bold text-emerald-700 dark:text-emerald-300 mt-0.5">
                  {data.myExperimentsSummary.byStatus.Completed}
                </div>
              </div>
            </div>

            {/* Recent Experiments List */}
            <div className="space-y-3 pt-2">
              {data.myExperimentsSummary.recent.map((exp) => (
                <Link
                  key={exp.id}
                  href={`/employee/experiments/${exp.id}`}
                  className="block p-3.5 rounded-2xl bg-muted/20 hover:bg-muted/50 border border-border/60 transition-all group"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                      {exp.title}
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        exp.status === 'Completed'
                          ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                          : exp.status === 'In_Progress'
                          ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {exp.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-1">{exp.hypothesis}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Team Space, Knowledge Alerts, Notifications & Releases */}
        <div className="space-y-6">
          {/* My Team Space Widget */}
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-foreground">My Team Space</h3>
              </div>
              <Link
                href="/employee/teams"
                className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
              >
                <span>Teams</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {data.myTeamSummary?.team ? (
              <div className="space-y-3">
                <div className="p-3.5 rounded-2xl bg-blue-500/5 border border-blue-500/20">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-foreground">{data.myTeamSummary.team.name}</h4>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400">
                      {data.myTeamSummary.memberCount} Members
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {data.myTeamSummary.team.goal}
                  </p>
                </div>

                {data.myTeamSummary.latestNote && (
                  <div className="p-3 rounded-2xl bg-muted/40 border border-border/60">
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-foreground mb-1">
                      <FileText className="w-3.5 h-3.5 text-primary" />
                      <span>{data.myTeamSummary.latestNote.title}</span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {data.myTeamSummary.latestNote.content}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-6 text-center border border-dashed border-border rounded-2xl">
                <p className="text-xs text-muted-foreground">Not currently in a hackathon team.</p>
                <Link
                  href="/employee/teams"
                  className="mt-2.5 inline-block px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary text-primary-foreground"
                >
                  Join or Form Team
                </Link>
              </div>
            )}
          </div>

          {/* Knowledge Review Alerts (Items due <= 14 days) */}
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                  <BookOpen className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-foreground">Knowledge Due for Review</h3>
              </div>
              <Link
                href="/employee/knowledge"
                className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
              >
                <span>Docs</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {data.knowledgeDueForReview.length === 0 ? (
              <div className="py-4 text-center border border-dashed border-border rounded-2xl">
                <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1 opacity-70" />
                <p className="text-xs text-muted-foreground">All owned documentation is up-to-date.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {data.knowledgeDueForReview.map((item) => (
                  <Link
                    key={item.id}
                    href={`/employee/knowledge/${item.id}`}
                    className="block p-3 rounded-2xl bg-amber-500/5 hover:bg-amber-500/10 border border-amber-500/20 transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-foreground group-hover:text-amber-600 transition-colors line-clamp-1">
                        {item.title}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 shrink-0">
                        {item.reviewStatus === 'overdue' ? 'Overdue' : 'Due Soon'}
                      </span>
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-1 flex items-center gap-2">
                      <span>Owner: {item.ownerName}</span>
                      <span>•</span>
                      <span>Next: {new Date(item.nextReviewDate).toLocaleDateString()}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Latest 3 Release Notes */}
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
                  <Newspaper className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-foreground">Latest Release Notes</h3>
              </div>
              <Link
                href="/employee/releases"
                className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
              >
                <span>Releases</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-2.5">
              {data.latestReleases.map((rel) => (
                <Link
                  key={rel.id}
                  href={`/employee/releases/${rel.id}`}
                  className="block p-3 rounded-2xl bg-muted/30 hover:bg-muted/60 border border-border/60 transition-all group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                      {rel.version} — {rel.title}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">{rel.summary}</p>
                </Link>
              ))}
            </div>
          </div>

          {/* Notifications Summary */}
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
                  <Bell className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-foreground">Notifications</h3>
              </div>
              <Link
                href="/notifications"
                className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
              >
                <span>All</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {data.recentNotifications.length === 0 ? (
              <p className="text-xs text-muted-foreground py-4 text-center">No notifications.</p>
            ) : (
              <div className="space-y-2">
                {data.recentNotifications.map((n) => (
                  <div
                    key={n.id}
                    className="flex items-start justify-between p-2.5 rounded-xl bg-muted/20 border border-border/50 text-xs gap-2"
                  >
                    <div className="flex items-start gap-2">
                      {n.state !== 'read' && (
                        <span className="w-2 h-2 rounded-full bg-rose-500 mt-1 shrink-0" />
                      )}
                      <div>
                        <div className="font-semibold text-foreground">{n.title}</div>
                        <div className="text-muted-foreground text-[11px] line-clamp-1">{n.message}</div>
                      </div>
                    </div>
                    {n.state !== 'read' && (
                      <button
                        onClick={() => handleMarkNotificationRead(n.id)}
                        className="text-[10px] text-primary hover:underline shrink-0"
                      >
                        Read
                      </button>
                    )}
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
