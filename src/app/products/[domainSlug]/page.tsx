import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Landmark,
  TrendingUp,
  ShieldAlert,
  HeartPulse,
  Boxes,
  ArrowUpRight,
} from 'lucide-react';
import { getProductDomainBySlug, getProductsByDomain, getProductDomains } from '@/server/dal/store';

export async function generateStaticParams() {
  const domains = getProductDomains();
  return domains.map((d) => ({
    domainSlug: d.slug,
  }));
}

export default async function DomainDetailPage({
  params,
}: {
  params: Promise<{ domainSlug: string }>;
}) {
  const { domainSlug } = await params;
  const domain = getProductDomainBySlug(domainSlug);

  if (!domain) {
    notFound();
  }

  const products = getProductsByDomain(domain.id);

  const getDomainIcon = (iconName: string) => {
    switch (iconName) {
      case 'Landmark':
        return <Landmark className="w-8 h-8 text-emerald-500" />;
      case 'TrendingUp':
        return <TrendingUp className="w-8 h-8 text-cyan-500" />;
      case 'ShieldAlert':
        return <ShieldAlert className="w-8 h-8 text-indigo-500" />;
      case 'HeartPulse':
        return <HeartPulse className="w-8 h-8 text-rose-500" />;
      case 'Boxes':
        return <Boxes className="w-8 h-8 text-amber-500" />;
      default:
        return <Sparkles className="w-8 h-8 text-emerald-500" />;
    }
  };

  return (
    <div className="relative overflow-hidden py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Back button */}
      <Link
        href="/products"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground mb-8 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to All 5 Domains</span>
      </Link>

      {/* Domain Header Card */}
      <div className="rounded-3xl border border-border bg-gradient-to-b from-card to-card/60 p-8 sm:p-12 shadow-xl mb-12">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            {getDomainIcon(domain.iconName)}
          </div>
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-bold">
              Domain Portfolio
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-foreground tracking-tight">
              {domain.name}
            </h1>
          </div>
        </div>

        <h2 className="text-xl sm:text-2xl font-bold text-foreground mt-4">{domain.tagline}</h2>
        <p className="mt-3 text-base text-muted-foreground max-w-4xl leading-relaxed">
          {domain.description}
        </p>

        {/* Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-8 pt-6 border-t border-border/60">
          {domain.highlights.map((h, i) => (
            <div key={i} className="flex items-start gap-2 text-xs font-medium text-foreground">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>{h}</span>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-border/60">
          {domain.stats.map((s, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-muted/40 border border-border/40">
              <div className="text-2xl sm:text-3xl font-extrabold text-foreground">{s.value}</div>
              <div className="text-xs text-muted-foreground font-medium mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Products in this vertical */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-2xl font-extrabold text-foreground">
              Products in the {domain.name} Suite
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Select any platform below to inspect capabilities, architecture, and compliance models.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {products.map((prod) => (
            <div
              key={prod.id}
              className="p-6 rounded-2xl border border-border bg-card hover:border-emerald-500/40 hover:shadow-lg transition-all flex flex-col justify-between"
            >
              <div>
                <h4 className="font-extrabold text-lg text-foreground">{prod.name}</h4>
                <div className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
                  {prod.tagline}
                </div>
                <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
                  {prod.summary}
                </p>

                {/* Key Features preview */}
                <div className="mt-4 space-y-1.5 pt-3 border-t border-border/40">
                  {prod.features.slice(0, 3).map((f, i) => (
                    <div key={i} className="flex items-start gap-2 text-[11px] text-muted-foreground">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                      <span className="line-clamp-1">{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-border/40">
                <Link
                  href={`/${domain.slug}/${prod.slug}`}
                  className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all shadow-sm"
                >
                  <span>Inspect Full Product</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
