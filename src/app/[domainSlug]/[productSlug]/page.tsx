import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  Server,
  Layers,
  FileCheck2,
} from 'lucide-react';
import {
  getProductBySlug,
  getProductDomainBySlug,
  getAllProducts,
  getProductDomains,
} from '@/server/dal/store';

export async function generateStaticParams() {
  const products = getAllProducts();
  const domains = getProductDomains();

  return products.map((p) => {
    const domain = domains.find((d) => d.id === p.domainId);
    return {
      domainSlug: domain ? domain.slug : 'banking',
      productSlug: p.slug,
    };
  });
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ domainSlug: string; productSlug: string }>;
}) {
  const { domainSlug, productSlug } = await params;
  const product = getProductBySlug(productSlug);
  const domain = getProductDomainBySlug(domainSlug);

  if (!product || !domain) {
    notFound();
  }

  return (
    <div className="relative overflow-hidden py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Navigation breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground mb-8">
        <Link href="/products" className="hover:text-foreground">
          Products
        </Link>
        <span>/</span>
        <Link href={`/products/${domain.slug}`} className="hover:text-foreground">
          {domain.name}
        </Link>
        <span>/</span>
        <span className="text-foreground">{product.name}</span>
      </div>

      {/* Product Hero */}
      <div className="rounded-3xl border border-border bg-gradient-to-b from-card to-card/60 p-8 sm:p-12 shadow-xl mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-semibold mb-4">
          <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
          <span>{domain.name} Enterprise Platform</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold text-foreground tracking-tight">
          {product.name}
        </h1>
        <h2 className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-3">
          {product.tagline}
        </h2>
        <p className="mt-4 text-base text-muted-foreground max-w-4xl leading-relaxed">
          {product.description}
        </p>

        {/* Action buttons */}
        <div className="mt-8 flex flex-wrap gap-4 pt-6 border-t border-border/60">
          <Link
            href="/demo-request"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-all shadow-md"
          >
            <span>Request {product.name} Demo</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-border bg-card hover:bg-accent text-foreground text-sm font-semibold transition-all shadow-sm"
          >
            <span>Talk to Specialist</span>
          </Link>
        </div>
      </div>

      {/* Grid: Features & Capabilities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        {/* Core Capabilities */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-2xl font-extrabold text-foreground">Architecture & Core Capabilities</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {product.capabilities.map((cap, i) => (
              <div
                key={i}
                className="p-5 rounded-2xl border border-border bg-card shadow-sm space-y-2"
              >
                <div className="font-bold text-sm text-foreground flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{cap.title}</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed pl-6">
                  {cap.description}
                </p>
              </div>
            ))}
          </div>

          {/* Full feature checklist */}
          <div className="pt-6">
            <h4 className="text-lg font-bold text-foreground mb-4">Functional Capabilities</h4>
            <div className="space-y-2.5">
              {product.features.map((feature, i) => (
                <div key={i} className="flex items-start gap-2.5 text-xs text-foreground">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Info Card */}
        <div className="space-y-6">
          {/* Target Audience */}
          <div className="p-6 rounded-2xl border border-border bg-card shadow-sm space-y-4">
            <h4 className="font-extrabold text-sm text-foreground uppercase tracking-wider">
              Target Institutions
            </h4>
            <div className="space-y-2">
              {product.targetAudience.map((t, i) => (
                <div
                  key={i}
                  className="px-3 py-1.5 rounded-lg bg-muted/40 border border-border/40 text-xs text-foreground font-medium"
                >
                  {t}
                </div>
              ))}
            </div>

            {/* Deployment Models */}
            <h4 className="font-extrabold text-sm text-foreground uppercase tracking-wider pt-4 border-t border-border/40">
              Deployment Models
            </h4>
            <div className="space-y-2">
              {product.deploymentModels.map((m, i) => (
                <div
                  key={i}
                  className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 text-xs font-semibold"
                >
                  {m}
                </div>
              ))}
            </div>

            {/* Certifications if available */}
            {product.complianceOrCertifications && product.complianceOrCertifications.length > 0 && (
              <>
                <h4 className="font-extrabold text-sm text-foreground uppercase tracking-wider pt-4 border-t border-border/40">
                  Compliance & Standards
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {product.complianceOrCertifications.map((c, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-muted text-foreground"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
