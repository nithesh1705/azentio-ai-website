'use client';

import React from 'react';
import Link from 'next/link';
import { usePersona } from '@/context/PersonaContext';
import { getPublicOfferings } from '@/server/dal/store';
import {
  Cpu,
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
  Building2,
  AlertCircle,
} from 'lucide-react';

export default function ClientDemosPage() {
  const { actor, activeTenant } = usePersona();
  const allOfferings = getPublicOfferings();

  if (!actor.activeTenantId || !activeTenant) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <Building2 className="w-12 h-12 text-muted-foreground mx-auto" />
        <h1 className="text-2xl font-bold text-foreground">Select Active Workspace</h1>
        <p className="text-sm text-muted-foreground">
          Please select a client persona to access organisation-entitled sandboxes.
        </p>
      </div>
    );
  }

  const entitledOfferings = allOfferings.filter((o) =>
    activeTenant.entitledOfferings.includes(o.id)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="max-w-3xl mb-10">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs uppercase tracking-widest font-bold text-primary">
            {activeTenant.name}
          </span>
          <span className="badge-synthetic text-xs">Synthetic Runs</span>
        </div>
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
          Entitled Product Sandboxes
        </h1>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
          Isolated sandbox runs and simulation environments configured strictly for your organisation. All simulation inputs, evidence uploads, and parameter states remain strictly isolated within your tenant perimeter.
        </p>
      </div>

      {entitledOfferings.length === 0 ? (
        <div className="p-12 text-center rounded-3xl glass-panel border border-dashed border-border max-w-2xl mx-auto space-y-4">
          <ShieldAlert className="w-12 h-12 text-muted-foreground mx-auto" />
          <h2 className="text-xl font-bold text-foreground">No Entitled Offerings</h2>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Your organisation ({activeTenant.name}) does not currently have any active product entitlements provisioned. In accordance with our security principles, other tenants&apos; data or demo environments are never shown as placeholder content.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {entitledOfferings.map((offering) => (
            <div
              key={offering.id}
              className="p-8 rounded-3xl glass-panel border border-border glow-card flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                    {offering.category}
                  </span>
                  <span className="text-xs font-medium text-emerald-500 bg-emerald-500/10 px-2.5 py-0.5 rounded-full">
                    Tenant Licensed
                  </span>
                </div>

                <h2 className="text-2xl font-bold text-foreground">{offering.name}</h2>
                <p className="mt-2 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  {offering.tagline}
                </p>
                <p className="mt-4 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {offering.description}
                </p>

                <div className="mt-6 pt-6 border-t border-border">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Available Sandbox Modules
                  </span>
                  <ul className="mt-3 space-y-2 text-xs text-muted-foreground">
                    {offering.capabilities.map((cap, cIdx) => (
                      <li key={cIdx} className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span>{cap.title}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-border flex items-center justify-between">
                <Link
                  href={`/offerings/${offering.slug}`}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all shadow-sm"
                >
                  <Cpu className="w-4 h-4" />
                  <span>Launch Interactive Sandbox</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                <span className="badge-synthetic text-xs">Simulated Output</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
