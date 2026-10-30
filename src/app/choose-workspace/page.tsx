'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { usePersona } from '@/context/PersonaContext';
import {
  Building2,
  ShieldCheck,
  ChevronRight,
  ArrowRight,
  CheckCircle2,
  Users,
  LogOut,
  Sparkles,
} from 'lucide-react';

export default function ChooseWorkspacePage() {
  const router = useRouter();
  const { actor, availableOrganisations, setActiveTenantId, setPersona } = usePersona();

  const activeMemberships = actor.memberships?.filter((m) => m.status === 'active') || [];

  const handleSelectWorkspace = (orgId: string) => {
    setActiveTenantId(orgId);
    router.push('/client');
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl bg-card border border-border rounded-3xl p-6 sm:p-10 shadow-xl space-y-8"
      >
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
            <Building2 className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Choose Client Workspace
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
            Logged in as <strong className="text-foreground">{actor.name}</strong> ({actor.email}). Select an authorized enterprise organization to enter.
          </p>
        </div>

        {activeMemberships.length === 0 ? (
          <div className="py-10 text-center space-y-4 border border-dashed border-border rounded-2xl p-6">
            <ShieldCheck className="w-10 h-10 text-muted-foreground mx-auto opacity-50" />
            <h3 className="text-base font-bold text-foreground">No Active Client Memberships Found</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Your account currently has no active client memberships. Client access requires an invitation from your organization administrator.
            </p>
            <div className="pt-2 flex justify-center gap-3">
              <Link
                href="/signin"
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Sign In with Different Account
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1">
              Authorized Client Workspaces ({activeMemberships.length})
            </div>

            <div className="space-y-3">
              {activeMemberships.map((m) => {
                const org = availableOrganisations.find((o) => o.id === m.orgId);
                const isCurrent = m.orgId === actor.activeTenantId;

                return (
                  <div
                    key={m.orgId}
                    onClick={() => handleSelectWorkspace(m.orgId)}
                    className={`cursor-pointer p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group ${
                      isCurrent
                        ? 'border-primary bg-primary/5 ring-2 ring-primary/20 shadow-md shadow-primary/5'
                        : 'border-border bg-card hover:border-primary/40 hover:bg-muted/40'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm sm:text-base text-foreground group-hover:text-primary transition-colors">
                          {org?.name || m.orgId}
                        </span>
                        {isCurrent && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-bold">
                            Current Active
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <span>Role: <strong className="text-foreground capitalize">{m.role.replace('_', ' ')}</strong></span>
                        <span>•</span>
                        <span>Domain: <strong className="text-foreground font-mono">{org?.domain || 'enterprise'}</strong></span>
                        <span>•</span>
                        <span className="px-2 py-0.2 rounded-md bg-secondary text-secondary-foreground text-[10px] uppercase font-mono">
                          {org?.tier || 'Enterprise'} Tier
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleSelectWorkspace(m.orgId)}
                      className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold group-hover:bg-primary/90 transition-all shrink-0 shadow-xs"
                    >
                      <span>Enter Workspace</span>
                      <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground">
            ← Return to Public Website
          </Link>
          <button
            onClick={() => {
              setPersona('public');
              router.push('/signin');
            }}
            className="flex items-center gap-1.5 hover:text-destructive transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
