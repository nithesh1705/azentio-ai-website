'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { usePersona } from '@/context/PersonaContext';
import { searchClientContent, SearchResultItem } from '@/server/dal/client/search';
import {
  Search,
  Building2,
  PlayCircle,
  FileText,
  BrainCircuit,
  Sparkles,
  Lightbulb,
  ArrowRight,
  Filter,
  Layers,
  ChevronRight,
} from 'lucide-react';

export default function ClientSearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams?.get('q') || '';
  const { actor, activeTenant } = usePersona();

  const [query, setQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState<string>('all');

  useEffect(() => {
    if (initialQuery !== query) {
      setQuery(initialQuery);
    }
  }, [initialQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/client/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  if (!actor.activeTenantId || !activeTenant) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <Building2 className="w-12 h-12 text-muted-foreground mx-auto" />
        <h1 className="text-xl font-bold text-foreground">Workspace Required</h1>
        <p className="text-xs text-muted-foreground">Select an active client workspace to perform permitted searches.</p>
        <Link href="/choose-workspace" className="text-xs text-primary underline">
          Switch Workspace
        </Link>
      </div>
    );
  }

  const searchResults = searchClientContent(actor, query);
  const { totalCount, resultsByCategory } = searchResults;

  // Flatten items for 'all' tab
  const allItems: SearchResultItem[] = [
    ...resultsByCategory.demos,
    ...resultsByCategory.observations,
    ...resultsByCategory.shared,
    ...resultsByCategory.themes,
    ...resultsByCategory.ideas,
  ];

  const displayedItems =
    activeTab === 'all'
      ? allItems
      : resultsByCategory[activeTab as keyof typeof resultsByCategory] || [];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'demos':
        return <PlayCircle className="w-4 h-4 text-primary" />;
      case 'observations':
        return <FileText className="w-4 h-4 text-emerald-500" />;
      case 'shared':
        return <BrainCircuit className="w-4 h-4 text-cyan-500" />;
      case 'themes':
        return <Sparkles className="w-4 h-4 text-amber-500" />;
      case 'ideas':
        return <Lightbulb className="w-4 h-4 text-purple-500" />;
      default:
        return <Layers className="w-4 h-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
            {activeTenant.name}
          </span>
          <span className="text-xs text-muted-foreground">Permitted Client Content Search</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
          Client Workspace Search
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
          Quarantined to permitted assets only: entitled sandboxes, active tenant observations, de-identified shared feeds, themes, and feature roadmaps.
        </p>
      </div>

      {/* Search Input Bar */}
      <form onSubmit={handleSearchSubmit} className="relative">
        <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search sandboxes, observations, shared learning, or themes..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-11 pr-24 py-3 text-sm rounded-2xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-sm"
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all shadow-sm"
        >
          Search
        </button>
      </form>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border/80 pb-4">
        {[
          { key: 'all', label: 'All Results', count: totalCount },
          { key: 'demos', label: 'Sandboxes & Demos', count: resultsByCategory.demos.length },
          { key: 'observations', label: 'Our Observations', count: resultsByCategory.observations.length },
          { key: 'shared', label: 'Shared Learning', count: resultsByCategory.shared.length },
          { key: 'themes', label: 'Aggregated Themes', count: resultsByCategory.themes.length },
          { key: 'ideas', label: 'Roadmap Ideas', count: resultsByCategory.ideas.length },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeTab === tab.key
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-muted/40 text-muted-foreground hover:text-foreground border border-border/50'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                activeTab === tab.key ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Results List */}
      {!query.trim() ? (
        <div className="p-12 text-center rounded-3xl bg-card border border-dashed border-border max-w-md mx-auto space-y-2">
          <Search className="w-8 h-8 text-muted-foreground mx-auto" />
          <h3 className="text-sm font-bold text-foreground">Type a query to search</h3>
          <p className="text-xs text-muted-foreground">
            Try searching for "liquidity", "AML", "settlement", "anomaly", or "risk".
          </p>
        </div>
      ) : displayedItems.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-card border border-dashed border-border max-w-md mx-auto space-y-2">
          <Search className="w-8 h-8 text-muted-foreground mx-auto" />
          <h3 className="text-sm font-bold text-foreground">No Permitted Results Found</h3>
          <p className="text-xs text-muted-foreground">
            No matches found for "{query}". Searches are strictly isolated to your active workspace and de-identified feeds.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayedItems.map((item) => (
            <Link
              key={item.id}
              href={item.url}
              className="p-5 rounded-2xl bg-card border border-border hover:border-primary/40 transition-all flex items-start justify-between gap-4 group shadow-sm block"
            >
              <div className="space-y-1.5 max-w-3xl">
                <div className="flex items-center gap-2">
                  {getCategoryIcon(item.category)}
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    {item.category}
                  </span>
                  {item.badge && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-muted text-foreground">
                      {item.badge}
                    </span>
                  )}
                </div>

                <h3 className="text-sm sm:text-base font-bold text-foreground group-hover:text-primary transition-colors">
                  {item.title}
                </h3>

                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {item.snippet}
                </p>
              </div>

              <div className="shrink-0 pt-2 text-muted-foreground group-hover:text-primary transition-colors">
                <ChevronRight className="w-4 h-4" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
