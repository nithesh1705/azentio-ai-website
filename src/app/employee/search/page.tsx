'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { usePersona } from '@/context/PersonaContext';
import { searchEmployeeContent, GroupedSearchResults } from '@/server/dal/employee/search';
import {
  Search,
  FlaskConical,
  BookOpen,
  Newspaper,
  Radio,
  Users,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

export default function EmployeeSearchPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-muted-foreground">Loading Search...</div>}>
      <EmployeeSearchContent />
    </Suspense>
  );
}

function EmployeeSearchContent() {
  const { actor } = usePersona();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [activeType, setActiveType] = useState<string>('all');
  const [searchData, setSearchData] = useState<GroupedSearchResults | null>(null);

  useEffect(() => {
    if (!actor?.isVerifiedEmployee) return;
    try {
      const results = searchEmployeeContent(actor, query, activeType);
      setSearchData(results);
    } catch (e) {
      console.error(e);
    }
  }, [actor, query, activeType]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!actor) return;
    try {
      const results = searchEmployeeContent(actor, query, activeType);
      setSearchData(results);
    } catch (e) {
      console.error(e);
    }
  };

  const SUGGESTED_QUERIES = [
    'Seasonality',
    'Murabaha',
    'Covenant',
    'Sanctions',
    'Architecture',
    'Telematics',
  ];

  if (!actor?.isVerifiedEmployee) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold">Employee Access Required</h2>
      </div>
    );
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'experiment':
        return <FlaskConical className="w-4 h-4 text-emerald-500" />;
      case 'knowledge':
        return <BookOpen className="w-4 h-4 text-amber-500" />;
      case 'release':
        return <Newspaper className="w-4 h-4 text-purple-500" />;
      case 'session':
        return <Radio className="w-4 h-4 text-rose-500" />;
      case 'team':
        return <Users className="w-4 h-4 text-blue-500" />;
      default:
        return <Search className="w-4 h-4 text-primary" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
            Unified Knowledge Retrieval
          </span>
          <span className="text-xs text-muted-foreground font-mono">Employee Quarantined Index</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
          Employee Global Search
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Search quarantined experiments, knowledge base articles, release changelogs, live sessions, and team spaces.
        </p>
      </div>

      {/* Search Input Bar */}
      <form onSubmit={handleSearchSubmit} className="relative">
        <Search className="w-5 h-5 text-muted-foreground absolute left-4 top-3.5" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search internal experiments, knowledge ADRs, releases, sessions..."
          className="w-full pl-12 pr-28 py-3 rounded-2xl border border-input bg-card text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20 shadow-xs"
        />
        <button
          type="submit"
          className="absolute right-2 top-2 px-4 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90"
        >
          Search
        </button>
      </form>

      {/* Suggested Topics / Empty State */}
      {!query && (
        <div className="p-6 rounded-3xl border border-border bg-card space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Suggested Search Queries
          </h4>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_QUERIES.map((q) => (
              <button
                key={q}
                onClick={() => setQuery(q)}
                className="px-3 py-1.5 rounded-xl bg-muted/40 hover:bg-muted border border-border/60 text-xs font-medium text-foreground transition-all"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Filter Chips with Counts */}
      {searchData && searchData.totalCount > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveType('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              activeType === 'all'
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-card border-border hover:bg-muted text-muted-foreground'
            }`}
          >
            All Results ({searchData.totalCount})
          </button>

          <button
            onClick={() => setActiveType('experiment')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              activeType === 'experiment'
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-card border-border hover:bg-muted text-muted-foreground'
            }`}
          >
            Experiments ({searchData.countsByType.experiment})
          </button>

          <button
            onClick={() => setActiveType('knowledge')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              activeType === 'knowledge'
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-card border-border hover:bg-muted text-muted-foreground'
            }`}
          >
            Knowledge ({searchData.countsByType.knowledge})
          </button>

          <button
            onClick={() => setActiveType('release')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              activeType === 'release'
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-card border-border hover:bg-muted text-muted-foreground'
            }`}
          >
            Releases ({searchData.countsByType.release})
          </button>

          <button
            onClick={() => setActiveType('session')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              activeType === 'session'
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-card border-border hover:bg-muted text-muted-foreground'
            }`}
          >
            Broadcasts ({searchData.countsByType.session})
          </button>

          <button
            onClick={() => setActiveType('team')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              activeType === 'team'
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-card border-border hover:bg-muted text-muted-foreground'
            }`}
          >
            Teams ({searchData.countsByType.team})
          </button>
        </div>
      )}

      {/* Results List */}
      {searchData && query && searchData.results.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-border rounded-3xl bg-card">
          <Search className="w-12 h-12 text-muted-foreground mx-auto mb-2 opacity-40" />
          <h3 className="text-base font-bold text-foreground">No employee resources match "{query}"</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Try searching for "Murabaha", "Seasonality", "Covenant", or "Architecture".
          </p>
        </div>
      ) : searchData && searchData.results.length > 0 ? (
        <div className="space-y-3">
          {searchData.results.map((item) => (
            <Link
              key={`${item.type}-${item.id}`}
              href={item.url}
              className="block p-4 sm:p-5 rounded-2xl bg-card border border-border hover:border-primary/40 transition-all group shadow-xs"
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  {getTypeIcon(item.type)}
                  <span className="text-[10px] font-mono uppercase font-bold text-muted-foreground">
                    {item.type}
                  </span>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-[11px] text-muted-foreground">{item.metadata}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
              </div>

              <h3 className="text-sm sm:text-base font-bold text-foreground group-hover:text-primary transition-colors">
                {item.title}
              </h3>

              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.snippet}</p>
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}

