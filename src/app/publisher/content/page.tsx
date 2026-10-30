'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePersona } from '@/context/PersonaContext';
import {
  FileEdit,
  Globe,
  Radio,
  CheckCircle2,
  ShieldCheck,
  ChevronLeft,
} from 'lucide-react';

export default function PublisherContentPage() {
  const { actor } = usePersona();

  const isPublisher =
    actor.platformGrants.includes('content_publisher') ||
    actor.platformGrants.includes('portal_admin');

  const [bannerText, setBannerText] = useState(
    'Intelligent Collaboration Challenge 2026: Submissions open for collective-learning tracks.'
  );
  const [saved, setSaved] = useState(false);

  if (!isPublisher) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <ShieldCheck className="w-12 h-12 text-destructive mx-auto" />
        <h1 className="text-2xl font-bold text-foreground">Publisher Access Restricted</h1>
        <p className="text-sm text-muted-foreground">
          Content publishing requires &ldquo;content_publisher&rdquo; grant. Please sign in with publisher credentials (e.g. Nishanth E: nishanth_e@azentio.com).
        </p>
        <div className="pt-2">
          <Link
            href="/signin"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-md shadow-primary/20"
          >
            <span>Sign In as Publisher</span>
          </Link>
        </div>
      </div>
    );
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="max-w-3xl mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs uppercase tracking-widest font-bold text-primary">
            Content Publishing Console
          </span>
          <span className="badge-synthetic text-xs">Public & Media Audiences</span>
        </div>
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
          Website Banners & Media Audience Control
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
          Manage public website banners and configure media distribution audiences. Publishers cannot access client-private observations or admin IAM.
        </p>
      </div>

      <div className="p-8 rounded-3xl glass-panel border border-border max-w-2xl space-y-6">
        <div className="flex items-center gap-2 pb-4 border-b border-border">
          <Globe className="w-5 h-5 text-primary" />
          <h2 className="font-bold text-base text-foreground">Global Public Banner</h2>
        </div>

        {saved && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-500 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Banner updated across all public entry points.</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Banner Headline Copy
            </label>
            <input
              type="text"
              value={bannerText}
              onChange={(e) => setBannerText(e.target.value)}
              className="w-full bg-muted/60 border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all shadow-sm"
          >
            Publish Live Banner
          </button>
        </form>
      </div>
    </div>
  );
}

