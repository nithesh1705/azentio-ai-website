'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { getPublicOfferings } from '@/server/dal/store';
import {
  Sparkles,
  CheckCircle2,
  ChevronRight,
  Search,
  Filter,
  Cpu,
  Shield,
  Layers,
  ArrowRight,
} from 'lucide-react';

export default function OfferingsPage() {
  const offerings = getPublicOfferings();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = ['All', 'Intelligence', 'Banking', 'Compliance', 'Lending'];

  const filteredOfferings = offerings.filter((offering) => {
    const matchesCategory =
      selectedCategory === 'All' || offering.category === selectedCategory;
    const matchesSearch =
      offering.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      offering.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      offering.tagline.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="max-w-3xl mb-12">
        <span className="text-xs uppercase tracking-widest font-bold text-primary">Enterprise Portfolio</span>
        <h1 className="text-4xl font-extrabold text-foreground mt-2 tracking-tight">
          Azentio AI Solution Catalogue
        </h1>
        <p className="mt-3 text-sm sm:text-base text-muted-foreground leading-relaxed">
          High-assurance AI solutions designed for Tier-1 banks, regional lenders, and microfinance institutions. Built on explainable algorithms, privacy-first architectures, and verifiable audit trails.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-10 p-4 rounded-2xl glass-panel border border-border">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search offerings..."
            className="w-full bg-muted/60 pl-9 pr-4 py-2 rounded-xl text-xs text-foreground placeholder:text-muted-foreground border border-border focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* Grid of Offerings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {filteredOfferings.map((offering, idx) => (
          <motion.div
            key={offering.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: idx * 0.1 }}
            className="p-8 rounded-3xl glass-panel border border-border glow-card flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                  {offering.category}
                </span>
                {offering.badge && (
                  <span className="text-xs font-semibold text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                    {offering.badge}
                  </span>
                )}
              </div>

              <h2 className="text-2xl font-bold text-foreground hover:text-primary transition-colors">
                <Link href={`/offerings/${offering.slug}`}>{offering.name}</Link>
              </h2>
              <p className="mt-2 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                {offering.tagline}
              </p>
              <p className="mt-4 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {offering.description}
              </p>

              {/* Capabilities checklist */}
              <div className="mt-6 pt-6 border-t border-border">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Core Architecture Modules
                </span>
                <ul className="mt-3 space-y-2.5 text-xs text-muted-foreground">
                  {offering.capabilities.map((cap, cIdx) => (
                    <li key={cIdx} className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-foreground">{cap.title}: </span>
                        <span>{cap.description}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-border flex items-center justify-between">
              <Link
                href={`/offerings/${offering.slug}`}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all shadow-sm"
              >
                <span>Launch Interactive Deep-Dive</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>

              <span className="badge-synthetic text-[11px]">
                Synthetic Demo Available
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
