'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePersona } from '@/context/PersonaContext';
import { getOrganisations, getAuditEvents } from '@/server/dal/store';
import {
  Settings,
  Building2,
  Shield,
  Key,
  Users,
  CheckCircle2,
  ShieldCheck,
  ChevronLeft,
  Clock,
} from 'lucide-react';
import { Organisation } from '@/types';

export default function AdminOrgsPage() {
  const { actor } = usePersona();
  const organisations = getOrganisations();

  const isAdmin = actor.platformGrants.includes('portal_admin');

  if (!isAdmin) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <ShieldCheck className="w-12 h-12 text-destructive mx-auto" />
        <h1 className="text-2xl font-bold text-foreground">Portal Admin Access Restricted</h1>
        <p className="text-sm text-muted-foreground">
          Platform administration requires explicit &ldquo;portal_admin&rdquo; platform grant. Use the top persona switcher to select Portal Admin (Priya Sharma).
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="max-w-3xl mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs uppercase tracking-widest font-bold text-rose-500">
            Platform IAM & Tenancy
          </span>
          <span className="badge-synthetic text-xs">Portal Administrator</span>
        </div>
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
          Organisation & Role Governance
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
          Manage tenant boundaries, platform grants, and support access authorizations. All privileged actions are permanently recorded to append-only audit logs.
        </p>
      </div>

      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/admin/orgs"
          className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold shadow-sm"
        >
          Organisations & Entitlements
        </Link>
        <Link
          href="/admin/audit"
          className="px-4 py-2 rounded-xl bg-card border border-border text-foreground text-xs font-semibold hover:bg-muted"
        >
          Append-Only Audit Trail
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {organisations.map((org) => (
          <div
            key={org.id}
            className="p-6 rounded-3xl glass-panel border border-border glow-card space-y-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                  {org.tier} Tier
                </span>
                <h2 className="text-xl font-bold text-foreground mt-0.5">{org.name}</h2>
              </div>
              <Building2 className="w-6 h-6 text-muted-foreground" />
            </div>

            <div className="space-y-1.5 text-xs text-muted-foreground">
              <p>Domain: <span className="font-mono text-foreground">{org.domain}</span></p>
              <p>Active Members: <span className="font-bold text-foreground">{org.memberCount}</span></p>
            </div>

            <div className="pt-3 border-t border-border">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Entitled Offerings ({org.entitledOfferings.length})
              </span>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {org.entitledOfferings.length === 0 ? (
                  <span className="text-xs text-muted-foreground italic">
                    Zero entitlements provisioned (Empty State Baseline)
                  </span>
                ) : (
                  org.entitledOfferings.map((ent) => (
                    <span
                      key={ent}
                      className="px-2 py-0.5 rounded-md bg-muted text-foreground text-[11px] font-mono"
                    >
                      {ent}
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
