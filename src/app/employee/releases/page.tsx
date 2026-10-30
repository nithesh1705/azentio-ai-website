'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { usePersona } from '@/context/PersonaContext';
import {
  getInternalReleases,
  createInternalRelease,
  getReleaseSubscriptions,
  toggleReleaseSubscription,
} from '@/server/dal/employee/releases';
import { getPlaygroundOfferings } from '@/server/dal/employee/playground';
import { InternalReleaseNote, Offering } from '@/types';
import {
  Newspaper,
  Tag,
  Calendar,
  Search,
  Filter,
  PlusCircle,
  Bell,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  X,
  Sparkles,
  Layers,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

export default function EmployeeReleaseNotesPage() {
  const { actor } = usePersona();
  const [releases, setReleases] = useState<InternalReleaseNote[]>([]);
  const [offerings, setOfferings] = useState<Offering[]>([]);
  const [subscriptions, setSubscriptions] = useState<string[]>([]);

  // Filters
  const [selectedOffering, setSelectedOffering] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [search, setSearch] = useState<string>('');

  // Publisher modal
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [newVersion, setNewVersion] = useState<string>('');
  const [newTitle, setNewTitle] = useState<string>('');
  const [newOfferingId, setNewOfferingId] = useState<string>('');
  const [newType, setNewType] = useState<InternalReleaseNote['type']>('Feature');
  const [newSummary, setNewSummary] = useState<string>('');
  const [newNotes, setNewNotes] = useState<string>('');
  const [newKnownIssues, setNewKnownIssues] = useState<string>('');

  const isPublisher =
    actor?.platformGrants?.includes('content_publisher') ||
    actor?.platformGrants?.includes('portal_admin');

  const loadData = () => {
    if (!actor?.isVerifiedEmployee) return;
    try {
      const rels = getInternalReleases(actor, {
        offeringId: selectedOffering,
        type: selectedType,
        search,
      });
      setReleases(rels);

      const offs = getPlaygroundOfferings(actor);
      setOfferings(offs);
      if (offs.length > 0 && !newOfferingId) {
        setNewOfferingId(offs[0].id);
      }

      const subs = getReleaseSubscriptions(actor);
      setSubscriptions(subs);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, [actor, selectedOffering, selectedType, search]);

  const handleToggleSub = (offeringId: string) => {
    if (!actor) return;
    try {
      const updated = toggleReleaseSubscription(actor, offeringId);
      setSubscriptions(updated);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateRelease = (e: React.FormEvent) => {
    e.preventDefault();
    if (!actor || !isPublisher) return;

    const matchedOff = offerings.find((o) => o.id === newOfferingId);

    try {
      createInternalRelease(actor, {
        version: newVersion,
        title: newTitle,
        offeringId: newOfferingId,
        offeringName: matchedOff?.name || 'Azentio Platform',
        type: newType,
        summary: newSummary,
        fullNotes: newNotes,
        knownIssues: newKnownIssues.split('\n').filter((l) => l.trim().length > 0),
      });

      setShowCreateModal(false);
      setNewVersion('');
      setNewTitle('');
      setNewSummary('');
      setNewNotes('');
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to publish release notes');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
              Product Roadmap & Changelog
            </span>
            <span className="text-xs text-muted-foreground font-mono">Employee Quarantined</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Internal Release Notes
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Detailed changelogs, architecture shifts, and known limitations across Azentio core products.
          </p>
        </div>

        {isPublisher && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all shadow-md shadow-primary/20 shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Publish Release Note</span>
          </button>
        )}
      </div>

      {/* Subscription Bar */}
      <div className="p-4 rounded-2xl bg-card border border-border shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs">
          <Bell className="w-4 h-4 text-primary shrink-0" />
          <span className="font-semibold text-foreground">In-App Release Subscriptions:</span>
          <span className="text-muted-foreground">Receive notification badges when selected product notes drop.</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {offerings.map((off) => {
            const isSubbed = subscriptions.includes(off.id);
            return (
              <button
                key={off.id}
                onClick={() => handleToggleSub(off.id)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-all ${
                  isSubbed
                    ? 'bg-primary/10 text-primary border-primary/30 font-bold'
                    : 'bg-muted/40 text-muted-foreground border-border hover:bg-muted'
                }`}
              >
                {isSubbed ? '✓ ' : '+ '}
                {off.name.split(' ')[0]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-card border border-border rounded-3xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search release notes by version, title, keyword..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-input bg-background text-xs text-foreground outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <select
              value={selectedOffering}
              onChange={(e) => setSelectedOffering(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-input bg-background text-xs text-foreground outline-none"
            >
              <option value="all">All Offerings</option>
              {offerings.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </select>

            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-input bg-background text-xs text-foreground outline-none"
            >
              <option value="all">All Change Types</option>
              <option value="Feature">Feature</option>
              <option value="Improvement">Improvement</option>
              <option value="Fix">Fix</option>
              <option value="Known_Issue">Known Issue</option>
            </select>
          </div>
        </div>
      </div>

      {/* Timeline View */}
      {releases.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-border rounded-3xl bg-card">
          <Newspaper className="w-12 h-12 text-muted-foreground mx-auto mb-2 opacity-40" />
          <h3 className="text-base font-bold text-foreground">No release notes found</h3>
          <p className="text-xs text-muted-foreground mt-1">Try adjusting search query or filters.</p>
        </div>
      ) : (
        <div className="relative border-l-2 border-border/80 ml-4 sm:ml-6 pl-6 sm:pl-8 space-y-8">
          {releases.map((rel) => {
            const typeColor =
              rel.type === 'Feature'
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                : rel.type === 'Improvement'
                ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
                : rel.type === 'Fix'
                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';

            return (
              <div key={rel.id} className="relative group">
                {/* Timeline Node Icon */}
                <div className="absolute -left-[35px] sm:-left-[43px] top-1.5 w-6 h-6 rounded-full bg-card border-2 border-primary flex items-center justify-center text-[10px] font-bold text-primary shadow-xs">
                  •
                </div>

                {/* Release Card */}
                <div className="rounded-3xl border border-border bg-card p-6 shadow-xs hover:border-primary/40 transition-all space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border/60">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="font-mono text-sm sm:text-base font-extrabold text-foreground">
                        {rel.version}
                      </span>
                      <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${typeColor}`}>
                        {rel.type.replace('_', ' ')}
                      </span>
                      <span className="text-xs font-medium text-muted-foreground">
                        {rel.offeringName}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{new Date(rel.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-foreground mb-1.5">{rel.title}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{rel.summary}</p>
                  </div>

                  {rel.knownIssues && rel.knownIssues.length > 0 && (
                    <div className="p-3.5 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-xs space-y-1">
                      <span className="font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wider text-[10px]">
                        Known Limitations / Workarounds:
                      </span>
                      {rel.knownIssues.map((issue, idx) => (
                        <div key={idx} className="text-muted-foreground flex items-start gap-1.5">
                          <span>•</span>
                          <span>{issue}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2">
                    <Link
                      href={`/employee/releases/${rel.id}`}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                    >
                      <span>Read Full Release Notes & Migration Steps</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Publisher Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-xl bg-card border border-border rounded-3xl p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <h3 className="text-lg font-bold text-foreground">Publish Product Release Note</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-xl text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateRelease} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Version Tag</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. v2.5.1"
                    value={newVersion}
                    onChange={(e) => setNewVersion(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-input bg-background text-xs outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Change Type</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-input bg-background text-xs outline-none"
                  >
                    <option value="Feature">Feature</option>
                    <option value="Improvement">Improvement</option>
                    <option value="Fix">Fix</option>
                    <option value="Known_Issue">Known Issue</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Target Offering</label>
                <select
                  value={newOfferingId}
                  onChange={(e) => setNewOfferingId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-input bg-background text-xs outline-none"
                >
                  {offerings.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Release Title</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Non-linear Fourier Seasonality Normalization"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-input bg-background text-xs outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Executive Summary</label>
                <textarea
                  required
                  rows={2}
                  value={newSummary}
                  onChange={(e) => setNewSummary(e.target.value)}
                  placeholder="Short 2-3 sentence overview for changelog..."
                  className="w-full px-3 py-2 rounded-xl border border-input bg-background text-xs outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Full Technical Notes (Markdown)</label>
                <textarea
                  required
                  rows={4}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Detailed breakdown of changes, migration steps, breaking modifications..."
                  className="w-full px-3 py-2 rounded-xl border border-input bg-background text-xs font-mono outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Known Limitations (One per line)</label>
                <textarea
                  rows={2}
                  value={newKnownIssues}
                  onChange={(e) => setNewKnownIssues(e.target.value)}
                  placeholder="e.g. Requires at least 24 months of synthetic P&L records..."
                  className="w-full px-3 py-2 rounded-xl border border-input bg-background text-xs outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl border border-border text-xs font-semibold hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90"
                >
                  Publish Note
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
