'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { usePersona } from '@/context/PersonaContext';
import {
  Users,
  UserPlus,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Clock,
  Building2,
  AlertCircle,
  ChevronLeft,
} from 'lucide-react';

export default function ClientAdminMembersPage() {
  const { actor, activeTenant } = usePersona();

  const isClientAdmin = actor.memberships.some(
    (m) => m.orgId === actor.activeTenantId && m.role === 'client_admin'
  );

  const [members, setMembers] = useState([
    {
      id: 'usr-1',
      name: actor.name,
      email: actor.email,
      role: 'client_admin',
      status: 'Active',
      joinedAt: '2026-08-15',
    },
    {
      id: 'usr-2',
      name: 'Michael Chang',
      email: `m.chang@${activeTenant?.domain || 'synthetic.org'}`,
      role: 'client_member',
      status: 'Active',
      joinedAt: '2026-09-02',
    },
    {
      id: 'usr-3',
      name: 'Jessica Reynolds',
      email: `j.reynolds@${activeTenant?.domain || 'synthetic.org'}`,
      role: 'client_member',
      status: 'Active',
      joinedAt: '2026-10-10',
    },
  ]);

  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'client_member' | 'client_admin'>('client_member');
  const [generatedInvitation, setGeneratedInvitation] = useState<{
    token: string;
    expiresAt: string;
    link: string;
  } | null>(null);

  if (!actor.activeTenantId || !activeTenant || !isClientAdmin) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <ShieldCheck className="w-12 h-12 text-destructive mx-auto" />
        <h1 className="text-2xl font-bold text-foreground">Access Restricted</h1>
        <p className="text-sm text-muted-foreground">
          Only Client Administrators of {activeTenant ? activeTenant.name : 'the organisation'} can manage workspace memberships. Use the persona switcher to select Client Admin (Sarah Connor).
        </p>
      </div>
    );
  }

  const handleGenerateInvitation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;

    const token = `inv-${Math.random().toString(36).slice(2, 10)}-${Date.now().toString(36)}`;
    const expiresAt = new Date(Date.now() + 48 * 3600 * 1000).toISOString();
    const link = `https://azentio.ai/invite/${token}`;

    setGeneratedInvitation({
      token,
      expiresAt,
      link,
    });

    setMembers((prev) => [
      ...prev,
      {
        id: `usr-${Date.now()}`,
        name: inviteEmail.split('@')[0],
        email: inviteEmail,
        role: inviteRole,
        status: 'Invited (Pending Acceptance)',
        joinedAt: new Date().toISOString().split('T')[0],
      },
    ]);

    setInviteEmail('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-6">
        <Link
          href="/client"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Workspace</span>
        </Link>
      </div>

      <div className="max-w-3xl mb-10">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs uppercase tracking-widest font-bold text-primary">
            {activeTenant.name} &bull; IAM Administration
          </span>
          <span className="badge-synthetic text-xs">Tenant Perimeter</span>
        </div>
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
          Organisation Member Management
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
          Manage authorized collaborators within {activeTenant.name}. Client administration authority is strictly bounded to this tenant: you cannot grant platform roles or modify other client organisations.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Members List */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 rounded-3xl glass-panel border border-border">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                <h2 className="font-bold text-base text-foreground">
                  Active Members ({members.length})
                </h2>
              </div>
              <span className="text-xs text-muted-foreground font-mono">
                {activeTenant.domain}
              </span>
            </div>

            <div className="mt-4 space-y-3">
              {members.map((m) => (
                <div
                  key={m.id}
                  className="p-4 rounded-2xl bg-muted/40 border border-border/80 flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs sm:text-sm text-foreground">{m.name}</span>
                      <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-primary/10 text-primary">
                        {m.role.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">{m.email}</span>
                  </div>

                  <span
                    className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                      m.status.includes('Invited')
                        ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                        : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                    }`}
                  >
                    {m.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Issue Single-Use Expiring Invitation */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-3xl glass-panel border border-border">
            <div className="flex items-center gap-2 pb-4 border-b border-border">
              <UserPlus className="w-5 h-5 text-emerald-500" />
              <h2 className="font-bold text-base text-foreground">
                Issue Single-Use Invitation
              </h2>
            </div>

            <form onSubmit={handleGenerateInvitation} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Verified Intended Email <span className="text-destructive">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder={`colleague@${activeTenant.domain}`}
                  className="w-full bg-muted/60 px-3.5 py-2.5 rounded-xl text-xs text-foreground placeholder:text-muted-foreground border border-border focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Assigned Client Role
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as any)}
                  className="w-full bg-muted/60 px-3.5 py-2.5 rounded-xl text-xs text-foreground border border-border focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="client_member">Client Member (Observations & Sandboxes)</option>
                  <option value="client_admin">Client Administrator (Member Invites)</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-xs hover:bg-primary/90 transition-all shadow-md shadow-emerald-500/20"
              >
                <UserPlus className="w-4 h-4" />
                <span>Generate Single-Use Token</span>
              </button>
            </form>

            {/* Generated Token Box */}
            <AnimatePresence>
              {generatedInvitation && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 p-4 rounded-2xl bg-muted/60 border border-border text-xs space-y-3"
                >
                  <div className="flex items-center gap-1.5 text-emerald-500 font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Single-Use Invitation Token Created:</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-card border border-border font-mono text-[11px] break-all select-all">
                    {generatedInvitation.link}
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                    <span>Expires in 48 hours</span>
                    <span>Single-use hashed token</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-6 pt-4 border-t border-border text-[11px] text-muted-foreground italic space-y-1">
              <p className="flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>Joining a workspace is not consent to share or train on client data.</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

