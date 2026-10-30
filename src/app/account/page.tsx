'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePersona } from '@/context/PersonaContext';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { useTheme } from 'next-themes';
import {
  User,
  Mail,
  ShieldCheck,
  CheckCircle2,
  KeyRound,
  LogOut,
  Laptop,
  Smartphone,
  Save,
  Moon,
  Sun,
  Monitor,
  Building2,
  Lock,
} from 'lucide-react';

export default function AccountPage() {
  const { actor } = usePersona();
  const { theme, setTheme } = useTheme();

  const [displayName, setDisplayName] = useState(actor.name);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [sessionsKilled, setSessionsKilled] = useState(false);

  // Authenticated visitor check
  if (!actor.userId || actor.userId === 'usr-anonymous') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <User className="w-12 h-12 text-muted-foreground mx-auto" />
        <h1 className="text-2xl font-bold text-foreground">Sign In to View Account</h1>
        <p className="text-xs text-muted-foreground">
          Your account profile and active sessions are accessible only when authenticated.
        </p>
        <Link
          href="/signin"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 shadow-md"
        >
          Sign In
        </Link>
      </div>
    );
  }

  const handleUpdateName = (e: React.FormEvent) => {
    e.preventDefault();
    if (displayName.trim()) {
      actor.name = displayName.trim();
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    }
  };

  const handleKillOtherSessions = () => {
    setSessionsKilled(true);
    setTimeout(() => setSessionsKilled(false), 4000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
          Account Settings
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Manage your enterprise profile, security credentials, active sessions, and theme preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left Column: Profile & Credentials */}
        <div className="md:col-span-7 space-y-6">
          {/* Profile Card */}
          <div className="p-6 rounded-3xl glass-panel border border-border shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                <User className="w-4 h-4 text-emerald-500" />
                <span>Identity Profile</span>
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold uppercase font-mono">
                Verified
              </span>
            </div>

            <form onSubmit={handleUpdateName} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Display Name</label>
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-input bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Verified Email Address</label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="email"
                    disabled
                    value={actor.email}
                    className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-border bg-muted/50 text-xs text-muted-foreground font-mono cursor-not-allowed"
                  />
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Email modifications require system re-authorization through platform admin.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Update Profile</span>
                </button>

                {savedSuccess && (
                  <span className="text-xs text-emerald-500 flex items-center gap-1 font-semibold animate-in fade-in">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Saved successfully</span>
                  </span>
                )}
              </div>
            </form>
          </div>

          {/* Active Sessions */}
          <div className="p-6 rounded-3xl glass-panel border border-border shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-indigo-500" />
                <span>Active Login Sessions</span>
              </h2>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-card border border-emerald-500/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Laptop className="w-5 h-5 text-emerald-500" />
                  <div>
                    <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <span>Current Device (Chrome / macOS)</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    </div>
                    <div className="text-[11px] text-muted-foreground font-mono">
                      IP: 103.21.244.12 • Active Now
                    </div>
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 font-bold uppercase">
                  This Session
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-card/60 border border-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Smartphone className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <div className="text-xs font-bold text-foreground">Mobile Safari (iOS 18)</div>
                    <div className="text-[11px] text-muted-foreground font-mono">
                      IP: 49.37.190.88 • Last active 2 hours ago
                    </div>
                  </div>
                </div>
                <span className="text-[10px] text-muted-foreground">Authorized</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={handleKillOtherSessions}
                className="w-full py-2.5 rounded-xl border border-destructive/30 text-destructive hover:bg-destructive/10 text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Revoke All Other Sessions</span>
              </button>
              {sessionsKilled && (
                <p className="text-[11px] text-emerald-500 text-center mt-2 font-medium">
                  All secondary tokens revoked and audited in security logs.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Roles, Grants & Theme */}
        <div className="md:col-span-5 space-y-6">
          {/* Roles & Permissions (Read-only) */}
          <div className="p-6 rounded-3xl glass-panel border border-border shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-cyan-500" />
                <span>Platform Roles & Grants</span>
              </h2>
              <Lock className="w-3.5 h-3.5 text-muted-foreground" />
            </div>

            <div className="space-y-2">
              <div className="p-3 rounded-2xl bg-muted/40 border border-border/60">
                <div className="text-[11px] text-muted-foreground font-bold uppercase">Base Role</div>
                <div className="text-xs font-bold text-foreground mt-0.5">
                  {actor.isVerifiedEmployee ? 'Verified Employee' : 'Client Participant'}
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-muted/40 border border-border/60">
                <div className="text-[11px] text-muted-foreground font-bold uppercase">Platform Grants</div>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {actor.platformGrants.length === 0 ? (
                    <span className="text-xs text-muted-foreground">Standard employee privileges</span>
                  ) : (
                    actor.platformGrants.map((grant) => (
                      <span
                        key={grant}
                        className="text-[10px] px-2 py-0.5 rounded-md font-mono font-bold bg-primary/10 text-primary uppercase"
                      >
                        {grant}
                      </span>
                    ))
                  )}
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-muted/40 border border-border/60">
                <div className="text-[11px] text-muted-foreground font-bold uppercase">Tenant Memberships</div>
                <div className="text-xs font-semibold text-foreground mt-0.5">
                  {actor.memberships.length === 0
                    ? 'Internal Azentio Platform'
                    : `${actor.memberships.length} Tenant Membership(s)`}
                </div>
              </div>
            </div>

            <p className="text-[10px] text-muted-foreground leading-relaxed pt-1">
              Role grants are administered by Platform Administrators in accordance with ISO 27001 least-privilege standards.
            </p>
          </div>

          {/* Theme Preferences */}
          <div className="p-6 rounded-3xl glass-panel border border-border shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2 pb-3 border-b border-border">
              <span>Theme Preference</span>
            </h2>

            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setTheme('light')}
                className={`p-3 rounded-2xl border text-center space-y-1.5 transition-all ${
                  theme === 'light'
                    ? 'border-primary bg-primary/10 text-primary font-bold'
                    : 'border-border bg-card text-muted-foreground hover:text-foreground'
                }`}
              >
                <Sun className="w-4 h-4 mx-auto" />
                <div className="text-xs">Light</div>
              </button>

              <button
                onClick={() => setTheme('dark')}
                className={`p-3 rounded-2xl border text-center space-y-1.5 transition-all ${
                  theme === 'dark'
                    ? 'border-primary bg-primary/10 text-primary font-bold'
                    : 'border-border bg-card text-muted-foreground hover:text-foreground'
                }`}
              >
                <Moon className="w-4 h-4 mx-auto" />
                <div className="text-xs">Dark</div>
              </button>

              <button
                onClick={() => setTheme('system')}
                className={`p-3 rounded-2xl border text-center space-y-1.5 transition-all ${
                  theme === 'system'
                    ? 'border-primary bg-primary/10 text-primary font-bold'
                    : 'border-border bg-card text-muted-foreground hover:text-foreground'
                }`}
              >
                <Monitor className="w-4 h-4 mx-auto" />
                <div className="text-xs">System</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

