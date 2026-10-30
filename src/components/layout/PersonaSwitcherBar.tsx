'use client';

import React from 'react';
import { usePersona } from '@/context/PersonaContext';
import { Shield, Building2, UserCheck, Sparkles, RefreshCw } from 'lucide-react';

export function PersonaSwitcherBar() {
  const {
    actor,
    currentPersonaKey,
    setPersona,
    activeTenant,
    setActiveTenantId,
    availableOrganisations,
  } = usePersona();

  const personas = [
    { key: 'public', label: 'Public Visitor' },
    { key: 'employee', label: 'Employee (Nithesh M)' },
    { key: 'client_member', label: 'Client Member (Virat Kohli @ abcd.in)' },
    { key: 'client_admin', label: 'Client Admin (MS Dhoni @ xyz.com)' },
    { key: 'multi_member', label: 'Multi-Org Member (Hardik Pandya)' },
    { key: 'learning_moderator', label: 'Moderator (Pranika K)' },
    { key: 'content_publisher', label: 'Publisher (Nishanth E)' },
    { key: 'product_owner', label: 'Product Owner (Lewis Hamilton)' },
    { key: 'portal_admin', label: 'Portal Admin (Max Verstappen)' },
  ];

  return (
    <div className="bg-slate-900 border-b border-slate-800 text-slate-200 text-xs py-1.5 px-4 sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left: Role switcher */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-emerald-400 font-semibold uppercase tracking-wider">
            <Shield className="w-3.5 h-3.5" />
            <span>Interactive Persona:</span>
          </div>
          <select
            value={currentPersonaKey}
            onChange={(e) => setPersona(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-emerald-300 rounded px-2.5 py-1 text-xs font-medium focus:ring-1 focus:ring-emerald-500 focus:outline-none cursor-pointer"
          >
            {personas.map((p) => (
              <option key={p.key} value={p.key}>
                {p.label}
              </option>
            ))}
          </select>
        </div>

        {/* Center: Active Tenant & Multi-Membership switcher */}
        <div className="flex items-center gap-3">
          {actor.memberships.length > 0 ? (
            <div className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-0.5 rounded border border-slate-700/80">
              <Building2 className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-slate-400">Workspace:</span>
              {actor.memberships.length > 1 ? (
                <select
                  value={actor.activeTenantId || ''}
                  onChange={(e) => setActiveTenantId(e.target.value)}
                  className="bg-transparent text-cyan-300 font-medium text-xs focus:outline-none cursor-pointer"
                >
                  {actor.memberships.map((m) => {
                    const org = availableOrganisations.find((o) => o.id === m.orgId);
                    return (
                      <option key={m.orgId} value={m.orgId} className="bg-slate-900 text-slate-200">
                        {org ? org.name : m.orgId} ({m.role})
                      </option>
                    );
                  })}
                </select>
              ) : (
                <span className="font-medium text-cyan-300">
                  {activeTenant ? activeTenant.name : 'None'}
                </span>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1 text-slate-400">
              <UserCheck className="w-3.5 h-3.5" />
              <span>
                {actor.isVerifiedEmployee
                  ? 'Internal Employee Session'
                  : currentPersonaKey === 'public'
                  ? 'Unauthenticated Guest'
                  : 'Platform Grant Session'}
              </span>
            </div>
          )}
        </div>

        {/* Right: Synthetic Badge & Honesty Label */}
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-medium">
            <Sparkles className="w-3 h-3" /> Synthetic Data
          </span>
          <span className="text-slate-400 hidden md:inline">
            Server Policy: <span className="text-emerald-400 font-mono">DENY_BY_DEFAULT</span>
          </span>
        </div>
      </div>
    </div>
  );
}

