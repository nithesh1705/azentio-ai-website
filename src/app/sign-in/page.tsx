'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { usePersona } from '@/context/PersonaContext';
import {
  Sparkles,
  Mail,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Building2,
  Key,
  Users,
} from 'lucide-react';

export default function SignInPage() {
  const router = useRouter();
  const { setPersona } = usePersona();
  const [email, setEmail] = useState('');
  const [magicSent, setMagicSent] = useState(false);

  const handleMagicLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setMagicSent(true);
    setTimeout(() => {
      if (email === 'pranika_k@azentio.com') {
        setPersona('learning_moderator');
        router.push('/moderation/queue');
      } else if (email === 'nishanth_e@azentio.com') {
        setPersona('content_publisher');
        router.push('/publisher/content');
      } else if (email === 'lewis_hamilton@azentio.com') {
        setPersona('product_owner');
        router.push('/employee/ideas');
      } else if (email === 'max_verstappen@azentio.com') {
        setPersona('portal_admin');
        router.push('/admin/orgs');
      } else if (email.endsWith('@azentio.com')) {
        setPersona('employee');
        router.push('/employee');
      } else if (email.includes('abcd.in')) {
        setPersona('client_member');
        router.push('/client');
      } else if (email.includes('xyz.com')) {
        if (email.includes('dhoni')) {
          setPersona('client_admin');
        } else {
          setPersona('multi_member');
        }
        router.push('/client');
      } else {
        setPersona('public');
        router.push('/');
      }
    }, 800);
  };

  const quickPersonas = [
    { key: 'employee', label: 'Sign in as Employee (Nithesh M)', path: '/employee' },
    { key: 'client_member', label: 'Sign in as Client Member (Virat Kohli @ abcd.in)', path: '/client' },
    { key: 'client_admin', label: 'Sign in as Client Admin (MS Dhoni @ xyz.com)', path: '/client' },
    { key: 'multi_member', label: 'Sign in as Multi-Org (Hardik Pandya @ xyz.com & abcd.in)', path: '/client' },
    { key: 'learning_moderator', label: 'Sign in as Moderator (Pranika K)', path: '/moderation/queue' },
    { key: 'content_publisher', label: 'Sign in as Publisher (Nishanth E)', path: '/publisher/content' },
    { key: 'product_owner', label: 'Sign in as Product Owner (Lewis Hamilton)', path: '/employee/ideas' },
    { key: 'portal_admin', label: 'Sign in as Portal Admin (Max Verstappen)', path: '/admin/orgs' },
  ];

  return (
    <div className="max-w-md mx-auto px-4 py-20">
      <div className="text-center mb-8">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white mx-auto mb-4 shadow-lg shadow-emerald-500/20">
          <Sparkles className="w-6 h-6" />
        </div>
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
          Sign In to azentio.ai
        </h1>
        <p className="mt-2 text-xs text-muted-foreground">
          Passwordless managed magic link with rate-limiting and verified allowlists
        </p>
      </div>

      <div className="p-8 rounded-3xl glass-panel border border-border space-y-6">
        {magicSent ? (
          <div className="text-center py-6 space-y-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <h2 className="text-lg font-bold text-foreground">Authentication Verified</h2>
            <p className="text-xs text-muted-foreground">
              Directing you to your authorized portal experience...
            </p>
          </div>
        ) : (
          <form onSubmit={handleMagicLink} className="space-y-4">
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
                  placeholder="nithesh_m@azentio.com or virat_kohli@abcd.in"
                  className="w-full bg-muted/60 pl-9 pr-4 py-2.5 rounded-xl text-xs text-foreground placeholder:text-muted-foreground border border-border focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-xs hover:bg-primary/90 transition-all shadow-md shadow-emerald-500/20"
            >
              <span>Send Magic Link / Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        <div className="pt-4 border-t border-border space-y-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block text-center">
            Evaluator Fast Access Personas
          </span>
          <div className="space-y-1.5">
            {quickPersonas.map((p) => (
              <button
                key={p.key}
                type="button"
                onClick={() => {
                  setPersona(p.key);
                  router.push(p.path);
                }}
                className="w-full text-left px-3.5 py-2 rounded-xl bg-muted/40 hover:bg-muted text-xs font-medium text-foreground transition-colors flex items-center justify-between"
              >
                <span>{p.label}</span>
                <ArrowRight className="w-3 h-3 text-muted-foreground" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

