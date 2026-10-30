'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Sparkles,
  ArrowRight,
  Landmark,
  TrendingUp,
  ShieldAlert,
  HeartPulse,
  Boxes,
  ArrowUpRight,
  CheckCircle2,
} from 'lucide-react';
import { getProductDomains, getAllProducts } from '@/server/dal/store';

export default function ProductsOverviewPage() {
  const domains = getProductDomains();
  const products = getAllProducts();

  const getDomainIcon = (iconName: string) => {
    switch (iconName) {
      case 'Landmark':
        return <Landmark className="w-6 h-6 text-emerald-500" />;
      case 'TrendingUp':
        return <TrendingUp className="w-6 h-6 text-cyan-500" />;
      case 'ShieldAlert':
        return <ShieldAlert className="w-6 h-6 text-indigo-500" />;
      case 'HeartPulse':
        return <HeartPulse className="w-6 h-6 text-rose-500" />;
      case 'Boxes':
        return <Boxes className="w-6 h-6 text-amber-500" />;
      default:
        return <Sparkles className="w-6 h-6 text-emerald-500" />;
    }
  };

  return (
    <div className="relative overflow-hidden py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold mb-4">
          <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
          <span>Complete 5-Domain Enterprise Product Portfolio</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-foreground tracking-tight">
          Enterprise Platforms Engineered for Regulated Excellence
        </h1>
        <p className="mt-4 text-base text-muted-foreground leading-relaxed">
          From AAOIFI-certified Islamic core banking to real-time AI sanctions surveillance and
          process ERP, explore Azentio’s dedicated platforms across 5 core verticals.
        </p>
      </div>

      {/* 5 Domains Grid */}
      <div className="space-y-16">
        {domains.map((domain, index) => {
          const domainProducts = products.filter((p) => p.domainId === domain.id);

          return (
            <div
              key={domain.id}
              id={domain.slug}
              className="rounded-3xl border border-border bg-card/60 p-6 sm:p-10 shadow-lg backdrop-blur-sm"
            >
              {/* Domain Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border/60">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                    {getDomainIcon(domain.iconName)}
                  </div>
                  <div>
                    <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-bold">
                      Domain {index + 1}
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground">
                      {domain.name}
                    </h2>
                  </div>
                </div>

                <Link
                  href={`/products/${domain.slug}`}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all shadow-sm"
                >
                  <span>Explore {domain.name} Hub</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Tagline & Description */}
              <div className="py-6">
                <h3 className="text-lg font-bold text-foreground mb-2">{domain.tagline}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-4xl">
                  {domain.description}
                </p>
              </div>

              {/* Individual Products in this domain */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-border/40">
                {domainProducts.map((prod) => (
                  <div
                    key={prod.id}
                    className="p-5 rounded-2xl border border-border/80 bg-background/70 hover:border-emerald-500/40 hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="font-bold text-base text-foreground leading-snug">
                        {prod.name}
                      </div>
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
                        {prod.tagline}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2 line-clamp-3 leading-relaxed">
                        {prod.summary}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between">
                      <Link
                        href={`/${domain.slug}/${prod.slug}`}
                        className="text-xs font-bold text-primary hover:underline flex items-center gap-1 group"
                      >
                        <span>Product Details</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </Link>
                      <span className="text-[10px] text-muted-foreground uppercase font-mono">
                        {domain.name}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
