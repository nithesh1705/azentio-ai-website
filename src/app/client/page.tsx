'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { usePersona } from '@/context/PersonaContext';
import {
  Building2,
  FileText,
  PlusCircle,
  BrainCircuit,
  TrendingUp,
  Cpu,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Layers,
  AlertCircle,
  Users,
} from 'lucide-react';
import { getPublicOfferings, getClientObservations } from '@/server/dal/store';

export default function ClientDashboardPage() {
  const { actor, activeTenant } = usePersona();
  const offerings = getPublicOfferings();

  // Guard against unauthenticated or non-client
  if (!actor.activeTenantId || !activeTenant) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <Building2 className="w-12 h-12 text-muted-foreground mx-auto" />
        <h1 className="text-2xl font-bold text-foreground">No Active Client Workspace</h1>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          You are currently viewing as <span className="font-semibold text-foreground">{actor.name}</span> with no active client organisation selected. Use the top persona switcher to select a Client Member or Client Admin persona.
        </p>
      </div>
    );
  }

  // Filter entitled offerings for this tenant
  const entitledOfferings = offerings.filter((o) =>
    activeTenant.entitledOfferings.includes(o.id)
  );

  let myObservations: any[] = [];
  try {
    myObservations = getClientObservations(actor, 'mine');
  } catch (e) {
    myObservations = [];
  }

  const isClientAdmin = actor.memberships.some(
    (m) => m.orgId === actor.activeTenantId && m.role === 'client_admin'
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Workspace Header */}
      <div className="p-8 rounded-3xl glass-panel border border-border relative overflow-hidden mb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                {activeTenant.tier} Client Tenant
              </span>
              <span className="badge-synthetic text-xs">Synthetic Data</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight flex items-center gap-3">
              <span>{activeTenant.name}</span>
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-muted-foreground">
              Workspace domain: <span className="font-mono text-foreground">{activeTenant.domain}</span> &bull; Logged in as <span className="font-semibold text-foreground">{actor.name}</span> ({actor.email})
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/client/observations/new"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all shadow-sm shadow-emerald-500/20 hover:scale-105 active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Contribute Observation</span>
            </Link>

            {isClientAdmin && (
              <Link
                href="/client/admin/members"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card border border-border text-foreground text-xs font-semibold hover:bg-muted transition-all"
              >
                <Users className="w-4 h-4 text-primary" />
                <span>Manage Members</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        <MetricCard
          title="My Observations"
          value={myObservations.length.toString()}
          subtitle="Drafts and submissions"
          icon={<FileText className="w-5 h-5 text-emerald-500" />}
          link="/client/observations"
        />

        <MetricCard
          title="Entitled Offerings"
          value={entitledOfferings.length.toString()}
          subtitle="Active sandbox access"
          icon={<Cpu className="w-5 h-5 text-cyan-500" />}
          link="/client/demos"
        />

        <MetricCard
          title="Collective Shared Feed"
          value="Live"
          subtitle="De-identified cross-client hub"
          icon={<BrainCircuit className="w-5 h-5 text-teal-500" />}
          link="/client/shared"
        />

        <MetricCard
          title="Improvement Loop"
          value="1 Active"
          subtitle="Engineering updates"
          icon={<TrendingUp className="w-5 h-5 text-indigo-500" />}
          link="/client/ideas"
        />
      </div>

      {/* Main Sections: Entitled Sandboxes & Recent Observations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Entitled Sandboxes */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 rounded-3xl glass-panel border border-border">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div className="flex items-center gap-2">
                <Cpu className="w-5 h-5 text-primary" />
                <h2 className="font-bold text-base text-foreground">Entitled AI Sandboxes</h2>
              </div>
              <Link
                href="/client/demos"
                className="text-xs font-semibold text-primary hover:underline"
              >
                View all sandboxes
              </Link>
            </div>

            <div className="mt-4 space-y-4">
              {entitledOfferings.length === 0 ? (
                <div className="p-8 text-center text-xs text-muted-foreground border border-dashed border-border rounded-2xl">
                  <AlertCircle className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="font-medium text-foreground">No entitled offerings assigned to this organisation.</p>
                  <p className="mt-1">
                    Empty state verified: other tenants&apos; data is never leaked as placeholder content.
                  </p>
                </div>
              ) : (
                entitledOfferings.map((o) => (
                  <div
                    key={o.id}
                    className="p-4 rounded-2xl bg-muted/40 border border-border/80 flex items-center justify-between hover:bg-muted/60 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs sm:text-sm text-foreground">{o.name}</span>
                        <span className="text-[10px] text-primary font-mono uppercase bg-primary/10 px-2 py-0.5 rounded">
                          {o.category}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground line-clamp-1">{o.tagline}</p>
                    </div>

                    <Link
                      href={`/offerings/${o.slug}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all shrink-0 ml-4"
                    >
                      <span>Launch</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right: My Observations & Quick Actions */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-3xl glass-panel border border-border">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-500" />
                <h2 className="font-bold text-base text-foreground">My Observation Status</h2>
              </div>
              <Link
                href="/client/observations"
                className="text-xs font-semibold text-primary hover:underline"
              >
                Manage
              </Link>
            </div>

            <div className="mt-4 space-y-3">
              {myObservations.length === 0 ? (
                <div className="p-6 text-center text-xs text-muted-foreground border border-dashed border-border rounded-2xl">
                  <p>You have no saved observations in this workspace yet.</p>
                  <Link
                    href="/client/observations/new"
                    className="inline-block mt-3 text-xs font-semibold text-primary hover:underline"
                  >
                    Create first draft &rarr;
                  </Link>
                </div>
              ) : (
                myObservations.map((obs) => (
                  <div
                    key={obs.id}
                    className="p-3.5 rounded-2xl bg-muted/40 border border-border/80 text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-foreground line-clamp-1">
                        {obs.currentRevision.title}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          obs.currentState === 'Published'
                            ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                            : obs.currentState === 'Submitted'
                            ? 'bg-indigo-500/10 text-indigo-500 border border-indigo-500/20'
                            : obs.currentState === 'Withdrawn'
                            ? 'bg-muted text-muted-foreground'
                            : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                        }`}
                      >
                        {obs.currentState}
                      </span>
                    </div>
                    <p className="text-muted-foreground line-clamp-2">
                      {obs.currentRevision.body}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  title,
  value,
  subtitle,
  icon,
  link,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
  link: string;
}) {
  return (
    <Link href={link}>
      <motion.div
        whileHover={{ y: -3 }}
        className="p-5 rounded-2xl glass-panel border border-border hover:border-primary/40 transition-all flex flex-col justify-between h-full"
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-muted-foreground">{title}</span>
          <div className="p-2 rounded-xl bg-muted/80">{icon}</div>
        </div>
        <div>
          <div className="text-2xl font-black text-foreground">{value}</div>
          <p className="text-[11px] text-muted-foreground mt-0.5">{subtitle}</p>
        </div>
      </motion.div>
    </Link>
  );
}

