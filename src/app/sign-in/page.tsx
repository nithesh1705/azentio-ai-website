'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePersona } from '@/context/PersonaContext';
import {
  Sparkles,
  Mail,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Building2,
  AlertCircle,
  Database,
  UserCheck,
  RefreshCw,
} from 'lucide-react';
import { UserRecord } from '@/types';

export default function SignInPage() {
  const router = useRouter();
  const { setCustomActor } = usePersona();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);
  const [dbUsers, setDbUsers] = useState<UserRecord[]>([]);
  const [fetchingUsers, setFetchingUsers] = useState(true);

  // Fetch registered users directly from the database
  const loadUsers = async () => {
    try {
      setFetchingUsers(true);
      const res = await fetch('/api/auth/users');
      if (res.ok) {
        const data = await res.json();
        setDbUsers(data.users || []);
      }
    } catch {
      // fallback
    } finally {
      setFetchingUsers(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleSignIn = async (targetEmail: string) => {
    if (!targetEmail.trim()) {
      setError('Please enter a valid work email address.');
      return;
    }

    setLoading(true);
    setError(null);
    setAuthSuccess(null);

    try {
      const res = await fetch('/api/auth/sign-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetEmail.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Authentication rejected by policy.');
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

  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <div className="text-center mb-8">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white mx-auto mb-4 shadow-lg shadow-emerald-500/20">
          <Sparkles className="w-6 h-6" />
        </div>
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
          Sign In to azentio.ai
        </h1>
        <p className="mt-2 text-xs text-muted-foreground">
          Database-enforced passwordless session authentication. Access grants, tenant memberships, and roles are dynamically verified from the server.
        </p>
      </div>

      <div className="p-8 rounded-3xl glass-panel border border-border space-y-6">
        {authSuccess ? (
          <div className="text-center py-6 space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto animate-bounce" />
            <h2 className="text-lg font-bold text-foreground">Identity & Grants Verified</h2>
            <p className="text-xs text-muted-foreground">{authSuccess}</p>
            <p className="text-[11px] text-primary font-mono">Routing to authorized destination...</p>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSignIn(email);
            }}
            className="space-y-4"
          >
            {error && (
              <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Work Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter registered email (e.g. nithesh_m@azentio.com or virat_kohli@abcd.in)"
                  className="w-full bg-muted/60 pl-9 pr-4 py-2.5 rounded-xl text-xs text-foreground placeholder:text-muted-foreground border border-border focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-xs hover:bg-primary/90 transition-all shadow-md shadow-emerald-500/20 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Verifying Server Database...</span>
                </>
              ) : (
                <>
                  <span>Sign In with Verified Identity</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Database-Driven User Accounts Directory */}
        <div className="pt-6 border-t border-border space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-emerald-500" />
              <span>Registered Database Users ({dbUsers.length})</span>
            </span>
            <button
              onClick={loadUsers}
              className="text-[11px] text-primary hover:underline flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Refresh DB</span>
            </button>
          </div>

          <p className="text-[11px] text-muted-foreground">
            Click any active account from the database to sign in instantly with their verified server-side grants:
          </p>

          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {fetchingUsers ? (
              <div className="p-4 text-center text-xs text-muted-foreground">
                Loading accounts from database...
              </div>
            ) : dbUsers.length === 0 ? (
              <div className="p-4 text-center text-xs text-muted-foreground">
                No users found in database.
              </div>
            ) : (
              dbUsers.map((u) => {
                const isPlatform = u.orgId === 'org-azentio' || u.isVerifiedEmployee;
                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => {
                      setEmail(u.email);
                      handleSignIn(u.email);
                    }}
                    className="w-full text-left p-2.5 rounded-xl bg-muted/40 hover:bg-muted border border-border/80 hover:border-primary/40 transition-all flex items-center justify-between group"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-foreground group-hover:text-primary transition-colors">
                          {u.name}
                        </span>
                        <span
                          className={`text-[9px] uppercase font-mono px-2 py-0.5 rounded font-bold ${
                            isPlatform
                              ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                              : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                          }`}
                        >
                          {u.role.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <span className="text-[11px] text-muted-foreground font-mono">
                        {u.email}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-muted-foreground bg-card px-2 py-0.5 rounded border border-border">
                        {u.orgId.replace('org-', '')}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:translate-x-1 group-hover:text-primary transition-all" />
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
