'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { usePersona } from '@/context/PersonaContext';
import { getKnowledgeItems } from '@/server/dal/employee/knowledge';
import { KnowledgeItem } from '@/types';
import {
  BookOpen,
  PlusCircle,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ThumbsUp,
  LayoutGrid,
  Table as TableIcon,
  ChevronRight,
  ShieldCheck,
  User,
} from 'lucide-react';

export default function EmployeeKnowledgeListPage() {
  const { actor } = usePersona();
  const [items, setItems] = useState<KnowledgeItem[]>([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');

  const loadData = () => {
    if (!actor?.isVerifiedEmployee) return;
    try {
      const data = getKnowledgeItems(actor, {
        category: categoryFilter,
        reviewStatus: statusFilter,
        search,
      });
      setItems(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, [actor, categoryFilter, statusFilter, search]);

  const allCategories = Array.from(new Set(items.map((i) => i.category)));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              Internal Knowledge Base & ADRs
            </span>
            <span className="text-xs text-muted-foreground font-mono">Employee Quarantined</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Knowledge Library
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            System architectural guidelines, regulatory checklists, and engineering runbooks with mandatory review intervals.
          </p>
        </div>

        <Link
          href="/employee/knowledge/new"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all shadow-md shadow-primary/20 shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Document</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-card border border-border rounded-3xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full md:w-auto">
            {/* Search Box */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search knowledge by title, markdown body..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-input bg-background text-xs text-foreground outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-input bg-background text-xs text-foreground outline-none"
            >
              <option value="all">All Categories</option>
              {allCategories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            {/* Review Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-input bg-background text-xs text-foreground outline-none"
            >
              <option value="all">All Review States</option>
              <option value="current">Current</option>
              <option value="due_soon">Due Soon (≤14d)</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('card')}
              className={`p-1.5 rounded-lg text-xs transition-all ${
                viewMode === 'card' ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs transition-all ${
                viewMode === 'table' ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Items Display */}
      {items.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-border rounded-3xl bg-card">
          <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-2 opacity-40" />
          <h3 className="text-base font-bold text-foreground">No knowledge articles found</h3>
          <p className="text-xs text-muted-foreground mt-1">Adjust filters or author a new technical guide.</p>
        </div>
      ) : viewMode === 'card' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => {
            const statusBadge =
              item.reviewStatus === 'current'
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                : item.reviewStatus === 'due_soon'
                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';

            return (
              <Link
                key={item.id}
                href={`/employee/knowledge/${item.id}`}
                className="rounded-3xl border border-border bg-card p-5 hover:border-primary/40 transition-all flex flex-col justify-between group shadow-xs"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground">
                      {item.category}
                    </span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${statusBadge}`}>
                      {item.reviewStatus.replace('_', ' ')}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                    {item.title}
                  </h3>

                  <p className="text-xs text-muted-foreground line-clamp-3">
                    {item.body.replace(/#{1,6}\s?/g, '').slice(0, 150)}...
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {item.tags.map((t) => (
                      <span key={t} className="text-[10px] px-2 py-0.5 rounded-md bg-muted/60 text-muted-foreground">
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5 font-medium text-foreground">
                    <User className="w-3.5 h-3.5 text-primary" />
                    {item.ownerName}
                  </span>

                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-[11px]">
                      <ThumbsUp className="w-3 h-3 text-emerald-500" />
                      {item.usefulnessScore}
                    </span>
                    <span className="text-[11px] font-mono">
                      v{item.version}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="rounded-3xl border border-border bg-card overflow-hidden shadow-xs">
          <table className="w-full text-xs text-left">
            <thead className="bg-muted/40 text-muted-foreground border-b border-border">
              <tr>
                <th className="px-5 py-3 font-semibold">Title & Category</th>
                <th className="px-4 py-3 font-semibold">Owner</th>
                <th className="px-4 py-3 font-semibold">Next Review</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Usefulness</th>
                <th className="px-5 py-3 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-muted/20">
                  <td className="px-5 py-3.5">
                    <div className="font-bold text-foreground line-clamp-1">{item.title}</div>
                    <div className="text-[10px] text-muted-foreground">{item.category}</div>
                  </td>
                  <td className="px-4 py-3.5 text-muted-foreground">{item.ownerName}</td>
                  <td className="px-4 py-3.5 text-muted-foreground font-mono">
                    {new Date(item.nextReviewDate).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        item.reviewStatus === 'current'
                          ? 'bg-emerald-500/10 text-emerald-600'
                          : item.reviewStatus === 'due_soon'
                          ? 'bg-amber-500/10 text-amber-600'
                          : 'bg-rose-500/10 text-rose-600'
                      }`}
                    >
                      {item.reviewStatus.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 font-semibold text-foreground">
                    +{item.usefulnessScore}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <Link
                      href={`/employee/knowledge/${item.id}`}
                      className="px-3 py-1 rounded-lg bg-primary text-primary-foreground font-semibold text-xs"
                    >
                      Open
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
