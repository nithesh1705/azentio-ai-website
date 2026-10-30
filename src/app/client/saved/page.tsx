'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { usePersona } from '@/context/PersonaContext';
import {
  getSavedSearches,
  deleteSavedSearch,
  getBookmarks,
  removeBookmark,
} from '@/server/dal/client/saved';
import {
  Bookmark as BookmarkIcon,
  Search,
  Trash2,
  ExternalLink,
  PlayCircle,
  FileText,
  Sparkles,
  Building2,
  Bell,
  ArrowRight,
  Layers,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function ClientSavedPage() {
  const { actor, activeTenant } = usePersona();
  const [tab, setTab] = useState<'searches' | 'bookmarks'>('searches');
  const [refreshKey, setRefreshKey] = useState(0);

  if (!actor.activeTenantId || !activeTenant) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <Building2 className="w-12 h-12 text-muted-foreground mx-auto" />
        <h1 className="text-xl font-bold text-foreground">Workspace Required</h1>
        <p className="text-xs text-muted-foreground">Select an active client workspace to view saved searches and bookmarks.</p>
        <Link href="/choose-workspace" className="text-xs text-primary underline">
          Switch Workspace
        </Link>
      </div>
    );
  }

  const savedSearches = getSavedSearches(actor);
  const bookmarks = getBookmarks(actor);

  const handleDeleteSearch = (id: string) => {
    deleteSavedSearch(actor, id);
    setRefreshKey((k) => k + 1);
  };

  const handleRemoveBookmark = (id: string) => {
    removeBookmark(actor, id);
    setRefreshKey((k) => k + 1);
  };

  const getTargetIcon = (type: string) => {
    switch (type) {
      case 'demo':
        return <PlayCircle className="w-4 h-4 text-primary" />;
      case 'observation':
        return <FileText className="w-4 h-4 text-emerald-500" />;
      case 'theme':
        return <Sparkles className="w-4 h-4 text-amber-500" />;
      default:
        return <BookmarkIcon className="w-4 h-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8" key={refreshKey}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
              {activeTenant.name}
            </span>
            <span className="text-xs text-muted-foreground">Personal Workspace Collection</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Saved Searches & Bookmarks
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground max-w-2xl">
            Quick access to bookmarked observation patterns, customized sandbox presets, and monitored search queries.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-1 p-1 bg-muted rounded-2xl border border-border self-start sm:self-auto">
          <button
            onClick={() => setTab('searches')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
              tab === 'searches'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Search className="w-3.5 h-3.5 text-primary" />
            <span>Saved Searches ({savedSearches.length})</span>
          </button>

          <button
            onClick={() => setTab('bookmarks')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
              tab === 'bookmarks'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <BookmarkIcon className="w-3.5 h-3.5 text-primary" />
            <span>Bookmarks ({bookmarks.length})</span>
          </button>
        </div>
      </div>

      {/* Tab: Saved Searches */}
      {tab === 'searches' && (
        <div className="space-y-4">
          {savedSearches.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-card border border-dashed border-border max-w-md mx-auto space-y-3">
              <Search className="w-10 h-10 text-muted-foreground mx-auto" />
              <h3 className="text-sm font-bold text-foreground">No Saved Searches Yet</h3>
              <p className="text-xs text-muted-foreground">
                When you run searches in the client portal, you can save queries to monitor new matching market findings.
              </p>
              <Link
                href="/client/search"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 mt-2"
              >
                Go to Search
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {savedSearches.map((s) => (
                <div
                  key={s.id}
                  className="p-5 rounded-2xl bg-card border border-border hover:border-primary/40 transition-all flex flex-col justify-between shadow-sm space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                        query: "{s.query}"
                      </span>
                      {s.notifyNewMatches && (
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Bell className="w-3 h-3 text-emerald-500" />
                          <span>Alerts Active</span>
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-foreground">{s.title}</h3>

                    <div className="text-[11px] font-mono text-muted-foreground">
                      Created: {formatDate(s.createdAt)}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-border flex items-center justify-between">
                    <button
                      onClick={() => handleDeleteSearch(s.id)}
                      className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>

                    <Link
                      href={`/client/search?q=${encodeURIComponent(s.query)}`}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 shadow-sm"
                    >
                      <span>Execute Query</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Bookmarks */}
      {tab === 'bookmarks' && (
        <div className="space-y-4">
          {bookmarks.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-card border border-dashed border-border max-w-md mx-auto space-y-3">
              <BookmarkIcon className="w-10 h-10 text-muted-foreground mx-auto" />
              <h3 className="text-sm font-bold text-foreground">No Bookmarks Saved</h3>
              <p className="text-xs text-muted-foreground">
                Bookmark interesting observations, sandbox scenarios, or learning themes across the portal for instant retrieval.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {bookmarks.map((bm) => (
                <div
                  key={bm.id}
                  className="p-5 rounded-2xl bg-card border border-border hover:border-primary/40 transition-all flex flex-col justify-between shadow-sm space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        {getTargetIcon(bm.targetType)}
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          {bm.targetType}
                        </span>
                      </div>
                      <span className="text-[11px] font-mono text-muted-foreground">
                        {formatDate(bm.createdAt)}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-foreground leading-snug">
                      {bm.title}
                    </h3>

                    {bm.snippet && (
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {bm.snippet}
                      </p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-border flex items-center justify-between">
                    <button
                      onClick={() => handleRemoveBookmark(bm.id)}
                      className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>

                    <Link
                      href={bm.url}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-secondary text-secondary-foreground text-xs font-semibold hover:bg-secondary/80"
                    >
                      <span>Open Item</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
