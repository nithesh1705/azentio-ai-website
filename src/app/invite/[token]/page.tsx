'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { usePersona } from '@/context/PersonaContext';
import {
  getInvitationByToken,
  acceptClientInvitation,
  declineClientInvitation,
} from '@/server/dal/client/invitations';
import { ClientInvitation } from '@/types';
import {
  Building2,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  XCircle,
  ArrowRight,
  Clock,
  UserCheck,
  Mail,
  Lock,
} from 'lucide-react';

export default function AcceptInvitationPage() {
  const params = useParams();
  const router = useRouter();
  const token = params?.token as string;
  const { actor, setActiveTenantId } = usePersona();

  const [invitation, setInvitation] = useState<ClientInvitation | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusState, setStatusState] = useState<'loading' | 'valid' | 'invalid' | 'accepted'>('loading');

  useEffect(() => {
    if (!token) return;
    const res = getInvitationByToken(token);
    if (res.valid && res.invitation) {
      setInvitation(res.invitation);
      setStatusState('valid');
    } else {
      setErrorMsg(res.reason || 'Invalid or expired invitation token.');
      setStatusState('invalid');
    }
  }, [token]);

  const isEmailMatched =
    actor.email &&
    invitation &&
    actor.email.trim().toLowerCase() === invitation.email.trim().toLowerCase();

  const handleAccept = () => {
    if (!token || !actor) return;
    setIsProcessing(true);
    setErrorMsg(null);

    try {
      const res = acceptClientInvitation(actor, token);
      setActiveTenantId(res.orgId);
      setStatusState('accepted');
      setTimeout(() => {
        router.push(`/onboarding/terms?orgId=${res.orgId}`);
      }, 1200);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to accept invitation');
      setIsProcessing(false);
    }
  };

  const handleDecline = () => {
    if (!token || !actor) return;
    if (confirm('Decline this invitation? The link will be revoked.')) {
      try {
        declineClientInvitation(actor, token);
        router.push('/');
      } catch (err: any) {
        alert(err.message || 'Failed to decline');
      }
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-xl space-y-6"
      >
        {statusState === 'loading' && (
          <div className="py-12 text-center text-xs text-muted-foreground animate-pulse">
            Verifying cryptographic invitation token...
          </div>
        )}

        {statusState === 'invalid' && (
          <div className="text-center space-y-4 py-6">
            <div className="w-14 h-14 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
              <XCircle className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-foreground">Invitation Invalid or Expired</h2>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              {errorMsg}
            </p>
            <div className="pt-2">
              <Link
                href="/signin"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold"
              >
                <span>Return to Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}

        {statusState === 'accepted' && (
          <div className="text-center space-y-4 py-8">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-foreground">Invitation Accepted!</h2>
            <p className="text-xs text-muted-foreground">
              Redirecting to workspace terms & learning onboarding...
            </p>
          </div>
        )}

        {statusState === 'valid' && invitation && (
          <div className="space-y-6">
            {/* Header */}
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
                <Building2 className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">Workspace Invitation</h1>
              <p className="text-xs text-muted-foreground">
                You have been invited to join an enterprise collaboration workspace.
              </p>
            </div>

            {/* Invitation Details Card */}
            <div className="rounded-2xl border border-border bg-muted/30 p-5 space-y-3 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-border/60">
                <span className="text-muted-foreground">Organization:</span>
                <span className="font-bold text-foreground text-sm">{invitation.orgName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Proposed Role:</span>
                <span className="font-mono font-bold capitalize text-primary">
                  {invitation.role.replace('_', ' ')}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Invited By:</span>
                <span className="font-medium text-foreground">{invitation.invitedByName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Authorized Email:</span>
                <span className="font-mono text-foreground font-semibold">{invitation.email}</span>
              </div>
              <div className="flex items-center justify-between text-muted-foreground pt-1 border-t border-border/40">
                <span>Expires:</span>
                <span>{new Date(invitation.expiresAt).toLocaleString()}</span>
              </div>
            </div>

            {/* Email Mismatch or Sign-in Check */}
            {!actor.email || actor.email === '' ? (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold">
                  <Lock className="w-4 h-4 shrink-0" />
                  <span>Authentication Required</span>
                </div>
                <p>
                  You must sign in with <strong className="font-mono">{invitation.email}</strong> to claim this membership.
                </p>
                <div className="pt-1">
                  <Link
                    href={`/signin?email=${encodeURIComponent(invitation.email)}`}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-amber-600 text-white font-semibold text-xs"
                  >
                    <span>Sign In Now</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ) : !isEmailMatched ? (
              <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>Email Identity Mismatch</span>
                </div>
                <p>
                  This invitation was issued to <strong className="font-mono">{invitation.email}</strong>, but you are currently signed in as <strong className="font-mono">{actor.email}</strong>.
                </p>
                <p className="text-[11px] text-muted-foreground">
                  To protect tenant boundaries, memberships can only be claimed by the verified recipient email.
                </p>
                <div className="pt-1">
                  <Link
                    href="/signin"
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl border border-destructive/30 text-xs font-semibold hover:bg-destructive/10"
                  >
                    <span>Switch Account</span>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 shrink-0" />
                <span>Verified Identity Match: You are authenticated as {actor.email}.</span>
              </div>
            )}

            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs">
                {errorMsg}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-border">
              <button
                type="button"
                onClick={handleDecline}
                className="px-4 py-2 rounded-xl border border-border text-xs font-semibold hover:bg-muted text-muted-foreground hover:text-foreground"
              >
                Decline
              </button>

              <button
                type="button"
                disabled={!isEmailMatched || isProcessing}
                onClick={handleAccept}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all shadow-md shadow-primary/20 disabled:opacity-50"
              >
                <span>{isProcessing ? 'Claiming Membership...' : 'Accept & Join Workspace'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

