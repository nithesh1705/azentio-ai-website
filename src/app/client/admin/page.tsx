'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { usePersona } from '@/context/PersonaContext';
import {
  getOrgOverview,
  requestEntitlement,
  OrgOverviewData,
} from '@/server/dal/client/admin';
import {
  Building2,
  ShieldCheck,
  Users,
  Layers,
  ArrowRight,
  CheckCircle2,
  PlusCircle,
  Clock,
  ExternalLink,
  ChevronRight,
  Database,
  Lock,
  X,
  Send,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { Offering } from '@/types';

export default function ClientAdminOverviewPage() {
  const { actor, activeTenant } = usePersona();

  const isClientAdmin = actor.memberships.some(
    (m) => m.orgId === actor.activeTenantId && m.role === 'client_admin'
  );

  const [refreshKey, setRefreshKey] = useState(0);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedOfferingId, setSelectedOfferingId] = useState('');
  const [justification, setJustification] = useState('');
  const [requestSuccess, setRequestSuccess] = useState<string | null>(null);

  if (!actor.activeTenantId || !activeTenant || !isClientAdmin) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <ShieldCheck className="w-12 h-12 text-destructive mx-auto" />
        <h1 className="text-2xl font-bold text-foreground">Client Admin Access Required</h1>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Only Client Administrators of {activeTenant ? activeTenant.name : 'this organisation'} can view organisation settings and request solution licenses.
        </p>
        <Link
          href="/choose-workspace"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 mt-2"
        >
          Select Workspace
        </Link>
      </div>
    );
  }

  let overview: OrgOverviewData;
  try {
    overview = getOrgOverview(actor);
  } catch (err: any) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-destructive mx-auto" />
        <h2 className="text-xl font-bold text-foreground">Failed to Load Org Overview</h2>
        <p className="text-xs text-muted-foreground">{err.message}</p>
      </div>
    );
  }

  const { tenant, entitledOfferings, unentitledOfferings, memberCount, adminCount, recentRequests } =
    overview;

  const handleRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOfferingId || !justification.trim()) return;

    try {
      requestEntitlement(actor, {
        offeringId: selectedOfferingId,
        businessJustification: justification.trim(),
      });
      setShowRequestModal(false);
      setSelectedOfferingId('');
      setJustification('');
      setRequestSuccess('Solution entitlement request submitted to Azentio account director.');
      setRefreshKey((k) => k + 1);
      setTimeout(() => setRequestSuccess(null), 5000);
    } catch (err: any) {
      alert(err.message || 'Request failed');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8" key={refreshKey}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
              {tenant.tier} Enterprise Tenant
            </span>
            <span className="text-xs text-muted-foreground">Admin Console</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Organisation Administration
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
            Manage your corporate workspace, view entitled AI software modules, oversee shared team contributions, and request solution expansion.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/client/admin/members"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card border border-border text-foreground text-xs font-semibold hover:bg-muted transition-all shadow-sm"
          >
            <Users className="w-4 h-4 text-primary" />
            <span>Manage Members ({memberCount})</span>
          </Link>

          <Link
            href="/client/admin/observations"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card border border-border text-foreground text-xs font-semibold hover:bg-muted transition-all shadow-sm"
          >
            <FileText className="w-4 h-4 text-primary" />
            <span>Org Oversight</span>
          </Link>
        </div>
      </div>

      {requestSuccess && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{requestSuccess}</span>
        </div>
      )}

      {/* Organisation Profile Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-card border border-border space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Building2 className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold text-foreground">{tenant.name}</h2>
            </div>
            <p className="text-xs text-muted-foreground">
              Corporate domain: <span className="font-mono text-foreground font-semibold">{tenant.domain}</span> &bull; Tenant Identifier: <span className="font-mono text-foreground">{tenant.id}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-2xl font-black text-foreground">{memberCount}</span>
              <span className="text-[11px] text-muted-foreground block font-semibold">
                Active Members ({adminCount} Admins)
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-muted/30 border border-border/50">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Subscription Tier
            </span>
            <div className="text-sm font-bold text-foreground mt-1">{tenant.tier} Agreement</div>
            <span className="text-[11px] text-muted-foreground mt-0.5 block">24/7 Enterprise SLA</span>
          </div>

          <div className="p-4 rounded-2xl bg-muted/30 border border-border/50">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Environment Isolation
            </span>
            <div className="text-sm font-bold text-foreground mt-1 flex items-center gap-1.5">
              <Database className="w-4 h-4 text-emerald-500" />
              <span>Strict Single-Tenant DAL</span>
            </div>
            <span className="text-[11px] text-muted-foreground mt-0.5 block">Zero cross-tenant bleed</span>
          </div>

          <div className="p-4 rounded-2xl bg-muted/30 border border-border/50">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Primary Administrator
            </span>
            <div className="text-sm font-bold text-foreground mt-1">{actor.name}</div>
            <span className="text-[11px] font-mono text-muted-foreground mt-0.5 block">{actor.email}</span>
          </div>
        </div>
      </div>

      {/* Solutions & Entitlements Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-foreground">Solution Entitlements</h2>
            <p className="text-xs text-muted-foreground">
              Software modules and AI engines provisioned under your enterprise agreement
            </p>
          </div>

          {unentitledOfferings.length > 0 && (
            <button
              onClick={() => {
                setSelectedOfferingId(unentitledOfferings[0].id);
                setShowRequestModal(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Request Solution License</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {entitledOfferings.map((offering) => (
            <div
              key={offering.id}
              className="p-5 rounded-2xl bg-card border border-border flex flex-col justify-between shadow-sm space-y-3"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary">
                    {offering.category}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Active License</span>
                  </span>
                </div>

                <h3 className="text-base font-bold text-foreground">{offering.name}</h3>
                <p className="text-xs text-muted-foreground line-clamp-2 mt-1 leading-relaxed">
                  {offering.description}
                </p>
              </div>

              <div className="pt-3 border-t border-border flex items-center justify-between text-xs">
                <Link
                  href={`/client/demos?offering=${offering.id}`}
                  className="text-primary hover:underline font-semibold"
                >
                  Explore Sandboxes
                </Link>
                <span className="text-[11px] text-muted-foreground font-mono">
                  ref: {offering.id}
                </span>
              </div>
            </div>
          ))}

          {unentitledOfferings.map((offering) => (
            <div
              key={offering.id}
              className="p-5 rounded-2xl bg-card border border-dashed border-border flex flex-col justify-between space-y-3 opacity-80"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-muted text-muted-foreground">
                    {offering.category}
                  </span>
                  <span className="text-[11px] font-medium text-muted-foreground">
                    Not Licensed
                  </span>
                </div>

                <h3 className="text-base font-bold text-foreground">{offering.name}</h3>
                <p className="text-xs text-muted-foreground line-clamp-2 mt-1 leading-relaxed">
                  {offering.description}
                </p>
              </div>

              <div className="pt-3 border-t border-border flex items-center justify-between text-xs">
                <button
                  onClick={() => {
                    setSelectedOfferingId(offering.id);
                    setShowRequestModal(true);
                  }}
                  className="text-primary hover:underline font-semibold inline-flex items-center gap-1"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Request Entitlement</span>
                </button>
                <span className="text-[11px] text-muted-foreground font-mono">
                  ref: {offering.id}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Entitlement Requests */}
      {recentRequests.length > 0 && (
        <div className="space-y-4 pt-4">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            <span>Recent License Requests</span>
          </h2>

          <div className="space-y-2.5">
            {recentRequests.map((req) => (
              <div
                key={req.id}
                className="p-4 rounded-2xl bg-card border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-foreground">{req.offeringName}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 uppercase">
                      {req.status}
                    </span>
                  </div>
                  <p className="text-muted-foreground mt-0.5">
                    Justification: "{req.businessJustification}"
                  </p>
                </div>

                <div className="text-muted-foreground font-mono text-[11px]">
                  Submitted {formatDate(req.createdAt)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Request Entitlement Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 rounded-3xl bg-card border border-border shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-primary" />
                <span>Request Solution Entitlement</span>
              </h3>
              <button
                onClick={() => setShowRequestModal(false)}
                className="text-muted-foreground hover:text-foreground text-xs"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRequestSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Select Solution
                </label>
                <select
                  value={selectedOfferingId}
                  onChange={(e) => setSelectedOfferingId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-muted/60 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  {unentitledOfferings.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.name} ({o.category})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Business Justification & Expected Users
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g., Expanding our SME trade finance evaluation team to incorporate autonomous LC verification..."
                  value={justification}
                  onChange={(e) => setJustification(e.target.value)}
                  className="w-full p-3 text-xs rounded-xl bg-muted/60 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 leading-relaxed"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRequestModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all inline-flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Request</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
