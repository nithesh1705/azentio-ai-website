'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { usePersona } from '@/context/PersonaContext';
import {
  Sparkles,
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Building2,
  AlertCircle,
  Database,
  UserCheck,
  RefreshCw,
  Eye,
  EyeOff,
  KeyRound,
  ChevronRight,
  Layers,
} from 'lucide-react';
import { UserRecord, Organisation } from '@/types';

export default function SignInPage() {
  const router = useRouter();
  const { setCustomActor } = usePersona();

  const [selectedOrgId, setSelectedOrgId] = useState<string>('org-azentio');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);

  const [dbUsers, setDbUsers] = useState<UserRecord[]>([]);
  const [organisations, setOrganisations] = useState<Organisation[]>([]);
  const [fetchingData, setFetchingData] = useState(true);

  // Fetch users and organisations dynamically from the database
  const loadAuthDirectory = async () => {
    try {
      setFetchingData(true);
      const res = await fetch('/api/auth/users');
      if (res.ok) {
        const data = await res.json();
        setDbUsers(data.users || []);
        if (data.organisations && data.organisations.length > 0) {
          setOrganisations(data.organisations);
          // Default to Azentio or first org if available
          const azentio = data.organisations.find((o: Organisation) => o.id === 'org-azentio');
          if (azentio) {
            setSelectedOrgId('org-azentio');
          } else {
            setSelectedOrgId(data.organisations[0].id);
          }
        }
      }
    } catch {
      // fallback
    } finally {
      setFetchingData(false);
    }
  };

  useEffect(() => {
    loadAuthDirectory();
  }, []);

  const handleSignIn = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!selectedOrgId) {
      setError('Please select an organisation first.');
      return;
    }
    if (!email.trim()) {
      setError('Please enter your work email address.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);
    setError(null);
    setAuthSuccess(null);

    try {
      const res = await fetch('/api/auth/sign-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          password: password,
          orgId: selectedOrgId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Authentication rejected by security policy.');
      }

      setAuthSuccess(`Authentication verified for ${data.user.name} (${data.user.role})`);
      setCustomActor(data.actor);

      setTimeout(() => {
        router.push(data.redirectPath || '/');
      }, 700);
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
      setLoading(false);
    }
  };

  // DEV-ONLY: static lookup of plain-text passwords for the quick-fill panel.
  // Passwords are stored as bcrypt hashes in the DB — this map exists only so
  // the demo sign-in panel can auto-fill the form without exposing hashes.
  // REMOVE or gate behind process.env.NODE_ENV === 'development' before production.
  const DEV_PASSWORD_MAP: Record<string, string> = {
    'nithesh_m@azentio.com':   'emp123',
    'pranika_k@azentio.com':   'learning123',
    'nishanth_e@azentio.com':  'content123',
    'lewis_hamilton@azentio.com': 'product123',
    'max_verstappen@azentio.com': 'admin123',
    'virat_kohli@abcd.in':     'cleint123',
    'dhoni.ms@xyz.com':        'admin123',
    'hardik.pandya@xyz.com':   'multiorg123',
  };

  const autoFillCredential = (user: UserRecord, targetOrgId: string) => {
    setSelectedOrgId(targetOrgId);
    setEmail(user.email);
    // Use the dev lookup map — never read passwordHash from the user record
    setPassword(DEV_PASSWORD_MAP[user.email.toLowerCase()] || '');
    setError(null);
  };

  const selectedOrg = organisations.find((o) => o.id === selectedOrgId);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <Image
          src="/logo.png"
          alt="Azentio Logo"
          width={56}
          height={56}
          className="w-14 h-14 rounded-2xl object-contain mx-auto mb-4 shadow-lg shadow-emerald-500/20"
          priority
        />
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
          Sign In to azentio.ai
        </h1>
        <p className="mt-2 text-sm text-muted-foreground max-w-lg mx-auto">
          Secure enterprise portal authentication. Select your designated organisation, then enter your work credentials.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Sign-In Form */}
        <div className="lg:col-span-7 p-6 sm:p-8 rounded-3xl glass-panel border border-border shadow-xl space-y-6">
          {authSuccess ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-10 space-y-4"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto border border-emerald-500/20">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">Welcome Back</h3>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-medium">{authSuccess}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  Initializing authorized role context & secure workspace...
                </p>
              </div>
              <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mt-4" />
            </motion.div>
          ) : (
            <form onSubmit={handleSignIn} className="space-y-6">
              {/* Step 1: Organization Selection */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-primary" />
                    Step 1: Select Organisation
                  </span>
                  {selectedOrg && (
                    <span className="text-[10px] text-emerald-500 font-mono font-medium">
                      {selectedOrg.domain}
                    </span>
                  )}
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {organisations
                    .filter((o) => ['org-azentio', 'org-abcd', 'org-xyz'].includes(o.id) || o.type === 'client')
                    .map((org) => {
                      const isSelected = selectedOrgId === org.id;
                      return (
                        <button
                          key={org.id}
                          type="button"
                          onClick={() => {
                            setSelectedOrgId(org.id);
                            setError(null);
                          }}
                          className={`p-3 rounded-2xl border text-left transition-all ${
                            isSelected
                              ? 'border-emerald-500 bg-emerald-500/10 ring-2 ring-emerald-500/20 text-foreground'
                              : 'border-border/70 bg-card hover:bg-accent/60 text-muted-foreground'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold truncate">
                              {org.name.replace(' Technologies', '').replace(' Financial', '').replace(' Global', '')}
                            </span>
                            {org.id === 'org-azentio' ? (
                              <span className="text-[9px] px-1 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-semibold">
                                Platform
                              </span>
                            ) : (
                              <span className="text-[9px] px-1 py-0.5 rounded bg-cyan-500/10 text-cyan-500 font-medium">
                                Client
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] font-mono text-muted-foreground truncate">
                            {org.domain}
                          </div>
                        </button>
                      );
                    })}
                </div>
              </div>

              {/* Step 2: Credentials */}
              <div className="space-y-4 pt-2 border-t border-border/60">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-primary" />
                  Step 2: Enter Credentials
                </div>

                {/* Email Input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground flex items-center justify-between">
                    <span>Work Email Address</span>
                    <span className="text-[11px] text-muted-foreground">Database Verified</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setError(null);
                      }}
                      placeholder={
                        selectedOrgId === 'org-azentio'
                          ? 'name@azentio.com'
                          : selectedOrgId === 'org-abcd'
                          ? 'name@abcd.in'
                          : 'name@xyz.com'
                      }
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground flex items-center justify-between">
                    <span>Password</span>
                    <span className="text-[11px] text-muted-foreground">Case sensitive</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setError(null);
                      }}
                      placeholder="Enter password"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all font-mono"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-xs text-destructive flex items-start gap-2"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <p className="font-semibold">Authentication Denied</p>
                    <p>{error}</p>
                  </div>
                </motion.div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl font-semibold text-sm bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-[0.99]"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                    <span>Verifying Database Credentials...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to {selectedOrg ? selectedOrg.name : 'Portal'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          <div className="pt-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Policy: Deny by Default</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-cyan-500" />
              <span>Neon DAL Authenticated</span>
            </div>
          </div>
        </div>

        {/* Right Side: Quick-Fill Credentials Helper Card */}
        <div className="lg:col-span-5 p-6 rounded-3xl glass-panel border border-border/80 shadow-md space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div className="flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-emerald-500" />
              <h2 className="text-sm font-bold text-foreground">Designated Role Credentials</h2>
            </div>
            <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              1-Click Fill
            </span>
          </div>

          <p className="text-xs text-muted-foreground">
            Click any account below to pre-select its organization, email, and password:
          </p>

          <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
            {/* Azentio Platform Roles */}
            <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider pt-1">
              Azentio Platform (azentio.com)
            </div>

            {dbUsers
              .filter((u) => u.orgId === 'org-azentio')
              .map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => autoFillCredential(u, 'org-azentio')}
                  className="w-full text-left p-2.5 rounded-xl border border-border/60 bg-card/60 hover:bg-accent/80 hover:border-emerald-500/40 transition-all text-xs group flex items-center justify-between"
                >
                  <div className="space-y-0.5 truncate pr-2">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-foreground group-hover:text-primary transition-colors">
                        {u.name}
                      </span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-muted font-mono uppercase text-muted-foreground">
                        {u.role}
                      </span>
                    </div>
                    <div className="text-[11px] text-muted-foreground font-mono truncate">
                      {u.email}
                    </div>
                    <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">
                      Click to auto-fill credentials
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
                </button>
              ))}

            {/* ABCD Technologies Roles */}
            <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider pt-2">
              ABCD Technologies (abcd.in)
            </div>

            {dbUsers
              .filter((u) => u.orgId === 'org-abcd' || u.memberships?.some((m) => m.orgId === 'org-abcd'))
              .map((u) => (
                <button
                  key={`abcd-${u.id}`}
                  type="button"
                  onClick={() => autoFillCredential(u, 'org-abcd')}
                  className="w-full text-left p-2.5 rounded-xl border border-border/60 bg-card/60 hover:bg-accent/80 hover:border-emerald-500/40 transition-all text-xs group flex items-center justify-between"
                >
                  <div className="space-y-0.5 truncate pr-2">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-foreground group-hover:text-primary transition-colors">
                        {u.name}
                      </span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-500/10 font-mono uppercase text-cyan-500">
                        {u.role}
                      </span>
                    </div>
                    <div className="text-[11px] text-muted-foreground font-mono truncate">
                      {u.email}
                    </div>
                    <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">
                      Click to auto-fill credentials
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
                </button>
              ))}

            {/* XYZ Global Roles */}
            <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider pt-2">
              XYZ Global (xyz.com)
            </div>

            {dbUsers
              .filter((u) => u.orgId === 'org-xyz' || u.memberships?.some((m) => m.orgId === 'org-xyz'))
              .map((u) => (
                <button
                  key={`xyz-${u.id}`}
                  type="button"
                  onClick={() => autoFillCredential(u, 'org-xyz')}
                  className="w-full text-left p-2.5 rounded-xl border border-border/60 bg-card/60 hover:bg-accent/80 hover:border-emerald-500/40 transition-all text-xs group flex items-center justify-between"
                >
                  <div className="space-y-0.5 truncate pr-2">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-foreground group-hover:text-primary transition-colors">
                        {u.name}
                      </span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-500/10 font-mono uppercase text-cyan-500">
                        {u.role}
                      </span>
                    </div>
                    <div className="text-[11px] text-muted-foreground font-mono truncate">
                      {u.email}
                    </div>
                    <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">
                      Click to auto-fill credentials
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
                </button>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
