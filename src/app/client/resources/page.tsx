'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { usePersona } from '@/context/PersonaContext';
import {
  getClientResources,
  registerForWebinar,
  getWebinarRegistrationStatus,
} from '@/server/dal/client/resources';
import {
  BookOpen,
  Calendar,
  Download,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  HelpCircle,
  FileText,
  LifeBuoy,
  Building2,
  Filter,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { ClientResource } from '@/types';

export default function ClientResourcesPage() {
  const { actor, activeTenant } = usePersona();
  const [filterType, setFilterType] = useState<string>('all');
  const [registrationMsg, setRegistrationMsg] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  if (!actor.activeTenantId || !activeTenant) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <Building2 className="w-12 h-12 text-muted-foreground mx-auto" />
        <h1 className="text-xl font-bold text-foreground">Workspace Required</h1>
        <p className="text-xs text-muted-foreground">Select an active client workspace to access enterprise resources.</p>
        <Link href="/choose-workspace" className="text-xs text-primary underline">
          Switch Workspace
        </Link>
      </div>
    );
  }

  const resources = getClientResources(actor, {
    type: filterType !== 'all' ? (filterType as ClientResource['type']) : undefined,
  });

  const handleRegister = (res: ClientResource) => {
    try {
      const result = registerForWebinar(actor, res.id);
      setRegistrationMsg(result.message);

      // Trigger automatic .ics download
      const blob = new Blob([result.icsContent], { type: 'text/calendar;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${res.id}.ics`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setRefreshKey((k) => k + 1);
      setTimeout(() => setRegistrationMsg(null), 5000);
    } catch (err: any) {
      alert(err.message || 'Registration failed');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8" key={refreshKey}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
              {activeTenant.name}
            </span>
            <span className="text-xs text-muted-foreground">Licensed Knowledge & Briefings</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Client Resources & Briefings
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
            Exclusive technical documentation, architecture whitepapers, sector webinars, and direct escalation channels provisioned under your enterprise agreement.
          </p>
        </div>

        {/* Support Link Out */}
        <a
          href="https://support.azentio.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card border border-border text-foreground text-xs font-semibold hover:bg-muted transition-all shadow-sm self-start md:self-auto"
        >
          <LifeBuoy className="w-4 h-4 text-primary" />
          <span>Enterprise Support Desk</span>
          <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
        </a>
      </div>

      {/* Honest Support Desk Notice */}
      <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/80 flex items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-2 text-muted-foreground">
          <HelpCircle className="w-4 h-4 text-primary shrink-0" />
          <span>
            Support Desk Link Notice: Clicking "Enterprise Support Desk" opens the official Azentio 24/7 SLA Support Portal in a new secure browser tab.
          </span>
        </div>
      </div>

      {registrationMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{registrationMsg} (Calendar .ics downloaded automatically).</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-border/80 pb-3">
        {[
          { key: 'all', label: 'All Resources' },
          { key: 'briefing', label: 'Briefings & Papers' },
          { key: 'release_note', label: 'Release Notes' },
          { key: 'webinar', label: 'Masterclasses & Webinars' },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setFilterType(t.key)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              filterType === t.key
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-card text-muted-foreground hover:text-foreground border border-border'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Resources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {resources.map((res) => {
          const isRegistered =
            res.type === 'webinar' && getWebinarRegistrationStatus(actor, res.id);

          return (
            <motion.div
              key={res.id}
              whileHover={{ y: -2 }}
              transition={{ duration: 0.2 }}
              className="p-6 rounded-3xl bg-card border border-border flex flex-col justify-between hover:border-primary/40 transition-all shadow-sm space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                    {res.type.replace('_', ' ')}
                  </span>
                  <span className="text-[11px] font-mono text-muted-foreground">
                    {formatDate(res.date)}
                  </span>
                </div>

                <h3 className="text-base font-bold text-foreground leading-snug">{res.title}</h3>

                <p className="text-xs text-muted-foreground leading-relaxed">{res.summary}</p>

                {res.webinarDetails && (
                  <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/40 text-xs space-y-1">
                    <div className="flex items-center gap-2 text-primary font-bold">
                      <Clock className="w-3.5 h-3.5" />
                      <span>
                        {res.webinarDetails.startTime} ({res.webinarDetails.durationMinutes} mins)
                      </span>
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      Speaker: <strong className="text-foreground">{res.webinarDetails.speakerName}</strong> ({res.webinarDetails.speakerRole})
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-border flex items-center justify-between">
                <span className="text-[11px] font-semibold text-muted-foreground">
                  {res.offeringName || 'Platform Core'}
                </span>

                {res.type === 'webinar' ? (
                  isRegistered ? (
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Registered</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => handleRegister(res)}
                      className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all shadow-sm flex items-center gap-1.5"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Register Free (.ics)</span>
                    </button>
                  )
                ) : (
                  <button
                    onClick={() => {
                      alert(`Downloading briefing documentation: ${res.title}`);
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-secondary text-secondary-foreground text-xs font-semibold hover:bg-secondary/80 flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download PDF</span>
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
